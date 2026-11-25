import { decode } from "base64-arraybuffer";
import { supabase } from "./supabase";

export const BUCKET_CREF = "cref-documentos";
export const MAX_CREF_BYTES = 5 * 1024 * 1024;
export const EXIGIR_CEDULA_CREF_NO_SETUP = false;

export const UFS_BRASIL = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export type StatusVerificacaoCref = "nao_enviado" | "em_analise" | "aprovado" | "rejeitado";

export interface EstadoVerificacaoCref {
  status: StatusVerificacaoCref;
  crefVerificado: boolean;
  motivo?: string | null;
  crefInformado?: string | null;
}


export function formatarMascaraCref(raw: string): string {
  const clean = (raw || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const digitos = clean.replace(/[^0-9]/g, "").slice(0, 6);
  const letras = clean.slice(digitos.length).replace(/[^A-Z]/g, "");

  if (digitos.length < 6) {
    return digitos;
  }

  const categoria = letras.slice(0, 1);
  const uf = letras.slice(1, 3);

  if (!categoria) return digitos;
  if (!uf) return `${digitos}-${categoria}`;
  return `${digitos}-${categoria}/${uf}`;
}

export function validarFormatoCref(cref: string): {
  valido: boolean;
  normalizado: string;
  erro?: string;
} {
  const norm = (cref || "").trim().toUpperCase();
  if (!norm) {
    return { valido: false, normalizado: norm, erro: "Informe seu número do CREF." };
  }

  const match = norm.match(/^(\d{6})-([A-Z])\/([A-Z]{2})$/);
  if (!match) {
    return {
      valido: false,
      normalizado: norm,
      erro: "Use o formato oficial: 000000-G/UF (ex: 012345-G/SP).",
    };
  }

  const [, , categoria, uf] = match;
  if (categoria !== "G" && categoria !== "P") {
    return {
      valido: false,
      normalizado: norm,
      erro: "A categoria deve ser G (Graduado/Bacharel) ou P (Provisionado).",
    };
  }

  if (!UFS_BRASIL.has(uf)) {
    return {
      valido: false,
      normalizado: norm,
      erro: `UF "${uf}" inválida. Informe a sigla do seu estado (ex: SP, RJ, MG).`,
    };
  }

  return { valido: true, normalizado: norm };
}

export async function verificarDisponibilidadeCref(cref: string): Promise<boolean> {
  const { valido, normalizado } = validarFormatoCref(cref);
  if (!valido) return true;

  const { data, error } = await supabase.rpc("verificar_disponibilidade_cref", {
    p_cref: normalizado,
  });

  if (error) return true;
  return Boolean(data);
}

export async function buscarEstadoVerificacaoCref(): Promise<EstadoVerificacaoCref> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "nao_enviado", crefVerificado: false };
  }

  const [{ data: prof }, { data: verif }] = await Promise.all([
    supabase.from("personals").select("cref_verificado, cref").eq("id", user.id).maybeSingle(),
    supabase
      .from("personal_cref_verificacoes")
      .select("status, motivo_recusa, cref_informado")
      .eq("personal_id", user.id)
      .maybeSingle(),
  ]);

  const crefAtual = (prof?.cref || "").trim().toUpperCase();
  const crefVerif = (verif?.cref_informado || "").trim().toUpperCase();

  if (prof?.cref_verificado) {
    return {
      status: "aprovado",
      crefVerificado: true,
      crefInformado: crefAtual,
      motivo: "CREF validado com sucesso.",
    };
  }

  if (verif?.status && (!crefAtual || crefVerif === crefAtual)) {
    return {
      status: verif.status === "aprovado" ? "nao_enviado" : (verif.status as StatusVerificacaoCref),
      crefVerificado: false,
      motivo: verif.status === "aprovado" ? null : verif.motivo_recusa,
      crefInformado: crefVerif,
    };
  }

  return { status: "nao_enviado", crefVerificado: false, crefInformado: crefAtual || null };
}

function lerUriComoArrayBuffer(uri: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.response) resolve(xhr.response);
      else reject(new Error("Não foi possível ler o arquivo selecionado."));
    };
    xhr.onerror = () => reject(new Error("Falha ao ler arquivo do dispositivo."));
    xhr.responseType = "arraybuffer";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
}

export async function enviarEVerificarCedulaCref(params: {
  uri: string;
  nomeArquivo?: string | null;
  mimeType?: string | null;
  tamanhoBytes?: number | null;
  base64?: string | null;
  crefInformado: string;
  nomeCadastro: string;
}): Promise<EstadoVerificacaoCref> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sessão expirada. Faça login novamente.");

  const check = validarFormatoCref(params.crefInformado);
  if (!check.valido) {
    throw new Error(check.erro || "Formato de CREF inválido.");
  }

  const mime = (params.mimeType || "").toLowerCase();
  const isPdf = mime === "application/pdf" || (params.nomeArquivo || "").toLowerCase().endsWith(".pdf");
  const mimeFinal = isPdf
    ? "application/pdf"
    : mime === "image/png"
      ? "image/png"
      : mime === "image/webp"
        ? "image/webp"
        : "image/jpeg";
  const ext = isPdf ? "pdf" : mimeFinal === "image/png" ? "png" : mimeFinal === "image/webp" ? "webp" : "jpg";

  if (params.tamanhoBytes && params.tamanhoBytes > MAX_CREF_BYTES) {
    throw new Error("O arquivo excede o limite de 5 MB.");
  }

  const buffer = params.base64 ? decode(params.base64) : await lerUriComoArrayBuffer(params.uri);
  if (!buffer || buffer.byteLength === 0) {
    throw new Error("Arquivo vazio ou corrompido.");
  }
  if (buffer.byteLength > MAX_CREF_BYTES) {
    throw new Error("O arquivo excede o limite de 5 MB.");
  }

  const storagePath = `${user.id}/cref_${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET_CREF).upload(storagePath, buffer, {
    contentType: mimeFinal,
    upsert: true,
  });

  if (upErr) {
    throw new Error(`Falha ao enviar documento: ${upErr.message}`);
  }

  const { data, error } = await supabase.functions.invoke("verificar-cref-ia", {
    body: {
      storage_path: storagePath,
      mime_type: mimeFinal,
      cref_informado: check.normalizado,
      nome_cadastro: params.nomeCadastro,
    },
  });

  if (error) {
    throw new Error(error.message || "Não foi possível analisar a cédula agora.");
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    status: (data?.status || "em_analise") as StatusVerificacaoCref,
    crefVerificado: Boolean(data?.cref_verificado),
    motivo: data?.motivo || null,
    crefInformado: check.normalizado,
  };
}