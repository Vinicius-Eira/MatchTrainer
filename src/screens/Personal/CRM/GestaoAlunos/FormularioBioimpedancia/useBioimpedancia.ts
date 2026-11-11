import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../../services/supabase";

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
    if (!peso || !gorduraPercentual || !massaMuscular) {
      Alert.alert("Atenção", "Preencha pelo menos o Peso, % Gordura e Massa Muscular.");
      return;
    }

    setLoading(true);
    try {
      const jsonSegmentar = {
        gord_braco_esq: gordBracoEsq ? Number(gordBracoEsq.replace(',', '.')) : null,
        gord_braco_dir: gordBracoDir ? Number(gordBracoDir.replace(',', '.')) : null,
        gord_tronco: gordTronco ? Number(gordTronco.replace(',', '.')) : null,
        gord_perna_esq: gordPernaEsq ? Number(gordPernaEsq.replace(',', '.')) : null,
        gord_perna_dir: gordPernaDir ? Number(gordPernaDir.replace(',', '.')) : null,
        
        massa_braco_esq: massaBracoEsq ? Number(massaBracoEsq.replace(',', '.')) : null,
        massa_braco_dir: massaBracoDir ? Number(massaBracoDir.replace(',', '.')) : null,
        massa_tronco: massaTronco ? Number(massaTronco.replace(',', '.')) : null,
        massa_perna_esq: massaPernaEsq ? Number(massaPernaEsq.replace(',', '.')) : null,
        massa_perna_dir: massaPernaDir ? Number(massaPernaDir.replace(',', '.')) : null,
      };

      const { error } = await supabase.from("aluno_evolucao").insert([
        {
          conexao_id: conexaoId,
          data_registro: new Date().toISOString(),
          peso: Number(peso.replace(',', '.')),
          percentual_gordura: Number(gorduraPercentual.replace(',', '.')),
          massa_magra: Number(massaMuscular.replace(',', '.')),
          massa_de_gordura: massaGordura ? Number(massaGordura.replace(',', '.')) : null,
          agua_corporal: aguaCorporal ? Number(aguaCorporal.replace(',', '.')) : null,
          gordura_visceral: visceral ? Number(visceral.replace(',', '.')) : null,
          taxa_metabolica_basal: tmb ? Number(tmb.replace(',', '.')) : null,
          analise_segmentar: jsonSegmentar
        }
      ]);

      if (error) throw error;

      Alert.alert("Sucesso!", "Bioimpedância salva com sucesso. Os gráficos foram atualizados.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => navigation.goBack();

  return {
    loading, salvarAvaliacao, cancelar, 
    peso, setPeso, gorduraPercentual, setGorduraPercentual, massaMuscular, setMassaMuscular,
    massaGordura, setMassaGordura, aguaCorporal, setAguaCorporal, visceral, setVisceral, tmb, setTmb,
    gordBracoEsq, setGordBracoEsq, gordBracoDir, setGordBracoDir, gordTronco, setGordTronco, gordPernaEsq, setGordPernaEsq, gordPernaDir, setGordPernaDir,
    massaBracoEsq, setMassaBracoEsq, massaBracoDir, setMassaBracoDir, massaTronco, setMassaTronco, massaPernaEsq, setMassaPernaEsq, massaPernaDir, setMassaPernaDir
  };
}