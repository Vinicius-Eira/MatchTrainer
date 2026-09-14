import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export type QuestionType = 'escala' | 'sim_nao' | 'numero' | 'texto';

export function useQuestionnaireForm(navigation: any, route: any) {
  const { id: questionarioId, titulo: tituloRoute } = route.params || {};
  const [titulo, setTitulo] = useState(tituloRoute || "Carregando...");
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const carregarPerguntas = async () => {
      if (!questionarioId) return;
      const { data, error } = await supabase
        .from('questionario_perguntas')
        .select('*')
        .eq('questionario_id', questionarioId)
        .order('ordem', { ascending: true });

      if (data && isMounted) {
        setPerguntas(data);
      }
    };

    carregarPerguntas();
    return () => { isMounted = false; };
  }, [questionarioId]);

  const atualizarResposta = (idPergunta: string, valor: any) => {
    setRespostas(prev => ({ ...prev, [idPergunta]: valor }));
  };

  const validarEEnviar = async () => {
    const faltam = perguntas.filter(p => p.obrigatorio && respostas[p.id] === undefined);
    
    if (faltam.length > 0) {
      Alert.alert("Atenção", "Por favor, responda todas as perguntas obrigatórias antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const respostasFormatadas = Object.keys(respostas).map(perguntaId => ({
        questionario_id: questionarioId,
        pergunta_id: perguntaId,
        valor: String(respostas[perguntaId])
      }));

      if (respostasFormatadas.length > 0) {
        const { error: insertError } = await supabase.from('questionario_respostas').insert(respostasFormatadas);
        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase
        .from('questionarios')
        .update({ status: 'respondido', respondido_em: new Date().toISOString() })
        .eq('id', questionarioId);

      if (updateError) throw updateError;

      Alert.alert(
        "Check-in Enviado! ✅", 
        "Suas respostas foram salvas e enviadas para o seu personal.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log("Erro ao enviar:", error);
      Alert.alert("Erro", "Ocorreu um problema ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const voltar = () => {
    Alert.alert(
      "Cancelar Check-in?", 
      "Se você sair agora, suas respostas não serão salvas.",
      [
        { text: "Continuar respondendo", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };

  return { titulo, perguntas, respostas, atualizarResposta, validarEEnviar, voltar, enviando };
}