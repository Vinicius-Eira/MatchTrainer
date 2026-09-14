import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { supabase } from "../../../services/supabase";
import { DiaSemana, Modality } from "./dashboardConstants";

export function usePainelMeuTreinador(navigation: any, conexaoId: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [aluno, setAluno] = useState<any>(null);
  const [personal, setPersonal] = useState<any>(null);
  const [conexao, setConexao] = useState<any>(null);
  
  const [anamnesePendente, setAnamnesePendente] = useState<any>(null);
  const [recadoPersonal, setRecadoPersonal] = useState<string | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<any>(null);
  const [semanaAtual, setSemanaAtual] = useState<DiaSemana[]>([]);
  const [temTreinosNaSemana, setTemTreinosNaSemana] = useState(false);

  const [diasTreino, setDiasTreino] = useState(1);
  const [progressoBarra, setProgressoBarra] = useState(0);
  const [estaNoPeriodoTeste, setEstaNoPeriodoTeste] = useState(false);
  const [modalidade, setModalidade] = useState<Modality>("Consultoria Online");

  const [modalAvaliacaoVisible, setModalAvaliacaoVisible] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  const fetchDados = async () => {
    try {
      const { data: conexaoData, error: errorC } = await supabase
        .from("conexoes")
        .select("*, personals(*), usuarios(*)")
        .eq("id", conexaoId)
        .single();

      if (errorC) throw errorC;
      
      setConexao(conexaoData);
      setPersonal(conexaoData.personals);
      setAluno(conexaoData.usuarios);
      setRecadoPersonal(conexaoData.recado_evolucao || null);

      const dataInicio = new Date(conexaoData.atualizado_em || conexaoData.criado_em || Date.now());
      const hoje = new Date();
      const diffTime = Math.abs(hoje.getTime() - dataInicio.getTime());
      const diasCorridos = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const diasLimitados = diasCorridos > 60 ? 60 : diasCorridos;
      setDiasTreino(diasLimitados);
      setProgressoBarra((diasLimitados / 60) * 100);
      setEstaNoPeriodoTeste(diasCorridos <= 7);

      const { data: quests } = await supabase
        .from('questionarios')
        .select('*')
        .eq('conexao_id', conexaoId)
        .eq('status', 'pendente')
        .limit(1);
      setAnamnesePendente(quests && quests.length > 0 ? quests[0] : null);

      const ultimos7Dias: Date[] = [];
      for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ultimos7Dias.push(d);
      }

      const { data: prescritos } = await supabase.from('treinos_prescritos').select('*').eq('conexao_id', conexaoId);
      
      let execucoes: any[] = [];
      if (prescritos && prescritos.length > 0) {
        setTreinoHoje(prescritos[0]); 
        const ids = prescritos.map(p => p.id);
        const { data: execs } = await supabase.from('treinos_execucoes').select('data_inicio').in('treino_id', ids);
        execucoes = execs || [];
      } else {
        setTreinoHoje(null);
      }

      setTemTreinosNaSemana(execucoes.length > 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const calendarioFormatado = ultimos7Dias.map(d => {
        const dateStr = d.toISOString().split('T')[0];
        const fezTreino = execucoes.some(e => e.data_inicio.startsWith(dateStr));
        const isToday = dateStr === todayStr;
        
        const diaStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        return {
          dia: diaStr.charAt(0).toUpperCase() + diaStr.slice(1),
          data: d.getDate().toString().padStart(2, '0'),
          status: (isToday ? 'hoje' : fezTreino ? 'concluido' : dateStr > todayStr ? 'futuro' : 'pendente') as "concluido" | "hoje" | "pendente" | "futuro"
        };
      });
      setSemanaAtual(calendarioFormatado);

      const { data: avalData } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("personal_id", conexaoData.personal_id)
        .eq("usuario_id", conexaoData.usuario_id)
        .single();

      if (avalData) {
        setNotaSelecionada(avalData.nota);
        setComentario(avalData.comentario || "");
        setJaAvaliou(true);
      }
    } catch (error) {
      console.log("Erro ao buscar dados do painel:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const carregarInicial = async () => {
      setLoading(true);
      await fetchDados();
      if (isMounted) setLoading(false);
    };
    
    const t = setTimeout(carregarInicial, 0);
    return () => { isMounted = false; clearTimeout(t); };
  }, [conexaoId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDados();
    setRefreshing(false);
  }, [conexaoId]);

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair do aplicativo?", [
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
  };

  const handleWhatsApp = () => {
    const numLimpo = personal?.telefone?.replace(/\D/g, "");
    if (!numLimpo) return Alert.alert("Aviso", "Este professor não possui WhatsApp cadastrado.");
    Linking.openURL(`whatsapp://send?phone=55${numLimpo}&text=Olá Professor ${personal?.nome}! Estou acessando meu painel.`).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
  };

  const irParaChat = () => {
    navigation.navigate("Chat", {
      conexaoId,
      nomeOutro: personal?.nome,
      fotoOutro: personal?.foto_url,
      tipoUsuarioLogado: "aluno",
    });
  };

  const featureBloqueada = (nome: string) => {
    Alert.alert("Novidade Chegando! 🚀", `O módulo de ${nome} será liberado nas próximas atualizações.`);
  };

  const handleAcaoEncerramento = () => {
    if (estaNoPeriodoTeste) {
      Alert.alert("Desfazer Vínculo", "Deseja cancelar a parceria e voltar a buscar treinadores?", [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, Cancelar Vínculo",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await supabase.from("conexoes").delete().eq("id", conexaoId);
            navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
          },
        },
      ]);
    } else {
      if (diasTreino <= 60) return Alert.alert("Ciclo em Andamento", `Você poderá solicitar encerramento em ${61 - diasTreino} dias.`);
      Alert.alert("Solicitar Encerramento", "Enviar aviso ao seu professor?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Enviar",
          onPress: async () => {
             Alert.alert("Enviado!", "Seu treinador foi notificado.");
          },
        },
      ]);
    }
  };

  const handleEnviarAvaliacao = async () => {
    if (notaSelecionada === 0) return Alert.alert("Atenção", "Selecione de 1 a 5 estrelas.");
    setSalvandoAvaliacao(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { personal_id: personal.id, usuario_id: user?.id, nota: notaSelecionada, comentario: comentario.trim() };
      const { error } = await supabase.from("avaliacoes").insert([payload]);
      if (error) await supabase.from("avaliacoes").update({ nota: notaSelecionada, comentario: comentario.trim() }).eq("personal_id", personal.id).eq("usuario_id", user?.id);
      Alert.alert("Sucesso!", "Sua avaliação foi enviada.");
      setJaAvaliou(true);
      setModalAvaliacaoVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  return {
    loading, refreshing, aluno, personal, diasTreino, progressoBarra, estaNoPeriodoTeste, modalidade,
    semanaAtual, temTreinosNaSemana, treinoHoje, recadoPersonal, anamnesePendente, modalAvaliacaoVisible, notaSelecionada, comentario,
    salvandoAvaliacao, jaAvaliou, setModalAvaliacaoVisible, setNotaSelecionada, setComentario,
    onRefresh, handleLogout, handleWhatsApp, featureBloqueada, handleAcaoEncerramento, handleEnviarAvaliacao, irParaChat,
    verPerfilPersonal: () => navigation.navigate("PerfilPublicoPersonal", { personalId: personal?.id }),
    irParaMeuPerfil: () => navigation.navigate("PerfilAluno"),
  };
}