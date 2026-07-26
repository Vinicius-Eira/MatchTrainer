import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function WidgetOnboarding({ jornada, progressoPct, navigation, completarMissao }) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: progressoPct,
      duration: 1000, 
      useNativeDriver: false,
    }).start();

    if (progressoPct >= 100 && jornada && !jornada.tour_finalizado) {
      setTimeout(() => {
        setModalSucessoVisivel(true);
      }, 800);
    }
  }, [progressoPct, jornada]);

  if (!jornada || jornada.tour_finalizado) return null;

  const fecharWidget = () => {
    Alert.alert(
      "Ocultar Checklist",
      "Tem certeza que deseja esconder este painel de configuração?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Ocultar", 
          style: "destructive", 
          onPress: () => completarMissao('tour_finalizado') 
        }
      ]
    );
  };

  const finalizarComSucesso = () => {
    setModalSucessoVisivel(false);
    completarMissao('tour_finalizado'); 
  };

  const missoes = [
    { id: 'perfil_completo', titulo: 'Complete seu perfil público', action: null },
    { id: 'meta_definida', titulo: 'Defina sua meta de faturamento', action: () => navigation.navigate('PainelCrescimento') },
    { id: 'primeiro_aluno', titulo: 'Adicione seu primeiro aluno', action: () => navigation.navigate('AdicionarAluno') },
    { id: 'primeiro_contrato', titulo: 'Crie o primeiro contrato', action: () => navigation.navigate('AdicionarAluno') },
    { id: 'primeiro_recebimento', titulo: 'Registre um recebimento', action: () => navigation.navigate('Recebimentos') },
  ];

  return (
    <>
      <View style={styles.wrapper}>
        <LinearGradient colors={['#181818', '#0D0D0D']} style={styles.container}>
          <View style={styles.glowBg} />

          <View style={styles.header}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.iconTopBg}>
                <Ionicons name="rocket" size={14} color="#FF6B00" />
              </View>
              <Text style={styles.title}>Configure seu Negócio</Text>
            </View>
            
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.pctText}>{progressoPct}%</Text>
              <TouchableOpacity onPress={fecharWidget} style={styles.btnClose}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
              <LinearGradient colors={['#FF8C00', '#FF6B00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>

          <View style={styles.checklist}>
            {missoes.map((missao, index) => {
              const isDone = jornada[missao.id];
              const isLast = index === missoes.length - 1;
              
              return (
                <TouchableOpacity 
                  key={missao.id} 
                  style={[styles.missionRow, isLast && { borderBottomWidth: 0 }]} 
                  activeOpacity={isDone || !missao.action ? 1 : 0.6} 
                  onPress={isDone || !missao.action ? null : missao.action}
                >
                  <View style={styles.iconBox}>
                    {isDone ? (
                      <View style={styles.checkedCircle}>
                        <Ionicons name="checkmark-sharp" size={12} color="#050505" style={{fontWeight: '900'}} />
                      </View>
                    ) : (
                      <View style={styles.emptyCircle} />
                    )}
                  </View>
                  <Text style={[styles.missionText, isDone && styles.missionTextDone]}>
                    {missao.titulo}
                  </Text>
                  {!isDone && missao.action && (
                    <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>

      <Modal visible={modalSucessoVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          <ConfettiCannon 
            count={80} 
            origin={{ x: 200, y: -20 }} 
            autoStart={true} 
            fadeOut={true} 
            fallSpeed={2500} 
            colors={['#FF6B00', '#0A84FF', '#00E676', '#FFD700']} 
          />

          <View style={styles.modalCard}>
            <LinearGradient colors={['rgba(255, 107, 0, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} borderRadius={30} />
            
            <View style={styles.modalIconBox}>
              <FontAwesome5 name="trophy" size={40} color="#FFD700" />
            </View>

            <Text style={styles.modalTitle}>Tudo Pronto! 🚀</Text>
            <Text style={styles.modalText}>
              Parabéns! Você configurou as bases do seu negócio com sucesso. Seu aplicativo está rodando e você já pode começar a gerenciar seus alunos e escalar seu faturamento.
            </Text>

            <TouchableOpacity style={styles.btnSuccess} onPress={finalizarComSucesso} activeOpacity={0.8}>
              <LinearGradient colors={['#FF8C00', '#FF6B00']} style={styles.btnSuccessGradient}>
                <Text style={styles.btnSuccessText}>Acessar Meu Dashboard</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{marginLeft: 8}} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 10, zIndex: 10, 
  },
  container: {
    borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.06)', position: 'relative', overflow: 'hidden',
  },
  glowBg: {
    position: 'absolute', top: -40, left: -40, width: 140, height: 140, backgroundColor: 'rgba(255, 107, 0, 0.08)', borderRadius: 70, blurRadius: 50,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  iconTopBg: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255, 107, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  title: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  pctText: { color: '#FF6B00', fontSize: 15, fontWeight: '900', letterSpacing: 0.5, marginRight: 15 },
  btnClose: { padding: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  progressBarBg: {
    height: 6, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 3, marginBottom: 24, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 3, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  checklist: { flexDirection: 'column' },
  missionRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: { width: 32, justifyContent: 'center', alignItems: 'flex-start' },
  emptyCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.02)',
  },
  checkedCircle: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#00E676', justifyContent: 'center', alignItems: 'center', shadowColor: '#00E676', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 4,
  },
  missionText: { flex: 1, color: '#E0E0E0', fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  missionTextDone: { color: 'rgba(255,255,255,0.25)', textDecorationLine: 'line-through' },

  // Estilos do Modal
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalCard: {
    backgroundColor: '#111', width: '100%', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#222', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 15,
  },
  modalIconBox: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  modalTitle: {
    color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 10, textAlign: 'center', letterSpacing: -0.5,
  },
  modalText: {
    color: '#AAA', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30,
  },
  btnSuccess: {
    width: '100%', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  btnSuccessGradient: {
    flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  btnSuccessText: {
    color: '#FFF', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5,
  }
});