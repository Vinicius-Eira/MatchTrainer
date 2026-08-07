import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export default function Avaliacoes({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    media: 0,
    total: 0,
    distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    carregarAvaliacoes();
  }, []);

  const carregarAvaliacoes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("avaliacoes")
        .select(
          `
          id, nota, comentario, criado_em,
          usuarios (nome, foto_url)
        `,
        )
        .eq("personal_id", user.id)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setAvaliacoes(data);
        calcularMetricas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (dados) => {
    const total = dados.length;
    let soma = 0;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    dados.forEach((item) => {
      soma += item.nota;
      dist[item.nota] = (dist[item.nota] || 0) + 1;
    });

    setMetricas({
      media: (soma / total).toFixed(1),
      total: total,
      distribuicao: dist,
    });
  };

  const formatRelativeDate = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas} h`;
    if (dias === 1) return `ontem`;
    return `há ${dias} dias`;
  };

  const renderSkeleton = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3].map((key) => (
        <Animated.View
          key={key}
          style={[styles.skeletonCard, { opacity: fadeAnim }]}
        />
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      ></TouchableOpacity>

      <Text style={styles.mediaText}>{metricas.media}</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(metricas.media) ? "star" : "star-outline"}
            size={28}
            color={theme.colors.primary}
          />
        ))}
      </View>
      <Text style={styles.totalAvaliacoesText}>
        Baseado em {metricas.total} avaliações
      </Text>

      <View style={styles.distribuicaoContainer}>
        {[5, 4, 3, 2, 1].map((nota) => {
          const quantidade = metricas.distribuicao[nota];
          const porcentagem =
            metricas.total > 0 ? (quantidade / metricas.total) * 100 : 0;
          return (
            <View key={nota} style={styles.distRow}>
              <Text style={styles.distNotaText}>{nota}★</Text>
              <View style={styles.barraFundo}>
                <View
                  style={[styles.barraPreenchida, { width: `${porcentagem}%` }]}
                />
              </View>
              <Text style={styles.distCountText}>{quantidade}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.usuarios?.foto_url ? (
          <Image
            source={{ uri: item.usuarios.foto_url }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {item.usuarios?.nome?.substring(0, 2).toUpperCase() || "AL"}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.usuarios?.nome}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.nota ? "star" : "star-outline"}
                size={14}
                color={theme.colors.primary}
              />
            ))}
          </View>
        </View>
        <Text style={styles.dateText}>
          {formatRelativeDate(item.criado_em)}
        </Text>
      </View>

      {item.comentario ? (
        <Text style={styles.commentText}>{`"${item.comentario}"`}</Text>
      ) : (
        <Text
          style={[styles.commentText, { fontStyle: "italic", color: "#555" }]}
        >
          Sem comentário
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color="#333" />
      <Text style={styles.emptyTitle}>Você ainda não tem avaliações</Text>
      <Text style={styles.emptySub}>
        Seus alunos poderão te avaliar após o primeiro treino.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 10,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ alignSelf: "flex-start", padding: 5 }}
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={avaliacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={
          !loading && avaliacoes.length > 0 ? renderHeader : null
        }
        ListEmptyComponent={loading ? renderSkeleton : renderEmpty}
        contentContainerStyle={
          avaliacoes.length === 0 && !loading
            ? { flex: 1 }
            : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContainer: { padding: scale(20), paddingBottom: verticalScale(50) },

  headerContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
    paddingTop: verticalScale(40),
  },
  backButton: {
    position: "absolute",
    top: verticalScale(40),
    left: 0,
    padding: scale(10),
  },
  mediaText: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(64),
    color: theme.colors.primary,
    lineHeight: moderateScale(70),
  },
  starsContainer: {
    flexDirection: "row",
    gap: scale(4),
    marginBottom: verticalScale(5),
  },
  totalAvaliacoesText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(13),
    marginBottom: verticalScale(20),
  },

  distribuicaoContainer: { width: "100%", paddingHorizontal: scale(20) },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(6),
  },
  distNotaText: {
    color: theme.colors.textSecondary,
    width: scale(25),
    fontSize: moderateScale(13),
  },
  barraFundo: {
    flex: 1,
    height: verticalScale(8),
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(4),
    marginHorizontal: scale(10),
    overflow: "hidden",
  },
  barraPreenchida: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: moderateScale(4),
  },
  distCountText: {
    color: theme.colors.textSecondary,
    width: scale(20),
    textAlign: "right",
    fontSize: moderateScale(13),
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
  },
  avatarFallback: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: moderateScale(14),
  },
  userInfo: { flex: 1, marginLeft: scale(12) },
  userName: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: moderateScale(15),
    marginBottom: verticalScale(2),
  },
  starsRow: { flexDirection: "row", gap: scale(2) },
  dateText: { color: theme.colors.textSecondary, fontSize: moderateScale(11) },
  commentText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(40),
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: moderateScale(18),
    fontWeight: "bold",
    marginTop: verticalScale(15),
    textAlign: "center",
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(14),
    textAlign: "center",
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },

  skeletonCard: {
    width: "100%",
    height: verticalScale(100),
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
  },
});
