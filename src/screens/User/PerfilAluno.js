import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", icon: "flame-outline" },
  { id: "hipertrofia", titulo: "Hipertrofia", icon: "barbell-outline" },
  { id: "saude", titulo: "Saúde e Qualidade", icon: "heart-outline", hasSub: true },
  { id: "performance", titulo: "Performance", icon: "trophy-outline", hasSub: true },
  { id: "outro", titulo: "Outro Foco", icon: "star-outline", hasSub: false },
];

const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante Total", desc: "Nunca treinou ou está parado há muito tempo.", icon: "leaf-outline" },
  { id: "inconstante", titulo: "Inconstante", desc: "Começa e para, tem dificuldade em manter a rotina.", icon: "pulse-outline" },
  { id: "intermediario", titulo: "Intermediário", desc: "Treina com certa regularidade, busca evolução.", icon: "fitness-outline" },
  { id: "avancado", titulo: "Avançado", desc: "Treina intensamente e tem domínio dos exercícios.", icon: "rocket-outline" },
];

const OPCOES_LIMITACAO = [
  { id: "gestante", titulo: "Gestante / Pós", icon: "woman-outline" },
  { id: "lesao", titulo: "Lesões ou Dores", icon: "bandage-outline", hasSub: true },
  { id: "clinica", titulo: "Condição Clínica", icon: "medkit-outline", hasSub: true },
  { id: "nenhuma", titulo: "Nenhuma Restrição", icon: "checkmark-circle-outline" },
];

const OPCOES_PERFIL = [
  { id: "acolhedor", titulo: "O Acolhedor", desc: "Paciente e didático", icon: "happy-outline" },
  { id: "motivador", titulo: "O Motivador", desc: "Intenso e cobrador", icon: "megaphone-outline" },
  { id: "tecnico", titulo: "O Professor", desc: "Foco na biomecânica", icon: "school-outline" },
  { id: "estrategista", titulo: "O Estrategista", desc: "Foco em planilhas", icon: "stats-chart-outline" },
];

const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias", icon: "calendar-outline" },
  { id: "3-4", titulo: "3 a 4 dias", icon: "calendar-outline" },
  { id: "5-6", titulo: "5 a 6 dias", icon: "flame-outline" },
  { id: "7", titulo: "Todos os dias", icon: "flash-outline" },
];

const OPCOES_LOCAL = [
  { id: "academia", titulo: "Academias Comerciais", icon: "barbell-outline" },
  { id: "condominio", titulo: "Academia do Condomínio", icon: "business-outline" },
  { id: "casa", titulo: "Em Casa / Domicílio", icon: "home-outline" },
  { id: "ar_livre", titulo: "Ao Ar Livre / Parques", icon: "leaf-outline" },
];

const OPCOES_INVESTIMENTO = [
  { id: "base", titulo: "R$ 90 a 110 / aula", icon: "wallet-outline" },
  { id: "mid", titulo: "R$ 120 a 150 / aula", icon: "star-outline" },
  { id: "premium", titulo: "A partir de R$ 160", icon: "diamond-outline" },
  { id: "pacote", titulo: "Pacote Mensal", icon: "briefcase-outline" },
];

