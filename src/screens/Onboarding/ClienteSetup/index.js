import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

import { useClientSetup } from "./useClienteSetup"; 
import OptionCard from "../../../components/Onboarding/OptionCard";
import TipBox from "../../../components/Onboarding/TipBox";
import {
  OPCOES_MODALIDADE, OPCOES_OBJETIVO, OPCOES_HISTORICO, OPCOES_LIMITACAO,
  OPCOES_PERFIL, OPCOES_GENERO_TREINADOR, OPCOES_TURNO, OPCOES_FREQUENCIA,
  OPCOES_LOCAL, OPCOES_INVESTIMENTO, SUB_SAUDE, SUB_ESPORTE, SUB_LESAO, SUB_CLINICA
} from "../../../constants/onboardingData";

export default function ClienteSetup({ navigation }) {
  const { state, actions } = useClientSetup(navigation);

  const renderChipsComIcone = (opcoes, stateArray, setStateArray) => (
    <View style={styles.chipsContainer}>
      {opcoes.map((opt) => {
        const isSelected = stateArray.includes(opt.titulo);
        return (
          <TouchableOpacity
            key={opt.titulo}
            style={[styles.chip, isSelected && styles.chipAtivo]}
            onPress={() => actions.toggleMultiSelect(opt.titulo, stateArray, setStateArray)}
            activeOpacity={0.7}
          >
            <Ionicons name={opt.icon} size={moderateScale(16)} color={isSelected ? theme.colors.primary : "#888"} style={{ marginRight: scale(6) }} />
            <Text style={[styles.chipTexto, isSelected && styles.chipTextoAtivo]}>{opt.titulo}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" style={styles.headerAbsolute}>
        {state.step > 0 && (
          <TouchableOpacity style={styles.btnBack} onPress={() => actions.setStep(state.step - 1)} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={moderateScale(24)} color="#FFF" />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { flex: 1, textAlign: "center" }]}>
          {state.step === 0 ? "SEU PERFIL" : `MAPEAMENTO • ${state.step}/${state.totalSteps}`}
        </Text>
      </BlurView>

      {state.step > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(state.step / state.totalSteps) * 100}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {state.step === 0 && (
          <View style={styles.fadeContainer}>
            <Text style={[styles.mainTitle, { flex: 1, textAlign: "center" }]}>Sua <Text style={styles.titleHighlight}>Jornada</Text> começa aqui.</Text>
            <Text style={[styles.subTitle, { flex: 1, textAlign: "center" }]}>Vamos criar o seu perfil para encontrarmos o treinador perfeito para você.</Text>

            <View style={styles.photoSection}>
              <TouchableOpacity onPress={actions.escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
                {state.fotoUri ? (
                  <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}><Ionicons name="person" size={moderateScale(50)} color="#444" /></View>
                )}
                <View style={styles.cameraBadge}><Ionicons name="camera" size={moderateScale(16)} color="#FFF" /></View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
                <Ionicons name="person-outline" size={moderateScale(20)} color={state.inputFocado === "nome" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputPremium} placeholder="Como quer ser chamado?" placeholderTextColor="#666" value={state.nome} onChangeText={(t) => actions.setNome(actions.formatarNome(t))} onFocus={() => actions.setInputFocado("nome")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
                <Text style={styles.inputLabel}>Nascimento *</Text>
                <View style={[styles.inputBox, state.inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <Ionicons name="calendar-outline" size={moderateScale(20)} color={state.inputFocado === "nasc" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput style={styles.inputPremium} placeholder="DD/MM/AAAA" placeholderTextColor="#666" keyboardType="number-pad" maxLength={10} value={state.dataNascimento} onChangeText={actions.formatarData} onFocus={() => actions.setInputFocado("nasc")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
                <Text style={styles.inputLabel}>WhatsApp *</Text>
                <View style={[styles.inputBox, state.inputFocado === "whats" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="whatsapp" size={moderateScale(20)} color={state.inputFocado === "whats" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput style={styles.inputPremium} placeholder="(00) 00000" placeholderTextColor="#666" keyboardType="number-pad" value={state.telefone} onChangeText={actions.formatarWhatsApp} onFocus={() => actions.setInputFocado("whats")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Localização *</Text>
              <View style={[styles.inputBox, state.inputFocado === "cidade" && styles.inputBoxFocused]}>
                <Ionicons name="location-outline" size={moderateScale(20)} color={state.inputFocado === "cidade" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput style={styles.inputPremium} placeholder="Bairro e Cidade" placeholderTextColor="#666" value={state.cidade} onChangeText={actions.setCidade} onFocus={() => actions.setInputFocado("cidade")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                <TouchableOpacity style={styles.btnGpsPremium} onPress={actions.buscarLocalizacao}>
                  {state.buscandoLocal ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.btnGpsText}>GPS</Text>}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={[styles.inputLabel, { flex: 1, textAlign: "center" }]}>Biometria (Opcional)</Text>
            <Text style={{ color: "#888", fontSize: moderateScale(13), marginBottom: verticalScale(15), textAlign: 'center' }}>Esses dados ajudam o professor a estruturar melhor seu treino.</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
                <View style={[styles.inputBox, state.inputFocado === "peso" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="scale-bathroom" size={moderateScale(20)} color={state.inputFocado === "peso" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput style={styles.inputPremium} placeholder="Peso" placeholderTextColor="#666" keyboardType="decimal-pad" maxLength={6} value={state.peso} onChangeText={actions.formatarPeso} onFocus={() => actions.setInputFocado("peso")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                  <Text style={styles.suffix}>kg</Text>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
                <View style={[styles.inputBox, state.inputFocado === "altura" && styles.inputBoxFocused]}>
                  <Ionicons name="body-outline" size={moderateScale(20)} color={state.inputFocado === "altura" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput style={styles.inputPremium} placeholder="Altura" placeholderTextColor="#666" keyboardType="number-pad" maxLength={3} value={state.altura} onChangeText={actions.formatarAltura} onFocus={() => actions.setInputFocado("altura")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                  <Text style={styles.suffix}>cm</Text>
                </View>
              </View>
            </View>

            <View style={styles.targetWeightBox}>
              <View style={styles.targetIconBox}><Ionicons name="flag" size={moderateScale(20)} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.targetTitle}>Qual a sua meta de peso?</Text>
                <View style={styles.targetInputContainer}>
                  <TextInput style={[styles.targetInput, Platform.OS === 'web' && { outlineStyle: "none" }]} placeholder="Ex: 70.0" placeholderTextColor="#555" keyboardType="decimal-pad" maxLength={6} value={state.metaPeso} onChangeText={actions.formatarMetaPeso} onFocus={() => actions.setInputFocado("metaPeso")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                  <Text style={styles.targetSuffix}>kg</Text>
                </View>
              </View>
            </View>

            <TipBox title="Privacidade Garantida" text="Seus dados estão seguros e só serão compartilhados com o treinador após você aceitar o Match." icon="lock-closed-outline" />
          </View>
        )}

        {state.step === 1 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Como você deseja <Text style={styles.titleHighlight}>treinar?</Text></Text>
            <Text style={styles.subTitle}>Selecione o formato de atendimento que você está procurando no momento.</Text>
            {OPCOES_MODALIDADE.map((item) => <OptionCard key={item.id} item={item} isSelected={state.servicoBuscado?.id === item.id} onPress={() => actions.setServicoBuscado(item)} />)}
            <TipBox title="Híbrido Mágico" text="Se você selecionar 'Híbrido / Ambos', conectaremos você a profissionais versáteis que oferecem tanto presencial quanto online." icon="options" />
          </View>
        )}

        {state.step === 2 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Qual é o seu principal <Text style={styles.titleHighlight}>objetivo?</Text></Text>
            <Text style={styles.subTitle}>Isso nos ajuda a filtrar especialistas que realmente entendem do que você precisa.</Text>
            {OPCOES_OBJETIVO.map((item) => <OptionCard key={item.id} item={item} isSelected={state.objetivo?.id === item.id} onPress={() => { actions.setObjetivo(item); actions.setSubObjetivo([]); }} />)}
            {state.objetivo?.id === "saude" && <View style={styles.subBox}><Text style={styles.subBoxTitle}>Selecione uma ou mais prioridades:</Text>{renderChipsComIcone(SUB_SAUDE, state.subObjetivo, actions.setSubObjetivo)}</View>}
            {state.objetivo?.id === "performance" && <View style={styles.subBox}><Text style={styles.subBoxTitle}>Quais esportes você pratica?</Text>{renderChipsComIcone(SUB_ESPORTE, state.subObjetivo, actions.setSubObjetivo)}</View>}
            <TipBox title="Foco é tudo" text="A maioria dos alunos atinge resultados mais rápido quando define um único grande objetivo principal." />
          </View>
        )}

        {state.step === 3 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Como é o seu <Text style={styles.titleHighlight}>histórico</Text> com treinos?</Text>
            <Text style={styles.subTitle}>Seja totalmente sincero. Aqui não há julgamentos, apenas a preparação para o plano adequado.</Text>
            {OPCOES_HISTORICO.map((item) => <OptionCard key={item.id} item={item} isSelected={state.historico?.id === item.id} onPress={() => actions.setHistorico(item)} />)}
            <TipBox title="Sinceridade gera resultados" text="Personais ajustam a carga inicial com base no que você marca aqui para evitar lesões e frustrações." icon="trending-up" />
          </View>
        )}

        {state.step === 4 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Possui alguma <Text style={styles.titleHighlight}>limitação?</Text></Text>
            <Text style={styles.subTitle}>Sua segurança e saúde vêm em primeiro lugar. Profissionais qualificados saberão contornar isso.</Text>
            {OPCOES_LIMITACAO.map((item) => <OptionCard key={item.id} item={item} isSelected={state.limitacao?.id === item.id} onPress={() => { actions.setLimitacao(item); actions.setSubLimitacao([]); actions.setOutraLimitacaoTexto(""); }} />)}
            {state.limitacao?.id === "lesao" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Onde é o foco da sua dor?</Text>
                {renderChipsComIcone(SUB_LESAO, state.subLimitacao, actions.setSubLimitacao)}
                {state.subLimitacao.includes("Outra") && (
                  <View style={[styles.inputBox, { marginTop: verticalScale(15), marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual? Descreva brevemente..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={actions.setOutraLimitacaoTexto} keyboardAppearance="dark" />
                  </View>
                )}
              </View>
            )}
            {state.limitacao?.id === "clinica" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Qual condição o treinador precisa saber?</Text>
                {renderChipsComIcone(SUB_CLINICA, state.subLimitacao, actions.setSubLimitacao)}
                {state.subLimitacao.includes("Outra") && (
                  <View style={[styles.inputBox, { marginTop: verticalScale(15), marginBottom: 0 }]}>
                    <TextInput style={styles.inputPremium} placeholder="Qual condição? Descreva..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={actions.setOutraLimitacaoTexto} keyboardAppearance="dark" />
                  </View>
                )}
              </View>
            )}
            <TipBox title="Segurança em 1º Lugar" text="Não esconda dores ou lesões. Um bom personal vai usar isso para fortalecer seu corpo de forma totalmente segura." icon="shield-checkmark-outline" />
          </View>
        )}

        {state.step === 5 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>O treinador <Text style={styles.titleHighlight}>ideal</Text> pra você é...</Text>
            <Text style={styles.subTitle}>Além do treino, a conexão pessoal e o estilo de ensino fazem toda a diferença na motivação diária.</Text>
            {OPCOES_PERFIL.map((item) => <OptionCard key={item.id} item={item} isSelected={state.perfilPersonal?.id === item.id} onPress={() => actions.setPerfilPersonal(item)} />)}
            <TipBox title="Conexão Perfeita" text="Nós cruzamos o seu perfil com as avaliações que outros alunos deixaram sobre os personais na plataforma." icon="people" />
          </View>
        )}

        {state.step === 6 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Você tem preferência de <Text style={styles.titleHighlight}>gênero?</Text></Text>
            <Text style={styles.subTitle}>Entendemos que o conforto é essencial na hora do acompanhamento presencial ou online.</Text>
            {OPCOES_GENERO_TREINADOR.map((item) => <OptionCard key={item.id} item={item} isSelected={state.generoTreinador?.id === item.id} onPress={() => actions.setGeneroTreinador(item)} />)}
            <TipBox title="Seu Conforto Importa" text="Não existe certo ou errado. Escolha o gênero com o qual você se sente mais à vontade para tirar dúvidas e se comunicar." icon="chatbubbles-outline" />
          </View>
        )}

        {state.step === 7 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Em qual turno você prefere <Text style={styles.titleHighlight}>treinar?</Text></Text>
            <Text style={styles.subTitle}>Isso garante que o aplicativo só mostre profissionais que têm agenda disponível no seu horário.</Text>
            {OPCOES_TURNO.map((item) => <OptionCard key={item.id} item={item} isSelected={state.turnoPreferido?.id === item.id} onPress={() => actions.setTurnoPreferido(item)} />)}
            {state.turnoPreferido && state.turnoPreferido.id !== "Indiferente" && (
              <View style={styles.subBox}>
                <Text style={styles.subBoxTitle}>Possui um horário específico? (Opcional)</Text>
                <Text style={{ color: "#888", fontSize: moderateScale(13), marginBottom: verticalScale(15) }}>Ex: Das 06:00 às 07:00, ou Antes de ir pro trabalho.</Text>
                <View style={[styles.inputBox, state.inputFocado === "horario" && styles.inputBoxFocused]}>
                  <Ionicons name="time-outline" size={moderateScale(20)} color={state.inputFocado === "horario" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput style={styles.inputPremium} placeholder="Seu horário de preferência..." placeholderTextColor="#666" value={state.horarioEspecifico} onChangeText={actions.setHorarioEspecifico} onFocus={() => actions.setInputFocado("horario")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
                </View>
              </View>
            )}
            <TipBox title="Match de Agenda" text="Cruzar o seu horário com o do Personal é o segredo para garantir que ele conseguirá te dar suporte imediato." icon="time-outline" />
          </View>
        )}

        {state.step === 8 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Qual sua <Text style={styles.titleHighlight}>disponibilidade?</Text></Text>
            <Text style={styles.subTitle}>Seja realista com sua agenda. O seu treinador vai periodizar os estímulos com base nessa frequência.</Text>
            {OPCOES_FREQUENCIA.map((item) => <OptionCard key={item.id} item={item} isSelected={state.frequencia?.id === item.id} onPress={() => actions.setFrequencia(item)} />)}
            <TipBox title="Menos é mais?" text="Treinar bem 3 vezes na semana é muito mais eficiente do que tentar ir 6 dias e desistir no primeiro mês." icon="trending-up" />
          </View>
        )}

        {state.step === 9 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Onde você prefere <Text style={styles.titleHighlight}>treinar?</Text></Text>
            <Text style={styles.subTitle}>Isso nos ajuda a encontrar personais que atendem perfeitamente no seu ambiente escolhido.</Text>
            {OPCOES_LOCAL.map((item) => <OptionCard key={item.id} item={item} isSelected={state.localTreino?.id === item.id} onPress={() => actions.setLocalTreino(item)} />)}
            <TipBox title="Treino Inteligente" text="Mesmo em casa ou no condomínio é possível ter resultados incríveis se a estratégia for montada corretamente." icon="location" />
          </View>
        )}

        {state.step === 10 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.mainTitle}>Planejamento de <Text style={styles.titleHighlight}>Investimento</Text></Text>
            <Text style={styles.subTitle}>Nós mostraremos os profissionais que se encaixam na sua faixa de orçamento escolhida para o plano.</Text>
            {OPCOES_INVESTIMENTO.map((item) => <OptionCard key={item.id} item={item} isSelected={state.investimento?.id === item.id} onPress={() => actions.setInvestimento(item)} />)}
            <TipBox title="Segurança Total" text="Todos os personais do aplicativo passam por rigorosa validação de CREF ativo. Você estará sempre em boas mãos." icon="shield-checkmark" />
          </View>
        )}
      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <TouchableOpacity style={[styles.btnAvançar, actions.isAvançarDesabilitado() && { opacity: 0.5 }]} onPress={state.step === 10 ? actions.handleFinalizar : actions.nextStep} disabled={actions.isAvançarDesabilitado()} activeOpacity={0.8}>
          {state.loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <LinearGradient colors={actions.isAvançarDesabilitado() ? ["#333", "#222"] : ["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
              <Text style={[styles.btnAvançarText, actions.isAvançarDesabilitado() && { color: "#888" }]}>{state.step === 10 ? "Finalizar Configuração" : "Avançar Etapa"}</Text>
              {state.step < 10 && <Ionicons name="arrow-forward" size={moderateScale(20)} color={actions.isAvançarDesabilitado() ? "#888" : "#000"} style={{ marginLeft: scale(8) }} />}
            </LinearGradient>
          )}
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-50), width: scale(300), height: scale(300), borderRadius: moderateScale(150), backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 80 },
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-100), width: scale(350), height: scale(350), borderRadius: moderateScale(175), backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 100 },
  headerAbsolute: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnBack: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "900", letterSpacing: 2 },
  progressContainer: { position: "absolute", top: Platform.OS === "ios" ? verticalScale(120) : verticalScale(100), left: 0, right: 0, height: verticalScale(3), backgroundColor: "#1A1A1A", zIndex: 90 },
  progressBar: { height: "100%", backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },
  content: { padding: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(140) : verticalScale(120), paddingBottom: verticalScale(140) },
  fadeContainer: { flex: 1 },
  mainTitle: { color: "#FFF", fontSize: moderateScale(32), fontFamily: theme.fonts.title, marginBottom: verticalScale(12), letterSpacing: -0.5, lineHeight: moderateScale(38) },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#AAA", fontSize: moderateScale(15), lineHeight: moderateScale(24), marginBottom: verticalScale(35) },
  photoSection: { alignItems: "center", marginBottom: verticalScale(35) },
  avatarContainer: { position: "relative", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  avatarPlaceholder: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), backgroundColor: "#121212", borderWidth: 2, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: verticalScale(-5), right: scale(-5), backgroundColor: theme.colors.primary, width: scale(38), height: scale(38), borderRadius: moderateScale(19), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000" },
  inputGroup: { marginBottom: verticalScale(20) },
  row: { flexDirection: "row" },
  inputLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(10), marginLeft: scale(5), letterSpacing: 0.5 },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(18), borderWidth: 1, borderColor: "#222", paddingHorizontal: scale(16), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255,107,0,0.05)" },
  inputIcon: { marginRight: scale(12) },
  inputPremium: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent", outlineStyle: "none" },
  suffix: { color: "#666", fontWeight: "bold", fontSize: moderateScale(16), marginLeft: scale(8) },
  btnGpsPremium: { backgroundColor: "rgba(255,107,0,0.15)", paddingHorizontal: scale(14), paddingVertical: verticalScale(8), borderRadius: moderateScale(10), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", marginLeft: scale(10) },
  btnGpsText: { color: theme.colors.primary, fontWeight: "900", fontSize: moderateScale(12), letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: "#222", marginVertical: verticalScale(25) },
  subBox: { backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20), marginTop: verticalScale(4), marginBottom: verticalScale(24), borderWidth: 1, borderColor: "#222" },
  subBoxTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(16) },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(10) },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", paddingVertical: verticalScale(12), paddingHorizontal: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#333" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 5 },
  chipTexto: { color: "#888", fontSize: moderateScale(13), fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },
  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: scale(24), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  btnAvançar: { borderRadius: moderateScale(20), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: "row", height: verticalScale(64), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  btnAvançarText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  targetWeightBox: { flexDirection: "row", backgroundColor: "rgba(255, 107, 0, 0.08)", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", alignItems: "center", marginTop: verticalScale(10) },
  targetIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.2)", justifyContent: "center", alignItems: "center", marginRight: scale(16) },
  targetTitle: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "bold", marginBottom: verticalScale(4) },
  targetInputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.primary, paddingBottom: verticalScale(4) },
  targetInput: { flex: 1, color: "#FFF", fontSize: moderateScale(20), fontWeight: "900", backgroundColor: "transparent" },
  targetSuffix: { color: theme.colors.primary, fontWeight: "bold", fontSize: moderateScale(16) },
});