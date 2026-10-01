import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";
import { usePersonalSetup } from "./usePersonalSetup";

const OPCOES_GENERO = ["Masculino", "Feminino", "Outro"];

const OPCOES_SERVICOS = [
  { id: "Consultoria", titulo: "Consultoria Online", icon: "phone-portrait" as any, desc: "Planejamento e treinos pelo App" },
  { id: "Presencial", titulo: "Presencial/Híbrido", icon: "people" as any, desc: "Acompanhamento físico lado a lado" },
];

const OPCOES_LOCAL = [
  { id: "Academias Comerciais", titulo: "Academias", icon: "business" as any, desc: "Academias de rede ou de bairro" },
  { id: "Condominios", titulo: "Condomínios", icon: "home" as any, desc: "Treino no espaço do próprio aluno" },
  { id: "Estudios", titulo: "Estúdios", icon: "barbell" as any, desc: "Espaços privativos de personal" },
  { id: "Ar Livre", titulo: "Ar Livre/Parques", icon: "leaf" as any, desc: "Praças, parques funcionais ou praia" },
];

const OPCOES_TURNO = [
  { id: "manha", titulo: "Manhã (06h - 12h)", icon: "partly-sunny" as any, desc: "Alunos que treinam antes do dia começar" },
  { id: "tarde", titulo: "Tarde (12h - 18h)", icon: "sunny" as any, desc: "Horários de almoço e meio da tarde" },
  { id: "noite", titulo: "Noite (18h - 22h+)", icon: "moon" as any, desc: "O pico de movimento nas academias" },
  { id: "variado", titulo: "Horários Variados", icon: "time" as any, desc: "Tenho apenas janelas específicas na agenda" },
];

const OPCOES_AGENDA = [
  { id: "Disponível", titulo: "Disponível", icon: "checkmark-circle" as any, desc: "Estou aceitando novos alunos ativamente" },
  { id: "Poucas Vagas", titulo: "Poucas Vagas", icon: "warning" as any, desc: "Agenda quase cheia, restam poucos horários" },
  { id: "Lotada", titulo: "Agenda Lotada", icon: "close-circle" as any, desc: "Apenas consultoria online ou fila de espera" },
];

const OPCOES_GENERO_ATENDIDO = [
  { id: "indiferente", titulo: "Homens e Mulheres", icon: "people" as any, desc: "Atendimento geral para ambos os gêneros" },
  { id: "mulher", titulo: "Apenas Mulheres", icon: "woman" as any, desc: "Atendimento e metodologia 100% feminina" },
  { id: "homem", titulo: "Apenas Homens", icon: "man" as any, desc: "Atendimento e metodologia 100% masculina" },
];

const OPCOES_PUBLICO = [
  { id: "iniciantes", titulo: "Iniciantes", icon: "walk" as any, desc: "Pessoas sedentárias começando do zero" },
  { id: "intermediarios", titulo: "Intermediários", icon: "bicycle" as any, desc: "Alunos que já treinam com certa frequência" },
  { id: "avancados", titulo: "Avançados/Atletas", icon: "fitness" as any, desc: "Alunos focados em alta performance" },
];

const OPCOES_OBJETIVO = [
  { id: "emagrecimento", titulo: "Emagrecimento", icon: "flame" as any, desc: "Perder gordura, secar e ganhar definição" },
  { id: "hipertrofia", titulo: "Hipertrofia", icon: "barbell" as any, desc: "Foco total em ganho de massa magra" },
  { id: "performance", titulo: "Performance", icon: "speedometer" as any, desc: "Melhorar força, TAF ou esportes" },
  { id: "saude", titulo: "Saúde/Qualidade", icon: "heart" as any, desc: "Foco em condicionamento e bem-estar" },
  { id: "outro", titulo: "Outro Foco", icon: "add-circle" as any, desc: "Possuo uma especialidade diferente" },
];

const SUB_SAUDE = ["Hipertensão", "Diabetes", "Obesidade", "Postura", "Outros"];
const SUB_ESPORTE = ["Corrida", "Lutas", "Ciclismo", "Crossfit", "Futebol", "Outros"];

