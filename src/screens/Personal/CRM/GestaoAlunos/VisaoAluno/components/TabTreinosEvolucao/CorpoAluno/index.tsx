import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bioStyles, localStyles } from "../styles";
import { formatarDataCurta, formatarNumero } from "../useTabTreinosEvolucao";

const BentoCardBio = ({ titulo, valor, unidade, variacao, corV, icone, descricao }: any) => (
  <View style={localStyles.bentoCard}>
    <View style={[localStyles.bentoHeaderRow, { justifyContent: "space-between" }]}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Ionicons name={icone} size={14} color="#666" style={localStyles.bentoIcon} />
        <Text style={localStyles.bentoTitle} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      {variacao ? (
        <View
          style={[
            bioStyles.deltaBadge,
            { backgroundColor: `${corV || "#888"}18`, borderColor: `${corV || "#888"}45` },
          ]}
        >
          <Text style={[bioStyles.deltaText, { color: corV || "#888" }]}>{variacao}</Text>
        </View>
      ) : null}
    </View>
    <View style={localStyles.bentoValueRow}>
      <Text style={localStyles.bentoValue}>{valor}</Text>
      <Text style={localStyles.bentoUnit}>{unidade}</Text>
    </View>
    <Text style={localStyles.bentoDesc}>{descricao}</Text>
  </View>
);

