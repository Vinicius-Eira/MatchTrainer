import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { BusinessKPIs } from "../usePainelCrescimento";
import { styles } from "./styles";

type TipoCard = "autoridade" | "depoimento" | "marco";

interface ModalEstudioMarcaProps {
  visible: boolean;
  onClose: () => void;
  kpis: BusinessKPIs | null;
}

const PRESETS: Record<TipoCard, Array<{ label: string; badge: string; frase: string }>> = {
  autoridade: [
    {
      label: "Vagas Abertas",
      badge: "VAGAS ABERTAS • CONSULTORIA",
      frase: "Treino sob medida para o seu objetivo, rotina e evolução real.",
    },
    {
      label: "Últimas Vagas",
      badge: "ÚLTIMAS 3 VAGAS DO MÊS",
      frase: "Acompanhamento de perto com método, bioimpedância e constância.",
    },
    {
      label: "Consultoria Online",
      badge: "CONSULTORIA ONLINE & PRESENCIAL",
      frase: "Seu treino na palma da mão com ajuste semanal de cargas.",
    },
  ],
  depoimento: [
    {
      label: "Feedback Real",
      badge: "FEEDBACK REAL DE ALUNO",
      frase: "Acompanhamento individualizado, treinos claros e evolução real semana após semana.",
    },
    {
      label: "Resultado na Prática",
      badge: "QUEM TREINA COMIGO APROVA",
      frase: "Nunca tive tanta constância nos treinos. O método faz toda a diferença.",
    },
  ],
  marco: [
    {
      label: "Constância",
      badge: "MARCO DE PERFORMANCE",
      frase: "Transformando rotinas com método, ciência e acompanhamento próximo.",
    },
    {
      label: "Time em Evolução",
      badge: "TIME EM ALTA PERFORMANCE",
      frase: "Cada treino registrado é um passo a mais para o seu melhor físico.",
    },
  ],
};

