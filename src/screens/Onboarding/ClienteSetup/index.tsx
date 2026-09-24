import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";
import { useClientSetup } from "./useClienteSetup";

const OPCOES_MODALIDADE = [
  { id: "Consultoria", titulo: "Consultoria Online", icon: "phone-portrait" as any, desc: "Treinos prescritos via app" },
  { id: "Presencial", titulo: "Presencial", icon: "people" as any, desc: "Acompanhamento físico lado a lado" },
  { id: "Indiferente", titulo: "Híbrido / Ambos", icon: "options" as any, desc: "Aberto a qualquer formato" },
];
const OPCOES_LOCAL = [
  { id: "Academias Comerciais", titulo: "Academias", icon: "business" as any, desc: "Academias de rede ou de bairro" },
  { id: "Condominios", titulo: "Condomínios", icon: "home" as any, desc: "Treinar no prédio ou em casa" },
  { id: "Ar Livre", titulo: "Ar Livre", icon: "leaf" as any, desc: "Parques e áreas abertas" },
];
const OPCOES_TURNO = [
  { id: "manha", titulo: "Manhã", icon: "partly-sunny" as any, desc: "Treino antes do dia começar" },
  { id: "tarde", titulo: "Tarde", icon: "sunny" as any, desc: "Horário de almoço ou fim de tarde" },
  { id: "noite", titulo: "Noite", icon: "moon" as any, desc: "Depois do trabalho/estudos" },
  { id: "variado", titulo: "Janelas Específicas", icon: "time" as any, desc: "Tenho horários limitados" },
];
const OPCOES_FREQUENCIA = [
  { id: "1-2", titulo: "1 a 2 dias", icon: "calendar" as any, desc: "Adaptação e rotina apertada" },
  { id: "3-4", titulo: "3 a 4 dias", icon: "flash" as any, desc: "Constância e evolução real" },
  { id: "5-6", titulo: "5 a 6 dias", icon: "flame" as any, desc: "Foco alto e disciplina" },
  { id: "7", titulo: "Todo dia", icon: "rocket" as any, desc: "Intensidade máxima" },
];
const OPCOES_GENERO_TREINADOR = [
  { id: "indiferente", titulo: "Indiferente", icon: "people" as any, desc: "Foco apenas na qualidade" },
  { id: "mulher", titulo: "Apenas Mulheres", icon: "woman" as any, desc: "Me sinto mais confortável" },
  { id: "homem", titulo: "Apenas Homens", icon: "man" as any, desc: "Tenho preferência" },
];
const OPCOES_INVESTIMENTO = [
  { id: "economico", titulo: "Orçamento Básico", icon: "wallet-outline" as any, desc: "Treinos presenciais mais acessíveis ou planos iniciais." },
  { id: "medio", titulo: "Média de Mercado", icon: "cash-outline" as any, desc: "A faixa padrão para a maioria dos profissionais da plataforma." },
  { id: "premium", titulo: "Orçamento Premium", icon: "diamond-outline" as any, desc: "Para consultorias de alto nível e acompanhamento 360º." },
];
const OPCOES_HISTORICO = [
  { id: "iniciante", titulo: "Iniciante", icon: "walk" as any, desc: "Nunca treinei ou parei faz tempo" },
  { id: "intermediario", titulo: "Intermediário", icon: "bicycle" as any, desc: "Treino com alguma constância" },
  { id: "avancado", titulo: "Avançado", icon: "fitness" as any, desc: "Treino pesado e conheço meu corpo" },
];
const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecer", icon: "flame" as any, desc: "Perder gordura e secar" },
  { id: "hipertrofia", titulo: "Ganhar Massa", icon: "barbell" as any, desc: "Crescer e definir músculos" },
  { id: "performance", titulo: "Performance", icon: "speedometer" as any, desc: "Correr mais, TAF ou esportes" },
  { id: "saude", titulo: "Saúde / Qualidade", icon: "heart" as any, desc: "Condicionamento e bem-estar" },
  { id: "outro", titulo: "Outro Foco", icon: "add-circle" as any, desc: "Tenho um alvo diferente..." },
];
const OPCOES_LIMITACAO = [
  { id: "nenhuma", titulo: "Sem Restrições", icon: "checkmark-done" as any, desc: "Estou 100% pronto(a)" },
  { id: "gestante", titulo: "Gestante/Pós", icon: "body" as any, desc: "Preciso de treino adaptado" },
  { id: "lesao", titulo: "Lesões/Dores", icon: "medkit" as any, desc: "Dores articulares ou musculares" },
  { id: "clinica", titulo: "Condição Clínica", icon: "pulse" as any, desc: "Doença crônica ou síndrome" },
  { id: "outra", titulo: "Outra Restrição", icon: "add-circle" as any, desc: "Especificar..." },
];
const SUB_SAUDE = ["Hipertensão", "Diabetes", "Obesidade", "Postura", "Outros"];
const SUB_ESPORTE = ["Corrida", "Lutas", "Ciclismo", "Crossfit", "Futebol", "Outros"];
const SUB_LESAO = ["Joelho", "Coluna", "Ombro", "Quadril", "Tornozelo", "Outros"];
const SUB_CLINICA = ["Cardiopatia", "Asma", "SOP", "Fibromialgia", "Outros"];

