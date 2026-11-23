import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase";

export interface DestaqueStoryItem {
  id: string;
  titulo: string;
  icone: string;
  subtitulo: string;
  conteudo: string;
  imagem_url?: string | null;
  pendenteUpload?: boolean;
  base64?: string | null;
}

export interface FormacaoSetupItem {
  id: string;
  titulo: string;
  instituicao: string;
  ano?: string;
}

export interface PublicacaoSetupItem {
  id: string;
  imagem_url: string;
  categoria: "resultado" | "treino" | "certificado" | "espaco";
  titulo?: string | null;
  legenda?: string | null;
  metrica_destaque?: string | null;
  fixado: boolean;
  pendenteUpload?: boolean;
  base64?: string | null;
}

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

async function uploadImagemStorage(
  userId: string,
  pasta: "avatar" | "capa" | "feed" | "story",
  base64: string
): Promise<string> {
  const bytes = base64ToUint8Array(base64);
  const filePath = `${userId}/${pasta}-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;

  const { error } = await supabase.storage.from("vitrine-personal").upload(filePath, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("vitrine-personal").getPublicUrl(filePath);
  return data.publicUrl;
}

export function usePersonalSetup(navigation: any) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
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

  const [corDestaque, setCorDestaque] = useState("#FF6B00");
  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [capaBase64, setCapaBase64] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [metodoTitulo, setMetodoTitulo] = useState("");
  const [metodoDescricao, setMetodoDescricao] = useState("");
  const [diferenciaisLista, setDiferenciaisLista] = useState<string[]>([]);
  const [destaques, setDestaques] = useState<DestaqueStoryItem[]>([]);
  const [formacoes, setFormacoes] = useState<FormacaoSetupItem[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [depoimentosFixados, setDepoimentosFixados] = useState<string[]>([]);
  const [publicacoes, setPublicacoes] = useState<PublicacaoSetupItem[]>([]);
  const [publicacoesRemoverIds, setPublicacoesRemoverIds] = useState<string[]>([]);

  useEffect(() => {
    const carregarDadosExistentes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
        if (user.user_metadata?.cref) setCref(user.user_metadata.cref.toUpperCase());

        const [reqPlanos, reqPersonal, reqPubs, reqAval] = await Promise.all([
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
        ]);

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
          setPublicacoes(
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
          setAvaliacoes(reqAval.data);
        }

        const data = reqPersonal.data;
        if (data) {
          if (data.ativo) setIsEditing(true);
          if (data.cref) setCref(data.cref.toUpperCase());
          if (data.nome) setNome(data.nome);
          if (data.capa_url) setCapaUrl(data.capa_url);
          if (data.headline) setHeadline(data.headline);
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

          if (vc.cor_destaque) setCorDestaque(vc.cor_destaque);
          setMetodoTitulo(vc.metodo_titulo || "");
          setMetodoDescricao(vc.metodo_descricao || esp.diferenciais || "");
          setDiferenciaisLista(Array.isArray(vc.diferenciais_lista) ? vc.diferenciais_lista : []);
          setDestaques(Array.isArray(vc.destaques) ? vc.destaques : []);
          setFormacoes(Array.isArray(vc.formacoes) ? vc.formacoes : []);
          setDepoimentosFixados(Array.isArray(vc.depoimentos_fixados) ? vc.depoimentos_fixados : []);
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
      if (!nome.trim() || !cref.trim() || !telefone.trim() || !genero || !cidade.trim()) {
        Alert.alert("Passo 1 incompleto", "Preencha nome, gênero, CREF, WhatsApp e sincronize sua localização.");
        return false;
      }
    }
    if (passo === 2) {
      if (servicosOferecidos.length === 0) {
        Alert.alert("Passo 2 incompleto", "Selecione ao menos um serviço.");
        return false;
      }
      if (servicosOferecidos.includes("Presencial")) {
        if (locaisAtendidos.length === 0 || turnos.length === 0) {
          Alert.alert("Passo 2 incompleto", "Para atendimento presencial, informe os Locais e Turnos.");
          return false;
        }
        if (turnos.includes("variado") && !horariosEspecificos.trim()) {
          Alert.alert("Passo 2 incompleto", "Informe seus horários específicos de disponibilidade.");
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
        Alert.alert("Passo 3 incompleto", "Selecione público, faixas etárias, focos de treino e restrições.");
        return false;
      }
      if (objetivosAtendidos.includes("outro") && !outroObjetivoTexto.trim()) {
        Alert.alert("Passo 3 incompleto", "Especifique o seu foco de treino em 'Outro Foco'.");
        return false;
      }
      if (limitacoesAtendidas.includes("outra") && !outraLimitacaoTexto.trim()) {
        Alert.alert("Passo 3 incompleto", "Especifique a restrição em 'Outra Restrição'.");
        return false;
      }
    }
    if (passo === 4) {
      if (!cobranca || !acompanhamento || !autonomiaEsperada || valoresAluno.length === 0 || !estiloComunicacao) {
        Alert.alert("Passo 4 incompleto", "Preencha suas preferências do Motor do Match.");
        return false;
      }
      if (valoresAluno.includes("outro") && !outroValorTexto.trim()) {
        Alert.alert("Passo 4 incompleto", "Especifique o valor adicional selecionado.");
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
    if (isEditing || passo <= currentStep) {
      setCurrentStep(passo);
    }
  };

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Aviso", "Permissão de localização negada.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const geo = reverse[0];
        const novaCidade = geo.city || geo.subregion || cidade;
        const novoBairro = geo.district || geo.name || bairro;
        if (novaCidade) setCidade(novaCidade);
        if (novoBairro) setBairro(novoBairro);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível obter a localização pelo GPS.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const selecionarFotoPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para escolher sua foto.");
      return;
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

  const selecionarFotoCapa = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para escolher sua foto de capa.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.72,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setCapaUrl(result.assets[0].uri);
      setCapaBase64(result.assets[0].base64 || null);
    }
  };

  const adicionarDiferencial = (texto: string) => {
    const limpo = texto.trim();
    if (!limpo) return;
    setDiferenciaisLista((prev) => [...prev, limpo]);
  };

  const removerDiferencial = (index: number) => {
    setDiferenciaisLista((prev) => prev.filter((_, idx) => idx !== index));
  };

  const adicionarDestaque = (item: Omit<DestaqueStoryItem, "id">) => {
    setDestaques((prev) => [...prev, { ...item, id: `dest-${Date.now()}` }]);
  };

  const editarDestaque = (atualizado: DestaqueStoryItem) => {
    setDestaques((prev) => prev.map((item) => (item.id === atualizado.id ? atualizado : item)));
  };

  const removerDestaque = (id: string) => {
    setDestaques((prev) => prev.filter((item) => item.id !== id));
  };

  const adicionarFormacao = (item: Omit<FormacaoSetupItem, "id">) => {
    setFormacoes((prev) => [...prev, { ...item, id: `form-${Date.now()}` }]);
  };

  const removerFormacao = (id: string) => {
    setFormacoes((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleFixarDepoimento = (id: string) => {
    setDepoimentosFixados((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const adicionarPublicacaoLocal = (pub: Omit<PublicacaoSetupItem, "id" | "pendenteUpload">) => {
    const novo: PublicacaoSetupItem = {
      ...pub,
      id: `temp-${Date.now()}`,
      pendenteUpload: true,
    };
    setPublicacoes((prev) => (novo.fixado ? [novo, ...prev] : [...prev, novo]));
  };

  const atualizarPublicacaoLocal = (atualizada: PublicacaoSetupItem) => {
    setPublicacoes((prev) => prev.map((p) => (p.id === atualizada.id ? atualizada : p)));
  };

  const toggleFixarPublicacao = (id: string) => {
    setPublicacoes((prev) => prev.map((p) => (p.id === id ? { ...p, fixado: !p.fixado } : p)));
  };

  const removerPublicacao = (id: string) => {
    const alvo = publicacoes.find((p) => p.id === id);
    if (alvo && !alvo.pendenteUpload) {
      setPublicacoesRemoverIds((prev) => [...prev, id]);
    }
    setPublicacoes((prev) => prev.filter((p) => p.id !== id));
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
      Alert.alert("Ação Bloqueada", "Você possui alunos ativos neste serviço no momento.");
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

      let capaFinalUrl = capaUrl;
      if (capaBase64) {
        capaFinalUrl = await uploadImagemStorage(user.id, "capa", capaBase64);
        setCapaUrl(capaFinalUrl);
        setCapaBase64(null);
      }

      const destaquesLimpos: DestaqueStoryItem[] = [];
      for (const d of destaques) {
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
      setDestaques(destaquesLimpos);

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
        diferenciais: metodoDescricao.trim(),
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
        cor_destaque: corDestaque || "#FF6B00",
        metodo_titulo: metodoTitulo.trim(),
        metodo_descricao: metodoDescricao.trim(),
        diferenciais_lista: diferenciaisLista,
        destaques: destaquesLimpos,
        formacoes,
        depoimentos_fixados: depoimentosFixados,
      };

      let generoDB = "outro";
      if (genero === "Masculino") generoDB = "homem";
      if (genero === "Feminino") generoDB = "mulher";

      const { error: errPersonal } = await supabase.from("personals").upsert({
        id: user.id,
        email: user.email,
        nome: nome.trim(),
        cref: cref.trim().toUpperCase(),
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
        headline: headline.trim() || null,
        descricao: bio.trim(),
        foto_url: fotoFinalUrl,
        instagram: instagram.trim().replace(/^@/, ""),
        tiktok: tiktok.trim().replace(/^@/, ""),
        especialidades: especialidadesEstruturadas,
        vitrine_config: vitrineConfig,
        ativo: true,
      });

      if (errPersonal) throw errPersonal;

      if (publicacoesRemoverIds.length > 0) {
        await supabase
          .from("personal_publicacoes")
          .delete()
          .in("id", publicacoesRemoverIds)
          .eq("personal_id", user.id);
        setPublicacoesRemoverIds([]);
      }

      for (const pub of publicacoes) {
        if (pub.pendenteUpload && pub.base64) {
          const urlPublica = await uploadImagemStorage(user.id, "feed", pub.base64);
          await supabase.from("personal_publicacoes").insert([
            {
              personal_id: user.id,
              imagem_url: urlPublica,
              categoria: pub.categoria,
              titulo: pub.titulo || null,
              legenda: pub.legenda || null,
              metrica_destaque: pub.metrica_destaque || null,
              fixado: pub.fixado,
            },
          ]);
        } else if (!pub.pendenteUpload) {
          await supabase
            .from("personal_publicacoes")
            .update({
              categoria: pub.categoria,
              titulo: pub.titulo || null,
              legenda: pub.legenda || null,
              metrica_destaque: pub.metrica_destaque || null,
              fixado: pub.fixado,
            })
            .eq("id", pub.id)
            .eq("personal_id", user.id);
        }
      }

      const { data: pubsAtualizadas } = await supabase
        .from("personal_publicacoes")
        .select("*")
        .eq("personal_id", user.id)
        .order("fixado", { ascending: false })
        .order("criado_em", { ascending: false });

      if (Array.isArray(pubsAtualizadas)) {
        setPublicacoes(
          pubsAtualizadas.map((p: any) => ({
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

      Alert.alert(
        "Perfil e Vitrine salvos!",
        "Sua paleta, destaques e fotos já estão publicados e visíveis para os alunos.",
        [
          {
            text: "Ir para o Painel",
            style: "cancel",
            onPress: () => (isEditing ? navigation.goBack() : navigation.replace("PersonalDashboard")),
          },
          {
            text: "Ver Minha Vitrine",
            onPress: () =>
              navigation.navigate("PersonalPublicProfile", {
                id: user.id,
                personalId: user.id,
                fromDashboard: true,
              }),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Erro ao salvar", err?.message || "Não foi possível salvar seu perfil agora.");
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
      inputFocado,
      nome,
      fotoUri,
      cref,
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
      corDestaque,
      capaUrl,
      headline,
      bio,
      metodoTitulo,
      metodoDescricao,
      diferenciaisLista,
      destaques,
      formacoes,
      avaliacoes,
      depoimentosFixados,
      publicacoes,
    },
    actions: {
      proximoPasso,
      passoAnterior,
      irParaPasso,
      setInputFocado,
      setNome,
      setCref,
      setTelefone,
      setGenero,
      setInstagram,
      setTiktok,
      obterLocalizacaoAtual,
      selecionarFotoPrincipal,
      selecionarFotoCapa,
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
      setCorDestaque,
      setHeadline,
      setBio,
      setMetodoTitulo,
      setMetodoDescricao,
      adicionarDiferencial,
      removerDiferencial,
      adicionarDestaque,
      editarDestaque,
      removerDestaque,
      adicionarFormacao,
      removerFormacao,
      toggleFixarDepoimento,
      adicionarPublicacaoLocal,
      atualizarPublicacaoLocal,
      toggleFixarPublicacao,
      removerPublicacao,
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