import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";
import { useOnboarding } from "../../../../hooks/useOnboarding"; 

export function usePainelCrescimento() {
  const { completarMissao } = useOnboarding();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState(null);
  
  const [modalMetaVisivel, setModalMetaVisivel] = useState(false);
  const [novaMetaValor, setNovaMetaValor] = useState("");
  const [salvandoMeta, setSalvandoMeta] = useState(false);

  const [modalInfoVisivel, setModalInfoVisivel] = useState(false);
  const [infoDados, setInfoDados] = useState({ titulo: "", texto: "", dica: "" });

  const carregarDados = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase.rpc('get_business_kpis', { p_personal_id: session.user.id });
      if (error) throw error;
      setKpis(data);
    } catch (error) {
      console.error("Erro ao puxar métricas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);
  const onRefresh = () => { setRefreshing(true); carregarDados(); };

  const salvarNovaMeta = async () => {
    if (!novaMetaValor) return;
    setSalvandoMeta(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const valorFloat = parseFloat(novaMetaValor.replace(',', '.'));
      
      const { data: metaAtual } = await supabase.from('metas_negocio').select('id').eq('personal_id', session.user.id).eq('tipo', 'faturamento').single();
      
      if (metaAtual) await supabase.from('metas_negocio').update({ alvo: valorFloat }).eq('id', metaAtual.id);
      else await supabase.from('metas_negocio').insert([{ personal_id: session.user.id, tipo: 'faturamento', alvo: valorFloat }]);
      
      await completarMissao('meta_definida');

      setModalMetaVisivel(false); setNovaMetaValor(""); carregarDados();
    } catch (error) { Alert.alert("Erro", "Não foi possível salvar a meta."); } finally { setSalvandoMeta(false); }
  };

  const abrirInfo = (titulo, texto, dica) => {
    setInfoDados({ titulo, texto, dica });
    setModalInfoVisivel(true);
  };

  const mrrAtual = kpis?.mrr || 0;
  const mrrAnterior = kpis?.mrr_anterior || 0;
  let crescimentoPct = 0;
  if (mrrAnterior > 0) crescimentoPct = (((mrrAtual - mrrAnterior) / mrrAnterior) * 100);
  else if (mrrAtual > 0) crescimentoPct = 100;

  const metaObj = kpis?.metas?.find(m => m.tipo === 'faturamento');
  const valorMeta = metaObj ? parseFloat(metaObj.alvo) : null;
  let diasParaMeta = null;

  if (valorMeta && mrrAtual < valorMeta) {
    const crescimentoMensalAbsoluto = mrrAtual - mrrAnterior;
    if (crescimentoMensalAbsoluto > 0) {
      const valorFaltante = valorMeta - mrrAtual;
      const mesesParaMeta = valorFaltante / crescimentoMensalAbsoluto;
      diasParaMeta = Math.ceil(mesesParaMeta * 30);
    }
  }

  const gerarInsightIA = () => {
    if (!kpis) return null;
    const taxaConv = kpis.funil?.leads > 0 ? (kpis.funil?.fechados / kpis.funil?.leads) * 100 : 0;
    const tempoResp = kpis.funil?.tempo_resposta_horas || 0;
    const inadimplencia = kpis.receita_total > 0 ? (kpis.receita_atraso / kpis.receita_total) * 100 : 0;

    if (inadimplencia > 10) return { icone: "warning", cor: "#FF3B30", titulo: "Alerta de Fluxo de Caixa", texto: `Sua inadimplência está em ${inadimplencia.toFixed(1)}%. Antes de buscar novos alunos, cobre os R$ ${kpis.receita_atraso} que estão atrasados para garantir seu MRR.`};
    
    if (kpis.funil?.leads > 0 && taxaConv < 25) {
       if (tempoResp > 2) return { icone: "time", cor: "#FFD700", titulo: "Oportunidade Comercial", texto: `Você está perdendo vendas. Seu tempo médio de resposta é de ${tempoResp}h. Responder novos Matches em menos de 30 minutos dobra sua chance de conversão.`};
       return { icone: "chatbubbles", cor: "#0A84FF", titulo: "Ajuste sua Oferta", texto: "Muitos Matches, mas poucos fechamentos. Tente enviar um áudio ou oferecer uma chamada de vídeo de 10 min para os novos leads para aumentar sua conversão."};
    }

    if (crescimentoPct > 0) return { icone: "rocket", cor: "#00E676", titulo: "Crescimento Saudável", texto: `Sua receita cresceu ${crescimentoPct.toFixed(1)}% este mês e sua retenção está ótima. Continue pedindo feedback e ofereça planos trimestrais para travar essa receita.`};
    
    return { icone: "bulb", cor: "#A020F0", titulo: "Dica de Crescimento", texto: "Para aumentar seu ticket médio e bater sua meta mais rápido, experimente oferecer um serviço 'Premium' (ex: Consultoria + 1 encontro presencial por mês)." };
  };

  return {
    loading, refreshing, kpis, onRefresh, modalMetaVisivel, setModalMetaVisivel, novaMetaValor, setNovaMetaValor, salvandoMeta, salvarNovaMeta,
    metricas: { mrrAtual, mrrAnterior, crescimentoPct, valorMeta, diasParaMeta },
    modalInfoVisivel, setModalInfoVisivel, infoDados, abrirInfo,
    insightIA: gerarInsightIA()
  };
};