import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
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
          .eq('usuario_id', user.id)
          .in('status', ['aluno_ativo', 'aguardando_assinatura', 'pendente']) // AJUSTADO AQUI
          .order('atualizado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (errConexao || !conexao) throw new Error("Conexão não encontrada");

        const { data: personal } = await supabase
          .from('personals') 
          .select('nome, chave_pix')
          .eq('id', conexao.personal_id)
          .maybeSingle();

        const { data: contrato, error: errContrato } = await supabase
          .from('planos')
          .select('*')
          .eq('conexao_id', conexao.id)
          .in('status', ['ativo', 'aguardando_assinatura', 'pendente']) // AJUSTADO AQUI
          .maybeSingle();

        if (errContrato || !contrato || !contrato.valor_mensal) {
          setStatusAtual('pendente');
          setDetalhes(prev => ({ 
            ...prev, 
            valor: "Sem Contrato", 
            vencimento: "Aguardando Personal",
            nomePersonal: personal?.nome || "Seu Treinador"
          }));
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          const valorFloat = contrato.valor_mensal;
          const diaVencimento = contrato.dia_vencimento || 10;

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0); 

          let mesVencimento = hoje.getMonth();
          let anoVencimento = hoje.getFullYear();

          if (hoje.getDate() > diaVencimento + 5) {
             mesVencimento += 1;
             if (mesVencimento > 11) {
                mesVencimento = 0;
                anoVencimento += 1;
             }
          }

          const dataVenc = new Date(anoVencimento, mesVencimento, diaVencimento, 0, 0, 0, 0);
          
          let novoStatus: FinanceStatus = 'em_dia';
          const diffTempo = dataVenc.getTime() - hoje.getTime();
          const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

          if (diffDias < 0) {
             novoStatus = 'atrasado';
          } else if (diffDias <= 5) {
             novoStatus = 'pendente';
          }

          setStatusAtual(novoStatus);
          
          setDetalhes({
            valor: `R$ ${valorFloat.toFixed(2).replace('.', ',')}`,
            vencimento: dataVenc.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
            chavePix: personal?.chave_pix || "Chave não informada no perfil",
            nomePersonal: personal?.nome || "Seu Treinador"
          });

          const { data: faturas } = await supabase
            .from('historico_financeiro_logs')
            .select('*')
            .eq('referencia_id', contrato.id)
            .eq('tipo_evento', 'PAGAMENTO_CONFIRMADO')
            .order('criado_em', { ascending: false });

          if (faturas && faturas.length > 0) {
            const histFormatado = faturas.map(f => {
              const d = new Date(f.criado_em);
              return {
                id: f.id,
                mes: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                valor: `R$ ${f.metadados?.valor ? Number(f.metadados.valor).toFixed(2).replace('.', ',') : valorFloat.toFixed(2).replace('.', ',')}`,
                dataPagamento: d.toLocaleDateString('pt-BR')
              };
            });
            setHistorico(histFormatado);
          }
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

  const copiarPix = async () => {
    if (!detalhes.chavePix || detalhes.chavePix === "Chave não informada no perfil") {
        Alert.alert("Aviso", "O personal ainda não cadastrou a chave PIX no perfil dele. Peça no chat!");
        return;
    }
    await Clipboard.setStringAsync(detalhes.chavePix);
    Alert.alert("PIX Copiado!", `A chave de ${detalhes.nomePersonal} foi copiada para sua área de transferência.\n\nChave: ${detalhes.chavePix}`);
  };

  const voltar = () => navigation.goBack();

  return { loading, statusAtual, detalhes, historico, copiarPix, voltar };
}