const OPCOES_LIMITACAO = [
  { id: "nenhuma", titulo: "Sem Restrições", icon: "checkmark-done" as any, desc: "Não trabalho com limitações específicas" },
  { id: "gestante", titulo: "Gestante/Pós-parto", icon: "body" as any, desc: "Treinamento adaptado e totalmente seguro" },
  { id: "lesao", titulo: "Lesões ou Dores", icon: "medkit" as any, desc: "Foco em fortalecimento e reabilitação" },
  { id: "clinica", titulo: "Condição Clínica", icon: "pulse" as any, desc: "Doenças crônicas, síndromes ou limitações" },
  { id: "outra", titulo: "Outra Restrição", icon: "add-circle" as any, desc: "Atendo outra condição específica" },
];

const SUB_LESAO = ["Joelho", "Coluna", "Ombro", "Quadril", "Tornozelo", "Outros"];
const SUB_CLINICA = ["Cardiopatia", "Asma", "SOP", "Fibromialgia", "Outros"];

const OPCOES_COBRANCA = [
  { id: "leve", titulo: "Leve / Constância", icon: "leaf-outline" as any, desc: "Foco no hábito e acolhimento, sem pressão" },
  { id: "moderada", titulo: "Moderada / Equilíbrio", icon: "scale-outline" as any, desc: "Exige resultados, mas com certa flexibilidade" },
  { id: "rigorosa", titulo: "Rigorosa / Alta Demanda", icon: "flash-outline" as any, desc: "Metas estritas, planilhas e cobrança firme" },
];

const OPCOES_ACOMPANHAMENTO = [
  { id: "pontual", titulo: "Pontual (Tira-dúvidas)", icon: "chatbubble-outline" as any, desc: "Contato eventual apenas para ajustar os treinos" },
  { id: "frequente", titulo: "Frequente (Check-ins)", icon: "calendar-outline" as any, desc: "Análise semanal de evolução e métricas" },
  { id: "proximo", titulo: "Próximo (Quase Diário)", icon: "people-circle-outline" as any, desc: "Motivação por WhatsApp e contato constante" },
];

const OPCOES_AUTONOMIA = [
  { id: "baixa", titulo: "Baixa (Iniciante)", icon: "map-outline" as any, desc: "Precisa de vídeos, correções e explicações" },
  { id: "media", titulo: "Média (Intermediário)", icon: "compass-outline" as any, desc: "Sabe a execução, mas precisa de uma base" },
  { id: "alta", titulo: "Alta (Sabe Treinar)", icon: "rocket-outline" as any, desc: "Busca apenas a periodização estruturada" },
];

const OPCOES_VALORES = [
  { id: "constancia", titulo: "Constância", icon: "calendar" as any, desc: "Disciplina e frequência regular nos treinos" },
  { id: "comunicacao", titulo: "Comunicação", icon: "chatbubbles" as any, desc: "Sinceridade e transparência nos feedbacks" },
  { id: "compromisso", titulo: "Compromisso", icon: "restaurant" as any, desc: "Seriedade com a dieta, o sono e o descanso" },
  { id: "feedback", titulo: "Abertura a Feedbacks", icon: "ear" as any, desc: "Saber escutar correções sem levar pro pessoal" },
  { id: "outro", titulo: "Outro Valor", icon: "add-circle" as any, desc: "Outro comportamento que considera vital" },
];

const OPCOES_EXPERIENCIA = ["Iniciante (< 2 anos)", "Pleno (2 a 5 anos)", "Sênior (5 a 10 anos)", "Especialista (> 10 anos)"];

