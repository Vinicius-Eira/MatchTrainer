import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { buscarMatchesTop3, PersonalMatchItem } from "../../../services/match/matchService";
import { supabase } from "../../../services/supabase";

export function useFeedPersonal(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscandoRadar, setBuscandoRadar] = useState(false);

  const [personalsExibidos, setPersonalsExibidos] = useState<PersonalMatchItem[]>([]);
  const [distanciaMaxima, setDistanciaMaxima] = useState(20);
  const [isAlunoConsultoria, setIsAlunoConsultoria] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [matchSelecionado, setMatchSelecionado] = useState<PersonalMatchItem | null>(null);

  const [modalNovaPropostaVisivel, setModalNovaPropostaVisivel] = useState(false);
  const [dadosNovaProposta, setDadosNovaProposta] = useState<any>(null);

  const radarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executarBuscaMatches = useCallback(async (maxKm: number, silencioso = false) => {
    if (silencioso) setBuscandoRadar(true);
    try {
      const top3 = await buscarMatchesTop3({ distanciaMaximaKm: maxKm });
      setPersonalsExibidos(top3);
      setCurrentIndex(0);
    } catch (error) {
      console.log("Erro ao calcular matches no backend:", error);
      setPersonalsExibidos([]);
    } finally {
      if (silencioso) setBuscandoRadar(false);
    }
  }, []);

  const carregarFeed = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [resConexaoAtiva, resAluno] = await Promise.all([
        supabase
          .from("conexoes")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("status", "aluno_ativo")
          .maybeSingle(),
        supabase.from("usuarios").select("preferencias").eq("id", user.id).maybeSingle(),
      ]);

      if (resConexaoAtiva.data) {
        navigation.reset({
          index: 0,
          routes: [{ name: "AlunoDashboard", params: { conexaoId: resConexaoAtiva.data.id } }],
        });
        return;
      }

      const prefsAluno =
        typeof resAluno.data?.preferencias === "string"
          ? JSON.parse(resAluno.data.preferencias)
          : resAluno.data?.preferencias || {};

      setIsAlunoConsultoria(prefsAluno.servico_buscado === "Consultoria");

      await executarBuscaMatches(distanciaMaxima, false);
    } catch (error) {
      console.log("Erro no Feed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [distanciaMaxima, navigation, executarBuscaMatches]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", carregarFeed);
    return () => {
      unsubscribe();
      if (radarTimeoutRef.current) clearTimeout(radarTimeoutRef.current);
    };
  }, [navigation, carregarFeed]);

  useFocusEffect(
    useCallback(() => {
      const checarPropostasPendentes = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: conexao } = await supabase
          .from("conexoes")
          .select("id, personal_id, status, personals(nome, foto_url)")
          .eq("usuario_id", user.id)
          .in("status", ["aguardando_assinatura", "aguardando_aluno"])
          .order("atualizado_em", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (conexao && conexao.personals) {
          setDadosNovaProposta(conexao);
          setModalNovaPropostaVisivel(true);
        }
      };
      checarPropostasPendentes();
    }, [])
  );

  const handleSliderChange = (valor: number) => {
    setDistanciaMaxima(valor);
    if (radarTimeoutRef.current) clearTimeout(radarTimeoutRef.current);
    radarTimeoutRef.current = setTimeout(() => {
      executarBuscaMatches(valor, true);
    }, 280);
  };

  return {
    state: {
      loading,
      refreshing,
      buscandoRadar,
      personalsExibidos,
      distanciaMaxima,
      modalVisible,
      matchSelecionado,
      isAlunoConsultoria,
      currentIndex,
      modalNovaPropostaVisivel,
      dadosNovaProposta,
    },
    actions: {
      onRefresh: () => {
        setRefreshing(true);
        carregarFeed();
      },
      handleSliderChange,
      nextPersonal: () => {
        setCurrentIndex((prev) => (prev < personalsExibidos.length - 1 ? prev + 1 : prev));
      },
      prevPersonal: () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
      },
      goToIndex: (index: number) => {
        if (index >= 0 && index < personalsExibidos.length) setCurrentIndex(index);
      },
      abrirAjustarPreferencias: () => {
        navigation.navigate("AlunoSetup");
      },
      handleLogout: async () => {
        Alert.alert("Sair", "Deseja desconectar sua conta?", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              await supabase.auth.signOut();
              navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
            },
          },
        ]);
      },
      abrirDetalhesMatch: (p: PersonalMatchItem) => {
        setMatchSelecionado(p);
        setModalVisible(true);
      },
      fecharDetalhesMatch: () => setModalVisible(false),
      verPerfilCompleto: (personalId: string) => {
        const item = personalsExibidos.find((p) => p.id === personalId);
        navigation.navigate("PersonalPublicProfile", {
          id: personalId,
          personalId,
          matchPreCalculado: item
            ? {
                matchPercentual: item.matchPercentual,
                matchMotivos: item.matchMotivos,
                matchTierLabel: item.matchTierLabel,
                detalhesPontuacao: item.detalhesPontuacao,
              }
            : undefined,
        });
      },
      fecharModalNovaProposta: () => setModalNovaPropostaVisivel(false),
      irParaProposta: () => {
        setModalNovaPropostaVisivel(false);
        navigation.navigate("PropostaAluno", { conexaoId: dadosNovaProposta?.id });
      },
      irParaChatNovaProposta: () => {
        setModalNovaPropostaVisivel(false);
        navigation.navigate("Chat", {
          conexaoId: dadosNovaProposta?.id,
          nomeOutro: dadosNovaProposta?.personals?.nome,
          fotoOutro: dadosNovaProposta?.personals?.foto_url,
          tipoUsuarioLogado: "aluno",
        });
      },
    },
  };
}