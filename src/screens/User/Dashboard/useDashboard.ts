import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { supabase } from "../../../services/supabase";
import { DiaSemana, Modality } from "./constants";

export function useDashboard(navigation: any, conexaoId: string) {
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

  const [financeiroInfo, setFinanceiroInfo] = useState({
    status: 'pendente' as 'em_dia' | 'pendente' | 'atrasado',
    valor: 'R$ 0,00',
    vencimento: '--/--'
  });

  const fetchDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexaoData, error: errorC } = await supabase
        .from("conexoes")
        .select("*, personals(*), usuarios(*)")
        .eq("id", conexaoId)
        .single();

      if (errorC) throw errorC;
      
      setConexao(conexaoData);
      setPersonal(conexaoData.personals);
      setAluno(conexaoData.usuarios);

      const hojeData = new Date();
      const dataInicio = new Date(conexaoData.atualizado_em || conexaoData.criado_em || Date.now());
      const diffTime = Math.abs(hojeData.getTime() - dataInicio.getTime());
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

      const { data: programaTreino } = await supabase
        .from('training_programs')
        .select(`
          id, name, general_observation,
          training_weeks (
             id, name, start_date, end_date,
             workout_days ( id, name, order_index, objective, planned_exercises ( id ) )
          ),
          workout_days (
             id, name, order_index, objective, planned_exercises ( id )
          )
        `)
        .eq('student_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setRecadoPersonal(programaTreino?.general_observation || conexaoData.recado_evolucao || null);

      let treinosConcluidosGeral: any[] = [];
      if (conexaoId) {
        const { data: execucoesHistorico } = await supabase
          .from('treinos_execucoes')
          .select('treino_id, data_inicio')
          .eq('conexao_id', conexaoId);
        
        if (execucoesHistorico) {
            treinosConcluidosGeral = execucoesHistorico;
        }
      }

      const ultimos7Dias: Date[] = [];
      for(let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        ultimos7Dias.push(d);
      }
      
      const todayStr = hojeData.toISOString().split('T')[0];

      const calendarioFormatado = ultimos7Dias.map(d => {
        const dataLocal = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        const dateStr = dataLocal.toISOString().split('T')[0];
        
        const isToday = dateStr === todayStr;
        const diaStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

        const treinouNesteDia = treinosConcluidosGeral.some(exec => {
           if (!exec.data_inicio) return false;
           const dExec = new Date(exec.data_inicio);
           const dExecLocal = new Date(dExec.getTime() - (dExec.getTimezoneOffset() * 60000));
           const dataExecStr = dExecLocal.toISOString().split('T')[0];
           
           return dataExecStr === dateStr;
        });

        let statusDia = 'pendente';
        if (treinouNesteDia) statusDia = 'concluido';
        else if (isToday) statusDia = 'hoje';
        else if (dateStr > todayStr) statusDia = 'futuro';

        return {
          dia: diaStr.charAt(0).toUpperCase() + diaStr.slice(1),
          data: d.getDate().toString().padStart(2, '0'),
          status: statusDia as any
        };
      });
      setSemanaAtual(calendarioFormatado);

      if (programaTreino) {
        let semanasSource: any[] = programaTreino.training_weeks || [];
        let diasLegados: any[] = programaTreino.workout_days || [];
        
        if (semanasSource.length === 0 && diasLegados.length > 0) {
            semanasSource = [{ 
                id: 'semana-legada', 
                name: 'Sua Rotina', 
                start_date: null,
                end_date: null,
                workout_days: diasLegados 
            }];
        }

        if (semanasSource.length > 0) {
            const semanasOrdenadas = [...semanasSource].sort((a: any, b: any) => {
                if(a.start_date && b.start_date) return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
                return a.name.localeCompare(b.name);
            });

            let proximoTreino = null;

            for (const week of semanasOrdenadas) {
                const diasOrdenados = [...(week.workout_days || [])].sort((a: any, b: any) => a.order_index - b.order_index);
                for (const dia of diasOrdenados) {
                    const jaFez = treinosConcluidosGeral.some(exec => exec.treino_id === dia.id);
                    if (!jaFez) { 
                        proximoTreino = dia; 
                        break; 
                    }
                }
                if (proximoTreino) break;
            }
            
            if (proximoTreino) {
                setTreinoHoje({
                   id: proximoTreino.id,
                   nome: proximoTreino.name,
                   qtd_exercicios: proximoTreino.planned_exercises?.length || 0,
                   duracao_estimada: `${Math.max(30, (proximoTreino.planned_exercises?.length || 0) * 8)} min`,
                   fez_hoje: false
                });
                setTemTreinosNaSemana(true); 
            } else {
                setTreinoHoje(null);
                setTemTreinosNaSemana(treinosConcluidosGeral.length > 0);
            }
        } else {
            setTreinoHoje(null);
            setTemTreinosNaSemana(false);
        }
      } else {
         setTreinoHoje(null);
         setTemTreinosNaSemana(false);
      }

      const { data: avalData } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("personal_id", conexaoData.personal_id)
        .eq("usuario_id", conexaoData.usuario_id)
        .maybeSingle();

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        fetchDados();
    });
    return unsubscribe;
  }, [navigation, conexaoId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDados();
    setRefreshing(false);
  }, [conexaoId]);

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
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
    Alert.alert("Aviso", `Você precisa abrir a ficha na aba "Treinos" para visualizar.`);
  };

  const handleAcaoEncerramento = () => {
    if (estaNoPeriodoTeste) {
      Alert.alert("Desfazer Vínculo", "Deseja cancelar a parceria e voltar a buscar treinadores?", [
        { text: "Não", style: "cancel" },
        { text: "Sim, Cancelar Vínculo", style: "destructive", onPress: async () => {
            setLoading(true);
            await supabase.from("conexoes").delete().eq("id", conexaoId);
            navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
          },
        },
      ]);
    } else {
      Alert.alert("Solicitar Encerramento", "Enviar aviso ao seu professor?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Enviar", onPress: async () => Alert.alert("Enviado!", "Seu treinador foi notificado.") },
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
    salvandoAvaliacao, jaAvaliou, financeiroInfo, setModalAvaliacaoVisible, setNotaSelecionada, setComentario,
    onRefresh, handleLogout, handleWhatsApp, featureBloqueada, handleAcaoEncerramento, handleEnviarAvaliacao, irParaChat,
    verPerfilPersonal: () => navigation.navigate("PersonalPublicProfile", { personalId: personal?.id, fromDashboard: true }),
    irParaMeuPerfil: () => navigation.navigate("PerfilAluno"),
  };
}