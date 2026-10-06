import { useEffect, useState } from "react";
import { Animated } from "react-native";
import { supabase } from "../../../services/supabase";

export interface Usuario {
  nome: string;
  foto_url: string | null;
}

export interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  criado_em: string;
  usuarios: Usuario;
}

export interface Metricas {
  media: string | number;
  total: number;
  distribuicao: Record<number, number>;
}

export function useAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricas, setMetricas] = useState<Metricas>({
    media: 0,
    total: 0,
    distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [fadeAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const calcularMetricas = (dados: Avaliacao[]) => {
      const total = dados.length;
      let soma = 0;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      dados.forEach((item) => {
        soma += item.nota;
        dist[item.nota] = (dist[item.nota] || 0) + 1;
      });

      setMetricas({
        media: total > 0 ? (soma / total).toFixed(1) : "0.0",
        total: total,
        distribuicao: dist,
      });
    };

    const carregarAvaliacoes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("avaliacoes")
          .select(
            `
            id, nota, comentario, criado_em,
            usuarios (nome, foto_url)
          `
          )
          .eq("personal_id", user.id)
          .order("criado_em", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const avaliacoesFormatadas = data as unknown as Avaliacao[];
          setAvaliacoes(avaliacoesFormatadas);
          calcularMetricas(avaliacoesFormatadas);
        }
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    carregarAvaliacoes();
  }, [fadeAnim]); 

  const formatRelativeDate = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas} h`;
    if (dias === 1) return `ontem`;
    return `há ${dias} dias`;
  };

  return {
    avaliacoes,
    loading,
    metricas,
    fadeAnim,
    formatRelativeDate,
  };
}