import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { theme } from "./src/theme/theme";

import SplashScreen from "./src/screens/Auth/SplashScreen";
import ChoiceScreen from "./src/screens/Auth/ChoiceScreen";
import TermosDeUso from "./src/screens/Auth/TermosDeUso";
import PersonalLogin from "./src/screens/Auth/personal/PersonalLogin";
import PersonalCadastro from "./src/screens/Auth/personal/PersonalCadastro";
import ClienteLogin from "./src/screens/Auth/user/ClienteLogin";
import ClienteCadastro from "./src/screens/Auth/user/ClienteCadastro";

import PersonalSetup from "./src/screens/Onboarding/PersonalSetup";
import ClienteSetup from "./src/screens/Onboarding/ClienteSetup";
import SetupBuscaAluno from "./src/screens/Onboarding/SetupBuscaAluno";

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
import ConversasAluno from "./src/screens/Shared/ConversasAluno";

const Stack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="ChoiceScreen" component={ChoiceScreen} />
        <RootStack.Screen name="TermosDeUso" component={TermosDeUso} />

        <RootStack.Screen name="VisaoAluno" component={VisaoAluno} />
        <RootStack.Screen name="Chat" component={Chat} />
        <RootStack.Screen name="ConversasAluno" component={ConversasAluno} />

        <RootStack.Screen name="PersonalLogin" component={PersonalLogin} />
        <RootStack.Screen name="PersonalCadastro" component={PersonalCadastro} />
        <RootStack.Screen name="PersonalSetup" component={PersonalSetup} />
        <RootStack.Screen name="PersonalDashboard" component={PersonalDashboard} />
        <RootStack.Screen name="FeedbackPersonal" component={FeedbackPersonal} />
        <RootStack.Screen name="Avaliacoes" component={Avaliacoes} />

        <RootStack.Screen name="ClienteLogin" component={ClienteLogin} />
        <RootStack.Screen name="ClienteCadastro" component={ClienteCadastro} />
        <RootStack.Screen name="ClienteSetup" component={ClienteSetup} />
        <RootStack.Screen name="SetupBuscaAluno" component={SetupBuscaAluno} />
        <RootStack.Screen name="PerfilPublicoPersonal" component={PerfilPublicoPersonal} />
        <RootStack.Screen name="AvaliarPersonal" component={AvaliarPersonal} />
        
        <RootStack.Screen
          name="Avaliar"
          component={Avaliar}
          options={{ presentation: "modal", headerShown: false }}
        />

        <RootStack.Screen name="UsuarioTabs" component={UsuarioTabNavigator} />
        <RootStack.Screen name="PersonalStack" component={PersonalStackNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}