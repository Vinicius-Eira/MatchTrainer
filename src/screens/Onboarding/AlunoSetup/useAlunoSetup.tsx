import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { registrarConsentimentoLGPD, RESUMO_FINALIDADE_SAUDE } from "../../../services/lgpd/lgpdService";
import { supabase } from "../../../services/supabase";
import {
  generoDbParaUi,
  generoUiParaDb,
  possuiDadosSaudeSensiveis,
  SUB_SAUDE_SENSIVEIS,
  validarDataNascimentoBr,
} from "../../../shared/matchSchema";

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:image\/\w+;base64,/, "").replace(/[^A-Za-z0-9+/=]/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  const byteLength = (clean.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const e1 = B64_CHARS.indexOf(clean[i]);
    const e2 = B64_CHARS.indexOf(clean[i + 1]);
    const e3 = B64_CHARS.indexOf(clean[i + 2]);
    const e4 = B64_CHARS.indexOf(clean[i + 3]);

    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;

    if (p < byteLength) bytes[p++] = c1;
    if (e3 !== -1 && clean[i + 2] !== "=" && p < byteLength) bytes[p++] = c2;
    if (e4 !== -1 && clean[i + 3] !== "=" && p < byteLength) bytes[p++] = c3;
  }
  return bytes;
}

