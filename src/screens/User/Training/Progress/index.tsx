import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts"; 
import { styles } from "./styles";
import { useProgress } from "./useProgress";

const { width } = Dimensions.get("window");

const BentoCardBio = ({ titulo, valor, unidade, variacao, corV, icone, descricao }: any) => (
  <View style={styles.bentoBioCard}>
    <View style={styles.bentoBioHeader}>
      <Ionicons name={icone} size={14} color="#FF6B00" style={{ marginRight: 6 }} />
      <Text style={styles.bentoBioTitle}>{titulo}</Text>
    </View>
    <View style={styles.bentoBioValueRow}>
      <Text style={styles.bentoBioValue}>{valor}</Text>
      <Text style={styles.bentoBioUnit}>{unidade}</Text>
    </View>
    {variacao !== "-" && (
      <View style={styles.bentoBioDiffRow}>
        <Ionicons name={String(variacao).includes('-') ? "trending-down" : "trending-up"} size={12} color={corV} />
        <Text style={[styles.bentoBioDiffText, { color: corV }]}>{variacao}</Text>
      </View>
    )}
    <Text style={styles.bentoBioDesc}>{descricao}</Text>
  </View>
);

const BentoDesempenho = ({ valor, titulo, icone, descricao, corDestaque = "#FFF" }: any) => (
  <View style={styles.bentoDesempenhoCard}>
    <View style={styles.desempenhoHeaderRow}>
      <View style={styles.desempenhoIconWrap}>
        <Ionicons name={icone} size={14} color="#FF6B00" />
      </View>
      <Text style={styles.desempenhoTitle} numberOfLines={1}>{titulo}</Text>
    </View>
    <Text style={[styles.desempenhoValor, { color: corDestaque }]} numberOfLines={1} adjustsFontSizeToFit>{valor}</Text>
    <Text style={styles.desempenhoDesc} numberOfLines={1}>{descricao}</Text>
  </View>
);

const FilterPill = ({ label, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.filterPill, active && styles.filterPillActive]}>
    <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const getLeituraEsforço = (rpe?: number | null) => {
  if (!rpe) return { texto: "Sessão Concluída", sub: "Mais um treino registrado na sua jornada", percentual: 100, tag: "Concluído", cor: "#00E676" };
  if (rpe <= 4) return { texto: "Esforço Leve e Confortável", sub: "Ritmo ideal para recuperação e técnica", percentual: rpe * 10, tag: "Leve", cor: "#00E676" };
  if (rpe <= 7) return { texto: "Esforço Moderado", sub: "Boa intensidade e excelente controle de carga", percentual: rpe * 10, tag: "Moderado", cor: "#FFB300" };
  if (rpe <= 8) return { texto: "Treino Intenso", sub: "Alto nível de dedicação e foco muscular", percentual: rpe * 10, tag: "Intenso", cor: "#FF6B00" };
  return { texto: "Exigência Máxima / No Limite", sub: "Treino pesado! Descanse bem para recuperar", percentual: Math.min(100, rpe * 10), tag: "Máximo", cor: "#EF4444" };
};

