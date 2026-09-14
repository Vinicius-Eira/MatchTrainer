import { useState, useEffect } from "react";
import { supabase } from "../../../services/supabase"; 

export function useProgress(navigation: any, routeConexaoId?: string) {
  const [loading, setLoading] = useState(true);

  const [mensagemPersonal, setMensagemPersonal] = useState<any>({
    texto: "Seu personal ainda não enviou nenhuma observação de evolução.",
    data: "Aguardando",
    temRecado: false
  });
  
  const [composicaoCorporal, setComposicaoCorporal] = useState<any>({
    dataAvaliacao: "Pendente",
    metricas: [
      { nome: "Peso", atual: "0 kg", diferenca: "-", evolucaoBoa: false },
      { nome: "Gordura", atual: "0 %", diferenca: "-", evolucaoBoa: false },
      { nome: "Massa Muscular", atual: "0 kg", diferenca: "-", evolucaoBoa: false }
    ]
  });
  
  const [resumoTreinos, setResumoTreinos] = useState({ concluidos: 0, volume: "0", tempo: "0h 0m" });
  const [recordes, setRecordes] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);

  const formatarTempo = (segundosTotais: number) => {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    return `${horas}h ${minutos}m`;
  };

  useEffect(() => {
    let isMounted = true;

    const carregarDados = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) return;

        let conexaoId = routeConexaoId;
        
        if (!conexaoId) {
          const { data: conexao } = await supabase
            .from('conexoes')
            .select('id, recado_evolucao, data_recado')
            .eq('aluno_id', user.id)
            .single();
            
          if (conexao && isMounted) {
            conexaoId = conexao.id;
            if (conexao.recado_evolucao) {
              setMensagemPersonal({
                texto: conexao.recado_evolucao,
                data: conexao.data_recado ? new Date(conexao.data_recado).toLocaleDateString('pt-BR') : "Recente",
                temRecado: true
              });
            }
          }
        }

        if (!conexaoId || !isMounted) return;

        const { data: avaliacoes } = await supabase
          .from('aluno_evolucao')
          .select('*')
          .eq('conexao_id', conexaoId)
          .order('data_registro', { ascending: false })
          .limit(2);

        if (avaliacoes && avaliacoes.length > 0 && isMounted) {
          const atual = avaliacoes[0];
          const anterior = avaliacoes.length > 1 ? avaliacoes[1] : null;

          const calcDiff = (valAtual: number, valAnt: number, inversoGordura = false) => {
            if (!valAnt) return { diff: "-", boa: true };
            const dif = valAtual - valAnt;
            const sinal = dif > 0 ? "+" : "";
            const boa = inversoGordura ? dif <= 0 : dif >= 0;
            return { diff: `${sinal}${dif.toFixed(1)}`, boa };
          };

          setComposicaoCorporal({
            dataAvaliacao: atual.data_registro.split('-').reverse().join('/'),
            metricas: [
              { nome: "Peso", atual: `${atual.peso || '0'} kg`, diferenca: calcDiff(atual.peso, anterior?.peso, true).diff, evolucaoBoa: calcDiff(atual.peso, anterior?.peso, true).boa },
              { nome: "Gordura", atual: `${atual.percentual_gordura || '0'} %`, diferenca: calcDiff(atual.percentual_gordura, anterior?.percentual_gordura, true).diff, evolucaoBoa: calcDiff(atual.percentual_gordura, anterior?.percentual_gordura, true).boa },
              { nome: "Massa Muscular", atual: `${atual.massa_magra || '0'} kg`, diferenca: calcDiff(atual.massa_magra, anterior?.massa_magra, false).diff, evolucaoBoa: calcDiff(atual.massa_magra, anterior?.massa_magra, false).boa }
            ]
          });
        }

        const { data: prs } = await supabase
          .from('recordes_pessoais')
          .select('*')
          .eq('conexao_id', conexaoId)
          .order('data_quebra', { ascending: false })
          .limit(5);

        if (prs && prs.length > 0 && isMounted) {
          setRecordes(prs.map(pr => ({
            id: pr.id,
            exercicio: pr.exercicio_nome,
            carga: pr.carga,
            data: pr.data_quebra ? pr.data_quebra.split('-').reverse().join('/') : "Recente"
          })));
        }

        const { data: treinosPrescritos } = await supabase
          .from('treinos_prescritos')
          .select('id, nome')
          .eq('conexao_id', conexaoId);

        if (treinosPrescritos && treinosPrescritos.length > 0 && isMounted) {
          const idsTreinos = treinosPrescritos.map(t => t.id);
          
          const { data: execucoes } = await supabase
            .from('treinos_execucoes')
            .select('*')
            .in('treino_id', idsTreinos)
            .order('data_inicio', { ascending: false });

          if (execucoes && execucoes.length > 0 && isMounted) {
            const tempoTotalSegundos = execucoes.reduce((acc, curr) => acc + (curr.duracao_segundos || 0), 0);
            
            setResumoTreinos({
              concluidos: execucoes.length,
              volume: "-", 
              tempo: formatarTempo(tempoTotalSegundos)
            });

            setHistorico(execucoes.slice(0, 5).map(exec => {
              const nomeTreino = treinosPrescritos.find(t => t.id === exec.treino_id)?.nome || "Treino";
              const dataExec = new Date(exec.data_inicio).toLocaleDateString('pt-BR');
              const mins = Math.floor((exec.duracao_segundos || 0) / 60);
              
              return {
                id: exec.id,
                treino: nomeTreino,
                data: dataExec,
                duracao: `${mins} min`,
                volume: "- kg"
              };
            }));
          }
        }
      } catch (error) {
        console.log("Erro ao carregar progresso:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      carregarDados();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirEvolucaoExercicio = (exercicioNome: string) => {
    console.log(`Detalhes: ${exercicioNome}`);
  };

  const voltar = () => navigation.goBack();

  return { loading, mensagemPersonal, composicaoCorporal, resumoTreinos, recordes, historico, abrirEvolucaoExercicio, voltar };
}