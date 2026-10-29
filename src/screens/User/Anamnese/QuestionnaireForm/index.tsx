import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { useQuestionnaireForm } from "./useQuestionnaireForm";

export function QuestionnaireForm({ route, navigation }: any) {
  const { titulo, perguntas, respostas, atualizarResposta, validarEEnviar, voltar, enviando, leituraModoPersonal } = useQuestionnaireForm(navigation, route);

  const corDestaque = leituraModoPersonal ? "#00E676" : "#FF6B00";
  const bgDestaque = leituraModoPersonal ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 107, 0, 0.1)";

  const renderizarPergunta = (pergunta: any, index: number) => {
    const respostaAtual = respostas[pergunta.id];

    return (
      <View key={pergunta.id} style={[styles.questionCard, leituraModoPersonal && styles.questionCardLeitura]}>
        <LinearGradient 
          colors={leituraModoPersonal ? ["#0A0A0C", "#0D1110"] : ["#0A0A0C", "#120B05"]} 
          style={styles.cardGradient} 
        />
        
        <View style={styles.questionHeader}>
          <View style={[styles.questionNumberBox, { backgroundColor: bgDestaque }]}>
            <Text style={[styles.questionNumberText, { color: corDestaque }]}>{index + 1}</Text>
          </View>
          <Text style={styles.questionText}>
            {pergunta.pergunta} {pergunta.obrigatorio && !leituraModoPersonal && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
        </View>

        <View style={styles.answerArea}>
          {(pergunta.tipo === 'sim_nao' || pergunta.tipo === 'booleano') && (
            <View style={styles.yesNoRow}>
              <TouchableOpacity 
                style={[
                  styles.yesNoBtn, 
                  respostaAtual === "Sim" && { backgroundColor: bgDestaque, borderColor: corDestaque },
                  leituraModoPersonal && respostaAtual !== "Sim" && { opacity: 0.3 }
                ]}
                onPress={() => atualizarResposta(pergunta.id, "Sim")}
                activeOpacity={leituraModoPersonal ? 1 : 0.7} 
              >
                <Text style={[styles.yesNoText, respostaAtual === "Sim" && { color: corDestaque, fontWeight: "900" }]}>SIM</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.yesNoBtn, 
                  respostaAtual === "Não" && { backgroundColor: bgDestaque, borderColor: corDestaque },
                  leituraModoPersonal && respostaAtual !== "Não" && { opacity: 0.3 }
                ]}
                onPress={() => atualizarResposta(pergunta.id, "Não")}
                activeOpacity={leituraModoPersonal ? 1 : 0.7} 
              >
                <Text style={[styles.yesNoText, respostaAtual === "Não" && { color: corDestaque, fontWeight: "900" }]}>NÃO</Text>
              </TouchableOpacity>
            </View>
          )}

          {pergunta.tipo === 'multipla' && pergunta.opcoes && (
            <View style={styles.optionsWrap}>
              {pergunta.opcoes.map((op: string, idx: number) => {
                const isSelected = respostaAtual === op;
                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[
                      styles.optionChip,
                      isSelected && { backgroundColor: bgDestaque, borderColor: corDestaque },
                      leituraModoPersonal && !isSelected && { opacity: 0.2, backgroundColor: "transparent", borderColor: "#222" }
                    ]}
                    onPress={() => atualizarResposta(pergunta.id, op)}
                    activeOpacity={leituraModoPersonal ? 1 : 0.7} 
                  >
                    <Text style={[styles.optionChipText, isSelected && { color: corDestaque, fontWeight: "bold" }]}>{op}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {pergunta.tipo === 'texto' && (
            <TextInput
              style={[
                styles.inputText, 
                leituraModoPersonal && { color: "#FFF", borderColor: "rgba(0, 230, 118, 0.2)", backgroundColor: "rgba(0, 230, 118, 0.03)" }
              ]}
              placeholder={leituraModoPersonal ? "O aluno preferiu não responder." : "Descreva aqui sua resposta..."}
              placeholderTextColor="#555"
              multiline
              value={respostaAtual || ""}
              onChangeText={(text) => atualizarResposta(pergunta.id, text)}
              editable={!leituraModoPersonal} 
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name={leituraModoPersonal ? "chevron-back" : "close"} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{leituraModoPersonal ? "FICHA DE AVALIAÇÃO" : "AVALIAÇÃO VIP"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.titleWrapper}>
             <Text style={styles.mainTitle}>{titulo}</Text>
          </View>

          <View style={[styles.introBox, leituraModoPersonal && { backgroundColor: "rgba(0, 230, 118, 0.08)", borderColor: "rgba(0, 230, 118, 0.3)" }]}>
            {leituraModoPersonal ? (
               <View style={styles.introRow}>
                 <Ionicons name="information-circle" size={20} color="#00E676" />
                 <Text style={[styles.introText, { color: "#00E676", fontWeight: "bold", marginLeft: 8 }]}>
                   Modo Leitura: Estas são as respostas originais enviadas pelo seu aluno.
                 </Text>
               </View>
            ) : (
               <View style={styles.introRow}>
                 <Ionicons name="sparkles" size={20} color="#FF6B00" />
                 <Text style={[styles.introText, { marginLeft: 8 }]}>
                   Sinceridade é a chave! Suas respostas moldam a qualidade do seu planejamento.
                 </Text>
               </View>
            )}
          </View>

          <View style={styles.formContainer}>
            {perguntas.map((pergunta: any, index: number) => renderizarPergunta(pergunta, index))}
          </View>

          {!leituraModoPersonal && (
            <TouchableOpacity style={[styles.btnSubmit, enviando && { opacity: 0.7 }]} onPress={validarEEnviar} activeOpacity={0.9} disabled={enviando}>
              <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnGradient} />
              {enviando ? (
                <Text style={styles.btnSubmitText}>SALVANDO...</Text>
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#FFF" />
                  <Text style={styles.btnSubmitText}>FINALIZAR E ENVIAR</Text>
                </>
              )}
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}