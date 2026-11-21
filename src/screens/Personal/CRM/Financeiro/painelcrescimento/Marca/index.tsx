import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BusinessKPIs } from "../usePainelCrescimento";
import { styles } from "./styles";

interface AbaMarcaVitrineProps {
  kpis: BusinessKPIs | null;
  indicacaoCopiada: boolean;
  onAcaoChecklist: (chave: string) => void;
  onCompartilharIndicacao: () => void;
  onCopiarIndicacao: () => void;
  onAbrirEstudio: () => void;
  navigation: any;
}

function navegarComSeguranca(navigation: any, rota: string, fallbackMensagem: string) {
  try {
    let nav = navigation;
    while (nav) {
      const state = nav.getState?.();
      if (state?.routeNames?.includes(rota)) {
        nav.navigate(rota);
        return;
      }
      nav = nav.getParent?.();
    }
    Alert.alert("Aviso", fallbackMensagem);
  } catch {
    Alert.alert("Aviso", fallbackMensagem);
  }
}

export function Marca({
  kpis,
  indicacaoCopiada,
  onAcaoChecklist,
  onCompartilharIndicacao,
  onCopiarIndicacao,
  onAbrirEstudio,
  navigation,
}: AbaMarcaVitrineProps) {
  const marca = kpis?.marca;
  const scoreMarca = Number(marca?.score_marca || 0);
  const notaMedia = Number(marca?.nota_media || 0);
  const totalAvaliacoes = Number(marca?.total_avaliacoes || 0);
  const checklist = Array.isArray(marca?.checklist) ? marca.checklist : [];
  const depoimentos = Array.isArray(marca?.depoimentos) ? marca.depoimentos : [];
  const crefVerificado = Boolean(marca?.perfil?.cref_verificado);

  const corMarca = scoreMarca >= 80 ? "#00E676" : "#FF6B00";
  const statusMarca =
    scoreMarca >= 80
      ? "Vitrine de Alta Conversão"
      : scoreMarca >= 50
        ? "Vitrine em Construção"
        : "Perfil Subaproveitado";

  const handleAbrirAvaliacoes = () => {
    navegarComSeguranca(
      navigation,
      "Avaliacoes",
      "Acesse suas avaliações pelo menu principal do seu perfil."
    );
  };

  const handleToqueSeloCref = () => {
    if (crefVerificado) {
      Alert.alert("Selo CREF Verificado", "Seu registro profissional já está validado e visível no seu perfil público.");
      return;
    }

    Alert.alert(
      "Como ativar o Selo CREF?",
      marca?.perfil?.cref
        ? `Seu CREF (${marca.perfil.cref}) está em validação pela equipe MatchTrainer. Assim que confirmado, o selo oficial é ativado automaticamente.`
        : "Cadastre o número do seu CREF no seu perfil profissional para solicitar a verificação e ganhar o selo oficial.",
      [
        { text: "Fechar", style: "cancel" },
        {
          text: "Abrir Perfil",
          onPress: () =>
            navegarComSeguranca(
              navigation,
              "PersonalSetup",
              "Abra a aba Perfil no menu inferior para editar seu CREF."
            ),
        },
      ]
    );
  };

  return (
    <View>
      <View style={styles.mrrCard}>
        <LinearGradient colors={["rgba(255, 107, 0, 0.14)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={styles.scoreMainRow}>
          <View style={[styles.scoreCircle, { borderColor: corMarca, shadowColor: corMarca }]}>
            <Text style={styles.scoreNumber}>{scoreMarca}</Text>
          </View>
          <View style={styles.scoreTextContainer}>
            <Text style={styles.scoreLabel}>FORÇA DA SUA MARCA</Text>
            <Text style={[styles.scoreStatusTitle, { color: corMarca }]}>{statusMarca}</Text>
            <Text style={styles.scoreDesc}>
              Quanto mais forte sua vitrine no MatchTrainer, maior a confiança dos alunos antes mesmo da primeira mensagem.
            </Text>
          </View>
        </View>

        <View style={styles.marcaStatsRow}>
          <TouchableOpacity style={styles.marcaStatBox} onPress={handleAbrirAvaliacoes} activeOpacity={0.75}>
            <Ionicons name="star" size={16} color="#FF6B00" />
            <Text style={styles.marcaStatVal}>{totalAvaliacoes > 0 ? notaMedia.toFixed(1) : "Novo"}</Text>
            <Text style={styles.marcaStatLabel}>
              {totalAvaliacoes > 0 ? `Nota (${totalAvaliacoes})` : "Sem avaliações"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.marcaStatBox} onPress={handleToqueSeloCref} activeOpacity={0.75}>
            <MaterialCommunityIcons
              name={crefVerificado ? "shield-check" : "shield-alert-outline"}
              size={16}
              color={crefVerificado ? "#00E676" : "#FF6B00"}
            />
            <Text style={styles.marcaStatVal}>{crefVerificado ? "Ativo" : "Validar"}</Text>
            <Text style={styles.marcaStatLabel}>Selo CREF</Text>
          </TouchableOpacity>

          <View style={styles.marcaStatBox}>
            <Ionicons name="people" size={16} color="#FF6B00" />
            <Text style={styles.marcaStatVal}>{kpis?.alunos_ativos || 0}</Text>
            <Text style={styles.marcaStatLabel}>Base Ativa</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="color-wand-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Estúdio de Autoridade</Text>
      </View>
      <TouchableOpacity style={styles.estudioBannerCard} onPress={onAbrirEstudio} activeOpacity={0.85}>
        <LinearGradient
          colors={["rgba(255, 107, 0, 0.18)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.estudioBannerTop}>
          <View style={styles.estudioIconBox}>
            <Ionicons name="images-outline" size={24} color="#FF6B00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.estudioTag}>STORIES & WHATSAPP</Text>
            <Text style={styles.estudioTitle}>Gerar Cards da Sua Marca</Text>
            <Text style={styles.estudioDesc}>
              Crie em 1 toque seu Cartão Profissional, Depoimentos 5 estrelas e Marcos de Resultados prontos para postar e atrair novos alunos.
            </Text>
          </View>
        </View>
        <View style={styles.estudioBtn}>
          <Text style={styles.estudioBtnText}>Abrir Estúdio de Cards</Text>
          <Ionicons name="arrow-forward" size={16} color="#FF6B00" />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="checkmark-done-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Checklist de Autoridade</Text>
      </View>
      <View style={styles.cardPadrao}>
        {checklist.map((item, idx) => (
          <TouchableOpacity
            key={item.chave || idx}
            style={[styles.checkRow, idx === checklist.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}
            onPress={() => !item.concluido && onAcaoChecklist(item.chave)}
            disabled={item.concluido}
            activeOpacity={0.75}
          >
            <Ionicons
              name={item.concluido ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={item.concluido ? "#00E676" : "#FF6B00"}
            />
            <Text style={[styles.checkLabel, item.concluido && { color: "#888", textDecorationLine: "line-through" }]}>
              {item.label}
            </Text>
            {item.concluido ? (
              <Text style={styles.checkPtsDone}>+{item.pontos} pts</Text>
            ) : (
              <View style={styles.checkFixBadge}>
                <Text style={styles.checkFixText}>Corrigir ›</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="megaphone-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Campanha de Indicação</Text>
      </View>
      <View style={styles.cardPadrao}>
        <Text style={styles.cardSubtitulo}>
          Transforme seus alunos mais engajados no seu canal mais barato de captação. Envie o convite pronto no WhatsApp:
        </Text>
        <View style={styles.indicacaoActionsRow}>
          <TouchableOpacity style={styles.btnIndicacaoSec} onPress={onCopiarIndicacao} activeOpacity={0.8}>
            <Ionicons
              name={indicacaoCopiada ? "checkmark-circle" : "copy-outline"}
              size={16}
              color={indicacaoCopiada ? "#00E676" : "#FFF"}
            />
            <Text style={[styles.btnIndicacaoSecText, indicacaoCopiada && { color: "#00E676" }]}>
              {indicacaoCopiada ? "Copiado!" : "Copiar Texto"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnIndicacaoPri} onPress={onCompartilharIndicacao} activeOpacity={0.85}>
            <Ionicons name="share-social-outline" size={16} color="#FF6B00" />
            <Text style={styles.btnIndicacaoPriText}>Enviar no WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="star-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Depoimentos em Destaque</Text>
        <TouchableOpacity style={styles.sectionActionLink} onPress={handleAbrirAvaliacoes}>
          <Text style={styles.sectionActionLinkText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={14} color="#FF6B00" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardPadrao}>
        {depoimentos.length === 0 ? (
          <View style={styles.emptyInlineBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#888" />
            <Text style={styles.emptyInlineText}>
              Assim que seus alunos avaliarem seu trabalho (4 ou 5 estrelas), os melhores depoimentos aparecerão aqui prontos para virar card de Stories.
            </Text>
          </View>
        ) : (
          depoimentos.slice(0, 3).map((dep, idx) => {
            const qtdEstrelas = Math.max(0, Math.min(5, Math.round(Number(dep?.nota) || 0)));
            return (
              <View
                key={dep.id || idx}
                style={[styles.depCard, idx === Math.min(depoimentos.length, 3) - 1 && { marginBottom: 0 }]}
              >
                <View style={styles.depHeader}>
                  <Text style={styles.depAutor}>{dep.aluno_nome || "Aluno"}</Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {Array.from({ length: qtdEstrelas }).map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FF6B00" />
                    ))}
                  </View>
                </View>
                <Text style={styles.depTexto} numberOfLines={3}>
                  {dep.comentario}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}