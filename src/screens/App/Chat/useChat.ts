import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../../../services/supabase";

async function buscarStatusConexao(conexaoId: string) {
  const { data } = await supabase.from("conexoes").select("status").eq("id", conexaoId).maybeSingle();
  return data?.status || null;
}

async function buscarDadosIniciaisChat(conexaoId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const status = await buscarStatusConexao(conexaoId);

  const { data: msgs, error } = await supabase
    .from("mensagens")
    .select("*")
    .eq("conexao_id", conexaoId)
    .order("criado_em", { ascending: false })
    .limit(50);

  if (error) throw error;

  if (msgs && msgs.length > 0 && user) {
    const naoLidas = msgs.filter((m) => !m.lida && m.remetente_id !== user.id);
    naoLidas.forEach((m) => {
      supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("id", m.id)
        .then(() => {});
    });
  }

  return { userId: user?.id || null, status, msgs: msgs || [] };
}

export function useChat(route: any, navigation: any) {
  const { conexaoId, nomeOutro, fotoOutro, tipoUsuarioLogado } = route.params;

  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [statusConexao, setStatusConexao] = useState("em_contato");

  const [modalParceriaVisivel, setModalParceriaVisivel] = useState(false);
  const [solicitandoParceria, setSolicitandoParceria] = useState(false);

  const flatListRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      buscarStatusConexao(conexaoId)
        .then((status) => {
          if (ativo && status) setStatusConexao(status);
        })
        .catch(() => {});
      return () => {
        ativo = false;
      };
    }, [conexaoId])
  );

  useEffect(() => {
    let ativo = true;

    buscarDadosIniciaisChat(conexaoId)
      .then((res) => {
        if (!ativo) return;
        if (res.userId) setMyUserId(res.userId);
        if (res.status) setStatusConexao(res.status);
        setMensagens(res.msgs);
      })
      .catch((error) => {
        console.error("Erro ao carregar mensagens:", error);
      })
      .finally(() => {
        if (ativo) setLoading(false);
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
          if (myUserId && novaMsg.remetente_id !== myUserId) {
            supabase
              .from("mensagens")
              .update({ lida: true })
              .eq("id", novaMsg.id)
              .then(() => {});
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conexoes", filter: `id=eq.${conexaoId}` },
        (payload) => {
          if (payload.new?.status) {
            setStatusConexao(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, [conexaoId, myUserId]);

  const enviarMensagem = async (textoDesejado: string | null = null) => {
    const conteudo = textoDesejado || texto.trim();
    if (!conteudo || !myUserId) return;

    if (!textoDesejado) setTexto("");

    try {
      const { data, error } = await supabase
        .from("mensagens")
        .insert([{ conexao_id: conexaoId, remetente_id: myUserId, tipo_remetente: tipoUsuarioLogado, conteudo }])
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

  const handleAlunoSolicitaParceria = () => {
    setModalParceriaVisivel(true);
  };

  const confirmarSolicitacaoParceria = async () => {
    setSolicitandoParceria(true);
    try {
      const { error } = await supabase
        .from("conexoes")
        .update({ status: "aguardando_personal" })
        .eq("id", conexaoId);

      if (error) throw error;

      setStatusConexao("aguardando_personal");
      setModalParceriaVisivel(false);
      await enviarMensagem(
        "🚀 Gostei da proposta! Enviei uma solicitação oficial para iniciarmos nossa parceria."
      );
    } catch (err) {
      Alert.alert("Erro", "Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setSolicitandoParceria(false);
    }
  };

  const handleSairConta = () => {
    Alert.alert("Sair da conta", "Deseja desconectar sua conta deste dispositivo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const irParaContrato = () => {
    navigation.navigate("ContratoMatch", {
      conexaoId,
      nomeAluno: nomeOutro,
    });
  };

  const irParaPropostaAluno = () => {
    navigation.navigate("PropostaAluno", {
      conexaoId,
    });
  };

  return {
    state: {
      mensagens,
      texto,
      loading,
      myUserId,
      statusConexao,
      flatListRef,
      nomeOutro,
      fotoOutro,
      tipoUsuarioLogado,
      conexaoId,
      modalParceriaVisivel,
      solicitandoParceria,
    },
    actions: {
      setTexto,
      setModalParceriaVisivel,
      enviarMensagem,
      handleAlunoSolicitaParceria,
      confirmarSolicitacaoParceria,
      handleSairConta,
      irParaContrato,
      irParaPropostaAluno,
      navigation,
    },
  };
}