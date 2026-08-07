import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

const { width } = Dimensions.get("window");

export default function PainelMeuTreinador({ route, navigation }) {
  const { conexaoId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [personal, setPersonal] = useState(null);
  const [conexao, setConexao] = useState(null);

  const [diasTreino, setDiasTreino] = useState(1);
  const [progressoBarra, setProgressoBarra] = useState(0);
  const [estaNoPeriodoTeste, setEstaNoPeriodoTeste] = useState(false);

  const [modalAvaliacaoVisible, setModalAvaliacaoVisible] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);

  useEffect(() => {
    carregarPainel();
  }, []);

  const carregarPainel = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true); 

      const { data: conexaoData, error: errorC } = await supabase
        .from("conexoes")
        .select("*, personals(*), usuarios(*)")
        .eq("id", conexaoId)
        .single();

      if (errorC) throw errorC;
      setConexao(conexaoData);
      setPersonal(conexaoData.personals);

      const dataInicio = new Date(
        conexaoData.atualizado_em || conexaoData.criado_em || Date.now(),
      );
      const hoje = new Date();
      const diffTime = Math.abs(hoje.getTime() - dataInicio.getTime());
      const diasCorridos = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const diasLimitados = diasCorridos > 60 ? 60 : diasCorridos;
      setDiasTreino(diasLimitados);
      setProgressoBarra((diasLimitados / 60) * 100);

      setEstaNoPeriodoTeste(diasCorridos <= 7);

      const { data: avalData } = await supabase
        .from("avaliacoes")
        .select("*")
        .eq("personal_id", conexaoData.personal_id)
        .eq("usuario_id", conexaoData.usuario_id)
        .single();

      if (avalData) {
        setNotaSelecionada(avalData.nota);
        setComentario(avalData.comentario || "");
        setJaAvaliou(true);
      }
    } catch (error) {
      if (!isRefresh) {
        Alert.alert("Erro", "Não foi possível carregar o painel.");
        navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarPainel(true);
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
        },
      },
    ]);
  };

  const handleWhatsApp = () => {
    const numLimpo = personal?.telefone?.replace(/\D/g, "");
    if (!numLimpo)
      return Alert.alert(
        "Aviso",
        "Este professor não possui WhatsApp cadastrado.",
      );
    const url = `whatsapp://send?phone=55${numLimpo}&text=Olá Professor ${personal?.nome}! Estou acessando meu painel no Match Trainer.`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Erro", "WhatsApp não instalado."),
    );
  };

  const verPerfilPersonal = () => {
    navigation.navigate("PerfilPublicoPersonal", { personalId: personal.id });
  };

  const irParaMeuPerfil = () => {
    navigation.navigate("PerfilAluno");
  };

  const featureBloqueada = (nome) => {
    Alert.alert(
      "Novidade Chegando! 🚀",
      `O módulo de ${nome} será liberado nas próximas atualizações do aplicativo. Fique de olho!`,
    );
  };

  const handleAcaoEncerramento = () => {
    const dataInicio = new Date(
      conexao?.atualizado_em || conexao?.criado_em || Date.now(),
    );
    const hoje = new Date();
    const diffHoras =
      Math.abs(hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60);

    if (diffHoras < 24) {
      const horasRestantes = Math.ceil(24 - diffHoras);
      return Alert.alert(
        "Recém Chegado! 🛑",
        `Você acabou de iniciar esta consultoria. Para evitar spam e cancelamentos acidentais, aguarde pelo menos ${horasRestantes} hora(s) antes de solicitar o desvinculamento.`,
      );
    }

    if (estaNoPeriodoTeste) {
      Alert.alert(
        "Desfazer Vínculo",
        "Como você está no período de teste de 7 dias, pode desfazer o vínculo imediatamente. Deseja cancelar a parceria e voltar a buscar treinadores?",
        [
          { text: "Não, quero continuar", style: "cancel" },
          {
            text: "Sim, Cancelar Vínculo",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                await supabase.from("conexoes").delete().eq("id", conexaoId);

                Alert.alert(
                  "Vínculo Cancelado",
                  "Você está livre para buscar novos treinadores.",
                );
                navigation.reset({
                  index: 0,
                  routes: [{ name: "UsuarioTabs" }],
                });
              } catch (error) {
                Alert.alert(
                  "Erro",
                  "Não foi possível cancelar o vínculo no momento.",
                );
                setLoading(false);
              }
            },
          },
        ],
      );
    } else {
      if (diasTreino <= 60) {
        return Alert.alert(
          "Ciclo em Andamento",
          `O método do seu treinador exige constância para gerar resultados. Você poderá solicitar o encerramento da parceria em ${
            61 - diasTreino
          } dias, após o fim do ciclo de adaptação.`,
        );
      }

      Alert.alert(
        "Solicitar Encerramento",
        "Deseja enviar um aviso ao seu professor solicitando o fim da parceria? Ele receberá uma notificação e fará a liberação do seu perfil no sistema.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim, Enviar Pedido",
            onPress: async () => {
              setLoading(true);
              try {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                await supabase.from("mensagens").insert([
                  {
                    conexao_id: conexaoId,
                    remetente_id: user.id,
                    tipo_remetente: "aluno",
                    conteudo:
                      "⚠️ Olá. Gostaria de solicitar o encerramento da nossa parceria de treinos. Pode liberar meu perfil no sistema, por favor?",
                  },
                ]);

                Alert.alert(
                  "Solicitação Enviada!",
                  "Seu treinador foi notificado. Assim que ele confirmar, suas metas serão destravadas e você voltará para a tela de buscas.",
                );
              } catch (error) {
                Alert.alert("Erro", "Falha ao enviar a solicitação.");
              } finally {
                setLoading(false);
              }
            },
          },
        ],
      );
    }
  };

  const handleEnviarAvaliacao = async () => {
    if (notaSelecionada === 0)
      return Alert.alert(
        "Atenção",
        "Por favor, selecione de 1 a 5 estrelas para o seu treinador.",
      );

    setSalvandoAvaliacao(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const avaliacaoPayload = {
        personal_id: personal.id,
        usuario_id: user.id,
        nota: notaSelecionada,
        comentario: comentario.trim(),
      };

      const { error } = await supabase
        .from("avaliacoes")
        .insert([avaliacaoPayload]);

      if (error) {
        await supabase
          .from("avaliacoes")
          .update({ nota: notaSelecionada, comentario: comentario.trim() })
          .eq("personal_id", personal.id)
          .eq("usuario_id", user.id);
      }

      Alert.alert(
        "Sucesso!",
        "Sua avaliação foi enviada e ajudará o professor a ganhar destaque no app!",
      );
      setJaAvaliou(true);
      setModalAvaliacaoVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar sua avaliação no momento.");
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  if (loading || !personal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={["#1A0B00", "#070707"]}
            style={styles.heroGradient}
          />

          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.danger}
              />
            </TouchableOpacity>

            <View style={styles.premiumHeaderBadge}>
              <FontAwesome5 name="crown" size={12} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.headerTitlePremium}>MEU TREINADOR</Text>
            </View>

            <TouchableOpacity
              style={styles.btnSettings}
              onPress={irParaMeuPerfil}
            >
              <Ionicons name="person-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.trainerAvatar, { overflow: "hidden" }]}>
                {personal?.foto_url ? (
                  <Image
                    source={{ uri: personal.foto_url }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#333",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="person" size={40} color="#666" />
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.trainerName}>{personal?.nome}</Text>

            <View
              style={[
                styles.crefRowBase,
                personal?.cref_verificado
                  ? styles.crefRowVerified
                  : styles.crefRowNeon,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  personal?.cref_verificado
                    ? "shield-check"
                    : "shield-alert-outline"
                }
                size={18}
                color={
                  personal?.cref_verificado ? "#00E676" : theme.colors.primary
                }
              />
              <Text
                style={[
                  styles.trainerCrefText,
                  personal?.cref_verificado && { color: "#00E676" },
                ]}
              >
                CREF: {personal?.cref || "Em Validação"}
              </Text>
              {personal?.cref_verificado && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#00E676"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>

            <View style={styles.actionRowHero}>
              <TouchableOpacity
                style={styles.btnVerPerfil}
                onPress={verPerfilPersonal}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.btnVerPerfilText}>Perfil do Personal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnWhatsApp}
                onPress={handleWhatsApp}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.btnWhatsAppText}>Contato</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.dashboardSection}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome5
              name="dumbbell"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Central de Treinamento</Text>
          </View>

          <TouchableOpacity
            style={styles.lockedCard}
            activeOpacity={0.9}
            onPress={() => featureBloqueada("Fichas de Treino")}
          >
            <LinearGradient
              colors={["#161616", "#0A0A0A"]}
              style={styles.lockedCardBg}
            />
            <View style={styles.lockedCardHeader}>
              <View style={styles.iconCircleLocked}>
                <MaterialCommunityIcons
                  name="clipboard-list-outline"
                  size={24}
                  color="#555"
                />
              </View>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color="#000" />
                <Text style={styles.lockedBadgeText}>EM BREVE</Text>
              </View>
            </View>
            <View style={styles.lockedCardContent}>
              <Text style={styles.lockedCardTitle}>Minha Ficha de Treino</Text>
              <Text style={styles.lockedCardSubtitle}>
                Acesse suas séries, repetições e vídeos de execução enviados
                pelo professor.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lockedCard}
            activeOpacity={0.9}
            onPress={() => featureBloqueada("Consultoria Online")}
          >
            <LinearGradient
              colors={["#161616", "#0A0A0A"]}
              style={styles.lockedCardBg}
            />
            <View style={styles.lockedCardHeader}>
              <View style={styles.iconCircleLocked}>
                <Ionicons name="videocam-outline" size={24} color="#555" />
              </View>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color="#000" />
                <Text style={styles.lockedBadgeText}>EM BREVE</Text>
              </View>
            </View>
            <View style={styles.lockedCardContent}>
              <Text style={styles.lockedCardTitle}>Consultoria Completa</Text>
              <Text style={styles.lockedCardSubtitle}>
                Anamnese, avaliação postural, metas e chamadas de vídeo com seu
                treinador.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.openCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("Chat", {
                conexaoId,
                nomeOutro: personal?.nome,
                fotoOutro: personal?.foto_url,
                tipoUsuarioLogado: "aluno",
              })
            }
          >
            <LinearGradient
              colors={["rgba(255,107,0,0.1)", "rgba(255,107,0,0.02)"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.openCardContent}>
              <View style={styles.iconCirclePrimary}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.openCardTitle}>Chat com o Personal</Text>
                <Text style={styles.openCardSubtitle}>
                  Tire dúvidas rápidas diretamente pelo aplicativo.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewCard, jaAvaliou && styles.reviewCardSuccess]}
            activeOpacity={0.8}
            onPress={() => {
              if (jaAvaliou) {
                Alert.alert(
                  "Avaliação Registrada",
                  "Você já avaliou o trabalho deste professor. Muito obrigado pelo seu feedback!",
                );
              } else {
                setModalAvaliacaoVisible(true);
              }
            }}
          >
            <View style={styles.openCardContent}>
              <View
                style={[
                  styles.iconCircleGold,
                  jaAvaliou && styles.iconCircleSuccess,
                ]}
              >
                <Ionicons
                  name={jaAvaliou ? "checkmark-circle" : "star"}
                  size={22}
                  color={jaAvaliou ? "#00E676" : "#FFD700"}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text
                  style={[
                    styles.reviewCardTitle,
                    jaAvaliou && { color: "#00E676" },
                  ]}
                >
                  {jaAvaliou ? "Avaliação Concluída" : "Avaliar Treinador"}
                </Text>
                <Text style={styles.openCardSubtitle}>
                  {jaAvaliou
                    ? `Sua nota: ${notaSelecionada} estrela(s)`
                    : "Como está sendo sua experiência?"}
                </Text>
              </View>
              {!jaAvaliou && (
                <Ionicons name="chevron-forward" size={20} color="#FFD700" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.trackerSection}>
          <View style={styles.trackerCard}>
            <View style={styles.trackerHeader}>
              <Feather name="target" size={20} color="#FFF" />
              <Text style={styles.trackerTitle}>Ciclo de Adaptação</Text>
            </View>

            <Text style={styles.trackerDesc}>
              Bons resultados exigem consistência. Cumpra o prazo do método para
              avaliarmos sua evolução.
            </Text>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressoBarra}%` },
                ]}
              />
              <View style={styles.progressGlow} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>Dia {diasTreino}</Text>
              <Text style={styles.progressLabelRight}>Meta: 60 Dias</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={
              estaNoPeriodoTeste
                ? styles.btnWarningOutline
                : styles.btnDangerOutline
            }
            onPress={handleAcaoEncerramento}
          >
            <Text
              style={
                estaNoPeriodoTeste
                  ? styles.btnWarningText
                  : styles.btnDangerText
              }
            >
              {estaNoPeriodoTeste
                ? "Desfazer Vínculo (Período de Teste)"
                : "Solicitar Encerramento da Parceria"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalAvaliacaoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAvaliacaoVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sua Avaliação</Text>
              <Text style={styles.modalSubtitle}>
                O que você achou do método do {personal?.nome?.split(" ")[0]}?
              </Text>
            </View>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNotaSelecionada(star)}
                  activeOpacity={0.7}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={notaSelecionada >= star ? "star" : "star-outline"}
                    size={40}
                    color={notaSelecionada >= star ? "#FFD700" : "#555"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.starLabel}>
              {notaSelecionada === 1
                ? "Ruim"
                : notaSelecionada === 2
                ? "Regular"
                : notaSelecionada === 3
                ? "Bom"
                : notaSelecionada === 4
                ? "Muito Bom"
                : notaSelecionada === 5
                ? "Excelente!"
                : "Selecione uma nota"}
            </Text>

            <View style={styles.inputReviewContainer}>
              <TextInput
                style={styles.inputReview}
                placeholder="Deixe um comentário sobre a sua experiência (Opcional)"
                placeholderTextColor="#666"
                multiline
                maxLength={150}
                value={comentario}
                onChangeText={setComentario}
              />
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setModalAvaliacaoVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSubmit}
                onPress={handleEnviarAvaliacao}
                disabled={salvandoAvaliacao}
              >
                {salvandoAvaliacao ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.modalBtnSubmitText}>
                    Enviar Avaliação
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070707",
  },
  scrollContent: { paddingBottom: verticalScale(60) },

  heroWrapper: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(30),
    position: "relative",
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(350),
    borderBottomLeftRadius: moderateScale(40),
    borderBottomRightRadius: moderateScale(40),
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
    premiumHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  headerTitlePremium: {
    color: theme.colors.primary,
    fontSize: moderateScale(12),
    fontFamily: theme.fonts.title,
    letterSpacing: 1.5,
    fontWeight: '900',
  },

  btnSettings: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  btnLogout: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(22),
    backgroundColor: "rgba(255,59,48,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.3)",
  },

  profileSection: { alignItems: "center", paddingHorizontal: scale(20) },
  avatarContainer: { position: "relative", marginBottom: verticalScale(15) },
  trainerAvatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: moderateScale(60),
    borderWidth: 3,
    borderColor: "#1F1F1F",
    backgroundColor: "#111",
  },

  trainerName: {
    color: "#FFF",
    fontSize: moderateScale(28),
    fontFamily: theme.fonts.title,
    marginBottom: verticalScale(15),
    textAlign: "center",
    letterSpacing: 0.5,
  },

  crefRowBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    marginBottom: verticalScale(25),
    gap: scale(6),
  },
  crefRowNeon: {
    backgroundColor: "#1A0B00",
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  crefRowVerified: {
    backgroundColor: "rgba(0, 230, 118, 0.05)",
    borderColor: "#00E676",
    shadowColor: "#00E676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  trainerCrefText: {
    color: theme.colors.primary,
    fontSize: moderateScale(13),
    fontWeight: "900",
    letterSpacing: 1,
  },

  actionRowHero: {
    flexDirection: "row",
    gap: scale(12),
    width: "100%",
    justifyContent: "center",
  },
  btnVerPerfil: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(16),
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  btnVerPerfilText: {
    color: "#FFF",
    fontSize: moderateScale(13),
    fontWeight: "bold",
  },

  btnWhatsApp: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(16),
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  btnWhatsAppText: {
    color: "#FFF",
    fontSize: moderateScale(14),
    fontWeight: "900",
    textTransform: "uppercase",
  },

  dashboardSection: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
    gap: scale(10),
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: moderateScale(20),
    fontFamily: theme.fonts.title,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  lockedCard: {
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
  },
  lockedCardBg: { ...StyleSheet.absoluteFillObject },
  lockedCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: scale(20),
    paddingBottom: verticalScale(10),
  },
  iconCircleLocked: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    gap: scale(4),
  },
  lockedBadgeText: {
    color: "#000",
    fontSize: moderateScale(10),
    fontWeight: "900",
    textTransform: "uppercase",
  },
  lockedCardContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(25),
  },
  lockedCardTitle: {
    color: "#888",
    fontSize: moderateScale(18),
    fontFamily: theme.fonts.title,
    marginBottom: verticalScale(6),
  },
  lockedCardSubtitle: {
    color: "#555",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
    fontWeight: "500",
  },

  openCard: {
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
    overflow: "hidden",
  },
  openCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(20),
  },
  iconCirclePrimary: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "rgba(255,107,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
  },
  openCardTitle: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginBottom: verticalScale(4),
  },
  openCardSubtitle: {
    color: "#AAA",
    fontSize: moderateScale(12),
    fontWeight: "500",
  },

  reviewCard: {
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(25),
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    backgroundColor: "#111",
    overflow: "hidden",
  },
  reviewCardSuccess: {
    borderColor: "rgba(0, 230, 118, 0.3)",
    backgroundColor: "rgba(0, 230, 118, 0.05)",
  },
  iconCircleGold: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  iconCircleSuccess: {
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  reviewCardTitle: {
    color: "#FFD700",
    fontSize: moderateScale(16),
    fontWeight: "bold",
    marginBottom: verticalScale(4),
  },

  trackerSection: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(40),
  },
  trackerCard: {
    backgroundColor: "#121212",
    borderRadius: moderateScale(24),
    padding: scale(24),
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  trackerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  trackerTitle: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontFamily: theme.fonts.title,
  },
  trackerDesc: {
    color: "#888",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
  },

  progressBarContainer: {
    height: verticalScale(12),
    backgroundColor: "#222",
    borderRadius: moderateScale(6),
    overflow: "hidden",
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: moderateScale(6),
    zIndex: 2,
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "25%",
    backgroundColor: theme.colors.primary,
    opacity: 0.5,
    blurRadius: 10,
    zIndex: 1,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  progressLabelLeft: {
    color: theme.colors.primary,
    fontSize: moderateScale(12),
    fontWeight: "bold",
  },
  progressLabelRight: {
    color: "#666",
    fontSize: moderateScale(12),
    fontWeight: "bold",
  },

  footerRow: {
    alignItems: "center",
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  btnDangerOutline: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.3)",
  },
  btnDangerText: {
    color: "#FF3B30",
    fontSize: moderateScale(13),
    fontWeight: "bold",
  },

  btnWarningOutline: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
  },
  btnWarningText: {
    color: theme.colors.primary,
    fontSize: moderateScale(13),
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#121212",
    borderRadius: moderateScale(28),
    padding: scale(25),
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: { alignItems: "center", marginBottom: verticalScale(25) },
  modalTitle: {
    color: "#FFF",
    fontSize: moderateScale(24),
    fontFamily: theme.fonts.title,
    marginBottom: verticalScale(8),
  },
  modalSubtitle: {
    color: "#AAA",
    fontSize: moderateScale(14),
    textAlign: "center",
    paddingHorizontal: scale(10),
  },

  starsRow: {
    flexDirection: "row",
    gap: scale(10),
    marginBottom: verticalScale(15),
  },
  starBtn: { padding: scale(4) },
  starLabel: {
    color: "#FFD700",
    fontSize: moderateScale(14),
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: verticalScale(25),
  },

  inputReviewContainer: {
    width: "100%",
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: verticalScale(25),
  },
  inputReview: {
    color: "#FFF",
    fontSize: moderateScale(14),
    padding: scale(16),
    minHeight: verticalScale(100),
    textAlignVertical: "top",
  },

  modalActionRow: { flexDirection: "row", gap: scale(12), width: "100%" },
  modalBtnCancel: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(16),
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalBtnCancelText: {
    color: "#FFF",
    fontSize: moderateScale(14),
    fontWeight: "bold",
  },
  modalBtnSubmit: {
    flex: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(16),
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnSubmitText: {
    color: "#000",
    fontSize: moderateScale(14),
    fontWeight: "900",
  },
});