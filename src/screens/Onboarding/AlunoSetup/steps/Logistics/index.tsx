import React from "react";
import { Text, TextInput, View } from "react-native";
import {
  OPCOES_FREQUENCIA_SEMANAL,
  OPCOES_GENERO_TREINADOR,
  OPCOES_INVESTIMENTO,
  OPCOES_LOCAL_TREINO,
  OPCOES_MODALIDADE_ALUNO,
  OPCOES_TURNO_TREINO,
} from "../../../../../shared/matchSchema";
import { verticalScale } from "../../../../../utils/responsive";
import { styles } from "../../styles";
import { OptionGrid } from "../FormControls";

export function Logistics({ state, actions }: { state: any; actions: any }) {
  const mostrarLogisticaPresencial =
    state.servicoBuscado === "Presencial" || state.servicoBuscado === "Indiferente";

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Como você deseja <Text style={styles.titleHighlight}>treinar?</Text>
        </Text>
        <Text style={styles.subTitle}>
          Cruzamos essas escolhas como filtro real para mostrar apenas profissionais compatíveis com sua rotina.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>1. Formato de Atendimento *</Text>
      <OptionGrid
        opcoes={OPCOES_MODALIDADE_ALUNO}
        value={state.servicoBuscado}
        onSelect={actions.setServicoBuscado}
        isSingle
      />

      {mostrarLogisticaPresencial && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>
            Onde você vai treinar? {state.servicoBuscado === "Presencial" ? "*" : "(Opcional)"}
          </Text>
          <Text style={styles.helpText}>Mostra treinadores que realmente atendem nesse ambiente.</Text>
          <OptionGrid
            opcoes={OPCOES_LOCAL_TREINO}
            value={state.locaisTreino}
            onSelect={(id) => actions.toggleArrayItem(id, state.locaisTreino, actions.setLocaisTreino)}
          />

          <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>
            Turno Preferido {state.servicoBuscado === "Presencial" ? "*" : "(Opcional)"}
          </Text>
          <OptionGrid
            opcoes={OPCOES_TURNO_TREINO}
            value={state.turnos}
            onSelect={(id) => actions.toggleArrayItem(id, state.turnos, actions.setTurnos)}
          />

          {state.turnos.includes("variado") && (
            <TextInput
              style={styles.inputSubChip}
              placeholder="Ex: Ter/Qui às 14h, ou horário de almoço..."
              placeholderTextColor="#666"
              value={state.horarioEspecifico}
              onChangeText={actions.setHorarioEspecifico}
              keyboardAppearance="dark"
            />
          )}
        </>
      )}

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Disponibilidade na Semana *</Text>
      <Text style={styles.helpText}>Ajuda na montagem da sua divisão semanal de treinos.</Text>
      <OptionGrid
        opcoes={OPCOES_FREQUENCIA_SEMANAL}
        value={state.frequencia}
        onSelect={actions.setFrequencia}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Preferência de Treinador(a) *</Text>
      <OptionGrid
        opcoes={OPCOES_GENERO_TREINADOR}
        value={state.generoTreinador}
        onSelect={actions.setGeneroTreinador}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Expectativa de Investimento *</Text>
      <Text style={styles.helpText}>Alinha seu orçamento aos valores reais praticados pelos profissionais.</Text>
      <OptionGrid
        opcoes={OPCOES_INVESTIMENTO}
        value={state.investimento}
        onSelect={actions.setInvestimento}
        isSingle
      />
    </View>
  );
}