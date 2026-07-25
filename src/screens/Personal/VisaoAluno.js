import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, 
  Alert, ActivityIndicator, Platform, StatusBar, Dimensions, Modal, TextInput, KeyboardAvoidingView, RefreshControl,
  Linking
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const MAP_INVESTIMENTO = { "base": "R$ 90 a 110 / aula", "mid": "R$ 120 a 150 / aula", "premium": "A partir de R$ 160 / aula", "pacote": "Pacote Mensal" };
const MAP_PERFIL = { "acolhedor": "O Acolhedor (Didático e paciente)", "motivador": "O Motivador (Intenso e animado)", "tecnico": "O Técnico (Foco em biomecânica)", "estrategista": "O Estrategista (Foco em metas)" };
const MAP_HISTORICO = { "iniciante": "Iniciante Total", "inconstante": "Inconstante (Vai e para)", "intermediario": "Intermediário", "avancado": "Avançado" };
const MAP_FREQUENCIA = { "1-2": "1 a 2 dias/sem", "3-4": "3 a 4 dias/sem", "5-6": "5 a 6 dias/sem", "7": "Todos os dias" };

const OPCOES_SERVICOS = ["Consultoria", "Presencial", "Avaliação Física", "Mentoria", "Grupo de Corrida", "Reabilitação"];

