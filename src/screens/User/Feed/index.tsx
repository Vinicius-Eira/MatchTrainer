import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { theme } from "../../../theme/theme";
import { MatchAnalysisModal } from "@/src/components/Feed/MatchAnalysisModal";
import { MatchCard } from "@/src/components/Feed/MatchCard";
import { MatchEmptyState } from "@/src/components/Feed/MatchEmptyState";
import { styles } from "./styles";
import { useFeedPersonal } from "./useFeedPersonal";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";

export function FeedPersonal({ navigation }: any) {
  const { state, actions } = useFeedPersonal(navigation);

  const abrirRaioX = () => navigation.navigate("RaioXTreino");

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#030305" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const totalMatches = state.personalsExibidos.length;
  const currentItem = state.personalsExibidos[state.currentIndex] || null;
  const hasNext = state.currentIndex < totalMatches - 1;
  const hasPrev = state.currentIndex > 0;
  const nomeProposta = state.dadosNovaProposta?.personals?.nome?.split(" ")[0] || "O treinador";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#030305" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.headerFeed}>
        <View style={styles.logoWrap}>
          <View style={styles.logoIconBadge}>
            <Ionicons name="flash" size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              MATCH<Text style={{ color: theme.colors.primary }}>TRAINER</Text>
            </Text>
            <Text style={styles.headerSubTag}>Seleção Inteligente</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnHeaderPrefs} onPress={abrirRaioX} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={15} color={theme.colors.primary} />
          <Text style={styles.btnHeaderPrefsText}>Raio-X</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={actions.onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {!state.isAlunoConsultoria ? (
          <View style={styles.radarContainer}>
            <View style={styles.radarHeader}>
              <View style={styles.radarTitleRow}>
                <MaterialCommunityIcons name="radar" size={18} color={theme.colors.primary} />
                <Text style={styles.radarTitle}>Radar Presencial</Text>
              </View>
              <View style={styles.radarBadge}>
                {state.buscandoRadar ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : null}
                <Text style={styles.radarBadgeText}>Até {state.distanciaMaxima} km</Text>
              </View>
            </View>
            <Slider
              style={{ width: "100%", height: 34 }}
              minimumValue={5}
              maximumValue={100}
              step={5}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#242432"
              thumbTintColor={theme.colors.primary}
              value={state.distanciaMaxima}
              onValueChange={actions.handleSliderChange}
            />
          </View>
        ) : null}

        {currentItem ? (
          <>
            <View style={styles.topProgressWrap}>
              <View style={styles.topProgressHeader}>
                <View style={styles.topProgressLeft}>
                  <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
                  <Text style={styles.topProgressTitle}>
                    {totalMatches === 1
                      ? "Especialista Recomendado"
                      : `Top ${totalMatches} Especialistas para Você`}
                  </Text>
                </View>
                <Text style={styles.topProgressCounter}>
                  {state.currentIndex + 1} DE {totalMatches}
                </Text>
              </View>

              <View style={styles.topSegmentsRow}>
                {state.personalsExibidos.map((p, idx) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.topSegmentTrack, idx === state.currentIndex && styles.topSegmentActive]}
                    onPress={() => actions.goToIndex(idx)}
                    activeOpacity={0.75}
                  />
                ))}
              </View>
            </View>

            <MatchCard
              item={currentItem}
              index={state.currentIndex}
              total={totalMatches}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={actions.prevPersonal}
              onNext={actions.nextPersonal}
              onAbrirAnalise={actions.abrirDetalhesMatch}
              onVerPerfil={actions.verPerfilCompleto}
            />
          </>
        ) : (
          <MatchEmptyState
            isAlunoConsultoria={state.isAlunoConsultoria}
            distanciaMaxima={state.distanciaMaxima}
            onExpandirRadar={() => actions.handleSliderChange(Math.max(state.distanciaMaxima + 30, 50))}
            onAjustarPreferencias={abrirRaioX}
          />
        )}
      </ScrollView>

      <MatchAnalysisModal
        visible={state.modalVisible}
        personal={state.matchSelecionado}
        onClose={actions.fecharDetalhesMatch}
        onVerPerfil={actions.verPerfilCompleto}
      />

      <Modal
        visible={Boolean(state.modalNovaPropostaVisivel)}
        transparent
        animationType="slide"
        onRequestClose={actions.fecharModalNovaProposta}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.propostaCard}>
            <View style={styles.propostaAvatarBox}>
              <Image
                source={{ uri: state.dadosNovaProposta?.personals?.foto_url || FALLBACK_AVATAR }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            <Ionicons name="mail-unread" size={28} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.propostaTitle}>Você recebeu uma proposta!</Text>
            <Text style={styles.propostaDesc}>
              {nomeProposta} enviou as condições do acompanhamento. Revise os termos ou converse no chat antes de
              assinar.
            </Text>

            <View style={styles.propostaBtns}>
              <TouchableOpacity style={styles.btnPropostaGreen} onPress={actions.irParaProposta} activeOpacity={0.85}>
                <Text style={styles.btnPropostaGreenText}>Ver Proposta Completa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnActionOutlined}
                onPress={actions.irParaChatNovaProposta}
                activeOpacity={0.85}
              >
                <Text style={styles.btnActionTextNeon}>Conversar no Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPropostaGhost}
                onPress={actions.fecharModalNovaProposta}
                activeOpacity={0.7}
              >
                <Text style={styles.btnPropostaGhostText}>Decidir Depois</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}