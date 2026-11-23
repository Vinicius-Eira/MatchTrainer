import React from "react";
import { Text, TextInput, View } from "react-native";
import { verticalScale } from "../../../../utils/responsive";
import {
  OPCOES_ACOMPANHAMENTO,
  OPCOES_AUTONOMIA,
  OPCOES_COBRANCA,
  OPCOES_ESTILO_COMUNICACAO,
  OPCOES_EXPERIENCIA,
  OPCOES_VALORES,
} from "../constants";
import { styles } from "../styles";
import { ChipsSelector, OptionGrid } from "./FormControls";

export function Match({ state, actions }: { state: any; actions: any }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          O Motor do <Text style={styles.titleHighlight}>Match.</Text>
        </Text>
        <Text style={styles.subTitle}>A psicologia e o estilo do seu atendimento para conectar com o aluno ideal.</Text>
      </View>

      <Text style={styles.sectionTitle}>Seu Estilo de Comunicação *</Text>
      <Text style={styles.helpText}>Como você fala e motiva seus alunos no dia a dia?</Text>
      <OptionGrid
        opcoes={OPCOES_ESTILO_COMUNICACAO}
        value={state.estiloComunicacao}
        onSelect={actions.setEstiloComunicacao}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Nível de Cobrança *</Text>
      <Text style={styles.helpText}>Como você exige resultados dos alunos?</Text>
      <OptionGrid opcoes={OPCOES_COBRANCA} value={state.cobranca} onSelect={actions.setCobranca} isSingle />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Frequência de Acompanhamento *</Text>
      <Text style={styles.helpText}>Como você mantém contato durante a semana?</Text>
      <OptionGrid
        opcoes={OPCOES_ACOMPANHAMENTO}
        value={state.acompanhamento}
        onSelect={actions.setAcompanhamento}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Autonomia Esperada *</Text>
      <Text style={styles.helpText}>O quanto o aluno precisa saber se virar sozinho?</Text>
      <OptionGrid
        opcoes={OPCOES_AUTONOMIA}
        value={state.autonomiaEsperada}
        onSelect={actions.setAutonomiaEsperada}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Eu valorizo no aluno: *</Text>
      <Text style={styles.helpText}>O que é inegociável para uma parceria dar certo?</Text>
      <OptionGrid
        opcoes={OPCOES_VALORES}
        value={state.valoresAluno}
        onSelect={(id) => actions.toggleArrayItem(id, state.valoresAluno, actions.setValoresAluno)}
      />

      {state.valoresAluno.includes("outro") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="Especifique o que mais você valoriza..."
          placeholderTextColor="#666"
          value={state.outroValorTexto}
          onChangeText={actions.setOutroValorTexto}
          keyboardAppearance="dark"
        />
      )}

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Tempo de Experiência</Text>
      <ChipsSelector
        opcoes={OPCOES_EXPERIENCIA}
        value={state.experiencia}
        onSelect={actions.setExperiencia}
        isSingle
      />
    </View>
  );
}