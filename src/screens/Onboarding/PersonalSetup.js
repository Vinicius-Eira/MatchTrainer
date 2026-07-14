import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [inputFocado, setInputFocado] = useState(null);

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
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
  const [galeria, setGaleria] = useState([]);

  const [objetivosAtendidos, setObjetivosAtendidos] = useState([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subsAtendidos, setSubsAtendidos] = useState([]);
  const [limitacoesAtendidas, setLimitacoesAtendidas] = useState([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [perfilTreinador, setPerfilTreinador] = useState(""); 
  const [locaisAtendidos, setLocaisAtendidos] = useState([]);

  const [precoMedio, setPrecoMedio] = useState(150);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

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
        if (data.descricao) setBio(data.descricao);
        if (data.telefone) setTelefone(data.telefone);
        if (data.cidade) setCidade(data.cidade);
        if (data.bairro) setBairro(data.bairro);
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        if (data.preco_medio) setPrecoMedio(Number(data.preco_medio));
        if (data.tempo_experiencia) setExperiencia(data.tempo_experiencia);
        if (data.foto_url) setFotoUri(data.foto_url);
        if (data.instagram) setInstagram(data.instagram);
        if (data.tiktok) setTiktok(data.tiktok);
        if (data.galeria_fotos && Array.isArray(data.galeria_fotos)) setGaleria(data.galeria_fotos);

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

  const selecionarFotosGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para adicionar as fotos de antes e depois.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsMultipleSelection: true,
      selectionLimit: 5 - galeria.length, 
      quality: 0.6 
    });
    
    if (!result.canceled) {
      const novasFotos = result.assets.map(asset => asset.uri);
      setGaleria(prevGaleria => [...prevGaleria, ...novasFotos]);
    }
  };

  const removerFotoGaleria = (indexToRemove) => {
    setGaleria(prevGaleria => prevGaleria.filter((_, index) => index !== indexToRemove));
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
      return Alert.alert("Atenção", "Preencha os dados obrigatórios (*). A localização também é obrigatória.");
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
        aceitaNegociacao: false 
      };

      const { error } = await supabase.from("personals").upsert({
        id: user.id, email: user.email, nome: nome.trim(), cref: cref.trim(),
        telefone: telefone.trim(), cidade: cidade.trim(), bairro: bairro.trim(),
        latitude: latitude, longitude: longitude, tempo_experiencia: experiencia,
        preco_medio: parseInt(precoMedio) || 0, descricao: bio?.trim() || "",
        foto_url: fotoUri, instagram: instagram.trim(), tiktok: tiktok.trim(), galeria_fotos: galeria,
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
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && {color: theme.colors.primary}]}>{opt.desc}</Text>}
          </TouchableOpacity>
        )
      })}
    </View>
  );

  if (loadingDados) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      
      <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.navigate("PersonalDashboard")} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "EDITAR PERFIL" : "CONFIGURAR PERFIL"}</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryLight]} style={styles.avatarRing}>
              <Image source={{ uri: fotoUri || 'https://via.placeholder.com/150' }} style={styles.avatarImage} />
            </LinearGradient>
            <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color={theme.colors.backgroundPure} /></View>
          </TouchableOpacity>
          <Text style={styles.photoHintText}>Toque para alterar a foto</Text>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="person-circle-outline" size={20} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Apresentação Básica</Text>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>Nome Público *</Text>
            </View>
            <View style={[styles.inputContainer, inputFocado === "nome" && styles.inputFocused]}>
              <Ionicons name="person-outline" size={20} color={inputFocado === "nome" ? theme.colors.primary : theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="Ex: Personal João Silva" placeholderTextColor={theme.colors.textMuted} 
                value={nome} onChangeText={setNome} onFocus={() => setInputFocado("nome")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="book" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>Biografia Profissional</Text>
            </View>
            <View style={[styles.inputContainerArea, inputFocado === "bio" && styles.inputFocused]}>
              <TextInput 
                style={[styles.input, styles.textArea]} placeholder="Descreva sua metodologia e sua paixão pelo que faz..." placeholderTextColor={theme.colors.textMuted} 
                multiline maxLength={400} value={bio} onChangeText={setBio} textAlignVertical="top" 
                onFocus={() => setInputFocado("bio")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="card-account-details" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>CREF *</Text>
            </View>
            <View style={[styles.inputContainer, inputFocado === "cref" && styles.inputFocused]}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={inputFocado === "cref" ? theme.colors.primary : theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="Ex: 0000-G/SP" placeholderTextColor={theme.colors.textMuted} 
                value={cref} onChangeText={setCref} onFocus={() => setInputFocado("cref")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="whatsapp" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>WhatsApp para Contato *</Text>
            </View>
            <View style={[styles.inputContainer, inputFocado === "wpp" && styles.inputFocused]}>
              <MaterialCommunityIcons name="whatsapp" size={20} color={inputFocado === "wpp" ? theme.colors.whatsapp : theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="(11) 99999-9999" placeholderTextColor={theme.colors.textMuted} keyboardType="phone-pad" 
                value={telefone} onChangeText={formatarWhatsApp} onFocus={() => setInputFocado("wpp")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="location-outline" size={20} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Área de Atendimento</Text>
          </View>
          <Text style={styles.cardSubtitle}>Sincronize seu radar para que alunos da sua região encontrem seu perfil rapidamente.</Text>
          
          <TouchableOpacity style={styles.btnLocationPremium} onPress={obterLocalizacaoAtual} disabled={buscandoLocalizacao} activeOpacity={0.85}>
            {buscandoLocalizacao ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : (
              <>
                <MaterialCommunityIcons name="radar" size={22} color={theme.colors.backgroundPure} />
                <Text style={styles.btnLocationText}>Sincronizar Radar GPS</Text>
              </>
            )}
          </TouchableOpacity>
          
          {(cidade || bairro) ? (
            <View style={styles.locationResultBox}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={styles.locationResultText}>{cidade}{bairro ? `, ${bairro}` : ''}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrapper}><MaterialCommunityIcons name="target-account" size={22} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Motor de Match (O Algoritmo)</Text>
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
          <View style={styles.iconWrapper}><Ionicons name="medal-outline" size={20} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Estratégia e Autoridade</Text>
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Tempo de Experiência</Text>
          {renderNeonChips(OPCOES_EXPERIENCIA, experiencia, setExperiencia, true)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 30}]}>Público que mais atende</Text>
          {renderNeonChips(OPCOES_PUBLICO, publicoAtendido, setPublicoAtendido)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Diferenciais Competitivos</Text>
          <View style={[styles.inputContainerArea, inputFocado === "diferenciais" && styles.inputFocused]}>
            <TextInput 
              style={[styles.input, styles.textArea]} placeholder="Ex: Avaliação postural inclusa, app próprio, suporte 24h..." placeholderTextColor={theme.colors.textMuted} 
              multiline maxLength={300} value={diferenciais} onChangeText={setDiferenciais} textAlignVertical="top" 
              onFocus={() => setInputFocado("diferenciais")} onBlur={() => setInputFocado(null)}
            />
          </View>

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Resultados (Antes e Depois)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galeriaScroll}>
            {galeria.map((uri, index) => (
              <View key={index} style={styles.galeriaItem}>
                <Image source={{ uri }} style={styles.galeriaImage} />
                <TouchableOpacity style={styles.btnRemoverFoto} onPress={() => removerFotoGaleria(index)}>
                  <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            
            {galeria.length < 5 && (
              <TouchableOpacity style={styles.btnAddFoto} onPress={selecionarFotosGaleria} activeOpacity={0.7}>
                <Ionicons name="image-outline" size={28} color={theme.colors.primary} />
                <Text style={styles.btnAddFotoText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={styles.galeriaHint}>Anexe até 5 fotos para gerar confiança imediata.</Text>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="pricetag-outline" size={20} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Comercial e Redes</Text>
          </View>

          <View style={styles.labelRow}>
            <Ionicons name="cash" size={14} color={theme.colors.primary} />
            <Text style={styles.label}>Valor base da mensalidade</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>R$ {precoMedio}</Text>
            <Slider 
              style={{ width: "100%", height: 40, marginTop: 10 }} minimumValue={50} maximumValue={1000} step={10} 
              minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor={theme.colors.borderLight} 
              thumbTintColor={theme.colors.primary} value={precoMedio} onValueChange={setPrecoMedio} 
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-instagram" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>Instagram (Sem o @)</Text>
            </View>
            <View style={[styles.inputContainer, inputFocado === "insta" && styles.inputFocused]}>
              <Ionicons name="at" size={20} color={inputFocado === "insta" ? "#E1306C" : theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="seu_usuario" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none"
                value={instagram} onChangeText={setInstagram} onFocus={() => setInputFocado("insta")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>

          <View style={[styles.formGroup, { marginBottom: 0 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-tiktok" size={14} color={theme.colors.primary} />
              <Text style={styles.label}>TikTok (Sem o @)</Text>
            </View>
            <View style={[styles.inputContainer, inputFocado === "tiktok" && styles.inputFocused]}>
              <FontAwesome5 name="at" size={16} color={inputFocado === "tiktok" ? "#FFF" : theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} placeholder="seu_usuario" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none"
                value={tiktok} onChangeText={setTiktok} onFocus={() => setInputFocado("tiktok")} onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : (
            <>
              <Ionicons name="save" size={22} color={theme.colors.backgroundPure} style={{ marginRight: 10 }} />
              <Text style={styles.btnSalvarText}>SALVAR PERFIL</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#070707" },
  
  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.5)' : 'transparent',
  },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 40 }, 
  
  photoSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: 4, borderRadius: 70 },
  avatarImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "#070707", backgroundColor: theme.colors.surface },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: theme.colors.primary, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: "#070707" },
  photoHintText: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 15, fontWeight: '500' },
  
  cardGeral: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: 24, padding: 24, marginBottom: 25 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardSubtitle: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5, marginTop: 10 },
  iconWrapper: { backgroundColor: "rgba(255,107,0,0.1)", padding: 10, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  sectionTitle: { color: "#FFF", fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  cardHeaderTitle: { color: "#FFF", fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  formGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  label: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 6 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#121212", borderWidth: 1.5, borderColor: "rgba(255, 107, 0, 0.3)", borderRadius: 16, overflow: 'hidden', height: 60 },
  inputContainerArea: { backgroundColor: "#121212", borderWidth: 1.5, borderColor: "rgba(255, 107, 0, 0.3)", borderRadius: 16, paddingHorizontal: 16 },
  inputFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, color: "#FFF", fontSize: 15, paddingRight: 16, fontWeight: '500', height: '100%' },
  textArea: { minHeight: 120, paddingTop: 16, paddingBottom: 16 },

  btnLocationPremium: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", height: 60, borderRadius: 16, marginBottom: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnLocationText: { color: "#000", fontSize: 16, fontWeight: "900", marginLeft: 8, letterSpacing: 0.5 },
  locationResultBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(0, 230, 118, 0.1)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  locationResultText: { color: "#00E676", fontSize: 14, fontWeight: 'bold', marginLeft: 6 },

  preferenceCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, marginBottom: 25, borderWidth: 1, borderColor: theme.colors.border }, 
  cardHeaderTitleSub: { color: "#FFF", fontSize: 13, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },

  chipsContainerCenter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }, 
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#121212", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 30, borderWidth: 1, borderColor: "#222" }, 
  chipTexto: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: '900' },

  subBox: { backgroundColor: "#0A0A0A", width: '100%', padding: 20, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: "#1A1A1A", alignItems: 'center' },
  subBoxTitle: { color: "#FFF", fontSize: 12, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', textAlign: 'center' },
  inputPremiumSmall: { backgroundColor: "#121212", borderRadius: 14, color: "#FFF", fontSize: 14, padding: 16, borderWidth: 1, borderColor: "#222", width: '100%', marginTop: 15, marginBottom: 10 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridItemWithIcon: { width: '48%', backgroundColor: "#121212", paddingVertical: 20, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: "#222" },
  gridItemText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  gridItemTextAtivo: { color: theme.colors.primary, fontWeight: '900' },
  gridItemDesc: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },

  neonAtivo: { 
    backgroundColor: 'rgba(255, 107, 0, 0.08)', 
    borderColor: theme.colors.primary,         
    shadowColor: theme.colors.primary,          
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,                              
  },
  
  galeriaScroll: { paddingVertical: 10, gap: 12 },
  galeriaItem: { width: 110, height: 110, borderRadius: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: theme.colors.borderLight },
  galeriaImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  btnRemoverFoto: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 14, padding: 5 },
  btnAddFoto: { width: 110, height: 110, borderRadius: 16, borderWidth: 2, borderColor: "rgba(255,107,0,0.3)", borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(255,107,0,0.05)" },
  btnAddFotoText: { color: theme.colors.primary, fontSize: 12, marginTop: 8, fontWeight: 'bold' },
  galeriaHint: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },

  priceContainer: { backgroundColor: "#121212", borderRadius: 16, padding: 24, borderWidth: 1.5, borderColor: "rgba(255, 107, 0, 0.3)", marginBottom: 10, alignItems: 'center' },
  priceValue: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: 38, marginBottom: 5, letterSpacing: -1 },
  
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 24 },

  btnSalvar: { backgroundColor: theme.colors.primary, width: '100%', height: 64, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  btnSalvarText: { color: "#000", fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});