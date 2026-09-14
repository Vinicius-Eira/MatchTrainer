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

        const { data: conexao } = await supabase
          .from('conexoes')
          .select('id')
          .eq('aluno_id', user.id)
          .single();

        if (!conexao || !isMounted) return;

        const { data: forms } = await supabase
          .from('questionarios')
          .select(`
            *,
            questionario_perguntas (id)
          `)
          .eq('conexao_id', conexao.id)
          .order('created_at', { ascending: false });

        if (forms && isMounted) {
          const pendentes = forms.filter(f => f.status === 'pendente');
          if (pendentes.length > 0) {
            setTemPendente(true);
            setPendente({
              id: pendentes[0].id,
              titulo: pendentes[0].titulo,
              descricao: pendentes[0].descricao,
              dataEnvio: new Date(pendentes[0].created_at).toLocaleDateString('pt-BR'),
              qtdPerguntas: pendentes[0].questionario_perguntas?.length || 0
            });
          } else {
            setTemPendente(false);
          }

          const respondidos = forms.filter(f => f.status === 'respondido');
          setHistorico(respondidos.map(f => ({
            id: f.id,
            titulo: f.titulo,
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

    const timerId = setTimeout(() => { carregarQuestionarios(); }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);

  const abrirQuestionario = (id: string, titulo: string) => {
    navigation.navigate("QuestionnaireForm", { id, titulo });
  };

  const voltar = () => navigation.goBack();

  return { loading, temPendente, pendente, historico, abrirQuestionario, voltar };
}