export function Progress({ route, navigation }: any) {
  const { conexaoId } = route?.params || {};
  const { 
    loading, abaAtiva, setAbaAtiva, mensagemPersonal, composicaoCorporal, 
    resumoTreinos, historico, voltar,
    metricaSelecionada, setMetricaSelecionada, periodoFiltro, setPeriodoFiltro,
    tipoSegmentar, setTipoSegmentar, graficoMestre 
  } = useProgress(navigation, conexaoId);

  const progressoMeta = () => {
    if (!composicaoCorporal.metaPeso || !composicaoCorporal.pesoInicial) return 0;
    const range = Math.abs(composicaoCorporal.pesoInicial - composicaoCorporal.metaPeso);
    if (range === 0) return 100;
    const atual = Math.abs(composicaoCorporal.pesoInicial - composicaoCorporal.pesoAtual);
    return Math.min(Math.max((atual / range) * 100, 8), 100); 
  };

  const calcularDistanciaMeta = () => {
    if (!composicaoCorporal.metaPeso || !composicaoCorporal.pesoAtual) return "Defina sua meta";
    const diff = Number((composicaoCorporal.pesoAtual - composicaoCorporal.metaPeso).toFixed(1));
    if (Math.abs(diff) <= 0.3) return "Meta Atingida!";
    return diff > 0 ? `Faltam -${diff} kg` : `Faltam +${Math.abs(diff)} kg`;
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
        <Text style={styles.headerTitle}>SUA EVOLUÇÃO</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabSwitchContainer}>
        <TouchableOpacity 
          style={[styles.tabSwitchBtn, abaAtiva === 'evolucao' && styles.tabSwitchBtnActive]}
          onPress={() => setAbaAtiva('evolucao')}
        >
          <Text style={[styles.tabSwitchText, abaAtiva === 'evolucao' && styles.tabSwitchTextActive]}>DESEMPENHO</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabSwitchBtn, abaAtiva === 'corpo' && styles.tabSwitchBtnActive]}
          onPress={() => setAbaAtiva('corpo')}
        >
          <Text style={[styles.tabSwitchText, abaAtiva === 'corpo' && styles.tabSwitchTextActive]}>MEU CORPO</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: 6 }]}>
          
          <View style={styles.coachCardWrapper}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.14)", "transparent"]} style={styles.absoluteFill} />
            <View style={styles.coachHeader}>
              <View style={styles.coachTitleRow}>
                <View style={styles.coachIconBadge}>
                  <Ionicons name="chatbubble-ellipses" size={15} color="#FF6B00" />
                </View>
                <View>
                  <Text style={styles.coachTitle}>Feedback do Treinador</Text>
                  <Text style={styles.coachSubTitle}>Orientação sobre o seu acompanhamento</Text>
                </View>
              </View>
              <View style={styles.coachDateBadge}>
                <Text style={styles.coachDate}>{mensagemPersonal.data}</Text>
              </View>
            </View>
            <View style={styles.coachQuoteBox}>
              <Text style={[styles.coachMessage, !mensagemPersonal.temRecado && { color: "#71717A", fontStyle: "italic" }]}>
                {mensagemPersonal.texto}
              </Text>
            </View>
          </View>

          {abaAtiva === 'evolucao' && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeaderWithBadge}>
                  <View>
                    <Text style={styles.mainSectionTitle}>Seu Progresso</Text>
                    <Text style={styles.mainSectionSub}>
                      {composicaoCorporal.temHistorico ? `Avaliação física: ${composicaoCorporal.dataAvaliacao}` : "Acompanhamento de Peso e Metas"}
                    </Text>
                  </View>
                  <View style={[styles.estadoBadge, composicaoCorporal.temHistorico && styles.estadoBadgeAtivo]}>
                    <Ionicons name={composicaoCorporal.temHistorico ? "checkmark-circle" : "flag-outline"} size={12} color={composicaoCorporal.temHistorico ? "#00E676" : "#FF6B00"} />
                    <Text style={[styles.estadoBadgeText, composicaoCorporal.temHistorico && { color: "#00E676" }]}>
                      {composicaoCorporal.temHistorico ? "Bio Ativa" : "Ponto de Partida"}
                    </Text>
                  </View>
                </View>

                <View style={styles.resumoAtualCard}>
                  <View style={styles.resumoValoresRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resumoLabel}>PESO ATUAL</Text>
                      <View style={styles.resumoBigValueRow}>
                        <Text style={styles.resumoBigValue}>
                          {composicaoCorporal.pesoAtual > 0 ? composicaoCorporal.pesoAtual : "--"}
                        </Text>
                        <Text style={styles.resumoBigUnit}>kg</Text>
                        {composicaoCorporal.variacaoPeso?.diff !== "-" && (
                          <View style={[styles.diffPill, { backgroundColor: composicaoCorporal.variacaoPeso.boa ? 'rgba(0,230,118,0.15)' : 'rgba(255,69,58,0.15)' }]}>
                            <Text style={{ color: composicaoCorporal.variacaoPeso.boa ? '#00E676' : '#FF453A', fontSize: 10, fontWeight: '900' }}>
                              {composicaoCorporal.variacaoPeso.diff}kg
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.resumoVerticalDivider} />

                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.resumoLabel}>META DO ALUNO</Text>
                      <View style={styles.resumoBigValueRow}>
                        <Text style={styles.resumoMetaValue}>
                          {composicaoCorporal.metaPeso > 0 ? composicaoCorporal.metaPeso : "--"}
                        </Text>
                        <Text style={styles.resumoBigUnit}>kg</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.metaStatusRow}>
                    <View style={styles.metaStatusItem}>
                      <Ionicons name="analytics-outline" size={14} color="#FF6B00" style={{ marginRight: 5 }} />
                      <Text style={styles.metaStatusLabel}>Meta: </Text>
                      <Text style={styles.metaStatusHighlight}>{calcularDistanciaMeta()}</Text>
                    </View>
                    <View style={styles.metaStatusItem}>
                      <Text style={styles.metaStatusLabel}>IMC {composicaoCorporal.imcValor > 0 ? composicaoCorporal.imcValor : "--"} • </Text>
                      <Text style={[styles.metaStatusHighlight, { color: isNormal ? '#00E676' : '#FF6B00' }]}>
                        {composicaoCorporal.imcClassificacao}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.imcBarContainer}>
                    <View style={[styles.imcBarSegment, { flex: 1.2, backgroundColor: isAbaixo ? '#FF6B00' : '#16161A' }]}>
                      <Text style={[styles.imcBarText, { color: isAbaixo ? '#000' : '#666' }]}>ABAIXO</Text>
                    </View>
                    <View style={[styles.imcBarSegment, { flex: 2, backgroundColor: isNormal ? '#00E676' : '#16161A' }]}>
                      <Text style={[styles.imcBarText, { color: isNormal ? '#000' : '#666' }]}>NORMAL</Text>
                    </View>
                    <View style={[styles.imcBarSegment, { flex: 1.5, backgroundColor: isSobrepeso ? '#FF6B00' : '#16161A' }]}>
                      <Text style={[styles.imcBarText, { color: isSobrepeso ? '#000' : '#666' }]}>ACIMA</Text>
                    </View>
                    <View style={[styles.imcBarSegment, { flex: 1, borderRightWidth: 0, backgroundColor: isObeso ? '#EF4444' : '#16161A' }]}>
                      <Text style={[styles.imcBarText, { color: isObeso ? '#FFF' : '#666' }]}>OBESO</Text>
                    </View>
                  </View>

                  {composicaoCorporal.temHistorico ? (
                    <View style={styles.chartSectionWrapper}>
                      <View style={styles.metricFilterRow}>
                        <FilterPill label="Peso (kg)" active={metricaSelecionada === 'peso'} onPress={() => setMetricaSelecionada('peso')} />
                        <FilterPill label="Gordura (%)" active={metricaSelecionada === 'gordura'} onPress={() => setMetricaSelecionada('gordura')} />
                        <FilterPill label="Massa (kg)" active={metricaSelecionada === 'massa'} onPress={() => setMetricaSelecionada('massa')} />
                      </View>

                      <View style={styles.mountainChartBox}>
                        <LineChart
                          data={graficoMestre}
                          width={width - 110}
                          height={150}
                          thickness={3.5}
                          color="#FF6B00"
                          textColor="#FFFFFF"
                          textFontSize={11}
                          textShiftY={-8}
                          textShiftX={-4}
                          noOfSections={3}
                          hideRules
                          hideYAxisText
                          yAxisThickness={0}
                          xAxisThickness={1}
                          xAxisColor="#26262E"
                          xAxisLabelTextStyle={{ color: '#888', fontSize: 10, fontWeight: '700' }}
                          dataPointsColor="#FF6B00"
                          dataPointsRadius={5.5}
                          curved
                          areaChart
                          startFillColor="rgba(255, 107, 0, 0.30)"
                          endFillColor="rgba(255, 107, 0, 0.01)"
                        />
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
                        <FilterPill label="1M" active={periodoFiltro === '1M'} onPress={() => setPeriodoFiltro('1M')} />
                        <FilterPill label="3M" active={periodoFiltro === '3M'} onPress={() => setPeriodoFiltro('3M')} />
                        <FilterPill label="6M" active={periodoFiltro === '6M'} onPress={() => setPeriodoFiltro('6M')} />
                        <FilterPill label="TUDO" active={periodoFiltro === 'TUDO'} onPress={() => setPeriodoFiltro('TUDO')} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.metaProgressBox}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={styles.metaProgressTitle}>PROGRESSO ATÉ A META</Text>
                        <Text style={styles.metaProgressPercent}>
                          {composicaoCorporal.metaPeso > 0 ? `${Math.round(progressoMeta())}%` : "Meta pendente"}
                        </Text>
                      </View>
                      <View style={styles.metaProgressBarBg}>
                        <View style={[styles.metaProgressBarFill, { width: `${progressoMeta()}%` }]} />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={styles.metaSubLabel}>Início: {composicaoCorporal.pesoInicial || "--"} kg</Text>
                        <Text style={styles.metaSubLabel}>Alvo: {composicaoCorporal.metaPeso || "--"} kg</Text>
                      </View>
                      <View style={styles.smartNutriHintBox}>
                        <Ionicons name="trending-up" size={18} color="#FF6B00" />
                        <Text style={styles.smartNutriHintText}>
                          A curva de evolução por mês aparecerá aqui assim que seu Personal registrar sua bioimpedância.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Desempenho Acumulado</Text>
                
                <View style={styles.bentoDesempenhoRow}>
                  <BentoDesempenho 
                    titulo="SEQUÊNCIA" 
                    valor={resumoTreinos.streak} 
                    icone="flame" 
                    descricao="Dias seguidos" 
                    corDestaque="#FF6B00" 
                  />
                  <BentoDesempenho 
                    titulo="CONCLUÍDOS" 
                    valor={resumoTreinos.concluidos} 
                    icone="checkmark-circle" 
                    descricao="Total geral" 
                    corDestaque="#FFFFFF" 
                  />
                  <BentoDesempenho 
                    titulo="NO MÊS" 
                    valor={resumoTreinos.ultimos30Dias} 
                    icone="calendar" 
                    descricao="Últimos 30 dias" 
                    corDestaque="#00E676" 
                  />
                </View>
              </View>

              <View style={[styles.section, { marginBottom: 40 }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Últimos Treinos Salvos</Text>
                  <Text style={styles.sectionCountText}>{historico.length} sessões</Text>
                </View>

                <View style={styles.listContainer}>
                  {historico.length > 0 ? (
                    historico.map((hist: any) => {
                      const analise = getLeituraEsforço(hist.rpe);

                      return (
                        <View key={hist.id} style={styles.treinoLogCard}>
                          <View style={styles.treinoLogTopRow}>
                            <View style={styles.treinoLogLeftRow}>
                              <View style={styles.treinoLogIconBox}>
                                <Ionicons name="barbell" size={18} color="#FF6B00" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.treinoLogTitle} numberOfLines={1}>
                                  {hist.treino}
                                </Text>
                                <View style={styles.treinoLogDateRow}>
                                  <Ionicons name="calendar-outline" size={11} color="#888" style={{ marginRight: 4 }} />
                                  <Text style={styles.treinoLogDateText}>
                                    Realizado em {hist.data}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View style={[styles.rpeBadge, { backgroundColor: analise.cor + '18', borderColor: analise.cor + '45' }]}>
                              <Ionicons name="flame" size={13} color={analise.cor} />
                              <Text style={[styles.rpeBadgeText, { color: analise.cor }]}>{analise.tag}</Text>
                            </View>
                          </View>

                          <View style={styles.treinoLogBottomPanel}>
                            <View style={styles.treinoLogAnalysisHeader}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="pulse" size={14} color={analise.cor} style={{ marginRight: 6 }} />
                                <Text style={styles.treinoLogAnalysisTitle}>{analise.texto}</Text>
                              </View>
                              <Text style={[styles.treinoLogIntensityPct, { color: analise.cor }]}>
                                {analise.percentual}% INTENSIDADE
                              </Text>
                            </View>

                            <View style={styles.treinoLogBarBg}>
                              <View style={[styles.treinoLogBarFill, { width: `${analise.percentual}%`, backgroundColor: analise.cor }]} />
                            </View>

                            <Text style={styles.treinoLogAnalysisSub}>{analise.sub}</Text>

                            <View style={styles.sessionPillsRow}>
                              <View style={styles.sessionPillItem}>
                                <Ionicons name="time-outline" size={13} color="#FF6B00" style={{ marginRight: 5 }} />
                                <Text style={styles.sessionPillText}>
                                  {hist.duracaoReal ? `Duração: ${hist.duracaoReal}` : "Sessão Registrada"}
                                </Text>
                              </View>
                              {hist.volumeReal && (
                                <View style={styles.sessionPillItem}>
                                  <MaterialCommunityIcons name="weight-kilogram" size={14} color="#FF6B00" style={{ marginRight: 5 }} />
                                  <Text style={styles.sessionPillText}>Volume: {hist.volumeReal}</Text>
                                </View>
                              )}
                            </View>

                            {hist.comentarioAluno ? (
                              <View style={styles.comentarioAlunoBox}>
                                <Ionicons name="chatbox-ellipses-outline" size={13} color="#FF6B00" style={{ marginRight: 6, marginTop: 1 }} />
                                <Text style={styles.comentarioAlunoText}>
                                  {hist.comentarioAluno}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyHistoryCard}>
                      <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={36} color="#333" style={{ marginBottom: 10 }} />
                      <Text style={styles.emptyHistoryText}>
                        Nenhum treino concluído ainda.{'\n'}Finalize sua próxima sessão para gerar seu histórico.
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
                  <Text style={styles.sectionCountText}>
                    {composicaoCorporal.temHistorico ? `Ref: ${composicaoCorporal.dataAvaliacao}` : "Aguardando Bio"}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                  <BentoCardBio icone="pie-chart" titulo="GORDURA CORP." valor={composicaoCorporal.gordura.atual} unidade="%" variacao={composicaoCorporal.gordura.diff} corV={composicaoCorporal.gordura.boa ? "#00E676" : "#FF3B30"} descricao="Proporção de gordura em relação ao seu peso total." />
                  <BentoCardBio icone="fitness" titulo="MASSA MUSCULAR" valor={composicaoCorporal.massaMuscular.atual} unidade="kg" variacao={composicaoCorporal.massaMuscular.diff} corV={composicaoCorporal.massaMuscular.boa ? "#00E676" : "#FF3B30"} descricao="Peso total dos seus músculos esqueléticos." />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 }}>
                  <BentoCardBio icone="water" titulo="ÁGUA CORPORAL" valor={composicaoCorporal.aguaCorporal.atual} unidade="L" variacao={composicaoCorporal.aguaCorporal.diff} corV={composicaoCorporal.aguaCorporal.boa ? "#00E676" : "#FF3B30"} descricao="Volume de água. Essencial para o metabolismo." />
                  <BentoCardBio icone="warning" titulo="GORD. VISCERAL" valor={composicaoCorporal.gorduraVisceral.atual} unidade="lvl" variacao={composicaoCorporal.gorduraVisceral.diff} corV={composicaoCorporal.gorduraVisceral.boa ? "#00E676" : "#FF3B30"} descricao="Gordura interna, armazenada perto dos órgãos." />
                </View>
                
                <View style={{ backgroundColor: '#1A0F00', borderRadius: 18, padding: 18, marginHorizontal: -4, marginTop: 4, borderWidth: 1, borderColor: '#FF6B0040', flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#FF6B0020', padding: 14, borderRadius: 14, marginRight: 15 }}>
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

                <View style={{ flexDirection: 'row', backgroundColor: '#111114', borderRadius: 10, padding: 4, marginBottom: 25, borderWidth: 1, borderColor: '#1E1E24' }}>
                  <TouchableOpacity onPress={() => setTipoSegmentar('gordura')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: tipoSegmentar === 'gordura' ? '#222228' : 'transparent', borderRadius: 8 }}>
                    <Text style={{ color: tipoSegmentar === 'gordura' ? '#FF6B00' : '#666', fontWeight: '900', fontSize: 11 }}>GORDURA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTipoSegmentar('massa')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: tipoSegmentar === 'massa' ? '#222228' : 'transparent', borderRadius: 8 }}>
                    <Text style={{ color: tipoSegmentar === 'massa' ? '#FF6B00' : '#666', fontWeight: '900', fontSize: 11 }}>MASSA MAGRA</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={{ backgroundColor: '#0A0A0C', borderRadius: 24, paddingVertical: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1C1C22', position: 'relative' }}>
                  <Ionicons name="body" size={260} color="#1A1A1F" style={{ opacity: 0.85 }} />

                  <View style={{ position: 'absolute', top: 50, right: 15, alignItems: 'flex-end', backgroundColor: 'rgba(13,13,16,0.85)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#222228' }}>
                    <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>BRAÇO ESQ.</Text>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.bracoEsq.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={{ position: 'absolute', top: 50, left: 15, alignItems: 'flex-start', backgroundColor: 'rgba(13,13,16,0.85)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#222228' }}>
                    <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>BRAÇO DIR.</Text>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.bracoDir.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={{ position: 'absolute', top: 120, alignItems: 'center', backgroundColor: 'rgba(13,13,16,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FF6B0040' }}>
                    <Text style={{ color: '#FF6B00', fontSize: 9, fontWeight: '900' }}>TRONCO</Text>
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{dadosSegmentar.tronco.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={{ position: 'absolute', bottom: 40, right: 25, alignItems: 'flex-end', backgroundColor: 'rgba(13,13,16,0.85)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#222228' }}>
                    <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>PERNA ESQ.</Text>
                    <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900' }}>{dadosSegmentar.pernaEsq.atual} <Text style={{ fontSize: 12, color: '#888' }}>kg</Text></Text>
                  </View>
                  <View style={{ position: 'absolute', bottom: 40, left: 25, alignItems: 'flex-start', backgroundColor: 'rgba(13,13,16,0.85)', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#222228' }}>
                    <Text style={{ color: '#888', fontSize: 9, fontWeight: '800' }}>PERNA DIR.</Text>
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