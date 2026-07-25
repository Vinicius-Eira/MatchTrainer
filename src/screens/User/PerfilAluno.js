import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const OPCOES_MODALIDADE = [
  { id: "consultoria", titulo: "Consultoria no App", desc: "Treinos na palma da mão, suporte online e flexibilidade total.", icon: "phone-portrait-outline" },
  { id: "presencial", titulo: "Personal Presencial", desc: "Acompanhamento físico lado a lado durante a execução.", icon: "barbell-outline" },
  { id: "ambos", titulo: "Ainda não sei", desc: "Estou aberto a propostas dos melhores profissionais.", icon: "shuffle-outline" },
];

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", desc: "Perder gordura, secar e definir a musculatura.", icon: "flame-outline" },
  { id: "hipertrofia", titulo: "Hipertrofia", desc: "Foco total em ganho de massa muscular e volume.", icon: "barbell-outline" },
  { id: "saude", titulo: "Saúde e Qualidade", desc: "Melhorar postura, reabilitação e bem-estar geral.", icon: "heart-outline", hasSub: true },
  { id: "performance", titulo: "Performance", desc: "Evoluir no meu esporte ou superar limites atuais.", icon: "trophy-outline", hasSub: true },
  { id: "outro", titulo: "Outro Foco", desc: "Tenho uma meta específica e exclusiva em mente.", icon: "star-outline", hasSub: false },
];

const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante Total", desc: "Nunca treinei ou estou parado há muito tempo.", icon: "leaf-outline" },
  { id: "inconstante", titulo: "Inconstante", desc: "Começo e paro. Tenho dificuldade em manter a rotina.", icon: "pulse-outline" },
  { id: "intermediario", titulo: "Intermediário", desc: "Treino com certa regularidade, busco evolução real.", icon: "fitness-outline" },
  { id: "avancado", titulo: "Avançado", desc: "Treino intensamente e tenho domínio das execuções.", icon: "rocket-outline" },
];

const OPCOES_LIMITACAO = [
  { id: "gestante", titulo: "Gestante / Pós-parto", desc: "Preciso de um treino adaptado e 100% seguro.", icon: "woman-outline" },
  { id: "lesao", titulo: "Lesões ou Dores", desc: "Sinto desconforto articular, muscular ou ósseo.", icon: "bandage-outline", hasSub: true },
  { id: "clinica", titulo: "Condição Clínica", desc: "Lido com hipertensão, diabetes, asma, etc.", icon: "medkit-outline", hasSub: true },
  { id: "nenhuma", titulo: "Nenhuma Restrição", desc: "Estou 100% liberado(a) para qualquer intensidade.", icon: "checkmark-circle-outline" },
];

const OPCOES_PERFIL = [
  { id: "acolhedor", titulo: "O Acolhedor", desc: "Paciente, didático e foca na minha adaptação.", icon: "happy-outline" },
  { id: "motivador", titulo: "O Motivador", desc: "Intenso, cobrador e não me deixa desistir nunca.", icon: "megaphone-outline" },
  { id: "tecnico", titulo: "O Professor", desc: "Foca em biomecânica e explica o porquê de tudo.", icon: "school-outline" },
  { id: "estrategista", titulo: "O Estrategista", desc: "Foco absoluto em planilhas, metas e progressão.", icon: "stats-chart-outline" },
];

const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias por semana", desc: "Rotina apertada, mas quero dar o primeiro passo.", icon: "calendar-outline" },
  { id: "3-4", titulo: "3 a 4 dias por semana", desc: "Consigo manter uma constância saudável.", icon: "calendar-outline" },
  { id: "5-6", titulo: "5 a 6 dias por semana", desc: "Foco quase diário. O treino é prioridade.", icon: "flame-outline" },
  { id: "7", titulo: "Todos os dias", desc: "Não descanso, quero intensidade todos os dias.", icon: "flash-outline" },
];