export default function PersonalSetup({ navigation }: any) {
  const { state, actions } = usePersonalSetup(navigation);

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
        const ativo = isSingle ? stateArray === opt.id : stateArray.includes(opt.id);
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

  const stepTitles = ["Identidade", "Serviços & Logística", "Foco & Público", "Motor do Match"];

  if (state.loadingDados) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerAbsolute}>
        <View style={styles.stepperHeader}>
          <Text style={styles.stepCounterText}>Passo {state.currentStep} de 4</Text>
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
              <Text style={styles.mainTitle}>Sua <Text style={styles.titleHighlight}>Identidade.</Text></Text>
              <Text style={styles.subTitle}>Os dados básicos para o seu perfil e segurança dos alunos.</Text>
            </View>

            <View style={styles.photoSection}>
              <TouchableOpacity onPress={actions.selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
                {state.fotoUri ? <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} /> : <View style={styles.avatarPlaceholder}><Ionicons name="person" size={moderateScale(50)} color="#888" /></View>}
                <View style={styles.cameraBadge}><Ionicons name="camera" size={moderateScale(16)} color="#000" /></View>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nome Público *</Text>
              <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Ex: Personal João Silva" placeholderTextColor="#666" value={state.nome} onChangeText={(t) => actions.setNome(actions.formatarNome(t))} onFocus={() => actions.setInputFocado("nome")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <Text style={styles.inputLabel}>Seu Gênero *</Text>
            <View style={{ marginBottom: verticalScale(20) }}>{renderChips(OPCOES_GENERO, state.genero, actions.setGenero, true)}</View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>CREF Profissional *</Text>
              <View style={[styles.inputBox, state.inputFocado === "cref" && styles.inputBoxFocused]}>
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="000000-G/SP" placeholderTextColor="#666" value={state.cref} onChangeText={(t) => actions.setCref(t.toUpperCase())} onFocus={() => actions.setInputFocado("cref")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>WhatsApp *</Text>
              <View style={[styles.inputBox, state.inputFocado === "wpp" && styles.inputBoxFocused]}>
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="(00) 00000-0000" placeholderTextColor="#666" keyboardType="phone-pad" value={state.telefone} onChangeText={actions.formatarWhatsApp} onFocus={() => actions.setInputFocado("wpp")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Localização de Atendimento *</Text>
              <TouchableOpacity style={styles.btnGpsRadar} onPress={actions.obterLocalizacaoAtual} disabled={state.buscandoLocalizacao} activeOpacity={0.8}>
                {state.buscandoLocalizacao ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <><MaterialCommunityIcons name="radar" size={moderateScale(20)} color={theme.colors.primary} /><Text style={styles.btnGpsRadarText}>Sincronizar Radar GPS</Text></>}
              </TouchableOpacity>
              {(state.cidade || state.bairro) && <Text style={styles.locationResultText}><Ionicons name="location" size={14} color="#00E676" /> {state.cidade}{state.bairro ? `, ${state.bairro}` : ""}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Redes Sociais (Opcional)</Text>
              <View style={[styles.inputBox, { marginBottom: 10 }]}>
                <Ionicons name="logo-instagram" size={18} color="#888" style={{ marginRight: 10 }} />
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="instagram (sem @)" placeholderTextColor="#666" autoCapitalize="none" value={state.instagram} onChangeText={actions.setInstagram} keyboardAppearance="dark" />
              </View>
              <View style={styles.inputBox}>
                <FontAwesome5 name="tiktok" size={16} color="#888" style={{ marginRight: 10 }} />
                <TextInput style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="tiktok (sem @)" placeholderTextColor="#666" autoCapitalize="none" value={state.tiktok} onChangeText={actions.setTiktok} keyboardAppearance="dark" />
              </View>
            </View>
          </View>
        )}

        {state.currentStep === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Serviços & <Text style={styles.titleHighlight}>Logística.</Text></Text>
              <Text style={styles.subTitle}>O que você oferece, onde e por quanto.</Text>
            </View>

            <Text style={styles.sectionTitle}>Serviços que Oferece *</Text>
            <View style={styles.gridContainer}>
              {OPCOES_SERVICOS.map((opt, index) => {
                const ativo = state.servicosOferecidos.includes(opt.id);
                const isLastOdd = index === OPCOES_SERVICOS.length - 1 && OPCOES_SERVICOS.length % 2 !== 0;
                return (
                  <TouchableOpacity key={opt.id} style={[styles.gridItemWithIcon, isLastOdd && { width: "100%" }, ativo && styles.gridItemAtivo]} onPress={() => actions.handleToggleServicos(opt.id)} activeOpacity={0.8}>
                    {ativo && <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />}
                    <Ionicons name={opt.icon} size={moderateScale(26)} color={ativo ? theme.colors.primary : "#888"} style={{ marginBottom: moderateScale(8) }} />
                    <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
                    {opt.desc && <Text style={[styles.gridItemDesc, ativo && { color: "#AAA" }]}>{opt.desc}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {state.servicosOferecidos.includes("Consultoria") && (
              <View style={styles.priceContainer}>
                <Text style={styles.inputLabel}>Valor Base - Consultoria (Mês)</Text>
                <View style={styles.priceEditableContainer}>
                  <Text style={styles.pricePrefix}>R$ </Text>
                  <TextInput style={[styles.priceInput, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="numeric" value={String(state.precoConsultoria)} onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoConsultoria)} maxLength={4} keyboardAppearance="dark" />
                </View>
                <Slider style={styles.slider} minimumValue={50} maximumValue={600} step={10} minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" thumbTintColor={theme.colors.primary} value={state.precoConsultoria > 600 ? 600 : state.precoConsultoria} onValueChange={actions.setPrecoConsultoria} />
              </View>
            )}

            {state.servicosOferecidos.includes("Presencial") && (
              <View style={styles.subSection}>
                <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Logística Presencial *</Text>
                <Text style={styles.helpText}>Para quem busca treinar fisicamente com você.</Text>
                
                <Text style={styles.inputLabel}>Locais onde atende</Text>
                {renderGrid(OPCOES_LOCAL, state.locaisAtendidos, actions.setLocaisAtendidos)}

                <Text style={[styles.inputLabel, { marginTop: 15 }]}>Turnos Disponíveis</Text>
                {renderGrid(OPCOES_TURNO, state.turnos, actions.setTurnos)}

                {state.turnos.includes("variado") && (
                  <View style={[styles.inputBox, { marginTop: 10 }]}>
                    <TextInput 
                      style={[styles.inputPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} 
                      placeholder="Ex: Seg/Qua às 14h, Ter/Qui às 10h" 
                      placeholderTextColor="#666" 
                      value={state.horariosEspecificos} 
                      onChangeText={actions.setHorariosEspecificos} 
                      keyboardAppearance="dark" 
                    />
                  </View>
                )}

                <View style={styles.priceContainer}>
                  <Text style={styles.inputLabel}>Valor Base - Presencial (Aula)</Text>
                  <View style={styles.priceEditableContainer}>
                    <Text style={styles.pricePrefix}>R$ </Text>
                    <TextInput style={[styles.priceInput, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="numeric" value={String(state.precoPresencial)} onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoPresencial)} maxLength={4} keyboardAppearance="dark" />
                  </View>
                  <Slider style={styles.slider} minimumValue={50} maximumValue={500} step={10} minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" thumbTintColor={theme.colors.primary} value={state.precoPresencial > 500 ? 500 : state.precoPresencial} onValueChange={actions.setPrecoPresencial} />
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(35) }]}>Status da Agenda *</Text>
            {renderGrid(OPCOES_AGENDA, state.statusAgenda, actions.setStatusAgenda, true)}
          </View>
        )}

        {state.currentStep === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>Foco & <Text style={styles.titleHighlight}>Público.</Text></Text>
              <Text style={styles.subTitle}>Crucial para o Match: Quem você atende e no que você é bom.</Text>
            </View>

            <Text style={styles.sectionTitle}>Público Alvo *</Text>
            <Text style={styles.inputLabel}>Gênero que Atende</Text>
            {renderGrid(OPCOES_GENERO_ATENDIDO, state.generoAtendido, actions.setGeneroAtendido, true)}

            <Text style={[styles.inputLabel, { marginTop: verticalScale(20) }]}>Perfil dos Alunos</Text>
            {renderGrid(OPCOES_PUBLICO, state.publicoAtendido, actions.setPublicoAtendido)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(35) }]}>Focos de Treino *</Text>
            <Text style={styles.helpText}>Quais os objetivos que você domina entregar?</Text>
            {renderGrid(OPCOES_OBJETIVO, state.objetivosAtendidos, actions.setObjetivosAtendidos)}

            {state.objetivosAtendidos.includes("outro") && (
              <TextInput style={styles.inputSubChip} placeholder="Especifique seu foco de treino..." placeholderTextColor="#666" value={state.outroObjetivoTexto} onChangeText={actions.setOutroObjetivoTexto} keyboardAppearance="dark" />
            )}
            {state.objetivosAtendidos.includes("saude") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Público de Saúde (Opcional):</Text>{renderChips(SUB_SAUDE, state.subsAtendidos, actions.setSubsAtendidos)}</View>
            )}
            {state.objetivosAtendidos.includes("performance") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prepara para (Opcional):</Text>{renderChips(SUB_ESPORTE, state.subsAtendidos, actions.setSubsAtendidos)}</View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(35) }]}>Atende Restrições? *</Text>
            {renderGrid(OPCOES_LIMITACAO, state.limitacoesAtendidas, actions.setLimitacoesAtendidas)}
            
            {state.limitacoesAtendidas.includes("outra") && (
              <TextInput style={styles.inputSubChip} placeholder="Especifique a restrição que atende..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={actions.setOutraLimitacaoTexto} keyboardAppearance="dark" />
            )}
            {state.limitacoesAtendidas.includes("lesao") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Foco em lesões de:</Text>{renderChips(SUB_LESAO, state.subsAtendidos, actions.setSubsAtendidos)}</View>
            )}
            {state.limitacoesAtendidas.includes("clinica") && (
              <View style={styles.subBox}><Text style={styles.subBoxTitle}>Condições Específicas:</Text>{renderChips(SUB_CLINICA, state.subsAtendidos, actions.setSubsAtendidos)}</View>
            )}
          </View>
        )}

        {state.currentStep === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.mainTitle}>O Motor do <Text style={styles.titleHighlight}>Match.</Text></Text>
              <Text style={styles.subTitle}>A psicologia por trás do seu atendimento. Como você funciona.</Text>
            </View>

            <Text style={styles.sectionTitle}>Nível de Cobrança *</Text>
            <Text style={styles.helpText}>Como você exige resultados dos alunos?</Text>
            {renderGrid(OPCOES_COBRANCA, state.cobranca, actions.setCobranca, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Frequência de Acompanhamento *</Text>
            <Text style={styles.helpText}>Como você mantém contato durante a semana?</Text>
            {renderGrid(OPCOES_ACOMPANHAMENTO, state.acompanhamento, actions.setAcompanhamento, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Autonomia Esperada *</Text>
            <Text style={styles.helpText}>O quanto o aluno precisa saber se virar sozinho?</Text>
            {renderGrid(OPCOES_AUTONOMIA, state.autonomiaEsperada, actions.setAutonomiaEsperada, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Eu valorizo no aluno: *</Text>
            <Text style={styles.helpText}>O que é inegociável para uma parceria dar certo?</Text>
            {renderGrid(OPCOES_VALORES, state.valoresAluno, actions.setValoresAluno)}
            
            {state.valoresAluno.includes("outro") && (
              <TextInput style={styles.inputSubChip} placeholder="Especifique o que mais você valoriza..." placeholderTextColor="#666" value={state.outroValorTexto} onChangeText={actions.setOutroValorTexto} keyboardAppearance="dark" />
            )}

            <View style={[styles.formGroup, { marginTop: verticalScale(30) }]}>
              <Text style={styles.inputLabel}>Biografia e Diferenciais</Text>
              <View style={[styles.inputBoxArea, state.inputFocado === "dif" && styles.inputBoxFocused]}>
                <TextInput style={[styles.textAreaPremium, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} placeholder="Resuma seu método, formação e os diferenciais que você oferece..." placeholderTextColor="#666" multiline maxLength={400} value={state.bio} onChangeText={actions.setBio} textAlignVertical="top" onFocus={() => actions.setInputFocado("dif")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Tempo de Experiência</Text>
            {renderChips(OPCOES_EXPERIENCIA, state.experiencia, actions.setExperiencia, true)}

            <Text style={[styles.sectionTitle, { marginTop: verticalScale(30) }]}>Resultados (Antes e Depois)</Text>
            <Text style={styles.helpText}>O visual converte muito mais que texto.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galeriaScroll}>
              {state.galeria.map((uri: string, index: number) => (
                <View key={index} style={styles.galeriaItem}>
                  <Image source={{ uri }} style={styles.galeriaImage} />
                  <TouchableOpacity style={styles.btnRemoverFoto} onPress={() => actions.removerFotoGaleria(index)}>
                    <Ionicons name="close" size={moderateScale(16)} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {state.galeria.length < 5 && (
                <TouchableOpacity style={styles.btnAddFoto} onPress={actions.selecionarFotosGaleria} activeOpacity={0.7}>
                  <Ionicons name="image-outline" size={moderateScale(28)} color={theme.colors.primary} />
                  <Text style={styles.btnAddFotoText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
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
            <TouchableOpacity style={[styles.btnAvancarStep, { borderColor: theme.colors.success }]} onPress={actions.handleSalvar} disabled={state.loading} activeOpacity={0.8}>
              {state.loading ? (
                <ActivityIndicator size="small" color={theme.colors.success} />
              ) : (
                <>
                  <LinearGradient colors={["rgba(0, 230, 118, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} />
                  <Text style={[styles.btnAvancarStepText, { color: theme.colors.success }]}>Salvar Perfil</Text>
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
  headerTextContainer: { marginBottom: verticalScale(35), alignItems: "center" },
  mainTitle: { color: "#FFF", fontSize: moderateScale(34), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#888", fontSize: moderateScale(14), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", marginBottom: verticalScale(8), textTransform: "uppercase", letterSpacing: 0.5 },
  helpText: { color: "#666", fontSize: moderateScale(13), marginBottom: verticalScale(15) },
  
  photoSection: { alignItems: "center", marginBottom: verticalScale(35) },
  avatarContainer: { position: "relative" },
  avatarPlaceholder: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), backgroundColor: "#151515", borderWidth: 1, borderColor: "#2A2A2A", justifyContent: "center", alignItems: "center" },
  avatarImage: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: scale(34), height: scale(34), borderRadius: moderateScale(17), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#020202" },
  
  formGroup: { marginBottom: verticalScale(20) },
  inputLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(8), marginLeft: scale(5) },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#2A2A2A", paddingHorizontal: scale(14), height: verticalScale(60) },
  inputBoxArea: { backgroundColor: "#121212", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#2A2A2A", paddingHorizontal: scale(16) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputPremium: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%" },
  textAreaPremium: { minHeight: verticalScale(120), paddingTop: verticalScale(16), paddingBottom: verticalScale(16), color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body },
  inputSubChip: { backgroundColor: "#151515", borderRadius: moderateScale(14), color: "#FFF", fontSize: moderateScale(14), padding: scale(14), borderWidth: 1, borderColor: "#2A2A2A", width: "100%", marginTop: verticalScale(10), marginBottom: verticalScale(10) },
  
  btnGpsRadar: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.05)" },
  btnGpsRadarText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", marginLeft: scale(8), textTransform: "uppercase" },
  locationResultText: { color: "#00E676", fontSize: moderateScale(13), fontWeight: "bold", marginTop: verticalScale(10), marginLeft: scale(5) },
  
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
  
  subSection: { marginTop: verticalScale(20), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "#2A2A2A" },

  priceContainer: { backgroundColor: "#121212", borderRadius: moderateScale(18), padding: scale(20), borderWidth: 1, borderColor: "#2A2A2A", marginTop: verticalScale(15), alignItems: "center" },
  slider: { width: "100%", height: verticalScale(40) },
  priceEditableContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(10) },
  pricePrefix: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(28), letterSpacing: -1 },
  priceInput: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(28), letterSpacing: -1, minWidth: scale(60), textAlign: "left" },
  
  galeriaScroll: { paddingVertical: verticalScale(10) },
  galeriaItem: { width: scale(100), height: scale(100), borderRadius: moderateScale(16), overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#2A2A2A", marginRight: scale(12) },
  galeriaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  btnRemoverFoto: { position: "absolute", top: scale(6), right: scale(6), backgroundColor: "rgba(0,0,0,0.7)", borderRadius: moderateScale(12), padding: scale(4) },
  btnAddFoto: { width: scale(100), height: scale(100), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,107,0,0.05)" },
  btnAddFotoText: { color: theme.colors.primary, fontSize: moderateScale(12), marginTop: verticalScale(8), fontWeight: "bold" },
  
  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: scale(24), paddingTop: verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  stepperControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  btnVoltarStep: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(10), paddingHorizontal: scale(10) },
  btnVoltarStepText: { color: "#888", fontSize: moderateScale(15), fontWeight: "bold", marginLeft: scale(6) },
  btnAvancarStep: { flexDirection: "row", height: verticalScale(50), paddingHorizontal: scale(24), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", overflow: 'hidden' },
  btnAvancarStepText: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});