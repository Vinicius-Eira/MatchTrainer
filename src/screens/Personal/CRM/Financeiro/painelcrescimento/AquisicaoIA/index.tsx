import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BusinessKPIs, formatarMoeda } from "../usePainelCrescimento";
import { styles } from "./styles";

interface AbaAquisicaoIAProps {
  kpis: BusinessKPIs | null;
  onAbrirInfo: (titulo: string, texto: string, dica: string) => void;
  onAbrirEstrategistaIA: () => void;
  navigation: any;
}

export function AbaAquisicaoIA({ kpis, onAbrirInfo, onAbrirEstrategistaIA, navigation }: AbaAquisicaoIAProps) {
  const funil = kpis?.funil;
  const totalLeads = Number(funil?.leads || 0);
  const totalContatos = Number(funil?.em_contato || 0);
  const totalPropostas = Number(funil?.propostas_aguardando || 0);
  const valorPropostas = Number(funil?.propostas_valor || 0);
  const totalFechados = Number(funil?.fechados || 0);

  const taxaConversao = totalLeads > 0 ? Math.min(100, Math.round((totalFechados / totalLeads) * 100)) : 0;
  const leadsEmAberto = Math.max(0, totalLeads - totalFechados);
  const leadsSemResposta = Math.max(0, totalLeads - totalContatos);
  const leadsEmNegociacao = Math.max(0, totalContatos - totalFechados);

  const conv = kpis?.funil_convites;
  const convTotal = Number(conv?.total || 0);
  const convPendentes = Number(conv?.pendentes || 0);
  const convUtilizados = Number(conv?.utilizados || 0);
  const convExpirados = Number(conv?.expirados || 0);
  const taxaConvites = convTotal > 0 ? Math.round((convUtilizados / convTotal) * 100) : 0;

  let statusBoxTitulo = "STATUS";
  let statusBoxValor = "Sem leads";
  let statusBoxCor = "#A1A1AA";
  let statusBoxVerde = false;

  if (totalLeads > 0) {
    if (totalPropostas > 0) {
      statusBoxTitulo = "FOCO AGORA";
      statusBoxValor = `${totalPropostas} proposta(s)`;
      statusBoxCor = "#FF6B00";
    } else if (leadsSemResposta > 0 && leadsSemResposta >= leadsEmNegociacao) {
      statusBoxTitulo = "FOCO AGORA";
      statusBoxValor = "Responder leads";
      statusBoxCor = "#FF6B00";
    } else if (leadsEmNegociacao > 0) {
      statusBoxTitulo = "FOCO AGORA";
      statusBoxValor = "Fechar vendas";
      statusBoxCor = "#FF6B00";
    } else {
      statusBoxTitulo = "STATUS";
      statusBoxValor = "100% fechado";
      statusBoxCor = "#00E676";
      statusBoxVerde = true;
    }
  }

  const pctContatos = totalLeads > 0 ? Math.min(100, (totalContatos / totalLeads) * 100) : 0;
  const pctFechados = totalLeads > 0 ? Math.min(100, (totalFechados / totalLeads) * 100) : 0;

  return (
    <View>
      <TouchableOpacity style={styles.iaCard} onPress={onAbrirEstrategistaIA} activeOpacity={0.85}>
        <LinearGradient colors={["rgba(255, 107, 0, 0.14)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={styles.aiHeaderRow}>
          <Ionicons name="sparkles" size={15} color="#FF6B00" />
          <Text style={styles.aiTitle}>ESTRATEGISTA MATCHBUSINESS IA</Text>
        </View>
        <Text style={styles.aiHeadline}>Plano de Ação & Scripts de Venda</Text>
        <Text style={styles.aiText}>
          Analise seu funil, ticket e retenção com IA para receber 3 missões práticas da semana e mensagens prontas para fechar alunos no WhatsApp.
        </Text>
        <View style={styles.estrategistaBtn}>
          <Text style={styles.estrategistaBtnText}>Gerar Plano da Semana com IA</Text>
          <Ionicons name="sparkles-outline" size={15} color="#FF6B00" />
        </View>
      </TouchableOpacity>

      {totalPropostas > 0 && (
        <TouchableOpacity
          style={styles.propostaAlertaCard}
          onPress={() => navigation.navigate("Messages")}
          activeOpacity={0.8}
        >
          <View style={styles.propostaAlertaIcon}>
            <Ionicons name="cash-outline" size={22} color="#FF6B00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.propostaAlertaTitle}>{formatarMoeda(valorPropostas)} aguardando assinatura</Text>
            <Text style={styles.propostaAlertaSub}>
              {totalPropostas} aluno(s) já receberam sua proposta. Toque para fazer follow-up no chat.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
        </TouchableOpacity>
      )}

      <View style={styles.sectionTitleRow}>
        <FontAwesome5 name="filter" size={14} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Funil do Match</Text>
        <TouchableOpacity
          style={styles.btnInfo}
          onPress={() =>
            onAbrirInfo(
              "Funil do Match",
              "Mostra quantos alunos deram Match com você, quantos entraram em conversa e quantos fecharam contrato ativo.",
              "Acompanhe o número de leads em aberto e responda rápido para não perder o interesse do aluno."
            )
          }
        >
          <Ionicons name="information-circle-outline" size={16} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.funilCard}>
        <View style={styles.etapaBloco}>
          <View style={styles.etapaHeader}>
            <Text style={styles.etapaLabel}>1. MATCHES RECEBIDOS</Text>
            <Text style={styles.etapaNumero}>{totalLeads}</Text>
          </View>
          <View style={styles.barraTrack}>
            <View style={[styles.barraFill, { width: totalLeads > 0 ? "100%" : "0%", backgroundColor: "#52525B" }]} />
          </View>
        </View>

        <View style={styles.etapaBloco}>
          <View style={styles.etapaHeader}>
            <Text style={styles.etapaLabel}>2. EM CONVERSA</Text>
            <Text style={[styles.etapaNumero, { color: "#FF6B00" }]}>
              {totalContatos} <Text style={styles.etapaPct}>({Math.round(pctContatos)}%)</Text>
            </Text>
          </View>
          <View style={styles.barraTrack}>
            <View style={[styles.barraFill, { width: `${pctContatos}%`, backgroundColor: "#FF6B00" }]} />
          </View>
        </View>

        <View style={[styles.etapaBloco, { marginBottom: 4 }]}>
          <View style={styles.etapaHeader}>
            <Text style={styles.etapaLabel}>3. CONTRATOS FECHADOS</Text>
            <Text style={[styles.etapaNumero, { color: "#00E676" }]}>
              {totalFechados} <Text style={styles.etapaPct}>({taxaConversao}%)</Text>
            </Text>
          </View>
          <View style={styles.barraTrack}>
            <View style={[styles.barraFill, { width: `${pctFechados}%`, backgroundColor: "#00E676" }]} />
          </View>
        </View>

        <View style={styles.metricasFunilRow}>
          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>CONVERSÃO</Text>
            <Text style={[styles.metricaVal, { color: taxaConversao > 0 ? "#00E676" : "#FFF" }]}>
              {taxaConversao}%
            </Text>
          </View>

          <View style={styles.metricaBox}>
            <Text style={styles.metricaLabel}>EM ABERTO</Text>
            <Text style={[styles.metricaVal, { color: leadsEmAberto > 0 ? "#FF6B00" : "#FFF" }]}>
              {leadsEmAberto}
            </Text>
          </View>

          <View
            style={[
              styles.metricaBox,
              statusBoxVerde
                ? { backgroundColor: "rgba(0, 230, 118, 0.08)", borderColor: "rgba(0, 230, 118, 0.3)" }
                : totalLeads > 0
                  ? styles.metricaBoxDestaque
                  : null,
            ]}
          >
            <Text style={[styles.metricaLabel, { color: statusBoxCor }]}>{statusBoxTitulo}</Text>
            <Text style={[styles.metricaValGargalo, { color: statusBoxVerde ? "#00E676" : "#FFF" }]} numberOfLines={2}>
              {statusBoxValor}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnPri, { marginTop: 14, flex: undefined }]}
          onPress={() => navigation.navigate("Messages")}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles-outline" size={16} color="#FF6B00" />
          <Text style={styles.btnPriText}>Abrir Conversas do Match</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="ticket-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Captação por Convites Diretos</Text>
      </View>

      <View style={styles.convitesCard}>
        <View style={styles.convitesGrid2x2}>
          <View style={styles.conviteTile}>
            <Text style={styles.conviteTileLabel}>AGUARDANDO</Text>
            <Text style={[styles.conviteTileVal, { color: "#FF6B00" }]}>{convPendentes}</Text>
          </View>
          <View style={styles.conviteTile}>
            <Text style={styles.conviteTileLabel}>ATIVADOS</Text>
            <Text style={[styles.conviteTileVal, { color: "#00E676" }]}>{convUtilizados}</Text>
          </View>
          <View style={styles.conviteTile}>
            <Text style={styles.conviteTileLabel}>EXPIRADOS</Text>
            <Text style={[styles.conviteTileVal, { color: convExpirados > 0 ? "#FF3B30" : "#FFF" }]}>
              {convExpirados}
            </Text>
          </View>
          <View style={styles.conviteTile}>
            <Text style={styles.conviteTileLabel}>TAXA DE ATIVAÇÃO</Text>
            <Text style={styles.conviteTileVal}>{taxaConvites}%</Text>
          </View>
        </View>

        <View style={styles.convitesActions}>
          <TouchableOpacity
            style={styles.btnSec}
            onPress={() => navigation.navigate("MeusAlunos")}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={16} color="#FFF" />
            <Text style={styles.btnSecText}>Gerenciar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnPri}
            onPress={() => navigation.navigate("AdicionarAluno")}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={16} color="#FF6B00" />
            <Text style={styles.btnPriText}>Novo Convite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}