const OPCOES_LOCAL = [
  { id: "academia", titulo: "Academias Comerciais", desc: "Redes grandes ou academias de bairro completas.", icon: "barbell-outline" },
  { id: "condominio", titulo: "Academia do Condomínio", desc: "Treino no prédio, com a estrutura disponível.", icon: "business-outline" },
  { id: "casa", titulo: "Em Casa / Domicílio", desc: "Treino com o peso do corpo ou acessórios próprios.", icon: "home-outline" },
  { id: "ar_livre", titulo: "Ao Ar Livre / Parques", desc: "Gosto de treinar em praças, praias ou quadras.", icon: "leaf-outline" },
];

const OPCOES_INVESTIMENTO = [
  { id: "base", titulo: "R$ 90 a 110 / mês", desc: "Custo-benefício ideal para iniciar com qualidade.", icon: "wallet-outline" },
  { id: "mid", titulo: "R$ 120 a 150 / mês", desc: "Profissionais especialistas e super bem avaliados.", icon: "star-outline" },
  { id: "premium", titulo: "A partir de R$ 160", desc: "Treinadores de Elite e acompanhamento VIP.", icon: "diamond-outline" }
];

const SUB_SAUDE = [
  { titulo: "Melhorar Postura", icon: "body-outline" },
  { titulo: "Dores nas Costas", icon: "bandage-outline" },
  { titulo: "Recomendação Médica", icon: "medkit-outline" },
  { titulo: "Reduzir Stress / Sono", icon: "moon-outline" },
  { titulo: "Terceira Idade", icon: "walk-outline" }
];
const SUB_ESPORTE = [
  { titulo: "Corrida / Maratona", icon: "walk-outline" },
  { titulo: "Artes Marciais", icon: "hand-left-outline" },
  { titulo: "Natação", icon: "water-outline" },
  { titulo: "Futebol / Quadra", icon: "football-outline" },
  { titulo: "Crossfit", icon: "barbell-outline" },
  { titulo: "Ciclismo", icon: "bicycle-outline" },
  { titulo: "Outro", icon: "star-outline" }
];
const SUB_LESAO = [
  { titulo: "Joelho", icon: "accessibility-outline" },
  { titulo: "Lombar / Coluna", icon: "body-outline" },
  { titulo: "Ombro", icon: "fitness-outline" },
  { titulo: "Cervical", icon: "person-outline" },
  { titulo: "Quadril", icon: "walk-outline" },
  { titulo: "Tornozelo", icon: "footsteps-outline" },
  { titulo: "Outra", icon: "add-circle-outline" }
];
const SUB_CLINICA = [
  { titulo: "Hipertensão", icon: "pulse-outline" },
  { titulo: "Diabetes", icon: "water-outline" },
  { titulo: "Asma", icon: "leaf-outline" },
  { titulo: "Cardiopatia", icon: "heart-half-outline" },
  { titulo: "Outra", icon: "add-circle-outline" }
];

