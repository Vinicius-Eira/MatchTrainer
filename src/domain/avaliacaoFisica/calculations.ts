import {
  AnaliseEsforcoRpe,
  AnaliseSegmentar,
  AvaliacaoFisicaRecord,
  DeltaIndicador,
  DobrasCutaneas,
  MetadataAvaliacao,
  Perimetria,
  ProtocoloAdipometria,
  ResultadoAdipometria,
  ResultadoIMC,
  ResultadoRCQ,
  ResultadoSimetria,
  ResultadoValorMassa,
  ResumoComparacaoAvaliacao,
  SexoBiologico,
} from "./types";

const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const DOBRAS_POR_PROTOCOLO: Record<
  ProtocoloAdipometria,
  Record<SexoBiologico, (keyof DobrasCutaneas)[]>
> = {
  pollock_7: {
    masculino: ["peitoral", "axilar_media", "triceps", "subescapular", "abdominal", "suprailiaca", "coxa"],
    feminino: ["peitoral", "axilar_media", "triceps", "subescapular", "abdominal", "suprailiaca", "coxa"],
  },
  pollock_3: {
    masculino: ["peitoral", "abdominal", "coxa"],
    feminino: ["triceps", "suprailiaca", "coxa"],
  },
};

export const LABELS_DOBRAS: Record<keyof DobrasCutaneas, string> = {
  peitoral: "Peitoral",
  axilar_media: "Axilar Média",
  triceps: "Tríceps",
  subescapular: "Subescapular",
  abdominal: "Abdominal",
  suprailiaca: "Suprailíaca",
  coxa: "Coxa",
};

export function parseJsonSeguro<T>(raw: T | string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }
  return raw;
}

export function parseNumeroBr(valor: string | number | null | undefined): number | null {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : null;
  }
  const limpo = String(valor).trim().replace(/\s+/g, "").replace(",", ".");
  if (!limpo) return null;
  const num = Number(limpo);
  return Number.isFinite(num) ? num : null;
}

export function formatarNumeroBR(valor: number | string | null | undefined, casas = 1): string {
  const num = parseNumeroBr(valor);
  if (num === null) return "--";
  if (casas === 0) return String(Math.round(num));
  return Number.isInteger(num) ? String(num) : num.toFixed(casas).replace(".", ",");
}