const OPCOES_COBRANCA = [
  { id: "leve", titulo: "Compreensivo(a)", icon: "leaf-outline" as any, desc: "Alguém focado em construir o hábito sem pressão" },
  { id: "moderada", titulo: "Equilibrado(a)", icon: "scale-outline" as any, desc: "Que exija resultados, mas entenda meus deslizes" },
  { id: "rigorosa", titulo: "Sargento", icon: "flash-outline" as any, desc: "Que pegue no pé e não aceite desculpas" },
];
const OPCOES_ACOMPANHAMENTO = [
  { id: "pontual", titulo: "Independente", icon: "chatbubble-outline" as any, desc: "Só preciso do treino e tiro dúvidas se precisar" },
  { id: "frequente", titulo: "Semanal", icon: "calendar-outline" as any, desc: "Gosto de feedbacks e ajustes toda semana" },
  { id: "proximo", titulo: "Lado a Lado", icon: "people-circle-outline" as any, desc: "Quero mensagens motivacionais e muito contato" },
];
const OPCOES_AUTONOMIA = [
  { id: "baixa", titulo: "Baixa Autonomia", icon: "map-outline" as any, desc: "Preciso de vídeos e explicações detalhadas" },
  { id: "media", titulo: "Média Autonomia", icon: "compass-outline" as any, desc: "Sei executar os exercícios, só preciso da base" },
  { id: "alta", titulo: "Alta Autonomia", icon: "rocket-outline" as any, desc: "Domino as máquinas, só quero o planejamento" },
];
const OPCOES_VALORES = [
  { id: "didatica", titulo: "Boa Didática", icon: "book" as any, desc: "Saber explicar o porquê dos exercícios" },
  { id: "motivacao", titulo: "Motivação", icon: "flame" as any, desc: "Alguém que tenha uma energia lá em cima" },
  { id: "flexibilidade", titulo: "Flexibilidade", icon: "swap-horizontal" as any, desc: "Saber adaptar treinos se eu tiver imprevistos" },
  { id: "pontualidade", titulo: "Pontualidade", icon: "time" as any, desc: "Respostas rápidas no app (ou não atrasar presencial)" },
  { id: "outro", titulo: "Outro Valor", icon: "add-circle" as any, desc: "Especificar..." },
];

