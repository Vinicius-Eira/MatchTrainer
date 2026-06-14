import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { TruckElectricIcon } from "lucide-react";

const { width } = Dimensions.get("window");

export default function TermosDeUso({ navigation }) {
  const [aceito, setAceito] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [loading, setLoading] = useState(false);

  const calcularProgresso = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanciaDoTopo = contentOffset.y;
    const alturaTotalOculta = contentSize.height - layoutMeasurement.height;

    if (alturaTotalOculta <= 0) return;

    const percentual = (distanciaDoTopo / alturaTotalOculta) * 100;
    setProgresso(Math.min(Math.max(percentual, 0), 100));
  };

  const handleAceitar = async () => {
    if (!aceito) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("termos_aceitos").insert({
          usuario_id: user.id,
          versao_termos: "1.0",
        });
      }

      await AsyncStorage.setItem("termos_aceitos", "true");

      navigation.replace("ChoiceScreen");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar seu aceite. Tente novamente.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barraProgressoFundo}>
        <View
          style={[styles.barraProgressoPreenchida, { width: `${progresso}%` }]}
        />
      </View>

      <View style={styles.header}>
        <Ionicons
          name="shield-checkmark"
          size={40}
          color={theme.colors.primary}
          style={styles.logo}
        />
        <Text style={styles.title}>Termos de Uso</Text>
      </View>

      <ScrollView
        style={styles.textContainer}
        onScroll={calcularProgresso}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.termosText}>
          Bem-vindo ao PersonalMatch. Ao usar este aplicativo você concorda com:
          {"\n\n"}
          <Text style={styles.bold}>1. USO DO SERVIÇO:</Text> O PersonalMatch
          conecta clientes a personal trainers. Não somos responsáveis pela
          qualidade dos serviços prestados pelos profissionais cadastrados.
          {"\n\n"}
          <Text style={styles.bold}>2. CADASTRO:</Text> Você é responsável pelas
          informações fornecidas. Dados falsos resultarão no cancelamento da
          conta.{"\n\n"}
          <Text style={styles.bold}>3. PROFISSIONAIS:</Text> Personal trainers
          devem possuir registro ativo no CONFEF/CREF para se cadastrar.{"\n\n"}
          <Text style={styles.bold}>4. CONTATO:</Text> O app facilita o contato
          entre partes. Contratos e pagamentos são de responsabilidade exclusiva
          das antes envolvidas.{"\n\n"}
          <Text style={styles.bold}>5. PRIVACIDADE:</Text> Seus dados são usados
          apenas para o funcionamento do app. Não vendemos informações a
          terceiros.{"\n\n"}
          <Text style={styles.bold}>6. CONDUTA:</Text> É proibido uso para fins
          ilegais, spam ou assédio. Violações resultarão em banimento.{"\n\n"}
          Versão 1.0 — 2026
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAceito(!aceito)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, aceito && styles.checkboxChecked]}>
            {aceito && <Ionicons name="checkmark" size={16} color="#000" />}
          </View>
          <Text style={styles.checkboxLabel}>
            Li e aceito os Termos de Uso e a Política de Privacidade
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnContinuar, !aceito && styles.btnDesabilitado]}
          onPress={handleAceitar}
          disabled={!aceito || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.btnText}>Aceitar e continuar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL("https://personalmatch.com.br/privacidade")
          }
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>Ver Política de Privacidade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },

  barraProgressoFundo: {
    width: "100%",
    height: 4,
    backgroundColor: "#222",
    position: "absolute",
    top: 50,
    left: 0,
  },
  barraProgressoPreenchida: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },

  header: { alignItems: "center", marginBottom: 20 },
  logo: { marginBottom: 10 },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: 32,
    color: theme.colors.text,
  },

  textContainer: { flex: 1, paddingHorizontal: 25, marginBottom: 10 },
  termosText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  bold: { color: theme.colors.text, fontWeight: "bold" },

  footer: { padding: 25, backgroundColor: theme.colors.background },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: theme.colors.primary },
  checkboxLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  btnContinuar: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDesabilitado: { opacity: 0.4 },
  btnText: { color: "#000", fontSize: 16, fontWeight: "bold" },

  linkContainer: { alignItems: "center", marginTop: 15 },
  linkText: {
    color: theme.colors.primary,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
