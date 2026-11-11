import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../services/supabase";

export function useProgress(navigation: any, routeConexaoId?: string) {
  const [loading, setLoading] = useState(true);
  
  const [abaAtiva, setAbaAtiva] = useState<'evolucao' | 'corpo'>('evolucao');
  const [metricaSelecionada, setMetricaSelecionada] = useState<'peso' | 'gordura' | 'massa'>('peso');
  const [periodoFiltro, setPeriodoFiltro] = useState<'1M' | '3M' | '6M' | 'TUDO'>('TUDO');
  
  const [tipoSegmentar, setTipoSegmentar] = useState<'gordura' | 'massa'>('gordura');

  const [mensagemPersonal, setMensagemPersonal] = useState<any>({
    texto: "Seu personal ainda não enviou nenhuma observação de evolução.",
    data: "Aguardando",
    temRecado: false
  });
  
  const [avaliacoesBrutas, setAvaliacoesBrutas] = useState<any[]>([]);
  const [dadosBaseUsuario, setDadosBaseUsuario] = useState<any>(null);

  const [composicaoCorporal, setComposicaoCorporal] = useState<any>({
    temHistorico: false,
    dataAvaliacao: "Pendente",
    pesoAtual: 0,
    pesoInicial: 0,
    metaPeso: 0,
    variacaoPeso: { diff: "-", boa: true },
    imcValor: 0,
    imcClassificacao: "Normal",
    
    gordura: { atual: "--", diff: "-", boa: true },
    massaMuscular: { atual: "--", diff: "-", boa: true },
    massaGordura: { atual: "--", diff: "-", boa: true },
    aguaCorporal: { atual: "--", diff: "-", boa: true },
    gorduraVisceral: { atual: "--", diff: "-", boa: true },
    taxaMetabolica: "--",
    
    segmentarGordura: {
      bracoDir: { atual: "--", diff: "-" },
      bracoEsq: { atual: "--", diff: "-" },
      tronco: { atual: "--", diff: "-" },
      pernaDir: { atual: "--", diff: "-" },
      pernaEsq: { atual: "--", diff: "-" },
    },
    segmentarMassa: {
      bracoDir: { atual: "--", diff: "-" },
      bracoEsq: { atual: "--", diff: "-" },
      tronco: { atual: "--", diff: "-" },
      pernaDir: { atual: "--", diff: "-" },
      pernaEsq: { atual: "--", diff: "-" },
    }
  });
  
  const [resumoTreinos, setResumoTreinos] = useState({
    concluidos: 0,
    streak: 0,
    ultimos30Dias: 0,
    volume: "0",
    tempo: "0h 0m"
  });
  const [historico, setHistorico] = useState<any[]>([]);

  const formatarTempo = (segundosTotais: number) => {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos} min`;
  };

  const formatarKGs = (pesoTotal: number) => pesoTotal.toLocaleString('pt-BR');

  const calcDiff = (valAtual: any, valAnt: any, inversoGordura = false) => {
    const numAtual = Number(valAtual);
    const numAnt = Number(valAnt);
    if (!numAnt || !numAtual || isNaN(numAtual) || isNaN(numAnt)) return { diff: "-", boa: true };
    const dif = numAtual - numAnt;
    if (Math.abs(dif) < 0.05) return { diff: "0.0", boa: true };
    const sinal = dif > 0 ? "+" : "";
    const boa = inversoGordura ? dif <= 0 : dif >= 0;
    return { diff: `${sinal}${dif.toFixed(1)}`, boa };
  };

  const calcularIMC = (pesoKg: number, alturaCm: number) => {
    if (!pesoKg || !alturaCm || alturaCm === 0) return { valor: 0, classificacao: "N/A" };
    const alturaM = alturaCm > 3 ? alturaCm / 100 : alturaCm; 
    const imc = pesoKg / (alturaM * alturaM);
    let classif = "Normal";
    if (imc < 18.5) classif = "Abaixo";
    else if (imc >= 25 && imc < 30) classif = "Sobrepeso";
    else if (imc >= 30) classif = "Obeso";
    return { valor: Number(imc.toFixed(1)), classificacao: classif };
  };

  const calcularStreak = (execucoes: any[]) => {
    if (!execucoes || execucoes.length === 0) return 0;
    const datasUnicas = Array.from(
      new Set(
        execucoes.map((e) => {
          const d = new Date(e.data_inicio || e.created_at);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      )
    ).sort().reverse();

    let streakCount = 1;
    for (let i = 0; i < datasUnicas.length - 1; i++) {
      const atual = new Date(datasUnicas[i]);
      const anterior = new Date(datasUnicas[i + 1]);
      const diffDias = Math.round((atual.getTime() - anterior.getTime()) / (1000 * 3600 * 24));
      if (diffDias <= 3) {
        streakCount++;
      } else {
        break;
      }
    }
    return streakCount;
  };

  const graficoMestre = useMemo(() => {
    if (!dadosBaseUsuario || avaliacoesBrutas.length < 1) return [];

    let avaliacoesFiltradas = [...avaliacoesBrutas];
    
    if (periodoFiltro !== 'TUDO') {
      const hoje = new Date();
      let mesesSubtrair = 1;
      if (periodoFiltro === '3M') mesesSubtrair = 3;
      if (periodoFiltro === '6M') mesesSubtrair = 6;
      
      const dataLimite = new Date();
      dataLimite.setMonth(hoje.getMonth() - mesesSubtrair);
      
      avaliacoesFiltradas = avaliacoesFiltradas.filter(av => new Date(av.data_registro || av.criado_em) >= dataLimite);
    }

    if (avaliacoesFiltradas.length > 0) {
      const mesesCurtos = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const avParaGrafico = [...avaliacoesFiltradas].reverse();
      return avParaGrafico.map(av => {
        let valor = 0;
        if (metricaSelecionada === 'peso') valor = Number(av.peso) || 0;
        if (metricaSelecionada === 'gordura') valor = Number(av.percentual_gordura) || 0;
        if (metricaSelecionada === 'massa') valor = Number(av.massa_magra) || 0;

        const d = new Date(av.data_registro || av.criado_em);
        const labelFormatado = `${String(d.getDate()).padStart(2, '0')} ${mesesCurtos[d.getMonth()]}`;
        return {
          value: valor,
          label: labelFormatado,
          dataPointText: String(valor)
        };
      });
    }
    return [];
  }, [metricaSelecionada, periodoFiltro, avaliacoesBrutas, dadosBaseUsuario]);

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        let conexaoId = routeConexaoId;
        const { data: conexao } = await supabase
          .from('conexoes')
          .select('id, recado_evolucao, data_recado')
          .eq('usuario_id', user.id)
          .in('status', ['aluno_ativo', 'aguardando_assinatura', 'pendente'])
          .maybeSingle();

        if (conexao && isMounted) {
          if (!conexaoId) conexaoId = conexao.id;
          if (conexao.recado_evolucao) {
            setMensagemPersonal({
              texto: conexao.recado_evolucao,
              data: conexao.data_recado ? new Date(conexao.data_recado).toLocaleDateString('pt-BR') : "Recente",
              temRecado: true
            });
          }
        }

        if (!conexaoId || !isMounted) return;

        const { data: userData } = await supabase
          .from('usuarios')
          .select('peso, altura, preferencias, criado_em')
          .eq('id', user.id)
          .maybeSingle();

        if (userData && isMounted) setDadosBaseUsuario(userData);

        let prefsObj: any = {};
        try {
          prefsObj = typeof userData?.preferencias === 'string'
            ? JSON.parse(userData.preferencias)
            : (userData?.preferencias || {});
        } catch (e) {
          prefsObj = {};
        }

        const pesoSetup = Number(userData?.peso) || 0;
        const alturaSetup = Number(userData?.altura) || 0;
        const metaPesoSetup = Number(prefsObj?.meta_peso) || 0;

        const { data: avaliacoes } = await supabase
          .from('aluno_evolucao')
          .select('*')
          .eq('conexao_id', conexaoId)
          .order('data_registro', { ascending: false });

        if (avaliacoes && isMounted) {
          setAvaliacoesBrutas(avaliacoes);
          
          if (avaliacoes.length > 0) {
            const atual = avaliacoes[0];
            const anterior = avaliacoes.length > 1 ? avaliacoes[1] : null;
            
            const pAtual = Number(atual.peso) || pesoSetup;
            const dataObj = new Date(atual.data_registro || atual.criado_em);
            const dataAval = dataObj.toLocaleDateString('pt-BR');
            const resultIMC = calcularIMC(pAtual, alturaSetup);

            let segAtual: any = {};
            let segAnt: any = {};
            try {
              segAtual = typeof atual.analise_segmentar === 'string' ? JSON.parse(atual.analise_segmentar) : (atual.analise_segmentar || {});
              segAnt = typeof anterior?.analise_segmentar === 'string' ? JSON.parse(anterior.analise_segmentar) : (anterior?.analise_segmentar || {});
            } catch (e) {}

            setComposicaoCorporal((prev: any) => ({
              ...prev,
              temHistorico: true,
              dataAvaliacao: dataAval,
              pesoAtual: pAtual,
              pesoInicial: pesoSetup || pAtual,
              metaPeso: metaPesoSetup,
              variacaoPeso: calcDiff(pAtual, anterior?.peso || pesoSetup, true),
              imcValor: resultIMC.valor,
              imcClassificacao: resultIMC.classificacao,
              
              gordura: { atual: atual.percentual_gordura ? `${atual.percentual_gordura}` : "--", diff: calcDiff(atual.percentual_gordura, anterior?.percentual_gordura, true).diff, boa: calcDiff(atual.percentual_gordura, anterior?.percentual_gordura, true).boa },
              massaMuscular: { atual: atual.massa_magra ? `${atual.massa_magra}` : "--", diff: calcDiff(atual.massa_magra, anterior?.massa_magra, false).diff, boa: calcDiff(atual.massa_magra, anterior?.massa_magra, false).boa },
              
              massaGordura: { atual: atual.massa_de_gordura ? `${atual.massa_de_gordura}` : "--", diff: calcDiff(atual.massa_de_gordura, anterior?.massa_de_gordura, true).diff, boa: calcDiff(atual.massa_de_gordura, anterior?.massa_de_gordura, true).boa },
              aguaCorporal: { atual: atual.agua_corporal ? `${atual.agua_corporal}` : "--", diff: calcDiff(atual.agua_corporal, anterior?.agua_corporal, false).diff, boa: calcDiff(atual.agua_corporal, anterior?.agua_corporal, false).boa },
              gorduraVisceral: { atual: atual.gordura_visceral ? `${atual.gordura_visceral}` : "--", diff: calcDiff(atual.gordura_visceral, anterior?.gordura_visceral, true).diff, boa: calcDiff(atual.gordura_visceral, anterior?.gordura_visceral, true).boa },
              
              taxaMetabolica: atual.taxa_metabolica_basal ? `${atual.taxa_metabolica_basal}` : "--",

              segmentarGordura: {
                bracoDir: { atual: segAtual.gord_braco_dir ? `${segAtual.gord_braco_dir}` : "--", diff: calcDiff(segAtual.gord_braco_dir, segAnt.gord_braco_dir, true).diff },
                bracoEsq: { atual: segAtual.gord_braco_esq ? `${segAtual.gord_braco_esq}` : "--", diff: calcDiff(segAtual.gord_braco_esq, segAnt.gord_braco_esq, true).diff },
                tronco: { atual: segAtual.gord_tronco ? `${segAtual.gord_tronco}` : "--", diff: calcDiff(segAtual.gord_tronco, segAnt.gord_tronco, true).diff },
                pernaDir: { atual: segAtual.gord_perna_dir ? `${segAtual.gord_perna_dir}` : "--", diff: calcDiff(segAtual.gord_perna_dir, segAnt.gord_perna_dir, true).diff },
                pernaEsq: { atual: segAtual.gord_perna_esq ? `${segAtual.gord_perna_esq}` : "--", diff: calcDiff(segAtual.gord_perna_esq, segAnt.gord_perna_esq, true).diff },
              },
              segmentarMassa: {
                bracoDir: { atual: segAtual.massa_braco_dir ? `${segAtual.massa_braco_dir}` : "--", diff: calcDiff(segAtual.massa_braco_dir, segAnt.massa_braco_dir, false).diff },
                bracoEsq: { atual: segAtual.massa_braco_esq ? `${segAtual.massa_braco_esq}` : "--", diff: calcDiff(segAtual.massa_braco_esq, segAnt.massa_braco_esq, false).diff },
                tronco: { atual: segAtual.massa_tronco ? `${segAtual.massa_tronco}` : "--", diff: calcDiff(segAtual.massa_tronco, segAnt.massa_tronco, false).diff },
                pernaDir: { atual: segAtual.massa_perna_dir ? `${segAtual.massa_perna_dir}` : "--", diff: calcDiff(segAtual.massa_perna_dir, segAnt.massa_perna_dir, false).diff },
                pernaEsq: { atual: segAtual.massa_perna_esq ? `${segAtual.massa_perna_esq}` : "--", diff: calcDiff(segAtual.massa_perna_esq, segAnt.massa_perna_esq, false).diff },
              }
            }));
          } else {
            const resultIMC = calcularIMC(pesoSetup, alturaSetup);
            setComposicaoCorporal((prev: any) => ({
              ...prev,
              temHistorico: false,
              dataAvaliacao: "Ponto de Partida",
              pesoAtual: pesoSetup,
              pesoInicial: pesoSetup,
              metaPeso: metaPesoSetup,
              variacaoPeso: { diff: "-", boa: true },
              imcValor: resultIMC.valor,
              imcClassificacao: resultIMC.classificacao
            }));
          }
        }

        const [{ data: workoutDaysData }, { data: weeksData }, { data: execucoes }] = await Promise.all([
          supabase.from('workout_days').select('id, name, week_id'),
          supabase.from('training_weeks').select('id, name'),
          supabase
            .from('treinos_execucoes')
            .select('*')
            .eq('conexao_id', conexaoId)
            .order('data_inicio', { ascending: false })
        ]);

        if (execucoes && execucoes.length > 0 && isMounted) {
          let tempoTotalSegundosGeral = 0;
          let volumeTotalKgGeral = 0;

          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
          let contUltimos30Dias = 0;

          const historicoProcessado = execucoes.map((exec: any) => {
            const diaEncontrado = workoutDaysData?.find((wd: any) => wd.id === exec.treino_id);
            let nomeTreino = diaEncontrado?.name || "Treino Concluído";

            if (diaEncontrado?.week_id) {
              const semanaEncontrada = weeksData?.find((w: any) => w.id === diaEncontrado.week_id);
              if (semanaEncontrada?.name) {
                nomeTreino = `${semanaEncontrada.name} • ${diaEncontrado.name}`;
              }
            }

            const dateObj = new Date(exec.data_inicio || exec.created_at);
            if (dateObj >= trintaDiasAtras) {
              contUltimos30Dias++;
            }

            const dataExec = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            const duracaoSecs = Number(exec.tempo_total_segundos) || 0;
            tempoTotalSegundosGeral += duracaoSecs;
            const mins = Math.floor(duracaoSecs / 60);

            const volumeDoTreino = Number(exec.volume_total_kg) || 0;
            volumeTotalKgGeral += volumeDoTreino;

            return {
              id: exec.id,
              treino: nomeTreino,
              data: dataExec,
              duracaoReal: mins > 0 ? `${mins} min` : null,
              volumeReal: volumeDoTreino > 0 ? `${formatarKGs(volumeDoTreino)} kg` : null,
              rpe: exec.esforco_rpe || null,
              comentarioAluno: exec.comentario_aluno || exec.observacoes || exec.comentario || null
            };
          });

          const streakCalc = calcularStreak(execucoes);

          setResumoTreinos({
            concluidos: execucoes.length,
            streak: streakCalc,
            ultimos30Dias: contUltimos30Dias,
            volume: formatarKGs(volumeTotalKgGeral),
            tempo: formatarTempo(tempoTotalSegundosGeral)
          });
          setHistorico(historicoProcessado.slice(0, 8)); 
        }
      } catch (error) {
        console.log("Erro ao carregar progresso:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregarDados();
    return () => { isMounted = false; };
  }, [routeConexaoId]);

  const voltar = () => navigation.goBack();

  return { 
    loading, abaAtiva, setAbaAtiva, mensagemPersonal, composicaoCorporal, 
    resumoTreinos, historico, voltar,
    metricaSelecionada, setMetricaSelecionada, periodoFiltro, setPeriodoFiltro,
    tipoSegmentar, setTipoSegmentar, graficoMestre 
  };
}