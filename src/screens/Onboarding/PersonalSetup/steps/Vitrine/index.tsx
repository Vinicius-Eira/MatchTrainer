import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { CATEGORIAS_PUBLICACAO, hexToRgba, ICONES_DESTAQUE, PALETAS_VITRINE } from "../../constants";
import { styles } from "../../styles";
import { DestaqueStoryItem, FormacaoSetupItem, PublicacaoSetupItem } from "../../usePersonalSetup";
import { vStyles } from "./styles";
import { VitrineLivePreviewModal } from "./Modal";

type SubAbaVitrine = "visual" | "destaques" | "formacao" | "resultados";

const SUGESTOES_DIFERENCIAIS = [
  "Correção de execução por vídeo",
  "Ajustes semanais de carga",
  "Suporte direto no WhatsApp",
  "Treino adaptado à sua rotina",
  "Avaliação física e metas claras",
];

const TEMPLATES_DESTAQUE = [
  {
    titulo: "Meu Método",
    icone: "flame",
    subtitulo: "Como eu trabalho",
    conteudo: "Avaliação completa, treino individualizado para a sua rotina e ajustes semanais focados em evolução real.",
  },
  {
    titulo: "Planos",
    icone: "wallet",
    subtitulo: "Consultoria & Presencial",
    conteudo: "Planos mensais e trimestrais com acompanhamento pelo MatchTrainer, registro de cargas e suporte próximo.",
  },
  {
    titulo: "Como Começar",
    icone: "sparkles",
    subtitulo: "Passo a passo",
    conteudo: "Me chame no chat, alinhamos seus objetivos e limitações e em até 48h seu primeiro treino já está liberado no app.",
  },
];

const LABEL_CAT_CURTA: Record<string, string> = {
  resultado: "Result",
  treino: "Treino",
  certificado: "Certif",
  espaco: "Espaço",
};

