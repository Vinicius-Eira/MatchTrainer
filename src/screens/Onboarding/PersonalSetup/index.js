import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";
import { usePersonalSetup } from "./usePersonalSetup";

import {
  OPCOES_GENERO_PERSONAL, OPCOES_TURNO, OPCOES_AGENDA, OPCOES_SERVICOS,
  OPCOES_OBJETIVO, OPCOES_LIMITACAO, OPCOES_PERFIL, OPCOES_LOCAL,
  SUB_SAUDE, SUB_ESPORTE, SUB_LESAO, SUB_CLINICA, OPCOES_PUBLICO, OPCOES_EXPERIENCIA
} from "../../../constants/onboardingData";

export default function PersonalSetup({ navigation }) {
  const { state, actions } = usePersonalSetup(navigation);

  const renderNeonChips = (opcoes, stateArray, setStateArray, isSingle = false) => (
    <View style={styles.chipsContainerCenter}>
      {opcoes.map((opcao) => {
        const ativo = isSingle ? stateArray === opcao : stateArray.includes(opcao);
        return (
          <TouchableOpacity
            key={opcao}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => isSingle ? setStateArray(opcao) : actions.toggleArrayItem(opcao, stateArray, setStateArray)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderNeonGrid = (opcoes, stateArray, setStateArray, isSingle = false) => (
    <View style={styles.gridContainer}>
      {opcoes.map((opt) => {
        const ativo = isSingle ? stateArray === opt.id : stateArray.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.gridItemWithIcon, ativo && styles.gridItemAtivo]}
            onPress={() => isSingle ? setStateArray(opt.id) : actions.toggleArrayItem(opt.id, stateArray, setStateArray)}
            activeOpacity={0.8}
          >
            {ativo && (
              <LinearGradient
                colors={["rgba(255, 107, 0, 0.1)", "transparent"]}
                style={StyleSheet.absoluteFill}
                borderRadius={moderateScale(20)}
              />
            )}
            <Ionicons name={opt.icon} size={moderateScale(28)} color={ativo ? theme.colors.primary : "#666"} style={{ marginBottom: moderateScale(8) }} />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
            {opt.desc && <Text style={[styles.gridItemDesc, ativo && { color: "#AAA" }]}>{opt.desc}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (state.loadingDados)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.navigate("PersonalDashboard")} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={moderateScale(24)} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{state.isEditing ? "EDITAR PERFIL" : "CONFIGURAR PERFIL"}</Text>
        <View style={{ width: scale(44) }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.mainTitle, { textAlign: "center" }]}>
            Personalize sua <Text style={styles.titleHighlight}>Vitrine.</Text>
            </Text>
          <Text style={[styles.subTitle, { textAlign: "center" }]}>Estes dados alimentam a IA do app para conectar você aos alunos ideais.</Text>
        </View>

        <View style={styles.photoSection}>
          <TouchableOpacity onPress={actions.selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
            {state.fotoUri ? (
              <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={moderateScale(50)} color="#444" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={moderateScale(16)} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconWrapper}><Ionicons name="id-card" size={moderateScale(18)} color={theme.colors.primary} /></View>
            <Text style={styles.cardHeaderTitle}>Identificação Profissional</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Nome Público *</Text>
            <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrapper}><Ionicons name="person" size={moderateScale(16)} color={theme.colors.primary} /></View>
              <TextInput style={styles.inputPremium} placeholder="Ex: Personal João Silva" placeholderTextColor="#666" value={state.nome} onChangeText={(t) => actions.setNome(actions.formatarNome(t))} onFocus={() => actions.setInputFocado("nome")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Seu Gênero *</Text>
          <View style={{ marginBottom: verticalScale(20) }}>
            {renderNeonGrid(OPCOES_GENERO_PERSONAL, state.genero, actions.setGenero, true)}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>CREF Profissional *</Text>
            <View style={[styles.inputBox, { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" }, state.inputFocado === "cref" && styles.inputBoxFocused]}>
              <View style={[styles.inputIconWrapper, { backgroundColor: theme.colors.primary }]}><MaterialCommunityIcons name="card-account-details" size={moderateScale(16)} color="#000" /></View>
              <TextInput style={[styles.inputPremium, { color: theme.colors.primary, fontWeight: "bold" }]} placeholder="000000-G/SP" placeholderTextColor="rgba(255, 107, 0, 0.4)" value={state.cref} onChangeText={(t) => actions.setCref(t.toUpperCase())} onFocus={() => actions.setInputFocado("cref")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              <Ionicons name="checkmark-circle" size={moderateScale(18)} color={theme.colors.primary} />
            </View>
            <Text style={{ color: "#666", fontSize: moderateScale(11), marginTop: moderateScale(6), marginLeft: moderateScale(4) }}>Registro obrigatório para validação do perfil na plataforma.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>WhatsApp para Contato *</Text>
            <View style={[styles.inputBox, state.inputFocado === "wpp" && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrapper}><MaterialCommunityIcons name="whatsapp" size={moderateScale(16)} color={theme.colors.primary} /></View>
              <TextInput style={styles.inputPremium} placeholder="(00) 00000-0000" placeholderTextColor="#666" keyboardType="phone-pad" value={state.telefone} onChangeText={actions.formatarWhatsApp} onFocus={() => actions.setInputFocado("wpp")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Biografia Profissional</Text>
            <View style={[styles.inputBoxArea, state.inputFocado === "bio" && styles.inputBoxFocused]}>
              <TextInput style={styles.textAreaPremium} placeholder="Descreva sua metodologia, especialidades e conquistas de forma atrativa..." placeholderTextColor="#666" multiline maxLength={400} value={state.bio} onChangeText={actions.setBio} textAlignVertical="top" onFocus={() => actions.setInputFocado("bio")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
        </View>

        <View style={styles.gridContainer}>
          {OPCOES_SERVICOS.map((opt) => {
            const ativo = state.servicosOferecidos.includes(opt.id);
            return (
              <TouchableOpacity key={opt.id} style={[styles.gridItemWithIcon, ativo && styles.gridItemAtivo]} onPress={() => actions.handleToggleServicos(opt.id)} activeOpacity={0.8}>
                {ativo && <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "transparent"]} style={StyleSheet.absoluteFill} borderRadius={moderateScale(20)} />}
                <Ionicons name={opt.icon} size={moderateScale(28)} color={ativo ? theme.colors.primary : "#666"} style={{ marginBottom: moderateScale(8) }} />
                <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
                {opt.desc && <Text style={[styles.gridItemDesc, ativo && { color: "#AAA" }]}>{opt.desc}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {state.servicosOferecidos.includes("Consultoria") && (
          <View style={styles.priceContainer}>
            <Text style={styles.inputLabel}>Preço Médio - Consultoria Mensal</Text>
            <View style={styles.priceEditableContainer}>
              <Text style={styles.pricePrefix}>R$ </Text>
              <TextInput style={styles.priceInput} keyboardType="numeric" value={String(state.precoConsultoria)} onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoConsultoria)} maxLength={4} keyboardAppearance="dark" />
            </View>
            <Slider style={styles.slider} minimumValue={50} maximumValue={600} step={10} minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" thumbTintColor={theme.colors.primary} value={state.precoConsultoria > 600 ? 600 : state.precoConsultoria} onValueChange={actions.setPrecoConsultoria} />
          </View>
        )}

        {state.servicosOferecidos.includes("Presencial") && (
          <View style={styles.priceContainer}>
            <Text style={styles.inputLabel}>Preço Médio - Presencial (Aula/Mês)</Text>
            <View style={styles.priceEditableContainer}>
              <Text style={styles.pricePrefix}>R$ </Text>
              <TextInput style={styles.priceInput} keyboardType="numeric" value={String(state.precoPresencial)} onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoPresencial)} maxLength={4} keyboardAppearance="dark" />
            </View>
            <Slider style={styles.slider} minimumValue={50} maximumValue={1500} step={10} minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor="#333" thumbTintColor={theme.colors.primary} value={state.precoPresencial > 1500 ? 1500 : state.precoPresencial} onValueChange={actions.setPrecoPresencial} />
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: verticalScale(25) }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Área de Atendimento</Text>
        </View>

        <TouchableOpacity style={styles.btnGpsRadar} onPress={actions.obterLocalizacaoAtual} disabled={state.buscandoLocalizacao} activeOpacity={0.85}>
          {state.buscandoLocalizacao ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <><MaterialCommunityIcons name="radar" size={moderateScale(20)} color="#000" /><Text style={styles.btnGpsRadarText}>Sincronizar Radar GPS</Text></>
          )}
        </TouchableOpacity>

        {state.cidade || state.bairro ? (
          <View style={styles.locationResultBox}>
            <Ionicons name="location" size={moderateScale(18)} color="#00E676" />
            <Text style={styles.locationResultText}>{state.cidade}{state.bairro ? `, ${state.bairro}` : ""}</Text>
          </View>
        ) : null}

        <View style={[styles.sectionHeader, { marginTop: verticalScale(35) }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Sua Agenda e Turnos</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Turnos Disponíveis (Match)</Text>
          <Text style={{ color: "#888", fontSize: moderateScale(13), marginBottom: verticalScale(15) }}>Em quais períodos você tem disponibilidade para encaixar novos alunos?</Text>
          {renderNeonGrid(OPCOES_TURNO, state.turnos, actions.setTurnos)}

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(35) }]}>Status da sua Agenda</Text>
          <Text style={{ color: "#888", fontSize: moderateScale(13), marginBottom: verticalScale(15) }}>Isso gera um gatilho de urgência para o aluno fechar o contrato mais rápido.</Text>
          {renderNeonGrid(OPCOES_AGENDA, state.statusAgenda, actions.setStatusAgenda, true)}
        </View>

        <View style={[styles.sectionHeader, { marginTop: verticalScale(35) }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Motor de Match (A IA)</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Focos Principais de Treino</Text>
          {renderNeonGrid(OPCOES_OBJETIVO, state.objetivosAtendidos, actions.setObjetivosAtendidos)}

          {state.objetivosAtendidos.includes("outro") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite sua especialidade..." placeholderTextColor="#666" value={state.outroObjetivoTexto} onChangeText={actions.setOutroObjetivoTexto} keyboardAppearance="dark" />
          )}
          {state.objetivosAtendidos.includes("saude") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Público de Saúde:</Text>{renderNeonChips(SUB_SAUDE, state.subsAtendidos, actions.setSubsAtendidos)}</View>
          )}
          {state.objetivosAtendidos.includes("performance") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Prepara para:</Text>{renderNeonChips(SUB_ESPORTE, state.subsAtendidos, actions.setSubsAtendidos)}</View>
          )}

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(35) }]}>Atende Restrições?</Text>
          {renderNeonGrid(OPCOES_LIMITACAO, state.limitacoesAtendidas, actions.setLimitacoesAtendidas)}

          {state.limitacoesAtendidas.includes("outra") && (
            <TextInput style={styles.inputPremiumSmall} placeholder="Digite a necessidade..." placeholderTextColor="#666" value={state.outraLimitacaoTexto} onChangeText={actions.setOutraLimitacaoTexto} keyboardAppearance="dark" />
          )}
          {state.limitacoesAtendidas.includes("lesao") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Reabilitação focada em:</Text>{renderNeonChips(SUB_LESAO, state.subsAtendidos, actions.setSubsAtendidos)}</View>
          )}
          {state.limitacoesAtendidas.includes("clinica") && (
            <View style={styles.subBox}><Text style={styles.subBoxTitle}>Controle de:</Text>{renderNeonChips(SUB_CLINICA, state.subsAtendidos, actions.setSubsAtendidos)}</View>
          )}

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(35) }]}>Onde realiza os treinos?</Text>
          {renderNeonGrid(OPCOES_LOCAL, state.locaisAtendidos, actions.setLocaisAtendidos)}
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Seu Estilo de Aula</Text>
          {renderNeonGrid(OPCOES_PERFIL, state.perfilTreinador, actions.setPerfilTreinador, true)}
        </View>

        <View style={[styles.sectionHeader, { marginTop: verticalScale(15) }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Estratégia e Autoridade</Text>
        </View>

        <View style={styles.cardGeral}>
          <Text style={styles.cardHeaderTitleSub}>Tempo de Experiência</Text>
          {renderNeonChips(OPCOES_EXPERIENCIA, state.experiencia, actions.setExperiencia, true)}

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(30) }]}>Público que mais atende</Text>
          {renderNeonChips(OPCOES_PUBLICO, state.publicoAtendido, actions.setPublicoAtendido)}

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(35) }]}>Diferenciais Competitivos</Text>
          <View style={[styles.inputBoxArea, state.inputFocado === "diferenciais" && styles.inputBoxFocused]}>
            <TextInput style={styles.textAreaPremium} placeholder="Ex: Avaliação postural inclusa..." placeholderTextColor="#666" multiline maxLength={300} value={state.diferenciais} onChangeText={actions.setDiferenciais} textAlignVertical="top" onFocus={() => actions.setInputFocado("diferenciais")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
          </View>

          <Text style={[styles.cardHeaderTitleSub, { marginTop: verticalScale(35) }]}>Resultados (Antes e Depois)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galeriaScroll}>
            {state.galeria.map((uri, index) => (
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
          <Text style={styles.galeriaHint}>Anexe até 5 fotos para gerar confiança imediata.</Text>
        </View>

        <View style={[styles.sectionHeader, { marginTop: verticalScale(15) }]}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionTitle}>Redes Sociais</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Instagram (Sem o @)</Text>
          <View style={[styles.inputBox, state.inputFocado === "insta" && styles.inputBoxFocused]}>
            <View style={styles.inputIconWrapper}><Ionicons name="logo-instagram" size={moderateScale(16)} color={theme.colors.primary} /></View>
            <TextInput style={styles.inputPremium} placeholder="seu_usuario" placeholderTextColor="#666" autoCapitalize="none" value={state.instagram} onChangeText={actions.setInstagram} onFocus={() => actions.setInputFocado("insta")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>TikTok (Sem o @)</Text>
          <View style={[styles.inputBox, state.inputFocado === "tiktok" && styles.inputBoxFocused]}>
            <View style={styles.inputIconWrapper}><FontAwesome5 name="tiktok" size={moderateScale(14)} color={theme.colors.primary} /></View>
            <TextInput style={styles.inputPremium} placeholder="seu_usuario" placeholderTextColor="#666" autoCapitalize="none" value={state.tiktok} onChangeText={actions.setTiktok} onFocus={() => actions.setInputFocado("tiktok")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
          </View>
        </View>
      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <TouchableOpacity style={styles.btnSalvarWrapper} onPress={actions.handleSalvar} disabled={state.loading} activeOpacity={0.8}>
          <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnSalvar}>
            {state.loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <><Ionicons name="checkmark-done" size={moderateScale(22)} color="#000" style={{ marginRight: scale(8) }} /><Text style={styles.btnSalvarText}>SALVAR PERFIL</Text></>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", position: "relative" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-50), width: scale(250), height: scale(250), borderRadius: moderateScale(125), backgroundColor: theme.colors.primary, opacity: 0.15, blurRadius: 60 },
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-100), width: scale(300), height: scale(300), borderRadius: moderateScale(150), backgroundColor: theme.colors.primary, opacity: 0.1, blurRadius: 80 },
  headerAbsolute: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  content: { padding: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(130) : verticalScale(110), paddingBottom: verticalScale(140) },
  headerTextContainer: { marginBottom: verticalScale(30) },
  mainTitle: { color: "#FFF", fontSize: moderateScale(32), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5 },
  titleHighlight: { color: theme.colors.primary },
  subTitle: { color: "#AAA", fontSize: moderateScale(15), lineHeight: moderateScale(24) },
  photoSection: { alignItems: "center", marginBottom: verticalScale(35) },
  avatarContainer: { position: "relative", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  avatarPlaceholder: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), backgroundColor: "#121212", borderWidth: 2, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },
  avatarImage: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), borderWidth: 2, borderColor: theme.colors.primary },
  cameraBadge: { position: "absolute", bottom: verticalScale(-5), right: scale(-5), backgroundColor: theme.colors.primary, width: scale(38), height: scale(38), borderRadius: moderateScale(19), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(15) },
  sectionAccent: { width: scale(4), height: verticalScale(18), backgroundColor: theme.colors.primary, borderRadius: moderateScale(2), marginRight: scale(8) },
  sectionTitle: { color: "#FFF", fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  formGroup: { marginBottom: verticalScale(20) },
  inputLabel: { color: "#888", fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(10), marginLeft: scale(5), letterSpacing: 0.5 },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(18), borderWidth: 1, borderColor: "#222", paddingHorizontal: scale(12), height: verticalScale(60) },
  inputBoxArea: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(18), borderWidth: 1, borderColor: "#222", paddingHorizontal: scale(16) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIconWrapper: { width: scale(38), height: scale(38), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  inputPremium: { flex: 1, color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent", outlineStyle: "none" },
  textAreaPremium: { minHeight: verticalScale(120), paddingTop: verticalScale(16), paddingBottom: verticalScale(16), color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, outlineStyle: "none" },
  btnGpsRadar: { flexDirection: "row", backgroundColor: theme.colors.primary, height: verticalScale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center", marginBottom: verticalScale(15), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnGpsRadarText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", marginLeft: scale(8), letterSpacing: 0.5, textTransform: "uppercase" },
  locationResultBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.1)", padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },
  locationResultText: { color: "#00E676", fontSize: moderateScale(15), fontWeight: "bold", marginLeft: scale(8) },
  cardGeral: { backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#222", borderRadius: moderateScale(24), padding: scale(20), marginBottom: verticalScale(25) },
  cardHeaderBox: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  iconWrapper: { width: scale(36), height: scale(36), borderRadius: moderateScale(10), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  cardHeaderTitleSub: { color: "#FFF", fontSize: moderateScale(14), fontWeight: "900", marginBottom: verticalScale(16), textTransform: "uppercase", letterSpacing: 0.5 },
  chipsContainerCenter: { flexDirection: "row", flexWrap: "wrap", gap: scale(10) },
  chip: { backgroundColor: "#121212", paddingVertical: verticalScale(12), paddingHorizontal: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#333" },
  chipAtivo: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary },
  chipTexto: { color: "#888", fontSize: moderateScale(13), fontWeight: "700" },
  chipTextoAtivo: { color: theme.colors.primary, fontWeight: "900" },
  subBox: { backgroundColor: "#111", width: "100%", padding: scale(20), borderRadius: moderateScale(20), marginTop: verticalScale(15), borderWidth: 1, borderColor: "#222" },
  subBoxTitle: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "bold", marginBottom: verticalScale(15), textTransform: "uppercase" },
  inputPremiumSmall: { backgroundColor: "#121212", borderRadius: moderateScale(16), color: "#FFF", fontSize: moderateScale(15), padding: scale(16), borderWidth: 1, borderColor: "#333", width: "100%", marginTop: verticalScale(15), marginBottom: verticalScale(5), outlineStyle: "none" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItemWithIcon: { width: "48%", backgroundColor: "#121212", paddingVertical: verticalScale(20), paddingHorizontal: scale(14), borderRadius: moderateScale(20), alignItems: "center", borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden", marginBottom: verticalScale(12) },
  gridItemAtivo: { borderColor: theme.colors.primary },
  gridItemText: { color: "#888", fontSize: moderateScale(14), fontWeight: "bold", marginBottom: verticalScale(4), textAlign: "center" },
  gridItemTextAtivo: { color: "#FFF", fontWeight: "900" },
  gridItemDesc: { color: "#666", fontSize: moderateScale(11), textAlign: "center", marginTop: verticalScale(4) },
  priceContainer: { backgroundColor: "#111", borderRadius: moderateScale(20), padding: scale(20), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", marginTop: verticalScale(15), alignItems: "center" },
  slider: { width: "100%", height: verticalScale(40) },
  priceEditableContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(10) },
  pricePrefix: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(36), letterSpacing: -1 },
  priceInput: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(36), letterSpacing: -1, minWidth: scale(70), textAlign: "left", outlineStyle: "none" },
  galeriaScroll: { paddingVertical: verticalScale(10) },
  galeriaItem: { width: scale(110), height: scale(110), borderRadius: moderateScale(18), overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "#333", marginRight: scale(12) },
  galeriaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  btnRemoverFoto: { position: "absolute", top: verticalScale(6), right: scale(6), backgroundColor: "rgba(0,0,0,0.7)", borderRadius: moderateScale(14), padding: scale(5) },
  btnAddFoto: { width: scale(110), height: scale(110), borderRadius: moderateScale(18), borderWidth: 2, borderColor: "rgba(255,107,0,0.3)", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,107,0,0.05)" },
  btnAddFotoText: { color: theme.colors.primary, fontSize: moderateScale(12), marginTop: verticalScale(8), fontWeight: "bold" },
  galeriaHint: { color: "#666", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center" },
  footerBlur: { position: "absolute", bottom: 0, left: 0, right: 0, padding: scale(24), paddingTop: verticalScale(15), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  btnSalvarWrapper: { borderRadius: moderateScale(20), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  btnSalvar: { flexDirection: "row", justifyContent: "center", alignItems: "center", height: verticalScale(64), borderRadius: moderateScale(20) },
  btnSalvarText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", letterSpacing: 0.5 },
});