// @ts-nocheck
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../services/supabase";

export function usePerfilAluno(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [temPersonal, setTemPersonal] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [metaPeso, setMetaPeso] = useState("");

  const [preferenciasSalvas, setPreferenciasSalvas] = useState<any>({});

  const formatarNome = (texto: string) => texto.toLowerCase().split(" ").map((w) => w.charAt(0) ? w.charAt(0).toUpperCase() + w.slice(1) : "").join(" ");
  
  const formatarWhatsApp = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length > 7) v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };
  
  const formatarData = (t: string) => {
    let v = t.replace(/\D/g, "");
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/g, "$1/$2/$3");
    setDataNascimento(v);
  };
  
  const formatarPeso = (t: string) => setPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));
  const formatarMetaPeso = (t: string) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: conexaoAtiva } = await supabase
          .from("conexoes")
          .select("id")
          .eq("usuario_id", user.id)
          .eq("status", "aluno_ativo")
          .single();
        
        if (conexaoAtiva) setTemPersonal(true);

        const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setNome(data.nome || "");
          if (data.telefone) formatarWhatsApp(data.telefone);
          setCidade(data.cidade || "");
          setBairro(data.bairro || "");
          setLatitude(data.latitude || null);
          setLongitude(data.longitude || null);
          setFotoUri(data.foto_url);

          if (data.peso) setPeso(data.peso.toString().replace(".", ","));
          if (data.altura) setAltura(data.altura.toString().replace(".", ","));
          if (data.meta_peso) setMetaPeso(data.meta_peso.toString().replace(".", ","));
          
          if (data.data_nascimento) {
            const parts = data.data_nascimento.split("-");
            if (parts.length === 3) setDataNascimento(`${parts[2]}/${parts[1]}/${parts[0]}`);
            else setDataNascimento(data.data_nascimento);
          }

          if (data.preferencias) setPreferenciasSalvas(data.preferencias);
        }
      } catch (error) {
        console.log("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, []);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Atenção", "Precisamos de acesso à galeria.");
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled && result.assets) setFotoUri(result.assets[0].uri);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Atenção", "Permita o acesso à localização.");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) {
        setCidade(geocode[0].city || geocode[0].subregion || "");
        setBairro(geocode[0].district || geocode[0].name || "");
      }
    } catch (error) {
      Alert.alert("Aviso", "Falha ao sincronizar o GPS.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");

      let dataBanco = null;
      if (dataNascimento && dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let pesoNumerico = peso ? parseFloat(peso.replace(",", ".")) : null;
      let alturaNumerica = altura ? parseFloat(altura.replace(",", ".")) : null;
      let metaPesoNumerico = metaPeso ? parseFloat(metaPeso.replace(",", ".")) : null;

      const { error } = await supabase.from("usuarios").upsert({
        id: user.id,
        email: user.email || "",
        nome: nome ? nome.trim() : "Aluno",
        telefone: telefone ? telefone.trim() : "",
        cidade: cidade ? cidade.trim() : "",
        bairro: bairro ? bairro.trim() : "",
        latitude: latitude,
        longitude: longitude,
        data_nascimento: dataBanco,
        peso: isNaN(Number(pesoNumerico)) ? null : pesoNumerico,
        altura: isNaN(Number(alturaNumerica)) ? null : alturaNumerica,
        meta_peso: isNaN(Number(metaPesoNumerico)) ? null : metaPesoNumerico,
        foto_url: fotoUri,
      }, { onConflict: "id" });

      if (error) throw error;
      Alert.alert("Sucesso", "Seu perfil foi atualizado com maestria!");
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message || "Verifique os dados informados.");
    } finally {
      setSalvando(false);
    }
  };

  const abrirRaioX = () => {
    navigation.navigate("RaioXTreino");
  };

  const logout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
        }
      }
    ]);
  };

  return {
    state: { loading, salvando, buscandoLocal, inputFocado, nome, telefone, dataNascimento, cidade, bairro, fotoUri, peso, altura, metaPeso, preferenciasSalvas, temPersonal },
    actions: { setNome, setCidade, setBairro, setInputFocado, formatarNome, formatarWhatsApp, formatarData, formatarPeso, formatarAltura, formatarMetaPeso, escolherFoto, buscarLocalizacao, handleSalvar, abrirRaioX, logout }
  };
}