export function Vitrine({ state, actions }: { state: any; actions: any }) {
  const [subAba, setSubAba] = useState<SubAbaVitrine>("visual");
  const [previewFullAberto, setPreviewFullAberto] = useState(false);
  const [campoFocado, setCampoFocado] = useState<string | null>(null);

  const [novoDif, setNovoDif] = useState("");

  const [editandoDestaqueId, setEditandoDestaqueId] = useState<string | null>(null);
  const [destIcone, setDestIcone] = useState("flame");
  const [destTitulo, setDestTitulo] = useState("");
  const [destSub, setDestSub] = useState("");
  const [destConteudo, setDestConteudo] = useState("");
  const [destFotoUri, setDestFotoUri] = useState<string | null>(null);
  const [destFotoBase64, setDestFotoBase64] = useState<string | null>(null);

  const [formTitulo, setFormTitulo] = useState("");
  const [formInst, setFormInst] = useState("");
  const [formAno, setFormAno] = useState("");

  const [modalPostAberto, setModalPostAberto] = useState(false);
  const [editandoPost, setEditandoPost] = useState<PublicacaoSetupItem | null>(null);
  const [postUri, setPostUri] = useState<string | null>(null);
  const [postBase64, setPostBase64] = useState<string | null>(null);
  const [postCat, setPostCat] = useState<"resultado" | "treino" | "certificado" | "espaco">("resultado");
  const [postMetrica, setPostMetrica] = useState("");
  const [postTitulo, setPostTitulo] = useState("");
  const [postLegenda, setPostLegenda] = useState("");
  const [postFixado, setPostFixado] = useState(false);

  const accent: string = state.corDestaque || "#FF6B00";
  const accentSoft = hexToRgba(accent, 0.14);
  const accentBorder = hexToRgba(accent, 0.45);
  const paletaAtiva = PALETAS_VITRINE.find((p) => p.hex.toLowerCase() === accent.toLowerCase()) || PALETAS_VITRINE[0];

  const pontosVitrine =
    (state.capaUrl ? 20 : 0) +
    (state.headline?.trim().length >= 10 ? 15 : 0) +
    (state.bio?.trim().length >= 30 ? 15 : 0) +
    (state.metodoDescricao?.trim().length >= 15 || state.diferenciaisLista.length > 0 ? 15 : 0) +
    (state.destaques.length > 0 ? 15 : 0) +
    (state.publicacoes.length > 0 ? 20 : 0);

  const corForca = pontosVitrine >= 80 ? "#00E676" : accent;

  const subAbas: { id: SubAbaVitrine; label: string; icon: string }[] = [
    { id: "visual", label: "Bio", icon: "sparkles-outline" },
    { id: "destaques", label: state.destaques.length > 0 ? `Stories (${state.destaques.length})` : "Stories", icon: "albums-outline" },
    { id: "formacao", label: state.formacoes.length > 0 ? `Pro (${state.formacoes.length})` : "Autoridade", icon: "ribbon-outline" },
    { id: "resultados", label: state.publicacoes.length > 0 ? `Fotos (${state.publicacoes.length})` : "Fotos", icon: "grid-outline" },
  ];

  const getFocusStyle = (campo: string) =>
    campoFocado === campo ? { borderColor: accent, backgroundColor: hexToRgba(accent, 0.06) } : undefined;

  const handleAddDiferencial = (textoSugestao?: string) => {
    const val = (textoSugestao ?? novoDif).trim();
    if (!val) {
      Alert.alert("Escreva um diferencial", "Digite um diferencial no campo ou toque em uma sugestão rápida acima.");
      return;
    }
    if (state.diferenciaisLista.some((d: string) => d.toLowerCase() === val.toLowerCase())) {
      if (textoSugestao) {
        const idx = state.diferenciaisLista.findIndex((d: string) => d.toLowerCase() === val.toLowerCase());
        if (idx >= 0) actions.removerDiferencial(idx);
      } else {
        Alert.alert("Já adicionado", "Esse diferencial já está na sua lista.");
      }
      return;
    }
    actions.adicionarDiferencial(val);
    if (!textoSugestao) setNovoDif("");
  };

  const limparFormDestaque = () => {
    setEditandoDestaqueId(null);
    setDestIcone("flame");
    setDestTitulo("");
    setDestSub("");
    setDestConteudo("");
    setDestFotoUri(null);
    setDestFotoBase64(null);
  };

  const iniciarEdicaoDestaque = (d: DestaqueStoryItem) => {
    setEditandoDestaqueId(d.id);
    setDestIcone(d.icone || "flame");
    setDestTitulo(d.titulo);
    setDestSub(d.subtitulo || "");
    setDestConteudo(d.conteudo);
    setDestFotoUri(d.imagem_url || null);
    setDestFotoBase64(d.base64 || null);
  };

  const escolherFotoDestaque = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para adicionar uma foto ao destaque.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.72,
      base64: true,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      setDestFotoUri(res.assets[0].uri);
      setDestFotoBase64(res.assets[0].base64 || null);
    }
  };

  const handleSalvarDestaque = () => {
    if (!destTitulo.trim() || !destConteudo.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha o título curto da bolinha e o texto que abre ao tocar.");
      return;
    }

    const payloadBase = {
      titulo: destTitulo.trim(),
      icone: destIcone,
      subtitulo: destSub.trim() || "Destaque do Treinador",
      conteudo: destConteudo.trim(),
      imagem_url: destFotoUri || null,
      base64: destFotoBase64 || null,
      pendenteUpload: Boolean(destFotoBase64),
    };

    if (editandoDestaqueId && actions.editarDestaque) {
      actions.editarDestaque({ id: editandoDestaqueId, ...payloadBase });
    } else {
      actions.adicionarDestaque(payloadBase);
    }
    limparFormDestaque();
  };

  const aplicarTemplateDestaque = (tpl: { titulo: string; icone: string; subtitulo: string; conteudo: string }) => {
    setEditandoDestaqueId(null);
    setDestIcone(tpl.icone);
    setDestTitulo(tpl.titulo);
    setDestSub(tpl.subtitulo);
    setDestConteudo(tpl.conteudo);
  };

  const handleAddFormacao = () => {
    if (!formTitulo.trim() || !formInst.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o curso/graduação e a instituição.");
      return;
    }
    actions.adicionarFormacao({
      titulo: formTitulo.trim(),
      instituicao: formInst.trim(),
      ano: formAno.trim() || undefined,
    });
    setFormTitulo("");
    setFormInst("");
    setFormAno("");
  };

  const abrirModalNovoPost = () => {
    setEditandoPost(null);
    setPostUri(null);
    setPostBase64(null);
    setPostCat("resultado");
    setPostMetrica("");
    setPostTitulo("");
    setPostLegenda("");
    setPostFixado(false);
    setModalPostAberto(true);
  };

  const abrirModalEditarPost = (pub: PublicacaoSetupItem) => {
    setEditandoPost(pub);
    setPostUri(pub.imagem_url);
    setPostBase64(pub.base64 || null);
    setPostCat(pub.categoria);
    setPostMetrica(pub.metrica_destaque || "");
    setPostTitulo(pub.titulo || "");
    setPostLegenda(pub.legenda || "");
    setPostFixado(Boolean(pub.fixado));
    setModalPostAberto(true);
  };

  const escolherFotoPost = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para adicionar fotos de resultados.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.72,
      base64: true,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      setPostUri(res.assets[0].uri);
      setPostBase64(res.assets[0].base64 || null);
    }
  };

  const confirmarPost = () => {
    if (editandoPost && actions.atualizarPublicacaoLocal) {
      actions.atualizarPublicacaoLocal({
        ...editandoPost,
        categoria: postCat,
        metrica_destaque: postMetrica.trim() || null,
        titulo: postTitulo.trim() || null,
        legenda: postLegenda.trim() || null,
        fixado: postFixado,
      });
      setModalPostAberto(false);
      return;
    }
    if (!postUri || !postBase64) {
      Alert.alert("Escolha uma foto", "Selecione uma imagem da galeria para adicionar à sua vitrine.");
      return;
    }
    actions.adicionarPublicacaoLocal({
      imagem_url: postUri,
      base64: postBase64,
      categoria: postCat,
      metrica_destaque: postMetrica.trim() || null,
      titulo: postTitulo.trim() || null,
      legenda: postLegenda.trim() || null,
      fixado: postFixado,
    });
    setModalPostAberto(false);
  };

  const confirmarExcluirFoto = (id: string) => {
    Alert.alert("Remover foto?", "Ela será removida da sua vitrine quando você salvar.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => actions.removerPublicacao(id) },
    ]);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Sua <Text style={[styles.titleHighlight, { color: accent }]}>Vitrine.</Text>
        </Text>
        <Text style={styles.subTitle}>
          Personalize sua cor, Stories com foto e autoridade — e veja ao vivo como o aluno vai te enxergar.
        </Text>
      </View>


      <View style={[vStyles.previewCard, { borderColor: accentBorder }]}>
        <View style={vStyles.previewCoverBox}>
          {state.capaUrl ? (
            <Image source={{ uri: state.capaUrl }} style={vStyles.previewCoverImg} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[hexToRgba(accent, 0.36), "#14141C", "#09090D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={vStyles.previewCoverImg}
            />
          )}
          <LinearGradient colors={["transparent", "#09090D"]} style={vStyles.previewCoverFade} />

          <View style={vStyles.previewTopActions}>
            <View style={vStyles.previewBadgeLive}>
              <View style={vStyles.previewDotLive} />
              <Text style={vStyles.previewBadgeLiveText}>MINI-INSTAGRAM</Text>
            </View>
            <TouchableOpacity
              style={[vStyles.previewCoverBtn, { borderColor: accent }]}
              onPress={actions.selecionarFotoCapa}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-outline" size={13} color={accent} />
              <Text style={[vStyles.previewCoverBtnText, { color: accent }]}>
                {state.capaUrl ? "Trocar Capa" : "Add Capa"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={vStyles.previewBody}>
          <View style={vStyles.previewTopRow}>
            <TouchableOpacity
              style={vStyles.previewAvatarWrap}
              onPress={actions.selecionarFotoPrincipal}
              activeOpacity={0.85}
            >
              <View style={[vStyles.previewAvatarRing, { borderColor: accent }]}>
                {state.fotoUri ? (
                  <Image source={{ uri: state.fotoUri }} style={vStyles.previewAvatarImg} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={32} color="#888" />
                )}
              </View>
              <View style={[vStyles.previewAvatarCam, { backgroundColor: accent }]}>
                <Ionicons name="camera" size={12} color="#000" />
              </View>
            </TouchableOpacity>

            <View style={vStyles.previewCounters}>
              <View style={vStyles.previewCounterItem}>
                <Text style={vStyles.previewCounterVal}>{state.publicacoes.length}</Text>
                <Text style={vStyles.previewCounterLabel}>Fotos</Text>
              </View>
              <View style={vStyles.previewCounterItem}>
                <Text style={vStyles.previewCounterVal}>{state.destaques.length}</Text>
                <Text style={vStyles.previewCounterLabel}>Stories</Text>
              </View>
              <View style={vStyles.previewCounterItem}>
                <Text style={vStyles.previewCounterVal}>{state.formacoes.length}</Text>
                <Text style={vStyles.previewCounterLabel}>Títulos</Text>
              </View>
            </View>
          </View>

          <Text style={vStyles.previewNome} numberOfLines={1}>
            {state.nome || "Seu Nome Profissional"}
          </Text>

          <View style={vStyles.previewMetaRow}>
            <View style={vStyles.previewMetaItem}>
              <Ionicons name="location-outline" size={12} color={accent} />
              <Text style={vStyles.previewMetaText}>
                {state.cidade ? `${state.bairro ? `${state.bairro}, ` : ""}${state.cidade}` : "Atendimento Online"}
              </Text>
            </View>
            {state.cref ? (
              <View style={vStyles.previewMetaItem}>
                <MaterialCommunityIcons name="shield-check-outline" size={12} color={accent} />
                <Text style={vStyles.previewMetaText}>CREF {state.cref}</Text>
              </View>
            ) : null}
          </View>

          <Text style={vStyles.previewHeadline} numberOfLines={2}>
            {state.headline || state.bio || "Escreva sua frase de impacto e bio abaixo para ver aqui na hora."}
          </Text>

          <View style={vStyles.paletteSection}>
            <View style={vStyles.paletteHeaderRow}>
              <Text style={vStyles.paletteTitle}>Cor da Sua Marca</Text>
              <Text style={[vStyles.paletteActiveName, { color: accent }]}>{paletaAtiva.nome}</Text>
            </View>
            <View style={vStyles.paletteRow}>
              {PALETAS_VITRINE.map((pal) => {
                const selecionada = pal.hex.toLowerCase() === accent.toLowerCase();
                return (
                  <TouchableOpacity
                    key={pal.id}
                    style={[vStyles.paletteDotWrap, selecionada && { borderColor: pal.hex }]}
                    onPress={() => actions.setCorDestaque(pal.hex)}
                    activeOpacity={0.8}
                  >
                    <View style={[vStyles.paletteDot, { backgroundColor: pal.hex }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={vStyles.strengthBox}>
            <View style={vStyles.strengthTop}>
              <Text style={vStyles.strengthLabel}>Força da Vitrine</Text>
              <Text style={[vStyles.strengthPct, { color: corForca }]}>{pontosVitrine}% completa</Text>
            </View>
            <View style={vStyles.strengthTrack}>
              <View style={[vStyles.strengthFill, { width: `${Math.max(pontosVitrine, 6)}%`, backgroundColor: corForca }]} />
            </View>
          </View>

          <TouchableOpacity
            style={[vStyles.btnPreviaAlunoFull, { backgroundColor: accentSoft, borderColor: accent }]}
            onPress={() => setPreviewFullAberto(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={17} color={accent} />
            <Text style={[vStyles.btnPreviaAlunoText, { color: accent }]}>Ver Prévia Completa do Aluno</Text>
            <Ionicons name="chevron-forward" size={15} color={accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={vStyles.subTabsContainer}>
        {subAbas.map((t) => {
          const ativa = subAba === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                vStyles.subTabBtn,
                ativa && { backgroundColor: accentSoft, borderColor: accentBorder },
              ]}
              onPress={() => setSubAba(t.id)}
              activeOpacity={0.8}
            >
              <Ionicons name={t.icon as any} size={16} color={ativa ? accent : "#71717A"} />
              <Text style={[vStyles.subTabText, ativa && { color: accent, fontWeight: "900" }]} numberOfLines={1}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>


      {subAba === "visual" && (
        <View>
          <View style={vStyles.cardBlock}>
            <View style={vStyles.blockHeaderRow}>
              <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Ionicons name="sparkles-outline" size={18} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vStyles.blockTitle}>Apresentação de Impacto</Text>
                <Text style={vStyles.blockDesc}>Atualiza em tempo real no card acima.</Text>
              </View>
            </View>

            <View style={vStyles.labelRow}>
              <Text style={[vStyles.label, { marginBottom: 0 }]}>Frase de Destaque (Headline)</Text>
              <Text style={vStyles.charCount}>{(state.headline || "").length}/110</Text>
            </View>
            <View style={[vStyles.inputShell, getFocusStyle("headline")]}>
              <Ionicons name="flash-outline" size={17} color={campoFocado === "headline" ? accent : "#666"} />
              <TextInput
                style={vStyles.inputField}
                value={state.headline}
                onChangeText={actions.setHeadline}
                onFocus={() => setCampoFocado("headline")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Ex: Especialista em Emagrecimento e Joelho"
                placeholderTextColor="#555"
                maxLength={110}
                keyboardAppearance="dark"
              />
            </View>

            <View style={vStyles.labelRow}>
              <Text style={[vStyles.label, { marginBottom: 0 }]}>Sobre Você (Bio Completa)</Text>
              <Text style={vStyles.charCount}>{(state.bio || "").length}/450</Text>
            </View>
            <View style={[vStyles.inputShellArea, getFocusStyle("bio"), { marginBottom: 0 }]}>
              <Ionicons
                name="document-text-outline"
                size={17}
                color={campoFocado === "bio" ? accent : "#666"}
                style={{ marginTop: 2 }}
              />
              <TextInput
                style={vStyles.inputTextArea}
                value={state.bio}
                onChangeText={actions.setBio}
                onFocus={() => setCampoFocado("bio")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Conte sua trajetória, resultados que já gerou e como conduz o dia a dia dos alunos..."
                placeholderTextColor="#555"
                multiline
                maxLength={450}
                keyboardAppearance="dark"
              />
            </View>
          </View>

          <View style={vStyles.cardBlock}>
            <View style={vStyles.blockHeaderRow}>
              <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Ionicons name="diamond-outline" size={18} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vStyles.blockTitle}>Seu Método & Diferenciais</Text>
                <Text style={vStyles.blockDesc}>Exibido em destaque na aba Autoridade do aluno.</Text>
              </View>
            </View>

            <Text style={vStyles.label}>Nome do Método (Opcional)</Text>
            <View style={[vStyles.inputShell, getFocusStyle("metodoTitulo")]}>
              <Ionicons name="trophy-outline" size={17} color={campoFocado === "metodoTitulo" ? accent : "#666"} />
              <TextInput
                style={vStyles.inputField}
                value={state.metodoTitulo}
                onChangeText={actions.setMetodoTitulo}
                onFocus={() => setCampoFocado("metodoTitulo")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Ex: Protocolo Constância 360"
                placeholderTextColor="#555"
                maxLength={60}
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Como Funciona o Acompanhamento</Text>
            <View style={[vStyles.inputShellArea, getFocusStyle("metodoDesc")]}>
              <Ionicons
                name="layers-outline"
                size={17}
                color={campoFocado === "metodoDesc" ? accent : "#666"}
                style={{ marginTop: 2 }}
              />
              <TextInput
                style={vStyles.inputTextArea}
                value={state.metodoDescricao}
                onChangeText={actions.setMetodoDescricao}
                onFocus={() => setCampoFocado("metodoDesc")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Explique a montagem dos treinos, ajustes semanais e suporte..."
                placeholderTextColor="#555"
                multiline
                maxLength={350}
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Sugestões rápidas (toque para marcar)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vStyles.quickChipsScroll}>
              {SUGESTOES_DIFERENCIAIS.map((sug) => {
                const jaTem = state.diferenciaisLista.some((d: string) => d.toLowerCase() === sug.toLowerCase());
                return (
                  <TouchableOpacity
                    key={sug}
                    style={[vStyles.quickChip, jaTem && vStyles.quickChipAdded]}
                    onPress={() => handleAddDiferencial(sug)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={jaTem ? "checkmark-circle" : "add-circle-outline"}
                      size={14}
                      color={jaTem ? "#00E676" : accent}
                    />
                    <Text style={[vStyles.quickChipText, jaTem && vStyles.quickChipTextAdded]}>{sug}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {state.diferenciaisLista.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                {state.diferenciaisLista.map((dif: string, idx: number) => (
                  <View key={idx} style={vStyles.itemRow}>
                    <Ionicons name="checkmark-circle" size={17} color="#00E676" />
                    <Text style={[vStyles.itemTitle, { flex: 1 }]}>{dif}</Text>
                    <TouchableOpacity style={vStyles.btnTrash} onPress={() => actions.removerDiferencial(idx)}>
                      <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={vStyles.label}>Adicionar diferencial personalizado</Text>
            <View style={vStyles.inlineInputRow}>
              <View style={[vStyles.inputShell, getFocusStyle("novoDif"), { flex: 1, marginBottom: 0 }]}>
                <Ionicons name="checkmark-done-outline" size={17} color={campoFocado === "novoDif" ? accent : "#666"} />
                <TextInput
                  style={vStyles.inputField}
                  value={novoDif}
                  onChangeText={setNovoDif}
                  onFocus={() => setCampoFocado("novoDif")}
                  onBlur={() => setCampoFocado(null)}
                  placeholder="Digite e toque em + Add"
                  placeholderTextColor="#555"
                  returnKeyType="done"
                  onSubmitEditing={() => handleAddDiferencial()}
                  keyboardAppearance="dark"
                />
              </View>
              <TouchableOpacity
                style={[
                  vStyles.btnInlineAdd,
                  novoDif.trim()
                    ? { backgroundColor: accentSoft, borderColor: accent }
                    : vStyles.btnInlineAddDisabled,
                ]}
                onPress={() => handleAddDiferencial()}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={16} color={novoDif.trim() ? accent : "#666"} />
                <Text style={[vStyles.btnInlineAddText, { color: novoDif.trim() ? accent : "#666" }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {subAba === "destaques" && (
        <View style={vStyles.cardBlock}>
          <View style={vStyles.blockHeaderRow}>
            <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
              <Ionicons name="albums-outline" size={18} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={vStyles.blockTitle}>Destaques (Stories com Foto)</Text>
              <Text style={vStyles.blockDesc}>Coloque foto na bolinha igual ao Instagram ou use ícone.</Text>
            </View>
          </View>

          {state.destaques.length > 0 && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vStyles.storiesStrip}>
                {state.destaques.map((d: DestaqueStoryItem) => (
                  <TouchableOpacity
                    key={d.id}
                    style={vStyles.storyBubbleBtn}
                    onPress={() => iniciarEdicaoDestaque(d)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        vStyles.storyBubbleCircle,
                        { borderColor: accent },
                        editandoDestaqueId === d.id && { backgroundColor: accentSoft },
                      ]}
                    >
                      {d.imagem_url ? (
                        <Image source={{ uri: d.imagem_url }} style={vStyles.storyBubbleImg} resizeMode="cover" />
                      ) : (
                        <Ionicons name={(d.icone as any) || "flame"} size={21} color={accent} />
                      )}
                    </View>
                    <Text style={vStyles.storyBubbleLabel} numberOfLines={1}>
                      {d.titulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ marginBottom: 14 }}>
                {state.destaques.map((d: DestaqueStoryItem) => (
                  <View
                    key={d.id}
                    style={[
                      vStyles.itemRow,
                      editandoDestaqueId === d.id && { borderColor: accent, backgroundColor: hexToRgba(accent, 0.08) },
                    ]}
                  >
                    <View style={[vStyles.itemIconCircle, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                      {d.imagem_url ? (
                        <Image source={{ uri: d.imagem_url }} style={vStyles.itemThumb} resizeMode="cover" />
                      ) : (
                        <Ionicons name={(d.icone as any) || "flame"} size={17} color={accent} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={vStyles.itemTitle}>{d.titulo}</Text>
                      <Text style={vStyles.itemSub} numberOfLines={2}>
                        {d.conteudo}
                      </Text>
                    </View>
                    <View style={vStyles.rowActions}>
                      <TouchableOpacity
                        style={[vStyles.btnEditMini, { backgroundColor: accentSoft, borderColor: accentBorder }]}
                        onPress={() => iniciarEdicaoDestaque(d)}
                      >
                        <Ionicons name="create-outline" size={15} color={accent} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={vStyles.btnTrash}
                        onPress={() => {
                          if (editandoDestaqueId === d.id) limparFormDestaque();
                          actions.removerDestaque(d.id);
                        }}
                      >
                        <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={vStyles.label}>Modelos prontos (preenche em 1 toque)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={vStyles.quickChipsScroll}>
            {TEMPLATES_DESTAQUE.map((tpl) => (
              <TouchableOpacity
                key={tpl.titulo}
                style={vStyles.quickChip}
                onPress={() => aplicarTemplateDestaque(tpl)}
                activeOpacity={0.75}
              >
                <Ionicons name={tpl.icone as any} size={13} color={accent} />
                <Text style={vStyles.quickChipText}>{tpl.titulo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={vStyles.label}>Foto de Capa do Destaque (Opcional)</Text>
          <TouchableOpacity
            style={[vStyles.storyPhotoPicker, { borderColor: accentBorder }]}
            onPress={escolherFotoDestaque}
            activeOpacity={0.85}
          >
            {destFotoUri ? (
              <>
                <Image source={{ uri: destFotoUri }} style={vStyles.storyPhotoPreview} resizeMode="cover" />
                <View style={vStyles.storyPhotoActions}>
                  <TouchableOpacity
                    style={[vStyles.storyPhotoBadgeBtn, { borderColor: accent }]}
                    onPress={escolherFotoDestaque}
                  >
                    <Ionicons name="camera-outline" size={13} color={accent} />
                    <Text style={{ color: accent, fontSize: 10.5, fontWeight: "900" }}>Trocar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[vStyles.storyPhotoBadgeBtn, { borderColor: "rgba(255,59,48,0.6)" }]}
                    onPress={() => {
                      setDestFotoUri(null);
                      setDestFotoBase64(null);
                    }}
                  >
                    <Ionicons name="trash-outline" size={13} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Ionicons name="image-outline" size={28} color={accent} />
                <Text style={[vStyles.btnOutlineAccentText, { color: accent, marginTop: 6 }]}>
                  Adicionar Foto ao Story
                </Text>
                <Text style={[vStyles.itemSub, { marginTop: 2 }]}>Aparece na bolinha e em tela cheia ao abrir</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={vStyles.label}>Ícone do Destaque (fallback ou selo)</Text>
          <View style={vStyles.iconesGrid}>
            {ICONES_DESTAQUE.map((ic) => {
              const ativo = destIcone === ic;
              return (
                <TouchableOpacity
                  key={ic}
                  style={[vStyles.iconeOption, ativo && { backgroundColor: accentSoft, borderColor: accent }]}
                  onPress={() => setDestIcone(ic)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={ic as any} size={19} color={ativo ? accent : "#888"} />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={vStyles.label}>Título Curto</Text>
          <View style={[vStyles.inputShell, getFocusStyle("destTitulo")]}>
            <Ionicons name="bookmark-outline" size={17} color={campoFocado === "destTitulo" ? accent : "#666"} />
            <TextInput
              style={vStyles.inputField}
              value={destTitulo}
              onChangeText={setDestTitulo}
              onFocus={() => setCampoFocado("destTitulo")}
              onBlur={() => setCampoFocado(null)}
              placeholder="Ex: Meu Método, Planos ou Espaço"
              placeholderTextColor="#555"
              maxLength={18}
              keyboardAppearance="dark"
            />
          </View>

          <Text style={vStyles.label}>Subtítulo (Opcional)</Text>
          <View style={[vStyles.inputShell, getFocusStyle("destSub")]}>
            <Ionicons name="pricetag-outline" size={17} color={campoFocado === "destSub" ? accent : "#666"} />
            <TextInput
              style={vStyles.inputField}
              value={destSub}
              onChangeText={setDestSub}
              onFocus={() => setCampoFocado("destSub")}
              onBlur={() => setCampoFocado(null)}
              placeholder="Ex: Como funciona a consultoria online"
              placeholderTextColor="#555"
              maxLength={45}
              keyboardAppearance="dark"
            />
          </View>

          <Text style={vStyles.label}>Texto exibido ao abrir</Text>
          <View style={[vStyles.inputShellArea, getFocusStyle("destConteudo")]}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={17}
              color={campoFocado === "destConteudo" ? accent : "#666"}
              style={{ marginTop: 2 }}
            />
            <TextInput
              style={vStyles.inputTextArea}
              value={destConteudo}
              onChangeText={setDestConteudo}
              onFocus={() => setCampoFocado("destConteudo")}
              onBlur={() => setCampoFocado(null)}
              placeholder="Escreva o que o aluno verá ao tocar neste destaque..."
              placeholderTextColor="#555"
              multiline
              maxLength={400}
              keyboardAppearance="dark"
            />
          </View>

          <TouchableOpacity
            style={[vStyles.btnOutlineAccent, { backgroundColor: accentSoft, borderColor: accent }]}
            onPress={handleSalvarDestaque}
            activeOpacity={0.85}
          >
            <Ionicons name={editandoDestaqueId ? "checkmark-circle-outline" : "add-circle-outline"} size={17} color={accent} />
            <Text style={[vStyles.btnOutlineAccentText, { color: accent }]}>
              {editandoDestaqueId ? "Salvar Alteração do Destaque" : "Adicionar Destaque"}
            </Text>
          </TouchableOpacity>

          {editandoDestaqueId && (
            <TouchableOpacity style={vStyles.btnCancelGhost} onPress={limparFormDestaque}>
              <Text style={vStyles.btnCancelGhostText}>Cancelar edição</Text>
            </TouchableOpacity>
          )}
        </View>
      )}


      {subAba === "formacao" && (
        <View>
          <View style={vStyles.cardBlock}>
            <View style={vStyles.blockHeaderRow}>
              <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Ionicons name="school-outline" size={18} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vStyles.blockTitle}>Formação & Certificações</Text>
                <Text style={vStyles.blockDesc}>Graduação, pós-graduações e especializações técnicas.</Text>
              </View>
            </View>

            {state.formacoes.map((f: FormacaoSetupItem, idx: number) => (
              <View key={f.id} style={vStyles.timelineRow}>
                <View style={vStyles.timelineRail}>
                  <View style={[vStyles.timelineDot, { backgroundColor: accent }]} />
                  {idx < state.formacoes.length - 1 && <View style={vStyles.timelineLine} />}
                </View>
                <View style={[vStyles.itemRow, { flex: 1, marginBottom: 0 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={vStyles.itemTitle}>{f.titulo}</Text>
                    <Text style={vStyles.itemSub}>
                      {f.instituicao}
                      {f.ano ? ` • ${f.ano}` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity style={vStyles.btnTrash} onPress={() => actions.removerFormacao(f.id)}>
                    <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={[vStyles.label, { marginTop: 8 }]}>Curso / Graduação</Text>
            <View style={[vStyles.inputShell, getFocusStyle("formTitulo")]}>
              <Ionicons name="ribbon-outline" size={17} color={campoFocado === "formTitulo" ? accent : "#666"} />
              <TextInput
                style={vStyles.inputField}
                value={formTitulo}
                onChangeText={setFormTitulo}
                onFocus={() => setCampoFocado("formTitulo")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Ex: Pós-graduação em Biomecânica"
                placeholderTextColor="#555"
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Instituição</Text>
            <View style={[vStyles.inputShell, getFocusStyle("formInst")]}>
              <Ionicons name="business-outline" size={17} color={campoFocado === "formInst" ? accent : "#666"} />
              <TextInput
                style={vStyles.inputField}
                value={formInst}
                onChangeText={setFormInst}
                onFocus={() => setCampoFocado("formInst")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Ex: USP / FMU / Uninove"
                placeholderTextColor="#555"
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Ano de conclusão (Opcional)</Text>
            <View style={[vStyles.inputShell, getFocusStyle("formAno")]}>
              <Ionicons name="calendar-outline" size={17} color={campoFocado === "formAno" ? accent : "#666"} />
              <TextInput
                style={vStyles.inputField}
                value={formAno}
                onChangeText={setFormAno}
                onFocus={() => setCampoFocado("formAno")}
                onBlur={() => setCampoFocado(null)}
                placeholder="Ex: 2024"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={4}
                keyboardAppearance="dark"
              />
            </View>

            <TouchableOpacity
              style={[vStyles.btnOutlineAccent, { backgroundColor: accentSoft, borderColor: accent }]}
              onPress={handleAddFormacao}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={17} color={accent} />
              <Text style={[vStyles.btnOutlineAccentText, { color: accent }]}>Adicionar Formação</Text>
            </TouchableOpacity>
          </View>

          <View style={vStyles.cardBlock}>
            <View style={vStyles.blockHeaderRow}>
              <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                <Ionicons name="star-outline" size={18} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vStyles.blockTitle}>Depoimentos Fixados</Text>
                <Text style={vStyles.blockDesc}>Toque nas avaliações reais para fixá-las no topo.</Text>
              </View>
            </View>

            {state.avaliacoes.length === 0 ? (
              <View style={vStyles.emptyInline}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#555" style={{ marginBottom: 6 }} />
                <Text style={[vStyles.itemSub, { textAlign: "center" }]}>
                  Assim que seus alunos avaliarem seu trabalho, você poderá fixar os melhores depoimentos aqui.
                </Text>
              </View>
            ) : (
              state.avaliacoes.map((av: any) => {
                const fixado = state.depoimentosFixados.includes(av.id);
                return (
                  <TouchableOpacity
                    key={av.id}
                    style={[
                      vStyles.itemRow,
                      fixado && { borderColor: accent, backgroundColor: hexToRgba(accent, 0.08) },
                    ]}
                    onPress={() => actions.toggleFixarDepoimento(av.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={fixado ? "pin" : "pin-outline"} size={18} color={fixado ? accent : "#666"} />
                    <View style={{ flex: 1 }}>
                      <Text style={vStyles.itemTitle}>
                        {av.usuarios?.nome || "Aluno"} • {av.nota}★
                      </Text>
                      <Text style={vStyles.itemSub} numberOfLines={2}>
                        {av.comentario || "Sem comentário escrito."}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      )}


      {subAba === "resultados" && (
        <View style={vStyles.cardBlock}>
          <View style={vStyles.blockHeaderRow}>
            <View style={[vStyles.blockIconBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
              <Ionicons name="grid-outline" size={18} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={vStyles.blockTitle}>Feed de Resultados (Grid 3x3)</Text>
              <Text style={vStyles.blockDesc}>Toque em qualquer foto para editar selo, categoria ou legenda.</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[vStyles.gridHeaderAction, { backgroundColor: hexToRgba(accent, 0.08), borderColor: accent }]}
            onPress={abrirModalNovoPost}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={21} color={accent} />
            <Text style={[vStyles.gridHeaderActionText, { color: accent }]}>Adicionar Foto / Resultado</Text>
          </TouchableOpacity>

          {state.publicacoes.length === 0 ? (
            <View style={vStyles.emptyInline}>
              <Ionicons name="images-outline" size={28} color="#555" style={{ marginBottom: 6 }} />
              <Text style={[vStyles.itemSub, { textAlign: "center" }]}>
                Nenhuma foto adicionada ainda. Resultados reais multiplicam o número de alunos chamando você no chat.
              </Text>
            </View>
          ) : (
            <View style={vStyles.grid3x3}>
              {state.publicacoes.map((pub: PublicacaoSetupItem) => (
                <TouchableOpacity
                  key={pub.id}
                  style={vStyles.gridTile}
                  onPress={() => abrirModalEditarPost(pub)}
                  activeOpacity={0.88}
                >
                  <Image source={{ uri: pub.imagem_url }} style={vStyles.gridTileImg} resizeMode="cover" />

                  <View style={vStyles.gridTileTopLeft}>
                    <Text style={[vStyles.gridTileCatText, { color: accent }]}>
                      {LABEL_CAT_CURTA[pub.categoria] || "Foto"}
                    </Text>
                  </View>

                  <View style={vStyles.gridTileActions}>
                    <TouchableOpacity
                      style={vStyles.gridMiniBtn}
                      onPress={() => actions.toggleFixarPublicacao(pub.id)}
                    >
                      <Ionicons
                        name={pub.fixado ? "pin" : "pin-outline"}
                        size={13}
                        color={pub.fixado ? accent : "#FFF"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={vStyles.gridMiniBtn}
                      onPress={() => confirmarExcluirFoto(pub.id)}
                    >
                      <Ionicons name="trash-outline" size={13} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>

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

      <Modal visible={modalPostAberto} animationType="slide" onRequestClose={() => setModalPostAberto(false)}>
        <KeyboardAvoidingView style={vStyles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={vStyles.modalHeader}>
            <View>
              <Text style={[vStyles.modalSub, { color: accent }]}>GRID DA VITRINE</Text>
              <Text style={vStyles.modalTitle}>{editandoPost ? "Editar Publicação" : "Adicionar Foto / Resultado"}</Text>
            </View>
            <TouchableOpacity style={vStyles.btnFecharModal} onPress={() => setModalPostAberto(false)}>
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={vStyles.modalScroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={[vStyles.pickerBox, { borderColor: accentBorder }]}
              onPress={!editandoPost ? escolherFotoPost : undefined}
              activeOpacity={editandoPost ? 1 : 0.85}
            >
              {postUri ? (
                <Image source={{ uri: postUri }} style={vStyles.previewCoverImg} resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="images-outline" size={38} color={accent} />
                  <Text style={[vStyles.btnOutlineAccentText, { color: accent, marginTop: 8 }]}>
                    Escolher foto da galeria
                  </Text>
                  <Text style={[vStyles.itemSub, { marginTop: 4 }]}>Antes e depois, treino, espaço ou certificado</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={vStyles.label}>Categoria</Text>
            <View style={vStyles.catsRow}>
              {CATEGORIAS_PUBLICACAO.map((cat) => {
                const ativo = postCat === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[vStyles.catChip, ativo && { backgroundColor: accentSoft, borderColor: accent }]}
                    onPress={() => setPostCat(cat.id)}
                  >
                    <Ionicons name={cat.icon as any} size={14} color={ativo ? accent : "#8E8E93"} />
                    <Text style={[vStyles.catChipText, ativo && { color: accent, fontWeight: "900" }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={vStyles.label}>Selo de Resultado sobre a foto (Opcional)</Text>
            <View style={vStyles.inputShell}>
              <Ionicons name="trending-up" size={17} color={accent} />
              <TextInput
                style={vStyles.inputField}
                value={postMetrica}
                onChangeText={setPostMetrica}
                placeholder="Ex: -8kg em 12 semanas ou +4kg massa"
                placeholderTextColor="#555"
                maxLength={32}
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Título curto (Opcional)</Text>
            <View style={vStyles.inputShell}>
              <Ionicons name="text-outline" size={17} color="#777" />
              <TextInput
                style={vStyles.inputField}
                value={postTitulo}
                onChangeText={setPostTitulo}
                placeholder="Ex: Recomposição Corporal — Consultoria Online"
                placeholderTextColor="#555"
                maxLength={60}
                keyboardAppearance="dark"
              />
            </View>

            <Text style={vStyles.label}>Legenda / Contexto (Opcional)</Text>
            <View style={vStyles.inputShellArea}>
              <Ionicons name="document-text-outline" size={17} color="#777" style={{ marginTop: 2 }} />
              <TextInput
                style={vStyles.inputTextArea}
                value={postLegenda}
                onChangeText={setPostLegenda}
                placeholder="Explique a estratégia, frequência de treinos e evolução alcançada..."
                placeholderTextColor="#555"
                multiline
                maxLength={350}
                keyboardAppearance="dark"
              />
            </View>

            <View style={vStyles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={vStyles.itemTitle}>Fixar no topo da vitrine</Text>
                <Text style={vStyles.itemSub}>Mantém esta foto em primeiro lugar no seu perfil.</Text>
              </View>
              <Switch
                value={postFixado}
                onValueChange={setPostFixado}
                trackColor={{ false: "#22222A", true: hexToRgba(accent, 0.45) }}
                thumbColor={postFixado ? accent : "#777"}
              />
            </View>

            <TouchableOpacity
              style={[vStyles.btnOutlineAccent, { backgroundColor: accentSoft, borderColor: accent }]}
              onPress={confirmarPost}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={accent} />
              <Text style={[vStyles.btnOutlineAccentText, { color: accent }]}>
                {editandoPost ? "Salvar Alterações da Foto" : "Adicionar ao Grid"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <VitrineLivePreviewModal
        visible={previewFullAberto}
        onClose={() => setPreviewFullAberto(false)}
        state={state}
      />
    </View>
  );
}