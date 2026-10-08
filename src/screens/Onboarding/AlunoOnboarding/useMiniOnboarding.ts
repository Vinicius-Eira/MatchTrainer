import { useState, useEffect } from "react";
import { Alert, LayoutAnimation, UIManager, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../services/supabase"; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const OBJETIVOS = [
  { id: "Emagrecimento", titulo: "Emagrecimento", desc: "Secar, definir e perder gordura.", icon: "fire" },
  { id: "Hipertrofia", titulo: "Hipertrofia", desc: "Ganhar volume e massa muscular.", icon: "dumbbell" },
  { id: "Saude", titulo: "Saúde e Bem-estar", desc: "Qualidade de vida e longevidade.", icon: "heartbeat" },
  { id: "Performance", titulo: "Performance", desc: "Condicionamento e força bruta.", icon: "bolt" },
];

export const NIVEIS = [
  { id: "Iniciante", titulo: "Iniciante", desc: "Nunca treinei ou estou parado.", icon: "seedling" },
  { id: "Intermediario", titulo: "Intermediário", desc: "Treino com certa regularidade.", icon: "running" },
  { id: "Avancado", titulo: "Avançado", desc: "Treino pesado e conheço as execuções.", icon: "rocket" },
];

export const FREQUENCIAS = [
  { id: "1-2", titulo: "1 a 2 dias", icon: "calendar-outline" },
  { id: "3-4", titulo: "3 a 4 dias", icon: "calendar-outline" },
  { id: "5-6", titulo: "5 a 6 dias", icon: "flame-outline" },
  { id: "7", titulo: "Todos os dias", icon: "flash-outline" },
];

export function useMiniOnboarding(route: any, navigation: any) {
  const { conexaoId } = route.params || {};

  const totalPassos = 5;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [alunoIdAuth, setAlunoIdAuth] = useState<string | null>(null);

  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState(""); 
  const [dataNascimento, setDataNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [metaPeso, setMetaPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [objetivo, setObjetivo] = useState<string | null>(null);
  const [nivel, setNivel] = useState<string | null>(null);
  const [diasTreino, setDiasTreino] = useState<string | null>(null);
  const [temRestricao, setTemRestricao] = useState<boolean | null>(null);
  const [detalhes, setDetalhes] = useState("");
  
  const [fotoAluno, setFotoAluno] = useState<string | null>(null);
  const [inputFocado, setInputFocado] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function carregarDadosIniciais() {
      if (!conexaoId) {
        Alert.alert("Erro", "Conexão VIP não encontrada. Solicite um novo link.");
        return navigation.goBack();
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) setAlunoIdAuth(user.id);

        const { data: conexao } = await supabase.from("conexoes").select("personal_id").eq("id", conexaoId).single();

        if (conexao?.personal_id) {
          const { data: personal } = await supabase.from("perfis").select("id, nome, foto_url").eq("id", conexao.personal_id).single();
          if (personal && isMounted) setPersonalInfo(personal);
        }
      } catch (error) {
        console.log("Erro ao buscar dados:", error);
      }
    }

    Promise.resolve().then(() => {
      if (isMounted) carregarDadosIniciais();
    });

    return () => { isMounted = false; };
  }, [conexaoId]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria para selecionar a foto.');
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

  const formatarWhatsApp = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const formatarData = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };

  const formatarPeso = (t: string) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarMetaPeso = (t: string) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
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
    if (temRestricao === null) return Alert.alert("Atenção", "Informe sua condição de saúde.");
    if (temRestricao && detalhes.trim() === "") return Alert.alert("Atenção", "Por favor, detalhe sua restrição médica para a sua segurança.");

    setLoading(true);
    try {
      let dataBanco = null;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const { data: userAtual } = await supabase.from("usuarios").select("preferencias").eq("id", alunoIdAuth).single();
      const preferenciasAntigas = userAtual?.preferencias || {};

      const payloadUsuario: any = {
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        setup_completo: true, 
        preferencias: {
          ...preferenciasAntigas,
          frequencia_semanal: diasTreino,
          meta_peso: metaPeso ? parseFloat(metaPeso) : null,
          origem_setup: "convite_direto" 
        }
      };

      if (fotoAluno) payloadUsuario.foto_url = fotoAluno;

      const { error: errorUser } = await supabase.from("usuarios").update(payloadUsuario).eq("id", alunoIdAuth);
      if (errorUser) throw errorUser;

      const { error: errorAnamnese } = await supabase.from("anamneses").insert([{
        usuario_id: alunoIdAuth,
        personal_id: personalInfo.id,
        objetivo: objetivo,
        nivel_experiencia: nivel,
        tem_restricao: temRestricao,
        detalhes_restricao: temRestricao ? detalhes.trim() : null,
      }]);

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

  return {
    state: {
      step, totalPassos, loading, personalInfo,
      telefone, cidade, dataNascimento, peso, metaPeso, altura,
      objetivo, nivel, diasTreino, temRestricao, detalhes, fotoAluno, inputFocado
    },
    actions: {
      setStep, setCidade, setObjetivo, setNivel, setDiasTreino, setTemRestricao, setDetalhes, setInputFocado,
      handlePickImage, formatarWhatsApp, formatarData, formatarPeso, formatarMetaPeso, formatarAltura,
      handleNext, handleFinalizar
    }
  };
}