export default function ClienteSetup({ navigation }: any) {
  const { state, actions } = useClientSetup(navigation);

  const renderChips = (opcoes: string[], stateArray: any, setStateArray: any, isSingle = false) => (
    <View style={styles.chipsContainerCenter}>
      {opcoes.map((opcao) => {
        const ativo = isSingle ? stateArray === opcao : stateArray.includes(opcao);
        return (
          <TouchableOpacity key={opcao} style={[styles.chip, ativo && styles.chipAtivo]} onPress={() => isSingle ? setStateArray(opcao) : actions.toggleArrayItem(opcao, stateArray, setStateArray)} activeOpacity={0.7}>
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderGrid = (opcoes: any[], stateArray: any, setStateArray: any, isSingle = false) => (
    <View style={styles.gridContainer}>
      {opcoes.map((opt, index) => {
        const ativo = isSingle ? stateArray === opt.id : stateArray?.includes(opt.id);
        const isLastOdd = index === opcoes.length - 1 && opcoes.length % 2 !== 0; 
        
        return (
          <TouchableOpacity key={opt.id} style={[styles.gridItemWithIcon, isLastOdd && { width: "100%" }, ativo && styles.gridItemAtivo]} onPress={() => isSingle ? setStateArray(opt.id) : actions.toggleArrayItem(opt.id, stateArray, setStateArray)} activeOpacity={0.8}>
            {ativo && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />}
            <Ionicons name={opt.icon} size={moderateScale(26)} color={ativo ? theme.colors.primary : "#888"} style={{ marginBottom: moderateScale(8) }} />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && { color: "#AAA" }]}>{opt.desc}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const stepTitles = ["Seu Perfil", "Logística", "Seu Corpo", "O Match Ideal"];

  if (state.loadingDados) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerAbsolute}>
        <View style={styles.stepperHeader}>
          <Text style={styles.stepCounterText}>Mapeamento • {state.currentStep}/4</Text>
          <Text style={styles.stepTitleText}>{stepTitles[state.currentStep - 1]}</Text>
        </View>
        <View style={styles.stepperBarBackground}>
          <View style={[styles.stepperBarFill, { width: `${(state.currentStep / 4) * 100}%` }]} />
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {state.currentStep === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Sua <Text style={styles.titleHighlight}>Jornada</Text> começa aqui.</Text>
              <Text style={styles.subTitle}>Estes dados garantem a precisão do seu treino e a conexão direta com o treinador.</Text>
            </View>

            <View style={styles.photoSection}>
              <TouchableOpacity onPress={actions.escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
                {state.fotoUri ? <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={moderateScale(50)} color="#888" /></View>}
                <View style={styles.cameraBadge}><Ionicons name="camera" size={moderateScale(16)} color="#000" /></View>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Como quer ser chamado? *</Text>
              <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
                <Ionicons name="person-outline" size={20} color={state.inputFocado === "nome" ? theme.colors.primary : "#888"} style={{ marginRight: 10 }} />
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Nome ou Apelido" placeholderTextColor="#666" value={state.nome} onChangeText={(t: string) => actions.setNome(actions.formatarNome(t))} onFocus={() => actions.setInputFocado("nome")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: scale(8) }]}>
                <Text style={styles.inputLabel}>Nascimento *</Text>
                <View style={[styles.inputBox, state.inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="DD/MM/AAAA" placeholderTextColor="#666" keyboardType="number-pad" maxLength={10} value={state.dataNascimento} onChangeText={(t: string) => actions.formatarData(t)} onFocus={() => actions.setInputFocado("nasc")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: scale(8) }]}>
                <Text style={styles.inputLabel}>WhatsApp *</Text>
                <View style={[styles.inputBox, state.inputFocado === "wpp" && styles.inputBoxFocused]}>
                  <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="(00) 00000" placeholderTextColor="#666" keyboardType="phone-pad" value={state.telefone} onChangeText={(t: string) => actions.formatarWhatsApp(t)} onFocus={() => actions.setInputFocado("wpp")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Localização Base *</Text>
              <TouchableOpacity style={styles.btnGpsRadar} onPress={actions.buscarLocalizacao} disabled={state.buscandoLocal} activeOpacity={0.8}>
                {state.buscandoLocal ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <><MaterialCommunityIcons name="radar" size={moderateScale(20)} color={theme.colors.primary} /><Text style={styles.btnGpsRadarText}>Sincronizar GPS Atual</Text></>}
              </TouchableOpacity>
              {(state.cidade) && <Text style={styles.locationResultText}><Ionicons name="location" size={14} color="#00E676" /> {state.cidade}</Text>}
            </View>

            <View style={styles.divider} />
            <Text style={[styles.sectionTitle, { textAlign: "center" }]}>Biometria (Opcional)</Text>
            <Text style={styles.helpText}>Facilita o cálculo calórico inicial do treinador.</Text>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: scale(8) }]}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <View style={[styles.inputBox, state.inputFocado === "peso" && styles.inputBoxFocused]}>
                  <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="00.0" placeholderTextColor="#666" keyboardType="decimal-pad" maxLength={5} value={state.peso} onChangeText={(t: string) => actions.formatarPeso(t)} onFocus={() => actions.setInputFocado("peso")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: scale(8) }]}>
                <Text style={styles.inputLabel}>Altura (cm)</Text>
                <View style={[styles.inputBox, state.inputFocado === "altura" && styles.inputBoxFocused]}>
                  <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Ex: 175" placeholderTextColor="#666" keyboardType="number-pad" maxLength={3} value={state.altura} onChangeText={(t: string) => actions.formatarAltura(t)} onFocus={() => actions.setInputFocado("altura")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
            </View>

            <View style={styles.targetWeightBox}>
              <View style={styles.targetIconBox}><Ionicons name="flag" size={moderateScale(20)} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.targetTitle}>Sua Meta de Peso (kg)</Text>
                <View style={styles.targetInputContainer}>
                  <TextInput style={[styles.targetInput, Platform.OS === 'web' && { outlineStyle: "none" as any }]} placeholder="Ex: 70.0" placeholderTextColor="#555" keyboardType="decimal-pad" maxLength={5} value={state.metaPeso} onChangeText={(t: string) => actions.formatarMetaPeso(t)} onFocus={() => actions.setInputFocado("metaPeso")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
            </View>
          </View>
        )}

        {state.currentStep === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Como você deseja <Text style={styles.titleHighlight}>treinar?</Text></Text>
              <Text style={styles.subTitle}>Nós cruzamos essas opções para te mostrar apenas quem atende as suas necessidades logísticas.</Text>
            </View>

            <Text style={styles.sectionTitle}>Formato de Atendimento *</Text>
            {renderGrid(OPCOES_MODALIDADE, state.servicoBuscado, actions.setServicoBuscado, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Onde você vai treinar?</Text>
            <Text style={styles.helpText}>Para o treinador adaptar as ferramentas.</Text>
            {renderGrid(OPCOES_LOCAL, state.locaisTreino, actions.setLocaisTreino)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Turno Preferido para Treino</Text>
            {renderGrid(OPCOES_TURNO, state.turnos, actions.setTurnos)}
            
            {state.turnos?.includes("variado") && (
              <TextInput style={styles.inputSubChip} placeholder="Ex: Ter/Qui às 14h, ou no almoço..." placeholderTextColor="#666" value={state.horarioEspecifico} onChangeText={(t: string) => actions.setHorarioEspecifico(t)} keyboardAppearance="dark" />
            )}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Disponibilidade na Semana *</Text>
            <Text style={styles.helpText}>Essencial para o cálculo da sua periodização.</Text>
            {renderGrid(OPCOES_FREQUENCIA, state.frequencia, actions.setFrequencia, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Preferência de Treinador(a) *</Text>
            {renderGrid(OPCOES_GENERO_TREINADOR, state.generoTreinador, actions.setGeneroTreinador, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Qual a sua expectativa de Investimento? *</Text>
            <Text style={styles.helpText}>Não se preocupe, isso é apenas para sugerirmos a faixa certa.</Text>
            {renderGrid(OPCOES_INVESTIMENTO, state.investimento, actions.setInvestimento, true)}
          </View>
        )}

        {state.currentStep === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Entendendo o seu <Text style={styles.titleHighlight}>Corpo.</Text></Text>
              <Text style={styles.subTitle}>Sinceridade aqui garante que o profissional aplique o volume e intensidade corretos no 1º dia.</Text>
            </View>

            <Text style={styles.sectionTitle}>Seu Nível de Experiência *</Text>
            {renderGrid(OPCOES_HISTORICO, state.historico, actions.setHistorico, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Seu Maior Objetivo *</Text>
            {renderGrid(OPCOES_OBJETIVO, state.objetivos, actions.setObjetivos)}

            {state.objetivos?.includes("outro") && (
              <TextInput style={styles.inputSubChip} placeholder="Especifique seu objetivo..." placeholderTextColor="#666" value={state.outroObjetivoTexto} onChangeText={(t: string) => actions.setOutroObjetivoTexto(t)} keyboardAppearance="dark" />
            )}
            {state.objetivos?.includes("saude") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prioridade de Saúde:</Text>{renderChips(SUB_SAUDE, state.subsObjetivos, actions.setSubsObjetivos)}</View>
            )}
            {state.objetivos?.includes("performance") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Esportes Atuais:</Text>{renderChips(SUB_ESPORTE, state.subsObjetivos, actions.setSubsObjetivos)}</View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(35) }]}>Possui alguma limitação? *</Text>
            <Text style={styles.helpText}>Especialistas adoram resolver problemas reais.</Text>
            {renderGrid(OPCOES_LIMITACAO, state.limitacoes, actions.setLimitacoes)}
            
            {state.limitacoes?.includes("outra") && (
              <TextInput style={styles.inputSubChip} placeholder="Especifique sua restrição..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={(t: string) => actions.setOutraLimitacaoTexto(t)} keyboardAppearance="dark" />
            )}
            {state.limitacoes?.includes("lesao") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Onde é o foco da dor?</Text>{renderChips(SUB_LESAO, state.subsLimitacoes, actions.setSubsLimitacoes)}</View>
            )}
            {state.limitacoes?.includes("clinica") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Qual condição o treinador precisa saber?</Text>{renderChips(SUB_CLINICA, state.subsLimitacoes, actions.setSubsLimitacoes)}</View>
            )}
          </View>
        )}

        {state.currentStep === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>O Motor do <Text style={styles.titleHighlight}>Match.</Text></Text>
              <Text style={styles.subTitle}>A nossa tecnologia cruza as suas respostas comportamentais para achar a parceria perfeita.</Text>
            </View>

            <Text style={styles.sectionTitle}>Qual perfil mais te motiva? *</Text>
            <Text style={styles.helpText}>Na hora de ser cobrado, o que funciona para você?</Text>
            {renderGrid(OPCOES_COBRANCA, state.cobranca, actions.setCobranca, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Que nível de contato você quer? *</Text>
            {renderGrid(OPCOES_ACOMPANHAMENTO, state.acompanhamento, actions.setAcompanhamento, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Qual a sua autonomia treinando? *</Text>
            <Text style={styles.helpText}>Seja sincero sobre o quanto de vídeo e explicação você precisa.</Text>
            {renderGrid(OPCOES_AUTONOMIA, state.autonomia, actions.setAutonomia, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>O que você mais valoriza no Treinador? *</Text>
            {renderGrid(OPCOES_VALORES, state.valoresTreinador, actions.setValoresTreinador)}
            
            {state.valoresTreinador?.includes("outro") && (
              <TextInput style={styles.inputSubChip} placeholder="O que mais é vital para você?" placeholderTextColor="#666" value={state.outroValorTexto} onChangeText={(t: string) => actions.setOutroValorTexto(t)} keyboardAppearance="dark" />
            )}

            <View style={{ marginTop: verticalScale(30), backgroundColor: "rgba(255, 107, 0, 0.05)", padding: scale(20), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" }}>
              <Ionicons name="sparkles" size={24} color={theme.colors.primary} style={{ marginBottom: 10 }} />
              <Text style={{ color: "#FFF", fontSize: moderateScale(14), fontWeight: "bold", marginBottom: 5 }}>O Algoritmo está pronto!</Text>
              <Text style={{ color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(20) }}>Assim que você finalizar, o MatchTrainer começará a cruzar o seu perfil psicológico com os métodos de ensino dos profissionais ativos.</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <View style={styles.stepperControls}>
          {state.currentStep > 1 ? (
            <TouchableOpacity style={styles.btnVoltarStep} onPress={actions.passoAnterior} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#888" />
              <Text style={styles.btnVoltarStepText}>Voltar</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {state.currentStep < 4 ? (
            <TouchableOpacity style={styles.btnAvancarStep} onPress={actions.proximoPasso} activeOpacity={0.8}>
              <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.btnAvancarStepText}>Avançar</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btnAvancarStep, { borderColor: theme.colors.success }]} onPress={actions.handleFinalizar} disabled={state.loading} activeOpacity={0.8}>
              {state.loading ? (
                <ActivityIndicator size="small" color={theme.colors.success} />
              ) : (
                <>
                  <LinearGradient colors={["rgba(0, 230, 118, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} />
                  <Text style={[styles.btnAvancarStepText, { color: theme.colors.success }]}>Ver Meus Matches</Text>
                  <Ionicons name="checkmark-done" size={18} color={theme.colors.success} style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202", position: "relative" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020202" },
  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.12},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.08},
  
  headerAbsolute: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  stepperHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: scale(24), paddingBottom: verticalScale(15) },
  stepCounterText: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  stepTitleText: { color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  stepperBarBackground: { width: "100%", height: verticalScale(2), backgroundColor: "#222" },
  stepperBarFill: { height: "100%", backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },

  content: { paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(110) : verticalScale(100), paddingBottom: verticalScale(140) },
  stepContainer: { width: "100%" },
  headerTextContainer: { marginBottom: verticalScale(35), alignItems: "center", paddingHorizontal: scale(10) },
  mainTitle: { color: "#FFF", fontSize: moderateScale(34), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#888", fontSize: moderateScale(14), lineHeight: moderateScale(22), textAlign: "center" },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", marginBottom: verticalScale(8), textTransform: "uppercase", letterSpacing: 0.5 },
  helpText: { color: "#666", fontSize: moderateScale(13), marginBottom: verticalScale(15) },
  
  photoSection: { alignItems: "center", marginBottom: verticalScale(35) },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), backgroundColor: "#151515", borderWidth: 1, borderColor: "#2A2A2A", justifyContent: "center", alignItems: "center" },
  avatarImage: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: scale(34), height: scale(34), borderRadius: moderateScale(17), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#020202" },
  
  formGroup: { marginBottom: verticalScale(20) },
  row: { flexDirection: "row" },
  inputLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(8), marginLeft: scale(5) },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#2A2A2A", paddingHorizontal: scale(14), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputPremium: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  inputSubChip: { backgroundColor: "#151515", borderRadius: moderateScale(14), color: "#FFF", fontSize: moderateScale(14), padding: scale(14), borderWidth: 1, borderColor: "#2A2A2A", width: "100%", marginTop: verticalScale(10), marginBottom: verticalScale(10) },
  
  btnGpsRadar: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.05)" },
  btnGpsRadarText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", marginLeft: scale(8), textTransform: "uppercase" },
  locationResultText: { color: "#00E676", fontSize: moderateScale(13), fontWeight: "bold", marginTop: verticalScale(10), marginLeft: scale(5) },
  
  targetWeightBox: { flexDirection: "row", backgroundColor: "#121212", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "#2A2A2A", alignItems: "center", marginTop: verticalScale(10) },
  targetIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(16), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  targetTitle: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "bold", marginBottom: verticalScale(4), textTransform: "uppercase" },
  targetInputContainer: { flexDirection: "row", alignItems: "center" },
  targetInput: { flex: 1, color: "#FFF", fontSize: moderateScale(22), fontWeight: "900", backgroundColor: "transparent" },
  
  divider: { height: 1, backgroundColor: "#222", marginVertical: verticalScale(25) },
  
  chipsContainerCenter: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  chip: { backgroundColor: "#151515", paddingVertical: verticalScale(10), paddingHorizontal: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#2A2A2A" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.08)", borderColor: theme.colors.primary },
  chipTexto: { color: "#CCC", fontSize: moderateScale(13), fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },
  subBox: { backgroundColor: "#121212", width: "100%", padding: scale(15), borderRadius: moderateScale(16), marginTop: verticalScale(10), borderWidth: 1, borderColor: "#2A2A2A" },
  subBoxTitle: { color: "#AAA", fontSize: moderateScale(12), fontWeight: "bold", marginBottom: verticalScale(10), textTransform: "uppercase" },
  
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: verticalScale(10) },
  gridItemWithIcon: { width: "48%", backgroundColor: "#151515", paddingVertical: verticalScale(18), paddingHorizontal: scale(10), borderRadius: moderateScale(18), alignItems: "center", borderWidth: 1, borderColor: "#2A2A2A", overflow: "hidden" },
  gridItemAtivo: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.08)" },
  gridItemText: { color: "#E0E0E0", fontSize: moderateScale(13), fontWeight: "bold", textAlign: "center" },
  gridItemTextAtivo: { color: "#FFF", fontWeight: "900" },
  gridItemDesc: { color: "#888", fontSize: moderateScale(11), textAlign: "center", marginTop: verticalScale(4) },

  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: scale(24), paddingTop: verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  stepperControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btnVoltarStep: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(10), paddingHorizontal: scale(10) },
  btnVoltarStepText: { color: "#888", fontSize: moderateScale(15), fontWeight: "bold", marginLeft: scale(6) },
  btnAvancarStep: { flexDirection: "row", height: verticalScale(50), paddingHorizontal: scale(24), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", overflow: 'hidden' },
  btnAvancarStepText: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});