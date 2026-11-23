import React from "react";
import { Text, TextInput, View } from "react-native";
import { verticalScale } from "../../../../utils/responsive";
import {
  OPCOES_FAIXA_ETARIA,
  OPCOES_GENERO_ATENDIDO,
  OPCOES_LIMITACAO,
  OPCOES_OBJETIVO,
  OPCOES_PUBLICO,
  SUB_CLINICA,
  SUB_ESPORTE,
  SUB_LESAO,
  SUB_SAUDE,
} from "../constants";
import { styles } from "../styles";
import { ChipsSelector, OptionGrid } from "./FormControls";

export function Public({ state, actions }: { state: any; actions: any }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Foco & <Text style={styles.titleHighlight}>Público.</Text>
        </Text>
        <Text style={styles.subTitle}>Crucial para o Match: quem você atende e no que é especialista.</Text>
      </View>

      <Text style={styles.sectionTitle}>Público Alvo *</Text>
      <Text style={styles.inputLabel}>Gênero que Atende</Text>
      <OptionGrid
        opcoes={OPCOES_GENERO_ATENDIDO}
        value={state.generoAtendido}
        onSelect={actions.setGeneroAtendido}
        isSingle
      />

      <Text style={[styles.inputLabel, { marginTop: verticalScale(18) }]}>Perfil dos Alunos</Text>
      <OptionGrid
        opcoes={OPCOES_PUBLICO}
        value={state.publicoAtendido}
        onSelect={(id) => actions.toggleArrayItem(id, state.publicoAtendido, actions.setPublicoAtendido)}
      />

      <Text style={[styles.inputLabel, { marginTop: verticalScale(18) }]}>Momento de Vida (Faixa Etária) *</Text>
      <OptionGrid
        opcoes={OPCOES_FAIXA_ETARIA}
        value={state.faixasEtariasAtendidas}
        onSelect={actions.handleToggleFaixaEtaria}
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(28) }]}>Focos de Treino *</Text>
      <Text style={styles.helpText}>Quais objetivos você domina entregar na prática?</Text>
      <OptionGrid
        opcoes={OPCOES_OBJETIVO}
        value={state.objetivosAtendidos}
        onSelect={(id) => actions.toggleArrayItem(id, state.objetivosAtendidos, actions.setObjetivosAtendidos)}
      />

      {state.objetivosAtendidos.includes("outro") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="Especifique seu foco de treino..."
          placeholderTextColor="#666"
          value={state.outroObjetivoTexto}
          onChangeText={actions.setOutroObjetivoTexto}
          keyboardAppearance="dark"
        />
      )}
      {state.objetivosAtendidos.includes("saude") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Público de Saúde (Opcional):</Text>
          <ChipsSelector
            opcoes={SUB_SAUDE}
            value={state.subsAtendidos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsAtendidos, actions.setSubsAtendidos)}
          />
        </View>
      )}
      {state.objetivosAtendidos.includes("performance") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Prepara para (Opcional):</Text>
          <ChipsSelector
            opcoes={SUB_ESPORTE}
            value={state.subsAtendidos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsAtendidos, actions.setSubsAtendidos)}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(28) }]}>Atende Restrições? *</Text>
      <OptionGrid
        opcoes={OPCOES_LIMITACAO}
        value={state.limitacoesAtendidas}
        onSelect={actions.handleToggleLimitacao}
      />

      {state.limitacoesAtendidas.includes("outra") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="Especifique a restrição que atende..."
          placeholderTextColor="#666"
          value={state.outraLimitacaoTexto}
          onChangeText={actions.setOutraLimitacaoTexto}
          keyboardAppearance="dark"
        />
      )}
      {state.limitacoesAtendidas.includes("lesao") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Especialidade em lesões de:</Text>
          <ChipsSelector
            opcoes={SUB_LESAO}
            value={state.subsAtendidos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsAtendidos, actions.setSubsAtendidos)}
          />
        </View>
      )}
      {state.limitacoesAtendidas.includes("clinica") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Condições Específicas:</Text>
          <ChipsSelector
            opcoes={SUB_CLINICA}
            value={state.subsAtendidos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsAtendidos, actions.setSubsAtendidos)}
          />
        </View>
      )}
    </View>
  );
}