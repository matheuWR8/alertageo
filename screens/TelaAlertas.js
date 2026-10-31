import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AlertaCard from "../components/AlertaCard";
import { stylesAlertas as styles } from "../styles";

export default function TelaAlertas({
  alertas,
  posicaoAtual,
  monitorando,
  calcularDistanciaAlerta,
  onToggleAtivo,
  onEditar,
  onExcluir,
  onIniciarMonitoramento,
  onPararMonitoramento,
}) {
  function confirmarExclusao(id) {
    Alert.alert(
      "Remover alerta",
      "Tem certeza que deseja remover este alerta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => onExcluir(id) },
      ],
    );
  }

  const alertasAtivos = alertas.filter((a) => a.ativo).length;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusBar,
          monitorando ? styles.statusAtivo : styles.statusParado,
        ]}
      >
        <View style={styles.statusInfo}>
          <Text style={styles.statusIcone}>{monitorando ? <FontAwesome name="circle" size={24} color="green" /> : <FontAwesome name="circle" size={24} color="red" />}</Text>
          <View>
            <Text style={styles.statusTexto}>
              {monitorando ? "Monitoramento ativo" : "Monitoramento parado"}
            </Text>
            {posicaoAtual && (
              <Text style={styles.statusCoord}>
                {posicaoAtual.latitude.toFixed(5)},{" "}
                {posicaoAtual.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.botaoMonitorar, monitorando && styles.botaoParar]}
          onPress={monitorando ? onPararMonitoramento : onIniciarMonitoramento}
        >
          <Text style={styles.textoBotaoMonitorar}>
            {monitorando ? "⏹ Parar" : "▶ Iniciar"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumo}>
        <Text style={styles.resumoTexto}>
          {alertas.length === 0
            ? 'Nenhum alerta salvo. Use a aba "Mapa" para adicionar.'
            : `${alertas.length} alerta(s) salvo(s) · ${alertasAtivos} ativo(s)`}
        </Text>
      </View>

      <ScrollView
        style={styles.lista}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {alertas.map((alerta) => (
          <AlertaCard
            key={alerta.id}
            alerta={alerta}
            distancia={calcularDistanciaAlerta(alerta)}
            onToggleAtivo={onToggleAtivo}
            onEditar={onEditar}
            onExcluir={confirmarExclusao}
          />
        ))}
      </ScrollView>
    </View>
  );
}
