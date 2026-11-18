import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useOnboarding } from "../../../../../hooks/useOnboarding";
import { supabase } from "../../../../../services/supabase";
import { MESES_NOME, PdfPreset, StatusFiltro } from "./constants";

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

const formatYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDDMMYYYY = (date: Date | null) => {
  if (!date) return "--/--/----";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const extrairServicos = (plano: any): string[] => {
  if (Array.isArray(plano.servicos_inclusos)) return plano.servicos_inclusos;
  if (typeof plano.servicos_inclusos === "string") {
    try {
      const parsed = JSON.parse(plano.servicos_inclusos);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

const calcularStatusVisual = (statusBanco: string, dataVencStr: string, planoStatus: string, hojeMid: Date) => {
  const dateObj = new Date(`${dataVencStr}T12:00:00Z`);
  const dataFormatada = `${String(dateObj.getUTCDate()).padStart(2, "0")}/${String(dateObj.getUTCMonth() + 1).padStart(2, "0")}`;

  let statusUi = statusBanco || "pendente";
  let detalheStatus = "";

  if (planoStatus === "congelado" && statusUi !== "pago") {
    statusUi = "congelada";
    detalheStatus = "Plano Congelado";
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

async function buscarFaturasNoPeriodo(personalId: string, inicio: Date, fim: Date) {
  const { data: planosData, error: errPlanos } = await supabase
    .from("planos")
    .select("*")
    .eq("personal_id", personalId);

  if (errPlanos) throw errPlanos;

  const planos = planosData || [];
  if (planos.length === 0) {
    return { faturasMapeadas: [] as Fatura[], alunosLista: [] as AlunoData[] };
  }

  const planoIds = planos.map((p: any) => p.id);
  const alunoIds = Array.from(new Set(planos.map((p: any) => p.aluno_id).filter(Boolean)));

  const inicioStr = formatYYYYMMDD(inicio);
  const fimStr = formatYYYYMMDD(fim);

  const [{ data: faturasRaw, error: errFaturas }, { data: usuariosData }] = await Promise.all([
    supabase
      .from("mensalidades")
      .select("id, valor_cobrado, valor_pago, data_vencimento, data_pagamento, status, tipo_receita, categoria_avulsa, forma_pagamento, observacoes, plano_id")
      .in("plano_id", planoIds)
      .gte("data_vencimento", inicioStr)
      .lte("data_vencimento", fimStr)
      .order("data_vencimento", { ascending: true }),
    alunoIds.length > 0
      ? supabase.from("usuarios").select("id, nome, foto_url, telefone").in("id", alunoIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  if (errFaturas) {
    console.log("[Recebimentos] Aviso ao ler mensalidades:", errFaturas.message);
  }

  console.log(
    `[Recebimentos] personalId=${personalId} | planos=${planos.length} | mensalidades=${(faturasRaw || []).length} | periodo=${inicioStr}..${fimStr}`
  );

  const planosMap = new Map<string, any>();
  planos.forEach((p: any) => planosMap.set(p.id, p));

  const usuariosMap = new Map<string, any>();
  (usuariosData || []).forEach((u: any) => usuariosMap.set(u.id, u));

  const alunosMap = new Map<string, AlunoData>();
  planos.forEach((p: any) => {
    if (p.status !== "cancelado") {
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

  const planosComFaturaNoPeriodo = new Set<string>();

  const faturasReais: Fatura[] = (faturasRaw || [])
    .filter((fat: any) => fat.tipo_receita !== "avulsa")
    .map((fat: any) => {
      planosComFaturaNoPeriodo.add(fat.plano_id);

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
        hojeMid
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
  const anoInicio = inicio.getFullYear();
  const mesInicio = inicio.getMonth();

  planos.forEach((plano: any) => {
    if (planosComFaturaNoPeriodo.has(plano.id)) return;
    if (plano.status === "cancelado" || !plano.valor_mensal) return;

    const diaVenc = Math.min(Math.max(Number(plano.dia_vencimento) || 10, 1), 28);
    const dataVencFallback = new Date(anoInicio, mesInicio, diaVenc, 12, 0, 0);

    if (dataVencFallback < inicio || dataVencFallback > fim) return;

    if (plano.data_inicio) {
      const inicioPlano = new Date(`${String(plano.data_inicio).split("T")[0]}T00:00:00`);
      const fimMesFiltro = new Date(anoInicio, mesInicio + 1, 0, 23, 59, 59);
      if (inicioPlano > fimMesFiltro) return;
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
      hojeMid
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

  const faturasMapeadas = [...faturasReais, ...faturasFallback].sort(
    (a, b) => a.data_completa.getTime() - b.data_completa.getTime()
  );

  const alunosLista = Array.from(alunosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  return { faturasMapeadas, alunosLista };
}

async function buscarDadosCompletosFinanceiro(inicio: Date, fim: Date) {
  const { data: { session } } = await supabase.auth.getSession();
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

  const { faturasMapeadas, alunosLista } = await buscarFaturasNoPeriodo(session.user.id, inicio, fim);

  return {
    nomePersonal: perfilData?.nome || null,
    mods,
    faturasMapeadas,
    alunosLista,
  };
}

export function useRecebimentos(navigation: any) {
  const { completarMissao } = useOnboarding();
  const hoje = new Date();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nomePersonal, setNomePersonal] = useState("Treinador");
  const [modalidadesPersonal, setModalidadesPersonal] = useState<string[]>([]);

  const [viewInicio, setViewInicio] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0));
  const [viewFim, setViewFim] = useState(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59));

  const [modalDataVisivel, setModalDataVisivel] = useState(false);
  const [tempAno, setTempAno] = useState(hoje.getFullYear());
  const [tempMes, setTempMes] = useState(hoje.getMonth());
  const [tempInicio, setTempInicio] = useState<Date | null>(null);
  const [tempFim, setTempFim] = useState<Date | null>(null);

  const [modalPdfVisivel, setModalPdfVisivel] = useState(false);
  const [pdfPreset, setPdfPreset] = useState<PdfPreset>("mes_atual");
  const [pdfAno, setPdfAno] = useState(hoje.getFullYear());
  const [pdfMes, setPdfMes] = useState(hoje.getMonth());
  const [pdfInicio, setPdfInicio] = useState<Date | null>(new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0));
  const [pdfFim, setPdfFim] = useState<Date | null>(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59));
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const [modalidadeAtiva, setModalidadeAtiva] = useState<string>("Todos");
  const [statusAtivo, setStatusAtivo] = useState<StatusFiltro>("Todos");

  const [mensalidades, setMensalidades] = useState<Fatura[]>([]);
  const [alunosAtivos, setAlunosAtivos] = useState<AlunoData[]>([]);
  const [buscaAlunoCongelar, setBuscaAlunoCongelar] = useState("");

  const [modalBaixaVisivel, setModalBaixaVisivel] = useState(false);
  const [faturaSelecionada, setFaturaSelecionada] = useState<Fatura | null>(null);
  const [valorInput, setValorInput] = useState("");
  const [formaPgto, setFormaPgto] = useState("PIX");
  const [observacao, setObservacao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [etapaBaixa, setEtapaBaixa] = useState(1);

  const [modalCongelarVisivel, setModalCongelarVisivel] = useState(false);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<string | null>(null);

  const [motivoPausa, setMotivoPausa] = useState("Férias");
  const [textoOutroMotivo, setTextoOutroMotivo] = useState("");
  const [diasPausa, setDiasPausa] = useState("15");

  const [fabAberto, setFabAberto] = useState(false);
  const reciboRef = useRef(null);

  const recarregarFinanceiro = async (inicioPeriodo = viewInicio, fimPeriodo = viewFim) => {
    try {
      const res = await buscarDadosCompletosFinanceiro(inicioPeriodo, fimPeriodo);
      if (!res) return;
      if (res.nomePersonal) setNomePersonal(res.nomePersonal);
      setModalidadesPersonal(res.mods);
      setMensalidades(res.faturasMapeadas);
      setAlunosAtivos(res.alunosLista);
    } catch (error) {
      console.log("Erro ao carregar financeiro:", error);
      Alert.alert("Erro", "Falha ao carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ativo = true;

    buscarDadosCompletosFinanceiro(viewInicio, viewFim)
      .then((res) => {
        if (!ativo || !res) return;
        if (res.nomePersonal) setNomePersonal(res.nomePersonal);
        setModalidadesPersonal(res.mods);
        setMensalidades(res.faturasMapeadas);
        setAlunosAtivos(res.alunosLista);
      })
      .catch((error) => {
        console.log("Erro ao carregar financeiro:", error);
        if (ativo) Alert.alert("Erro", "Falha ao carregar os dados financeiros.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [viewInicio, viewFim]);

  let dataRetornoCalculada = "--/--/----";
  if (diasPausa && !isNaN(Number(diasPausa))) {
    const data = new Date();
    data.setDate(data.getDate() + parseInt(diasPausa, 10));
    dataRetornoCalculada = formatDDMMYYYY(data);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await recarregarFinanceiro(viewInicio, viewFim);
    setRefreshing(false);
  };

  const alunosFiltrados = mensalidades.filter((item) => {
    let passModalidade = true;
    const isConsultoria =
      item.servicos_array?.some((s) => s.toLowerCase().includes("consultoria")) ||
      item.modalidadeUi.toLowerCase().includes("consultoria");
    const isPresencial =
      item.servicos_array?.some((s) => s.toLowerCase().includes("presencial")) ||
      item.modalidadeUi.toLowerCase().includes("presencial");

    if (modalidadeAtiva === "Consultoria") {
      passModalidade = isConsultoria;
    } else if (modalidadeAtiva === "Presencial") {
      passModalidade = isPresencial;
    }

    let passStatus = true;
    if (statusAtivo === "Pagos") passStatus = item.status === "pago";
    if (statusAtivo === "Pendentes") passStatus = ["pendente", "proximo", "agendada"].includes(item.status);
    if (statusAtivo === "Atrasados") passStatus = item.status === "atrasado";
    if (statusAtivo === "Bloqueados") passStatus = item.acesso_bloqueado;

    return passModalidade && passStatus;
  });

  const alunosCongelarFiltrados = alunosAtivos.filter((a) =>
    a.nome.toLowerCase().includes(buscaAlunoCongelar.toLowerCase())
  );

  const totalRecebido = alunosFiltrados
    .filter((i) => i.status === "pago")
    .reduce((acc, curr) => acc + (Number(curr.valor_pago) || curr.valor), 0);
  const totalPendente = alunosFiltrados
    .filter((i) => ["pendente", "proximo", "agendada"].includes(i.status))
    .reduce((acc, curr) => acc + curr.valor, 0);
  const totalAtrasado = alunosFiltrados
    .filter((i) => i.status === "atrasado")
    .reduce((acc, curr) => acc + curr.valor, 0);
  const totalGeral = totalRecebido + totalPendente + totalAtrasado;

  const percRecebido = totalGeral > 0 ? (totalRecebido / totalGeral) * 100 : 0;
  const percAReceber = totalGeral > 0 ? (totalPendente / totalGeral) * 100 : 0;
  const percAtraso = totalGeral > 0 ? (totalAtrasado / totalGeral) * 100 : 0;

  const abrirCalendarioTopo = () => {
    setTempAno(viewInicio.getFullYear());
    setTempMes(viewInicio.getMonth());
    setTempInicio(viewInicio);
    setTempFim(viewFim);
    setModalDataVisivel(true);
  };

  const selecionarMesCalendario = (mesIndex: number) => {
    setTempMes(mesIndex);
    setTempInicio(new Date(tempAno, mesIndex, 1, 0, 0, 0));
    setTempFim(new Date(tempAno, mesIndex + 1, 0, 23, 59, 59));
  };

  const selecionarDiaCalendario = (dia: number) => {
    const dataClicada = new Date(tempAno, tempMes, dia);
    if (!tempInicio || (tempInicio && tempFim)) {
      setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0));
      setTempFim(null);
    } else {
      if (dataClicada >= tempInicio) {
        setTempFim(new Date(tempAno, tempMes, dia, 23, 59, 59));
      } else {
        setTempFim(new Date(tempInicio.getFullYear(), tempInicio.getMonth(), tempInicio.getDate(), 23, 59, 59));
        setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0));
      }
    }
  };

  const aplicarFiltroCalendario = () => {
    if (tempInicio && !tempFim) {
      setViewInicio(tempInicio);
      setViewFim(new Date(tempInicio.getFullYear(), tempInicio.getMonth(), tempInicio.getDate(), 23, 59, 59));
    } else if (tempInicio && tempFim) {
      setViewInicio(tempInicio);
      setViewFim(tempFim);
    }
    setModalDataVisivel(false);
  };

  const setaMudarMesRapido = (direcao: number) => {
    const novaData = new Date(viewInicio);
    novaData.setMonth(novaData.getMonth() + direcao);
    setViewInicio(new Date(novaData.getFullYear(), novaData.getMonth(), 1, 0, 0, 0));
    setViewFim(new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0, 23, 59, 59));
  };

  const textoHeaderData = () => {
    if (
      viewInicio.getDate() === 1 &&
      viewFim.getDate() === new Date(viewInicio.getFullYear(), viewInicio.getMonth() + 1, 0).getDate()
    ) {
      return `${MESES_NOME[viewInicio.getMonth()]} ${viewInicio.getFullYear()}`;
    } else if (
      viewInicio.getDate() === viewFim.getDate() &&
      viewInicio.getMonth() === viewFim.getMonth()
    ) {
      return `${viewInicio.getDate()} de ${MESES_NOME[viewInicio.getMonth()]}`;
    }
    return `${viewInicio.getDate()}/${MESES_NOME[viewInicio.getMonth()]} - ${viewFim.getDate()}/${MESES_NOME[viewFim.getMonth()]}`;
  };

  const abrirModalPdf = () => {
    setPdfPreset("mes_atual");
    setPdfAno(viewInicio.getFullYear());
    setPdfMes(viewInicio.getMonth());
    setPdfInicio(new Date(viewInicio));
    setPdfFim(new Date(viewFim));
    setModalPdfVisivel(true);
  };

  const selecionarPresetPdf = (preset: PdfPreset) => {
    setPdfPreset(preset);
    const agora = new Date();

    if (preset === "hoje") {
      const ini = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
      const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(ini);
      setPdfFim(fim);
    } else if (preset === "ultimos_7") {
      const ini = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6, 0, 0, 0);
      const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(ini);
      setPdfFim(fim);
    } else if (preset === "mes_atual") {
      const ini = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0);
      const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(ini);
      setPdfFim(fim);
    }
  };

  const selecionarMesPdf = (mesIndex: number) => {
    setPdfPreset("personalizado");
    setPdfMes(mesIndex);
    setPdfInicio(new Date(pdfAno, mesIndex, 1, 0, 0, 0));
    setPdfFim(new Date(pdfAno, mesIndex + 1, 0, 23, 59, 59));
  };

  const selecionarDiaPdf = (dia: number) => {
    setPdfPreset("personalizado");
    const dataClicada = new Date(pdfAno, pdfMes, dia);
    if (!pdfInicio || (pdfInicio && pdfFim)) {
      setPdfInicio(new Date(pdfAno, pdfMes, dia, 0, 0, 0));
      setPdfFim(null);
    } else {
      if (dataClicada >= pdfInicio) {
        setPdfFim(new Date(pdfAno, pdfMes, dia, 23, 59, 59));
      } else {
        setPdfFim(new Date(pdfInicio.getFullYear(), pdfInicio.getMonth(), pdfInicio.getDate(), 23, 59, 59));
        setPdfInicio(new Date(pdfAno, pdfMes, dia, 0, 0, 0));
      }
    }
  };

  const exportarPdfPeriodo = async () => {
    if (!pdfInicio) {
      return Alert.alert("Atenção", "Selecione pelo menos uma data para exportar.");
    }
    const inicioExport = pdfInicio;
    const fimExport = pdfFim || new Date(pdfInicio.getFullYear(), pdfInicio.getMonth(), pdfInicio.getDate(), 23, 59, 59);

    setGerandoPdf(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { faturasMapeadas } = await buscarFaturasNoPeriodo(session.user.id, inicioExport, fimExport);

      if (faturasMapeadas.length === 0) {
        Alert.alert("Sem Registros", "Não foram encontrados lançamentos financeiros neste período selecionado.");
        return;
      }

      const somaRecebido = faturasMapeadas.filter((f) => f.status === "pago").reduce((acc, c) => acc + (Number(c.valor_pago) || c.valor), 0);
      const somaPendente = faturasMapeadas.filter((f) => ["pendente", "proximo", "agendada"].includes(f.status)).reduce((acc, c) => acc + c.valor, 0);
      const somaAtrasado = faturasMapeadas.filter((f) => f.status === "atrasado").reduce((acc, c) => acc + c.valor, 0);
      const somaTotal = somaRecebido + somaPendente + somaAtrasado;

      const labelPeriodo =
        formatDDMMYYYY(inicioExport) === formatDDMMYYYY(fimExport)
          ? formatDDMMYYYY(inicioExport)
          : `${formatDDMMYYYY(inicioExport)} até ${formatDDMMYYYY(fimExport)}`;

      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 28px; color: #1F2937;">
            <div style="border-bottom: 3px solid #FF6B00; padding-bottom: 14px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #111827; font-size: 22px;">Extrato Financeiro — MatchTrainer</h1>
              <p style="margin: 6px 0 0; color: #6B7280; font-size: 13px;">
                <strong>Personal:</strong> ${nomePersonal} &nbsp;|&nbsp; <strong>Período:</strong> ${labelPeriodo}
              </p>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 22px;">
              <div style="flex: 1; background: #ECFDF5; padding: 12px; border-radius: 8px; border: 1px solid #A7F3D0;">
                <div style="font-size: 11px; color: #065F46; font-weight: bold;">RECEBIDO</div>
                <div style="font-size: 18px; color: #059669; font-weight: bold; margin-top: 4px;">R$ ${somaRecebido.toFixed(2).replace(".", ",")}</div>
              </div>
              <div style="flex: 1; background: #FFFBEB; padding: 12px; border-radius: 8px; border: 1px solid #FDE68A;">
                <div style="font-size: 11px; color: #92400E; font-weight: bold;">A RECEBER</div>
                <div style="font-size: 18px; color: #D97706; font-weight: bold; margin-top: 4px;">R$ ${somaPendente.toFixed(2).replace(".", ",")}</div>
              </div>
              <div style="flex: 1; background: #FEF2F2; padding: 12px; border-radius: 8px; border: 1px solid #FECACA;">
                <div style="font-size: 11px; color: #991B1B; font-weight: bold;">EM ATRASO</div>
                <div style="font-size: 18px; color: #DC2626; font-weight: bold; margin-top: 4px;">R$ ${somaAtrasado.toFixed(2).replace(".", ",")}</div>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #111827; color: #FFFFFF; text-align: left;">
                  <th style="padding: 10px;">Aluno</th>
                  <th style="padding: 10px;">Modalidade</th>
                  <th style="padding: 10px;">Vencimento</th>
                  <th style="padding: 10px;">Status</th>
                  <th style="padding: 10px; text-align: right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${faturasMapeadas
                  .map(
                    (f) => `
                  <tr style="border-bottom: 1px solid #E5E7EB;">
                    <td style="padding: 10px; font-weight: bold;">${f.nome}${f.acesso_bloqueado ? " (Bloqueado)" : ""}</td>
                    <td style="padding: 10px;">${f.modalidadeUi}</td>
                    <td style="padding: 10px;">${f.dataExibicao}</td>
                    <td style="padding: 10px;">${f.detalheStatus}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">R$ ${f.valor.toFixed(2).replace(".", ",")}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="margin-top: 22px; text-align: right; font-size: 16px; font-weight: bold; color: #111827;">
              Total do Período: R$ ${somaTotal.toFixed(2).replace(".", ",")}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      setModalPdfVisivel(false);
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      setGerandoPdf(false);
    }
  };

  const alternarBloqueioAluno = (fatura: Fatura) => {
    const bloquearAgora = !fatura.acesso_bloqueado;
    const primeiroNome = fatura.nome.split(" ")[0];

    Alert.alert(
      bloquearAgora ? `Bloquear acesso de ${primeiroNome}?` : `Liberar acesso de ${primeiroNome}?`,
      bloquearAgora
        ? "Os treinos deste aluno ficarão bloqueados até você liberar ou confirmar o pagamento. O Chat e o WhatsApp continuam liberados."
        : "O aluno voltará a ter acesso imediato a todos os treinos no aplicativo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: bloquearAgora ? "Bloquear Treinos" : "Liberar Acesso",
          style: bloquearAgora ? "destructive" : "default",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("planos")
                .update({ acesso_bloqueado: bloquearAgora })
                .eq("id", fatura.plano_id);

              if (error) throw error;

              await recarregarFinanceiro(viewInicio, viewFim);
              Alert.alert(
                bloquearAgora ? "Acesso Bloqueado" : "Acesso Liberado",
                bloquearAgora
                  ? `Os treinos de ${primeiroNome} foram suspensos temporariamente.`
                  : `O acesso de ${primeiroNome} foi restabelecido!`
              );
            } catch (err) {
              Alert.alert(
                "Erro",
                "Não foi possível atualizar o bloqueio. Verifique se a coluna acesso_bloqueado foi criada na tabela planos."
              );
            }
          },
        },
      ]
    );
  };

  const confirmarBaixaManual = async () => {
    if (!valorInput || !faturaSelecionada) return;
    setProcessando(true);
    try {
      const valorFloat = parseFloat(valorInput.replace(",", "."));
      const dataAgora = new Date().toISOString();

      if (faturaSelecionada.isVirtual) {
        const mesRef = `${faturaSelecionada.data_vencimento.slice(0, 7)}-01`;
        await supabase.from("mensalidades").insert([
          {
            plano_id: faturaSelecionada.plano_id,
            personal_id: faturaSelecionada.personal_id,
            aluno_id: faturaSelecionada.aluno_id,
            mes_referencia: mesRef,
            valor_cobrado: faturaSelecionada.valor,
            valor_pago: valorFloat,
            data_vencimento: faturaSelecionada.data_vencimento,
            data_pagamento: dataAgora,
            status: "pago",
            tipo_receita: "recorrente",
            forma_pagamento: formaPgto,
            observacoes: observacao,
          },
        ]);
      } else {
        await supabase
          .from("mensalidades")
          .update({
            status: "pago",
            data_pagamento: dataAgora,
            valor_pago: valorFloat,
            forma_pagamento: formaPgto,
            observacoes: observacao,
          })
          .eq("id", faturaSelecionada.id);
      }

      await supabase
        .from("planos")
        .update({ acesso_bloqueado: false })
        .eq("id", faturaSelecionada.plano_id);

      await supabase.from("historico_financeiro_logs").insert([
        {
          referencia_id: faturaSelecionada.plano_id,
          tipo_evento: "PAGAMENTO_CONFIRMADO",
          metadados: { valor: valorFloat, forma_pagamento: formaPgto, observacao },
        },
      ]);

      await completarMissao("primeiro_recebimento");
      await recarregarFinanceiro(viewInicio, viewFim);
      setEtapaBaixa(2);
    } catch (e) {
      Alert.alert("Erro", "Falha ao registrar.");
    } finally {
      setProcessando(false);
    }
  };

  const confirmarCongelamento = async () => {
    if (!alunoSelecionadoId || !diasPausa) return Alert.alert("Atenção", "Selecione o aluno e os dias.");
    const motivoFinal = motivoPausa === "Outro" ? `Outro (${textoOutroMotivo})` : motivoPausa;
    if (motivoPausa === "Outro" && !textoOutroMotivo.trim()) return Alert.alert("Atenção", "Por favor, detalhe o motivo.");

    setProcessando(true);
    try {
      const hojeDate = new Date();
      const retornoDate = new Date();
      retornoDate.setDate(retornoDate.getDate() + parseInt(diasPausa, 10));

      await supabase
        .from("planos")
        .update({
          status: "congelado",
          data_congelamento: formatYYYYMMDD(hojeDate),
          data_retorno_previsto: formatYYYYMMDD(retornoDate),
          motivo_pausa: motivoFinal,
          observacoes: `[CONGELADO] Motivo: ${motivoFinal} | Retorno Previsto: ${dataRetornoCalculada}`,
        })
        .eq("id", alunoSelecionadoId);

      setModalCongelarVisivel(false);
      await recarregarFinanceiro(viewInicio, viewFim);
      Alert.alert("Sucesso", "Plano congelado com sucesso!");
    } catch (e) {
      Alert.alert("Erro", "Falha ao congelar.");
    } finally {
      setProcessando(false);
    }
  };

  const compartilharReciboImage = async () => {
    try {
      const uri = await captureRef(reciboRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar a imagem.");
    }
  };

  const abrirWhatsApp = (telefone: string, nome: string, valor: number, status: string) => {
    if (!telefone) return Alert.alert("Ops", "O telefone não está cadastrado.");
    const num = telefone.replace(/\D/g, "");
    const msg =
      status === "atrasado"
        ? `Olá ${nome.split(" ")[0]}, tudo bem? Passando para lembrar da mensalidade em aberto (R$ ${valor.toFixed(2).replace(".", ",")}). Consegue regularizar hoje para manter seu plano certinho? Qualquer dúvida estou à disposição! 💪`
        : `Olá ${nome.split(" ")[0]}, tudo bem? Passando para lembrar da renovação do nosso plano (R$ ${valor.toFixed(2).replace(".", ",")}). Qualquer dúvida, me avisa! 🚀`;
    Linking.openURL(`whatsapp://send?phone=55${num}&text=${encodeURIComponent(msg)}`);
  };

  const abrirModalBaixa = (fatura: Fatura) => {
    setFaturaSelecionada(fatura);
    setValorInput((fatura.valor_pago || fatura.valor).toString());
    setFormaPgto(fatura.forma_pagamento || "PIX");
    setObservacao("");
    setEtapaBaixa(1);
    setModalBaixaVisivel(true);
  };

  return {
    loading,
    refreshing,
    nomePersonal,
    viewInicio,
    viewFim,
    modalDataVisivel,
    tempAno,
    tempMes,
    tempInicio,
    tempFim,
    modalPdfVisivel,
    pdfPreset,
    pdfAno,
    pdfMes,
    pdfInicio,
    pdfFim,
    gerandoPdf,
    modalidadeAtiva,
    statusAtivo,
    buscaAlunoCongelar,
    modalBaixaVisivel,
    faturaSelecionada,
    valorInput,
    formaPgto,
    observacao,
    processando,
    etapaBaixa,
    modalCongelarVisivel,
    alunoSelecionadoId,
    motivoPausa,
    textoOutroMotivo,
    diasPausa,
    dataRetornoCalculada,
    fabAberto,
    reciboRef,
    alunosFiltrados,
    alunosCongelarFiltrados,
    totalRecebido,
    totalPendente,
    totalAtrasado,
    totalGeral,
    percRecebido,
    percAReceber,
    percAtraso,
    hoje,
    modalidadesPersonal,
    formatDDMMYYYY,

    setModalidadeAtiva,
    setStatusAtivo,
    abrirCalendarioTopo,
    selecionarMesCalendario,
    selecionarDiaCalendario,
    aplicarFiltroCalendario,
    setaMudarMesRapido,
    abrirModalPdf,
    setModalPdfVisivel,
    selecionarPresetPdf,
    setPdfAno,
    selecionarMesPdf,
    selecionarDiaPdf,
    exportarPdfPeriodo,
    alternarBloqueioAluno,
    confirmarBaixaManual,
    confirmarCongelamento,
    compartilharReciboImage,
    abrirWhatsApp,
    abrirModalBaixa,
    setTempAno,
    setModalDataVisivel,
    setFabAberto,
    setModalBaixaVisivel,
    setValorInput,
    setFormaPgto,
    setObservacao,
    setAlunoSelecionadoId,
    setModalCongelarVisivel,
    setBuscaAlunoCongelar,
    setMotivoPausa,
    setTextoOutroMotivo,
    setDiasPausa,
    onRefresh,
    textoHeaderData,
  };
}