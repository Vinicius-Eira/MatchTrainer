import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const OPCOES_RESTRICAO = ["Nenhuma", "Dor no Joelho", "Dor na Coluna", "Ombro/Articulações", "Outra"];
const OPCOES_LOCAL = ["Academia", "Em Casa", "Condomínio"];
const OPCOES_TEMPO = ["Até 30 min", "45 a 60 min", "Mais de 1 hora"];

export default function ClienteSetup({ navigation }) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState(""); 
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [fotoUri, setFotoUri] = useState(null);

  const [restricao, setRestricao] = useState("");
  const [restricaoCustomizada, setRestricaoCustomizada] = useState(""); // Campo extra para "Outra"
  const [localTreino, setLocalTreino] = useState("");
  const [tempoTreino, setTempoTreino] = useState("");

  const [loading, setLoading] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Precisamos de acesso à sua galeria para escolher uma foto."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Permita o acesso à localização para preencher automaticamente."
        );
        setBuscandoLocal(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const { district, city, subregion, region } = geocode[0];
        
        const nomeCidade = city || subregion || "Sua Cidade";
        const nomeBairro = district || "";
        
        const localFormatado = nomeBairro 
          ? `${nomeCidade} - ${nomeBairro}` 
          : `${nomeCidade} - ${region}`;
          
        setCidade(localFormatado);
      }
    } catch (error) {
      console.error("Erro ao buscar GPS:", error);
      Alert.alert(
        "Aviso",
        "Não foi possível buscar sua localização exata. Digite manualmente."
      );
    } finally {
      setBuscandoLocal(false);
    }
  };

  const formatarWhatsApp = (texto) => {
    let v = texto.replace(/\D/g, '');
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(v.substring(0, 15));
  };

  const formatarData = (texto) => {
    let v = texto.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };

  const renderChips = (opcoes, valorSelecionado, setValor) => (
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
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const handleSalvar = async () => {
    if (!nome.trim() || !telefone.trim() || !cidade.trim() || !dataNascimento.trim()) {
      return Alert.alert('Atenção', 'Por favor, preencha todos os campos marcados como obrigatórios (*).');
    }

    if (restricao === "Outra" && !restricaoCustomizada.trim()) {
      return Alert.alert('Atenção', 'Por favor, descreva qual é a sua restrição ou dor.');
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      let dataBanco = dataNascimento;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split('/');
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const restricaoFinal = restricao === "Outra" ? restricaoCustomizada.trim() : restricao;

      const { error } = await supabase.from('usuarios').upsert({
        id: user.id, 
        email: user.email,
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso.replace(',', '.')) : null,
        altura: altura ? parseFloat(altura.replace(/\D/g, '')) : null,
        restricao_fisica: restricaoFinal, 
        local_treino: localTreino,   
        tempo_treino: tempoTreino,   
        foto_url: fotoUri || 'https://via.placeholder.com/150' 
      }, { onConflict: 'id' }); 
      
      if (error) throw error;
      
      navigation.navigate('SetupBuscaAluno'); 

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Passo 1 de 2: Perfil Pessoal</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#444" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Toque para adicionar sua foto</Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Identificação</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Como podemos te chamar?"
            placeholderTextColor={theme.colors.textSecondary}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Nascimento *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              maxLength={10}
              value={dataNascimento}
              onChangeText={formatarData}
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>WhatsApp *</Text>
            <TextInput
              style={styles.input}
              placeholder="(11) 99999-9999"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              value={telefone}
              onChangeText={formatarWhatsApp}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Sua Localização *</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Ex: São Paulo, SP"
              placeholderTextColor={theme.colors.textSecondary}
              value={cidade}
              onChangeText={setCidade}
            />
            <TouchableOpacity
              style={styles.btnGps}
              onPress={buscarLocalizacao}
              disabled={buscandoLocal}
            >
              {buscandoLocal ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="location" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>
            Usamos sua cidade para encontrar personais próximos a você.
          </Text>
        </View>

        <View style={[styles.sectionTitleRow, { marginTop: 15 }]}>
          <MaterialCommunityIcons name="heart-pulse" size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Sua Biometria</Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} style={{marginRight: 8}} />
          <Text style={styles.infoBoxText}>Esses dados são <Text style={{fontWeight: 'bold', color: '#FFF'}}>opcionais</Text>, mas ajudam seu treinador a montar um plano com mais rapidez e segurança para você.</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Peso Atual (kg)</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Ex: 75.5"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={5}
                value={peso}
                onChangeText={(t) => setPeso(t.replace(/[^0-9.,]/g, ''))}
              />
              <Text style={styles.suffixText}>kg</Text>
            </View>
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Altura (cm)</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Ex: 180"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={3}
                value={altura}
                onChangeText={(t) => setAltura(t.replace(/[^0-9]/g, ''))}
              />
              <Text style={styles.suffixText}>cm</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionTitleRow, { marginTop: 15 }]}>
          <FontAwesome5 name="clipboard-list" size={16} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Perfil de Treino (Opcional)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Possui alguma restrição ou dor?</Text>
          {renderChips(OPCOES_RESTRICAO, restricao, setRestricao)}
          
          {restricao === "Outra" && (
            <View style={styles.customInputContainer}>
              <Ionicons name="pencil" size={16} color={theme.colors.primary} style={{marginRight: 10}} />
              <TextInput
                style={styles.customInput}
                placeholder="Descreva brevemente sua restrição..."
                placeholderTextColor="#666"
                value={restricaoCustomizada}
                onChangeText={setRestricaoCustomizada}
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Onde você pretende treinar?</Text>
          {renderChips(OPCOES_LOCAL, localTreino, setLocalTreino)}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tempo médio disponível por treino?</Text>
          {renderChips(OPCOES_TEMPO, tempoTreino, setTempoTreino)}
        </View>

        <TouchableOpacity
          style={[styles.btnSalvar, loading && { opacity: 0.7 }]}
          onPress={handleSalvar}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.btnSalvarText}>Salvar e Continuar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#1A1A1A",
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  content: { padding: 20, paddingBottom: 50 },

  photoSection: { alignItems: "center", marginBottom: 35 },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#111",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  photoHint: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 12 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 8 },

  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(255,107,0,0.1)', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)', marginBottom: 20, alignItems: 'center' },
  infoBoxText: { flex: 1, color: '#DDD', fontSize: 12, lineHeight: 18 },

  formGroup: { marginBottom: 16 },
  row: { flexDirection: "row" },
  label: {
    color: "#888",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 14,
    color: "#FFF",
    fontSize: 15,
    padding: 16,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 14,
  },
  suffixText: {
    color: '#666',
    fontWeight: 'bold',
    marginRight: 16,
    fontSize: 14,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 14,
  },
  btnGps: { padding: 16, borderLeftWidth: 1, borderLeftColor: "#2A2A2A" },
  hintText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  // Chips Anamnese
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#121212', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  chipAtivo: { backgroundColor: 'rgba(255,107,0,0.1)', borderColor: theme.colors.primary },
  chipTexto: { color: '#777', fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: 'bold' },

  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    height: 50,
  },
  customInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
  },

  btnSalvar: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnSalvarText: { color: "#000", fontSize: 16, fontWeight: "900", textTransform: 'uppercase', letterSpacing: 0.5 },
});