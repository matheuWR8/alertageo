/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine.
 * @returns {number} Distância em metros
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000; // raio médio da Terra em metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(graus) {
  return (graus * Math.PI) / 180;
}

/**
 * Formata metros de forma legível (ex: 1.2 km ou 350 m)
 */
export function formatarDistancia(metros) {
  if (metros >= 1000) return `${(metros / 1000).toFixed(1)} km`;
  return `${Math.round(metros)} m`;
}
