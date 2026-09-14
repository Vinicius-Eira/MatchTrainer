import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";

export type FinanceStatus = 'em_dia' | 'pendente' | 'atrasado';

export function useFinance(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [statusAtual, setStatusAtual] = useState<FinanceStatus>('em_dia');
  const [detalhes, setDetalhes] = useState({
    valor: "R$ 0,00",
    vencimento: "--",
    chavePix: "",
    nomePersonal: "Seu Treinador"
  });
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true; 

    const carregarDadosFinanceiros = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: conexao, error: errConexao } = await supabase
          .from('conexoes')
          .select('id, personal_id')
          .eq('aluno_id', user.id)
          .single();

        if (errConexao || !conexao) throw new Error("Conexão não encontrada");

        const { data: personal } = await supabase
          .from('perfis') 
          .select('nome, chave_pix')
          .eq('id', conexao.personal_id)
          .single();

        const { data: contrato } = await supabase
          .from('financeiro_contratos')
          .select('*')
          .eq('conexao_id', conexao.id)
          .eq('status', 'ativo')
          .single();

        if (!contrato) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data: faturas } = await supabase
          .from('financeiro_faturas')
          .select('*')
          .eq('contrato_id', contrato.id)
          .order('data_vencimento', { ascending: false });

        if (faturas && faturas.length > 0 && isMounted) {
          const faturaAtual = faturas[0];
          setStatusAtual(faturaAtual.status as FinanceStatus);

          const [ano, mes, dia] = faturaAtual.data_vencimento.split('-');
          const dataVenc = new Date(Number(ano), Number(mes) - 1, Number(dia));
          
          setDetalhes({
            valor: `R$ ${faturaAtual.valor.toFixed(2).replace('.', ',')}`,
            vencimento: dataVenc.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
            chavePix: personal?.chave_pix || "Chave PIX não cadastrada",
            nomePersonal: personal?.nome || "Seu Treinador"
          });

          const histFormatado = faturas
            .filter(f => f.status === 'pago') 
            .map(f => {
              const [a, m, d] = f.data_vencimento.split('-');
              const dVenc = new Date(Number(a), Number(m) - 1, Number(d));
              return {
                id: f.id,
                mes: dVenc.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                valor: `R$ ${f.valor.toFixed(2).replace('.', ',')}`,
                dataPagamento: f.data_pagamento ? new Date(f.data_pagamento).toLocaleDateString('pt-BR') : '--'
              };
            });
          
          setHistorico(histFormatado);
        }

      } catch (error) {
        console.log("Erro ao carregar financeiro:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarDadosFinanceiros();

    return () => {
      isMounted = false;
    };
  }, []);

  const copiarPix = () => {
    if (!detalhes.chavePix || detalhes.chavePix === "Chave PIX não cadastrada") {
        Alert.alert("Aviso", "O personal ainda não cadastrou a chave PIX.");
        return;
    }
    Alert.alert("PIX Copiado!", `A chave de ${detalhes.nomePersonal} foi copiada para sua área de transferência.\n\nChave: ${detalhes.chavePix}`);
  };

  const voltar = () => navigation.goBack();

  return {
    loading,
    statusAtual,
    detalhes,
    historico,
    copiarPix,
    voltar
  };
}