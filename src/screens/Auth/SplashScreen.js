import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../services/supabase";

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

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
      const tempoEspera = new Promise((resolve) => setTimeout(resolve, 4500)); 
      
      const rotaDestino = await checarSessao();

      await tempoEspera; 
      
      navigation.replace(rotaDestino);
    };

    iniciarApp();
  }, []);

  const checarSessao = async () => {
    try {
      const termosAceitos = await AsyncStorage.getItem("termos_aceitos");
      if (!termosAceitos) return "TermosDeUso";

      const { data: { session } } = await supabase.auth.getSession();
      
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
    alignItems: "center" 
  },
  logo: { 
    width: 360, 
    height: 360 
  },
});             