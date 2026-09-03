import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';
import { theme } from '../../../../../../theme/theme';

const MAP_INVESTIMENTO: Record<string, string> = {
  base: "R$ 90 a 110 / aula",
  mid: "R$ 120 a 150 / aula",
  premium: "A partir de R$ 160 / aula",
  pacote: "Pacote Mensal",
};

const MAP_PERFIL: Record<string, string> = {
  acolhedor: "O Acolhedor (Didático e paciente)",
  motivador: "O Motivador (Intenso e animado)",
  tecnico: "O Técnico (Foco em biomecânica)",
  estrategista: "O Estrategista (Foco em metas)",
};

export default function TabVisaoGeral({
  status, planoAtivo, isFetchingData, irParaNovoContrato, objetivoFinal, prefs, displayHistorico, displayFrequencia,
  aluno, calcularIdade, metaDePeso, dadosIMC, isRestrito, descRestricao, handlePersonalEncerraParceria, navigation // Adicionado navigation aqui!
}: any) {
  return (
    <>
      {status === "aluno_ativo" && planoAtivo && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="document-text" size={20} color="#00E676" />
            <Text style={styles.sectionHeading}>Contrato Ativo</Text>
          </View>
          <View style={styles.contratoCard}>
            <LinearGradient colors={["rgba(0,230,118,0.1)", "rgba(0,0,0,0)"]} style={[StyleSheet.absoluteFill, { borderRadius: 20 }]} />
            <View style={styles.contratoRowTop}>
              <Text style={styles.contratoValueTop}>{planoAtivo.frequencia}</Text>
              <Text style={styles.contratoLabelTop}>Dia {planoAtivo.dia_vencimento}</Text>
            </View>
            <View style={styles.contratoRow}>
              <View style={styles.contratoCol}>
                <Text style={styles.contratoLabel}>Serviços Contratados</Text>
                <Text style={styles.contratoValue}>{planoAtivo.servicos_inclusos ? planoAtivo.servicos_inclusos.join(" + ") : "Não informado"}</Text>
              </View>
              <View style={styles.contratoColRight}>
                <Text style={styles.contratoLabel}>Valor Total</Text>
                <Text style={[styles.contratoValue, { color: "#00E676", fontSize: 20 }]}>R$ {Number(planoAtivo.valor_mensal).toFixed(2)}</Text>
              </View>
            </View>
            {planoAtivo.observacoes ? <Text style={styles.contratoObsText}>Obs: {planoAtivo.observacoes}</Text> : null}
            <TouchableOpacity style={styles.btnEditarContrato} onPress={irParaNovoContrato}>
              <Text style={styles.btnEditarContratoText}>Ajustar Contrato</Text>
              <Ionicons name="chevron-forward" size={14} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {status === "aluno_ativo" && !planoAtivo && !isFetchingData && (
        <View style={styles.sectionContainer}>
          <View style={styles.bannerAlertaSemContrato}>
            <Ionicons name="warning" size={22} color="#FFD700" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerAlertaTitle}>Atenção: Aluno Sem Contrato</Text>
              <Text style={styles.bannerAlertaText}>Este aluno é um cadastro antigo e não possui vínculo no Recebimentos.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btnCriarContratoUrgente} onPress={irParaNovoContrato} activeOpacity={0.8}>
            <Text style={styles.btnCriarContratoUrgenteText}>Configurar Contrato Agora</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="clipboard" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionHeading}>Avaliação Inicial (Anamnese)</Text>
        </View>

        <View style={styles.treinosMainCard}>
          <View style={styles.treinosCardHeader}>
            <View style={styles.treinosIconBg}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={28} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.treinosCardTitle}>Questionário VIP</Text>
              <Text style={styles.treinosCardDesc}>Crie perguntas personalizadas para a IA ler antes de montar o treino.</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.btnCriarTreino, { marginBottom: 0, backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.primary }]} 
            onPress={() => navigation.navigate("AnamneseBuilder")}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.btnCriarTreinoText, { color: theme.colors.primary }]}>Configurar Anamnese</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <FontAwesome5 name="clipboard-list" size={18} color={theme.colors.primary} />
          <Text style={styles.sectionHeading}>Raio-X do Treinamento</Text>
        </View>
        <View style={styles.goalPremiumCard}>
          <LinearGradient colors={["rgba(255,107,0,0.12)", "rgba(255,107,0,0.02)"]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.goalIconBox}>
            <Feather name="target" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.goalTextContent}>
            <Text style={styles.goalLabel}>Objetivo Principal</Text>
            <Text style={styles.goalValue} numberOfLines={1}>{objetivoFinal}</Text>
          </View>
        </View>

        {prefs.sub_objetivo && prefs.sub_objetivo.length > 0 && (
          <View style={styles.subTagsContainer}>
            {prefs.sub_objetivo.map((sub: string, index: number) => (
              <View key={index} style={styles.subTagPill}>
                <Text style={styles.subTagText}>{sub}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.trainingGrid}>
          <View style={styles.trainingGridRow}>
            <View style={styles.trainingGridItem}>
              <MaterialCommunityIcons name="medal-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
              <Text style={styles.tgLabel}>Histórico Físico</Text>
              <Text style={styles.tgValue} numberOfLines={1}>{displayHistorico}</Text>
            </View>
            <View style={styles.trainingGridItem}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
              <Text style={styles.tgLabel}>Frequência</Text>
              <Text style={styles.tgValue} numberOfLines={1}>{displayFrequencia}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionHeading}>Biometria & Saúde</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{calcularIdade(aluno.data_nascimento)}</Text>
            <Text style={styles.statLabel}>Anos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="human-male-height" size={20} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{aluno.altura ? `${aluno.altura}` : "--"}</Text>
            <Text style={styles.statLabel}>Cm</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.colors.text} style={styles.statIcon} />
            <Text style={styles.statValue}>{aluno.peso ? `${aluno.peso}` : "--"}</Text>
            <Text style={styles.statLabel}>Atual</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="flag" size={20} color={theme.colors.success} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{metaDePeso ? `${metaDePeso}` : "--"}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.success }]}>Meta (Kg)</Text>
          </View>
        </View>

        {dadosIMC && (
          <View style={[styles.imcCard, { borderColor: `${dadosIMC.cor}40`, backgroundColor: `${dadosIMC.cor}08` }]}>
            <View style={styles.imcHeaderRow}>
              <Text style={styles.imcTitle}>Índice de Massa Corporal (IMC)</Text>
            </View>
            <View style={styles.imcValueRow}>
              <Text style={styles.imcNumber}>{dadosIMC.valor}</Text>
              <View style={[styles.imcBadge, { backgroundColor: `${dadosIMC.cor}20`, borderColor: dadosIMC.cor }]}>
                <View style={[styles.imcBadgeDot, { backgroundColor: dadosIMC.cor }]} />
                <Text style={[styles.imcBadgeText, { color: dadosIMC.cor }]}>{dadosIMC.classificacao}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.medicalAlertCard, isRestrito ? styles.medicalAlertDanger : styles.medicalAlertSafe]}>
          <View style={styles.medicalAlertHeader}>
            <Ionicons name={isRestrito ? "warning" : "checkmark-circle"} size={22} color={isRestrito ? theme.colors.danger : theme.colors.success} />
            <Text style={[styles.medicalAlertTitle, isRestrito ? { color: theme.colors.danger } : { color: theme.colors.success }]}>
              {isRestrito ? "Atenção: Restrições Físicas" : "Nenhuma Restrição Relatada"}
            </Text>
          </View>
          {isRestrito && descRestricao && (
            <View style={styles.medicalAlertBody}>
              <Text style={styles.medicalConditionDesc}>{descRestricao}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionHeading}>Alinhamento Comercial</Text>
        </View>
        <View style={styles.commercialCard}>
          <View style={styles.commercialRow}>
            <View style={styles.commercialIconBg}><FontAwesome5 name="user-tie" size={16} color={theme.colors.primary} /></View>
            <View style={styles.commercialContent}>
              <Text style={styles.commercialLabel}>Professor Desejado</Text>
              <Text style={styles.commercialValue}>{MAP_PERFIL[prefs.perfil_treinador] || "Sem preferência exata"}</Text>
            </View>
          </View>
          <View style={styles.dividerCommercial} />
          <View style={styles.commercialRow}>
            <View style={styles.commercialIconBg}><FontAwesome5 name="money-bill-wave" size={16} color={theme.colors.success} /></View>
            <View style={styles.commercialContent}>
              <Text style={styles.commercialLabel}>Orçamento / Investimento</Text>
              <Text style={[styles.commercialValue, { color: theme.colors.success }]}>{MAP_INVESTIMENTO[prefs.investimento] || "Aberto a propostas"}</Text>
            </View>
          </View>
        </View>
      </View>

      {status === "aluno_ativo" && (
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.btnDangerOutline} onPress={handlePersonalEncerraParceria}>
            <Text style={styles.btnDangerText}>Encerrar Contrato</Text>
          </TouchableOpacity>
          <Text style={styles.dangerZoneHelp}>O aluno perderá acesso aos treinos e será movido para o histórico.</Text>
        </View>
      )}
    </>
  );
}