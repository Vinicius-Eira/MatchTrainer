import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  buscarMeusConsentimentosLGPD,
  buscarPersonalsComAcesso,
  CompartilhamentoPersonal,
  RegistroConsentimento,
  revogarConsentimentoSaudeLGPD,
} from "../../../services/lgpd/lgpdService";
import { supabase } from "../../../services/supabase";

function validarDataBr(dataStr: string): string | null {
  if (!dataStr || dataStr.length !== 10) return null;
  const [dd, mm, yyyy] = dataStr.split("/").map(Number);
  if (!dd || !mm || !yyyy || yyyy < 1920 || yyyy > new Date().getFullYear() - 12) return null;
  const dt = new Date(yyyy, mm - 1, dd);
  if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null;
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function usePerfilAluno(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);
  const [modalSairVisivel, setModalSairVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [metaPeso, setMetaPeso] = useState("");
  const [temPersonal, setTemPersonal] = useState(false);

  const [modalPrivacidadeVisivel, setModalPrivacidadeVisivel] = useState(false);
  const [carregandoPrivacidade, setCarregandoPrivacidade] = useState(false);
  const [revogandoSaude, setRevogandoSaude] = useState(false);
  const [consentimentoSaudeAtivo, setConsentimentoSaudeAtivo] = useState(false);
  const [consentimentos, setConsentimentos] = useState<RegistroConsentimento[]>([]);
  const [personalsComAcesso, setPersonalsComAcesso] = useState<CompartilhamentoPersonal[]>([]);

  const formatarNome = (texto: string) => texto;

  const formatarWhatsApp = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const formatarData = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };

  const formatarPeso = (t: string) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarMetaPeso = (t: string) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [resConexao, resUsuario] = await Promise.all([
          supabase
            .from("conexoes")
            .select("id")
            .eq("usuario_id", user.id)
            .eq("status", "aluno_ativo")
            .maybeSingle(),
          supabase.from("usuarios").select("*").eq("id", user.id).single(),
        ]);

        if (resConexao.data) setTemPersonal(true);
        if (resUsuario.error) throw resUsuario.error;

        const data = resUsuario.data;
        if (data) {
          if (data.nome) setNome(data.nome);
          if (data.genero) {
            if (data.genero === "homem") setGenero("Masculino");
            else if (data.genero === "mulher") setGenero("Feminino");
            else setGenero("Outro");
          }
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.telefone) formatarWhatsApp(data.telefone);
          if (data.cidade) setCidade(data.cidade);
          if (data.bairro) setBairro(data.bairro);
          if (data.peso) setPeso(String(data.peso));
          if (data.altura) setAltura(String(data.altura));
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);

          if (data.data_nascimento) {
            const [ano, mes, dia] = data.data_nascimento.split("-");
            setDataNascimento(`${dia}/${mes}/${ano}`);
          }

          const prefs =
            typeof data.preferencias === "string" ? JSON.parse(data.preferencias) : data.preferencias || {};
          if (prefs.meta_peso) setMetaPeso(String(prefs.meta_peso));

          const temSaudeInformada =
            Array.isArray(prefs.limitacoes) &&
            prefs.limitacoes.some((l: string) => !["nenhuma", "nao_informar"].includes(l));
          setConsentimentoSaudeAtivo(Boolean(prefs.consentimento_saude || temSaudeInformada));
        }
      } catch (error) {
        console.log("Erro ao carregar perfil do aluno:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarPerfil();
  }, []);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Acesso Negado", "Precisamos de permissão para acessar suas fotos.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Permissão negada");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        if (geocode[0].city || geocode[0].subregion) setCidade(geocode[0].city || geocode[0].subregion || "");
        if (geocode[0].district) setBairro(geocode[0].district);
      }
    } catch {
      Alert.alert("Aviso", "Falha no GPS. Digite manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const voltarSeguro = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const abrirRaioX = () => navigation.navigate("RaioXTreino");

  const abrirEditarPreferencias = () => {
    if (temPersonal) {
      Alert.alert("Contrato Ativo", "Suas preferências de Match ficam protegidas enquanto você tiver um contrato ativo.");
      return;
    }
    navigation.navigate("AlunoSetup");
  };

  const abrirPrivacidade = async () => {
    setModalPrivacidadeVisivel(true);
    setCarregandoPrivacidade(true);
    try {
      const [listaConsent, listaCompartilhamento] = await Promise.all([
        buscarMeusConsentimentosLGPD(),
        buscarPersonalsComAcesso(),
      ]);
      setConsentimentos(listaConsent);
      setPersonalsComAcesso(listaCompartilhamento);

      const ultimoSaude = listaConsent.find((c) => c.tipo_consentimento === "dados_saude_match");
      if (ultimoSaude) {
        setConsentimentoSaudeAtivo(Boolean(ultimoSaude.concedido && !ultimoSaude.revogado_em));
      }
    } catch (error) {
      console.log("Erro ao carregar privacidade:", error);
    } finally {
      setCarregandoPrivacidade(false);
    }
  };

  const confirmarRevogarSaude = () => {
    Alert.alert(
      "Revogar dados de saúde?",
      "Seus dados de lesões, gestação e condições clínicas serão removidos das preferências de Match imediatamente. Você poderá informá-los novamente quando quiser.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revogar e Apagar",
          style: "destructive",
          onPress: async () => {
            setRevogandoSaude(true);
            try {
              await revogarConsentimentoSaudeLGPD();
              setConsentimentoSaudeAtivo(false);
              const atualizados = await buscarMeusConsentimentosLGPD();
              setConsentimentos(atualizados);
              Alert.alert("Consentimento revogado", "Seus dados sensíveis de saúde foram removidos do Match.");
            } catch (err: any) {
              Alert.alert("Erro", err?.message || "Não foi possível revogar o consentimento agora.");
            } finally {
              setRevogandoSaude(false);
            }
          },
        },
      ]
    );
  };

  const handleSalvar = async () => {
    if (dataNascimento.trim().length > 0 && !validarDataBr(dataNascimento.trim())) {
      Alert.alert("Data inválida", "Informe uma data de nascimento real no formato DD/MM/AAAA.");
      return;
    }

    setSalvando(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const dataBanco = dataNascimento.trim().length === 10 ? validarDataBr(dataNascimento.trim()) : null;

      let generoDB: string | null = null;
      if (genero === "Masculino") generoDB = "homem";
      else if (genero === "Feminino") generoDB = "mulher";
      else if (genero === "Outro") generoDB = "outro";

      const { data: currentUser } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();

      const novasPreferencias = {
        ...(currentUser?.preferencias || {}),
        meta_peso: metaPeso ? parseFloat(metaPeso.replace(",", ".")) : null,
      };

      const payload: any = {
        nome: nome.trim(),
        genero: generoDB,
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso.replace(",", ".")) : null,
        altura: altura ? parseFloat(altura) : null,
        latitude,
        longitude,
        preferencias: novasPreferencias,
      };

      if (fotoUri && fotoUri.startsWith("data:image")) {
        payload.foto_url = fotoUri;
      }

      const { error } = await supabase.from("usuarios").update(payload).eq("id", user.id);
      if (error) throw error;

      setModalSucessoVisivel(true);
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message);
    } finally {
      setSalvando(false);
    }
  };

  const logout = () => setModalSairVisivel(true);

  const confirmarLogout = async () => {
    setSaindo(true);
    try {
      await supabase.auth.signOut();
      setModalSairVisivel(false);
      navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
    } finally {
      setSaindo(false);
    }
  };

  return {
    state: {
      loading,
      salvando,
      inputFocado,
      buscandoLocal,
      nome,
      genero,
      fotoUri,
      dataNascimento,
      telefone,
      cidade,
      bairro,
      peso,
      altura,
      metaPeso,
      temPersonal,
      modalPrivacidadeVisivel,
      modalSucessoVisivel,
      carregandoPrivacidade,
      revogandoSaude,
      consentimentoSaudeAtivo,
      consentimentos,
      personalsComAcesso,
      modalSairVisivel,
      saindo
    },
    actions: {
      setNome,
      setGenero,
      setCidade,
      setBairro,
      setInputFocado,
      formatarNome,
      formatarData,
      formatarWhatsApp,
      formatarPeso,
      formatarMetaPeso,
      formatarAltura,
      escolherFoto,
      buscarLocalizacao,
      voltarSeguro,
      abrirRaioX,
      abrirEditarPreferencias,
      abrirPrivacidade,
      fecharPrivacidade: () => setModalPrivacidadeVisivel(false),
      fecharModalSucesso: () => setModalSucessoVisivel(false),
      confirmarRevogarSaude,
      abrirTermos: () => {
        setModalPrivacidadeVisivel(false);
        navigation.navigate("TermosDeUso", { somenteLeitura: true, origem: "PerfilAluno" });
      },
      handleSalvar,
      logout,
      fecharModalSair: () => setModalSairVisivel(false), confirmarLogout
    },
  };
}