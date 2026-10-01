import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../../../../services/supabase"; 

export const formatarLocalizacaoPremium = (cidade?: string, bairro?: string) => {
  if (!cidade && !bairro) return "LOCAL NÃO DEFINIDO";
  if (bairro && cidade) return `${bairro.trim()}, ${cidade.trim()}`;
  if (bairro) return bairro.trim();
  return cidade?.trim();
};

export const getMotivoStyle = (texto: string) => {
  const t = texto.toLowerCase();
  if (t.includes("objetivo")) return { icon: "bullseye", color: "#0A84FF", title: "Objetivo Alinhado", bg: "rgba(10, 132, 255, 0.1)" };
  if (t.includes("horário") || t.includes("rotina") || t.includes("turno")) return { icon: "clock", color: "#FF9500", title: "Horário Compatível", bg: "rgba(255, 149, 0, 0.1)" };
  if (t.includes("cuidar") || t.includes("necessidade") || t.includes("experiência")) return { icon: "heartbeat", color: "#FF3B30", title: "Saúde Protegida", bg: "rgba(255, 59, 48, 0.1)" };
  if (t.includes("perfil") || t.includes("didática") || t.includes("preferência")) return { icon: "user-graduate", color: "#FFD60A", title: "Conexão Pessoal", bg: "rgba(255, 214, 10, 0.1)" };
  if (t.includes("orçamento") || t.includes("preço")) return { icon: "wallet", color: "#32ADE6", title: "Investimento Aprovado", bg: "rgba(50, 173, 230, 0.1)" };
  if (t.includes("km") || t.includes("distância")) return { icon: "map-marker-alt", color: "#00E676", title: "Perto de Você", bg: "rgba(0, 230, 118, 0.1)" };
  return { icon: "check-circle", color: "#00E676", title: "Afinidade Geral", bg: "rgba(0, 230, 118, 0.1)" };
};

export const getEspecialidadeInfo = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("hipertrofia")) return { icon: "dumbbell", title: "Hipertrofia", desc: "Treinos elaborados para ganho de massa e volume muscular." };
  if (t.includes("emagrecimento")) return { icon: "fire-alt", title: "Emagrecimento", desc: "Metodologia de alta intensidade focada na queima de gordura." };
  if (t.includes("saude") || t.includes("saúde") || t.includes("qualidade")) return { icon: "heartbeat", title: "Saúde & Bem-Estar", desc: "Foco na melhora da qualidade de vida e condicionamento." };
  if (t.includes("performance") || t.includes("rendimento")) return { icon: "bolt", title: "Performance", desc: "Treinamento focado em alto rendimento e superação de limites." };
  if (t.includes("gestante") || t.includes("gravidez")) return { icon: "baby", title: "Gestantes", desc: "Acompanhamento seguro e adaptado para todas as fases da gravidez." };
  if (t.includes("idoso") || t.includes("terceira") || t.includes("envelhecimento")) return { icon: "walking", title: "Terceira Idade", desc: "Atenção especial à mobilidade, fortalecimento e longevidade." };
  if (t.includes("lesão") || t.includes("lesao") || t.includes("dor") || t.includes("reabilitação")) return { icon: "band-aid", title: "Reabilitação Física", desc: "Cuidado técnico focado na prevenção e fortalecimento de lesões." };
  if (t.includes("médica") || t.includes("medica") || t.includes("clínica")) return { icon: "notes-medical", title: "Acompanhamento Clínico", desc: "Treino 100% alinhado com recomendações médicas específicas." };
  if (t.includes("cardio") || t.includes("coração")) return { icon: "heart-broken", title: "Cardiopatias", desc: "Prescrição de exercícios monitorada para a saúde do coração." };
  if (t.includes("hiperten") || t.includes("pressão")) return { icon: "tachometer-alt", title: "Hipertensão", desc: "Controle de intensidade focado na estabilidade pressórica." };
  if (t.includes("diabet") || t.includes("glicemia")) return { icon: "tint", title: "Diabetes", desc: "Manejo glicêmico através do exercício físico." };
  if (t.includes("postura") || t.includes("coluna")) return { icon: "child", title: "Correção Postural", desc: "Trabalho focado em core, flexibilidade e alinhamento biomecânico." };
  return { icon: "bullseye", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Acompanhamento especializado com foco total nesta necessidade." };
};