export default function PerfilAluno({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [temPersonal, setTemPersonal] = useState(false); 
  
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [fotoUri, setFotoUri] = useState(null);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');

  const [modalidade, setModalidade] = useState(null);
  const [objetivo, setObjetivo] = useState(null);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = useState("");
  const [subObjetivo, setSubObjetivo] = useState([]);
  const [outroEsporteTexto, setOutroEsporteTexto] = useState("");
  const [historico, setHistorico] = useState(null);
  const [limitacao, setLimitacao] = useState(null);
  const [subLimitacao, setSubLimitacao] = useState([]); 
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState(""); 
  const [perfilPersonal, setPerfilPersonal] = useState(null);
  const [frequencia, setFrequencia] = useState(null);
  const [localTreino, setLocalTreino] = useState(null);
  const [investimento, setInvestimento] = useState(null);

  const [inputFocado, setInputFocado] = useState(null);

  useEffect(() => { carregarPerfil(); }, []);

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexaoAtiva } = await supabase.from('conexoes').select('id').eq('usuario_id', user.id).eq('status', 'aluno_ativo').single();
      if (conexaoAtiva) setTemPersonal(true);

      const { data, error } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setNome(data.nome || '');
        setTelefone(data.telefone || '');
        setCidade(data.cidade || '');
        if (data.bairro) setBairro(data.bairro);
        setLatitude(data.latitude || null);
        setLongitude(data.longitude || null);
        setFotoUri(data.foto_url);
        
        if (data.peso) setPeso(data.peso.toString().replace('.', ','));
        if (data.altura) setAltura(data.altura.toString().replace('.', ','));
        if (data.data_nascimento) {
          const parts = data.data_nascimento.split('-');
          if (parts.length === 3) setDataNascimento(`${parts[2]}/${parts[1]}/${parts[0]}`);
          else setDataNascimento(data.data_nascimento);
        }

        if (data.preferencias) {
          const p = data.preferencias;
          setModalidade(OPCOES_MODALIDADE.find(m => m.id === p.modalidade) || null);
          setObjetivo(OPCOES_OBJETIVO.find(o => o.id === p.objetivo) || null);
          setOutroObjetivoTexto(p.outroObjetivo || "");
          setSubObjetivo(p.sub_objetivo || []);
          setOutroEsporteTexto(p.outroEsporte || "");
          setHistorico(OPCOES_HISTORICO.find(h => h.id === p.historico) || null);
          setLimitacao(OPCOES_LIMITACAO.find(l => l.id === p.limitacao) || null);
          setSubLimitacao(p.sub_limitacao || []);
          setOutraLimitacaoTexto(p.detalhe_outra_limitacao || "");
          setPerfilPersonal(OPCOES_PERFIL.find(t => t.id === p.perfil_treinador) || null);
          setFrequencia(OPCOES_FREQUENCIA.find(f => f.id === p.frequencia) || null);
          setLocalTreino(OPCOES_LOCAL.find(l => l.id === p.local_treino) || null); 
          setInvestimento(OPCOES_INVESTIMENTO.find(i => i.id === p.investimento) || null);
        }
      }
    } catch (error) { console.log("Erro ao carregar perfil:", error); } 
    finally { setLoading(false); }
  };

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Atenção', 'Precisamos de acesso à galeria.');
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Atenção', 'Permita o acesso à localização.');
      
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) {
        setCidade(geocode[0].city || geocode[0].subregion || "");
        setBairro(geocode[0].district || geocode[0].name || "");
      }
    } catch (error) { Alert.alert("Aviso", "Falha ao sincronizar o GPS."); } 
    finally { setBuscandoLocal(false); }
  };

  const formatarWhatsApp = (texto) => {
    let v = texto.replace(/\D/g, '');
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(v.substring(0, 15));
  };

  const formatarPeso = (t) => {
    let v = t.replace(/[^0-9.,]/g, "").replace(",", "."); 
    setPeso(v);
  };
  
  const formatarAltura = (t) => {
    let v = t.replace(/[^0-9]/g, ""); 
    setAltura(v);
  };

  const handleLockedPress = () => {
    Alert.alert(
      "🔒 Edição Bloqueada",
      "Você possui uma consultoria ativa. Não é possível alterar suas preferências principais para não desconfigurar o planejamento feito pelo seu professor."
    );
  };

  const toggleMultiSelect = (item, state, setState, isLocked) => {
    if (isLocked) return handleLockedPress();
    
    if (state.includes(item)) {
      if (item === "Outra" || item === "Outro") {
        if(item === "Outro") setOutroEsporteTexto("");
        else setOutraLimitacaoTexto("");
      }
      setState(state.filter(i => i !== item));
    } else setState([...state, item]);
  };

  const renderPremiumList = (opcoes, stateObject, setStateObject, isLocked = false) => (
    <View style={[styles.listContainer, isLocked && { opacity: 0.6 }]}>
      {opcoes.map((opt) => {
        const ativo = stateObject?.id === opt.id;
        return (
          <TouchableOpacity 
            key={opt.id} 
            style={[styles.premiumOptionCard, ativo && styles.premiumOptionCardAtivo]} 
            onPress={() => isLocked ? handleLockedPress() : setStateObject(opt)} 
            activeOpacity={isLocked ? 1 : 0.8}
          >
            {ativo && (
              <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={18} />
            )}
            <View style={[styles.premiumIconBox, ativo && styles.premiumIconBoxAtivo]}>
              <Ionicons name={opt.icon} size={22} color={ativo ? theme.colors.backgroundPure : "#888"} />
            </View>
            <View style={styles.premiumTextContent}>
              <Text style={[styles.premiumOptionTitle, ativo && styles.premiumOptionTitleAtivo]}>{opt.titulo}</Text>
              {opt.desc && <Text style={styles.premiumOptionDesc}>{opt.desc}</Text>}
            </View>
            <View style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}>
              {ativo && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  );

  const renderChipsComIcone = (opcoes, stateArray, setStateArray, isLocked = false) => (
    <View style={[styles.chipsContainer, isLocked && { opacity: 0.5 }]}>
      {opcoes.map((opt) => {
        const isSelected = stateArray.includes(opt.titulo);
        return (
          <TouchableOpacity
            key={opt.titulo}
            style={[styles.chip, isSelected && styles.chipAtivo]}
            onPress={() => toggleMultiSelect(opt.titulo, stateArray, setStateArray, isLocked)}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={isSelected ? theme.colors.primary : "#888"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.chipTexto, isSelected && styles.chipTextoAtivo]}>
              {opt.titulo}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");
      
      let dataBanco = dataNascimento;
      if (dataNascimento && dataNascimento.length === 10) {
        const parts = dataNascimento.split('/');
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        dataBanco = null; 
      }

      let pesoNumerico = null;
      if (peso) {
        const pesoLimpo = peso.toString().replace(',', '.');
        pesoNumerico = isNaN(parseFloat(pesoLimpo)) ? null : parseFloat(pesoLimpo);
      }

      let alturaNumerica = null;
      if (altura) {
        const alturaLimpa = altura.toString().replace(',', '.');
        alturaNumerica = isNaN(parseFloat(alturaLimpa)) ? null : parseFloat(alturaLimpa);
      }

      const preferencias = {
        modalidade: modalidade?.id || null, 
        objetivo: objetivo?.id || null,
        outroObjetivo: objetivo?.id === "outro" ? outroObjetivoTexto.trim() : null,
        sub_objetivo: subObjetivo && subObjetivo.length > 0 ? subObjetivo : null,
        outroEsporte: subObjetivo && subObjetivo.includes("Outro") ? outroEsporteTexto.trim() : null,
        historico: historico?.id || null,
        limitacao: limitacao?.id || null,
        sub_limitacao: subLimitacao && subLimitacao.length > 0 ? subLimitacao : null,
        detalhe_outra_limitacao: subLimitacao && subLimitacao.includes("Outra") ? outraLimitacaoTexto.trim() : null,
        perfil_treinador: perfilPersonal?.id || null,
        frequencia: frequencia?.id || null,
        local_treino: localTreino?.id || null, 
        investimento: investimento?.id || null
      };

      const { error } = await supabase.from('usuarios').upsert({
        id: user.id, 
        email: user.email || '', 
        nome: nome ? nome.trim() : 'Aluno', 
        telefone: telefone ? telefone.trim() : '',
        cidade: cidade ? cidade.trim() : '', 
        bairro: bairro ? bairro.trim() : '', 
        latitude: latitude || null, 
        longitude: longitude || null,
        data_nascimento: dataBanco, 
        peso: pesoNumerico, 
        altura: alturaNumerica,
        foto_url: fotoUri || 'https://via.placeholder.com/150', 
        preferencias: preferencias
      }, { onConflict: 'id' });

      if (error) throw error;
      Alert.alert('Sucesso', 'Seu perfil foi atualizado com maestria!');
    } catch (error) { 
      Alert.alert('Erro ao Salvar', error.message || 'Verifique os dados informados.'); 
    } 
    finally { setSalvando(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEU PERFIL</Text>
        <View style={{ width: 44 }} /> 
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryHover]} style={styles.avatarRing}>
              <Image source={{ uri: fotoUri || 'https://via.placeholder.com/150' }} style={styles.avatarImage} />
            </LinearGradient>
            <View style={styles.cameraBadge}><Ionicons name="camera" size={16} color={theme.colors.backgroundPure} /></View>
          </TouchableOpacity>
          <Text style={styles.userNameDisplay}>{nome || "Seu Nome"}</Text>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconHeaderWrapper}><Ionicons name="person" size={16} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Identificação</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={[styles.inputContainer, inputFocado === 'nome' && styles.inputContainerFocused]}>
              <Ionicons name="person-circle-outline" size={20} color={inputFocado === 'nome' ? theme.colors.primary : "#666"} style={styles.inputIcon} />
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#666" placeholder="Como quer ser chamado?" onFocus={() => setInputFocado('nome')} onBlur={() => setInputFocado(null)} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Nascimento</Text>
              <View style={[styles.inputContainer, inputFocado === 'nasc' && styles.inputContainerFocused]}>
                <Ionicons name="calendar-outline" size={18} color={inputFocado === 'nasc' ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="number-pad" maxLength={10} value={dataNascimento} placeholder="DD/MM/AAAA" placeholderTextColor="#666"
                  onChangeText={(t) => {
                    let v = t.replace(/\D/g, '');
                    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '$1/$2');
                    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, '$1/$2/$3');
                    setDataNascimento(v);
                  }} 
                  onFocus={() => setInputFocado('nasc')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={[styles.inputContainer, inputFocado === 'whats' && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="whatsapp" size={18} color={inputFocado === 'whats' ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="number-pad" value={telefone} onChangeText={formatarWhatsApp} placeholder="(00) 00000" placeholderTextColor="#666" onFocus={() => setInputFocado('whats')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
          </View>

          <View style={styles.cardHeaderBoxMargin}>
            <View style={styles.iconHeaderWrapper}><Ionicons name="location" size={16} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Radar GPS</Text>
          </View>

          <TouchableOpacity style={styles.btnLocationPremium} onPress={buscarLocalizacao} disabled={buscandoLocal} activeOpacity={0.85}>
            {buscandoLocal ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : <><MaterialCommunityIcons name="radar" size={20} color={theme.colors.backgroundPure} /><Text style={styles.btnLocationText}>Sincronizar Localização</Text></>}
          </TouchableOpacity>
          <Text style={styles.hintText}>O Radar conecta você aos melhores personais da sua região.</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Cidade</Text>
              <View style={[styles.inputContainer, inputFocado === 'cidade' && styles.inputContainerFocused]}>
                <TextInput style={styles.inputLocation} value={cidade} onChangeText={setCidade} placeholder="Sua cidade" placeholderTextColor="#666" onFocus={() => setInputFocado('cidade')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Bairro</Text>
              <View style={[styles.inputContainer, inputFocado === 'bairro' && styles.inputContainerFocused]}>
                <TextInput style={styles.inputLocation} value={bairro} onChangeText={setBairro} placeholder="Seu bairro" placeholderTextColor="#666" onFocus={() => setInputFocado('bairro')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconHeaderWrapper}><Ionicons name="body" size={16} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Biometria Básica</Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Peso (kg)</Text>
              <View style={[styles.inputContainer, inputFocado === 'peso' && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="scale-bathroom" size={18} color={inputFocado === 'peso' ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={6} value={peso} onChangeText={formatarPeso} placeholder="Ex: 80,5" placeholderTextColor="#666" onFocus={() => setInputFocado('peso')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Altura (cm)</Text>
              <View style={[styles.inputContainer, inputFocado === 'altura' && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="human-male-height" size={18} color={inputFocado === 'altura' ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={3} value={altura} onChangeText={formatarAltura} placeholder="Ex: 180" placeholderTextColor="#666" onFocus={() => setInputFocado('altura')} onBlur={() => setInputFocado(null)} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDividerLine} />
          <View style={styles.sectionDividerBadge}>
            <MaterialCommunityIcons name="diamond-stone" size={16} color={theme.colors.primary} />
            <Text style={styles.sectionDividerText}>RAIO-X DO TREINO</Text>
          </View>
          <View style={styles.sectionDividerLine} />
        </View>
        
        {temPersonal ? (
          <View style={styles.statusBoxLocked}>
            <Ionicons name="lock-closed" size={20} color="#FF3B30" style={{marginRight: 10}} />
            <Text style={styles.statusTextLocked}>Algumas preferências estão blindadas porque você possui uma consultoria ativa. Isso mantém seu planejamento seguro.</Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="handshake" size={20} color={theme.colors.primary} style={{marginRight: 10}} />
            <Text style={styles.statusText}>Estas tags guiam nossa Inteligência Artificial para achar o seu Match perfeito.</Text>
          </View>
        )}

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Como você prefere treinar? {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_MODALIDADE, modalidade, setModalidade, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Objetivo Principal {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_OBJETIVO, objetivo, (v) => { setObjetivo(v); setSubObjetivo([]); }, temPersonal)}
          
          {objetivo?.id === "outro" && (
            <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
              <View pointerEvents={temPersonal ? "none" : "auto"}>
                <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Digite seu foco (Ex: Autodefesa)" placeholderTextColor="#666" value={outroObjetivoTexto} onChangeText={setOutroObjetivoTexto} editable={!temPersonal} />
              </View>
            </TouchableOpacity>
          )}
          {objetivo?.id === "saude" && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prioridade de Saúde:</Text>{renderChipsComIcone(SUB_SAUDE, subObjetivo, setSubObjetivo, temPersonal)}</View>
          )}
          {objetivo?.id === "performance" && (
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Qual esporte?</Text>
              {renderChipsComIcone(SUB_ESPORTE, subObjetivo, setSubObjetivo, temPersonal)}
              {subObjetivo.includes("Outro") && (
                <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
                  <View pointerEvents={temPersonal ? "none" : "auto"}>
                    <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Qual esporte?" placeholderTextColor="#666" value={outroEsporteTexto} onChangeText={setOutroEsporteTexto} editable={!temPersonal}/>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Histórico Físico {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_HISTORICO, historico, setHistorico, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Limitações ou Cuidados {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_LIMITACAO, limitacao, (v) => { setLimitacao(v); setSubLimitacao([]); setOutraLimitacaoTexto(""); }, temPersonal)}

          {limitacao?.id === "lesao" && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Foco da dor:</Text>{renderChipsComIcone(SUB_LESAO, subLimitacao, setSubLimitacao, temPersonal)}
            {subLimitacao.includes("Outra") && (
              <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
                <View pointerEvents={temPersonal ? "none" : "auto"}>
                  <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Descreva brevemente..." placeholderTextColor="#666" value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} editable={!temPersonal}/>
                </View>
              </TouchableOpacity>
            )}
            </View>
          )}
          {limitacao?.id === "clinica" && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Condição médica:</Text>{renderChipsComIcone(SUB_CLINICA, subLimitacao, setSubLimitacao, temPersonal)}
            {subLimitacao.includes("Outra") && (
              <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
                <View pointerEvents={temPersonal ? "none" : "auto"}>
                  <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Descreva a condição..." placeholderTextColor="#666" value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} editable={!temPersonal}/>
                </View>
              </TouchableOpacity>
            )}
            </View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Perfil de Professor Ideal {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_PERFIL, perfilPersonal, setPerfilPersonal, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Disponibilidade na Semana {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_FREQUENCIA, frequencia, setFrequencia, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Onde você prefere treinar? {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_LOCAL, localTreino, setLocalTreino, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Orçamento por Aula {temPersonal && "🔒"}</Text>
          {renderPremiumList(OPCOES_INVESTIMENTO, investimento, setInvestimento, temPersonal)}
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={salvando} activeOpacity={0.85}>
          <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
            {salvando ? <ActivityIndicator size="small" color="#000" /> : (
              <>
                <Text style={styles.btnSalvarText}>Salvar Perfil </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#000" },
  
  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.1, blurRadius: 80 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 100 },

  header: { 
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20, 
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', 
  },
  btnVoltar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: "#FFF", fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 60 }, 
  
  photoSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: 3, borderRadius: 65 },
  avatarImage: { width: 116, height: 116, borderRadius: 58, borderWidth: 4, borderColor: "#000", backgroundColor: "#111" },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: "#000" },
  userNameDisplay: { color: "#FFF", fontSize: 22, fontFamily: theme.fonts.title, marginTop: 12, letterSpacing: 0.5 },

  cardGeral: { backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#222", borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardHeaderBoxMargin: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 15 },
  iconHeaderWrapper: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: 17, fontFamily: theme.fonts.title, letterSpacing: 0.3 },

  formGroup: { marginBottom: 18 },
  row: { flexDirection: 'row' },
  label: { color: "#888", fontSize: 11, fontWeight: '800', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#121212", borderWidth: 1, borderColor: "#222", borderRadius: 16, overflow: 'hidden', height: 60 },
  inputContainerFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginLeft: 16, marginRight: 10 },
  input: { flex: 1, color: "#FFF", fontSize: 15, paddingRight: 16, fontFamily: theme.fonts.body },
  inputLocation: { flex: 1, color: "#FFF", fontSize: 15, paddingHorizontal: 16, fontFamily: theme.fonts.body },
  inputHalf: { flex: 1, color: "#FFF", fontSize: 15, paddingRight: 10, fontFamily: theme.fonts.body },
  suffix: { color: "#666", fontSize: 14, fontWeight: 'bold', paddingRight: 16 },

  btnLocationPremium: { backgroundColor: "rgba(255, 107, 0, 0.15)", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  btnLocationText: { color: theme.colors.primary, fontSize: 14, fontWeight: "900", marginLeft: 8 },
  hintText: { color: "#666", fontSize: 12, textAlign: 'center', marginBottom: 20 },

  sectionDividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  sectionDividerLine: { flex: 1, height: 1, backgroundColor: "#222" },
  sectionDividerBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#222", marginHorizontal: 10 },
  sectionDividerText: { color: theme.colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginLeft: 6 },

  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(255, 107, 0, 0.08)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: 20 },
  statusText: { color: "#CCC", fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 20 },

  statusBoxLocked: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 59, 48, 0.08)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.2)', marginBottom: 20 },
  statusTextLocked: { color: "#FF3B30", fontSize: 12, fontWeight: 'bold', flex: 1, lineHeight: 18 },

  preferenceCard: { backgroundColor: "#0A0A0A", borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#222" }, 
  cardHeaderTitleSub: { color: "#FFF", fontSize: 14, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  listContainer: { flexDirection: 'column', gap: 12 },
  premiumOptionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  premiumOptionCardAtivo: { borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  premiumIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginRight: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  premiumIconBoxAtivo: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  premiumTextContent: { flex: 1, paddingRight: 10 },
  premiumOptionTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.2 },
  premiumOptionTitleAtivo: { color: theme.colors.primary },
  premiumOptionDesc: { color: "#888", fontSize: 13, lineHeight: 18 },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  radioCircleAtivo: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: 'center' },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#333" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5 },
  chipTexto: { color: "#888", fontSize: 12, fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },

  subBox: { backgroundColor: "#111", width: '100%', padding: 18, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: "#222", alignItems: 'center' },
  subBoxTitle: { color: "#FFF", fontSize: 13, fontWeight: 'bold', marginBottom: 14, textTransform: 'uppercase', textAlign: 'center' },
  inputPremiumSmall: { backgroundColor: "#1A1A1A", borderRadius: 14, color: "#FFF", fontSize: 14, padding: 16, borderWidth: 1, borderColor: "#333", width: '100%', marginTop: 15, marginBottom: 5 },

  btnSalvar: { borderRadius: 20, marginTop: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: 'row', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  btnSalvarText: { color: "#000", fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }
});