export const CONSTANTS = {
  TITLE_TREINADOR: "MEU TREINADOR",
  TITLE_ADAPTACAO: "Ciclo de Adaptação",
  MSG_ADAPTACAO: "Bons resultados exigem consistência. Cumpra o prazo do método para avaliarmos sua evolução.",
};

export type DiaSemana = {
  dia: string;
  data: string;
  status: "concluido" | "hoje" | "pendente" | "futuro";
};

export type Modality = "Consultoria Online" | "Presencial" | "Híbrido";