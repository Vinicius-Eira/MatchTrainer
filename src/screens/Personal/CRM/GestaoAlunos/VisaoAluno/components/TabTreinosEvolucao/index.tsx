import React from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { styles } from "../../styles";
import { bioStyles, localStyles } from "./styles";
import { theme } from "../../../../../../../theme/theme";
import { verticalScale } from "../../../../../../../utils/responsive";
import { AlertaDorAluno } from "../RelatoDor";
import { ModalExecucaoTreino } from "./ExecucaoTreino";
import { CorpoAluno } from "./CorpoAluno";
import {
  formatarDataCurta,
  getAnaliseIntensidade,
  useTabTreinosEvolucao,
} from "./useTabTreinosEvolucao";

const BentoDesempenho = ({ valor, titulo, icone, descricao, corDestaque = "#FFF" }: any) => (
  <View style={localStyles.bentoCard}>
    <View style={localStyles.desempenhoHeaderRow}>
      <Ionicons name={icone} size={16} color={theme.colors.primary} style={localStyles.bentoIcon} />
      <Text style={localStyles.desempenhoTitle}>{titulo}</Text>
    </View>
    <Text style={{ color: corDestaque, fontSize: 22, fontWeight: "900", marginBottom: 6 }}>{valor}</Text>
    <Text style={localStyles.desempenhoDesc}>{descricao}</Text>
  </View>
);

