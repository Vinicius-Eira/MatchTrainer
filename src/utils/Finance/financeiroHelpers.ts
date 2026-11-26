import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "@/src/services/supabase";

export interface AlunoData {
  id: string;
  aluno_id: string;
  nome: string;
  foto: string;
  telefone?: string;
}

export interface Fatura {
  id: string;
  plano_id: string;
  conexao_id: string | null;
  aluno_id?: string | null;
  personal_id?: string | null;
  valor: number;
  valor_pago?: number;
  valor_cobrado: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status: string;
  detalheStatus: string;
  forma_pagamento?: string;
  modalidadeUi: string;
  isHibrido: boolean;
  servicos_array: string[];
  dataExibicao: string;
  nome: string;
  foto: string;
  telefone: string;
  data_completa: Date;
  aluno_dados: any;
  acesso_bloqueado: boolean;
  isVirtual?: boolean;
}

export const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDDMMYYYY = (date: Date | null) => {
  if (!date) return "--/--/----";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export function comTimeout<T>(promise: Promise<T>, ms: number, mensagemErro: string): Promise<T> {
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

const escaparHtml = (str: string) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const extrairServicos = (plano: any): string[] => {
  if (Array.isArray(plano.servicos_inclusos)) return plano.servicos_inclusos;
  if (typeof plano.servicos_inclusos === "string") {
    try {
      const parsed = JSON.parse(plano.servicos_inclusos);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

export const calcularStatusVisual = (
  statusBanco: string,
  dataVencStr: string,
  planoStatus: string,
  hojeMid: Date,
  dataCongelamento?: string | null,
  dataRetornoPrevisto?: string | null
) => {
  const dateObj = new Date(`${dataVencStr}T12:00:00Z`);
  const dataFormatada = `${String(dateObj.getUTCDate()).padStart(2, "0")}/${String(
    dateObj.getUTCMonth() + 1
  ).padStart(2, "0")}`;

  let statusUi = statusBanco || "pendente";
  let detalheStatus = "";

  let estaNoPeriodoCongelado = false;
  if (planoStatus === "congelado" && statusUi !== "pago") {
    const iniCong = dataCongelamento ? String(dataCongelamento).split("T")[0] : null;
    const fimCong = dataRetornoPrevisto ? String(dataRetornoPrevisto).split("T")[0] : null;
    if (iniCong && fimCong) {
      estaNoPeriodoCongelado = dataVencStr >= iniCong && dataVencStr <= fimCong;
    } else if (fimCong) {
      estaNoPeriodoCongelado = dataVencStr <= fimCong;
    } else {
      estaNoPeriodoCongelado = true;
    }
  }

  if (estaNoPeriodoCongelado) {
    statusUi = "congelada";
    if (dataRetornoPrevisto) {
      const retObj = new Date(`${String(dataRetornoPrevisto).split("T")[0]}T12:00:00Z`);
      const retFmt = `${String(retObj.getUTCDate()).padStart(2, "0")}/${String(retObj.getUTCMonth() + 1).padStart(2, "0")}`;
      detalheStatus = `Congelado até ${retFmt}`;
    } else {
      detalheStatus = "Plano Congelado";
    }
  } else if (statusUi === "pendente" || statusUi === "atrasado") {
    const dataVencimentoMid = new Date(`${dataVencStr}T12:00:00`);
    const diasDiferenca = Math.ceil((dataVencimentoMid.getTime() - hojeMid.getTime()) / (1000 * 60 * 60 * 24));

    if (diasDiferenca < 0) {
      statusUi = "atrasado";
      const diasAtraso = Math.abs(diasDiferenca);
      detalheStatus = `${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"} de atraso`;
    } else if (diasDiferenca === 0) {
      statusUi = "proximo";
      detalheStatus = "Vence hoje";
    } else if (diasDiferenca <= 5) {
      statusUi = "proximo";
      detalheStatus = `Vence em ${diasDiferenca} ${diasDiferenca === 1 ? "dia" : "dias"}`;
    } else {
      statusUi = "pendente";
      detalheStatus = `Venc: ${dataFormatada}`;
    }
  } else if (statusUi === "pago") {
    detalheStatus = "Pago";
  } else if (["agendada", "cancelada", "congelada", "isenta"].includes(statusUi)) {
    detalheStatus = statusUi.charAt(0).toUpperCase() + statusUi.slice(1);
  }

  return { statusUi, detalheStatus, dataFormatada, dateObj };
};

export async function buscarFaturasNoPeriodo(
  personalId: string,
  inicio: Date,
  fim: Date,
  incluirPagasNoPeriodo = false
) {
  const { data: planosData, error: errPlanos } = await supabase
    .from("planos")
    .select("*")
    .eq("personal_id", personalId);

  if (errPlanos) throw errPlanos;

  const planos = planosData || [];
  if (planos.length === 0) {
    return { faturasMapeadas: [] as Fatura[], alunosLista: [] as AlunoData[] };
  }

  const hojeStr = formatYYYYMMDD(new Date());

  const planosExpiradosIds = planos
    .filter(
      (p: any) =>
        p.status === "congelado" &&
        p.data_retorno_previsto &&
        String(p.data_retorno_previsto).split("T")[0] < hojeStr
    )
    .map((p: any) => p.id);

  if (planosExpiradosIds.length > 0) {
    await supabase.from("planos").update({ status: "ativo" }).in("id", planosExpiradosIds);
    planos.forEach((p: any) => {
      if (planosExpiradosIds.includes(p.id)) p.status = "ativo";
    });
  }

  const planoIds = planos.map((p: any) => p.id);
  const alunoIds = Array.from(new Set(planos.map((p: any) => p.aluno_id).filter(Boolean)));
  const conexaoIds = Array.from(new Set(planos.map((p: any) => p.conexao_id).filter(Boolean)));

  const inicioStr = formatYYYYMMDD(inicio);
  const fimStr = formatYYYYMMDD(fim);

  const selectMensalidades =
    "id, valor_cobrado, valor_pago, data_vencimento, data_pagamento, status, tipo_receita, categoria_avulsa, forma_pagamento, observacoes, plano_id";

  const [reqVenc, reqPag, reqUsuarios, reqConexoes] = await Promise.all([
    supabase
      .from("mensalidades")
      .select(selectMensalidades)
      .in("plano_id", planoIds)
      .gte("data_vencimento", inicioStr)
      .lte("data_vencimento", fimStr)
      .order("data_vencimento", { ascending: true }),
    incluirPagasNoPeriodo
      ? supabase
          .from("mensalidades")
          .select(selectMensalidades)
          .in("plano_id", planoIds)
          .gte("data_pagamento", inicioStr)
          .lte("data_pagamento", fimStr)
          .order("data_pagamento", { ascending: true })
      : Promise.resolve({ data: [] as any[], error: null }),
    alunoIds.length > 0
      ? supabase.from("usuarios").select("id, nome, foto_url, telefone").in("id", alunoIds)
      : Promise.resolve({ data: [] as any[], error: null }),
    conexaoIds.length > 0
      ? supabase.from("conexoes").select("id, status").in("id", conexaoIds)
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);

  if (reqVenc.error) {
    console.log("[Recebimentos] Aviso ao ler mensalidades:", reqVenc.error.message);
  }

  const faturasUnicasMap = new Map<string, any>();
  (reqVenc.data || []).forEach((f: any) => faturasUnicasMap.set(f.id, f));
  (reqPag.data || []).forEach((f: any) => faturasUnicasMap.set(f.id, f));
  const faturasRaw = Array.from(faturasUnicasMap.values());

  const conexoesInativas = new Set<string>(
    (reqConexoes.data || [])
      .filter((c: any) => ["inativo", "recusado"].includes(c.status))
      .map((c: any) => c.id)
  );

  const planosMap = new Map<string, any>();
  planos.forEach((p: any) => planosMap.set(p.id, p));

  const usuariosMap = new Map<string, any>();
  (reqUsuarios.data || []).forEach((u: any) => usuariosMap.set(u.id, u));

  const alunosMap = new Map<string, AlunoData>();
  planos.forEach((p: any) => {
    const connInativa = p.conexao_id && conexoesInativas.has(p.conexao_id);
    if (p.status === "ativo" && !connInativa) {
      const u = usuariosMap.get(p.aluno_id) || {};
      alunosMap.set(p.id, {
        id: p.id,
        aluno_id: p.aluno_id,
        nome: u.nome || "Aluno",
        foto: u.foto_url || "",
        telefone: u.telefone || "",
      });
    }
  });

  const hojeMid = new Date();
  hojeMid.setHours(12, 0, 0, 0);

  const chavesFaturasReais = new Set<string>();

  const faturasReais: Fatura[] = faturasRaw
    .filter((fat: any) => {
      if (fat.tipo_receita === "avulsa") return false;
      const plano = planosMap.get(fat.plano_id);
      if (!plano) return false;
      const connInativa = plano.conexao_id && conexoesInativas.has(plano.conexao_id);
      const planoEncerrado = plano.status === "cancelado" || connInativa;
      if (planoEncerrado && fat.status !== "pago") return false;
      if (fat.status === "cancelada") return false;
      return true;
    })
    .map((fat: any) => {
      chavesFaturasReais.add(`${fat.plano_id}-${String(fat.data_vencimento).slice(0, 7)}`);

      const plano = planosMap.get(fat.plano_id) || {};
      const aluno = usuariosMap.get(plano.aluno_id) || {};
      const valor = Number(fat.valor_cobrado) || Number(plano.valor_mensal) || 0;

      const servicos = extrairServicos(plano);
      let categoriaUi = plano.modalidade || "Consultoria";
      let isHibrido = false;
      if (servicos.length > 1) {
        categoriaUi = "Híbrido";
        isHibrido = true;
      } else if (servicos.length === 1) {
        categoriaUi = servicos[0];
      }

      const { statusUi, detalheStatus, dataFormatada, dateObj } = calcularStatusVisual(
        fat.status || "pendente",
        fat.data_vencimento,
        plano.status,
        hojeMid,
        plano.data_congelamento,
        plano.data_retorno_previsto
      );

      return {
        ...fat,
        conexao_id: plano.conexao_id || null,
        aluno_id: plano.aluno_id || null,
        personal_id: plano.personal_id || personalId,
        nome: aluno.nome || "Aluno",
        foto: aluno.foto_url || "",
        telefone: aluno.telefone || "",
        servicos_array: servicos,
        modalidadeUi: categoriaUi,
        isHibrido,
        valor,
        status: statusUi,
        detalheStatus,
        dataExibicao: dataFormatada,
        data_completa: dateObj,
        aluno_dados: { id: plano.aluno_id, ...aluno },
        acesso_bloqueado: Boolean(plano.acesso_bloqueado),
        isVirtual: false,
      };
    });

  const faturasFallback: Fatura[] = [];
  const cursorMes = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const limiteMes = new Date(fim.getFullYear(), fim.getMonth(), 1);

  while (cursorMes <= limiteMes) {
    const anoMes = cursorMes.getFullYear();
    const numMes = cursorMes.getMonth();
    const ultimoDiaMes = new Date(anoMes, numMes + 1, 0).getDate();
    const chaveMesStr = `${anoMes}-${String(numMes + 1).padStart(2, "0")}`;

    planos.forEach((plano: any) => {
      if (chavesFaturasReais.has(`${plano.id}-${chaveMesStr}`)) return;
      if (!["ativo", "congelado"].includes(plano.status) || !plano.valor_mensal) return;
      if (plano.conexao_id && conexoesInativas.has(plano.conexao_id)) return;

      const diaVenc = Math.min(Math.max(Number(plano.dia_vencimento) || 10, 1), ultimoDiaMes);
      const dataVencFallback = new Date(anoMes, numMes, diaVenc, 12, 0, 0);

      if (dataVencFallback < inicio || dataVencFallback > fim) return;

      const dataInicioRaw = plano.aceito_em || plano.data_inicio || plano.created_at;
      if (dataInicioRaw) {
        const inicioStrPlano = String(dataInicioRaw).split("T")[0];
        const inicioPlanoDate = new Date(`${inicioStrPlano}T00:00:00`);
        if (dataVencFallback < inicioPlanoDate) return;
      }

      const dataVencStr = formatYYYYMMDD(dataVencFallback);
      const aluno = usuariosMap.get(plano.aluno_id) || {};
      const valor = Number(plano.valor_mensal) || 0;

      const servicos = extrairServicos(plano);
      let categoriaUi = plano.modalidade || "Consultoria";
      let isHibrido = false;
      if (servicos.length > 1) {
        categoriaUi = "Híbrido";
        isHibrido = true;
      } else if (servicos.length === 1) {
        categoriaUi = servicos[0];
      }

      const { statusUi, detalheStatus, dataFormatada, dateObj } = calcularStatusVisual(
        "pendente",
        dataVencStr,
        plano.status,
        hojeMid,
        plano.data_congelamento,
        plano.data_retorno_previsto
      );

      faturasFallback.push({
        id: `virtual-${plano.id}-${dataVencStr}`,
        plano_id: plano.id,
        conexao_id: plano.conexao_id || null,
        aluno_id: plano.aluno_id || null,
        personal_id: plano.personal_id || personalId,
        valor,
        valor_cobrado: valor,
        valor_pago: 0,
        data_vencimento: dataVencStr,
        status: statusUi,
        detalheStatus,
        forma_pagamento: plano.forma_pagamento || "PIX",
        modalidadeUi: categoriaUi,
        isHibrido,
        servicos_array: servicos,
        dataExibicao: dataFormatada,
        nome: aluno.nome || "Aluno",
        foto: aluno.foto_url || "",
        telefone: aluno.telefone || "",
        data_completa: dateObj,
        aluno_dados: { id: plano.aluno_id, ...aluno },
        acesso_bloqueado: Boolean(plano.acesso_bloqueado),
        isVirtual: true,
      });
    });

    cursorMes.setMonth(cursorMes.getMonth() + 1);
  }

  const faturasMapeadas = [...faturasReais, ...faturasFallback].sort(
    (a, b) => a.data_completa.getTime() - b.data_completa.getTime()
  );

  const alunosLista = Array.from(alunosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  return { faturasMapeadas, alunosLista };
}

export async function buscarDadosCompletosFinanceiro(inicio: Date, fim: Date) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;

  try {
    await supabase.rpc("processar_recorrencias_financeiras");
  } catch (rpcErr) {
    console.log("Aviso RPC recorrências:", rpcErr);
  }

  const { data: perfilData } = await supabase
    .from("personals")
    .select("nome, servicos_oferecidos")
    .eq("id", session.user.id)
    .maybeSingle();

  let mods: string[] = [];
  if (perfilData?.servicos_oferecidos) {
    try {
      const parsed =
        typeof perfilData.servicos_oferecidos === "string"
          ? JSON.parse(perfilData.servicos_oferecidos)
          : perfilData.servicos_oferecidos;
      if (Array.isArray(parsed)) mods = parsed;
    } catch {}
  }

  const { faturasMapeadas, alunosLista } = await buscarFaturasNoPeriodo(session.user.id, inicio, fim, false);

  return {
    nomePersonal: perfilData?.nome || null,
    mods,
    faturasMapeadas,
    alunosLista,
  };
}

async function renomearPdfNoCache(uriOriginal: string, nomeArquivo: string): Promise<string> {
  try {
    const fsAny = FileSystem as any;

    if (fsAny?.File && fsAny?.Paths?.cache) {
      const origem = new fsAny.File(uriOriginal);
      const destino = new fsAny.File(fsAny.Paths.cache, nomeArquivo);
      if (destino.exists) {
        destino.delete();
      }
      origem.copy(destino);
      if (destino.uri) return destino.uri;
    }

    if (fsAny?.cacheDirectory && typeof fsAny?.copyAsync === "function") {
      const destinoUri = `${fsAny.cacheDirectory}${nomeArquivo}`;
      await fsAny.copyAsync({ from: uriOriginal, to: destinoUri });
      return destinoUri;
    }
  } catch (err) {
    console.log("[PDF] Aviso ao renomear arquivo (usando URI original):", err);
  }
  return uriOriginal;
}

export async function gerarECompartilharPdfExtrato(params: {
  nomePersonal: string;
  inicioExport: Date;
  fimExport: Date;
  faturas: Fatura[];
  onProgresso?: (texto: string) => void;
  onAntesDeAbrirShare?: () => void;
}): Promise<{ nomeArquivo: string; uri: string }> {
  const { nomePersonal, inicioExport, fimExport, faturas, onProgresso, onAntesDeAbrirShare } = params;

  onProgresso?.("Montando extrato financeiro...");
  console.log(`[PDF 1/5] Montando HTML com ${faturas.length} lançamento(s)...`);

  const somaRecebido = faturas
    .filter((f) => f.status === "pago")
    .reduce((acc, c) => acc + (Number(c.valor_pago) || c.valor), 0);
  const somaPendente = faturas
    .filter((f) => ["pendente", "proximo", "agendada"].includes(f.status))
    .reduce((acc, c) => acc + c.valor, 0);
  const somaAtrasado = faturas
    .filter((f) => f.status === "atrasado")
    .reduce((acc, c) => acc + c.valor, 0);
  const somaTotal = somaRecebido + somaPendente + somaAtrasado;

  const iniFmt = formatDDMMYYYY(inicioExport);
  const fimFmt = formatDDMMYYYY(fimExport);
  const labelPeriodo = iniFmt === fimFmt ? iniFmt : `${iniFmt} até ${fimFmt}`;
  const slugPeriodo =
    iniFmt === fimFmt
      ? formatYYYYMMDD(inicioExport)
      : `${formatYYYYMMDD(inicioExport)}_a_${formatYYYYMMDD(fimExport)}`;
  const nomeArquivo = `Extrato_MatchTrainer_${slugPeriodo}.pdf`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page { margin: 24px; }
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 12px; color: #1F2937; margin: 0; }
          .header { border-bottom: 3px solid #FF6B00; padding-bottom: 14px; margin-bottom: 22px; }
          .title { margin: 0; color: #111827; font-size: 21px; }
          .meta { margin: 6px 0 0; color: #6B7280; font-size: 12.5px; }
          .kpi-table { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin: 0 -8px 22px; }
          .kpi-cell { width: 33.33%; padding: 12px; border-radius: 8px; vertical-align: top; }
          .kpi-rec { background: #ECFDF5; border: 1px solid #A7F3D0; }
          .kpi-pen { background: #FFFBEB; border: 1px solid #FDE68A; }
          .kpi-atr { background: #FEF2F2; border: 1px solid #FECACA; }
          .kpi-lbl { font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }
          .kpi-val { font-size: 16px; font-weight: bold; margin-top: 5px; }
          .data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .data-table th { background-color: #111827; color: #FFFFFF; text-align: left; padding: 9px 10px; }
          .data-table td { padding: 9px 10px; border-bottom: 1px solid #E5E7EB; }
          .total-row { margin-top: 22px; text-align: right; font-size: 15.5px; font-weight: bold; color: #111827; }
          .footer { margin-top: 26px; font-size: 10.5px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Extrato Financeiro — MatchTrainer</h1>
          <p class="meta">
            <strong>Personal:</strong> ${escaparHtml(nomePersonal)} &nbsp;|&nbsp;
            <strong>Período:</strong> ${escaparHtml(labelPeriodo)}
          </p>
        </div>

        <table class="kpi-table">
          <tr>
            <td class="kpi-cell kpi-rec">
              <div class="kpi-lbl" style="color:#065F46;">RECEBIDO</div>
              <div class="kpi-val" style="color:#059669;">R$ ${somaRecebido.toFixed(2).replace(".", ",")}</div>
            </td>
            <td class="kpi-cell kpi-pen">
              <div class="kpi-lbl" style="color:#92400E;">A RECEBER</div>
              <div class="kpi-val" style="color:#D97706;">R$ ${somaPendente.toFixed(2).replace(".", ",")}</div>
            </td>
            <td class="kpi-cell kpi-atr">
              <div class="kpi-lbl" style="color:#991B1B;">EM ATRASO</div>
              <div class="kpi-val" style="color:#DC2626;">R$ ${somaAtrasado.toFixed(2).replace(".", ",")}</div>
            </td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Modalidade</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${faturas
              .map(
                (f) => `
              <tr>
                <td style="font-weight:bold;">${escaparHtml(f.nome)}${f.acesso_bloqueado ? " (Bloqueado)" : ""}</td>
                <td>${escaparHtml(f.modalidadeUi)}</td>
                <td>${escaparHtml(f.dataExibicao)}</td>
                <td>${escaparHtml(f.detalheStatus)}</td>
                <td style="text-align:right;font-weight:bold;">R$ ${f.valor.toFixed(2).replace(".", ",")}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-row">Total do Período: R$ ${somaTotal.toFixed(2).replace(".", ",")}</div>
        <div class="footer">Gerado em ${new Date().toLocaleString("pt-BR")} via MatchTrainer</div>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    onAntesDeAbrirShare?.();
    await Print.printAsync({ html: htmlContent });
    return { nomeArquivo, uri: "web-print" };
  }

  onProgresso?.("Renderizando documento PDF...");
  console.log("[PDF 2/5] Chamando Print.printToFileAsync...");

  const resultadoPrint = await comTimeout(
    Print.printToFileAsync({ html: htmlContent }),
    20000,
    "Tempo esgotado ao gerar o PDF neste aparelho. Tente novamente."
  );

  if (!resultadoPrint?.uri) {
    throw new Error("Não foi possível criar o arquivo PDF no dispositivo.");
  }

  onProgresso?.("Preparando arquivo para salvar...");
  console.log("[PDF 3/5] PDF gerado em:", resultadoPrint.uri);

  const uriFinal = await renomearPdfNoCache(resultadoPrint.uri, nomeArquivo);
  console.log("[PDF 4/5] URI final:", uriFinal);

  onAntesDeAbrirShare?.();
  await new Promise((resolve) => setTimeout(resolve, 180));

  const podeCompartilhar = await Sharing.isAvailableAsync();
  console.log("[PDF 5/5] Abrindo opções nativas (Sharing disponível:", podeCompartilhar, ")");

  if (podeCompartilhar) {
    await Sharing.shareAsync(uriFinal, {
      UTI: "com.adobe.pdf",
      mimeType: "application/pdf",
      dialogTitle: "Salvar ou Compartilhar Extrato PDF",
    });
  } else {
    await Print.printAsync({ uri: uriFinal });
  }

  return { nomeArquivo, uri: uriFinal };
}