import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export function useAtivarConta(navigation: any) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [conexaoIdNavegacao, setConexaoIdNavegacao] = useState<string | null>(null);

  const handleAtivarConta = async () => {
    if (!email || !codigo || !senha) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert("E-mail Inválido", "Por favor, digite um formato de e-mail válido.");
    }

    if (senha.length < 6) {
      return Alert.alert("Atenção", "Sua senha deve ter no mínimo 6 caracteres.");
    }

    setLoading(true);

    try {
      const { data: convite, error: fetchError } = await supabase
        .from("convites_alunos")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("codigo_convite", codigo.trim())
        .eq("status", "pendente")
        .single();

      if (fetchError || !convite) {
        throw new Error("Convite não encontrado ou já foi utilizado.");
      }

      let userId = null;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError) {
        if (authError.message.includes("already registered") || authError.status === 400) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: senha,
          });

          if (signInError) {
            throw new Error("Este e-mail já possui um cadastro. Por favor, digite a senha correta da sua conta para aceitar o convite.");
          }
          userId = signInData.user.id;
        } else {
          throw authError;
        }
      } else {
        userId = authData.user?.id;
      }

      let novaConexaoId = null;

      if (userId) {
        const { error: insertError } = await supabase.from("usuarios").upsert({
          id: userId,
          email: email.trim().toLowerCase(),
          nome: convite.nome,
          preferencias: {
            setup_completo: true,
            criado_pelo_personal: true,
            personal_vinculado: convite.personal_id,
            tipo_acompanhamento: convite.tipo_acompanhamento,
            objetivo_principal: convite.objetivo_principal,
            data_vinculo: new Date().toISOString(),
          },
        });

        if (insertError) throw insertError;

        const { data: conexaoData, error: erroConexao } = await supabase
          .from("conexoes")
          .insert([
            {
              usuario_id: userId,
              personal_id: convite.personal_id,
              status: "aguardando_assinatura",
            },
          ])
          .select("id")
          .single();

        if (erroConexao) throw erroConexao;
        novaConexaoId = conexaoData.id;

        const { error: erroPlano } = await supabase.from("planos").insert([
          {
            personal_id: convite.personal_id,
            aluno_id: userId,
            modalidade: convite.tipo_acompanhamento,
            valor_mensal: convite.valor_mensalidade || 0,
            dia_vencimento: convite.dia_vencimento || 10,
            frequencia: convite.frequencia_pagamento || "mensal",
            status: "aguardando_assinatura",
          },
        ]);

        if (erroPlano) throw erroPlano;
      }

      await supabase.from("convites_alunos").update({ status: "aceito" }).eq("id", convite.id);

      setConexaoIdNavegacao(novaConexaoId);
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Erro ao Ativar", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProsseguir = () => {
    setModalVisible(false);
    navigation.navigate("MiniOnboarding", { conexaoId: conexaoIdNavegacao });
  };

  return {
    email,
    setEmail,
    codigo,
    setCodigo,
    senha,
    setSenha,
    loading,
    mostrarSenha,
    setMostrarSenha,
    inputFocado,
    setInputFocado,
    modalVisible,
    handleAtivarConta,
    handleProsseguir,
  };
}