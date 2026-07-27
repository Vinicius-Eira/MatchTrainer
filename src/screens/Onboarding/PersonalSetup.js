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
  View,
  StatusBar,
  Dimensions
} from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

const OPCOES_GENERO = [
  { id: "Homem", titulo: "Homem", icon: "man-outline" },
  { id: "Mulher", titulo: "Mulher", icon: "woman-outline" }
];

const OPCOES_TURNO = [
  { id: "Manhã", titulo: "Manhã", desc: "06h às 12h", icon: "sunny-outline" },
  { id: "Tarde", titulo: "Tarde", desc: "12h às 18h", icon: "partly-sunny-outline" },
  { id: "Noite", titulo: "Noite", desc: "18h às 22h", icon: "moon-outline" }
];

const OPCOES_AGENDA = [
  { id: "Disponível", titulo: "Agenda Livre", desc: "Recebendo alunos", icon: "calendar-outline" },
  { id: "Poucas Vagas", titulo: "Poucas Vagas", desc: "Alta procura", icon: "flame-outline" },
  { id: "Quase Lotada", titulo: "Quase Lotada", desc: "Vagas restritas", icon: "lock-closed-outline" }
];

const OPCOES_SERVICOS = [
  { id: "Consultoria", titulo: "Consultoria no App", icon: "phone-portrait-outline", desc: "Planilhas e suporte" },
  { id: "Presencial", titulo: "Personal Presencial", icon: "barbell-outline", desc: "1 a 1" },
];

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
  
  const [genero, setGenero] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [statusAgenda, setStatusAgenda] = useState("Disponível");

  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

  const [servicosOferecidos, setServicosOferecidos] = useState(["Consultoria"]); 
  const [servicosBloqueados, setServicosBloqueados] = useState([]); // 🚀 Trava de exclusão
  
  const [precoConsultoria, setPrecoConsultoria] = useState(150);
  const [precoPresencial, setPrecoPresencial] = useState(100);

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

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => { carregarDadosExistentes(); }, []);

  const carregarDadosExistentes = async () => {
    setLoadingDados(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.nome) setNome(user.user_metadata.nome);
      if (user.user_metadata?.cref) setCref(user.user_metadata.cref.toUpperCase());

      const { data: planosAtivos } = await supabase
        .from("planos")
        .select("servicos_inclusos")
        .eq("personal_id", user.id)
        .eq("status", "ativo");

      if (planosAtivos) {
        let bloqueados = [];
        planosAtivos.forEach(plano => {
          if (plano.servicos_inclusos) {
            plano.servicos_inclusos.forEach(servico => {
              if (!bloqueados.includes(servico)) bloqueados.push(servico);
            });
          }
        });
        setServicosBloqueados(bloqueados); 
      }

      const { data, error } = await supabase.from("personals").select("*").eq("id", user.id).single();

      if (data) {
        if (data.ativo) setIsEditing(true);
        if (data.cref) setCref(data.cref.toUpperCase());
        if (data.nome) setNome(data.nome);
        if (data.descricao) setBio(data.descricao);
        
        if (data.telefone) {
          let v = data.telefone.replace(/\D/g, '');
          if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
          if (v.length > 7) v = v.replace(/(\d{5})(\d)/, '$1-$2');
          setTelefone(v.substring(0, 15));
        }

        if (data.cidade) setCidade(data.cidade);
        if (data.bairro) setBairro(data.bairro);
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        
        if (data.genero) setGenero(data.genero);
        if (data.turnos_disponiveis) setTurnos(data.turnos_disponiveis);
        if (data.status_agenda) setStatusAgenda(data.status_agenda);
        
        if (data.servicos_oferecidos && data.servicos_oferecidos.length > 0) {
          setServicosOferecidos(data.servicos_oferecidos);
        } else if (data.modalidades) {
          setServicosOferecidos(data.modalidades);
        }

        if (data.preco_consultoria) setPrecoConsultoria(Number(data.preco_consultoria));
        if (data.preco_presencial) setPrecoPresencial(Number(data.preco_presencial));
        if (!data.preco_consultoria && data.preco_medio) setPrecoConsultoria(Number(data.preco_medio));

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
    } catch (error) {
      console.log("Erro ao carregar dados do personal: ", error);
    } finally { setLoadingDados(false); }
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

  const formatarNome = (texto) => {
    return texto
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  const handleToggleServicos = (servicoId) => {
    if (servicosOferecidos.includes(servicoId)) {
      if (servicosBloqueados.includes(servicoId)) {
        Alert.alert(
          "Ação Bloqueada 🔒", 
          `Você possui alunos ativos utilizando a ${servicoId}. Conclua ou altere os planos deles antes de remover este serviço da sua vitrine.`
        );
        return;
      }
      setServicosOferecidos(servicosOferecidos.filter(s => s !== servicoId));
    } else {
      setServicosOferecidos([...servicosOferecidos, servicoId]);
    }
  };

  const handleSalvar = async () => {
    if (!cref?.trim() || !telefone?.trim() || !cidade?.trim() || !nome?.trim()) {
      return Alert.alert("Atenção", "Preencha os dados obrigatórios (*). A localização também é obrigatória.");
    }
    if (!genero) return Alert.alert("Atenção", "Selecione seu gênero na seção de identificação.");
    if (turnos.length === 0) return Alert.alert("Atenção", "Selecione pelo menos um turno de atendimento na sua agenda.");
    
    if (servicosOferecidos.length === 0) {
      return Alert.alert("Atenção", "Selecione pelo menos um Serviço que você oferece.");
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
        id: user.id, 
        email: user.email, 
        nome: nome.trim(), 
        cref: cref.trim().toUpperCase(),
        telefone: telefone.trim(), 
        cidade: cidade.trim(), 
        bairro: bairro.trim(),
        latitude: latitude, 
        longitude: longitude, 
        tempo_experiencia: experiencia,
        
        genero: genero,
        turnos_disponiveis: turnos,
        status_agenda: statusAgenda,
        
        servicos_oferecidos: servicosOferecidos,
        
        preco_consultoria: servicosOferecidos.includes("Consultoria") ? parseInt(precoConsultoria) : null,
        preco_presencial: servicosOferecidos.includes("Presencial") ? parseInt(precoPresencial) : null,
        preco_medio: servicosOferecidos.includes("Consultoria") ? parseInt(precoConsultoria) : parseInt(precoPresencial),
        
        descricao: bio?.trim() || "",
        foto_url: fotoUri, 
        instagram: instagram.trim(), 
        tiktok: tiktok.trim(), 
        galeria_fotos: galeria,
        especialidades: especialidadesEstruturadas, 
        ativo: true,
      }, { onConflict: 'id' });

      if (error) throw error;
      Alert.alert("Sucesso!", "Seu perfil está online e atualizado para o Match!", [
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
            style={[styles.chip, ativo && styles.chipAtivo]} 
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
            style={[styles.gridItemWithIcon, ativo && styles.gridItemAtivo]} 
            onPress={() => isSingle ? setStateArray(opt.id) : toggleArrayItem(opt.id, stateArray, setStateArray)} 
            activeOpacity={0.8}
          >
            {ativo && (
              <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={20} />
            )}
            <Ionicons name={opt.icon} size={28} color={ativo ? theme.colors.primary : "#666"} style={{marginBottom: 8}} />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && {color: "#AAA"}]}>{opt.desc}</Text>}
          </TouchableOpacity>
        )
      })}
    </View>
  );

  if (loadingDados) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />
      
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.navigate("PersonalDashboard")} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "EDITAR PERFIL" : "CONFIGURAR PERFIL"}</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.mainTitle}>Personalize sua <Text style={styles.titleHighlight}>Vitrine.</Text></Text>
          <Text style={styles.subTitle}>Estes dados alimentam a IA do app para conectar você aos alunos ideais.</Text>
        </View>

        <View style={styles.photoSection}>
          <TouchableOpacity onPress={selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#444" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="id-card" size={18} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Identificação Profissional</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Nome Público *</Text>
            <View style={[styles.inputBox, inputFocado === "nome" && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="person" size={16} color={theme.colors.primary} />
              </View>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Ex: Personal João Silva" 
                placeholderTextColor="#666" 
                value={nome} 
                onChangeText={(texto) => setNome(formatarNome(texto))} 
                onFocus={() => setInputFocado("nome")} 
                onBlur={() => setInputFocado(null)} 
                keyboardAppearance="dark" 
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Seu Gênero *</Text>
          <View style={{marginBottom: 20}}>
            {renderNeonGrid(OPCOES_GENERO, genero, setGenero, true)}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>CREF Profissional *</Text>
            <View style={[
              styles.inputBox, 
              { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" }, 
              inputFocado === "cref" && styles.inputBoxFocused
            ]}>
              <View style={[styles.inputIconWrapper, { backgroundColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name="card-account-details" size={16} color="#000" />
              </View>
              <TextInput 
                style={[styles.inputPremium, { color: theme.colors.primary, fontWeight: 'bold' }]} 
                placeholder="000000-G/SP" 
                placeholderTextColor="rgba(255, 107, 0, 0.4)" 
                value={cref} 
                onChangeText={(texto) => setCref(texto.toUpperCase())} 
                onFocus={() => setInputFocado("cref")} 
                onBlur={() => setInputFocado(null)} 
                keyboardAppearance="dark" 
              />
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
            </View>
            <Text style={{color: '#666', fontSize: 11, marginTop: 6, marginLeft: 4}}>
              Registro obrigatório para validação do perfil na plataforma.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>WhatsApp para Contato *</Text>
            <View style={[styles.inputBox, inputFocado === "wpp" && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrapper}>
                <MaterialCommunityIcons name="whatsapp" size={16} color={theme.colors.primary} />
              </View>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="(00) 00000-0000" 
                placeholderTextColor="#666" 
                keyboardType="phone-pad" 
                value={telefone} 
                onChangeText={formatarWhatsApp} 
                onFocus={() => setInputFocado("wpp")} 
                onBlur={() => setInputFocado(null)} 
                keyboardAppearance="dark" 
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Biografia Profissional</Text>
            <View style={[styles.inputBoxArea, inputFocado === "bio" && styles.inputBoxFocused]}>
              <TextInput style={styles.textAreaPremium} placeholder="Descreva sua metodologia, especialidades e conquistas de forma atrativa..." placeholderTextColor="#666" multiline maxLength={400} value={bio} onChangeText={setBio} textAlignVertical="top" onFocus={() => setInputFocado("bio")} onBlur={() => setInputFocado(null)} keyboardAppearance="dark" />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
        </View>
        
        <View style={styles.gridContainer}>
          {OPCOES_SERVICOS.map((opt) => {
            const ativo = servicosOferecidos.includes(opt.id);
            return (
              <TouchableOpacity 
                key={opt.id} 
                style={[styles.gridItemWithIcon, ativo && styles.gridItemAtivo]} 
                onPress={() => handleToggleServicos(opt.id)} 
                activeOpacity={0.8}
              >
                {ativo && (
                  <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={20} />
                )}
                <Ionicons name={opt.icon} size={28} color={ativo ? theme.colors.primary : "#666"} style={{marginBottom: 8}} />
                <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
                {opt.desc && <Text style={[styles.gridItemDesc, ativo && {color: "#AAA"}]}>{opt.desc}</Text>}
              </TouchableOpacity>
            )
          })}
        </View>

        {servicosOferecidos.includes("Consultoria") && (
          <View style={styles.priceContainer}>
            <Text style={styles.inputLabel}>Preço Médio - Consultoria Mensal</Text>
            <Text style={styles.priceValue}>R$ {precoConsultoria}</Text>
            <Slider 
              style={styles.slider} minimumValue={50} maximumValue={600} step={10} 
              minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" 
              thumbTintColor={theme.colors.primary} value={precoConsultoria} onValueChange={setPrecoConsultoria} 
            />
          </View>
        )}

        {servicosOferecidos.includes("Presencial") && (
          <View style={styles.priceContainer}>
            <Text style={styles.inputLabel}>Preço Médio - Presencial (Aula/Mês)</Text>
            <Text style={styles.priceValue}>R$ {precoPresencial}</Text>
            <Slider 
              style={styles.slider} minimumValue={50} maximumValue={1500} step={10} 
              minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" 
              thumbTintColor={theme.colors.primary} value={precoPresencial} onValueChange={setPrecoPresencial} 
            />
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Área de Atendimento</Text>
        </View>
        
        <TouchableOpacity style={styles.btnGpsRadar} onPress={obterLocalizacaoAtual} disabled={buscandoLocalizacao} activeOpacity={0.85}>
          {buscandoLocalizacao ? <ActivityIndicator size="small" color="#000" /> : (
            <>
              <MaterialCommunityIcons name="radar" size={20} color="#000" />
              <Text style={styles.btnGpsRadarText}>Sincronizar Radar GPS</Text>
            </>
          )}
        </TouchableOpacity>
        
        {(cidade || bairro) ? (
          <View style={styles.locationResultBox}>
            <Ionicons name="location" size={18} color="#00E676" />
            <Text style={styles.locationResultText}>{cidade}{bairro ? `, ${bairro}` : ''}</Text>
          </View>
        ) : null}

        <View style={[styles.sectionHeader, { marginTop: 35 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Sua Agenda e Turnos</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Turnos Disponíveis (Match)</Text>
          <Text style={{color: '#888', fontSize: 13, marginBottom: 15}}>Em quais períodos você tem disponibilidade para encaixar novos alunos?</Text>
          {renderNeonGrid(OPCOES_TURNO, turnos, setTurnos)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Status da sua Agenda</Text>
          <Text style={{color: '#888', fontSize: 13, marginBottom: 15}}>Isso gera um gatilho de urgência para o aluno fechar o contrato mais rápido.</Text>
          {renderNeonGrid(OPCOES_AGENDA, statusAgenda, setStatusAgenda, true)}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 35 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Motor de Match (A IA)</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Focos Principais de Treino</Text>
          {renderNeonGrid(OPCOES_OBJETIVO, objetivosAtendidos, setObjetivosAtendidos)}
          
          {objetivosAtendidos.includes("outro") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite sua especialidade..." placeholderTextColor="#666" value={outroObjetivoTexto} onChangeText={setOutroObjetivoTexto} keyboardAppearance="dark" />
          )}
          {objetivosAtendidos.includes("saude") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Público de Saúde:</Text>{renderNeonChips(SUB_SAUDE, subsAtendidos, setSubsAtendidos)}</View>
          )}
          {objetivosAtendidos.includes("performance") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prepara para:</Text>{renderNeonChips(SUB_ESPORTE, subsAtendidos, setSubsAtendidos)}</View>
          )}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Atende Restrições?</Text>
          {renderNeonGrid(OPCOES_LIMITACAO, limitacoesAtendidas, setLimitacoesAtendidas)}

          {limitacoesAtendidas.includes("outra") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite a necessidade..." placeholderTextColor="#666" value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} keyboardAppearance="dark" />
          )}
          {limitacoesAtendidas.includes("lesao") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Reabilitação focada em:</Text>{renderNeonChips(SUB_LESAO, subsAtendidos, setSubsAtendidos)}</View>
          )}
          {limitacoesAtendidas.includes("clinica") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Controle de:</Text>{renderNeonChips(SUB_CLINICA, subsAtendidos, setSubsAtendidos)}</View>
          )}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Onde realiza os treinos?</Text>
          {renderNeonGrid(OPCOES_LOCAL, locaisAtendidos, setLocaisAtendidos)}
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Seu Estilo de Aula</Text>
          {renderNeonGrid(OPCOES_PERFIL, perfilTreinador, setPerfilTreinador, true)}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Estratégia e Autoridade</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Tempo de Experiência</Text>
          {renderNeonChips(OPCOES_EXPERIENCIA, experiencia, setExperiencia, true)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 30}]}>Público que mais atende</Text>
          {renderNeonChips(OPCOES_PUBLICO, publicoAtendido, setPublicoAtendido)}

          <Text style={[styles.cardHeaderTitleSub, {marginTop: 35}]}>Diferenciais Competitivos</Text>
          <View style={[styles.inputBoxArea, inputFocado === "diferenciais" && styles.inputBoxFocused]}>
            <TextInput 
              style={styles.textAreaPremium} placeholder="Ex: Avaliação postural inclusa..." placeholderTextColor="#666" 
              multiline maxLength={300} value={diferenciais} onChangeText={setDiferenciais} textAlignVertical="top" 
              onFocus={() => setInputFocado("diferenciais")} onBlur={() => setInputFocado(null)} keyboardAppearance="dark"
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

        <View style={[styles.sectionHeader, { marginTop: 15 }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Redes Sociais</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Instagram (Sem o @)</Text>
          <View style={[styles.inputBox, inputFocado === "insta" && styles.inputBoxFocused]}>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="logo-instagram" size={16} color={theme.colors.primary} />
            </View>
            <TextInput style={styles.inputPremium} placeholder="seu_usuario" placeholderTextColor="#666" autoCapitalize="none" value={instagram} onChangeText={setInstagram} onFocus={() => setInputFocado("insta")} onBlur={() => setInputFocado(null)} keyboardAppearance="dark" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>TikTok (Sem o @)</Text>
          <View style={[styles.inputBox, inputFocado === "tiktok" && styles.inputBoxFocused]}>
            <View style={styles.inputIconWrapper}>
              <FontAwesome5 name="tiktok" size={14} color={theme.colors.primary} />
            </View>
            <TextInput style={styles.inputPremium} placeholder="seu_usuario" placeholderTextColor="#666" autoCapitalize="none" value={tiktok} onChangeText={setTiktok} onFocus={() => setInputFocado("tiktok")} onBlur={() => setInputFocado(null)} keyboardAppearance="dark" />
          </View>
        </View>

      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <TouchableOpacity style={styles.btnSalvarWrapper} onPress={handleSalvar} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnSalvar}>
            {loading ? <ActivityIndicator size="small" color="#000" /> : (
              <>
                <Ionicons name="checkmark-done" size={22} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.btnSalvarText}>SALVAR PERFIL</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", position: "relative" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#000" },
  
  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: theme.colors.primary, opacity: 0.15, blurRadius: 60 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.1, blurRadius: 80 },

  headerAbsolute: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: "#FFF", fontSize: 13, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 130 : 110, paddingBottom: 140 }, 
  
  headerTextContainer: { marginBottom: 30 },
  mainTitle: { color: "#FFF", fontSize: 32, fontFamily: theme.fonts.title, marginBottom: 8, letterSpacing: -0.5 },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#AAA", fontSize: 15, lineHeight: 24 },

  photoSection: { alignItems: 'center', marginBottom: 35 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#121212", borderWidth: 2, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: -5, right: -5, backgroundColor: theme.colors.primary, width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000" },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionAccent: { width: 4, height: 18, backgroundColor: theme.colors.primary, borderRadius: 2, marginRight: 8 },
  sectionTitle: { color: "#FFF", fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  formGroup: { marginBottom: 20 },
  row: { flexDirection: "row" },
  inputLabel: { color: "#888", fontSize: 12, fontWeight: "900", textTransform: "uppercase", marginBottom: 10, marginLeft: 5, letterSpacing: 0.5 },
  
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: 18, borderWidth: 1, borderColor: "#222", paddingHorizontal: 12, height: 60 },
  inputBoxArea: { backgroundColor: "#0A0A0A", borderRadius: 18, borderWidth: 1, borderColor: "#222", paddingHorizontal: 16 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIconWrapper: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  inputPremium: { flex: 1, color: "#FFF", fontSize: 16, fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent", outlineStyle: "none" },
  textAreaPremium: { minHeight: 120, paddingTop: 16, paddingBottom: 16, color: "#FFF", fontSize: 15, fontFamily: theme.fonts.body, outlineStyle: "none" },

  btnGpsRadar: { flexDirection: "row", backgroundColor: theme.colors.primary, height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnGpsRadarText: { color: "#000", fontSize: 16, fontWeight: "900", marginLeft: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  locationResultBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(0, 230, 118, 0.1)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  locationResultText: { color: "#00E676", fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

  cardGeral: { backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#222", borderRadius: 24, padding: 20, marginBottom: 25 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  cardHeaderTitleSub: { color: "#FFF", fontSize: 14, fontWeight: '900', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

  chipsContainerCenter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, 
  chip: { backgroundColor: "#121212", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#333" }, 
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary },
  chipTexto: { color: "#888", fontSize: 13, fontWeight: '700' },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: '900' },

  subBox: { backgroundColor: "#111", width: '100%', padding: 20, borderRadius: 20, marginTop: 15, borderWidth: 1, borderColor: "#222" },
  subBoxTitle: { color: "#FFF", fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  inputPremiumSmall: { backgroundColor: "#121212", borderRadius: 16, color: "#FFF", fontSize: 15, padding: 16, borderWidth: 1, borderColor: "#333", width: '100%', marginTop: 15, marginBottom: 5, outlineStyle: "none" },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridItemWithIcon: { width: '48%', backgroundColor: "#121212", paddingVertical: 20, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  gridItemAtivo: { borderColor: theme.colors.primary },
  gridItemText: { color: "#888", fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  gridItemTextAtivo: { color: "#FFF", fontWeight: '900' },
  gridItemDesc: { color: "#666", fontSize: 11, textAlign: 'center', marginTop: 4 },

  priceContainer: { backgroundColor: "#111", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", marginTop: 15, alignItems: 'center' },
  priceValue: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: 36, marginBottom: 10, letterSpacing: -1 },
  slider: { width: "100%", height: 40 },
  
  galeriaScroll: { paddingVertical: 10, gap: 12 },
  galeriaItem: { width: 110, height: 110, borderRadius: 18, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: "#333" },
  galeriaImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  btnRemoverFoto: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 14, padding: 5 },
  btnAddFoto: { width: 110, height: 110, borderRadius: 18, borderWidth: 2, borderColor: "rgba(255,107,0,0.3)", borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: "rgba(255,107,0,0.05)" },
  btnAddFotoText: { color: theme.colors.primary, fontSize: 12, marginTop: 8, fontWeight: 'bold' },
  galeriaHint: { color: "#666", fontSize: 12, marginTop: 10, textAlign: 'center' },

  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  btnSalvarWrapper: { borderRadius: 20, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  btnSalvar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 64, borderRadius: 20 },
  btnSalvarText: { color: "#000", fontSize: 16, fontWeight: '900', letterSpacing: 0.5 }
});