import React, { useCallback, useEffect, useMemo } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useAnimatedValue,
  View,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PersonalMatchItem } from "../../services/match/matchService";
import { theme } from "../../theme/theme";
import { styles } from "../../screens/User/Feed/styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.24;
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";

interface MatchCardProps {
  item: PersonalMatchItem;
  index: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onAbrirAnalise: (item: PersonalMatchItem) => void;
  onVerPerfil: (personalId: string) => void;
}

const formatarLocal = (cidade?: string | null, bairro?: string | null) => {
  if (bairro && cidade) return `${bairro}, ${cidade}`;
  return bairro || cidade || "Local não informado";
};

const getEspecialidadeVisual = (obj: string): { label: string; icon: any } => {
  const key = obj.toLowerCase();
  if (key.includes("emagrec")) return { label: "Emagrecimento", icon: "flame" };
  if (key.includes("hipertrof")) return { label: "Hipertrofia", icon: "barbell" };
  if (key.includes("perform")) return { label: "Performance", icon: "speedometer" };
  if (key.includes("saude") || key.includes("saúde")) return { label: "Saúde", icon: "heart" };
  return { label: obj.charAt(0).toUpperCase() + obj.slice(1), icon: "sparkles" };
};

export function MatchCard({
  item,
  index,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onAbrirAnalise,
  onVerPerfil,
}: MatchCardProps) {
  const translateX = useAnimatedValue(0);
  const enterOpacity = useAnimatedValue(1);

  useEffect(() => {
    translateX.setValue(0);
    enterOpacity.setValue(0.35);
    Animated.timing(enterOpacity, {
      toValue: 1,
      duration: 210,
      useNativeDriver: true,
    }).start();
  }, [item.id, translateX, enterOpacity]);

  const animarTroca = useCallback(
    (direcao: "next" | "prev") => {
      Animated.timing(translateX, {
        toValue: direcao === "next" ? -SCREEN_WIDTH : SCREEN_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        if (direcao === "next") onNext();
        else onPrev();
      });
    },
    [translateX, onNext, onPrev]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.3,
        onPanResponderMove: (_, gesture) => {
          if ((gesture.dx > 0 && !hasPrev) || (gesture.dx < 0 && !hasNext)) {
            translateX.setValue(gesture.dx * 0.22);
          } else {
            translateX.setValue(gesture.dx);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -SWIPE_THRESHOLD && hasNext) {
            animarTroca("next");
            return;
          }
          if (gesture.dx > SWIPE_THRESHOLD && hasPrev) {
            animarTroca("prev");
            return;
          }

          Animated.spring(translateX, {
            toValue: 0,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }).start();
        },
      }),
    [hasPrev, hasNext, translateX, animarTroca]
  );

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-7deg", "0deg", "7deg"],
    extrapolate: "clamp",
  });

  const nextStampOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -28, 0],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  });

  const prevStampOpacity = translateX.interpolate({
    inputRange: [0, 28, SWIPE_THRESHOLD],
    outputRange: [0, 0.2, 1],
    extrapolate: "clamp",
  });

  const isPoucasVagas = item.status_agenda === "Poucas Vagas";
  const isConsultoria =
    item.modoAtendimento === "Consultoria" || item.labelPreco.toLowerCase().includes("consultoria");
  const objetivosVisiveis = (item.specsParsed?.objetivos || []).filter((o) => o !== "outro").slice(0, 4);
  const expCurta = item.tempo_experiencia ? item.tempo_experiencia.split(" ")[0] : "Pro";

  return (
    <View style={styles.cardWrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.premiumCard,
          {
            opacity: enterOpacity,
            transform: [{ translateX }, { rotate }],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.foto_url || FALLBACK_AVATAR }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient colors={["rgba(4,4,8,0.65)", "transparent"]} style={styles.imageOverlayTop} />
          <LinearGradient
            colors={["transparent", "rgba(10,10,15,0.68)", "#0A0A0F"]}
            style={styles.imageOverlayBottom}
          />

          <View style={styles.topBadgesRow}>
            <View style={styles.badgeService}>
              <Ionicons name={item.iconUi as any} size={12} color={theme.colors.primary} />
              <Text style={styles.badgeServiceText}>{item.badgeUi}</Text>
            </View>

            <TouchableOpacity
              style={styles.badgeMatch}
              onPress={() => onAbrirAnalise(item)}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={13} color={theme.colors.primary} />
              <Text style={styles.badgeMatchText}>{item.matchPercentual}% MATCH</Text>
              <Ionicons name="chevron-forward" size={13} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {hasPrev ? (
            <TouchableOpacity
              style={[styles.sideArrowBtn, styles.sideArrowLeft]}
              onPress={() => animarTroca("prev")}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </TouchableOpacity>
          ) : null}

          {hasNext ? (
            <TouchableOpacity
              style={[styles.sideArrowBtn, styles.sideArrowBtnAccent, styles.sideArrowRight]}
              onPress={() => animarTroca("next")}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ) : null}

          {hasNext ? (
            <Animated.View pointerEvents="none" style={[styles.swipeStamp, { opacity: nextStampOpacity }]}>
              <Text style={styles.swipeStampText}>Próximo</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
            </Animated.View>
          ) : null}

          {hasPrev ? (
            <Animated.View pointerEvents="none" style={[styles.swipeStamp, { opacity: prevStampOpacity }]}>
              <Ionicons name="arrow-back" size={14} color={theme.colors.primary} />
              <Text style={styles.swipeStampText}>Anterior</Text>
            </Animated.View>
          ) : null}

          <View style={styles.imageBottomText}>
            <View style={styles.rankTierRow}>
              <View style={styles.rankPill}>
                <Ionicons name="trophy" size={10} color={theme.colors.primary} />
                <Text style={styles.rankPillText}>Top #{index + 1}</Text>
              </View>
              <View style={styles.tierPill}>
                <View style={styles.tierDot} />
                <Text style={styles.tierText}>{item.matchTierLabel}</Text>
              </View>
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.nome}
              </Text>
              {item.cref_verificado ? (
                <MaterialCommunityIcons name="check-decagram" size={22} color="#00E676" />
              ) : null}
            </View>

            <View style={styles.locationMetaRow}>
              <View style={styles.locationPill}>
                <Ionicons
                  name={item.modoAtendimento === "Consultoria" ? "phone-portrait-outline" : "location-outline"}
                  size={13}
                  color={theme.colors.primary}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.modoAtendimento === "Consultoria"
                    ? "Atendimento 100% Online"
                    : `${formatarLocal(item.cidade, item.bairro)}${
                        item.distanciaReal !== null ? ` • ${item.distanciaReal.toFixed(1)} km` : ""
                      }`}
                </Text>
              </View>

              <View
                style={[
                  styles.agendaPill,
                  isPoucasVagas
                    ? { backgroundColor: "rgba(255, 59, 48, 0.14)", borderColor: "rgba(255, 59, 48, 0.45)" }
                    : { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.4)" },
                ]}
              >
                <View style={[styles.agendaDot, { backgroundColor: isPoucasVagas ? "#FF3B30" : "#00E676" }]} />
                <Text style={[styles.agendaPillText, { color: isPoucasVagas ? "#FF3B30" : "#00E676" }]}>
                  {item.status_agenda}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardHeadline} numberOfLines={2}>
            {item.headline ||
              item.descricao ||
              "Especialista pronto para montar uma periodização sob medida para o seu objetivo."}
          </Text>

          {objetivosVisiveis.length > 0 ? (
            <View style={styles.specialtiesSection}>
              <View style={styles.specialtiesHeaderRow}>
                <View style={styles.specialtiesAccentBar} />
                <Text style={styles.specialtiesHeader}>Especialidades</Text>
              </View>

              <View style={styles.specialtiesContainer}>
                {objetivosVisiveis.map((esp, i) => {
                  const vis = getEspecialidadeVisual(esp);
                  return (
                    <View key={`${esp}-${i}`} style={styles.tagPrimary}>
                      <LinearGradient
                        colors={["rgba(255, 107, 0, 0.22)", "rgba(255, 107, 0, 0.06)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.tagIconCircle}>
                        <Ionicons name={vis.icon} size={12} color={theme.colors.primary} />
                      </View>
                      <Text style={styles.tagPrimaryText}>{vis.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <View style={styles.statIconWrap}>
                <Ionicons name="star" size={14} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {item.nota_media > 0 ? `${item.nota_media.toFixed(1)}` : "Novo"}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Avaliação
              </Text>
              {item.total_avaliacoes > 0 ? (
                <Text style={styles.statSubLabel} numberOfLines={1}>
                  {item.total_avaliacoes} aval.
                </Text>
              ) : null}
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={styles.statIconWrap}>
                <FontAwesome5 name="dumbbell" size={12} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {expCurta}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                Nível
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <View style={styles.statIconWrap}>
                <Ionicons name="cash-outline" size={15} color={theme.colors.primary} />
              </View>
              <Text
                style={[styles.statValue, { color: theme.colors.primary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.precoAvaliar ? `R$ ${item.precoAvaliar}` : "Consulta"}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                {isConsultoria ? "Consultoria" : "Presencial"}
              </Text>
              <Text style={styles.statSubLabel} numberOfLines={1}>
                {isConsultoria ? "mês" : "por aula"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnActionOutlined}
            activeOpacity={0.85}
            onPress={() => onVerPerfil(item.id)}
          >
            <LinearGradient
              colors={["rgba(255, 107, 0, 0.16)", "rgba(255, 107, 0, 0.02)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.btnActionTextNeon}>Ver Perfil Completo</Text>
            <Ionicons name="arrow-forward" size={17} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {total > 1 ? (
        <View style={styles.swipeFootHint}>
          <Ionicons name="swap-horizontal" size={14} color="#71717A" />
          <Text style={styles.swipeFootHintText}>Arraste o card ou use as setas laterais</Text>
        </View>
      ) : null}
    </View>
  );
}