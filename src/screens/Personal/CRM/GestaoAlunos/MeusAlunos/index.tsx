import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { theme } from "../../../../../theme/theme";
import { AlunoAtivoItem, ConviteItem, useMeusAlunos } from "./useMeusAlunos";
import { modalReemissaoStyles, styles } from "./styles";

interface MeusAlunosProps {
  navigation: NavigationProp<any>;
}

function getStatusConviteVisual(status: string) {
  switch (status) {
    case "pendente":
      return {
        label: "AGUARDANDO",
        cor: "#FFD700",
        bg: "rgba(255, 215, 0, 0.1)",
        border: "rgba(255, 215, 0, 0.35)",
      };
    case "utilizado":
    case "aceito":
      return {
        label: "UTILIZADO",
        cor: "#00E676",
        bg: "rgba(0, 230, 118, 0.1)",
        border: "rgba(0, 230, 118, 0.35)",
      };
    case "expirado":
      return {
        label: "EXPIRADO",
        cor: "#FF3B30",
        bg: "rgba(255, 59, 48, 0.1)",
        border: "rgba(255, 59, 48, 0.35)",
      };
    case "revogado":
    default:
      return {
        label: "REVOGADO",
        cor: "#8E8E93",
        bg: "rgba(142, 142, 147, 0.12)",
        border: "rgba(142, 142, 147, 0.3)",
      };
  }
}

