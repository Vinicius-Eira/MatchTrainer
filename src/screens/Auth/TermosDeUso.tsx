import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function TermosDeUso({ navigation }: any) {
  const [aceito, setAceito] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [loading, setLoading] = useState(false);

  const calcularProgresso = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanciaDoTopo = contentOffset.y;
    const alturaTotalOculta = contentSize.height - layoutMeasurement.height;

    if (alturaTotalOculta <= 0) {
      setProgresso(100);
      return;
    }

    const percentual = (distanciaDoTopo / alturaTotalOculta) * 100;
    setProgresso(Math.min(Math.max(percentual, 0), 100));
  };

  const handleAceitar = async () => {
    if (!aceito) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("termos_aceitos").insert({
          usuario_id: user.id,
          versao_termos: "1.1",
        });
      }

      await AsyncStorage.setItem("termos_aceitos", "true");
      navigation.replace("ChoiceScreen");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar seu aceite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />

      <View style={styles.barraProgressoFundo}>
        <View style={[styles.barraProgressoPreenchida, { width: `${progresso}%` }]} />
      </View>

      <View style={styles.glowTopLeft} />
      
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Termos de Uso</Text>
      </View>

      <ScrollView
        style={styles.textContainer}
        onScroll={calcularProgresso}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.termosText}>
          Bem-vindo ao <Text style={styles.boldHighlight}>Match Trainer</Text>. Ao utilizar nossa plataforma, você concorda com os seguintes termos:
          {"\n\n"}
          <Text style={styles.bold}>1. NATUREZA DO SERVIÇO:</Text> O Match Trainer é uma plataforma de tecnologia que conecta alunos a Personal Trainers independentes. Nós fornecemos as ferramentas de gestão e acompanhamento, mas não somos responsáveis pela prescrição dos treinos ou pela qualidade técnica do serviço prestado pelos profissionais.
          {"\n\n"}
          <Text style={styles.bold}>2. ISENÇÃO DE RESPONSABILIDADE MÉDICA:</Text> O conteúdo e as ferramentas do aplicativo <Text style={styles.bold}>não substituem aconselhamento médico profissional, diagnóstico ou tratamento</Text>. O usuário reconhece que a prática de atividades físicas envolve riscos, devendo consultar um médico antes de iniciar qualquer programa de exercícios.
          {"\n\n"}
          <Text style={styles.bold}>3. RESPONSABILIDADE DOS PROFISSIONAIS:</Text> Todos os Personal Trainers devem possuir registro ativo e regular no Conselho Regional de Educação Física (CREF). A falsificação de credenciais resultará no banimento imediato e notificação às autoridades.
          {"\n\n"}
          <Text style={styles.bold}>4. PAGAMENTOS E ASSINATURAS:</Text> A relação financeira, contratos de consultoria e pagamentos são acordados diretamente entre o Aluno e o Personal Trainer. O Match Trainer atua apenas como facilitador tecnológico dessas conexões.
          {"\n\n"}
          <Text style={styles.bold}>5. PRIVACIDADE E DADOS:</Text> Suas informações corporais, de saúde (anamnese/bioimpedância) e dados de contato são criptografados e compartilhados exclusivamente com o treinador que você autorizar. Jamais venderemos seus dados para terceiros.
          {"\n\n"}
          <Text style={styles.bold}>6. CONDUTA E RESPEITO:</Text> O Match Trainer mantém tolerância zero para assédio, discriminação, linguagem abusiva ou uso da plataforma para fins ilegais. Violações resultarão na exclusão permanente da conta.
          {"\n\n"}
          <Text style={{ fontStyle: 'italic', color: '#555' }}>Última atualização: Setembro de 2026 — Versão 1.1</Text>
          {"\n\n\n"}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAceito(!aceito)} activeOpacity={0.8}>
          <View style={[styles.checkbox, aceito && styles.checkboxChecked]}>
            {aceito && <Ionicons name="checkmark" size={16} color="#000" />}
          </View>
          <Text style={styles.checkboxLabel}>
            Li, compreendi e aceito os <Text style={{color: '#FFF'}}>Termos de Uso</Text> e a <Text style={{color: '#FFF'}}>Política de Privacidade</Text>.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnOutline, !aceito && styles.btnDesabilitado]} onPress={handleAceitar} disabled={!aceito || loading} activeOpacity={0.8}>
          {aceito && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />}
          
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.btnOutlineText, !aceito && {color: '#555'}]}>Aceitar e Continuar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL("https://matchtrainer.com.br/privacidade")} style={styles.linkContainer}>
          <Text style={styles.linkText}>Ver Política de Privacidade Completa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202", paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40), position: 'relative' },

  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.1, zIndex: 0 },

  barraProgressoFundo: { width: "100%", height: verticalScale(3), backgroundColor: "#111", position: "absolute", top: Platform.OS === 'ios' ? verticalScale(45) : verticalScale(35), left: 0, zIndex: 10 },
  barraProgressoPreenchida: { height: "100%", backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 },

  header: { flexDirection: 'row', alignItems: "center", marginBottom: verticalScale(20), paddingHorizontal: scale(25), zIndex: 1, marginTop: verticalScale(15) },
  iconCircle: { width: scale(48), height: scale(48), borderRadius: scale(24), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", marginRight: scale(15) },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(28), color: "#FFF", letterSpacing: -0.5 },

  textContainer: { flex: 1, paddingHorizontal: scale(25), marginBottom: verticalScale(10), zIndex: 1 },
  termosText: { color: "#888", fontFamily: theme.fonts.body, fontSize: moderateScale(14), lineHeight: moderateScale(24) },
  bold: { color: "#FFF", fontWeight: "bold" },
  boldHighlight: { color: theme.colors.primary, fontWeight: "bold" },

  footer: { paddingHorizontal: scale(25), paddingVertical: verticalScale(25), backgroundColor: "#020202", borderTopWidth: 1, borderTopColor: "#111", zIndex: 1 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(25) },
  checkbox: { width: scale(24), height: scale(24), borderRadius: moderateScale(8), borderWidth: 1.5, borderColor: "#444", justifyContent: "center", alignItems: "center", marginRight: scale(12), backgroundColor: "#0A0A0A" },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  checkboxLabel: { color: "#888", fontSize: moderateScale(13), flex: 1, lineHeight: moderateScale(18) },

  btnOutline: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnDesabilitado: { borderColor: "#222", backgroundColor: "#0A0A0A" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  linkContainer: { alignItems: "center", marginTop: verticalScale(20) },
  linkText: { color: "#666", fontSize: moderateScale(13), textDecorationLine: "underline" },
});