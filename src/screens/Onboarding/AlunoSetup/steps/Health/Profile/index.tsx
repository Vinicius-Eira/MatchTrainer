import React from "react";
import { ActivityIndicator, Image, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { OPCOES_GENERO_USUARIO } from "@/src/shared/matchSchema"; 
import { theme } from "../../../../../../theme/theme"; 
import { moderateScale, scale } from "../../../../../../utils/responsive";
import { styles } from "../../../styles";
import { ChipsSelector } from "../../FormControls";

export function Profile({ state, actions }: { state: any; actions: any }) {
  const webOutline = Platform.OS === "web" ? { outlineStyle: "none" as any } : {};

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Sua <Text style={styles.titleHighlight}>Jornada</Text> começa aqui.
        </Text>
        <Text style={styles.subTitle}>
          Usamos esses dados para calibrar seu Match. Seu contato permanece privado até você iniciar uma conversa.
        </Text>
      </View>

      <View style={styles.privacyHintBanner}>
        <Ionicons name="shield-checkmark-outline" size={18} color="#00E676" style={{ marginTop: 1 }} />
        <Text style={styles.privacyHintText}>
          Privacidade LGPD: nenhum personal vê seu telefone, localização exata ou dados de saúde antes de você escolher
          iniciar contato.
        </Text>
      </View>

      <View style={styles.photoSection}>
        <TouchableOpacity onPress={actions.escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
          {state.fotoUri ? (
            <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={moderateScale(46)} color="#888" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={moderateScale(15)} color="#000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Foto de perfil (opcional)</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Como quer ser chamado? *</Text>
        <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
          <Ionicons
            name="person-outline"
            size={19}
            color={state.inputFocado === "nome" ? theme.colors.primary : "#888"}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="Nome ou apelido"
            placeholderTextColor="#666"
            value={state.nome}
            onChangeText={(t: string) => actions.setNome(actions.formatarNome(t))}
            onFocus={() => actions.setInputFocado("nome")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Seu Gênero *</Text>
        <ChipsSelector opcoes={OPCOES_GENERO_USUARIO} value={state.genero} onSelect={actions.setGenero} isSingle />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: scale(6) }]}>
          <Text style={styles.inputLabel}>Nascimento *</Text>
          <View style={[styles.inputBox, state.inputFocado === "nasc" && styles.inputBoxFocused]}>
            <TextInput
              style={[styles.inputPremium, webOutline]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={10}
              value={state.dataNascimento}
              onChangeText={actions.formatarData}
              onFocus={() => actions.setInputFocado("nasc")}
              onBlur={() => actions.setInputFocado(null)}
              keyboardAppearance="dark"
            />
          </View>
        </View>

        <View style={[styles.formGroup, { flex: 1, marginLeft: scale(6) }]}>
          <Text style={styles.inputLabel}>WhatsApp *</Text>
          <View style={[styles.inputBox, state.inputFocado === "wpp" && styles.inputBoxFocused]}>
            <TextInput
              style={[styles.inputPremium, webOutline]}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={state.telefone}
              onChangeText={actions.formatarWhatsApp}
              onFocus={() => actions.setInputFocado("wpp")}
              onBlur={() => actions.setInputFocado(null)}
              keyboardAppearance="dark"
            />
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Localização Base *</Text>
        <TouchableOpacity
          style={styles.btnGpsRadar}
          onPress={actions.buscarLocalizacao}
          disabled={state.buscandoLocal}
          activeOpacity={0.8}
        >
          {state.buscandoLocal ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="radar" size={moderateScale(19)} color={theme.colors.primary} />
              <Text style={styles.btnGpsRadarText}>Sincronizar GPS (Opcional p/ Online)</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: scale(6), marginBottom: 0 }]}>
            <View style={[styles.inputBox, state.inputFocado === "cidade" && styles.inputBoxFocused]}>
              <TextInput
                style={[styles.inputPremium, webOutline]}
                placeholder="Cidade *"
                placeholderTextColor="#666"
                value={state.cidade}
                onChangeText={actions.setCidade}
                onFocus={() => actions.setInputFocado("cidade")}
                onBlur={() => actions.setInputFocado(null)}
                keyboardAppearance="dark"
              />
            </View>
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: scale(6), marginBottom: 0 }]}>
            <View style={[styles.inputBox, state.inputFocado === "bairro" && styles.inputBoxFocused]}>
              <TextInput
                style={[styles.inputPremium, webOutline]}
                placeholder="Bairro (Opcional)"
                placeholderTextColor="#666"
                value={state.bairro}
                onChangeText={actions.setBairro}
                onFocus={() => actions.setInputFocado("bairro")}
                onBlur={() => actions.setInputFocado(null)}
                keyboardAppearance="dark"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Biometria Básica (Opcional)</Text>
      <Text style={styles.helpText}>Não altera o Match — ajuda o personal escolhido no início do acompanhamento.</Text>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: scale(6) }]}>
          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <View style={[styles.inputBox, state.inputFocado === "peso" && styles.inputBoxFocused]}>
            <TextInput
              style={[styles.inputPremium, webOutline]}
              placeholder="Ex: 74.5"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              maxLength={5}
              value={state.peso}
              onChangeText={actions.formatarPeso}
              onFocus={() => actions.setInputFocado("peso")}
              onBlur={() => actions.setInputFocado(null)}
              keyboardAppearance="dark"
            />
          </View>
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: scale(6) }]}>
          <Text style={styles.inputLabel}>Altura (cm)</Text>
          <View style={[styles.inputBox, state.inputFocado === "altura" && styles.inputBoxFocused]}>
            <TextInput
              style={[styles.inputPremium, webOutline]}
              placeholder="Ex: 175"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={3}
              value={state.altura}
              onChangeText={actions.formatarAltura}
              onFocus={() => actions.setInputFocado("altura")}
              onBlur={() => actions.setInputFocado(null)}
              keyboardAppearance="dark"
            />
          </View>
        </View>
      </View>

      <View style={styles.targetWeightBox}>
        <View style={styles.targetIconBox}>
          <Ionicons name="flag" size={moderateScale(19)} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.targetTitle}>Meta de Peso (kg • Opcional)</Text>
          <TextInput
            style={[styles.targetInput, webOutline]}
            placeholder="Ex: 70.0"
            placeholderTextColor="#555"
            keyboardType="decimal-pad"
            maxLength={5}
            value={state.metaPeso}
            onChangeText={actions.formatarMetaPeso}
            onFocus={() => actions.setInputFocado("metaPeso")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>
    </View>
  );
}