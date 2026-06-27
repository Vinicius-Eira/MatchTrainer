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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", desc: "Perder gordura, secar e definir.", icon: "flame-outline" },
  { id: "hipertrofia", titulo: "Hipertrofia", desc: "Ganhar massa muscular e volume.", icon: "barbell-outline" },
  { id: "saude", titulo: "Saúde e Qualidade", desc: "Postura, reabilitação e bem-estar.", icon: "heart-outline", hasSub: true },
  { id: "performance", titulo: "Performance", desc: "Melhorar no meu esporte.", icon: "trophy-outline", hasSub: true },
];

const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante Total", desc: "Nunca treinei ou parei faz muitos anos.", icon: "leaf-outline" },
  { id: "inconstante", titulo: "Inconstante", desc: "Vou e volto, não consigo manter rotina.", icon: "pulse-outline" },
  { id: "intermediario", titulo: "Intermediário", desc: "Treino sempre, mas sinto que estagnei.", icon: "fitness-outline" },
  { id: "avancado", titulo: "Avançado", desc: "Treino pesado, busco alta performance.", icon: "rocket-outline" },
];

const OPCOES_LIMITACAO = [
  { id: "gestante", titulo: "Gestante / Pós-parto", desc: "Preciso de um treino adaptado e seguro.", icon: "woman-outline" },
  { id: "lesao", titulo: "Lesões ou Dores", desc: "Desconforto articular ou muscular.", icon: "bandage-outline", hasSub: true },
  { id: "clinica", titulo: "Condição Clínica", desc: "Hipertensão, diabetes, asma, etc.", icon: "medkit-outline", hasSub: true },
  { id: "nenhuma", titulo: "Nenhuma Restrição", desc: "Estou 100% liberado(a) para tudo.", icon: "checkmark-circle-outline" },
];

const OPCOES_PERFIL = [
  { id: "acolhedor", titulo: "O Acolhedor", desc: "Paciente, respeita meu ritmo e foca no bem-estar.", icon: "happy-outline" },
  { id: "motivador", titulo: "O Motivador", desc: "Intenso, me puxa ao limite e não deixa desistir.", icon: "megaphone-outline" },
  { id: "tecnico", titulo: "O Professor", desc: "Foca em biomecânica, ensina o porquê de tudo.", icon: "school-outline" },
  { id: "estrategista", titulo: "O Estrategista", desc: "Foco 100% em planilhas, metas e progressão.", icon: "stats-chart-outline" },
];

const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias por semana", desc: "Minha rotina é apertada, mas quero começar.", icon: "calendar-outline" },
  { id: "3-4", titulo: "3 a 4 dias por semana", desc: "Consigo manter uma constância saudável.", icon: "calendar-outline" },
  { id: "5-6", titulo: "5 a 6 dias por semana", desc: "Foco quase diário. Treino é prioridade.", icon: "flame-outline" },
  { id: "7", titulo: "Todos os dias", desc: "Não descanso, quero treino intenso todo dia.", icon: "flash-outline" },
];

const OPCOES_LOCAL = [
  { id: "academia", titulo: "Academia Comercial", desc: "Redes (SmartFit, etc) ou academias de bairro.", icon: "barbell-outline" },
  { id: "condominio", titulo: "Academia do Condomínio", desc: "No meu prédio, com a estrutura de lá.", icon: "business-outline" },
  { id: "casa", titulo: "Em Casa / Apartamento", desc: "Treino com peso do corpo ou acessórios próprios.", icon: "home-outline" },
  { id: "ar_livre", titulo: "Ao Ar Livre / Parques", desc: "Praças, parques, praias ou quadras.", icon: "leaf-outline" },
];

const OPCOES_INVESTIMENTO = [
  { id: "base", titulo: "R$ 90 a R$ 110 / aula", desc: "Valor inicial para excelentes profissionais.", icon: "wallet-outline" },
  { id: "mid", titulo: "R$ 120 a R$ 150 / aula", desc: "Profissionais especialistas e com alta procura.", icon: "star-outline" },
  { id: "premium", titulo: "A partir de R$ 160 / aula", desc: "Treinadores Elite e atendimento super VIP.", icon: "diamond-outline" },
  { id: "pacote", titulo: "Prefiro Pacote Mensal", desc: "Quero negociar um valor fixo por mês.", icon: "briefcase-outline" },
];

