import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase"; 

export function useChat(route: any, navigation: any) {
  const { conexaoId, nomeOutro, fotoOutro, tipoUsuarioLogado } = route.params;

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [statusConexao, setStatusConexao] = useState("em_contato");

  const flatListRef = useRef<any>(null);

  const marcarComoLida = async (msgId: string) => {
    await supabase.from("mensagens").update({ lida: true }).eq("id", msgId);
  };

  const iniciarChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMyUserId(user.id);

      const { data: conexaoData } = await supabase.from("conexoes").select("status").eq("id", conexaoId).single();
      if (conexaoData) setStatusConexao(conexaoData.status);

      const { data: msgs, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("conexao_id", conexaoId)
        .order("criado_em", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMensagens(msgs || []);

      if (msgs && msgs.length > 0 && user) {
        const naoLidas = msgs.filter((m) => !m.lida && m.remetente_id !== user.id);
        naoLidas.forEach((m) => marcarComoLida(m.id));
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (textoDesejado: string | null = null) => {
    const conteudo = textoDesejado || texto.trim();
    if (!conteudo || !myUserId) return;

    if (!textoDesejado) setTexto("");

    try {
      const { data, error } = await supabase
        .from("mensagens")
        .insert([{ conexao_id: conexaoId, remetente_id: myUserId, tipo_remetente: tipoUsuarioLogado, conteudo: conteudo }])
        .select()
        .single();

      if (error) throw error;

      setMensagens((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [data, ...prev];
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (isMounted) iniciarChat();
    });

    const canal = supabase
      .channel("chat_sync_" + conexaoId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens", filter: `conexao_id=eq.${conexaoId}` },
        (payload) => {
          const novaMsg = payload.new;
          setMensagens((prev) => {
            if (prev.some((m) => m.id === novaMsg.id)) return prev;
            return [novaMsg, ...prev];
          });
          if (novaMsg.remetente_id !== myUserId) {
            marcarComoLida(novaMsg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conexoes", filter: `id=eq.${conexaoId}` },
        (payload) => {
          setStatusConexao(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      isMounted = false; 
      supabase.removeChannel(canal);
    };
  }, [myUserId]);

  const handleAlunoSolicitaParceria = () => {
    Alert.alert(
      "Solicitar Parceria",
      `Deseja enviar uma solicitação oficial para ${nomeOutro} assumir seu treinamento?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Solicitar",
          onPress: async () => {
            try {
              const { error } = await supabase.from("conexoes").update({ status: "aguardando_personal" }).eq("id", conexaoId);
              if (error) throw error;

              setStatusConexao("aguardando_personal");
              await enviarMensagem("🚀 Gostei da proposta! Enviei uma solicitação oficial para iniciarmos nossa parceria.");
            } catch (err) {
              Alert.alert("Erro", "Não foi possível enviar a solicitação. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  const irParaContrato = () => {
    navigation.navigate("AdicionarAluno", {
      conexaoId: conexaoId,
      nomeAluno: nomeOutro
    });
  };

  return {
    state: {
      mensagens, texto, loading, myUserId, statusConexao, flatListRef,
      nomeOutro, fotoOutro, tipoUsuarioLogado, conexaoId
    },
    actions: {
      setTexto, enviarMensagem, handleAlunoSolicitaParceria, irParaContrato, navigation
    }
  }
};