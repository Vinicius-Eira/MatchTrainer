import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../../services/supabase";
import { uploadImagemVitrine } from "../ShowCase/showcaseUpload";
import { styles } from "./styles";

type CategoriaItem = "resultado" | "treino" | "certificado" | "espaco";

interface ModalPublicarResultadoProps {
  visible: boolean;
  onClose: () => void;
  onPublicado: () => void;
}

const CATEGORIAS: { id: CategoriaItem; label: string; icon: string }[] = [
  { id: "resultado", label: "Resultado", icon: "trending-up" },
  { id: "treino", label: "Treino", icon: "barbell-outline" },
  { id: "certificado", label: "Certificado", icon: "ribbon-outline" },
  { id: "espaco", label: "Espaço", icon: "business-outline" },
];

export function PublishResult({ visible, onClose, onPublicado }: ModalPublicarResultadoProps) {
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<CategoriaItem>("resultado");
  const [titulo, setTitulo] = useState("");
  const [metrica, setMetrica] = useState("");
  const [legenda, setLegenda] = useState("");
  const [fixado, setFixado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  

  const limparFormulario = () => {
    setFotoPreview(null);
    setFotoBase64(null);
    setCategoria("resultado");
    setTitulo("");
    setMetrica("");
    setLegenda("");
    setFixado(false);
  };

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Libere o acesso à galeria para publicar fotos na sua vitrine.");
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
      setFotoPreview(res.assets[0].uri);
      setFotoBase64(res.assets[0].base64 || null);
    }
  };

  const handlePublicar = async () => {
    if (!fotoBase64) {
      Alert.alert("Foto obrigatória", "Escolha uma imagem para publicar na sua vitrine.");
      return;
    }

    setSalvando(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const imagemUrl = await uploadImagemVitrine(user.id, "feed", fotoBase64);

      const { error } = await supabase.from("personal_publicacoes").insert([
        {
          personal_id: user.id,
          imagem_url: imagemUrl,
          categoria,
          titulo: titulo.trim() || null,
          metrica_destaque: metrica.trim() || null,
          legenda: legenda.trim() || null,
          fixado,
        },
      ]);

      if (error) throw error;

      limparFormulario();
      onPublicado();
      onClose();
    } catch (err: any) {
      Alert.alert("Erro ao publicar", err?.message || "Não foi possível salvar a publicação.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>FEED DA VITRINE</Text>
            <Text style={styles.headerTitle}>Nova Publicação</Text>
          </View>
          <TouchableOpacity style={styles.btnFechar} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.imagePickerBox} onPress={escolherFoto} activeOpacity={0.85}>
            {fotoPreview ? (
              <>
                <Image source={{ uri: fotoPreview }} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.trocarFotoBadge}>
                  <Ionicons name="camera-outline" size={14} color="#FF6B00" />
                  <Text style={styles.trocarFotoText}>Trocar foto</Text>
                </View>
              </>
            ) : (
              <>
                <Ionicons name="images-outline" size={38} color="#FF6B00" />
                <Text style={styles.imagePickerText}>Selecionar foto da galeria</Text>
                <Text style={styles.imagePickerSub}>Antes e depois, treino, espaço ou certificado</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.catGrid}>
            {CATEGORIAS.map((c) => {
              const ativo = categoria === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, ativo && styles.catChipAtivo]}
                  onPress={() => setCategoria(c.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={c.icon as any} size={14} color={ativo ? "#FF6B00" : "#8E8E93"} />
                  <Text style={[styles.catChipText, ativo && styles.catChipTextAtivo]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Métrica de destaque (aparece sobre a foto)</Text>
          <TextInput
            style={styles.input}
            value={metrica}
            onChangeText={setMetrica}
            placeholder="Ex: -8kg em 12 semanas • +4kg massa"
            placeholderTextColor="#555"
            maxLength={32}
            keyboardAppearance="dark"
          />

          <Text style={styles.label}>Título curto (opcional)</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Recomposição Corporal — Consultoria Online"
            placeholderTextColor="#555"
            maxLength={60}
            keyboardAppearance="dark"
          />

          <Text style={styles.label}>Legenda / Contexto do resultado</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={legenda}
            onChangeText={setLegenda}
            placeholder="Conte como foi a estratégia, constância ou evolução do aluno..."
            placeholderTextColor="#555"
            multiline
            maxLength={350}
            keyboardAppearance="dark"
          />

          <View style={styles.fixarRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.fixarTitle}>Fixar no topo da vitrine</Text>
              <Text style={styles.fixarSub}>Mantém este registro como primeiro item do seu grid 3x3.</Text>
            </View>
            <Switch
              value={fixado}
              onValueChange={setFixado}
              trackColor={{ false: "#22222A", true: "rgba(255, 107, 0, 0.45)" }}
              thumbColor={fixado ? "#FF6B00" : "#777"}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnPublicar, salvando && { opacity: 0.65 }]}
            onPress={handlePublicar}
            disabled={salvando}
            activeOpacity={0.85}
          >
            {salvando ? (
              <ActivityIndicator color="#FF6B00" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FF6B00" />
                <Text style={styles.btnPublicarText}>Publicar na Vitrine</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}