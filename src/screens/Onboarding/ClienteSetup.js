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
  StatusBar,
  Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

const OPCOES_MODALIDADE = [
  { id: "Consultoria", titulo: "Consultoria no App", desc: "Treinos na palma da mão, suporte online e flexibilidade total.", icon: "phone-portrait-outline" },
  { id: "Presencial", titulo: "Personal Presencial", desc: "Acompanhamento físico lado a lado durante toda a execução do treino.", icon: "barbell-outline" },
  { id: "indiferente", titulo: "Ainda não sei", desc: "Estou aberto a propostas. Quero ver os melhores profissionais disponíveis.", icon: "shuffle-outline" },
];

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", desc: "Perder gordura, secar e definir a musculatura.", icon: "flame-outline" },
  { id: "hipertrofia", titulo: "Hipertrofia", desc: "Ganhar massa muscular, força e volume.", icon: "barbell-outline" },
  { id: "saude", titulo: "Saúde e Qualidade", desc: "Melhorar postura, reabilitação e bem-estar geral.", icon: "heart-outline", hasSub: true },
  { id: "performance", titulo: "Performance", desc: "Evoluir no meu esporte ou superar recordes.", icon: "trophy-outline", hasSub: true },
];

const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante Total", desc: "Nunca treinei ou parei faz muitos anos.", icon: "leaf-outline" },
  { id: "inconstante", titulo: "Inconstante", desc: "Vou e volto, não consigo manter uma rotina sólida.", icon: "pulse-outline" },
  { id: "intermediario", titulo: "Intermediário", desc: "Treino sempre, mas sinto que estagnei nos resultados.", icon: "fitness-outline" },
  { id: "avancado", titulo: "Avançado", desc: "Treino pesado, busco alta performance e lapidação.", icon: "rocket-outline" },
];

const OPCOES_LIMITACAO = [
  { id: "gestante", titulo: "Gestante / Pós-parto", desc: "Preciso de um treino adaptado e 100% seguro.", icon: "woman-outline" },
  { id: "lesao", titulo: "Lesões ou Dores", desc: "Desconforto articular, muscular ou ósseo.", icon: "bandage-outline", hasSub: true },
  { id: "clinica", titulo: "Condição Clínica", desc: "Hipertensão, diabetes, asma, etc.", icon: "medkit-outline", hasSub: true },
  { id: "nenhuma", titulo: "Nenhuma Restrição", desc: "Estou 100% liberado(a) para qualquer intensidade.", icon: "checkmark-circle-outline" },
];

const OPCOES_PERFIL = [
  { id: "acolhedor", titulo: "O Acolhedor", desc: "Paciente, respeita meu ritmo e foca na adaptação.", icon: "happy-outline" },
  { id: "motivador", titulo: "O Motivador", desc: "Intenso, me puxa ao limite e não me deixa desistir.", icon: "megaphone-outline" },
  { id: "tecnico", titulo: "O Professor", desc: "Foca muito na biomecânica, ensina o porquê de tudo.", icon: "school-outline" },
  { id: "estrategista", titulo: "O Estrategista", desc: "Foco 100% em planilhas, metas claras e progressão.", icon: "stats-chart-outline" },
];

const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias por semana", desc: "Minha rotina é muito apertada, mas quero iniciar.", icon: "calendar-outline" },
  { id: "3-4", titulo: "3 a 4 dias por semana", desc: "Consigo manter uma constância saudável e contínua.", icon: "calendar-outline" },
  { id: "5-6", titulo: "5 a 6 dias por semana", desc: "Foco quase diário. O treino é prioridade no meu dia.", icon: "flame-outline" },
  { id: "7", titulo: "Todos os dias", desc: "Não descanso, quero treino intenso todos os dias.", icon: "flash-outline" },
];

const OPCOES_LOCAL = [
  { id: "academia", titulo: "Academia Comercial", desc: "Grandes redes ou academias de bairro completas.", icon: "barbell-outline" },
  { id: "condominio", titulo: "Academia do Prédio", desc: "Treino no condomínio, com a estrutura disponível lá.", icon: "business-outline" },
  { id: "casa", titulo: "Em Casa / Apartamento", desc: "Treino com peso do corpo ou acessórios que já tenho.", icon: "home-outline" },
  { id: "ar_livre", titulo: "Ao Ar Livre / Parques", desc: "Gosto de praças, parques, praias ou quadras.", icon: "leaf-outline" },
];

