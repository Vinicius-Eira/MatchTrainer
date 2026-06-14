import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import BotaoPrincipal from "../../components/BotaoPrincipal";

export default function PersonalSetup({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [cref, setCref] = useState("");
  const [telefone, setTelefone] = useState("");
  
  const [galeria, setGaleria] = useState([]);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [videoPitch, setVideoPitch] = useState("");

  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState([]);
  const [experiencia, setExperiencia] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [precoMedio, setPrecoMedio] = useState(100);
  const [bio, setBio] = useState("");
  const [whatsappAtivo, setWhatsappAtivo] = useState(true);

  const listaEspecialidades = ["Musculação", "Funcional", "Emagrecimento", "Hipertrofia", "Reabilitação", "Pilates", "CrossFit", "Idosos", "Gestantes"];
  const opcoesExperiencia = ["< 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "+10 anos"];

  useEffect(() => {
    carregarDadosExistentes();
  }, []);

  const carregarDadosExistentes = async () => {
    setLoadingDados(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase.from("personals").select("*").eq("id", user.id).single();

      if (data) {
        if (data.ativo) setIsEditing(true);

        if (data.cref) setCref(data.cref);
        if (data.nome) setNome(data.nome);
        if (data.telefone) setTelefone(data.telefone);
        if (data.cidade) setCidade(data.cidade);
        if (data.bairro) setBairro(data.bairro);
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        if (data.preco_medio) setPrecoMedio(Number(data.preco_medio));
        if (data.descricao) setBio(data.descricao);
        if (data.tempo_experiencia) setExperiencia(data.tempo_experiencia);
        if (data.especialidades) setEspecialidadesSelecionadas(data.especialidades);
        if (data.foto_url) setFotoUri(data.foto_url);
        if (data.whatsapp_ativo !== null) setWhatsappAtivo(data.whatsapp_ativo);
        
        if (data.instagram) setInstagram(data.instagram);
        if (data.tiktok) setTiktok(data.tiktok);
        if (data.video_pitch) setVideoPitch(data.video_pitch);
        if (data.galeria_fotos) setGaleria(data.galeria_fotos);
      }
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    } finally {
      setLoadingDados(false);
    }
  };

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Aviso", "Permissão negada. Preencha manualmente.");
        setBuscandoLocalizacao(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      let reverse = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        setCidade(place.city || place.subregion || place.region || "");
        setBairro(place.district || place.sublocality || place.name || "");
      }
    } catch (error) {
      Alert.alert("Erro", "Não conseguimos obter sua localização.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const selecionarFotoPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const selecionarFotoGaleria = async () => {
    if (galeria.length >= 4) return Alert.alert("Limite atingido", "Você pode adicionar no máximo 4 fotos à galeria.");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 5], quality: 0.7 });
    if (!result.canceled) setGaleria([...galeria, result.assets[0].uri]);
  };

  const removerFotoGaleria = (index) => {
    const novaGaleria = [...galeria];
    novaGaleria.splice(index, 1);
    setGaleria(novaGaleria);
  };

  const toggleEspecialidade = (esp) => {
    if (especialidadesSelecionadas.includes(esp)) {
      setEspecialidadesSelecionadas(especialidadesSelecionadas.filter((item) => item !== esp));
    } else {
      setEspecialidadesSelecionadas([...especialidadesSelecionadas, esp]);
    }
  };

  const formatarRedeSocial = (texto, tipo) => {
    let limpo = texto.replace('@', '').trim();
    if (tipo === 'ig') setInstagram(limpo);
    if (tipo === 'tk') setTiktok(limpo);
  };

  const handleSalvar = async () => {
    if (!cref?.trim() || !telefone?.trim() || !cidade?.trim() || !bairro?.trim()) {
      return Alert.alert("Atenção", "Preencha os dados obrigatórios marcados com *.");
    }
    if (especialidadesSelecionadas.length === 0 || !experiencia) {
      return Alert.alert("Atenção", "Selecione tempo de experiência e pelo menos 1 especialidade.");
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Alert.alert("Erro", "Sessão expirada.");

      const { error } = await supabase.from("personals").upsert({
        id: user.id,
        email: user.email,
        nome: user.user_metadata?.nome || user.user_metadata?.full_name || "Treinador",
        cref: cref.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        latitude: latitude,
        longitude: longitude,
        especialidades: especialidadesSelecionadas.filter((item) => item !== ""),
        tempo_experiencia: experiencia,
        preco_medio: parseInt(precoMedio) || 0,
        descricao: bio?.trim() || "",
        foto_url: fotoUri,
        whatsapp_ativo: whatsappAtivo,
        instagram: instagram,
        tiktok: tiktok,
        video_pitch: videoPitch,
        galeria_fotos: galeria,
        ativo: true,
      });

      if (error) throw error;

      Alert.alert("Sucesso!", "Perfil atualizado e pronto para receber alunos.", [
        { text: "OK", onPress: () => { isEditing ? navigation.goBack() : navigation.replace("PersonalDashboard"); } },
      ]);
    } catch (err) {
      console.error("Erro ao Salvar:", err);
      Alert.alert("Erro ao Salvar", err.message || "Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDados) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={26} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>{isEditing ? "Editar Perfil" : "Configurar Painel"}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.photoWrapper} onPress={selecionarFotoPrincipal} activeOpacity={0.8}>
            <View style={styles.photoContainer}>
              {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.photoPreview} /> : <Ionicons name="person" size={50} color="#444" />}
            </View>
            <View style={styles.photoEditBadge}><Ionicons name="camera" size={16} color="#000" /></View>
          </TouchableOpacity>
          <Text style={styles.photoHintText}>Foto principal (Rosto visível)</Text>
        </View>

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="card-account-details-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Dados Básicos</Text>
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="card-bulleted-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Registro CREF *" placeholderTextColor="#666" value={cref} onChangeText={setCref} />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="whatsapp" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="WhatsApp (com DDD) *" placeholderTextColor="#666" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} maxLength={11} />
        </View>

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Autoridade e Redes</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Perfis com redes sociais recebem 3x mais contatos.</Text>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="instagram" size={20} color="#E1306C" style={styles.inputIcon} />
          <Text style={styles.prefixInput}>@</Text>
          <TextInput style={styles.input} placeholder="Seu usuário do Instagram" placeholderTextColor="#666" value={instagram} onChangeText={(t) => formatarRedeSocial(t, 'ig')} autoCapitalize="none" />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome5 name="tiktok" size={18} color="#FFF" style={[styles.inputIcon, {marginLeft: 2, marginRight: 14}]} />
          <Text style={styles.prefixInput}>@</Text>
          <TextInput style={styles.input} placeholder="Seu usuário do TikTok" placeholderTextColor="#666" value={tiktok} onChangeText={(t) => formatarRedeSocial(t, 'tk')} autoCapitalize="none" />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="play-circle-outline" size={22} color="#FF0000" style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Link de um vídeo curto (Reels/Shorts)" placeholderTextColor="#666" value={videoPitch} onChangeText={setVideoPitch} autoCapitalize="none" />
        </View>

        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Ionicons name="images-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Mostre seu local de trabalho, alunos ou certificados (Máx 4).</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
          {galeria.map((foto, index) => (
            <View key={index} style={styles.galleryItem}>
              <Image source={{ uri: foto }} style={styles.galleryImage} />
              <TouchableOpacity style={styles.removeGalleryBtn} onPress={() => removerFotoGaleria(index)}>
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
          {galeria.length < 4 && (
            <TouchableOpacity style={styles.addGalleryBtn} onPress={selecionarFotoGaleria}>
              <Ionicons name="add" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.addGalleryText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Ionicons name="map-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Região de Atuação</Text>
        </View>

        <TouchableOpacity style={styles.btnLocationPremium} onPress={obterLocalizacaoAtual} disabled={buscandoLocalizacao} activeOpacity={0.85}>
          {buscandoLocalizacao ? <ActivityIndicator size="small" color="#000" /> : <><MaterialCommunityIcons name="crosshairs-gps" size={22} color="#000" /><Text style={styles.btnLocationText}>Detectar GPS Automaticamente</Text></>}
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
            <Ionicons name="business-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Cidade *" placeholderTextColor="#666" value={cidade} onChangeText={(txt) => { setCidade(txt); setLatitude(null); setLongitude(null); }} />
          </View>
          <View style={[styles.inputWrapper, { flex: 1 }]}>
            <Ionicons name="navigate-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Bairro *" placeholderTextColor="#666" value={bairro} onChangeText={setBairro} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <FontAwesome5 name="dumbbell" size={18} color={theme.colors.primary} style={{ marginLeft: 2 }} />
          <Text style={styles.sectionTitle}>Especialidades</Text>
        </View>
        <View style={styles.grid}>
          {listaEspecialidades.map((esp, idx) => {
            const selecionado = especialidadesSelecionadas.includes(esp);
            return (
              <TouchableOpacity key={idx} style={[styles.chip, selecionado ? styles.chipSelected : styles.chipUnselected]} onPress={() => toggleEspecialidade(esp)}>
                <Text style={[styles.chipText, selecionado ? styles.chipTextSelected : styles.chipTextUnselected]}>{esp}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Tempo de Experiência</Text>
        </View>
        <View style={styles.grid}>
          {opcoesExperiencia.map((opt, idx) => {
            const selecionado = experiencia === opt;
            return (
              <TouchableOpacity key={idx} style={[styles.chip, selecionado ? styles.chipSelected : styles.chipUnselected]} onPress={() => setExperiencia(experiencia === opt ? "" : opt)}>
                <Text style={[styles.chipText, selecionado ? styles.chipTextSelected : styles.chipTextUnselected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="storefront-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Vitrine Pública</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Valor médio cobrado por sessão</Text>
          <Text style={styles.priceValue}>R$ {precoMedio}</Text>
          <Slider
            style={{ width: "100%", height: 40, marginTop: 10 }}
            minimumValue={50} maximumValue={500} step={10}
            minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" thumbTintColor={theme.colors.primary}
            value={precoMedio} onValueChange={setPrecoMedio}
          />
        </View>

        <View style={styles.inputWrapperArea}>
          <MaterialCommunityIcons name="text-box-edit-outline" size={20} color={theme.colors.textSecondary} style={[styles.inputIcon, { marginTop: 15 }]} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Apresente sua metodologia e como você ajuda os alunos a chegarem no resultado..."
            placeholderTextColor="#666" multiline maxLength={400} numberOfLines={5} value={bio} onChangeText={setBio} textAlignVertical="top"
          />
        </View>
        <Text style={styles.counterText}>{bio.length}/400 caracteres</Text>

        <View style={styles.toggleCard}>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#4CAF50" style={{ marginRight: 6 }} />
              <Text style={styles.toggleTitle}>WhatsApp Público</Text>
            </View>
            <Text style={styles.toggleSub}>Permitir que alunos iniciem a conversa direto no WhatsApp.</Text>
          </View>
          <Switch trackColor={{ false: "#333", true: theme.colors.primary }} thumbColor={"#FFF"} onValueChange={setWhatsappAtivo} value={whatsappAtivo} />
        </View>

        <View style={{ marginTop: 10, marginBottom: 50 }}>
          <BotaoPrincipal titulo={loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Concluir Setup"} onPress={handleSalvar} disabled={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, flexGrow: 1, paddingTop: Platform.OS === "ios" ? 50 : 30 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 30 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },
  screenTitle: { color: theme.colors.text, fontSize: 20, fontFamily: theme.fonts.title, textAlign: "center", flex: 1, letterSpacing: 0.5 },

  sectionContainer: { alignItems: "center", marginBottom: 30 },
  photoWrapper: { position: "relative" },
  photoContainer: { width: 120, height: 120, borderRadius: 60, overflow: "hidden", backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: theme.colors.primary },
  photoPreview: { width: "100%", height: "100%" },
  photoEditBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: theme.colors.background },
  photoHintText: { color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 12 },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#1F1F1F" },
  sectionTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: 20, marginLeft: 10, letterSpacing: 0.5 },
  sectionSubtitle: { color: "#888", fontSize: 13, marginBottom: 16, paddingLeft: 4 },

  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#262626", marginBottom: 16 },
  inputWrapperArea: { flexDirection: "row", backgroundColor: "#121212", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: "#262626", marginBottom: 6 },
  inputIcon: { marginRight: 12 },
  prefixInput: { color: '#888', fontSize: 16, marginRight: 2, fontWeight: 'bold' },
  input: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 16 },
  textArea: { minHeight: 120, paddingTop: 16, paddingBottom: 16 },
  counterText: { color: theme.colors.textSecondary, fontSize: 12, textAlign: "right", marginBottom: 20, marginRight: 5 },

  galleryContainer: { flexDirection: 'row', gap: 12, paddingVertical: 10, marginBottom: 20 },
  galleryItem: { width: 100, height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#333' },
  galleryImage: { width: '100%', height: '100%' },
  removeGalleryBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addGalleryBtn: { width: 100, height: 120, borderRadius: 12, backgroundColor: '#121212', borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addGalleryText: { color: '#888', fontSize: 12, marginTop: 8, fontWeight: 'bold' },

  row: { flexDirection: "row", justifyContent: "space-between", width: "100%" },

  btnLocationPremium: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, borderRadius: 16, marginBottom: 20, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  btnLocationText: { color: "#000", fontSize: 15, fontWeight: "900", marginLeft: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 30 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  chipSelected: { backgroundColor: "rgba(255, 107, 0, 0.12)", borderColor: theme.colors.primary },
  chipUnselected: { backgroundColor: "#121212", borderColor: "#262626" },
  chipText: { fontFamily: theme.fonts.body, fontSize: 14 },
  chipTextSelected: { color: theme.colors.primary, fontWeight: "bold" },
  chipTextUnselected: { color: "#999" },

  priceContainer: { backgroundColor: "#121212", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#262626", marginBottom: 20 },
  priceLabel: { color: theme.colors.textSecondary, fontFamily: theme.fonts.body, fontSize: 14, marginBottom: 5 },
  priceValue: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: 32 },

  toggleCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#262626", marginTop: 10, marginBottom: 30 },
  toggleTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  toggleSub: { color: "#888", fontSize: 13, lineHeight: 18, marginTop: 4 },
});