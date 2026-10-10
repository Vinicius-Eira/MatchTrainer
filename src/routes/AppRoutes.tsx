import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Chat } from "../screens/App/Chat";
import { Messages } from "../screens/App/Messages";
import { ChoiceScreen } from "../screens/Auth/ChoiceScreen";
import { EsqueciSenha } from "../screens/Auth/password/EsqueciSenha";
import { RedefinirSenha } from "../screens/Auth/password/RedefinirSenha";
import { PersonalCadastro } from "../screens/Auth/Personal/PersonalCadastro";
import { PersonalLogin } from "../screens/Auth/Personal/PersonalLogin";
import { SplashScreen } from "../screens/Auth/SplashScreen";
import { TermosDeUso } from "../screens/Auth/TermosDeUso";
import { AlunoCadastro } from "../screens/Auth/User/AlunoCadastro";
import { AlunoLogin } from "../screens/Auth/User/AlunoLogin";
import { AtivarConvite } from "../screens/Auth/User/Activate";
import { MiniOnboarding } from "../screens/Onboarding/AlunoOnboarding";
import { AlunoSetup } from "../screens/Onboarding/AlunoSetup";
import { PersonalSetup } from "../screens/Onboarding/PersonalSetup";
import { InsightDetailScreen } from "../screens/Personal/CRM/Dashboard/InsightDetail";
import { PersonalDashboard } from "../screens/Personal/CRM/Dashboard";
import { PainelCrescimento } from "../screens/Personal/CRM/Financeiro/painelcrescimento";
import { Recebimentos } from "../screens/Personal/CRM/Financeiro/recebimentos";
import { AnamneseBuilder } from "../screens/Personal/CRM/GestaoAlunos/Anamnese";
import { HistoricoTreinosAluno } from "../screens/Personal/CRM/GestaoAlunos/HistoricoTreinosAluno";
import { ListaTreinosAluno } from "../screens/Personal/CRM/GestaoAlunos/ListaTreinosAluno";
import { MeusAlunos } from "../screens/Personal/CRM/GestaoAlunos/MeusAlunos";
import { VisaoAluno } from "../screens/Personal/CRM/GestaoAlunos/VisaoAluno";
import { AdicionarAluno } from "../screens/Personal/CRM/NovoContrato/AdicionarAluno";
import { PropostaAluno } from "../screens/Personal/CRM/NovoContrato/PropostaAluno";
import { ExerciseLibraryScreen } from "../screens/Personal/ExerciseLibrary";
import { Avaliacoes } from "../screens/Personal/Feedback";
import { FeedbackPersonal } from "../screens/Personal/Feedback/Personal";
import { Presets } from "../screens/Personal/Presets/Presets";
import { WorkoutCreator } from "../screens/Personal/WorkoutCreator";
import { Anamnese } from "../screens/User/Anamnese/";
import { QuestionnaireForm } from "../screens/User/Anamnese/QuestionnaireForm";
import { AlunoDashboard } from "../screens/User/Dashboard";
import { FeedPersonal } from "../screens/User/Feed";
import { PersonalPublicProfile } from "../screens/User/Feed/PersonalPublicProfile";
import { Finance } from "../screens/User/Finance";
import { PerfilAluno } from "../screens/User/Perfil";
import { RaioXTreino } from "../screens/User/Perfil/RaioXTreino";
import { Avaliar } from "../screens/User/Rating/Avaliar";
import { AvaliarPersonal } from "../screens/User/Rating/AvaliarPersonal";
import { Progress } from "../screens/User/Training/Progress";
import { WorkoutCompletion } from "../screens/User/Training/WorkoutCompletion";
import { WorkoutList } from "../screens/User/Training/WorkoutList";
import { WorkoutPreview } from "../screens/User/Training/WorkoutPreview";
import { WorkoutSession } from "../screens/User/Training/WorkoutSession";

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
      <FeedStack.Screen name="PersonalPublicProfile" component={PersonalPublicProfile} />
    </FeedStack.Navigator>
  );
}

function UsuarioTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#FF6B00",
        tabBarStyle: { backgroundColor: "#121212", borderTopColor: "#333" },
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#FFF",
      }}
    >
      <Tab.Screen
        name="Início"
        component={FeedStackNavigator}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Meu Perfil"
        component={PerfilAluno}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppRoutes() {
  return (
    <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Splash" component={SplashScreen} />
      <RootStack.Screen name="ChoiceScreen" component={ChoiceScreen} />
      <RootStack.Screen name="TermosDeUso" component={TermosDeUso} />
      <RootStack.Screen name="EsqueciSenha" component={EsqueciSenha} />
      <RootStack.Screen name="RedefinirSenha" component={RedefinirSenha} />
      <RootStack.Screen name="AtivarConvite" component={AtivarConvite} />
      
      <RootStack.Screen name="MiniOnboarding" component={MiniOnboarding} options={{ gestureEnabled: false }} />
      <RootStack.Screen name="AdicionarAluno" component={AdicionarAluno} />
      <RootStack.Screen name="VisaoAluno" component={VisaoAluno} />
      <RootStack.Screen name="Chat" component={Chat} />
      <RootStack.Screen name="Messages" component={Messages} />
      
      <RootStack.Screen name="PersonalLogin" component={PersonalLogin} />
      <RootStack.Screen name="PersonalCadastro" component={PersonalCadastro} />
      <RootStack.Screen name="PersonalSetup" component={PersonalSetup} />
      <RootStack.Screen name="MeusAlunos" component={MeusAlunos} />
      <RootStack.Screen name="AnamneseBuilder" component={AnamneseBuilder} />
      <RootStack.Screen name="ListaTreinosAluno" component={ListaTreinosAluno} />
      <RootStack.Screen name="HistoricoTreinosAluno" component={HistoricoTreinosAluno} />
      <RootStack.Screen name="PersonalDashboard" component={PersonalDashboard} />
      <RootStack.Screen name="InsightDetailScreen" component={InsightDetailScreen} />
      <RootStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <RootStack.Screen name="Presets" component={Presets} />
      <RootStack.Screen name="WorkoutCreator" component={WorkoutCreator} />
      <RootStack.Screen name="FeedbackPersonal" component={FeedbackPersonal} />
      <RootStack.Screen name="Avaliacoes" component={Avaliacoes} />

      <RootStack.Screen name="AlunoLogin" component={AlunoLogin} />
      <RootStack.Screen name="AlunoCadastro" component={AlunoCadastro} />
      <RootStack.Screen name="AlunoSetup" component={AlunoSetup} />
      <RootStack.Screen name="AlunoDashboard" component={AlunoDashboard} />
      <RootStack.Screen name="RaioXTreino" component={RaioXTreino} />
      <RootStack.Screen name="PerfilAluno" component={PerfilAluno} />
      <RootStack.Screen name="AvaliarPersonal" component={AvaliarPersonal} />
      <RootStack.Screen name="Avaliar" component={Avaliar} options={{ presentation: "modal" }} />
      <RootStack.Screen name="UsuarioTabs" component={UsuarioTabNavigator} />
      <RootStack.Screen name="PersonalStack" component={PersonalStackNavigator} />
      <RootStack.Screen name="Recebimentos" component={Recebimentos} />
      <RootStack.Screen name="PainelCrescimento" component={PainelCrescimento} />
      <RootStack.Screen name="PropostaAluno" component={PropostaAluno} />
      <RootStack.Screen name="WorkoutList" component={WorkoutList} />
      <RootStack.Screen name="WorkoutSession" component={WorkoutSession} />
      <RootStack.Screen name="WorkoutPreview" component={WorkoutPreview} />
      <RootStack.Screen name="WorkoutCompletion" component={WorkoutCompletion} />
      <RootStack.Screen name="Progress" component={Progress} />
      <RootStack.Screen name="Finance" component={Finance} />
      <RootStack.Screen name="Anamnese" component={Anamnese} />
      <RootStack.Screen name="QuestionnaireForm" component={QuestionnaireForm} />
    </RootStack.Navigator>
  );
}