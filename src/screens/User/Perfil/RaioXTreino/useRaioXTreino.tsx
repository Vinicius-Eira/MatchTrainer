// @ts-nocheck
import React from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useRaioXTreino(navigation: any) {
  const [loading, setLoading] = React.useState(true);
  const [salvando, setSalvando] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);

  const [servicoBuscado, setServicoBuscado] = React.useState<any>(null);
  const [locaisTreino, setLocaisTreino] = React.useState<string[]>([]);
  const [turnos, setTurnos] = React.useState<string[]>([]);
  const [horarioEspecifico, setHorarioEspecifico] = React.useState("");
  const [frequencia, setFrequencia] = React.useState<any>(null);
  const [generoTreinador, setGeneroTreinador] = React.useState<any>(null);
  const [investimento, setInvestimento] = React.useState<any>(null);
  
  const [historico, setHistorico] = React.useState<any>(null);
  const [objetivos, setObjetivos] = React.useState<string[]>([]);
  const [outroObjetivoTexto, setOutroObjetivoTexto] = React.useState("");
  const [subsObjetivos, setSubsObjetivos] = React.useState<string[]>([]);
  
  const [limitacoes, setLimitacoes] = React.useState<string[]>([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = React.useState("");
  const [subsLimitacoes, setSubsLimitacoes] = React.useState<string[]>([]);

  const [cobranca, setCobranca] = React.useState<any>(null);
  const [acompanhamento, setAcompanhamento] = React.useState<any>(null);
  const [autonomia, setAutonomia] = React.useState<any>(null);
  const [valoresTreinador, setValoresTreinador] = React.useState<string[]>([]);
  const [outroValorTexto, setOutroValorTexto] = React.useState("");

  React.useEffect(() => {
    const carregarRaioX = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: conexaoAtiva } = await supabase
          .from("conexoes")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("status", "aluno_ativo")
          .single();

        if (conexaoAtiva) setIsLocked(true);

        const { data, error } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
        if (error && error.code !== "PGRST116") throw error;

        if (data?.preferencias) {
          const p = data.preferencias;
          const extractId = (val: any) => val ? (typeof val === "object" ? (val.id || val) : val) : null;
          const extractArr = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);

          setServicoBuscado({ id: extractId(p.servicoBuscado || p.servico_buscado || p.modalidade) });
          setLocaisTreino(extractArr(p.locaisTreino || p.locais_treino || p.local_treino));
          setTurnos(extractArr(p.turnos || p.turno_preferido));
          setHorarioEspecifico(p.horarioEspecifico || p.horario_especifico || "");
          setFrequencia({ id: extractId(p.frequencia) });
          setGeneroTreinador({ id: extractId(p.generoTreinador || p.genero_treinador) });
          setInvestimento({ id: extractId(p.investimento) });

          setHistorico({ id: extractId(p.historico) });
          setObjetivos(extractArr(p.objetivos || p.objetivo));
          setOutroObjetivoTexto(p.outroObjetivoTexto || p.outro_objetivo || "");
          setSubsObjetivos(extractArr(p.subsObjetivos || p.subs_objetivos || p.sub_objetivo));

          setLimitacoes(extractArr(p.limitacoes || p.limitacao));
          setOutraLimitacaoTexto(p.outraLimitacaoTexto || p.outra_limitacao || "");
          setSubsLimitacoes(extractArr(p.subsLimitacoes || p.subs_limitacoes || p.sub_limitacao));

          setCobranca({ id: extractId(p.cobranca || p.perfil_treinador) });
          setAcompanhamento({ id: extractId(p.acompanhamento) });
          setAutonomia({ id: extractId(p.autonomia) });
          setValoresTreinador(extractArr(p.valoresTreinador || p.valores_treinador));
          setOutroValorTexto(p.outroValorTexto || p.outro_valor || "");
        }
      } catch (error) {
        console.log("Erro ao carregar Raio-X:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarRaioX();
  }, []);

  const handleLockedPress = () => {
    Alert.alert("🔒 Edição Blindada", "Você possui um contrato ativo. Alterações no Raio-X só são permitidas sem vínculo ativo.");
  };

  const toggleArrayItem = (item: string, stateArray: string[], setStateArray: any) => {
    if (isLocked) return handleLockedPress();
    if (stateArray.includes(item)) setStateArray(stateArray.filter((i) => i !== item));
    else setStateArray([...stateArray, item]);
  };

  const handleSalvar = async () => {
    if (isLocked) return;
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");

      const { data: userData } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
      
      const novasPreferencias = {
        ...(userData?.preferencias || {}),
        servico_buscado: servicoBuscado?.id || null,
        locais_treino: locaisTreino.length ? locaisTreino : null,
        turnos: turnos.length ? turnos : null,
        horario_especifico: horarioEspecifico.trim() || null,
        frequencia: frequencia?.id || null,
        genero_treinador: generoTreinador?.id || null,
        investimento: investimento?.id || null,
        
        historico: historico?.id || null,
        objetivos: objetivos.length ? objetivos : null,
        outro_objetivo: objetivos.includes("outro") ? outroObjetivoTexto.trim() : null,
        subs_objetivos: subsObjetivos.length ? subsObjetivos : null,
        
        limitacoes: limitacoes.length ? limitacoes : null,
        outra_limitacao: limitacoes.includes("outra") ? outraLimitacaoTexto.trim() : null,
        subs_limitacoes: subsLimitacoes.length ? subsLimitacoes : null,

        cobranca: cobranca?.id || null,
        acompanhamento: acompanhamento?.id || null,
        autonomia: autonomia?.id || null,
        valores_treinador: valoresTreinador.length ? valoresTreinador : null,
        outro_valor: valoresTreinador.includes("outro") ? outroValorTexto.trim() : null,
        setup_completo: true 
      };

      const { error } = await supabase.from("usuarios").update({ preferencias: novasPreferencias }).eq("id", user.id);
      if (error) throw error;
      
      Alert.alert("Sucesso", "Seu Raio-X foi sincronizado com seu Perfil de Match!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao salvar as preferências.");
    } finally {
      setSalvando(false);
    }
  };

  return {
    state: { loading, salvando, isLocked, servicoBuscado, locaisTreino, turnos, horarioEspecifico, frequencia, generoTreinador, investimento, historico, objetivos, outroObjetivoTexto, subsObjetivos, limitacoes, outraLimitacaoTexto, subsLimitacoes, cobranca, acompanhamento, autonomia, valoresTreinador, outroValorTexto },
    actions: { setServicoBuscado, setLocaisTreino, setTurnos, setHorarioEspecifico, setFrequencia, setGeneroTreinador, setInvestimento, setHistorico, setObjetivos, setOutroObjetivoTexto, setSubsObjetivos, setLimitacoes, setOutraLimitacaoTexto, setSubsLimitacoes, setCobranca, setAcompanhamento, setAutonomia, setValoresTreinador, setOutroValorTexto, toggleArrayItem, handleLockedPress, handleSalvar }
  };
}