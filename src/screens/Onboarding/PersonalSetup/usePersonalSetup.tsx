import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  buscarEstadoVerificacaoCref,
  EXIGIR_CEDULA_CREF_NO_SETUP,
  validarFormatoCref,
} from "../../../services/crefVerificacao";
import { supabase } from "../../../services/supabase";
import { FeedbackModalData, FeedbackModalTipo } from "./components/SetupModals";
import {
  DestaqueStoryItem,
  FormacaoSetupItem,
  PublicacaoSetupItem,
  uploadImagemStorage,
  usePersonalCref,
  usePersonalVitrine,
} from "./usePersonalSetupMediaCref";

export type { DestaqueStoryItem, FormacaoSetupItem, PublicacaoSetupItem };

export function usePersonalSetup(navigation: any) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalData>({
    visible: false,
    tipo: "warning",
    titulo: "",
    mensagem: "",
  });
  const [modalSalvoVisivel, setModalSalvoVisivel] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);

  const mostrarFeedback = (
    tipo: FeedbackModalTipo,
    titulo: string,
    mensagem: string,
    kicker?: string,
    textoBotao?: string
  ) => {
    setFeedbackModal({ visible: true, tipo, titulo, mensagem, kicker, textoBotao });
  };

  const fecharFeedback = () => {
    setFeedbackModal((prev) => ({ ...prev, visible: false }));
  };

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
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

  const [generoAtendido, setGeneroAtendido] = useState("indiferente");
  const [publicoAtendido, setPublicoAtendido] = useState<string[]>([]);
  const [faixasEtariasAtendidas, setFaixasEtariasAtendidas] = useState<string[]>([]);
  const [objetivosAtendidos, setObjetivosAtendidos] = useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsAtendidos, setSubsAtendidos] = useState<string[]>([]);
  const [limitacoesAtendidas, setLimitacoesAtendidas] = useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");

  const [estiloComunicacao, setEstiloComunicacao] = useState("");
  const [cobranca, setCobranca] = useState("");
  const [acompanhamento, setAcompanhamento] = useState("");
  const [autonomiaEsperada, setAutonomiaEsperada] = useState("");
  const [valoresAluno, setValoresAluno] = useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = useState("");
  const [experiencia, setExperiencia] = useState("");

  const crefHook = usePersonalCref(nome, mostrarFeedback);
  const vitrine = usePersonalVitrine(mostrarFeedback);

  useEffect(() => {
    const carregarDadosExistentes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
        if (user.user_metadata?.cref) crefHook.setCref(user.user_metadata.cref.toUpperCase());

        const [reqPlanos, reqPersonal, reqPubs, reqAval, estadoCref] = await Promise.all([
          supabase.from("planos").select("servicos_inclusos").eq("personal_id", user.id).eq("status", "ativo"),
          supabase.from("personals").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("personal_publicacoes")
            .select("*")
            .eq("personal_id", user.id)
            .order("fixado", { ascending: false })
            .order("criado_em", { ascending: false }),
          supabase
            .from("avaliacoes")
            .select("id, nota, comentario, criado_em, usuarios(nome)")
            .eq("personal_id", user.id)
            .order("criado_em", { ascending: false })
            .limit(20),
          buscarEstadoVerificacaoCref().catch(() => ({
            status: "nao_enviado" as const,
            crefVerificado: false,
          })),
        ]);

        crefHook.setCrefVerificacao(estadoCref);

        if (reqPlanos.data) {
          const bloqueados: string[] = [];
          reqPlanos.data.forEach((plano) => {
            if (Array.isArray(plano.servicos_inclusos)) {
              plano.servicos_inclusos.forEach((s: string) => {
                if (!bloqueados.includes(s)) bloqueados.push(s);
              });
            }
          });
          setServicosBloqueados(bloqueados);
        }

        if (!reqPubs.error && Array.isArray(reqPubs.data)) {
          vitrine.setPublicacoes(
            reqPubs.data.map((p: any) => ({
              id: p.id,
              imagem_url: p.imagem_url,
              categoria: p.categoria || "resultado",
              titulo: p.titulo,
              legenda: p.legenda,
              metrica_destaque: p.metrica_destaque,
              fixado: Boolean(p.fixado),
            }))
          );
        }

        if (!reqAval.error && Array.isArray(reqAval.data)) {
          vitrine.setAvaliacoes(reqAval.data);
        }

        const data = reqPersonal.data;
        if (data) {
          if (data.ativo) setIsEditing(true);
          if (data.cref) crefHook.setCref(data.cref.toUpperCase());
          if (data.nome) setNome(data.nome);
          if (data.capa_url) vitrine.setCapaUrl(data.capa_url);
          if (data.headline) vitrine.setHeadline(data.headline);
          if (data.descricao) vitrine.setBio(data.descricao);
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

          if (data.genero) {
            if (data.genero === "homem") setGenero("Masculino");
            else if (data.genero === "mulher") setGenero("Feminino");
            else setGenero("Outro");
          }

          if (Array.isArray(data.turnos_disponiveis)) setTurnos(data.turnos_disponiveis);
          if (data.status_agenda) setStatusAgenda(data.status_agenda);
          if (Array.isArray(data.servicos_oferecidos) && data.servicos_oferecidos.length > 0) {
            setServicosOferecidos(data.servicos_oferecidos);
          }

          if (data.preco_consultoria) setPrecoConsultoria(Number(data.preco_consultoria));
          if (data.preco_presencial) setPrecoPresencial(Number(data.preco_presencial));
          if (data.tempo_experiencia) setExperiencia(data.tempo_experiencia);
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.instagram) setInstagram(data.instagram);
          if (data.tiktok) setTiktok(data.tiktok);

          const esp =
            typeof data.especialidades === "string"
              ? JSON.parse(data.especialidades)
              : data.especialidades || {};

          setObjetivosAtendidos(esp.objetivos || []);
          setOutroObjetivoTexto(esp.outroObjetivo || "");
          setSubsAtendidos(esp.subs || []);
          setLimitacoesAtendidas(esp.limitacoes || []);
          setOutraLimitacaoTexto(esp.outraLimitacao || "");
          setPublicoAtendido(esp.publico || []);
          setLocaisAtendidos(esp.locais || []);
          setGeneroAtendido(
            !esp.generoAtendido || esp.generoAtendido === "ambos" ? "indiferente" : esp.generoAtendido
          );
          setHorariosEspecificos(esp.horarios_especificos || "");
          setFaixasEtariasAtendidas(esp.faixasEtarias || []);
          setEstiloComunicacao(esp.estiloComunicacao || "");
          setCobranca(esp.cobranca || "");
          setAcompanhamento(esp.acompanhamento || "");
          setAutonomiaEsperada(esp.autonomia || "");
          setValoresAluno(esp.valoresAluno || []);
          setOutroValorTexto(esp.outroValorTexto || "");

          const vc =
            typeof data.vitrine_config === "string"
              ? JSON.parse(data.vitrine_config)
              : data.vitrine_config || {};

          if (vc.cor_destaque) vitrine.setCorDestaque(vc.cor_destaque);
          vitrine.setMetodoTitulo(vc.metodo_titulo || "");
          vitrine.setMetodoDescricao(vc.metodo_descricao || esp.diferenciais || "");
          vitrine.setDiferenciaisLista(Array.isArray(vc.diferenciais_lista) ? vc.diferenciais_lista : []);
          vitrine.setDestaques(Array.isArray(vc.destaques) ? vc.destaques : []);
          vitrine.setFormacoes(Array.isArray(vc.formacoes) ? vc.formacoes : []);
          vitrine.setDepoimentosFixados(Array.isArray(vc.depoimentos_fixados) ? vc.depoimentos_fixados : []);
        }
      } catch (error) {
        console.log("Erro ao carregar PersonalSetup:", error);
      } finally {
        setLoadingDados(false);
      }
    };

    carregarDadosExistentes();
  }, []);

  const validarPasso = (passo: number): boolean => {
    if (passo === 1) {
      if (!nome.trim() || !crefHook.cref.trim() || !telefone.trim() || !genero || !cidade.trim()) {
        mostrarFeedback(
          "warning",
          "Passo 1 incompleto",
          "Preencha nome, gênero, CREF, WhatsApp e sincronize sua localização para continuar.",
          "DADOS OBRIGATÓRIOS"
        );
        return false;
      }
      const checkCref = validarFormatoCref(crefHook.cref);
      if (!checkCref.valido) {
        mostrarFeedback(
          "error",
          "CREF Inválido",
          checkCref.erro || "Informe seu CREF no padrão oficial: 000000-G/SP ou 000000-P/RJ.",
          "VALIDAÇÃO CREF"
        );
        return false;
      }
      if (crefHook.crefDisponivel === false) {
        mostrarFeedback(
          "error",
          "CREF Já Cadastrado",
          "Este número de CREF já está vinculado a outra conta no MatchTrainer.",
          "CREF DUPLICADO"
        );
        return false;
      }
      if (
        EXIGIR_CEDULA_CREF_NO_SETUP &&
        !crefHook.crefVerificacao.crefVerificado &&
        crefHook.crefVerificacao.status !== "em_analise"
      ) {
        mostrarFeedback(
          "warning",
          "Envie sua Cédula CREF",
          "Para garantir que apenas profissionais registrados atendam no app, envie a foto da sua cédula do CREF ou o PDF do CREF Digital antes de avançar.",
          "VERIFICAÇÃO OBRIGATÓRIA"
        );
        return false;
      }
    }
    if (passo === 2) {
      if (servicosOferecidos.length === 0) {
        mostrarFeedback("warning", "Passo 2 incompleto", "Selecione ao menos um serviço para continuar.");
        return false;
      }
      if (servicosOferecidos.includes("Presencial")) {
        if (locaisAtendidos.length === 0 || turnos.length === 0) {
          mostrarFeedback(
            "warning",
            "Passo 2 incompleto",
            "Para atendimento presencial, informe os Locais e Turnos disponíveis."
          );
          return false;
        }
        if (turnos.includes("variado") && !horariosEspecificos.trim()) {
          mostrarFeedback(
            "warning",
            "Passo 2 incompleto",
            "Informe seus horários específicos de disponibilidade."
          );
          return false;
        }
      }
    }
    if (passo === 3) {
      if (
        objetivosAtendidos.length === 0 ||
        publicoAtendido.length === 0 ||
        limitacoesAtendidas.length === 0 ||
        faixasEtariasAtendidas.length === 0
      ) {
        mostrarFeedback(
          "warning",
          "Passo 3 incompleto",
          "Selecione público, faixas etárias, focos de treino e restrições."
        );
        return false;
      }
      if (objetivosAtendidos.includes("outro") && !outroObjetivoTexto.trim()) {
        mostrarFeedback("warning", "Passo 3 incompleto", "Especifique o seu foco de treino em 'Outro Foco'.");
        return false;
      }
      if (limitacoesAtendidas.includes("outra") && !outraLimitacaoTexto.trim()) {
        mostrarFeedback("warning", "Passo 3 incompleto", "Especifique a restrição em 'Outra Restrição'.");
        return false;
      }
    }
    if (passo === 4) {
      if (!cobranca || !acompanhamento || !autonomiaEsperada || valoresAluno.length === 0 || !estiloComunicacao) {
        mostrarFeedback("warning", "Passo 4 incompleto", "Preencha suas preferências do Motor do Match.");
        return false;
      }
      if (valoresAluno.includes("outro") && !outroValorTexto.trim()) {
        mostrarFeedback("warning", "Passo 4 incompleto", "Especifique o valor adicional selecionado.");
        return false;
      }
    }
    return true;
  };

  const proximoPasso = () => {
    if (!validarPasso(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const passoAnterior = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const irParaPasso = (passo: number) => {
    if (isEditing || passo <= currentStep) setCurrentStep(passo);
  };

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        mostrarFeedback("warning", "Permissão Negada", "Libere a localização para sincronizar seu radar GPS.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse?.[0]) {
        const geo = reverse[0];
        if (geo.city || geo.subregion) setCidade(geo.city || geo.subregion || cidade);
        if (geo.district || geo.name) setBairro(geo.district || geo.name || bairro);
      }
    } catch {
      mostrarFeedback("error", "Erro no GPS", "Não foi possível obter sua localização pelo GPS agora.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const selecionarFotoPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      mostrarFeedback("warning", "Permissão Necessária", "Libere o acesso à galeria para escolher sua foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      setFotoUri(result.assets[0].uri);
      setFotoBase64(result.assets[0].base64 || null);
    }
  };

  const formatarNome = (texto: string) =>
    texto
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const formatarWhatsApp = (texto: string) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const handlePrecoChange = (texto: string, setPreco: (val: number) => void) => {
    const parsed = parseInt(texto.replace(/\D/g, ""), 10);
    setPreco(Number.isNaN(parsed) ? 0 : parsed);
  };

  const toggleArrayItem = (item: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleToggleFaixaEtaria = (item: string) => {
    if (item === "todas") {
      setFaixasEtariasAtendidas((prev) => (prev.includes("todas") ? [] : ["todas"]));
      return;
    }
    setFaixasEtariasAtendidas((prev) => {
      const semTodas = prev.filter((i) => i !== "todas");
      return semTodas.includes(item) ? semTodas.filter((i) => i !== item) : [...semTodas, item];
    });
  };

  const handleToggleLimitacao = (item: string) => {
    if (item === "nenhuma") {
      setLimitacoesAtendidas((prev) => (prev.includes("nenhuma") ? [] : ["nenhuma"]));
      return;
    }
    setLimitacoesAtendidas((prev) => {
      const semNenhuma = prev.filter((i) => i !== "nenhuma");
      return semNenhuma.includes(item) ? semNenhuma.filter((i) => i !== item) : [...semNenhuma, item];
    });
  };

  const handleToggleServicos = (servicoId: string) => {
    if (servicosOferecidos.includes(servicoId) && servicosBloqueados.includes(servicoId)) {
      mostrarFeedback(
        "warning",
        "Ação Bloqueada",
        "Você possui alunos ativos neste serviço no momento e não pode desativá-lo."
      );
      return;
    }
    toggleArrayItem(servicoId, servicosOferecidos, setServicosOferecidos);
  };

  const handleSalvar = async () => {
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
      if (!user) return;

      let fotoFinalUrl = fotoUri;
      if (fotoBase64) {
        fotoFinalUrl = await uploadImagemStorage(user.id, "avatar", fotoBase64);
        setFotoUri(fotoFinalUrl);
        setFotoBase64(null);
      }

      let capaFinalUrl = vitrine.capaUrl;
      if (vitrine.capaBase64) {
        capaFinalUrl = await uploadImagemStorage(user.id, "capa", vitrine.capaBase64);
        vitrine.setCapaUrl(capaFinalUrl);
        vitrine.setCapaBase64(null);
      }

      const destaquesLimpos: DestaqueStoryItem[] = [];
      for (const d of vitrine.destaques) {
        let imgStoryUrl = d.imagem_url || null;
        if (d.pendenteUpload && d.base64) {
          imgStoryUrl = await uploadImagemStorage(user.id, "story", d.base64);
        }
        destaquesLimpos.push({
          id: d.id,
          titulo: d.titulo,
          icone: d.icone,
          subtitulo: d.subtitulo,
          conteudo: d.conteudo,
          imagem_url: imgStoryUrl,
        });
      }
      vitrine.setDestaques(destaquesLimpos);

      const especialidadesEstruturadas = {
        objetivos: objetivosAtendidos,
        outroObjetivo: objetivosAtendidos.includes("outro") ? outroObjetivoTexto.trim() : null,
        limitacoes: limitacoesAtendidas,
        outraLimitacao: limitacoesAtendidas.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs: subsAtendidos,
        locais: servicosOferecidos.includes("Presencial") ? locaisAtendidos : [],
        publico: publicoAtendido,
        generoAtendido,
        faixasEtarias: faixasEtariasAtendidas,
        estiloComunicacao,
        diferenciais: vitrine.metodoDescricao.trim(),
        horarios_especificos:
          servicosOferecidos.includes("Presencial") && turnos.includes("variado")
            ? horariosEspecificos.trim()
            : null,
        cobranca,
        acompanhamento,
        autonomia: autonomiaEsperada,
        valoresAluno,
        outroValorTexto: valoresAluno.includes("outro") ? outroValorTexto.trim() : null,
      };

      const vitrineConfig = {
        cor_destaque: vitrine.corDestaque || "#FF6B00",
        metodo_titulo: vitrine.metodoTitulo.trim(),
        metodo_descricao: vitrine.metodoDescricao.trim(),
        diferenciais_lista: vitrine.diferenciaisLista,
        destaques: destaquesLimpos,
        formacoes: vitrine.formacoes,
        depoimentos_fixados: vitrine.depoimentosFixados,
      };

      let generoDB = "outro";
      if (genero === "Masculino") generoDB = "homem";
      if (genero === "Feminino") generoDB = "mulher";

      const { error: errPersonal } = await supabase.from("personals").upsert({
        id: user.id,
        email: user.email,
        nome: nome.trim(),
        cref: crefHook.cref.trim().toUpperCase(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        latitude,
        longitude,
        tempo_experiencia: experiencia,
        genero: generoDB,
        turnos_disponiveis: servicosOferecidos.includes("Presencial") ? turnos : [],
        status_agenda: statusAgenda,
        servicos_oferecidos: servicosOferecidos,
        preco_consultoria: servicosOferecidos.includes("Consultoria") ? precoConsultoria : null,
        preco_presencial: servicosOferecidos.includes("Presencial") ? precoPresencial : null,
        preco_medio: servicosOferecidos.includes("Consultoria") ? precoConsultoria : precoPresencial,
        capa_url: capaFinalUrl,
        headline: vitrine.headline.trim() || null,
        descricao: vitrine.bio.trim(),
        foto_url: fotoFinalUrl,
        instagram: instagram.trim().replace(/^@/, ""),
        tiktok: tiktok.trim().replace(/^@/, ""),
        especialidades: especialidadesEstruturadas,
        vitrine_config: vitrineConfig,
        ativo: true,
      });

      if (errPersonal) throw errPersonal;

      await vitrine.sincronizarPublicacoesNoBanco(user.id);

      setSavedUserId(user.id);
      setModalSalvoVisivel(true);
    } catch (err: any) {
      mostrarFeedback(
        "error",
        "Erro ao salvar",
        err?.message || "Não foi possível salvar seu perfil agora. Tente novamente.",
        "FALHA AO SALVAR"
      );
    } finally {
      setLoading(false);
    }
  };

  const irParaPainelPosSalvar = () => {
    setModalSalvoVisivel(false);
    if (isEditing) navigation.goBack();
    else navigation.replace("PersonalDashboard");
  };

  const verVitrinePosSalvar = () => {
    setModalSalvoVisivel(false);
    if (!savedUserId) return;
    navigation.navigate("PersonalPublicProfile", {
      id: savedUserId,
      personalId: savedUserId,
      fromDashboard: true,
    });
  };

  return {
    state: {
      currentStep,
      loading,
      loadingDados,
      isEditing,
      inputFocado,
      feedbackModal,
      modalSalvoVisivel,
      nome,
      fotoUri,
      cref: crefHook.cref,
      crefVerificacao: crefHook.crefVerificacao,
      crefDisponivel: crefHook.crefDisponivel,
      verificandoCrefIA: crefHook.verificandoCrefIA,
      modalUploadCrefVisivel: crefHook.modalUploadCrefVisivel,
      telefone,
      genero,
      cidade,
      bairro,
      buscandoLocalizacao,
      instagram,
      tiktok,
      servicosOferecidos,
      servicosBloqueados,
      precoConsultoria,
      precoPresencial,
      turnos,
      horariosEspecificos,
      statusAgenda,
      locaisAtendidos,
      generoAtendido,
      publicoAtendido,
      faixasEtariasAtendidas,
      objetivosAtendidos,
      outroObjetivoTexto,
      subsAtendidos,
      limitacoesAtendidas,
      outraLimitacaoTexto,
      estiloComunicacao,
      cobranca,
      acompanhamento,
      autonomiaEsperada,
      valoresAluno,
      outroValorTexto,
      experiencia,
      corDestaque: vitrine.corDestaque,
      capaUrl: vitrine.capaUrl,
      headline: vitrine.headline,
      bio: vitrine.bio,
      metodoTitulo: vitrine.metodoTitulo,
      metodoDescricao: vitrine.metodoDescricao,
      diferenciaisLista: vitrine.diferenciaisLista,
      destaques: vitrine.destaques,
      formacoes: vitrine.formacoes,
      avaliacoes: vitrine.avaliacoes,
      depoimentosFixados: vitrine.depoimentosFixados,
      publicacoes: vitrine.publicacoes,
    },
    actions: {
      proximoPasso,
      passoAnterior,
      irParaPasso,
      setInputFocado,
      mostrarFeedback,
      fecharFeedback,
      setModalSalvoVisivel,
      irParaPainelPosSalvar,
      verVitrinePosSalvar,
      setNome,
      setCref: crefHook.setCref,
      handleAlterarCref: crefHook.handleAlterarCref,
      setModalUploadCrefVisivel: crefHook.setModalUploadCrefVisivel,
      handleCrefCamera: crefHook.handleCrefCamera,
      handleCrefGaleria: crefHook.handleCrefGaleria,
      handleCrefPdf: crefHook.handleCrefPdf,
      setTelefone,
      setGenero,
      setInstagram,
      setTiktok,
      obterLocalizacaoAtual,
      selecionarFotoPrincipal,
      selecionarFotoCapa: vitrine.selecionarFotoCapa,
      setPrecoConsultoria,
      setPrecoPresencial,
      setTurnos,
      setHorariosEspecificos,
      setStatusAgenda,
      setLocaisAtendidos,
      setGeneroAtendido,
      setPublicoAtendido,
      setObjetivosAtendidos,
      setOutroObjetivoTexto,
      setSubsAtendidos,
      setOutraLimitacaoTexto,
      setEstiloComunicacao,
      setCobranca,
      setAcompanhamento,
      setAutonomiaEsperada,
      setValoresAluno,
      setOutroValorTexto,
      setExperiencia,
      setCorDestaque: vitrine.setCorDestaque,
      setHeadline: vitrine.setHeadline,
      setBio: vitrine.setBio,
      setMetodoTitulo: vitrine.setMetodoTitulo,
      setMetodoDescricao: vitrine.setMetodoDescricao,
      adicionarDiferencial: vitrine.adicionarDiferencial,
      removerDiferencial: vitrine.removerDiferencial,
      adicionarDestaque: vitrine.adicionarDestaque,
      editarDestaque: vitrine.editarDestaque,
      removerDestaque: vitrine.removerDestaque,
      adicionarFormacao: vitrine.adicionarFormacao,
      removerFormacao: vitrine.removerFormacao,
      toggleFixarDepoimento: vitrine.toggleFixarDepoimento,
      adicionarPublicacaoLocal: vitrine.adicionarPublicacaoLocal,
      atualizarPublicacaoLocal: vitrine.atualizarPublicacaoLocal,
      toggleFixarPublicacao: vitrine.toggleFixarPublicacao,
      removerPublicacao: vitrine.removerPublicacao,
      formatarNome,
      formatarWhatsApp,
      handlePrecoChange,
      toggleArrayItem,
      handleToggleFaixaEtaria,
      handleToggleLimitacao,
      handleToggleServicos,
      handleSalvar,
    },
  };
}