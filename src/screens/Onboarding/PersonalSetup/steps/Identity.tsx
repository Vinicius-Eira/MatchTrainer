import React from "react";
import { ActivityIndicator, Image, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../../../../theme/theme";
import { moderateScale } from "../../../../utils/responsive";
import { OPCOES_GENERO } from "../constants";
import { styles } from "../styles";
import { ChipsSelector } from "./FormControls";

export function Identity({ state, actions }: { state: any; actions: any }) {
  const webOutline = Platform.OS === "web" ? { outlineStyle: "none" as any } : {};

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Sua <Text style={styles.titleHighlight}>Identidade.</Text>
        </Text>
        <Text style={styles.subTitle}>Os dados essenciais para o seu perfil profissional e segurança dos alunos.</Text>
      </View>

      <View style={styles.photoSection}>
        <TouchableOpacity onPress={actions.selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
          {state.fotoUri ? (
            <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={moderateScale(46)} color="#888" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={moderateScale(16)} color="#000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Toque para adicionar ou trocar sua foto de perfil</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nome Público *</Text>
        <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="Ex: Personal João Silva"
            placeholderTextColor="#666"
            value={state.nome}
            onChangeText={(t) => actions.setNome(actions.formatarNome(t))}
            onFocus={() => actions.setInputFocado("nome")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Seu Gênero *</Text>
        <ChipsSelector opcoes={OPCOES_GENERO} value={state.genero} onSelect={actions.setGenero} isSingle />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>CREF Profissional *</Text>
        <View style={[styles.inputBox, state.inputFocado === "cref" && styles.inputBoxFocused]}>
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="000000-G/SP"
            placeholderTextColor="#666"
            value={state.cref}
            onChangeText={(t) => actions.setCref(t.toUpperCase())}
            onFocus={() => actions.setInputFocado("cref")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
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

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Localização de Atendimento *</Text>
        <TouchableOpacity
          style={styles.btnGpsRadar}
          onPress={actions.obterLocalizacaoAtual}
          disabled={state.buscandoLocalizacao}
          activeOpacity={0.8}
        >
          {state.buscandoLocalizacao ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="radar" size={moderateScale(20)} color={theme.colors.primary} />
              <Text style={styles.btnGpsRadarText}>Sincronizar Radar GPS</Text>
            </>
          )}
        </TouchableOpacity>
        {(state.cidade || state.bairro) ? (
          <View style={styles.locationResultRow}>
            <Ionicons name="location" size={14} color="#00E676" />
            <Text style={styles.locationResultText}>
              {state.cidade}
              {state.bairro ? `, ${state.bairro}` : ""}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Redes Sociais (Opcional)</Text>
        <View style={[styles.inputBox, { marginBottom: 10 }]}>
          <Ionicons name="logo-instagram" size={18} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="instagram (sem @)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={state.instagram}
            onChangeText={actions.setInstagram}
            keyboardAppearance="dark"
          />
        </View>
        <View style={styles.inputBox}>
          <FontAwesome5 name="tiktok" size={16} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="tiktok (sem @)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={state.tiktok}
            onChangeText={actions.setTiktok}
            keyboardAppearance="dark"
          />
        </View>
      </View>
    </View>
  );
}