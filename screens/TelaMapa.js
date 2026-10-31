// Mapa OpenStreetMap via Leaflet.js em WebView — funciona no Expo Go sem chave de API

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { buscarParadasProximas } from "../services/overpassService";
import { stylesMapa as styles } from "../styles";

// ─── HTML do mapa Leaflet embutido ───────────────────────────────────────────
// Usamos CDN do unpkg (não precisa de chave). O mapa usa tiles do OpenStreetMap.
// A comunicação com React Native é feita via window.ReactNativeWebView.postMessage
// e injectedJavaScript.
function gerarHtmlMapa(lat, lon, paradas) {
  const paradasJson = JSON.stringify(paradas);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  // Inicializa o mapa centrado na posição do usuário (ou Brasília como fallback)
  var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], 16);

  // Tiles do OpenStreetMap — gratuito, sem chave de API
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Marcador da posição do usuário (círculo azul)
  var circuloUsuario = L.circleMarker([${lat}, ${lon}], {
    radius: 8,
    fillColor: '#1a73e8',
    color: '#fff',
    weight: 2,
    fillOpacity: 0.9
  }).addTo(map).bindPopup('Você está aqui');

  // Ícone customizado para paradas de transporte (azul)
  var iconeParada = L.divIcon({
    className: '',
    html: '<div style="background:#1a73e8;color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4)">🚌</div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  // Ícone para o ponto selecionado pelo usuário (laranja)
  var iconeDestino = L.divIcon({
    className: '',
    html: '<div style="background:#e8710a;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5)">📍</div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  // Marcador e círculo do destino selecionado
  var marcadorDestino = null;
  var circuloDestino = null;

  // Toque simples = selecionar destino
  map.on('click', function(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      tipo: 'selecionar',
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      nome: ''
    }));
  });

  // Long press = buscar paradas próximas naquele ponto
  // O Leaflet dispara 'contextmenu' em long press no mobile
  var marcadorBusca = null;
  map.on('contextmenu', function(e) {
    // Marca visualmente o ponto da busca com um pin cinza temporário
    if (marcadorBusca) map.removeLayer(marcadorBusca);
    marcadorBusca = L.circleMarker([e.latlng.lat, e.latlng.lng], {
      radius: 10,
      color: '#555',
      fillColor: '#999',
      fillOpacity: 0.5,
      weight: 2,
      dashArray: '4'
    }).addTo(map).bindPopup('🔍 Buscando paradas...').openPopup();

    window.ReactNativeWebView.postMessage(JSON.stringify({
      tipo: 'buscarAqui',
      latitude: e.latlng.lat,
      longitude: e.latlng.lng
    }));
  });

  // Camada de grupo para os marcadores de parada (facilita limpar e readicionar)
  var camadaParadas = L.layerGroup().addTo(map);

  function adicionarPins(paradas) {
    camadaParadas.clearLayers();
    paradas.forEach(function(p) {
      L.marker([p.latitude, p.longitude], { icon: iconeParada })
        .addTo(camadaParadas)
        .bindPopup('<b>' + p.nome + '</b><br>' + p.tipo)
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            tipo: 'selecionar',
            latitude: p.latitude,
            longitude: p.longitude,
            nome: p.nome
          }));
        });
    });
  }

  // Adiciona os pins iniciais (passados na geração do HTML)
  adicionarPins(${paradasJson});

  // Recebe comandos do React Native
  document.addEventListener('message', receberMensagem);
  window.addEventListener('message', receberMensagem);

  function receberMensagem(event) {
    try {
      var msg = JSON.parse(event.data);

      if (msg.tipo === 'centralizar') {
        map.setView([msg.latitude, msg.longitude], 16);
        circuloUsuario.setLatLng([msg.latitude, msg.longitude]);
      }

      if (msg.tipo === 'marcarDestino') {
        if (marcadorDestino) map.removeLayer(marcadorDestino);
        if (circuloDestino)  map.removeLayer(circuloDestino);

        marcadorDestino = L.marker([msg.latitude, msg.longitude], { icon: iconeDestino })
          .addTo(map)
          .bindPopup(msg.nome || 'Destino selecionado')
          .openPopup();

        circuloDestino = L.circle([msg.latitude, msg.longitude], {
          radius: msg.raio,
          color: '#e8710a',
          fillColor: '#e8710a',
          fillOpacity: 0.12,
          weight: 2
        }).addTo(map);
      }

      // Recebe novas paradas do React Native e atualiza os pins sem recarregar o mapa
      if (msg.tipo === 'atualizarParadas') {
        adicionarPins(msg.paradas);
        // Remove o marcador de busca após receber os resultados
        if (marcadorBusca) { map.removeLayer(marcadorBusca); marcadorBusca = null; }
      }
    } catch(e) {}
  }
