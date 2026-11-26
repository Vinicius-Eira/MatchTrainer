import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../../services/supabase";
import { theme } from "../../../../../theme/theme";

const NIVEIS_MAP: Record<string, string> = {
  Iniciante: "Iniciante Total",
  Intermediario: "Intermediário",
  Avancado: "Avançado",
};

const MAP_HISTORICO: Record<string, string> = {
  iniciante: "Iniciante Total",
  inconstante: "Inconstante (Vai e para)",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const MAP_FREQUENCIA: Record<string, string> = {
  "1-2": "1 a 2 dias/sem",
  "3-4": "3 a 4 dias/sem",
  "5-6": "5 a 6 dias/sem",
  "7": "Todos os dias",
};

const extrairNumero = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const match = String(val).replace(",", ".").match(/[0-9]+(\.[0-9]+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export function useVisaoAluno(route: any, navigation: any) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState<string>(statusAtual);

  const [activeTab, setActiveTab] = useState<string>("visao_geral"); 

  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [alunoSolicitouSaida, setAlunoSolicitouSaida] = useState<boolean>(false);
  const [dataInicioParceria, setDataInicioParceria] = useState<string | null>(null);
  const [planoAtivo, setPlanoAtivo] = useState<any>(null);
  const [anamnese, setAnamnese] = useState<any>(null);

  const [streak, setStreak] = useState<number>(0);
  const [adesao, setAdesao] = useState<any[]>([]);
  const [totalTreinos, setTotalTreinos] = useState<number>(0);
  const [ultimosLogs, setUltimosLogs] = useState<any[]>([]);
  const [alertaTreino, setAlertaTreino] = useState<string | null>(null);

  const [dadosBio, setDadosBio] = useState<any>(null);

  let prefs: any = {};
  try {
    prefs = typeof aluno.preferencias === "string" ? JSON.parse(aluno.preferencias) : aluno.preferencias || {};
  } catch (e) {}

  const carregarDadosAluno = async (pularLoading = false) => {
    if (!pularLoading) setIsFetchingData(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [planoRes, anamneseRes, msgsRes, conexaoRes, bioRes] = await Promise.all([
        supabase.from("planos").select("*").eq("conexao_id", conexaoId).in("status", ["ativo", "congelado", "aguardando_assinatura", "pendente"]).maybeSingle(),
        supabase.from("anamneses").select("*").eq("usuario_id", aluno.id).eq("personal_id", session.user.id).order('criado_em', { ascending: false }).limit(1).maybeSingle(), 
        supabase.from("mensagens").select("conteudo").eq("conexao_id", conexaoId).eq("tipo_remetente", "aluno").like("conteudo", "%solicitar o encerramento%"),
        supabase.from("conexoes").select("confirmado_em, atualizado_em, criado_em, status").eq("id", conexaoId).maybeSingle(),
        supabase.from("aluno_evolucao").select("*").eq("conexao_id", conexaoId).order('data_registro', { ascending: false }).limit(1).maybeSingle()
      ]);

      if (planoRes.data) setPlanoAtivo(planoRes.data);
      if (anamneseRes.data) setAnamnese(anamneseRes.data);
      if (msgsRes.data && msgsRes.data.length > 0) setAlunoSolicitouSaida(true);
      if (bioRes.data) setDadosBio(bioRes.data);

      if (conexaoRes.data) {
        setDataInicioParceria(conexaoRes.data.confirmado_em || conexaoRes.data.atualizado_em || conexaoRes.data.criado_em);
        if (conexaoRes.data.status !== status) setStatus(conexaoRes.data.status);
      }

      await calcularMetricasEvolucao();

    } catch (error) {
      console.log("Erro ao buscar dados extras do aluno:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const calcularMetricasEvolucao = async () => {
    try {
      const [
        { data: workoutDaysData },
        { data: weeksData },
        { data: execucoes },
        { data: doresData }
      ] = await Promise.all([
        supabase.from("workout_days").select("id, name, week_id"),
        supabase.from("training_weeks").select("id, name"),
        supabase
          .from("treinos_execucoes")
          .select("*")
          .eq("conexao_id", conexaoId)
          .order("data_inicio", { ascending: false }),
        aluno?.id
          ? supabase
              .from("treinos_execucoes_dores")
              .select("*")
              .eq("aluno_id", aluno.id)
              .order("id", { ascending: false })
          : Promise.resolve({ data: [] as any[] })
      ]);

      if (execucoes && execucoes.length > 0) {
        setTotalTreinos(execucoes.length);

        const dataHoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(dataHoje.getDate() - 30);

        const sessoesRecentes = execucoes.filter(s => new Date(s.data_inicio || s.created_at) >= trintaDiasAtras);
        setStreak(sessoesRecentes.length); 
        
        let alertaAtivo = null;
        for (const exec of execucoes.slice(0, 5)) {
          if (exec.sentiu_dor) {
            const dataFmt = new Date(exec.data_inicio || exec.created_at).toLocaleDateString('pt-BR');
            const nomeTreino = workoutDaysData?.find((wd: any) => wd.id === exec.treino_id)?.name || "Treino";
            alertaAtivo = `O aluno relatou dor/desconforto na execução do ${nomeTreino} no dia ${dataFmt}.`;
            break; 
          }
        }
        setAlertaTreino(alertaAtivo);

        const adesaoMap: any = {};
        execucoes.forEach(s => {
          if (s.treino_id) {
            adesaoMap[s.treino_id] = (adesaoMap[s.treino_id] || 0) + 1;
          }
        });

        const adesaoArray = Object.keys(adesaoMap).map(treinoId => {
          const qtd = adesaoMap[treinoId];
          const percentual = Math.round((qtd / execucoes.length) * 100);
          const nomeTreino = workoutDaysData?.find((wd: any) => wd.id === treinoId)?.name || `Treino Antigo`;
          return {
            workout_id: treinoId,
            nome: nomeTreino, 
            percentual: percentual,
            quantidade: qtd
          };
        }).sort((a, b) => b.percentual - a.percentual);

        setAdesao(adesaoArray);

        const execucoesOrdemCronologica = [...execucoes].reverse();
        const recordesAteOMomento: Record<string, number> = {};
        const prsPorExecucaoMap: Record<string, { totalPrs: number; exerciciosComPr: Set<string> }> = {};

        execucoesOrdemCronologica.forEach((exec: any) => {
          let prsNestaSessao = 0;
          const exerciciosPrSet = new Set<string>();
          const listaEx = Array.isArray(exec.dados_execucao) ? exec.dados_execucao : [];

          listaEx.forEach((ex: any) => {
            const chaveEx = String(ex.id || ex.nome || "").toLowerCase().trim();
            if (!chaveEx) return;

            let maxCargaExNaSessao = 0;
            if (Array.isArray(ex.series)) {
              ex.series.forEach((s: any) => {
                const c = extrairNumero(s.carga_feita);
                if (c > maxCargaExNaSessao) maxCargaExNaSessao = c;
              });
            }

            if (maxCargaExNaSessao > 0) {
              const recordeAnterior = recordesAteOMomento[chaveEx] || 0;
              if (recordeAnterior > 0 && maxCargaExNaSessao > recordeAnterior) {
                prsNestaSessao += 1;
                exerciciosPrSet.add(chaveEx);
              }
              if (maxCargaExNaSessao > recordeAnterior) {
                recordesAteOMomento[chaveEx] = maxCargaExNaSessao;
              }
            }
          });

          prsPorExecucaoMap[exec.id] = {
            totalPrs: prsNestaSessao,
            exerciciosComPr: exerciciosPrSet
          };
        });

        const formatarKGs = (pesoTotal: number) => Math.round(pesoTotal).toLocaleString('pt-BR');
        const listaDoresAluno = Array.isArray(doresData) ? doresData : [];

        const logsFormatados = execucoes.slice(0, 15).map(exec => {
          const diaEncontrado = workoutDaysData?.find((wd: any) => wd.id === exec.treino_id);
          const nomeTreinoBase = diaEncontrado?.name || "Treino Concluído";
          let nomeSemana: string | null = null;

          if (diaEncontrado?.week_id) {
            const semanaEncontrada = weeksData?.find((w: any) => w.id === diaEncontrado.week_id);
            if (semanaEncontrada?.name) {
              nomeSemana = semanaEncontrada.name;
            }
          }

          const nomeCompleto = nomeSemana ? `${nomeSemana} • ${nomeTreinoBase}` : nomeTreinoBase;

          const duracaoSecs = Number(exec.tempo_total_segundos) || 0;
          const mins = Math.floor(duracaoSecs / 60);
          const segs = duracaoSecs % 60;
          const duracaoFormatada = mins > 0 ? `${mins} min` : `${segs} s`;

          const dataInicioIso = exec.data_inicio || exec.created_at;
          const dataObj = dataInicioIso ? new Date(dataInicioIso) : null;
          const horarioExecucao = dataObj
            ? dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : "--:--";

          let volumeDoTreino = Number(exec.volume_total_kg) || 0;
          let maiorCargaSessao = 0;
          let totalSeriesPlanejadas = 0;
          let totalSeriesConcluidas = 0;
          let qtdObservacoesExercicios = 0;

          const infoPrSessao = prsPorExecucaoMap[exec.id] || { totalPrs: 0, exerciciosComPr: new Set() };
          const relatosDorSessao: any[] = [];

          const listaExerciciosRaw = Array.isArray(exec.dados_execucao) ? exec.dados_execucao : [];
          const precisaSomarVolume = volumeDoTreino === 0;

          const exerciciosDetalhados = listaExerciciosRaw.map((ex: any, exIdx: number) => {
            const seriesRaw = Array.isArray(ex.series) ? ex.series : [];
            totalSeriesPlanejadas += seriesRaw.length;

            let maiorCargaEx = 0;
            let seriesConcluidasEx = 0;

            const seriesFormatadas = seriesRaw.map((s: any, sIdx: number) => {
              const cargaNum = extrairNumero(s.carga_feita);
              const repsNum = extrairNumero(s.reps_feitas || s.reps_alvo);
              const isConcluida = Boolean(s.concluida) || cargaNum > 0;

              if (isConcluida) {
                seriesConcluidasEx += 1;
                totalSeriesConcluidas += 1;
                if (precisaSomarVolume) {
                  volumeDoTreino += (repsNum || 10) * cargaNum;
                }
              }

              if (cargaNum > maiorCargaEx) maiorCargaEx = cargaNum;
              if (cargaNum > maiorCargaSessao) maiorCargaSessao = cargaNum;

              return {
                id: s.id || `${ex.id}-s-${sIdx + 1}`,
                numero: s.numero || sIdx + 1,
                reps: s.reps_feitas && String(s.reps_feitas) !== "0" ? String(s.reps_feitas) : String(s.reps_alvo || "--"),
                repsAlvo: String(s.reps_alvo || "--"),
                carga: cargaNum > 0 ? `${cargaNum} kg` : (s.carga_feita ? `${s.carga_feita}` : "--"),
                cargaNum,
                descanso: s.tempo_alvo ? `${s.tempo_alvo}s` : `${ex.descanso || 60}s`,
                concluida: isConcluida
              };
            });

            const obsAlunoEx =
              ex.observacao_aluno && String(ex.observacao_aluno).trim().length > 0
                ? String(ex.observacao_aluno).trim()
                : null;

            if (obsAlunoEx) qtdObservacoesExercicios += 1;

            const dorEncontrada = listaDoresAluno.find(
              (d: any) =>
                String(d.exercicio_id) === String(ex.id) &&
                (!d.treino_id || String(d.treino_id) === String(exec.treino_id))
            );

            const teveDorNesteEx = Boolean(ex.relato_dor) || Boolean(dorEncontrada);
            let detalheDorEx = null;

            if (teveDorNesteEx) {
              detalheDorEx = {
                exercicioNome: ex.nome || `Exercício ${exIdx + 1}`,
                intensidade: dorEncontrada?.intensidade ?? null,
                descricao:
                  dorEncontrada?.descricao && String(dorEncontrada.descricao).trim().length > 0
                    ? String(dorEncontrada.descricao).trim()
                    : "O aluno sinalizou desconforto neste exercício durante a sessão."
              };
              relatosDorSessao.push(detalheDorEx);
            }

            const chaveEx = String(ex.id || ex.nome || "").toLowerCase().trim();
            const bateuPr = infoPrSessao.exerciciosComPr.has(chaveEx);

            return {
              id: ex.id || `ex-${exIdx}`,
              nome: ex.nome || `Exercício ${exIdx + 1}`,
              grupoMuscular: ex.grupo_muscular || "Geral",
              seriesPlanejadas: seriesRaw.length,
              seriesConcluidas: seriesConcluidasEx,
              maiorCarga: maiorCargaEx > 0 ? `${maiorCargaEx} kg` : "--",
              maiorCargaNum: maiorCargaEx,
              bateuPr,
              observacaoAluno: obsAlunoEx,
              observacaoPersonal: ex.observacao_personal || null,
              teveDor: teveDorNesteEx,
              detalheDor: detalheDorEx,
              series: seriesFormatadas
            };
          });

          const comentarioFinalSessao =
            exec.observacao_geral || exec.comentario_aluno || exec.observacoes || exec.comentario || null;

          const concluidasDisplay = totalSeriesConcluidas > 0 ? totalSeriesConcluidas : totalSeriesPlanejadas;

          return {
            id: exec.id,
            treinoId: exec.treino_id,
            created_at: dataInicioIso,
            horario: horarioExecucao,
            nomeTreino: nomeCompleto,
            nomeTreinoCurto: nomeTreinoBase,
            nomeSemana: nomeSemana,
            duracao: duracaoFormatada,
            rpe: exec.esforco_rpe,
            sentiuDor: Boolean(exec.sentiu_dor) || relatosDorSessao.length > 0,
            relatosDorSessao,
            volumeTotal: volumeDoTreino > 0 ? `${formatarKGs(volumeDoTreino)} kg` : "--",
            maiorCargaSessao: maiorCargaSessao > 0 ? `${maiorCargaSessao} kg` : "--",
            prsCount: infoPrSessao.totalPrs,
            seriesResumo: totalSeriesPlanejadas > 0 ? `${concluidasDisplay}/${totalSeriesPlanejadas}` : "--",
            comentarioFinal:
              comentarioFinalSessao && String(comentarioFinalSessao).trim().length > 0
                ? String(comentarioFinalSessao).trim()
                : null,
            qtdObservacoesExercicios,
            exerciciosDetalhados
          };
        });

        setUltimosLogs(logsFormatados);

      } else {
        setTotalTreinos(0); setStreak(0); setAdesao([]); setUltimosLogs([]); setAlertaTreino(null);
      }
    } catch (error) {
      console.log("Erro ao buscar evolução:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => { if (isMounted) carregarDadosAluno(true); });
    return () => { isMounted = false; };
  }, [conexaoId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const { data } = await supabase.from('conexoes').select('status').eq('id', conexaoId).single();
        if (data && data.status !== status) {
          setStatus(data.status); 
          carregarDadosAluno(true); 
        }
      } catch (e) {}
    });
    return unsubscribe;
  }, [navigation, conexaoId, status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosAluno();
    setRefreshing(false);
  };

  const irParaNovoContrato = () => {
    navigation.navigate("AdicionarAluno", { leadInjetado: aluno, conexaoId: conexaoId, planoAtivo: planoAtivo });
  };

  const atualizarStatusBasico = async (novoStatus: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("conexoes").update({ status: novoStatus }).eq("id", conexaoId);
      setStatus(novoStatus);

      if (novoStatus === "inativo") {
        const { data: planosAbertos } = await supabase
          .from("planos")
          .select("id")
          .eq("conexao_id", conexaoId)
          .neq("status", "cancelado");

        const idsPlanos = (planosAbertos || []).map((p) => p.id);

        if (idsPlanos.length > 0) {
          await supabase.from("planos").update({ status: "cancelado" }).in("id", idsPlanos);
          await supabase
            .from("mensalidades")
            .update({ status: "cancelada" })
            .in("plano_id", idsPlanos)
            .neq("status", "pago");

          await supabase.from("historico_financeiro_logs").insert([{
            personal_id: session?.user.id,
            aluno_id: aluno.id,
            referencia_id: idsPlanos[0],
            tipo_evento: "CONTRATO_CANCELADO",
            descricao: "Contrato encerrado e parceria movida para inativos.",
            metadados: { acao: "cancelamento" },
          }]);
        }
        Alert.alert("Ciclo Encerrado", "O aluno foi movido para inativos.");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalEncerraParceria = () => {
    const dataInicio = new Date(dataInicioParceria || Date.now());
    const diffDays = Math.floor(Math.abs(new Date().getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    let msg = "Tem certeza que deseja encerrar o contrato e pausar as cobranças?\n\nO aluno irá para o seu arquivo de inativos.";
    if (diffDays <= 7) msg = "Este contrato foi iniciado há menos de 7 dias.\nDeseja encerrar?";
    Alert.alert("Encerrar Parceria", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Encerrar", style: "destructive", onPress: () => atualizarStatusBasico("inativo") },
    ]);
  };

  const abrirChat = () => navigation.navigate("Chat", { conexaoId, nomeOutro: aluno.nome, fotoOutro: aluno.foto_url, tipoUsuarioLogado: "personal" });

  const calcularIMC = (p: string | number, a: string | number) => {
    if (!p || !a) return null;
    const h = Number(a) > 3 ? Number(a) / 100 : Number(a);
    const imc = parseFloat(p.toString()) / (h * h);
    let c = "", cor = theme.colors.textSecondary;
    if (imc < 18.5) { c = "Abaixo"; cor = theme.colors.warning; } 
    else if (imc < 24.9) { c = "Normal"; cor = theme.colors.success; } 
    else if (imc < 29.9) { c = "Sobrepeso"; cor = theme.colors.primary; } 
    else { c = "Obesidade"; cor = theme.colors.danger; }
    return { valor: imc.toFixed(1), classificacao: c, cor };
  };

  const calcularIdade = (d: string) => {
    if (!d) return "--";
    const n = new Date(d.includes("/") ? `${d.split("/")[2]}-${d.split("/")[1]}-${d.split("/")[0]}` : d);
    const h = new Date();
    let i = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i--;
    return isNaN(i) ? "--" : i.toString();
  };

  const mostrarAjudaAdesao = () => {
    Alert.alert(
      "O que é isso?",
      "Esta barra compara quantas vezes o aluno completou cada ficha.\n\nSe ele faz muito o 'Treino A' e pouco o 'Treino C', a barra do Treino C ficará menor e vermelha, indicando que ele pode estar pulando esse treino."
    );
  };

  const fotoUrlRaw = aluno?.foto_url;
  let fotoValida = null;
  if (typeof fotoUrlRaw === 'string' && fotoUrlRaw.trim().length > 5) fotoValida = fotoUrlRaw;
  const localizacaoFormatada = [aluno?.cidade?.trim(), aluno?.bairro?.trim()].filter(Boolean).join(" • ") || "Local não informado";
  const objetivoFinal = anamnese?.objetivo || (prefs?.objetivos || []).map((o: string) => o.charAt(0).toUpperCase() + o.slice(1)).join(" e ") || "Não informado";
  const metaDePeso = prefs?.meta_peso || null; 
  const displayFrequencia = MAP_FREQUENCIA[prefs?.frequencia_semanal || prefs?.frequencia] || "Não informado";
  const displayHistorico = NIVEIS_MAP[anamnese?.nivel_experiencia] || MAP_HISTORICO[prefs?.historico] || "Não informado";
  const isRestrito = anamnese ? anamnese.tem_restricao : ((prefs?.limitacoes || []).length > 0 && !(prefs?.limitacoes || []).includes("nenhuma"));
  const descRestricao = anamnese?.detalhes_restricao || ((prefs?.subs_limitacoes || []).length > 0 ? (prefs?.subs_limitacoes || []).join(", ") : prefs?.outra_limitacao);
  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);
  const orcamentoAluno = prefs?.orcamento ? `R$ ${prefs.orcamento}` : "Aberto";

  return {
    aluno, conexaoId, status, activeTab, setActiveTab, isFetchingData, loading, refreshing, onRefresh,
    alunoSolicitouSaida, planoAtivo, prefs, irParaNovoContrato, atualizarStatusBasico, handlePersonalEncerraParceria,
    abrirChat, fotoValida, objetivoFinal, localizacaoFormatada, metaDePeso, displayFrequencia, displayHistorico,
    isRestrito, descRestricao, dadosIMC, streak, totalTreinos, adesao, ultimosLogs, alertaTreino, dadosBio,
    calcularIdade, mostrarAjudaAdesao, orcamentoAluno
  };
}