// --- SUB-OPÇÕES AGORA COM ÍCONES ---
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
  const totalSteps = 7; 

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

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

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada");
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

      const preferencias = {
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

  const OptionCard = ({ item, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.neonAtivo]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.cardIconBox, isSelected && styles.cardIconBoxSelected]}>
        <Ionicons
          name={item.icon}
          size={28}
          color={isSelected ? theme.colors.backgroundPure : theme.colors.primary}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
          {item.titulo}
        </Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  const TipBox = ({ title, text, icon }) => (
    <View style={styles.tipBox}>
      <View style={styles.tipIconBox}>
        <Ionicons name={icon || "bulb"} size={22} color={theme.colors.backgroundPure} />
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
            style={[styles.chip, isSelected && styles.neonAtivo]}
            onPress={() => toggleMultiSelect(opt.titulo, stateArray, setStateArray)}
            activeOpacity={0.7}
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

  const isAvançarDesabilitado = () => {
    if (loading) return true;
    if (step === 1 && (!objetivo || (objetivo?.hasSub && subObjetivo.length === 0))) return true;
    if (step === 2 && !historico) return true;
    if (step === 3) {
      if (!limitacao) return true;
      if (limitacao?.hasSub && subLimitacao.length === 0) return true;
      if (limitacao?.hasSub && subLimitacao.includes("Outra") && !outraLimitacaoTexto.trim()) return true;
    }
    if (step === 4 && !perfilPersonal) return true;
    if (step === 5 && !frequencia) return true;
    if (step === 6 && !localTreino) return true; 
    if (step === 7 && !investimento) return true;
    return false;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {step === 0 ? "PERFIL PESSOAL" : `CONSULTORIA • ${step}/${totalSteps}`}
        </Text>
      </View>

      {step > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Bem-vindo!</Text>
            <Text style={styles.subTitle}>Vamos criar o seu perfil para encontrarmos o treinador perfeito para você.</Text>

            <View style={styles.photoSection}>
              <TouchableOpacity onPress={escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={55} color={theme.colors.textMuted} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color={theme.colors.backgroundPure} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <TextInput style={styles.inputPremium} placeholder="Como quer ser chamado?" placeholderTextColor={theme.colors.textMuted} value={nome} onChangeText={setNome} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <Text style={styles.inputLabel}>Nascimento *</Text>
                <TextInput style={styles.inputPremium} placeholder="DD/MM/AAAA" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" maxLength={10} value={dataNascimento} onChangeText={formatarData} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>WhatsApp *</Text>
                <TextInput style={styles.inputPremium} placeholder="(11) 99999-9999" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" value={telefone} onChangeText={formatarWhatsApp} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sua Localização *</Text>
              <View style={styles.locationBox}>
                <Ionicons name="location-outline" size={22} color={theme.colors.primary} style={{ marginLeft: 15 }} />
                <TextInput style={styles.locationInput} placeholder="Bairro e Cidade" placeholderTextColor={theme.colors.textMuted} value={cidade} onChangeText={setCidade} />
                <TouchableOpacity style={styles.btnGpsPremium} onPress={buscarLocalizacao}>
                  {buscandoLocal ? (
                    <ActivityIndicator size="small" color={theme.colors.backgroundPure} />
                  ) : (
                    <Text style={styles.btnGpsText}>GPS</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.inputLabel}>Biometria (Opcional)</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 15 }}>Esses dados ajudam o professor a estruturar melhor seu treino.</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                <View style={styles.inputWithSuffix}>
                  <TextInput style={styles.inputNoBorder} placeholder="Peso" placeholderTextColor={theme.colors.textMuted} keyboardType="decimal-pad" maxLength={6} value={peso} onChangeText={formatarPeso} />
                  <Text style={styles.suffix}>kg</Text>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <View style={styles.inputWithSuffix}>
                  <TextInput style={styles.inputNoBorder} placeholder="Altura" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" maxLength={3} value={altura} onChangeText={formatarAltura} />
                  <Text style={styles.suffix}>cm</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Qual é o seu principal objetivo?</Text>
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

            <TipBox title="Foco é tudo" text="A maioria dos alunos atinge resultados mais rápido quando define um único grande objetivo." />
          </View>
        )}

        {step === 2 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Como é o seu histórico com treinos?</Text>
            <Text style={styles.subTitle}>Seja totalmente sincero. Aqui não há julgamentos, apenas a preparação para o plano adequado.</Text>

            {OPCOES_HISTORICO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={historico?.id === item.id} onPress={() => setHistorico(item)} />
            ))}

            <TipBox title="Sinceridade gera resultados" text="Personais ajustam a carga inicial com base no que você marca aqui para evitar frustrações." icon="trending-up" />
          </View>
        )}

        {step === 3 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Possui alguma limitação?</Text>
            <Text style={styles.subTitle}>Sua segurança e saúde vêm em primeiro lugar. Profissionais qualificados saberão contornar isso.</Text>

            {OPCOES_LIMITACAO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={limitacao?.id === item.id} onPress={() => { setLimitacao(item); setSubLimitacao([]); setOutraLimitacaoTexto(""); }} />
            ))}

            {limitacao?.id === "lesao" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Onde é o foco da sua dor?</Text>
                {renderChipsComIcone(SUB_LESAO, subLimitacao, setSubLimitacao)}
                {subLimitacao.includes("Outra") && (
                  <View style={[styles.inputGroup, { marginTop: 15, marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual? Descreva brevemente..." placeholderTextColor={theme.colors.textMuted} value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} />
                  </View>
                )}
              </View>
            )}

            {limitacao?.id === "clinica" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Qual condição o treinador precisa saber?</Text>
                {renderChipsComIcone(SUB_CLINICA, subLimitacao, setSubLimitacao)}
                {subLimitacao.includes("Outra") && (
                  <View style={[styles.inputGroup, { marginTop: 15, marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual condição? Descreva..." placeholderTextColor={theme.colors.textMuted} value={outraLimitacaoTexto} onChangeText={setOutraLimitacaoTexto} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {step === 4 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>O treinador ideal pra você é...</Text>
            <Text style={styles.subTitle}>Além do treino, a conexão pessoal e o estilo de ensino fazem toda a diferença na motivação diária.</Text>

            {OPCOES_PERFIL.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={perfilPersonal?.id === item.id} onPress={() => setPerfilPersonal(item)} />
            ))}

            <TipBox title="Conexão Perfeita" text="Nós cruzamos o seu perfil com as avaliações que outros alunos deixaram sobre os personais." icon="people" />
          </View>
        )}

        {step === 5 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Sua disponibilidade</Text>
            <Text style={styles.subTitle}>Seja realista com sua agenda. O seu treinador vai periodizar os estímulos com base nessa frequência.</Text>

            {OPCOES_FREQUENCIA.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={frequencia?.id === item.id} onPress={() => setFrequencia(item)} />
            ))}

            <TipBox title="Menos é mais?" text="Treinar bem 3 vezes na semana é muito mais eficiente do que tentar ir 6 dias e desistir no primeiro mês." icon="time" />
          </View>
        )}

        {step === 6 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Onde você prefere treinar?</Text>
            <Text style={styles.subTitle}>Isso nos ajuda a encontrar personais que atendem perfeitamente no seu ambiente escolhido.</Text>

            {OPCOES_LOCAL.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={localTreino?.id === item.id} onPress={() => setLocalTreino(item)} />
            ))}

            <TipBox title="Treino Inteligente" text="Mesmo em casa ou no condomínio é possível ter resultados incríveis se a estratégia for montada pelo profissional certo." icon="location" />
          </View>
        )}

        {step === 7 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Investimento</Text>
            <Text style={styles.subTitle}>Nós mostraremos apenas os profissionais que se encaixam na sua faixa de orçamento escolhida.</Text>

            {OPCOES_INVESTIMENTO.map((item) => (
              <OptionCard key={item.id} item={item} isSelected={investimento?.id === item.id} onPress={() => setInvestimento(item)} />
            ))}

            <TipBox title="Valor vs Preço" text="Todos os personais do aplicativo passam por validação de CREF ativo. Você estará sempre em boas mãos." icon="shield-checkmark" />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnAvançar, isAvançarDesabilitado() && { backgroundColor: theme.colors.surfaceLight, opacity: 0.8 }]}
          onPress={step === 7 ? handleFinalizar : nextStep}
          disabled={isAvançarDesabilitado()}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.backgroundPure} />
          ) : (
            <View style={styles.btnAvançarInner}>
              <Text style={[styles.btnAvançarText, isAvançarDesabilitado() && { color: theme.colors.textMuted }]}>
                {step === 7 ? "Finalizar Consultoria" : "Avançar"}
              </Text>
              {step < 7 && (
                <Ionicons name="arrow-forward" size={20} color={isAvançarDesabilitado() ? theme.colors.textMuted : theme.colors.backgroundPure} />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 20,
    backgroundColor: theme.colors.background, zIndex: 10,
  },
  btnBack: { position: "absolute", left: 15, bottom: 15, padding: 5 },
  headerTitle: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "900", letterSpacing: 2 },

  progressContainer: { height: 3, backgroundColor: theme.colors.surfaceLight, width: "100%" },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary },

  content: { padding: 24, paddingBottom: 120 },
  fadeContainer: { flex: 1 },

  mainTitle: { color: theme.colors.text, fontSize: 28, fontFamily: theme.fonts.title, marginBottom: 8 },
  subTitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 30 },

  photoSection: { alignItems: "center", marginBottom: 35 },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: theme.colors.background },

  inputGroup: { marginBottom: 20 },
  row: { flexDirection: "row" },
  inputLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "bold", textTransform: "uppercase", marginBottom: 10, marginLeft: 5 },
  inputPremium: { backgroundColor: theme.colors.surface, borderRadius: 16, color: theme.colors.text, fontSize: 16, padding: 18, borderWidth: 1, borderColor: theme.colors.border },

  locationBox: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  locationInput: { flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 18, paddingHorizontal: 12 },
  btnGpsPremium: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8 },
  btnGpsText: { color: theme.colors.backgroundPure, fontWeight: "bold", fontSize: 13 },

  inputWithSuffix: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  inputNoBorder: { flex: 1, color: theme.colors.text, fontSize: 16, padding: 18 },
  suffix: { color: theme.colors.textMuted, fontWeight: "bold", marginRight: 18, fontSize: 16 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 25 },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  cardIconBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: theme.colors.surfaceLight, justifyContent: "center", alignItems: "center", marginRight: 16 },
  cardIconBoxSelected: { backgroundColor: theme.colors.primary },
  cardContent: { flex: 1, paddingRight: 10 },
  cardTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "bold", marginBottom: 4 },
  cardTitleSelected: { color: theme.colors.primary },
  cardDesc: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
  
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.borderLight, justifyContent: "center", alignItems: "center" },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },

  subBox: { backgroundColor: theme.colors.surfaceLight, padding: 20, borderRadius: 20, marginTop: 4, marginBottom: 24, borderWidth: 1, borderColor: theme.colors.border },
  subBoxTitle: { color: theme.colors.textBody, fontSize: 14, fontWeight: "600", marginBottom: 16 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  chipTexto: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "600" },
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

  tipBox: { backgroundColor: theme.colors.primaryLight, borderRadius: 16, padding: 20, flexDirection: "row", marginTop: 10 },
  tipIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center", marginRight: 15 },
  tipTextContainer: { flex: 1 },
  tipTitle: { color: theme.colors.primary, fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  tipText: { color: theme.colors.textBody, fontSize: 13, lineHeight: 18 },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.background, padding: 24, paddingTop: 15, borderTopWidth: 1, borderTopColor: theme.colors.border },
  btnAvançar: { backgroundColor: theme.colors.primary, height: 60, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  btnAvançarInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnAvançarText: { color: theme.colors.backgroundPure, fontSize: 16, fontWeight: "900", textTransform: "uppercase" },
});