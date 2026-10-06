import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../services/supabase";
import { useOnboarding } from "../../../../hooks/useOnboarding";

export function useDashboard(navigation: any) {
  const onboarding = useOnboarding();

  const [insightsReais, setInsightsReais] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("aluno_ativo");
  
  const [modalidadeFilter, setModalidadeFilter] = useState<string>("Todos");
  const [filtrosDinamicos, setFiltrosDinamicos] = useState<string[]>(["Todos"]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>("recentes");
  const [origemFilter, setOrigemFilter] = useState<string>("Todos");

  const [loading, setLoading] = useState<boolean>(true);
  const [personal, setPersonal] = useState<any>(null);

  const [emContato, setEmContato] = useState<any[]>([]);
  const [ativos, setAtivos] = useState<any[]>([]);
  const [inativos, setInativos] = useState<any[]>([]);

  const [notaMedia, setNotaMedia] = useState<number>(0);
  const [naoLidas, setNaoLidas] = useState<Record<string, number>>({});

  const calcularIdade = (dataNascimento: string | null): number | null => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleOpenInsight = (insightId: string) => {
    navigation.navigate("InsightDetailScreen", { insightId: insightId });
  };

  const carregarDados = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const [
        perfilRes,
        leadsRes,
        mediaRes,
        ativosRes,
        inativosRes,
        planosRes,
        anamnesesRes,
        convitesRes
      ] = await Promise.all([
        supabase.from("personals").select("*").eq("id", session.user.id).single(),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .in("status", ["pendente", "em_contato", "lead", "aguardando_personal", "aceito_personal"]),
        supabase.rpc("get_media_avaliacoes", { p_id: session.user.id }),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .in("status", ["aluno_ativo", "aguardando_assinatura"]),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .eq("status", "inativo"),
        supabase
          .from("planos")
          .select("*")
          .eq("personal_id", session.user.id)
          .neq("status", "cancelado"),
        supabase
          .from("anamneses")
          .select("usuario_id, objetivo")
          .eq("personal_id", session.user.id),
        supabase 
          .from("convites_alunos")
          .select("*")
          .eq("personal_id", session.user.id)
      ]);

      if (perfilRes.data) {
        setPersonal(perfilRes.data);
        const servicos = perfilRes.data.servicos_oferecidos || perfilRes.data.modalidades || [];
        let arrFiltros = ["Todos"];
        if (servicos.includes("Consultoria")) arrFiltros.push("Consultoria");
        if (servicos.includes("Presencial")) arrFiltros.push("Presencial");
        if (servicos.includes("Consultoria") && servicos.includes("Presencial")) arrFiltros.push("Híbrido");
        setFiltrosDinamicos(arrFiltros);
      }

      const anamneseMap = new Map();
      if (anamnesesRes.data) {
        anamnesesRes.data.forEach((a: any) => { if (a.objetivo) anamneseMap.set(a.usuario_id, a.objetivo); });
      }

      const convitesMap = new Map();
      if (convitesRes.data) {
          convitesRes.data.forEach((convite: any) => {
             const email = convite.email?.toLowerCase().trim();
             if(email) {
                 let servicosEncontrados = [];
                 if (convite.servicos_inclusos) {
                   if (Array.isArray(convite.servicos_inclusos)) servicosEncontrados = convite.servicos_inclusos;
                   else if (typeof convite.servicos_inclusos === 'string') {
                     try { servicosEncontrados = JSON.parse(convite.servicos_inclusos); } 
                     catch(e) { servicosEncontrados = [convite.servicos_inclusos]; }
                   }
                 }
                 if (servicosEncontrados.length === 0 && convite.modalidade) {
                     const modFormatada = convite.modalidade.trim().toLowerCase();
                     if (modFormatada === 'híbrido' || modFormatada === 'hibrido') servicosEncontrados = ['Consultoria', 'Presencial'];
                     else servicosEncontrados = [convite.modalidade.charAt(0).toUpperCase() + convite.modalidade.slice(1).toLowerCase()];
                 }
                 convitesMap.set(email, servicosEncontrados);
             }
          });
      }

      const planosMap = new Map();
      if (planosRes.data) {
        planosRes.data.forEach((p: any) => {
          let servicosMapeados = [];
          if (p.servicos_inclusos) {
            if (Array.isArray(p.servicos_inclusos)) servicosMapeados = p.servicos_inclusos;
            else if (typeof p.servicos_inclusos === 'string') {
              try { servicosMapeados = JSON.parse(p.servicos_inclusos); }
              catch(e) { servicosMapeados = [p.servicos_inclusos]; }
            }
          } else {
            const textoMod = p.modalidade || p.escopo || p.tipo || p.nome || "";
            if (textoMod && typeof textoMod === 'string') {
              const modFormatada = textoMod.trim().toLowerCase();
              if (modFormatada === 'híbrido' || modFormatada === 'hibrido') servicosMapeados = ['Consultoria', 'Presencial'];
              else servicosMapeados = [textoMod.charAt(0).toUpperCase() + textoMod.slice(1).toLowerCase()];
            }
          }

          const payloadPlano = {
            temPlano: true,
            servicos: servicosMapeados,
            vencimento: p.dia_vencimento || 99,
          };

          if (p.aluno_id) planosMap.set(p.aluno_id, payloadPlano);
          if (p.conexao_id) planosMap.set(p.conexao_id, payloadPlano);
        });
      }

      const formatarAluno = (c: any) => {
        const planoData = planosMap.get(c.usuario_id) || planosMap.get(c.id) || { temPlano: false, servicos: [], vencimento: 99 };
        let servicosDoAluno = [...planoData.servicos];

        const emailUsuario = c.usuarios?.email?.toLowerCase().trim();
        const prefs = c.usuarios?.preferencias || {};
        const isVIP = c.origem === 'convite' || prefs.criado_pelo_personal === true || c.status === "aguardando_assinatura";

        if (servicosDoAluno.length === 0) {
          const modConvite = convitesMap.get(emailUsuario);
          if (modConvite && modConvite.length > 0) {
            servicosDoAluno = modConvite;
          } else {
            const stringDadosAluno = JSON.stringify(c) + JSON.stringify(c.usuarios || {});
            if (stringDadosAluno.includes("Híbrido") || stringDadosAluno.includes("Hibrido") || (stringDadosAluno.includes("Consultoria") && stringDadosAluno.includes("Presencial"))) {
              servicosDoAluno = ["Consultoria", "Presencial"];
            } else if (stringDadosAluno.includes("Consultoria")) {
              servicosDoAluno = ["Consultoria"];
            } else if (stringDadosAluno.includes("Presencial")) {
              servicosDoAluno = ["Presencial"];
            }
          }
        }

        let categoriaUi = "A Definir";
        let isHibrido = false;

        if (servicosDoAluno.length > 1) {
          categoriaUi = "Híbrido";
          isHibrido = true;
        } else if (servicosDoAluno.length === 1) {
          categoriaUi = servicosDoAluno[0];
        }

        const origemDefinitiva = isVIP ? 'convite' : 'match';
        
        const objetivoFinal = 
          anamneseMap.get(c.usuario_id) || 
          c.usuarios?.objetivo_principal || 
          prefs.objetivo_principal || 
          prefs.objetivo || 
          c.objetivo || 
          "Foco no Treino"; 

        const idade = calcularIdade(c.usuarios?.data_nascimento);

        return {
          ...c,
          tem_plano: planoData.temPlano || servicosDoAluno.length > 0 || isVIP, 
          servicos_array: servicosDoAluno,
          dia_vencimento: planoData.vencimento,
          modalidadeUi: categoriaUi,
          isHibrido: isHibrido,
          origem: origemDefinitiva,
          objetivoSeguro: objetivoFinal,
          idade: idade,
          isVIP: isVIP
        };
      };

      const ativosReais = (ativosRes.data || []).map(formatarAluno);
      const emContatoReais = (leadsRes.data || []).map(formatarAluno);
      const dataInativos = (inativosRes.data || []).map(formatarAluno);

      const contagemNaoLidas: Record<string, number> = {};
      const todasConexoes = [...emContatoReais, ...ativosReais, ...dataInativos];

      await Promise.all(
        todasConexoes.map(async (c) => {
          const { count } = await supabase
            .from("mensagens")
            .select("id", { count: "exact", head: true })
            .eq("conexao_id", c.id)
            .eq("lida", false)
            .neq("remetente_id", session.user.id);
          contagemNaoLidas[c.id] = count || 0;
        })
      );

      setNaoLidas(contagemNaoLidas);
      setAtivos(ativosReais);
      setEmContato(emContatoReais);
      setInativos(dataInativos);
      setNotaMedia(mediaRes.data || 0);

      const { data: insightsData } = await supabase
        .from('insights')
        .select('*')
        .eq('personal_id', session.user.id)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (insightsData) {
        const insightsFormatados = insightsData.map((ins: any) => {
          const alunoEncontrado = todasConexoes.find(
            a => a.usuario_id === ins.aluno_id
          );

          return {
            id: ins.id,
            aluno: { 
              id: ins.aluno_id, 
              nome: alunoEncontrado?.usuarios?.nome || 'Aluno' 
            },
            priority: ins.priority,
            exerciseName: ins.exercise_name,
            painLocation: ins.pain_location,
            painIntensity: ins.pain_intensity,
            type: ins.type,
            createdAt: ins.created_at
          };
        });
        setInsightsReais(insightsFormatados);
      }

      if (emContatoReais.length === 0 && ativosReais.length > 0) setActiveTab("aluno_ativo");

    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarDados();
      onboarding.recarregarJornada();
    });
    return unsubscribe;
  }, [navigation, onboarding.recarregarJornada]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    if (onboarding.recarregarJornada) onboarding.recarregarJornada();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair do seu painel?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
          setLoading(true);
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
      }},
    ]);
  };

  const getListaAtiva = () => {
    let lista: any[] = [];

    if (activeTab === "em_contato") lista = [...emContato];
    else if (activeTab === "inativo") lista = [...inativos];
    else if (activeTab === "aluno_ativo") {
      lista = [...ativos];
      if (modalidadeFilter === "Consultoria") lista = lista.filter((a) => !a.isHibrido && a.servicos_array.includes("Consultoria"));
      else if (modalidadeFilter === "Presencial") lista = lista.filter((a) => !a.isHibrido && a.servicos_array.includes("Presencial"));
      else if (modalidadeFilter === "Híbrido") lista = lista.filter((a) => a.isHibrido);
    }

    if (origemFilter !== "Todos") lista = lista.filter((a) => a.origem === origemFilter);

    if (searchQuery.trim() !== "") {
      const removerAcentos = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const q = removerAcentos(searchQuery);
      lista = lista.filter((item) => removerAcentos(item.usuarios?.nome || "").includes(q));
    }

    if (sortOrder === "alfabetica") {
      lista.sort((a, b) => (a.usuarios?.nome || "").localeCompare(b.usuarios?.nome || ""));
    } else if (sortOrder === "vencimento" && activeTab === "aluno_ativo") {
      lista.sort((a, b) => a.dia_vencimento - b.dia_vencimento);
    } else {
      lista.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
    }

    return lista;
  };

  return {
    jornada: onboarding.jornada,
    progressoPct: onboarding.progressoPct,
    completarMissao: onboarding.completarMissao,
    insightsReais,
    refreshing,
    activeTab,
    setActiveTab,
    modalidadeFilter,
    setModalidadeFilter,
    filtrosDinamicos,
    searchQuery,
    setSearchQuery,
    isFilterModalVisible,
    setIsFilterModalVisible,
    sortOrder,
    setSortOrder,
    origemFilter,
    setOrigemFilter,
    loading,
    personal,
    emContato,
    ativos,
    inativos,
    notaMedia,
    naoLidas,
    handleOpenInsight,
    onRefresh,
    handleLogout,
    getListaAtiva,
  };
}