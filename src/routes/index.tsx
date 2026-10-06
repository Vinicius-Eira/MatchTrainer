import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { supabase } from "../services/supabase";
import { AppRoutes } from "./AppRoutes";

export const navigationRef = createNavigationContainerRef<any>();

export function Routes() {
  useEffect(() => {
    const forcarNavegacao = (telaDestino: string) => {
      const tentativa = setInterval(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(telaDestino);
          clearInterval(tentativa);
        }
      }, 100);
    };

    const processarLinkBruto = async (url: string | null) => {
      if (!url || (!url.includes("type=recovery") && !url.includes("type=signup"))) return;

      try {
        const separador = url.includes("#") ? "#" : "?";
        const fragmentos = url.split(separador)[1];

        if (fragmentos) {
          let accessToken: string | null = null;
          let refreshToken: string | null = null;
          let type: string | null = null;

          fragmentos.split("&").forEach((par) => {
            const [chave, valor] = par.split("=");
            if (chave === "access_token") accessToken = valor;
            if (chave === "refresh_token") refreshToken = valor;
            if (chave === "type") type = valor;
          });

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

            if (type === "recovery") {
              forcarNavegacao("RedefinirSenha");
            } else if (type === "signup") {
              Alert.alert("Conta Ativada! 🎉", "Sua conta foi verificada com sucesso. Vamos concluir seu perfil.");
              forcarNavegacao("Splash");
            }
          }
        }
      } catch (erro) {
        console.log("Erro ao processar tokens da URL:", erro);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") forcarNavegacao("RedefinirSenha");
    });

    const handleDeepLink = (event: { url: string }) => processarLinkBruto(event.url);
    Linking.getInitialURL().then((url) => processarLinkBruto(url));
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  const linking = {
    prefixes: ["matchtrainer://", "exp://192.168.15.26:8081/--/"],
    config: {
      screens: { RedefinirSenha: "redefinir-senha" },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <AppRoutes />
    </NavigationContainer>
  );
}