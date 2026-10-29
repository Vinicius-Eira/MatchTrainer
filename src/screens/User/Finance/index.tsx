import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { styles } from "./styles";
import { useFinance, FinanceStatus } from "./useFinance";

export function Finance({ navigation }: any) {
  const { loading, statusAtual, detalhes, historico, copiarPix, voltar } = useFinance(navigation);

  const getStatusConfig = (status: FinanceStatus) => {
    switch (status) {
      case 'em_dia':
        return { cor: "#00E676", icon: "checkmark-circle", titulo: "Assinatura em Dia", subtitulo: "Tudo certo com seus pagamentos." };
      case 'atrasado':
        return { cor: "#FF3B30", icon: "alert-circle", titulo: "Pagamento Atrasado", subtitulo: "Sua mensalidade está vencida." };
      case 'pendente':
      default:
        return { cor: "#FF6B00", icon: "calendar-outline", titulo: "Vencimento Próximo", subtitulo: "Sua próxima mensalidade vence em breve." };
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
        <Text style={styles.headerTitle}>MEU CONTRATO</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={{ color: "#888", marginTop: 16, fontSize: 14, fontWeight: "bold" }}>Sincronizando contrato...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={[styles.invoiceCard, { borderColor: config.cor }]}>
            
            <View style={[styles.invoiceHeader, { backgroundColor: `${config.cor}10`, borderBottomColor: `${config.cor}30` }]}>
              <View style={styles.statusRow}>
                <Ionicons name={config.icon as any} size={24} color={config.cor} />
                <Text style={[styles.statusTitle, { color: config.cor }]}>
                  {config.titulo}
                </Text>
              </View>
              <Text style={styles.statusSubtitle}>{config.subtitulo}</Text>
            </View>

            <View style={styles.invoiceBody}>
              <Text style={styles.valueLabel}>PRÓXIMA FATURA</Text>
              
              {/* Preço Limpo sem sombras e com destaque */}
              <View style={styles.valueRow}>
                <Text style={styles.valueText}>{detalhes.valor}</Text>
              </View>

              <View style={styles.dateBadge}>
                <Ionicons name="calendar-clear-outline" size={16} color="#AAA" />
                <Text style={styles.dateText}>Vencimento em: <Text style={{ color: "#FFF" }}>{detalhes.vencimento}</Text></Text>
              </View>
            </View>

            {statusAtual !== 'em_dia' && (
              <View style={styles.invoiceFooter}>
                <View style={styles.dividerDashed} />
                
                <Text style={styles.pixLabel}>Pagamento via PIX</Text>
                <Text style={styles.pixHint}>
                  Transfira para <Text style={{ color: "#FFF", fontWeight: "bold" }}>{detalhes.nomePersonal}</Text> e envie o comprovante no chat para liberar o mês.
                </Text>

                <TouchableOpacity 
                  style={[styles.btnPix, { backgroundColor: config.cor }]}
                  onPress={copiarPix} 
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#000" />
                  <Text style={styles.btnPixText}>COPIAR CHAVE PIX</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="receipt-outline" size={20} color="#FF6B00" />
              <Text style={styles.sectionTitle}>Histórico de Pagamentos</Text>
            </View>
            
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
                <View style={styles.historyEmpty}>
                  <Ionicons name="wallet-outline" size={40} color="#2A2A32" style={{ marginBottom: 10 }} />
                  <Text style={styles.historyEmptyText}>
                    Nenhum registro de pagamento anterior encontrado no sistema.
                  </Text>
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}