import React, { useState } from "react";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CategoriaPublicacao, PublicacaoVitrine } from "../usePersonalPublicProfile";
import { styles } from "./styles";

interface ResultsProps {
    publicacoes: PublicacaoVitrine[];
    isOwner: boolean;
    onPublicarNovo?: () => void;
}

const FILTROS: { id: CategoriaPublicacao; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "resultado", label: "Resultados" },
    { id: "treino", label: "Treinos" },
    { id: "certificado", label: "Certificados" },
    { id: "espaco", label: "Espaço" },
];

const LABEL_CATEGORIA: Record<string, string> = {
    resultado: "Resultado Real",
    treino: "Dia a Dia / Treino",
    certificado: "Certificação",
    espaco: "Local de Treino",
};

export function Results({ publicacoes, isOwner, onPublicarNovo }: ResultsProps) {
    const [filtro, setFiltro] = useState<CategoriaPublicacao>("todos");
    const [pubSelecionada, setPubSelecionada] = useState<PublicacaoVitrine | null>(null);

    const listaFiltrada =
        filtro === "todos" ? publicacoes : publicacoes.filter((item) => item.categoria === filtro);

    return (
        <View style={styles.wrapper}>
            {publicacoes.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosScroll}>
                    {FILTROS.map((f) => {
                        const ativo = filtro === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                style={[styles.filtroChip, ativo && styles.filtroChipAtivo]}
                                onPress={() => setFiltro(f.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.filtroChipText, ativo && styles.filtroChipTextAtivo]}>{f.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {listaFiltrada.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Ionicons name="images-outline" size={38} color="rgba(255, 107, 0, 0.45)" />
                    <Text style={styles.emptyTitle}>
                        {publicacoes.length === 0 ? "Vitrine de Resultados" : "Nenhuma foto nesta categoria"}
                    </Text>
                    <Text style={styles.emptyDesc}>
                        {isOwner
                            ? "Publique fotos de antes e depois, treinos ou certificações para multiplicar a conversão do seu perfil."
                            : "Este treinador ainda não publicou registros nesta categoria."}
                    </Text>
                    {isOwner && onPublicarNovo && (
                        <TouchableOpacity style={styles.btnPublicarEmpty} onPress={onPublicarNovo} activeOpacity={0.85}>
                            <Ionicons name="add-circle-outline" size={16} color="#FF6B00" />
                            <Text style={styles.btnPublicarEmptyText}>Publicar Primeiro Resultado</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={styles.grid}>
                    {listaFiltrada.map((pub) => (
                        <TouchableOpacity
                            key={pub.id}
                            style={styles.tile}
                            onPress={() => setPubSelecionada(pub)}
                            activeOpacity={0.88}
                        >
                            <Image source={{ uri: pub.imagem_url }} style={styles.tileImage} resizeMode="cover" />
                            {pub.fixado && (
                                <View style={styles.tilePinBadge}>
                                    <Ionicons name="pin" size={11} color="#FF6B00" />
                                </View>
                            )}
                            {pub.metrica_destaque ? (
                                <LinearGradient colors={["transparent", "rgba(0,0,0,0.88)"]} style={styles.tileMetricGradient}>
                                    <Text style={styles.tileMetricText} numberOfLines={1}>
                                        {pub.metrica_destaque}
                                    </Text>
                                </LinearGradient>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Modal
                visible={Boolean(pubSelecionada)}
                animationType="fade"
                onRequestClose={() => setPubSelecionada(null)}
            >
                <View style={styles.lightboxOverlay}>
                    <View style={styles.lightboxHeader}>
                        <View style={styles.lightboxCatPill}>
                            <Text style={styles.lightboxCatText}>
                                {LABEL_CATEGORIA[pubSelecionada?.categoria || "resultado"] || "Vitrine"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.btnFecharLightbox}
                            onPress={() => setPubSelecionada(null)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {pubSelecionada?.imagem_url && (
                            <Image
                                source={{ uri: pubSelecionada.imagem_url }}
                                style={styles.lightboxImage}
                                resizeMode="cover"
                            />
                        )}
                        <View style={styles.lightboxBody}>
                            {pubSelecionada?.metrica_destaque ? (
                                <View style={styles.lightboxMetricPill}>
                                    <Ionicons name="trending-up" size={14} color="#00E676" />
                                    <Text style={styles.lightboxMetricText}>{pubSelecionada.metrica_destaque}</Text>
                                </View>
                            ) : null}
                            {pubSelecionada?.titulo ? <Text style={styles.lightboxTitulo}>{pubSelecionada.titulo}</Text> : null}
                            <Text style={styles.lightboxLegenda}>
                                {pubSelecionada?.legenda || "Registro publicado na vitrine oficial do treinador no MatchTrainer."}
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}