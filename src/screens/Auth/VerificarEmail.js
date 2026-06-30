import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Platform, StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export default function VerificarEmail({ navigation, route }) {
  const email = route.params?.email || "seu e-mail";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="email-fast-outline" size={46} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>Verifique seu <Text style={styles.titleHighlight}>E-mail</Text></Text>
        
        <Text style={styles.subtitle}>
          Enviamos um link de ativação exclusivo para:{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} style={{marginBottom: 10}} />
          <Text style={styles.instructions}>
            Para garantir a segurança da nossa comunidade, sua conta só será ativada e liberada para login após a confirmação deste link.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btnAcao} 
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'ChoiceScreen' }],
          })}
          activeOpacity={0.85}
        >
          <Text style={styles.btnAcaoText}>Voltar para o Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, position: 'relative' },
  
  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 60 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 80 },

  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  
  iconWrapper: { position: "relative", marginBottom: 30, justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, opacity: 0.3, blurRadius: 20 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.surfaceLight, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },
  
  title: { color: theme.colors.text, fontSize: 32, fontFamily: theme.fonts.title, marginBottom: 16, textAlign: 'center' },
  titleHighlight: { color: theme.colors.primary },
  
  subtitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 30 },
  emailHighlight: { color: theme.colors.text, fontWeight: '900', fontSize: 16 },
  
  securityBox: { backgroundColor: 'rgba(0, 230, 118, 0.05)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', alignItems: 'center', marginBottom: 40, width: '100%' },
  instructions: { color: theme.colors.success, fontSize: 13, lineHeight: 20, textAlign: 'center', fontWeight: '600' },
  
  btnAcao: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, height: 60, borderRadius: 16, width: '100%', justifyContent: 'center', alignItems: 'center' },
  btnAcaoText: { color: theme.colors.text, fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
});