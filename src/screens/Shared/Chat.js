import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const formatarHora = (dataString) => {
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatarData = (dataString) => {
  const data = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "ontem";
  return data.toLocaleDateString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Chat({ route, navigation }) {
  const { conexaoId, nomeOutro, fotoOutro, tipoUsuarioLogado } = route.params;

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState(null);
  const [statusConexao, setStatusConexao] = useState("em_contato");

  const flatListRef = useRef(null);

  useEffect(() => {
    iniciarChat();

    const canal = supabase
      .channel("chat_" + conexaoId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `conexao_id=eq.${conexaoId}`,
        },
        (payload) => {
          const novaMsg = payload.new;
          setMensagens((prev) => [novaMsg, ...prev]);

          if (novaMsg.remetente_id !== myUserId) {
            marcarComoLida(novaMsg.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [myUserId]);

  const iniciarChat = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setMyUserId(user.id);

      const { data: conexaoData } = await supabase
        .from("conexoes")
        .select("status")
        .eq("id", conexaoId)
        .single();
      if (conexaoData) setStatusConexao(conexaoData.status);

      const { data: msgs, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("conexao_id", conexaoId)
        .order("criado_em", { ascending: false })
        .limit(50);

      if (error) throw error;

      setMensagens(msgs || []);

      if (msgs && msgs.length > 0) {
        const naoLidas = msgs.filter(
          (m) => !m.lida && m.remetente_id !== user.id,
        );
        naoLidas.forEach((m) => marcarComoLida(m.id));
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (msgId) => {
    await supabase.from("mensagens").update({ lida: true }).eq("id", msgId);
  };

  const enviarMensagem = async () => {
    if (!texto.trim() || !myUserId) return;

    const conteudo = texto.trim();
    setTexto("");

    try {
      const { error } = await supabase.from("mensagens").insert([
        {
          conexao_id: conexaoId,
          remetente_id: myUserId,
          tipo_remetente: tipoUsuarioLogado,
          conteudo: conteudo,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  const renderItem = ({ item, index }) => {
    const isMinha = item.remetente_id === myUserId;

    const dataAtual = formatarData(item.criado_em);
    const msgAnteriorNoTempo = mensagens[index + 1];
    const dataAnterior = msgAnteriorNoTempo
      ? formatarData(msgAnteriorNoTempo.criado_em)
      : null;
    const mudouDeDia = dataAtual !== dataAnterior;

    return (
      <View>
        {mudouDeDia && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{dataAtual}</Text>
          </View>
        )}

        <View
          style={[
            styles.bubbleContainer,
            isMinha ? styles.bubbleRight : styles.bubbleLeft,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isMinha ? styles.bubbleTextRight : styles.bubbleTextLeft,
            ]}
          >
            {item.conteudo}
          </Text>
          <View style={styles.timeRow}>
            <Text
              style={[
                styles.timeText,
                isMinha ? styles.timeTextRight : styles.timeTextLeft,
              ]}
            >
              {formatarHora(item.criado_em)}
            </Text>
            {isMinha && (
              <Ionicons
                name={item.lida ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.lida ? "#00BFFF" : "rgba(0,0,0,0.5)"}
                style={{ marginLeft: 4, marginTop: 1 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderListHeader = () => {
    if (mensagens.length === 0 && statusConexao === "em_contato") {
      return (
        <View style={styles.autoMessageCard}>
          <Text style={styles.autoMessageText}>
            👋 Olá {nomeOutro}! Vi seu perfil no PersonalMatch e gostaria de
            saber mais sobre seus serviços.
          </Text>
          <Text style={styles.autoMessageHint}>
            (Mensagem automática de início de contato)
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* HEADER DO CHAT */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <Image
            source={{ uri: fotoOutro || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.headerName} numberOfLines={1}>
              {nomeOutro}
            </Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      statusConexao === "ativo"
                        ? "#4CAF50"
                        : theme.colors.primary,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {statusConexao === "ativo"
                  ? "Aluno Ativo"
                  : statusConexao === "em_contato"
                    ? "Novo Contato"
                    : "Inativo"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderListHeader}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={theme.colors.textSecondary}
              value={texto}
              onChangeText={setTexto}
              multiline={true}
              maxHeight={100}
            />
            <TouchableOpacity
              style={[styles.btnSend, !texto.trim() && { opacity: 0.4 }]}
              onPress={enviarMensagem}
              disabled={!texto.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color="#000"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  btnVoltar: { padding: 5, marginRight: 10 },
  headerProfile: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  headerName: {
    fontFamily: theme.fonts.title,
    fontSize: 20,
    color: "#FFF",
    letterSpacing: 0.5,
  },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textTransform: "capitalize",
  },

  listContent: { paddingHorizontal: 16, paddingVertical: 10 },
  dateSeparator: {
    alignSelf: "center",
    backgroundColor: "#222",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    my: 10,
    marginVertical: 15,
  },
  dateSeparatorText: { color: "#888", fontSize: 11, fontWeight: "bold" },

  bubbleContainer: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: "#333",
  },

  bubbleText: { fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 20 },
  bubbleTextRight: { color: "#000" },
  bubbleTextLeft: { color: "#E0E0E0" },

  timeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: { fontSize: 10, fontFamily: theme.fonts.body },
  timeTextRight: { color: "rgba(0,0,0,0.6)" },
  timeTextLeft: { color: theme.colors.textSecondary },

  autoMessageCard: {
    alignSelf: "center",
    backgroundColor: "rgba(255,107,0,0.1)",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
    marginVertical: 20,
    width: "90%",
  },
  autoMessageText: {
    color: "#FFF",
    fontFamily: theme.fonts.body,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  autoMessageHint: {
    color: theme.colors.primary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.8,
  },

  inputArea: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#121212",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontFamily: theme.fonts.body,
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  btnSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