export function TabTreinosEvolucao({
  aluno,
  conexaoId,
  navigation,
  mostrarAjudaAdesao,
  streak,
  adesao,
  ultimosLogs,
}: any) {
  const temDados = adesao && adesao.length > 0;
  const { state, actions } = useTabTreinosEvolucao({ aluno, conexaoId, navigation });

  return (
    <View style={styles.sectionContainer}>
      {!state.ocultarAlertaDor && (
        <AlertaDorAluno alunoId={aluno.id} onResolvido={() => actions.setOcultarAlertaDor(true)} />
      )}

      <View style={[styles.sectionHeaderRow, { marginBottom: verticalScale(12) }]}>
        <FontAwesome5 name="dumbbell" size={20} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Programas de Treino</Text>
      </View>

      <View style={styles.treinosMainCard}>
        <View style={styles.treinosCardHeader}>
          <View style={styles.treinosIconBg}>
            <Ionicons name="list" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.treinosCardTitle}>Gestão de Fichas</Text>
            <Text style={styles.treinosCardDesc}>Controle as planilhas e rotinas ativas</Text>
          </View>
        </View>

        <View style={styles.treinosActionRow}>
          <TouchableOpacity
            style={styles.btnVerTreinos}
            onPress={() => navigation.navigate("ListaTreinosAluno", { alunoId: aluno?.id, alunoNome: aluno?.nome })}
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Ver Treinos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnVerTreinos}
            onPress={() => navigation.navigate("HistoricoTreinosAluno", { alunoId: aluno?.id, alunoNome: aluno?.nome })}
            activeOpacity={0.8}
          >
            <Ionicons name="archive-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionHeaderRow, { marginTop: verticalScale(26), marginBottom: verticalScale(12) }]}>
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Conexão & Feedback</Text>
      </View>

      <View style={localStyles.feedbackCardWrapper}>
        <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={localStyles.gradientFill} />

        <View style={localStyles.feedbackTopRow}>
          <View style={localStyles.feedbackIconBox}>
            <Ionicons name="megaphone-outline" size={20} color="#FF6B00" />
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={localStyles.feedbackMainTitle}>Feedback para o Aluno</Text>
            <Text style={localStyles.feedbackSubtitle}>
              {state.recadoAtualSalvo
                ? `Último envio em ${state.dataUltimoRecado || "Recente"}`
                : "Destaque orientações no painel principal do aluno"}
            </Text>
          </View>
          {state.recadoAtualSalvo && !state.editorFeedbackAberto && (
            <View style={localStyles.ativoPill}>
              <View style={localStyles.ativoDot} />
              <Text style={localStyles.ativoPillText}>ATIVO</Text>
            </View>
          )}
        </View>

        {!state.editorFeedbackAberto ? (
          <View>
            {state.recadoAtualSalvo ? (
              <View style={localStyles.previewQuoteBox}>
                <Text style={localStyles.previewQuoteLabel}>MENSAGEM ATUAL NO PAINEL DO ALUNO:</Text>
                <Text style={localStyles.previewQuoteText} numberOfLines={2}>
                  {state.recadoAtualSalvo}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity style={localStyles.btnAbrirEditor} onPress={actions.abrirEditorNovoFeedback} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={18} color="#FF6B00" style={{ marginRight: 8 }} />
              <Text style={localStyles.btnAbrirEditorText}>
                {state.recadoAtualSalvo ? "ENVIAR NOVO FEEDBACK" : "ESCREVER FEEDBACK PARA O ALUNO"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={localStyles.editorContainer}>
            <Text style={localStyles.editorLabel}>NOVA MENSAGEM DE ACOMPANHAMENTO:</Text>
            <TextInput
              style={localStyles.feedbackInput}
              placeholder={`Ex: Excelente semana de treinos, ${aluno?.nome?.split(" ")[0] || "aluno"}! Mantenha o foco na execução...`}
              placeholderTextColor="#666"
              multiline
              autoFocus
              numberOfLines={3}
              value={state.novoRecadoInput}
              onChangeText={actions.setNovoRecadoInput}
            />

            <View style={localStyles.editorActionsRow}>
              <TouchableOpacity
                style={localStyles.btnCancelarFeedback}
                onPress={() => actions.setEditorFeedbackAberto(false)}
                disabled={state.salvandoRecado}
                activeOpacity={0.7}
              >
                <Text style={localStyles.btnCancelarFeedbackText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.btnEnviarFeedback}
                onPress={actions.salvarFeedbackEvolucao}
                disabled={state.salvandoRecado}
                activeOpacity={0.8}
              >
                {state.salvandoRecado ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons name="send" size={14} color="#000" style={{ marginRight: 6 }} />
                    <Text style={localStyles.btnEnviarFeedbackText}>ENVIAR AGORA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.sectionHeaderRow, { marginTop: verticalScale(28), marginBottom: verticalScale(16) }]}>
        <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Bioimpedância</Text>
      </View>

      <TouchableOpacity style={localStyles.btnNovaAvaliacao} activeOpacity={0.7} onPress={actions.abrirNovaAvaliacao}>
        <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: 8 }} />
        <Text style={localStyles.btnNovaAvaliacaoText}>NOVA AVALIAÇÃO FÍSICA</Text>
      </TouchableOpacity>

      <View style={localStyles.tabSelectorRow}>
        <TouchableOpacity
          style={[localStyles.tabBtn, { backgroundColor: state.abaVisualizacao === "evolucao" ? "#222" : "transparent" }]}
          onPress={() => actions.setAbaVisualizacao("evolucao")}
        >
          <Text style={[localStyles.tabText, { color: state.abaVisualizacao === "evolucao" ? "#FF6B00" : "#666" }]}>
            DESEMPENHO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[localStyles.tabBtn, { backgroundColor: state.abaVisualizacao === "corpo" ? "#222" : "transparent" }]}
          onPress={() => actions.setAbaVisualizacao("corpo")}
        >
          <Text style={[localStyles.tabText, { color: state.abaVisualizacao === "corpo" ? "#FF6B00" : "#666" }]}>
            CORPO DO ALUNO
          </Text>
        </TouchableOpacity>
      </View>

      {state.abaVisualizacao === "evolucao" && (
        <View>
          <View style={localStyles.resumoCard}>
            <Text style={localStyles.resumoTitle}>RESUMO ATUAL</Text>
            <View style={localStyles.resumoValoresRow}>
              <View>
                <Text style={localStyles.resumoLabel}>PESO ATUAL</Text>
                <View style={localStyles.resumoBigValueRow}>
                  <Text style={localStyles.resumoBigValue}>{state.pesoExibirResumo}</Text>
                  <Text style={localStyles.resumoBigUnit}>kg</Text>
                </View>
                {state.deltas.pesoResumo.texto ? (
                  <Text style={bioStyles.resumoDeltaText}>{state.deltas.pesoResumo.texto} vs anterior</Text>
                ) : null}
              </View>
              <View style={localStyles.resumoDivider} />
              <View style={{ alignItems: "flex-end" }}>
                <Text style={localStyles.resumoLabel}>META DO ALUNO</Text>
                <View style={localStyles.resumoBigValueRow}>
                  <Text style={localStyles.resumoMetaValue}>{state.metaDePeso}</Text>
                  <Text style={localStyles.resumoBigUnit}>kg</Text>
                </View>
              </View>
            </View>

            <View style={localStyles.estadoBadgeRow}>
              <Text style={localStyles.resumoLabel}>ESTADO GERAL</Text>
              <View style={[localStyles.estadoBadge, state.bioMaisRecente && bioStyles.estadoBadgeAtualizado]}>
                <Text style={{ color: state.bioMaisRecente ? "#00E676" : "#FF6B00", fontSize: 11, fontWeight: "bold" }}>
                  {state.bioMaisRecente
                    ? `Bio Atualizada (${formatarDataCurta(state.bioMaisRecente.data_registro)})`
                    : "Aguardando Bio."}
                </Text>
              </View>
            </View>
          </View>

          <Text style={localStyles.sectionTitle}>Desempenho Acumulado</Text>

          <View style={localStyles.rowMarginMinus}>
            <BentoDesempenho titulo="SEQUÊNCIA" valor={streak || 0} icone="flame" descricao="Treinos seguidos." corDestaque="#FF6B00" />
            <BentoDesempenho titulo="CONCLUÍDOS" valor={ultimosLogs?.length || 0} icone="checkmark-circle" descricao="Treinos recentes." />
            <BentoDesempenho titulo="MELHOR ADESÃO" valor={`${adesao?.[0]?.percentual || 0}%`} icone="trophy" descricao="Ficha mais feita." corDestaque="#00E676" />
          </View>

          <View style={localStyles.freqCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "bold" }}>Frequência por Ficha (30 Dias)</Text>
              <TouchableOpacity onPress={mostrarAjudaAdesao} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {!temDados ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Nenhum treino concluído ainda.</Text>
            ) : (
              adesao.map((item: any, index: number) => {
                const isDanger = item.percentual < 50;
                const barColor = isDanger ? theme.colors.danger : theme.colors.success;
                return (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ color: "#AAA", fontSize: 12, fontWeight: "600" }}>{item.nome}</Text>
                      <Text style={{ color: isDanger ? theme.colors.danger : "#FFF", fontSize: 12, fontWeight: "bold" }}>
                        {item.percentual}%
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: "#1A1A1A", borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ width: `${item.percentual}%`, height: "100%", backgroundColor: barColor, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 }}>
            <Text style={[localStyles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Últimos Treinos Concluídos</Text>
            {ultimosLogs?.length > 0 && (
              <Text style={{ color: "#888", fontSize: 11, fontWeight: "700" }}>Toque para ver detalhes</Text>
            )}
          </View>

          <View>
            {ultimosLogs?.length > 0 ? (
              ultimosLogs.map((hist: any) => {
                const analise = getAnaliseIntensidade(hist.rpe);
                const dataObj = hist.created_at ? new Date(hist.created_at) : null;
                const dataFormatada = dataObj
                  ? dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                  : "--/--/----";
                const temComentarios = Boolean(hist.comentarioFinal) || (hist.qtdObservacoesExercicios || 0) > 0;

                return (
                  <TouchableOpacity
                    key={hist.id}
                    activeOpacity={0.82}
                    onPress={() => actions.abrirDetalhesExecucao(hist)}
                    style={[
                      localStyles.bentoCard,
                      {
                        padding: 16,
                        borderWidth: 1,
                        borderColor: hist.sentiuDor ? "rgba(239, 68, 68, 0.45)" : "#222226",
                        marginBottom: 12,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
                        <View
                          style={[
                            localStyles.tmbIconBg,
                            { backgroundColor: "rgba(255, 107, 0, 0.12)", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.25)" },
                          ]}
                        >
                          <Ionicons name="checkmark-done" size={18} color="#FF6B00" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "900" }} numberOfLines={1}>
                            {hist.nomeTreino || "Sessão de Treino"}
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
                            <Ionicons name="calendar-outline" size={11} color="#888" style={{ marginRight: 4 }} />
                            <Text style={{ color: "#888", fontSize: 11, fontWeight: "600" }}>
                              {dataFormatada} às {hist.horario}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          backgroundColor: analise.cor + "18",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: analise.cor + "45",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="flame" size={13} color={analise.cor} />
                        <Text style={{ color: analise.cor, fontSize: 11, fontWeight: "900", marginLeft: 4 }}>
                          {analise.label}
                        </Text>
                      </View>
                    </View>

                    <View style={localStyles.logQuickPillsRow}>
                      <View style={localStyles.logQuickPill}>
                        <Ionicons name="time-outline" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
                        <Text style={localStyles.logQuickPillText}>{hist.duracao}</Text>
                      </View>

                      {hist.volumeTotal && hist.volumeTotal !== "--" && (
                        <View style={localStyles.logQuickPill}>
                          <MaterialCommunityIcons name="weight-kilogram" size={13} color="#FF6B00" style={{ marginRight: 4 }} />
                          <Text style={localStyles.logQuickPillText}>{hist.volumeTotal}</Text>
                        </View>
                      )}

                      {hist.prsCount > 0 && (
                        <View style={[localStyles.logQuickPill, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.3)" }]}>
                          <Ionicons name="trophy" size={11} color="#00E676" style={{ marginRight: 4 }} />
                          <Text style={[localStyles.logQuickPillText, { color: "#00E676" }]}>{hist.prsCount} PR</Text>
                        </View>
                      )}

                      {temComentarios && (
                        <View style={[localStyles.logQuickPill, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.3)" }]}>
                          <Ionicons name="chatbox-ellipses-outline" size={11} color="#FF6B00" style={{ marginRight: 4 }} />
                          <Text style={[localStyles.logQuickPillText, { color: "#FF6B00" }]}>Comentário</Text>
                        </View>
                      )}

                      {hist.sentiuDor && (
                        <View style={[localStyles.logQuickPill, { backgroundColor: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.35)" }]}>
                          <Ionicons name="warning" size={11} color="#EF4444" style={{ marginRight: 4 }} />
                          <Text style={[localStyles.logQuickPillText, { color: "#EF4444" }]}>Relato de Dor</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ backgroundColor: "#121215", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#1F1F24" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons name="pulse" size={14} color={analise.cor} style={{ marginRight: 6 }} />
                          <Text style={{ color: "#E4E4E7", fontSize: 12, fontWeight: "800" }}>{analise.texto}</Text>
                        </View>
                        <Text style={{ color: "#71717A", fontSize: 10, fontWeight: "800" }}>
                          SÉRIES {hist.seriesResumo || "--"}
                        </Text>
                      </View>

                      <View style={{ height: 5, backgroundColor: "#1F1F24", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                        <View style={{ width: `${analise.percentual}%`, height: "100%", backgroundColor: analise.cor, borderRadius: 3 }} />
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <Text style={{ color: "#71717A", fontSize: 11, flex: 1 }} numberOfLines={1}>
                          {hist.comentarioFinal ? `"${hist.comentarioFinal}"` : analise.sub}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                          <Text style={{ color: "#FF6B00", fontSize: 11, fontWeight: "800" }}>Ver execução</Text>
                          <Ionicons name="chevron-forward" size={13} color="#FF6B00" style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={localStyles.emptyCard}>
                <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={36} color="#333" style={{ marginBottom: 10 }} />
                <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                  Nenhum treino concluído ainda.{"\n"}Os logs de execução aparecerão aqui.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {state.abaVisualizacao === "corpo" && (
        <CorpoAluno
          loadingBio={state.loadingBio}
          avaliacoesBio={state.avaliacoesBio}
          indiceBioSelecionada={state.indiceBioSelecionada}
          setIndiceBioSelecionada={actions.setIndiceBioSelecionada}
          bioAtual={state.bioAtual}
          bioAnterior={state.bioAnterior}
          deltas={state.deltas}
          tipoSegmentar={state.tipoSegmentar}
          setTipoSegmentar={actions.setTipoSegmentar}
          segmentarExibido={state.segmentarExibido}
        />
      )}

      <ModalExecucaoTreino
        treinoSelecionado={state.treinoSelecionado}
        exercicioExpandidoId={state.exercicioExpandidoId}
        onAlternarExercicio={actions.alternarExercicioExpandido}
        onFechar={actions.fecharDetalhesExecucao}
      />
    </View>
  );
}