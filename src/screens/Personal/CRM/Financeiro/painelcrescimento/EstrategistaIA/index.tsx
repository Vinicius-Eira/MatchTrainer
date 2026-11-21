import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../../../../services/supabase";
import { styles } from "./styles";

interface ModalEstrategistaIAProps {
  visible: boolean;
  onClose: () => void;
}

export function ModalEstrategistaIA({ visible, onClose }: ModalEstrategistaIAProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(false);
  const [plano, setPlano] = useState<any | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  const gerarPlano = useCallback(async () => {
    setLoading(true);
    setErro(false);
    try {
      const { data, error } = await supabase.functions.invoke("consultor-business-ia", {
        body: {},
      });

      if (error) throw error;
      if (!data?.plano) throw new Error("Resposta vazia da IA.");
      setPlano(data.plano);
    } catch (err: any) {
      setErro(true);
      Alert.alert("Erro", err?.message || "Não foi possível gerar seu plano agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleModalShow = () => {
    if (!plano && !loading) {
      gerarPlano();
    }
  };

  const copiarScript = async (mensagem: string, idx: number) => {
    await Clipboard.setStringAsync(mensagem);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2200);
  };

  const compartilharScript = async (mensagem: string) => {
    try {
      await Share.share({ message: mensagem });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" onShow={handleModalShow} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>CONSULTOR GEMINI • MATCHBUSINESS</Text>
            <Text style={styles.headerTitle}>Plano Estratégico da Semana</Text>
          </View>
          <TouchableOpacity style={styles.btnFechar} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading || (!plano && !erro) ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingTitle}>Analisando seu Negócio...</Text>
            <Text style={styles.loadingSub}>
              Cruzando seu MRR, funil de vendas, convites e força da marca para montar suas 3 missões e scripts prontos.
            </Text>
          </View>
        ) : plano ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.diagCard}>
              <LinearGradient colors={["rgba(255, 107, 0, 0.14)", "transparent"]} style={StyleSheet.absoluteFill} />
              <View style={styles.diagBadge}>
                <Ionicons name="sparkles" size={14} color="#FF6B00" />
                <Text style={styles.diagBadgeText}>DIAGNÓSTICO REAL</Text>
              </View>
              <Text style={styles.diagTitle}>{plano.diagnostico?.titulo}</Text>
              <Text style={styles.diagResumo}>{plano.diagnostico?.resumo}</Text>

              {plano.diagnostico?.foco_semana && (
                <View style={styles.focoBox}>
                  <Ionicons name="flag" size={16} color="#FF6B00" />
                  <Text style={styles.focoText}>Foco: {plano.diagnostico.foco_semana}</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionLabel}>3 Missões Práticas da Semana</Text>
            {(plano.missoes || []).map((m: any, idx: number) => (
              <View key={idx} style={styles.missaoCard}>
                <View style={styles.missaoNum}>
                  <Text style={styles.missaoNumText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.missaoTitle}>{m.titulo}</Text>
                  <Text style={styles.missaoDesc}>{m.descricao}</Text>
                  {m.impacto ? (
                    <View style={styles.missaoImpactoPill}>
                      <Text style={styles.missaoImpactoText}>{m.impacto}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Scripts Prontos para WhatsApp</Text>
            {(plano.scripts || []).map((s: any, idx: number) => {
              const copiado = copiadoIdx === idx;
              return (
                <View key={idx} style={styles.scriptCard}>
                  <View style={styles.scriptHeader}>
                    <Text style={styles.scriptTitle}>{s.titulo}</Text>
                    <Text style={styles.scriptCanal}>{s.canal}</Text>
                  </View>
                  <View style={styles.scriptMsgBox}>
                    <Text style={styles.scriptMsg}>{s.mensagem}</Text>
                  </View>
                  <View style={styles.scriptActions}>
                    <TouchableOpacity
                      style={styles.btnCopiar}
                      onPress={() => copiarScript(s.mensagem, idx)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copiado ? "checkmark-circle" : "copy-outline"}
                        size={15}
                        color={copiado ? "#00E676" : "#FFF"}
                      />
                      <Text style={[styles.btnCopiarText, copiado && { color: "#00E676" }]}>
                        {copiado ? "Copiado!" : "Copiar"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnEnviar}
                      onPress={() => compartilharScript(s.mensagem)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="share-social-outline" size={15} color="#FF6B00" />
                      <Text style={styles.btnEnviarText}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.btnRegerar} onPress={gerarPlano} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color="#FF6B00" />
              <Text style={styles.btnRegerarText}>Atualizar Análise com IA</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.loadingBox}>
            <TouchableOpacity style={styles.btnRegerar} onPress={gerarPlano}>
              <Text style={styles.btnRegerarText}>Tentar Gerar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}