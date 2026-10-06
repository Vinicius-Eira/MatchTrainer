import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../theme/theme";
import { styles } from "./styles";
import { Avaliacao, useAvaliacoes } from "./useAvaliacoes";

interface AvaliacoesProps {
  navigation: {
    goBack: () => void;
  };
}

export function Avaliacoes({ navigation }: AvaliacoesProps) {
  const {
    avaliacoes,
    loading,
    metricas,
    fadeAnim,
    formatRelativeDate,
  } = useAvaliacoes();

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
      />

      <Text style={styles.mediaText}>{metricas.media}</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(Number(metricas.media)) ? "star" : "star-outline"}
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
          const quantidade = metricas.distribuicao[nota] || 0;
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

  const renderCard = ({ item }: ListRenderItemInfo<Avaliacao>) => (
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