export function CorpoAluno({
  loadingBio,
  avaliacoesBio,
  indiceBioSelecionada,
  setIndiceBioSelecionada,
  bioAtual,
  bioAnterior,
  deltas,
  tipoSegmentar,
  setTipoSegmentar,
  segmentarExibido,
}: any) {
  return (
    <View>
      {loadingBio ? (
        <View style={bioStyles.loadingRow}>
          <ActivityIndicator size="small" color="#FF6B00" />
          <Text style={bioStyles.loadingText}>Sincronizando bioimpedâncias...</Text>
        </View>
      ) : avaliacoesBio.length > 0 ? (
        <View style={bioStyles.historyContainer}>
          <View style={bioStyles.historyHeader}>
            <Text style={bioStyles.historyLabel}>HISTÓRICO ({avaliacoesBio.length})</Text>
            {bioAnterior && (
              <Text style={bioStyles.compareHint}>
                Comparando com {formatarDataCurta(bioAnterior.data_registro)}
              </Text>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bioStyles.historyScroll}>
            {avaliacoesBio.map((item: any, idx: number) => {
              const selecionada = idx === indiceBioSelecionada;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[bioStyles.historyPill, selecionada && bioStyles.historyPillActive]}
                  onPress={() => setIndiceBioSelecionada(idx)}
                  activeOpacity={0.75}
                >
                  <Text style={[bioStyles.historyPillDate, selecionada && bioStyles.historyPillDateActive]}>
                    {formatarDataCurta(item.data_registro)}
                  </Text>
                  <Text style={[bioStyles.historyPillSub, selecionada && bioStyles.historyPillSubActive]}>
                    {idx === 0 ? "Atual" : `${formatarNumero(item.peso)} kg`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={bioStyles.emptyBioBanner}>
          <Ionicons name="analytics-outline" size={20} color="#FF6B00" style={{ marginRight: 10 }} />
          <Text style={bioStyles.emptyBioText}>
            Nenhuma bioimpedância registrada ainda. Toque em Nova Avaliação Física acima para preencher os dados corporais.
          </Text>
        </View>
      )}

      <Text style={localStyles.sectionTitle}>Fisiologia e Composição</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: -4 }}>
        <BentoCardBio
          icone="pie-chart"
          titulo="GORDURA CORP."
          valor={formatarNumero(bioAtual?.percentual_gordura)}
          unidade="%"
          variacao={deltas.gordura.texto}
          corV={deltas.gordura.cor}
          descricao={
            bioAtual?.massa_de_gordura !== null && bioAtual?.massa_de_gordura !== undefined
              ? `Massa gorda: ${formatarNumero(bioAtual.massa_de_gordura)} kg.`
              : "Proporção de gordura no corpo."
          }
        />
        <BentoCardBio
          icone="fitness"
          titulo="MASSA MUSCULAR"
          valor={formatarNumero(bioAtual?.massa_magra)}
          unidade="kg"
          variacao={deltas.massa.texto}
          corV={deltas.massa.cor}
          descricao="Peso dos músculos esqueléticos."
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: -4 }}>
        <BentoCardBio
          icone="water"
          titulo="ÁGUA CORPORAL"
          valor={formatarNumero(bioAtual?.agua_corporal)}
          unidade="L"
          variacao={deltas.agua.texto}
          corV={deltas.agua.cor}
          descricao="Essencial para o metabolismo."
        />
        <BentoCardBio
          icone="warning"
          titulo="GORD. VISCERAL"
          valor={formatarNumero(bioAtual?.gordura_visceral, 0)}
          unidade="lvl"
          variacao={deltas.visceral.texto}
          corV={deltas.visceral.cor}
          descricao="Gordura interna entre os órgãos."
        />
      </View>

      <View style={localStyles.tmbCard}>
        <View style={localStyles.tmbIconBg}>
          <Ionicons name="flame" size={28} color="#FF6B00" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#FF6B00", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 }}>
              TAXA METABÓLICA BASAL
            </Text>
            {deltas.tmb.texto ? (
              <View
                style={[
                  bioStyles.deltaBadge,
                  { backgroundColor: `${deltas.tmb.cor}18`, borderColor: `${deltas.tmb.cor}45` },
                ]}
              >
                <Text style={[bioStyles.deltaText, { color: deltas.tmb.cor }]}>{deltas.tmb.texto}</Text>
              </View>
            ) : null}
          </View>
          <View style={localStyles.resumoBigValueRow}>
            <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "900" }}>
              {formatarNumero(bioAtual?.taxa_metabolica_basal, 0)}
            </Text>
            <Text style={localStyles.bentoUnit}>kcal/dia</Text>
          </View>
          <Text style={{ color: "#888", fontSize: 10, lineHeight: 14 }}>Energia queimada em repouso absoluto.</Text>
        </View>
      </View>

      <Text style={localStyles.sectionTitle}>Análise Segmentar</Text>

      <View style={localStyles.tabSelectorRow}>
        <TouchableOpacity
          onPress={() => setTipoSegmentar("gordura")}
          style={[localStyles.tabBtn, { backgroundColor: tipoSegmentar === "gordura" ? "#222" : "transparent" }]}
        >
          <Text style={[localStyles.tabText, { color: tipoSegmentar === "gordura" ? "#FF6B00" : "#666" }]}>
            GORDURA
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTipoSegmentar("massa")}
          style={[localStyles.tabBtn, { backgroundColor: tipoSegmentar === "massa" ? "#222" : "transparent" }]}
        >
          <Text style={[localStyles.tabText, { color: tipoSegmentar === "massa" ? "#FF6B00" : "#666" }]}>
            MASSA MAGRA
          </Text>
        </TouchableOpacity>
      </View>

      <View style={localStyles.segmentarBg}>
        <Ionicons
          name="body"
          size={260}
          color={tipoSegmentar === "massa" ? "#1E251F" : "#1A1A1A"}
          style={{ opacity: 0.85 }}
        />

        <View style={[localStyles.badgeSegmentar, { top: 50, right: 15, alignItems: "flex-end" }]}>
          <Text style={{ color: "#666", fontSize: 9, fontWeight: "800" }}>BRAÇO ESQ.</Text>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900" }}>
            {segmentarExibido.bracoEsq} <Text style={{ fontSize: 12, color: "#888" }}>kg</Text>
          </Text>
        </View>
        <View style={[localStyles.badgeSegmentar, { top: 50, left: 15, alignItems: "flex-start" }]}>
          <Text style={{ color: "#666", fontSize: 9, fontWeight: "800" }}>BRAÇO DIR.</Text>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900" }}>
            {segmentarExibido.bracoDir} <Text style={{ fontSize: 12, color: "#888" }}>kg</Text>
          </Text>
        </View>
        <View
          style={[
            localStyles.badgeSegmentar,
            { top: 120, alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", borderWidth: 1, borderColor: "#222" },
          ]}
        >
          <Text style={{ color: "#888", fontSize: 9, fontWeight: "800" }}>TRONCO</Text>
          <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "900" }}>
            {segmentarExibido.tronco} <Text style={{ fontSize: 12, color: "#888" }}>kg</Text>
          </Text>
        </View>
        <View style={[localStyles.badgeSegmentar, { bottom: 40, right: 25, alignItems: "flex-end" }]}>
          <Text style={{ color: "#666", fontSize: 9, fontWeight: "800" }}>PERNA ESQ.</Text>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900" }}>
            {segmentarExibido.pernaEsq} <Text style={{ fontSize: 12, color: "#888" }}>kg</Text>
          </Text>
        </View>
        <View style={[localStyles.badgeSegmentar, { bottom: 40, left: 25, alignItems: "flex-start" }]}>
          <Text style={{ color: "#666", fontSize: 9, fontWeight: "800" }}>PERNA DIR.</Text>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900" }}>
            {segmentarExibido.pernaDir} <Text style={{ fontSize: 12, color: "#888" }}>kg</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}