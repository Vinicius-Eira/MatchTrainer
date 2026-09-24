import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";
import { supabase } from "../../services/supabase";
import { scale, verticalScale } from "../../utils/responsive";

export default function SplashScreen({ navigation }: any) {
  
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          await supabase.auth.signOut(); 
          navigation.replace("ChoiceScreen");
          return;
        }

        const tipoUsuario = user.user_metadata?.tipo; 

        if (tipoUsuario === "personal") {
          const { data: personalData } = await supabase
            .from("personals")
            .select("ativo")
            .eq("id", user.id)
            .maybeSingle();

          if (personalData?.ativo) {
            navigation.replace("PersonalDashboard");
          } else {
            navigation.replace("PersonalSetup"); 
          }
          return;
        } 
        
        else {
          const { data: alunoData } = await supabase
            .from("usuarios")
            .select("setup_completo, preferencias, telefone, peso")
            .eq("id", user.id)
            .maybeSingle();

          if (!alunoData) {
            await supabase.auth.signOut();
            navigation.replace("ChoiceScreen");
            return;
          }

          const { data: conexoesAtivas } = await supabase
            .from("conexoes")
            .select("id, status")
            .eq("usuario_id", user.id)
            .order("atualizado_em", { ascending: false })
            .limit(1);

          if (conexoesAtivas && conexoesAtivas.length > 0) {
            const conexao = conexoesAtivas[0];
            if (conexao.status === "aguardando_assinatura") {
              if (!alunoData.telefone || !alunoData.peso) {
                navigation.replace("MiniOnboarding", { conexaoId: conexao.id });
              } else {
                navigation.replace("PropostaAluno", { conexaoId: conexao.id });
              }
              return;
            }
          }

          const isSetupFinalizado = alunoData.setup_completo === true || alunoData.preferencias?.setup_completo === true;

          if (isSetupFinalizado) {
            navigation.replace("UsuarioTabs"); 
          } else {
            navigation.replace("ClienteSetup"); 
          }
          return;
        }

      } catch (error) {
        console.log("Erro na SplashScreen: ", error);
        await supabase.auth.signOut();
        navigation.replace("ChoiceScreen");
      }
    };

    const timer = setTimeout(() => {
      verificarSessao();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      
      <Image
        source={require("../../assets/images/MatchTrainer_logo.png")} 
        style={styles.logoImage}
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
  logoImage: {
    width: scale(400),
    height: verticalScale(250),
  }
});