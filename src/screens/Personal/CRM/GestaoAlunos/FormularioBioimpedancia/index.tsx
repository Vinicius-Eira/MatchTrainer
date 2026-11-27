import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { NivelConfiancaCampo } from "../../../../../domain/avaliacaoFisica/types";
import { theme } from "../../../../../theme/theme";
import { BioModals } from "./components/Modal";
import { styles } from "./styles";
import { useBioimpedancia } from "./useBioimpedancia";

const getBadgeConfianca = (nivel?: NivelConfiancaCampo) => {
  if (!nivel || nivel === "ausente") return null;
  if (nivel === "alta") {
    return { label: "IA", cor: "#00E676", bg: "rgba(0,230,118,0.12)", border: "rgba(0,230,118,0.4)" };
  }
  return { label: "Revisar", cor: "#FFD700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.42)" };
};

const InputBio = ({
  label,
  valor,
  onChangeText,
  placeholder,
  unidade,
  flex = 1,
  keyboardType = "decimal-pad",
  confianca,
  maxLength,
}: any) => {
  const [focado, setFocado] = useState(false);
  const badge = getBadgeConfianca(confianca);

  return (
    <View style={[styles.inputGroup, { flex }]}>
      <View style={styles.inputLabelRow}>
        <Text style={[styles.inputLabel, focado && styles.inputLabelFocused]} numberOfLines={1}>
          {label}
        </Text>
        {badge ? (
          <View style={[styles.confPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.confPillText, { color: badge.cor }]}>{badge.label}</Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.inputBox, focado && styles.inputBoxFocused]}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor="#4B4B58"
          keyboardType={keyboardType}
          keyboardAppearance="dark"
          cursorColor={theme.colors.primary}
          value={valor}
          onChangeText={onChangeText}
          maxLength={maxLength}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
        />
        {unidade ? <Text style={[styles.inputUnit, focado && styles.inputUnitFocused]}>{unidade}</Text> : null}
      </View>
    </View>
  );
};

const SessaoCard = ({ titulo, icone, children }: any) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons name={icone} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{titulo}</Text>
    </View>
    {children}
  </View>
);

export function Bioimpedancia({ route, navigation }: any) {
  const v = useBioimpedancia(route, navigation);
  const conf = v.revisaoIA.ativa ? v.revisaoIA.confiancaCampos : {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.btnClose} onPress={v.cancelar} activeOpacity={0.75}>
          <Ionicons name="close" size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerKicker}>BIOIMPEDÂNCIA</Text>
          <Text style={styles.headerTitle}>Avaliação Física</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
=          <View style={styles.iaHeroCard}>
            <View style={styles.iaHeroTop}>
              <View style={styles.iaHeroIconBox}>
                <MaterialCommunityIcons name="file-document-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.iaHeroKicker}>PREENCHIMENTO AUTOMÁTICO</Text>
                <Text style={styles.iaHeroTitle}>Importar Laudo com IA</Text>
              </View>
            </View>
            <Text style={styles.iaHeroDesc}>
              Envie o PDF ou uma foto do exame (InBody, Tanita, Omron e outros). A IA extrai os indicadores e você
              confere tudo antes de salvar.
            </Text>
            <TouchableOpacity
              style={styles.btnImportarIA}
              onPress={() => v.setModalOrigemVisivel(true)}
              disabled={v.analisandoIA || v.loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnImportarIAText}>
                {v.revisaoIA.ativa ? "Trocar Documento / Reanalisar" : "Importar PDF ou Foto"}
              </Text>
            </TouchableOpacity>
          </View>

