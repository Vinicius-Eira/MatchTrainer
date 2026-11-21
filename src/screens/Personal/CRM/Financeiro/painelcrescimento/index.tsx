import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { AbaAquisicaoIA } from "./AquisicaoIA";
import { ModalEstudioMarca } from "./EstudioMarca";
import { Marca } from "./Marca";
import { NegocioCaixa } from "./NegocioCaixa";
import { Painel } from "./Painel";
import { ModalEstrategistaIA } from "./EstrategistaIA";
import { styles } from "./styles";
import { AbaBusiness, usePainelCrescimento } from "./usePainelCrescimento";

const ABAS: { id: AbaBusiness; label: string; icon: any }[] = [
  { id: "negocio", label: "Negócio", icon: "analytics-outline" },
  { id: "marca", label: "Marca", icon: "ribbon-outline" },
  { id: "aquisicao", label: "Aquisição", icon: "rocket-outline" },
];

export function PainelCrescimento({ navigation }: any) {
  const [estudioVisivel, setEstudioVisivel] = useState(false);
  const [estrategistaVisivel, setEstrategistaVisivel] = React.useState(false);

  const {
    abaAtiva,
    setAbaAtiva,
    loading,
    refreshing,
    kpis,
    onRefresh,
    modalMetaVisivel,
    setModalMetaVisivel,
    abrirModalMeta,
    novaMetaValor,
    handleAlterarMetaInput,
    salvandoMeta,
    salvarNovaMeta,
    modalInfoVisivel,
    setModalInfoVisivel,
    infoDados,
    abrirInfo,
    indicacaoCopiada,
    handleCompartilharIndicacao,
    handleCopiarIndicacao,
    handleAcaoChecklistMarca,
    executarAcaoInsight,
    insightAtual,
    metricas,
  } = usePainelCrescimento(navigation);

  const handleAbrirEstudio = () => setEstudioVisivel(true);


  const handleAbrirEstrategistaIA = () => setEstrategistaVisivel(true);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={20} color="#FFF" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerSubtitle}>Central de Marca & Escala</Text>
            <Text style={styles.headerTitle}>MatchBusiness</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnInfo}
          onPress={() =>
            abrirInfo(
              "MatchBusiness 2.0",
              "Aqui você controla o faturamento recorrente, fortalece sua marca para atrair mais alunos e acompanha cada lead até a assinatura do contrato.",
              "Alterne entre as 3 abas no topo: Negócio (caixa e retenção), Marca (autoridade e indicação) e Aquisição (funil e vendas)."
            )
          }
        >
          <Ionicons name="information-circle-outline" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </BlurView>

      <View style={styles.tabsWrapper}>
        {ABAS.map((aba) => {
          const ativa = abaAtiva === aba.id;
          return (
            <TouchableOpacity
              key={aba.id}
              style={[styles.tabItem, ativa && styles.tabItemAtiva]}
              onPress={() => setAbaAtiva(aba.id)}
              activeOpacity={0.8}
            >
              <Ionicons name={aba.icon} size={15} color={ativa ? "#FF6B00" : "#777"} />
              <Text style={[styles.tabLabel, ativa && styles.tabLabelAtiva]}>{aba.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
      >
        {abaAtiva === "negocio" && (
          <NegocioCaixa
            kpis={kpis}
            metricas={metricas}
            insightAtual={insightAtual}
            onExecutarInsight={executarAcaoInsight}
            onAbrirModalMeta={abrirModalMeta}
            onAbrirInfo={abrirInfo}
            navigation={navigation}
          />
        )}

        {abaAtiva === "marca" && (
          <Marca
            kpis={kpis}
            indicacaoCopiada={indicacaoCopiada}
            onAcaoChecklist={handleAcaoChecklistMarca}
            onCompartilharIndicacao={handleCompartilharIndicacao}
            onCopiarIndicacao={handleCopiarIndicacao}
            onAbrirEstudio={handleAbrirEstudio}
            navigation={navigation}
          />
        )}

        {abaAtiva === "aquisicao" && (
          <AbaAquisicaoIA
            kpis={kpis}
            onAbrirInfo={abrirInfo}
            onAbrirEstrategistaIA={handleAbrirEstrategistaIA}
            navigation={navigation}
          />
        )}
      </ScrollView>

      <Painel
        modalInfoVisivel={modalInfoVisivel}
        setModalInfoVisivel={setModalInfoVisivel}
        infoDados={infoDados}
        modalMetaVisivel={modalMetaVisivel}
        setModalMetaVisivel={setModalMetaVisivel}
        novaMetaValor={novaMetaValor}
        onChangeMeta={handleAlterarMetaInput}
        salvandoMeta={salvandoMeta}
        onSalvarMeta={salvarNovaMeta}
      />

      <ModalEstudioMarca
        visible={estudioVisivel}
        onClose={() => setEstudioVisivel(false)}
        kpis={kpis}
      />
      <ModalEstrategistaIA
        visible={estrategistaVisivel}
        onClose={() => setEstrategistaVisivel(false)}
      />
    </View>
  );
}