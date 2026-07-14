import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  if (data.toDateString() === ontem.toDateString()) return "Ontem";
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
      .channel("chat_sync_" + conexaoId)
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
          setMensagens((prev) => {
            if (prev.some((m) => m.id === novaMsg.id)) return prev;
            return [novaMsg, ...prev];
          });
          if (novaMsg.remetente_id !== myUserId) {
            marcarComoLida(novaMsg.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conexoes",
          filter: `id=eq.${conexaoId}`,
        },
        (payload) => {
          setStatusConexao(payload.new.status);
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

  const enviarMensagem = async (textoDesejado = null) => {
    const conteudo = textoDesejado || texto.trim();
    if (!conteudo || !myUserId) return;

    if (!textoDesejado) setTexto("");

    try {
      const { data, error } = await supabase
        .from("mensagens")
        .insert([
          {
            conexao_id: conexaoId,
            remetente_id: myUserId,
            tipo_remetente: tipoUsuarioLogado,
            conteudo: conteudo,
          },
        ])
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
    Alert.alert(
      "Solicitar Parceria",
      `Deseja enviar uma solicitação oficial para ${nomeOutro} assumir seu treinamento?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Solicitar",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("conexoes")
                .update({ status: "aguardando_personal" })
                .eq("id", conexaoId);

              if (error) throw error;

              setStatusConexao("aguardando_personal");
              await enviarMensagem("🚀 Gostei da proposta! Enviei uma solicitação oficial para iniciarmos nossa parceria.");
            } catch (err) {
              console.error("Erro Supabase:", err);
              Alert.alert("Erro", "Não foi possível enviar a solicitação. Verifique se o vínculo antigo foi completamente resetado.");
            }
          },
        },
      ],
    );
  };

  const handlePersonalAceita = async () => {
    try {
      await supabase
        .from("conexoes")
        .update({ status: "aluno_ativo" })
        .eq("id", conexaoId);
        
      setStatusConexao("aluno_ativo");
      await enviarMensagem("✅ Solicitação aceita! Parceria fechada de forma oficial. Vamos com tudo buscar seus resultados! 💪🚀");
      Alert.alert("Sucesso! 🎉", "Parceria oficializada. O aluno já foi adicionado à sua lista de ativos.");
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Erro", "Não foi possível aceitar a solicitação.");
    }
  };

  const handlePersonalRecusa = () => {
    Alert.alert(
      "Recusar Aluno",
      "Tem certeza que deseja recusar essa solicitação? A conexão será arquivada.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Recusar",
          style: "destructive",
          onPress: async () => {
            await supabase.from("conexoes").update({ status: "recusado" }).eq("id", conexaoId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderDynamicIsland = () => {
    if (loading) return null;

    if (tipoUsuarioLogado === "aluno" && ["pendente", "em_contato", "lead"].includes(statusConexao)) {
      if (mensagens.length === 0) return null; 

      return (
        <View style={styles.islandContainer}>
          <LinearGradient colors={["rgba(255,107,0,0.15)", theme.colors.backgroundPure]} style={[styles.islandCard, { borderColor: "rgba(255,107,0,0.3)" }]}>
            <View style={styles.islandHeader}>
              <View style={styles.iconCirclePrimary}><MaterialCommunityIcons name="handshake" size={18} color={theme.colors.primary} /></View>
              <Text style={styles.islandTitleVIP}>Gostou da proposta?</Text>
            </View>
            <Text style={styles.islandSubtitleVIP}>Se vocês já alinharam os detalhes, envie uma solicitação para oficializar o treino.</Text>
            <TouchableOpacity style={styles.btnIslandVIP} onPress={handleAlunoSolicitaParceria} activeOpacity={0.85}>
              <Text style={styles.btnIslandVIPText}>Solicitar Parceria Oficial</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.backgroundPure} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    if (tipoUsuarioLogado === "personal" && statusConexao === "aguardando_personal") {
      return (
        <View style={styles.premiumProposalContainer}>
          <View style={styles.premiumProposalGlow} />
          
          <View style={styles.premiumProposalCard}>
            <View style={styles.proposalBadgeRow}>
              <View style={styles.proposalBadge}>
                <Text style={styles.proposalBadgeText}>NOVO ALUNO</Text>
              </View>
            </View>

            <Text style={styles.proposalTitle}>
              <Text style={{color: theme.colors.primary}}>{nomeOutro?.split(" ")[0]}</Text> quer treinar com você!
            </Text>
            <Text style={styles.proposalSubtitle}>
              O aluno enviou a solicitação de parceria. Aceite para oficializar o vínculo e liberar o painel de treinos.
            </Text>

            <View style={styles.proposalBtnContainer}>
              <TouchableOpacity style={styles.btnProposalDecline} onPress={handlePersonalRecusa} activeOpacity={0.7}>
                <Ionicons name="close" size={18} color="#FF4444" />
                <Text style={styles.btnProposalDeclineText}>Recusar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.btnProposalAccept} onPress={handlePersonalAceita} activeOpacity={0.8}>
                <Ionicons name="checkmark-circle" size={20} color="#000" style={{marginRight: 6}} />
                <Text style={styles.btnProposalAcceptText}>Aceitar Aluno</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    if (tipoUsuarioLogado === "aluno" && statusConexao === "aguardando_personal") {
      return (
        <View style={styles.pillContainer}>
          <View style={styles.pillWaiting}>
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.pillText}>Sua proposta foi criada, agora aguarde o personal confirmar.</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  useEffect(() => {
    if (tipoUsuarioLogado === "aluno" && statusConexao === "aluno_ativo") {
      navigation.reset({
        index: 0,
        routes: [{ name: 'PainelMeuTreinador', params: { conexaoId: conexaoId } }],
      });
    }
  }, [statusConexao]);

  const renderListFooter = () => {
    if (mensagens.length === 0 && statusConexao !== "aluno_ativo") {
      const isAluno = tipoUsuarioLogado === "aluno";
      return (
        <View style={styles.icebreakerContainer}>
          <View style={styles.icebreakerHeader}>
            <FontAwesome5 name="fire" size={16} color={theme.colors.primary} />
            <Text style={styles.icebreakerTitle}>Quebre o Gelo!</Text>
          </View>
          <Text style={styles.icebreakerSubtitle}>Clique numa mensagem para enviar agora:</Text>

          {isAluno ? (
            <>
              <TouchableOpacity style={styles.btnSugestao} onPress={() => enviarMensagem(`Olá ${nomeOutro?.split(" ")[0]}! Meu perfil deu Match com você no app. Gostaria de entender como funciona sua consultoria.`)}>
                <Text style={styles.btnSugestaoText}>Olá! Como funciona a sua dinâmica de acompanhamento?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSugestao} onPress={() => enviarMensagem(`Oi ${nomeOutro?.split(" ")[0]}, tudo bem? Quais são os valores dos seus planos de acompanhamento?`)}>
                <Text style={styles.btnSugestaoText}>Oi! Você tem horários disponíveis para novos alunos?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.btnSugestao} onPress={() => enviarMensagem(`Fala ${nomeOutro?.split(" ")[0]}, vi que demos Match! Qual o seu objetivo principal de treino no momento?`)}>
                <Text style={styles.btnSugestaoText}>Fala! Qual seu objetivo de treino no momento?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSugestao} onPress={() => enviarMensagem(`Olá ${nomeOutro?.split(" ")[0]}! Sou personal aqui no Match Trainer. Como posso te ajudar a bater suas metas?`)}>
                <Text style={styles.btnSugestaoText}>Como posso te ajudar a bater suas metas?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item, index }) => {
    const isMinha = item.remetente_id === myUserId;
    const dataAtual = formatarData(item.criado_em);
    const msgAnteriorNoTempo = mensagens[index + 1];
    const dataAnterior = msgAnteriorNoTempo ? formatarData(msgAnteriorNoTempo.criado_em) : null;
    const mudouDeDia = dataAtual !== dataAnterior;

    return (
      <View>
        {mudouDeDia && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{dataAtual}</Text>
          </View>
        )}
        <View style={[styles.bubbleContainer, isMinha ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.bubbleText, isMinha ? styles.bubbleTextRight : styles.bubbleTextLeft]}>{item.conteudo}</Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, isMinha ? styles.timeTextRight : styles.timeTextLeft]}>{formatarHora(item.criado_em)}</Text>
            {isMinha && (
              <Ionicons name={item.lida ? "checkmark-done" : "checkmark"} size={14} color={item.lida ? theme.colors.backgroundPure : "rgba(0,0,0,0.4)"} style={{ marginLeft: 4, marginTop: 1 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <Image source={{ uri: fotoOutro || "https://via.placeholder.com/150" }} style={styles.avatar} />
          <View>
            <Text style={styles.headerName} numberOfLines={1}>{nomeOutro}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusConexao === "aluno_ativo" ? theme.colors.success : theme.colors.primary }]} />
              <Text style={styles.statusText}>
                {statusConexao === "aluno_ativo" ? "Treinamento Ativo" : (statusConexao === "aguardando_personal") ? "Proposta Enviada" : "Negociação de Match"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {renderDynamicIsland()}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderListFooter}
        />
      )}

      {statusConexao !== "recusado" && statusConexao !== "inativo" && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={theme.colors.textMuted}
                value={texto}
                onChangeText={setTexto}
                multiline={true}
                maxHeight={100}
              />
              <TouchableOpacity
                style={[styles.btnSend, !texto.trim() && { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.borderLight }]}
                onPress={() => enviarMensagem()}
                disabled={!texto.trim()}
              >
                <Ionicons name="send" size={16} color={texto.trim() ? theme.colors.backgroundPure : theme.colors.textMuted} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundPure },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  btnVoltar: { padding: 5, marginRight: 10 },
  headerProfile: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 1, borderColor: theme.colors.borderLight },
  headerName: { fontFamily: theme.fonts.title, fontSize: 18, color: theme.colors.text, letterSpacing: 0.5 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "600" },
  
  islandContainer: { padding: 15, backgroundColor: theme.colors.backgroundPure },
  islandCard: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  islandHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconCirclePrimary: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primaryLight, justifyContent: "center", alignItems: "center", marginRight: 10 },
  islandTitleVIP: { color: theme.colors.primary, fontSize: 16, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  islandSubtitleVIP: { color: theme.colors.textBody, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  btnIslandVIP: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16, gap: 8 },
  btnIslandVIPText: { color: theme.colors.backgroundPure, fontWeight: "900", fontSize: 15, letterSpacing: 0.5, textTransform: "uppercase" },
  
  premiumProposalContainer: { padding: 16, position: 'relative', marginTop: 5 },
  premiumProposalGlow: { position: 'absolute', top: 25, left: 25, right: 25, bottom: 25, backgroundColor: theme.colors.primary, opacity: 0.2, blurRadius: 25, borderRadius: 30 },
  premiumProposalCard: { backgroundColor: "#121212", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,107,0,0.4)" },
  proposalBadgeRow: { flexDirection: 'row', marginBottom: 12 },
  proposalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(255,215,0,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,215,0,0.3)", gap: 4 },
  proposalBadgeText: { color: "#FFD700", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  proposalTitle: { color: "#FFF", fontSize: 20, fontFamily: theme.fonts.title, marginBottom: 6, letterSpacing: 0.2 },
  proposalSubtitle: { color: "#888", fontSize: 13, lineHeight: 20, marginBottom: 24 },
  proposalBtnContainer: { flexDirection: 'row', gap: 12 },
  btnProposalDecline: { flex: 0.8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(255,68,68,0.1)", paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,68,68,0.2)", gap: 4 },
  btnProposalDeclineText: { color: "#FF4444", fontWeight: "bold", fontSize: 14 },
  btnProposalAccept: { flex: 1.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 16, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnProposalAcceptText: { color: "#000", fontWeight: "900", fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

  pillContainer: { alignItems: "center", paddingVertical: 12, backgroundColor: theme.colors.backgroundPure },
  pillWaiting: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  pillText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "600" },
  
  listContent: { paddingHorizontal: 16, paddingVertical: 10 },
  dateSeparator: { alignSelf: "center", backgroundColor: theme.colors.surfaceLight, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, marginVertical: 15, borderWidth: 1, borderColor: theme.colors.border },
  dateSeparatorText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  
  bubbleContainer: { maxWidth: "82%", paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  bubbleRight: { alignSelf: "flex-end", backgroundColor: theme.colors.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 4 },
  bubbleLeft: { alignSelf: "flex-start", backgroundColor: theme.colors.surfaceLight, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 4, borderBottomRightRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  bubbleTextRight: { color: theme.colors.backgroundPure },
  bubbleTextLeft: { color: theme.colors.text },
  
  timeRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 6 },
  timeText: { fontSize: 10, fontWeight: "bold" },
  timeTextRight: { color: "rgba(0,0,0,0.5)" },
  timeTextLeft: { color: theme.colors.textSecondary },
  
  icebreakerContainer: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, marginTop: 30, marginHorizontal: 10 },
  icebreakerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 6, gap: 8 },
  icebreakerTitle: { color: theme.colors.primary, fontSize: 16, fontWeight: "bold", textTransform: "uppercase" },
  icebreakerSubtitle: { color: theme.colors.textSecondary, fontSize: 13, textAlign: "center", marginBottom: 20 },
  btnSugestao: { backgroundColor: theme.colors.surfaceLight, padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.borderLight },
  btnSugestaoText: { color: theme.colors.text, fontSize: 14, fontStyle: "italic", textAlign: "center" },
  
  inputArea: { backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 35 : 15, borderTopWidth: 1, borderTopColor: theme.colors.border },
  inputWrapper: { flexDirection: "row", alignItems: "flex-end", backgroundColor: theme.colors.surfaceLight, borderRadius: 24, paddingLeft: 18, paddingRight: 6, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.borderLight },
  input: { flex: 1, color: theme.colors.text, fontSize: 15, paddingTop: 12, paddingBottom: 12 },
  btnSend: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 2, borderWidth: 1, borderColor: theme.colors.primary },
});