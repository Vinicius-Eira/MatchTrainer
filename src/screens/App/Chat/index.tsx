import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useChat } from "./useChat";
import { styles, parceriaModalStyles } from "./styles";
import { theme } from "../../../theme/theme";

const formatarHora = (dataString: string) => {
  const data = new Date(dataString);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formatarData = (dataString: string) => {
  const data = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "Ontem";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export function Chat({ route, navigation }: any) {
  const { state, actions } = useChat(route, navigation);
  const {
    mensagens,
    texto,
    loading,
    myUserId,
    statusConexao,
    flatListRef,
    nomeOutro,
    fotoOutro,
    tipoUsuarioLogado,
    modalParceriaVisivel,
    solicitandoParceria,
  } = state;

  const podeVoltar = navigation.canGoBack();
  const isAguardandoAssinatura = ["aguardando_assinatura", "aguardando_aluno", "proposta_enviada"].includes(
    statusConexao
  );

  const renderDynamicIsland = () => {
    if (loading) return null;

    if (tipoUsuarioLogado === "aluno" && isAguardandoAssinatura) {
      return (
        <View style={styles.islandContainer}>
          <BlurView intensity={80} tint="dark" style={styles.islandCard}>
            <View style={styles.proposalBadgeRow}>
              <View
                style={[
                  styles.proposalBadge,
                  { backgroundColor: "rgba(0, 230, 118, 0.14)", borderColor: "rgba(0, 230, 118, 0.4)" },
                ]}
              >
                <Ionicons name="document-text" size={12} color="#00E676" />
                <Text style={[styles.proposalBadgeText, { color: "#00E676" }]}>PROPOSTA DISPONÍVEL</Text>
              </View>
            </View>
            <Text style={styles.islandTitleVIP}>
              <Text style={{ color: "#00E676" }}>{nomeOutro?.split(" ")[0]}</Text> enviou seu contrato!
            </Text>
            <Text style={styles.islandSubtitleVIP}>
              Revise os valores, vencimento e termos para oficializar sua parceria e liberar seus treinos.
            </Text>
            <TouchableOpacity
              style={[
                styles.btnNeonTransparente,
                { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.08)" },
              ]}
              onPress={actions.irParaPropostaAluno}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnNeonText, { color: "#00E676" }]}>Visualizar e Assinar Proposta</Text>
              <Ionicons name="chevron-forward" size={18} color="#00E676" />
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    }

    if (tipoUsuarioLogado === "aluno" && ["pendente", "em_contato", "lead"].includes(statusConexao)) {
      if (mensagens.length === 0 && podeVoltar) return null;
      return (
        <View style={styles.islandContainer}>
          <BlurView intensity={80} tint="dark" style={styles.islandCard}>
            <View style={styles.islandHeader}>
              <View style={styles.iconCirclePrimary}>
                <MaterialCommunityIcons name="handshake" size={18} color="#FF6B00" />
              </View>
              <Text style={styles.islandTitleVIP}>
                {podeVoltar ? "Gostou da proposta?" : "Alinhar nova proposta?"}
              </Text>
            </View>
            <Text style={styles.islandSubtitleVIP}>
              {podeVoltar
                ? "Alinharam os detalhes? Envie uma solicitação para oficializar o treino."
                : "Converse com seu treinador para ajustar os detalhes e solicite uma nova proposta oficial."}
            </Text>
            <TouchableOpacity
              style={styles.btnNeonTransparente}
              onPress={actions.handleAlunoSolicitaParceria}
              activeOpacity={0.8}
            >
              <Text style={styles.btnNeonText}>Solicitar Parceria Oficial</Text>
              <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    }

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
            <Text style={styles.islandSubtitleVIP}>
              Nenhum aluno entra na carteira sem contrato. Defina os valores para ativá-lo.
            </Text>
            <TouchableOpacity style={styles.btnNeonTransparente} onPress={actions.irParaContrato} activeOpacity={0.8}>
              <Ionicons name="document-text" size={18} color="#FF6B00" />
              <Text style={styles.btnNeonText}>Criar Contrato</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      );
    }

    if (tipoUsuarioLogado === "personal" && (isAguardandoAssinatura || statusConexao === "aguardando_pagamento")) {
      return (
        <View style={styles.pillContainer}>
          <View
            style={[
              styles.pillWaiting,
              { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.3)" },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginRight: 8 }} />
            <Text style={[styles.pillText, { color: "#00E676" }]}>
              Proposta enviada! Aguardando o aluno assinar.
            </Text>
          </View>
        </View>
      );
    }

    if (tipoUsuarioLogado === "aluno" && statusConexao === "aguardando_personal") {
      return (
        <View style={styles.pillContainer}>
          <View style={styles.pillWaiting}>
            <ActivityIndicator size="small" color="#FF6B00" style={{ marginRight: 8 }} />
            <Text style={styles.pillText}>Solicitação enviada! Aguardando o personal preparar sua proposta.</Text>
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
        {mudouDeDia && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{dataAtual}</Text>
          </View>
        )}
        <View style={[styles.bubbleContainer, isMinha ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.bubbleText, isMinha ? styles.bubbleTextRight : styles.bubbleTextLeft]}>
            {item.conteudo}
          </Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, isMinha ? styles.timeTextRight : styles.timeTextLeft]}>
              {formatarHora(item.criado_em)}
            </Text>
            {isMinha && (
              <Ionicons
                name={item.lida ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.lida ? "#000" : "rgba(0,0,0,0.3)"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const getStatusHeaderText = () => {
    if (statusConexao === "aluno_ativo") return "Treinamento Ativo";
    if (isAguardandoAssinatura) return "Proposta Aguardando Aceite";
    if (statusConexao === "aguardando_personal") return "Solicitação Enviada";
    return podeVoltar ? "Negociação de Match" : "Ajuste de Contrato";
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="dark" style={styles.headerBlur}>
        <View style={styles.headerContent}>
          {podeVoltar && (
            <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          <View style={[styles.headerProfile, !podeVoltar && { flex: 1 }]}>
            <Image source={{ uri: fotoOutro || "https://via.placeholder.com/150" }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName} numberOfLines={1}>
                {nomeOutro}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        statusConexao === "aluno_ativo" || isAguardandoAssinatura ? theme.colors.success : "#FF6B00",
                    },
                  ]}
                />
                <Text style={styles.statusText}>{getStatusHeaderText()}</Text>
              </View>
            </View>
          </View>

          {!podeVoltar && (
            <TouchableOpacity
              style={parceriaModalStyles.btnLogoutHeader}
              onPress={actions.handleSairConta}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>

      {renderDynamicIsland()}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B00" />
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
          ListFooterComponent={() =>
            mensagens.length === 0 && statusConexao !== "aluno_ativo" ? (
              <View style={styles.icebreakerContainer}>
                <View style={styles.icebreakerHeader}>
                  <FontAwesome5 name="fire" size={16} color="#FF6B00" />
                  <Text style={styles.icebreakerTitle}>
                    {podeVoltar ? "Quebre o Gelo!" : "Converse com seu Treinador"}
                  </Text>
                </View>
                <Text style={styles.icebreakerSubtitle}>Selecione uma mensagem para iniciar:</Text>
                {(podeVoltar
                  ? [
                    "Olá! Como funciona a sua dinâmica de acompanhamento?",
                    "Oi! Quais são os valores dos seus planos?",
                  ]
                  : [
                    "Oi! Podemos ajustar um detalhe na minha proposta de contrato?",
                    "Olá! Tudo certo por aqui, pode me enviar a proposta atualizada.",
                  ]
                ).map((sugestao, i) => (
                  <TouchableOpacity key={i} style={styles.btnSugestao} onPress={() => actions.enviarMensagem(sugestao)}>
                    <Text style={styles.btnSugestaoText}>{sugestao}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
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
              <TouchableOpacity
                style={[styles.btnSend, !texto.trim() && styles.btnSendDisabled]}
                onPress={() => actions.enviarMensagem()}
                disabled={!texto.trim()}
              >
                <Ionicons name="send" size={16} color={texto.trim() ? "#000" : "#555"} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <Modal
        visible={modalParceriaVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!solicitandoParceria) {
            actions.setModalParceriaVisivel(false);
          }
        }}
      >
        <View style={parceriaModalStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={parceriaModalStyles.card}>
            <View style={parceriaModalStyles.iconRing}>
              <MaterialCommunityIcons name="handshake" size={32} color={theme.colors.primary} />
            </View>

            <Text style={parceriaModalStyles.tag}>SOLICITAÇÃO OFICIAL</Text>
            <Text style={parceriaModalStyles.title}>
              Fechar parceria com{"\n"}
              <Text style={{ color: theme.colors.primary }}>{nomeOutro}</Text>?
            </Text>
            <Text style={parceriaModalStyles.subtitle}>
              Ao confirmar, seu treinador será notificado imediatamente para preparar e enviar seu contrato comercial aqui mesmo no aplicativo.
            </Text>

            <View style={parceriaModalStyles.stepsBox}>
              <View style={parceriaModalStyles.stepRow}>
                <Ionicons name="notifications-outline" size={16} color={theme.colors.primary} />
                <Text style={parceriaModalStyles.stepText}>O personal recebe sua solicitação na hora</Text>
              </View>
              <View style={parceriaModalStyles.stepDivider} />
              <View style={parceriaModalStyles.stepRow}>
                <Ionicons name="document-text-outline" size={16} color="#00E676" />
                <Text style={parceriaModalStyles.stepText}>Você revisa valores e termos antes de assinar</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[parceriaModalStyles.btnConfirmar, solicitandoParceria && { opacity: 0.7 }]}
              onPress={actions.confirmarSolicitacaoParceria}
              disabled={solicitandoParceria}
              activeOpacity={0.85}
            >
              {solicitandoParceria ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Text style={parceriaModalStyles.btnConfirmarText}>Enviar Solicitação</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={parceriaModalStyles.btnCancelar}
              onPress={() => actions.setModalParceriaVisivel(false)}
              disabled={solicitandoParceria}
              activeOpacity={0.75}
            >
              <Text style={parceriaModalStyles.btnCancelarText}>Agora não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}