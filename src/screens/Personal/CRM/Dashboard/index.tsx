import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  UIManager,
  ActivityIndicator,
  Image,
  FlatList,
  RefreshControl,
  TextInput,
  Modal
} from "react-native";
import { InsightCard } from '../../../../components/personal/InsightCard';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../theme/theme";
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive";
import { WidgetOnboarding } from "../../../../components/WidgetOnboarding";

import { styles } from "./styles";
import { useDashboard } from "./usePersonalDashboard"; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function PersonalDashboard({ navigation }: any) {
  const {
    jornada,
    progressoPct,
    completarMissao,
    insightsReais,
    refreshing,
    activeTab,
    setActiveTab,
    modalidadeFilter,
    setModalidadeFilter,
    filtrosDinamicos,
    searchQuery,
    setSearchQuery,
    isFilterModalVisible,
    setIsFilterModalVisible,
    sortOrder,
    setSortOrder,
    origemFilter,
    setOrigemFilter,
    loading,
    personal,
    emContato,
    ativos,
    inativos,
    notaMedia,
    naoLidas,
    handleOpenInsight,
    onRefresh,
    handleLogout,
    getListaAtiva,
  } = useDashboard(navigation);

  const renderItem = ({ item }: { item: any }) => {
    const isAtivo = activeTab === "aluno_ativo";
    const isInativo = activeTab === "inativo";
    
    const status = item.status;
    const userData = item.usuarios;
    const temMensagemNaoLida = naoLidas[item.id] > 0;
    
    const isVIP = item.isVIP;
    const isAguardandoAssinatura = status === "aguardando_assinatura";
    
    const fotoUrl = (userData?.foto_url && typeof userData.foto_url === 'string' && userData.foto_url.trim().length > 5) 
      ? userData.foto_url 
      : null;

    let dataFormatada = "";
    if (item.criado_em) {
      const d = new Date(item.criado_em);
      const mes = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      dataFormatada = `${d.getDate()} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
    }

    let leftBorderColor = isVIP ? "#0A84FF" : "#00E676"; 
    if (isInativo) leftBorderColor = "#FF3B30";

    const prefs = userData?.preferencias || {};
    const pesoStr = userData?.peso ? `${userData.peso}kg` : null;
    const freqBruta = prefs?.frequencia_semanal || prefs?.frequencia;
    const freqStr = freqBruta ? `${freqBruta.split('-')[0]}x/sem` : null;

    return (
      <TouchableOpacity
        style={[
          styles.studentCardPremium,
          { borderLeftColor: leftBorderColor },
          isInativo && { opacity: 0.65 }
        ]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("VisaoAluno", {
            conexaoId: item.id,
            aluno: userData,
            statusAtual: status,
            personalInfo: personal,
          });
        }}
      >
        <View style={styles.cardHeaderArea}>
          
          <View style={styles.avatarWrapper}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={moderateScale(20)} color="#555" />
              </View>
            )}
            {temMensagemNaoLida ? (
              <View style={styles.statusIndicatorMessage} />
            ) : isAtivo ? (
              <View style={styles.statusIndicatorOnline} />
            ) : null}
          </View>

          <View style={styles.headerInfoWrapper}>
            <View style={styles.nameAndDateRow}>
              <Text style={styles.studentNameText} numberOfLines={1}>
                {userData?.nome || "Novo Aluno"}
                {item.idade ? <Text style={styles.studentAgeText}>, {item.idade}</Text> : null}
              </Text>
              <Text style={styles.dateText}>{dataFormatada}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.orangePill}>
                <Ionicons name="flag" size={10} color={theme.colors.primary} style={{marginRight: 4}} />
                <Text style={styles.orangePillText} numberOfLines={1}>{item.objetivoSeguro}</Text>
              </View>

              {item.modalidadeUi !== "A Definir" && item.modalidadeUi !== "Pendente" && (
                <View style={styles.orangePill}>
                  <Ionicons name="layers" size={10} color={theme.colors.primary} style={{marginRight: 4}} />
                  <Text style={styles.orangePillText}>{item.modalidadeUi}</Text>
                </View>
              )}
            </View>

            {(pesoStr || freqStr) && (
              <View style={styles.metricsRow}>
                {pesoStr && (
                  <View style={styles.metricBadge}>
                    <MaterialCommunityIcons name="weight-kilogram" size={12} color="#888" />
                    <Text style={styles.metricBadgeText}>{pesoStr}</Text>
                  </View>
                )}
                {freqStr && (
                  <View style={styles.metricBadge}>
                    <Ionicons name="calendar-outline" size={12} color="#888" />
                    <Text style={styles.metricBadgeText}>{freqStr}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooterArea}>
          
          <View style={styles.originIndicator}>
             {isVIP ? (
                <>
                  <Ionicons name="ticket" size={12} color="#0A84FF" />
                  <Text style={[styles.originIndicatorText, { color: "#0A84FF" }]}>CONVITE</Text>
                </>
             ) : (
                <>
                  <Ionicons name="flash" size={12} color="#00E676" />
                  <Text style={[styles.originIndicatorText, { color: "#00E676" }]}>MATCH</Text>
                </>
             )}
          </View>

          <View style={styles.alertWrapper}>
            {isAguardandoAssinatura ? (
              <View style={styles.badgeAlertGold}>
                <Ionicons name="time" size={12} color="#FFD700" />
                <Text style={styles.badgeAlertGoldText}>AGUARDANDO ASSINATURA</Text>
              </View>
            ) : isAtivo && !item.tem_plano && !item.isVIP ? (
              <View style={styles.badgeAlertDanger}>
                <Ionicons name="alert-circle" size={12} color="#FF3B30" />
                <Text style={styles.badgeAlertDangerText}>SEM PLANO</Text>
              </View>
            ) : isAtivo && sortOrder === "vencimento" && item.dia_vencimento !== 99 ? (
              <View style={styles.badgeAlertNeutral}>
                <Ionicons name="calendar-outline" size={12} color="#AAA" />
                <Text style={styles.badgeAlertNeutralText}>VENCE DIA {item.dia_vencimento}</Text>
              </View>
            ) : (
               <Ionicons name="chevron-forward" size={16} color="#444" />
            )}
          </View>
          
        </View>

      </TouchableOpacity>
    );
  };

  if (loading && !personal && !refreshing)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

      <LinearGradient colors={[theme.colors.surfaceLight, theme.colors.background]} style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, paddingRight: scale(10) }}>
            <Text style={styles.greeting}>PAINEL DO TREINADOR</Text>
            <Text style={styles.personalName} numberOfLines={1}>Olá, {personal?.nome?.split(" ")[0] || "Professor"}</Text>
          </View>
          <View style={styles.headerActionsRight}>
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={moderateScale(22)} color={theme.colors.danger} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("PersonalSetup")} activeOpacity={0.7}>
              <Image source={{ uri: personal?.foto_url || "https://via.placeholder.com/150" }} style={styles.headerAvatar} />
              <View style={styles.settingsOverlay}>
                <Ionicons name="pencil" size={moderateScale(12)} color={theme.colors.backgroundPure} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsWrapper}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="account-group" size={moderateScale(22)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{ativos.length}</Text>
            <Text style={styles.statLabel}>Alunos Ativos</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("Avaliacoes")} activeOpacity={0.7}>
            <View style={styles.iconWrapperPrimary}>
              <MaterialCommunityIcons name="star" size={moderateScale(22)} color={theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{Number(notaMedia).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Sua Nota</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={emContato.length > 0 ? styles.iconWrapperAlert : styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="bell-ring" size={moderateScale(22)} color={emContato.length > 0 ? theme.colors.primary : theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{emContato.length}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
      >
        <WidgetOnboarding jornada={jornada} progressoPct={progressoPct} navigation={navigation} completarMissao={completarMissao} />

        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("Recebimentos")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(255, 107, 0, 0.15)" }]}>
                <Ionicons name="wallet-outline" size={moderateScale(22)} color={theme.colors.primary} />
              </View>
              <Ionicons name="arrow-forward" size={moderateScale(16)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>Recebimentos</Text>
            <Text style={styles.quickAccessSubtitle}>Caixa e PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("PainelCrescimento")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}>
                <Ionicons name="rocket-outline" size={moderateScale(22)} color="#0A84FF" />
              </View>
              <Ionicons name="arrow-forward" size={moderateScale(16)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>MatchBusiness</Text>
            <Text style={styles.quickAccessSubtitle}>Metas e Gráficos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.fullWidthCard} activeOpacity={0.8} onPress={() => navigation.navigate("Presets")}>
          <View style={styles.fullWidthCardIconBg}>
            <MaterialCommunityIcons name="dumbbell" size={moderateScale(24)} color={theme.colors.primary} />
          </View>
          <View style={styles.fullWidthCardText}>
            <Text style={styles.fullWidthCardTitle}>Modelos de Treino</Text>
            <Text style={styles.fullWidthCardSubtitle}>Gerencie suas fichas e presets globais</Text>
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fullWidthCard} 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate("ExerciseLibrary", { isSelectionMode: false, isStudioMode: true })}
        >
          <View style={[styles.fullWidthCardIconBg, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
            <Ionicons name="play-circle-outline" size={moderateScale(26)} color="#00E676" />
          </View>
          <View style={styles.fullWidthCardText}>
            <Text style={styles.fullWidthCardTitle}>Meus Exercícios e Vídeos</Text>
            <Text style={styles.fullWidthCardSubtitle}>Crie exercícios e suba vídeos da galeria</Text>
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {insightsReais.length > 0 && (
          <View style={{ marginBottom: verticalScale(20), marginTop: verticalScale(15) }}>
            <Text style={[styles.sectionTitle, { marginBottom: verticalScale(10) }]}>
                🚨 Atenção Necessária
            </Text>
            {insightsReais.map((insight: any) => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onPress={handleOpenInsight} 
              />
            ))}
          </View>
        )}

        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.actionHeaderBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]} onPress={() => navigation.navigate("AdicionarAluno")}>
              <Ionicons name="person-add" size={moderateScale(20)} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]} onPress={() => setActiveTab("em_contato")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>Novos {emContato.length > 0 && `(${emContato.length})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]} onPress={() => { setActiveTab("aluno_ativo"); setModalidadeFilter("Todos"); }} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>Ativos {ativos.length > 0 && `(${ativos.length})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "inativo" && styles.segmentBtnActive]} onPress={() => setActiveTab("inativo")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "inativo" && styles.segmentTextActive]}>Inativos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSortContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={moderateScale(18)} color={theme.colors.textSecondary} />
            <TextInput style={styles.searchInput} placeholder="Buscar aluno..." placeholderTextColor={theme.colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} keyboardAppearance="dark" />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: scale(4) }}>
                <Ionicons name="close-circle" size={moderateScale(18)} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setIsFilterModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="options" size={moderateScale(20)} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {activeTab === "aluno_ativo" && filtrosDinamicos.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.secondaryFilterContainer}>
            {filtrosDinamicos.map((mod: string) => (
              <TouchableOpacity key={mod} style={[styles.secondaryFilterChip, modalidadeFilter === mod && styles.secondaryFilterChipActive]} onPress={() => setModalidadeFilter(mod)}>
                <Text style={[styles.secondaryFilterText, modalidadeFilter === mod && styles.secondaryFilterTextActive]}>{mod}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <FlatList
          data={getListaAtiva()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons
                  name={activeTab === "em_contato" ? "search-outline" : activeTab === "aluno_ativo" ? "barbell-outline" : "archive-outline"}
                  size={moderateScale(36)} color={theme.colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>{searchQuery !== "" ? "Nenhum aluno encontrado" : "Nenhum registro aqui"}</Text>
              <Text style={styles.emptyText}>
                {searchQuery !== "" ? `Ninguém com o nome "${searchQuery}" nesta lista.` : activeTab === "em_contato" ? "Sua vitrine está online! Quando novos alunos se interessarem, eles aparecerão aqui." : activeTab === "aluno_ativo" ? "Você não possui alunos para este filtro de exibição." : "Os alunos com ciclos finalizados ou pausados ficarão salvos aqui."}
              </Text>
            </View>
          }
        />
      </ScrollView>

      <Modal visible={isFilterModalVisible} transparent animationType="slide" onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsFilterModalVisible(false)} activeOpacity={1} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filtrar e Ordenar</Text>

            <Text style={styles.sheetSectionTitle}>Origem da Conexão</Text>
            <View style={styles.sheetFilterRow}>
              {["Todos", "match", "convite"].map((o) => (
                <TouchableOpacity
                  key={o}
                  style={[styles.sheetFilterChip, origemFilter === o && styles.sheetFilterChipActive]}
                  onPress={() => setOrigemFilter(o)}
                >
                  <Text style={[styles.sheetFilterChipText, origemFilter === o && styles.sheetFilterChipTextActive]}>
                    {o === "Todos" ? "Qualquer" : o === "match" ? "Via Match" : "Via Convite"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Ordenar Lista por</Text>
            <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("recentes")}>
              <Text style={[styles.sortOptionText, sortOrder === "recentes" && styles.sortOptionTextActive]}>Mais Recentes</Text>
              {sortOrder === "recentes" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("alfabetica")}>
              <Text style={[styles.sortOptionText, sortOrder === "alfabetica" && styles.sortOptionTextActive]}>Ordem Alfabética (A-Z)</Text>
              {sortOrder === "alfabetica" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
            </TouchableOpacity>

            {activeTab === "aluno_ativo" && (
              <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("vencimento")}>
                <Text style={[styles.sortOptionText, sortOrder === "vencimento" && styles.sortOptionTextActive]}>Dia de Vencimento</Text>
                {sortOrder === "vencimento" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => setIsFilterModalVisible(false)}>
              <Text style={styles.sheetBtnCloseText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}