import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", icon: "flame-outline" },
  { id: "hipertrofia", titulo: "Hipertrofia", icon: "barbell-outline" },
  { id: "saude", titulo: "Saúde e Vida", icon: "heart-outline" },
  { id: "performance", titulo: "Performance", icon: "trophy-outline" },
  { id: "outro", titulo: "Outro Foco", icon: "star-outline" }
];

const OPCOES_LIMITACAO = [
  { id: "gestante", titulo: "Gestante / Pós", icon: "woman-outline" },
  { id: "lesao", titulo: "Lesões / Dores", icon: "bandage-outline" },
  { id: "clinica", titulo: "Condição Clínica", icon: "medkit-outline" },
  { id: "outra", titulo: "Outra Necessidade", icon: "add-circle-outline" }
];

const OPCOES_PERFIL = [
  { id: "acolhedor", titulo: "O Acolhedor", desc: "Paciente e didático", icon: "happy-outline" },
  { id: "motivador", titulo: "O Motivador", desc: "Intenso e animado", icon: "megaphone-outline" },
  { id: "tecnico", titulo: "O Professor", desc: "Foco na biomecânica", icon: "school-outline" },
  { id: "estrategista", titulo: "O Estrategista", desc: "Planilhas e metas", icon: "stats-chart-outline" },
];

const OPCOES_LOCAL = [
  { id: "academia", titulo: "Academias Comerciais", icon: "barbell-outline" },
  { id: "condominio", titulo: "Academias de Condomínio", icon: "business-outline" },
  { id: "casa", titulo: "Em Casa / Domicílio", icon: "home-outline" },
  { id: "ar_livre", titulo: "Ao Ar Livre / Parques", icon: "leaf-outline" }
];

const SUB_SAUDE = ["Melhorar Postura", "Dores nas Costas", "Recomendação Médica", "Reduzir Stress", "Terceira Idade"];
const SUB_ESPORTE = ["Corrida / Maratona", "Artes Marciais", "Natação", "Futebol", "Crossfit", "Ciclismo", "TAF"];
const SUB_LESAO = ["Joelho", "Lombar", "Ombro", "Cervical", "Quadril", "Tornozelo"];
const SUB_CLINICA = ["Hipertensão", "Diabetes", "Asma", "Cardiopatia"];

const OPCOES_PUBLICO = ["Homens", "Mulheres", "Idosos", "Adolescentes", "Atletas", "Iniciantes"];
const OPCOES_EXPERIENCIA = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "Mais de 10 anos"];

