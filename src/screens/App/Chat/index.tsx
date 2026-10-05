import React from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useChat } from "./useChat";
import { styles } from "./styles";
import { theme } from "../../../theme/theme";

const formatarHora = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "Ontem";
  return data.toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export default function Chat({ route, navigation }: any) {
  const { state, actions } = useChat(route, navigation);
  const { mensagens, texto, loading, myUserId, statusConexao, flatListRef, nomeOutro, fotoOutro, tipoUsuarioLogado } = state;

  const renderDynamicIsland = () => {
    if (loading) return null;

    // ALUNO: Modal para fechar parceria
    if (tipoUsuarioLogado === "aluno" && ["pendente", "em_contato", "lead"].includes(statusConexao)) {
      if (mensagens.length === 0) return null;
      return (
        <View style={styles.islandContainer}>
          <BlurView intensity={80} tint="dark" style={styles.islandCard}>
            <View style={styles.islandHeader}>
              <View style={styles.iconCirclePrimary}>
                <MaterialCommunityIcons name="handshake" size={18} color="#FF6B00" />
              </View>
              <Text style={styles.islandTitleVIP}>Gostou da proposta?</Text>
            </View>
            <Text style={styles.islandSubtitleVIP}>Alinharam os detalhes? Envie uma solicitação para oficializar o treino.</Text>
            <TouchableOpacity style={styles.btnNeonTransparente} onPress={actions.handleAlunoSolicitaParceria} activeOpacity={0.8}>
              <Text style={styles.btnNeonText}>Solicitar Parceria Oficial</Text>
              <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    }

    // PERSONAL: Recebeu solicitação -> Vai pro Contrato
    if (tipoUsuarioLogado === "personal" && statusConexao === "aguardando_personal") {
      return (
        <View style={styles.islandContainer}>
          <BlurView intensity={80} tint="dark" style={styles.islandCard}>
            <View style={styles.proposalBadgeRow}>
              <View style={styles.proposalBadge}>
                <Ionicons name="time" size={12} color="#FFD700" />
                <Text style={styles.proposalBadgeText}>ALUNO AGUARDANDO</Text>
              </View>
            </View>
            <Text style={styles.islandTitleVIP}>
              <Text style={{ color: "#FF6B00" }}>{nomeOutro?.split(" ")[0]}</Text> solicitou a parceria!
            </Text>
            <Text style={styles.islandSubtitleVIP}>Nenhum aluno entra na carteira sem contrato. Defina os valores para ativá-lo.</Text>
            <TouchableOpacity style={styles.btnNeonTransparente} onPress={actions.irParaContrato} activeOpacity={0.8}>
              <Ionicons name="document-text" size={18} color="#FF6B00" />
              <Text style={styles.btnNeonText}>Criar Contrato</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    }

    // ALUNO: Aguardando Personal Criar Contrato
    if (tipoUsuarioLogado === "aluno" && statusConexao === "aguardando_personal") {
      return (
        <View style={styles.pillContainer}>
          <View style={styles.pillWaiting}>
            <ActivityIndicator size="small" color="#FF6B00" style={{ marginRight: 8 }} />
            <Text style={styles.pillText}>Sua proposta foi enviada! Aguardando a assinatura do contrato.</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item, index }: any) => {
    const isMinha = item.remetente_id === myUserId;
    const dataAtual = formatarData(item.criado_em);
    const msgAnterior = mensagens[index + 1];
    const mudouDeDia = dataAtual !== (msgAnterior ? formatarData(msgAnterior.criado_em) : null);

    return (
      <View>
        {mudouDeDia && <View style={styles.dateSeparator}><Text style={styles.dateSeparatorText}>{dataAtual}</Text></View>}
        <View style={[styles.bubbleContainer, isMinha ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.bubbleText, isMinha ? styles.bubbleTextRight : styles.bubbleTextLeft]}>{item.conteudo}</Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, isMinha ? styles.timeTextRight : styles.timeTextLeft]}>{formatarHora(item.criado_em)}</Text>
            {isMinha && <Ionicons name={item.lida ? "checkmark-done" : "checkmark"} size={14} color={item.lida ? "#000" : "rgba(0,0,0,0.3)"} style={{ marginLeft: 4 }} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="dark" style={styles.headerBlur}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerProfile}>
            <Image source={{ uri: fotoOutro || "https://via.placeholder.com/150" }} style={styles.avatar} />
            <View>
              <Text style={styles.headerName} numberOfLines={1}>{nomeOutro}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: statusConexao === "aluno_ativo" ? theme.colors.success : "#FF6B00" }]} />
                <Text style={styles.statusText}>
                  {statusConexao === "aluno_ativo" ? "Treinamento Ativo" : statusConexao === "aguardando_personal" ? "Proposta Enviada" : "Negociação de Match"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </BlurView>

      {renderDynamicIsland()}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF6B00" /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => mensagens.length === 0 && statusConexao !== "aluno_ativo" ? (
             <View style={styles.icebreakerContainer}>
              <View style={styles.icebreakerHeader}>
                <FontAwesome5 name="fire" size={16} color="#FF6B00" />
                <Text style={styles.icebreakerTitle}>Quebre o Gelo!</Text>
              </View>
              <Text style={styles.icebreakerSubtitle}>Selecione uma mensagem para iniciar:</Text>
              {['Olá! Como funciona a sua dinâmica de acompanhamento?', 'Oi! Quais são os valores dos seus planos?'].map((sugestao, i) => (
                <TouchableOpacity key={i} style={styles.btnSugestao} onPress={() => actions.enviarMensagem(sugestao)}>
                  <Text style={styles.btnSugestaoText}>{sugestao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        />
      )}

      {statusConexao !== "recusado" && statusConexao !== "inativo" && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem..."
                placeholderTextColor="#666"
                value={texto}
                onChangeText={actions.setTexto}
                multiline={true}
              />
              <TouchableOpacity style={[styles.btnSend, !texto.trim() && styles.btnSendDisabled]} onPress={() => actions.enviarMensagem()} disabled={!texto.trim()}>
                <Ionicons name="send" size={16} color={texto.trim() ? "#000" : "#555"} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}