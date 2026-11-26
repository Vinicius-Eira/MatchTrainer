import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { useOnboarding } from "../../../../../hooks/useOnboarding";
import { supabase } from "../../../../../services/supabase";
import { MESES_NOME, PdfPreset, StatusFiltro } from "./constants";
import {
  AlunoData,
  buscarDadosCompletosFinanceiro,
  buscarFaturasNoPeriodo,
  comTimeout,
  Fatura,
  formatDDMMYYYY,
  formatYYYYMMDD,
  gerarECompartilharPdfExtrato,
} from "../../../../../utils/Finance/financeiroHelpers";

export type { AlunoData, Fatura };

export type FeedbackTipo = "success" | "error" | "warning" | "info";

export interface FeedbackModalState {
  visivel: boolean;
  tipo: FeedbackTipo;
  kicker?: string;
  titulo: string;
  mensagem: string;
}

export interface ConfirmModalState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  perigoso: boolean;
  onConfirmar: (() => Promise<void>) | null;
}

export function useRecebimentos(navigation: any) {
  const { completarMissao } = useOnboarding();
  const hoje = new Date();
  const exportandoPdfLock = useRef(false);

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
  const [etapaPdfTexto, setEtapaPdfTexto] = useState("");

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

  const [modalCongelamentoSucesso, setModalCongelamentoSucesso] = useState({
    visivel: false,
    nomeAluno: "",
    dias: "",
    dataRetorno: "",
    motivo: "",
  });

  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    visivel: false,
    tipo: "info",
    titulo: "",
    mensagem: "",
  });

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    visivel: false,
    titulo: "",
    mensagem: "",
    textoConfirmar: "Confirmar",
    perigoso: false,
    onConfirmar: null,
  });

  const [fabAberto, setFabAberto] = useState(false);

  const mostrarFeedback = (tipo: FeedbackTipo, titulo: string, mensagem: string, kicker?: string) => {
    setFeedbackModal({ visivel: true, tipo, titulo, mensagem, kicker });
  };

  const fecharFeedback = () => setFeedbackModal((prev) => ({ ...prev, visivel: false }));

  const fecharConfirm = () => setConfirmModal((prev) => ({ ...prev, visivel: false, onConfirmar: null }));

  const executarConfirm = async () => {
    const fn = confirmModal.onConfirmar;
    fecharConfirm();
    if (fn) await fn();
  };

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
      mostrarFeedback("error", "Erro ao Carregar", "Não foi possível carregar os dados financeiros agora.");
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
        if (ativo) {
          mostrarFeedback("error", "Erro ao Carregar", "Não foi possível carregar os dados financeiros agora.");
        }
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

    if (modalidadeAtiva === "Consultoria") passModalidade = isConsultoria;
    else if (modalidadeAtiva === "Presencial") passModalidade = isPresencial;

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
    } else if (dataClicada >= tempInicio) {
      setTempFim(new Date(tempAno, tempMes, dia, 23, 59, 59));
    } else {
      setTempFim(new Date(tempInicio.getFullYear(), tempInicio.getMonth(), tempInicio.getDate(), 23, 59, 59));
      setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0));
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
    }
    if (viewInicio.getDate() === viewFim.getDate() && viewInicio.getMonth() === viewFim.getMonth()) {
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
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0));
      setPdfFim(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59));
    } else if (preset === "ultimos_7") {
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6, 0, 0, 0));
      setPdfFim(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59));
    } else if (preset === "mes_atual") {
      setPdfAno(agora.getFullYear());
      setPdfMes(agora.getMonth());
      setPdfInicio(new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0));
      setPdfFim(new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59));
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
    } else if (dataClicada >= pdfInicio) {
      setPdfFim(new Date(pdfAno, pdfMes, dia, 23, 59, 59));
    } else {
      setPdfFim(new Date(pdfInicio.getFullYear(), pdfInicio.getMonth(), pdfInicio.getDate(), 23, 59, 59));
      setPdfInicio(new Date(pdfAno, pdfMes, dia, 0, 0, 0));
    }
  };

  const exportarPdfPeriodo = async () => {
    if (exportandoPdfLock.current) return;

    if (!pdfInicio) {
      mostrarFeedback("warning", "Selecione uma Data", "Escolha pelo menos um dia ou mês para exportar o extrato.");
      return;
    }

    const inicioExport = pdfInicio;
    const fimExport =
      pdfFim || new Date(pdfInicio.getFullYear(), pdfInicio.getMonth(), pdfInicio.getDate(), 23, 59, 59);

    exportandoPdfLock.current = true;
    setModalPdfVisivel(false);
    setGerandoPdf(true);
    setEtapaPdfTexto("Buscando lançamentos do período...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 480));

      const {
        data: { session },
      } = await comTimeout(
        supabase.auth.getSession(),
        10000,
        "Não foi possível validar sua sessão. Verifique sua conexão."
      );

      if (!session?.user) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const { faturasMapeadas } = await comTimeout(
        buscarFaturasNoPeriodo(session.user.id, inicioExport, fimExport, true),
        15000,
        "Tempo esgotado ao buscar os lançamentos financeiros."
      );

      if (faturasMapeadas.length === 0) {
        setGerandoPdf(false);
        setEtapaPdfTexto("");
        mostrarFeedback(
          "warning",
          "Sem Lançamentos",
          "Não encontramos faturas com vencimento ou pagamento no período escolhido.",
          "EXTRATO VAZIO"
        );
        return;
      }

      await gerarECompartilharPdfExtrato({
        nomePersonal,
        inicioExport,
        fimExport,
        faturas: faturasMapeadas,
        onProgresso: (texto) => setEtapaPdfTexto(texto),
        onAntesDeAbrirShare: () => {
          setGerandoPdf(false);
          setEtapaPdfTexto("");
        },
      });
    } catch (e: any) {
      console.log("[Recebimentos] Erro ao exportar PDF:", e);
      setGerandoPdf(false);
      setEtapaPdfTexto("");
      mostrarFeedback(
        "error",
        "Erro ao Exportar PDF",
        e?.message || "Não foi possível gerar ou abrir o extrato PDF neste aparelho.",
        "FALHA NO PDF"
      );
    } finally {
      setGerandoPdf(false);
      setEtapaPdfTexto("");
      exportandoPdfLock.current = false;
    }
  };

  const alternarBloqueioAluno = (fatura: Fatura) => {
    const bloquearAgora = !fatura.acesso_bloqueado;
    const primeiroNome = fatura.nome.split(" ")[0];

    setConfirmModal({
      visivel: true,
      titulo: bloquearAgora ? `Bloquear ${primeiroNome}?` : `Liberar ${primeiroNome}?`,
      mensagem: bloquearAgora
        ? "Os treinos deste aluno ficarão suspensos até você liberar ou confirmar o pagamento. O Chat e o WhatsApp continuam liberados."
        : "O aluno voltará a ter acesso imediato a todos os treinos no aplicativo.",
      textoConfirmar: bloquearAgora ? "Bloquear Treinos" : "Liberar Acesso",
      perigoso: bloquearAgora,
      onConfirmar: async () => {
        try {
          const { error } = await supabase
            .from("planos")
            .update({ acesso_bloqueado: bloquearAgora })
            .eq("id", fatura.plano_id);

          if (error) throw error;

          await recarregarFinanceiro(viewInicio, viewFim);
          mostrarFeedback(
            "success",
            bloquearAgora ? "Acesso Bloqueado" : "Acesso Liberado",
            bloquearAgora
              ? `Os treinos de ${primeiroNome} foram suspensos temporariamente.`
              : `O acesso de ${primeiroNome} foi restabelecido com sucesso!`,
            bloquearAgora ? "BLOQUEIO ATIVO" : "ACESSO ATIVO"
          );
        } catch {
          mostrarFeedback("error", "Erro ao Atualizar", "Não foi possível alterar o bloqueio deste aluno agora.");
        }
      },
    });
  };

  const confirmarBaixaManual = async () => {
    if (!valorInput || !faturaSelecionada) {
      mostrarFeedback("warning", "Valor Obrigatório", "Informe o valor recebido para registrar o pagamento.");
      return;
    }
    setProcessando(true);
    try {
      const valorFloat = parseFloat(valorInput.replace(",", "."));
      if (isNaN(valorFloat) || valorFloat <= 0) {
        throw new Error("Informe um valor numérico válido maior que zero.");
      }

      const dataAgora = new Date().toISOString();

      if (faturaSelecionada.isVirtual) {
        const mesRef = `${faturaSelecionada.data_vencimento.slice(0, 7)}-01`;
        const { error } = await supabase.from("mensalidades").insert([
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
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("mensalidades")
          .update({
            status: "pago",
            data_pagamento: dataAgora,
            valor_pago: valorFloat,
            forma_pagamento: formaPgto,
            observacoes: observacao,
          })
          .eq("id", faturaSelecionada.id);
        if (error) throw error;
      }

      await supabase.from("planos").update({ acesso_bloqueado: false }).eq("id", faturaSelecionada.plano_id);

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
    } catch (e: any) {
      mostrarFeedback("error", "Erro ao Registrar", e?.message || "Não foi possível confirmar o pagamento agora.");
    } finally {
      setProcessando(false);
    }
  };

  const confirmarCongelamento = async () => {
    if (!alunoSelecionadoId || !diasPausa || isNaN(Number(diasPausa)) || Number(diasPausa) <= 0) {
      mostrarFeedback("warning", "Dados Incompletos", "Selecione o aluno e informe a quantidade de dias pausados.");
      return;
    }

    const motivoFinal = motivoPausa === "Outro" ? `Outro (${textoOutroMotivo.trim()})` : motivoPausa;
    if (motivoPausa === "Outro" && !textoOutroMotivo.trim()) {
      mostrarFeedback("warning", "Descreva o Motivo", "Informe o motivo da pausa antes de congelar o plano.");
      return;
    }

    setProcessando(true);
    try {
      const hojeDate = new Date();
      const retornoDate = new Date();
      retornoDate.setDate(retornoDate.getDate() + parseInt(diasPausa, 10));

      const { error } = await supabase
        .from("planos")
        .update({
          status: "congelado",
          data_congelamento: formatYYYYMMDD(hojeDate),
          data_retorno_previsto: formatYYYYMMDD(retornoDate),
          motivo_pausa: motivoFinal,
          observacoes: `[CONGELADO] Motivo: ${motivoFinal} | Retorno Previsto: ${dataRetornoCalculada}`,
        })
        .eq("id", alunoSelecionadoId);

      if (error) throw error;

      const alunoEscolhido = alunosAtivos.find((a) => a.id === alunoSelecionadoId);
      setModalCongelarVisivel(false);
      await recarregarFinanceiro(viewInicio, viewFim);

      setTimeout(() => {
        setModalCongelamentoSucesso({
          visivel: true,
          nomeAluno: alunoEscolhido?.nome || "Aluno",
          dias: diasPausa,
          dataRetorno: dataRetornoCalculada,
          motivo: motivoFinal,
        });
      }, 250);
    } catch (e: any) {
      mostrarFeedback("error", "Erro ao Congelar", e?.message || "Não foi possível congelar este plano agora.");
    } finally {
      setProcessando(false);
    }
  };

  const compartilharReciboImage = async (targetRef: any) => {
    try {
      if (!targetRef?.current) return;
      const uri = await captureRef(targetRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        mostrarFeedback("warning", "Indisponível", "Compartilhamento de imagem não suportado neste dispositivo.");
      }
    } catch {
      mostrarFeedback("error", "Erro ao Compartilhar", "Não foi possível gerar a imagem do recibo.");
    }
  };

  const abrirWhatsApp = (telefone: string, nome: string, valor: number, status: string) => {
    if (!telefone) {
      mostrarFeedback("warning", "Sem Telefone", "Este aluno ainda não possui WhatsApp cadastrado.");
      return;
    }
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
    etapaPdfTexto,
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
    modalCongelamentoSucesso,
    feedbackModal,
    confirmModal,
    fabAberto,
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
    setModalCongelamentoSucesso,
    fecharFeedback,
    fecharConfirm,
    executarConfirm,
    onRefresh,
    textoHeaderData,
  };
}