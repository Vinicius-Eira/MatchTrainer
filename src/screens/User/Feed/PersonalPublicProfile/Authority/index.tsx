import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  FormacaoItem,
  getEspecialidadeInfo,
  hexToRgba,
  VitrineConfig,
} from "../usePersonalPublicProfile";
import { styles } from "./styles";

interface AuthorityProps {
  personal: any;
  corDestaque?: string;
  vitrineConfig: VitrineConfig;
  formacoes: FormacaoItem[];
  todasAsTags: string[];
  locaisAtendimento: string[];
  dnaAtendimento: { label: string; valor: string; icon: string }[];
  diferenciaisLegacy?: string;
}

function getIconeDiferencial(texto: string): any {
  const t = texto.toLowerCase();
  if (t.includes("vídeo") || t.includes("video") || t.includes("execução")) return "videocam-outline";
  if (t.includes("whatsapp") || t.includes("suporte") || t.includes("chat") || t.includes("contato")) return "chatbubbles-outline";
  if (t.includes("carga") || t.includes("ajuste") || t.includes("semanal") || t.includes("evolução")) return "trending-up-outline";
  if (t.includes("rotina") || t.includes("horário") || t.includes("tempo") || t.includes("adapt")) return "time-outline";
  if (t.includes("avalia") || t.includes("meta") || t.includes("bioimped") || t.includes("resultado")) return "analytics-outline";
  if (t.includes("lesão") || t.includes("dor") || t.includes("segur") || t.includes("saúde")) return "shield-checkmark-outline";
  if (t.includes("dieta") || t.includes("nutri") || t.includes("aliment")) return "nutrition-outline";
  if (t.includes("app") || t.includes("planilha") || t.includes("treino")) return "barbell-outline";
  return "ribbon-outline";
}

function getIconeEspecialidade(tag: string): any {
  const t = tag.toLowerCase();
  if (t.includes("hipertrofia")) return "barbell-outline";
  if (t.includes("emagrecimento")) return "flame-outline";
  if (t.includes("saude") || t.includes("saúde") || t.includes("qualidade")) return "heart-outline";
  if (t.includes("performance") || t.includes("rendimento")) return "speedometer-outline";
  if (t.includes("gestante") || t.includes("gravidez")) return "body-outline";
  if (t.includes("idoso") || t.includes("longevidade")) return "walk-outline";
  if (t.includes("lesão") || t.includes("lesao") || t.includes("dor") || t.includes("reabilitação")) return "medkit-outline";
  if (
    t.includes("médica") ||
    t.includes("medica") ||
    t.includes("clínica") ||
    t.includes("clinica") ||
    t.includes("cardio") ||
    t.includes("hiperten") ||
    t.includes("diabet")
  ) {
    return "pulse-outline";
  }
  if (
    t.includes("postura") ||
    t.includes("coluna") ||
    t.includes("joelho") ||
    t.includes("ombro") ||
    t.includes("quadril") ||
    t.includes("tornozelo")
  ) {
    return "shield-checkmark-outline";
  }
  return "fitness-outline";
}

