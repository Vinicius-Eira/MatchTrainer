import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { supabase } from "../../../services/supabase";

export function usePerfilAluno(navigation: any) {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);

  const [nome, setNome] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [metaPeso, setMetaPeso] = useState("");
  
  const [temPersonal, setTemPersonal] = useState(false);

  const formatarNome = (texto: string) => texto;
  
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
  const formatarMetaPeso = (t: string) => setMetaPeso(t.replace(/[^0-9.,]/g, "").replace(",", "."));
  const formatarAltura = (t: string) => setAltura(t.replace(/[^0-9]/g, ""));

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
          .maybeSingle();
          
        if (conexaoAtiva) setTemPersonal(true);

        const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
        if (error) throw error;

        if (data) {
          if (data.nome) setNome(data.nome);
          if (data.foto_url) setFotoUri(data.foto_url);
          if (data.telefone) formatarWhatsApp(data.telefone);
          if (data.cidade) setCidade(data.cidade);
          if (data.bairro) setBairro(data.bairro);
          if (data.peso) setPeso(String(data.peso));
          if (data.altura) setAltura(String(data.altura));
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);
          
          if (data.data_nascimento) {
            const [ano, mes, dia] = data.data_nascimento.split("-");
            setDataNascimento(`${dia}/${mes}/${ano}`);
          }

          if (data.preferencias && data.preferencias.meta_peso) {
            setMetaPeso(String(data.preferencias.meta_peso));
          }
        }
      } catch (error) {
        console.log("Erro ao carregar perfil do aluno:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarPerfil();
  }, []);

  const escolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Acesso Negado", "Precisamos de permissão para acessar suas fotos.");
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled && result.assets) setFotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
  };

  const buscarLocalizacao = async () => {
    setBuscandoLocal(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Permissão negada");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      const geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode.length > 0) {
        if (geocode[0].city || geocode[0].subregion) setCidade(geocode[0].city || geocode[0].subregion || "");
        if (geocode[0].district) setBairro(geocode[0].district);
      }
    } catch (error) {
      Alert.alert("Aviso", "Falha no GPS. Digite manualmente.");
    } finally {
      setBuscandoLocal(false);
    }
  };

  const abrirRaioX = () => {
    navigation.navigate("RaioXTreino");
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      let dataBanco = null;
      if (dataNascimento.length === 10) {
        const parts = dataNascimento.split("/");
        dataBanco = `${parts[2]}-${parts[1]}-${parts[0]}`; 
      }

      const { data: currentUser } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
      
      const novasPreferencias = {
        ...(currentUser?.preferencias || {}),
        meta_peso: metaPeso ? parseFloat(metaPeso.replace(",", ".")) : null
      };

      const payload: any = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        bairro: bairro.trim(),
        data_nascimento: dataBanco,
        peso: peso ? parseFloat(peso.replace(",", ".")) : null,
        altura: altura ? parseFloat(altura) : null,
        latitude,
        longitude,
        preferencias: novasPreferencias 
      };

      if (fotoUri && fotoUri.startsWith("data:image")) {
        payload.foto_url = fotoUri;
      }

      const { error } = await supabase.from("usuarios").update(payload).eq("id", user.id);
      if (error) throw error;

      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
    } catch (error: any) {
      Alert.alert("Erro ao Salvar", error.message);
    } finally {
      setSalvando(false);
    }
  };

  const logout = () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
        }
      },
    ]);
  };

  return {
    state: { loading, salvando, inputFocado, buscandoLocal, nome, fotoUri, dataNascimento, telefone, cidade, bairro, peso, altura, metaPeso, temPersonal },
    actions: { setNome, setCidade, setBairro, setInputFocado, formatarNome, formatarData, formatarWhatsApp, formatarPeso, formatarMetaPeso, formatarAltura, escolherFoto, buscarLocalizacao, abrirRaioX, handleSalvar, logout }
  };
}