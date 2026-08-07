import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Modal
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../theme/theme";
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive"; 
import { supabase } from "../../../../services/supabase"; 

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

export default function PropostaAluno({ route, navigation }) {
  const conexaoId = route?.params?.conexaoId;

  const [proposta, setProposta] = useState(null);
  const [personalNome, setPersonalNome] = useState("Treinador");
  const [personalFoto, setPersonalFoto] = useState(null);
  const [regrasExpandidas, setRegrasExpandidas] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);

  const regrasPadrao = "✅ **1. Atrasos**\nA tolerância para os treinos ou avaliações é de 15 minutos.\n\n✅ **2. Pagamentos**\nO seu acesso ao planejamento só será liberado/atualizado após a confirmação financeira.\n\n✅ **3. Suporte e Dúvidas**\nO canal oficial é o WhatsApp. Respostas em até 24h úteis.";

  useEffect(() => {
    if (conexaoId) {
      carregarDadosDaProposta();
    } else {
      Alert.alert("Erro de Rota", "Nenhuma conexão encontrada.");
      navigation.goBack();
    }
  }, [conexaoId]);

  const carregarDadosDaProposta = async () => {
    try {
      const { data: conexao, error: errConn } = await supabase
        .from('conexoes')
        .select('usuario_id, personal_id') 
        .eq('id', conexaoId)
        .single();
      
      if (errConn) {
        Alert.alert("Erro na Conexão", JSON.stringify(errConn));
        return navigation.goBack();
      }

      const { data: personal } = await supabase
        .from('personals')
        .select('nome, foto_url')
        .eq('id', conexao.personal_id)
        .single();
      
      if (personal) {
        setPersonalNome(personal.nome);
        setPersonalFoto(personal.foto_url);
      }

      const { data: plano, error: errPlano } = await supabase
        .from('planos')
        .select('*')
        .eq('aluno_id', conexao.usuario_id) 
        .eq('personal_id', conexao.personal_id)
        .limit(1)
        .maybeSingle();

      if (errPlano) {
        Alert.alert("Erro do Supabase (Planos)", JSON.stringify(errPlano));
        setLoadingData(false);
        return;
      }

      if (plano) {
        setProposta(plano);
      } else {
        Alert.alert(
          "Plano não encontrado", 
          `Houve um problema ao buscar a proposta digital.`
        );
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erro Fatal", error.message);
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  const toggleRegras = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRegrasExpandidas(!regrasExpandidas);
  };

  const handleAceitarProposta = async () => {
    setLoading(true);
    try {
      await supabase
        .from('conexoes')
        .update({ status: 'aluno_ativo' })
        .eq('id', conexaoId);
      
      if (proposta?.id) {
        await supabase
          .from('planos')
          .update({ status: 'ativo' })
          .eq('id', proposta.id);
      }

      setLoading(false);
      setModalSucessoVisivel(true);
    } catch (error) {
      setLoading(false);
      Alert.alert("Erro", "Tivemos um problema ao oficializar a assinatura. Tente novamente.");
    }
  };

  const handleNegociar = () => {
    navigation.navigate("Chat", {
      conexaoId: conexaoId,
      nomeOutro: personalNome,
      tipoUsuarioLogado: "aluno",
    });
  };

  const renderRegras = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={index} style={styles.regraText}>
            {parts.map((part, i) => (
              <Text key={i} style={i % 2 !== 0 ? styles.regraTextBold : {}}>{part}</Text>
            ))}
          </Text>
        );
      }
      return <Text key={index} style={[styles.regraText, line === "" ? {height: 8} : {}]}>{line}</Text>;
    });
  };

  if (loadingData) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00E676" />
        <Text style={{ color: '#888', marginTop: 15, fontFamily: theme.fonts.body, fontWeight: 'bold' }}>Gerando seu contrato VIP...</Text>
      </View>
    );
  }

  const valorString = proposta?.valor_mensal ? Number(proposta.valor_mensal).toFixed(2) : "0.00";
  const valorParts = valorString.split('.');
  const servicosExibir = proposta?.servicos_inclusos && proposta.servicos_inclusos.length > 0 
    ? proposta.servicos_inclusos.join(' • ') 
    : "Consultoria Premium";
  const frequenciaExibir = proposta?.frequencia || "Mensal";
  const vencimentoExibir = proposta?.dia_vencimento || "10";
  const observacoesExibir = proposta?.observacoes || regrasPadrao;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.glowTopLeft} />
      <View style={styles.glowCenter} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={80} tint="dark" style={styles.headerGlass}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVoltar} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proposta Comercial</Text>
        <View style={{ width: scale(40) }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <Text style={styles.title}>Acordo <Text style={styles.highlight}>Pronto.</Text></Text>
          <Text style={styles.subtitle}>
            Abaixo estão as condições exclusivas preparadas por <Text style={styles.subtitleBold}>{personalNome}</Text> para você.
          </Text>
        </View>

        <View style={styles.ticketCard}>
          <LinearGradient colors={["#1A1A1A", "#0D0D0D"]} style={StyleSheet.absoluteFill} borderRadius={moderateScale(24)} />
          
          <View style={styles.ticketHeader}>
            <View style={styles.trainerInfoRow}>
              {personalFoto ? (
                <Image source={{ uri: personalFoto }} style={styles.trainerAvatar} />
              ) : (
                <View style={styles.trainerAvatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#888" />
                </View>
              )}
              <View>
                <Text style={styles.trainerName}>{personalNome}</Text>
                <Text style={styles.trainerRole}>Personal Trainer</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#000" />
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          </View>

          <View style={styles.ticketBody}>
            <Text style={styles.labelAmount}>INVESTIMENTO {frequenciaExibir.toUpperCase()}</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <Text style={styles.amountInteger}>{valorParts[0]}</Text>
              <Text style={styles.amountDecimal}>,{valorParts[1]}</Text>
            </View>
            <Text style={styles.servicesHighlight}>{servicosExibir}</Text>
          </View>

          <View style={styles.ticketDividerContainer}>
            <View style={styles.ticketCutoutLeft} />
            <View style={styles.ticketDashedLine} />
            <View style={styles.ticketCutoutRight} />
          </View>

          <View style={styles.ticketFooter}>
            <View style={styles.footerDataRow}>
              <View style={styles.footerDataItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" style={{marginBottom: 4}} />
                <Text style={styles.footerDataLabel}>VENCIMENTO</Text>
                <Text style={styles.footerDataValue}>Dia {vencimentoExibir}</Text>
              </View>
              <View style={styles.footerDataDivider} />
              <View style={styles.footerDataItem}>
                <Ionicons name="time-outline" size={16} color="#666" style={{marginBottom: 4}} />
                <Text style={styles.footerDataLabel}>COBRANÇA</Text>
                <Text style={styles.footerDataValue}>{frequenciaExibir}</Text>
              </View>
              <View style={styles.footerDataDivider} />
              <View style={styles.footerDataItem}>
                <Ionicons name="finger-print-outline" size={16} color="#666" style={{marginBottom: 4}} />
                <Text style={styles.footerDataLabel}>STATUS</Text>
                <Text style={[styles.footerDataValue, { color: "#FFD700" }]}>Pendente</Text>
              </View>
            </View>

            <View style={styles.signatureBox}>
              <MaterialCommunityIcons name="signature-freehand" size={30} color="#00E676" />
              <Text style={styles.signatureText}>Assinatura Digital Requerida</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.termsCard} onPress={toggleRegras} activeOpacity={0.85}>
          <LinearGradient colors={["#111", "#0A0A0A"]} style={StyleSheet.absoluteFill} borderRadius={moderateScale(20)} />
          <View style={styles.termsHeader}>
            <View style={styles.termsHeaderLeft}>
              <View style={styles.termsIconBox}>
                <Ionicons name="document-text" size={moderateScale(18)} color="#00E676" />
              </View>
              <Text style={styles.termsTitle}>Termos do Contrato</Text>
            </View>
            <View style={styles.termsActionBox}>
              <Text style={styles.termsActionText}>{regrasExpandidas ? "Ocultar" : "Ler regras"}</Text>
              <Ionicons name={regrasExpandidas ? "chevron-up" : "chevron-down"} size={16} color="#00E676" />
            </View>
          </View>
          
          {regrasExpandidas && (
            <View style={styles.regrasContainer}>
              <View style={styles.regrasDivisor} />
              {renderRegras(observacoesExibir)}
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBar}>
        <TouchableOpacity 
          style={[styles.btnPrimary, loading && {opacity: 0.7}]} 
          onPress={handleAceitarProposta} 
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#00E676", "#00B259"]} style={styles.btnGradient}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <MaterialCommunityIcons name="fingerprint" size={moderateScale(22)} color="#000" style={{marginRight: scale(8)}} />
                <Text style={styles.btnPrimaryText}>Assinar & Iniciar Treinos</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleNegociar} disabled={loading} activeOpacity={0.7}>
          <Ionicons name="chatbubbles-outline" size={moderateScale(18)} color="#888" style={{marginRight: scale(6)}} />
          <Text style={styles.btnSecondaryText}>Falar com o Treinador</Text>
        </TouchableOpacity>
      </BlurView>

      <Modal visible={modalSucessoVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.modalSuccessCard}>
            <View style={styles.modalGlow} />
            
            <LinearGradient colors={["#00E676", "#00B259"]} style={styles.modalIconBox}>
              <Ionicons name="rocket" size={40} color="#000" />
            </LinearGradient>
            
            <Text style={styles.modalSuccessTitle}>Bem-vindo ao Time! </Text>
            <Text style={styles.modalSuccessText}>
              Sua parceria foi firmada com sucesso. A partir de agora, a sua rotina de resultados começa e o seu treinador já foi notificado.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalBtnAction} 
              onPress={() => {
                setModalSucessoVisivel(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: "PainelMeuTreinador", params: { conexaoId: conexaoId } }]
                });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient colors={["#00E676", "#00B259"]} style={styles.modalBtnGradient}>
                <MaterialCommunityIcons name="crown" size={20} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.modalBtnText}>Acessar Minha Área VIP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },
  
  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-100), width: scale(300), height: scale(300), borderRadius: moderateScale(150), backgroundColor: "#00E676", opacity: 0.1, blurRadius: 100 },
  glowCenter: { position: "absolute", top: verticalScale(200), alignSelf: 'center', width: scale(350), height: scale(350), borderRadius: moderateScale(175), backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 120 },
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-80), width: scale(250), height: scale(250), borderRadius: moderateScale(125), backgroundColor: "#00E676", opacity: 0.08, blurRadius: 100 },
  
  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(14), color: "#FFF", letterSpacing: 1.5, textTransform: "uppercase" },
  
  scrollContent: { paddingTop: verticalScale(130), paddingHorizontal: scale(20), paddingBottom: verticalScale(180) },
  
  heroSection: { alignItems: 'center', marginBottom: verticalScale(25) },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, marginBottom: verticalScale(8), textAlign: "center" },
  highlight: { color: "#00E676" },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#AAA", textAlign: "center", lineHeight: moderateScale(22), paddingHorizontal: scale(10) },
  subtitleBold: { color: "#FFF", fontWeight: "bold" },

  ticketCard: { borderRadius: moderateScale(24), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, position: 'relative' },
  
  ticketHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: scale(20), borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  trainerInfoRow: { flexDirection: 'row', alignItems: 'center' },
  trainerAvatar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), marginRight: scale(12), borderWidth: 1, borderColor: "#333" },
  trainerAvatarPlaceholder: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#222", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "#333" },
  trainerName: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.2 },
  trainerRole: { color: "#888", fontSize: moderateScale(12), fontWeight: "600" },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#00E676", paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(8) },
  verifiedText: { color: "#000", fontSize: moderateScale(10), fontWeight: "900", textTransform: 'uppercase', marginLeft: scale(4) },

  ticketBody: { padding: scale(24), alignItems: 'center' },
  labelAmount: { color: "#888", fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: verticalScale(10) },
  amountContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(10) },
  currencySymbol: { color: "#00E676", fontSize: moderateScale(20), fontWeight: '900', marginTop: verticalScale(6), marginRight: scale(6) },
  amountInteger: { color: "#FFF", fontSize: moderateScale(56), fontFamily: theme.fonts.title, letterSpacing: -2, lineHeight: moderateScale(60) },
  amountDecimal: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, letterSpacing: -1, marginTop: verticalScale(4) },
  servicesHighlight: { backgroundColor: "rgba(0, 230, 118, 0.1)", color: "#00E676", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(10), fontSize: moderateScale(12), fontWeight: "bold", overflow: 'hidden', borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.2)" },

  ticketDividerContainer: { height: verticalScale(40), justifyContent: 'center', position: 'relative' },
  ticketDashedLine: { borderBottomWidth: 2, borderBottomColor: "#222", borderStyle: "dashed", marginHorizontal: scale(24) },
  ticketCutoutLeft: { position: 'absolute', left: scale(-20), width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "#000", borderWidth: 1, borderColor: "#222" },
  ticketCutoutRight: { position: 'absolute', right: scale(-20), width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "#000", borderWidth: 1, borderColor: "#222" },

  ticketFooter: { padding: scale(20) },
  footerDataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "rgba(255,255,255,0.03)", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  footerDataItem: { flex: 1, alignItems: 'center' },
  footerDataDivider: { width: 1, height: '100%', backgroundColor: "#333" },
  footerDataLabel: { color: "#666", fontSize: moderateScale(9), fontWeight: "900", letterSpacing: 0.5, marginBottom: verticalScale(2) },
  footerDataValue: { color: "#FFF", fontSize: moderateScale(13), fontWeight: "bold" },
  
  signatureBox: { alignItems: 'center', marginTop: verticalScale(20), opacity: 0.7 },
  signatureText: { color: "#666", fontSize: moderateScale(11), fontStyle: 'italic', marginTop: verticalScale(4) },

  termsCard: { borderRadius: moderateScale(20), padding: scale(20), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20), overflow: 'hidden' },
  termsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  termsHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  termsIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(12), backgroundColor: "rgba(0, 230, 118, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12) },
  termsTitle: { color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.title, letterSpacing: 0.3 },
  termsActionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: "rgba(0, 230, 118, 0.1)", paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: moderateScale(10) },
  termsActionText: { color: "#00E676", fontSize: moderateScale(11), fontWeight: "bold", marginRight: scale(4) },
  termsPreview: { color: '#666', fontSize: moderateScale(13), marginTop: verticalScale(16), fontStyle: 'italic', lineHeight: moderateScale(20) },
  
  regrasContainer: { marginTop: verticalScale(20) },
  regrasDivisor: { height: 1, backgroundColor: '#333', marginBottom: verticalScale(15) },
  regraText: { color: '#CCC', fontSize: moderateScale(14), lineHeight: moderateScale(22), fontFamily: theme.fonts.body, marginBottom: verticalScale(8) },
  regraTextBold: { color: '#FFF', fontWeight: 'bold' },

  footerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: scale(24), paddingTop: verticalScale(15), paddingBottom: Platform.OS === 'ios' ? verticalScale(35) : verticalScale(20), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  btnPrimary: { borderRadius: moderateScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: verticalScale(12) },
  btnGradient: { flexDirection: "row", height: verticalScale(64), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },
  
  btnSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: verticalScale(40) },
  btnSecondaryText: { color: "#888", fontSize: moderateScale(14), fontWeight: "bold", textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: scale(24) },
  modalSuccessCard: { width: "100%", backgroundColor: "#111", borderRadius: moderateScale(32), padding: scale(32), alignItems: "center", borderWidth: 1, borderColor: "#222", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  modalGlow: { position: "absolute", top: -50, width: scale(150), height: scale(150), borderRadius: moderateScale(75), backgroundColor: "#00E676", opacity: 0.15, blurRadius: 40 },
  modalIconBox: { width: scale(80), height: scale(80), borderRadius: moderateScale(40), justifyContent: "center", alignItems: "center", marginBottom: verticalScale(24), shadowColor: "#00E676", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  modalSuccessTitle: { color: "#FFF", fontSize: moderateScale(26), fontFamily: theme.fonts.title, textAlign: "center", marginBottom: verticalScale(12), letterSpacing: -0.5 },
  modalSuccessText: { color: "#AAA", fontSize: moderateScale(15), textAlign: "center", lineHeight: moderateScale(24), marginBottom: verticalScale(32) },
  modalBtnAction: { width: "100%", borderRadius: moderateScale(20), shadowColor: "#00E676", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  modalBtnGradient: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(20), justifyContent: "center", alignItems: "center" },
  modalBtnText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }
});