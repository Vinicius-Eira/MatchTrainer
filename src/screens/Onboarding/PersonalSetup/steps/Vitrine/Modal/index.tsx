import React, { useState } from "react";
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { hexToRgba } from "../../../constants";
import { DestaqueStoryItem, FormacaoSetupItem, PublicacaoSetupItem } from "../../../usePersonalSetup";
import { vStyles } from "../styles";

const { width } = Dimensions.get("window");

interface VitrineLivePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  state: any;
}

type AbaPreview = "resultados" | "autoridade" | "depoimentos";
type FiltroCat = "todos" | "resultado" | "treino" | "certificado" | "espaco";

const MAPA_DNA: Record<string, string> = {
  motivador: "Motivador e Energético",
  tecnico: "Técnico e Analítico",
  militar: "Direto e Disciplinado",
  empatico: "Acolhedor e Parceiro",
  leve: "Cobrança Leve (Hábito)",
  moderada: "Cobrança Equilibrada",
  rigorosa: "Alta Demanda e Metas",
  pontual: "Acompanhamento Pontual",
  frequente: "Check-ins Semanais",
  proximo: "Contato Quase Diário",
};

const FILTROS_FEED: { id: FiltroCat; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "resultado", label: "Resultados" },
  { id: "treino", label: "Treinos" },
  { id: "certificado", label: "Certificados" },
  { id: "espaco", label: "Espaço" },
];

const LABEL_CAT: Record<string, string> = {
  resultado: "Resultado Real",
  treino: "Dia a Dia / Treino",
  certificado: "Certificação",
  espaco: "Local de Treino",
};

