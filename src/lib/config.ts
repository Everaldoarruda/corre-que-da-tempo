/** Ajuste aqui os dados de contato e redes sociais do evento. */
export const SITE = {
  name: "Corre que dá Tempo",
  instagram: "https://www.instagram.com/correquedatempo__/",
  /** Número no formato internacional, sem espaços ou símbolos (DDI 55 + DDD + número). */
  whatsappNumber: "5581999999999",
  whatsappMessage: "Olá! Vim pelo site do Corre que dá Tempo e quero falar com a organização.",
  address: "Campo do Café - Rua Uriel de Holanda, Linha do Tiro, Recife - PE",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rua+Uriel+de+Holanda,+Linha+do+Tiro,+Recife+-+PE",
  dayLabel: "Toda quarta-feira",
  concentration: "20:00h",
  start: "20:30h",
  distanceKm: 4,
};

export function whatsappLink(message = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
