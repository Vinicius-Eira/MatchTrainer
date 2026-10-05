import { useState, useEffect } from "react";
import { Alert, LayoutAnimation, UIManager, Platform } from "react-native";
import { supabase } from "../../../../../services/supabase";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function usePropostaAluno(route: any, navigation: any) {
  const conexaoId = route?.params?.conexaoId;

  const [proposta, setProposta] = useState<any>(null);
  const [personalNome, setPersonalNome] = useState<string>("Treinador");
  const [personalFoto, setPersonalFoto] = useState<string | null>(null);
  const [regrasExpandidas, setRegrasExpandidas] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState<boolean>(false);

  const regrasPadrao = "✅ **1. Atrasos**\nA tolerância para os treinos ou avaliações é de 15 minutos.\n\n✅ **2. Pagamentos**\nO seu acesso ao planejamento só será liberado/atualizado após a confirmação financeira.\n\n✅ **3. Suporte e Dúvidas**\nO canal oficial é o WhatsApp. Respostas em até 24h úteis.";

  const carregarDadosDaProposta = async () => {
    try {
      const { data: conexao, error: errConn } = await supabase
        .from('conexoes')
        .select('aluno_id, personal_id') 
        .eq('id', conexaoId)
        .single();
      
      if (errConn) {
        Alert.alert("Erro na Conexão", "Não foi possível encontrar este vínculo.");
        return navigation.goBack();
      }

      const { data: personal } = await supabase
        .from('perfis')
        .select('nome, foto_url')
        .eq('id', conexao.personal_id)
        .single();
      
      if (personal) {
        setPersonalNome(personal.nome);
        setPersonalFoto(personal.foto_url);
      }

      const { data: contrato, error: errContrato } = await supabase
        .from('planos')
        .select('*')
        .eq('conexao_id', conexaoId)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (errContrato) {
        Alert.alert("Erro ao buscar proposta", errContrato.message);
        setLoadingData(false);
        return;
      }

      if (contrato) {
        setProposta(contrato);
      } else {
        Alert.alert("Plano não encontrado", "Houve um problema ao buscar a proposta digital.");
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert("Erro Fatal", error.message);
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (conexaoId) {
      Promise.resolve().then(() => {
        if (isMounted) carregarDadosDaProposta();
      });
    } else {
      Alert.alert("Erro de Rota", "Nenhuma conexão encontrada.");
      navigation.goBack();
    }

    return () => {
      isMounted = false;
    };
  }, [conexaoId]);

  const toggleRegras = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRegrasExpandidas(!regrasExpandidas);
  };

  const handleAceitarProposta = async () => {
    setLoading(true);
    try {
      await supabase.from('conexoes').update({ status: 'aluno_ativo' }).eq('id', conexaoId);
      
      if (proposta?.id) {
        await supabase.from('planos').update({ status: 'ativo' }).eq('id', proposta.id);
        
        await supabase.from('historico_financeiro_logs').insert([{
          personal_id: proposta.personal_id,
          aluno_id: proposta.aluno_id,
          referencia_id: proposta.id,
          tipo_evento: "CONTRATO_ASSINADO",
          descricao: `O aluno assinou o contrato de R$ ${proposta.valor_mensal}.`,
          metadados: { valor: proposta.valor_mensal }
        }]);
      }

      setLoading(false);
      setModalSucessoVisivel(true);
    } catch (error) {
      setLoading(false);
      Alert.alert("Erro", "Tivemos um problema ao oficializar a assinatura. Tente novamente.");
    }
  };

  const handleNegociar = () => {
    navigation.navigate("Chat", {
      conexaoId: conexaoId,
      nomeOutro: personalNome,
      tipoUsuarioLogado: "aluno",
    });
  };

  return {
    state: {
      proposta, personalNome, personalFoto, regrasExpandidas,
      loadingData, loading, modalSucessoVisivel, regrasPadrao, conexaoId
    },
    actions: {
      toggleRegras, handleAceitarProposta, handleNegociar, setModalSucessoVisivel, navigation
    }
  };
}