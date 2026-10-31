# AlertaGeo v2.1
**Alerta de proximidade de destino para transporte público**

Projeto React Native / Expo — atividade acadêmica

---

## 📱 Funcionalidades

- **Mapa interativo**: toque em qualquer ponto para selecionar um destino
- **Pins de transporte público**: paradas de ônibus, metrô, VLTs e estações via OpenStreetMap (API Overpass, sem cadastro)
- **Raio de alerta configurável**: círculo visual no mapa mostra a área
- **Notificação sonora**: disparada ao entrar no raio do destino
- **Persistência SQLite**: alertas salvos sobrevivem ao fechamento do app
- **Switch por alerta**: ative só os destinos relevantes para a viagem atual
- **Monitoramento GPS a cada 5 s**

---

## ⚙️ Pré-requisitos

- Node.js **20.x**
- Expo CLI: `npm install -g expo-cli`
- Android Studio (emulador) ou dispositivo físico com Expo Go

---

## 🔑 Chave do Google Maps (obrigatório para o mapa no Android)

O `react-native-maps` no Android **exige** uma chave da API do Google Maps.
Sem ela o mapa aparece em branco / cinza.

### Como obter a chave (gratuita para uso acadêmico):
1. Acesse https://console.cloud.google.com
2. Crie um projeto e ative a **Maps SDK for Android**
3. Em "Credenciais" → "Criar credencial" → "Chave de API"
4. Copie a chave gerada

### Como configurar no projeto:
Abra `app.json` e substitua `SUA_CHAVE_GOOGLE_MAPS_AQUI`:

```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSy...SUA_CHAVE_REAL_AQUI"
    }
  }
}
```

> **No Expo Go:** a chave não é necessária para testar com Expo Go no dispositivo físico,
> pois o app usa a chave embutida no Expo Go. Só é necessária em builds standalone (EAS Build).

---

## 🚀 Instalação e execução

```bash
# 1. Entre na pasta do projeto
cd alertaGeo

# 2. Instale as dependências
npm install

# 3. Inicie o Expo
npx expo start

# 4. Abra no Android
#    - Pressione 'a' no terminal (emulador Android Studio)
#    - Ou escaneie o QR com o app Expo Go (celular físico)
```

---

## 🗂️ Estrutura de arquivos

```
alertaGeo/
├── App.js                     # Raiz: GPS, notificações, navegação por abas
├── app.json                   # Config Expo + chave Google Maps + permissões Android
├── package.json
├── babel.config.js
├── services/
│   ├── dbService.js           # CRUD SQLite (expo-sqlite v14, API assíncrona)
│   ├── overpassService.js     # Busca paradas OSM via Overpass (GET sem encoding duplo)
│   └── geoUtils.js            # Fórmula de Haversine + formatação de distância
├── screens/
│   ├── TelaMapa.js            # Mapa interativo com PROVIDER_GOOGLE + seleção de destino
│   └── TelaAlertas.js         # Lista de alertas + controle do monitoramento GPS
└── components/
    └── AlertaCard.js          # Card com switch ativo/inativo + distância em tempo real
```

---

## 🐛 Bugs corrigidos nesta versão (v2.1)

| Bug | Causa | Correção |
|-----|-------|----------|
| Mapa em branco no Android | `PROVIDER_GOOGLE` ausente + sem chave no `app.json` | Adicionado `provider={PROVIDER_GOOGLE}` e campo `android.config.googleMaps` |
| Overpass retorna 406 | `encodeURIComponent` aplicado à query toda causava encoding duplo | Removido `encodeURIComponent`; body enviado como `data=<query_literal>` sem `Content-Type` |
| Sem fallback de mirror | Um único endpoint; se cair, sem paradas | Array de 3 mirrors; tenta em sequência |

---

## 📝 Observações acadêmicas

- A API Overpass é pública e gratuita; pode ter lentidão em horários de pico.
  O app trata falhas silenciosamente — o usuário ainda pode tocar no mapa livremente.
- O monitoramento usa `setInterval` de 5 s com `getCurrentPositionAsync` (foreground).
  Para background real seria necessário `expo-task-manager` + `startLocationUpdatesAsync`.
- A fórmula de Haversine calcula distância em linha reta, suficiente para o caso de uso.
