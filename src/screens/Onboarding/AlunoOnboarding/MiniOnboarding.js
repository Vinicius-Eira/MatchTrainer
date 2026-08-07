import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker"; 
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

const { width } = Dimensions.get("window");

export default function MiniOnboarding({ route, navigation }) {
  const { conexaoId } = route.params || {};

  const totalPassos = 5;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [alunoIdAuth, setAlunoIdAuth] = useState(null);

  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState(""); 
  const [dataNascimento, setDataNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [metaPeso, setMetaPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [objetivo, setObjetivo] = useState(null);
  const [nivel, setNivel] = useState(null);
  const [diasTreino, setDiasTreino] = useState(null);
  const [temRestricao, setTemRestricao] = useState(null);
  const [detalhes, setDetalhes] = useState("");
  
  const [fotoAluno, setFotoAluno] = useState(null);

  const [inputFocado, setInputFocado] = useState(null);

  const OBJETIVOS = [
    { id: "Emagrecimento", titulo: "Emagrecimento", desc: "Secar, definir e perder gordura.", icon: "fire" },
    { id: "Hipertrofia", titulo: "Hipertrofia", desc: "Ganhar volume e massa muscular.", icon: "dumbbell" },
    { id: "Saude", titulo: "Saúde e Bem-estar", desc: "Qualidade de vida e longevidade.", icon: "heartbeat" },
    { id: "Performance", titulo: "Performance", desc: "Condicionamento e força bruta.", icon: "bolt" },
  ];

  const NIVEIS = [
    { id: "Iniciante", titulo: "Iniciante", desc: "Nunca treinei ou estou parado.", icon: "seedling" },
    { id: "Intermediario", titulo: "Intermediário", desc: "Treino com certa regularidade.", icon: "running" },
    { id: "Avancado", titulo: "Avançado", desc: "Treino pesado e conheço as execuções.", icon: "rocket" },
  ];

  const FREQUENCIAS = [
    { id: "1-2", titulo: "1 a 2 dias", icon: "calendar-outline" },
    { id: "3-4", titulo: "3 a 4 dias", icon: "calendar-outline" },
    { id: "5-6", titulo: "5 a 6 dias", icon: "flame-outline" },
    { id: "7", titulo: "Todos os dias", icon: "flash-outline" },
  ];

  useEffect(() => {
    async function carregarDadosIniciais() {
      if (!conexaoId) {
        Alert.alert("Erro", "Conexão não encontrada.");
        return navigation.goBack();
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setAlunoIdAuth(user.id);

        const { data: conexao } = await supabase
          .from("conexoes")
          .select("personal_id")
          .eq("id", conexaoId)
          .single();

        if (conexao?.personal_id) {
          const { data: personal } = await supabase
            .from("personals")
            .select("id, nome, foto_url")
            .eq("id", conexao.personal_id)
            .single();
            
          if (personal) setPersonalInfo(personal);
        }
      } catch (error) {
        console.log("Erro ao buscar dados:", error);
      }
    }
    carregarDadosIniciais();
  }, [conexaoId]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria para selecionar a foto.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3, 
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFotoAluno(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a foto.");
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

  const formatarPeso = (t) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarMetaPeso = (t) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t) => setAltura(t.replace(/[^0-9]/g, ""));

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!telefone || !dataNascimento || !peso || !altura || !metaPeso || !cidade) {
        return Alert.alert("Atenção", "Preencha todos os campos, incluindo sua cidade, para o cálculo de IMC e metas.");
      }
      setStep(3);
    } else if (step === 3) {
      if (!objetivo || !nivel) {
        return Alert.alert("Atenção", "Selecione seu objetivo principal e seu nível de experiência.");
      }
      setStep(4);
    } else if (step === 4) {
      if (!diasTreino) {
        return Alert.alert("Atenção", "Defina quantos dias por semana pretende treinar.");
      }
      setStep(5);
    }
  };

  const handleFinalizar = async () => {
    if (temRestricao === null)
      return Alert.alert("Atenção", "Informe sua condição de saúde.");
    if (temRestricao && detalhes.trim() === "")
      return Alert.alert("Atenção", "Por favor, detalhe sua restrição médica para a sua segurança.");

    setLoading(true);
    try {
      let dataBanco = null;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const { data: userAtual } = await supabase
        .from("usuarios")
        .select("preferencias")
        .eq("id", alunoIdAuth)
        .single();

      const preferenciasAntigas = userAtual?.preferencias || {};

      const payloadUsuario = {
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        preferencias: {
          ...preferenciasAntigas,
          frequencia_semanal: diasTreino,
          meta_peso: metaPeso ? parseFloat(metaPeso) : null,
        }
      };

      if (fotoAluno) {
        payloadUsuario.foto_url = fotoAluno;
      }

      const { error: errorUser } = await supabase
        .from("usuarios")
        .update(payloadUsuario)
        .eq("id", alunoIdAuth);

      if (errorUser) throw errorUser;

      const { error: errorAnamnese } = await supabase.from("anamneses").insert([
        {
          usuario_id: alunoIdAuth,
          personal_id: personalInfo.id,
          objetivo: objetivo,
          nivel_experiencia: nivel,
          tem_restricao: temRestricao,
          detalhes_restricao: temRestricao ? detalhes.trim() : null,
        },
      ]);

      if (errorAnamnese) throw errorAnamnese;

      navigation.reset({
        index: 0,
        routes: [{ name: "PropostaAluno", params: { conexaoId: conexaoId } }],
      });
      
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao salvar seus dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.glowTop} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.btnBack, step === 1 && { opacity: 0 }]} 
          onPress={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <Text style={styles.stepText}>ETAPA {step} DE {totalPassos}</Text>
          <View style={styles.progressContainer}>
            <LinearGradient 
              colors={[theme.colors.primary, "#FF8C00"]} 
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={[styles.progressBar, { width: `${(step / totalPassos) * 100}%` }]} 
            />
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainerCenter}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              {personalInfo?.foto_url ? (
                <Image source={{ uri: personalInfo.foto_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#333" />
                </View>
              )}
              <View style={styles.badgeSuccess}>
                <Ionicons name="checkmark-sharp" size={16} color="#FFF" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Conexão <Text style={styles.titleHighlight}>Estabelecida</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Você acaba de se conectar ao time do treinador <Text style={styles.highlight}>{personalInfo?.nome?.split(" ")[0] || "Personal"}</Text>.
            </Text>
            
            <View style={styles.photoSection}>
              <Text style={styles.featuresTitle}>Sua Foto de Perfil</Text>
              <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage} activeOpacity={0.8}>
                {fotoAluno ? (
                  <Image source={{ uri: fotoAluno }} style={styles.photoSelected} />
                ) : (
                  <View style={styles.photoPlaceholderUI}>
                    <Ionicons name="camera" size={28} color="#888" />
                  </View>
                )}
                <Text style={styles.photoBtnText}>{fotoAluno ? "Alterar Foto" : "Selecionar Foto"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>O que vai acontecer agora?</Text>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="body" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Mapeamento Físico</Text>
                  <Text style={styles.featureItemDesc}>Vamos colher seus dados para criar um ponto de partida exato.</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="compass" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Alinhamento de Metas</Text>
                  <Text style={styles.featureItemDesc}>Definiremos seu objetivo para direcionar a estratégia do treino.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="star" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Proposta VIP</Text>
                  <Text style={styles.featureItemDesc}>O professor enviará seu contrato digital para liberar o acesso total.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Métricas e <Text style={styles.titleHighlight}>Contato</Text></Text>
            <Text style={styles.sectionSubtitle}>Precisamos do seu ponto de partida para que o professor trace a melhor rota para o seu resultado.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Onde você mora?</Text>
              <View style={[styles.inputBox, inputFocado === "cidade" && styles.inputBoxFocused]}>
                <Ionicons name="location-outline" size={18} color={inputFocado === "cidade" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === 'web' && { outlineStyle: "none" }]}
                  placeholder="Ex: São Paulo, SP"
                  placeholderTextColor="#555"
                  autoCapitalize="words"
                  value={cidade}
                  onChangeText={setCidade}
                  onFocus={() => setInputFocado("cidade")}
                  onBlur={() => setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nascimento</Text>
                <View style={[styles.inputBox, inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <Ionicons name="calendar-outline" size={18} color={inputFocado === "nasc" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
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
                <Text style={styles.label}>WhatsApp</Text>
                <View style={[styles.inputBox, inputFocado === "whats" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color={inputFocado === "whats" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="(00) 00000"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={telefone}
                    onChangeText={formatarWhatsApp}
                    onFocus={() => setInputFocado("whats")}
                    onBlur={() => setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.label}>Biometria Atual</Text>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={[styles.inputBox, inputFocado === "altura" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="human-male-height" size={20} color={inputFocado === "altura" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="Altura"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
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

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={[styles.inputBox, inputFocado === "peso" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={inputFocado === "peso" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="Peso"
                    placeholderTextColor="#555"
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
            </View>

            <View style={styles.targetWeightBox}>
              <View style={styles.targetIconBox}>
                <Ionicons name="flag" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.targetTitle}>Qual a sua meta de peso?</Text>
                <View style={styles.targetInputContainer}>
                  <TextInput
                    style={[styles.targetInput, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="Ex: 70.0"
                    placeholderTextColor="#555"
                    keyboardType="decimal-pad"
                    maxLength={6}
                    value={metaPeso}
                    onChangeText={formatarMetaPeso}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.targetSuffix}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Seu <Text style={styles.titleHighlight}>Direcionamento</Text></Text>
            <Text style={styles.sectionSubtitle}>Defina o foco central do seu treinamento para que a estratégia e a metodologia sejam exatas.</Text>

            <Text style={styles.label}>Objetivo Principal</Text>
            <View style={styles.gridContainer}>
              {OBJETIVOS.map((item) => {
                const isSelected = objetivo === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, isSelected && styles.premiumCardActive]}
                    onPress={() => setObjetivo(item.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={18} />}
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive]}>
                      <FontAwesome5 name={item.icon} size={18} color={isSelected ? theme.colors.backgroundPure : "#888"} />
                    </View>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>{item.titulo}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />
            <Text style={styles.label}>Nível de Experiência Física</Text>
            
            <View style={styles.gridContainer}>
              {NIVEIS.map((item) => {
                const isSelected = nivel === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, { width: '100%', flexDirection: 'row', alignItems: 'center' }, isSelected && styles.premiumCardActive]}
                    onPress={() => setNivel(item.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={18} />}
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive, { marginBottom: 0, marginRight: 16 }]}>
                      <FontAwesome5 name={item.icon} size={18} color={isSelected ? theme.colors.backgroundPure : "#888"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive, { marginBottom: 2 }]}>{item.titulo}</Text>
                      <Text style={styles.cardDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Sua <Text style={styles.titleHighlight}>Frequência</Text></Text>
            <Text style={styles.sectionSubtitle}>Seja realista com a sua rotina. O volume de treino será distribuído pelos dias que você marcar abaixo.</Text>

            <View style={styles.gridContainer}>
              {FREQUENCIAS.map((item) => {
                const isSelected = diasTreino === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, { width: '100%', flexDirection: 'row', alignItems: 'center' }, isSelected && styles.premiumCardActive]}
                    onPress={() => setDiasTreino(item.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={18} />}
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive, { marginBottom: 0, marginRight: 16 }]}>
                      <Ionicons name={item.icon} size={20} color={isSelected ? theme.colors.backgroundPure : "#888"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive, { marginBottom: 0 }]}>{item.titulo}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconBox}><Ionicons name="bulb" size={20} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Lembre-se</Text>
                <Text style={styles.tipDesc}>A constância bate a intensidade. Treinar bem 3 vezes por semana traz mais resultados do que treinar 6 vezes e desistir no primeiro mês.</Text>
              </View>
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Atenção à <Text style={styles.titleHighlight}>Saúde</Text></Text>
            <Text style={styles.sectionSubtitle}>Sua segurança dita o ritmo. Informações médicas são essenciais para estruturarmos o plano e evitar lesões.</Text>

            <Text style={[styles.label, { textAlign: 'center', marginBottom: 15 }]}>Possui dores crônicas, lesões ou laudo médico?</Text>
            
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, temRestricao === false && styles.yesNoBtnGreen]}
                onPress={() => { setTemRestricao(false); setDetalhes(""); }}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={28} color={temRestricao === false ? "#00E676" : "#444"} style={{ marginBottom: 8 }} />
                <Text style={[styles.yesNoText, temRestricao === false && { color: "#00E676" }]}>Não, 100% Saudável</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.yesNoBtn, temRestricao === true && styles.yesNoBtnRed]}
                onPress={() => setTemRestricao(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="alert-circle" size={28} color={temRestricao === true ? "#FF3B30" : "#444"} style={{ marginBottom: 8 }} />
                <Text style={[styles.yesNoText, temRestricao === true && { color: "#FF3B30" }]}>Sim, possuo restrição</Text>
              </TouchableOpacity>
            </View>

            {temRestricao && (
              <View style={styles.detalhesArea}>
                <Text style={styles.label}>Por favor, detalhe sua condição:</Text>
                <View style={styles.textAreaBox}>
                  <TextInput
                    style={[styles.textArea, Platform.OS === 'web' && { outlineStyle: "none" }]}
                    placeholder="Ex: Condromalácia patelar grau 2 no joelho esquerdo, dor na lombar ao agachar..."
                    placeholderTextColor="#555"
                    multiline
                    keyboardAppearance="dark"
                    value={detalhes}
                    onChangeText={setDetalhes}
                  />
                </View>
              </View>
            )}

            {!temRestricao && temRestricao !== null && (
               <View style={[styles.tipCard, { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" }]}>
                 <View style={[styles.tipIconBox, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}><Ionicons name="shield-checkmark" size={20} color="#00E676" /></View>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.tipTitle, { color: "#00E676" }]}>Tudo Certo!</Text>
                   <Text style={styles.tipDesc}>Excelente. Sem restrições de saúde, o seu professor tem carta branca para montar um treino de alta performance para o seu objetivo.</Text>
                 </View>
               </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={step === totalPassos ? handleFinalizar : handleNext}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.btnPrimaryText}>
                  {step === totalPassos ? "Enviar Perfil ao Professor" : "Avançar"}
                </Text>
                {step < totalPassos && <Ionicons name="arrow-forward" size={20} color="#000" style={{ marginLeft: 8 }} />}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  glowTop: { position: "absolute", top: -100, alignSelf: "center", width: width, height: 200, backgroundColor: theme.colors.primary, opacity: 0.15, blurRadius: 100 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  btnBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  
  progressWrapper: { flex: 1, alignItems: "center", paddingHorizontal: 15 },
  stepText: { color: "#888", fontSize: moderateScale(10), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  progressContainer: { width: "100%", height: 4, backgroundColor: "#222", borderRadius: 2, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 2 },

  scrollContent: { flexGrow: 1, paddingHorizontal: scale(24), paddingBottom: verticalScale(40) },
  
  stepContainerCenter: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -verticalScale(20) },
  stepContainerTop: { flex: 1, justifyContent: "flex-start", paddingTop: verticalScale(25) },

  avatarWrapper: { position: "relative", marginBottom: verticalScale(35) },
  avatarGlow: { position: "absolute", top: -10, left: -10, right: -10, bottom: -10, backgroundColor: theme.colors.primary, opacity: 0.3, blurRadius: 20, borderRadius: 100 },
  avatarImage: { width: scale(130), height: scale(130), borderRadius: scale(65), borderWidth: 2, borderColor: theme.colors.primary },
  avatarPlaceholder: { width: scale(130), height: scale(130), borderRadius: scale(65), backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: theme.colors.primary },
  badgeSuccess: { position: "absolute", bottom: 0, right: 8, backgroundColor: "#00E676", width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000" },

  photoSection: { width: "100%", backgroundColor: "#0A0A0A", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#222", marginTop: 10 },
  photoBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  photoSelected: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: theme.colors.primary, marginBottom: 12 },
  photoPlaceholderUI: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#333", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  photoBtnText: { color: theme.colors.primary, fontSize: 13, fontWeight: "bold", textTransform: "uppercase" },

  sectionTitle: { color: "#FFF", fontSize: moderateScale(26), fontFamily: theme.fonts.title, marginBottom: verticalScale(10), textAlign: "center", letterSpacing: -0.5 },
  titleHighlight: { color: theme.colors.primary },
  sectionSubtitle: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(22), textAlign: "center", marginBottom: verticalScale(30), paddingHorizontal: scale(10) },
  
  featuresContainer: { width: '100%', backgroundColor: "#0A0A0A", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "#222", marginTop: 10 },
  featuresTitle: { color: "#FFF", fontSize: 16, fontFamily: theme.fonts.title, marginBottom: 20, textAlign: 'center' },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  featureIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 16, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  featureItemTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  featureItemDesc: { color: "#888", fontSize: 13, lineHeight: 18 },

  label: { color: "#888", fontSize: moderateScale(11), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(10), marginLeft: scale(4), letterSpacing: 0.5 },
  
  inputGroup: { marginBottom: verticalScale(20) },
  rowInputs: { flexDirection: "row" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#222", paddingHorizontal: scale(14), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginRight: scale(10) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%" },
  suffix: { color: "#666", fontWeight: "bold", fontSize: moderateScale(15), marginLeft: scale(8) },

  targetWeightBox: { flexDirection: "row", backgroundColor: "rgba(255, 107, 0, 0.08)", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", alignItems: "center", marginTop: verticalScale(10) },
  targetIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.2)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  targetTitle: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "bold", marginBottom: 8 },
  targetInputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.primary, paddingBottom: 4 },
  targetInput: { flex: 1, color: "#FFF", fontSize: moderateScale(20), fontWeight: "900" },
  targetSuffix: { color: theme.colors.primary, fontWeight: "bold", fontSize: moderateScale(16) },

  divider: { height: 1, backgroundColor: "#222", marginVertical: verticalScale(25) },

  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: scale(12) },
  premiumCard: { width: "48%", backgroundColor: "#111", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  premiumCardActive: { borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(12), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardIconWrapActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  cardTitle: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", marginBottom: verticalScale(4) },
  cardTitleActive: { color: theme.colors.primary },
  cardDesc: { color: "#666", fontSize: moderateScale(11), lineHeight: moderateScale(16) },

  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#444", justifyContent: "center", alignItems: "center" },
  radioCircleActive: { borderColor: theme.colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },

  yesNoContainer: { flexDirection: "row", gap: scale(12), marginBottom: verticalScale(20) },
  yesNoBtn: { flex: 1, backgroundColor: "#111", paddingVertical: verticalScale(24), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", alignItems: "center" },
  yesNoBtnGreen: { backgroundColor: "rgba(0, 230, 118, 0.08)", borderColor: "#00E676" },
  yesNoBtnRed: { backgroundColor: "rgba(255, 59, 48, 0.08)", borderColor: "#FF3B30" },
  yesNoText: { color: "#888", fontSize: moderateScale(14), fontWeight: "bold" },

  detalhesArea: { marginTop: verticalScale(10), animation: "fadeIn 0.3s ease-in-out" },
  textAreaBox: { backgroundColor: "#111", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#FF3B30", padding: scale(16), height: verticalScale(120) },
  textArea: { flex: 1, color: "#FFF", fontSize: moderateScale(15), textAlignVertical: "top", lineHeight: moderateScale(22) },

  tipCard: { flexDirection: "row", backgroundColor: "rgba(255, 107, 0, 0.08)", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)", marginTop: 25 },
  tipIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  tipTitle: { color: theme.colors.primary, fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  tipDesc: { color: "#CCC", fontSize: 12, lineHeight: 18 },

  footer: { paddingHorizontal: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(24), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  btnPrimary: { borderRadius: moderateScale(18), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnGradient: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});