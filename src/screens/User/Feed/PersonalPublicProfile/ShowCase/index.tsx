import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../../services/supabase";
import { uploadImagemVitrine } from "./showcaseUpload"; 
import { DestaqueStory, FormacaoItem, VitrineConfig } from "../usePersonalPublicProfile";
import { styles } from "./styles";

type AbaEditor = "identidade" | "destaques" | "formacoes" | "avaliacoes";

interface ModalEditorVitrineProps {
  visible: boolean;
  personal: any;
  vitrineConfig: VitrineConfig;
  avaliacoes: any[];
  onClose: () => void;
  onSalvo: () => void;
}

interface ConteudoEditorProps {
  personal: any;
  vitrineConfig: VitrineConfig;
  avaliacoes: any[];
  onClose: () => void;
  onSalvo: () => void;
}

const ICONES_DESTAQUE = ["flame", "barbell", "trophy", "ribbon", "heart", "location", "wallet", "sparkles"];

function ConteudoEditorVitrine({
  personal,
  vitrineConfig,
  avaliacoes,
  onClose,
  onSalvo,
}: ConteudoEditorProps) {
  const [aba, setAba] = useState<AbaEditor>("identidade");
  const [salvando, setSalvando] = useState(false);

  const [capaUrl, setCapaUrl] = useState<string | null>(personal?.capa_url || null);
  const [capaBase64, setCapaBase64] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(personal?.foto_url || null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string>(personal?.headline || "");
  const [bio, setBio] = useState<string>(personal?.descricao || "");
  const [metodoTitulo, setMetodoTitulo] = useState<string>(vitrineConfig?.metodo_titulo || "");
  const [metodoDescricao, setMetodoDescricao] = useState<string>(vitrineConfig?.metodo_descricao || "");
  const [diferenciaisLista, setDiferenciaisLista] = useState<string[]>(
    Array.isArray(vitrineConfig?.diferenciais_lista) ? vitrineConfig.diferenciais_lista : []
  );
  const [novoDiferencial, setNovoDiferencial] = useState("");

  const [destaques, setDestaques] = useState<DestaqueStory[]>(
    Array.isArray(vitrineConfig?.destaques) ? vitrineConfig.destaques : []
  );
  const [destTitulo, setDestTitulo] = useState("");
  const [destSub, setDestSub] = useState("");
  const [destConteudo, setDestConteudo] = useState("");
  const [destIcone, setDestIcone] = useState("flame");

  const [formacoes, setFormacoes] = useState<FormacaoItem[]>(
    Array.isArray(vitrineConfig?.formacoes) ? vitrineConfig.formacoes : []
  );
  const [formTitulo, setFormTitulo] = useState("");
  const [formInst, setFormInst] = useState("");
  const [formAno, setFormAno] = useState("");

  const [fixadosIds, setFixadosIds] = useState<string[]>(
    Array.isArray(vitrineConfig?.depoimentos_fixados) ? vitrineConfig.depoimentos_fixados : []
  );

  const selecionarImagem = async (tipo: "capa" | "avatar") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para trocar sua foto.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: tipo === "capa" ? [16, 9] : [1, 1],
      quality: 0.72,
      base64: true,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      if (tipo === "capa") {
        setCapaUrl(res.assets[0].uri);
        setCapaBase64(res.assets[0].base64 || null);
      } else {
        setFotoUrl(res.assets[0].uri);
        setFotoBase64(res.assets[0].base64 || null);
      }
    }
  };

  const adicionarDiferencial = () => {
    const limpo = novoDiferencial.trim();
    if (!limpo) return;
    setDiferenciaisLista((prev) => [...prev, limpo]);
    setNovoDiferencial("");
  };

  const adicionarDestaque = () => {
    if (!destTitulo.trim() || !destConteudo.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha o nome da bolinha e o conteúdo do destaque.");
      return;
    }
    const item: DestaqueStory = {
      id: `dest-${Date.now()}`,
      titulo: destTitulo.trim(),
      icone: destIcone,
      subtitulo: destSub.trim() || "Destaque do Treinador",
      conteudo: destConteudo.trim(),
    };
    setDestaques((prev) => [...prev, item]);
    setDestTitulo("");
    setDestSub("");
    setDestConteudo("");
  };

  const adicionarFormacao = () => {
    if (!formTitulo.trim() || !formInst.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o curso/formação e a instituição.");
      return;
    }
    const item: FormacaoItem = {
      id: `form-${Date.now()}`,
      titulo: formTitulo.trim(),
      instituicao: formInst.trim(),
      ano: formAno.trim() || undefined,
    };
    setFormacoes((prev) => [...prev, item]);
    setFormTitulo("");
    setFormInst("");
    setFormAno("");
  };

  const toggleFixarDepoimento = (id: string) => {
    setFixadosIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSalvarTudo = async () => {
    if (!personal?.id) return;
    setSalvando(true);
    try {
      let capaFinal = capaUrl;
      let fotoFinal = fotoUrl;

      if (capaBase64) {
        capaFinal = await uploadImagemVitrine(personal.id, "capa", capaBase64);
      }
      if (fotoBase64) {
        fotoFinal = await uploadImagemVitrine(personal.id, "avatar", fotoBase64);
      }

      const novaConfig: VitrineConfig = {
        ...vitrineConfig,
        metodo_titulo: metodoTitulo.trim(),
        metodo_descricao: metodoDescricao.trim(),
        diferenciais_lista: diferenciaisLista,
        destaques,
        formacoes,
        depoimentos_fixados: fixadosIds,
      };

      const { error } = await supabase
        .from("personals")
        .update({
          capa_url: capaFinal,
          foto_url: fotoFinal,
          headline: headline.trim() || null,
          descricao: bio.trim(),
          vitrine_config: novaConfig,
        })
        .eq("id", personal.id);

      if (error) throw error;

      onSalvo();
      onClose();
    } catch (err: any) {
      Alert.alert("Erro ao salvar", err?.message || "Não foi possível atualizar sua vitrine.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>ESTÚDIO DA VITRINE</Text>
          <Text style={styles.headerTitle}>Personalizar Mini-Instagram</Text>
        </View>
        <TouchableOpacity style={styles.btnFechar} onPress={onClose} activeOpacity={0.75}>
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        {[
          { id: "identidade" as AbaEditor, label: "Identidade" },
          { id: "destaques" as AbaEditor, label: "Destaques" },
          { id: "formacoes" as AbaEditor, label: "Formação" },
          { id: "avaliacoes" as AbaEditor, label: "Fixados" },
        ].map((t) => {
          const ativa = aba === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, ativa && styles.tabBtnAtiva]}
              onPress={() => setAba(t.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, ativa && styles.tabTextAtiva]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {aba === "identidade" && (
          <View>
            <Text style={styles.label}>Foto de Capa</Text>
            <TouchableOpacity style={styles.capaPreview} onPress={() => selecionarImagem("capa")} activeOpacity={0.85}>
              {capaUrl ? (
                <Image source={{ uri: capaUrl }} style={styles.capaImg} resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={28} color="#FF6B00" />
                  <Text style={[styles.btnMiniLaranjaText, { marginTop: 6 }]}>Adicionar foto de capa</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.avatarEditRow}>
              <Image
                source={{
                  uri: fotoUrl || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600",
                }}
                style={styles.avatarMini}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>Foto de Perfil</Text>
                <Text style={styles.itemSub}>Aparece no Match e no topo do seu perfil.</Text>
              </View>
              <TouchableOpacity style={styles.btnMiniLaranja} onPress={() => selecionarImagem("avatar")}>
                <Text style={styles.btnMiniLaranjaText}>Trocar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Headline de Autoridade (Frase curta no topo)</Text>
            <TextInput
              style={styles.input}
              value={headline}
              onChangeText={setHeadline}
              placeholder="Ex: Especialista em Emagrecimento e Reabilitação de Joelho"
              placeholderTextColor="#555"
              maxLength={110}
              keyboardAppearance="dark"
            />

            <Text style={styles.label}>Sobre Você (Bio)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Conte sua trajetória, público que mais transforma e como conduz os treinos..."
              placeholderTextColor="#555"
              multiline
              maxLength={450}
              keyboardAppearance="dark"
            />

            <Text style={styles.label}>Nome do Seu Método (Opcional)</Text>
            <TextInput
              style={styles.input}
              value={metodoTitulo}
              onChangeText={setMetodoTitulo}
              placeholder="Ex: Método Constância 360"
              placeholderTextColor="#555"
              maxLength={60}
              keyboardAppearance="dark"
            />

            <Text style={styles.label}>Como Funciona o Método</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={metodoDescricao}
              onChangeText={setMetodoDescricao}
              placeholder="Explique como o aluno evolui semana a semana com você..."
              placeholderTextColor="#555"
              multiline
              maxLength={350}
              keyboardAppearance="dark"
            />

            <Text style={styles.label}>Diferenciais em Tópicos</Text>
            {diferenciaisLista.map((dif, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={[styles.itemTitle, { flex: 1 }]}>• {dif}</Text>
                <TouchableOpacity
                  style={styles.btnRemover}
                  onPress={() => setDiferenciaisLista((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.cardBox}>
              <TextInput
                style={styles.input}
                value={novoDiferencial}
                onChangeText={setNovoDiferencial}
                placeholder="Ex: Correção de execução por vídeo no WhatsApp"
                placeholderTextColor="#555"
                keyboardAppearance="dark"
              />
              <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarDiferencial} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={16} color="#FF6B00" />
                <Text style={styles.btnAdicionarText}>Adicionar Diferencial</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {aba === "destaques" && (
          <View>
            <Text style={styles.helper}>
              Crie bolinhas estilo Stories no topo do seu perfil (ex.: Meu Método, Planos, Onde Atendo, Dúvidas).
            </Text>

            {destaques.map((d) => (
              <View key={d.id} style={styles.itemRow}>
                <Ionicons name={(d.icone as any) || "flame"} size={20} color="#FF6B00" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{d.titulo}</Text>
                  <Text style={styles.itemSub} numberOfLines={2}>
                    {d.conteudo}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnRemover}
                  onPress={() => setDestaques((prev) => prev.filter((i) => i.id !== d.id))}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.cardBox}>
              <Text style={styles.label}>Ícone do Destaque</Text>
              <View style={styles.iconesRow}>
                {ICONES_DESTAQUE.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    style={[styles.iconeOption, destIcone === ic && styles.iconeOptionAtivo]}
                    onPress={() => setDestIcone(ic)}
                  >
                    <Ionicons name={ic as any} size={18} color={destIcone === ic ? "#FF6B00" : "#888"} />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Título Curto (Bolinha)</Text>
              <TextInput
                style={styles.input}
                value={destTitulo}
                onChangeText={setDestTitulo}
                placeholder="Ex: Planos"
                placeholderTextColor="#555"
                maxLength={18}
                keyboardAppearance="dark"
              />

              <Text style={styles.label}>Subtítulo (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={destSub}
                onChangeText={setDestSub}
                placeholder="Ex: Como funciona a consultoria"
                placeholderTextColor="#555"
                maxLength={45}
                keyboardAppearance="dark"
              />

              <Text style={styles.label}>Texto exibido ao tocar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={destConteudo}
                onChangeText={setDestConteudo}
                placeholder="Escreva as informações que o aluno vai ver ao abrir este destaque..."
                placeholderTextColor="#555"
                multiline
                maxLength={400}
                keyboardAppearance="dark"
              />

              <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarDestaque} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={16} color="#FF6B00" />
                <Text style={styles.btnAdicionarText}>Adicionar Destaque</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {aba === "formacoes" && (
          <View>
            <Text style={styles.helper}>
              Adicione sua graduação, pós-graduação e certificações técnicas para elevar sua autoridade.
            </Text>

            {formacoes.map((f) => (
              <View key={f.id} style={styles.itemRow}>
                <Ionicons name="school-outline" size={20} color="#FF6B00" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{f.titulo}</Text>
                  <Text style={styles.itemSub}>
                    {f.instituicao}
                    {f.ano ? ` • ${f.ano}` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnRemover}
                  onPress={() => setFormacoes((prev) => prev.filter((i) => i.id !== f.id))}
                >
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.cardBox}>
              <Text style={styles.label}>Curso / Certificação</Text>
              <TextInput
                style={styles.input}
                value={formTitulo}
                onChangeText={setFormTitulo}
                placeholder="Ex: Pós-graduação em Biomecânica e Reabilitação"
                placeholderTextColor="#555"
                keyboardAppearance="dark"
              />

              <Text style={styles.label}>Instituição</Text>
              <TextInput
                style={styles.input}
                value={formInst}
                onChangeText={setFormInst}
                placeholder="Ex: USP / FMU / CREF"
                placeholderTextColor="#555"
                keyboardAppearance="dark"
              />

              <Text style={styles.label}>Ano (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={formAno}
                onChangeText={setFormAno}
                placeholder="Ex: 2024"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={4}
                keyboardAppearance="dark"
              />

              <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarFormacao} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={16} color="#FF6B00" />
                <Text style={styles.btnAdicionarText}>Adicionar Formação</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {aba === "avaliacoes" && (
          <View>
            <Text style={styles.helper}>
              Toque nos melhores depoimentos dos seus alunos para fixá-los no topo da sua aba Avaliações.
            </Text>

            {avaliacoes.length === 0 ? (
              <View style={styles.cardBox}>
                <Text style={[styles.itemSub, { textAlign: "center" }]}>
                  Você ainda não recebeu avaliações de alunos. Assim que chegarem, poderá fixar as melhores aqui.
                </Text>
              </View>
            ) : (
              avaliacoes.map((av) => {
                const fixado = fixadosIds.includes(av.id);
                return (
                  <TouchableOpacity
                    key={av.id}
                    style={[styles.itemRow, fixado && styles.depRowFixado]}
                    onPress={() => toggleFixarDepoimento(av.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={fixado ? "pin" : "pin-outline"} size={20} color={fixado ? "#FF6B00" : "#666"} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>
                        {av.usuarios?.nome || "Aluno"} • {av.nota}★
                      </Text>
                      <Text style={styles.itemSub} numberOfLines={2}>
                        {av.comentario || "Sem comentário escrito."}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.btnSalvar, salvando && { opacity: 0.65 }]}
          onPress={handleSalvarTudo}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando ? (
            <ActivityIndicator size="small" color="#FF6B00" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={18} color="#FF6B00" />
              <Text style={styles.btnSalvarText}>Salvar Alterações da Vitrine</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export function ModalEditorVitrine({
  visible,
  personal,
  vitrineConfig,
  avaliacoes,
  onClose,
  onSalvo,
}: ModalEditorVitrineProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {visible && personal ? (
        <ConteudoEditorVitrine
          personal={personal}
          vitrineConfig={vitrineConfig}
          avaliacoes={avaliacoes}
          onClose={onClose}
          onSalvo={onSalvo}
        />
      ) : null}
    </Modal>
  );
}