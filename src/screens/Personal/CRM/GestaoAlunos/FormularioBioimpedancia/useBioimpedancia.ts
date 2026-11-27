import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { MetadataAvaliacao, NivelConfiancaCampo, OrigemLeitura } from "../../../../../domain/avaliacaoFisica/types";
import {
  enviarEAnalisarBioimpedanciaIA,
  obterUrlAssinadaBio,
  removerArquivoBioStorage,
} from "../../../../../services/bioimpedanciaIA";
import { supabase } from "../../../../../services/supabase";
import { BioFeedbackState, BioFeedbackTipo } from "./components/Modal";

function parseNumeroOpcional(valor: string, nomeCampo: string): number | null {
  const limpo = valor.trim().replace(",", ".");
  if (!limpo) return null;
  const numero = Number(limpo);
  if (Number.isNaN(numero) || numero < 0) {
    throw new Error(`Valor inválido no campo "${nomeCampo}". Use apenas números.`);
  }
  return numero;
}

function numParaInput(val?: number | null): string {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "";
  return String(val).replace(".", ",");
}

function hojeFormatadoBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isoParaBR(iso?: string | null): string {
  if (!iso) return hojeFormatadoBR();
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return hojeFormatadoBR();
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function formatarMascaraData(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function brParaIso(dataBr: string): string | null {
  const m = dataBr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (ano < 2015 || ano > 2035 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const dt = new Date(ano, mes - 1, dia);
  if (dt.getDate() !== dia || dt.getMonth() !== mes - 1 || dt.getFullYear() !== ano) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export interface RevisaoIAState {
  ativa: boolean;
  storagePath: string | null;
  mimeType: string | null;
  uriLocal: string | null;
  nomeArquivo: string | null;
  origemLeitura: OrigemLeitura;
  fabricante: string | null;
  confiancaGeral: number;
  confiancaCampos: Record<string, NivelConfiancaCampo>;
  valoresOriginais: Record<string, string | number | null>;
  avisos: string[];
  camposNaoReconhecidos: string[];
  extras: {
    imc?: number | null;
    rcq?: number | null;
    proteina_kg?: number | null;
    minerais_kg?: number | null;
    pontuacao_equipamento?: number | null;
  };
}

const REVISAO_INICIAL: RevisaoIAState = {
  ativa: false,
  storagePath: null,
  mimeType: null,
  uriLocal: null,
  nomeArquivo: null,
  origemLeitura: "manual",
  fabricante: null,
  confiancaGeral: 0,
  confiancaCampos: {},
  valoresOriginais: {},
  avisos: [],
  camposNaoReconhecidos: [],
  extras: {},
};

export function useBioimpedancia(route: any, navigation: any) {
  const { conexaoId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [analisandoIA, setAnalisandoIA] = useState(false);
  const [etapaIATexto, setEtapaIATexto] = useState("");
  const [modalOrigemVisivel, setModalOrigemVisivel] = useState(false);
  const [previewImagemUri, setPreviewImagemUri] = useState<string | null>(null);
  const [revisaoIA, setRevisaoIA] = useState<RevisaoIAState>(REVISAO_INICIAL);

  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);
  const [resumoSalvo, setResumoSalvo] = useState<{
    peso: string;
    gordura: string;
    mme: string;
    data: string;
    viaIA: boolean;
  } | null>(null);

  const [feedback, setFeedback] = useState<BioFeedbackState>({
    visivel: false,
    tipo: "warning",
    titulo: "",
    mensagem: "",
  });

  const [dataAvaliacao, setDataAvaliacao] = useState(hojeFormatadoBR());
  const [peso, setPeso] = useState("");
  const [gorduraPercentual, setGorduraPercentual] = useState("");
  const [massaMuscular, setMassaMuscular] = useState("");
  const [massaMagra, setMassaMagra] = useState("");
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

  const mostrarFeedback = (tipo: BioFeedbackTipo, titulo: string, mensagem: string, kicker?: string) => {
    setFeedback({ visivel: true, tipo, titulo, mensagem, kicker });
  };

  const fecharFeedback = () => setFeedback((prev) => ({ ...prev, visivel: false }));

  const processarArquivoIA = async (payload: {
    uri: string;
    nomeArquivo?: string | null;
    mimeType?: string | null;
    tamanhoBytes?: number | null;
    base64?: string | null;
  }) => {
    if (!conexaoId) {
      mostrarFeedback("error", "Vínculo Ausente", "Volte para a ficha do aluno e abra a avaliação novamente.");
      return;
    }

    if (revisaoIA.storagePath) {
      removerArquivoBioStorage(revisaoIA.storagePath);
    }

    setAnalisandoIA(true);
    setEtapaIATexto("Preparando arquivo...");

    try {
      const res = await enviarEAnalisarBioimpedanciaIA({
        conexaoId,
        ...payload,
        onProgresso: (texto) => setEtapaIATexto(texto),
      });

      if (!res.eh_bioimpedancia) {
        mostrarFeedback(
          "error",
          "Documento Não Reconhecido",
          res.motivo_invalido ||
            "Este arquivo não parece ser um exame de bioimpedância legível. Envie o PDF original ou uma foto nítida do laudo.",
          "LEITURA IA"
        );
        return;
      }

      const ind = res.indicadores || {};
      const seg = res.segmentar || {};

      if (res.data_exame) setDataAvaliacao(isoParaBR(res.data_exame));
      if (ind.peso !== undefined && ind.peso !== null) setPeso(numParaInput(ind.peso));
      if (ind.percentual_gordura !== undefined && ind.percentual_gordura !== null) {
        setGorduraPercentual(numParaInput(ind.percentual_gordura));
      }
      setMassaMuscular(numParaInput(ind.massa_muscular_esqueletica));
      setMassaMagra(numParaInput(ind.massa_magra));
      setMassaGordura(numParaInput(ind.massa_de_gordura));
      setAguaCorporal(numParaInput(ind.agua_corporal));
      setVisceral(numParaInput(ind.gordura_visceral));
      setTmb(numParaInput(ind.taxa_metabolica_basal));

      setGordBracoEsq(numParaInput(seg.gord_braco_esq));
      setGordBracoDir(numParaInput(seg.gord_braco_dir));
      setGordTronco(numParaInput(seg.gord_tronco));
      setGordPernaEsq(numParaInput(seg.gord_perna_esq));
      setGordPernaDir(numParaInput(seg.gord_perna_dir));

      setMassaBracoEsq(numParaInput(seg.massa_braco_esq));
      setMassaBracoDir(numParaInput(seg.massa_braco_dir));
      setMassaTronco(numParaInput(seg.massa_tronco));
      setMassaPernaEsq(numParaInput(seg.massa_perna_esq));
      setMassaPernaDir(numParaInput(seg.massa_perna_dir));

      setRevisaoIA({
        ativa: true,
        storagePath: res.storage_path,
        mimeType: res.mime_type,
        uriLocal: res.uri_local,
        nomeArquivo: res.nome_arquivo,
        origemLeitura: res.origem_leitura,
        fabricante: res.fabricante || null,
        confiancaGeral: res.confianca_geral,
        confiancaCampos: res.confianca_campos || {},
        valoresOriginais: res.valores_originais || {},
        avisos: res.avisos || [],
        camposNaoReconhecidos: res.campos_nao_reconhecidos || [],
        extras: {
          imc: ind.imc ?? null,
          rcq: ind.rcq ?? null,
          proteina_kg: ind.proteina_kg ?? null,
          minerais_kg: ind.minerais_kg ?? null,
          pontuacao_equipamento: ind.pontuacao_equipamento ?? null,
        },
      });
    } catch (err: any) {
      mostrarFeedback(
        "error",
        "Falha na Leitura IA",
        err?.message || "Não foi possível interpretar o laudo agora. Você pode tentar novamente ou preencher manualmente.",
        "ERRO NA LEITURA"
      );
    } finally {
      setAnalisandoIA(false);
      setEtapaIATexto("");
    }
  };

  const escolherPdf = async () => {
    setModalOrigemVisivel(false);
    setTimeout(async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets?.[0]) {
          const a = res.assets[0];
          await processarArquivoIA({
            uri: a.uri,
            nomeArquivo: a.name,
            mimeType: a.mimeType || "application/pdf",
            tamanhoBytes: a.size,
          });
        }
      } catch {
        mostrarFeedback("error", "Erro ao Selecionar PDF", "Não foi possível abrir o seletor de documentos.");
      }
    }, 400);
  };

  const escolherGaleria = async () => {
    setModalOrigemVisivel(false);
    setTimeout(async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        mostrarFeedback("warning", "Permissão Necessária", "Libere o acesso à galeria para importar o laudo.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        base64: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        await processarArquivoIA({
          uri: a.uri,
          nomeArquivo: a.fileName || `bio_${Date.now()}.jpg`,
          mimeType: a.mimeType || "image/jpeg",
          tamanhoBytes: a.fileSize,
          base64: a.base64,
        });
      }
    }, 400);
  };

  const escolherCamera = async () => {
    setModalOrigemVisivel(false);
    setTimeout(async () => {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        mostrarFeedback("warning", "Permissão Necessária", "Libere a câmera para fotografar o exame.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        base64: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        await processarArquivoIA({
          uri: a.uri,
          nomeArquivo: a.fileName || `bio_${Date.now()}.jpg`,
          mimeType: a.mimeType || "image/jpeg",
          tamanhoBytes: a.fileSize,
          base64: a.base64,
        });
      }
    }, 400);
  };

  const abrirDocumentoOriginal = async () => {
    if (!revisaoIA.ativa) return;

    if (revisaoIA.mimeType !== "application/pdf" && revisaoIA.uriLocal) {
      setPreviewImagemUri(revisaoIA.uriLocal);
      return;
    }

    if (revisaoIA.storagePath) {
      const signed = await obterUrlAssinadaBio(revisaoIA.storagePath);
      if (signed) {
        await WebBrowser.openBrowserAsync(signed);
        return;
      }
    }

    mostrarFeedback("warning", "Visualização Indisponível", "Não foi possível abrir o arquivo original agora.");
  };

  const limparRevisaoIA = async () => {
    if (revisaoIA.storagePath) {
      await removerArquivoBioStorage(revisaoIA.storagePath);
    }
    setRevisaoIA(REVISAO_INICIAL);
  };

  const salvarAvaliacao = async () => {
    if (!conexaoId) {
      mostrarFeedback("error", "Vínculo não encontrado", "Volte para a ficha do aluno e tente novamente.");
      return;
    }

    const dataIso = brParaIso(dataAvaliacao);
    if (!dataIso) {
      mostrarFeedback("warning", "Data Inválida", "Informe a data da avaliação no formato DD/MM/AAAA.");
      return;
    }

    if (!peso.trim() || !gorduraPercentual.trim()) {
      mostrarFeedback("warning", "Campos Obrigatórios", "Preencha pelo menos o Peso Total e o Percentual de Gordura.");
      return;
    }

    setLoading(true);
    try {
      const pesoNum = parseNumeroOpcional(peso, "Peso Total");
      const gorduraNum = parseNumeroOpcional(gorduraPercentual, "Gordura %");
      const mmeNum = parseNumeroOpcional(massaMuscular, "Massa Muscular Esquelética");
      const massaMagraNum = parseNumeroOpcional(massaMagra, "Massa Magra");

      if (pesoNum === null || pesoNum < 20 || pesoNum > 350) {
        throw new Error("Informe um Peso Total válido entre 20 kg e 350 kg.");
      }
      if (gorduraNum === null || gorduraNum < 2 || gorduraNum > 75) {
        throw new Error("Informe um Percentual de Gordura válido entre 2% e 75%.");
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

      const metadata: MetadataAvaliacao = {
        separacao_mme_v2: true,
        fabricante: revisaoIA.fabricante,
        imc_medido: revisaoIA.extras.imc ?? null,
        rcq_medido: revisaoIA.extras.rcq ?? null,
        proteina_kg: revisaoIA.extras.proteina_kg ?? null,
        minerais_kg: revisaoIA.extras.minerais_kg ?? null,
        pontuacao_equipamento: revisaoIA.extras.pontuacao_equipamento ?? null,
        confianca_geral_ia: revisaoIA.ativa ? revisaoIA.confiancaGeral : null,
        confianca_campos: revisaoIA.ativa ? revisaoIA.confiancaCampos : undefined,
        valores_originais_ia: revisaoIA.ativa ? revisaoIA.valoresOriginais : undefined,
        avisos_ia: revisaoIA.ativa ? revisaoIA.avisos : undefined,
        campos_nao_reconhecidos: revisaoIA.ativa ? revisaoIA.camposNaoReconhecidos : undefined,
      };

      const { error } = await supabase.from("aluno_evolucao").insert([
        {
          conexao_id: conexaoId,
          data_registro: dataIso,
          tipo_avaliacao: "bioimpedancia",
          origem_leitura: revisaoIA.ativa ? revisaoIA.origemLeitura : "manual",
          arquivo_bioimpedancia_url: revisaoIA.storagePath || null,
          peso: pesoNum,
          percentual_gordura: gorduraNum,
          massa_muscular_esqueletica: mmeNum,
          massa_magra: massaMagraNum,
          massa_de_gordura: parseNumeroOpcional(massaGordura, "Massa Gordura"),
          agua_corporal: parseNumeroOpcional(aguaCorporal, "Água Corporal"),
          gordura_visceral: parseNumeroOpcional(visceral, "Gordura Visceral"),
          taxa_metabolica_basal: parseNumeroOpcional(tmb, "Taxa Metabólica Basal"),
          analise_segmentar: jsonSegmentar,
          metadata_avaliacao: metadata,
        },
      ]);

      if (error) throw error;

      setResumoSalvo({
        peso: `${pesoNum.toFixed(1).replace(".", ",")} kg`,
        gordura: `${gorduraNum.toFixed(1).replace(".", ",")}%`,
        mme: mmeNum !== null ? `${mmeNum.toFixed(1).replace(".", ",")} kg` : "--",
        data: dataAvaliacao,
        viaIA: revisaoIA.ativa,
      });
      setModalSucessoVisivel(true);
    } catch (error: any) {
      console.log("Erro ao salvar bioimpedância:", error);
      mostrarFeedback(
        "error",
        "Erro ao Salvar",
        error?.message || "Não foi possível salvar a bioimpedância agora.",
        "FALHA AO SALVAR"
      );
    } finally {
      setLoading(false);
    }
  };

  const concluirESair = () => {
    setModalSucessoVisivel(false);
    navigation.goBack();
  };

  const cancelar = async () => {
    if (revisaoIA.storagePath && !modalSucessoVisivel) {
      await removerArquivoBioStorage(revisaoIA.storagePath);
    }
    navigation.goBack();
  };

  return {
    loading,
    analisandoIA,
    etapaIATexto,
    modalOrigemVisivel,
    setModalOrigemVisivel,
    previewImagemUri,
    setPreviewImagemUri,
    revisaoIA,
    feedback,
    fecharFeedback,
    modalSucessoVisivel,
    resumoSalvo,
    concluirESair,
    salvarAvaliacao,
    cancelar,
    escolherPdf,
    escolherGaleria,
    escolherCamera,
    abrirDocumentoOriginal,
    limparRevisaoIA,

    dataAvaliacao,
    setDataAvaliacao: (txt: string) => setDataAvaliacao(formatarMascaraData(txt)),
    peso,
    setPeso,
    gorduraPercentual,
    setGorduraPercentual,
    massaMuscular,
    setMassaMuscular,
    massaMagra,
    setMassaMagra,
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