function getIconeDna(label: string, fallbackIcon?: string): any {
  const l = label.toLowerCase();
  if (l.includes("comunica")) return "chatbubbles-outline";
  if (l.includes("cobran")) return "flame-outline";
  if (l.includes("contato") || l.includes("acompanh")) return "calendar-outline";
  return fallbackIcon || "pulse-outline";
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionBar, { backgroundColor: accent }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function Authority({
  personal,
  corDestaque = "#FF6B00",
  vitrineConfig,
  formacoes,
  todasAsTags,
  locaisAtendimento,
  dnaAtendimento,
  diferenciaisLegacy,
}: AuthorityProps) {
  const accent = corDestaque || "#FF6B00";
  const accentSoft = hexToRgba(accent, 0.13);
  const accentBorder = hexToRgba(accent, 0.4);
  const accentCardBorder = hexToRgba(accent, 0.28);

  const metodoTitulo = vitrineConfig?.metodo_titulo?.trim() || "";
  const metodoDescricao = vitrineConfig?.metodo_descricao?.trim() || "";

  const diferenciaisLista: string[] =
    Array.isArray(vitrineConfig?.diferenciais_lista) && vitrineConfig.diferenciais_lista.length > 0
      ? vitrineConfig.diferenciais_lista
      : diferenciaisLegacy && diferenciaisLegacy.trim() && diferenciaisLegacy.trim() !== metodoDescricao
        ? diferenciaisLegacy
            .split(/\n|;|•/)
            .map((s) => s.trim())
            .filter((s) => s.length > 2)
        : [];

  const temMetodo = Boolean(metodoTitulo || metodoDescricao);

  return (
    <View style={styles.container}>
      <View style={styles.sectionBlock}>
        <SectionTitle title="Sobre o Treinador" accent={accent} />
        <View style={styles.bioCard}>
          <Text style={styles.bodyText}>
            {personal?.descricao?.trim() ||
              "Profissional dedicado a construir treinos inteligentes, seguros e adaptados à rotina real de cada aluno."}
          </Text>
        </View>
      </View>

      {todasAsTags.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionTitle title="Especialidades" accent={accent} />
          <View style={styles.specsGrid}>
            {todasAsTags.map((tag, idx) => {
              const info = getEspecialidadeInfo(tag);
              const isLastOdd = idx === todasAsTags.length - 1 && todasAsTags.length % 2 !== 0;
              return (
                <View key={`${tag}-${idx}`} style={[styles.specTile, isLastOdd && styles.specTileFull]}>
                  <View style={[styles.specTileIcon, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Ionicons name={getIconeEspecialidade(tag)} size={18} color={accent} />
                  </View>
                  <Text style={styles.specTileTitle} numberOfLines={2}>
                    {info.title}
                  </Text>
                  <Text style={styles.specTileDesc} numberOfLines={3}>
                    {info.desc}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {temMetodo ? (
        <View style={styles.sectionBlock}>
          <SectionTitle title="Metodologia" accent={accent} />
          <View style={[styles.metodoCard, { borderColor: accentCardBorder }]}>
            <LinearGradient
              colors={[hexToRgba(accent, 0.09), "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.metodoTopGlow}
            />

            <View style={styles.metodoTopRow}>
              <View style={[styles.metodoPill, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Ionicons name="layers-outline" size={12} color={accent} />
                <Text style={[styles.metodoPillText, { color: accent }]}>Método de Trabalho</Text>
              </View>
            </View>

            {metodoTitulo ? <Text style={styles.metodoTitle}>{metodoTitulo}</Text> : null}

            {metodoTitulo && metodoDescricao ? <View style={styles.metodoDivider} /> : null}

            {metodoDescricao ? <Text style={styles.metodoDesc}>{metodoDescricao}</Text> : null}
          </View>
        </View>
      ) : null}

      {diferenciaisLista.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionTitle title="Diferenciais" accent={accent} />
          <View style={styles.difGrid}>
            {diferenciaisLista.map((item, idx) => {
              const isLastOdd = idx === diferenciaisLista.length - 1 && diferenciaisLista.length % 2 !== 0;
              return (
                <View key={`${item}-${idx}`} style={[styles.difCard, isLastOdd && styles.difCardFull]}>
                  <View style={styles.difCardTop}>
                    <View style={[styles.difIconBox, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                      <Ionicons name={getIconeDiferencial(item)} size={17} color={accent} />
                    </View>
                    <Ionicons name="checkmark-circle-outline" size={16} color={accent} style={{ opacity: 0.85 }} />
                  </View>

                  <Text style={styles.difText}>{item}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {dnaAtendimento.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionTitle title="Estilo de Acompanhamento" accent={accent} />
          <View style={styles.editorialPanel}>
            {dnaAtendimento.map((dna, idx) => (
              <View key={dna.label}>
                <View style={styles.dnaItem}>
                  <View style={[styles.dnaIconBox, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Ionicons name={getIconeDna(dna.label, dna.icon)} size={18} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dnaLabel}>{dna.label}</Text>
                    <Text style={styles.dnaValue}>{dna.valor}</Text>
                  </View>
                </View>
                {idx < dnaAtendimento.length - 1 ? <View style={styles.hairline} /> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {formacoes.length > 0 ? (
        <View style={styles.formacaoOuterCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconBox, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
              <Ionicons name="school-outline" size={17} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Formação & Certificações</Text>
              <Text style={styles.cardSubtitle}>Qualificação acadêmica e especializações</Text>
            </View>
          </View>

          {formacoes.map((f, idx) => (
            <View
              key={f.id || `${f.titulo}-${idx}`}
              style={[styles.timelineRow, idx === formacoes.length - 1 && { marginBottom: 0 }]}
            >
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: accent }]} />
                {idx < formacoes.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>

              <View style={styles.formacaoBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formacaoTitle}>{f.titulo}</Text>
                  <Text style={styles.formacaoInst}>{f.instituicao}</Text>
                </View>
                {f.ano ? (
                  <View style={[styles.anoPill, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Text style={[styles.anoPillText, { color: accent }]}>{f.ano}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {locaisAtendimento.length > 0 ? (
        <View style={[styles.sectionBlock, { marginBottom: 0 }]}>
          <SectionTitle title="Locais de Atendimento" accent={accent} />
          <View style={styles.locaisWrap}>
            {locaisAtendimento.map((loc, idx) => (
              <View key={`${loc}-${idx}`} style={styles.localChip}>
                <Ionicons name="business-outline" size={14} color={accent} />
                <Text style={styles.localChipText}>{loc}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}