</script>
</body>
</html>`;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TelaMapa({ onConfirmarLocal, alertaEditando }) {
  const webviewRef = useRef(null);

  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [paradas, setParadas] = useState([]);
  const [carregandoMapa, setCarregandoMapa] = useState(true);
  const [carregandoParadas, setCarregandoParadas] = useState(false);
  const [htmlMapa, setHtmlMapa] = useState("");

  const [nome, setNome] = useState("");
  const [raio, setRaio] = useState("200");

  const buscandoRef = useRef(false);

  // Pré-preenche ao editar
  useEffect(() => {
    if (alertaEditando) {
      setNome(alertaEditando.nome);
      setRaio(String(alertaEditando.raio));
      const coord = {
        latitude: alertaEditando.latitude,
        longitude: alertaEditando.longitude,
      };
      setPontoSelecionado(coord);
      enviarMensagem({
        tipo: "marcarDestino",
        ...coord,
        nome: alertaEditando.nome,
        raio: alertaEditando.raio,
      });
    }
  }, [alertaEditando]);

  // Ao montar: pede GPS, gera HTML inicial e busca paradas
  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setPosicaoUsuario(coord);

      // Gera o HTML com a posição real — paradas serão adicionadas depois
      setHtmlMapa(gerarHtmlMapa(coord.latitude, coord.longitude, []));

      // Busca paradas próximas
      buscarParadas(coord.latitude, coord.longitude);
    } catch (err) {
      // GPS indisponível — usa Brasília como fallback
      console.warn("GPS indisponível:", err.message);
      setHtmlMapa(gerarHtmlMapa(-15.7801, -47.9292, []));
    }
  }

  async function buscarParadas(lat, lon) {
    if (buscandoRef.current) return;
    buscandoRef.current = true;
    setCarregandoParadas(true);
    try {
      const resultado = await buscarParadasProximas(lat, lon, 800);
      setParadas(resultado);
      // Regenera o HTML com as paradas agora disponíveis
      setHtmlMapa(gerarHtmlMapa(lat, lon, resultado));
    } catch (e) {
      console.warn("Erro Overpass:", e.message);
    } finally {
      setCarregandoParadas(false);
      buscandoRef.current = false;
    }
  }

  // Envia mensagem para o JavaScript dentro do WebView
  function enviarMensagem(obj) {
    webviewRef.current?.injectJavaScript(
      `(function(){ 
        var ev = new MessageEvent('message', { data: JSON.stringify(${JSON.stringify(obj)}) });
        window.dispatchEvent(ev);
      })()`,
    );
  }

  // Recebe mensagens do JavaScript (toque simples ou long press no mapa)
  function aoReceberMensagemWebView(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      // Toque simples: seleciona o ponto como destino
      if (msg.tipo === "selecionar") {
        const coord = { latitude: msg.latitude, longitude: msg.longitude };
        setPontoSelecionado(coord);
        if (msg.nome) setNome(msg.nome);
        const raioNum = parseInt(raio, 10) || 200;
        enviarMensagem({
          tipo: "marcarDestino",
          ...coord,
          nome: msg.nome || "",
          raio: raioNum,
        });
      }

      // Long press: busca paradas próximas ao ponto pressionado
      if (msg.tipo === "buscarAqui") {
        buscarParadasNoLocal(msg.latitude, msg.longitude);
      }
    } catch (e) {}
  }

  // Busca paradas numa coordenada arbitrária (disparada por long press)
  async function buscarParadasNoLocal(lat, lon) {
    if (buscandoRef.current) return;
    buscandoRef.current = true;
    setCarregandoParadas(true);
    try {
      const resultado = await buscarParadasProximas(lat, lon, 800);
      setParadas(resultado);
      // Envia os novos pins para o Leaflet sem recarregar o mapa inteiro
      enviarMensagem({ tipo: "atualizarParadas", paradas: resultado });
    } catch (e) {
      console.warn("Erro ao buscar paradas no local:", e.message);
    } finally {
      setCarregandoParadas(false);
      buscandoRef.current = false;
    }
  }

  function centralizarUsuario() {
    if (posicaoUsuario) {
      enviarMensagem({ tipo: "centralizar", ...posicaoUsuario });
    } else {
      Alert.alert("GPS", "Localização ainda não disponível.");
    }
  }

  // Atualiza o círculo no mapa quando o raio muda
  function aoMudarRaio(valor) {
    setRaio(valor);
    if (pontoSelecionado) {
      const raioNum = parseInt(valor, 10) || 200;
      enviarMensagem({
        tipo: "marcarDestino",
        ...pontoSelecionado,
        nome: nome,
        raio: raioNum,
      });
    }
  }

  function confirmar() {
    if (!pontoSelecionado) {
      Alert.alert("Atenção", "Toque no mapa para escolher um local.");
      return;
    }
    if (!nome.trim()) {
      Alert.alert("Atenção", "Dê um nome para este alerta.");
      return;
    }
    const raioNum = parseInt(raio, 10);
    if (isNaN(raioNum) || raioNum < 50 || raioNum > 5000) {
      Alert.alert("Atenção", "O raio deve ser entre 50 e 5000 metros.");
      return;
    }
    onConfirmarLocal({
      id: alertaEditando ? alertaEditando.id : Date.now().toString(),
      nome: nome.trim(),
      latitude: pontoSelecionado.latitude,
      longitude: pontoSelecionado.longitude,
      raio: raioNum,
      ativo: true,
    });
    setPontoSelecionado(null);
    setNome("");
    setRaio("200");
  }

  return (
    <View style={styles.container}>
      {/* ── WebView com Leaflet ── */}
      <View style={styles.mapaContainer}>
        {htmlMapa ? (
          <WebView
            ref={webviewRef}
            style={styles.mapa}
            source={{ html: htmlMapa }}
            onLoadEnd={() => setCarregandoMapa(false)}
            onMessage={aoReceberMensagemWebView}
            javaScriptEnabled
            domStorageEnabled
            // Permite carregar recursos externos (tiles OSM, Leaflet CDN)
            mixedContentMode="always"
            originWhitelist={["*"]}
          />
        ) : (
          <View style={styles.carregandoMapa}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.carregandoTexto}>Obtendo localização...</Text>
          </View>
        )}

        {/* Overlay de carregamento do mapa */}
        {htmlMapa && carregandoMapa && (
          <View style={styles.overlayCarregando}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.carregandoTexto}>Carregando mapa...</Text>
          </View>
        )}

        {/* Botão centralizar */}
        <TouchableOpacity
          style={styles.btnCentralizar}
          onPress={centralizarUsuario}
        >
          <Text style={styles.btnCentralizarTexto}> <Entypo name="location-pin" size={24} color="red" /> </Text>
        </TouchableOpacity>

        {/* Badge paradas */}
        {carregandoParadas ? (
          <View style={styles.badge}>
            <ActivityIndicator size="small" color="#1a73e8" />
            <Text style={styles.badgeTexto}> Buscando paradas...</Text>
          </View>
        ) : paradas.length > 0 ? (
          <View style={[styles.badge, styles.badgeInfo]}>
            <Text style={[styles.badgeTexto, { color: "#fff" }]}>
              <FontAwesome name="bus" size={20} color="#e9d739" /> {paradas.length} paradas na área
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Painel inferior ── */}
      <View style={styles.painel}>
        <Text style={styles.instrucao}>
          {pontoSelecionado
            ? "✅ Selecionado! Preencha e salve."
            : "👆 Toque no mapa ou num pin azul"}
        </Text>

        {pontoSelecionado && (
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Nome do alerta</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Ponto da Av. Paulista"
              maxLength={60}
            />

            <Text style={styles.label}>Raio de alerta (metros)</Text>
            <TextInput
              style={styles.input}
              value={raio}
              onChangeText={aoMudarRaio}
              keyboardType="numeric"
              placeholder="200"
            />

            <Text style={styles.coordTexto}>
              📌 {pontoSelecionado.latitude.toFixed(5)},{" "}
              {pontoSelecionado.longitude.toFixed(5)}
            </Text>

            <TouchableOpacity style={styles.btnSalvar} onPress={confirmar}>
              <Text style={styles.btnSalvarTexto}>
                {alertaEditando ? "Salvar edição" : "Salvar alerta"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
