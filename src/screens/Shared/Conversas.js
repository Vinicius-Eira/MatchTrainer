   import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

export default function Conversas({ navigation }) {
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { carregarConversas(); });
    return unsubscribe;
  }, [navigation]);

  const carregarConversas = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conexoes')
        .select('*, personals(nome, foto_url, cidade)')
        .eq('usuario_id', user.id)
        .in('status', ['em_contato', 'aluno_ativo']);

      if (error) throw error;
      setConversas(data || []);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
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
          {item.status === 'aluno_ativo' ? '🟢 Seu Treinador' : '⏳ Aguardando Resposta'}
        </Text>
      </View>
      <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={50} color="#333" />
              <Text style={styles.emptyText}>Você ainda não iniciou nenhuma conversa.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070707' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#1A1A1A' },
  headerTitle: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.primary },
  info: { flex: 1, marginLeft: 15 },
  nome: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  status: { color: '#888', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666', fontSize: 14, marginTop: 10 }
});