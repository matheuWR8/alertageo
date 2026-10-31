import { StyleSheet, StatusBar } from "react-native";

// ─── Paleta de cores ──────────────────────────────────────────────────────────
export const cores = {
  primario: "#1a73e8", // azul principal (header, botões, pins)
  primarioClaro: "#c8dcf9", // azul claro (subtítulo do header)
  primarioFundo: "#e8f0fe", // azul muito claro (fundo de carregamento)
  destaque: "#e8710a", // laranja (destino selecionado, alerta próximo)
  destaqueFundo: "#fff8f3", // laranja muito claro (fundo do card em alerta)
  perigo: "#c0392b", // vermelho (botão remover, botão parar)
  sucesso: "#217a3c", // verde escuro (botão iniciar monitoramento)
  sucessoFundo: "#e8f5e9", // verde claro (status ativo)
  perigoFundo: "#ffebee", // vermelho claro (status parado)
  fundo: "#f0f2f5", // cinza claro (fundo de telas)
  fundoPainel: "#f5f5f5", // cinza painel inferior do mapa
  branco: "#ffffff",
  textoPrincipal: "#1a1a1a",
  textoSecundario: "#555555",
  textoTerciario: "#888888",
  textoDesativo: "#666666",
  borda: "#dddddd",
  bordaClara: "#e0e0e0",
  bordaInput: "#cccccc",
};

// App.js
export const stylesApp = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.branco,
    paddingTop: StatusBar.currentHeight,
  },
  header: {
    backgroundColor: cores.primario,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: cores.branco,
  },
  headerSubtitulo: {
    fontSize: 12,
    color: cores.primarioClaro,
    marginTop: 2,
  },
  abas: {
    flexDirection: "row",
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  abaAtiva: {
    borderBottomWidth: 3,
    borderBottomColor: cores.primario,
  },
  abaTexto: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  abaTextoAtivo: {
    color: cores.primario,
    fontWeight: "700",
  },
  conteudo: {
    flex: 1,
  },
});

// TelaMapa.js
export const stylesMapa = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapaContainer: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  carregandoMapa: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: cores.primarioFundo,
  },
  overlayCarregando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  carregandoTexto: {
    marginTop: 10,
    color: "#444",
    fontSize: 14,
  },
  btnCentralizar: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: cores.branco,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  btnCentralizarTexto: {
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: cores.branco,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },
  badgeInfo: {
    backgroundColor: cores.primario,
  },
  badgeTexto: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  painel: {
    height: 190,
    backgroundColor: cores.fundoPainel,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  formulario: {
    flex: 1,
  },
  instrucao: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: cores.branco,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: cores.bordaInput,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
  },
  coordTexto: {
    fontSize: 10,
    color: cores.textoTerciario,
    marginTop: 4,
    textAlign: "center",
  },
  btnSalvar: {
    backgroundColor: cores.primario,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnSalvarTexto: {
    color: cores.branco,
    fontWeight: "bold",
    fontSize: 14,
  },
});

// TelaAlertas.js
export const stylesAlertas = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  statusAtivo: {
    backgroundColor: cores.sucessoFundo,
  },
  statusParado: {
    backgroundColor: cores.perigoFundo,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIcone: {
    fontSize: 20,
  },
  statusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  statusCoord: {
    fontSize: 11,
    color: cores.textoDesativo,
    marginTop: 2,
  },
  botaoMonitorar: {
    backgroundColor: cores.sucesso,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botaoParar: {
    backgroundColor: cores.perigo,
  },
  textoBotaoMonitorar: {
    color: cores.branco,
    fontWeight: "bold",
    fontSize: 13,
  },
  resumo: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaClara,
  },
  resumoTexto: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  lista: {
    flex: 1,
    padding: 14,
  },
});

// AlertaCard.js
export const stylesCard = StyleSheet.create({
  card: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: cores.primario,
    elevation: 2,
  },
  cardAlerta: {
    borderLeftColor: cores.destaque,
    backgroundColor: cores.destaqueFundo,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nome: {
    fontSize: 15,
    fontWeight: "bold",
    color: cores.textoPrincipal,
    flex: 1,
    marginRight: 8,
  },
  info: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginTop: 2,
  },
  distancia: {
    marginTop: 6,
    fontSize: 13,
    color: cores.primario,
    fontWeight: "500",
  },
  distanciaAlerta: {
    color: cores.destaque,
  },
  botoes: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  botaoEditar: {
    backgroundColor: cores.primario,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  botaoExcluir: {
    backgroundColor: cores.perigo,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textoBotao: {
    color: cores.branco,
    fontSize: 12,
    fontWeight: "600",
  },
});
