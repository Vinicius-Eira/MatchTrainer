import { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { supabase } from "../../../services/supabase";
import { DiaSemana, Modality } from "./constants";

export type StatusTreinoDia = 'disponivel' | 'descanso' | 'fim_ciclo' | 'sem_programa';

export function useDashboard(navigation: any, conexaoId: string) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [aluno, setAluno] = useState<any>(null);
  const [personal, setPersonal] = useState<any>(null);
  const [conexao, setConexao] = useState<any>(null);
  
  const [anamnesePendente, setAnamnesePendente] = useState<any>(null);
  const [recadoPersonal, setRecadoPersonal] = useState<string | null>(null);
  const [dataRecadoPersonal, setDataRecadoPersonal] = useState<string | null>(null);
  const [treinoHoje, setTreinoHoje] = useState<any>(null);
  const [statusTreinoDia, setStatusTreinoDia] = useState<StatusTreinoDia>('sem_programa');
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

  const normalizarDataLocal = (isoDateStr: string) => {
    if (isoDateStr.length === 10 && isoDateStr.includes('-')) {
      const [ano, mes, dia] = isoDateStr.split('-').map(Number);
      return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
    }
    const d = new Date(isoDateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const isDiaDeDescansoExplicito = (nomeDia?: string, qtdExercicios?: number) => {
    if (!nomeDia) return false;
    const nomeLimpo = nomeDia.toLowerCase().trim();
    return (
      (nomeLimpo.includes("descanso") || nomeLimpo.includes("day off") || nomeLimpo.includes("folga")) &&
      (qtdExercicios || 0) === 0
    );
  };

  const fetchDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let queryConexao = supabase
        .from("conexoes")
        .select("*, personals(*), usuarios(*)");

      if (conexaoId && conexaoId !== "1") {
        queryConexao = queryConexao.eq("id", conexaoId);
      } else {
        queryConexao = queryConexao
          .eq("usuario_id", user.id)
          .in("status", ["aluno_ativo", "aguardando_assinatura", "pendente"])
          .order("criado_em", { ascending: false })
          .limit(1);
      }

      const { data: conexaoData, error: errorC } = await queryConexao.maybeSingle();

      if (errorC || !conexaoData) throw errorC || new Error("Conexão não encontrada");
      
      const realConexaoId = conexaoData.id;

      setConexao(conexaoData);
      setPersonal(conexaoData.personals);
      setAluno(conexaoData.usuarios);

      setRecadoPersonal(conexaoData.recado_evolucao || null);
      setDataRecadoPersonal(
        conexaoData.data_recado 
          ? new Date(conexaoData.data_recado).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : null
      );

      const hojeData = new Date();
      const dataInicio = new Date(conexaoData.confirmado_em || conexaoData.criado_em || Date.now());
      const diffTime = Math.abs(hojeData.getTime() - dataInicio.getTime());
      const diasCorridos = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const diasLimitados = diasCorridos > 60 ? 60 : diasCorridos;
      setDiasTreino(diasLimitados);
      setProgressoBarra((diasLimitados / 60) * 100);
      setEstaNoPeriodoTeste(diasCorridos <= 7);

      const { data: quests } = await supabase
        .from('questionarios')
        .select('*')
        .eq('conexao_id', realConexaoId)
        .eq('status', 'pendente')
        .limit(1);
      setAnamnesePendente(quests && quests.length > 0 ? quests[0] : null);

      const { data: programaTreino, error: errProg } = await supabase
        .from('training_programs')
        .select(`
          id, name, objective, general_observation,
          training_weeks (
            id, name, general_notes, start_date, end_date,
            workout_days ( id, name, order_index, planned_exercises ( id, public_note ) )
          ),
          workout_days (
            id, name, order_index,
            planned_exercises ( id, public_note )
          )
        `)
        .eq('student_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errProg && errProg.code !== 'PGRST116') {
        console.log("Aviso ao consultar programa de treino:", errProg);
      }

      setRecadoPersonal(conexaoData.recado_evolucao || programaTreino?.general_observation || null);

      let treinosConcluidosGeral: any[] = [];
      if (realConexaoId) {
        const { data: execucoesHistorico } = await supabase
          .from('treinos_execucoes')
          .select('treino_id, data_inicio')
          .eq('conexao_id', realConexaoId);
        
        if (execucoesHistorico) {
          treinosConcluidosGeral = execucoesHistorico;
        }
      }

      const ultimos7Dias: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ultimos7Dias.push(d);
      }
      
      const hojeLocal = new Date(hojeData.getTime() - (hojeData.getTimezoneOffset() * 60000));
      const todayStr = hojeLocal.toISOString().split('T')[0];

      let treinouNosUltimos7Dias = false;

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

        if (treinouNesteDia) treinouNosUltimos7Dias = true;

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
      setTemTreinosNaSemana(treinouNosUltimos7Dias);

      if (programaTreino) {
        let semanasSource: any[] = programaTreino.training_weeks || [];
        const diasLegados: any[] = programaTreino.workout_days || [];
        
        if (semanasSource.length === 0 && diasLegados.length > 0) {
          semanasSource = [{ 
            id: 'legacy-week-1', 
            name: 'Sua Rotina', 
            start_date: null,
            end_date: null,
            workout_days: diasLegados 
          }];
        }

        if (semanasSource.length > 0) {
          const semanasOrdenadas = [...semanasSource].sort((a: any, b: any) => {
            if (a.start_date && b.start_date) {
              return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
            }
            return (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' });
          });

          const idsConcluidosSet = new Set(treinosConcluidosGeral.map(e => String(e.treino_id)));
          const hojeMeiaNoite = new Date(hojeData.getFullYear(), hojeData.getMonth(), hojeData.getDate(), 0, 0, 0, 0);

          let totalTreinosReaisPrograma = 0;
          let totalTreinosConcluidosPrograma = 0;

          const semanasProcessadas = semanasOrdenadas.map((week: any) => {
            const diasOrdenados = [...(week.workout_days || [])].sort(
              (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
            );

            const diasValidos = diasOrdenados.filter(
              (d: any) => !isDiaDeDescansoExplicito(d.name, d.planned_exercises?.length)
            );
            const temDiaDescansoExplicito = diasOrdenados.some(
              (d: any) => isDiaDeDescansoExplicito(d.name, d.planned_exercises?.length)
            );

            totalTreinosReaisPrograma += diasValidos.length;

            const pendentesDaSemana = diasValidos.filter((d: any) => !idsConcluidosSet.has(String(d.id)));
            const concluidosDaSemana = diasValidos.length - pendentesDaSemana.length;
            totalTreinosConcluidosPrograma += concluidosDaSemana;

            let isDentroDaDataAtual = false;
            if (week.start_date && week.end_date) {
              const dtInicio = normalizarDataLocal(week.start_date);
              const dtFim = normalizarDataLocal(week.end_date);
              if (hojeMeiaNoite >= dtInicio && hojeMeiaNoite <= dtFim) {
                isDentroDaDataAtual = true;
              }
            }

            return {
              ...week,
              diasOrdenados,
              diasValidos,
              pendentesDaSemana,
              concluidosDaSemana,
              temDiaDescansoExplicito,
              isDentroDaDataAtual
            };
          });

          if (totalTreinosReaisPrograma === 0) {
            const existeDescansoCadastrado = semanasProcessadas.some(w => w.temDiaDescansoExplicito);
            setTreinoHoje(null);
            setStatusTreinoDia(existeDescansoCadastrado ? 'descanso' : 'sem_programa');
          } else if (totalTreinosConcluidosPrograma >= totalTreinosReaisPrograma) {
            setTreinoHoje(null);
            setStatusTreinoDia('fim_ciclo');
          } else {
            const semanaPorDataHoje = semanasProcessadas.find(w => w.isDentroDaDataAtual);
            const primeiraSemanaComPendentes = semanasProcessadas.find(w => w.pendentesDaSemana.length > 0);

            let semanaAlvo = null;
            let isDescansoEntreSemanas = false;

            if (semanaPorDataHoje) {
              if (semanaPorDataHoje.pendentesDaSemana.length > 0) {
                semanaAlvo = semanaPorDataHoje;
              } else {
                const indiceSemanaHoje = semanasProcessadas.indexOf(semanaPorDataHoje);
                const semanaAnteriorPendente = semanasProcessadas
                  .slice(0, indiceSemanaHoje)
                  .find(w => w.pendentesDaSemana.length > 0);

                if (semanaAnteriorPendente) {
                  semanaAlvo = semanaAnteriorPendente;
                } else {
                  const proximaSemanaFutura = semanasProcessadas
                    .slice(indiceSemanaHoje + 1)
                    .find(w => w.pendentesDaSemana.length > 0);

                  if (proximaSemanaFutura?.start_date && normalizarDataLocal(proximaSemanaFutura.start_date) > hojeMeiaNoite) {
                    isDescansoEntreSemanas = true;
                  } else {
                    semanaAlvo = proximaSemanaFutura || primeiraSemanaComPendentes;
                  }
                }
              }
            } else {
              semanaAlvo = primeiraSemanaComPendentes;
            }

            if (isDescansoEntreSemanas) {
              setTreinoHoje(null);
              setStatusTreinoDia('descanso');
            } else if (semanaAlvo && semanaAlvo.pendentesDaSemana.length > 0) {
              const proximoTreino = semanaAlvo.pendentesDaSemana[0];
              const qtdEx = proximoTreino.planned_exercises?.length || 0;
              let objetivoFormatado = programaTreino.objective || "Treinamento";
              if (objetivoFormatado.toLowerCase().includes("deload")) {
                objetivoFormatado = "Foco e Evolução";
              }

              setTreinoHoje({
                id: proximoTreino.id,
                nome: proximoTreino.name,
                nome_semana: semanaAlvo.name,
                objetivo: objetivoFormatado,
                qtd_exercicios: qtdEx,
                duracao_estimada: `${Math.max(30, qtdEx * 8)} min`,
                fez_hoje: false
              });
              setStatusTreinoDia('disponivel');
            } else {
              setTreinoHoje(null);
              setStatusTreinoDia('fim_ciclo');
            }
          }
        } else {
          setTreinoHoje(null);
          setStatusTreinoDia('sem_programa');
        }
      } else {
        setTreinoHoje(null);
        setStatusTreinoDia('sem_programa');
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
      conexaoId: conexao?.id || conexaoId,
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
            await supabase.from("conexoes").delete().eq("id", conexao?.id || conexaoId);
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
    loading, refreshing, aluno, personal, conexao, diasTreino, progressoBarra, estaNoPeriodoTeste, modalidade,
    semanaAtual, temTreinosNaSemana, treinoHoje, statusTreinoDia, recadoPersonal, dataRecadoPersonal, anamnesePendente, modalAvaliacaoVisible, notaSelecionada, comentario,
    salvandoAvaliacao, jaAvaliou, financeiroInfo, setModalAvaliacaoVisible, setNotaSelecionada, setComentario,
    onRefresh, handleLogout, handleWhatsApp, featureBloqueada, handleAcaoEncerramento, handleEnviarAvaliacao, irParaChat,
    verPerfilPersonal: () => navigation.navigate("PersonalPublicProfile", { personalId: personal?.id, fromDashboard: true }),
    irParaMeuPerfil: () => navigation.navigate("PerfilAluno"),
  };
}