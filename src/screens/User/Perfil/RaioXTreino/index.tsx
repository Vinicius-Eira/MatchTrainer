import React from "react";
import {
  ActivityIndicator,
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
import { LinearGradient } from "expo-linear-gradient";
import { RESUMO_FINALIDADE_SAUDE } from "../../../../services/lgpd/lgpdService";
import {
  OPCOES_ACOMPANHAMENTO_ALUNO,
  OPCOES_AUTONOMIA_ALUNO,
  OPCOES_COBRANCA_ALUNO,
  OPCOES_ESTILO_COMUNICACAO,
  OPCOES_FREQUENCIA_SEMANAL,
  OPCOES_GENERO_TREINADOR,
  OPCOES_HISTORICO_ALUNO,
  OPCOES_INVESTIMENTO,
  OPCOES_LIMITACAO_ALUNO,
  OPCOES_LOCAL_TREINO,
  OPCOES_MODALIDADE_ALUNO,
  OPCOES_OBJETIVO_TREINO,
  OPCOES_TURNO_TREINO,
  OPCOES_VALORES_TREINADOR,
  OpcaoMatch,
  SUB_CLINICA,
  SUB_ESPORTE,
  SUB_LESAO,
  SUB_SAUDE,
} from "../../../../shared/matchSchema";
import { theme } from "../../../../theme/theme";
import { scale } from "../../../../utils/responsive";
import { styles } from "./styles";
import { useRaioXTreino } from "./useRaioXTreino";

export function RaioXTreino({ navigation }: any) {
  const { state, actions } = useRaioXTreino(navigation);
  const mostrarLogisticaPresencial =
    state.servicoBuscado === "Presencial" || state.servicoBuscado === "Indiferente";

  const renderPremiumList = (
    opcoes: OpcaoMatch[],
    stateValue: string | string[],
    onSelect: (id: string) => void,
    isSingle = true
  ) => (
    <View style={styles.listContainer}>
      {opcoes.map((opt) => {
        const ativo = isSingle
          ? stateValue === opt.id
          : Array.isArray(stateValue) && stateValue.includes(opt.id);

        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.premiumOptionCard,
              ativo && styles.premiumOptionCardAtivo,
              state.isLocked && { opacity: 0.62 },
            ]}
            onPress={() => (state.isLocked ? actions.handleLockedPress() : onSelect(opt.id))}
            activeOpacity={state.isLocked ? 1 : 0.8}
          >
            {ativo && (
              <LinearGradient
                colors={["rgba(255, 107, 0, 0.12)", "transparent"]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[styles.premiumIconBox, ativo && styles.premiumIconBoxAtivo]}>
              <Ionicons name={opt.icon} size={21} color={ativo ? theme.colors.backgroundPure : "#888"} />
            </View>
            <View style={styles.premiumTextContent}>
              <Text style={[styles.premiumOptionTitle, ativo && styles.premiumOptionTitleAtivo]}>
                {opt.titulo}
              </Text>
              {opt.desc ? <Text style={styles.premiumOptionDesc}>{opt.desc}</Text> : null}
            </View>
            <View style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}>
              {ativo && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderChips = (
    opcoes: string[],
    stateArray: string[],
    setStateArray: (val: string[]) => void
  ) => (
    <View style={styles.chipsContainer}>
      {opcoes.map((opt) => {
        const isSelected = stateArray.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, isSelected && styles.chipAtivo, state.isLocked && { opacity: 0.65 }]}
            onPress={() => actions.toggleArrayItem(opt, stateArray, setStateArray)}
            activeOpacity={state.isLocked ? 1 : 0.75}
          >
            <Text style={[styles.chipTexto, isSelected && styles.chipTextoAtivo]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (state.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />
      <View style={styles.glowTopLeft} />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RAIO-X DO TREINO</Text>
        <View style={{ width: scale(40) }} />
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {state.isLocked ? (
          <View style={styles.statusBoxLocked}>
            <Ionicons name="lock-closed" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
            <Text style={styles.statusTextLocked}>
              Sincronização blindada. Você possui um contrato ativo. Alterações no Raio-X são liberadas apenas sem
              vínculo ativo.
            </Text>
          </View>
        ) : (
          <View style={styles.statusBox}>
            <MaterialCommunityIcons name="handshake" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
            <Text style={styles.statusText}>
              Nosso algoritmo cruza estas respostas com o perfil real dos treinadores para recomendar até 3 especialistas
              de alta compatibilidade.
            </Text>
          </View>
        )}

        <Text style={styles.sectionDivider}>Logística e Estrutura</Text>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Formato de Atendimento {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_MODALIDADE_ALUNO, state.servicoBuscado, actions.setServicoBuscado)}
        </View>

        {mostrarLogisticaPresencial && (
          <>
            <View style={styles.preferenceCard}>
              <Text style={styles.cardHeaderTitleSub}>Onde você vai treinar? {state.isLocked ? "🔒" : ""}</Text>
              {renderPremiumList(
                OPCOES_LOCAL_TREINO,
                state.locaisTreino,
                (id) => actions.toggleArrayItem(id, state.locaisTreino, actions.setLocaisTreino),
                false
              )}
            </View>

            <View style={styles.preferenceCard}>
              <Text style={styles.cardHeaderTitleSub}>Turno de Treino {state.isLocked ? "🔒" : ""}</Text>
              {renderPremiumList(
                OPCOES_TURNO_TREINO,
                state.turnos,
                (id) => actions.toggleArrayItem(id, state.turnos, actions.setTurnos),
                false
              )}
              {state.turnos.includes("variado") && (
                <TextInput
                  style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]}
                  placeholder="Ex: Ter/Qui às 14h..."
                  placeholderTextColor="#666"
                  value={state.horarioEspecifico}
                  onChangeText={actions.setHorarioEspecifico}
                  editable={!state.isLocked}
                  keyboardAppearance="dark"
                />
              )}
            </View>
          </>
        )}

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Disponibilidade na Semana {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_FREQUENCIA_SEMANAL, state.frequencia, actions.setFrequencia)}
        </View>

        <Text style={styles.sectionDivider}>Seu Corpo</Text>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Nível de Experiência {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_HISTORICO_ALUNO, state.historico, actions.setHistorico)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Objetivo Principal {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(
            OPCOES_OBJETIVO_TREINO,
            state.objetivos,
            (id) => actions.toggleArrayItem(id, state.objetivos, actions.setObjetivos),
            false
          )}

          {state.objetivos.includes("outro") && (
            <TextInput
              style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]}
              placeholder="Qual seu foco?"
              placeholderTextColor="#666"
              value={state.outroObjetivoTexto}
              onChangeText={actions.setOutroObjetivoTexto}
              editable={!state.isLocked}
              keyboardAppearance="dark"
            />
          )}
          {state.objetivos.includes("saude") && (
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Foco de Saúde:</Text>
              {renderChips(SUB_SAUDE, state.subsObjetivos, actions.setSubsObjetivos)}
            </View>
          )}
          {state.objetivos.includes("performance") && (
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Quais Esportes?</Text>
              {renderChips(SUB_ESPORTE, state.subsObjetivos, actions.setSubsObjetivos)}
            </View>
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Limitações / Cuidados {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_LIMITACAO_ALUNO, state.limitacoes, actions.handleToggleLimitacao, false)}

          {state.limitacoes.includes("outra") && (
            <TextInput
              style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]}
              placeholder="Especifique sua restrição..."
              placeholderTextColor="#666"
              value={state.outraLimitacaoTexto}
              onChangeText={actions.setOutraLimitacaoTexto}
              editable={!state.isLocked}
              keyboardAppearance="dark"
            />
          )}
          {state.limitacoes.includes("lesao") && (
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Foco da dor ou lesão:</Text>
              {renderChips(SUB_LESAO, state.subsLimitacoes, actions.setSubsLimitacoes)}
            </View>
          )}
          {state.limitacoes.includes("clinica") && (
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Condição Clínica:</Text>
              {renderChips(SUB_CLINICA, state.subsLimitacoes, actions.setSubsLimitacoes)}
            </View>
          )}

          {!state.isLocked && state.precisaConsentimentoSaude && (
            <View style={styles.lgpdConsentCard}>
              <View style={styles.lgpdConsentHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#FF6B00" />
                <Text style={styles.lgpdConsentTitle}>Autorização Específica — Dados de Saúde (LGPD)</Text>
              </View>
              <Text style={styles.lgpdConsentBody}>{RESUMO_FINALIDADE_SAUDE}</Text>

              <TouchableOpacity
                style={styles.lgpdCheckRow}
                onPress={() => actions.setConsentimentoSaude(!state.consentimentoSaude)}
                activeOpacity={0.8}
              >
                <View style={[styles.lgpdCheckBox, state.consentimentoSaude && styles.lgpdCheckBoxAtivo]}>
                  {state.consentimentoSaude && <Ionicons name="checkmark" size={13} color="#000" />}
                </View>
                <Text style={styles.lgpdCheckText}>
                  Autorizo o uso destes dados de saúde para filtrar especialistas aptos no Match.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.lgpdSkipBtn} onPress={actions.optarNaoInformarSaude} activeOpacity={0.75}>
                <Text style={styles.lgpdSkipBtnText}>Prefiro não informar dados de saúde</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionDivider}>O Match Ideal</Text>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Estilo de Comunicação {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_ESTILO_COMUNICACAO, state.estiloComunicacao, actions.setEstiloComunicacao)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Qual perfil te motiva? {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_COBRANCA_ALUNO, state.cobranca, actions.setCobranca)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Nível de Contato {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_ACOMPANHAMENTO_ALUNO, state.acompanhamento, actions.setAcompanhamento)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Sua Autonomia {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_AUTONOMIA_ALUNO, state.autonomia, actions.setAutonomia)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>O que mais valoriza? {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(
            OPCOES_VALORES_TREINADOR,
            state.valoresTreinador,
            (id) => actions.toggleArrayItem(id, state.valoresTreinador, actions.setValoresTreinador),
            false
          )}
          {state.valoresTreinador.includes("outro") && (
            <TextInput
              style={[styles.inputPremiumSmall, state.isLocked && { opacity: 0.5 }]}
              placeholder="Especifique..."
              placeholderTextColor="#666"
              value={state.outroValorTexto}
              onChangeText={actions.setOutroValorTexto}
              editable={!state.isLocked}
              keyboardAppearance="dark"
            />
          )}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Preferência de Gênero {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_GENERO_TREINADOR, state.generoTreinador, actions.setGeneroTreinador)}
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.cardHeaderTitleSub}>Expectativa de Investimento {state.isLocked ? "🔒" : ""}</Text>
          {renderPremiumList(OPCOES_INVESTIMENTO, state.investimento, actions.setInvestimento)}
        </View>

        {!state.isLocked ? (
          <TouchableOpacity
            style={[styles.btnSalvar, state.salvando && { opacity: 0.6 }]}
            onPress={actions.handleSalvar}
            disabled={state.salvando}
            activeOpacity={0.85}
          >
            {state.salvando ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.btnSalvarText}>Salvar Preferências</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}