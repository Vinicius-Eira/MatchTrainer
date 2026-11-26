export type TipoAvaliacao = "bioimpedancia" | "adipometria" | "perimetria" | "completa";

export type OrigemLeitura = "manual" | "ia_pdf" | "ia_imagem" | "csv";

export type ProtocoloAdipometria = "pollock_7" | "pollock_3";

export type SexoBiologico = "masculino" | "feminino";

export type NivelConfiancaCampo = "alta" | "media" | "baixa" | "ausente";

export interface AnaliseSegmentar {
  gord_braco_esq?: number | null;
  gord_braco_dir?: number | null;
  gord_tronco?: number | null;
  gord_perna_esq?: number | null;
  gord_perna_dir?: number | null;
  massa_braco_esq?: number | null;
  massa_braco_dir?: number | null;
  massa_tronco?: number | null;
  massa_perna_esq?: number | null;
  massa_perna_dir?: number | null;
}

export interface DobrasCutaneas {
  peitoral?: number | null;
  axilar_media?: number | null;
  triceps?: number | null;
  subescapular?: number | null;
  abdominal?: number | null;
  suprailiaca?: number | null;
  coxa?: number | null;
}

export interface Perimetria {
  pescoco?: number | null;
  ombros?: number | null;
  torax?: number | null;
  braco_dir_relaxado?: number | null;
  braco_esq_relaxado?: number | null;
  braco_dir_contraido?: number | null;
  braco_esq_contraido?: number | null;
  antebraco_dir?: number | null;
  antebraco_esq?: number | null;
  cintura?: number | null;
  abdomen?: number | null;
  quadril?: number | null;
  coxa_dir?: number | null;
  coxa_esq?: number | null;
  panturrilha_dir?: number | null;
  panturrilha_esq?: number | null;
}

export interface MetadataAvaliacao {
  separacao_mme_v2?: boolean;
  protocolo_adipometria?: ProtocoloAdipometria | null;
  equacao_gordura?: "siri" | null;
  sexo_calculo?: SexoBiologico | null;
  idade_calculo?: number | null;
  soma_dobras_mm?: number | null;
  densidade_corporal?: number | null;
  altura_cm?: number | null;
  meta_gordura_pct?: number | null;
  peso_proposto_kg?: number | null;
  ajuste_peso_kg?: number | null;
  objetivo_avaliacao?: string | null;
  rcq_medido?: number | null;
  imc_medido?: number | null;
  proteina_kg?: number | null;
  minerais_kg?: number | null;
  pontuacao_equipamento?: number | null;
  fabricante?: string | null;
  confianca_geral_ia?: number | null;
  confianca_campos?: Record<string, NivelConfiancaCampo>;
  valores_originais_ia?: Record<string, string | number | null>;
  avisos_ia?: string[];
  campos_nao_reconhecidos?: string[];
}

export interface AvaliacaoFisicaRecord {
  id: string;
  conexao_id: string;
  data_registro: string;
  created_at?: string | null;
  peso: number;
  percentual_gordura?: number | null;
  massa_magra?: number | null;
  massa_muscular_esqueletica?: number | null;
  massa_de_gordura?: number | null;
  agua_corporal?: number | null;
  gordura_visceral?: number | null;
  taxa_metabolica_basal?: number | null;
  observacoes?: string | null;
  arquivo_bioimpedancia_url?: string | null;
  origem_leitura?: OrigemLeitura | string | null;
  tipo_avaliacao?: TipoAvaliacao | string | null;
  analise_segmentar?: AnaliseSegmentar | string | null;
  dobras_cutaneas?: DobrasCutaneas | string | null;
  perimetria?: Perimetria | string | null;
  metadata_avaliacao?: MetadataAvaliacao | string | null;
}

export interface ResultadoAdipometria {
  valido: boolean;
  erro?: string;
  aviso?: string;
  protocolo: ProtocoloAdipometria;
  somaDobrasMm: number;
  densidadeCorporal: number;
  percentualGordura: number;
  massaGordaKg: number;
  massaMagraKg: number;
  pesoPropostoKg: number | null;
  ajustePesoKg: number | null;
}

export interface ResultadoIMC {
  valor: number | null;
  classificacao: "Abaixo" | "Normal" | "Sobrepeso" | "Obeso" | "N/A";
  cor: string;
}

export interface ResultadoRCQ {
  valor: number | null;
  classificacao: "Baixo" | "Moderado" | "Alto" | "N/A";
  cor: string;
  origem: "medido" | "calculado" | "ausente";
}

export interface ResultadoSimetria {
  disponivel: boolean;
  esquerdo: number | null;
  direito: number | null;
  diferencaAbsoluta: number | null;
  diferencaPercentual: number | null;
  ladoMaior: "esquerdo" | "direito" | "igual" | null;
  status: "simetrico" | "leve_assimetria" | "atencao" | "indisponivel";
  label: string;
  cor: string;
}

export interface DeltaIndicador {
  disponivel: boolean;
  diferenca: number | null;
  texto: string | null;
  direcao: "subiu" | "caiu" | "estavel" | null;
  status: "positivo" | "atencao" | "neutro";
  cor: string;
}

export interface ResultadoValorMassa {
  valor: number | null;
  origem: "medido" | "calculado" | "legado" | "ausente";
}

export interface ResumoComparacaoAvaliacao {
  comparacaoMetodosDiferentes: boolean;
  recomposicaoDetectada: boolean;
  peso: DeltaIndicador;
  gorduraPct: DeltaIndicador;
  massaMuscular: DeltaIndicador;
  massaMagra: DeltaIndicador;
  massaGorda: DeltaIndicador;
  aguaCorporal: DeltaIndicador;
  gorduraVisceral: DeltaIndicador;
  tmb: DeltaIndicador;
  dataAnteriorTmb: string | null;
}

export interface AnaliseEsforcoRpe {
  label: string;
  texto: string;
  sub: string;
  percentual: number;
  cor: string;
}