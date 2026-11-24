import React from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompartilhamentoPersonal, RegistroConsentimento } from "../../../../services/lgpd/lgpdService";
import { styles } from "../styles";

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  carregando: boolean;
  consentimentoSaudeAtivo: boolean;
  consentimentos: RegistroConsentimento[];
  personalsComAcesso: CompartilhamentoPersonal[];
  revogandoSaude: boolean;
  onRevogarSaude: () => void;
  onAbrirTermos: () => void;
}

const formatarDataHora = (iso?: string | null) => {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("pt-BR");
};

const traduzirStatus = (status: string) => {
  if (status === "aluno_ativo") return "Contrato Ativo";
  if (status === "aguardando_assinatura" || status === "aguardando_aluno") return "Proposta Pendente";
  return "Em Contato";
};

export function PrivacyModal({
  visible,
  onClose,
  carregando,
  consentimentoSaudeAtivo,
  consentimentos,
  personalsComAcesso,
  revogandoSaude,
  onRevogarSaude,
  onAbrirTermos,
}: PrivacyModalProps) {
  const ultimoSaude = consentimentos.find((c) => c.tipo_consentimento === "dados_saude_match");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalSub}>LGPD • LEI Nº 13.709/2018</Text>
            <Text style={styles.modalTitle}>Privacidade e Seus Dados</Text>
          </View>
          <TouchableOpacity style={styles.btnFecharModal} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
=            <View style={styles.lgpdCard}>
              <Text style={styles.lgpdCardTitle}>Dados Sensíveis de Saúde no Match</Text>
              <Text style={styles.lgpdCardText}>
                Informações sobre lesões, gestação ou condições clínicas são opcionais e usadas apenas para filtrar
                personal trainers aptos a atender seu caso com segurança.
              </Text>

              <View style={styles.lgpdStatusRow}>
                <Text style={styles.lgpdCardText}>
                  Status atual{ultimoSaude?.aceito_em ? ` (${formatarDataHora(ultimoSaude.aceito_em)})` : ""}:
                </Text>
                <View
                  style={[
                    styles.lgpdPill,
                    consentimentoSaudeAtivo
                      ? { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.45)" }
                      : { backgroundColor: "rgba(161, 161, 170, 0.12)", borderColor: "rgba(161, 161, 170, 0.35)" },
                  ]}
                >
                  <Text style={[styles.lgpdPillText, { color: consentimentoSaudeAtivo ? "#00E676" : "#A1A1AA" }]}>
                    {consentimentoSaudeAtivo ? "Autorizado" : "Não informado / Revogado"}
                  </Text>
                </View>
              </View>

              {consentimentoSaudeAtivo && (
                <TouchableOpacity
                  style={[styles.btnRevogar, revogandoSaude && { opacity: 0.6 }]}
                  onPress={onRevogarSaude}
                  disabled={revogandoSaude}
                  activeOpacity={0.85}
                >
                  {revogandoSaude ? (
                    <ActivityIndicator size="small" color="#FF3B30" />
                  ) : (
                    <>
                      <Ionicons name="shield-outline" size={16} color="#FF3B30" />
                      <Text style={styles.btnRevogarText}>Revogar e Apagar Dados de Saúde</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

=            <View style={styles.lgpdCard}>
              <Text style={styles.lgpdCardTitle}>Quem Pode Ver Seu Perfil</Text>
              <Text style={styles.lgpdCardText}>
                Seu perfil é privado. Nenhum personal trainer vê seus dados pessoais ou de saúde antes de você iniciar
                contato ou aceitar um convite.
              </Text>

              {personalsComAcesso.length === 0 ? (
                <Text style={[styles.lgpdCardText, { marginTop: 10, color: "#71717A" }]}>
                  Nenhum profissional possui acesso aos seus dados no momento.
                </Text>
              ) : (
                personalsComAcesso.map((item) => (
                  <View key={item.conexaoId} style={styles.sharedRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{item.personalNome}</Text>
                      <Text style={styles.actionDesc}>{item.personalCidade || "Atendimento Online"}</Text>
                    </View>
                    <View
                      style={[
                        styles.lgpdPill,
                        { backgroundColor: "rgba(255, 107, 0, 0.12)", borderColor: "rgba(255, 107, 0, 0.4)" },
                      ]}
                    >
                      <Text style={[styles.lgpdPillText, { color: "#FF6B00" }]}>{traduzirStatus(item.status)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

=            <View style={styles.lgpdCard}>
              <Text style={styles.lgpdCardTitle}>Transparência do Algoritmo de Match</Text>
              <Text style={styles.lgpdCardText}>
                O MatchTrainer utiliza critérios objetivos (modalidade, objetivos, restrições de saúde quando autorizadas,
                horários, faixa de investimento e estilo de acompanhamento) para ordenar profissionais compatíveis. Você
                pode revisar e alterar suas preferências a qualquer momento.
              </Text>
            </View>

            <TouchableOpacity style={styles.actionCard} onPress={onAbrirTermos} activeOpacity={0.8}>
              <View style={styles.actionIconBox}>
                <Ionicons name="document-text-outline" size={20} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Termos de Uso e Política de Privacidade</Text>
                <Text style={styles.actionDesc}>Consulte as diretrizes de tratamento e seus direitos como titular.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}