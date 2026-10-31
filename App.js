import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import TelaMapa from "./screens/TelaMapa";
import TelaAlertas from "./screens/TelaAlertas";
import * as DbService from "./services/dbService";
import { calcularDistancia } from "./services/geoUtils";
import { stylesApp as styles } from "./styles";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [telaAtiva, setTelaAtiva] = useState("mapa");
  const [alertas, setAlertas] = useState([]);
  const [posicaoAtual, setPosicaoAtual] = useState(null);
  const [monitorando, setMonitorando] = useState(false);
  const [alertaEditando, setAlertaEditando] = useState(null);
  const intervalRef = useRef(null);
  const jaAlertadosRef = useRef(new Set());

  useEffect(() => {
    async function iniciar() {
      await DbService.inicializarBanco();
      await carregarAlertas();
      await solicitarPermissoes();
    }
    iniciar();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function solicitarPermissoes() {
    const { status: statusLoc } =
      await Location.requestForegroundPermissionsAsync();
    if (statusLoc !== "granted") {
      Alert.alert(
        "Permissão negada",
        "O AlertaGeo precisa de acesso à localização para funcionar.",
      );
      return;
    }
    const { status: statusNotif } =
      await Notifications.requestPermissionsAsync();
    if (statusNotif !== "granted") {
      Alert.alert(
        "Atenção",
        "Sem permissão de notificações, os alertas não aparecerão na barra.",
      );
    }
  }

  async function carregarAlertas() {
    try {
      setAlertas(await DbService.listarAlertas());
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os alertas: " + e.message);
    }
  }

  async function aoConfirmarLocal(novoAlerta) {
    try {
      if (alertaEditando && alertaEditando.id === novoAlerta.id) {
        await DbService.atualizarAlerta(novoAlerta);
      } else {
        await DbService.inserirAlerta(novoAlerta);
      }
      setAlertaEditando(null);
      await carregarAlertas();
      setTelaAtiva("alertas");
      Alert.alert(
        "✅ Alerta salvo!",
        `"${novoAlerta.nome}" foi salvo com sucesso.`,
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar: " + e.message);
    }
  }

  async function aoToggleAtivo(id, novoValor) {
    try {
      await DbService.alternarAtivo(id, novoValor);
      setAlertas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ativo: novoValor } : a)),
      );
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }

  async function aoExcluir(id) {
    try {
      await DbService.excluirAlerta(id);
      jaAlertadosRef.current.delete(id);
      await carregarAlertas();
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }

  function aoEditar(alerta) {
    setAlertaEditando(alerta);
    setTelaAtiva("mapa");
  }

  async function iniciarMonitoramento() {
    setMonitorando(true);
    await verificarProximidade();
    intervalRef.current = setInterval(verificarProximidade, 5000);
  }

  function pararMonitoramento() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setMonitorando(false);
    setPosicaoAtual(null);
    jaAlertadosRef.current.clear();
  }

  async function verificarProximidade() {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setPosicaoAtual(coord);

      const lista = await DbService.listarAlertas();
      setAlertas(lista);

      for (const alerta of lista) {
        if (!alerta.ativo) continue;
        const dist = calcularDistancia(
          coord.latitude,
          coord.longitude,
          alerta.latitude,
          alerta.longitude,
        );
        if (dist <= alerta.raio) {
          if (!jaAlertadosRef.current.has(alerta.id)) {
            jaAlertadosRef.current.add(alerta.id);
            await dispararNotificacao(alerta, dist);
          }
        } else {
          jaAlertadosRef.current.delete(alerta.id);
        }
      }
    } catch (err) {
      console.warn("Erro ao verificar proximidade:", err.message);
    }
  }

  async function dispararNotificacao(alerta, distanciaMetros) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Chegando no destino!",
        body: `Você está a ${Math.round(distanciaMetros)} m de "${alerta.nome}"`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  function calcularDistanciaAlerta(alerta) {
    if (!posicaoAtual) return null;
    return calcularDistancia(
      posicaoAtual.latitude,
      posicaoAtual.longitude,
      alerta.latitude,
      alerta.longitude,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitulo}><MaterialCommunityIcons name="map-marker" size={30} color="rgb(250, 79, 79)" /> AlertaGeo</Text>
        <Text style={styles.headerSubtitulo}>
          Alerta de proximidade de destino
        </Text>
      </View>

      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, telaAtiva === "mapa" && styles.abaAtiva]}
          onPress={() => setTelaAtiva("mapa")}
        >
          <Text
            style={[
              styles.abaTexto,
              telaAtiva === "mapa" && styles.abaTextoAtivo,
            ]}
          >
            <MaterialCommunityIcons name="map-search" size={24} color="black" /> Mapa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, telaAtiva === "alertas" && styles.abaAtiva]}
          onPress={() => setTelaAtiva("alertas")}
        >
          <Text
            style={[
              styles.abaTexto,
              telaAtiva === "alertas" && styles.abaTextoAtivo,
            ]}
          >
            <MaterialCommunityIcons name="bell" size={24} color="black" /> Meus alertas {alertas.length > 0 ? `(${alertas.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conteudo}>
        {telaAtiva === "mapa" ? (
          <TelaMapa
            onConfirmarLocal={aoConfirmarLocal}
            alertaEditando={alertaEditando}
          />
        ) : (
          <TelaAlertas
            alertas={alertas}
            posicaoAtual={posicaoAtual}
            monitorando={monitorando}
            calcularDistanciaAlerta={calcularDistanciaAlerta}
            onToggleAtivo={aoToggleAtivo}
            onEditar={aoEditar}
            onExcluir={aoExcluir}
            onIniciarMonitoramento={iniciarMonitoramento}
            onPararMonitoramento={pararMonitoramento}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
