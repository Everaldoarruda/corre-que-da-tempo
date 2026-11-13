export type Runner = {
  id: number;
  name: string;
  category: "Masculino" | "Feminino";
  neighborhood: string;
  /** Tempo em segundos para os 4 km */
  bestTimeSec: number;
  /** Treinos concluídos no período */
  runs: number;
  /** Pontuação acumulada */
  points: number;
  /** Variação de posição em relação ao período anterior */
  delta: number;
};

export const weeklyRanking: Runner[] = [
  { id: 1, name: "Rafael Mendes", category: "Masculino", neighborhood: "Linha do Tiro", bestTimeSec: 15 * 60 + 42, runs: 1, points: 120, delta: 2 },
  { id: 2, name: "Juliana Costa", category: "Feminino", neighborhood: "Beberibe", bestTimeSec: 16 * 60 + 10, runs: 1, points: 112, delta: 0 },
  { id: 3, name: "Carlos Eduardo", category: "Masculino", neighborhood: "Água Fria", bestTimeSec: 16 * 60 + 25, runs: 1, points: 108, delta: -2 },
  { id: 4, name: "Marcilene Cunha", category: "Feminino", neighborhood: "Linha do Tiro", bestTimeSec: 16 * 60 + 48, runs: 1, points: 101, delta: 1 },
  { id: 5, name: "Thiago Albuquerque", category: "Masculino", neighborhood: "Arruda", bestTimeSec: 17 * 60 + 2, runs: 1, points: 97, delta: 3 },
  { id: 6, name: "Elielyta Lica", category: "Feminino", neighborhood: "Linha do Tiro", bestTimeSec: 17 * 60 + 30, runs: 1, points: 92, delta: -1 },
  { id: 7, name: "Pedro Henrique", category: "Masculino", neighborhood: "Cajueiro", bestTimeSec: 17 * 60 + 55, runs: 1, points: 88, delta: 0 },
  { id: 8, name: "Ana Beatriz", category: "Feminino", neighborhood: "Beberibe", bestTimeSec: 18 * 60 + 12, runs: 1, points: 84, delta: 4 },
  { id: 9, name: "Lucas Ferreira", category: "Masculino", neighborhood: "Linha do Tiro", bestTimeSec: 18 * 60 + 40, runs: 1, points: 80, delta: -3 },
  { id: 10, name: "Fernanda Silva", category: "Feminino", neighborhood: "Bomba do Hemetério", bestTimeSec: 19 * 60 + 5, runs: 1, points: 76, delta: 1 },
];

export const monthlyRanking: Runner[] = [
  { id: 2, name: "Juliana Costa", category: "Feminino", neighborhood: "Beberibe", bestTimeSec: 15 * 60 + 58, runs: 4, points: 448, delta: 1 },
  { id: 1, name: "Rafael Mendes", category: "Masculino", neighborhood: "Linha do Tiro", bestTimeSec: 15 * 60 + 42, runs: 4, points: 440, delta: -1 },
  { id: 4, name: "Marcilene Cunha", category: "Feminino", neighborhood: "Linha do Tiro", bestTimeSec: 16 * 60 + 30, runs: 4, points: 404, delta: 2 },
  { id: 6, name: "Elielyta Lica", category: "Feminino", neighborhood: "Linha do Tiro", bestTimeSec: 17 * 60 + 15, runs: 4, points: 368, delta: 0 },
  { id: 7, name: "Pedro Henrique", category: "Masculino", neighborhood: "Cajueiro", bestTimeSec: 17 * 60 + 40, runs: 4, points: 352, delta: 3 },
  { id: 3, name: "Carlos Eduardo", category: "Masculino", neighborhood: "Água Fria", bestTimeSec: 16 * 60 + 25, runs: 3, points: 324, delta: -1 },
  { id: 9, name: "Lucas Ferreira", category: "Masculino", neighborhood: "Linha do Tiro", bestTimeSec: 18 * 60 + 20, runs: 4, points: 320, delta: 0 },
  { id: 5, name: "Thiago Albuquerque", category: "Masculino", neighborhood: "Arruda", bestTimeSec: 17 * 60 + 2, runs: 3, points: 291, delta: -2 },
  { id: 8, name: "Ana Beatriz", category: "Feminino", neighborhood: "Beberibe", bestTimeSec: 18 * 60 + 0, runs: 3, points: 252, delta: 1 },
  { id: 10, name: "Fernanda Silva", category: "Feminino", neighborhood: "Bomba do Hemetério", bestTimeSec: 19 * 60 + 0, runs: 2, points: 152, delta: -1 },
];