function getEspecialidadeInfoLocal(tag: string) {
  const t = tag.toLowerCase();
  if (t.includes("hipertrofia")) return { icon: "dumbbell", title: "Hipertrofia", desc: "Treinos estruturados para ganho de massa e volume muscular." };
  if (t.includes("emagrecimento")) return { icon: "fire-alt", title: "Emagrecimento", desc: "Metodologia focada em perda de gordura e definição." };
  if (t.includes("saude") || t.includes("saúde")) return { icon: "heartbeat", title: "Saúde & Qualidade", desc: "Foco em condicionamento, energia e bem-estar diário." };
  if (t.includes("performance")) return { icon: "bolt", title: "Performance", desc: "Treinamento direcionado para força, TAF e esportes." };
  if (t.includes("gestante")) return { icon: "baby", title: "Gestantes & Pós-parto", desc: "Acompanhamento seguro e adaptado para cada fase." };
  if (t.includes("lesao") || t.includes("lesão")) return { icon: "band-aid", title: "Lesões & Reabilitação", desc: "Cuidado técnico focado em fortalecimento seguro sem dor." };
  if (t.includes("clinica") || t.includes("clínica")) return { icon: "notes-medical", title: "Acompanhamento Clínico", desc: "Prescrição alinhada a condições clínicas específicas." };
  if (t.includes("joelho") || t.includes("coluna") || t.includes("ombro") || t.includes("postura")) {
    return { icon: "shield-alt", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Fortalecimento específico e alinhamento biomecânico." };
  }
  return { icon: "bullseye", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Acompanhamento especializado com foco nesta necessidade." };
}

export function VitrineLivePreviewModal({ visible, onClose, state }: VitrineLivePreviewModalProps) {
  const [aba, setAba] = useState<AbaPreview>("resultados");
  const [filtroCat, setFiltroCat] = useState<FiltroCat>("todos");
  const [storyAtivo, setStoryAtivo] = useState<DestaqueStoryItem | null>(null);
  const [postLightbox, setPostLightbox] = useState<PublicacaoSetupItem | null>(null);

  const accent = state.corDestaque || "#FF6B00";
  const accentSoft = hexToRgba(accent, 0.14);
  const accentBorder = hexToRgba(accent, 0.5);

  const modalidades: string[] =
    Array.isArray(state.servicosOferecidos) && state.servicosOferecidos.length > 0
      ? state.servicosOferecidos
      : ["Consultoria"];

  const precoBase = modalidades.includes("Consultoria") ? state.precoConsultoria : state.precoPresencial;
  const labelPreco = modalidades.includes("Consultoria") ? "Consultoria/mês" : "Por aula";

  const localizacao =
    state.bairro && state.cidade
      ? `${state.bairro.trim()}, ${state.cidade.trim()}`
      : state.cidade?.trim() || "Atendimento Online";

  const isPoucasVagas = state.statusAgenda === "Poucas Vagas" || state.statusAgenda === "Lotada";

  const destaquesExibidos: DestaqueStoryItem[] =
    state.destaques.length > 0
      ? state.destaques
      : [
          {
            id: "auto-metodo",
            titulo: "Meu Método",
            icone: "flame",
            subtitulo: "Como eu trabalho",
            conteudo:
              state.metodoDescricao ||
              state.bio ||
              "Treinamento individualizado focado na sua rotina, segurança articular e evolução progressiva.",
          },
          {
            id: "auto-planos",
            titulo: "Planos",
            icone: "wallet",
            subtitulo: "Formatos de Atendimento",
            conteudo: `Atendimento via ${modalidades.join(" e ")}.\n\n${
              modalidades.includes("Consultoria") ? `• Consultoria Online: R$ ${state.precoConsultoria}/mês\n` : ""
            }${modalidades.includes("Presencial") ? `• Presencial: R$ ${state.precoPresencial}/aula` : ""}`,
          },
          ...(state.locaisAtendidos?.length > 0
            ? [
                {
                  id: "auto-locais",
                  titulo: "Locais",
                  icone: "location",
                  subtitulo: localizacao,
                  conteudo: `Atendimento presencial em: ${state.locaisAtendidos.join(", ")}.`,
                },
              ]
            : []),
        ];

  const publicacoesOrdenadas: PublicacaoSetupItem[] = [...state.publicacoes].sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0)
  );
  const publicacoesFiltradas =
    filtroCat === "todos" ? publicacoesOrdenadas : publicacoesOrdenadas.filter((p) => p.categoria === filtroCat);

  const todasAsTags = [
    ...(state.objetivosAtendidos || []),
    ...(state.limitacoesAtendidas || []),
    ...(state.subsAtendidos || []),
    state.outroObjetivoTexto?.trim(),
    state.outraLimitacaoTexto?.trim(),
  ].filter((t) => t && t !== "nenhuma" && t !== "outro" && t !== "outra");

  const dnaAtendimento = [
    state.estiloComunicacao && {
      label: "Comunicação",
      valor: MAPA_DNA[state.estiloComunicacao] || state.estiloComunicacao,
    },
    state.cobranca && {
      label: "Cobrança",
      valor: MAPA_DNA[state.cobranca] || state.cobranca,
    },
    state.acompanhamento && {
      label: "Contato",
      valor: MAPA_DNA[state.acompanhamento] || state.acompanhamento,
    },
  ].filter(Boolean) as { label: string; valor: string }[];

  const avaliacoesOrdenadas = [...(state.avaliacoes || [])].sort((a, b) => {
    const aFix = state.depoimentosFixados.includes(a.id) ? 1 : 0;
    const bFix = state.depoimentosFixados.includes(b.id) ? 1 : 0;
    return bFix - aFix;
  });

  const notaMediaCalc =
    avaliacoesOrdenadas.length > 0
      ? avaliacoesOrdenadas.reduce((acc, a) => acc + Number(a.nota || 5), 0) / avaliacoesOrdenadas.length
      : 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={vStyles.modalOverlay}>
        <View style={vStyles.pubTopBarAbsolute}>
          <TouchableOpacity style={vStyles.pubHeaderIcon} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={vStyles.pubPillTop}>
            <View style={vStyles.previewDotLive} />
            <Text style={vStyles.pubPillTopText}>PRÉVIA DO ALUNO • 98% MATCH</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 135 }}>
          <View style={vStyles.pubCoverBox}>
            {state.capaUrl ? (
              <Image source={{ uri: state.capaUrl }} style={vStyles.previewCoverImg} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[hexToRgba(accent, 0.34), "#111115", "#000000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={vStyles.previewCoverImg}
              />
            )}
            <LinearGradient colors={["transparent", "#000000"]} style={vStyles.previewCoverFade} />
          </View>

          
          <View style={vStyles.pubHeaderSection}>
            <View style={vStyles.previewTopRow}>
              <View style={[vStyles.pubAvatarRing, { borderColor: accent }]}>
                {state.fotoUri ? (
                  <Image source={{ uri: state.fotoUri }} style={vStyles.pubAvatarImg} resizeMode="cover" />
                ) : (
                  <View style={[vStyles.pubAvatarImg, { backgroundColor: "#14141A", justifyContent: "center", alignItems: "center" }]}>
                    <Ionicons name="person" size={34} color="#888" />
                  </View>
                )}
              </View>

              <View style={vStyles.previewCounters}>
                <View style={vStyles.previewCounterItem}>
                  <Text style={vStyles.previewCounterVal}>{publicacoesOrdenadas.length}</Text>
                  <Text style={vStyles.previewCounterLabel}>Registros</Text>
                </View>
                <View style={vStyles.previewCounterItem}>
                  <Text style={vStyles.previewCounterVal}>{notaMediaCalc > 0 ? `${notaMediaCalc.toFixed(1)}★` : "Novo"}</Text>
                  <Text style={vStyles.previewCounterLabel}>Avaliação</Text>
                </View>
                <View style={vStyles.previewCounterItem}>
                  <Text style={vStyles.previewCounterVal}>
                    {state.experiencia ? state.experiencia.split(" ")[0] : "Pro"}
                  </Text>
                  <Text style={vStyles.previewCounterLabel}>Nível</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={vStyles.pubNomeText}>{state.nome || "Seu Nome Profissional"}</Text>
              <MaterialCommunityIcons name="check-decagram" size={19} color="#00E676" />
            </View>

            <Text style={vStyles.pubHeadlineText}>
              {state.headline || state.bio || "Personal Trainer no MatchTrainer • Treino sob medida para o seu objetivo."}
            </Text>

            <View style={vStyles.previewMetaRow}>
              <View style={vStyles.previewMetaItem}>
                <Octicons name="location" size={12} color={accent} />
                <Text style={vStyles.previewMetaText}>{localizacao}</Text>
              </View>
              {state.cref ? (
                <View style={vStyles.previewMetaItem}>
                  <MaterialCommunityIcons name="shield-check-outline" size={13} color={accent} />
                  <Text style={vStyles.previewMetaText}>CREF {state.cref}</Text>
                </View>
              ) : null}
            </View>

            <View style={vStyles.pubPillsRow}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}>
                {modalidades.map((mod) => (
                  <View key={mod} style={[vStyles.pubModPill, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Ionicons
                      name={mod === "Consultoria" ? "phone-portrait-outline" : "barbell-outline"}
                      size={12}
                      color={accent}
                    />
                    <Text style={[vStyles.pubModPillText, { color: accent }]}>{mod}</Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {state.instagram ? (
                  <View style={vStyles.pubBtnSocial}>
                    <Ionicons name="logo-instagram" size={18} color="#FFF" />
                  </View>
                ) : null}
                {state.tiktok ? (
                  <View style={vStyles.pubBtnSocial}>
                    <FontAwesome5 name="tiktok" size={14} color="#FFF" />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={vStyles.pubPriceCard}>
              <View>
                <Text style={{ color: "#8E8E93", fontSize: 10, fontWeight: "800", textTransform: "uppercase" }}>
                  {labelPreco}
                </Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900", marginTop: 2 }}>
                  {precoBase ? `R$ ${precoBase}` : "Sob consulta"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  backgroundColor: isPoucasVagas ? "rgba(255, 59, 48, 0.12)" : "rgba(0, 230, 118, 0.1)",
                  borderColor: isPoucasVagas ? "rgba(255, 59, 48, 0.45)" : "rgba(0, 230, 118, 0.4)",
                }}
              >
                <Ionicons
                  name={isPoucasVagas ? "time-outline" : "checkmark-circle-outline"}
                  size={13}
                  color={isPoucasVagas ? "#FF3B30" : "#00E676"}
                />
                <Text
                  style={{
                    color: isPoucasVagas ? "#FF3B30" : "#00E676",
                    fontSize: 10.5,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  {state.statusAgenda || "Disponível"}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vStyles.pubHighlightsScroll}>
            {destaquesExibidos.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={vStyles.pubHighlightItem}
                onPress={() => setStoryAtivo(dest)}
                activeOpacity={0.8}
              >
                <View style={[vStyles.pubHighlightCircle, { borderColor: accent }]}>
                  {dest.imagem_url ? (
                    <Image source={{ uri: dest.imagem_url }} style={vStyles.pubHighlightImg} resizeMode="cover" />
                  ) : (
                    <Ionicons name={(dest.icone as any) || "flame"} size={22} color={accent} />
                  )}
                </View>
                <Text style={vStyles.storyBubbleLabel} numberOfLines={1}>
                  {dest.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={vStyles.pubTabsBar}>
            {[
              { id: "resultados" as AbaPreview, label: "Resultados", icon: "grid-outline" },
              { id: "autoridade" as AbaPreview, label: "Autoridade", icon: "ribbon-outline" },
              { id: "depoimentos" as AbaPreview, label: `Avaliações (${avaliacoesOrdenadas.length})`, icon: "star-outline" },
            ].map((t) => {
              const ativa = aba === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[vStyles.pubTabBtn, ativa && { borderBottomColor: accent }]}
                  onPress={() => setAba(t.id)}
                >
                  <Ionicons name={t.icon as any} size={15} color={ativa ? accent : "#71717A"} />
                  <Text style={[vStyles.subTabText, ativa && { color: accent, fontWeight: "900" }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {aba === "resultados" && (
            <View>
              {publicacoesOrdenadas.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
                >
                  {FILTROS_FEED.map((f) => {
                    const ativo = filtroCat === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={[vStyles.catChip, ativo && { backgroundColor: accentSoft, borderColor: accent }]}
                        onPress={() => setFiltroCat(f.id)}
                      >
                        <Text style={[vStyles.catChipText, ativo && { color: accent, fontWeight: "900" }]}>{f.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {publicacoesFiltradas.length === 0 ? (
                <View style={{ margin: 16, ...vStyles.emptyInline }}>
                  <Ionicons name="images-outline" size={34} color={hexToRgba(accent, 0.5)} />
                  <Text style={[vStyles.itemTitle, { marginTop: 8 }]}>Vitrine de Resultados</Text>
                  <Text style={[vStyles.itemSub, { textAlign: "center", marginTop: 4 }]}>
                    Adicione fotos na aba Fotos para preencher seu Grid 3x3.
                  </Text>
                </View>
              ) : (
                <View style={vStyles.pubGrid}>
                  {publicacoesFiltradas.map((pub) => (
                    <TouchableOpacity
                      key={pub.id}
                      style={vStyles.pubGridTile}
                      onPress={() => setPostLightbox(pub)}
                      activeOpacity={0.88}
                    >
                      <Image source={{ uri: pub.imagem_url }} style={vStyles.gridTileImg} resizeMode="cover" />
                      {pub.fixado && (
                        <View style={[vStyles.gridMiniBtn, { position: "absolute", top: 6, right: 6 }]}>
                          <Ionicons name="pin" size={11} color={accent} />
                        </View>
                      )}
                      {pub.metrica_destaque ? (
                        <LinearGradient colors={["transparent", "rgba(0,0,0,0.88)"]} style={vStyles.gridMetricBar}>
                          <Text style={vStyles.gridMetricText} numberOfLines={1}>
                            {pub.metrica_destaque}
                          </Text>
                        </LinearGradient>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {aba === "autoridade" && (
            <View style={{ padding: 16 }}>
              <View style={vStyles.cardBlock}>
                <Text style={vStyles.label}>Sobre o Treinador</Text>
                <Text style={vStyles.pubHeadlineText}>
                  {state.bio || "Profissional dedicado a construir treinos inteligentes e adaptados à rotina de cada aluno."}
                </Text>
              </View>

              {(state.metodoTitulo || state.metodoDescricao || state.diferenciaisLista.length > 0) && (
                <View style={vStyles.cardBlock}>
                  <Text style={vStyles.label}>Método & Diferenciais</Text>
                  {state.metodoTitulo ? (
                    <Text style={{ color: accent, fontWeight: "900", fontSize: 13.5, marginBottom: 6, textTransform: "uppercase" }}>
                      {state.metodoTitulo}
                    </Text>
                  ) : null}
                  {state.metodoDescricao ? (
                    <Text style={[vStyles.pubHeadlineText, { marginTop: 0, marginBottom: 10 }]}>
                      {state.metodoDescricao}
                    </Text>
                  ) : null}
                  {state.diferenciaisLista.map((d: string, i: number) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 7 }}>
                      <Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginTop: 1 }} />
                      <Text style={{ color: "#E4E4E7", fontSize: 12.5, lineHeight: 18, flex: 1 }}>{d}</Text>
                    </View>
                  ))}
                </View>
              )}

              {state.formacoes.length > 0 && (
                <View style={vStyles.cardBlock}>
                  <Text style={vStyles.label}>Formação & Certificações</Text>
                  {state.formacoes.map((f: FormacaoSetupItem) => (
                    <View key={f.id} style={vStyles.itemRow}>
                      <View style={[vStyles.itemIconCircle, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                        <Ionicons name="ribbon-outline" size={17} color={accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={vStyles.itemTitle}>{f.titulo}</Text>
                        <Text style={vStyles.itemSub}>
                          {f.instituicao}
                          {f.ano ? ` • ${f.ano}` : ""}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {dnaAtendimento.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[vStyles.label, { marginBottom: 8 }]}>Estilo de Acompanhamento</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {dnaAtendimento.map((dna, idx) => (
                      <View
                        key={idx}
                        style={{
                          flexGrow: 1,
                          minWidth: "46%",
                          backgroundColor: "#111115",
                          borderRadius: 14,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: "#22222A",
                        }}
                      >
                        <Text style={{ color: "#71717A", fontSize: 9.5, fontWeight: "900", textTransform: "uppercase" }}>
                          {dna.label}
                        </Text>
                        <Text style={{ color: "#FFF", fontSize: 12.5, fontWeight: "800", marginTop: 3 }}>
                          {dna.valor}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {todasAsTags.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[vStyles.label, { marginBottom: 8 }]}>Especialidades & Foco</Text>
                  {todasAsTags.map((tag: string, idx: number) => {
                    const info = getEspecialidadeInfoLocal(tag);
                    return (
                      <View key={`${tag}-${idx}`} style={vStyles.itemRow}>
                        <View style={[vStyles.itemIconCircle, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                          <FontAwesome5 name={info.icon} size={14} color={accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={vStyles.itemTitle}>{info.title}</Text>
                          <Text style={vStyles.itemSub}>{info.desc}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {state.servicosOferecidos?.includes("Presencial") && state.locaisAtendidos?.length > 0 && (
                <View style={vStyles.cardBlock}>
                  <Text style={vStyles.label}>Locais de Atendimento</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {state.locaisAtendidos.map((loc: string, i: number) => (
                      <View key={i} style={vStyles.quickChip}>
                        <Ionicons name="business-outline" size={13} color={accent} />
                        <Text style={vStyles.quickChipText}>{loc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {aba === "depoimentos" && (
            <View style={{ padding: 16 }}>
              {avaliacoesOrdenadas.length === 0 ? (
                <View style={vStyles.emptyInline}>
                  <Ionicons name="star-outline" size={32} color={hexToRgba(accent, 0.5)} />
                  <Text style={[vStyles.itemTitle, { marginTop: 8 }]}>Avaliações Verificadas</Text>
                  <Text style={[vStyles.itemSub, { textAlign: "center", marginTop: 4 }]}>
                    Os depoimentos reais dos alunos aparecerão aqui assim que concluírem o primeiro ciclo de treinos.
                  </Text>
                </View>
              ) : (
                avaliacoesOrdenadas.map((av: any) => {
                  const fixado = state.depoimentosFixados.includes(av.id);
                  const nomeAluno = av.usuarios?.nome || "Aluno MatchTrainer";
                  return (
                    <View
                      key={av.id}
                      style={[
                        vStyles.cardBlock,
                        fixado && { borderColor: accent, backgroundColor: hexToRgba(accent, 0.08) },
                      ]}
                    >
                      {fixado && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
                          <Ionicons name="pin" size={12} color={accent} />
                          <Text style={{ color: accent, fontSize: 10, fontWeight: "900", textTransform: "uppercase" }}>
                            Depoimento em Destaque
                          </Text>
                        </View>
                      )}
                      <Text style={vStyles.itemTitle}>{nomeAluno}</Text>
                      <View style={{ flexDirection: "row", gap: 2, marginVertical: 4 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={12} color={accent} />
                        ))}
                      </View>
                      {av.comentario ? (
                        <Text style={[vStyles.pubHeadlineText, { fontStyle: "italic" }]}>{av.comentario}</Text>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        <View style={vStyles.pubFooterBar}>
          <Text style={vStyles.pubFooterHint}>Simulação exata da barra que o aluno usa para contratar você</Text>
          <View style={vStyles.pubFooterRow}>
            <TouchableOpacity style={vStyles.pubBtnWhatsApp} onPress={onClose} activeOpacity={0.85}>
              <MaterialCommunityIcons name="whatsapp" size={24} color="#00E676" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[vStyles.pubBtnChat, { backgroundColor: accentSoft, borderColor: accent }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubbles-outline" size={19} color={accent} />
              <Text style={[vStyles.pubBtnChatText, { color: accent }]}>Iniciar Conversa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={Boolean(storyAtivo)} transparent animationType="fade" onRequestClose={() => setStoryAtivo(null)}>
          <View style={vStyles.storyPopupOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setStoryAtivo(null)} />
            <View style={[vStyles.storyPopupCard, { borderColor: accentBorder }]}>
              {storyAtivo?.imagem_url ? (
                <View style={vStyles.storyPopupHero}>
                  <Image source={{ uri: storyAtivo.imagem_url }} style={vStyles.storyPopupHeroImg} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "#101016"]} style={vStyles.storyPopupHeroFade} />
                </View>
              ) : null}

              <View style={vStyles.storyPopupBody}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <View style={[vStyles.itemIconCircle, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Ionicons name={(storyAtivo?.icone as any) || "flame"} size={18} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={vStyles.blockTitle}>{storyAtivo?.titulo}</Text>
                    <Text style={{ color: accent, fontSize: 11, fontWeight: "800" }}>{storyAtivo?.subtitulo}</Text>
                  </View>
                </View>
                <Text style={[vStyles.pubHeadlineText, { marginBottom: 18 }]}>{storyAtivo?.conteudo}</Text>
                <TouchableOpacity
                  style={[vStyles.btnOutlineAccent, { backgroundColor: accentSoft, borderColor: accent }]}
                  onPress={() => setStoryAtivo(null)}
                >
                  <Text style={[vStyles.btnOutlineAccentText, { color: accent }]}>Entendi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={Boolean(postLightbox)} animationType="fade" onRequestClose={() => setPostLightbox(null)}>
          <View style={vStyles.modalOverlay}>
            <View style={vStyles.modalHeader}>
              <View style={[vStyles.pubModPill, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Text style={[vStyles.pubModPillText, { color: accent }]}>
                  {LABEL_CAT[postLightbox?.categoria || "resultado"] || "Vitrine"}
                </Text>
              </View>
              <TouchableOpacity style={vStyles.btnFecharModal} onPress={() => setPostLightbox(null)}>
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {postLightbox?.imagem_url && (
                <Image source={{ uri: postLightbox.imagem_url }} style={{ width: "100%", height: width * 1.08 }} resizeMode="cover" />
              )}
              <View style={{ padding: 18 }}>
                {postLightbox?.metrica_destaque ? (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(0, 230, 118, 0.12)",
                      borderWidth: 1,
                      borderColor: "rgba(0, 230, 118, 0.4)",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="trending-up" size={14} color="#00E676" />
                    <Text style={{ color: "#00E676", fontSize: 12, fontWeight: "900" }}>{postLightbox.metrica_destaque}</Text>
                  </View>
                ) : null}
                {postLightbox?.titulo ? <Text style={[vStyles.pubNomeText, { fontSize: 18, marginBottom: 6 }]}>{postLightbox.titulo}</Text> : null}
                <Text style={vStyles.pubHeadlineText}>
                  {postLightbox?.legenda || "Registro publicado na vitrine oficial do treinador no MatchTrainer."}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}