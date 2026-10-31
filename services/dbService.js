import * as SQLite from "expo-sqlite";

// Abre (ou cria) o banco de dados
async function getDb() {
  return await SQLite.openDatabaseAsync("alertaGeo.db");
}

// Cria a tabela de alertas salvos, caso não exista
export async function inicializarBanco() {
  const db = await getDb();
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS alertas (
        id        TEXT PRIMARY KEY,
        nome      TEXT NOT NULL,
        latitude  REAL NOT NULL,
        longitude REAL NOT NULL,
        raio      INTEGER NOT NULL DEFAULT 200,
        ativo     INTEGER NOT NULL DEFAULT 0
      );
    `);
  } finally {
    await db.closeAsync();
  }
}

// Retorna todos os alertas cadastrados
export async function listarAlertas() {
  const db = await getDb();
  try {
    const rows = await db.getAllAsync(
      "SELECT * FROM alertas ORDER BY nome ASC",
    );
    return rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      latitude: r.latitude,
      longitude: r.longitude,
      raio: r.raio,
      ativo: r.ativo === 1,
    }));
  } finally {
    await db.closeAsync();
  }
}

// Insere um novo alerta
export async function inserirAlerta(alerta) {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      "INSERT INTO alertas (id, nome, latitude, longitude, raio, ativo) VALUES (?,?,?,?,?,?)",
      [
        alerta.id,
        alerta.nome,
        alerta.latitude,
        alerta.longitude,
        alerta.raio,
        alerta.ativo ? 1 : 0,
      ],
    );
    return result.changes === 1;
  } finally {
    await db.closeAsync();
  }
}

// Atualiza um alerta existente
export async function atualizarAlerta(alerta) {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      "UPDATE alertas SET nome=?, latitude=?, longitude=?, raio=?, ativo=? WHERE id=?",
      [
        alerta.nome,
        alerta.latitude,
        alerta.longitude,
        alerta.raio,
        alerta.ativo ? 1 : 0,
        alerta.id,
      ],
    );
    return result.changes === 1;
  } finally {
    await db.closeAsync();
  }
}

// Alterna o campo "ativo" de um alerta (liga/desliga)
export async function alternarAtivo(id, novoValor) {
  const db = await getDb();
  try {
    await db.runAsync("UPDATE alertas SET ativo=? WHERE id=?", [
      novoValor ? 1 : 0,
      id,
    ]);
  } finally {
    await db.closeAsync();
  }
}

// Remove um alerta pelo ID
export async function excluirAlerta(id) {
  const db = await getDb();
  try {
    await db.runAsync("DELETE FROM alertas WHERE id=?", [id]);
  } finally {
    await db.closeAsync();
  }
}
