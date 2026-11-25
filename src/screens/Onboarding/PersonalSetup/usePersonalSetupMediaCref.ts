import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  enviarEVerificarCedulaCref,
  EstadoVerificacaoCref,
  formatarMascaraCref,
  validarFormatoCref,
  verificarDisponibilidadeCref,
} from "../../../services/crefVerificacao";
import { supabase } from "../../../services/supabase";
import { FeedbackModalTipo } from "./components/SetupModals";

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

export async function uploadImagemStorage(
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

export function usePersonalCref(
  nome: string,
  onFeedback: (tipo: FeedbackModalTipo, titulo: string, mensagem: string, kicker?: string) => void
) {
  const [cref, setCref] = useState("");
  const [crefVerificacao, setCrefVerificacao] = useState<EstadoVerificacaoCref>({
    status: "nao_enviado",
    crefVerificado: false,
  });
  const [crefDisponivel, setCrefDisponivel] = useState<boolean | null>(null);
  const [verificandoCrefIA, setVerificandoCrefIA] = useState(false);
  const [modalUploadCrefVisivel, setModalUploadCrefVisivel] = useState(false);

  const handleAlterarCref = (texto: string) => {
    const formatado = formatarMascaraCref(texto);
    setCref(formatado);
    setCrefDisponivel(null);

    const check = validarFormatoCref(formatado);
    if (check.valido) {
      verificarDisponibilidadeCref(check.normalizado).then((disp) => {
        setCrefDisponivel(disp);
      });
    }
  };

  const processarDocumentoCref = async (payload: {
    uri: string;
    nomeArquivo?: string | null;
    mimeType?: string | null;
    tamanhoBytes?: number | null;
    base64?: string | null;
  }) => {
    const check = validarFormatoCref(cref);
    if (!check.valido) {
      onFeedback(
        "error",
        "CREF Inválido",
        check.erro || "Preencha seu CREF no formato oficial 000000-G/UF antes de enviar a cédula.",
        "FORMATO CREF"
      );
      return;
    }

    setVerificandoCrefIA(true);
    try {
      const resultado = await enviarEVerificarCedulaCref({
        ...payload,
        crefInformado: check.normalizado,
        nomeCadastro: nome.trim(),
      });
      setCrefVerificacao(resultado);

      if (resultado.crefVerificado) {
        onFeedback(
          "success",
          "CREF Verificado!",
          resultado.motivo || "Sua cédula foi validada e o selo verde já está ativo no seu perfil.",
          "SELO ATIVADO"
        );
      } else if (resultado.status === "em_analise") {
        onFeedback(
          "warning",
          "Documento em Análise",
          resultado.motivo || "Sua cédula foi recebida e enviada para conferência rápida.",
          "EM ANÁLISE"
        );
      } else {
        onFeedback(
          "error",
          "Cédula Não Validada",
          resultado.motivo ||
            "Não foi possível validar este arquivo. Envie uma foto nítida da cédula oficial do CREF.",
          "AJUSTE NECESSÁRIO"
        );
      }
    } catch (err: any) {
      onFeedback(
        "error",
        "Erro na Verificação",
        err?.message || "Não foi possível analisar o documento agora. Tente novamente em instantes.",
        "FALHA NO ENVIO"
      );
    } finally {
      setVerificandoCrefIA(false);
    }
  };

  const handleCrefCamera = async () => {
    setModalUploadCrefVisivel(false);
    setTimeout(async () => {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        onFeedback("warning", "Permissão Necessária", "Libere o acesso à câmera para fotografar sua cédula.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.78, base64: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        await processarDocumentoCref({
          uri: a.uri,
          nomeArquivo: a.fileName || `cref_${Date.now()}.jpg`,
          mimeType: a.mimeType || "image/jpeg",
          tamanhoBytes: a.fileSize,
          base64: a.base64,
        });
      }
    }, 350);
  };

  const handleCrefGaleria = async () => {
    setModalUploadCrefVisivel(false);
    setTimeout(async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        onFeedback("warning", "Permissão Necessária", "Libere o acesso à galeria para selecionar sua cédula.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.78,
        base64: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        await processarDocumentoCref({
          uri: a.uri,
          nomeArquivo: a.fileName || `cref_${Date.now()}.jpg`,
          mimeType: a.mimeType || "image/jpeg",
          tamanhoBytes: a.fileSize,
          base64: a.base64,
        });
      }
    }, 350);
  };

  const handleCrefPdf = async () => {
    setModalUploadCrefVisivel(false);
    setTimeout(async () => {
      const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        await processarDocumentoCref({
          uri: a.uri,
          nomeArquivo: a.name,
          mimeType: a.mimeType || "application/pdf",
          tamanhoBytes: a.size,
        });
      }
    }, 350);
  };

  return {
    cref,
    setCref,
    crefVerificacao,
    setCrefVerificacao,
    crefDisponivel,
    verificandoCrefIA,
    modalUploadCrefVisivel,
    setModalUploadCrefVisivel,
    handleAlterarCref,
    handleCrefCamera,
    handleCrefGaleria,
    handleCrefPdf,
  };
}

export function usePersonalVitrine(
  onFeedback: (tipo: FeedbackModalTipo, titulo: string, mensagem: string, kicker?: string) => void
) {
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

  const selecionarFotoCapa = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      onFeedback("warning", "Permissão Necessária", "Libere o acesso à galeria para escolher sua foto de capa.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.72,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
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
    const novo: PublicacaoSetupItem = { ...pub, id: `temp-${Date.now()}`, pendenteUpload: true };
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

  const sincronizarPublicacoesNoBanco = async (userId: string) => {
    if (publicacoesRemoverIds.length > 0) {
      await supabase
        .from("personal_publicacoes")
        .delete()
        .in("id", publicacoesRemoverIds)
        .eq("personal_id", userId);
      setPublicacoesRemoverIds([]);
    }

    for (const pub of publicacoes) {
      if (pub.pendenteUpload && pub.base64) {
        const urlPublica = await uploadImagemStorage(userId, "feed", pub.base64);
        await supabase.from("personal_publicacoes").insert([
          {
            personal_id: userId,
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
          .eq("personal_id", userId);
      }
    }

    const { data: pubsAtualizadas } = await supabase
      .from("personal_publicacoes")
      .select("*")
      .eq("personal_id", userId)
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
  };

  return {
    corDestaque,
    setCorDestaque,
    capaUrl,
    setCapaUrl,
    capaBase64,
    setCapaBase64,
    headline,
    setHeadline,
    bio,
    setBio,
    metodoTitulo,
    setMetodoTitulo,
    metodoDescricao,
    setMetodoDescricao,
    diferenciaisLista,
    setDiferenciaisLista,
    destaques,
    setDestaques,
    formacoes,
    setFormacoes,
    avaliacoes,
    setAvaliacoes,
    depoimentosFixados,
    setDepoimentosFixados,
    publicacoes,
    setPublicacoes,
    selecionarFotoCapa,
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
    sincronizarPublicacoesNoBanco,
  };
}