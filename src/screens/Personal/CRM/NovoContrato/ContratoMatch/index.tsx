import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Platform, KeyboardAvoidingView, ActivityIndicator, Modal } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../../../../theme/theme"; 
import { moderateScale } from "../../../../../utils/responsive"; 
import { useCriarContratoMatch } from "./useContratoMatch";

import { styles, frequenciaList } from "../AdicionarAluno/styles"; 

export function ContratoMatch({ route, navigation }: any) {
  const { state, actions } = useCriarContratoMatch(route, navigation);
  
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.glowTop} />
      
      <BlurView intensity={80} tint="dark" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close" size={moderateScale(20)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proposta Comercial</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContent}>
            
            <View style={styles.heroSection}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="handshake" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Firmar <Text style={styles.titleHighlight}>Contrato.</Text></Text>
              <Text style={styles.subtitle}>Defina as condições comerciais para o aluno {state.nomeAluno}. Ele será notificado no app para aceitar e iniciar os treinos.</Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#00E676", shadowColor: "#00E676" }]} />
              <Text style={styles.sectionTitle}>Valores e Cobrança</Text>
            </View>
            
            <View style={styles.financeBox}>
              <View style={styles.financeHero}>
                <Text style={styles.financeLabelCenter}>Valor do Acompanhamento</Text>
                <View style={styles.financeInputRow}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput style={styles.hugeInput} placeholder="0,00" placeholderTextColor="#333" keyboardType="numeric" value={state.mensalidade} onChangeText={actions.handleMoneyChange} cursorColor="#00E676" keyboardAppearance="dark" />
                </View>
              </View>

              <Text style={styles.pillLabel}>Ciclo de Cobrança</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                {frequenciaList.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.pill, state.frequencia === item.id && styles.pillActive]} onPress={() => actions.setFrequencia(item.id)}>
                    <Text style={[styles.pillText, state.frequencia === item.id && styles.pillTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.pillLabel, { marginTop: 10 }]}>Vencimento Base</Text>
              <View style={styles.chipsContainerWrap}>
                {["05", "10", "20"].map((item) => (
                  <TouchableOpacity key={item} style={[styles.vencimentoChip, state.vencimento === item && styles.pillActive]} onPress={() => actions.handleVencimentoSelect(item)} activeOpacity={0.7}>
                    <Text style={[styles.pillText, state.vencimento === item && styles.pillTextActive]}>Dia {item}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.vencimentoChip, state.vencimento === "Outro" && styles.pillActive]} onPress={() => actions.handleVencimentoSelect("Outro")} activeOpacity={0.7}>
                  <Text style={[styles.pillText, state.vencimento === "Outro" && styles.pillTextActive]}>Personalizar</Text>
                </TouchableOpacity>
              </View>

              {state.vencimento === "Outro" && (
                <View style={[styles.inputWrapper, { marginTop: 15, backgroundColor: "rgba(0,0,0,0.4)", borderColor: "rgba(0, 230, 118, 0.3)" }]}>
                  <Ionicons name="calendar" size={moderateScale(18)} color="#00E676" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Digite o dia (1 a 31)" placeholderTextColor="#555" keyboardType="numeric" maxLength={2} value={state.vencimentoOutro} onChangeText={actions.setVencimentoOutro} cursorColor="#00E676" keyboardAppearance="dark" />
                </View>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} />
              <Text style={styles.sectionTitle}>Direitos e Responsabilidades</Text>
            </View>

            <View style={styles.editorHeader}>
              <Text style={styles.editorHeaderDesc}>Descreva o que está incluso no serviço e as regras de cancelamento/pausa.</Text>
              <TouchableOpacity style={styles.btnImportar} onPress={() => actions.setModalUploadVisivel(true)} activeOpacity={0.7}>
                <Ionicons name="cloud-upload" size={14} color={theme.colors.primary} />
                <Text style={styles.btnImportarText}>Importar</Text>
              </TouchableOpacity>
            </View>

            {state.isProcessandoTexto ? (
              <View style={styles.iaProcessingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.iaProcessingTitle}>Analisando regras...</Text>
                <Text style={styles.iaProcessingStatus}>{state.statusProcessamento}</Text>
              </View>
            ) : (
              <View style={[styles.editorContainer, state.inputFocado === "obs" && styles.editorContainerFocused]}>
                <TextInput style={styles.editorInput} placeholder="Escreva os termos aqui ou anexe um documento..." placeholderTextColor="#444" multiline value={state.observacoes} onChangeText={actions.setObservacoes} onFocus={() => actions.setInputFocado("obs")} onBlur={() => actions.setInputFocado(null)} cursorColor={theme.colors.primary} keyboardAppearance="dark" />
              </View>
            )}

            {!state.isProcessandoTexto && (
              <TouchableOpacity style={styles.btnMagicIA} onPress={actions.handleMelhorarTextoManual}>
                <FontAwesome5 name="magic" size={14} color={theme.colors.primary} />
                <Text style={styles.btnMagicIAText}>Formatar Legalmente com I.A.</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btnFinalizar, state.loading && { opacity: 0.7 }]} onPress={actions.handleEnviarProposta} disabled={state.loading}>
              {state.loading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : (
                <>
                  <Ionicons name="paper-plane" size={20} color={theme.colors.primary} />
                  <Text style={styles.btnFinalizarText}>Enviar Proposta</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={state.modalUploadVisivel} transparent animationType="slide" onRequestClose={() => actions.setModalUploadVisivel(false)}>
        <View style={styles.modalUploadOverlay}>
          <TouchableOpacity style={{flex: 1}} onPress={() => actions.setModalUploadVisivel(false)} activeOpacity={1} />
          <View style={styles.modalUploadSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Importar Documento</Text>
            <Text style={styles.sheetSubtitle}>Como deseja subir o seu contrato base?</Text>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handlePickDocument} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderColor: 'rgba(255, 107, 0, 0.3)' }]}><Ionicons name="document-text" size={24} color={theme.colors.primary} /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Arquivo Digital (PDF)</Text><Text style={styles.uploadOptionDesc}>Ficará anexado para o aluno assinar.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handlePickImage} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderColor: 'rgba(255, 107, 0, 0.3)' }]}><Ionicons name="images" size={24} color={theme.colors.primary} /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Print da Galeria (Leitura IA)</Text><Text style={styles.uploadOptionDesc}>A IA extrai o texto do print direto pro editor.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handleTakePicture} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 107, 0, 0.1)', borderColor: 'rgba(255, 107, 0, 0.3)' }]}><Ionicons name="camera" size={24} color={theme.colors.primary} /></View>
              <View style={styles.uploadOptionTexts}><Text style={styles.uploadOptionTitle}>Câmera (Leitura IA)</Text><Text style={styles.uploadOptionDesc}>Tire uma foto do papel e a IA lê o texto.</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => actions.setModalUploadVisivel(false)} activeOpacity={0.7}>
               <Text style={styles.sheetBtnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}