import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';
import BotaoPrincipal from '../../components/BotaoPrincipal';

export default function Avaliar({ route, navigation }) {
  const { personalId, personalNome, personalFoto } = route.params;

  const [userId, setUserId] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const starScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const labelsNota = {
    1: "Péssimo",
    2: "Ruim",
    3: "Regular",
    4: "Bom",
    5: "Excelente"
  };

  useEffect(() => {
    obterUsuario();
  }, []);

  const obterUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
    }
  };

  const handleSelecionarNota = (valor) => {
    setNota(valor);
    // Animação de "pulo" ao selecionar a estrela
    starScale.setValue(0.8);
    Animated.spring(starScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true
    }).start();
  };

  const handleEnviar = async () => {
    if (!userId || nota === 0) return;
    setLoading(true);

    try {
      const { data: avaliacaoExistente } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('usuario_id', userId)
        .eq('personal_id', personalId)
        .single();

      if (avaliacaoExistente) {
        await supabase
          .from('avaliacoes')
          .update({ nota, comentario })
          .eq('id', avaliacaoExistente.id);
      } else {
        await supabase
          .from('avaliacoes')
          .insert({
            usuario_id: userId,
            personal_id: personalId,
            nota,
            comentario
          });
      }

      await supabase
        .from('conexoes')
        .update({ status: 'avaliado' })
        .match({ usuario_id: userId, personal_id: personalId });

      setSucesso(true);
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      }).start();

      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <View style={[styles.container, styles.center]}>
        <Animated.View style={{ transform: [{ scale: checkScale }], alignItems: 'center' }}>
          <Ionicons name="checkmark-circle" size={100} color={theme.colors.primary} />
          <Text style={styles.successText}>Avaliação enviada!</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Image 
            source={{ uri: personalFoto || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.title}>Como foi sua experiência com {personalNome?.split(' ')[0]}?</Text>
        </View>

        <Animated.View style={[styles.starsContainer, { transform: [{ scale: starScale }] }]}>
          {[1, 2, 3, 4, 5].map((estrela) => (
            <TouchableOpacity 
              key={estrela} 
              activeOpacity={0.7}
              onPress={() => handleSelecionarNota(estrela)}
            >
              <Ionicons 
                name={estrela <= nota ? "star" : "star-outline"} 
                size={48} 
                color={estrela <= nota ? theme.colors.primary : theme.colors.textSecondary} 
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        <Text style={styles.notaLabel}>{nota > 0 ? labelsNota[nota] : ' '}</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Conte como foi (opcional)"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={300}
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />

        <View style={styles.buttonsContainer}>
          <BotaoPrincipal 
            titulo={loading ? "Enviando..." : "Enviar avaliação"} 
            onPress={handleEnviar} 
            disabled={nota === 0 || loading}
          />
          
          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.ghostButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#333', marginBottom: 15 },
  title: { fontFamily: theme.fonts.title, fontSize: 26, color: theme.colors.text, textAlign: 'center', lineHeight: 30 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  star: { marginHorizontal: 5 },
  notaLabel: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: 20, textAlign: 'center', marginBottom: 30, height: 25 },
  textArea: { backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 15, borderRadius: 12, minHeight: 100, fontSize: 16, borderWidth: 1, borderColor: '#252525', marginBottom: 25 },
  buttonsContainer: { marginTop: 10 },
  ghostButton: { padding: 15, alignItems: 'center', marginTop: 10 },
  ghostButtonText: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: 'bold' },
  successText: { fontFamily: theme.fonts.title, fontSize: 28, color: theme.colors.text, marginTop: 15 }
});