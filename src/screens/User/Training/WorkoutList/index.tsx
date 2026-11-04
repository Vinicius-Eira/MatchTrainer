import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { styles, MATCH_COLORS } from "./styles";
import { useWorkoutList } from "./useWorkoutList";

export function WorkoutList({ route, navigation }: any) {
  const { conexaoId } = route.params || { conexaoId: "1" };
  const { 
    loading, refreshing, onRefresh, 
    programName, programObjective, programLevel, semanas, totalTreinos, treinosConcluidosGeral, progressoPercentual,
    selectedWeekId, setSelectedWeekId, activeWeek, currentAutoWeekId,
    openWorkoutList, voltar 
  } = useWorkoutList(navigation, conexaoId);

  const dataDeHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const renderHeader = () => (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
        <Ionicons name="chevron-back" size={22} color={MATCH_COLORS.textBase} />
      </TouchableOpacity>
      
      <View style={styles.headerTitles}>
        <Text style={styles.headerTitleCenter}>Meus treinos</Text>
        <Text style={styles.headerSubtitleCenter}>Acompanhe e conquiste cada etapa</Text>
      </View>
      
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderHeroProgressCard = () => {
    return (
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text style={styles.heroObjective} numberOfLines={1}>{programObjective}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <MaterialCommunityIcons name="stairs-up" size={16} color={MATCH_COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.heroLevel}>{programLevel}</Text>
            </View>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="calendar-outline" size={14} color={MATCH_COLORS.primary} />
            <Text style={styles.heroBadgeText}>{dataDeHoje}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{treinosConcluidosGeral}</Text>
            <Text style={styles.statLabel}>Treinos Feitos</Text>
          </View>
          <View style={[styles.statBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.statValue}>{totalTreinos > 0 ? `${treinosConcluidosGeral}/${totalTreinos}` : '-'}</Text>
            <Text style={styles.statLabel}>Meta Total</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressoPercentual}%` }]} />
        </View>
        <Text style={styles.progressDisclaimer}>
          {totalTreinos > 0 
            ? `${Math.round(progressoPercentual)}% do programa concluído.` 
            : 'Os dados do programa aparecerão aqui em breve.'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
        {renderHeader()}
        <View style={styles.center}><ActivityIndicator size="large" color={MATCH_COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: 10 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MATCH_COLORS.primary} />}>
        
        {(!selectedWeekId || semanas.length <= 1) && (
          <>
            {renderHeroProgressCard()}
          </>
        )}

        {semanas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={56} color={MATCH_COLORS.textDim} />
            <Text style={styles.emptyTitle}>Sua rotina está vazia</Text>
            <Text style={styles.emptySubtitle}>Seu personal trainer ainda não adicionou treinos a este programa. Aguarde ou chame-o no chat.</Text>
          </View>
        ) : (
          <>
            {!selectedWeekId && (
              <View style={styles.listContainer}>
                {semanas.map((semana) => {
                  const isCurrent = semana.id === currentAutoWeekId;

                  return (
                    <TouchableOpacity 
                        key={semana.id} 
                        activeOpacity={0.8} 
                        onPress={() => setSelectedWeekId(semana.id)}
                        style={{
                            backgroundColor: '#121214',
                            borderRadius: 20,
                            padding: 18,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: isCurrent ? 'rgba(255, 107, 0, 0.6)' : 'rgba(255, 107, 0, 0.2)',
                            shadowColor: "#FF6B00",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isCurrent ? 0.3 : 0.1,
                            shadowRadius: 10,
                            elevation: isCurrent ? 5 : 2
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 107, 0, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.4)' }}>
                                    <Ionicons name="calendar" size={20} color={MATCH_COLORS.primary} />
                                </View>
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '900', marginLeft: 12, textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }} numberOfLines={2}>
                                    {semana.titulo_formatado}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={22} color={MATCH_COLORS.primary} />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1D', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 }}>
                            <Ionicons name="time-outline" size={14} color={MATCH_COLORS.textMuted} />
                            <Text style={{ color: '#CCC', fontSize: 13, marginLeft: 6, fontWeight: '600' }}>
                                {semana.date_range_formatted || 'Datas não definidas'}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Ionicons name="barbell-outline" size={12} color="#AAA" />
                                <Text style={{ color: '#AAA', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>{semana.qtd_treinos} TREINOS</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Ionicons name="body-outline" size={12} color="#AAA" />
                                <Text style={{ color: '#AAA', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>{programLevel}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedWeekId && activeWeek && (
              <View>
                
                <TouchableOpacity 
                    onPress={() => setSelectedWeekId(null)} 
                    style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20 }}
                    activeOpacity={0.7}
                >
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Ionicons name="chevron-back" size={20} color="#FFF" />
                    </View>
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 12 }}>Semanas</Text>
                </TouchableOpacity>

                <View style={{ backgroundColor: '#121214', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.4)', shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 15, alignItems: 'center' }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 107, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="calendar" size={24} color={MATCH_COLORS.primary} />
                    </View>
                    
                    <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 12 }}>
                        {activeWeek.titulo_formatado}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1D', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2D' }}>
                        <Ionicons name="time-outline" size={16} color={MATCH_COLORS.primary} />
                        <Text style={{ color: '#FFF', fontSize: 13, marginLeft: 6, fontWeight: '700' }}>
                            {activeWeek.date_range_formatted || 'Datas não definidas'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-done-circle" size={16} color={MATCH_COLORS.success} />
                        <Text style={{ color: '#CCC', fontSize: 12, marginLeft: 6, fontWeight: '600' }}>
                            {activeWeek.qtd_concluidos} de {activeWeek.qtd_treinos} treinos concluídos
                        </Text>
                    </View>
                </View>

                {activeWeek.general_notes ? (
                    <View style={{ backgroundColor: '#121214', padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#2A2A2D' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons name="chatbubbles" size={18} color={MATCH_COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={{ color: MATCH_COLORS.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Orientações do Personal</Text>
                        </View>
                        <Text style={{ color: '#DDD', fontSize: 14, lineHeight: 22, fontWeight: '500' }}>{activeWeek.general_notes}</Text>
                    </View>
                ) : null}

                {activeWeek.dias.map((treino) => {
                  const isCompleted = treino.is_completed;

                  return (
                    <View key={treino.id} style={{ 
                        backgroundColor: '#0D0D0F', 
                        borderRadius: 20, 
                        padding: 18, 
                        marginBottom: 16, 
                        borderWidth: 1, 
                        borderColor: isCompleted ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                        shadowColor: isCompleted ? "#00E676" : "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isCompleted ? 0.1 : 0.3,
                        shadowRadius: 10,
                        elevation: 4
                    }}>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ backgroundColor: '#1A1A1D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                                <Text style={{ color: MATCH_COLORS.primary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {treino.dia_semana}
                                </Text>
                            </View>
                            
                            {isCompleted && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 230, 118, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' }}>
                                    <Ionicons name="checkmark-done" size={14} color={MATCH_COLORS.success} />
                                    <Text style={{ color: MATCH_COLORS.success, fontSize: 10, fontWeight: '900', marginLeft: 4, letterSpacing: 0.5 }}>FEITO</Text>
                                </View>
                            )}
                        </View>

                        <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 4, letterSpacing: 0.5 }}>
                            {treino.nome}
                        </Text>
                        <Text style={{ color: '#888', fontSize: 14, marginBottom: 20, fontWeight: '600' }}>
                            {treino.objetivo}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="barbell" size={16} color={MATCH_COLORS.textDim} />
                                <Text style={{ color: '#CCC', fontSize: 12, marginLeft: 6, fontWeight: '700' }}>{treino.qtd_exercicios} exercícios</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="time" size={16} color={MATCH_COLORS.textDim} />
                                <Text style={{ color: '#CCC', fontSize: 12, marginLeft: 6, fontWeight: '700' }}>{treino.duracao_estimada}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity 
                                onPress={() => openWorkoutList(treino.id)}
                                style={{ 
                                    flex: 1, 
                                    backgroundColor: isCompleted ? 'rgba(255,255,255,0.05)' : 'transparent', 
                                    paddingVertical: 14, 
                                    borderRadius: 14, 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: isCompleted ? 'rgba(255,255,255,0.1)' : MATCH_COLORS.primary
                                }}
                            >
                                <Text style={{ 
                                    color: isCompleted ? '#888' : MATCH_COLORS.primary, 
                                    fontSize: 14, 
                                    fontWeight: '900', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: 1
                                }}>
                                    {isCompleted ? "Refazer Treino" : "Iniciar Treino"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};