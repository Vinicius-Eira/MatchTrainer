import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/theme"; 
import { moderateScale, scale, verticalScale } from "../../utils/responsive"; 

export default function TipBox({ title, text, icon }) {
  return (
    <View style={styles.tipBox}>
      <View style={styles.tipIconBox}>
        <Ionicons
          name={icon || "bulb"}
          size={moderateScale(20)}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.tipTextContainer}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tipBox: {
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(20),
    padding: scale(20),
    flexDirection: "row",
    marginTop: verticalScale(15),
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
  },
  tipIconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  tipTextContainer: { flex: 1 },
  tipTitle: {
    color: theme.colors.primary,
    fontSize: moderateScale(15),
    fontWeight: "bold",
    marginBottom: verticalScale(6),
  },
  tipText: {
    color: "#888",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
});