=          {v.revisaoIA.ativa ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewTopRow}>
                <View style={styles.reviewBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#00E676" />
                  <Text style={styles.reviewBadgeText}>
                    IA • {v.revisaoIA.confiancaGeral}% CONFIANÇA
                  </Text>
                </View>
                {v.revisaoIA.fabricante ? (
                  <Text style={styles.reviewMetaText}>{v.revisaoIA.fabricante}</Text>
                ) : null}
              </View>

              <Text style={styles.reviewHelper}>
                Revise os valores preenchidos abaixo antes de confirmar. Campos em branco não foram identificados no
                laudo e nunca são estimados automaticamente.
              </Text>

              {v.revisaoIA.avisos.length > 0 ? (
                <View style={styles.reviewWarningBox}>
                  {v.revisaoIA.avisos.map((aviso, i) => (
                    <Text key={i} style={styles.reviewWarningText}>
                      • {aviso}
                    </Text>
                  ))}
                </View>
              ) : null}

              <View style={styles.reviewActionsRow}>
                <TouchableOpacity style={styles.btnReviewSecondary} onPress={v.abrirDocumentoOriginal} activeOpacity={0.8}>
                  <Ionicons name="eye-outline" size={15} color="#E4E4E7" />
                  <Text style={styles.btnReviewSecondaryText}>Ver Original</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnReviewSecondary} onPress={v.limparRevisaoIA} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={15} color="#FF6B00" />
                  <Text style={[styles.btnReviewSecondaryText, { color: "#FF6B00" }]}>Desvincular Arquivo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <SessaoCard titulo="Data & Composição Corporal" icone="pie-chart">
            <View style={styles.rowInputs}>
              <InputBio
                label="DATA DO EXAME *"
                placeholder="DD/MM/AAAA"
                keyboardType="number-pad"
                maxLength={10}
                valor={v.dataAvaliacao}
                onChangeText={v.setDataAvaliacao}
              />
              <InputBio
                label="PESO TOTAL *"
                placeholder="0,0"
                unidade="kg"
                valor={v.peso}
                onChangeText={v.setPeso}
                confianca={conf.peso}
              />
            </View>

            <View style={styles.rowInputs}>
              <InputBio
                label="GORDURA *"
                placeholder="0,0"
                unidade="%"
                valor={v.gorduraPercentual}
                onChangeText={v.setGorduraPercentual}
                confianca={conf.percentual_gordura}
              />
              <InputBio
                label="MASSA GORDURA"
                placeholder="0,0"
                unidade="kg"
                valor={v.massaGordura}
                onChangeText={v.setMassaGordura}
                confianca={conf.massa_de_gordura}
              />
            </View>

            <View style={styles.rowInputs}>
              <InputBio
                label="MASSA MUSCULAR (MME)"
                placeholder="0,0"
                unidade="kg"
                valor={v.massaMuscular}
                onChangeText={v.setMassaMuscular}
                confianca={conf.massa_muscular_esqueletica}
              />
              <InputBio
                label="MASSA MAGRA (MLG)"
                placeholder="0,0"
                unidade="kg"
                valor={v.massaMagra}
                onChangeText={v.setMassaMagra}
                confianca={conf.massa_magra}
              />
            </View>

            <View style={[styles.rowInputs, { marginBottom: -14 }]}>
              <InputBio
                label="ÁGUA CORPORAL"
                placeholder="0,0"
                unidade="L"
                valor={v.aguaCorporal}
                onChangeText={v.setAguaCorporal}
                confianca={conf.agua_corporal}
              />
              <InputBio
                label="GORDURA VISCERAL"
                placeholder="0"
                unidade="lvl"
                valor={v.visceral}
                onChangeText={v.setVisceral}
                confianca={conf.gordura_visceral}
              />
            </View>
          </SessaoCard>

          <SessaoCard titulo="Metabolismo" icone="flame">
            <View style={[styles.rowInputs, { marginBottom: -14 }]}>
              <InputBio
                label="TAXA METABÓLICA BASAL (TMB)"
                placeholder="Ex: 1634"
                unidade="kcal"
                valor={v.tmb}
                onChangeText={v.setTmb}
                confianca={conf.taxa_metabolica_basal}
              />
            </View>
          </SessaoCard>

          <SessaoCard titulo="Análise Segmentar: Gordura" icone="body">
            <View style={styles.rowInputs}>
              <InputBio
                label="BRAÇO ESQ."
                placeholder="0,0"
                unidade="kg"
                valor={v.gordBracoEsq}
                onChangeText={v.setGordBracoEsq}
                confianca={conf.segmentar_gordura}
              />
              <InputBio
                label="BRAÇO DIR."
                placeholder="0,0"
                unidade="kg"
                valor={v.gordBracoDir}
                onChangeText={v.setGordBracoDir}
                confianca={conf.segmentar_gordura}
              />
            </View>
            <View style={styles.rowInputs}>
              <InputBio
                label="TRONCO"
                placeholder="0,0"
                unidade="kg"
                valor={v.gordTronco}
                onChangeText={v.setGordTronco}
                confianca={conf.segmentar_gordura}
              />
            </View>
            <View style={[styles.rowInputs, { marginBottom: -14 }]}>
              <InputBio
                label="PERNA ESQ."
                placeholder="0,0"
                unidade="kg"
                valor={v.gordPernaEsq}
                onChangeText={v.setGordPernaEsq}
                confianca={conf.segmentar_gordura}
              />
              <InputBio
                label="PERNA DIR."
                placeholder="0,0"
                unidade="kg"
                valor={v.gordPernaDir}
                onChangeText={v.setGordPernaDir}
                confianca={conf.segmentar_gordura}
              />
            </View>
          </SessaoCard>

          <SessaoCard titulo="Análise Segmentar: Massa Magra" icone="fitness">
            <View style={styles.rowInputs}>
              <InputBio
                label="BRAÇO ESQ."
                placeholder="0,0"
                unidade="kg"
                valor={v.massaBracoEsq}
                onChangeText={v.setMassaBracoEsq}
                confianca={conf.segmentar_massa}
              />
              <InputBio
                label="BRAÇO DIR."
                placeholder="0,0"
                unidade="kg"
                valor={v.massaBracoDir}
                onChangeText={v.setMassaBracoDir}
                confianca={conf.segmentar_massa}
              />
            </View>
            <View style={styles.rowInputs}>
              <InputBio
                label="TRONCO"
                placeholder="0,0"
                unidade="kg"
                valor={v.massaTronco}
                onChangeText={v.setMassaTronco}
                confianca={conf.segmentar_massa}
              />
            </View>
            <View style={[styles.rowInputs, { marginBottom: -14 }]}>
              <InputBio
                label="PERNA ESQ."
                placeholder="0,0"
                unidade="kg"
                valor={v.massaPernaEsq}
                onChangeText={v.setMassaPernaEsq}
                confianca={conf.segmentar_massa}
              />
              <InputBio
                label="PERNA DIR."
                placeholder="0,0"
                unidade="kg"
                valor={v.massaPernaDir}
                onChangeText={v.setMassaPernaDir}
                confianca={conf.segmentar_massa}
              />
            </View>
          </SessaoCard>

          <TouchableOpacity
            style={[styles.btnSalvar, v.loading && { opacity: 0.7 }]}
            onPress={v.salvarAvaliacao}
            disabled={v.loading || v.analisandoIA}
            activeOpacity={0.85}
          >
            {v.loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.btnSalvarText}>
                  {v.revisaoIA.ativa ? "Confirmar e Salvar Avaliação" : "Salvar Bioimpedância"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {v.analisandoIA ? (
        <View style={styles.iaLoadingOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.iaLoadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.iaLoadingTitle}>Analisando Bioimpedância</Text>
            <Text style={styles.iaLoadingSub}>{v.etapaIATexto || "Interpretando indicadores com IA..."}</Text>
          </View>
        </View>
      ) : null}

      <BioModals
        modalOrigemVisivel={v.modalOrigemVisivel}
        onFecharOrigem={() => v.setModalOrigemVisivel(false)}
        onEscolherPdf={v.escolherPdf}
        onEscolherGaleria={v.escolherGaleria}
        onEscolherCamera={v.escolherCamera}
        previewImagemUri={v.previewImagemUri}
        onFecharPreviewImagem={() => v.setPreviewImagemUri(null)}
        feedback={v.feedback}
        onFecharFeedback={v.fecharFeedback}
        modalSucessoVisivel={v.modalSucessoVisivel}
        resumoSalvo={v.resumoSalvo}
        onConcluirSucesso={v.concluirESair}
      />
    </SafeAreaView>
  );
}