export function parseDataLocalSegura(data?: string | Date | null): Date | null {
  if (!data) return null;
  if (data instanceof Date) {
    return Number.isNaN(data.getTime()) ? null : data;
  }
  const str = String(data).trim();
  const matchDateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchDateOnly) {
    const ano = Number(matchDateOnly[1]);
    const mes = Number(matchDateOnly[2]) - 1;
    const dia = Number(matchDateOnly[3]);
    return new Date(ano, mes, dia, 12, 0, 0);
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatarDataBR(data?: string | Date | null): string {
  const d = parseDataLocalSegura(data);
  if (!d) return "--/--/----";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function formatarDataCurtaBR(data?: string | Date | null): string {
  const d = parseDataLocalSegura(data);
  if (!d) return "--/--";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

export function formatarLabelGraficoData(data?: string | Date | null): string {
  const d = parseDataLocalSegura(data);
  if (!d) return "--";
  return `${String(d.getDate()).padStart(2, "0")} ${MESES_CURTOS[d.getMonth()]}`;
}

export function calcularIdadeNaData(
  dataNascimento?: string | Date | null,
  dataReferencia?: string | Date | null
): number | null {
  const nasc = parseDataLocalSegura(dataNascimento);
  if (!nasc) return null;
  const ref = parseDataLocalSegura(dataReferencia) || new Date();

  let idade = ref.getFullYear() - nasc.getFullYear();
  const diffMes = ref.getMonth() - nasc.getMonth();
  if (diffMes < 0 || (diffMes === 0 && ref.getDate() < nasc.getDate())) {
    idade -= 1;
  }
  return idade >= 0 && idade <= 120 ? idade : null;
}

export function normalizarSexoBiologico(genero?: string | null): SexoBiologico | null {
  const g = String(genero || "")
    .trim()
    .toLowerCase();
  if (["masculino", "homem", "m", "male"].includes(g)) return "masculino";
  if (["feminino", "mulher", "f", "female"].includes(g)) return "feminino";
  return null;
}

export function obterMetadata(av?: AvaliacaoFisicaRecord | null): MetadataAvaliacao {
  return parseJsonSeguro<MetadataAvaliacao>(av?.metadata_avaliacao, {});
}

export function obterSegmentar(av?: AvaliacaoFisicaRecord | null): AnaliseSegmentar {
  return parseJsonSeguro<AnaliseSegmentar>(av?.analise_segmentar, {});
}

export function obterDobras(av?: AvaliacaoFisicaRecord | null): DobrasCutaneas {
  return parseJsonSeguro<DobrasCutaneas>(av?.dobras_cutaneas, {});
}

export function obterPerimetria(av?: AvaliacaoFisicaRecord | null): Perimetria {
  return parseJsonSeguro<Perimetria>(av?.perimetria, {});
}

export function obterMassaMuscularEsqueletica(av?: AvaliacaoFisicaRecord | null): ResultadoValorMassa {
  if (!av) return { valor: null, origem: "ausente" };

  const mmeDireta = parseNumeroBr(av.massa_muscular_esqueletica);
  if (mmeDireta !== null) {
    return { valor: mmeDireta, origem: "medido" };
  }

  const meta = obterMetadata(av);
  const tipo = String(av.tipo_avaliacao || "bioimpedancia").toLowerCase();

  if (meta.separacao_mme_v2 || tipo === "adipometria" || tipo === "perimetria") {
    return { valor: null, origem: "ausente" };
  }

  const legado = parseNumeroBr(av.massa_magra);
  if (legado !== null) {
    return { valor: legado, origem: "legado" };
  }

  return { valor: null, origem: "ausente" };
}

export function obterMassaMagra(av?: AvaliacaoFisicaRecord | null): ResultadoValorMassa {
  if (!av) return { valor: null, origem: "ausente" };

  const meta = obterMetadata(av);
  const tipo = String(av.tipo_avaliacao || "bioimpedancia").toLowerCase();
  const massaMagraCol = parseNumeroBr(av.massa_magra);

  if ((meta.separacao_mme_v2 || tipo === "adipometria" || av.massa_muscular_esqueletica != null) && massaMagraCol !== null) {
    return { valor: massaMagraCol, origem: tipo === "adipometria" ? "calculado" : "medido" };
  }

  const peso = parseNumeroBr(av.peso);
  const massaGorda = obterMassaGorda(av).valor;
  if (peso !== null && massaGorda !== null && peso > massaGorda) {
    return { valor: Number((peso - massaGorda).toFixed(2)), origem: "calculado" };
  }

  return { valor: null, origem: "ausente" };
}

export function obterMassaGorda(av?: AvaliacaoFisicaRecord | null): ResultadoValorMassa {
  if (!av) return { valor: null, origem: "ausente" };

  const direta = parseNumeroBr(av.massa_de_gordura);
  if (direta !== null) {
    return { valor: direta, origem: "medido" };
  }

  const peso = parseNumeroBr(av.peso);
  const pct = parseNumeroBr(av.percentual_gordura);
  if (peso !== null && pct !== null && peso > 0 && pct >= 0 && pct <= 80) {
    return { valor: Number(((peso * pct) / 100).toFixed(2)), origem: "calculado" };
  }

  return { valor: null, origem: "ausente" };
}

export function calcularAdipometria(params: {
  protocolo: ProtocoloAdipometria;
  sexo: SexoBiologico;
  idade: number;
  pesoKg: number;
  dobras: DobrasCutaneas;
  metaGorduraPct?: number | null;
}): ResultadoAdipometria {
  const { protocolo, sexo, idade, pesoKg, dobras, metaGorduraPct } = params;

  const baseErro = (erro: string): ResultadoAdipometria => ({
    valido: false,
    erro,
    protocolo,
    somaDobrasMm: 0,
    densidadeCorporal: 0,
    percentualGordura: 0,
    massaGordaKg: 0,
    massaMagraKg: 0,
    pesoPropostoKg: null,
    ajustePesoKg: null,
  });

  if (!Number.isFinite(pesoKg) || pesoKg < 20 || pesoKg > 350) {
    return baseErro("Informe um peso corporal válido entre 20 kg e 350 kg.");
  }

  if (!Number.isFinite(idade) || idade < 10 || idade > 100) {
    return baseErro("Informe uma idade válida entre 10 e 100 anos para o protocolo de Pollock.");
  }

  const camposObrigatorios = DOBRAS_POR_PROTOCOLO[protocolo][sexo];
  let soma = 0;

  for (const campo of camposObrigatorios) {
    const val = parseNumeroBr(dobras[campo]);
    if (val === null) {
      return baseErro(`Preencha a dobra "${LABELS_DOBRAS[campo]}" (obrigatória neste protocolo).`);
    }
    if (val < 1 || val > 100) {
      return baseErro(`A dobra "${LABELS_DOBRAS[campo]}" deve estar entre 1 mm e 100 mm.`);
    }
    soma += val;
  }

  let dc = 0;
  if (protocolo === "pollock_7") {
    if (sexo === "masculino") {
      dc = 1.112 - 0.00043499 * soma + 0.00000055 * soma * soma - 0.00028826 * idade;
    } else {
      dc = 1.097 - 0.00046971 * soma + 0.00000056 * soma * soma - 0.00012828 * idade;
    }
  } else {
    if (sexo === "masculino") {
      dc = 1.10938 - 0.0008267 * soma + 0.0000016 * soma * soma - 0.0002574 * idade;
    } else {
      dc = 1.0994921 - 0.0009929 * soma + 0.0000023 * soma * soma - 0.0001392 * idade;
    }
  }

  if (!Number.isFinite(dc) || dc <= 0.9 || dc >= 1.15) {
    return baseErro("Densidade corporal fora da faixa fisiológica. Revise as dobras digitadas.");
  }

  const pctGorduraBruto = 495 / dc - 450;
  let aviso: string | undefined;

  if (pctGorduraBruto < 2 || pctGorduraBruto > 65) {
    return baseErro("Percentual de gordura resultante fora da faixa fisiológica (2% a 65%). Revise as medidas.");
  }
  if (pctGorduraBruto < 5) {
    aviso = "Percentual muito baixo (< 5%). Confirme se todas as dobras estão em milímetros.";
  }

  const pctGordura = Number(pctGorduraBruto.toFixed(1));
  const massaGordaKg = Number(((pesoKg * pctGordura) / 100).toFixed(2));
  const massaMagraKg = Number((pesoKg - massaGordaKg).toFixed(2));

  let pesoPropostoKg: number | null = null;
  let ajustePesoKg: number | null = null;

  if (metaGorduraPct !== null && metaGorduraPct !== undefined && Number.isFinite(metaGorduraPct)) {
    if (metaGorduraPct >= 4 && metaGorduraPct <= 45) {
      pesoPropostoKg = Number((massaMagraKg / (1 - metaGorduraPct / 100)).toFixed(1));
      ajustePesoKg = Number((pesoPropostoKg - pesoKg).toFixed(1));
    }
  }

  return {
    valido: true,
    aviso,
    protocolo,
    somaDobrasMm: Number(soma.toFixed(1)),
    densidadeCorporal: Number(dc.toFixed(5)),
    percentualGordura: pctGordura,
    massaGordaKg,
    massaMagraKg,
    pesoPropostoKg,
    ajustePesoKg,
  };
}

export function calcularIMC(pesoKg?: number | null, alturaCm?: number | null): ResultadoIMC {
  const p = parseNumeroBr(pesoKg);
  const a = parseNumeroBr(alturaCm);
  if (p === null || a === null || p <= 0 || a <= 0) {
    return { valor: null, classificacao: "N/A", cor: "#8E8E93" };
  }

  const alturaM = a > 3 ? a / 100 : a;
  const imc = Number((p / (alturaM * alturaM)).toFixed(1));

  if (imc < 18.5) return { valor: imc, classificacao: "Abaixo", cor: "#FF6B00" };
  if (imc < 25) return { valor: imc, classificacao: "Normal", cor: "#00E676" };
  if (imc < 30) return { valor: imc, classificacao: "Sobrepeso", cor: "#FFD700" };
  return { valor: imc, classificacao: "Obeso", cor: "#EF4444" };
}

export function calcularRCQ(params: {
  cinturaCm?: number | null;
  quadrilCm?: number | null;
  rcqMedido?: number | null;
  sexo?: SexoBiologico | null;
}): ResultadoRCQ {
  const medido = parseNumeroBr(params.rcqMedido);
  const cint = parseNumeroBr(params.cinturaCm);
  const quad = parseNumeroBr(params.quadrilCm);

  let valor: number | null = null;
  let origem: "medido" | "calculado" | "ausente" = "ausente";

  if (medido !== null && medido > 0.4 && medido < 1.6) {
    valor = Number(medido.toFixed(2));
    origem = "medido";
  } else if (cint !== null && quad !== null && cint > 30 && quad > 40) {
    valor = Number((cint / quad).toFixed(2));
    origem = "calculado";
  }

  if (valor === null) {
    return { valor: null, classificacao: "N/A", cor: "#8E8E93", origem: "ausente" };
  }

  if (!params.sexo) {
    return { valor, classificacao: "N/A", cor: "#FF6B00", origem };
  }

  const limiteAlto = params.sexo === "masculino" ? 0.9 : 0.85;
  const limiteModerado = params.sexo === "masculino" ? 0.85 : 0.8;

  if (valor >= limiteAlto) return { valor, classificacao: "Alto", cor: "#EF4444", origem };
  if (valor >= limiteModerado) return { valor, classificacao: "Moderado", cor: "#FFD700", origem };
  return { valor, classificacao: "Baixo", cor: "#00E676", origem };
}

export function calcularSimetriaBilateral(
  esquerdo?: number | null,
  direito?: number | null
): ResultadoSimetria {
  const e = parseNumeroBr(esquerdo);
  const d = parseNumeroBr(direito);

  if (e === null || d === null || (e <= 0 && d <= 0)) {
    return {
      disponivel: false,
      esquerdo: e,
      direito: d,
      diferencaAbsoluta: null,
      diferencaPercentual: null,
      ladoMaior: null,
      status: "indisponivel",
      label: "Sem comparação",
      cor: "#71717A",
    };
  }

  const maior = Math.max(e, d);
  const diffAbs = Number(Math.abs(e - d).toFixed(2));
  const diffPct = maior > 0 ? Number(((diffAbs / maior) * 100).toFixed(1)) : 0;
  const ladoMaior = diffAbs < 0.01 ? "igual" : e > d ? "esquerdo" : "direito";

  if (diffPct < 5) {
    return {
      disponivel: true,
      esquerdo: e,
      direito: d,
      diferencaAbsoluta: diffAbs,
      diferencaPercentual: diffPct,
      ladoMaior,
      status: "simetrico",
      label: `Simétrico (${diffPct.toFixed(1).replace(".", ",")}%)`,
      cor: "#00E676",
    };
  }

  if (diffPct < 10) {
    return {
      disponivel: true,
      esquerdo: e,
      direito: d,
      diferencaAbsoluta: diffAbs,
      diferencaPercentual: diffPct,
      ladoMaior,
      status: "leve_assimetria",
      label: `Leve assimetria (${diffPct.toFixed(1).replace(".", ",")}%)`,
      cor: "#FFD700",
    };
  }

  return {
    disponivel: true,
    esquerdo: e,
    direito: d,
    diferencaAbsoluta: diffAbs,
    diferencaPercentual: diffPct,
    ladoMaior,
    status: "atencao",
    label: `Atenção (${diffPct.toFixed(1).replace(".", ",")}%)`,
    cor: "#FF6B00",
  };
}

export function calcularDeltaIndicador(
  atual: number | null | undefined,
  anterior: number | null | undefined,
  unidade: string,
  regra: "maior_melhor" | "menor_melhor" | "neutro" = "neutro",
  casas = 1
): DeltaIndicador {
  const a = parseNumeroBr(atual);
  const b = parseNumeroBr(anterior);

  if (a === null || b === null) {
    return { disponivel: false, diferenca: null, texto: null, direcao: null, status: "neutro", cor: "#8E8E93" };
  }

  const diff = Number((a - b).toFixed(casas));
  const tolerancia = casas === 0 ? 0.5 : 0.05;

  if (Math.abs(diff) < tolerancia) {
    return {
      disponivel: true,
      diferenca: 0,
      texto: "Estável",
      direcao: "estavel",
      status: "neutro",
      cor: "#8E8E93",
    };
  }

  const sinal = diff > 0 ? "+" : "";
  const formatado = casas === 0 ? String(Math.round(diff)) : diff.toFixed(casas).replace(".", ",");
  const texto = `${sinal}${formatado}${unidade}`;
  const direcao = diff > 0 ? "subiu" : "caiu";

  if (regra === "neutro") {
    return { disponivel: true, diferenca: diff, texto, direcao, status: "neutro", cor: "#A1A1AA" };
  }

  const melhorou = regra === "menor_melhor" ? diff < 0 : diff > 0;
  return {
    disponivel: true,
    diferenca: diff,
    texto,
    direcao,
    status: melhorou ? "positivo" : "atencao",
    cor: melhorou ? "#00E676" : "#FF6B00",
  };
}

export function compararAvaliacoes(
  atual: AvaliacaoFisicaRecord | null | undefined,
  anterior: AvaliacaoFisicaRecord | null | undefined,
  historicoCompleto: AvaliacaoFisicaRecord[] = [],
  metaPeso?: number | null
): ResumoComparacaoAvaliacao {
  const tipoAtual = String(atual?.tipo_avaliacao || "bioimpedancia").toLowerCase();
  const tipoAnt = anterior ? String(anterior.tipo_avaliacao || "bioimpedancia").toLowerCase() : null;
  const comparacaoMetodosDiferentes = Boolean(anterior && tipoAnt && tipoAtual !== tipoAnt);

  let regraPeso: "maior_melhor" | "menor_melhor" | "neutro" = "neutro";
  const metaNum = parseNumeroBr(metaPeso);
  const pesoAntNum = parseNumeroBr(anterior?.peso);
  if (metaNum !== null && pesoAntNum !== null && Math.abs(metaNum - pesoAntNum) > 0.3) {
    regraPeso = metaNum < pesoAntNum ? "menor_melhor" : "maior_melhor";
  }

  const mmeAtual = obterMassaMuscularEsqueletica(atual).valor;
  const mmeAnt = obterMassaMuscularEsqueletica(anterior).valor;
  const mmAtual = obterMassaMagra(atual).valor;
  const mmAnt = obterMassaMagra(anterior).valor;
  const mgAtual = obterMassaGorda(atual).valor;
  const mgAnt = obterMassaGorda(anterior).valor;

  const deltaPeso = calcularDeltaIndicador(atual?.peso, anterior?.peso, " kg", regraPeso, 1);
  const deltaGordura = calcularDeltaIndicador(
    atual?.percentual_gordura,
    anterior?.percentual_gordura,
    "%",
    "menor_melhor",
    1
  );
  const deltaMme = calcularDeltaIndicador(mmeAtual, mmeAnt, " kg", "maior_melhor", 1);
  const deltaMm = calcularDeltaIndicador(mmAtual, mmAnt, " kg", "maior_melhor", 1);
  const deltaMg = calcularDeltaIndicador(mgAtual, mgAnt, " kg", "menor_melhor", 1);
  const deltaAgua = calcularDeltaIndicador(atual?.agua_corporal, anterior?.agua_corporal, " L", "maior_melhor", 1);
  const deltaVisceral = calcularDeltaIndicador(
    atual?.gordura_visceral,
    anterior?.gordura_visceral,
    "",
    "menor_melhor",
    0
  );

  let tmbAnteriorVal: number | null = null;
  let dataAnteriorTmb: string | null = null;
  if (atual) {
    const idxAtual = historicoCompleto.findIndex((item) => item.id === atual.id);
    const listaPosteriores = idxAtual >= 0 ? historicoCompleto.slice(idxAtual + 1) : anterior ? [anterior] : [];
    const encontrada = listaPosteriores.find((item) => parseNumeroBr(item.taxa_metabolica_basal) !== null);
    if (encontrada) {
      tmbAnteriorVal = parseNumeroBr(encontrada.taxa_metabolica_basal);
      dataAnteriorTmb = encontrada.data_registro;
    }
  }
  const deltaTmb = calcularDeltaIndicador(atual?.taxa_metabolica_basal, tmbAnteriorVal, " kcal", "maior_melhor", 0);

  const recomposicaoDetectada = Boolean(
    deltaPeso.disponivel &&
      deltaGordura.disponivel &&
      deltaPeso.diferenca !== null &&
      deltaGordura.diferenca !== null &&
      Math.abs(deltaPeso.diferenca) <= 0.6 &&
      deltaGordura.diferenca <= -0.4 &&
      ((deltaMme.diferenca !== null && deltaMme.diferenca >= 0.3) ||
        (deltaMm.diferenca !== null && deltaMm.diferenca >= 0.3))
  );

  return {
    comparacaoMetodosDiferentes,
    recomposicaoDetectada,
    peso: deltaPeso,
    gorduraPct: deltaGordura,
    massaMuscular: deltaMme,
    massaMagra: deltaMm,
    massaGorda: deltaMg,
    aguaCorporal: deltaAgua,
    gorduraVisceral: deltaVisceral,
    tmb: deltaTmb,
    dataAnteriorTmb,
  };
}

export function getAnaliseEsforcoRpe(rpe?: number | null): AnaliseEsforcoRpe {
  if (!rpe || rpe <= 0) {
    return {
      label: "Concluído",
      texto: "Sessão Concluída",
      sub: "Treino registrado sem nota de esforço",
      percentual: 100,
      cor: "#00E676",
    };
  }

  if (rpe <= 4) {
    return {
      label: "Leve",
      texto: "Esforço Leve / Recuperação",
      sub: "Ritmo confortável, foco técnico e margem para progredir",
      percentual: Math.max(25, rpe * 10),
      cor: "#00E676",
    };
  }

  if (rpe <= 7) {
    return {
      label: "Moderado",
      texto: "Estímulo Moderado (Zona Alvo)",
      sub: "Boa intensidade e controle de carga",
      percentual: rpe * 10,
      cor: "#FFB300",
    };
  }

  if (rpe <= 8) {
    return {
      label: "Intenso",
      texto: "Treino Intenso",
      sub: "Alto recrutamento muscular, próximo à falha",
      percentual: 85,
      cor: "#FF6B00",
    };
  }

  return {
    label: "Máximo",
    texto: "Exigência Máxima / Limite",
    sub: "Atenção à recuperação para a próxima sessão",
    percentual: 100,
    cor: "#EF4444",
  };
}