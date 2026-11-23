import React from "react";
import { Platform, Text, TextInput, View } from "react-native";
import Slider from "@react-native-community/slider";
import { theme } from "../../../../theme/theme";
import { verticalScale } from "../../../../utils/responsive";
import { OPCOES_AGENDA, OPCOES_LOCAL, OPCOES_SERVICOS, OPCOES_TURNO } from "../constants";
import { styles } from "../styles";
import { OptionGrid } from "./FormControls";

export function Services({ state, actions }: { state: any; actions: any }) {
  const webOutline = Platform.OS === "web" ? { outlineStyle: "none" as any } : {};
  const temConsultoria = state.servicosOferecidos.includes("Consultoria");
  const temPresencial = state.servicosOferecidos.includes("Presencial");

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Serviços & <Text style={styles.titleHighlight}>Logística.</Text>
        </Text>
        <Text style={styles.subTitle}>O que você oferece, seus valores base e onde atende.</Text>
      </View>

      <Text style={styles.sectionTitle}>1. Serviços que Oferece *</Text>
      <OptionGrid opcoes={OPCOES_SERVICOS} value={state.servicosOferecidos} onSelect={actions.handleToggleServicos} />

      {(temConsultoria || temPresencial) && (
        <View style={styles.subSection}>
          <Text style={styles.sectionTitle}>2. Valores Base *</Text>
          <Text style={styles.helpText}>Toque no valor para digitar ou arraste a barra abaixo.</Text>

          {temConsultoria && (
            <View style={styles.priceContainer}>
              <Text style={styles.inputLabel}>Consultoria Online (Mensalidade)</Text>
              <View style={styles.priceEditableContainer}>
                <Text style={styles.pricePrefix}>R$</Text>
                <TextInput
                  style={[styles.priceInput, webOutline]}
                  keyboardType="numeric"
                  value={String(state.precoConsultoria)}
                  onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoConsultoria)}
                  maxLength={4}
                  keyboardAppearance="dark"
                />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={600}
                step={10}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#2A2A34"
                thumbTintColor={theme.colors.primary}
                value={state.precoConsultoria > 600 ? 600 : state.precoConsultoria}
                onValueChange={actions.setPrecoConsultoria}
              />
            </View>
          )}

          {temPresencial && (
            <View style={styles.priceContainer}>
              <Text style={styles.inputLabel}>Atendimento Presencial (Por Aula)</Text>
              <View style={styles.priceEditableContainer}>
                <Text style={styles.pricePrefix}>R$</Text>
                <TextInput
                  style={[styles.priceInput, webOutline]}
                  keyboardType="numeric"
                  value={String(state.precoPresencial)}
                  onChangeText={(t) => actions.handlePrecoChange(t, actions.setPrecoPresencial)}
                  maxLength={4}
                  keyboardAppearance="dark"
                />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={500}
                step={10}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#2A2A34"
                thumbTintColor={theme.colors.primary}
                value={state.precoPresencial > 500 ? 500 : state.precoPresencial}
                onValueChange={actions.setPrecoPresencial}
              />
            </View>
          )}
        </View>
      )}

      {temPresencial && (
        <View style={styles.subSection}>
          <Text style={styles.sectionTitle}>3. Logística Presencial *</Text>
          <Text style={styles.helpText}>Onde e em quais turnos você atende fisicamente.</Text>

          <Text style={styles.inputLabel}>Locais de Atendimento</Text>
          <OptionGrid
            opcoes={OPCOES_LOCAL}
            value={state.locaisAtendidos}
            onSelect={(id) => actions.toggleArrayItem(id, state.locaisAtendidos, actions.setLocaisAtendidos)}
          />

          <Text style={[styles.inputLabel, { marginTop: verticalScale(18) }]}>Turnos Disponíveis</Text>
          <OptionGrid
            opcoes={OPCOES_TURNO}
            value={state.turnos}
            onSelect={(id) => actions.toggleArrayItem(id, state.turnos, actions.setTurnos)}
          />

          {state.turnos.includes("variado") && (
            <View style={[styles.inputBox, { marginTop: 10 }]}>
              <TextInput
                style={[styles.inputPremium, webOutline]}
                placeholder="Ex: Seg/Qua às 14h, Ter/Qui às 10h"
                placeholderTextColor="#666"
                value={state.horariosEspecificos}
                onChangeText={actions.setHorariosEspecificos}
                keyboardAppearance="dark"
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.subSection}>
        <Text style={styles.sectionTitle}>{temPresencial ? "4." : "3."} Status da Agenda *</Text>
        <OptionGrid opcoes={OPCOES_AGENDA} value={state.statusAgenda} onSelect={actions.setStatusAgenda} isSingle />
      </View>
    </View>
  );
}