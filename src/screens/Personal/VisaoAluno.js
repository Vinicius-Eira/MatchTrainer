import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, 
  Alert, ActivityIndicator, Platform, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function VisaoAluno({ route, navigation }) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState(statusAtual);
  const [loading, setLoading] = useState(false);

  const calcularIdade = (dataString) => {
    if (!dataString) return '--';
    let nascimento;
    
    if (dataString.includes('/')) {
      const partes = dataString.split('/');
      nascimento = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
    } else if (dataString.includes('-')) {
      nascimento = new Date(`${dataString}T00:00:00`);
    } else {
      return '--';
    }

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
    let cor = '#888';

    if (imc < 18.5) {
      classificacao = 'Abaixo do Peso';
      cor = '#FFB340'; 
    } else if (imc >= 18.5 && imc < 24.9) {
      classificacao = 'Peso Normal';
      cor = '#00E676'; 
    } else if (imc >= 25 && imc < 29.9) {
      classificacao = 'Sobrepeso';
      cor = '#FF9F0A'; 
    } else {
      classificacao = 'Obesidade';
      cor = '#FF3B30'; 
    }

    return { valor: imc.toFixed(1), classificacao, cor };
  };

  const getIconeLocalTreino = (local) => {
    if (!local) return 'map-marker-radius-outline';
    const l = local.toLowerCase();
    if (l.includes('academia')) return 'dumbbell';
    if (l.includes('casa')) return 'home-outline';
    if (l.includes('condomínio') || l.includes('condominio')) return 'office-building-outline';
    return 'map-marker-radius-outline';
  };

  const atualizarStatus = async (novoStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('conexoes').update({ status: novoStatus }).eq('id', conexaoId);
      if (error) throw error;
      setStatus(novoStatus);
      if (novoStatus === 'recusado') navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar ação.");
    } finally {
      setLoading(false);
    }
  };

  const abrirChat = () => navigation.navigate('Chat', { 
    conexaoId, nomeOutro: aluno.nome, fotoOutro: aluno.foto_url, tipoUsuarioLogado: 'personal' 
  });

  const CardDetalhe = ({ icon, title, subtitle, IconComponent = Ionicons, color = theme.colors.primary, highlight = false }) => (
    <View style={[styles.detailCard, highlight && styles.detailCardHighlight]}>
      <View style={[styles.detailIconWrapper, { backgroundColor: `${color}15`, borderColor: `${color}30` }, highlight && { backgroundColor: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.3)' }]}>
        <IconComponent name={icon} size={20} color={highlight ? '#FF3B30' : color} />
      </View>
      <View style={styles.detailTextWrapper}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={[styles.detailSubtitle, highlight && {color: '#FF3B30'}]}>
          {subtitle || 'Não informado'}
        </Text>
      </View>
    </View>
  );

  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);
  const temRestricao = aluno.restricao_fisica && aluno.restricao_fisica !== 'Nenhuma' && aluno.restricao_fisica !== 'Nenhum';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Aluno</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(255,107,0,0.15)', '#070707']} style={styles.heroGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image source={{ uri: aluno.foto_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <View style={styles.onlineBadge}>
              <View style={styles.onlineBadgeInner} />
            </View>
          </View>
          
          <Text style={styles.studentName}>{aluno.nome}</Text>
          <Text style={styles.studentGoal}>Foco: {aluno.objetivo || 'Treinamento Geral'}</Text>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoPill}>
              <Ionicons name="location" size={14} color={theme.colors.primary} />
              <Text style={styles.quickInfoText}>{aluno.cidade || 'Local não informado'}</Text>
            </View>
            <View style={styles.quickInfoPill}>
              <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
              <Text style={styles.quickInfoText}>{aluno.telefone || 'Sem número'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="heart-pulse" size={18} color={theme.colors.primary} />
            <Text style={styles.sectionHeading}>Biometria & Saúde</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{calcularIdade(aluno.data_nascimento)}</Text>
              <Text style={styles.statLabel}>Anos</Text>
            </View>
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="weight-kilogram" size={22} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{aluno.peso ? `${aluno.peso}` : '--'}</Text>
              <Text style={styles.statLabel}>Kg</Text>
            </View>
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="human-male-height" size={22} color={theme.colors.primary} style={styles.statIcon} />
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

          <CardDetalhe 
            icon={temRestricao ? "alert-circle" : "checkmark-circle"} 
            title="Restrições Físicas ou Lesões" 
            subtitle={aluno.restricao_fisica || 'Nenhuma restrição relatada'} 
            IconComponent={Ionicons} 
            color={temRestricao ? '#FF3B30' : '#00E676'}
            highlight={temRestricao}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <FontAwesome5 name="clipboard-list" size={16} color={theme.colors.primary} />
            <Text style={styles.sectionHeading}>Perfil de Treinamento</Text>
          </View>
          
          <View style={styles.goalPremiumCard}>
            <LinearGradient colors={['rgba(255,107,0,0.12)', 'rgba(255,107,0,0.02)']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.goalIconBox}>
              <Feather name="target" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.goalTextContent}>
              <Text style={styles.goalLabel}>Objetivo Principal</Text>
              <Text style={styles.goalValue} numberOfLines={1}>{aluno.objetivo || 'Não informado'}</Text>
            </View>
          </View>

          <View style={styles.trainingGrid}>
            <View style={styles.trainingGridRow}>
              <View style={styles.trainingGridItem}>
                <MaterialCommunityIcons name="medal-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Experiência</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{aluno.nivel_experiencia || 'Não informado'}</Text>
              </View>
              <View style={styles.trainingGridItem}>
                <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Frequência</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{aluno.frequencia_treino || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.trainingGridRow}>
              <View style={styles.trainingGridItem}>
                <MaterialCommunityIcons name={getIconeLocalTreino(aluno.local_treino)} size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Local de Treino</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{aluno.local_treino || 'Não informado'}</Text>
              </View>
              <View style={styles.trainingGridItem}>
                <MaterialCommunityIcons name="timer-sand" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                <Text style={styles.tgLabel}>Tempo Diário</Text>
                <Text style={styles.tgValue} numberOfLines={1}>{aluno.tempo_treino || 'Não informado'}</Text>
              </View>
            </View>
          </View>

        </View>

      </ScrollView>

      <View style={styles.floatingActionBar}>
        {status === 'em_contato' || status === 'lead' ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnDecline} onPress={() => atualizarStatus('recusado')} disabled={loading} activeOpacity={0.8}>
              <Feather name="x" size={24} color="#FF3B30" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAccept} onPress={() => atualizarStatus('aluno_ativo')} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.btnAcceptText}>Aceitar Aluno</Text>
                  <Feather name="check" size={22} color="#000" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
            <Ionicons name="chatbubbles" size={22} color="#000" />
            <Text style={styles.btnChatText}>Abrir Conversa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070707' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 10, zIndex: 10 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: '#FFF', fontSize: 16, fontFamily: theme.fonts.title, textTransform: 'uppercase', letterSpacing: 1.5 },
  
  scrollContent: { paddingBottom: 160 }, 

  heroSection: { alignItems: 'center', paddingTop: 10, paddingBottom: 25, position: 'relative' },
  heroGradient: { position: 'absolute', top: -100, left: 0, right: 0, height: 350 },
  avatarWrapper: { position: 'relative', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primary, opacity: 0.2, blurRadius: 25 },
  avatar: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: theme.colors.primary, backgroundColor: '#111', zIndex: 2 },
  onlineBadge: { position: 'absolute', bottom: 4, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#070707', justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  onlineBadgeInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#00E676' },
  
  studentName: { color: '#FFF', fontSize: 28, fontFamily: theme.fonts.title, marginBottom: 4, textAlign: 'center', letterSpacing: 0.5 },
  studentGoal: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 },
  
  quickInfoRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  quickInfoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 6 },
  quickInfoText: { color: '#E0E0E0', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  sectionContainer: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionHeading: { color: '#FFF', fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 10, letterSpacing: 0.5 },

  statsContainer: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 20, paddingVertical: 20, borderWidth: 1, borderColor: '#1F1F1F', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statIcon: { marginBottom: 6, opacity: 0.8 },
  statValue: { color: '#FFF', fontSize: 22, fontFamily: theme.fonts.title, marginBottom: 2 },
  statLabel: { color: '#777', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '800' },
  statDivider: { width: 1, backgroundColor: '#262626' },

  imcCard: { flexDirection: 'column', borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  imcHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  imcTitle: { color: '#AAA', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  imcValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  imcNumber: { color: '#FFF', fontSize: 36, fontFamily: theme.fonts.title },
  imcBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  imcBadgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  imcBadgeText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

  detailCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1F1F1F' },
  detailCardHighlight: { borderWidth: 1 },
  detailIconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1 },
  detailTextWrapper: { flex: 1, justifyContent: 'center' },
  detailTitle: { color: '#777', fontSize: 10, textTransform: 'uppercase', fontWeight: '900', marginBottom: 4, letterSpacing: 0.5 },
  detailSubtitle: { color: '#E0E0E0', fontSize: 14, fontWeight: '700' },

  goalPremiumCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)', overflow: 'hidden' },
  goalIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)' },
  goalTextContent: { flex: 1, justifyContent: 'center' },
  goalLabel: { color: '#888', fontSize: 11, textTransform: 'uppercase', fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  goalValue: { color: '#FFF', fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  trainingGrid: { gap: 12 },
  trainingGridRow: { flexDirection: 'row', gap: 12 },
  trainingGridItem: { flex: 1, backgroundColor: '#121212', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1F1F1F', alignItems: 'flex-start' },
  tgIcon: { marginBottom: 12, opacity: 0.9 },
  tgLabel: { color: '#777', fontSize: 10, textTransform: 'uppercase', fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  tgValue: { color: '#E0E0E0', fontSize: 15, fontWeight: '700' },

  floatingActionBar: { position: 'absolute', bottom: Platform.OS === 'ios' ? 35 : 25, left: 20, right: 20, backgroundColor: 'rgba(15, 15, 15, 0.85)', borderRadius: 24, padding: 12, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btnDecline: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  btnAccept: { flex: 1, backgroundColor: theme.colors.primary, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnAcceptText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  
  btnChat: { backgroundColor: theme.colors.primary, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnChatText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 }
});