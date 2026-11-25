import { useCallback, useState } from "react";
import { Alert, Share } from "react-native";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../../../../../services/supabase";

export interface AlunoAtivoItem {
  id: string;
  conexao_id: string;
  nome: string;
  email: string | null;
  foto_url: string | null;
  modalidade: string;
  origem: "convite" | "match";
  dia_vencimento: number | null;
  valor_mensal: number | null;
  frequencia: string | null;
  status_plano: string | null;
  usuarioCompleto: any;
}

export interface ConviteItem {
  id: string;
  nome: string;
  email: string;
  modalidade: string;
  frequencia_pagamento: string;
  valor_mensalidade: number;
  dia_vencimento: number;
  status: "pendente" | "utilizado" | "aceito" | "expirado" | "revogado" | string;
  expires_at: string | null;
  usado_em: string | null;
  revogado_em: string | null;
  tentativas_falhas: number;
  max_tentativas: number;
  possui_documento: boolean;
}

export interface ConviteReemitidoInfo {
  nome: string;
  email: string;
  codigo: string;
  expiraEm: string;
}

async function buscarDadosCarteira() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ativos: [] as AlunoAtivoItem[], convites: [] as ConviteItem[] };
  }

  const [{ data: conexoesData, error: errConn }, { data: convitesData, error: errConvites }] = await Promise.all([
    supabase
      .from("conexoes")
      .select("id, usuario_id, modalidade, status, origem")
      .eq("personal_id", user.id)
      .eq("status", "aluno_ativo"),
    supabase.rpc("listar_convites_personal"),
  ]);

  if (errConn) throw errConn;
  if (errConvites) throw errConvites;

  const convites: ConviteItem[] = Array.isArray(convitesData) ? convitesData : [];
  const emailsConvite = new Set(convites.map((c) => c.email?.toLowerCase().trim()).filter(Boolean));

  const conexoes = conexoesData || [];
  let ativos: AlunoAtivoItem[] = [];

  if (conexoes.length > 0) {
    const alunoIds = conexoes.map((c) => c.usuario_id).filter(Boolean);
    const conexaoIds = conexoes.map((c) => c.id);

    const [{ data: usuariosData }, { data: planosData }] = await Promise.all([
      supabase.from("usuarios").select("*").in("id", alunoIds),
      supabase
        .from("planos")
        .select("conexao_id, modalidade, valor_mensal, dia_vencimento, frequencia, status")
        .in("conexao_id", conexaoIds)
        .in("status", ["ativo", "congelado"]),
    ]);

    const usuariosMap = new Map((usuariosData || []).map((u) => [u.id, u]));
    const planosMap = new Map((planosData || []).map((p) => [p.conexao_id, p]));

    ativos = conexoes
      .map((conn) => {
        const userRow = usuariosMap.get(conn.usuario_id);
        if (!userRow) return null;
        const plano = planosMap.get(conn.id);

        const emailNorm = userRow.email?.toLowerCase().trim() || "";
        const prefs =
          typeof userRow.preferencias === "string"
            ? (() => {
                try {
                  return JSON.parse(userRow.preferencias);
                } catch {
                  return {};
                }
              })()
            : userRow.preferencias || {};

        const isConvite =
          conn.origem === "convite" ||
          prefs?.criado_pelo_personal === true ||
          (emailNorm.length > 0 && emailsConvite.has(emailNorm));

        return {
          id: userRow.id,
          conexao_id: conn.id,
          nome: userRow.nome || "Aluno",
          email: userRow.email || null,
          foto_url: userRow.foto_url || null,
          modalidade: plano?.modalidade || conn.modalidade || "Consultoria",
          origem: isConvite ? "convite" : "match",
          dia_vencimento: plano?.dia_vencimento ?? null,
          valor_mensal: plano?.valor_mensal ?? null,
          frequencia: plano?.frequencia ?? null,
          status_plano: plano?.status ?? "ativo",
          usuarioCompleto: userRow,
        };
      })
      .filter(Boolean) as AlunoAtivoItem[];
  }

  return { ativos, convites };
}

