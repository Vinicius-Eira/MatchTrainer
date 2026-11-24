import React from "react";
import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  OPCOES_ACOMPANHAMENTO_ALUNO,
  OPCOES_AUTONOMIA_ALUNO,
  OPCOES_COBRANCA_ALUNO,
  OPCOES_ESTILO_COMUNICACAO,
  OPCOES_VALORES_TREINADOR,
} from "../../../../../shared/matchSchema";
import { theme } from "../../../../../theme/theme";
import { verticalScale } from "../../../../../utils/responsive";
import { styles } from "../../styles";
import { OptionGrid } from "../FormControls";

export function Match({ state, actions }: { state: any; actions: any }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          O Motor do <Text style={styles.titleHighlight}>Match.</Text>
        </Text>
        <Text style={styles.subTitle}>
          Cruzamos seu perfil comportamental com o método real de atendimento de cada treinador.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Estilo de Comunicação Ideal *</Text>
      <Text style={styles.helpText}>Como você prefere que o treinador fale e motive você?</Text>
      <OptionGrid
        opcoes={OPCOES_ESTILO_COMUNICACAO}
        value={state.estiloComunicacao}
        onSelect={actions.setEstiloComunicacao}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Nível de Cobrança *</Text>
      <Text style={styles.helpText}>Na hora de manter o foco, o que funciona melhor para você?</Text>
      <OptionGrid opcoes={OPCOES_COBRANCA_ALUNO} value={state.cobranca} onSelect={actions.setCobranca} isSingle />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Frequência de Contato *</Text>
      <OptionGrid
        opcoes={OPCOES_ACOMPANHAMENTO_ALUNO}
        value={state.acompanhamento}
        onSelect={actions.setAcompanhamento}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Sua Autonomia Treinando *</Text>
      <Text style={styles.helpText}>Seja sincero sobre o quanto de orientação técnica você precisa.</Text>
      <OptionGrid opcoes={OPCOES_AUTONOMIA_ALUNO} value={state.autonomia} onSelect={actions.setAutonomia} isSingle />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>
        O que você mais valoriza no Treinador? *
      </Text>
      <OptionGrid
        opcoes={OPCOES_VALORES_TREINADOR}
        value={state.valoresTreinador}
        onSelect={(id) => actions.toggleArrayItem(id, state.valoresTreinador, actions.setValoresTreinador)}
      />

      {state.valoresTreinador.includes("outro") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="O que mais é essencial para você?"
          placeholderTextColor="#666"
          value={state.outroValorTexto}
          onChangeText={actions.setOutroValorTexto}
          keyboardAppearance="dark"
        />
      )}

      <View style={styles.summaryBox}>
        <Ionicons name="sparkles" size={22} color={theme.colors.primary} style={{ marginBottom: 8 }} />
        <Text style={styles.summaryTitle}>Recomendação de Precisão Pronta</Text>
        <Text style={styles.summaryText}>
          Ao finalizar, o MatchTrainer aplica filtros obrigatórios de modalidade, segurança e agenda, e calcula a
          compatibilidade real para selecionar até 3 especialistas de elite para você.
        </Text>
      </View>
    </View>
  );
}