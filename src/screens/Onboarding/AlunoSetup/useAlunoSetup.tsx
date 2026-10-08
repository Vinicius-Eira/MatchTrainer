import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase";

export function useClientSetup(navigation: any) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [metaPeso, setMetaPeso] = useState("");

  const [servicoBuscado, setServicoBuscado] = useState("");
  const [locaisTreino, setLocaisTreino] = useState<string[]>([]);
  const [turnos, setTurnos] = useState<string[]>([]);
  const [horarioEspecifico, setHorarioEspecifico] = useState("");
  const [frequencia, setFrequencia] = useState(""); 
  const [generoTreinador, setGeneroTreinador] = useState("");
  const [investimento, setInvestimento] = useState("");

  const [historico, setHistorico] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsObjetivos, setSubsObjetivos] = useState<string[]>([]);
  const [limitacoes, setLimitacoes] = useState<string[]>([]);
  const [subsLimitacoes, setSubsLimitacoes] = useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");

  const [estiloComunicacao, setEstiloComunicacao] = useState("");
  const [cobranca, setCobranca] = useState("");
  const [acompanhamento, setAcompanhamento] = useState("");
  const [autonomia, setAutonomia] = useState("");
  const [valoresTreinador, setValoresTreinador] = useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = useState("");


  const formatarNome = (texto: string) => texto.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
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
    const carregarDados = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
        
        const { data } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
        if (data) {
          if (data.nome) setNome(data.nome);
          if (data.cidade) setCidade(data.cidade);
          if (data.telefone) formatarWhatsApp(data.telefone);
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.peso) setPeso(String(data.peso));
          if (data.altura) setAltura(String(data.altura));
          
          if (data.data_nascimento) {
            const [ano, mes, dia] = data.data_nascimento.split("-");
            setDataNascimento(`${dia}/${mes}/${ano}`);
          }

          if (data.preferencias) {
            const p = data.preferencias;
            if (p.meta_peso) setMetaPeso(String(p.meta_peso));
            if (p.estilo_comunicacao) setEstiloComunicacao(p.estilo_comunicacao); 
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDados();
  }, []);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Acesso Negado", "Precisamos de acesso para a foto.");
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled && result.assets) setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Permissão negada");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) setCidade(`${geocode[0].district ? geocode[0].district + ", " : ""}${geocode[0].city || geocode[0].subregion} - ${geocode[0].region}`);
    } catch (error) {
      Alert.alert("Aviso", "Falha no GPS. Digite manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const toggleArrayItem = (item: string, state: string[], setState: any) => state.includes(item) ? setState(state.filter((i) => i !== item)) : setState([...state, item]);

  const proximoPasso = () => {
    if (currentStep === 1) {
      if (!nome.trim() || !telefone || !cidade || !dataNascimento || dataNascimento.length < 10) {
        return Alert.alert("Atenção", "Preencha os campos obrigatórios (Nome, Nascimento, Whats e Local).");
      }
    }
    if (currentStep === 2) {
      if (!servicoBuscado || !frequencia || !generoTreinador || !investimento) {
        return Alert.alert("Atenção", "Selecione a Modalidade, Frequência, Gênero e Investimento.");
      }
    }
    if (currentStep === 3) {
      if (!historico || objetivos.length === 0 || limitacoes.length === 0) {
        return Alert.alert("Atenção", "Selecione seu Histórico, Objetivos e Restrições.");
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };
  
  const passoAnterior = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinalizar = async () => {
    if (!cobranca || !acompanhamento || !autonomia || !estiloComunicacao || valoresTreinador.length === 0) {
      return Alert.alert("Atenção", "Preencha suas preferências de Match no último passo.");
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      let dataBanco = null;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const preferencias = {
        servico_buscado: servicoBuscado,
        locais_treino: locaisTreino,
        turnos: turnos,
        horario_especifico: turnos.includes("variado") ? horarioEspecifico.trim() : null,
        frequencia: frequencia, 
        genero_treinador: generoTreinador || "indiferente",
        investimento: investimento,
        historico: historico,
        objetivos: objetivos,
        outro_objetivo: objetivos.includes("outro") ? outroObjetivoTexto.trim() : null,
        subs_objetivos: subsObjetivos,
        limitacoes: limitacoes,
        subs_limitacoes: subsLimitacoes,
        outra_limitacao: limitacoes.includes("outra") ? outraLimitacaoTexto.trim() : null,
        estilo_comunicacao: estiloComunicacao, 
        cobranca: cobranca,
        acompanhamento: acompanhamento,
        autonomia: autonomia,
        valores_treinador: valoresTreinador,
        outro_valor: valoresTreinador.includes("outro") ? outroValorTexto.trim() : null,
        meta_peso: metaPeso ? parseFloat(metaPeso) : null,
      };

      const payload: any = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        latitude, longitude,
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        preferencias,
        setup_completo: true, 
      };

      if (fotoUri) payload.foto_url = fotoUri;

      const { error } = await supabase.from("usuarios").update(payload).eq("id", user.id);
      if (error) throw error;

      navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      currentStep, loading, loadingDados, buscandoLocal, inputFocado,
      nome, fotoUri, dataNascimento, telefone, cidade, peso, altura, metaPeso,
      servicoBuscado, locaisTreino, turnos, horarioEspecifico, frequencia, generoTreinador, investimento,
      historico, objetivos, outroObjetivoTexto, subsObjetivos, limitacoes, subsLimitacoes, outraLimitacaoTexto,
      estiloComunicacao, cobranca, acompanhamento, autonomia, valoresTreinador, outroValorTexto 
    },
    actions: {
      proximoPasso, passoAnterior, setInputFocado, setNome, setTelefone, setCidade, setPeso, setAltura, setMetaPeso,
      setServicoBuscado, setLocaisTreino, setTurnos, setHorarioEspecifico, setFrequencia, setGeneroTreinador, setInvestimento,
      setHistorico, setObjetivos, setOutroObjetivoTexto, setSubsObjetivos, setLimitacoes, setSubsLimitacoes, setOutraLimitacaoTexto,
      setEstiloComunicacao, setCobranca, setAcompanhamento, setAutonomia, setValoresTreinador, setOutroValorTexto, 
      formatarNome, formatarWhatsApp, formatarData, formatarPeso, formatarAltura, formatarMetaPeso,
      escolherFoto, buscarLocalizacao, toggleArrayItem, handleFinalizar
    }
  };
}