export default function VisaoAluno({ route, navigation }) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState(statusAtual);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alunoSolicitouSaida, setAlunoSolicitouSaida] = useState(false);
  const [dataInicioParceria, setDataInicioParceria] = useState(null);

  const [planoAtivo, setPlanoAtivo] = useState(null);
  const [modalContratoVisivel, setModalContratoVisivel] = useState(false);
  
  const [formServicos, setFormServicos] = useState(["Consultoria"]);
  
  const [formFrequencia, setFormFrequencia] = useState("Mensal");
  const [formValor, setFormValor] = useState("");
  const [formDia, setFormDia] = useState("10");
  const [formObservacoes, setFormObservacoes] = useState("");
  const [processandoContrato, setProcessandoContrato] = useState(false);

  let prefs = {};
  try { prefs = typeof aluno.preferencias === 'string' ? JSON.parse(aluno.preferencias) : (aluno.preferencias || {}); } catch(e) {}

  const carregarDadosAluno = async () => {
    await verificarPedidosDeSaida();
    if (status === 'aluno_ativo') {
      await buscarContratoExistente();
    }
  };

  useEffect(() => {
    carregarDadosAluno();
  }, [status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosAluno();
    setRefreshing(false);
  };

  const buscarContratoExistente = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('aluno_id', aluno.id)
        .eq('personal_id', session.user.id)
        .eq('status', 'ativo')
        .single();
      
      if (data) setPlanoAtivo(data);
    } catch (error) {
      console.log("Erro ao buscar contrato:", error);
    }
  };

  const verificarPedidosDeSaida = async () => {
    try {
      const { data: conexaoData } = await supabase.from('conexoes').select('confirmado_em, atualizado_em, criado_em').eq('id', conexaoId).single();
      if (conexaoData) setDataInicioParceria(conexaoData.confirmado_em || conexaoData.atualizado_em || conexaoData.criado_em);

      const { data: msgs } = await supabase.from('mensagens').select('conteudo').eq('conexao_id', conexaoId).eq('tipo_remetente', 'aluno').like('conteudo', '%solicitar o encerramento%');
      if (msgs && msgs.length > 0) setAlunoSolicitouSaida(true);
    } catch (error) { console.log(error); }
  };

  const abrirModalParaCriarOuEditar = () => {
    if (planoAtivo) {
      setFormServicos(planoAtivo.servicos_inclusos && planoAtivo.servicos_inclusos.length > 0 ? planoAtivo.servicos_inclusos : ["Consultoria"]);
      setFormFrequencia(planoAtivo.frequencia || "Mensal");
      setFormValor(planoAtivo.valor_mensal?.toString() || "");
      setFormDia(planoAtivo.dia_vencimento?.toString() || "10");
      setFormObservacoes(planoAtivo.observacoes || "");
    } else {
      setFormServicos(["Consultoria"]);
      setFormValor(""); setFormDia("10"); setFormObservacoes("");
    }
    setModalContratoVisivel(true);
  };

  const toggleServico = (servico) => {
    if (formServicos.includes(servico)) {
      setFormServicos(formServicos.filter(s => s !== servico));
    } else {
      setFormServicos([...formServicos, servico]);
    }
  };

  const firmarContrato = async () => {
    if (formServicos.length === 0) return Alert.alert("Atenção", "Selecione pelo menos um serviço para este contrato.");
    if (!formValor || !formDia) return Alert.alert("Atenção", "Preencha o valor e o dia de vencimento.");
    
    setProcessandoContrato(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const valorFloat = parseFloat(formValor.replace(',', '.'));
      const diaVenc = parseInt(formDia);

      const dataVencimento = new Date();
      dataVencimento.setDate(diaVenc);
      if (dataVencimento < new Date()) {
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      }

      const mesReferenciaStr = new Date(dataVencimento.getFullYear(), dataVencimento.getMonth(), 1).toISOString().split('T')[0];
      const dataVencimentoStr = dataVencimento.toISOString().split('T')[0];

      let proximaCobranca = null;
      if (formFrequencia !== 'Avulso') {
        proximaCobranca = new Date(dataVencimento);
        if (formFrequencia === 'Mensal') proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
        else if (formFrequencia === 'Trimestral') proximaCobranca.setMonth(proximaCobranca.getMonth() + 3);
        else if (formFrequencia === 'Semestral') proximaCobranca.setMonth(proximaCobranca.getMonth() + 6);
        else if (formFrequencia === 'Anual') proximaCobranca.setFullYear(proximaCobranca.getFullYear() + 1);
      }
      const proximaCobrancaStr = proximaCobranca ? proximaCobranca.toISOString().split('T')[0] : null;

      if (planoAtivo) {
        const { error: erroPlano } = await supabase.from('planos').update({
          servicos_inclusos: formServicos, 
          frequencia: formFrequencia,
          valor_mensal: valorFloat,
          dia_vencimento: diaVenc,
          observacoes: formObservacoes,
          proxima_cobranca: proximaCobrancaStr
        }).eq('id', planoAtivo.id);
        
        if (erroPlano) throw erroPlano;

        const { data: faturasPendentes } = await supabase.from('mensalidades')
          .select('id')
          .eq('plano_id', planoAtivo.id)
          .eq('status', 'pendente');

        if (faturasPendentes && faturasPendentes.length > 0) {
            const { error: errUpdate } = await supabase.from('mensalidades').update({
                valor_cobrado: valorFloat,
                data_vencimento: dataVencimentoStr,
                mes_referencia: mesReferenciaStr,
                personal_id: session.user.id,
                aluno_id: aluno.id
            }).eq('id', faturasPendentes[0].id);
            if (errUpdate) throw new Error("Falha ao atualizar fatura: " + errUpdate.message);
        } else {
            const { error: errInsert } = await supabase.from('mensalidades').insert([{
              plano_id: planoAtivo.id,
              personal_id: session.user.id, 
              aluno_id: aluno.id,          
              mes_referencia: mesReferenciaStr,
              valor_cobrado: valorFloat,
              data_vencimento: dataVencimentoStr,
              status: 'pendente'
            }]);
            if (errInsert) throw new Error("Falha ao gerar nova fatura: " + errInsert.message);
        }
        
        await supabase.from('historico_financeiro_logs').insert([{
          personal_id: session.user.id,
          aluno_id: aluno.id,
          referencia_id: planoAtivo.id,
          tipo_evento: 'CONTRATO_ATUALIZADO',
          descricao: `Contrato atualizado: ${formServicos.join(' + ')} (${formFrequencia}). Novo valor: R$ ${valorFloat.toFixed(2)}.`,
          metadados: { valor: valorFloat, frequencia: formFrequencia, servicos: formServicos, dia_vencimento: diaVenc }
        }]);

        await buscarContratoExistente();
        setModalContratoVisivel(false);
        Alert.alert("Sucesso", "O contrato foi atualizado e a fatura sincronizada.");

      } else {
        const { error: erroConexao } = await supabase.from('conexoes').update({ status: 'aluno_ativo', atualizado_em: new Date().toISOString() }).eq('id', conexaoId);
        if (erroConexao) throw erroConexao;

        const { data: planoData, error: erroPlano } = await supabase.from('planos').insert([{
          personal_id: session.user.id,
          aluno_id: aluno.id,
          servicos_inclusos: formServicos, 
          frequencia: formFrequencia,
          valor_mensal: valorFloat,
          dia_vencimento: diaVenc,
          observacoes: formObservacoes,
          status: 'ativo',
          proxima_cobranca: proximaCobrancaStr,
          data_inicio: new Date().toISOString().split('T')[0]
        }]).select().single();
        
        if (erroPlano) throw erroPlano;

        const { error: errInsertNovo } = await supabase.from('mensalidades').insert([{
          plano_id: planoData.id,
          personal_id: session.user.id, 
          aluno_id: aluno.id,          
          mes_referencia: mesReferenciaStr,
          valor_cobrado: valorFloat,
          data_vencimento: dataVencimentoStr,
          status: 'pendente'
        }]);
        
        if (errInsertNovo) throw new Error("Falha ao gerar primeira mensalidade: " + errInsertNovo.message);

        await supabase.from('historico_financeiro_logs').insert([{
          personal_id: session.user.id, 
          aluno_id: aluno.id,
          referencia_id: planoData.id,
          tipo_evento: 'CONTRATO_CRIADO',
          descricao: `Contrato de ${formServicos.join(' + ')} (${formFrequencia}) iniciado. Valor: R$ ${valorFloat.toFixed(2)}.`,
          metadados: { valor: valorFloat, frequencia: formFrequencia, servicos: formServicos, dia_vencimento: diaVenc }
        }]);

        setStatus('aluno_ativo');
        setPlanoAtivo(planoData);
        setModalContratoVisivel(false);
        Alert.alert("Parceria Fechada! 🎉", "O contrato foi firmado e a primeira mensalidade já está no seu painel financeiro.");
      }
    } catch (error) {
      Alert.alert("Erro Técnico", "Ação bloqueada: " + error.message);
    } finally {
      setProcessandoContrato(false);
    }
  };

  const atualizarStatusBasico = async (novoStatus) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('conexoes').update({ status: novoStatus }).eq('id', conexaoId);
      setStatus(novoStatus);
      
      if (novoStatus === 'inativo') {
        if (planoAtivo) {
          await supabase.from('planos').update({ status: 'cancelado' }).eq('id', planoAtivo.id);
          
          await supabase.from('historico_financeiro_logs').insert([{
            personal_id: session.user.id,
            aluno_id: aluno.id,
            referencia_id: planoAtivo.id,
            tipo_evento: 'CONTRATO_CANCELADO',
            descricao: `Contrato encerrado e parceria movida para inativos.`,
            metadados: { acao: "cancelamento" }
          }]);
        }
        Alert.alert("Ciclo Encerrado", "O aluno foi movido para os inativos e as cobranças futuras foram canceladas.");
        navigation.goBack();
      } else if (novoStatus === 'recusado') {
        navigation.goBack();
      }
    } catch (error) { Alert.alert("Erro", "Falha ao processar."); } finally { setLoading(false); }
  };

  const handlePersonalEncerraParceria = () => {
    const dataInicio = new Date(dataInicioParceria || Date.now());
    const hoje = new Date();
    const diffDays = Math.floor(Math.abs(hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    let msg = "Tem certeza que deseja encerrar o contrato e pausar as cobranças?\n\nO aluno irá para o seu arquivo de inativos.";
    
    if (diffDays <= 7) {
      msg = "Este contrato foi iniciado há menos de 7 dias (Período de Adaptação).\n\nDeseja encerrar e cancelar as cobranças?";
    } else if (diffDays < 30) {
      msg = "Atenção: O aluno não completou o primeiro ciclo de 30 dias.\n\nTem certeza que deseja forçar o cancelamento do contrato agora?";
    }

    Alert.alert("Encerrar Parceria", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Encerrar", style: "destructive", onPress: () => atualizarStatusBasico('inativo') }
    ]);
  };

  const abrirChat = () => navigation.navigate('Chat', { conexaoId, nomeOutro: aluno.nome, fotoOutro: aluno.foto_url, tipoUsuarioLogado: 'personal' });

  const calcularIdade = (d) => { if (!d) return '--'; const n = new Date(d.includes('/') ? `${d.split('/')[2]}-${d.split('/')[1]}-${d.split('/')[0]}` : d); const h = new Date(); let i = h.getFullYear() - n.getFullYear(); const m = h.getMonth() - n.getMonth(); if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i--; return isNaN(i) ? '--' : i.toString(); };
  const calcularIMC = (p, a) => { if (!p || !a) return null; const h = a > 3 ? a / 100 : a; const imc = parseFloat(p) / (h * h); let c = '', cor = theme.colors.textSecondary; if (imc < 18.5) { c = 'Abaixo'; cor = theme.colors.warning; } else if (imc < 24.9) { c = 'Normal'; cor = theme.colors.success; } else if (imc < 29.9) { c = 'Sobrepeso'; cor = theme.colors.primary; } else { c = 'Obesidade'; cor = theme.colors.danger; } return { valor: imc.toFixed(1), classificacao: c, cor }; };
  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);
  const temRestricao = prefs.limitacao && prefs.limitacao !== 'nenhuma';
  const subsRestricoes = prefs.sub_limitacao && prefs.sub_limitacao.length > 0 ? prefs.sub_limitacao.join(", ") : "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}><Feather name="chevron-left" size={26} color={theme.colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Aluno</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}>
        
        {alunoSolicitouSaida && status === 'aluno_ativo' && (
          <View style={styles.bannerDesistencia}>
            <Ionicons name="warning" size={24} color={theme.colors.backgroundPure} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerDesistenciaTitle}>Solicitação de Desligamento</Text>
              <Text style={styles.bannerDesistenciaText}>Este aluno solicitou o fim da consultoria. Confirme o encerramento no final da tela.</Text>
            </View>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(255,107,0,0.15)', theme.colors.background]} style={styles.heroGradient} />
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image source={{ uri: aluno.foto_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            {status === 'aluno_ativo' && <View style={styles.onlineBadge}><View style={styles.onlineBadgeInner} /></View>}
            {status === 'inativo' && <View style={[styles.onlineBadge, {backgroundColor: theme.colors.background, borderColor: theme.colors.textMuted}]}><Ionicons name="archive" size={14} color={theme.colors.textMuted} /></View>}
          </View>
          <Text style={styles.studentName}>{aluno.nome}</Text>
          <Text style={styles.studentGoal}>Foco: {prefs.objetivo || 'Treinamento Geral'}</Text>
          
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoPill}><Ionicons name="location" size={14} color={theme.colors.primary} /><Text style={styles.quickInfoText} numberOfLines={1}>{aluno.cidade || 'Não informado'}</Text></View>
            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=55${aluno.telefone?.replace(/\D/g, '')}`)} style={[styles.quickInfoPill, {borderColor: theme.colors.whatsapp}]}>
              <Ionicons name="logo-whatsapp" size={14} color={theme.colors.whatsapp} /><Text style={[styles.quickInfoText, {color: theme.colors.whatsapp}]}>{aluno.telefone || 'Sem número'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {status === 'aluno_ativo' && planoAtivo && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="document-text" size={20} color="#00E676" />
              <Text style={styles.sectionHeading}>Contrato Ativo</Text>
            </View>
            <View style={styles.contratoCard}>
              <LinearGradient colors={["rgba(0,230,118,0.1)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFill} borderRadius={20} />
              
              <View style={styles.contratoRowTop}>
                 <Text style={styles.contratoValueTop}>{planoAtivo.frequencia}</Text>
                 <Text style={styles.contratoLabelTop}>Dia {planoAtivo.dia_vencimento}</Text>
              </View>

              <View style={styles.contratoRow}>
                <View style={styles.contratoCol}>
                  <Text style={styles.contratoLabel}>Serviços Contratados</Text>
                  <Text style={styles.contratoValue}>{planoAtivo.servicos_inclusos ? planoAtivo.servicos_inclusos.join(' + ') : 'Não informado'}</Text>
                </View>
                <View style={styles.contratoColRight}>
                  <Text style={styles.contratoLabel}>Valor Total</Text>
                  <Text style={[styles.contratoValue, {color: "#00E676", fontSize: 20}]}>R$ {Number(planoAtivo.valor_mensal).toFixed(2)}</Text>
                </View>
              </View>

              {planoAtivo.observacoes ? (
                 <Text style={styles.contratoObsText}>Obs: {planoAtivo.observacoes}</Text>
              ) : null}

              <TouchableOpacity style={styles.btnEditarContrato} onPress={abrirModalParaCriarOuEditar}>
                <Text style={styles.btnEditarContratoText}>Ajustar Contrato</Text>
                <Ionicons name="chevron-forward" size={14} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === 'aluno_ativo' && !planoAtivo && (
          <View style={styles.sectionContainer}>
             <View style={styles.bannerAlertaSemContrato}>
               <Ionicons name="warning" size={22} color="#FFD700" style={{marginRight: 10}} />
               <View style={{flex: 1}}>
                 <Text style={styles.bannerAlertaTitle}>Atenção: Aluno Sem Contrato</Text>
                 <Text style={styles.bannerAlertaText}>Este aluno é um cadastro antigo e não possui vínculo no Recebimentos. O Dashboard não conseguirá filtrá-lo.</Text>
               </View>
             </View>
             <TouchableOpacity style={styles.btnCriarContratoUrgente} onPress={abrirModalParaCriarOuEditar} activeOpacity={0.8}>
                <Text style={styles.btnCriarContratoUrgenteText}>Configurar Contrato Agora</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}><FontAwesome5 name="clipboard-list" size={18} color={theme.colors.primary} /><Text style={styles.sectionHeading}>Raio-X do Treinamento</Text></View>
          <View style={styles.goalPremiumCard}>
            <LinearGradient colors={['rgba(255,107,0,0.12)', 'rgba(255,107,0,0.02)']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.goalIconBox}><Feather name="target" size={24} color={theme.colors.primary} /></View>
            <View style={styles.goalTextContent}>
              <Text style={styles.goalLabel}>Objetivo Principal</Text>
              <Text style={styles.goalValue} numberOfLines={1}>{prefs.outroObjetivo || prefs.objetivo || 'Não informado'}</Text>
            </View>
          </View>

          {prefs.sub_objetivo && prefs.sub_objetivo.length > 0 && (
            <View style={styles.subTagsContainer}>
              {prefs.sub_objetivo.map((sub, index) => (
                <View key={index} style={styles.subTagPill}><Text style={styles.subTagText}>{sub}</Text></View>
              ))}
            </View>
          )}

          <View style={styles.trainingGrid}>
            <View style={styles.trainingGridRow}>
              <View style={styles.trainingGridItem}>
                <MaterialCommunityIcons name="medal-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Histórico Físico</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{MAP_HISTORICO[prefs.historico] || 'Não informado'}</Text>
              </View>
              <View style={styles.trainingGridItem}>
                <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Frequência</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{MAP_FREQUENCIA[prefs.frequencia] || 'Não informado'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}><MaterialCommunityIcons name="heart-pulse" size={20} color={theme.colors.primary} /><Text style={styles.sectionHeading}>Biometria & Saúde</Text></View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}><Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={styles.statIcon} /><Text style={styles.statValue}>{calcularIdade(aluno.data_nascimento)}</Text><Text style={styles.statLabel}>Anos</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}><MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.colors.primary} style={styles.statIcon} /><Text style={styles.statValue}>{aluno.peso ? `${aluno.peso}` : '--'}</Text><Text style={styles.statLabel}>Kg</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}><MaterialCommunityIcons name="human-male-height" size={20} color={theme.colors.primary} style={styles.statIcon} /><Text style={styles.statValue}>{aluno.altura ? `${aluno.altura}` : '--'}</Text><Text style={styles.statLabel}>Cm</Text></View>
          </View>

          {dadosIMC && (
            <View style={[styles.imcCard, { borderColor: `${dadosIMC.cor}40`, backgroundColor: `${dadosIMC.cor}08` }]}>
              <View style={styles.imcHeaderRow}><Text style={styles.imcTitle}>Índice de Massa Corporal (IMC)</Text></View>
              <View style={styles.imcValueRow}>
                <Text style={styles.imcNumber}>{dadosIMC.valor}</Text>
                <View style={[styles.imcBadge, { backgroundColor: `${dadosIMC.cor}20`, borderColor: dadosIMC.cor }]}><View style={[styles.imcBadgeDot, { backgroundColor: dadosIMC.cor }]} /><Text style={[styles.imcBadgeText, { color: dadosIMC.cor }]}>{dadosIMC.classificacao}</Text></View>
              </View>
            </View>
          )}

          <View style={[styles.medicalAlertCard, temRestricao ? styles.medicalAlertDanger : styles.medicalAlertSafe]}>
            <View style={styles.medicalAlertHeader}>
              <Ionicons name={temRestricao ? "warning" : "checkmark-circle"} size={22} color={temRestricao ? theme.colors.danger : theme.colors.success} />
              <Text style={[styles.medicalAlertTitle, temRestricao ? {color: theme.colors.danger} : {color: theme.colors.success}]}>{temRestricao ? "Atenção: Restrições Físicas" : "Nenhuma Restrição Relatada"}</Text>
            </View>
            {temRestricao && (
              <View style={styles.medicalAlertBody}>
                <Text style={styles.medicalConditionText}>Condição: <Text style={{color: theme.colors.text}}>{prefs.limitacao}</Text></Text>
                {subsRestricoes !== "" && <Text style={styles.medicalConditionText}>Foco/Local: <Text style={{color: theme.colors.text}}>{subsRestricoes}</Text></Text>}
                {prefs.detalhe_outra_limitacao && <Text style={styles.medicalConditionDesc}>{prefs.detalhe_outra_limitacao}</Text>}
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}><Ionicons name="briefcase" size={20} color={theme.colors.primary} /><Text style={styles.sectionHeading}>Alinhamento Comercial</Text></View>
          <View style={styles.commercialCard}>
            <View style={styles.commercialRow}>
              <View style={styles.commercialIconBg}><FontAwesome5 name="user-tie" size={16} color={theme.colors.primary} /></View>
              <View style={styles.commercialContent}>
                <Text style={styles.commercialLabel}>Professor Desejado</Text>
                <Text style={styles.commercialValue}>{MAP_PERFIL[prefs.perfil_treinador] || 'Sem preferência exata'}</Text>
              </View>
            </View>
            <View style={styles.dividerCommercial} />
            <View style={styles.commercialRow}>
              <View style={styles.commercialIconBg}><FontAwesome5 name="money-bill-wave" size={16} color={theme.colors.success} /></View>
              <View style={styles.commercialContent}>
                <Text style={styles.commercialLabel}>Orçamento / Investimento</Text>
                <Text style={[styles.commercialValue, {color: theme.colors.success}]}>{MAP_INVESTIMENTO[prefs.investimento] || 'Aberto a propostas'}</Text>
              </View>
            </View>
          </View>
        </View>

        {status === 'aluno_ativo' && (
          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.btnDangerOutline} onPress={handlePersonalEncerraParceria}>
              <Text style={styles.btnDangerText}>Encerrar Contrato</Text>
            </TouchableOpacity>
            <Text style={styles.dangerZoneHelp}>O aluno perderá acesso aos treinos e será movido para o histórico.</Text>
          </View>
        )}
      </ScrollView>

      {status !== 'inativo' && (
        <View style={styles.floatingActionBar}>
          {status === 'lead' || status === 'em_contato' ? (
            <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Responder Aluno</Text>
            </TouchableOpacity>

          ) : status === 'pendente' || status === 'aguardando_personal' ? (
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.btnChatOutline} onPress={abrirChat} activeOpacity={0.8}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.btnChatOutlineText}>Conversar Antes</Text>
              </TouchableOpacity>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnDecline} onPress={() => atualizarStatusBasico('recusado')} disabled={loading}>
                  <Feather name="x" size={24} color={theme.colors.danger} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnAccept} onPress={abrirModalParaCriarOuEditar} disabled={loading} activeOpacity={0.85}>
                  <Text style={styles.btnAcceptText}>Criar Contrato</Text>
                  <Ionicons name="document-text" size={20} color={theme.colors.backgroundPure} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Abrir Conversa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={modalContratoVisivel} animationType="slide" transparent>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalCardPremium}>
            
            <View style={styles.modalHeaderPremium}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.modalIconBg}>
                  <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.modalTitlePremium}>{planoAtivo ? "Ajustar Contrato" : "Firmar Contrato"}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalContratoVisivel(false)} style={styles.modalCloseBtnPremium} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitlePremium}>Configure as regras de cobrança e serviço para oficializar a parceria e liberar o acesso aos treinos.</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 15 }}>
              <View style={styles.modalBlock}>
                <View style={styles.modalBlockHeader}>
                  <Ionicons name="briefcase" size={16} color="#AAA" style={{marginRight: 6}} />
                  <Text style={styles.modalBlockTitle}>Escopo do Serviço (Pacote)</Text>
                </View>
                
                <Text style={styles.modalMicroLabel}>Serviços Inclusos no Combo:</Text>
                <View style={styles.servicosContainer}>
                  {OPCOES_SERVICOS.map(servico => {
                    const isSelected = formServicos.includes(servico);
                    return (
                      <TouchableOpacity 
                        key={servico} 
                        style={[styles.servicoChip, isSelected && styles.servicoChipActive]} 
                        onPress={() => toggleServico(servico)} 
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.servicoChipText, isSelected && styles.servicoChipTextActive]}>{servico}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.modalMicroLabel, {marginTop: 15}]}>Frequência de Faturamento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.freqScrollContainerPremium}>
                   {["Avulso", "Mensal", "Trimestral", "Semestral", "Anual"].map(freq => (
                      <TouchableOpacity key={freq} style={[styles.freqChipPremium, formFrequencia === freq && styles.freqChipActivePremium]} onPress={() => setFormFrequencia(freq)} activeOpacity={0.8}>
                         <Text style={[styles.freqChipTextPremium, formFrequencia === freq && styles.freqChipTextActivePremium]}>{freq}</Text>
                      </TouchableOpacity>
                   ))}
                </ScrollView>
              </View>

              <View style={styles.modalBlock}>
                <View style={styles.modalBlockHeader}>
                  <Ionicons name="wallet" size={16} color="#AAA" style={{marginRight: 6}} />
                  <Text style={styles.modalBlockTitle}>Detalhes Financeiros</Text>
                </View>

                <View style={styles.financeiroRowPremium}>
                  <View style={styles.financeiroColG}>
                    <Text style={styles.modalMicroLabel}>Valor Total</Text>
                    <View style={styles.inputBoxFinanceiro}>
                      <Text style={styles.inputPrefixFinanceiro}>R$</Text>
                      <TextInput 
                        style={styles.inputFinanceiro} 
                        keyboardType="numeric" 
                        value={formValor} 
                        onChangeText={setFormValor} 
                        placeholder="0,00" 
                        placeholderTextColor="#555" 
                        keyboardAppearance="dark"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.financeiroColP}>
                    <Text style={styles.modalMicroLabel}>Vencimento</Text>
                    <View style={styles.inputBoxFinanceiro}>
                      <Ionicons name="calendar-outline" size={18} color="#888" style={{marginRight: 6}} />
                      <TextInput 
                        style={styles.inputFinanceiroSmall} 
                        keyboardType="numeric" 
                        value={formDia} 
                        onChangeText={setFormDia} 
                        maxLength={2} 
                        placeholder="Dia" 
                        placeholderTextColor="#555" 
                        keyboardAppearance="dark"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.modalBlock}>
                <View style={styles.modalBlockHeader}>
                  <Ionicons name="chatbox-ellipses" size={16} color="#AAA" style={{marginRight: 6}} />
                  <Text style={styles.modalBlockTitle}>Condições & Observações (Opcional)</Text>
                </View>
                <View style={styles.inputBoxPremiumArea}>
                   <TextInput 
                     style={styles.inputAreaPremium} 
                     multiline 
                     value={formObservacoes} 
                     onChangeText={setFormObservacoes} 
                     placeholder="Ex: Treinos de seg a sex, restrição médica alinhada..." 
                     placeholderTextColor="#555" 
                     keyboardAppearance="dark"
                   />
                </View>
              </View>

              <View style={styles.modalInfoBox}>
                <MaterialCommunityIcons name="shield-check" size={32} color="#00E676" style={{marginRight: 14}} />
                <View style={{flex: 1}}>
                  <Text style={styles.modalInfoTitle}>Geração Automática</Text>
                  <Text style={styles.modalInfoText}>A mensalidade será lançada no seu financeiro e o aluno será notificado todo dia <Text style={{fontWeight: 'bold', color: '#FFF'}}>{formDia || "X"}</Text>.</Text>
                </View>
              </View>

            </ScrollView>

            <View style={{ paddingTop: 15 }}>
              <TouchableOpacity style={[styles.btnConfirmarContratoPremium, processandoContrato && {opacity: 0.7}]} onPress={firmarContrato} disabled={processandoContrato} activeOpacity={0.8}>
                <LinearGradient colors={["#00E676", "#00C853"]} style={styles.btnGradientPremium}>
                  {processandoContrato ? <ActivityIndicator color="#000" /> : (
                    <>
                      <Ionicons name={planoAtivo ? "checkmark-done" : "rocket"} size={22} color="#000" style={{marginRight: 8}} />
                      <Text style={styles.btnConfirmarContratoTextPremium}>{planoAtivo ? "Salvar e Atualizar" : "Oficializar Parceria"}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 15, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.5)' : 'transparent' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.fonts.title, textTransform: 'uppercase', letterSpacing: 1.5 },
  scrollContent: { paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 220 }, 

  bannerDesistencia: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.warning, padding: 20, marginHorizontal: 20, marginTop: 10, borderRadius: 16 },
  bannerDesistenciaTitle: { color: theme.colors.backgroundPure, fontSize: 15, fontWeight: '900', textTransform: 'uppercase' },
  bannerDesistenciaText: { color: 'rgba(0,0,0,0.7)', fontSize: 13, fontWeight: '600', marginTop: 4 },

  bannerAlertaSemContrato: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(255, 215, 0, 0.1)", padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.4)", marginBottom: 15 },
  bannerAlertaTitle: { color: "#FFD700", fontSize: 13, fontWeight: "bold", textTransform: 'uppercase', marginBottom: 2 },
  bannerAlertaText: { color: "#FFF", fontSize: 12, lineHeight: 18 },
  btnCriarContratoUrgente: { backgroundColor: "#FFD700", paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: "#FFD700", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  btnCriarContratoUrgenteText: { color: "#000", fontSize: 14, fontWeight: "900", textTransform: 'uppercase' },

  heroSection: { alignItems: 'center', paddingTop: 10, paddingBottom: 25, position: 'relative' },
  heroGradient: { position: 'absolute', top: -100, left: 0, right: 0, height: 350 },
  avatarWrapper: { position: 'relative', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, opacity: 0.2, blurRadius: 25 },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: theme.colors.primary, backgroundColor: theme.colors.surface, zIndex: 2 },
  onlineBadge: { position: 'absolute', bottom: 4, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  onlineBadgeInner: { width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.success },
  studentName: { color: theme.colors.text, fontSize: 28, fontFamily: theme.fonts.title, marginBottom: 4, textAlign: 'center', letterSpacing: 0.5 },
  studentGoal: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 },
  
  quickInfoRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingHorizontal: 20 },
  quickInfoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, gap: 6, flexShrink: 1 },
  quickInfoText: { color: theme.colors.textBody, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  sectionContainer: { paddingHorizontal: 20, marginBottom: 35 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionHeading: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 10, letterSpacing: 0.5 },

  contratoCard: { backgroundColor: "#121212", borderRadius: 20, borderWidth: 1, borderColor: "#00E676", position: 'relative', overflow: 'hidden' },
  contratoRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "rgba(0, 230, 118, 0.15)", paddingHorizontal: 20, paddingVertical: 10 },
  contratoValueTop: { color: "#00E676", fontSize: 14, fontWeight: "bold", textTransform: 'uppercase' },
  contratoLabelTop: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  contratoRow: { flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' },
  contratoCol: { flex: 1, alignItems: 'flex-start' },
  contratoColRight: { flex: 1, alignItems: 'flex-end' },
  contratoLabel: { color: "#888", fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 },
  contratoValue: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  contratoObsText: { color: "#AAA", fontSize: 12, fontStyle: 'italic', paddingHorizontal: 20, paddingBottom: 15 },
  btnEditarContrato: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" },
  btnEditarContratoText: { color: "#888", fontSize: 12, fontWeight: "bold", marginRight: 4, textTransform: 'uppercase' },

  goalPremiumCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)', overflow: 'hidden' },
  goalIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)' },
  goalTextContent: { flex: 1, justifyContent: 'center' },
  goalLabel: { color: theme.colors.textSecondary, fontSize: 11, textTransform: 'uppercase', fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  goalValue: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5, textTransform: 'capitalize' },

  subTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subTagPill: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderLight },
  subTagText: { color: theme.colors.textBody, fontSize: 12, fontWeight: '600' },

  trainingGrid: { gap: 12 },
  trainingGridRow: { flexDirection: 'row', gap: 12 },
  trainingGridItem: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'flex-start' },
  tgIcon: { marginBottom: 12, opacity: 0.9 },
  tgLabel: { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  tgValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },

  statsContainer: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 20, paddingVertical: 20, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statIcon: { marginBottom: 6, opacity: 0.8 },
  statValue: { color: theme.colors.text, fontSize: 22, fontFamily: theme.fonts.title, marginBottom: 2 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
  statDivider: { width: 1, backgroundColor: theme.colors.borderLight },

  imcCard: { flexDirection: 'column', borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  imcHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  imcTitle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  imcValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  imcNumber: { color: theme.colors.text, fontSize: 36, fontFamily: theme.fonts.title },
  imcBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  imcBadgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  imcBadgeText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

  medicalAlertCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  medicalAlertSafe: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderColor: 'rgba(0, 230, 118, 0.2)' },
  medicalAlertDanger: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.3)' },
  medicalAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medicalAlertTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  medicalAlertBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 59, 48, 0.2)' },
  medicalConditionText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  medicalConditionDesc: { color: theme.colors.text, fontSize: 14, fontStyle: 'italic', marginTop: 6, backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 },

  commercialCard: { backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, padding: 20 },
  commercialRow: { flexDirection: 'row', alignItems: 'center' },
  commercialIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  commercialContent: { flex: 1 },
  commercialLabel: { color: theme.colors.textSecondary, fontSize: 11, textTransform: 'uppercase', fontWeight: '900', marginBottom: 4, letterSpacing: 0.5 },
  commercialValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  dividerCommercial: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 16 },

  dangerZone: { paddingHorizontal: 20, paddingBottom: 20 },
  btnDangerOutline: { paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,59,48,0.4)', alignItems: 'center' },
  btnDangerText: { color: theme.colors.danger, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  dangerZoneHelp: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 },

  floatingActionBar: { position: 'absolute', bottom: Platform.OS === 'ios' ? 35 : 25, left: 20, right: 20, backgroundColor: theme.colors.background, borderRadius: 24, padding: 12, borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  actionColumn: { flexDirection: 'column', gap: 12 },
  btnChatOutline: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary, gap: 8 },
  btnChatOutlineText: { color: theme.colors.primary, fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btnDecline: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  btnAccept: { flex: 1, backgroundColor: "#00E676", height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: "#00E676", shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 10 },
  btnAcceptText: { color: "#000", fontSize: 17, fontWeight: '900', letterSpacing: 0.5, textTransform: "uppercase" },
  btnChat: { backgroundColor: theme.colors.primary, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnChatText: { color: theme.colors.backgroundPure, fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  modalContainer: { flex: 1, justifyContent: "flex-end" },
  
  modalCardPremium: { backgroundColor: "#0A0A0A", borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 24, paddingTop: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20, maxHeight: height * 0.88 },
  modalHeaderPremium: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalHeaderTitleRow: { flexDirection: "row", alignItems: "center" },
  modalIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,107,0,0.15)", justifyContent: "center", alignItems: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  modalTitlePremium: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  modalCloseBtnPremium: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#333" },
  modalSubtitlePremium: { color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 20 },

  modalBlock: { backgroundColor: "#121212", borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#222" },
  modalBlockHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1A1A1A", paddingBottom: 10 },
  modalBlockTitle: { color: "#CCC", fontSize: 14, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  modalMicroLabel: { color: "#888", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 },

  servicosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  servicoChip: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: "#333" },
  servicoChipActive: { backgroundColor: "rgba(255,107,0,0.1)", borderColor: theme.colors.primary },
  servicoChipText: { color: "#888", fontSize: 13, fontWeight: "bold" },
  servicoChipTextActive: { color: theme.colors.primary, fontWeight: "900" },
  
  freqScrollContainerPremium: { flexDirection: 'row', gap: 10 },
  freqChipPremium: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: "#000", borderWidth: 1, borderColor: "#222" },
  freqChipActivePremium: { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "#00E676" },
  freqChipTextPremium: { color: "#888", fontSize: 13, fontWeight: "bold" },
  freqChipTextActivePremium: { color: "#00E676", fontWeight: "900" },

  financeiroRowPremium: { flexDirection: 'row', gap: 12 },
  financeiroColG: { flex: 1.2 },
  financeiroColP: { flex: 0.8 },
  inputBoxFinanceiro: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: "#333", outlineStyle: "none" },
  inputPrefixFinanceiro: { color: "#FF6B00", fontSize: 18, fontWeight: "bold", marginRight: 8 },
  inputFinanceiro: { flex: 1, color: "#FFF", fontSize: 20, fontWeight: "900", outlineStyle: "none" },
  inputFinanceiroSmall: { flex: 1, color: "#FFF", fontSize: 18, fontWeight: "bold", outlineStyle: "none" },

  inputBoxPremiumArea: { backgroundColor: "#000", borderRadius: 16, borderWidth: 1, borderColor: "#333", height: 100, paddingHorizontal: 16, paddingVertical: 14 },
  inputAreaPremium: { flex: 1, color: "#FFF", fontSize: 14, textAlignVertical: 'top', outlineStyle: "none" },

  modalInfoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.08)", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)", marginBottom: 10, marginTop: 5 },
  modalInfoTitle: { color: "#00E676", fontSize: 14, fontWeight: "900", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  modalInfoText: { color: "#AAA", fontSize: 13, lineHeight: 20 },

  btnConfirmarContratoPremium: { borderRadius: 20, shadowColor: "#00E676", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10, marginBottom: Platform.OS === 'ios' ? 10 : 0 },
  btnGradientPremium: { flexDirection: "row", height: 64, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  btnConfirmarContratoTextPremium: { color: "#000", fontSize: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});