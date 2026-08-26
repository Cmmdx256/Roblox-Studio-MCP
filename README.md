# ⚡ Universal Roblox AI Studio — Autonomous Multi-Mode Capability MCP Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Roblox Luau](https://img.shields.io/badge/Roblox-Luau-00A2FF.svg)](https://luau-lang.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-green.svg)](https://modelcontextprotocol.io/)
[![Architecture](https://img.shields.io/badge/Architecture-11%20Specialized%20Providers-purple.svg)](#-mimari-ve-11-özel-sağlayıcı-provider)
[![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-brightgreen.svg)](#-test-ve-doğrulama)

> **Universal Roblox AI Studio**, Roblox Studio'yu harici yapay zeka kodlama asistanları (Claude Desktop, Cursor, Antigravity, VS Code vb.) için **AI-Native, otonom ve çift yönlü bir geliştirme platformuna** dönüştüren yeni nesil Model Context Protocol (MCP) çalışma zamanıdır.

---

## 📖 İçindekiler

- [🌟 Temel Özellikler](#-temel-özellikler)
- [🏛️ Mimari ve 11 Özel Sağlayıcı (Provider)](#️-mimari-ve-11-özel-sağlayıcı-provider)
- [🧱 Hiyerarşi & Bileşen Öncelikli İnşa ("+ İşareti" Paradigması)](#-hiyerarşi--bileşen-öncelikli-inşa--işareti-paradigması)
- [🛡️ Kısıtlı ve Resmi MCP Yönlendirme Ağacı (Restricted Taxonomy)](#️-kısıtlı-ve-resmi-mcp-yönlendirme-ağacı-restricted-taxonomy)
- [🧠 Kendi Kendini Onaran Teşhis Motoru (Self-Healing Diagnostics)](#-kendi-kendini-onaran-teşhis-motoru-self-healing-diagnostics)
- [🛠️ Kapsamlı MCP Araç Listesi (63+ Tools)](#️-kapsamlı-mcp-araç-listesi-63-tools)
- [🚀 Hızlı Kurulum & Başlangıç](#-hızlı-kurulum--başlangıç)
- [🤖 AI İstemci Yapılandırmaları (Claude Desktop / Cursor)](#-ai-istemci-yapılandırmaları-claude-desktop--cursor)
- [📊 Canlı Telemetri ve Studio Arayüzü](#-canlı-telemetri-ve-studio-arayüzü)
- [🧪 Test ve Doğrulama](#-test-ve-doğrulama)

---

## 🌟 Temel Özellikler

1. **63+ Birinci Sınıf Evrensel MCP Aracı**: DataModel hiyerarşisi, Instance yaşam döngüsü, Luau script yönetimi, PBR materyal, Voxel Terrain, Playtest simülasyonu, 3D Generative AI ve Sanal Donanım girdisi.
2. **Resmi Roblox Studio MCP (`StudioMCP.exe`) Yerel Entegrasyonu**: Roblox'un kendi resmi MCP istemcisi (`%LOCALAPPDATA%\Roblox\Versions\...\StudioMCP.exe` ve `mcp.bat`) otomatik keşfedilir ve kısıtlı 3D/Asset/Playtest komutları doğrudan resmi motora yönlendirilir.
3. **Bileşen & Hiyerarşi Öncelikli İnşa (`VisualConstructionEngine`)**: Her şeyi devasa scriptlerle üretmek yerine, Studio Explorer'daki `+` (Insert Object) mantığıyla katman katman fiziksel nesneler, kısıtlar (`Constraints`), ışıklar, parçacıklar ve sesler oluşturur.
4. **Gelişmiş Animasyon & Donanım Kalibrasyonu (`AnimationAuthoringEngine`)**: R15/R6 rig pozlama (`Motor6D`), eklem güvenliği, KeyframeSequence oluşturma ve aletlerin karakterin elinde doğru durmasını sağlayan `Tool.Grip` kalibrasyonu.
5. **Kendi Kendini Onaran Hata Teşhisi (`DiagnosticsEngine`)**: Luau motor hatalarını (`C0 is read only`, `attempt to index nil`, `HttpDisabled` vb.) anında analiz eder, AI asistanına hazır düzeltme kodu (`suggestedFix`) ve tavsiye sunar.
6. **4 Kademeli Dinamik Yetenek Çözümleme (`UniversalCapabilityEngine`)**: Bir komut doğrudan araçla, iş akışı şablonuyla, derlenmiş primitiflerle ya da otonom planlayıcıyla çözümlenir.
7. **Çift Yönlü Güvenli HTTP/HTTPS Köprüsü**: Studio eklentisi ile Node.js sunucusu arasında anlık olay dinleme (`LogService`, hatalar, seçim değişiklikleri) ve `ChangeHistoryService` Undo/Redo (`Ctrl+Z`) güvenliği.

---

## 🏛️ Mimari ve 11 Özel Sağlayıcı (Provider)

Universal Roblox MCP, tek bir statik araç listesi yerine **11 uzmanlaşmış sağlayıcı** (`IProvider`) ve bir **Merkezi Yetenek Yönlendiricisi (`CapabilityRouter`)** üzerinden çalışır:

```
                      ┌────────────────────────────────────────────────────────┐
                      │             AI Client (Claude / Cursor)                │
                      └──────────────────────────┬─────────────────────────────┘
                                                 │ MCP (JSON-RPC)
                                                 ▼
                      ┌────────────────────────────────────────────────────────┐
                      │         Universal Roblox Studio MCP Router             │
                      │           (UniversalCapabilityEngine)                  │
                      └───────┬──────────────────┬───────────────────┬─────────┘
                              │                  │                   │
         ┌────────────────────┴───┐     ┌────────┴────────┐   ┌──────┴────────────────┐
         │ 1. Embedded Plugin     │     │ 2. Official MCP │   │ 3-11. Specialized     │
         │    (HTTP/HTTPS Bridge) │     │ (StudioMCP.exe) │   │       Domain Engines  │
         └────────────┬───────────┘     └────────┬────────┘   └──────┬────────────────┘
                      │                          │                   │
                      │ Polling RPC              │ Stdio / WS        │ Logic & Templates
                      ▼                          ▼                   ▼
    ┌──────────────────────────────────────────────────────────────────────────────────┐
    │                               Roblox Studio Session                              │
    │  • DataModel Tree    • Luau ScriptEditor    • Viewport Framebuffer  • Simulation │
    └──────────────────────────────────────────────────────────────────────────────────┘
```

### 11 Sağlayıcı Katmanı:
1. **`EmbeddedPluginProvider`**: Roblox Studio içindeki yerel eklenti ile haberleşerek 36 temel primitifi yönetir.
2. **`OfficialRobloxMCPProvider`**: Roblox'un resmi `StudioMCP.exe` ikili dosyasına bağlanarak kısıtlı 3D, Asset ve Playtest komutlarını yürütür.
3. **`ModelingProvider`**: 3D mesh, PBR materyal ve prosedürel parça montajlarını koordine eder.
4. **`AnimationProvider`**: Animasyon parçalarını, oynatıcı kontrollerini ve rig pozlarını yönetir.
5. **`LuauProvider`**: Luau statik analizi, sözdizimi doğrulaması ve güvenli kod çalıştırmasını sağlar.
6. **`WorkflowProvider`**: Kompozit oyun sistemlerini (Gece/Gündüz, Leaderstats, Ada Üreticisi vb.) şablonlar halinde uygular.
7. **`AssetProvider`**: Creator Store ve Cloud envanterinden model, ses ve görsel varlıkları çeker/ekler.
8. **`TestingProvider`**: Otomatik senaryo testleri, sanal klavye/fare girdileri ve doğrulama süreçlerini yönetir.
9. **`DiagnosticsProvider`**: Studio çıktılarını izler, kök neden analizi yapar ve güvenli onarımlar önerir.
10. **`ObservationProvider`**: Viewport ekran yakalama ve görsel incelemeyi yönetir.
11. **`DesignProvider`**: Mekansal estetik, renk uyumu ve tasarım kurallarını denetler.

---

## 🧱 Hiyerarşi & Bileşen Öncelikli İnşa ("+ İşareti" Paradigması)

Roblox Studio'da deneyimli bir geliştirici her şeyi tek bir devasa Luau scriptiyle prosedürel olarak üretmez. Bunun yerine **Bileşen & Hiyerarşi Tabanlı (Component-Driven)** geliştirme yapar. Sistemimiz nesneleri 5 aşamalı endüstri standardı katmanla oluşturur:

```
[Katman 1: Mekansal İskelet]  ───▶ Model / Folder / Frame / Parts / Meshes / PrimaryPart
            ↓
[Katman 2: Görsel & Duyusal]  ───▶ PBR Materials / PointLight / Particles / Sounds / SurfaceGui
            ↓
[Katman 3: Etkileşim & Fizik] ───▶ ProximityPrompt / HingeConstraint / WeldConstraint / Attachments
            ↓
[Katman 4: Animasyon & Donanım]──▶ KeyframeSequence / Motor6D Poses / Tool Grip Calibration
            ↓
[Katman 5: Ayrık Mantık]      ───▶ Sadece sinyalleri dinleyen hafif ve modüler Luau Controller
```

### Hazır Bileşen Şablonları (`component_compose`):
- **`interactive_door`**: Ahşap kasa (`Frame`), menteşe (`HingePart`), kapı paneli (`DoorPanel`), `ProximityPrompt`, açılma sesi (`Sound`), `TweenService` kontrolcüsü ve özel `Attributes` (`IsOpen`, `OpenAngle`).
- **`collectible_coin`**: Dönen silindir coin, metal materyal, altın `PointLight`, `Sparkles`, toplama sesi ve `CollectionService` etiketi.
- **`equippable_weapon`**: Kalibre edilmiş `Tool.Grip`, `RightGripAttachment`, `Handle`, savurma sesi, vuruş izi (`Trail`) ve aktivasyon scripti.
- **`interactive_chest`**: Sabit sandık gövdesi, açılır kapak (`ChestLid`), `HingeConstraint`, `ProximityPrompt`, altın ışıltısı ve `LootTable` öznitelikleri.
- **`streetlamp_fixture`**: Metal direk, cam lamba başlığı, `PointLight`, `SpotLight`, Neon materyal ve Gece/Gündüz otomatik ışık sensörü.
- **`teleporter_pad`**: Işınlanma platformu, parçacık ışını (`ParticleEmitter` & `Beam`), teleport sesi ve hedef koordinatları.
- **`dialogue_npc`**: Pozlanmış R15/R6 karakteri, `BillboardGui` isim etiketi, diyalog `ProximityPrompt`'u ve konuşma ağacı.

---

## 🛡️ Kısıtlı ve Resmi MCP Yönlendirme Ağacı (Restricted Taxonomy)

Roblox motoru 3. taraf eklentiler için güvenlik gereği bazı API'leri (`RobloxSecurity`, `RobloxScriptSecurity`, `SensitiveInput`, `Capture`) kısıtlar. Sistemimiz bu kısıtlamaları **`RestrictedCapabilityRegistry`** üzerinden otomatik tanır ve doğrudan resmi **`StudioMCP.exe`** proxy'sine yönlendirir:

```
RESTRICTED / OFFICIAL-ONLY (12 Kategori)
├── 1. RobloxSecurity                   ──▶ official-roblox-mcp (execute_luau / search_game_tree)
├── 2. RobloxScriptSecurity             ──▶ official-roblox-mcp (script_grep / execute_luau)
├── 3. Internal Studio APIs             ──▶ official-roblox-mcp (get_studio_state, list_roblox_studios)
├── 4. Internal Engine APIs             ──▶ official-roblox-mcp (generate_mesh / get_console_output)
├── 5. Internal Plugin APIs             ──▶ official-roblox-mcp (internal plugin manager)
├── 6. Protected Debug APIs             ──▶ official-roblox-mcp (get_console_output)
├── 7. Protected Studio Control APIs    ──▶ official-roblox-mcp (start_stop_play [Play/Run/Stop])
├── 8. Missing Sandbox Capabilities     ──▶ official-roblox-mcp (screen_capture, keyboard/mouse input)
├── 9. Restricted Asset APIs            ──▶ official-roblox-mcp (generate_mesh, generate_material, search_asset)
├── 10. Restricted HTTP APIs            ──▶ official-roblox-mcp (Cloud Auth HTTP)
├── 11. Internal Network APIs           ──▶ official-roblox-mcp (Replication diagnostics)
└── 12. Provider-Specific Capabilities  ──▶ official-roblox-mcp (subagent, execute_luau)
```

---

## 🧠 Kendi Kendini Onaran Teşhis Motoru (Self-Healing Diagnostics)

Yapay zeka modelleri kod çalıştırırken yaygın Roblox API hatalarına takılabilir. `DiagnosticsEngine` bu hataları yakalar ve yapay zekaya doğrudan çalışır çözüm üretir:

| Karşılaşılan Hata | Kök Neden | Otomatik Teşhis ve Çözüm |
| :--- | :--- | :--- |
| `Unable to assign property C0. Property is read only` | R15 eklemi (`RightShoulder`) `RightUpperArm` altında değil `UpperTorso` altındadır veya nesne `Motor6D` değildir. | Otomatik olarak `dummy.UpperTorso:FindFirstChild("RightShoulder")` ve `motor:IsA("Motor6D")` kontrolü önerir. |
| `attempt to index nil with '...'` | Dinamik nesne henüz yüklenmemiştir. | `:FindFirstChild()` veya `:WaitForChild()` koruma blokları üretir. |
| `The current identity (...) cannot ...` | İşlem `RobloxScriptSecurity` gerektirir. | İsteği resmi MCP `StudioMCP.exe` aracına yönlendirir. |
| `HTTP requests are not enabled` | `HttpService` kapalıdır. | Studio Game Settings üzerinden HTTP izninin açılması gerektiğini bildirir. |

---

## 🛠️ Kapsamlı MCP Araç Listesi (63+ Tools)

### 1. Görsel İnşa & Animasyon Araçları
- **`component_compose`**: Hazır şablonlarla eksiksiz bileşen (kapı, sandık, coin, NPC vb.) inşa eder.
- **`component_template_list`**: Kullanılabilir tüm bileşen şablonlarını ve hiyerarşi ağaçlarını listeler.
- **`hierarchy_scaffold`**: Studio projesini profesyonel endüstri standartlarında klasörlere ayırır.
- **`tool_grip_calibrate`**: Silah ve eşyaların karakter elindeki tutuş açılarını (`Tool.Grip`) otomatik kalibre eder.
- **`rig_pose_and_animate`**: R15/R6 karakter eklemlerini (`Motor6D`) güvenli bir şekilde pozlar.

### 2. Resmi Roblox MCP Araçları (`StudioMCP.exe` Entegre)
- **`generate_mesh`**: Doğal dil isteminden Roblox Cloud AI 3D Mesh üretir.
- **`generate_material`**: Doğal dil isteminden PBR materyal ve doku üretir.
- **`generate_procedural_model`**: Prosedürel parça montajı oluşturur.
- **`search_asset` & `insert_asset`**: Creator Store ve Cloud kütüphanesinden varlık arar ve yerleştirir.
- **`screen_capture`**: Studio 3D Viewport'undan yüksek çözünürlüklü ekran görüntüsü alır.
- **`start_stop_play`**: Oyunu fiziksel olarak başlatır (`Play`/`Run`) veya düzenleme moduna döner (`Stop`).
- **`get_studio_state`**: Studio oturumunu, açık belgeyi ve aktif simülasyon modunu sorgular.
- **`list_roblox_studios` & `set_active_studio`**: Çalışan Studio pencerelerini listeler ve aktif olanı seçer.
- **`character_navigation`**: Simülasyon esnasında karakteri 3D dünya koordinatına hareket ettirir.
- **`user_keyboard_input` & `user_mouse_input`**: Simülasyona donanım seviyesinde tuş ve fare tıklaması enjekte eder.
- **`script_read`, `multi_edit`, `script_search`, `script_grep`**: Studio Script Editor'ü üzerinden yerel çoklu dosya düzenleme ve arama.
- **`subagent` & `execute_luau`**: Roblox'un yerel alt ajanını ve Luau kod yürütme motorunu çalıştırır.

### 3. Temel DataModel & Primitif Araçları
- **`studio_info`, `studio_get_tree`, `studio_search`, `studio_inspect`**: DataModel hiyerarşi taraması ve derin özellik denetimi.
- **`instance_create`, `instance_delete`, `instance_clone`, `instance_reparent`, `instance_rename`, `instance_move`**: Nesne yaşam döngüsü ve 3D konumlandırma.
- **`property_get`, `property_set`, `property_get_all`**: Otomatik Luau tip dönüşümlü özellik okuma/yazma.
- **`attribute_get`, `attribute_set`, `attribute_delete`, `attribute_get_all`**: Öznitelik (Attribute) yönetimi.
- **`script_get_source`, `script_set_source`, `script_patch_source`, `script_search_code`**: Script kaynağı okuma, satır bazlı yama ve kod araması.
- **`selection_get`, `selection_set`, `selection_add`, `selection_clear`**: Studio Explorer seçim kontrolü.
- **`output_get`, `output_get_errors`, `output_clear`**: Çıktı günlüğü ve hata yakalama.
- **`terrain_fill_block`, `terrain_fill_ball`, `terrain_clear`**: Voxel Terrain oluşturma ve temizleme.
- **`batch_execute`**: Tek işlemde atomik çoklu komut çalıştırma (`Undo/Redo` waypoint destekli).

---

## 🚀 Hızlı Kurulum & Başlangıç

### 1. Gereksinimler
- **Node.js**: v18.0.0 veya üzeri (v20+ / v24 önerilir).
- **Roblox Studio**: Windows veya macOS üzerinde kurulu.

### 2. Depoyu Klonlama ve Derleme
```bash
git clone <repo-url>
cd Stdiomcp
npm install
npm run build
```

### 3. Roblox Studio Eklentisini Yükleme
Eklentiyi iki yöntemden biriyle yükleyebilirsiniz:

#### Yöntem A: Hazır Eklenti Dosyasını Kopyalama (Önerilen)
`npm run bundle:plugin` ve `node scripts/build-rbxmx.js` komutlarını çalıştırın (veya derlenmiş dosyaları kopyalayın):
- **Windows**: `plugin-build\RobloxUniversalMCP.rbxmx` dosyasını `%LOCALAPPDATA%\Roblox\Plugins\` dizinine kopyalayın.
- **macOS**: `plugin-build/RobloxUniversalMCP.rbxmx` dosyasını `~/Library/Application Support/Roblox/Plugins/` dizinine kopyalayın.

#### Yöntem B: Studio İçinde Manuel Kurulum
1. Roblox Studio'da herhangi bir Place açın.
2. `plugin-build/RobloxUniversalMCP.luau` dosyasının içeriğini bir Script içine yapıştırın.
3. Script'e sağ tıklayıp **"Save as Local Plugin..."** seçeneğini seçin.
4. **Home > Game Settings > Security** bölümünden **"Allow HTTP Requests"** seçeneğini aktif hale getirin.

---

## 🤖 AI İstemci Yapılandırmaları (Claude Desktop / Cursor)

### Claude Desktop (`claude_desktop_config.json`)
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "roblox-universal-studio": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\Theso\\Desktop\\roblox_sc\\Stdiomcp\\dist\\index.js"
      ]
    }
  }
}
```

### Cursor / VS Code (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "roblox-universal-studio": {
      "command": "node",
      "args": [
        "C:/Users/Theso/Desktop/roblox_sc/Stdiomcp/dist/index.js"
      ]
    }
  }
}
```

---

## 📊 Canlı Telemetri ve Studio Arayüzü

Eklenti yüklendiğinde Roblox Studio içinde özel bir **DockWidget (DiagnosticsView)** açılır:

- **Plugin Runtime**: `ONLINE` / `STANDALONE`
- **MCP Bridge**: `CONNECTED` (Yeşil) / `DISCONNECTED` (Kırmızı)
- **Capabilities Discovered**: **80+ Live Capabilities** (Tüm sağlayıcılar ve alt sistemler)
- **Low-Level Tools**: **57 Primitive Tools**
- **High-Level Workflows**: **19 Composite Workflows**
- **Total Universal Tools**: **76 Universal Tools**
- **Active Mode**: `CHAT` | `OBSERVE` | `BUILD` | `PLAYTEST` | `AUTONOMOUS`

---

## 🧪 Test ve Doğrulama

Tüm test paketini çalıştırmak için:
```bash
npm test
```

Test çıktısı:
```text
✔ Tool Registry contains all universal tools
✔ HTTP Bridge Status returns disconnected when no session is active
✔ HTTP Bridge Handshake registers studio session
✔ Executing a command dispatches over polling RPC and resolves with response
✔ 11 Providers are registered and operational in ProviderRegistry
✔ Universal Capability Engine resolves across 4-tier hierarchy
✔ MultiModeEngine handles operating mode transitions and permissions
✔ Live Dashboard endpoint returns comprehensive real-time telemetry
✔ Visual Construction Engine lists rich archetypes and templates
✔ Animation Authoring Engine calibrates tool grips and keyframe sequences
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** altında lisanslanmıştır. Roblox Studio ile AI-native oyun geliştirme deneyiminin keyfini çıkarın! 🎮⚡

