import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const OBJETIVOS = ['Emagrecimento', 'Hipertrofia', 'Condicionamento', 'Reabilitação', 'Saúde Geral'];
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const FREQUENCIAS = ['1 a 2x', '3 a 4x', '5+ vezes'];

const getIconeObjetivo = (opcao) => {
  switch(opcao) {
    case 'Emagrecimento': return 'fire';
    case 'Hipertrofia': return 'dumbbell';
    case 'Condicionamento': return 'heart-pulse';
    case 'Reabilitação': return 'medical-bag';
    case 'Saúde Geral': return 'leaf';
    default: return 'check-circle-outline';
  }
};

export default function PerfilAluno({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [fotoUri, setFotoUri] = useState(null);

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');

  const [objetivo, setObjetivo] = useState('');
  const [nivel, setNivel] = useState('');
  const [frequencia, setFrequencia] = useState('');

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setNome(data.nome || '');
        setTelefone(data.telefone || '');
        setCidade(data.cidade || '');
        setFotoUri(data.foto_url);
        
        if (data.peso) setPeso(data.peso.toString().replace('.', ','));
        if (data.altura) setAltura(data.altura.toString().replace('.', ','));

        setObjetivo(data.objetivo || '');
        setNivel(data.nivel_experiencia || '');
        setFrequencia(data.frequencia_treino || '');

        if (data.data_nascimento) {
          const parts = data.data_nascimento.split('-');
          if (parts.length === 3) {
            setDataNascimento(`${parts[2]}/${parts[1]}/${parts[0]}`);
          } else {
            setDataNascimento(data.data_nascimento);
          }
        }
      }
    } catch (error) {
      console.log("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Atenção', 'Precisamos de acesso à galeria.');
    let result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.5 
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Atenção', 'Permita o acesso à localização.');
      
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      
      if (geocode.length > 0) {
        const { district, city, subregion, region } = geocode[0];
        
        const nomeCidade = city || subregion || "Sua Cidade";
        
        if (district && district !== nomeCidade) {
          setCidade(`${nomeCidade} - ${district}`);
        } else {
          setCidade(`${nomeCidade} - ${region}`);
        }
      }
    } catch (error) {
      Alert.alert("Aviso", "Falha ao buscar GPS exato. Você pode digitar manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");
      
      let dataBanco = dataNascimento;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split('/');
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const pesoNumerico = peso ? parseFloat(peso.replace(',', '.')) : null;
      const alturaNumerica = altura ? parseFloat(altura.replace(',', '.')) : null;

      const { error } = await supabase.from('usuarios').upsert({
        id: user.id,
        email: user.email, 
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        data_nascimento: dataBanco,
        peso: pesoNumerico,
        altura: alturaNumerica,
        objetivo: objetivo,
        nivel_experiencia: nivel,
        frequencia_treino: frequencia,
        foto_url: fotoUri || 'https://via.placeholder.com/150'
      }, { onConflict: 'id' });

      if (error) {
        console.log("Erro Supabase:", error);
        throw error;
      }
      
      Alert.alert('Sucesso', 'Perfil atualizado e sincronizado com o seu treinador!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados. Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  const formatarWhatsApp = (texto) => {
    let v = texto.replace(/\D/g, '');
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(v.substring(0, 15));
  };

  const formatarPeso = (texto) => {
    let v = texto.replace(/\D/g, '');
    if (v.length > 2) v = v.replace(/(\d)(\d)$/, '$1,$2');
    setPeso(v);
  };

  const formatarAltura = (texto) => {
    let v = texto.replace(/\D/g, ''); 
    if (v.length > 2) v = v.replace(/^(\d{1})(\d{2})$/, '$1,$2'); 
    setAltura(v.substring(0, 4));
  };

  const renderChips = (opcoes, valorSelecionado, setValor, usaIcone = false) => (
    <View style={styles.chipsContainer}>
      {opcoes.map((opcao) => {
        const ativo = valorSelecionado === opcao;
        return (
          <TouchableOpacity 
            key={opcao} 
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => setValor(opcao)}
            activeOpacity={0.8}
          >
            {usaIcone && (
              <MaterialCommunityIcons 
                name={getIconeObjetivo(opcao)} 
                size={16} 
                color={ativo ? '#000' : '#777'} 
                style={styles.chipIcon}
              />
            )}
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MEU PERFIL</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, '#E65C00']} style={styles.avatarRing}>
              <Image source={{ uri: fotoUri || 'https://via.placeholder.com/150' }} style={styles.avatarImage} />
            </LinearGradient>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.iconWrapper}><Ionicons name="person-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-circle-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#555" placeholder="Como quer ser chamado?" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Nascimento</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.inputHalf} keyboardType="number-pad" maxLength={10} value={dataNascimento} placeholder="DD/MM/AAAA" placeholderTextColor="#555"
                onChangeText={(texto) => {
                  let v = texto.replace(/\D/g, '');
                  if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '$1/$2');
                  if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, '$1/$2/$3');
                  setDataNascimento(v);
                }} />
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>WhatsApp</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="whatsapp" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.inputHalf} keyboardType="number-pad" value={telefone} onChangeText={formatarWhatsApp} placeholder="(00) 00000" placeholderTextColor="#555" />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Localização</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#555" style={styles.inputIcon} />
            <TextInput 
              style={styles.inputLocation} 
              value={cidade} 
              onChangeText={setCidade} 
              placeholder="Sua cidade atual" 
              placeholderTextColor="#555" 
            />
            <TouchableOpacity style={styles.btnGps} onPress={buscarLocalizacao} activeOpacity={0.7}>
              {buscandoLocal ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Ionicons name="locate" size={20} color={theme.colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <View style={styles.iconWrapper}><Ionicons name="body-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Sua Biometria</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Peso Atual</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={5} value={peso} onChangeText={formatarPeso} placeholder="80,5" placeholderTextColor="#555" />
              <Text style={styles.suffix}>kg</Text>
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Altura</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="human-male-height" size={18} color="#555" style={styles.inputIcon} />
              <TextInput style={styles.inputHalf} keyboardType="numeric" maxLength={4} value={altura} onChangeText={formatarAltura} placeholder="1,80" placeholderTextColor="#555" />
              <Text style={styles.suffix}>m</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionHeader, { marginTop: 25, justifyContent: 'center' }]}>
          <View style={styles.iconWrapper}><Ionicons name="barbell-outline" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.sectionTitle}>Perfil Esportivo</Text>
        </View>

        <View style={styles.formGroupCenter}>
          <Text style={styles.labelCenter}>Objetivo Principal</Text>
          {renderChips(OBJETIVOS, objetivo, setObjetivo, true)}
        </View>

        <View style={styles.formGroupCenter}>
          <Text style={styles.labelCenter}>Nível de Experiência</Text>
          {renderChips(NIVEIS, nivel, setNivel)}
        </View>

        <View style={styles.formGroupCenter}>
          <Text style={styles.labelCenter}>Frequência Semanal</Text>
          {renderChips(FREQUENCIAS, frequencia, setFrequencia)}
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={salvando} activeOpacity={0.85}>
          {salvando ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.btnSalvarText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070707' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070707' },
  
  header: { alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#0A0A0A' },
  headerTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  
  content: { padding: 20, paddingBottom: 100 },
  
  photoSection: { alignItems: 'center', marginBottom: 40, marginTop: 15 },
  avatarContainer: { position: 'relative', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: 3, borderRadius: 65 },
  avatarImage: { width: 116, height: 116, borderRadius: 58, borderWidth: 4, borderColor: '#070707', backgroundColor: '#111' },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#070707' },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconWrapper: { backgroundColor: 'rgba(255,107,0,0.1)', padding: 8, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)' },
  sectionTitle: { color: '#FFF', fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  formGroup: { marginBottom: 22 },
  formGroupCenter: { marginBottom: 28, alignItems: 'center' }, // Centraliza a view e os itens
  
  row: { flexDirection: 'row' },
  label: { color: '#888', fontSize: 11, fontWeight: '800', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  labelCenter: { color: '#888', fontSize: 11, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderWidth: 1, borderColor: '#222', borderRadius: 16, overflow: 'hidden' },
  inputIcon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 16, paddingRight: 16, fontWeight: '500' },
  inputLocation: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 16, paddingRight: 8, fontWeight: '500' },
  
  inputHalf: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 16, paddingRight: 10, fontWeight: '500' },
  suffix: { color: '#888', fontSize: 13, fontWeight: 'bold', paddingRight: 16 },

  btnGps: { paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#1A1A1A', borderLeftWidth: 1, borderLeftColor: '#222', justifyContent: 'center', alignItems: 'center' },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2, justifyContent: 'center' }, // Centraliza os chips dentro da sua caixa
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#161616', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2A2A2A' 
  },
  chipAtivo: { 
    backgroundColor: theme.colors.primary, 
    borderColor: theme.colors.primary, 
    shadowColor: theme.colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  chipTexto: { color: '#777', fontSize: 14, fontWeight: '700' },
  chipTextoAtivo: { color: '#000', fontWeight: '900' },
  chipIcon: { marginRight: 6 },

  btnSalvar: { backgroundColor: theme.colors.primary, height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnSalvarText: { color: '#000', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});