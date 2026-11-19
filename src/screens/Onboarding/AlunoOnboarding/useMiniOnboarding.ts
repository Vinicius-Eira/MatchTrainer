import { useEffect, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../services/supabase";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function base64ParaUint8Array(base64: string): Uint8Array {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const limpo = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const output: number[] = [];

  for (let i = 0; i < limpo.length; i += 4) {
    const enc1 = chars.indexOf(limpo.charAt(i));
    const enc2 = chars.indexOf(limpo.charAt(i + 1));
    const enc3 = chars.indexOf(limpo.charAt(i + 2));
    const enc4 = chars.indexOf(limpo.charAt(i + 3));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output.push(chr1);
    if (limpo.charAt(i + 2) !== "=" && enc3 !== -1) output.push(chr2);
    if (limpo.charAt(i + 3) !== "=" && enc4 !== -1) output.push(chr3);
  }

  return new Uint8Array(output);
}

async function carregarContextoMiniOnboarding(conexaoId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: conexao } = await supabase
    .from("conexoes")
    .select("personal_id")
    .eq("id", conexaoId)
    .maybeSingle();

  let personal = null;
  if (conexao?.personal_id) {
    const { data: pData } = await supabase
      .from("personals")
      .select("id, nome, foto_url")
      .eq("id", conexao.personal_id)
      .maybeSingle();
    personal = pData;
  }

  return {
    alunoId: user?.id || null,
    personalId: conexao?.personal_id || null,
    personal,
  };
}

export function useMiniOnboarding(route: any, navigation: any) {
  const { conexaoId } = route.params || {};

  const totalPassos = 3;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [alunoIdAuth, setAlunoIdAuth] = useState<string | null>(null);

  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const [temRestricao, setTemRestricao] = useState<boolean | null>(null);
  const [detalhes, setDetalhes] = useState("");

  const [fotoAluno, setFotoAluno] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [inputFocado, setInputFocado] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    if (!conexaoId) {
      Alert.alert("Erro", "Conexão não encontrada. Tente validar o convite novamente.");
      navigation.goBack();
      return;
    }

    carregarContextoMiniOnboarding(conexaoId)
      .then((res) => {
        if (!ativo) return;
        if (res.alunoId) setAlunoIdAuth(res.alunoId);
        if (res.personalId) setPersonalId(res.personalId);
        if (res.personal) setPersonalInfo(res.personal);
      })
      .catch((error) => {
        console.log("Erro ao buscar dados do MiniOnboarding:", error);
      });

    return () => {
      ativo = false;
    };
  }, [conexaoId, navigation]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permissão Negada", "Precisamos de acesso à galeria para selecionar a foto.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFotoAluno(result.assets[0].uri);
        setFotoBase64(result.assets[0].base64 || null);
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
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!telefone || !dataNascimento || !peso || !altura || !cidade) {
        return Alert.alert(
          "Atenção",
          "Preencha cidade, data de nascimento, WhatsApp, altura e peso para continuar."
        );
      }
      setStep(3);
    }
  };

  const handleFinalizar = async () => {
    if (temRestricao === null) {
      return Alert.alert("Atenção", "Informe se possui alguma restrição física ou médica.");
    }
    if (temRestricao && detalhes.trim() === "") {
      return Alert.alert("Atenção", "Por favor, detalhe sua restrição para a sua segurança.");
    }
    if (!alunoIdAuth) {
      return Alert.alert("Sessão Inválida", "Faça login novamente para concluir seu perfil.");
    }

    setLoading(true);
    try {
      let dataBanco = null;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let fotoUrlPublica: string | null = null;
      if (fotoBase64) {
        try {
          const caminho = `alunos/${alunoIdAuth}_${Date.now()}.jpg`;
          const bytes = base64ParaUint8Array(fotoBase64);
          const { error: errUpload } = await supabase.storage
            .from("avatars")
            .upload(caminho, bytes, { contentType: "image/jpeg", upsert: true });

          if (!errUpload) {
            const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(caminho);
            fotoUrlPublica = pubData?.publicUrl || null;
          }
        } catch (upErr) {
          console.log("Aviso upload avatar:", upErr);
        }
      }

      const { data: userAtual } = await supabase
        .from("usuarios")
        .select("preferencias")
        .eq("id", alunoIdAuth)
        .maybeSingle();

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
          origem_setup: "convite_direto",
        },
      };

      if (fotoUrlPublica) payloadUsuario.foto_url = fotoUrlPublica;

      const { error: errorUser } = await supabase
        .from("usuarios")
        .update(payloadUsuario)
        .eq("id", alunoIdAuth);
      if (errorUser) throw errorUser;

      const idPersonalFinal = personalInfo?.id || personalId;
      if (idPersonalFinal) {
        const { error: errorAnamnese } = await supabase.from("anamneses").insert([
          {
            usuario_id: alunoIdAuth,
            personal_id: idPersonalFinal,
            objetivo: "Alinhado com o Personal",
            nivel_experiencia: "Definido pelo Personal",
            tem_restricao: temRestricao,
            detalhes_restricao: temRestricao ? detalhes.trim() : null,
          },
        ]);
        if (errorAnamnese) throw errorAnamnese;
      }

      navigation.navigate("PropostaAluno", { conexaoId });
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", error.message || "Falha ao salvar seus dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      step,
      totalPassos,
      loading,
      personalInfo,
      telefone,
      cidade,
      dataNascimento,
      peso,
      altura,
      temRestricao,
      detalhes,
      fotoAluno,
      inputFocado,
    },
    actions: {
      setStep,
      setCidade,
      setTemRestricao,
      setDetalhes,
      setInputFocado,
      handlePickImage,
      formatarWhatsApp,
      formatarData,
      formatarPeso,
      formatarAltura,
      handleNext,
      handleFinalizar,
    },
  };
}