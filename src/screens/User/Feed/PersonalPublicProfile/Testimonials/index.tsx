import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

interface TestimonialsProps {
    notaMedia: number;
    avaliacoes: any[];
    depoimentosFixadosIds: string[];
}

export function Testimonials({ notaMedia, avaliacoes, depoimentosFixadosIds }: TestimonialsProps) {
    const ordenadas = [...avaliacoes].sort((a, b) => {
        const aFix = depoimentosFixadosIds.includes(a.id) ? 1 : 0;
        const bFix = depoimentosFixadosIds.includes(b.id) ? 1 : 0;
        return bFix - aFix;
    });

    return (
        <View style={styles.container}>
            {avaliacoes.length > 0 && (
                <View style={styles.resumoCard}>
                    <Text style={styles.notaGrande}>{notaMedia > 0 ? notaMedia.toFixed(1) : "5.0"}</Text>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Ionicons
                                    key={i}
                                    name={i < Math.round(notaMedia || 5) ? "star" : "star-outline"}
                                    size={16}
                                    color="#FF6B00"
                                />
                            ))}
                        </View>
                        <Text style={styles.resumoSub}>
                            Baseado em {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação real" : "avaliações reais"} de alunos
                        </Text>
                    </View>
                </View>
            )}

            {ordenadas.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Ionicons name="star-outline" size={36} color="rgba(255, 107, 0, 0.4)" />
                    <Text style={styles.emptyTitle}>Avaliações Verificadas</Text>
                    <Text style={styles.emptyDesc}>
                        Os depoimentos reais dos alunos aparecerão aqui assim que concluírem o primeiro ciclo de treinos.
                    </Text>
                </View>
            ) : (
                ordenadas.map((av) => {
                    const fixado = depoimentosFixadosIds.includes(av.id);
                    const nomeAluno = av.usuarios?.nome || "Aluno MatchTrainer";
                    return (
                        <View key={av.id} style={[styles.reviewCard, fixado && styles.reviewCardFixado]}>
                            {fixado && (
                                <View style={styles.pinTag}>
                                    <Ionicons name="pin" size={12} color="#FF6B00" />
                                    <Text style={styles.pinTagText}>Depoimento em Destaque</Text>
                                </View>
                            )}
                            <View style={styles.reviewHeader}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarLetter}>{nomeAluno.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nome}>{nomeAluno}</Text>
                                    <View style={{ flexDirection: "row", gap: 2 }}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={12} color="#FF6B00" />
                                        ))}
                                    </View>
                                </View>
                            </View>
                            {av.comentario ? <Text style={styles.comentario}>{av.comentario}</Text> : null}
                        </View>
                    );
                })
            )}
        </View>
    );
}