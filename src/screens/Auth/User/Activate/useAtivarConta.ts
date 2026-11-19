import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";

export type ModoAtivacao = "novo" | "existente";

async function buscarSessaoAtual() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email ? session.user.email.toLowerCase() : null;
}

export function useAtivarConta(navigation: any) {
  const [modo, setModo] = useState<ModoAtivacao>("novo");
  const [emailLogado, setEmailLogado] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [conexaoIdNavegacao, setConexaoIdNavegacao] = useState<string | null>(null);
  const [precisaOnboarding, setPrecisaOnboarding] = useState(true);

  useEffect(() => {
    let ativo = true;

    buscarSessaoAtual()
      .then((emailSessao) => {
        if (!ativo || !emailSessao) return;
        setEmailLogado(emailSessao);
        setEmail(emailSessao);
        setModo("existente");
      })
      .catch(() => { });

    return () => {
      ativo = false;
    };
  }, []);

  const handleTrocarConta = async () => {
    await supabase.auth.signOut();
    setEmailLogado(null);
    setEmail("");
    setSenha("");
    setModo("novo");
  };

  const handleCodigoChange = (text: string) => {
    const limpo = text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    if (limpo.length > 4) {
      setCodigo(`${limpo.slice(0, 4)}-${limpo.slice(4)}`);
    } else {
      setCodigo(limpo);
    }
  };

  const handleAtivarConta = async () => {
    const emailLimpo = (emailLogado || email).trim().toLowerCase();
    const codigoLimpo = codigo.trim();

    if (!emailLimpo || !codigoLimpo) {
      return Alert.alert("Atenção", "Informe seu e-mail e o código de convite para continuar.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      return Alert.alert("E-mail Inválido", "Digite um formato de e-mail válido.");
    }

    if (!emailLogado) {
      if (!senha) {
        return Alert.alert("Atenção", modo === "novo" ? "Crie uma senha para sua conta." : "Digite a senha da sua conta.");
      }
      if (modo === "novo" && senha.length < 6) {
        return Alert.alert("Senha Curta", "Sua senha deve ter no mínimo 6 caracteres.");
      }
    }

    setLoading(true);
    try {
      if (!emailLogado) {
        if (modo === "novo") {
          const { error: errPreCheck } = await supabase.rpc("verificar_convite_para_cadastro", {
            p_email: emailLimpo,
            p_codigo: codigoLimpo,
          });

          if (errPreCheck) {
            throw new Error(errPreCheck.message || "Convite inválido, expirado ou não autorizado para este e-mail.");
          }

          const nomeProvisorio = emailLimpo.split("@")[0];

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailLimpo,
            password: senha,
            options: {
              data: {
                nome: nomeProvisorio,
                full_name: nomeProvisorio,
                tipo: "aluno",
              },
            },
          });

          if (authError) {
            const msgLower = (authError.message || "").toLowerCase();
            if (msgLower.includes("already registered") || msgLower.includes("already exists")) {
              setModo("existente");
              throw new Error(
                'Este e-mail já possui uma conta no MatchTrainer. Alternamos para "Já tenho conta": informe sua senha atual e toque novamente para vincular.'
              );
            }
            throw authError;
          }

          if (!authData.session) {
            Alert.alert(
              "Confirme seu E-mail",
              `Sua conta foi criada! Enviamos um link de confirmação para ${emailLimpo}.\n\nConfirme seu e-mail e depois volte nesta tela na aba "Já tenho conta" usando o mesmo código para finalizar a vinculação.`
            );
            setModo("existente");
            return;
          }

          setEmailLogado(emailLimpo);
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailLimpo,
            password: senha,
          });

          if (signInError) {
            throw new Error("E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.");
          }

          setEmailLogado(emailLimpo);
        }
      }

      const { data: resultado, error: errConsumo } = await supabase.rpc("consumir_convite_aluno", {
        p_codigo: codigoLimpo,
      });

      if (errConsumo) {
        throw new Error(errConsumo.message || "Não foi possível validar seu convite.");
      }

      setConexaoIdNavegacao(resultado.conexao_id);
      setPrecisaOnboarding(Boolean(resultado.precisa_onboarding));
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Não foi possível ativar", error.message || "Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleProsseguir = () => {
    setModalVisible(false);
    if (precisaOnboarding) {
      navigation.reset({
        index: 0,
        routes: [{ name: "MiniOnboarding", params: { conexaoId: conexaoIdNavegacao } }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "PropostaAluno", params: { conexaoId: conexaoIdNavegacao } }],
      });
    }
  };

  return {
    modo,
    setModo,
    emailLogado,
    email,
    setEmail,
    codigo,
    handleCodigoChange,
    senha,
    setSenha,
    loading,
    mostrarSenha,
    setMostrarSenha,
    inputFocado,
    setInputFocado,
    modalVisible,
    precisaOnboarding,
    handleTrocarConta,
    handleAtivarConta,
    handleProsseguir,
  };
}