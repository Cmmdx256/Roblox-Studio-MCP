# Roblox UI Design & Component Engine

## 1. Structure-First UI Pipeline

To eliminate hallucinated GUI hierarchies, the UI Engine strictly enforces a 5-step construction pipeline:

$$\text{UI Specification} \longrightarrow \text{Structure} \longrightarrow \text{Style (Tokens)} \longrightarrow \text{Behavior} \longrightarrow \text{Animation} \longrightarrow \text{Visual Verification}$$

```
1. STRUCTURE: ScreenGui -> Background Frame -> Layout Containers (UIListLayout / UIGridLayout)
2. STYLE:     UICorner (radius tokens), UIStroke (border tokens), UIPadding, ColorPalette
3. BEHAVIOR:  LocalScript / Controller connecting Button.Activated -> Remotes / Client State
4. ANIMATION: TweenService (Hover scale 1.05, Click scale 0.95, Pop-in EasingStyle.Back)
5. VERIFY:    Geometric inspection (overlap, clipping, contrast ratio)
```

---

## 2. Intermediate UI Specification (DSL)

Instead of manually creating dozens of individual instances, the AI generates declarative UI specs:

```json
{
  "screenName": "InventoryGui",
  "theme": "dark_fantasy",
  "layout": "centered",
  "components": [
    {
      "type": "Panel",
      "id": "MainInventoryPanel",
      "props": { "Size": { "_type": "UDim2", "scaleX": 0, "offsetX": 500, "scaleY": 0, "offsetY": 380 } },
      "children": [
        { "type": "Button", "id": "CloseBtn", "label": "✕" },
        { "type": "ItemCard", "id": "SwordSlot", "title": "Excalibur" }
      ]
    }
  ]
}
```

The `UIDesignEngine` compiles this specification directly into Roblox instances with correct `AnchorPoint` (0.5, 0.5), responsive `UDim2` scaling, and design tokens.

---

## 3. Built-In Design Token Themes

| Theme ID | Palette Description | Typography | Default Radius | Animation Feel |
|---|---|---|---|---|
| `dark_fantasy` | Obsidian (`#0F0E17`), Antique Gold (`#E5A93C`), Champagne text | `GothamBold` | 8px | Quad / Smooth |
| `modern_minimal` | Dark slate (`#0B0F19`), Electric Blue (`#3B82F6`), White text | `Gotham` | 10px | Quint / Glass |
| `cartoon` | Indigo (`#1E1B4B`), Sunlight Yellow (`#FBBF24`), Mint Green | `FredokaOne` | 14px | Back / Bouncy |
| `fishing_casual` | Deep Marine (`#0C2333`), Ocean Blue (`#38BDF8`), Sandy Amber | `GothamBold` | 10px | Quad / Calm |
| `sci_fi` | Pitch Black (`#050811`), Neon Cyan (`#00F0FF`), Magenta | `GothamMedium` | 4px | Linear / Sharp |

---

## 4. Visual QA & Geometric Layout Critique (`VisualQAEngine.ts`)

- Detects geometric collisions and overlapping siblings where elements accidentally share the same screen space.
- Detects viewport boundary clipping (e.g. element bounding boxes outside standard 1920x1080 canvas).
- Recommends automatic layout constraints (`UIListLayout`, `UIGridLayout`) and scale sizing.
