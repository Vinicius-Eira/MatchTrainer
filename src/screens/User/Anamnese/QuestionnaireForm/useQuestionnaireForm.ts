import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useQuestionnaireForm(navigation: any, route: any) {
  const { id: questionarioIdUrl, titulo: tituloRoute, conexaoId, leituraModoPersonal } = route.params || {};
  
  const [titulo, setTitulo] = useState(tituloRoute || "Carregando...");
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [questionarioId, setQuestionarioId] = useState<string | null>(questionarioIdUrl || null);

  useEffect(() => {
    let isMounted = true;
    
    const carregarDados = async () => {
      let queryId = questionarioId;

      if (leituraModoPersonal && conexaoId) {
        const { data: questPersonal, error: errPersonal } = await supabase
          .from('questionarios')
          .select('id')
          .eq('conexao_id', conexaoId)
          //.in('status', ['respondido', 'concluido']) 
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (questPersonal) {
          queryId = questPersonal.id;
          if (isMounted) setQuestionarioId(questPersonal.id);
        } else {
          if (isMounted) {
             Alert.alert("Aviso", "Este aluno ainda não enviou respostas para a anamnese.");
             navigation.goBack();
          }
          return;
        }
      }

      if (!queryId) return;
      
      const { data, error } = await supabase
        .from('questionarios')
        .select('titulo, perguntas, respostas')
        .eq('id', queryId)
        .single();

      if (data && isMounted) {
        setTitulo(leituraModoPersonal ? `Respostas: ${data.titulo}` : (data.titulo || "Anamnese"));
        setPerguntas(data.perguntas || []);
        
        if (data.respostas) {
           setRespostas(data.respostas);
        }
      }
    };

    carregarDados();
    return () => { isMounted = false; };
  }, [questionarioIdUrl, conexaoId]);

  const atualizarResposta = (idPergunta: string, valor: any) => {
    if (leituraModoPersonal) return; 
    setRespostas(prev => ({ ...prev, [idPergunta]: valor }));
  };

  const validarEEnviar = async () => {
    if (leituraModoPersonal) return navigation.goBack();

    const faltam = perguntas.filter(p => p.obrigatorio && (respostas[p.id] === undefined || respostas[p.id] === ""));
    if (faltam.length > 0) return Alert.alert("Atenção", "Responda todas as perguntas obrigatórias antes de enviar.");

    setEnviando(true);
    try {
      const { error: updateError } = await supabase
        .from('questionarios')
        .update({ 
          status: 'respondido', 
          respondido_em: new Date().toISOString(),
          respostas: respostas 
        })
        .eq('id', questionarioId);

      if (updateError) throw updateError;
      Alert.alert("Check-in Enviado! ✅", "Respostas salvas.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Erro", "Problema ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  const voltar = () => {
    if (leituraModoPersonal) return navigation.goBack();
    Alert.alert("Cancelar Check-in?", "Suas respostas não serão salvas.", [
      { text: "Continuar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.goBack() }
    ]);
  };

  return { titulo, perguntas, respostas, atualizarResposta, validarEEnviar, voltar, enviando, leituraModoPersonal };
}