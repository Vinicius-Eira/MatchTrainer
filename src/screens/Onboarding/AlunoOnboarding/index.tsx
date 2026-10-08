import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Platform, KeyboardAvoidingView, ActivityIndicator, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../theme/theme";

import { useMiniOnboarding, OBJETIVOS, NIVEIS, FREQUENCIAS } from "./useMiniOnboarding";
import { styles } from "./styles";

export function MiniOnboarding({ route, navigation }: any) {
  const { state, actions } = useMiniOnboarding(route, navigation);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      
      <View style={styles.glowTop} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.btnBack, state.step === 1 && { opacity: 0 }]} 
          onPress={() => state.step > 1 && actions.setStep(state.step - 1)}
          disabled={state.step === 1}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.progressWrapper}>
          <Text style={styles.stepText}>ETAPA {state.step} DE {state.totalPassos}</Text>
          <View style={styles.progressContainer}>
            <LinearGradient 
              colors={[theme.colors.primary, "#FF8C00"]} 
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={[styles.progressBar, { width: `${(state.step / state.totalPassos) * 100}%` }]} 
            />
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {state.step === 1 && (
          <View style={styles.stepContainerCenter}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              {state.personalInfo?.foto_url ? (
                <Image source={{ uri: state.personalInfo.foto_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#333" />
                </View>
              )}
              <View style={styles.badgeSuccess}>
                <Ionicons name="checkmark-sharp" size={16} color="#000" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Conexão <Text style={styles.titleHighlight}>Estabelecida</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Você acaba de se conectar ao time do treinador <Text style={styles.highlight}>{state.personalInfo?.nome?.split(" ")[0] || "Personal"}</Text>.
            </Text>
            
            <View style={styles.photoSection}>
              <Text style={styles.featuresTitle}>Sua Foto de Perfil</Text>
              <TouchableOpacity style={styles.photoBtn} onPress={actions.handlePickImage} activeOpacity={0.8}>
                {state.fotoAluno ? (
                  <Image source={{ uri: state.fotoAluno }} style={styles.photoSelected} />
                ) : (
                  <View style={styles.photoPlaceholderUI}>
                    <Ionicons name="camera" size={28} color="#888" />
                  </View>
                )}
                <Text style={styles.photoBtnText}>{state.fotoAluno ? "Alterar Foto" : "Selecionar Foto"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>O que vai acontecer agora?</Text>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="body" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Mapeamento Físico</Text>
                  <Text style={styles.featureItemDesc}>Vamos colher seus dados para criar um ponto de partida exato.</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="compass" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Alinhamento de Metas</Text>
                  <Text style={styles.featureItemDesc}>Definiremos seu objetivo para direcionar a estratégia do treino.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}><Ionicons name="star" size={20} color={theme.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Proposta VIP</Text>
                  <Text style={styles.featureItemDesc}>O professor enviará seu contrato digital para liberar o acesso total.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {state.step === 2 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Métricas e <Text style={styles.titleHighlight}>Contato</Text></Text>
            <Text style={styles.sectionSubtitle}>Precisamos do seu ponto de partida para que o professor trace a melhor rota para o seu resultado.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Onde você mora?</Text>
              <View style={[styles.inputBox, state.inputFocado === "cidade" && styles.inputBoxFocused]}>
                <Ionicons name="location-outline" size={18} color={state.inputFocado === "cidade" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: São Paulo, SP"
                  placeholderTextColor="#555"
                  autoCapitalize="words"
                  value={state.cidade}
                  onChangeText={actions.setCidade}
                  onFocus={() => actions.setInputFocado("cidade")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nascimento</Text>
                <View style={[styles.inputBox, state.inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <Ionicons name="calendar-outline" size={18} color={state.inputFocado === "nasc" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={10}
                    value={state.dataNascimento}
                    onChangeText={actions.formatarData}
                    onFocus={() => actions.setInputFocado("nasc")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>WhatsApp</Text>
                <View style={[styles.inputBox, state.inputFocado === "whats" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color={state.inputFocado === "whats" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={state.telefone}
                    onChangeText={actions.formatarWhatsApp}
                    onFocus={() => actions.setInputFocado("whats")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.label}>Biometria Atual</Text>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={[styles.inputBox, state.inputFocado === "altura" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="human-male-height" size={20} color={state.inputFocado === "altura" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Altura"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={3}
                    value={state.altura}
                    onChangeText={actions.formatarAltura}
                    onFocus={() => actions.setInputFocado("altura")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>cm</Text>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={[styles.inputBox, state.inputFocado === "peso" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={state.inputFocado === "peso" ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Peso"
                    placeholderTextColor="#555"
                    keyboardType="decimal-pad"
                    maxLength={6}
                    value={state.peso}
                    onChangeText={actions.formatarPeso}
                    onFocus={() => actions.setInputFocado("peso")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>kg</Text>
                </View>
              </View>
            </View>

            <View style={styles.targetWeightBox}>
              <View style={styles.targetIconBox}>
                <Ionicons name="flag" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.targetTitle}>Qual a sua meta de peso?</Text>
                <View style={styles.targetInputContainer}>
                  <TextInput
                    style={styles.targetInput}
                    placeholder="Ex: 70.0"
                    placeholderTextColor="#555"
                    keyboardType="decimal-pad"
                    maxLength={6}
                    value={state.metaPeso}
                    onChangeText={actions.formatarMetaPeso}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.targetSuffix}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {state.step === 3 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Seu <Text style={styles.titleHighlight}>Direcionamento</Text></Text>
            <Text style={styles.sectionSubtitle}>Defina o foco central do seu treinamento para que a estratégia seja exata.</Text>

            <Text style={styles.label}>Objetivo Principal</Text>
            <View style={styles.gridContainer}>
              {OBJETIVOS.map((item) => {
                const isSelected = state.objetivo === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, isSelected && styles.premiumCardActive]}
                    onPress={() => actions.setObjetivo(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive]}>
                      <FontAwesome5 name={item.icon} size={16} color={isSelected ? theme.colors.primary : "#888"} />
                    </View>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>{item.titulo}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />
            <Text style={styles.label}>Nível de Experiência Física</Text>
            
            <View style={styles.gridContainer}>
              {NIVEIS.map((item) => {
                const isSelected = state.nivel === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, { width: '100%', flexDirection: 'row', alignItems: 'center' }, isSelected && styles.premiumCardActive]}
                    onPress={() => actions.setNivel(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive, { marginBottom: 0, marginRight: 16 }]}>
                      <FontAwesome5 name={item.icon} size={16} color={isSelected ? theme.colors.primary : "#888"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive, { marginBottom: 2 }]}>{item.titulo}</Text>
                      <Text style={styles.cardDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {state.step === 4 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Sua <Text style={styles.titleHighlight}>Frequência</Text></Text>
            <Text style={styles.sectionSubtitle}>Seja realista com a sua rotina. O volume de treino será distribuído pelos dias que você marcar.</Text>

            <View style={styles.gridContainer}>
              {FREQUENCIAS.map((item) => {
                const isSelected = state.diasTreino === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.premiumCard, { width: '100%', flexDirection: 'row', alignItems: 'center' }, isSelected && styles.premiumCardActive]}
                    onPress={() => actions.setDiasTreino(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.cardIconWrap, isSelected && styles.cardIconWrapActive, { marginBottom: 0, marginRight: 16 }]}>
                      <Ionicons name={item.icon as any} size={20} color={isSelected ? theme.colors.primary : "#888"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive, { marginBottom: 0 }]}>{item.titulo}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconBox}><Ionicons name="bulb" size={20} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>Lembre-se</Text>
                <Text style={styles.tipDesc}>A constância bate a intensidade. Treinar bem 3 vezes na semana traz mais resultados do que treinar 6 e desistir rápido.</Text>
              </View>
            </View>
          </View>
        )}

        {state.step === 5 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>Atenção à <Text style={styles.titleHighlight}>Saúde</Text></Text>
            <Text style={styles.sectionSubtitle}>Informações médicas são essenciais para estruturarmos o plano e evitar lesões.</Text>

            <Text style={[styles.label, { textAlign: 'center', marginBottom: 15 }]}>Possui dores crônicas, lesões ou laudo médico?</Text>
            
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, state.temRestricao === false && styles.yesNoBtnGreen]}
                onPress={() => { actions.setTemRestricao(false); actions.setDetalhes(""); }}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={28} color={state.temRestricao === false ? "#00E676" : "#444"} style={{ marginBottom: 8 }} />
                <Text style={[styles.yesNoText, state.temRestricao === false && { color: "#00E676" }]}>Não, 100% Saudável</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.yesNoBtn, state.temRestricao === true && styles.yesNoBtnRed]}
                onPress={() => actions.setTemRestricao(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="alert-circle" size={28} color={state.temRestricao === true ? "#FF3B30" : "#444"} style={{ marginBottom: 8 }} />
                <Text style={[styles.yesNoText, state.temRestricao === true && { color: "#FF3B30" }]}>Sim, possuo restrição</Text>
              </TouchableOpacity>
            </View>

            {state.temRestricao && (
              <View style={styles.detalhesArea}>
                <Text style={styles.label}>Por favor, detalhe sua condição:</Text>
                <View style={styles.textAreaBox}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Ex: Condromalácia patelar no joelho esquerdo, dor na lombar..."
                    placeholderTextColor="#555"
                    multiline
                    keyboardAppearance="dark"
                    value={state.detalhes}
                    onChangeText={actions.setDetalhes}
                  />
                </View>
              </View>
            )}

            {!state.temRestricao && state.temRestricao !== null && (
               <View style={[styles.tipCard, { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" }]}>
                 <View style={[styles.tipIconBox, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}><Ionicons name="shield-checkmark" size={20} color="#00E676" /></View>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.tipTitle, { color: "#00E676" }]}>Tudo Certo!</Text>
                   <Text style={styles.tipDesc}>Excelente. Sem restrições de saúde, o seu professor tem carta branca para montar um treino de alta performance.</Text>
                 </View>
               </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, state.loading && { opacity: 0.7 }]}
          onPress={state.step === state.totalPassos ? actions.handleFinalizar : actions.handleNext}
          disabled={state.loading}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
            {state.loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.btnPrimaryText}>
=                  {state.step === state.totalPassos ? "Liberar Minha Proposta VIP" : "Avançar Etapa"}
                </Text>
                {state.step < state.totalPassos && <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 8 }} />}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};