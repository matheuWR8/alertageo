
// Card de um alerta salvo na lista da tela de alertas

import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { formatarDistancia } from "../services/geoUtils";
import { stylesCard as styles, cores } from "../styles";

export default function AlertaCard({
  alerta,
  distancia,
  onToggleAtivo,
  onEditar,
  onExcluir,
}) {
  const estaProximo =
    distancia !== null && distancia !== undefined && distancia <= alerta.raio;

  return (
    <View style={[styles.card, estaProximo && styles.cardAlerta]}>
      <View style={styles.cabecalho}>
        <Text style={styles.nome} numberOfLines={1}>
          {alerta.nome}
        </Text>
        <Switch
          value={alerta.ativo}
          onValueChange={(val) => onToggleAtivo(alerta.id, val)}
          trackColor={{ false: "#ccc", true: cores.primario }}
          thumbColor={alerta.ativo ? cores.branco : "#f4f3f4"}
        />
      </View>

      <Text style={styles.info}>
        <MaterialCommunityIcons name="map-marker" size={20} color="red" /> {alerta.latitude.toFixed(5)}, {alerta.longitude.toFixed(5)}
      </Text>
      <Text style={styles.info}><MaterialCommunityIcons name="radius-outline" size={20} color="orange" /> Raio de alerta: {alerta.raio} m</Text>

      {distancia !== null && distancia !== undefined && (
        <Text style={[styles.distancia, estaProximo && styles.distanciaAlerta]}>
          {estaProximo
            ? `🔔 PERTO! ${formatarDistancia(distancia)}`
            : `🧭 ${formatarDistancia(distancia)} de distância`}
        </Text>
      )}

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar(alerta)}
        >
          <Text style={styles.textoBotao}><MaterialCommunityIcons name="circle-edit-outline" size={20} color="white" /> Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => onExcluir(alerta.id)}
        >
          <Text style={styles.textoBotao}><MaterialCommunityIcons name="trash-can-outline" size={20} color="white" /> Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
