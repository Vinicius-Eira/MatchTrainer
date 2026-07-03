import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import { View, Alert } from "react-native";
import * as Linking from 'expo-linking'; 
import { theme } from "./src/theme/theme";

import { supabase } from "./src/services/supabase";

import SplashScreen from "./src/screens/Auth/SplashScreen";
import ChoiceScreen from "./src/screens/Auth/ChoiceScreen";
import TermosDeUso from "./src/screens/Auth/TermosDeUso";
import PersonalLogin from "./src/screens/Auth/personal/PersonalLogin";
import PersonalCadastro from "./src/screens/Auth/personal/PersonalCadastro";
import ClienteLogin from "./src/screens/Auth/user/ClienteLogin";
import ClienteCadastro from "./src/screens/Auth/user/ClienteCadastro";
import PainelMeuTreinador from "./src/screens/User/PainelMeuTreinador";
import PersonalSetup from "./src/screens/Onboarding/PersonalSetup";
import ClienteSetup from "./src/screens/Onboarding/ClienteSetup";

import PersonalDashboard from "./src/screens/Personal/PersonalDashboard";
import VisaoAluno from "./src/screens/Personal/VisaoAluno";
import Avaliacoes from "./src/screens/Personal/Avaliacoes";
import FeedbackPersonal from "./src/screens/Personal/FeedbackPersonal";

import FeedPersonal from "./src/screens/User/FeedPersonal";
import PerfilPublicoPersonal from "./src/screens/User/PerfilPublicoPersonal";
import PerfilAluno from "./src/screens/User/PerfilAluno";
import Avaliar from "./src/screens/User/Avaliar";
import AvaliarPersonal from "./src/screens/User/AvaliarPersonal";

import Chat from "./src/screens/Shared/Chat";
import ConversasAluno from "./src/screens/Shared/Conversas";
import EsqueciSenha from "./src/screens/Auth/EsqueciSenha";
import RedefinirSenha from "./src/screens/Auth/RedefinirSenha";
import AtivarConvite from "./src/screens/Auth/user/AtivarConta";
import MeusAlunos from "./src/screens/Personal/MeusAlunos";

const Stack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef();

function PersonalStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={PersonalLogin} />
      <Stack.Screen name="Cadastro" component={PersonalCadastro} />
      <Stack.Screen name="PersonalSetup" component={PersonalSetup} />
      <Stack.Screen name="PersonalDashboard" component={PersonalDashboard} />
      <Stack.Screen name="Avaliacoes" component={Avaliacoes} />
    </Stack.Navigator>
  );
}

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedPersonalHome" component={FeedPersonal} />
      <FeedStack.Screen name="PerfilPublicoPersonal" component={PerfilPublicoPersonal} />
    </FeedStack.Navigator>
  );
}

function UsuarioTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: "#333",
        },
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen
        name="Início"
        component={FeedStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Meu Perfil"
        component={PerfilAluno}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
  });

  useEffect(() => {
    const forcarNavegacao = (telaDestino) => {
      const tentativa = setInterval(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(telaDestino);
          clearInterval(tentativa);
        }
      }, 100);
    };

    const processarLinkBruto = async (url) => {
      if (!url || (!url.includes('type=recovery') && !url.includes('type=signup'))) return;

      try {
        const separador = url.includes('#') ? '#' : '?';
        const fragmentos = url.split(separador)[1];

        if (fragmentos) {
          let accessToken = null;
          let refreshToken = null;
          let type = null;

          fragmentos.split('&').forEach(par => {
            const [chave, valor] = par.split('=');
            if (chave === 'access_token') accessToken = valor;
            if (chave === 'refresh_token') refreshToken = valor;
            if (chave === 'type') type = valor; 
          });

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            // ROTEAMENTO INTELIGENTE COM A FUNÇÃO TRATOR:
            if (type === 'recovery') {
              forcarNavegacao('RedefinirSenha');
            } else if (type === 'signup') {
              let telaDestino = 'ChoiceScreen';
              if (url.includes('ClienteLogin')) telaDestino = 'ClienteLogin';
              if (url.includes('PersonalLogin')) telaDestino = 'PersonalLogin';

              Alert.alert("Conta Ativada! 🎉", "Sua conta foi ativada com sucesso. É só você fazer login.");
              forcarNavegacao(telaDestino); 
            }
          }
        }
      } catch (erro) {
        console.log("Erro ao processar tokens da URL:", erro);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        forcarNavegacao('RedefinirSenha');
      }
    });

    const handleDeepLink = (event) => {
      processarLinkBruto(event.url);
    };

    Linking.getInitialURL().then((url) => {
      processarLinkBruto(url);
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  const linking = {
    prefixes: ['matchtrainer://', 'exp://192.168.15.26:8081/--/'],
    config: {
      screens: {
        RedefinirSenha: 'redefinir-senha',
      },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}> 
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="ChoiceScreen" component={ChoiceScreen} />
        <RootStack.Screen name="TermosDeUso" component={TermosDeUso} />
        <RootStack.Screen name="EsqueciSenha" component={EsqueciSenha} options={{ headerShown: false }} />
        <RootStack.Screen name="RedefinirSenha" component={RedefinirSenha} options={{ headerShown: false }} />
        <RootStack.Screen name="AtivarConvite" component={AtivarConvite} options={{ headerShown: false }} />

        <RootStack.Screen name="VisaoAluno" component={VisaoAluno} />
        <RootStack.Screen name="Chat" component={Chat} />
        <RootStack.Screen name="ConversasAluno" component={ConversasAluno} />

        <RootStack.Screen name="PersonalLogin" component={PersonalLogin} />
        <RootStack.Screen name="PersonalCadastro" component={PersonalCadastro} />
        <RootStack.Screen name="PersonalSetup" component={PersonalSetup} />
        <RootStack.Screen name="MeusAlunos" component={MeusAlunos} options={{ headerShown: false }} />
        <RootStack.Screen name="PersonalDashboard" component={PersonalDashboard} />
        <RootStack.Screen name="FeedbackPersonal" component={FeedbackPersonal} />
        <RootStack.Screen name="Avaliacoes" component={Avaliacoes} />

        <RootStack.Screen name="ClienteLogin" component={ClienteLogin} />
        <RootStack.Screen name="ClienteCadastro" component={ClienteCadastro} />
        <RootStack.Screen name="ClienteSetup" component={ClienteSetup} />
        <RootStack.Screen name="PerfilPublicoPersonal" component={PerfilPublicoPersonal} />
        
        <RootStack.Screen name="PainelMeuTreinador" component={PainelMeuTreinador} options={{ headerShown: false }} /> 
        <RootStack.Screen name="PerfilAluno" component={PerfilAluno} options={{ headerShown: false }} />
        <RootStack.Screen name="AvaliarPersonal" component={AvaliarPersonal} />
        <RootStack.Screen name="Avaliar" component={Avaliar} options={{ presentation: "modal", headerShown: false }} />
        <RootStack.Screen name="UsuarioTabs" component={UsuarioTabNavigator} />
        <RootStack.Screen name="PersonalStack" component={PersonalStackNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}