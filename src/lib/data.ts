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