const OPCOES_INVESTIMENTO = [
  { id: "base", titulo: "R$ 90 a R$ 110 / mês", desc: "Excelente custo-benefício para iniciar os treinos.", icon: "wallet-outline" },
  { id: "mid", titulo: "R$ 120 a R$ 150 / mês", desc: "Profissionais especialistas e com ótima avaliação.", icon: "star-outline" },
  { id: "premium", titulo: "A partir de R$ 160 / mês", desc: "Treinadores de Elite e acompanhamento super VIP.", icon: "diamond-outline" }
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

export default function ClienteSetup({ navigation }) {
  const [step, setStep] = useState(0);
  const totalSteps = 8; 

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [servicosBuscados, setServicosBuscados] = useState([]); 

  const [objetivo, setObjetivo] = useState(null);
  const [subObjetivo, setSubObjetivo] = useState([]);
  const [historico, setHistorico] = useState(null);
  const [limitacao, setLimitacao] = useState(null);
  const [subLimitacao, setSubLimitacao] = useState([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [perfilPersonal, setPerfilPersonal] = useState(null);
  const [frequencia, setFrequencia] = useState(null);
  const [localTreino, setLocalTreino] = useState(null);
  const [investimento, setInvestimento] = useState(null);
  const [inputFocado, setInputFocado] = useState(null);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Acesso Negado", "Precisamos de acesso à sua galeria para escolher uma foto.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada");
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
        setCidade(
          `${district ? district + ", " : ""}${city || subregion} - ${region}`,
        );
      }
    } catch (error) {
      Alert.alert("Aviso", "Não foi possível buscar GPS. Digite manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const formatarWhatsApp = (t) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };
  
  const formatarData = (t) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };

  const formatarPeso = (t) => {
    let v = t.replace(/[^0-9.,]/g, "").replace(",", "."); 
    setPeso(v);
  };
  
  const formatarAltura = (t) => {
    let v = t.replace(/[^0-9]/g, ""); 
    setAltura(v);
  };

  const toggleModalidade = (id) => {
    if (id === "indiferente") {
      setServicosBuscados(["indiferente"]);
    } else {
      let novosServicos = servicosBuscados.filter(item => item !== "indiferente"); // Remove o indiferente se existir
      
      if (novosServicos.includes(id)) {
        novosServicos = novosServicos.filter((item) => item !== id);
      } else {
        novosServicos.push(id);
      }
      setServicosBuscados(novosServicos);
    }
  };

  const toggleMultiSelect = (item, state, setState) => {
    if (state.includes(item)) {
      if (item === "Outra" || item === "Outro") setOutraLimitacaoTexto("");
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const nextStep = () => {
    if (step === 0 && (!nome || !telefone || !cidade || !dataNascimento)) {
      return Alert.alert("Atenção", "Preencha os campos obrigatórios (*)");
    }
    setStep(step + 1);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      let dataBanco = dataNascimento;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let servicosParaSalvar = servicosBuscados;
      if (servicosBuscados.includes("indiferente")) {
        servicosParaSalvar = ["Consultoria", "Presencial"];
      }

      const preferencias = {
        servicos_buscados: servicosParaSalvar,
        objetivo: objetivo?.id,
        sub_objetivo: subObjetivo.length > 0 ? subObjetivo : null,
        historico: historico?.id,
        limitacao: limitacao?.id,
        sub_limitacao: subLimitacao.length > 0 ? subLimitacao : null,
        detalhe_outra_limitacao: subLimitacao.includes("Outra")
          ? outraLimitacaoTexto.trim()
          : null,
        perfil_treinador: perfilPersonal?.id,
        frequencia: frequencia?.id,
        local_treino: localTreino?.id,
        investimento: investimento?.id,
      };

      const { error } = await supabase.from("usuarios").upsert(
        {
          id: user.id,
          email: user.email,
          nome: nome.trim(),
          telefone: telefone.trim(),
          cidade: cidade.trim(),
          data_nascimento: dataBanco,
          peso: peso ? parseFloat(peso) : null,
          altura: altura ? parseFloat(altura) : null,
          foto_url: fotoUri || "https://via.placeholder.com/150",
          preferencias: preferencias,
        },
        { onConflict: "id" },
      );

      if (error) throw error;
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'UsuarioTabs' }],
      });

    } catch (error) { 
      Alert.alert('Erro no Banco', error.message || 'Não foi possível salvar os dados.'); 
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ item, isSelected, onPress, isMultiSelect = false }) => (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardAtivo]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <LinearGradient
          colors={["rgba(255, 107, 0, 0.1)", "transparent"]}
          style={StyleSheet.absoluteFill}
          borderRadius={24}
        />
      )}
      <View style={[styles.cardIconBox, isSelected && styles.cardIconBoxSelected]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={isSelected ? theme.colors.backgroundPure : theme.colors.primary}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
          {item.titulo}
        </Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>
      
      {/* Visual de Checkbox ou Radio dependendo do isMultiSelect */}
      <View style={[isMultiSelect ? styles.checkbox : styles.radio, isSelected && (isMultiSelect ? styles.checkboxSelected : styles.radioSelected)]}>
        {isSelected && <View style={isMultiSelect ? styles.checkboxInner : styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  const TipBox = ({ title, text, icon }) => (
    <View style={styles.tipBox}>
      <View style={styles.tipIconBox}>
        <Ionicons name={icon || "bulb"} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.tipTextContainer}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </View>
  );

  const renderChipsComIcone = (opcoes, stateArray, setStateArray) => (
    <View style={styles.chipsContainer}>
      {opcoes.map((opt) => {
        const isSelected = stateArray.includes(opt.titulo);
        return (
          <TouchableOpacity
            key={opt.titulo}
            style={[styles.chip, isSelected && styles.chipAtivo]}
            onPress={() => toggleMultiSelect(opt.titulo, stateArray, setStateArray)}
            activeOpacity={0.7}
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

  const isAvançarDesabilitado = () => {
    if (loading) return true;
    if (step === 1 && servicosBuscados.length === 0) return true;
    if (step === 2 && (!objetivo || (objetivo?.hasSub && subObjetivo.length === 0))) return true;
    if (step === 3 && !historico) return true;
    if (step === 4) {
      if (!limitacao) return true;
      if (limitacao?.hasSub && subLimitacao.length === 0) return true;
      if (limitacao?.hasSub && subLimitacao.includes("Outra") && !outraLimitacaoTexto.trim()) return true;
    }
    if (step === 5 && !perfilPersonal) return true;
    if (step === 6 && !frequencia) return true;
    if (step === 7 && !localTreino) return true; 
    if (step === 8 && !investimento) return true;
    return false;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.headerAbsolute}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => setStep(step - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {step === 0 ? "SEU PERFIL" : `MAPEAMENTO • ${step}/${totalSteps}`}
        </Text>
        <View style={{ width: 40 }} />
      </BlurView>

      {step > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Sua <Text style={styles.titleHighlight}>Jornada</Text> começa aqui.</Text>
            <Text style={styles.subTitle}>Vamos criar o seu perfil para encontrarmos o treinador perfeito para você.</Text>

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
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <View style={[styles.inputBox, inputFocado === "nome" && styles.inputBoxFocused]}>
                <Ionicons name="person-outline" size={20} color={inputFocado === "nome" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput 
                  style={styles.inputPremium} 
                  placeholder="Como quer ser chamado?" 
                  placeholderTextColor="#666" 
                  value={nome} 
                  onChangeText={setNome} 
                  onFocus={() => setInputFocado("nome")}
                  onBlur={() => setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Nascimento *</Text>
                <View style={[styles.inputBox, inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <Ionicons name="calendar-outline" size={20} color={inputFocado === "nasc" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder="DD/MM/AAAA" 
                    placeholderTextColor="#666" 
                    keyboardType="number-pad" 
                    maxLength={10} 
                    value={dataNascimento} 
                    onChangeText={formatarData} 
                    onFocus={() => setInputFocado("nasc")}
                    onBlur={() => setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>WhatsApp *</Text>
                <View style={[styles.inputBox, inputFocado === "whats" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="whatsapp" size={20} color={inputFocado === "whats" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder="(00) 00000-0000" 
                    placeholderTextColor="#666" 
                    keyboardType="number-pad" 
                    value={telefone} 
                    onChangeText={formatarWhatsApp} 
                    onFocus={() => setInputFocado("whats")}
                    onBlur={() => setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Localização *</Text>
              <View style={[styles.inputBox, inputFocado === "cidade" && styles.inputBoxFocused]}>
                <Ionicons name="location-outline" size={20} color={inputFocado === "cidade" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput 
                  style={styles.inputPremium} 
                  placeholder="Bairro e Cidade" 
                  placeholderTextColor="#666" 
                  value={cidade} 
                  onChangeText={setCidade} 
                  onFocus={() => setInputFocado("cidade")}
                  onBlur={() => setInputFocado(null)}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity style={styles.btnGpsPremium} onPress={buscarLocalizacao}>
                  {buscandoLocal ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.btnGpsText}>GPS</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.inputLabel}>Biometria (Opcional)</Text>
            <Text style={{ color: "#888", fontSize: 13, marginBottom: 15 }}>Esses dados ajudam o professor a estruturar melhor seu treino.</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={[styles.inputBox, inputFocado === "peso" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={inputFocado === "peso" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder="Peso" 
                    placeholderTextColor="#666" 
                    keyboardType="decimal-pad" 
                    maxLength={6} 
                    value={peso} 
                    onChangeText={formatarPeso} 
                    onFocus={() => setInputFocado("peso")}
                    onBlur={() => setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>kg</Text>
                </View>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={[styles.inputBox, inputFocado === "altura" && styles.inputBoxFocused]}>
                  <Ionicons name="body-outline" size={20} color={inputFocado === "altura" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputPremium} 
                    placeholder="Altura" 
                    placeholderTextColor="#666" 
                    keyboardType="number-pad" 
                    maxLength={3} 
                    value={altura} 
                    onChangeText={formatarAltura} 
                    onFocus={() => setInputFocado("altura")}
                    onBlur={() => setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>cm</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Como você deseja <Text style={styles.titleHighlight}>treinar?</Text></Text>
            <Text style={styles.subTitle}>Você pode selecionar mais de uma opção se estiver em dúvida.</Text>

            {OPCOES_MODALIDADE.map((item) => (
              <OptionCard 
                key={item.id} 
                item={item} 
                isMultiSelect={true}
                isSelected={servicosBuscados.includes(item.id)} 
                onPress={() => toggleModalidade(item.id)} 
              />
            ))}

            <TipBox title="Híbrido Mágico" text="Se você selecionar Consultoria e Presencial, conectaremos você a profissionais que oferecem planos flexíveis combinando as duas coisas." icon="options" />
          </View>
        )}

        {step === 2 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Qual é o seu principal <Text style={styles.titleHighlight}>objetivo?</Text></Text>
            <Text style={styles.subTitle}>Isso nos ajuda a filtrar especialistas que realmente entendem do que você precisa.</Text>

            {OPCOES_OBJETIVO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={objetivo?.id === item.id} onPress={() => { setObjetivo(item); setSubObjetivo([]); }} />
            ))}

            {objetivo?.id === "saude" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Selecione uma ou mais prioridades:</Text>
                {renderChipsComIcone(SUB_SAUDE, subObjetivo, setSubObjetivo)}
              </View>
            )}

            {objetivo?.id === "performance" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Quais esportes você pratica?</Text>
                {renderChipsComIcone(SUB_ESPORTE, subObjetivo, setSubObjetivo)}
              </View>
            )}

            <TipBox title="Foco é tudo" text="A maioria dos alunos atinge resultados mais rápido quando define um único grande objetivo principal." />
          </View>
        )}

        {step === 3 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Como é o seu <Text style={styles.titleHighlight}>histórico</Text> com treinos?</Text>
            <Text style={styles.subTitle}>Seja totalmente sincero. Aqui não há julgamentos, apenas a preparação para o plano adequado.</Text>

            {OPCOES_HISTORICO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={historico?.id === item.id} onPress={() => setHistorico(item)} />
            ))}

            <TipBox title="Sinceridade gera resultados" text="Personais ajustam a carga inicial com base no que você marca aqui para evitar lesões e frustrações." icon="trending-up" />
          </View>
        )}

        {step === 4 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Possui alguma <Text style={styles.titleHighlight}>limitação?</Text></Text>
            <Text style={styles.subTitle}>Sua segurança e saúde vêm em primeiro lugar. Profissionais qualificados saberão contornar isso.</Text>

            {OPCOES_LIMITACAO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={limitacao?.id === item.id} onPress={() => { setLimitacao(item); setSubLimitacao([]); setOutraLimitacaoTexto(""); }} />
            ))}

            {limitacao?.id === "lesao" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Onde é o foco da sua dor?</Text>
                {renderChipsComIcone(SUB_LESAO, subLimitacao, setSubLimitacao)}
                {subLimitacao.includes("Outra") && (
                  <View style={[styles.inputBox, { marginTop: 15, marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual? Descreva brevemente..." placeholderTextColor="#666" value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} keyboardAppearance="dark" />
                  </View>
                )}
              </View>
            )}

            {limitacao?.id === "clinica" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Qual condição o treinador precisa saber?</Text>
                {renderChipsComIcone(SUB_CLINICA, subLimitacao, setSubLimitacao)}
                {subLimitacao.includes("Outra") && (
                  <View style={[styles.inputBox, { marginTop: 15, marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual condição? Descreva..." placeholderTextColor="#666" value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} keyboardAppearance="dark" />
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {step === 5 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>O treinador <Text style={styles.titleHighlight}>ideal</Text> pra você é...</Text>
            <Text style={styles.subTitle}>Além do treino, a conexão pessoal e o estilo de ensino fazem toda a diferença na motivação diária.</Text>

            {OPCOES_PERFIL.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={perfilPersonal?.id === item.id} onPress={() => setPerfilPersonal(item)} />
            ))}

            <TipBox title="Conexão Perfeita" text="Nós cruzamos o seu perfil com as avaliações que outros alunos deixaram sobre os personais na plataforma." icon="people" />
          </View>
        )}

        {step === 6 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Qual sua <Text style={styles.titleHighlight}>disponibilidade?</Text></Text>
            <Text style={styles.subTitle}>Seja realista com sua agenda. O seu treinador vai periodizar os estímulos com base nessa frequência.</Text>

            {OPCOES_FREQUENCIA.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={frequencia?.id === item.id} onPress={() => setFrequencia(item)} />
            ))}

            <TipBox title="Menos é mais?" text="Treinar bem 3 vezes na semana é muito mais eficiente do que tentar ir 6 dias e desistir no primeiro mês." icon="time" />
          </View>
        )}

        {step === 7 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Onde você prefere <Text style={styles.titleHighlight}>treinar?</Text></Text>
            <Text style={styles.subTitle}>Isso nos ajuda a encontrar personais que atendem perfeitamente no seu ambiente escolhido.</Text>

            {OPCOES_LOCAL.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={localTreino?.id === item.id} onPress={() => setLocalTreino(item)} />
            ))}

            <TipBox title="Treino Inteligente" text="Mesmo em casa ou no condomínio é possível ter resultados incríveis se a estratégia for montada corretamente." icon="location" />
          </View>
        )}

        {step === 8 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Planejamento de <Text style={styles.titleHighlight}>Investimento</Text></Text>
            <Text style={styles.subTitle}>Nós mostraremos os profissionais que se encaixam na sua faixa de orçamento escolhida para o plano.</Text>

            {OPCOES_INVESTIMENTO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={investimento?.id === item.id} onPress={() => setInvestimento(item)} />
            ))}

            <TipBox title="Segurança Total" text="Todos os personais do aplicativo passam por rigorosa validação de CREF ativo. Você estará sempre em boas mãos." icon="shield-checkmark" />
          </View>
        )}
      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <TouchableOpacity
          style={[styles.btnAvançar, isAvançarDesabilitado() && { opacity: 0.5 }]}
          onPress={step === 8 ? handleFinalizar : nextStep}
          disabled={isAvançarDesabilitado()}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <LinearGradient colors={isAvançarDesabilitado() ? ["#333", "#222"] : ["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
              <Text style={[styles.btnAvançarText, isAvançarDesabilitado() && { color: "#888" }]}>
                {step === 8 ? "Finalizar Configuração" : "Avançar Etapa"}
              </Text>
              {step < 8 && (
                <Ionicons name="arrow-forward" size={20} color={isAvançarDesabilitado() ? "#888" : "#000"} style={{ marginLeft: 8 }} />
              )}
            </LinearGradient>
          )}
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  
  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 80 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 100 },

  headerAbsolute: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  btnBack: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: "#FFF", fontSize: 13, fontWeight: "900", letterSpacing: 2 },

  progressContainer: { position: "absolute", top: Platform.OS === "ios" ? 120 : 100, left: 0, right: 0, height: 3, backgroundColor: "#1A1A1A", zIndex: 90 },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },

  content: { padding: 24, paddingTop: Platform.OS === "ios" ? 140 : 120, paddingBottom: 140 },
  fadeContainer: { flex: 1 },

  mainTitle: { color: "#FFF", fontSize: 32, fontFamily: theme.fonts.title, marginBottom: 12, letterSpacing: -0.5, lineHeight: 38 },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#AAA", fontSize: 15, lineHeight: 24, marginBottom: 35 },

  photoSection: { alignItems: "center", marginBottom: 35 },
  avatarContainer: { position: "relative", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#121212", borderWidth: 2, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: -5, right: -5, backgroundColor: theme.colors.primary, width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000" },

  inputGroup: { marginBottom: 20 },
  row: { flexDirection: "row" },
  inputLabel: { color: "#888", fontSize: 12, fontWeight: "900", textTransform: "uppercase", marginBottom: 10, marginLeft: 5, letterSpacing: 0.5 },
  
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: 18, borderWidth: 1, borderColor: "#222", paddingHorizontal: 16, height: 60 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255,107,0,0.05)" },
  inputIcon: { marginRight: 12 },
  inputPremium: { flex: 1, color: "#FFF", fontSize: 16, fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent", outlineStyle: "none" },
  suffix: { color: "#666", fontWeight: "bold", fontSize: 16, marginLeft: 8 },

  btnGpsPremium: { backgroundColor: "rgba(255,107,0,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", marginLeft: 10 },
  btnGpsText: { color: theme.colors.primary, fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: "#222", marginVertical: 25 },

  card: { backgroundColor: "#0A0A0A", borderRadius: 24, padding: 20, marginBottom: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#222", overflow: "hidden", position: "relative" },
  cardAtivo: { borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  cardIconBox: { width: 54, height: 54, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginRight: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardIconBoxSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  cardContent: { flex: 1, paddingRight: 10 },
  cardTitle: { color: "#FFF", fontSize: 17, fontWeight: "bold", marginBottom: 6, letterSpacing: 0.2 },
  cardTitleSelected: { color: theme.colors.primary },
  cardDesc: { color: "#888", fontSize: 14, lineHeight: 22 },
  
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },

  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  checkboxSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  checkboxInner: { width: 10, height: 10, borderRadius: 3, backgroundColor: "#FFF" },

  subBox: { backgroundColor: "#111", padding: 20, borderRadius: 20, marginTop: 4, marginBottom: 24, borderWidth: 1, borderColor: "#222" },
  subBoxTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 16 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#333" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 5 },
  chipTexto: { color: "#888", fontSize: 13, fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },

  tipBox: { backgroundColor: "#0A0A0A", borderRadius: 20, padding: 20, flexDirection: "row", marginTop: 15, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  tipIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255, 107, 0, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  tipTextContainer: { flex: 1 },
  tipTitle: { color: theme.colors.primary, fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  tipText: { color: "#888", fontSize: 13, lineHeight: 20 },

  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  btnAvançar: { borderRadius: 20, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: "row", height: 64, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  btnAvançarText: { color: "#000", fontSize: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});