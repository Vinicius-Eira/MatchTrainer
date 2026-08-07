// src/screens/Onboarding/ClientSetup/useClientSetup.js

import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase"; 

export function useClientSetup(navigation) {
  const totalSteps = 10;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [peso, setPeso] = useState("");
  const [metaPeso, setMetaPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [fotoUri, setFotoUri] = useState(null);
  const [inputFocado, setInputFocado] = useState(null);

  const [servicoBuscado, setServicoBuscado] = useState(null);
  const [objetivo, setObjetivo] = useState(null);
  const [subObjetivo, setSubObjetivo] = useState([]);
  const [historico, setHistorico] = useState(null);
  const [limitacao, setLimitacao] = useState(null);
  const [subLimitacao, setSubLimitacao] = useState([]);
  const [outraLimitacaoTexto, setOutraLimitacaoTexto] = useState("");
  const [perfilPersonal, setPerfilPersonal] = useState(null);
  const [generoTreinador, setGeneroTreinador] = useState(null);
  const [turnoPreferido, setTurnoPreferido] = useState(null);
  const [horarioEspecifico, setHorarioEspecifico] = useState("");
  const [frequencia, setFrequencia] = useState(null);
  const [localTreino, setLocalTreino] = useState(null);
  const [investimento, setInvestimento] = useState(null);

  const formatarNome = (texto) =>
    texto.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  const formatarWhatsApp = (t) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const formatarData = (t) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };

  const formatarPeso = (t) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarMetaPeso = (t) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t) => setAltura(t.replace(/[^0-9]/g, ""));

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Acesso Negado", "Precisamos de acesso à sua galeria para escolher uma foto.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, 
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada");
        setBuscandoLocal(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode.length > 0) {
        const { district, city, subregion, region } = geocode[0];
        setCidade(`${district ? district + ", " : ""}${city || subregion} - ${region}`);
      }
    } catch (error) {
      Alert.alert("Aviso", "Não foi possível buscar GPS. Digite manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const toggleMultiSelect = (item, state, setState) => {
    if (state.includes(item)) {
      if (item === "Outra" || item === "Outro") setOutraLimitacaoTexto("");
      setState(state.filter((i) => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  const nextStep = () => {
    if (step === 0 && (!nome || !telefone || !cidade || !dataNascimento)) {
      return Alert.alert("Atenção", "Preencha os campos obrigatórios (*)");
    }
    setStep(step + 1);
  };

  const isAvançarDesabilitado = () => {
    if (loading) return true;
    if (step === 1 && !servicoBuscado) return true;
    if (step === 2 && (!objetivo || (objetivo?.hasSub && subObjetivo.length === 0))) return true;
    if (step === 3 && !historico) return true;
    if (step === 4) {
      if (!limitacao) return true;
      if (limitacao?.hasSub && subLimitacao.length === 0) return true;
      if (limitacao?.hasSub && subLimitacao.includes("Outra") && !outraLimitacaoTexto.trim()) return true;
    }
    if (step === 5 && !perfilPersonal) return true;
    if (step === 6 && !generoTreinador) return true;
    if (step === 7 && !turnoPreferido) return true;
    if (step === 8 && !frequencia) return true;
    if (step === 9 && !localTreino) return true;
    if (step === 10 && !investimento) return true;
    return false;
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      let dataBanco = dataNascimento;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let servicosParaSalvar = [];
      if (servicoBuscado?.id === "indiferente") {
        servicosParaSalvar = ["Consultoria", "Presencial"];
      } else if (servicoBuscado) {
        servicosParaSalvar = [servicoBuscado.id];
      }

      const preferencias = {
        servicos_buscados: servicosParaSalvar,
        objetivo: objetivo?.id,
        sub_objetivo: subObjetivo.length > 0 ? subObjetivo : null,
        historico: historico?.id,
        limitacao: limitacao?.id,
        sub_limitacao: subLimitacao.length > 0 ? subLimitacao : null,
        detalhe_outra_limitacao: subLimitacao.includes("Outra") ? outraLimitacaoTexto.trim() : null,
        perfil_treinador: perfilPersonal?.id,
        genero_treinador: generoTreinador?.id,
        turno_preferido: turnoPreferido?.id,
        horario_especifico: horarioEspecifico.trim() || null,
        frequencia: frequencia?.id,
        local_treino: localTreino?.id,
        investimento: investimento?.id,
        meta_peso: metaPeso ? parseFloat(metaPeso) : null,
      };

      const payload = {
        email: user.email,
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        latitude: latitude,    
        longitude: longitude,   
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        preferencias: preferencias,
      };

      if (fotoUri) {
         payload.foto_url = fotoUri;
      }

      const { error } = await supabase.from("usuarios").update(payload).eq("id", user.id);
      if (error) throw error;

      navigation.reset({ index: 0, routes: [{ name: "UsuarioTabs" }] });
    } catch (error) {
      Alert.alert("Erro no Banco", error.message || "Não foi possível salvar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      step, totalSteps, loading, buscandoLocal,
      nome, cidade, dataNascimento, telefone, peso, metaPeso, altura, fotoUri, inputFocado,
      servicoBuscado, objetivo, subObjetivo, historico, limitacao, subLimitacao, outraLimitacaoTexto,
      perfilPersonal, generoTreinador, turnoPreferido, horarioEspecifico, frequencia, localTreino, investimento
    },
    actions: {
      setStep, setNome, setCidade, setTelefone, setHorarioEspecifico, setOutraLimitacaoTexto, setInputFocado,
      setServicoBuscado, setObjetivo, setSubObjetivo, setHistorico, setLimitacao, setSubLimitacao,
      setPerfilPersonal, setGeneroTreinador, setTurnoPreferido, setFrequencia, setLocalTreino, setInvestimento,
      formatarNome, formatarWhatsApp, formatarData, formatarPeso, formatarMetaPeso, formatarAltura,
      escolherFoto, buscarLocalizacao, toggleMultiSelect, nextStep, isAvançarDesabilitado, handleFinalizar
    }
  };
}