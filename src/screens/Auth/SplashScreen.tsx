import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { supabase } from "../../services/supabase";
import { moderateScale } from "../../utils/responsive";

export default function SplashScreen({ navigation }: any) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.6));

  const checarSessao = async () => {
    try {
      const termosAceitos = await AsyncStorage.getItem("termos_aceitos");
      if (!termosAceitos) return "TermosDeUso";

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        const { data: personalData } = await supabase
          .from("personals")
          .select("ativo")
          .eq("id", session.user.id)
          .maybeSingle();

        if (personalData) {
          return personalData.ativo ? "PersonalDashboard" : "PersonalSetup";
        } else {
          return "UsuarioTabs";
        }
      }
      return "ChoiceScreen";
    } catch (error) {
      console.log("Erro no Splash:", error);
      return "ChoiceScreen";
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 15,
        useNativeDriver: true,
      }),
    ]).start();

    const iniciarApp = async () => {
      const tempoEspera = new Promise((resolve) => setTimeout(resolve, 2500));
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("ChoiceScreen"), 5000));
      
      const rotaSessao = checarSessao();

      const rotaDestino = await Promise.race([rotaSessao, timeoutPromise]);
      await tempoEspera;

      navigation.replace(rotaDestino);
    };

    iniciarApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Animated.Image
        source={require("../../assets/images/MatchTrainer_logo.png")}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: moderateScale(360),
    height: moderateScale(360),
  },
});