/** Evolução semanal de participação e tempo médio (min) no mês */
export const monthlyEvolution = [
  { week: "Sem 1", corredores: 86, tempoMedio: 19.4 },
  { week: "Sem 2", corredores: 104, tempoMedio: 19.1 },
  { week: "Sem 3", corredores: 121, tempoMedio: 18.7 },
  { week: "Sem 4", corredores: 138, tempoMedio: 18.2 },
];

export function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  sizes?: string[];
};

export const products: Product[] = [
  { id: "camisa-preta", name: "Camisa Oficial Preta", price: 59.9, image: "/img/loja/camisa.svg", description: "Dry-fit, estampa amarela, o uniforme oficial das quartas.", sizes: ["P", "M", "G", "GG"] },
  { id: "bone", name: "Boné Corre que dá Tempo", price: 39.9, image: "/img/loja/bone.svg", description: "Boné preto com logo bordado, ajuste traseiro." },
  { id: "garrafa", name: "Garrafa Térmica 750ml", price: 49.9, image: "/img/loja/garrafa.svg", description: "Mantém a água gelada do Campo do Café até a Praça da Convenção." },
  { id: "viseira", name: "Viseira Noturna Refletiva", price: 29.9, image: "/img/loja/viseira.svg", description: "Faixa refletiva para segurança no treino noturno." },
  { id: "adesivo", name: "Kit Adesivos", price: 9.9, image: "/img/loja/adesivo.svg", description: "3 adesivos vinílicos para garrafa, carro ou celular." },
  { id: "regata", name: "Regata Treino", price: 54.9, image: "/img/loja/regata.svg", description: "Regata leve para os dias mais quentes do Recife.", sizes: ["P", "M", "G", "GG"] },
];

const captions = [
  "Concentração no Campo do Café",
  "Paredão puxando a galera",
  "Saída às 20:30h",
  "Subida da Linha do Tiro",
  "Praça da Convenção - retorno",
  "Chegada e foto oficial",
  "Família toda de preto",
  "Alongamento final",
];

export const gallery = captions.map((caption, i) => ({
  id: i + 1,
  src: `/img/galeria/foto-${String(i + 1).padStart(2, "0")}.svg`,
  alt: `Treino Corre que dá Tempo - ${caption}`,
  caption,
}));

export const sponsors = [
  { name: "Vereador Júnior de Cleto", logo: "/img/patrocinadores/junior-de-cleto.svg" },
  { name: "Cross J", logo: "/img/patrocinadores/cross-j.svg" },
  { name: "Academia pH GYM", logo: "/img/patrocinadores/ph-gym.svg" },
  { name: "Linha do Tiro Divulga", logo: "/img/patrocinadores/lt-divulga.svg" },
  { name: "Linha do Tiro Notícias", logo: "/img/patrocinadores/lt-noticias.svg" },
  { name: "Linha do Tiro Ordinário", logo: "/img/patrocinadores/lt-ordinario.svg" },
];

/** Anúncios dos fornecedores exibidos no carrossel do corpo da página */
export const ads = [
  { id: 1, title: "Academia pH GYM", subtitle: "Mensalidade com desconto para corredores do CQDT", cta: "Quero o desconto", image: "/img/anuncios/anuncio-01.svg", href: "#contato" },
  { id: 2, title: "Cross J", subtitle: "Treino funcional para melhorar sua corrida", cta: "Conhecer", image: "/img/anuncios/anuncio-02.svg", href: "#contato" },
  { id: 3, title: "Linha do Tiro Divulga", subtitle: "Divulgue seu negócio para mais de 1.200 corredores", cta: "Anunciar aqui", image: "/img/anuncios/anuncio-03.svg", href: "#contato" },
  { id: 4, title: "Seu anúncio aqui", subtitle: "Espaço disponível para fornecedores e parceiros", cta: "Falar com a organização", image: "/img/anuncios/anuncio-04.svg", href: "#contato" },
];
