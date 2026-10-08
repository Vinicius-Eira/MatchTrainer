import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase";

export function usePersonalSetup(navigation: any) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(1);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [cref, setCref] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [servicosOferecidos, setServicosOferecidos] = useState<string[]>(["Consultoria"]);
  const [servicosBloqueados, setServicosBloqueados] = useState<string[]>([]);
  const [precoConsultoria, setPrecoConsultoria] = useState(150);
  const [precoPresencial, setPrecoPresencial] = useState(100);
  const [turnos, setTurnos] = useState<string[]>([]);
  const [horariosEspecificos, setHorariosEspecificos] = useState("");
  const [statusAgenda, setStatusAgenda] = useState("Disponível");
  const [locaisAtendidos, setLocaisAtendidos] = useState<string[]>([]);

  const [generoAtendido, setGeneroAtendido] = useState("ambos");
  const [publicoAtendido, setPublicoAtendido] = useState<string[]>([]);
  const [faixasEtariasAtendidas, setFaixasEtariasAtendidas] = useState<string[]>([]); 
  const [objetivosAtendidos, setObjetivosAtendidos] = useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsAtendidos, setSubsAtendidos] = useState<string[]>([]);
  const [limitacoesAtendidas, setLimitacoesAtendidas] = useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [bio, setBio] = useState("");
  const [diferenciais, setDiferenciais] = useState("");

  const [estiloComunicacao, setEstiloComunicacao] = useState(""); 
  const [cobranca, setCobranca] = useState(""); 
  const [acompanhamento, setAcompanhamento] = useState("");
  const [autonomiaEsperada, setAutonomiaEsperada] = useState("");
  const [valoresAluno, setValoresAluno] = useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [galeria, setGaleria] = useState<string[]>([]);

  useEffect(() => {
    const carregarDadosExistentes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
        if (user.user_metadata?.cref) setCref(user.user_metadata.cref.toUpperCase());

        const { data: planosAtivos } = await supabase.from("planos").select("servicos_inclusos").eq("personal_id", user.id).eq("status", "ativo");

        if (planosAtivos) {
          let bloqueados: string[] = [];
          planosAtivos.forEach((plano) => {
            if (plano.servicos_inclusos) {
              plano.servicos_inclusos.forEach((s: string) => { if (!bloqueados.includes(s)) bloqueados.push(s); });
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

          if (data.servicos_oferecidos && data.servicos_oferecidos.length > 0) setServicosOferecidos(data.servicos_oferecidos);
          
          if (data.preco_consultoria) setPrecoConsultoria(Number(data.preco_consultoria));
          if (data.preco_presencial) setPrecoPresencial(Number(data.preco_presencial));
          if (data.tempo_experiencia) setExperiencia(data.tempo_experiencia);
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.instagram) setInstagram(data.instagram);
          if (data.tiktok) setTiktok(data.tiktok);
          if (data.galeria_fotos && Array.isArray(data.galeria_fotos)) setGaleria(data.galeria_fotos);

          if (data.especialidades) {
            const p = data.especialidades;
            setObjetivosAtendidos(p.objetivos || []);
            setOutroObjetivoTexto(p.outroObjetivo || "");
            setSubsAtendidos(p.subs || []);
            setLimitacoesAtendidas(p.limitacoes || []);
            setOutraLimitacaoTexto(p.outraLimitacao || "");
            setPublicoAtendido(p.publico || []);
            setLocaisAtendidos(p.locais || []);
            setDiferenciais(p.diferenciais || "");
            setGeneroAtendido(p.generoAtendido || "ambos");
            setHorariosEspecificos(p.horarios_especificos || "");
            
            setFaixasEtariasAtendidas(p.faixasEtarias || []); 
            setEstiloComunicacao(p.estiloComunicacao || "");

            setCobranca(p.cobranca || "");
            setAcompanhamento(p.acompanhamento || "");
            setAutonomiaEsperada(p.autonomia || "");
            setValoresAluno(p.valoresAluno || []);
            setOutroValorTexto(p.outroValorTexto || "");
          }
        }
      } catch (error) {
        console.log("Erro ao carregar:", error);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDadosExistentes();
  }, []);

  const proximoPasso = () => {
    if (currentStep === 1) {
      if (!nome.trim() || !cref.trim() || !telefone.trim() || !genero || !cidade.trim()) {
        return Alert.alert("Atenção", "Preencha os campos obrigatórios e sincronize o GPS.");
      }
    }
    if (currentStep === 2) {
      if (servicosOferecidos.length === 0) return Alert.alert("Atenção", "Selecione ao menos um serviço.");
      if (servicosOferecidos.includes("Presencial")) {
        if (locaisAtendidos.length === 0 || turnos.length === 0) {
          return Alert.alert("Atenção", "Para atendimento presencial, informe os Locais e Turnos.");
        }
        if (turnos.includes("variado") && !horariosEspecificos.trim()) {
          return Alert.alert("Atenção", "Por favor, digite seus horários específicos de disponibilidade.");
        }
      }
    }
    if (currentStep === 3) {
      if (objetivosAtendidos.length === 0 || publicoAtendido.length === 0 || limitacoesAtendidas.length === 0 || faixasEtariasAtendidas.length === 0) {
        return Alert.alert("Atenção", "Selecione seu público, faixas etárias, focos e eventuais restrições.");
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const passoAnterior = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Aviso", "Permissão negada.");
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      let reverse = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });
    if (!result.canceled && result.assets && result.assets.length > 0) setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const selecionarFotosGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 5 - galeria.length, quality: 0.6, base64: true });
    if (!result.canceled) {
      const novasFotos = result.assets.map((asset) => `data:image/jpeg;base64,${asset.base64}`);
      setGaleria((prev) => [...prev, ...novasFotos]);
    }
  };

  const removerFotoGaleria = (indexToRemove: number) => setGaleria((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  const formatarNome = (texto: string) => texto.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const formatarWhatsApp = (texto: string) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };
  const handlePrecoChange = (texto: string, setPreco: any) => setPreco(isNaN(parseInt(texto.replace(/\D/g, ""), 10)) ? 0 : parseInt(texto.replace(/\D/g, ""), 10));
  const toggleArrayItem = (item: string, state: string[], setState: any) => state.includes(item) ? setState(state.filter(i => i !== item)) : setState([...state, item]);
  
  const handleToggleServicos = (servicoId: string) => {
    if (servicosOferecidos.includes(servicoId) && servicosBloqueados.includes(servicoId)) return Alert.alert("Ação Bloqueada", `Você possui alunos ativos neste serviço.`);
    toggleArrayItem(servicoId, servicosOferecidos, setServicosOferecidos);
  };

  const handleSalvar = async () => {
    if (!cobranca || !acompanhamento || !autonomiaEsperada || valoresAluno.length === 0 || !estiloComunicacao) {
      return Alert.alert("Atenção", "Preencha suas preferências de trabalho no último passo.");
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const especialidadesEstruturadas = {
        objetivos: objetivosAtendidos,
        outroObjetivo: objetivosAtendidos.includes("outro") ? outroObjetivoTexto.trim() : null,
        limitacoes: limitacoesAtendidas,
        outraLimitacao: limitacoesAtendidas.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs: subsAtendidos,
        locais: locaisAtendidos,
        publico: publicoAtendido,
        generoAtendido,
        faixasEtarias: faixasEtariasAtendidas, 
        estiloComunicacao: estiloComunicacao, 
        diferenciais: diferenciais.trim(),
        horarios_especificos: turnos.includes("variado") ? horariosEspecificos.trim() : null,
        cobranca, acompanhamento, autonomia: autonomiaEsperada, 
        valoresAluno,
        outroValorTexto: valoresAluno.includes("outro") ? outroValorTexto.trim() : null,
      };

      const { error } = await supabase.from("personals").upsert({
        id: user.id, email: user.email, nome: nome.trim(), cref: cref.trim().toUpperCase(), telefone: telefone.trim(),
        cidade: cidade.trim(), bairro: bairro.trim(), latitude, longitude, tempo_experiencia: experiencia, genero,
        turnos_disponiveis: servicosOferecidos.includes("Presencial") ? turnos : [],
        status_agenda: statusAgenda, servicos_oferecidos: servicosOferecidos,
        preco_consultoria: servicosOferecidos.includes("Consultoria") ? precoConsultoria : null,
        preco_presencial: servicosOferecidos.includes("Presencial") ? precoPresencial : null,
        preco_medio: servicosOferecidos.includes("Consultoria") ? precoConsultoria : precoPresencial,
        descricao: bio?.trim() || "", foto_url: fotoUri, instagram: instagram.trim(), tiktok: tiktok.trim(),
        galeria_fotos: galeria, especialidades: especialidadesEstruturadas, ativo: true,
      });

      if (error) throw error;
      Alert.alert("Sucesso!", "Sua vitrine está online e pronta para o Match!", [{ text: "Ir para o Painel", onPress: () => isEditing ? navigation.goBack() : navigation.replace("PersonalDashboard") }]);
    } catch (err) {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      currentStep, loading, loadingDados, isEditing, inputFocado, nome, bio, fotoUri, cref, telefone,
      genero, turnos, horariosEspecificos, statusAgenda, cidade, bairro, latitude, longitude, buscandoLocalizacao,
      servicosOferecidos, servicosBloqueados, precoConsultoria, precoPresencial, experiencia,
      publicoAtendido, diferenciais, galeria, objetivosAtendidos, instagram, tiktok,
      cobranca, acompanhamento, autonomiaEsperada, valoresAluno, locaisAtendidos, generoAtendido,
      subsAtendidos, limitacoesAtendidas, outroObjetivoTexto, outraLimitacaoTexto, outroValorTexto,
      faixasEtariasAtendidas, estiloComunicacao 
    },
    actions: {
      proximoPasso, passoAnterior, setNome, setBio, setCref, setTelefone, setGenero, setTurnos, setHorariosEspecificos, setStatusAgenda, setInputFocado,
      setPrecoConsultoria, setPrecoPresencial, setExperiencia, setPublicoAtendido, setDiferenciais,
      setObjetivosAtendidos, setInstagram, setTiktok, setCobranca, setAcompanhamento, setAutonomiaEsperada, setValoresAluno,
      obterLocalizacaoAtual, selecionarFotoPrincipal, selecionarFotosGaleria, removerFotoGaleria, setLocaisAtendidos, setGeneroAtendido,
      formatarNome, formatarWhatsApp, handlePrecoChange, toggleArrayItem, handleToggleServicos, handleSalvar, setSubsAtendidos,
      setLimitacoesAtendidas, setOutroObjetivoTexto, setOutraLimitacaoTexto, setOutroValorTexto, setServicosOferecidos,
      setFaixasEtariasAtendidas, setEstiloComunicacao 
    }
  };
}