export const MODALIDADES = ["Todos", "Consultoria", "Presencial", "Híbrido"] as const;

export type StatusFiltro = "Todos" | "Pagos" | "Pendentes" | "Atrasados";

export const STATUS_FILTROS = [
  { id: "Todos", label: "Todos", activeColor: "#FFF", activeBg: "rgba(255,255,255,0.15)" },
  { id: "Pagos", label: "Pagos", activeColor: "#00E676", activeBg: "rgba(0,230,118,0.15)" },
  { id: "Pendentes", label: "Pendentes", activeColor: "#FFD700", activeBg: "rgba(255,215,0,0.15)" },
  { id: "Atrasados", label: "Atrasados", activeColor: "#FF3B30", activeBg: "rgba(255,59,48,0.15)" },
] as const;

export const FORMAS_PAGAMENTO = ["PIX", "Dinheiro", "Cartão", "Transferência"] as const;
export const CATEGORIAS_EXTRA = ["Avaliação Física", "Planilha Extra", "E-book", "Aula Avulsa", "Outro"] as const;
export const MOTIVOS_CONGELAMENTO = ["Férias", "Lesão", "Viagem", "Outro"] as const;
export const MESES_NOME = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;
export const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"] as const;