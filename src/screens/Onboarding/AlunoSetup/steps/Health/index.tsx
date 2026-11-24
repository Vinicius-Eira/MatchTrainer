import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RESUMO_FINALIDADE_SAUDE } from "../../../../../services/lgpd/lgpdService";
import {
  OPCOES_HISTORICO_ALUNO,
  OPCOES_LIMITACAO_ALUNO,
  OPCOES_OBJETIVO_TREINO,
  SUB_CLINICA,
  SUB_ESPORTE,
  SUB_LESAO,
  SUB_SAUDE,
} from "../../../../../shared/matchSchema";
import { verticalScale } from "../../../../../utils/responsive";
import { styles } from "../../styles";
import { ChipsSelector, OptionGrid } from "../FormControls";

export function Health({ state, actions }: { state: any; actions: any }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Entendendo o seu <Text style={styles.titleHighlight}>Corpo.</Text>
        </Text>
        <Text style={styles.subTitle}>
          Quanto mais preciso você for aqui, mais assertivo será o especialista recomendado no seu Top 3.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Seu Nível de Experiência *</Text>
      <OptionGrid
        opcoes={OPCOES_HISTORICO_ALUNO}
        value={state.historico}
        onSelect={actions.setHistorico}
        isSingle
      />

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(26) }]}>Seu Maior Objetivo *</Text>
      <OptionGrid
        opcoes={OPCOES_OBJETIVO_TREINO}
        value={state.objetivos}
        onSelect={(id) => actions.toggleArrayItem(id, state.objetivos, actions.setObjetivos)}
      />

      {state.objetivos.includes("outro") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="Especifique seu objetivo..."
          placeholderTextColor="#666"
          value={state.outroObjetivoTexto}
          onChangeText={actions.setOutroObjetivoTexto}
          keyboardAppearance="dark"
        />
      )}
      {state.objetivos.includes("saude") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Prioridade de Saúde (Opcional):</Text>
          <ChipsSelector
            opcoes={SUB_SAUDE}
            value={state.subsObjetivos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsObjetivos, actions.setSubsObjetivos)}
          />
        </View>
      )}
      {state.objetivos.includes("performance") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Esportes Atuais (Opcional):</Text>
          <ChipsSelector
            opcoes={SUB_ESPORTE}
            value={state.subsObjetivos}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsObjetivos, actions.setSubsObjetivos)}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: verticalScale(28) }]}>
        Restrições Físicas ou de Saúde *
      </Text>
      <Text style={styles.helpText}>
        Opcional informar condições clínicas: se informar, priorizamos apenas profissionais aptos ao seu caso.
      </Text>
      <OptionGrid
        opcoes={OPCOES_LIMITACAO_ALUNO}
        value={state.limitacoes}
        onSelect={actions.handleToggleLimitacao}
      />

      {state.limitacoes.includes("outra") && (
        <TextInput
          style={styles.inputSubChip}
          placeholder="Especifique sua restrição..."
          placeholderTextColor="#666"
          value={state.outraLimitacaoTexto}
          onChangeText={actions.setOutraLimitacaoTexto}
          keyboardAppearance="dark"
        />
      )}
      {state.limitacoes.includes("lesao") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Onde é o foco da dor ou lesão?</Text>
          <ChipsSelector
            opcoes={SUB_LESAO}
            value={state.subsLimitacoes}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsLimitacoes, actions.setSubsLimitacoes)}
          />
        </View>
      )}
      {state.limitacoes.includes("clinica") && (
        <View style={styles.subBox}>
          <Text style={styles.subBoxTitle}>Qual condição o especialista precisa atender?</Text>
          <ChipsSelector
            opcoes={SUB_CLINICA}
            value={state.subsLimitacoes}
            onSelect={(op) => actions.toggleArrayItem(op, state.subsLimitacoes, actions.setSubsLimitacoes)}
          />
        </View>
      )}

      {state.precisaConsentimentoSaude && (
        <View style={styles.lgpdConsentCard}>
          <View style={styles.lgpdConsentHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#FF6B00" />
            <Text style={styles.lgpdConsentTitle}>Autorização Específica — Dados de Saúde (LGPD)</Text>
          </View>

          <Text style={styles.lgpdConsentBody}>{RESUMO_FINALIDADE_SAUDE}</Text>

          <TouchableOpacity
            style={styles.lgpdCheckRow}
            onPress={() => actions.setConsentimentoSaude(!state.consentimentoSaude)}
            activeOpacity={0.8}
          >
            <View style={[styles.lgpdCheckBox, state.consentimentoSaude && styles.lgpdCheckBoxAtivo]}>
              {state.consentimentoSaude && <Ionicons name="checkmark" size={14} color="#000" />}
            </View>
            <Text style={styles.lgpdCheckText}>
              Concordo com o uso dos meus dados de saúde para filtrar profissionais aptos no Match. Posso revogar quando
              quiser em Meu Perfil → Privacidade.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lgpdSkipBtn} onPress={actions.optarNaoInformarSaude} activeOpacity={0.75}>
            <Text style={styles.lgpdSkipBtnText}>Prefiro não informar dados de saúde agora</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}