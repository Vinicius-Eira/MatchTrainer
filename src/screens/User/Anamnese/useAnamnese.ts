import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";

export function useAnamnese(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [temPendente, setTemPendente] = useState(false);
  const [pendente, setPendente] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const carregarQuestionarios = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        const { data: conexao, error: errConexao } = await supabase
          .from('conexoes')
          .select('id')
          .eq('usuario_id', user.id) 
          .in('status', ['aluno_ativo', 'aguardando_assinatura'])
          .order('atualizado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (errConexao || !conexao || !isMounted) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data: forms, error: errForms } = await supabase
          .from('questionarios')
          .select(`
            *,
            questionario_perguntas (id)
          `)
          .eq('conexao_id', conexao.id)
          .order('created_at', { ascending: false });

        if (errForms) throw errForms;

        if (forms && isMounted) {
          const pendentes = forms.filter(f => f.status === 'pendente');
          
          if (pendentes.length > 0) {
            setTemPendente(true);
            
            const qtd = pendentes[0].perguntas?.length || pendentes[0].questionario_perguntas?.length || 0;
            
            setPendente({
              id: pendentes[0].id,
              titulo: pendentes[0].titulo || "Questionário Inicial",
              descricao: pendentes[0].descricao || "Por favor, responda para que o personal monte seu planejamento.",
              dataEnvio: new Date(pendentes[0].created_at || new Date()).toLocaleDateString('pt-BR'),
              qtdPerguntas: qtd
            });
          } else {
            setTemPendente(false);
          }

          const respondidos = forms.filter(f => f.status === 'respondido' || f.status === 'concluido');
          setHistorico(respondidos.map(f => ({
            id: f.id,
            titulo: f.titulo || "Anamnese",
            dataResposta: f.respondido_em ? new Date(f.respondido_em).toLocaleDateString('pt-BR') : "Concluído",
            status: "Respondido"
          })));
        }
      } catch (error) {
        console.log("Erro ao carregar questionários:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarQuestionarios();

    return () => {
      isMounted = false;
    };
  }, []);

  const abrirQuestionario = (id: string, titulo: string) => {
    navigation.navigate("QuestionnaireForm", { id, titulo });
  };

  const voltar = () => navigation.goBack();

  return { loading, temPendente, pendente, historico, abrirQuestionario, voltar };
}