function extrairEspecialidades(raw: any): string[] {
  if (!raw) return ["Treino Personalizado", "Consultoria Online"];
  if (Array.isArray(raw)) return raw.filter(Boolean).slice(0, 3);
  if (typeof raw === "string") {
    return raw
      .replace(/[{}[\]"]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return ["Treino Personalizado", "Consultoria Online"];
}

export function ModalEstudioMarca({ visible, onClose, kpis }: ModalEstudioMarcaProps) {
  const viewShotRef = useRef<any>(null);
  const [tipoCard, setTipoCard] = useState<TipoCard>("autoridade");
  const [depIndex, setDepIndex] = useState(0);
  const [exportando, setExportando] = useState(false);

  const perfil = kpis?.marca?.perfil;
  const depoimentos = kpis?.marca?.depoimentos || [];
  const depoimentoAtual = depoimentos[depIndex] || null;
  const especialidades = extrairEspecialidades(perfil?.especialidades);
  const nomePersonal = perfil?.nome || "Personal Trainer";
  const handlePadrao = perfil?.instagram ? `@${perfil.instagram.replace(/^@/, "")}` : "Me chame no Direct";

  const [badgeTexto, setBadgeTexto] = useState(PRESETS.autoridade[0].badge);
  const [frasePrincipal, setFrasePrincipal] = useState(PRESETS.autoridade[0].frase);
  const [rodapeCustomizado, setRodapeCustomizado] = useState<string | null>(null);
  const [editorAberto, setEditorAberto] = useState(false);

  const rodapeCta = rodapeCustomizado ?? handlePadrao;

  const trocarTemplate = (novoTipo: TipoCard) => {
    setTipoCard(novoTipo);
    setBadgeTexto(PRESETS[novoTipo][0].badge);
    if (novoTipo === "depoimento" && depoimentos[depIndex]?.comentario) {
      setFrasePrincipal(depoimentos[depIndex].comentario);
    } else {
      setFrasePrincipal(PRESETS[novoTipo][0].frase);
    }
  };

  const aplicarPreset = (preset: { badge: string; frase: string }) => {
    setBadgeTexto(preset.badge);
    setFrasePrincipal(preset.frase);
  };

  const trocarDepoimento = (novoIdx: number) => {
    setDepIndex(novoIdx);
    if (depoimentos[novoIdx]?.comentario) {
      setFrasePrincipal(depoimentos[novoIdx].comentario);
    }
  };

  const handleCompartilharImagem = async () => {
    setExportando(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) throw new Error("Não foi possível gerar a imagem.");

      const disponivel = await Sharing.isAvailableAsync();
      if (!disponivel) {
        Alert.alert("Indisponível", "O compartilhamento nativo não está disponível neste dispositivo.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar Card da Sua Marca",
      });
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Não foi possível exportar o card.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>ESTÚDIO MATCHTRAINER</Text>
            <Text style={styles.headerTitle}>Cards para Stories & WhatsApp</Text>
          </View>
          <TouchableOpacity style={styles.btnFechar} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.templateRow}>
          {[
            { id: "autoridade" as TipoCard, label: "Autoridade" },
            { id: "depoimento" as TipoCard, label: "Depoimento" },
            { id: "marco" as TipoCard, label: "Resultados" },
          ].map((item) => {
            const ativo = tipoCard === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.templatePill, ativo && styles.templatePillActive]}
                onPress={() => trocarTemplate(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.templatePillText, ativo && styles.templatePillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {PRESETS[tipoCard].map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetChip}
                onPress={() => aplicarPreset(p)}
                activeOpacity={0.75}
              >
                <Text style={styles.presetChipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.previewWrapper}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={{ width: "100%" }}>
            <View style={styles.storyCard}>
              <View style={styles.storyGlowTop} />
              <View style={styles.storyGlowBottom} />

              <View style={styles.storyTopBadge}>
                <Ionicons name="flame" size={13} color="#FF6B00" />
                <Text style={styles.storyTopBadgeText} numberOfLines={1}>
                  {badgeTexto.toUpperCase()}
                </Text>
              </View>

              {tipoCard === "autoridade" && (
                <View style={{ alignItems: "center" }}>
                  <View style={styles.avatarRing}>
                    {perfil?.foto_url ? (
                      <Image source={{ uri: perfil.foto_url }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarInitial}>{nomePersonal.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={styles.nomePersonal}>{nomePersonal}</Text>
                  <View style={styles.crefRow}>
                    {perfil?.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={16} color="#00E676" />}
                    <Text style={styles.crefText}>
                      {perfil?.cref ? `CREF ${perfil.cref}` : "Personal Trainer"}
                      {perfil?.cidade ? ` • ${perfil.cidade}` : ""}
                    </Text>
                  </View>

                  {frasePrincipal ? <Text style={styles.subFraseCard}>{frasePrincipal}</Text> : null}

                  <View style={styles.pillsCenter}>
                    {especialidades.map((esp, i) => (
                      <View key={i} style={styles.specPill}>
                        <Text style={styles.specPillText}>{esp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {tipoCard === "depoimento" && (
                <View>
                  <View style={styles.quoteBox}>
                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
                      {Array.from({ length: depoimentoAtual?.nota || 5 }).map((_, i) => (
                        <Ionicons key={i} name="star" size={18} color="#FF6B00" />
                      ))}
                    </View>
                    <Text style={styles.quoteText}>{frasePrincipal}</Text>
                    <Text style={styles.quoteAuthor}>
                      — {depoimentoAtual ? depoimentoAtual.aluno_nome.toUpperCase() : "ALUNO MATCHTRAINER"}
                    </Text>
                  </View>
                  <Text style={[styles.crefText, { textAlign: "center", marginTop: 14 }]}>
                    Treinado por <Text style={{ color: "#FFF", fontWeight: "900" }}>{nomePersonal}</Text>
                  </Text>
                </View>
              )}

              {tipoCard === "marco" && (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.nomePersonal}>{nomePersonal}</Text>
                  <Text style={styles.subFraseCard}>{frasePrincipal}</Text>
                  <View style={styles.marcoGrid}>
                    <View style={styles.marcoBox}>
                      <Text style={styles.marcoVal}>{kpis?.alunos_ativos || 0}+</Text>
                      <Text style={styles.marcoLabel}>Alunos Ativos</Text>
                    </View>
                    <View style={styles.marcoBox}>
                      <Text style={styles.marcoVal}>
                        {(kpis?.marca?.total_avaliacoes || 0) > 0 ? Number(kpis?.marca?.nota_media || 5).toFixed(1) : "5.0"}★
                      </Text>
                      <Text style={styles.marcoLabel}>Avaliação</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.storyFooter}>
                <Text style={styles.footerBrand}>MATCHTRAINER</Text>
                <Text style={styles.footerHandle} numberOfLines={1}>
                  {rodapeCta}
                </Text>
              </View>
            </View>
          </ViewShot>

          {tipoCard === "depoimento" && depoimentos.length > 1 && (
            <View style={styles.depSwitcher}>
              <TouchableOpacity
                onPress={() => trocarDepoimento(depIndex === 0 ? depoimentos.length - 1 : depIndex - 1)}
              >
                <Ionicons name="chevron-back-circle" size={26} color="#FF6B00" />
              </TouchableOpacity>
              <Text style={styles.depSwitchText}>
                Depoimento {depIndex + 1} de {depoimentos.length}
              </Text>
              <TouchableOpacity onPress={() => trocarDepoimento((depIndex + 1) % depoimentos.length)}>
                <Ionicons name="chevron-forward-circle" size={26} color="#FF6B00" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.btnEditarCard}
            onPress={() => setEditorAberto(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color="#FFF" />
            <Text style={styles.btnEditarCardText}>Editar Texto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnCompartilhar, exportando && { opacity: 0.65 }]}
            onPress={handleCompartilharImagem}
            disabled={exportando}
            activeOpacity={0.85}
          >
            {exportando ? (
              <ActivityIndicator size="small" color="#FF6B00" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={16} color="#FF6B00" />
                <Text style={styles.btnCompartilharText}>Compartilhar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Modal visible={editorAberto} animationType="slide" transparent onRequestClose={() => setEditorAberto(false)}>
          <KeyboardAvoidingView
            style={styles.editorOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.editorCard}>
              <View style={styles.editorHeader}>
                <Text style={styles.editorTitle}>Personalizar Card</Text>
                <TouchableOpacity onPress={() => setEditorAberto(false)} style={styles.btnFechar}>
                  <Ionicons name="close" size={18} color="#888" />
                </TouchableOpacity>
              </View>

              <Text style={styles.editorLabel}>CHAMADA DO TOPO (SELO)</Text>
              <TextInput
                style={styles.editorInput}
                value={badgeTexto}
                onChangeText={setBadgeTexto}
                placeholder="Ex: ÚLTIMAS 3 VAGAS DO MÊS"
                placeholderTextColor="#555"
                maxLength={42}
              />

              <Text style={styles.editorLabel}>FRASE PRINCIPAL</Text>
              <TextInput
                style={[styles.editorInput, { minHeight: 80, textAlignVertical: "top" }]}
                value={frasePrincipal}
                onChangeText={setFrasePrincipal}
                placeholder="Escreva sua frase de destaque..."
                placeholderTextColor="#555"
                multiline
                maxLength={160}
              />

              <Text style={styles.editorLabel}>RODAPÉ / INSTAGRAM OU CHAMADA</Text>
              <TextInput
                style={styles.editorInput}
                value={rodapeCta}
                onChangeText={setRodapeCustomizado}
                placeholder="Ex: @seuinstagram ou Me chame no Direct"
                placeholderTextColor="#555"
                maxLength={36}
              />

              <TouchableOpacity
                style={styles.btnSalvarEdicao}
                onPress={() => setEditorAberto(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnSalvarEdicaoText}>Aplicar no Card</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
}