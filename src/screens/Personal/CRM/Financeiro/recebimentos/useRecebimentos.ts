import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useOnboarding } from "../../../../../hooks/useOnboarding";
import { supabase } from "../../../../../services/supabase";
import { MESES_NOME, StatusFiltro } from "./RecebimentosConstants";

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
  valor: number;
  valor_pago?: number;
  valor_cobrado: number;
  data_vencimento: string;
  status: string;
  detalheStatus: string;
  isExtra: boolean;
  categoria_avulsa?: string;
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
}

export function useRecebimentos(navigation: any) {
  const { completarMissao } = useOnboarding();

  const hoje = new Date();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nomePersonal, setNomePersonal] = useState("Treinador");

  const [viewInicio, setViewInicio] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0));
  const [viewFim, setViewFim] = useState(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59));

  const [modalDataVisivel, setModalDataVisivel] = useState(false);
  const [tempAno, setTempAno] = useState(hoje.getFullYear());
  const [tempMes, setTempMes] = useState(hoje.getMonth());
  const [tempInicio, setTempInicio] = useState<Date | null>(null);
  const [tempFim, setTempFim] = useState<Date | null>(null);

  const [modalidadeAtiva, setModalidadeAtiva] = useState<string>("Todos");
  const [statusAtivo, setStatusAtivo] = useState<StatusFiltro>("Todos");

  const [mensalidades, setMensalidades] = useState<Fatura[]>([]);
  const [alunosAtivos, setAlunosAtivos] = useState<AlunoData[]>([]);

  const [buscaAlunoExtra, setBuscaAlunoExtra] = useState("");
  const [buscaAlunoCongelar, setBuscaAlunoCongelar] = useState("");

  const [modalBaixaVisivel, setModalBaixaVisivel] = useState(false);
  const [faturaSelecionada, setFaturaSelecionada] = useState<Fatura | null>(null);
  const [valorInput, setValorInput] = useState("");
  const [formaPgto, setFormaPgto] = useState("PIX");
  const [observacao, setObservacao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [etapaBaixa, setEtapaBaixa] = useState(1);

  const [modalExtraVisivel, setModalExtraVisivel] = useState(false);
  const [modalCongelarVisivel, setModalCongelarVisivel] = useState(false);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<string | null>(null);
  const [categoriaExtra, setCategoriaExtra] = useState("Avaliação Física");

  const [motivoPausa, setMotivoPausa] = useState("Férias");
  const [textoOutroMotivo, setTextoOutroMotivo] = useState("");
  const [diasPausa, setDiasPausa] = useState("15");
  const [dataRetornoCalculada, setDataRetornoCalculada] = useState("");

  const [fabAberto, setFabAberto] = useState(false);
  const reciboRef = useRef(null);

  const carregarFinanceiro = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.rpc("processar_recorrencias_financeiras");

      const { data: perfilData } = await supabase
        .from("personals")
        .select("nome")
        .eq("id", session.user.id)
        .single();
        
      if (perfilData) setNomePersonal(perfilData.nome);

      const formatYYYYMMDD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const inicioStr = formatYYYYMMDD(viewInicio);
      const fimStr = formatYYYYMMDD(viewFim);

      const { data, error } = await supabase
        .from("mensalidades")
        .select(`
          id, valor_cobrado, valor_pago, data_vencimento, data_pagamento, status, tipo_receita, categoria_avulsa, forma_pagamento, observacoes, plano_id,
          planos!inner (
            id, servicos_inclusos, personal_id, aluno_id, status, 
            usuarios!planos_aluno_id_fkey (nome, foto_url, telefone)
          )
        `)
        .eq("planos.personal_id", session.user.id)
        .gte("data_vencimento", inicioStr)
        .lte("data_vencimento", fimStr)
        .order("data_vencimento", { ascending: true });

      if (error) throw error;

      let mapAlunos = new Map<string, AlunoData>();

      const dadosMapeados: Fatura[] = (data || []).map((fat: any) => {
        const plano = fat.planos;
        const aluno = Array.isArray(plano.usuarios) ? plano.usuarios[0] : (plano.usuarios || {});
        const valor = Number(fat.valor_cobrado);

        if (!mapAlunos.has(plano.id) && plano.status !== "cancelado") {
          mapAlunos.set(plano.id, {
            id: plano.id, 
            aluno_id: plano.aluno_id,
            nome: aluno.nome || "Aluno",
            foto: aluno.foto_url,
            telefone: aluno.telefone
          });
        }

        const dateObj = new Date(`${fat.data_vencimento}T12:00:00Z`);
        const dataFormatada = `${String(dateObj.getUTCDate()).padStart(2, '0')}/${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}`;

        const servicos = plano.servicos_inclusos || [];
        let categoriaUi = "Sem Contrato";
        let isHibrido = false;

        if (servicos.length > 1) {
          categoriaUi = "Híbrido";
          isHibrido = true;
        } else if (servicos.length === 1) {
          categoriaUi = servicos[0];
        }

        let statusUi = fat.status;
        let detalheStatus = fat.tipo_receita === "avulsa" ? `Extra: ${fat.categoria_avulsa}` : "";

        if (fat.status === "pendente" && fat.tipo_receita !== "avulsa") {
          const hojeMid = new Date();
          hojeMid.setHours(12, 0, 0, 0);
          
          const dataVencimentoMid = new Date(`${fat.data_vencimento}T12:00:00`);
          const diasDiferenca = Math.ceil((dataVencimentoMid.getTime() - hojeMid.getTime()) / (1000 * 60 * 60 * 24));

          if (diasDiferenca <= 5 && diasDiferenca >= 0) {
            statusUi = "proximo";
            detalheStatus = diasDiferenca === 0 ? "Vence hoje" : `Vence em ${diasDiferenca} dias`;
          } else {
            detalheStatus = `Venc: ${dataFormatada}`;
          }
        } else if (fat.status === "atrasado") {
          const hojeMid = new Date();
          hojeMid.setHours(12, 0, 0, 0);
          const dataVencimentoMid = new Date(`${fat.data_vencimento}T12:00:00`);
          const diasAtraso = Math.floor((hojeMid.getTime() - dataVencimentoMid.getTime()) / (1000 * 60 * 60 * 24));
          detalheStatus = `${diasAtraso} dias de atraso`;
        } else if (fat.status === "pago") {
          detalheStatus = fat.tipo_receita === "avulsa" ? `Extra: ${fat.categoria_avulsa}` : "Pago";
        } else if (["agendada", "cancelada", "congelada", "isenta"].includes(fat.status)) {
          statusUi = fat.status;
          detalheStatus = fat.status.charAt(0).toUpperCase() + fat.status.slice(1);
        }

        return {
          ...fat,
          nome: aluno.nome || "Aluno",
          foto: aluno.foto_url,
          telefone: aluno.telefone || "",
          servicos_array: servicos,
          modalidadeUi: categoriaUi,
          isHibrido,
          valor,
          status: statusUi,
          detalheStatus,
          dataExibicao: dataFormatada,
          isExtra: fat.tipo_receita === "avulsa",
          data_completa: dateObj,
        };
      });

      setMensalidades(dadosMapeados);
      const alunosArray = Array.from(mapAlunos.values());
      alunosArray.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunosAtivos(alunosArray);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  }, [viewInicio, viewFim]);

  useEffect(() => {
    setLoading(true);
    carregarFinanceiro();
  }, [carregarFinanceiro]);

  useEffect(() => {
    if (diasPausa && !isNaN(Number(diasPausa))) {
      const data = new Date();
      data.setDate(data.getDate() + parseInt(diasPausa));
      setDataRetornoCalculada(`${String(data.getDate()).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`);
    } else {
      setDataRetornoCalculada("--/--/----");
    }
  }, [diasPausa]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarFinanceiro();
    setRefreshing(false);
  };

  const alunosFiltrados = mensalidades.filter((item) => {
    let passModalidade = true;
    if (modalidadeAtiva === "Consultoria") passModalidade = !item.isHibrido && item.servicos_array?.includes("Consultoria");
    if (modalidadeAtiva === "Presencial") passModalidade = !item.isHibrido && item.servicos_array?.includes("Presencial");
    if (modalidadeAtiva === "Híbrido") passModalidade = item.isHibrido;

    let passStatus = true;
    if (statusAtivo === "Pagos") passStatus = item.status === "pago";
    if (statusAtivo === "Pendentes") passStatus = ["pendente", "proximo", "agendada"].includes(item.status);
    if (statusAtivo === "Atrasados") passStatus = item.status === "atrasado";

    return passModalidade && passStatus;
  });

  const alunosExtraFiltrados = alunosAtivos.filter((a) => a.nome.toLowerCase().includes(buscaAlunoExtra.toLowerCase()));
  const alunosCongelarFiltrados = alunosAtivos.filter((a) => a.nome.toLowerCase().includes(buscaAlunoCongelar.toLowerCase()));

  const totalRecebido = alunosFiltrados.filter(i => i.status === "pago").reduce((acc, curr) => acc + (Number(curr.valor_pago) || curr.valor), 0);
  const totalPendente = alunosFiltrados.filter(i => ["pendente", "proximo", "agendada"].includes(i.status)).reduce((acc, curr) => acc + curr.valor, 0);
  const totalAtrasado = alunosFiltrados.filter(i => i.status === "atrasado").reduce((acc, curr) => acc + curr.valor, 0);
  const totalGeral = totalRecebido + totalPendente + totalAtrasado;

  const percRecebido = totalGeral > 0 ? (totalRecebido / totalGeral) * 100 : 0;
  const percAReceber = totalGeral > 0 ? (totalPendente / totalGeral) * 100 : 0;
  const percAtraso = totalGeral > 0 ? (totalAtrasado / totalGeral) * 100 : 0;

  const abrirCalendarioTopo = () => { setTempAno(viewInicio.getFullYear()); setTempMes(viewInicio.getMonth()); setTempInicio(viewInicio); setTempFim(viewFim); setModalDataVisivel(true); };
  const selecionarMesCalendario = (mesIndex: number) => { setTempMes(mesIndex); setTempInicio(new Date(tempAno, mesIndex, 1, 0, 0, 0)); setTempFim(new Date(tempAno, mesIndex + 1, 0, 23, 59, 59)); };
  const selecionarDiaCalendario = (dia: number) => { 
    const dataClicada = new Date(tempAno, tempMes, dia);
    if (!tempInicio || (tempInicio && tempFim)) { setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0)); setTempFim(null); }
    else {
      if (dataClicada >= tempInicio) setTempFim(new Date(tempAno, tempMes, dia, 23, 59, 59));
      else { setTempFim(new Date(tempInicio.getFullYear(), tempInicio.getMonth(), tempInicio.getDate(), 23, 59, 59)); setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0)); }
    }
  };
  const aplicarFiltroCalendario = () => {
    if (tempInicio && !tempFim) { setViewInicio(tempInicio); setViewFim(new Date(tempInicio.getFullYear(), tempInicio.getMonth(), tempInicio.getDate(), 23, 59, 59)); }
    else if (tempInicio && tempFim) { setViewInicio(tempInicio); setViewFim(tempFim); }
    setModalDataVisivel(false);
  };
  const setaMudarMesRapido = (direcao: number) => {
    const novaData = new Date(viewInicio);
    novaData.setMonth(novaData.getMonth() + direcao);
    setViewInicio(new Date(novaData.getFullYear(), novaData.getMonth(), 1, 0, 0, 0));
    setViewFim(new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0, 23, 59, 59));
  };
  const textoHeaderData = () => {
    if (viewInicio.getDate() === 1 && viewFim.getDate() === new Date(viewInicio.getFullYear(), viewInicio.getMonth() + 1, 0).getDate()) {
      return `${MESES_NOME[viewInicio.getMonth()]} ${viewInicio.getFullYear()}`;
    } else if (viewInicio.getDate() === viewFim.getDate()) { return `${viewInicio.getDate()} de ${MESES_NOME[viewInicio.getMonth()]}`; }
    return `${viewInicio.getDate()}/${MESES_NOME[viewInicio.getMonth()]} - ${viewFim.getDate()}/${MESES_NOME[viewFim.getMonth()]}`;
  };

  const gerarPdfDaTela = async () => {
    if (alunosFiltrados.length === 0) return Alert.alert("Aviso", "Não há dados para exportar com estes filtros.");
    try {
      const { uri } = await Print.printToFileAsync({ html: `<html><body><h1>Relatório Simples (Adicione HTML)</h1></body></html>` });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (e) { Alert.alert("Erro", "Não foi possível gerar o PDF."); }
  };

  const confirmarBaixaManual = async () => {
    if (!valorInput || !faturaSelecionada) return;
    setProcessando(true);
    try {
      const valorFloat = parseFloat(valorInput.replace(",", "."));
      await supabase.from("mensalidades").update({
        status: "pago", data_pagamento: new Date().toISOString(), valor_pago: valorFloat, forma_pagamento: formaPgto, observacoes: observacao,
      }).eq("id", faturaSelecionada.id);

      await completarMissao("primeiro_recebimento");
      carregarFinanceiro();
      setEtapaBaixa(2);
    } catch (e) { Alert.alert("Erro", "Falha ao registrar."); } finally { setProcessando(false); }
  };

  const salvarReceitaExtra = async () => {
    if (!valorInput || !alunoSelecionadoId) return Alert.alert("Atenção", "Selecione o aluno e o valor.");
    setProcessando(true);
    try {
      const valorFloat = parseFloat(valorInput.replace(",", "."));
      const mesReferenciaStr = new Date().toISOString().split("T")[0]; 
      
      const { error: erroFatura } = await supabase.from("mensalidades").insert([{
        plano_id: alunoSelecionadoId, 
        mes_referencia: mesReferenciaStr,
        valor_cobrado: valorFloat,
        valor_pago: valorFloat,
        data_vencimento: mesReferenciaStr,
        data_pagamento: new Date().toISOString(),
        status: "pago",
        tipo_receita: "avulsa",
        categoria_avulsa: categoriaExtra,
        forma_pagamento: formaPgto,
        observacoes: observacao,
      }]);
      
      if (erroFatura) throw erroFatura;
      await completarMissao("primeiro_recebimento");
      setModalExtraVisivel(false);
      carregarFinanceiro();
    } catch (e) { Alert.alert("Erro", "Falha ao salvar receita."); } finally { setProcessando(false); }
  };

  const confirmarCongelamento = async () => {
    if (!alunoSelecionadoId || !diasPausa) return Alert.alert("Atenção", "Preencha aluno e dias.");
    let motivoFinal = motivoPausa === "Outro" ? `Outro (${textoOutroMotivo})` : motivoPausa;
    if (motivoPausa === "Outro" && !textoOutroMotivo.trim()) return Alert.alert("Atenção", "Por favor, detalhe o motivo.");
    
    setProcessando(true);
    try {
      await supabase.from("planos").update({
        status: "congelado", observacoes: `[CONGELADO] Motivo: ${motivoFinal} | Retorno Previsto: ${dataRetornoCalculada}`,
      }).eq("id", alunoSelecionadoId); 

      setModalCongelarVisivel(false);
      carregarFinanceiro();
      Alert.alert("Sucesso", "Plano congelado. O sistema pausará as próximas cobranças.");
    } catch (e) { Alert.alert("Erro", "Falha ao congelar."); } finally { setProcessando(false); }
  };

  const compartilharReciboImage = async () => {
    try {
      const uri = await captureRef(reciboRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (error) { Alert.alert("Erro", "Não foi possível compartilhar a imagem."); }
  };

  const abrirWhatsApp = (telefone: string, nome: string, valor: number, status: string) => {
    if (!telefone) return Alert.alert("Ops", "O telefone não está cadastrado.");
    const num = telefone.replace(/\D/g, "");
    const msg = status === "atrasado"
      ? `Fala ${nome.split(" ")[0]}, tudo bem? Passando pra dar um toque sobre a mensalidade que venceu recentemente (R$ ${valor.toFixed(2)}). Consegue ver isso hoje? 💪`
      : `Fala ${nome.split(" ")[0]}, tudo bem? Lembrete da renovação do nosso plano (R$ ${valor.toFixed(2)}). Qualquer dúvida, avisa! 🚀`;
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
    loading, refreshing, nomePersonal, viewInicio, viewFim, modalDataVisivel, tempAno, tempMes, tempInicio, tempFim,
    modalidadeAtiva, statusAtivo, buscaAlunoExtra, buscaAlunoCongelar, modalBaixaVisivel, faturaSelecionada, valorInput,
    formaPgto, observacao, processando, etapaBaixa, modalExtraVisivel, modalCongelarVisivel, alunoSelecionadoId,
    categoriaExtra, motivoPausa, textoOutroMotivo, diasPausa, dataRetornoCalculada, fabAberto, reciboRef,
    alunosFiltrados, alunosExtraFiltrados, alunosCongelarFiltrados, totalRecebido, totalPendente, totalAtrasado,
    totalGeral, percRecebido, percAReceber, percAtraso, hoje,

    setModalidadeAtiva, setStatusAtivo, abrirCalendarioTopo, selecionarMesCalendario, selecionarDiaCalendario,
    aplicarFiltroCalendario, setaMudarMesRapido, gerarPdfDaTela, confirmarBaixaManual, salvarReceitaExtra,
    confirmarCongelamento, compartilharReciboImage, abrirWhatsApp, abrirModalBaixa, setTempAno, setModalDataVisivel,
    setFabAberto, setModalBaixaVisivel, setValorInput, setFormaPgto, setObservacao, setModalExtraVisivel, setBuscaAlunoExtra,
    setAlunoSelecionadoId, setCategoriaExtra, setModalCongelarVisivel, setBuscaAlunoCongelar, setMotivoPausa,
    setTextoOutroMotivo, setDiasPausa, onRefresh, textoHeaderData,
  };
}