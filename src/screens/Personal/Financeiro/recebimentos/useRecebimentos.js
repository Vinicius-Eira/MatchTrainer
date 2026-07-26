import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { supabase } from "../../../../services/supabase";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { MESES_NOME } from './RecebimentosConstants';
import { useOnboarding } from "../../../../hooks/useOnboarding"; 

export function useRecebimentos(navigation) {
  const { completarMissao } = useOnboarding();

  const hoje = new Date();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nomePersonal, setNomePersonal] = useState("Treinador");

  const [viewInicio, setViewInicio] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0,0,0));
  const [viewFim, setViewFim] = useState(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23,59,59));

  const [modalDataVisivel, setModalDataVisivel] = useState(false);
  const [tempAno, setTempAno] = useState(hoje.getFullYear());
  const [tempMes, setTempMes] = useState(hoje.getMonth());
  const [tempInicio, setTempInicio] = useState(null);
  const [tempFim, setTempFim] = useState(null);

  const [modalidadeAtiva, setModalidadeAtiva] = useState("Todos");
  const [statusAtivo, setStatusAtivo] = useState("Todos");

  const [mensalidades, setMensalidades] = useState([]);
  const [alunosAtivos, setAlunosAtivos] = useState([]); 
  
  const [buscaAlunoExtra, setBuscaAlunoExtra] = useState("");
  const [buscaAlunoCongelar, setBuscaAlunoCongelar] = useState("");

  const [modalBaixaVisivel, setModalBaixaVisivel] = useState(false);
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [valorInput, setValorInput] = useState("");
  const [formaPgto, setFormaPgto] = useState("PIX");
  const [observacao, setObservacao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [etapaBaixa, setEtapaBaixa] = useState(1);

  const [modalExtraVisivel, setModalExtraVisivel] = useState(false);
  const [modalCongelarVisivel, setModalCongelarVisivel] = useState(false);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(null);
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

      await supabase.rpc('processar_recorrencias_financeiras');

      const { data: perfilData } = await supabase.from('personals').select('nome').eq('id', session.user.id).single();
      if (perfilData) setNomePersonal(perfilData.nome);

      const formatYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const inicioStr = formatYYYYMMDD(viewInicio);
      const fimStr = formatYYYYMMDD(viewFim);

      const { data, error } = await supabase
        .from('mensalidades')
        .select(`
          id, valor_cobrado, valor_pago, data_vencimento, data_pagamento, status, tipo_receita, categoria_avulsa, forma_pagamento, observacoes, plano_id,
          planos!inner (
            id, servicos_inclusos, personal_id, aluno_id, status, 
            usuarios!planos_aluno_id_fkey (nome, foto_url, telefone)
          )
        `)
        .eq('planos.personal_id', session.user.id)
        .gte('data_vencimento', inicioStr) 
        .lte('data_vencimento', fimStr)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;

      let mapAlunos = new Map();

      const dadosMapeados = (data || []).map((fat) => {
        const plano = fat.planos;
        const aluno = Array.isArray(plano.usuarios) ? plano.usuarios[0] : (plano.usuarios || {});
        const valor = Number(fat.valor_cobrado);
        
        if (!mapAlunos.has(plano.id) && plano.status !== 'cancelado') {
          mapAlunos.set(plano.id, { id: plano.id, aluno_id: plano.aluno_id, nome: aluno.nome, foto: aluno.foto_url });
        }

        const partesData = fat.data_vencimento.split('-'); 
        const dataFormatada = `${partesData[2]}/${partesData[1]}`; 
        const dateObj = new Date(`${fat.data_vencimento}T12:00:00`); 

        const servicos = plano.servicos_inclusos || [];
        let categoriaUi = 'Sem Contrato';
        let isHibrido = false;

        if (servicos.length > 1) {
          categoriaUi = 'Híbrido (Combo)';
          isHibrido = true;
        } else if (servicos.length === 1) {
          categoriaUi = servicos[0];
        }

        let statusUi = fat.status; 
        let detalheStatus = fat.tipo_receita === 'avulsa' ? `Extra: ${fat.categoria_avulsa}` : "";
        
        if (fat.status === 'pendente' && fat.tipo_receita !== 'avulsa') {
          const hojeMeioDia = new Date();
          hojeMeioDia.setHours(12,0,0,0);
          const diasDiferenca = Math.ceil((dateObj.getTime() - hojeMeioDia.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasDiferenca <= 5 && diasDiferenca >= 0) {
            statusUi = 'proximo';
            detalheStatus = diasDiferenca === 0 ? "Vence hoje" : `Vence em ${diasDiferenca} dias`;
          } else { detalheStatus = `Venc: ${dataFormatada}`; }
        } else if (fat.status === 'atrasado') {
          const diasAtraso = Math.floor((new Date() - dateObj) / (1000 * 60 * 60 * 24));
          detalheStatus = `${diasAtraso} dias de atraso`;
        } else if (fat.status === 'pago') {
          detalheStatus = fat.tipo_receita === 'avulsa' ? `Extra: ${fat.categoria_avulsa}` : "Pago";
        } else if (['agendada', 'cancelada', 'congelada', 'isenta'].includes(fat.status)) {
          statusUi = fat.status;
          detalheStatus = fat.status.charAt(0).toUpperCase() + fat.status.slice(1);
        }

        return {
          ...fat, 
          nome: aluno.nome || "Aluno", foto: aluno.foto_url, telefone: aluno.telefone,
          servicos_array: servicos,
          modalidadeUi: categoriaUi,
          isHibrido: isHibrido,
          valor: valor, 
          status: statusUi, 
          detalheStatus, dataExibicao: dataFormatada, 
          isExtra: fat.tipo_receita === 'avulsa',
          data_completa: dateObj,
          aluno_dados: aluno 
        };
      });

      setMensalidades(dadosMapeados);
      const alunosArray = Array.from(mapAlunos.values());
      alunosArray.sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunosAtivos(alunosArray);

    } catch (error) { Alert.alert("Erro", "Falha ao carregar os dados financeiros."); } finally { setLoading(false); }
  }, [viewInicio, viewFim]);

  useEffect(() => { setLoading(true); carregarFinanceiro(); }, [carregarFinanceiro]);

  useEffect(() => {
    if (diasPausa && !isNaN(diasPausa)) {
      const data = new Date();
      data.setDate(data.getDate() + parseInt(diasPausa));
      setDataRetornoCalculada(`${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`);
    } else { setDataRetornoCalculada("--/--/----"); }
  }, [diasPausa]);

  const onRefresh = async () => { setRefreshing(true); await carregarFinanceiro(); setRefreshing(false); };

  const alunosFiltrados = mensalidades.filter(item => {
    let passModalidade = true;
    if (modalidadeAtiva === "Consultoria") passModalidade = !item.isHibrido && item.servicos_array?.includes("Consultoria");
    if (modalidadeAtiva === "Presencial") passModalidade = !item.isHibrido && item.servicos_array?.includes("Presencial");
    if (modalidadeAtiva === "Híbrido") passModalidade = item.isHibrido;

    let passStatus = true;
    if (statusAtivo === "Pagos") passStatus = item.status === "pago";
    if (statusAtivo === "Pendentes") passStatus = item.status === "pendente" || item.status === "proximo" || item.status === "agendada";
    if (statusAtivo === "Atrasados") passStatus = item.status === "atrasado";

    return passModalidade && passStatus;
  });

  const alunosExtraFiltrados = alunosAtivos.filter(a => a.nome.toLowerCase().includes(buscaAlunoExtra.toLowerCase()));
  const alunosCongelarFiltrados = alunosAtivos.filter(a => a.nome.toLowerCase().includes(buscaAlunoCongelar.toLowerCase()));

  const totalRecebido = alunosFiltrados.filter(i => i.status === 'pago').reduce((acc, curr) => acc + (Number(curr.valor_pago) || curr.valor), 0);
  const totalPendente = alunosFiltrados.filter(i => i.status === 'pendente' || i.status === 'proximo' || i.status === 'agendada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalAtrasado = alunosFiltrados.filter(i => i.status === 'atrasado').reduce((acc, curr) => acc + curr.valor, 0);
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

  const selecionarMesCalendario = (mesIndex) => {
    setTempMes(mesIndex);
    setTempInicio(new Date(tempAno, mesIndex, 1, 0, 0, 0));
    setTempFim(new Date(tempAno, mesIndex + 1, 0, 23, 59, 59));
  };

  const selecionarDiaCalendario = (dia) => {
    const dataClicada = new Date(tempAno, tempMes, dia);
    if (!tempInicio || (tempInicio && tempFim)) {
      setTempInicio(new Date(tempAno, tempMes, dia, 0, 0, 0));
      setTempFim(null); 
    } 
    else if (tempInicio && !tempFim) {
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
    } else {
      setViewInicio(tempInicio);
      setViewFim(tempFim);
    }
    setModalDataVisivel(false);
  };

  const textoHeaderData = () => {
    if (viewInicio.getDate() === 1 && viewFim.getDate() === new Date(viewInicio.getFullYear(), viewInicio.getMonth() + 1, 0).getDate()) {
      return `${MESES_NOME[viewInicio.getMonth()]} ${viewInicio.getFullYear()}`;
    } else if (viewInicio.getDate() === viewFim.getDate()) {
      return `${viewInicio.getDate()} de ${MESES_NOME[viewInicio.getMonth()]}`;
    } else {
      return `${viewInicio.getDate()}/${MESES_NOME[viewInicio.getMonth()]} - ${viewFim.getDate()}/${MESES_NOME[viewFim.getMonth()]}`;
    }
  };

  const setaMudarMesRapido = (direcao) => {
    const novaData = new Date(viewInicio);
    novaData.setMonth(novaData.getMonth() + direcao);
    setViewInicio(new Date(novaData.getFullYear(), novaData.getMonth(), 1, 0,0,0));
    setViewFim(new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0, 23,59,59));
  };

  const gerarPdfDaTela = async () => {
    if (alunosFiltrados.length === 0) return Alert.alert("Aviso", "Não há dados para exportar com estes filtros.");
    const filtroTexto = modalidadeAtiva !== "Todos" || statusAtivo !== "Todos" ? ` | Filtros: ${modalidadeAtiva} • ${statusAtivo}` : "";
    const html = `
      <html>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333;">
          <div style="border-bottom: 2px solid #FF6B00; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
            <h1 style="margin: 0; color: #111;">Relatório Financeiro</h1>
            <p style="color: #666; font-size: 16px; margin-top: 5px;">Período: ${textoHeaderData()}${filtroTexto}</p>
            <p style="color: #888; font-size: 14px;">Profissional: <strong>${nomePersonal}</strong></p>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; width: 30%; text-align: center; border: 1px solid #EEE;">
              <p style="margin:0; font-size: 12px; color: #666;">RECEBIDO</p><h2 style="margin:5px 0 0 0; color: #00E676;">R$ ${totalRecebido.toFixed(2)}</h2>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; width: 30%; text-align: center; border: 1px solid #EEE;">
              <p style="margin:0; font-size: 12px; color: #666;">A RECEBER</p><h2 style="margin:5px 0 0 0; color: #333;">R$ ${totalPendente.toFixed(2)}</h2>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; width: 30%; text-align: center; border: 1px solid #EEE;">
              <p style="margin:0; font-size: 12px; color: #666;">EM ATRASO</p><h2 style="margin:5px 0 0 0; color: #FF3B30;">R$ ${totalAtrasado.toFixed(2)}</h2>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead><tr style="background-color: #111; color: #FFF; text-align: left;"><th style="padding: 12px;">Aluno</th><th style="padding: 12px;">Serviço</th><th style="padding: 12px;">Vencimento</th><th style="padding: 12px;">Status</th><th style="padding: 12px; text-align: right;">Valor</th></tr></thead>
            <tbody>
              ${alunosFiltrados.map(m => `
                <tr style="border-bottom: 1px solid #EEE;">
                  <td style="padding: 12px; font-weight: bold;">${m.nome}</td><td style="padding: 12px; color: #666;">${m.isExtra ? m.categoria_avulsa : m.modalidadeUi}</td>
                  <td style="padding: 12px;">${new Date(m.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td style="padding: 12px; font-weight: bold; color: ${m.status==='pago'?'#00E676':m.status==='atrasado'?'#FF3B30':'#FFD700'}">${m.status.toUpperCase()}</td>
                  <td style="padding: 12px; text-align: right;">R$ ${(Number(m.valor_pago || m.valor_cobrado)).toFixed(2)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <div style="margin-top: 50px; text-align: center; color: #AAA; font-size: 12px;"><p>Gerado automaticamente pela plataforma <strong>MatchTrainer</strong>.</p></div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) { Alert.alert("Erro", "Não foi possível gerar o PDF."); }
  };

  const confirmarBaixaManual = async () => {
    if (!valorInput) return;
    setProcessando(true);
    try {
      const valorFloat = parseFloat(valorInput.replace(',', '.'));
      await supabase.from('mensalidades').update({ status: 'pago', data_pagamento: new Date().toISOString(), valor_pago: valorFloat, forma_pagamento: formaPgto, observacoes: observacao }).eq('id', faturaSelecionada.id);
      await supabase.from('historico_financeiro_logs').insert([{ personal_id: faturaSelecionada.planos.personal_id, aluno_id: faturaSelecionada.planos.aluno_id, referencia_id: faturaSelecionada.id, tipo_evento: 'PAGAMENTO_RECEBIDO', descricao: `Pagamento de R$ ${valorFloat.toFixed(2)} confirmado via ${formaPgto}.`, metadados: { valor: valorFloat, forma_pagamento: formaPgto, observacoes: observacao } }]);
      
      await completarMissao('primeiro_recebimento');
      
      carregarFinanceiro();
      setEtapaBaixa(2); 
    } catch (e) { Alert.alert("Erro", "Falha ao registrar."); } finally { setProcessando(false); }
  };

  const salvarReceitaExtra = async () => {
    if (!valorInput || !alunoSelecionadoId) return Alert.alert("Atenção", "Selecione o aluno e o valor.");
    setProcessando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const alunoInfo = alunosAtivos.find(a => a.id === alunoSelecionadoId);
      const valorFloat = parseFloat(valorInput.replace(',', '.'));
      const mesReferenciaStr = new Date().toISOString().split('T')[0];

      const { data: novaFatura, error: erroFatura } = await supabase.from('mensalidades').insert([{
        plano_id: alunoSelecionadoId, mes_referencia: mesReferenciaStr, valor_cobrado: valorFloat, valor_pago: valorFloat, data_vencimento: mesReferenciaStr, data_pagamento: new Date().toISOString(), status: 'pago', tipo_receita: 'avulsa', categoria_avulsa: categoriaExtra, forma_pagamento: formaPgto, observacoes: observacao
      }]).select().single();
      if (erroFatura) throw erroFatura;

      await supabase.from('historico_financeiro_logs').insert([{ personal_id: session.user.id, aluno_id: alunoInfo.aluno_id, referencia_id: novaFatura.id, tipo_evento: 'RECEITA_EXTRA_GERADA', descricao: `Venda de ${categoriaExtra} (R$ ${valorFloat.toFixed(2)}) via ${formaPgto}.`, metadados: { valor: valorFloat, categoria: categoriaExtra, forma_pagamento: formaPgto } }]);
      
      await completarMissao('primeiro_recebimento');

      setModalExtraVisivel(false); carregarFinanceiro();
    } catch (e) { Alert.alert("Erro", "Falha ao salvar receita."); } finally { setProcessando(false); }
  };

  const confirmarCongelamento = async () => {
    if (!alunoSelecionadoId || !diasPausa) return Alert.alert("Atenção", "Preencha aluno e dias.");
    let motivoFinal = motivoPausa;
    if (motivoPausa === "Outro") {
      if (!textoOutroMotivo.trim()) return Alert.alert("Atenção", "Por favor, detalhe o motivo da pausa.");
      motivoFinal = `Outro (${textoOutroMotivo})`;
    }
    setProcessando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const alunoInfo = alunosAtivos.find(a => a.id === alunoSelecionadoId);

      await supabase.from('planos').update({ status: 'congelado', observacoes: `[CONGELADO] Motivo: ${motivoFinal} | Retorno Previsto: ${dataRetornoCalculada}` }).eq('id', alunoSelecionadoId);
      await supabase.from('historico_financeiro_logs').insert([{ personal_id: session.user.id, aluno_id: alunoInfo.aluno_id, referencia_id: alunoSelecionadoId, tipo_evento: 'CONTRATO_CONGELADO', descricao: `Plano congelado por ${diasPausa} dias (Motivo: ${motivoFinal}). Retorno previsto: ${dataRetornoCalculada}.`, metadados: { dias: diasPausa, motivo: motivoFinal, data_retorno_prevista: dataRetornoCalculada } }]);

      setModalCongelarVisivel(false); carregarFinanceiro();
      Alert.alert("Sucesso", "Plano congelado com sucesso. O sistema pausará as próximas cobranças.");
    } catch (e) { Alert.alert("Erro", "Falha ao congelar."); } finally { setProcessando(false); }
  };

  const compartilharReciboImage = async () => {
    try {
      const uri = await captureRef(reciboRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (error) { Alert.alert("Erro", "Não foi possível compartilhar a imagem."); }
  };

  const abrirWhatsApp = (telefone, nome, valor, status) => {
    if (!telefone) return Alert.alert("Ops", "O telefone não está cadastrado.");
    const num = telefone.replace(/\D/g, '');
    const msg = status === "atrasado" 
      ? `Fala ${nome.split(' ')[0]}, tudo bem? Passando pra dar um toque sobre a mensalidade que venceu recentemente (R$ ${valor.toFixed(2)}). Consegue ver isso hoje? 💪` 
      : `Fala ${nome.split(' ')[0]}, tudo bem? Lembrete da renovação do nosso plano (R$ ${valor.toFixed(2)}). Qualquer dúvida, avisa! 🚀`;
    Linking.openURL(`whatsapp://send?phone=55${num}&text=${encodeURIComponent(msg)}`);
  };

  const abrirModalBaixa = (fatura) => {
    setFaturaSelecionada(fatura); setValorInput((fatura.valor_pago || fatura.valor).toString()); setFormaPgto(fatura.forma_pagamento || "PIX"); setObservacao(""); setEtapaBaixa(1); setModalBaixaVisivel(true);
  };

  return {
    loading, refreshing, nomePersonal, viewInicio, viewFim, modalDataVisivel, tempAno, tempMes, tempInicio, tempFim,
    modalidadeAtiva, statusAtivo, buscaAlunoExtra, buscaAlunoCongelar, modalBaixaVisivel, faturaSelecionada, valorInput,
    formaPgto, observacao, processando, etapaBaixa, modalExtraVisivel, modalCongelarVisivel, alunoSelecionadoId,
    categoriaExtra, motivoPausa, textoOutroMotivo, diasPausa, dataRetornoCalculada, fabAberto, reciboRef,
    alunosFiltrados, alunosExtraFiltrados, alunosCongelarFiltrados, totalRecebido, totalPendente, totalAtrasado, totalGeral,
    percRecebido, percAReceber, percAtraso, hoje, 
    
    setModalidadeAtiva, setStatusAtivo, abrirCalendarioTopo, selecionarMesCalendario, selecionarDiaCalendario, 
    aplicarFiltroCalendario, setaMudarMesRapido, gerarPdfDaTela, confirmarBaixaManual, salvarReceitaExtra, 
    confirmarCongelamento, compartilharReciboImage, abrirWhatsApp, abrirModalBaixa, setTempAno, setModalDataVisivel, 
    setFabAberto, setModalBaixaVisivel, setValorInput, setFormaPgto, setObservacao, setModalExtraVisivel, setBuscaAlunoExtra, 
    setAlunoSelecionadoId, setCategoriaExtra, setModalCongelarVisivel, setBuscaAlunoCongelar, setMotivoPausa, 
    setTextoOutroMotivo, setDiasPausa, onRefresh, textoHeaderData
  };
}