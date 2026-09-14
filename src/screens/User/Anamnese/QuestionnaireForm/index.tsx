import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./QuestionnaireFormStyles";
import { useQuestionnaireForm } from "./useQuestionnaireForm";

export default function QuestionnaireForm({ route, navigation }: any) {
  const { titulo, perguntas, respostas, atualizarResposta, validarEEnviar, voltar } = useQuestionnaireForm(navigation, route);

  const renderizarPergunta = (pergunta: any, index: number) => {
    const respostaAtual = respostas[pergunta.id];

    return (
      <View key={pergunta.id} style={styles.questionBlock}>
        <Text style={styles.questionText}>
          <Text style={styles.questionNumber}>{index + 1}. </Text>
          {pergunta.pergunta} {pergunta.obrigatorio && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>

        {pergunta.tipo === 'numero' && (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputNumber}
              keyboardType="numeric"
              placeholder="0.0"
              placeholderTextColor="#555"
              value={respostaAtual || ""}
              onChangeText={(text) => atualizarResposta(pergunta.id, text)}
            />
            {pergunta.sufixo && <Text style={styles.inputSuffix}>{pergunta.sufixo}</Text>}
          </View>
        )}

        {pergunta.tipo === 'escala' && (
          <View style={styles.scaleContainer}>
            <View style={styles.scaleRow}>
              {[1, 2, 3, 4, 5].map((num) => {
                const isSelected = respostaAtual === num;
                return (
                  <TouchableOpacity 
                    key={num} 
                    style={[styles.scaleBtn, isSelected && styles.scaleBtnSelected]}
                    onPress={() => atualizarResposta(pergunta.id, num)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.scaleText, isSelected && styles.scaleTextSelected]}>{num}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabelText}>{pergunta.labels[0]}</Text>
              <Text style={styles.scaleLabelText}>{pergunta.labels[1]}</Text>
            </View>
          </View>
        )}

        {pergunta.tipo === 'sim_nao' && (
          <View style={styles.yesNoRow}>
            <TouchableOpacity 
              style={[styles.yesNoBtn, respostaAtual === true && styles.yesNoBtnSelected]}
              onPress={() => atualizarResposta(pergunta.id, true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.yesNoText, respostaAtual === true && styles.yesNoTextSelected]}>SIM</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.yesNoBtn, respostaAtual === false && styles.yesNoBtnSelected]}
              onPress={() => atualizarResposta(pergunta.id, false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.yesNoText, respostaAtual === false && styles.yesNoTextSelected]}>NÃO</Text>
            </TouchableOpacity>
          </View>
        )}

        {pergunta.tipo === 'texto' && (
          <TextInput
            style={styles.inputText}
            placeholder="Digite sua resposta aqui..."
            placeholderTextColor="#555"
            multiline
            value={respostaAtual || ""}
            onChangeText={(text) => atualizarResposta(pergunta.id, text)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titulo}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.introBox}>
            <Text style={styles.introText}>Responda com sinceridade. Suas respostas ajudam o personal a ajustar o seu planejamento.</Text>
          </View>

          <View style={styles.formContainer}>
            {perguntas.map((pergunta, index) => renderizarPergunta(pergunta, index))}
          </View>

          <TouchableOpacity style={styles.btnSubmit} onPress={validarEEnviar} activeOpacity={0.9}>
            <Ionicons name="paper-plane" size={20} color="#000" />
            <Text style={styles.btnSubmitText}>ENVIAR CHECK-IN</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}