import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { styles } from "./FinanceStyles";
import { useFinance, FinanceStatus } from "./useFinance";

export default function Finance({ navigation }: any) {
  const { loading, statusAtual, detalhes, historico, copiarPix, voltar } = useFinance(navigation);

  const getStatusConfig = (status: FinanceStatus) => {
    switch (status) {
      case 'em_dia':
        return { cor: "#00E676", icon: "checkmark-circle", titulo: "Assinatura em Dia", subtitulo: "Tudo certo com seus pagamentos." };
      case 'atrasado':
        return { cor: "#FF3B30", icon: "alert-circle", titulo: "Pagamento Atrasado", subtitulo: "Sua mensalidade está vencida." };
      case 'pendente':
      default:
        return { cor: "#FF6B00", icon: "time", titulo: "Vencimento Próximo", subtitulo: "Sua próxima mensalidade vence em breve." };
    }
  };

  const config = getStatusConfig(statusAtual);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FINANCEIRO</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={{ color: "#888", marginTop: 16, fontSize: 14, fontWeight: "bold" }}>Buscando dados financeiros...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.invoiceCard}>
              <View style={[styles.invoiceHeader, { borderBottomColor: config.cor }]}>
                  <View style={styles.statusRow}>
                      <Ionicons name={config.icon as any} size={24} color={config.cor} />
                      <Text style={[styles.statusTitle, { color: config.cor }]}>{config.titulo}</Text>
                  </View>
                  <Text style={styles.statusSubtitle}>{config.subtitulo}</Text>
              </View>

              <View style={styles.invoiceBody}>
                  <Text style={styles.valueLabel}>VALOR DA MENSALIDADE</Text>
                  <Text style={styles.valueText}>{detalhes.valor}</Text>
                  <View style={styles.dateBadge}>
                      <Ionicons name="calendar-outline" size={14} color="#FF6B00" />
                      <Text style={styles.dateText}>Vencimento: {detalhes.vencimento}</Text>
                  </View>
              </View>

              {statusAtual !== 'em_dia' && (
                  <View style={styles.invoiceFooter}>
                      <View style={styles.dividerDashed} />
                      
                      <Text style={styles.instructionText}>
                          1. Copie a chave PIX abaixo.{'\n'}
                          2. Faça a transferência no seu banco.{'\n'}
                          3. Envie o comprovante ao seu treinador para que ele dê baixa no sistema.
                      </Text>

                      <TouchableOpacity style={styles.btnPix} onPress={copiarPix} activeOpacity={0.8}>
                          <MaterialCommunityIcons name="content-copy" size={20} color="#000" />
                          <Text style={styles.btnPixText}>COPIAR CHAVE PIX</Text>
                      </TouchableOpacity>
                      <Text style={styles.pixHint}>Recebedor: {detalhes.nomePersonal}</Text>
                  </View>
              )}
          </View>

          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histórico de Pagamentos</Text>
              
              <View style={styles.historyList}>
                  {historico.length > 0 ? (
                    historico.map((item) => (
                        <View key={item.id} style={styles.historyCard}>
                            <View style={styles.historyIconBox}>
                                <Feather name="check" size={18} color="#00E676" />
                            </View>
                            
                            <View style={styles.historyInfo}>
                                <Text style={styles.historyMonth}>{item.mes}</Text>
                                <Text style={styles.historyDate}>Pago em {item.dataPagamento}</Text>
                            </View>
                            
                            <View style={styles.historyRight}>
                                <Text style={styles.historyValue}>{item.valor}</Text>
                            </View>
                        </View>
                    ))
                  ) : (
                    <Text style={{ color: "#666", fontStyle: "italic", textAlign: "center", marginTop: 20 }}>
                        Nenhum histórico de pagamento encontrado.
                    </Text>
                  )}
              </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}