// --- SUB-OPÇÕES COM ÍCONES ---
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

  const handleLockedPress = () => {
    Alert.alert(
      "🔒 Edição Bloqueada",
      "Você possui uma consultoria ativa. Não é possível alterar suas preferências e objetivos para não desconfigurar o planejamento feito pelo seu professor."
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

  const renderNeonGrid = (opcoes, stateObject, setStateObject, isLocked = false) => (
    <View style={[styles.gridContainer, isLocked && { opacity: 0.5 }]}>
      {opcoes.map((opt) => {
        const ativo = stateObject?.id === opt.id;
        return (
          <TouchableOpacity 
            key={opt.id} 
            style={[styles.gridItemWithIcon, ativo && styles.neonAtivo]} 
            onPress={() => isLocked ? handleLockedPress() : setStateObject(opt)} 
            activeOpacity={isLocked ? 1 : 0.8}
          >
            <Ionicons name={opt.icon} size={28} color={ativo ? theme.colors.primary : theme.colors.textMuted} style={{marginBottom: 8}} />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo, {textAlign: 'center'}]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && {color: theme.colors.primary}]}>{opt.desc}</Text>}
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
            style={[styles.chip, isSelected && styles.neonAtivo]}
            onPress={() => toggleMultiSelect(opt.titulo, stateArray, setStateArray, isLocked)}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={isSelected ? theme.colors.primary : theme.colors.textMuted}
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
      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
    } catch (error) { 
      Alert.alert('Erro ao Salvar', error.message || 'Verifique os dados informados.'); 
    } 
    finally { setSalvando(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
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
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="person-outline" size={18} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Identificação e Radar</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-circle" size={22} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor={theme.colors.textMuted} placeholder="Como quer ser chamado?" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Nascimento</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="number-pad" maxLength={10} value={dataNascimento} placeholder="DD/MM/AAAA" placeholderTextColor={theme.colors.textMuted}
                  onChangeText={(t) => {
                    let v = t.replace(/\D/g, '');
                    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '$1/$2');
                    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, '$1/$2/$3');
                    setDataNascimento(v);
                  }} />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="whatsapp" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="number-pad" value={telefone} onChangeText={formatarWhatsApp} placeholder="(00) 00000" placeholderTextColor={theme.colors.textMuted} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.btnLocationPremium} onPress={buscarLocalizacao} disabled={buscandoLocal} activeOpacity={0.85}>
            {buscandoLocal ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : <><MaterialCommunityIcons name="radar" size={22} color={theme.colors.backgroundPure} /><Text style={styles.btnLocationText}>Sincronizar Radar GPS</Text></>}
          </TouchableOpacity>
          <Text style={{color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 15, marginTop: -5}}>Para encontrarmos professores próximos a você.</Text>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Cidade</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputLocation} value={cidade} onChangeText={setCidade} placeholder="Sua cidade" placeholderTextColor={theme.colors.textMuted} />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Bairro</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.inputLocation} value={bairro} onChangeText={setBairro} placeholder="Seu bairro" placeholderTextColor={theme.colors.textMuted} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="body-outline" size={18} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Biometria Atual</Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Peso</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="scale-bathroom" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={5} value={peso} onChangeText={(t) => setPeso(t.replace(/[^0-9.,]/g, ''))} placeholder="Ex: 80,5" placeholderTextColor={theme.colors.textMuted} />
                <Text style={styles.suffix}>kg</Text>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Altura</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="human-male-height" size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={4} value={altura} onChangeText={(t) => setAltura(t.replace(/[^0-9]/g, ''))} placeholder="Ex: 1,80" placeholderTextColor={theme.colors.textMuted} />
                <Text style={styles.suffix}>m</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrapper}><MaterialCommunityIcons name="handshake-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Raio-X do Treino</Text>
        </View>
        
        {temPersonal ? (
          <View style={styles.statusBoxLocked}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.danger} style={{marginRight: 8}} />
            <Text style={styles.statusTextLocked}>Algumas opções estão bloqueadas durante o seu treinamento ativo para manter o alinhamento com seu professor.</Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="handshake" size={20} color={theme.colors.primary} style={{marginRight: 8}} />
            <Text style={styles.statusText}>Estas tags formam o seu Match perfeito.</Text>
          </View>
        )}

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Objetivo Principal {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_OBJETIVO, objetivo, (v) => { setObjetivo(v); setSubObjetivo([]); }, temPersonal)}
          
          {objetivo?.id === "outro" && (
            <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
              <View pointerEvents={temPersonal ? "none" : "auto"}>
                <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Digite seu foco (Ex: Autodefesa)" placeholderTextColor={theme.colors.textMuted} value={outroObjetivoTexto} onChangeText={setOutroObjetivoTexto} editable={!temPersonal} />
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
                    <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Qual esporte?" placeholderTextColor={theme.colors.textMuted} value={outroEsporteTexto} onChangeText={setOutroEsporteTexto} editable={!temPersonal}/>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Histórico Físico {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_HISTORICO, historico, setHistorico, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Limitações ou Cuidados {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_LIMITACAO, limitacao, (v) => { setLimitacao(v); setSubLimitacao([]); setOutraLimitacaoTexto(""); }, temPersonal)}

          {limitacao?.id === "lesao" && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Foco da dor:</Text>{renderChipsComIcone(SUB_LESAO, subLimitacao, setSubLimitacao, temPersonal)}
            {subLimitacao.includes("Outra") && (
              <TouchableOpacity onPress={temPersonal ? handleLockedPress : null} activeOpacity={temPersonal ? 1 : 0.8}>
                <View pointerEvents={temPersonal ? "none" : "auto"}>
                  <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Descreva brevemente..." placeholderTextColor={theme.colors.textMuted} value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} editable={!temPersonal}/>
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
                  <TextInput style={[styles.inputPremiumSmall, temPersonal && {opacity: 0.5}]} placeholder="Descreva a condição..." placeholderTextColor={theme.colors.textMuted} value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} editable={!temPersonal}/>
                </View>
              </TouchableOpacity>
            )}
            </View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Perfil de Professor Ideal {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_PERFIL, perfilPersonal, setPerfilPersonal, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Disponibilidade na Semana {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_FREQUENCIA, frequencia, setFrequencia, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Onde você prefere treinar? {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_LOCAL, localTreino, setLocalTreino, temPersonal)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Orçamento por Aula {temPersonal && "🔒"}</Text>
          {renderNeonGrid(OPCOES_INVESTIMENTO, investimento, setInvestimento, temPersonal)}
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={salvando} activeOpacity={0.85}>
          {salvando ? <ActivityIndicator size="small" color={theme.colors.backgroundPure} /> : (
            <Text style={styles.btnSalvarText}>Salvar Perfil</Text>
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
    position: 'absolute', 
    top: 0, left: 0, right: 0, 
    zIndex: 100,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 15, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)', 
  },
  btnVoltar: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  headerTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  
  content: { 
    padding: 20, 
    paddingTop: Platform.OS === 'ios' ? 120 : 100, 
    paddingBottom: 50 
  }, 
  
  photoSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: 3, borderRadius: 65 },
  avatarImage: { width: 116, height: 116, borderRadius: 58, borderWidth: 4, borderColor: theme.colors.background, backgroundColor: theme.colors.surface },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.background },
  
  cardGeral: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: 20, padding: 20, marginBottom: 20 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  iconWrapper: { backgroundColor: theme.colors.primaryLight, padding: 8, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)' },
  sectionTitle: { color: theme.colors.text, fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  cardHeaderTitle: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, overflow: 'hidden' },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 16, paddingRight: 16, fontWeight: '500' },
  inputLocation: { flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 16, paddingHorizontal: 16, fontWeight: '500' },
  inputHalf: { flex: 1, color: theme.colors.text, fontSize: 15, paddingVertical: 16, paddingRight: 10, fontWeight: '500' },
  suffix: { color: theme.colors.textMuted, fontSize: 14, fontWeight: 'bold', paddingRight: 16 },

  btnLocationPremium: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 14, marginBottom: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  btnLocationText: { color: theme.colors.backgroundPure, fontSize: 15, fontWeight: "900", marginLeft: 8 },

  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 10 }, 

  statusBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primaryLight, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: 20 },
  statusText: { color: theme.colors.textBody, fontSize: 13, fontWeight: '500' },

  statusBoxLocked: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)', marginBottom: 20 },
  statusTextLocked: { color: theme.colors.danger, fontSize: 12, fontWeight: 'bold', flex: 1, lineHeight: 18 },

  preferenceCard: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }, 
  cardHeaderTitleSub: { color: theme.colors.text, fontSize: 14, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  gridItemWithIcon: { width: '48%', backgroundColor: theme.colors.surfaceLight, paddingVertical: 20, paddingHorizontal: 10, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.borderLight },
  gridItemText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  gridItemTextAtivo: { color: theme.colors.primary, fontWeight: '900' },
  gridItemDesc: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', paddingHorizontal: 5, marginTop: 4 },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: 'center' },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surfaceLight, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: theme.colors.borderLight },
  chipTexto: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },

  neonAtivo: {
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  subBox: { backgroundColor: theme.colors.background, width: '100%', padding: 16, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  subBoxTitle: { color: theme.colors.textBody, fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', textAlign: 'center' },
  inputPremiumSmall: { backgroundColor: theme.colors.surfaceLight, borderRadius: 12, color: theme.colors.text, fontSize: 14, padding: 14, borderWidth: 1, borderColor: theme.colors.borderLight, width: '100%', marginTop: 15, marginBottom: 10 },

  btnSalvar: { backgroundColor: theme.colors.primary, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnSalvarText: { color: theme.colors.backgroundPure, fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});