import { decode } from "base64-arraybuffer";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

export const BUCKET_CONTRATOS = "contratos-documentos";
export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; 

export interface DocumentoContratoAnexo {
  storagePath: string;
  nomeArquivo: string;
  mimeType: string;
  tamanhoBytes: number;
}

export interface ResultadoAnaliseIA {
  texto_organizado: string;
  resumo_extraido?: Record<string, string | null>;
  pontos_atencao: string[];
  sugestoes_opcionais: string[];
  aviso_legal: string;
}

function lerUriComoArrayBuffer(uri: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.response) {
        resolve(xhr.response);
      } else {
        reject(new Error("Não foi possível ler o arquivo selecionado."));
      }
    };
    xhr.onerror = () => reject(new Error("Falha ao carregar o arquivo do dispositivo."));
    xhr.responseType = "arraybuffer";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

function normalizarNomeArquivo(nome: string, extensaoPadrao: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  return base || `contrato.${extensaoPadrao}`;
}

export async function uploadDocumentoContrato(params: {
  uri: string;
  nomeArquivo?: string | null;
  mimeType?: string | null;
  tamanhoBytes?: number | null;
  base64?: string | null;
}): Promise<DocumentoContratoAnexo> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const mime = (params.mimeType || "").toLowerCase();
  const isPdf = mime === "application/pdf" || (params.nomeArquivo || "").toLowerCase().endsWith(".pdf");
  const isImage =
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/png" ||
    mime === "image/webp" ||
    /\.(jpe?g|png|webp)$/i.test(params.nomeArquivo || params.uri);

  if (!isPdf && !isImage) {
    throw new Error("Formato inválido. Selecione um arquivo PDF ou imagem (JPG, PNG ou WEBP).");
  }

  const mimeFinal = isPdf
    ? "application/pdf"
    : mime === "image/png"
      ? "image/png"
      : mime === "image/webp"
        ? "image/webp"
        : "image/jpeg";

  const ext = isPdf ? "pdf" : mimeFinal === "image/png" ? "png" : mimeFinal === "image/webp" ? "webp" : "jpg";
  const limite = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;

  if (params.tamanhoBytes && params.tamanhoBytes > limite) {
    throw new Error(
      isPdf
        ? "O PDF excede o limite máximo de 10 MB."
        : "A imagem excede o limite máximo de 5 MB."
    );
  }

  const buffer = params.base64 ? decode(params.base64) : await lerUriComoArrayBuffer(params.uri);

  if (!buffer || buffer.byteLength === 0) {
    throw new Error("O arquivo selecionado está vazio ou corrompido.");
  }

  if (buffer.byteLength > limite) {
    throw new Error(
      isPdf
        ? "O PDF excede o limite máximo de 10 MB."
        : "A imagem excede o limite máximo de 5 MB."
    );
  }

  const nomeSeguro = normalizarNomeArquivo(params.nomeArquivo || `contrato_${Date.now()}.${ext}`, ext);
  const storagePath = `${user.id}/${Date.now()}_${nomeSeguro}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_CONTRATOS)
    .upload(storagePath, buffer, {
      contentType: mimeFinal,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Falha ao salvar documento no armazenamento seguro: ${uploadError.message}`);
  }

  return {
    storagePath,
    nomeArquivo: params.nomeArquivo || nomeSeguro,
    mimeType: mimeFinal,
    tamanhoBytes: buffer.byteLength,
  };
}

export async function removerDocumentoContrato(storagePath: string): Promise<void> {
  if (!storagePath) return;
  await supabase.storage.from(BUCKET_CONTRATOS).remove([storagePath]);
}

export async function analisarDocumentoComIA(anexo: DocumentoContratoAnexo): Promise<ResultadoAnaliseIA> {
  const { data, error } = await supabase.functions.invoke("analisar-contrato-ia", {
    body: {
      modo: "documento",
      storage_path: anexo.storagePath,
      mime_type: anexo.mimeType,
    },
  });

  if (error) {
    throw new Error(error.message || "Falha ao chamar o serviço de análise por IA.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.texto_organizado) {
    throw new Error("A IA não conseguiu extrair cláusulas legíveis deste documento.");
  }

  return data as ResultadoAnaliseIA;
}

export async function organizarTextoContratoComIA(texto: string): Promise<ResultadoAnaliseIA> {
  const { data, error } = await supabase.functions.invoke("analisar-contrato-ia", {
    body: {
      modo: "texto",
      texto,
    },
  });

  if (error) {
    throw new Error(error.message || "Falha ao chamar o serviço de organização por IA.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.texto_organizado) {
    throw new Error("A IA não retornou texto organizado.");
  }

  return data as ResultadoAnaliseIA;
}

export async function abrirDocumentoContrato(storagePath: string): Promise<void> {
  if (!storagePath) throw new Error("Documento não encontrado.");

  const { data, error } = await supabase.storage
    .from(BUCKET_CONTRATOS)
    .createSignedUrl(storagePath, 120); // 

  if (error || !data?.signedUrl) {
    throw new Error("Não foi possível gerar o acesso seguro ao documento.");
  }

  await WebBrowser.openBrowserAsync(data.signedUrl);
}