export default function PersonalSetup({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [cref, setCref] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [experiencia, setExperiencia] = useState("");
  const [publicoAtendido, setPublicoAtendido] = useState([]);
  const [diferenciais, setDiferenciais] = useState("");
  const [resultados, setResultados] = useState("");

  const [objetivosAtendidos, setObjetivosAtendidos] = useState([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsAtendidos, setSubsAtendidos] = useState([]);
  const [limitacoesAtendidas, setLimitacoesAtendidas] = useState([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [perfilTreinador, setPerfilTreinador] = useState(""); 
  const [locaisAtendidos, setLocaisAtendidos] = useState([]);

  const [precoMedio, setPrecoMedio] = useState(100);
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [galeria, setGaleria] = useState([]);

  useEffect(() => { carregarDadosExistentes(); }, []);

  const carregarDadosExistentes = async () => {
    setLoadingDados(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
      if (user.user_metadata?.cref) setCref(user.user_metadata.cref);

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
        if (data.foto_url) setFotoUri(data.foto_url);
        if (data.instagram) setInstagram(data.instagram);
        if (data.tiktok) setTiktok(data.tiktok);
        if (data.galeria_fotos) setGaleria(data.galeria_fotos);

        if (data.especialidades) {
          const p = data.especialidades;
          const mapLegacy = (array, mapping) => array.map(item => mapping[item] || item);
          const legacyObjMap = { "Emagrecimento": "emagrecimento", "Hipertrofia": "hipertrofia", "Saúde e Qualidade": "saude", "Performance": "performance", "Outro": "outro" };
          const legacyLimMap = { "Gestante / Pós-parto": "gestante", "Lesões ou Dores": "lesao", "Condição Clínica": "clinica", "Outra": "outra" };

          setObjetivosAtendidos(mapLegacy(p.objetivos || [], legacyObjMap));
          setOutroObjetivoTexto(p.outroObjetivo || "");
          setLimitacoesAtendidas(mapLegacy(p.limitacoes || [], legacyLimMap));
          setOutraLimitacaoTexto(p.outraLimitacao || "");
          setSubsAtendidos(p.subs || []);
          setPerfilTreinador(p.perfil || "");
          setPublicoAtendido(p.publico || []);
          setLocaisAtendidos(p.locais || []); 
          setDiferenciais(p.diferenciais || "");
          setResultados(p.resultados || "");
        }
      }
    } catch (error) { console.log("Erro ao carregar:", error); } 
    finally { setLoadingDados(false); }
  };

  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { Alert.alert("Aviso", "Permissão negada."); setBuscandoLocalizacao(false); return; }
      
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude); setLongitude(location.coords.longitude);
      
      let reverse = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (reverse && reverse.length > 0) {
        setCidade(reverse[0].city || reverse[0].subregion || ""); 
        setBairro(reverse[0].district || reverse[0].name || "");
      }
    } catch (error) { Alert.alert("Erro", "Falha no GPS."); } 
    finally { setBuscandoLocalizacao(false); }
  };

  const selecionarFotoPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const formatarWhatsApp = (texto) => {
    let v = texto.replace(/\D/g, '');
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(v.substring(0, 15));
  };

  const toggleArrayItem = (item, state, setState) => {
    if (state.includes(item)) { setState(state.filter((i) => i !== item)); } 
    else { setState([...state, item]); }
  };

  const handleSalvar = async () => {
    if (!cref?.trim() || !telefone?.trim() || !cidade?.trim() || !nome?.trim()) {
      return Alert.alert("Atenção", "Preencha os dados obrigatórios (*).");
    }
    if (objetivosAtendidos.length === 0 || !perfilTreinador || locaisAtendidos.length === 0) {
      return Alert.alert("Atenção", "Selecione seu Estilo, Locais e pelo menos um Foco de Treino.");
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Alert.alert("Erro", "Sessão expirada.");

      const especialidadesEstruturadas = {
        objetivos: objetivosAtendidos,
        outroObjetivo: objetivosAtendidos.includes("outro") ? outroObjetivoTexto.trim() : null,
        limitacoes: limitacoesAtendidas,
        outraLimitacao: limitacoesAtendidas.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs: subsAtendidos,
        perfil: perfilTreinador,
        publico: publicoAtendido,
        locais: locaisAtendidos, 
        diferenciais: diferenciais.trim(),
        resultados: resultados.trim(),
      };

      const { error } = await supabase.from("personals").upsert({
        id: user.id, email: user.email, nome: nome.trim(), cref: cref.trim(),
        telefone: telefone.trim(), cidade: cidade.trim(), bairro: bairro.trim(),
        latitude: latitude, longitude: longitude, tempo_experiencia: experiencia,
        preco_medio: parseInt(precoMedio) || 0, descricao: bio?.trim() || "",
        foto_url: fotoUri, instagram: instagram, tiktok: tiktok, galeria_fotos: galeria,
        especialidades: especialidadesEstruturadas, ativo: true,
      }, { onConflict: 'id' });

      if (error) throw error;
      Alert.alert("Sucesso!", "Seu perfil está online e atualizado!", [
        { text: "Ver Meu Painel", onPress: () => { isEditing ? navigation.goBack() : navigation.replace("PersonalDashboard"); } },
      ]);
    } catch (err) { Alert.alert("Erro", "Falha ao salvar."); } 
    finally { setLoading(false); }
  };

  const renderNeonChips = (opcoes, stateArray, setStateArray, isSingle = false) => (
    <View style={styles.chipsContainerCenter}>
      {opcoes.map((opcao) => {
        const ativo = isSingle ? stateArray === opcao : stateArray.includes(opcao);
        return (
          <TouchableOpacity 
            key={opcao} 
            style={[styles.chip, ativo && styles.neonAtivo]} 
            onPress={() => isSingle ? setStateArray(opcao) : toggleArrayItem(opcao, stateArray, setStateArray)} 
            activeOpacity={0.7}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderNeonGrid = (opcoes, stateArray, setStateArray, isSingle = false) => (
    <View style={styles.gridContainer}>
      {opcoes.map((opt) => {
        const ativo = isSingle ? stateArray === opt.id : stateArray.includes(opt.id);
        return (
          <TouchableOpacity 
            key={opt.id} 
            style={[styles.gridItemWithIcon, ativo && styles.neonAtivo]} 
            onPress={() => isSingle ? setStateArray(opt.id) : toggleArrayItem(opt.id, stateArray, setStateArray)} 
            activeOpacity={0.8}
          >
            <Ionicons name={opt.icon} size={32} color={ativo ? theme.colors.primary : theme.colors.textMuted} style={{marginBottom: 8}} />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo, {textAlign: 'center'}]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && {color: theme.colors.primary}]}>{opt.desc}</Text>}
          </TouchableOpacity>
        )
      })}
    </View>
  );

  if (loadingDados) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      
      <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.navigate("PersonalDashboard")} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "EDITAR PERFIL" : "CONFIGURAÇÃO DO PERFIL"}</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryHover]} style={styles.avatarRing}>
              <Image source={{ uri: fotoUri || 'https://via.placeholder.com/150' }} style={styles.avatarImage} />
            </LinearGradient>
            <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color={theme.colors.backgroundPure} /></View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="card-outline" size={18} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Identificação Básica</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Público *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Ex: Personal João Silva" placeholderTextColor={theme.colors.textMuted} value={nome} onChangeText={setNome} />
            </View>
          </View>

          <View style={styles.rowCompact}>
            <View style={styles.formGroupCompact}>
              <Text style={styles.label}>CREF *</Text>
              <View style={styles.inputContainerCompact}>
                <MaterialCommunityIcons name="card-account-details-outline" size={18} color={theme.colors.primary} style={styles.inputIconCompact} />
                <TextInput style={styles.inputCompact} placeholder="0000-G/SP" placeholderTextColor={theme.colors.textMuted} value={cref} onChangeText={setCref} />
              </View>
            </View>
            <View style={styles.formGroupCompact}>
              <Text style={styles.label}>WhatsApp *</Text>
              <View style={styles.inputContainerCompact}>
                <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" style={styles.inputIconCompact} />
                <TextInput style={styles.inputCompact} placeholder="(11) 99999" placeholderTextColor={theme.colors.textMuted} keyboardType="phone-pad" value={telefone} onChangeText={formatarWhatsApp} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.btnLocationPremium} onPress={obterLocalizacaoAtual} disabled={buscandoLocalizacao} activeOpacity={0.85}>
            {buscandoLocalizacao ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : <><MaterialCommunityIcons name="radar" size={22} color={theme.colors.backgroundPure} /><Text style={styles.btnLocationText}>Sincronizar Radar GPS</Text></>}
          </TouchableOpacity>
          <Text style={{color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 15, marginTop: -5}}>Crucial para alunos te encontrarem na sua área.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrapper}><Ionicons name="flash-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Motor de Match (Seu Perfil)</Text>
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Focos Principais de Treino</Text>
          {renderNeonGrid(OPCOES_OBJETIVO, objetivosAtendidos, setObjetivosAtendidos)}
          
          {objetivosAtendidos.includes("outro") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite sua especialidade..." placeholderTextColor={theme.colors.textMuted} value={outroObjetivoTexto} onChangeText={setOutroObjetivoTexto} />
          )}
          {objetivosAtendidos.includes("saude") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Público de Saúde:</Text>{renderNeonChips(SUB_SAUDE, subsAtendidos, setSubsAtendidos)}</View>
          )}
          {objetivosAtendidos.includes("performance") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prepara para:</Text>{renderNeonChips(SUB_ESPORTE, subsAtendidos, setSubsAtendidos)}</View>
          )}

          {/* 2. LIMITAÇÕES COM GRID NEON */}
          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Atende Restrições ou Necessidades?</Text>
          {renderNeonGrid(OPCOES_LIMITACAO, limitacoesAtendidas, setLimitacoesAtendidas)}

          {limitacoesAtendidas.includes("outra") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite a necessidade..." placeholderTextColor={theme.colors.textMuted} value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} />
          )}
          {limitacoesAtendidas.includes("lesao") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Reabilitação focada em:</Text>{renderNeonChips(SUB_LESAO, subsAtendidos, setSubsAtendidos)}</View>
          )}
          {limitacoesAtendidas.includes("clinica") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Controle de:</Text>{renderNeonChips(SUB_CLINICA, subsAtendidos, setSubsAtendidos)}</View>
          )}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Onde você realiza os treinos?</Text>
          {renderNeonGrid(OPCOES_LOCAL, locaisAtendidos, setLocaisAtendidos)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Sua Vibe / Estilo de Aula</Text>
          {renderNeonGrid(OPCOES_PERFIL, perfilTreinador, setPerfilTreinador, true)}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrapper}><Ionicons name="trophy-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Estratégia e Autoridade</Text>
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Tempo de Experiência</Text>
          {renderNeonChips(OPCOES_EXPERIENCIA, experiencia, setExperiencia, true)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 30}]}>Público que mais atende</Text>
          {renderNeonChips(OPCOES_PUBLICO, publicoAtendido, setPublicoAtendido)}

          <Text style={[styles.label, {marginTop: 35}]}>Diferenciais Competitivos</Text>
          <View style={styles.inputContainerArea}>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Ex: Avaliação postural inclusa..." placeholderTextColor={theme.colors.textMuted} multiline maxLength={300} value={diferenciais} onChangeText={setDiferenciais} textAlignVertical="top" />
          </View>

          <Text style={[styles.label, {marginTop: 20}]}>Resultados Comprovados</Text>
          <View style={styles.inputContainerArea}>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Ex: Mais de 200 alunos transformados..." placeholderTextColor={theme.colors.textMuted} multiline maxLength={300} value={resultados} onChangeText={setResultados} textAlignVertical="top" />
          </View>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="pricetag-outline" size={18} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Comercial e Redes</Text>
          </View>

          <Text style={styles.label}>Valor médio (Hora/Aula)</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>R$ {precoMedio}</Text>
            <Slider style={{ width: "100%", height: 40, marginTop: 10 }} minimumValue={50} maximumValue={500} step={10} minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor={theme.colors.borderLight} thumbTintColor={theme.colors.primary} value={precoMedio} onValueChange={setPrecoMedio} />
          </View>

          <Text style={[styles.label, {marginTop: 15}]}>Bio (Sua Apresentação)</Text>
          <View style={styles.inputContainerArea}>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Sou Personal Trainer apaixonado por..." placeholderTextColor={theme.colors.textMuted} multiline maxLength={400} value={bio} onChangeText={setBio} textAlignVertical="top" />
          </View>

        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : (
            <>
              <Ionicons name="shield-checkmark" size={22} color={theme.colors.backgroundPure} style={{ marginRight: 8 }} />
              <Text style={styles.btnSalvarText}>Salvar e Concluir</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  
  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.5)' : 'transparent',
    overflow: 'hidden',
  },
  btnVoltar: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  headerTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 100 },
  
  photoSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: 3, borderRadius: 65 },
  avatarImage: { width: 116, height: 116, borderRadius: 58, borderWidth: 4, borderColor: theme.colors.background, backgroundColor: theme.colors.surface },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.background },
  photoHintText: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 15 },
  
  cardGeral: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: 20, padding: 20, marginBottom: 25 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, marginTop: 5 },
  iconWrapper: { backgroundColor: theme.colors.primaryLight, padding: 8, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)' },
  sectionTitle: { color: theme.colors.text, fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  cardHeaderTitle: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  rowCompact: { flexDirection: 'row', gap: 12, marginBottom: 5 },
  formGroupCompact: { flex: 1, marginBottom: 15 },
  inputContainerCompact: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, height: 52 },
  inputIconCompact: { marginLeft: 14, marginRight: 8 },
  inputCompact: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600', paddingRight: 10 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, overflow: 'hidden' },
  inputContainerArea: { backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, paddingHorizontal: 16 },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 14, paddingRight: 16, fontWeight: '500' },
  inputLocation: { flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 14, paddingHorizontal: 16, fontWeight: '500' },
  inputHalf: { flex: 1, color: theme.colors.text, fontSize: 14, paddingVertical: 14, paddingRight: 10, fontWeight: '500' },
  textArea: { minHeight: 100, paddingTop: 16, paddingBottom: 16 },

  btnLocationPremium: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, marginBottom: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  btnLocationText: { color: theme.colors.backgroundPure, fontSize: 15, fontWeight: "900", marginLeft: 8 },

  preferenceCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: theme.colors.border }, 
  cardHeaderTitleSub: { color: theme.colors.text, fontSize: 14, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },

  chipsContainerCenter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }, 
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 30, borderWidth: 1.5, borderColor: theme.colors.borderLight }, 
  chipTexto: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: '900' },

  subBox: { backgroundColor: theme.colors.background, width: '100%', padding: 16, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  subBoxTitle: { color: theme.colors.textBody, fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', textAlign: 'center' },
  inputPremiumSmall: { backgroundColor: theme.colors.surfaceLight, borderRadius: 12, color: theme.colors.text, fontSize: 14, padding: 14, borderWidth: 1, borderColor: theme.colors.borderLight, width: '100%', marginTop: 15, marginBottom: 10 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  gridItemWithIcon: { width: '48%', backgroundColor: theme.colors.surfaceLight, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.borderLight },
  gridItemText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  gridItemTextAtivo: { color: theme.colors.primary, fontWeight: '900' },
  gridItemDesc: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', paddingHorizontal: 5, marginTop: 4 },

  neonAtivo: { 
    backgroundColor: 'rgba(255, 107, 0, 0.08)', 
    borderColor: theme.colors.primary,         
    shadowColor: theme.colors.primary,          
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,                              
  },

  priceContainer: { backgroundColor: theme.colors.surfaceLight, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20, alignItems: 'center' },
  priceValue: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: 36, marginBottom: 5 },

  btnSalvar: { backgroundColor: theme.colors.primary, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnSalvarText: { color: theme.colors.backgroundPure, fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});