import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase";

export function usePersonalSetup(navigation) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputFocado, setInputFocado] = useState(null);

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [cref, setCref] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [genero, setGenero] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [statusAgenda, setStatusAgenda] = useState("Disponível");
  const [servicosOferecidos, setServicosOferecidos] = useState(["Consultoria"]);
  const [servicosBloqueados, setServicosBloqueados] = useState([]);
  const [precoConsultoria, setPrecoConsultoria] = useState(150);
  const [precoPresencial, setPrecoPresencial] = useState(100);

  const [experiencia, setExperiencia] = useState("");
  const [publicoAtendido, setPublicoAtendido] = useState([]);
  const [diferenciais, setDiferenciais] = useState("");
  const [galeria, setGaleria] = useState([]);
  const [objetivosAtendidos, setObjetivosAtendidos] = useState([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsAtendidos, setSubsAtendidos] = useState([]);
  const [limitacoesAtendidas, setLimitacoesAtendidas] = useState([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [perfilTreinador, setPerfilTreinador] = useState("");
  const [locaisAtendidos, setLocaisAtendidos] = useState([]);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => {
    carregarDadosExistentes();
  }, []);

  const carregarDadosExistentes = async () => {
    setLoadingDados(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
      if (user.user_metadata?.cref) setCref(user.user_metadata.cref.toUpperCase());

      const { data: planosAtivos } = await supabase
        .from("planos")
        .select("servicos_inclusos")
        .eq("personal_id", user.id)
        .eq("status", "ativo");

      if (planosAtivos) {
        let bloqueados = [];
        planosAtivos.forEach((plano) => {
          if (plano.servicos_inclusos) {
            plano.servicos_inclusos.forEach((servico) => {
              if (!bloqueados.includes(servico)) bloqueados.push(servico);
            });
          }
        });
        setServicosBloqueados(bloqueados);
      }

      const { data, error } = await supabase.from("personals").select("*").eq("id", user.id).single();

      if (data) {
        if (data.ativo) setIsEditing(true);
        if (data.cref) setCref(data.cref.toUpperCase());
        if (data.nome) setNome(data.nome);
        if (data.descricao) setBio(data.descricao);

        if (data.telefone) {
          let v = data.telefone.replace(/\D/g, "");
          if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
          if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
          setTelefone(v.substring(0, 15));
        }

        if (data.cidade) setCidade(data.cidade);
        if (data.bairro) setBairro(data.bairro);
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);

        if (data.genero) setGenero(data.genero);
        if (data.turnos_disponiveis) setTurnos(data.turnos_disponiveis);
        if (data.status_agenda) setStatusAgenda(data.status_agenda);

        if (data.servicos_oferecidos && data.servicos_oferecidos.length > 0) {
          setServicosOferecidos(data.servicos_oferecidos);
        } else if (data.modalidades) {
          setServicosOferecidos(data.modalidades);
        }

        if (data.preco_consultoria) setPrecoConsultoria(Number(data.preco_consultoria));
        if (data.preco_presencial) setPrecoPresencial(Number(data.preco_presencial));
        if (!data.preco_consultoria && data.preco_medio) {
            setPrecoConsultoria(Number(data.preco_medio));
        }

        if (data.tempo_experiencia) setExperiencia(data.tempo_experiencia);
        if (data.foto_url) setFotoUri(data.foto_url);
        if (data.instagram) setInstagram(data.instagram);
        if (data.tiktok) setTiktok(data.tiktok);
        if (data.galeria_fotos && Array.isArray(data.galeria_fotos)) setGaleria(data.galeria_fotos);

        if (data.especialidades) {
          const p = data.especialidades;
          const mapLegacy = (array, mapping) => array.map((item) => mapping[item] || item);
          const legacyObjMap = {
            Emagrecimento: "emagrecimento",
            Hipertrofia: "hipertrofia",
            "Saúde e Qualidade": "saude",
            Performance: "performance",
            Outro: "outro",
          };
          const legacyLimMap = {
            "Gestante / Pós-parto": "gestante",
            "Lesões ou Dores": "lesao",
            "Condição Clínica": "clinica",
            Outra: "outra",
          };

          setObjetivosAtendidos(mapLegacy(p.objetivos || [], legacyObjMap));
          setOutroObjetivoTexto(p.outroObjetivo || "");
          setLimitacoesAtendidas(mapLegacy(p.limitacoes || [], legacyLimMap));
          setOutraLimitacaoTexto(p.outraLimitacao || "");
          setSubsAtendidos(p.subs || []);
          setPerfilTreinador(p.perfil || "");
          setPublicoAtendido(p.publico || []);
          setLocaisAtendidos(p.locais || []);
          setDiferenciais(p.diferenciais || "");
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados do personal: ", error);
    } finally {
      setLoadingDados(false);
    }
  };

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Aviso", "Permissão negada.");
        setBuscandoLocalizacao(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        setCidade(reverse[0].city || reverse[0].subregion || "");
        setBairro(reverse[0].district || reverse[0].name || "");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha no GPS.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const selecionarFotoPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const selecionarFotosGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para adicionar as fotos de antes e depois.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - galeria.length,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled) {
      const novasFotos = result.assets.map((asset) => `data:image/jpeg;base64,${asset.base64}`);
      setGaleria((prevGaleria) => [...prevGaleria, ...novasFotos]);
    }
  };

  const removerFotoGaleria = (indexToRemove) => {
    setGaleria((prevGaleria) => prevGaleria.filter((_, index) => index !== indexToRemove));
  };

  const formatarNome = (texto) => {
    return texto.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const formatarWhatsApp = (texto) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const handlePrecoChange = (texto, setPreco) => {
    const num = parseInt(texto.replace(/\D/g, ""), 10);
    setPreco(isNaN(num) ? 0 : num);
  };

  const toggleArrayItem = (item, state, setState) => {
    if (state.includes(item)) {
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const handleToggleServicos = (servicoId) => {
    if (servicosOferecidos.includes(servicoId)) {
      if (servicosBloqueados.includes(servicoId)) {
        Alert.alert(
          "Ação Bloqueada 🔒",
          `Você possui alunos ativos utilizando a ${servicoId}. Conclua ou altere os planos deles antes de remover este serviço da sua vitrine.`,
        );
        return;
      }
      setServicosOferecidos(servicosOferecidos.filter((s) => s !== servicoId));
    } else {
      setServicosOferecidos([...servicosOferecidos, servicoId]);
    }
  };

  const handleSalvar = async () => {
    if (!cref?.trim() || !telefone?.trim() || !cidade?.trim() || !nome?.trim()) {
      return Alert.alert("Atenção", "Preencha os dados obrigatórios (*). A localização também é obrigatória.");
    }
    if (!genero) return Alert.alert("Atenção", "Selecione seu gênero na seção de identificação.");
    if (turnos.length === 0) return Alert.alert("Atenção", "Selecione pelo menos um turno de atendimento na sua agenda.");
    if (servicosOferecidos.length === 0) return Alert.alert("Atenção", "Selecione pelo menos um Serviço que você oferece.");
    if (objetivosAtendidos.length === 0 || !perfilTreinador || locaisAtendidos.length === 0) {
      return Alert.alert("Atenção", "Selecione seu Estilo, Locais e pelo menos um Foco de Treino.");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Alert.alert("Erro", "Sessão expirada.");

      const especialidadesEstruturadas = {
        objetivos: objetivosAtendidos,
        outroObjetivo: objetivosAtendidos.includes("outro") ? outroObjetivoTexto.trim() : null,
        limitacoes: limitacoesAtendidas,
        outraLimitacao: limitacoesAtendidas.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs: subsAtendidos,
        perfil: perfilTreinador,
        publico: publicoAtendido,
        locais: locaisAtendidos,
        diferenciais: diferenciais.trim(),
        aceitaNegociacao: false,
      };

      const { error } = await supabase.from("personals").upsert(
        {
          id: user.id,
          email: user.email,
          nome: nome.trim(),
          cref: cref.trim().toUpperCase(),
          telefone: telefone.trim(),
          cidade: cidade.trim(),
          bairro: bairro.trim(),
          latitude: latitude,
          longitude: longitude,
          tempo_experiencia: experiencia,
          genero: genero,
          turnos_disponiveis: turnos,
          status_agenda: statusAgenda,
          servicos_oferecidos: servicosOferecidos,
          preco_consultoria: servicosOferecidos.includes("Consultoria") ? parseInt(precoConsultoria) : null,
          preco_presencial: servicosOferecidos.includes("Presencial") ? parseInt(precoPresencial) : null,
          preco_medio: servicosOferecidos.includes("Consultoria") ? parseInt(precoConsultoria) : parseInt(precoPresencial),
          descricao: bio?.trim() || "",
          foto_url: fotoUri,
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          galeria_fotos: galeria,
          especialidades: especialidadesEstruturadas,
          ativo: true,
        },
        { onConflict: "id" }
      );

      if (error) throw error;
      Alert.alert(
        "Sucesso!",
        "Seu perfil está online e atualizado para o Match!",
        [
          {
            text: "Ver Meu Painel",
            onPress: () => {
              isEditing ? navigation.goBack() : navigation.replace("PersonalDashboard");
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      loading, loadingDados, isEditing, inputFocado, nome, bio, fotoUri, cref, telefone,
      genero, turnos, statusAgenda, cidade, bairro, latitude, longitude, buscandoLocalizacao,
      servicosOferecidos, servicosBloqueados, precoConsultoria, precoPresencial, experiencia,
      publicoAtendido, diferenciais, galeria, objetivosAtendidos, outroObjetivoTexto, subsAtendidos,
      limitacoesAtendidas, outraLimitacaoTexto, perfilTreinador, locaisAtendidos, instagram, tiktok
    },
    actions: {
      setNome, setBio, setCref, setTelefone, setGenero, setTurnos, setStatusAgenda, setInputFocado,
      setPrecoConsultoria, setPrecoPresencial, setExperiencia, setPublicoAtendido, setDiferenciais,
      setObjetivosAtendidos, setOutroObjetivoTexto, setSubsAtendidos, setLimitacoesAtendidas,
      setOutraLimitacaoTexto, setPerfilTreinador, setLocaisAtendidos, setInstagram, setTiktok,
      obterLocalizacaoAtual, selecionarFotoPrincipal, selecionarFotosGaleria, removerFotoGaleria,
      formatarNome, formatarWhatsApp, handlePrecoChange, toggleArrayItem, handleToggleServicos, handleSalvar
    }
  };
}