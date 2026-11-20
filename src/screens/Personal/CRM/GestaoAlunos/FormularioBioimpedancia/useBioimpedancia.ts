import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../../services/supabase";

function parseNumeroOpcional(valor: string, nomeCampo: string): number | null {
  const limpo = valor.trim().replace(",", ".");
  if (!limpo) return null;

  const numero = Number(limpo);
  if (Number.isNaN(numero) || numero < 0) {
    throw new Error(`Valor inválido no campo "${nomeCampo}". Use apenas números.`);
  }
  return numero;
}

export function useBioimpedancia(route: any, navigation: any) {
  const { conexaoId } = route.params || {};

  const [loading, setLoading] = useState(false);

  const [peso, setPeso] = useState("");
  const [gorduraPercentual, setGorduraPercentual] = useState("");
  const [massaMuscular, setMassaMuscular] = useState("");
  const [massaGordura, setMassaGordura] = useState("");
  const [aguaCorporal, setAguaCorporal] = useState("");
  const [visceral, setVisceral] = useState("");
  const [tmb, setTmb] = useState("");

  const [gordBracoEsq, setGordBracoEsq] = useState("");
  const [gordBracoDir, setGordBracoDir] = useState("");
  const [gordTronco, setGordTronco] = useState("");
  const [gordPernaEsq, setGordPernaEsq] = useState("");
  const [gordPernaDir, setGordPernaDir] = useState("");

  const [massaBracoEsq, setMassaBracoEsq] = useState("");
  const [massaBracoDir, setMassaBracoDir] = useState("");
  const [massaTronco, setMassaTronco] = useState("");
  const [massaPernaEsq, setMassaPernaEsq] = useState("");
  const [massaPernaDir, setMassaPernaDir] = useState("");

  const salvarAvaliacao = async () => {
    if (!conexaoId) {
      Alert.alert("Vínculo não encontrado", "Volte para a ficha do aluno e tente abrir a avaliação novamente.");
      return;
    }

    if (!peso.trim() || !gorduraPercentual.trim() || !massaMuscular.trim()) {
      Alert.alert("Atenção", "Preencha pelo menos o Peso, % Gordura e Massa Muscular.");
      return;
    }

    setLoading(true);
    try {
      const pesoNum = parseNumeroOpcional(peso, "Peso Total");
      const gorduraNum = parseNumeroOpcional(gorduraPercentual, "Gordura %");
      const massaMuscularNum = parseNumeroOpcional(massaMuscular, "Massa Muscular");

      if (pesoNum === null || gorduraNum === null || massaMuscularNum === null) {
        throw new Error("Preencha Peso, % Gordura e Massa Muscular com valores válidos.");
      }

      const jsonSegmentar = {
        gord_braco_esq: parseNumeroOpcional(gordBracoEsq, "Gordura Braço Esq."),
        gord_braco_dir: parseNumeroOpcional(gordBracoDir, "Gordura Braço Dir."),
        gord_tronco: parseNumeroOpcional(gordTronco, "Gordura Tronco"),
        gord_perna_esq: parseNumeroOpcional(gordPernaEsq, "Gordura Perna Esq."),
        gord_perna_dir: parseNumeroOpcional(gordPernaDir, "Gordura Perna Dir."),

        massa_braco_esq: parseNumeroOpcional(massaBracoEsq, "Massa Magra Braço Esq."),
        massa_braco_dir: parseNumeroOpcional(massaBracoDir, "Massa Magra Braço Dir."),
        massa_tronco: parseNumeroOpcional(massaTronco, "Massa Magra Tronco"),
        massa_perna_esq: parseNumeroOpcional(massaPernaEsq, "Massa Magra Perna Esq."),
        massa_perna_dir: parseNumeroOpcional(massaPernaDir, "Massa Magra Perna Dir."),
      };

      const { error } = await supabase.from("aluno_evolucao").insert([
        {
          conexao_id: conexaoId,
          data_registro: new Date().toISOString(),
          peso: pesoNum,
          percentual_gordura: gorduraNum,
          massa_magra: massaMuscularNum,
          massa_de_gordura: parseNumeroOpcional(massaGordura, "Massa Gordura"),
          agua_corporal: parseNumeroOpcional(aguaCorporal, "Água Corporal"),
          gordura_visceral: parseNumeroOpcional(visceral, "Gordura Visceral"),
          taxa_metabolica_basal: parseNumeroOpcional(tmb, "Taxa Metabólica Basal"),
          analise_segmentar: jsonSegmentar,
        },
      ]);

      if (error) throw error;

      Alert.alert(
        "Bioimpedância Salva!",
        "A nova avaliação foi adicionada ao histórico do aluno e o painel já foi atualizado.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.log("Erro ao salvar bioimpedância:", error);
      Alert.alert("Erro ao Salvar", error?.message || "Ocorreu um erro ao salvar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => navigation.goBack();

  return {
    loading,
    salvarAvaliacao,
    cancelar,
    peso,
    setPeso,
    gorduraPercentual,
    setGorduraPercentual,
    massaMuscular,
    setMassaMuscular,
    massaGordura,
    setMassaGordura,
    aguaCorporal,
    setAguaCorporal,
    visceral,
    setVisceral,
    tmb,
    setTmb,
    gordBracoEsq,
    setGordBracoEsq,
    gordBracoDir,
    setGordBracoDir,
    gordTronco,
    setGordTronco,
    gordPernaEsq,
    setGordPernaEsq,
    gordPernaDir,
    setGordPernaDir,
    massaBracoEsq,
    setMassaBracoEsq,
    massaBracoDir,
    setMassaBracoDir,
    massaTronco,
    setMassaTronco,
    massaPernaEsq,
    setMassaPernaEsq,
    massaPernaDir,
    setMassaPernaDir,
  };
}