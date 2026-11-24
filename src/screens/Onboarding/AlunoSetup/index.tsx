import React, { ComponentRef, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ALUNO_STEP_TITLES } from "../../../shared/matchSchema";
import { theme } from "../../../theme/theme";
import { Profile } from "./steps/Health/Profile";
import { Logistics } from "./steps/Logistics";
import { Health } from "./steps/Health";
import { Match } from "./steps/Match";
import { styles } from "./styles";
import { useClientSetup } from "./useAlunoSetup";

export function AlunoSetup({ navigation }: any) {
  const { state, actions } = useClientSetup(navigation);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [state.currentStep]);

  if (state.loadingDados) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.headerAbsolute}
      >
        <View style={styles.stepperHeader}>
          <View style={styles.headerBackCol}>
            {navigation.canGoBack() ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={{ paddingVertical: 4, paddingRight: 8 }}
              >
                <Ionicons name="arrow-back" size={23} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.headerStepCol}>
            <Text style={styles.stepCounterText} numberOfLines={1}>
              Passo {state.currentStep} de 4
            </Text>
          </View>

          <View style={styles.headerTitleCol}>
            <Text style={styles.stepTitleText} numberOfLines={1} adjustsFontSizeToFit>
              {ALUNO_STEP_TITLES[state.currentStep - 1]}
            </Text>
          </View>
        </View>

        <View style={styles.stepDotsRow}>
          {[1, 2, 3, 4].map((stepNum) => {
            const ativo = state.currentStep === stepNum;
            const concluido = state.currentStep > stepNum;
            return (
              <TouchableOpacity
                key={stepNum}
                style={[
                  styles.stepDotTrack,
                  concluido && styles.stepDotDone,
                  ativo && styles.stepDotActive,
                ]}
                onPress={() => actions.irParaPasso(stepNum)}
                disabled={!state.isEditing && stepNum > state.currentStep}
                activeOpacity={0.7}
              />
            );
          })}
        </View>
      </BlurView>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {state.currentStep === 1 && <Profile state={state} actions={actions} />}
        {state.currentStep === 2 && <Logistics state={state} actions={actions} />}
        {state.currentStep === 3 && <Health state={state} actions={actions} />}
        {state.currentStep === 4 && <Match state={state} actions={actions} />}
      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBlur}>
        <View style={styles.stepperControls}>
          {state.currentStep > 1 ? (
            <TouchableOpacity style={styles.btnVoltarStep} onPress={actions.passoAnterior} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#888" />
              <Text style={styles.btnVoltarStepText}>Voltar</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {state.currentStep < 4 ? (
            <TouchableOpacity style={styles.btnAvancarStep} onPress={actions.proximoPasso} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.btnAvancarStepText}>Avançar</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btnAvancarStep, { borderColor: theme.colors.success }]}
              onPress={actions.handleFinalizar}
              disabled={state.loading}
              activeOpacity={0.8}
            >
              {state.loading ? (
                <ActivityIndicator size="small" color={theme.colors.success} />
              ) : (
                <>
                  <LinearGradient colors={["rgba(0, 230, 118, 0.15)", "transparent"]} style={StyleSheet.absoluteFill} />
                  <Text style={[styles.btnAvancarStepText, { color: theme.colors.success }]}>
                    {state.isEditing ? "Salvar Preferências" : "Ver Meus Matches"}
                  </Text>
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