function formatarDataCurta(iso?: string | null) {
  if (!iso) return "--/--";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function MeusAlunos({ navigation }: MeusAlunosProps) {
  const { state, actions } = useMeusAlunos(navigation);

  const renderCardAlunoAtivo = (aluno: AlunoAtivoItem) => (
    <TouchableOpacity
      key={aluno.conexao_id}
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => actions.handleAbrirAluno(aluno)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {aluno.foto_url ? (
            <Image source={{ uri: aluno.foto_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{aluno.nome.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.alunoNome} numberOfLines={1}>
            {aluno.nome}
          </Text>
          {aluno.email ? (
            <Text style={styles.alunoEmail} numberOfLines={1}>
              {aluno.email}
            </Text>
          ) : null}
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{aluno.modalidade}</Text>
            </View>
            {aluno.dia_vencimento ? (
              <View style={[styles.tag, { backgroundColor: "rgba(255, 107, 0, 0.1)" }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                  Vence dia {aluno.dia_vencimento}
                </Text>
              </View>
            ) : null}
            {aluno.status_plano === "congelado" ? (
              <View style={[styles.tag, { backgroundColor: "rgba(10, 132, 255, 0.12)" }]}>
                <Text style={[styles.tagText, { color: "#0A84FF" }]}>Congelado</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  const renderCardConvite = (convite: ConviteItem) => {
    const statusVisual = getStatusConviteVisual(convite.status);
    const isPendente = convite.status === "pendente";
    const isUtilizado = convite.status === "utilizado" || convite.status === "aceito";
    const isProcessando = state.acaoLoadingId === convite.id;
    const valorFormatado = `R$ ${Number(convite.valor_mensalidade || 0).toFixed(2).replace(".", ",")}`;

    return (
      <View key={convite.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{convite.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.alunoNome} numberOfLines={1}>
              {convite.nome}
            </Text>
            <Text style={styles.alunoEmail} numberOfLines={1}>
              {convite.email}
            </Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{convite.modalidade}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: "rgba(0, 230, 118, 0.1)" }]}>
                <Text style={[styles.tagText, { color: "#00E676" }]}>
                  {valorFormatado} • {convite.frequencia_pagamento}
                </Text>
              </View>
              {convite.possui_documento && (
                <View style={[styles.tag, { backgroundColor: "rgba(255, 107, 0, 0.1)" }]}>
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>PDF</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.conviteMetaRow}>
          <Text style={styles.conviteMetaText}>
            {isUtilizado
              ? `Ativado em ${formatarDataCurta(convite.usado_em)}`
              : convite.status === "revogado"
                ? `Revogado em ${formatarDataCurta(convite.revogado_em)}`
                : `Validade: ${formatarDataCurta(convite.expires_at)}`}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusVisual.bg, borderColor: statusVisual.border },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: statusVisual.cor }]}>
              {statusVisual.label}
            </Text>
          </View>
        </View>

        {!isUtilizado && (
          <View style={styles.conviteActionsRow}>
            {isPendente && (
              <TouchableOpacity
                style={[styles.btnConviteAcao, styles.btnRevogar, isProcessando && { opacity: 0.6 }]}
                onPress={() => actions.handleRevogarConvite(convite)}
                disabled={isProcessando}
                activeOpacity={0.75}
              >
                {isProcessando ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
                    <Text style={[styles.btnConviteAcaoText, { color: "#FF3B30" }]}>Revogar</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btnConviteAcao, styles.btnReemitir, isProcessando && { opacity: 0.6 }]}
              onPress={() => actions.handleReemitirConvite(convite)}
              disabled={isProcessando}
              activeOpacity={0.75}
            >
              {isProcessando ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.btnConviteAcaoText, { color: theme.colors.primary }]}>
                    {isPendente ? "Gerar Novo Código" : "Reemitir Convite"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CRM Alunos</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => navigation.navigate("AdicionarAluno")}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou e-mail..."
          placeholderTextColor={theme.colors.textMuted}
          value={state.busca}
          onChangeText={actions.setBusca}
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity style={styles.filterPill} onPress={() => actions.setOrdemAZ(!state.ordemAZ)}>
            <MaterialCommunityIcons
              name={state.ordemAZ ? "sort-alphabetical-ascending" : "sort-alphabetical-descending"}
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.filterPillText}>{state.ordemAZ ? "A-Z" : "Z-A"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, state.filtroTipo === "todos" && styles.filterPillActive]}
            onPress={() => actions.setFiltroTipo("todos")}
          >
            <Text style={[styles.filterPillText, state.filtroTipo === "todos" && styles.filterPillTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, state.filtroTipo === "consultoria" && styles.filterPillActive]}
            onPress={() => actions.setFiltroTipo("consultoria")}
          >
            <Text style={[styles.filterPillText, state.filtroTipo === "consultoria" && styles.filterPillTextActive]}>
              Consultoria
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, state.filtroTipo === "presencial" && styles.filterPillActive]}
            onPress={() => actions.setFiltroTipo("presencial")}
          >
            <Text style={[styles.filterPillText, state.filtroTipo === "presencial" && styles.filterPillTextActive]}>
              Presencial
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, state.abaAtiva === "ativos" && styles.tabActive]}
          onPress={() => actions.setAbaAtiva("ativos")}
        >
          <Text style={[styles.tabText, state.abaAtiva === "ativos" && styles.tabTextActive]}>
            Ativos ({state.alunosAtivos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, state.abaAtiva === "convites" && styles.tabActive]}
          onPress={() => actions.setAbaAtiva("convites")}
        >
          <Text style={[styles.tabText, state.abaAtiva === "convites" && styles.tabTextActive]}>
            Convites ({state.totalPendentes})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.loading}
            onRefresh={actions.carregarCarteira}
            tintColor={theme.colors.primary}
          />
        }
      >
        {state.loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : state.abaAtiva === "ativos" ? (
          state.alunosFiltrados.length > 0 ? (
            state.alunosFiltrados.map(renderCardAlunoAtivo)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={60} color={theme.colors.border} />
              <Text style={styles.emptyTitle}>Nenhum aluno ativo</Text>
              <Text style={styles.emptySubtitle}>
                Seus alunos aparecerão aqui assim que aceitarem a proposta comercial.
              </Text>
            </View>
          )
        ) : state.convitesFiltrados.length > 0 ? (
          state.convitesFiltrados.map(renderCardConvite)
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhum convite encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + acima para gerar um convite seguro para um novo aluno.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={state.modalConviteVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          actions.setModalConviteVisivel(false);
        }}
      >
        <View style={modalReemissaoStyles.overlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={modalReemissaoStyles.card}>
            <View style={modalReemissaoStyles.iconRing}>
              <Ionicons name="key-outline" size={30} color={theme.colors.primary} />
            </View>

            <Text style={modalReemissaoStyles.tag}>NOVO CONVITE GERADO</Text>
            <Text style={modalReemissaoStyles.title}>{state.conviteReemitido?.nome}</Text>
            <Text style={modalReemissaoStyles.subtitle}>
              O código anterior foi invalidado. Envie este novo código para o e-mail autorizado ({state.conviteReemitido?.email}).
            </Text>

            <View style={modalReemissaoStyles.codeBox}>
              <Text style={modalReemissaoStyles.codeLabel}>CÓDIGO DE USO ÚNICO</Text>
              <Text style={modalReemissaoStyles.codeText} selectable>
                {state.conviteReemitido?.codigo}
              </Text>
              <Text style={modalReemissaoStyles.codeExp}>
                Válido até {state.conviteReemitido?.expiraEm}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                modalReemissaoStyles.btnCopiar,
                state.codigoCopiado && modalReemissaoStyles.btnCopiarSucesso,
              ]}
              onPress={actions.handleCopiarCodigo}
              activeOpacity={0.85}
            >
              <Ionicons
                name={state.codigoCopiado ? "checkmark-circle" : "copy-outline"}
                size={18}
                color={state.codigoCopiado ? "#00E676" : theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  modalReemissaoStyles.btnCopiarText,
                  state.codigoCopiado && { color: "#00E676" },
                ]}
              >
                {state.codigoCopiado ? "Código Copiado!" : "Copiar Código"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalReemissaoStyles.btnCompartilhar}
              onPress={actions.handleCompartilharConvite}
              activeOpacity={0.85}
            >
              <Ionicons name="share-social-outline" size={18} color="#00E676" style={{ marginRight: 8 }} />
              <Text style={modalReemissaoStyles.btnCompartilharText}>Enviar por WhatsApp / E-mail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalReemissaoStyles.btnConcluir}
              onPress={() => actions.setModalConviteVisivel(false)}
              activeOpacity={0.75}
            >
              <Text style={modalReemissaoStyles.btnConcluirText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}