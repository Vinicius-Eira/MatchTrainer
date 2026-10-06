import { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { supabase } from "../../../../services/supabase";

interface UseFeedbackPersonalProps {
  navigation: {
    goBack: () => void;
  };
}

export function useFeedbackPersonal({ navigation }: UseFeedbackPersonalProps) {
  const [categoria, setCategoria] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [notaApp, setNotaApp] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const categorias: string[] = [
    "Quero mais visibilidade",
    "Preciso de mais ferramentas",
    "Bug no app",
    "Sugestão para o CRM",
    "Dificuldade no cadastro",
    "Outro",
  ];

  const handleEnviar = async (): Promise<void> => {
    Keyboard.dismiss();

    if (!categoria) {
      Alert.alert(
        "Atenção",
        "Selecione uma categoria sobre o seu feedback."
      );
      return;
    }
    if (!mensagem.trim()) {
      Alert.alert(
        "Atenção",
        "Por favor, detalhe sua sugestão ou problema."
      );
      return;
    }
    if (notaApp === 0) {
      Alert.alert(
        "Atenção",
        "Avalie sua experiência geral com o aplicativo."
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("feedbacks_app").insert({
        usuario_id: user?.id,
        tipo_usuario: "personal",
        categoria: categoria,
        mensagem: mensagem.trim(),
        nota_app: notaApp,
      });

      if (error) throw error;

      Alert.alert(
        "Feedback Enviado!",
        "Obrigado! Sua opinião vai direto para a equipe de desenvolvimento do MatchTrainer.",
        [{ text: "Voltar ao Dashboard", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o feedback. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    categoria,
    setCategoria,
    mensagem,
    setMensagem,
    notaApp,
    setNotaApp,
    loading,
    categorias,
    handleEnviar,
  };
}