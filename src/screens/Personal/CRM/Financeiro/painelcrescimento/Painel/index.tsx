import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { InfoModalDados } from "../usePainelCrescimento";
import { styles } from "./styles";

interface ModaisPainelProps {
  modalInfoVisivel: boolean;
  setModalInfoVisivel: (v: boolean) => void;
  infoDados: InfoModalDados;
  modalMetaVisivel: boolean;
  setModalMetaVisivel: (v: boolean) => void;
  novaMetaValor: string;
  onChangeMeta: (v: string) => void;
  salvandoMeta: boolean;
  onSalvarMeta: () => void;
}

export function Painel({
  modalInfoVisivel,
  setModalInfoVisivel,
  infoDados,
  modalMetaVisivel,
  setModalMetaVisivel,
  novaMetaValor,
  onChangeMeta,
  salvandoMeta,
  onSalvarMeta,
}: ModaisPainelProps) {
  return (
    <>
      <Modal visible={modalInfoVisivel} animationType="fade" transparent onRequestClose={() => setModalInfoVisivel(false)}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoDados.titulo}</Text>
              <TouchableOpacity onPress={() => setModalInfoVisivel(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center" }}>
              <View style={styles.infoModalIconBox}>
                <Ionicons name="book" size={26} color="#FF6B00" />
              </View>
            </View>
            <Text style={styles.infoModalText}>{infoDados.texto}</Text>
            <View style={styles.infoModalDicaBox}>
              <Ionicons name="bulb" size={22} color="#FF6B00" />
              <Text style={styles.infoModalDicaText}>{infoDados.dica}</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalMetaVisivel} animationType="slide" transparent onRequestClose={() => setModalMetaVisivel(false)}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Definir Meta de MRR</Text>
              <TouchableOpacity onPress={() => setModalMetaVisivel(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.metaDesc}>
              Defina seu objetivo de faturamento recorrente mensal. Calculamos automaticamente quantos alunos novos faltam no seu ticket atual.
            </Text>
            <Text style={styles.inputLabel}>Valor Alvo Mensal (R$)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>R$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                keyboardAppearance="dark"
                value={novaMetaValor}
                onChangeText={onChangeMeta}
                cursorColor="#FF6B00"
                placeholder="5.000,00"
                placeholderTextColor="#555"
              />
            </View>
            <TouchableOpacity
              style={[styles.btnConfirmar, salvandoMeta && { opacity: 0.7 }]}
              onPress={onSalvarMeta}
              disabled={salvandoMeta}
              activeOpacity={0.85}
            >
              {salvandoMeta ? (
                <ActivityIndicator color="#FF6B00" />
              ) : (
                <Text style={styles.btnConfirmarText}>Salvar Meta Mensal</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}