export function usePerfilPublicoPersonal(route: any, navigation: any) {
  const { personalId: pId, id, matchPreCalculado } = route.params || {};
  const personalId = id || pId;
  
  const [personal, setPersonal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notaMedia, setNotaMedia] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  
  const [modalMatchVisivel, setModalMatchVisivel] = useState(false);
  const [propostaPendenteId, setPropostaPendenteId] = useState<string | null>(null);

  const [precoExibido, setPrecoExibido] = useState("--");
  const [labelPrecoExibido, setLabelPrecoExibido] = useState("Valor");

  const carregarPerfilCompleto = useCallback(async () => {
    if (!personalId) {
      console.error("Nenhum ID foi passado na navegação!");
      Alert.alert("Erro", "ID do profissional não encontrado.");
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [reqPersonal, reqNota, reqAvaliacoes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { p_id: personalId }),
        supabase.from("avaliacoes").select("id, nota, comentario, criado_em, usuarios(nome)").eq("personal_id", personalId).order("criado_em", { ascending: false }).limit(5),
      ]);

      if (reqPersonal.error) throw reqPersonal.error;
      const prof = reqPersonal.data;
      setPersonal(prof);
      setNotaMedia(reqNota.data);
      if (reqAvaliacoes.data) setAvaliacoes(reqAvaliacoes.data);

      if (user) {
        const { data: connData } = await supabase
          .from("conexoes")
          .select("id, status")
          .eq("usuario_id", user.id)
          .eq("personal_id", personalId)
          .eq("status", "aguardando_assinatura")
          .maybeSingle();
          
        setPropostaPendenteId(connData ? connData.id : null);

        const { data: uData } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
        const alunoPrefs = typeof uData?.preferencias === "string" ? JSON.parse(uData.preferencias) : uData?.preferencias || {};

        const modalidadeAluno = alunoPrefs.servicos_buscados || ["Consultoria", "Presencial"];
        let matchType = "Híbrido";
        if (modalidadeAluno.includes("Consultoria") && !modalidadeAluno.includes("Presencial")) matchType = "Consultoria";
        else if (modalidadeAluno.includes("Presencial") && !modalidadeAluno.includes("Consultoria")) matchType = "Presencial";

        let precoA = matchType === "Consultoria" ? prof.preco_consultoria : prof.preco_presencial;
        if (!precoA) precoA = prof.preco_medio;

        setPrecoExibido(precoA);
        setLabelPrecoExibido(matchType === "Consultoria" ? "Mensalidade" : "Por Aula");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil completo no supabase:", error);
      Alert.alert("Erro", "Perfil indisponível no momento.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [personalId, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarPerfilCompleto(); 
    });
    return unsubscribe;
  }, [navigation, carregarPerfilCompleto]);

  const handleContato = async (tipo: "whatsapp" | "chat") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Alert.alert("Aviso", "Crie uma conta para falar com o personal.");

      const { data: conexoes, error: errBusca } = await supabase
        .from("conexoes")
        .select("id, status, criado_em, atualizado_em")
        .eq("usuario_id", user.id) 
        .eq("personal_id", personal.id);

      if (errBusca) throw errBusca;

      let bloqueado = false;
      let horasRestantes = 0;
      let conexaoExistente = null;

      if (conexoes && conexoes.length > 0) {
        conexoes.sort((a, b) => new Date(b.atualizado_em || b.criado_em).getTime() - new Date(a.atualizado_em || a.criado_em).getTime());
        conexaoExistente = conexoes[0];

        if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
          const dataCancelamento = new Date(conexaoExistente.atualizado_em || conexaoExistente.criado_em);
          const hoje = new Date();
          const diffHoras = Math.abs(hoje.getTime() - dataCancelamento.getTime()) / 36e5;
          if (diffHoras < 24) {
            bloqueado = true;
            horasRestantes = Math.ceil(24 - diffHoras);
          }
        }
      }

      if (bloqueado) {
        Alert.alert("Ação Bloqueada 🛑", `Você encerrou a parceria com este profissional recentemente.\n\nAguarde ${horasRestantes} hora(s) antes de enviar nova solicitação.`);
        return;
      }

      let conexaoIdFinal = null;
      setModalMatchVisivel(false);

      if (tipo === "whatsapp") {
        if (!conexaoExistente) {
          await supabase.from("conexoes").insert([{ usuario_id: user.id, personal_id: personal.id, status: "em_contato" }]);
        } else if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
           await supabase.from("conexoes").update({ status: "em_contato" }).eq("id", conexaoExistente.id);
        }
        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Encontrei seu perfil no Match Trainer e gostaria de tirar algumas dúvidas.`;
        Linking.openURL(url).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
      } else {
        if (!conexaoExistente) {
          const { data: novaConexao, error: erroCriar } = await supabase
            .from("conexoes")
            .insert([{ usuario_id: user.id, personal_id: personal.id, status: "pendente" }])
            .select("id")
            .single();
          
          if (erroCriar) throw erroCriar;
          conexaoIdFinal = novaConexao.id;
        } else {
          conexaoIdFinal = conexaoExistente.id;
          if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
            await supabase.from("conexoes").update({ status: "pendente" }).eq("id", conexaoIdFinal);
          }
        }
        
        navigation.navigate("Chat", {
          conexaoId: conexaoIdFinal,
          nomeOutro: personal.nome,
          fotoOutro: personal.foto_url,
          tipoUsuarioLogado: "aluno",
        });
      }
    } catch (error) {
      console.log("Erro no contato:", error);
      Alert.alert("Erro", "Não foi possível iniciar o contato. Tente novamente.");
    }
  };

  const abrirRedeSocial = (tipo: string, handle: string) => {
    let url = "";
    if (tipo === "instagram") url = `https://instagram.com/${handle.replace("@", "")}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
  };

  let especialidades: any = {};
  if (personal) {
    try {
      especialidades = typeof personal.especialidades === "string" ? JSON.parse(personal.especialidades) : personal.especialidades || {};
    } catch (e) {}
  }

  const todasAsTags = personal ? [
    ...(especialidades?.objetivos || []),
    ...(especialidades?.limitacoes || []),
    ...(especialidades?.subs || []),
  ].filter((tag) => tag && tag !== "nenhuma") : [];

  const temGaleria = personal?.galeria_fotos && Array.isArray(personal.galeria_fotos) && personal.galeria_fotos.length > 0;
  const fotoPerfil = personal?.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";
  const modalidadesAtendidas = personal?.servicos_oferecidos || ["Consultoria", "Presencial"];
  const isPoucasVagas = personal?.status_agenda === "Poucas Vagas" || personal?.status_agenda === "Quase Lotada";
  
  const formacao = personal?.formacao || null;
  const locaisAtendimento = personal?.locais_atendimento && Array.isArray(personal.locais_atendimento) ? personal.locais_atendimento : [];

  return {
    state: {
      loading,
      personal,
      notaMedia,
      avaliacoes,
      modalMatchVisivel,
      propostaPendenteId,
      precoExibido,
      labelPrecoExibido,
      matchPreCalculado,
      especialidades,
      todasAsTags,
      temGaleria,
      fotoPerfil,
      modalidadesAtendidas,
      isPoucasVagas,
      formacao,
      locaisAtendimento
    },
    actions: {
      setModalMatchVisivel,
      handleContato,
      abrirRedeSocial
    }
  };
}