async function uploadAvatarAlunoStorage(userId: string, base64: string): Promise<string> {
  const bytes = base64ToUint8Array(base64);
  const filePath = `${userId}/avatar-${Date.now()}.jpg`;

  const { error } = await supabase.storage.from("avatars-alunos").upload(filePath, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars-alunos").getPublicUrl(filePath);
  return data.publicUrl;
}

export function useClientSetup(navigation: any) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const userIdRef = useRef<string | null>(null);
  const preferenciasOriginaisRef = useRef<Record<string, any>>({});

  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
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
  const [generoTreinador, setGeneroTreinador] = useState("indiferente");
  const [investimento, setInvestimento] = useState("");

  const [historico, setHistorico] = useState("");
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsObjetivos, setSubsObjetivos] = useState<string[]>([]);
  const [limitacoes, setLimitacoes] = useState<string[]>([]);
  const [subsLimitacoes, setSubsLimitacoes] = useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [consentimentoSaude, setConsentimentoSaude] = useState(false);

  const [estiloComunicacao, setEstiloComunicacao] = useState("");
  const [cobranca, setCobranca] = useState("");
  const [acompanhamento, setAcompanhamento] = useState("");
  const [autonomia, setAutonomia] = useState("");
  const [valoresTreinador, setValoresTreinador] = useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = useState("");

  const precisaConsentimentoSaude = possuiDadosSaudeSensiveis(limitacoes, subsObjetivos);

  const formatarNome = (texto: string) =>
    texto
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

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
    setDataNascimento(v.substring(0, 10));
  };

  const formatarPeso = (t: string) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarMetaPeso = (t: string) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));

  const getDraftKey = (uid: string) => `@matchtrainer:aluno_setup_draft:${uid}`;

  const salvarRascunhoLocal = async (passoAlvo: number) => {
    const uid = userIdRef.current;
    if (!uid || isEditing) return;
    try {
      const rascunho = {
        currentStep: passoAlvo,
        nome,
        genero,
        dataNascimento,
        telefone,
        cidade,
        bairro,
        latitude,
        longitude,
        peso,
        altura,
        metaPeso,
        servicoBuscado,
        locaisTreino,
        turnos,
        horarioEspecifico,
        frequencia,
        generoTreinador,
        investimento,
        historico,
        objetivos,
        outroObjetivoTexto,
        subsObjetivos,
        limitacoes,
        subsLimitacoes,
        outraLimitacaoTexto,
        consentimentoSaude,
        estiloComunicacao,
        cobranca,
        acompanhamento,
        autonomia,
        valoresTreinador,
        outroValorTexto,
      };
      await AsyncStorage.setItem(getDraftKey(uid), JSON.stringify(rascunho));
    } catch {
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        userIdRef.current = user.id;

        if (user.user_metadata?.nome) setNome(user.user_metadata.nome);

        const { data } = await supabase.from("usuarios").select("*").eq("id", user.id).maybeSingle();

        if (data) {
          const setupJaConcluido = Boolean(data.setup_completo || data.preferencias?.setup_completo);
          setIsEditing(setupJaConcluido);

          if (data.nome) setNome(data.nome);
          if (data.genero) setGenero(generoDbParaUi(data.genero));
          if (data.cidade) setCidade(data.cidade);
          if (data.bairro) setBairro(data.bairro);
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);
          if (data.telefone) formatarWhatsApp(data.telefone);
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.peso) setPeso(String(data.peso));
          if (data.altura) setAltura(String(data.altura));
          if (data.frequencia_treino) setFrequencia(data.frequencia_treino);

          if (data.data_nascimento) {
            const [ano, mes, dia] = data.data_nascimento.split("-");
            if (ano && mes && dia) setDataNascimento(`${dia}/${mes}/${ano}`);
          }

          const p =
            typeof data.preferencias === "string"
              ? JSON.parse(data.preferencias)
              : data.preferencias || {};
          preferenciasOriginaisRef.current = p;

          if (p.meta_peso !== undefined && p.meta_peso !== null) setMetaPeso(String(p.meta_peso));
          if (p.servico_buscado) setServicoBuscado(p.servico_buscado);
          if (Array.isArray(p.locais_treino)) setLocaisTreino(p.locais_treino);
          if (Array.isArray(p.turnos)) setTurnos(p.turnos);
          if (p.horario_especifico) setHorarioEspecifico(p.horario_especifico);
          if (p.frequencia) setFrequencia(p.frequencia);
          if (p.genero_treinador) setGeneroTreinador(p.genero_treinador);
          if (p.investimento) setInvestimento(p.investimento);
          if (p.historico) setHistorico(p.historico);
          if (Array.isArray(p.objetivos)) setObjetivos(p.objetivos);
          if (p.outro_objetivo) setOutroObjetivoTexto(p.outro_objetivo);
          if (Array.isArray(p.subs_objetivos)) setSubsObjetivos(p.subs_objetivos);
          if (Array.isArray(p.limitacoes)) setLimitacoes(p.limitacoes);
          if (Array.isArray(p.subs_limitacoes)) setSubsLimitacoes(p.subs_limitacoes);
          if (p.outra_limitacao) setOutraLimitacaoTexto(p.outra_limitacao);
          if (typeof p.consentimento_saude === "boolean") setConsentimentoSaude(p.consentimento_saude);
          if (p.estilo_comunicacao) setEstiloComunicacao(p.estilo_comunicacao);
          if (p.cobranca) setCobranca(p.cobranca);
          if (p.acompanhamento) setAcompanhamento(p.acompanhamento);
          if (p.autonomia) setAutonomia(p.autonomia);
          if (Array.isArray(p.valores_treinador)) setValoresTreinador(p.valores_treinador);
          if (p.outro_valor) setOutroValorTexto(p.outro_valor);

          if (!setupJaConcluido) {
            const draftRaw = await AsyncStorage.getItem(getDraftKey(user.id));
            if (draftRaw) {
              const d = JSON.parse(draftRaw);
              if (d.currentStep >= 1 && d.currentStep <= 4) setCurrentStep(d.currentStep);
              if (d.nome) setNome(d.nome);
              if (d.genero) setGenero(d.genero);
              if (d.dataNascimento) setDataNascimento(d.dataNascimento);
              if (d.telefone) setTelefone(d.telefone);
              if (d.cidade) setCidade(d.cidade);
              if (d.bairro) setBairro(d.bairro);
              if (d.latitude !== undefined) setLatitude(d.latitude);
              if (d.longitude !== undefined) setLongitude(d.longitude);
              if (d.peso) setPeso(d.peso);
              if (d.altura) setAltura(d.altura);
              if (d.metaPeso) setMetaPeso(d.metaPeso);
              if (d.servicoBuscado) setServicoBuscado(d.servicoBuscado);
              if (Array.isArray(d.locaisTreino)) setLocaisTreino(d.locaisTreino);
              if (Array.isArray(d.turnos)) setTurnos(d.turnos);
              if (d.horarioEspecifico) setHorarioEspecifico(d.horarioEspecifico);
              if (d.frequencia) setFrequencia(d.frequencia);
              if (d.generoTreinador) setGeneroTreinador(d.generoTreinador);
              if (d.investimento) setInvestimento(d.investimento);
              if (d.historico) setHistorico(d.historico);
              if (Array.isArray(d.objetivos)) setObjetivos(d.objetivos);
              if (d.outroObjetivoTexto) setOutroObjetivoTexto(d.outroObjetivoTexto);
              if (Array.isArray(d.subsObjetivos)) setSubsObjetivos(d.subsObjetivos);
              if (Array.isArray(d.limitacoes)) setLimitacoes(d.limitacoes);
              if (Array.isArray(d.subsLimitacoes)) setSubsLimitacoes(d.subsLimitacoes);
              if (d.outraLimitacaoTexto) setOutraLimitacaoTexto(d.outraLimitacaoTexto);
              if (typeof d.consentimentoSaude === "boolean") setConsentimentoSaude(d.consentimentoSaude);
              if (d.estiloComunicacao) setEstiloComunicacao(d.estiloComunicacao);
              if (d.cobranca) setCobranca(d.cobranca);
              if (d.acompanhamento) setAcompanhamento(d.acompanhamento);
              if (d.autonomia) setAutonomia(d.autonomia);
              if (Array.isArray(d.valoresTreinador)) setValoresTreinador(d.valoresTreinador);
              if (d.outroValorTexto) setOutroValorTexto(d.outroValorTexto);
            }
          }
        }
      } catch (error) {
        console.log("Erro ao carregar AlunoSetup:", error);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDados();
  }, []);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Acesso Negado", "Libere o acesso à galeria para escolher sua foto.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
      setFotoBase64(result.assets[0].base64 || null);
    }
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Você pode digitar sua cidade manualmente.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        if (g.city || g.subregion) setCidade(g.city || g.subregion || "");
        if (g.district || g.name) setBairro(g.district || g.name || "");
      }
    } catch {
      Alert.alert("Aviso", "Não foi possível obter o GPS agora. Você pode informar sua cidade manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const toggleArrayItem = (item: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleToggleLimitacao = (id: string) => {
    if (id === "nenhuma" || id === "nao_informar") {
      const jaMarcado = limitacoes.includes(id);
      setLimitacoes(jaMarcado ? [] : [id]);
      setSubsLimitacoes([]);
      setOutraLimitacaoTexto("");
      if (!jaMarcado && !subsObjetivos.some((s) => SUB_SAUDE_SENSIVEIS.includes(s))) {
        setConsentimentoSaude(false);
      }
      return;
    }

    setLimitacoes((prev) => {
      const semExcludentes = prev.filter((item) => item !== "nenhuma" && item !== "nao_informar");
      const proximo = semExcludentes.includes(id)
        ? semExcludentes.filter((item) => item !== id)
        : [...semExcludentes, id];

      if (!proximo.includes("lesao") && !proximo.includes("clinica")) {
        setSubsLimitacoes([]);
      }
      if (!proximo.includes("outra")) {
        setOutraLimitacaoTexto("");
      }
      return proximo;
    });
  };

  const optarNaoInformarSaude = () => {
    setLimitacoes(["nao_informar"]);
    setSubsLimitacoes([]);
    setOutraLimitacaoTexto("");
    setSubsObjetivos((prev) => prev.filter((s) => !SUB_SAUDE_SENSIVEIS.includes(s)));
    setConsentimentoSaude(false);
  };

  const validarPasso = (passo: number): boolean => {
    if (passo === 1) {
      if (!nome.trim() || !genero) {
        Alert.alert("Passo 1 incompleto", "Informe como quer ser chamado e seu gênero.");
        return false;
      }
      const checkData = validarDataNascimentoBr(dataNascimento);
      if (!checkData.valida) {
        Alert.alert("Data de nascimento", checkData.erro || "Data inválida.");
        return false;
      }
      if (telefone.replace(/\D/g, "").length < 10) {
        Alert.alert("WhatsApp inválido", "Informe um número com DDD válido.");
        return false;
      }
      if (!cidade.trim()) {
        Alert.alert("Localização", "Sincronize o GPS ou digite sua cidade para continuar.");
        return false;
      }
    }

    if (passo === 2) {
      if (!servicoBuscado || !frequencia || !generoTreinador || !investimento) {
        Alert.alert("Passo 2 incompleto", "Selecione modalidade, frequência semanal, preferência de treinador e investimento.");
        return false;
      }
      if (servicoBuscado === "Presencial") {
        if (locaisTreino.length === 0 || turnos.length === 0) {
          Alert.alert("Logística Presencial", "Para atendimento presencial, informe onde vai treinar e os turnos disponíveis.");
          return false;
        }
        if (turnos.includes("variado") && !horarioEspecifico.trim()) {
          Alert.alert("Horários específicos", "Informe brevemente suas janelas de horário.");
          return false;
        }
      }
    }

    if (passo === 3) {
      if (!historico || objetivos.length === 0 || limitacoes.length === 0) {
        Alert.alert("Passo 3 incompleto", "Selecione seu nível, objetivo e uma opção sobre limitações.");
        return false;
      }
      if (objetivos.includes("outro") && !outroObjetivoTexto.trim()) {
        Alert.alert("Objetivo personalizado", "Especifique o seu foco em 'Outro Foco'.");
        return false;
      }
      if (limitacoes.includes("outra") && !outraLimitacaoTexto.trim()) {
        Alert.alert("Restrição personalizada", "Especifique a restrição em 'Outra Restrição'.");
        return false;
      }
      if (precisaConsentimentoSaude && !consentimentoSaude) {
        Alert.alert(
          "Consentimento LGPD necessário",
          "Para usar dados de saúde no filtro do Match, marque a autorização específica abaixo ou selecione 'Prefiro Não Informar'."
        );
        return false;
      }
    }

    if (passo === 4) {
      if (!cobranca || !acompanhamento || !autonomia || !estiloComunicacao || valoresTreinador.length === 0) {
        Alert.alert("Passo 4 incompleto", "Preencha suas preferências comportamentais do Match.");
        return false;
      }
      if (valoresTreinador.includes("outro") && !outroValorTexto.trim()) {
        Alert.alert("Valor personalizado", "Especifique o valor adicional que considera importante.");
        return false;
      }
    }

    return true;
  };

  const proximoPasso = () => {
    if (!validarPasso(currentStep)) return;
    const prox = Math.min(currentStep + 1, 4);
    setCurrentStep(prox);
    salvarRascunhoLocal(prox);
  };

  const passoAnterior = () => {
    const ant = Math.max(currentStep - 1, 1);
    setCurrentStep(ant);
    salvarRascunhoLocal(ant);
  };

  const irParaPasso = (stepNum: number) => {
    if (isEditing || stepNum <= currentStep) {
      setCurrentStep(stepNum);
    }
  };

  const handleFinalizar = async () => {
    for (let step = 1; step <= 4; step++) {
      if (!validarPasso(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const checkData = validarDataNascimentoBr(dataNascimento);
      if (!checkData.valida || !checkData.iso) {
        throw new Error(checkData.erro || "Data de nascimento inválida.");
      }

      let fotoFinalUrl = fotoUri;
      if (fotoBase64) {
        try {
          fotoFinalUrl = await uploadAvatarAlunoStorage(user.id, fotoBase64);
          setFotoUri(fotoFinalUrl);
          setFotoBase64(null);
        } catch (uploadErr: any) {
          throw new Error(
            uploadErr?.message ||
              "Falha ao enviar sua foto. Confirme se o bucket 'avatars-alunos' foi criado no Supabase."
          );
        }
      }

      const usaPresencial = servicoBuscado === "Presencial" || servicoBuscado === "Indiferente";
      const agoraIso = new Date().toISOString();

      const preferenciasAtualizadas = {
        ...preferenciasOriginaisRef.current,
        servico_buscado: servicoBuscado,
        locais_treino: usaPresencial ? locaisTreino : [],
        turnos: usaPresencial ? turnos : [],
        horario_especifico: usaPresencial && turnos.includes("variado") ? horarioEspecifico.trim() : null,
        frequencia,
        genero_treinador: generoTreinador || "indiferente",
        investimento,
        historico,
        objetivos,
        outro_objetivo: objetivos.includes("outro") ? outroObjetivoTexto.trim() : null,
        subs_objetivos: subsObjetivos,
        limitacoes,
        subs_limitacoes: limitacoes.includes("lesao") || limitacoes.includes("clinica") ? subsLimitacoes : [],
        outra_limitacao: limitacoes.includes("outra") ? outraLimitacaoTexto.trim() : null,
        estilo_comunicacao: estiloComunicacao,
        cobranca,
        acompanhamento,
        autonomia,
        valores_treinador: valoresTreinador,
        outro_valor: valoresTreinador.includes("outro") ? outroValorTexto.trim() : null,
        meta_peso: metaPeso ? parseFloat(metaPeso) : null,
        consentimento_saude: precisaConsentimentoSaude ? consentimentoSaude : false,
        consentimento_saude_em: precisaConsentimentoSaude && consentimentoSaude ? agoraIso : null,
      };

      const payload: Record<string, any> = {
        nome: nome.trim(),
        genero: generoUiParaDb(genero),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim() || null,
        latitude,
        longitude,
        data_nascimento: checkData.iso,
        frequencia_treino: frequencia,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        preferencias: preferenciasAtualizadas,
        setup_completo: true,
      };

      if (fotoFinalUrl) payload.foto_url = fotoFinalUrl;

      const { error } = await supabase.from("usuarios").update(payload).eq("id", user.id);
      if (error) throw error;

      if (precisaConsentimentoSaude && consentimentoSaude) {
        await registrarConsentimentoLGPD({
          tipo: "dados_saude_match",
          concedido: true,
          origem: isEditing ? "aluno_setup_edicao" : "aluno_setup_inicial",
          resumoFinalidade: RESUMO_FINALIDADE_SAUDE,
        });
      }

      await AsyncStorage.removeItem(getDraftKey(user.id));

      if (isEditing && navigation.canGoBack()) {
        Alert.alert("Preferências atualizadas!", "Seu perfil do Match foi recalculado com as novas respostas.");
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
      }
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error?.message || "Não foi possível salvar suas preferências agora.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      currentStep,
      loading,
      loadingDados,
      isEditing,
      buscandoLocal,
      inputFocado,
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
      servicoBuscado,
      locaisTreino,
      turnos,
      horarioEspecifico,
      frequencia,
      generoTreinador,
      investimento,
      historico,
      objetivos,
      outroObjetivoTexto,
      subsObjetivos,
      limitacoes,
      subsLimitacoes,
      outraLimitacaoTexto,
      consentimentoSaude,
      precisaConsentimentoSaude,
      estiloComunicacao,
      cobranca,
      acompanhamento,
      autonomia,
      valoresTreinador,
      outroValorTexto,
    },
    actions: {
      proximoPasso,
      passoAnterior,
      irParaPasso,
      setInputFocado,
      setNome,
      setGenero,
      setTelefone,
      setCidade,
      setBairro,
      setPeso,
      setAltura,
      setMetaPeso,
      setServicoBuscado,
      setLocaisTreino,
      setTurnos,
      setHorarioEspecifico,
      setFrequencia,
      setGeneroTreinador,
      setInvestimento,
      setHistorico,
      setObjetivos,
      setOutroObjetivoTexto,
      setSubsObjetivos,
      handleToggleLimitacao,
      setSubsLimitacoes,
      setOutraLimitacaoTexto,
      setConsentimentoSaude,
      optarNaoInformarSaude,
      setEstiloComunicacao,
      setCobranca,
      setAcompanhamento,
      setAutonomia,
      setValoresTreinador,
      setOutroValorTexto,
      formatarNome,
      formatarWhatsApp,
      formatarData,
      formatarPeso,
      formatarAltura,
      formatarMetaPeso,
      escolherFoto,
      buscarLocalizacao,
      toggleArrayItem,
      handleFinalizar,
    },
  };
}