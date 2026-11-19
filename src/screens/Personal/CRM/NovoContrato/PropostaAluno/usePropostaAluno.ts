import { useEffect, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
import { supabase } from "../../../../../services/supabase";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

async function buscarPropostaPorConexao(conexaoId: string) {
  const { data: conexao, error: errConn } = await supabase
    .from("conexoes")
    .select("usuario_id, personal_id, status")
    .eq("id", conexaoId)
    .single();

  if (errConn || !conexao) {
    throw new Error("Não foi possível encontrar este vínculo.");
  }

  const [{ data: personal }, { data: contrato, error: errContrato }] = await Promise.all([
    supabase
      .from("personals")
      .select("nome, foto_url, cref_verificado")
      .eq("id", conexao.personal_id)
      .maybeSingle(),
    supabase
      .from("planos")
      .select("*")
      .eq("conexao_id", conexaoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (errContrato) {
    throw new Error(errContrato.message);
  }

  if (!contrato) {
    throw new Error("Nenhuma proposta comercial encontrada para esta conexão.");
  }

  return {
    personalNome: personal?.nome || "Treinador",
    personalFoto: personal?.foto_url || null,
    personalVerificado: Boolean(personal?.cref_verificado),
    proposta: contrato,
  };
}

export function usePropostaAluno(route: any, navigation: any) {
  const conexaoId = route?.params?.conexaoId;

  const [proposta, setProposta] = useState<any>(null);
  const [personalNome, setPersonalNome] = useState<string>("Treinador");
  const [personalFoto, setPersonalFoto] = useState<string | null>(null);
  const [personalVerificado, setPersonalVerificado] = useState<boolean>(false);
  const [regrasExpandidas, setRegrasExpandidas] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState<boolean>(false);

  useEffect(() => {
    let ativo = true;

    if (!conexaoId) {
      Alert.alert("Erro de Rota", "Nenhuma conexão encontrada.");
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      return;
    }

    const carregar = () => {
      buscarPropostaPorConexao(conexaoId)
        .then((res) => {
          if (!ativo) return;
          setPersonalNome(res.personalNome);
          setPersonalFoto(res.personalFoto);
          setPersonalVerificado(res.personalVerificado);
          setProposta(res.proposta);
        })
        .catch((error: any) => {
          if (!ativo) return;
          Alert.alert(
            "Proposta Indisponível",
            error.message || "Houve um problema ao carregar o contrato."
          );
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        })
        .finally(() => {
          if (ativo) setLoadingData(false);
        });
    };

    carregar();
    const unsubscribe = navigation.addListener("focus", carregar);

    return () => {
      ativo = false;
      unsubscribe();
    };
  }, [conexaoId, navigation]);

  const toggleRegras = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRegrasExpandidas((prev) => !prev);
  };

  const handleAceitarProposta = async () => {
    if (!proposta?.id || !conexaoId) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc("aceitar_contrato_aluno", {
        p_conexao_id: conexaoId,
        p_plano_id: proposta.id,
      });

      if (error) throw error;

      setProposta((prev: any) => (prev ? { ...prev, status: "ativo" } : prev));
      setModalSucessoVisivel(true);
    } catch (error: any) {
      Alert.alert(
        "Erro ao Assinar",
        error.message || "Tivemos um problema ao oficializar a assinatura. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNegociar = () => {
    navigation.navigate("Chat", {
      conexaoId,
      nomeOutro: personalNome,
      fotoOutro: personalFoto,
      tipoUsuarioLogado: "aluno",
    });
  };

  return {
    state: {
      proposta,
      personalNome,
      personalFoto,
      personalVerificado,
      regrasExpandidas,
      loadingData,
      loading,
      modalSucessoVisivel,
      conexaoId,
    },
    actions: {
      toggleRegras,
      handleAceitarProposta,
      handleNegociar,
      setModalSucessoVisivel,
      navigation,
    },
  };
}