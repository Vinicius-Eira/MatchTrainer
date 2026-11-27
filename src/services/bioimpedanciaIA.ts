import { decode } from "base64-arraybuffer";
import { AnaliseSegmentar, NivelConfiancaCampo, OrigemLeitura } from "../domain/avaliacaoFisica/types";
import { supabase } from "./supabase";

export const BUCKET_BIOIMPEDANCIA = "bioimpedancia-documentos";
export const MAX_BIO_BYTES = 8 * 1024 * 1024;

export interface IndicadoresExtraidosIA {
  peso?: number | null;
  percentual_gordura?: number | null;
  massa_muscular_esqueletica?: number | null;
  massa_magra?: number | null;
  massa_de_gordura?: number | null;
  agua_corporal?: number | null;
  gordura_visceral?: number | null;
  taxa_metabolica_basal?: number | null;
  imc?: number | null;
  rcq?: number | null;
  proteina_kg?: number | null;
  minerais_kg?: number | null;
  pontuacao_equipamento?: number | null;
}

export interface ResultadoExtracaoBioIA {
  eh_bioimpedancia: boolean;
  motivo_invalido?: string | null;
  fabricante?: string | null;
  data_exame?: string | null;
  confianca_geral: number;
  indicadores: IndicadoresExtraidosIA;
  segmentar: AnaliseSegmentar;
  confianca_campos: Record<string, NivelConfiancaCampo>;
  valores_originais: Record<string, string | number | null>;
  avisos: string[];
  campos_nao_reconhecidos: string[];
  storage_path: string;
  mime_type: string;
  origem_leitura: OrigemLeitura;
  uri_local: string;
  nome_arquivo: string;
}

function comTimeout<T>(promise: Promise<T>, ms: number, mensagemErro: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(mensagemErro)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function lerUriComoArrayBuffer(uri: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.response) resolve(xhr.response);
      else reject(new Error("Não foi possível ler o arquivo selecionado."));
    };
    xhr.onerror = () => reject(new Error("Falha ao acessar o arquivo no aparelho."));
    xhr.responseType = "arraybuffer";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

export async function enviarEAnalisarBioimpedanciaIA(params: {
  conexaoId: string;
  uri: string;
  nomeArquivo?: string | null;
  mimeType?: string | null;
  tamanhoBytes?: number | null;
  base64?: string | null;
  onProgresso?: (etapa: string) => void;
}): Promise<ResultadoExtracaoBioIA> {
  const { conexaoId, uri, nomeArquivo, mimeType, tamanhoBytes, base64, onProgresso } = params;

  onProgresso?.("Validando arquivo selecionado...");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const mime = (mimeType || "").toLowerCase();
  const nomeLimpo = nomeArquivo || `bio_${Date.now()}`;
  const isPdf = mime === "application/pdf" || nomeLimpo.toLowerCase().endsWith(".pdf");

  const mimeFinal = isPdf
    ? "application/pdf"
    : mime === "image/png"
      ? "image/png"
      : mime === "image/webp"
        ? "image/webp"
        : "image/jpeg";

  const ext = isPdf ? "pdf" : mimeFinal === "image/png" ? "png" : mimeFinal === "image/webp" ? "webp" : "jpg";

  if (tamanhoBytes && tamanhoBytes > MAX_BIO_BYTES) {
    throw new Error("O arquivo excede o limite de 8 MB. Envie uma imagem ou PDF mais leve.");
  }

  const buffer = base64 ? decode(base64) : await lerUriComoArrayBuffer(uri);
  if (!buffer || buffer.byteLength === 0) {
    throw new Error("O arquivo selecionado está vazio ou corrompido.");
  }
  if (buffer.byteLength > MAX_BIO_BYTES) {
    throw new Error("O arquivo excede o limite de 8 MB.");
  }

  onProgresso?.("Enviando documento para armazenamento privado...");
  const storagePath = `${conexaoId}/bio_${Date.now()}.${ext}`;

  const { error: upErr } = await comTimeout(
    supabase.storage.from(BUCKET_BIOIMPEDANCIA).upload(storagePath, buffer, {
      contentType: mimeFinal,
      upsert: false,
    }),
    20000,
    "Tempo esgotado ao enviar o documento. Verifique sua conexão."
  );

  if (upErr) {
    throw new Error(`Falha ao enviar arquivo: ${upErr.message}`);
  }

  console.log("[BioIA] Upload concluído:", storagePath, "| chamando ler-bioimpedancia...");
  onProgresso?.("Lendo indicadores com IA (pode levar alguns segundos)...");

  const { data, error } = await comTimeout(
    supabase.functions.invoke("ler-bioimpedancia", {
      body: {
        conexao_id: conexaoId,
        storage_path: storagePath,
        mime_type: mimeFinal,
      },
    }),
    65000,
    "Tempo esgotado na análise do exame. Tente uma foto mais nítida ou preencha manualmente."
  );

  console.log("[BioIA] Retorno Edge Function:", { ok: data?.success, erro: data?.error || error?.message });

  if (error) {
    await removerArquivoBioStorage(storagePath);
    throw new Error(error.message || "Erro ao comunicar com o servidor de leitura IA.");
  }

  if (!data?.success || !data?.data) {
    await removerArquivoBioStorage(storagePath);
    throw new Error(data?.error || data?.erroReal || "Não foi possível extrair os dados deste documento.");
  }

  const extraido = data.data;

  if (!extraido.eh_bioimpedancia) {
    await removerArquivoBioStorage(storagePath);
  }

  return {
    eh_bioimpedancia: Boolean(extraido.eh_bioimpedancia),
    motivo_invalido: extraido.motivo_invalido || null,
    fabricante: extraido.fabricante || null,
    data_exame: extraido.data_exame || null,
    confianca_geral: Number(extraido.confianca_geral) || 0,
    indicadores: extraido.indicadores || {},
    segmentar: extraido.segmentar || {},
    confianca_campos: extraido.confianca_campos || {},
    valores_originais: extraido.valores_originais || {},
    avisos: Array.isArray(extraido.avisos) ? extraido.avisos : [],
    campos_nao_reconhecidos: Array.isArray(extraido.campos_nao_reconhecidos) ? extraido.campos_nao_reconhecidos : [],
    storage_path: storagePath,
    mime_type: mimeFinal,
    origem_leitura: isPdf ? "ia_pdf" : "ia_imagem",
    uri_local: uri,
    nome_arquivo: nomeLimpo,
  };
}

export async function obterUrlAssinadaBio(storagePath: string): Promise<string | null> {
  if (!storagePath) return null;
  const { data, error } = await supabase.storage.from(BUCKET_BIOIMPEDANCIA).createSignedUrl(storagePath, 120);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function removerArquivoBioStorage(storagePath?: string | null): Promise<void> {
  if (!storagePath) return;
  try {
    await supabase.storage.from(BUCKET_BIOIMPEDANCIA).remove([storagePath]);
  } catch (err) {
    console.log("[bioimpedanciaIA] Aviso ao remover arquivo temporário:", err);
  }
}