import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useVisaoAluno } from "./useVisaoAluno";
import { styles } from "./styles";
import { theme } from "../../../../../theme/theme";
import { moderateScale } from "../../../../../utils/responsive";

import TabVisaoGeral from "./components/TabVisaoGeral";
import TabTreinosEvolucao from "./components/TabTreinosEvolucao";

export default function VisaoAluno({ route, navigation }: any) {
  const v = useVisaoAluno(route, navigation); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <BlurView intensity={Platform.OS === "ios" ? 70 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Aluno</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, v.activeTab === "treinos" && { paddingBottom: 60 }]} 
        showsVerticalScrollIndicator={false} 
        refreshControl={<RefreshControl refreshing={v.refreshing} onRefresh={v.onRefresh} tintColor="#FF6B00" />}
      >
        {v.alunoSolicitouSaida && v.status === "aluno_ativo" && (
          <View style={styles.bannerDesistencia}>
            <Ionicons name="warning" size={24} color={theme.colors.backgroundPure} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerDesistenciaTitle}>Solicitação de Desligamento</Text>
              <Text style={styles.bannerDesistenciaText}>Este aluno solicitou o fim da consultoria. Confirme o encerramento no final da tela.</Text>
            </View>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={["rgba(255,107,0,0.15)", theme.colors.background]} style={styles.heroGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            {v.fotoValida ? (
              <Image source={{ uri: v.fotoValida }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }]}>
                <Ionicons name="person" size={55} color="#555" />
              </View>
            )}
            
            {v.status === "aluno_ativo" && <View style={styles.onlineBadge}><View style={styles.onlineBadgeInner} /></View>}
            {v.status === "inativo" && (
              <View style={[styles.onlineBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.textMuted }]}>
                <Ionicons name="archive" size={14} color={theme.colors.textMuted} />
              </View>
            )}
          </View>
          
          <Text style={styles.studentName}>{v.aluno.nome}</Text>
          <Text style={styles.studentGoal}>Foco: {v.objetivoFinal}</Text>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoPill}>
              <Ionicons name="location" size={14} color={theme.colors.primary} />
              <Text style={styles.quickInfoText} numberOfLines={1} ellipsizeMode="tail">{v.aluno.cidade || "Sem Local"}</Text>
            </View>
            
            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=55${v.aluno.telefone?.replace(/\D/g, "")}`)} style={[styles.quickInfoPill, { borderColor: theme.colors.whatsapp }]}>
              <Ionicons name="logo-whatsapp" size={14} color={theme.colors.whatsapp} />
              <Text style={[styles.quickInfoText, { color: theme.colors.whatsapp }]} numberOfLines={1} ellipsizeMode="tail">{v.aluno.telefone || "Sem número"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {v.isFetchingData ? (
           <View style={{ paddingVertical: 40, alignItems: 'center' }}>
             <ActivityIndicator size="small" color={theme.colors.primary} />
           </View>
        ) : (
          <>
            {v.status === "aluno_ativo" && (
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, v.activeTab === "visao_geral" && styles.tabBtnActive]} onPress={() => v.setActiveTab("visao_geral")}>
                  <Text style={[styles.tabText, v.activeTab === "visao_geral" && styles.tabTextActive]}>Visão Geral</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, v.activeTab === "treinos" && styles.tabBtnActive]} onPress={() => v.setActiveTab("treinos")}>
                  <Text style={[styles.tabText, v.activeTab === "treinos" && styles.tabTextActive]}>Treinos & Evolução</Text>
                </TouchableOpacity>
              </View>
            )}

            {v.activeTab === "visao_geral" || v.status !== "aluno_ativo" ? (
              <TabVisaoGeral {...v} navigation={navigation} />
            ) : (
              <TabTreinosEvolucao 
                aluno={v.aluno} 
                navigation={navigation} 
                mostrarAjudaAdesao={v.mostrarAjudaAdesao}
                streak={v.streak}
                adesao={v.adesao}
                ultimosLogs={v.ultimosLogs}
              />
            )}
          </>
        )}
      </ScrollView>

      {v.status !== "inativo" && v.activeTab === "visao_geral" && (
        <View style={styles.floatingActionBar}>
          {v.status === "aguardando_assinatura" ? (
            <View style={styles.actionColumn}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnChatOutline} onPress={v.abrirChat} activeOpacity={0.8}>
                  <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.btnChatOutlineText}>Falar no Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnAccept, { backgroundColor: '#222', borderColor: '#333', borderWidth: 1 }]} 
                  onPress={() => Alert.alert("Proposta Bloqueada 🔒", "A proposta já foi enviada e está aguardando a assinatura do aluno.")} 
                  activeOpacity={0.85}
                >
                  <Text style={[styles.btnAcceptText, { color: '#888', fontSize: moderateScale(14) }]}>Aguardando</Text>
                  <Ionicons name="lock-closed" size={18} color="#888" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          ) : v.status === "lead" || v.status === "em_contato" ? (
            <TouchableOpacity style={styles.btnChat} onPress={v.abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Responder Aluno</Text>
            </TouchableOpacity>
          ) : v.status === "pendente" || v.status === "aguardando_personal" ? (
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.btnChatOutline} onPress={v.abrirChat} activeOpacity={0.8}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.btnChatOutlineText}>Conversar Antes</Text>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnDecline} onPress={() => v.atualizarStatusBasico("recusado")} disabled={v.loading}>
                  <Feather name="x" size={24} color={theme.colors.danger} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnAccept} onPress={v.irParaNovoContrato} disabled={v.loading} activeOpacity={0.85}>
                  <Text style={styles.btnAcceptText}>Criar Proposta VIP</Text>
                  <Ionicons name="document-text" size={20} color={theme.colors.backgroundPure} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnChat} onPress={v.abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Abrir Conversa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}