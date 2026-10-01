import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";

const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export function useFeedPersonal(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allPersonals, setAllPersonals] = useState<any[]>([]);
  const [personalsExibidos, setPersonalsExibidos] = useState<any[]>([]);
  const [distanciaMaxima, setDistanciaMaxima] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [matchSelecionado, setMatchSelecionado] = useState<any>(null);
  const [isAlunoConsultoria, setIsAlunoConsultoria] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const aplicarFiltrosDistancia = useCallback((lista: any[], maxKm: number) => {
    const filtrados = lista.filter((p) => {
      const offersConsultoria = p.servicosOferecidosSeguros.includes("Consultoria");
      if (offersConsultoria) return true; 
      return p.distanciaReal <= maxKm;
    });

    const ordenados = filtrados
      .sort((a, b) => b.matchPercentual - a.matchPercentual)
      .slice(0, 10); 

    setPersonalsExibidos(ordenados);
    setCurrentIndex(0); 
  }, []);

  const carregarFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexaoAtiva } = await supabase.from("conexoes").select("id").eq("usuario_id", user.id).eq("status", "aluno_ativo").maybeSingle();
      if (conexaoAtiva) {
        navigation.reset({ index: 0, routes: [{ name: "PainelMeuTreinador", params: { conexaoId: conexaoAtiva.id } }] });
        return;
      }

      const { data: alunoData } = await supabase.from("usuarios").select("latitude, longitude, preferencias").eq("id", user.id).single();
      const prefsAluno = typeof alunoData?.preferencias === "string" ? JSON.parse(alunoData.preferencias) : alunoData?.preferencias || {};

      setIsAlunoConsultoria(prefsAluno.servico_buscado === "Consultoria");

      const { data: personalsData } = await supabase.from("personals").select("*").eq("ativo", true);
      if (!personalsData) return;

      const matchResults = await Promise.all(personalsData.map(async (personal) => {
        let prefsPersonal: any = {};
        try {
          prefsPersonal = typeof personal.especialidades === "string" ? JSON.parse(personal.especialidades) : personal.especialidades || {};
        } catch (e) {
          prefsPersonal = {};
        }

        let motivos = [];
        let score = 0;

        const modalidadeAluno = prefsAluno.servico_buscado || "Indiferente";
        const servicosPersonal = personal.servicos_oferecidos || [];
        
        const isConsultoria = modalidadeAluno === "Consultoria" || (modalidadeAluno === "Indiferente" && servicosPersonal.includes("Consultoria"));
        const isPresencial = modalidadeAluno === "Presencial" || (modalidadeAluno === "Indiferente" && servicosPersonal.includes("Presencial"));
        
        let atendeModalidade = false;
        if (modalidadeAluno === "Indiferente") atendeModalidade = true;
        else if (modalidadeAluno === "Consultoria" && servicosPersonal.includes("Consultoria")) atendeModalidade = true;
        else if (modalidadeAluno === "Presencial" && servicosPersonal.includes("Presencial")) atendeModalidade = true;
        
        if (!atendeModalidade) return null; 

        const generoPref = prefsAluno.genero_treinador || "indiferente";
        if (generoPref !== "indiferente" && personal.genero && personal.genero.toLowerCase() !== generoPref.toLowerCase()) return null; 

        const distancia = calcularDistancia(alunoData?.latitude, alunoData?.longitude, personal.latitude, personal.longitude);
        
        const objetivosAluno = prefsAluno.objetivos || [];
        const objetivosPersonal = prefsPersonal.objetivos || [];
        const matchObj = objetivosAluno.some((obj: string) => objetivosPersonal.includes(obj));
        if (matchObj) { score += 30; motivos.push({ icone: "🎯", texto: "Especialista no seu objetivo principal." }); }

        const limitsAluno = prefsAluno.limitacoes || [];
        const limitsPersonal = prefsPersonal.limitacoes || [];
        if (limitsAluno.length > 0 && !limitsAluno.includes("nenhuma")) {
          const matchLimit = limitsAluno.some((lim: string) => limitsPersonal.includes(lim));
          if (matchLimit) { score += 20; motivos.push({ icone: "🏥", texto: "Possui experiência com suas restrições de saúde." }); }
        } else {
          score += 20; 
        }

        if (prefsAluno.cobranca === prefsPersonal.cobranca) {
          score += 20; motivos.push({ icone: "🧠", texto: "O estilo de cobrança e motivação é ideal para você." });
        } else if (prefsAluno.cobranca && prefsPersonal.cobranca) {
           score += 10; 
        }

        if (servicosPersonal.includes("Presencial") && modalidadeAluno !== "Consultoria") {
          if (distancia <= 5) { score += 30; motivos.push({ icone: "📍", texto: "Atende na sua região." }); }
          else if (distancia <= 15) { score += 15; }
        } else if (servicosPersonal.includes("Consultoria")) {
          score += 30; motivos.push({ icone: "📱", texto: "Treino 100% Digital na palma da sua mão." });
        }

        const { data: nota } = await supabase.rpc("get_media_avaliacoes", { p_id: personal.id });

        let badgeUi = servicosPersonal.length > 1 ? "HÍBRIDO" : servicosPersonal[0]?.toUpperCase() || "TREINADOR";
        let iconUi = badgeUi === "CONSULTORIA" ? "phone-portrait" : (badgeUi === "HÍBRIDO" ? "options" : "barbell");

        return {
          ...personal,
          nota_media: nota,
          distanciaReal: distancia,
          matchPercentual: Math.min(score + Math.floor(Math.random() * 5), 99), 
          matchMotivos: motivos.length > 0 ? motivos : [{ icone: "🤝", texto: "Perfil alinhado com suas necessidades gerais." }],
          specsParsed: prefsPersonal,
          badgeUi,
          iconUi,
          precoAvaliar: modalidadeAluno === "Consultoria" ? personal.preco_consultoria : personal.preco_presencial || personal.preco_medio,
          servicosOferecidosSeguros: servicosPersonal
        };
      }));

      const validos = matchResults.filter((p) => p !== null && p.matchPercentual >= 80);

      setAllPersonals(validos);
      aplicarFiltrosDistancia(validos, distanciaMaxima);

    } catch (error) {
      console.log("Erro no Feed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [distanciaMaxima, navigation, aplicarFiltrosDistancia]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", carregarFeed);
    return unsubscribe;
  }, [navigation, carregarFeed]);

  return {
    state: { loading, refreshing, personalsExibidos, distanciaMaxima, modalVisible, matchSelecionado, isAlunoConsultoria, currentIndex },
    actions: { 
      onRefresh: () => { setRefreshing(true); carregarFeed(); },
      handleSliderChange: (valor: number) => {
        setDistanciaMaxima(valor);
        aplicarFiltrosDistancia(allPersonals, valor);
      },
      nextPersonal: () => {
        if (currentIndex < personalsExibidos.length - 1) setCurrentIndex(currentIndex + 1);
      },
      prevPersonal: () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
      },
      handleLogout: async () => {
        Alert.alert("Sair", "Deseja desconectar sua conta?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: async () => {
              setLoading(true);
              await supabase.auth.signOut();
              navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
            }
          },
        ]);
      },
      abrirDetalhesMatch: (p: any) => { setMatchSelecionado(p); setModalVisible(true); },
      fecharDetalhesMatch: () => setModalVisible(false),
      verPerfilCompleto: (personalId: string) => {
        navigation.navigate("PerfilPublicoPersonal", { id: personalId });
      }
    }
  };
}