export function useMeusAlunos(navigation: NavigationProp<any>) {
  const [alunosAtivos, setAlunosAtivos] = useState<AlunoAtivoItem[]>([]);
  const [convites, setConvites] = useState<ConviteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [acaoLoadingId, setAcaoLoadingId] = useState<string | null>(null);

  const [busca, setBusca] = useState<string>("");
  const [abaAtiva, setAbaAtiva] = useState<"ativos" | "convites">("ativos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "consultoria" | "presencial">("todos");
  const [ordemAZ, setOrdemAZ] = useState<boolean>(true);

  const [modalConviteVisivel, setModalConviteVisivel] = useState<boolean>(false);
  const [conviteReemitido, setConviteReemitido] = useState<ConviteReemitidoInfo | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState<boolean>(false);

  const carregarCarteira = useCallback(async () => {
    setLoading(true);
    try {
      const res = await buscarDadosCarteira();
      setAlunosAtivos(res.ativos);
      setConvites(res.convites);
    } catch (error: any) {
      console.error("Erro ao buscar carteira:", error);
      Alert.alert("Erro", error.message || "Não foi possível carregar seus alunos e convites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarCarteira();
    }, [carregarCarteira])
  );

  const normalizarModalidade = (valor: string) =>
    String(valor || "consultoria").toLowerCase().includes("presencial") ? "presencial" : "consultoria";

  const alunosFiltrados = (() => {
    let base = [...alunosAtivos];
    const termo = busca.trim().toLowerCase();

    if (termo) {
      base = base.filter(
        (a) => a.nome.toLowerCase().includes(termo) || (a.email && a.email.toLowerCase().includes(termo))
      );
    }

    if (filtroTipo !== "todos") {
      base = base.filter((a) => normalizarModalidade(a.modalidade) === filtroTipo);
    }

    base.sort((a, b) => (ordemAZ ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)));
    return base;
  })();

  const convitesFiltrados = (() => {
    let base = [...convites];
    const termo = busca.trim().toLowerCase();

    if (termo) {
      base = base.filter((c) => c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo));
    }

    if (filtroTipo !== "todos") {
      base = base.filter((c) => normalizarModalidade(c.modalidade) === filtroTipo);
    }

    if (!ordemAZ) {
      base.sort((a, b) => b.nome.localeCompare(a.nome));
    }

    return base;
  })();

  const totalPendentes = convites.filter((c) => c.status === "pendente").length;

  const handleAbrirAluno = (aluno: AlunoAtivoItem) => {
    navigation.navigate("VisaoAluno", {
      conexaoId: aluno.conexao_id,
      aluno: aluno.usuarioCompleto,
      statusAtual: "aluno_ativo",
    });
  };

  const handleRevogarConvite = (convite: ConviteItem) => {
    Alert.alert(
      "Revogar Convite?",
      `O código enviado para ${convite.nome} (${convite.email}) deixará de funcionar imediatamente.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revogar",
          style: "destructive",
          onPress: async () => {
            setAcaoLoadingId(convite.id);
            try {
              const { error } = await supabase.rpc("revogar_convite_aluno", { p_convite_id: convite.id });
              if (error) throw error;
              await carregarCarteira();
            } catch (err: any) {
              Alert.alert("Erro", err.message || "Não foi possível revogar este convite.");
            } finally {
              setAcaoLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReemitirConvite = (convite: ConviteItem) => {
    Alert.alert(
      "Gerar Novo Código?",
      `Um novo código de uso único (válido por 7 dias) será gerado para ${convite.nome} mantendo os mesmos valores e termos do contrato. O código anterior será invalidado.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reemitir",
          onPress: async () => {
            setAcaoLoadingId(convite.id);
            try {
              const { data, error } = await supabase.rpc("reemitir_convite_aluno", { p_convite_id: convite.id });
              if (error) throw error;

              const expiraEm = data?.expires_at
                ? new Date(data.expires_at).toLocaleDateString("pt-BR")
                : "7 dias";

              setCodigoCopiado(false);
              setConviteReemitido({
                nome: data?.nome || convite.nome,
                email: data?.email || convite.email,
                codigo: data?.codigo_convite || "",
                expiraEm,
              });
              setModalConviteVisivel(true);
              await carregarCarteira();
            } catch (err: any) {
              Alert.alert("Erro", err.message || "Não foi possível reemitir este convite.");
            } finally {
              setAcaoLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCopiarCodigo = async () => {
    if (!conviteReemitido?.codigo) return;
    await Clipboard.setStringAsync(conviteReemitido.codigo);
    setCodigoCopiado(true);
  };

  const handleCompartilharConvite = async () => {
    if (!conviteReemitido?.codigo) return;
    try {
      await Share.share({
        message: `Olá, ${conviteReemitido.nome}! Seu convite para o MatchTrainer está pronto.\n\n1. Abra o app MatchTrainer e toque em "Já tenho um Personal"\n2. Use o e-mail autorizado: ${conviteReemitido.email}\n3. Informe o código de uso único: ${conviteReemitido.codigo}\n\nVálido até ${conviteReemitido.expiraEm}.`,
      });
    } catch {}
  };

  return {
    state: {
      alunosAtivos,
      convites,
      alunosFiltrados,
      convitesFiltrados,
      totalPendentes,
      loading,
      acaoLoadingId,
      busca,
      abaAtiva,
      filtroTipo,
      ordemAZ,
      modalConviteVisivel,
      conviteReemitido,
      codigoCopiado,
    },
    actions: {
      setBusca,
      setAbaAtiva,
      setFiltroTipo,
      setOrdemAZ,
      setModalConviteVisivel,
      carregarCarteira,
      handleAbrirAluno,
      handleRevogarConvite,
      handleReemitirConvite,
      handleCopiarCodigo,
      handleCompartilharConvite,
    },
  };
}