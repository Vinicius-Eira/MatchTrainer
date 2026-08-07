import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../theme/theme"; 
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function OptionCard({ item, isSelected, onPress, isMultiSelect = false }) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardAtivo]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isSelected && (
        <LinearGradient
          colors={["rgba(255, 107, 0, 0.1)", "transparent"]}
          style={StyleSheet.absoluteFill}
          borderRadius={moderateScale(24)}
        />
      )}
      <View
        style={[styles.cardIconBox, isSelected && styles.cardIconBoxSelected]}
      >
        <Ionicons
          name={item.icon}
          size={moderateScale(24)}
          color={
            isSelected ? theme.colors.backgroundPure : theme.colors.primary
          }
        />
      </View>
      <View style={styles.cardContent}>
        <Text
          style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}
        >
          {item.titulo}
        </Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>

      <View
        style={[
          isMultiSelect ? styles.checkbox : styles.radio,
          isSelected &&
            (isMultiSelect ? styles.checkboxSelected : styles.radioSelected),
        ]}
      >
        {isSelected && (
          <View
            style={isMultiSelect ? styles.checkboxInner : styles.radioInner}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(24),
    padding: scale(20),
    marginBottom: verticalScale(16),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
    position: "relative",
  },
  cardAtivo: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardIconBox: {
    width: scale(54),
    height: scale(54),
    borderRadius: moderateScale(16),
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardIconBoxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cardContent: { flex: 1, paddingRight: scale(10) },
  cardTitle: {
    color: "#FFF",
    fontSize: moderateScale(17),
    fontWeight: "bold",
    marginBottom: verticalScale(6),
    letterSpacing: 0.2,
  },
  cardTitleSelected: { color: theme.colors.primary },
  cardDesc: {
    color: "#888",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
  },
  radio: {
    width: scale(26),
    height: scale(26),
    borderRadius: moderateScale(13),
    borderWidth: 2,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: moderateScale(6),
    backgroundColor: theme.colors.primary,
  },
  checkbox: {
    width: scale(26),
    height: scale(26),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    borderColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: moderateScale(3),
    backgroundColor: "#FFF",
  },
});