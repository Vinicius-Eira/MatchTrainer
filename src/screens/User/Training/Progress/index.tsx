import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts"; 
import { styles } from "./styles";
import { useProgress } from "./useProgress";

const { width } = Dimensions.get("window");

const BentoCardBio = ({ titulo, valor, unidade, variacao, corV, icone, descricao }: any) => (
    <View style={{ flex: 1, backgroundColor: '#0D0D0F', borderRadius: 16, padding: 16, marginHorizontal: 4, marginBottom: 12, borderWidth: 1, borderColor: '#1C1C1F' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
             <Ionicons name={icone} size={14} color="#666" style={{ marginRight: 6 }} />
             <Text style={{ color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>{titulo}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900' }}>{valor}</Text>
            <Text style={{ color: "#666", fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{unidade}</Text>
        </View>
        {variacao !== "-" && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name={String(variacao).includes('-') ? "trending-down" : "trending-up"} size={12} color={corV} />
                <Text style={{ color: corV, fontSize: 11, marginLeft: 4, fontWeight: '800' }}>{variacao}</Text>
            </View>
        )}
        <Text style={{ color: '#555', fontSize: 9, lineHeight: 12, marginTop: 'auto' }}>{descricao}</Text>
    </View>
);

const FilterPill = ({ label, active, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: active ? '#FF6B00' : '#1A1A1A', marginRight: 8 }}>
        <Text style={{ color: active ? '#000' : '#888', fontSize: 11, fontWeight: 'bold' }}>{label}</Text>
    </TouchableOpacity>
);

const getCorRPE = (rpe: number) => {
    if (rpe <= 5) return "#00E676"; 
    if (rpe <= 7) return "#FFB300"; 
    return "#FF6B00"; 
};

export function Progress({ route, navigation }: any) {
  const { conexaoId } = route?.params || {};
  const { 
      loading, abaAtiva, setAbaAtiva, mensagemPersonal, composicaoCorporal, resumoTreinos, historico, voltar,
      metricaSelecionada, setMetricaSelecionada, periodoFiltro, setPeriodoFiltro,
      tipoSegmentar, setTipoSegmentar, graficoMestre 
  } = useProgress(navigation, conexaoId);

  const progressoMeta = () => {
      if (!composicaoCorporal.metaPeso || !composicaoCorporal.pesoInicial) return 0;
      const range = Math.abs(composicaoCorporal.pesoInicial - composicaoCorporal.metaPeso);
      const atual = Math.abs(composicaoCorporal.pesoInicial - composicaoCorporal.pesoAtual);
      return Math.min(Math.max((atual / range) * 100, 5), 100); 
  };

  const dadosSegmentar = tipoSegmentar === 'gordura' ? composicaoCorporal.segmentarGordura : composicaoCorporal.segmentarMassa;

  const isAbaixo = composicaoCorporal.imcClassificacao === 'Abaixo';
  const isNormal = composicaoCorporal.imcClassificacao === 'Normal';
  const isSobrepeso = composicaoCorporal.imcClassificacao === 'Sobrepeso';
  const isObeso = composicaoCorporal.imcClassificacao === 'Obeso';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEUS RESULTADOS</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, backgroundColor: '#111', borderRadius: 8, padding: 4 }}>
          <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: abaAtiva === 'evolucao' ? '#222' : 'transparent', borderRadius: 6 }}
              onPress={() => setAbaAtiva('evolucao')}
          >
              <Text style={{ color: abaAtiva === 'evolucao' ? '#FF6B00' : '#666', fontWeight: 'bold', fontSize: 12 }}>EVOLUÇÃO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: abaAtiva === 'corpo' ? '#222' : 'transparent', borderRadius: 6 }}
              onPress={() => setAbaAtiva('corpo')}
          >
              <Text style={{ color: abaAtiva === 'corpo' ? '#FF6B00' : '#666', fontWeight: 'bold', fontSize: 12 }}>MEU CORPO</Text>
          </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: 10 }]}>
          
          <View style={[styles.coachCardWrapper, { marginBottom: 25 }]}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={styles.absoluteFill} />
            <View style={styles.coachHeader}>
                <View style={styles.coachTitleRow}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B00" />
                    <Text style={styles.coachTitle}>Feedback do Treinador</Text>
                </View>
                <Text style={styles.coachDate}>{mensagemPersonal.data}</Text>
            </View>
            <Text style={[styles.coachMessage, !mensagemPersonal.temRecado && { color: "#888", fontStyle: "italic" }]}>
                {mensagemPersonal.texto}
            </Text>
          </View>

          {abaAtiva === 'evolucao' && (
              <>
                  <View style={{ marginBottom: 30 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15, marginHorizontal: 20 }}>
                          <View>
                              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '900' }}>Seu Progresso</Text>
                              <Text style={{ color: '#888', fontSize: 13, fontWeight: '600', marginTop: 2 }}>
                                  {composicaoCorporal.temHistorico ? `Ref: ${composicaoCorporal.dataAvaliacao}` : "Ponto de Partida"}
                              </Text>
                          </View>
                      </View>

                      <View style={{ backgroundColor: '#0D0D0F', borderRadius: 24, paddingVertical: 20, marginHorizontal: 15, borderWidth: 1, borderColor: '#1C1C1F' }}>
                          
                          {composicaoCorporal.temHistorico && (
                              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
                                  <FilterPill label="Peso" active={metricaSelecionada === 'peso'} onPress={() => setMetricaSelecionada('peso')} />
                                  <FilterPill label="Gordura" active={metricaSelecionada === 'gordura'} onPress={() => setMetricaSelecionada('gordura')} />
                                  <FilterPill label="Massa" active={metricaSelecionada === 'massa'} onPress={() => setMetricaSelecionada('massa')} />
                              </View>
                          )}

                          {(!composicaoCorporal.temHistorico || metricaSelecionada === 'peso') && (
                              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                          <Text style={{ color: '#FFF', fontSize: 36, fontWeight: '900', letterSpacing: -1 }}>{composicaoCorporal.pesoAtual}</Text>
                                          <Text style={{ color: '#888', fontSize: 16, fontWeight: '700', marginLeft: 4 }}>kg</Text>
                                      </View>
                                      <View style={{ alignItems: 'flex-end' }}>
                                          <Text style={{ color: "#888", fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>IMC: {composicaoCorporal.imcValor}</Text>
                                          <Text style={{ color: composicaoCorporal.imcClassificacao === "N/A" ? "#888" : "#FF6B00", fontSize: 12, fontWeight: '900' }}>{composicaoCorporal.imcClassificacao}</Text>
                                      </View>
                                  </View>
                                  
                                  <View style={{ height: 24, borderRadius: 12, flexDirection: 'row', overflow: 'hidden', marginTop: 10, backgroundColor: '#111' }}>
                                      <View style={{ flex: 1.2, backgroundColor: isAbaixo ? '#FF6B00' : '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#222' }}>
                                          <Text style={{ color: isAbaixo ? '#000' : '#666', fontSize: 9, fontWeight: 'bold' }}>ABAIXO</Text>
                                      </View>
                                      <View style={{ flex: 2, backgroundColor: isNormal ? '#FF6B00' : '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#222' }}>
                                          <Text style={{ color: isNormal ? '#000' : '#666', fontSize: 9, fontWeight: 'bold' }}>NORMAL</Text>
                                      </View>
                                      <View style={{ flex: 1.5, backgroundColor: isSobrepeso ? '#FF6B00' : '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#222' }}>
                                          <Text style={{ color: isSobrepeso ? '#000' : '#666', fontSize: 9, fontWeight: 'bold' }}>ACIMA</Text>
                                      </View>
                                      <View style={{ flex: 1, backgroundColor: isObeso ? '#FF6B00' : '#1A1A1A', justifyContent: 'center', alignItems: 'center' }}>
                                          <Text style={{ color: isObeso ? '#000' : '#666', fontSize: 9, fontWeight: 'bold' }}>OBESO</Text>
                                      </View>
                                  </View>
                              </View>
                          )}

                          {composicaoCorporal.temHistorico ? (
                              <>
                                  <View style={{ alignItems: 'center' }}>
                                      <LineChart
                                        data={graficoMestre}
                                        width={width - 100}
                                        height={150}
                                        thickness={4}
                                        color="#FF6B00"
                                        textColor="#666"
                                        textFontSize={10}
                                        noOfSections={3}
                                        hideRules
                                        hideYAxisText
                                        yAxisThickness={0}
                                        xAxisThickness={1}
                                        xAxisColor="#222"
                                        dataPointsColor="#FF6B00"
                                        dataPointsRadius={5}
                                        curved
                                        areaChart
                                        startFillColor="rgba(255, 107, 0, 0.2)"
                                        endFillColor="transparent"
                                      />
                                  </View>
                                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                                      <FilterPill label="1M" active={periodoFiltro === '1M'} onPress={() => setPeriodoFiltro('1M')} />
                                      <FilterPill label="3M" active={periodoFiltro === '3M'} onPress={() => setPeriodoFiltro('3M')} />
                                      <FilterPill label="6M" active={periodoFiltro === '6M'} onPress={() => setPeriodoFiltro('6M')} />
                                      <FilterPill label="TUDO" active={periodoFiltro === 'TUDO'} onPress={() => setPeriodoFiltro('TUDO')} />
                                  </View>
                              </>
                          ) : (
                              <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
                                  <Text style={{ color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>PROGRESSO ATÉ A META</Text>
                                  <View style={{ height: 12, backgroundColor: '#1A1A1A', borderRadius: 6, overflow: 'hidden' }}>
                                      <View style={{ width: `${progressoMeta()}%`, height: '100%', backgroundColor: '#FF6B00', borderRadius: 6 }} />
                                  </View>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                      <Text style={{ color: '#888', fontSize: 11 }}>Início: {composicaoCorporal.pesoInicial}kg</Text>
                                      <Text style={{ color: '#888', fontSize: 11 }}>Meta: {composicaoCorporal.metaPeso}kg</Text>
                                  </View>
                                  <View style={{ marginTop: 25, backgroundColor: 'rgba(255,107,0,0.1)', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="stats-chart" size={20} color="#FF6B00" />
                                      <Text style={{ color: '#FF6B00', fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 }}>
                                          Seu gráfico de evolução aparecerá aqui assim que o Personal cadastrar sua primeira bioimpedância!
                                      </Text>
                                  </View>
                              </View>
                          )}
                      </View>
                  </View>

                  <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Desempenho Acumulado</Text>
                      <View style={styles.resumoGrid}>
                          <View style={styles.resumoItem}>
                              <Text style={styles.resumoValor}>{resumoTreinos.concluidos}</Text>
                              <Text style={styles.resumoLabel}>Treinos Feitos</Text>
                          </View>
                          <View style={styles.resumoDivider} />
                          <View style={styles.resumoItem}>
                              <Text style={styles.resumoValor}>{resumoTreinos.volume}<Text style={styles.resumoUnidade}> kg</Text></Text>
                              <Text style={styles.resumoLabel}>Carga Movida</Text>
                          </View>
                          <View style={styles.resumoDivider} />
                          <View style={styles.resumoItem}>
                              <Text style={styles.resumoValor}>{resumoTreinos.tempo}</Text>
                              <Text style={styles.resumoLabel}>Tempo Suando</Text>
                          </View>
                      </View>
                  </View>

                  <View style={[styles.section, { marginBottom: 40 }]}>
                      <View style={styles.sectionHeaderRow}>
                          <Text style={styles.sectionTitle}>Últimos Treinos Salvos</Text>
                      </View>
                      <View style={styles.listContainer}>
                          {historico.length > 0 ? (
                              historico.map((hist: any) => (
                                  <View key={hist.id} style={{ backgroundColor: '#0D0D0F', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1C1C1F' }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                              <View style={{ backgroundColor: '#1A1A1A', padding: 8, borderRadius: 10, marginRight: 12 }}>
                                                  <Ionicons name="barbell" size={16} color="#FF6B00" />
                                              </View>
                                              <View>
                                                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: 'bold' }}>{hist.treino}</Text>
                                                  <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>Finalizado em {hist.data}</Text>
                                              </View>
                                          </View>
                                          {hist.rpe && (
                                              <View style={{ backgroundColor: getCorRPE(hist.rpe) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                                                  <Ionicons name="flame" size={12} color={getCorRPE(hist.rpe)} />
                                                  <Text style={{ color: getCorRPE(hist.rpe), fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>RPE {hist.rpe}</Text>
                                              </View>
                                          )}
                                      </View>
                                      
                                      <View style={{ flexDirection: 'row', backgroundColor: '#151515', padding: 10, borderRadius: 12 }}>
                                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                              <Ionicons name="time-outline" size={16} color="#888" />
                                              <Text style={{ color: '#AAA', fontSize: 12, marginLeft: 6 }}>{hist.duracao}</Text>
                                          </View>
                                          <View style={{ width: 1, backgroundColor: '#333', marginHorizontal: 15 }} />
                                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                              <MaterialCommunityIcons name="weight-kilogram" size={16} color="#888" />
                                              <Text style={{ color: '#AAA', fontSize: 12, marginLeft: 6 }}>{hist.volume}</Text>
                                          </View>
                                      </View>
                                  </View>
                              ))
                          ) : (
                              <View style={{ padding: 20, backgroundColor: "#0A0A0A", borderRadius: 16, borderWidth: 1, borderColor: "#1C1C1F", alignItems: "center" }}>
                                  <Ionicons name="barbell-outline" size={32} color="#333" style={{ marginBottom: 10 }} />
                                  <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                                      Seus treinos finalizados fortalecerão suas estatísticas e aparecerão aqui.
                                  </Text>
                              </View>
                          )}
                      </View>
                  </View>
              </>
          )}

          {abaAtiva === 'corpo' && (
              <>
                  <View style={{ paddingHorizontal: 15, marginBottom: 30 }}>
                      <View style={styles.sectionHeaderRow}>
                          <Text style={styles.sectionTitle}>Composição e Fisiologia</Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                          <BentoCardBio icone="pie-chart" titulo="GORDURA CORP." valor={composicaoCorporal.gordura.atual} unidade="%" variacao={composicaoCorporal.gordura.diff} corV={composicaoCorporal.gordura.boa ? "#00E676" : "#FF3B30"} descricao="Proporção de gordura em relação ao seu peso total." />
                          <BentoCardBio icone="fitness" titulo="MASSA MUSCULAR" valor={composicaoCorporal.massaMuscular.atual} unidade="kg" variacao={composicaoCorporal.massaMuscular.diff} corV={composicaoCorporal.massaMuscular.boa ? "#00E676" : "#FF3B30"} descricao="Peso total dos seus músculos esqueléticos." />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                          <BentoCardBio icone="water" titulo="ÁGUA CORPORAL" valor={composicaoCorporal.aguaCorporal.atual} unidade="L" variacao={composicaoCorporal.aguaCorporal.diff} corV={composicaoCorporal.aguaCorporal.boa ? "#00E676" : "#FF3B30"} descricao="Volume de água. Essencial para o metabolismo." />
                          <BentoCardBio icone="warning" titulo="GORD. VISCERAL" valor={composicaoCorporal.gorduraVisceral.atual} unidade="lvl" variacao={composicaoCorporal.gorduraVisceral.diff} corV={composicaoCorporal.gorduraVisceral.boa ? "#00E676" : "#FF3B30"} descricao="Gordura interna, armazenada perto dos órgãos." />
                      </View>
                      
                      <View style={{ backgroundColor: '#1A0F00', borderRadius: 16, padding: 16, marginHorizontal: -4, marginTop: 4, borderWidth: 1, borderColor: '#FF6B0040', flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ backgroundColor: '#FF6B0020', padding: 14, borderRadius: 12, marginRight: 15 }}>
                              <Ionicons name="flame" size={28} color="#FF6B00" />
                          </View>
                          <View style={{ flex: 1 }}>
                              <Text style={{ color: '#FF6B00', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }}>TAXA METABÓLICA BASAL</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: 2 }}>
                                  <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '900' }}>{composicaoCorporal.taxaMetabolica}</Text>
                                  <Text style={{ color: "#FF6B00", fontSize: 12, marginLeft: 4, fontWeight: '600' }}>kcal/dia</Text>
                              </View>
                              <Text style={{ color: '#888', fontSize: 10, lineHeight: 14 }}>A energia mínima (calorias) que o seu corpo queima para se manter vivo em absoluto repouso.</Text>
                          </View>
                      </View>
                  </View>

                  <View style={{ paddingHorizontal: 15, marginBottom: 50 }}>
                      <View style={styles.sectionHeaderRow}>
                          <Text style={styles.sectionTitle}>Análise Segmentar</Text>
                      </View>

                      <View style={{ flexDirection: 'row', backgroundColor: '#111', borderRadius: 10, padding: 4, marginBottom: 25 }}>
                          <TouchableOpacity onPress={() => setTipoSegmentar('gordura')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: tipoSegmentar === 'gordura' ? '#222' : 'transparent', borderRadius: 8 }}>
                              <Text style={{ color: tipoSegmentar === 'gordura' ? '#FF6B00' : '#666', fontWeight: '900', fontSize: 11 }}>GORDURA</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setTipoSegmentar('massa')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: tipoSegmentar === 'massa' ? '#222' : 'transparent', borderRadius: 8 }}>
                              <Text style={{ color: tipoSegmentar === 'massa' ? '#FF6B00' : '#666', fontWeight: '900', fontSize: 11 }}>MASSA MAGRA</Text>
                          </TouchableOpacity>
                      </View>
                      
                      <View style={{ backgroundColor: '#0A0A0A', borderRadius: 24, paddingVertical: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1C1C1F', position: 'relative' }}>
                          <Ionicons name="body" size={260} color="#1A1A1A" style={{ opacity: 0.8 }} />

                          <View style={{ position: 'absolute', top: 50, right: 15, alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 }}>
                              <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>BRAÇO ESQ.</Text>
                              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.bracoEsq.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                          </View>
                          <View style={{ position: 'absolute', top: 50, left: 15, alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 }}>
                              <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>BRAÇO DIR.</Text>
                              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.bracoDir.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                          </View>
                          <View style={{ position: 'absolute', top: 120, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#222' }}>
                              <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>TRONCO</Text>
                              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{dadosSegmentar.tronco.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                          </View>
                          <View style={{ position: 'absolute', bottom: 40, right: 25, alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 }}>
                              <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>PERNA ESQ.</Text>
                              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.pernaEsq.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                          </View>
                          <View style={{ position: 'absolute', bottom: 40, left: 25, alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 8 }}>
                              <Text style={{ color: '#666', fontSize: 9, fontWeight: '800' }}>PERNA DIR.</Text>
                              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.pernaDir.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                          </View>
                      </View>
                  </View>
              </>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}