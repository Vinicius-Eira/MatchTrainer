import React from "react";
import { Text, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { FormacaoItem, getEspecialidadeInfo, VitrineConfig } from "../usePersonalPublicProfile";
import { styles } from "./styles";

interface AuthorityProps {
  personal: any;
  vitrineConfig: VitrineConfig;
  formacoes: FormacaoItem[];
  todasAsTags: string[];
  locaisAtendimento: string[];
  dnaAtendimento: { label: string; valor: string; icon: string }[];
  diferenciaisLegacy?: string;
}


export function Authority({
    personal,
    vitrineConfig,
    formacoes,
    todasAsTags,
    locaisAtendimento,
    dnaAtendimento,
    diferenciaisLegacy,
}: AuthorityProps) {
    const diferenciaisLista = Array.isArray(vitrineConfig.diferenciais_lista) ? vitrineConfig.diferenciais_lista : [];
    const temBlocoMetodo = Boolean(vitrineConfig.metodo_descricao || diferenciaisLegacy || diferenciaisLista.length > 0);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={16} color="#FF6B00" />
                <Text style={styles.sectionTitle}>Sobre o Treinador</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.bioText}>
                    {personal?.descricao ||
                        "Profissional dedicado a construir treinos inteligentes, seguros e adaptados à rotina de cada aluno."}
                </Text>
            </View>

            {temBlocoMetodo && (
                <>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="diamond-outline" size={16} color="#FF6B00" />
                        <Text style={styles.sectionTitle}>Método & Diferenciais</Text>
                    </View>
                    <View style={styles.card}>
                        {vitrineConfig.metodo_titulo ? (
                            <Text style={styles.metodoTitle}>{vitrineConfig.metodo_titulo}</Text>
                        ) : null}
                        {(vitrineConfig.metodo_descricao || diferenciaisLegacy) ? (
                            <Text style={styles.bioText}>{vitrineConfig.metodo_descricao || diferenciaisLegacy}</Text>
                        ) : null}
                        {diferenciaisLista.map((item, idx) => (
                            <View key={idx} style={styles.difItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginTop: 2 }} />
                                <Text style={styles.difText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {formacoes.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="school-outline" size={16} color="#FF6B00" />
                        <Text style={styles.sectionTitle}>Formação & Certificações</Text>
                    </View>
                    <View style={styles.card}>
                        {formacoes.map((f, idx) => (
                            <View
                                key={f.id || idx}
                                style={[styles.formacaoRow, idx === formacoes.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}
                            >
                                <View style={styles.formacaoIcon}>
                                    <Ionicons name="ribbon-outline" size={18} color="#FF6B00" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.formacaoTitulo}>{f.titulo}</Text>
                                    <Text style={styles.formacaoSub}>
                                        {f.instituicao}
                                        {f.ano ? ` • ${f.ano}` : ""}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {dnaAtendimento.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flash-outline" size={16} color="#FF6B00" />
                        <Text style={styles.sectionTitle}>Estilo de Acompanhamento</Text>
                    </View>
                    <View style={styles.dnaGrid}>
                        {dnaAtendimento.map((dna, idx) => (
                            <View key={idx} style={styles.dnaChip}>
                                <Text style={styles.dnaLabel}>{dna.label}</Text>
                                <Text style={styles.dnaVal}>{dna.valor}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {todasAsTags.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="analytics-outline" size={16} color="#FF6B00" />
                        <Text style={styles.sectionTitle}>Especialidades & Foco</Text>
                    </View>
                    <View style={{ marginBottom: 14 }}>
                        {todasAsTags.map((tag, idx) => {
                            const info = getEspecialidadeInfo(tag);
                            return (
                                <View key={`${tag}-${idx}`} style={styles.specRow}>
                                    <View style={styles.specIconBox}>
                                        <FontAwesome5 name={info.icon} size={15} color="#FF6B00" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.specTitle}>{info.title}</Text>
                                        <Text style={styles.specDesc}>{info.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </>
            )}

            {locaisAtendimento.length > 0 && (
                <>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location-outline" size={16} color="#FF6B00" />
                        <Text style={styles.sectionTitle}>Locais de Atendimento</Text>
                    </View>
                    <View style={styles.locaisWrap}>
                        {locaisAtendimento.map((local, idx) => (
                            <View key={idx} style={styles.localPill}>
                                <Ionicons name="business-outline" size={13} color="#FF6B00" />
                                <Text style={styles.localPillText}>{local}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}