// services/overpassService.js
// Busca paradas de transporte público na região usando a API Overpass (OpenStreetMap)
// Documentação: https://overpass-api.de/

// Mirrors públicos (tentados em ordem se um falhar)
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

/**
 * Busca paradas de ônibus/metrô/trem numa área circular ao redor de uma coordenada.
 * @param {number} lat  Latitude do centro
 * @param {number} lon  Longitude do centro
 * @param {number} raioMetros  Raio da busca em metros (padrão 800)
 * @returns {Promise<Array>} Lista de paradas {id, nome, latitude, longitude, tipo}
 */
export async function buscarParadasProximas(lat, lon, raioMetros = 800) {
  // Query numa única linha sem quebras — evita problemas de parsing no servidor
  const query =
    '[out:json][timeout:15];' +
    '(' +
    'node["highway"="bus_stop"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    'node["public_transport"="stop_position"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    'node["public_transport"="platform"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    'node["railway"="subway_entrance"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    'node["railway"="station"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    'node["railway"="tram_stop"](around:' + raioMetros + ',' + lat + ',' + lon + ');' +
    ');' +
    'out body;';

  for (const baseUrl of OVERPASS_MIRRORS) {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        body: 'data=' + query,
      });

      if (!response.ok) {
        console.warn('Overpass ' + baseUrl + ' => HTTP ' + response.status);
        continue;
      }

      const json = await response.json();
      const paradas = (json.elements || []).map(function(el) {
        return {
          id: 'osm_' + el.id,
          latitude: el.lat,
          longitude: el.lon,
          nome: (el.tags && (el.tags.name || el.tags['name:pt'])) || resolverTipo(el.tags),
          tipo: resolverTipo(el.tags),
        };
      });

      return removerDuplicatas(paradas);

    } catch (erro) {
      console.warn('Overpass ' + baseUrl + ' erro: ' + erro.message);
    }
  }

  console.warn('Todos os mirrors Overpass falharam — paradas não exibidas.');
  return [];
}

function resolverTipo(tags) {
  if (!tags) return "Parada de transporte";
  if (tags["railway"] === "subway_entrance") return "Metrô";
  if (tags["railway"] === "station") return "Estação";
  if (tags["railway"] === "tram_stop") return "VLT / Bonde";
  if (tags["highway"] === "bus_stop") return "Ponto de ônibus";
  if (tags["public_transport"] === "platform") return "Plataforma";
  if (tags["public_transport"] === "stop_position") return "Parada";
  return "Parada de transporte";
}

function removerDuplicatas(paradas) {
  var unicas = [];
  for (var i = 0; i < paradas.length; i++) {
    var p = paradas[i];
    var repetida = unicas.some(function (u) {
      return (
        Math.abs(u.latitude - p.latitude) < 0.0001 &&
        Math.abs(u.longitude - p.longitude) < 0.0001
      );
    });
    if (!repetida) unicas.push(p);
  }
  return unicas;
}
