import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, 
  Alert, ActivityIndicator, Platform, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; // IMPORTAÇÃO DO EFEITO DE DESFOQUE
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const MAP_INVESTIMENTO = { "base": "R$ 90 a 110 / aula", "mid": "R$ 120 a 150 / aula", "premium": "A partir de R$ 160 / aula", "pacote": "Pacote Mensal" };
const MAP_PERFIL = { "acolhedor": "O Acolhedor (Didático e paciente)", "motivador": "O Motivador (Intenso e animado)", "tecnico": "O Técnico (Foco em biomecânica)", "estrategista": "O Estrategista (Foco em metas)" };
const MAP_HISTORICO = { "iniciante": "Iniciante Total", "inconstante": "Inconstante (Vai e para)", "intermediario": "Intermediário", "avancado": "Avançado" };
const MAP_FREQUENCIA = { "1-2": "1 a 2 dias/sem", "3-4": "3 a 4 dias/sem", "5-6": "5 a 6 dias/sem", "7": "Todos os dias" };

export default function VisaoAluno({ route, navigation }) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState(statusAtual);
  const [loading, setLoading] = useState(false);
  const [alunoSolicitouSaida, setAlunoSolicitouSaida] = useState(false);
  const [dataInicioParceria, setDataInicioParceria] = useState(null);

  let prefs = {};
  try { prefs = typeof aluno.preferencias === 'string' ? JSON.parse(aluno.preferencias) : (aluno.preferencias || {}); } catch(e) {}

  useEffect(() => {
    verificarPedidosDeSaida();
  }, []);

  const verificarPedidosDeSaida = async () => {
    try {
      const { data: conexaoData } = await supabase.from('conexoes').select('confirmado_em, atualizado_em, criado_em').eq('id', conexaoId).single();
      if (conexaoData) {
        setDataInicioParceria(conexaoData.confirmado_em || conexaoData.atualizado_em || conexaoData.criado_em);
      }

      const { data: msgs } = await supabase
        .from('mensagens')
        .select('conteudo')
        .eq('conexao_id', conexaoId)
        .eq('tipo_remetente', 'aluno')
        .like('conteudo', '%solicitar o encerramento%');

      if (msgs && msgs.length > 0) {
        setAlunoSolicitouSaida(true);
      }
    } catch (error) {
      console.log("Erro ao verificar mensagens:", error);
    }
  };

  const calcularIdade = (dataString) => {
    if (!dataString) return '--';
    let nascimento;
    if (dataString.includes('/')) {
      const partes = dataString.split('/');
      nascimento = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
    } else if (dataString.includes('-')) {
      nascimento = new Date(`${dataString}T00:00:00`);
    } else { return '--'; }

    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return isNaN(idade) ? '--' : idade.toString();
  };

  const calcularIMC = (peso, altura) => {
    if (!peso || !altura) return null;
    const h = altura > 3 ? altura / 100 : altura;
    const p = parseFloat(peso);
    const imc = p / (h * h);
    let classificacao = '';
    let cor = theme.colors.textSecondary;

    if (imc < 18.5) { classificacao = 'Abaixo do Peso'; cor = theme.colors.warning; } 
    else if (imc >= 18.5 && imc < 24.9) { classificacao = 'Peso Normal'; cor = theme.colors.success; } 
    else if (imc >= 25 && imc < 29.9) { classificacao = 'Sobrepeso'; cor = theme.colors.primary; } 
    else { classificacao = 'Obesidade'; cor = theme.colors.danger; }

    return { valor: imc.toFixed(1), classificacao, cor };
  };

  const atualizarStatus = async (novoStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('conexoes').update({ status: novoStatus }).eq('id', conexaoId);
      if (error) throw error;
      
      setStatus(novoStatus);
      if (novoStatus === 'inativo') {
        Alert.alert("Parceria Encerrada", "O aluno foi removido da sua lista de treinos ativos.");
        navigation.goBack();
      } else if (novoStatus === 'recusado') {
        Alert.alert("Sucesso", "Status atualizado!");
        navigation.goBack();
      } else {
        Alert.alert("Sucesso", "Status atualizado!");
      }
      
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalEncerraParceria = () => {
    if (alunoSolicitouSaida) {
      Alert.alert(
        "Confirmar Encerramento",
        "O aluno solicitou o fim da parceria. Tem certeza que deseja encerrar o vínculo e liberar o perfil dele?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, Encerrar", onPress: () => atualizarStatus('inativo') }
        ]
      );
    } else {
      const dataInicio = new Date(dataInicioParceria || Date.now());
      const hoje = new Date();
      const diffTime = Math.abs(hoje.getTime() - dataInicio.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 60) {
        return Alert.alert(
          "Ciclo em Andamento",
          `O aluno iniciou com você há ${diffDays} dias. Para garantir a segurança dele, você só pode cancelar o acompanhamento por conta própria após 60 dias.`
        );
      }

      Alert.alert(
        "Encerrar Parceria",
        "Tem certeza que deseja encerrar o treinamento com este aluno? Ele será removido da sua lista e ficará livre no aplicativo.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, Encerrar", onPress: () => atualizarStatus('inativo') }
        ]
      );
    }
  };

  const abrirChat = () => navigation.navigate('Chat', { conexaoId, nomeOutro: aluno.nome, fotoOutro: aluno.foto_url, tipoUsuarioLogado: 'personal' });

  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);
  const temRestricao = prefs.limitacao && prefs.limitacao !== 'nenhuma';
  const subsRestricoes = prefs.sub_limitacao && prefs.sub_limitacao.length > 0 ? prefs.sub_limitacao.join(", ") : "";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <BlurView 
        intensity={Platform.OS === 'ios' ? 70 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Aluno</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {alunoSolicitouSaida && status === 'aluno_ativo' && (
          <View style={styles.bannerDesistencia}>
            <Ionicons name="warning" size={24} color={theme.colors.backgroundPure} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerDesistenciaTitle}>Solicitação de Desligamento</Text>
              <Text style={styles.bannerDesistenciaText}>Este aluno solicitou o fim da consultoria pelo chat. Confirme o encerramento no final desta tela.</Text>
            </View>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(255,107,0,0.15)', theme.colors.background]} style={styles.heroGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image source={{ uri: aluno.foto_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <View style={styles.onlineBadge}><View style={styles.onlineBadgeInner} /></View>
          </View>
          
          <Text style={styles.studentName}>{aluno.nome}</Text>
          <Text style={styles.studentGoal}>Foco: {prefs.objetivo || 'Treinamento Geral'}</Text>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoPill}>
              <Ionicons name="location" size={14} color={theme.colors.primary} />
              <Text style={styles.quickInfoText} numberOfLines={1}>{aluno.cidade || 'Não informado'}</Text>
            </View>
            <View style={styles.quickInfoPill}>
              <Ionicons name="logo-whatsapp" size={14} color={theme.colors.whatsapp} />
              <Text style={styles.quickInfoText}>{aluno.telefone || 'Sem número'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionHeading}>Biometria & Saúde</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{calcularIdade(aluno.data_nascimento)}</Text>
              <Text style={styles.statLabel}>Anos</Text>
            </View>
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{aluno.peso ? `${aluno.peso}` : '--'}</Text>
              <Text style={styles.statLabel}>Kg</Text>
            </View>
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="human-male-height" size={20} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{aluno.altura ? `${aluno.altura}` : '--'}</Text>
              <Text style={styles.statLabel}>Cm</Text>
            </View>
          </View>

          {dadosIMC && (
            <View style={[styles.imcCard, { borderColor: `${dadosIMC.cor}40`, backgroundColor: `${dadosIMC.cor}08` }]}>
              <View style={styles.imcHeaderRow}>
                <Text style={styles.imcTitle}>Índice de Massa Corporal (IMC)</Text>
              </View>
              <View style={styles.imcValueRow}>
                <Text style={styles.imcNumber}>{dadosIMC.valor}</Text>
                <View style={[styles.imcBadge, { backgroundColor: `${dadosIMC.cor}20`, borderColor: dadosIMC.cor }]}>
                  <View style={[styles.imcBadgeDot, { backgroundColor: dadosIMC.cor }]} />
                  <Text style={[styles.imcBadgeText, { color: dadosIMC.cor }]}>{dadosIMC.classificacao}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.medicalAlertCard, temRestricao ? styles.medicalAlertDanger : styles.medicalAlertSafe]}>
            <View style={styles.medicalAlertHeader}>
              <Ionicons name={temRestricao ? "warning" : "checkmark-circle"} size={22} color={temRestricao ? theme.colors.danger : theme.colors.success} />
              <Text style={[styles.medicalAlertTitle, temRestricao ? {color: theme.colors.danger} : {color: theme.colors.success}]}>
                {temRestricao ? "Atenção: Restrições Físicas" : "Nenhuma Restrição Relatada"}
              </Text>
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
          <View style={styles.sectionHeaderRow}>
            <FontAwesome5 name="clipboard-list" size={18} color={theme.colors.primary} />
            <Text style={styles.sectionHeading}>Raio-X do Treinamento</Text>
          </View>
          
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
                <View key={index} style={styles.subTagPill}>
                  <Text style={styles.subTagText}>{sub}</Text>
                </View>
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
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionHeading}>Alinhamento Comercial</Text>
          </View>

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
              <Text style={styles.btnDangerText}>Encerrar Parceria com Aluno</Text>
            </TouchableOpacity>
            <Text style={styles.dangerZoneHelp}>Isto irá remover o aluno da sua gestão e destravar as edições de perfil dele.</Text>
          </View>
        )}

      </ScrollView>

      <View style={styles.floatingActionBar}>
        {status === 'pendente' ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnDecline} onPress={() => atualizarStatus('recusado')} disabled={loading} activeOpacity={0.8}>
              <Feather name="x" size={24} color={theme.colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAccept} onPress={() => atualizarStatus('aceito_personal')} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={theme.colors.backgroundPure} /> : (
                <>
                  <Text style={styles.btnAcceptText}>Aceitar Contato</Text>
                  <Feather name="check" size={22} color={theme.colors.backgroundPure} style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
            <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
            <Text style={styles.btnChatText}>Abrir Conversa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  
  header: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, 
    zIndex: 100,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 50, 
    paddingBottom: 15,
    borderBottomWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.5)' : 'transparent', // Força transparência no Android
    overflow: 'hidden',
  },
  iconButton: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  headerTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.fonts.title, textTransform: 'uppercase', letterSpacing: 1.5 },
  
  scrollContent: { 
    paddingTop: Platform.OS === 'ios' ? 120 : 100, 
    paddingBottom: 160 
  }, 

  bannerDesistencia: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.warning, padding: 20, marginHorizontal: 20, marginTop: 10, borderRadius: 16 },
  bannerDesistenciaTitle: { color: theme.colors.backgroundPure, fontSize: 15, fontWeight: '900', textTransform: 'uppercase' },
  bannerDesistenciaText: { color: 'rgba(0,0,0,0.7)', fontSize: 13, fontWeight: '600', marginTop: 4 },

  heroSection: { alignItems: 'center', paddingTop: 10, paddingBottom: 25, position: 'relative' },
  heroGradient: { position: 'absolute', top: -100, left: 0, right: 0, height: 350 },
  avatarWrapper: { position: 'relative', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, opacity: 0.2, blurRadius: 25 },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: theme.colors.primary, backgroundColor: theme.colors.surface, zIndex: 2 },
  onlineBadge: { position: 'absolute', bottom: 4, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  onlineBadgeInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.success },
  
  studentName: { color: theme.colors.text, fontSize: 28, fontFamily: theme.fonts.title, marginBottom: 4, textAlign: 'center', letterSpacing: 0.5 },
  studentGoal: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 },
  
  quickInfoRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingHorizontal: 20 },
  quickInfoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, gap: 6, flexShrink: 1 },
  quickInfoText: { color: theme.colors.textBody, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  sectionContainer: { paddingHorizontal: 20, marginBottom: 35 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionHeading: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 10, letterSpacing: 0.5 },

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
  actionRow: { flexDirection: 'row', gap: 12 },
  btnDecline: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  btnAccept: { flex: 1, backgroundColor: theme.colors.primary, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnAcceptText: { color: theme.colors.backgroundPure, fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  
  btnChat: { backgroundColor: theme.colors.primary, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnChatText: { color: theme.colors.backgroundPure, fontSize: 17, fontWeight: '900', letterSpacing: 0.5 }
});