import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { supabase } from '../../../services/supabase';
import { theme } from '../../../theme/theme';

export default function Messages({ navigation }: any) {
  const [conversas, setConversas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarConversas = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conexoes')
        .select('*, personals(nome, foto_url, cidade)')
        .eq('usuario_id', user.id)
        .in('status', ['em_contato', 'aguardando_personal', 'aguardando_assinatura', 'aluno_ativo']);

      if (error) throw error;
      setConversas(data || []);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { carregarConversas(); });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Chat', {
        conexaoId: item.id,
        nomeOutro: item.personals?.nome || 'Treinador',
        fotoOutro: item.personals?.foto_url,
        tipoUsuarioLogado: 'aluno'
      })}
    >
      <Image source={{ uri: item.personals?.foto_url || 'https://via.placeholder.com/150' }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.personals?.nome || 'Treinador'}</Text>
        <Text style={styles.status}>
          {item.status === 'aluno_ativo' ? '🟢 Treinador Ativo' : '🟠 Em negociação'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
      </BlurView>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FF6B00" /></View>
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.iconEmptyBg}>
                <Ionicons name="chatbubbles-outline" size={40} color="#FF6B00" />
              </View>
              <Text style={styles.emptyTitle}>Sua caixa está vazia</Text>
              <Text style={styles.emptyText}>Você ainda não iniciou nenhuma conversa com treinadores.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    alignItems: 'center', justifyContent: 'center', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, 
    borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  headerTitle: { color: "#FFF", fontSize: 17, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  list: { padding: 20 },
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', 
    padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#222' 
  },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  info: { flex: 1, marginLeft: 16 },
  nome: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4, letterSpacing: 0.3 },
  status: { color: '#888', fontSize: 13, fontWeight: "600" },
  
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  iconEmptyBg: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,107,0,0.1)', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,107,0,0.2)'
  },
  emptyTitle: { color: "#FFF", fontSize: 18, fontFamily: theme.fonts.title, marginBottom: 8 },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 }
});