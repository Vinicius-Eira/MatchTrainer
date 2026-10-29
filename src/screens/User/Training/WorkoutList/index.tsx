import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar,  ActivityIndicator, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { styles, MATCH_COLORS } from "./styles";
import { useWorkoutList } from "./useWorkoutList";

export function WorkoutList({ route, navigation }: any) {
  const { conexaoId } = route.params || { conexaoId: "1" };
  const { 
    loading, refreshing, onRefresh, 
    programName, programObjective, programLevel, semanas, totalTreinos, treinosConcluidosGeral, progressoPercentual,
    selectedWeekId, setSelectedWeekId, activeWeek, currentAutoWeekId,
    activeTab, setActiveTab,
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

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity style={[styles.tabBtn, activeTab === 'ROTINAS' && styles.tabBtnActive]} onPress={() => setActiveTab('ROTINAS')}>
        <Text style={[styles.tabText, activeTab === 'ROTINAS' && styles.tabTextActive]}>Rotinas de treino</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tabBtn, activeTab === 'AEROBICO' && styles.tabBtnActive]} onPress={() => setActiveTab('AEROBICO')}>
        <Text style={[styles.tabText, activeTab === 'AEROBICO' && styles.tabTextActive]}>Aeróbico</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeroProgressCard = () => {
    const isTradicional = semanas.length <= 1;

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
          {!isTradicional && (
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{semanas.length}</Text>
              <Text style={styles.statLabel}>Semanas</Text>
            </View>
          )}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MATCH_COLORS.primary} />}>
        
        {(!selectedWeekId || semanas.length <= 1) && (
          <>
            {renderHeroProgressCard()}
            {renderTabs()}
          </>
        )}

        {semanas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={56} color={MATCH_COLORS.textDim} />
            <Text style={styles.emptyTitle}>Sua ficha está vazia</Text>
            <Text style={styles.emptySubtitle}>Seu personal trainer ainda não adicionou treinos a este programa. Aguarde ou chame-o no chat.</Text>
          </View>
        ) : activeTab === 'AEROBICO' ? (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={56} color={MATCH_COLORS.textDim} />
            <Text style={styles.emptyTitle}>Área Aeróbica</Text>
            <Text style={styles.emptySubtitle}>Seu acompanhamento cardiovascular estará disponível em breve.</Text>
          </View>
        ) : (
          <>
            {!selectedWeekId && semanas.length > 1 && (
              <View>
                <Text style={styles.sectionTitle}>SEU PLANEJAMENTO</Text>
                <View style={styles.listContainer}>
                  {semanas.map((semana) => {
                    const isCurrent = semana.id === currentAutoWeekId; 
                    return (
                      <TouchableOpacity key={semana.id} style={[styles.weekCard, isCurrent && styles.weekCardActive]} activeOpacity={0.8} onPress={() => setSelectedWeekId(semana.id)}>
                        <View style={styles.weekCardContent}>
                          <View style={[styles.weekIconBox, isCurrent && styles.weekIconBoxActive]}>
                            <Ionicons name="calendar-clear-outline" size={24} color={isCurrent ? MATCH_COLORS.primary : MATCH_COLORS.textMuted} />
                          </View>
                          <View style={styles.weekInfoContainer}>
                            <View style={styles.weekHeaderRow}>
                              <Text style={styles.weekTitle}>{semana.nome}</Text>
                              {semana.is_deload && <View style={styles.deloadBadge}><Text style={styles.deloadText}>DELOAD</Text></View>}
                            </View>
                            <Text style={styles.weekMetaText}>Treinos: {semana.qtd_concluidos} feitos de {semana.qtd_treinos}</Text>
                          </View>
                          <Feather name="chevron-right" size={24} color={MATCH_COLORS.textMuted} />
                        </View>
                        {semana.qtd_treinos > 0 && (
                          <View style={[styles.progressBarContainer, { height: 4, marginTop: 18, marginBottom: 0 }]}>
                            <View style={[styles.progressBarFill, { width: `${(semana.qtd_concluidos / semana.qtd_treinos) * 100}%` }]} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {selectedWeekId && activeWeek && (
              <View>
                {semanas.length > 1 && <Text style={styles.sectionTitle}>TREINOS: {activeWeek.nome.toUpperCase()}</Text>}
                
                <View style={styles.listContainer}>
                  {activeWeek.dias.map((treino) => {
                    const isCompleted = treino.is_completed;
                    return (
                      <TouchableOpacity key={treino.id} style={[styles.dayCard, isCompleted && styles.dayCardCompleted]} activeOpacity={0.8} onPress={() => openWorkoutList(treino.id)}>
                        
                        <View style={[styles.dayIconBox, isCompleted && styles.dayIconBoxCompleted]}>
                          {isCompleted ? (
                            <Ionicons name="checkmark-sharp" size={26} color={MATCH_COLORS.success} />
                          ) : (
                            <Ionicons name="calendar-outline" size={24} color={MATCH_COLORS.primary} />
                          )}
                        </View>
                        
                        <View style={styles.weekInfoContainer}>
                          <Text style={styles.dayTitle}>{treino.nome}</Text>
                          <Text style={styles.dayObjective} numberOfLines={1}>{treino.objetivo}</Text>
                          
                          <View style={styles.dayMetricsRow}>
                            <View style={styles.dayMetricItem}>
                              <Ionicons name="list-outline" size={16} color={MATCH_COLORS.textDim} />
                              <Text style={styles.dayMetricText}>{treino.qtd_exercicios} Exer.</Text>
                            </View>
                            <View style={styles.dayMetricItem}>
                              <Ionicons name="layers-outline" size={14} color={MATCH_COLORS.textDim} />
                              <Text style={styles.dayMetricText}>{treino.qtd_series} Séries</Text>
                            </View>
                            <View style={styles.dayMetricItem}>
                              <Ionicons name="time-outline" size={14} color={MATCH_COLORS.textDim} />
                              <Text style={styles.dayMetricText}>{treino.duracao_estimada}</Text>
                            </View>
                          </View>
                        </View>
                        <Feather name="chevron-right" size={24} color={MATCH_COLORS.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};