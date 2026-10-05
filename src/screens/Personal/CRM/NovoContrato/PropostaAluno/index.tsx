import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Image, Modal, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../../theme/theme";
import { scale } from "../../../../../utils/responsive";

import { usePropostaAluno } from "./usePropostaAluno";
import { styles } from "./styles";

export default function PropostaAluno({ route, navigation }: any) {
  const { state, actions } = usePropostaAluno(route, navigation);

  const renderRegras = (text: string) => {
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

  if (state.loadingData) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00E676" />
        <Text style={{ color: '#888', marginTop: 15, fontFamily: theme.fonts.body, fontWeight: 'bold' }}>Gerando seu contrato VIP...</Text>
      </View>
    );
  }

  const valorString = state.proposta?.valor_mensal ? Number(state.proposta.valor_mensal).toFixed(2) : "0.00";
  const valorParts = valorString.split('.');
  
  const modalidadeArray = state.proposta?.servicos_inclusos || [];
  let servicosExibir = modalidadeArray.length > 0 ? modalidadeArray[0] : "Consultoria Premium";
  
  const frequenciaExibir = state.proposta?.frequencia || "Mensal";
  const vencimentoExibir = state.proposta?.dia_vencimento || "10";
  const observacoesExibir = state.proposta?.observacoes || state.regrasPadrao;

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
            Abaixo estão as condições exclusivas preparadas por <Text style={styles.subtitleBold}>{state.personalNome}</Text> para você.
          </Text>
        </View>

        <View style={styles.ticketCard}>
          <LinearGradient colors={["#1A1A1A", "#0D0D0D"]} style={StyleSheet.absoluteFill} />
          
          <View style={styles.ticketHeader}>
            <View style={styles.trainerInfoRow}>
              {state.personalFoto ? (
                <Image source={{ uri: state.personalFoto }} style={styles.trainerAvatar} />
              ) : (
                <View style={styles.trainerAvatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#888" />
                </View>
              )}
              <View>
                <Text style={styles.trainerName}>{state.personalNome}</Text>
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

        <TouchableOpacity style={styles.termsCard} onPress={actions.toggleRegras} activeOpacity={0.85}>
          <LinearGradient colors={["#111", "#0A0A0A"]} style={StyleSheet.absoluteFill} />
          <View style={styles.termsHeader}>
            <View style={styles.termsHeaderLeft}>
              <View style={styles.termsIconBox}>
                <Ionicons name="document-text" size={18} color="#00E676" />
              </View>
              <Text style={styles.termsTitle}>Termos do Contrato</Text>
            </View>
            <View style={styles.termsActionBox}>
              <Text style={styles.termsActionText}>{state.regrasExpandidas ? "Ocultar" : "Ler regras"}</Text>
              <Ionicons name={state.regrasExpandidas ? "chevron-up" : "chevron-down"} size={16} color="#00E676" />
            </View>
          </View>
          
          {state.regrasExpandidas && (
            <View style={styles.regrasContainer}>
              <View style={styles.regrasDivisor} />
              {renderRegras(observacoesExibir)}
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      <BlurView intensity={90} tint="dark" style={styles.footerBar}>
        <TouchableOpacity 
          style={[styles.btnPrimary, state.loading && {opacity: 0.7}]} 
          onPress={actions.handleAceitarProposta} 
          disabled={state.loading}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#00E676", "#00B259"]} style={styles.btnGradient}>
            {state.loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <MaterialCommunityIcons name="fingerprint" size={22} color="#000" style={{marginRight: 8}} />
                <Text style={styles.btnPrimaryText}>Assinar & Iniciar Treinos</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={actions.handleNegociar} disabled={state.loading} activeOpacity={0.7}>
          <Ionicons name="chatbubbles-outline" size={18} color="#888" style={{marginRight: 6}} />
          <Text style={styles.btnSecondaryText}>Falar com o Treinador</Text>
        </TouchableOpacity>
      </BlurView>

      <Modal visible={state.modalSucessoVisivel} transparent animationType="fade">
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
                actions.setModalSucessoVisivel(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: "PainelMeuTreinador", params: { conexaoId: state.conexaoId } }]
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