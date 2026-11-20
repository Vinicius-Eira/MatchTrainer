import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { localStyles } from "../styles";
import { getAnaliseIntensidade } from "../useTabTreinosEvolucao";

export function ModalExecucaoTreino({
  treinoSelecionado,
  exercicioExpandidoId,
  onAlternarExercicio,
  onFechar,
}: any) {
  const analiseModal = treinoSelecionado ? getAnaliseIntensidade(treinoSelecionado.rpe) : null;
  const dataModalFormatada = treinoSelecionado?.created_at
    ? new Date(treinoSelecionado.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--/--/----";

  return (
    <Modal visible={Boolean(treinoSelecionado)} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={localStyles.modalBadgeRow}>
                <View style={localStyles.modalTagSemana}>
                  <Ionicons name="barbell" size={11} color="#FF6B00" style={{ marginRight: 4 }} />
                  <Text style={localStyles.modalTagSemanaText}>
                    {treinoSelecionado?.nomeSemana ? treinoSelecionado.nomeSemana.toUpperCase() : "RELATÓRIO DE EXECUÇÃO"}
                  </Text>
                </View>
                {analiseModal && (
                  <View
                    style={[
                      localStyles.modalIntensityBadge,
                      { backgroundColor: analiseModal.cor + "18", borderColor: analiseModal.cor + "45" },
                    ]}
                  >
                    <Ionicons name="flame" size={11} color={analiseModal.cor} style={{ marginRight: 4 }} />
                    <Text style={[localStyles.modalIntensityText, { color: analiseModal.cor }]}>
                      Esforço: {analiseModal.label}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={localStyles.modalTitle} numberOfLines={1}>
                {treinoSelecionado?.nomeTreinoCurto || treinoSelecionado?.nomeTreino || "Treino Realizado"}
              </Text>
              <Text style={localStyles.modalSubDate}>
                Realizado em {dataModalFormatada} às {treinoSelecionado?.horario}
              </Text>
            </View>

            <TouchableOpacity style={localStyles.modalCloseBtn} onPress={onFechar}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.modalScrollContent}>
            <View style={localStyles.modalStatsGrid}>
              <View style={localStyles.modalStatBox}>
                <Ionicons name="time-outline" size={18} color="#FF6B00" style={{ marginBottom: 4 }} />
                <Text style={localStyles.modalStatValue}>{treinoSelecionado?.duracao || "--"}</Text>
                <Text style={localStyles.modalStatLabel}>Duração</Text>
              </View>

              <View style={localStyles.modalStatBox}>
                <MaterialCommunityIcons name="weight-kilogram" size={18} color="#FF6B00" style={{ marginBottom: 4 }} />
                <Text style={localStyles.modalStatValue}>{treinoSelecionado?.volumeTotal || "--"}</Text>
                <Text style={localStyles.modalStatLabel}>Volume Total</Text>
              </View>

              <View style={localStyles.modalStatBox}>
                <Ionicons name="checkmark-done-circle-outline" size={18} color="#00E676" style={{ marginBottom: 4 }} />
                <Text style={localStyles.modalStatValue}>{treinoSelecionado?.seriesResumo || "--"}</Text>
                <Text style={localStyles.modalStatLabel}>Séries Feitas</Text>
              </View>

              <View style={localStyles.modalStatBox}>
                <Ionicons name="trophy-outline" size={18} color="#FFD700" style={{ marginBottom: 4 }} />
                <Text style={localStyles.modalStatValue}>
                  {treinoSelecionado?.prsCount > 0 ? `${treinoSelecionado.prsCount} PRs` : treinoSelecionado?.maiorCargaSessao || "--"}
                </Text>
                <Text style={localStyles.modalStatLabel}>
                  {treinoSelecionado?.prsCount > 0 ? "Recordes" : "Maior Carga"}
                </Text>
              </View>
            </View>

            {(treinoSelecionado?.sentiuDor || treinoSelecionado?.comentarioFinal) && (
              <View style={localStyles.modalFeedbackSection}>
                <Text style={localStyles.modalSectionTitle}>Feedback & Alertas do Aluno</Text>

                {treinoSelecionado?.sentiuDor && (
                  <View style={localStyles.modalPainAlertCard}>
                    <View style={localStyles.modalPainHeader}>
                      <View style={localStyles.modalPainIconBox}>
                        <Ionicons name="warning" size={18} color="#EF4444" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={localStyles.modalPainTitle}>Alerta de Dor / Desconforto na Sessão</Text>
                        <Text style={localStyles.modalPainSubtitle}>
                          Verifique a carga e a amplitude nos exercícios sinalizados abaixo.
                        </Text>
                      </View>
                    </View>

                    {treinoSelecionado?.relatosDorSessao?.length > 0 && (
                      <View style={localStyles.modalPainList}>
                        {treinoSelecionado.relatosDorSessao.map((dor: any, dIdx: number) => (
                          <View key={dIdx} style={localStyles.modalPainItem}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                              <Text style={localStyles.modalPainExName}>{dor.exercicioNome}</Text>
                              {dor.intensidade !== null && dor.intensidade !== undefined && (
                                <View style={localStyles.modalPainLevelBadge}>
                                  <Text style={localStyles.modalPainLevelText}>Nível {dor.intensidade}/10</Text>
                                </View>
                              )}
                            </View>
                            <Text style={localStyles.modalPainDesc}>{dor.descricao}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {treinoSelecionado?.comentarioFinal && (
                  <View style={localStyles.modalStudentCommentCard}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <Ionicons name="chatbubble-ellipses" size={15} color="#FF6B00" style={{ marginRight: 6 }} />
                      <Text style={localStyles.modalStudentCommentLabel}>COMENTÁRIO FINAL DO ALUNO:</Text>
                    </View>
                    <Text style={localStyles.modalStudentCommentText}>{treinoSelecionado.comentarioFinal}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ marginTop: 6 }}>
              <Text style={localStyles.modalSectionTitle}>
                Exercícios Realizados ({treinoSelecionado?.exerciciosDetalhados?.length || 0})
              </Text>

              {treinoSelecionado?.exerciciosDetalhados?.length > 0 ? (
                treinoSelecionado.exerciciosDetalhados.map((ex: any, index: number) => {
                  const isExpanded = exercicioExpandidoId === ex.id;

                  return (
                    <View
                      key={ex.id || index}
                      style={[
                        localStyles.modalExerciseCard,
                        isExpanded && localStyles.modalExerciseCardExpanded,
                        ex.teveDor && { borderColor: "rgba(239, 68, 68, 0.45)" },
                      ]}
                    >
                      <TouchableOpacity
                        style={localStyles.modalExerciseHeader}
                        activeOpacity={0.75}
                        onPress={() => onAlternarExercicio(ex.id)}
                      >
                        <View style={localStyles.modalExerciseIndexBadge}>
                          <Text style={localStyles.modalExerciseIndexText}>{index + 1}</Text>
                        </View>

                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={localStyles.modalExerciseName} numberOfLines={1}>
                            {ex.nome}
                          </Text>
                          <View style={localStyles.modalExerciseMetaRow}>
                            <Text style={localStyles.modalExerciseMetaText}>
                              {ex.seriesConcluidas}/{ex.seriesPlanejadas} séries
                            </Text>
                            <View style={localStyles.modalMetaDot} />
                            <Text style={[localStyles.modalExerciseMetaText, { color: "#FF6B00", fontWeight: "800" }]}>
                              Máx: {ex.maiorCarga}
                            </Text>
                          </View>
                        </View>

                        <View style={localStyles.modalExerciseBadgesRight}>
                          {ex.bateuPr && (
                            <View style={localStyles.miniBadgePr}>
                              <Ionicons name="trophy" size={11} color="#00E676" />
                              <Text style={localStyles.miniBadgePrText}>PR</Text>
                            </View>
                          )}
                          {ex.observacaoAluno && (
                            <View style={localStyles.miniBadgeNote}>
                              <Ionicons name="document-text" size={12} color="#FF6B00" />
                            </View>
                          )}
                          {ex.teveDor && (
                            <View style={localStyles.miniBadgePain}>
                              <Ionicons name="warning" size={12} color="#EF4444" />
                            </View>
                          )}
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#888"
                            style={{ marginLeft: 4 }}
                          />
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={localStyles.modalExerciseBody}>
                          <View style={localStyles.seriesTableHeader}>
                            <Text style={[localStyles.seriesTableHeaderCell, { flex: 0.8 }]}>SÉRIE</Text>
                            <Text style={[localStyles.seriesTableHeaderCell, { flex: 1.2, textAlign: "center" }]}>REPS</Text>
                            <Text style={[localStyles.seriesTableHeaderCell, { flex: 1.2, textAlign: "center" }]}>CARGA</Text>
                            <Text style={[localStyles.seriesTableHeaderCell, { flex: 0.8, textAlign: "right" }]}>STATUS</Text>
                          </View>

                          {ex.series && ex.series.length > 0 ? (
                            ex.series.map((s: any) => (
                              <View key={s.id} style={localStyles.seriesTableRow}>
                                <View style={{ flex: 0.8, flexDirection: "row", alignItems: "center" }}>
                                  <View
                                    style={[
                                      localStyles.serieNumBadge,
                                      s.concluida && {
                                        backgroundColor: "rgba(0, 230, 118, 0.12)",
                                        borderColor: "rgba(0, 230, 118, 0.3)",
                                      },
                                    ]}
                                  >
                                    <Text style={[localStyles.serieNumText, s.concluida && { color: "#00E676" }]}>
                                      S{s.numero}
                                    </Text>
                                  </View>
                                </View>

                                <Text style={[localStyles.seriesTableCellText, { flex: 1.2, textAlign: "center" }]}>
                                  {s.reps}
                                </Text>

                                <Text style={[localStyles.seriesTableCellLoad, { flex: 1.2, textAlign: "center" }]}>
                                  {s.carga}
                                </Text>

                                <View style={{ flex: 0.8, alignItems: "flex-end" }}>
                                  {s.concluida ? (
                                    <View style={localStyles.statusCheckDone}>
                                      <Ionicons name="checkmark" size={12} color="#000" />
                                    </View>
                                  ) : (
                                    <Text style={{ color: "#666", fontSize: 10, fontWeight: "700" }}>Pendente</Text>
                                  )}
                                </View>
                              </View>
                            ))
                          ) : (
                            <Text style={{ color: "#666", fontSize: 12, paddingVertical: 8 }}>
                              Nenhuma série detalhada registrada.
                            </Text>
                          )}

                          {ex.observacaoAluno && (
                            <View style={localStyles.exerciseObsAlunoBox}>
                              <Ionicons name="chatbox-ellipses-outline" size={14} color="#FF6B00" style={{ marginRight: 8, marginTop: 1 }} />
                              <View style={{ flex: 1 }}>
                                <Text style={localStyles.exerciseObsAlunoLabel}>ANOTAÇÃO DO ALUNO NESTE EXERCÍCIO:</Text>
                                <Text style={localStyles.exerciseObsAlunoText}>{ex.observacaoAluno}</Text>
                              </View>
                            </View>
                          )}

                          {ex.teveDor && ex.detalheDor && (
                            <View style={localStyles.exercisePainDetailBox}>
                              <Ionicons name="warning" size={14} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
                              <View style={{ flex: 1 }}>
                                <Text style={localStyles.exercisePainDetailLabel}>
                                  RELATO DE DOR {ex.detalheDor.intensidade !== null ? `(NÍVEL ${ex.detalheDor.intensidade}/10)` : ""}:
                                </Text>
                                <Text style={localStyles.exercisePainDetailText}>{ex.detalheDor.descricao}</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={localStyles.emptyCard}>
                  <Text style={{ color: "#888", fontSize: 12, textAlign: "center" }}>
                    Os detalhes por série não estão disponíveis para este registro antigo.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}