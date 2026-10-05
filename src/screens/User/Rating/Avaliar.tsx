import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import BotaoPrincipal from "../../../components/BotaoPrincipal";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

interface AvaliarRouteParams {
  personalId: string;
  personalNome: string;
  personalFoto?: string | null;
}

interface AvaliarProps {
  route: {
    params: AvaliarRouteParams;
  };
  navigation: any;
}

export default function Avaliar({ route, navigation }: AvaliarProps) {
  const { personalId, personalNome, personalFoto } = route.params;

  const [userId, setUserId] = useState<string | null>(null);
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<boolean>(false);

  const [starScale] = useState(() => new Animated.Value(1));
  const [checkScale] = useState(() => new Animated.Value(0));

  const labelsNota: Record<number, string> = {
    1: "Péssimo",
    2: "Ruim",
    3: "Regular",
    4: "Bom",
    5: "Excelente",
  };

  useEffect(() => {
    let isMounted = true;
    const obterUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        setUserId(session.user.id);
      }
    };
    obterUsuario();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelecionarNota = (valor: number) => {
    setNota(valor);
    starScale.setValue(0.8);
    Animated.spring(starScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleEnviar = async () => {
    if (!userId || nota === 0) return;
    setLoading(true);

    try {
      const { data: avaliacaoExistente } = await supabase
        .from("avaliacoes")
        .select("id")
        .eq("usuario_id", userId)
        .eq("personal_id", personalId)
        .single();

      if (avaliacaoExistente) {
        await supabase
          .from("avaliacoes")
          .update({ nota, comentario })
          .eq("id", avaliacaoExistente.id);
      } else {
        await supabase.from("avaliacoes").insert([{
          usuario_id: userId,
          personal_id: personalId,
          nota,
          comentario,
        }]);
      }

      await supabase
        .from("conexoes")
        .update({ status: "avaliado" })
        .match({ usuario_id: userId, personal_id: personalId });

      setSucesso(true);
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <View style={[styles.container, styles.center]}>
        <Animated.View style={{ transform: [{ scale: checkScale }], alignItems: "center" }}>
          <LinearGradient colors={["rgba(0,230,118,0.2)", "rgba(0,0,0,0)"]} style={styles.successGlow} />
          <Ionicons name="checkmark-circle" size={moderateScale(100)} color="#00E676" />
          <Text style={styles.successText}>Avaliação enviada!</Text>
          <Text style={styles.successSubText}>Obrigado pelo seu feedback.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Image source={{ uri: personalFoto || "https://via.placeholder.com/150" }} style={styles.avatar} />
          <Text style={styles.title}>
            Como foi sua experiência com <Text style={styles.titleHighlight}>{personalNome?.split(" ")[0]}</Text>?
          </Text>
        </View>

        <Animated.View style={[styles.starsContainer, { transform: [{ scale: starScale }] }]}>
          {[1, 2, 3, 4, 5].map((estrela) => (
            <TouchableOpacity key={estrela} activeOpacity={0.7} onPress={() => handleSelecionarNota(estrela)}>
              <Ionicons
                name={estrela <= nota ? "star" : "star-outline"}
                size={moderateScale(48)}
                color={estrela <= nota ? theme.colors.primary : "#444"}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Text style={styles.notaLabel}>
          {nota > 0 ? labelsNota[nota] : " "}
        </Text>

        <View style={styles.textAreaWrapper}>
          <TextInput
            style={styles.textArea}
            placeholder="Conte como foi o acompanhamento (opcional)"
            placeholderTextColor="#666"
            multiline
            maxLength={300}
            value={comentario}
            onChangeText={setComentario}
            textAlignVertical="top"
            cursorColor={theme.colors.primary}
            keyboardAppearance="dark"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <BotaoPrincipal
            titulo={loading ? "Enviando..." : "Enviar avaliação"}
            onPress={handleEnviar}
            disabled={nota === 0 || loading}
          />

          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.ghostButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  center: { justifyContent: "center", alignItems: "center" },
  content: { flex: 1, paddingHorizontal: scale(20), paddingVertical: verticalScale(20), justifyContent: "center" },
  
  header: { alignItems: "center", marginBottom: verticalScale(30) },
  avatar: { width: scale(80), height: scale(80), borderRadius: moderateScale(40), backgroundColor: "#222", marginBottom: verticalScale(20), borderWidth: 2, borderColor: "rgba(255, 107, 0, 0.4)" },
  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(26), color: "#FFF", textAlign: "center", lineHeight: moderateScale(32) },
  titleHighlight: { color: theme.colors.primary },
  
  starsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: verticalScale(10) },
  star: { marginHorizontal: scale(4) },
  
  notaLabel: { color: theme.colors.primary, fontFamily: theme.fonts.title, fontSize: moderateScale(20), textAlign: "center", marginBottom: verticalScale(30), height: verticalScale(25), letterSpacing: 1, textTransform: "uppercase" },
  
  textAreaWrapper: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: scale(4), marginBottom: verticalScale(25) },
  textArea: { color: "#FFF", paddingHorizontal: scale(15), paddingVertical: verticalScale(15), minHeight: verticalScale(120), fontSize: moderateScale(15), fontFamily: theme.fonts.body },
  
  buttonsContainer: { marginTop: verticalScale(10) },
  
  ghostButton: { paddingHorizontal: scale(15), paddingVertical: verticalScale(15), alignItems: "center", marginTop: verticalScale(10) },
  ghostButtonText: { color: "#888", fontSize: moderateScale(15), fontWeight: "bold" },
  
  successGlow: { position: "absolute", width: scale(150), height: scale(150), borderRadius: moderateScale(75), top: scale(-20) },
  successText: { fontFamily: theme.fonts.title, fontSize: moderateScale(28), color: "#FFF", marginTop: verticalScale(15) },
  successSubText: { color: "#AAA", fontSize: moderateScale(14), marginTop: verticalScale(8) }
});