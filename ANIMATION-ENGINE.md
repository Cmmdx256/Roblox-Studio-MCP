# Roblox Animation Intelligence Engine

## 1. The 4-Level Animation Hierarchy

```
LEVEL 4: ANIMATION INTELLIGENCE
Reasoning about anticipation, weight, follow-through, and pose balance.
    ▲
LEVEL 3: ANIMATION AUTHORING (DSL)
Keyframe timeline definitions, joint transforms, and Tool Grip calibration.
    ▲
LEVEL 2: ANIMATION LOGIC & STATE MACHINES
Connecting gameplay states (Idle -> Cast -> Reel -> Catch) to AnimationTracks.
    ▲
LEVEL 1: PLAYBACK & CONTROLLER RUNTIME
Animator, AnimationTrack:Play(), AdjustSpeed(), Priority, and Looping.
```

---

## 2. Tool Grip Calibration (`AnimationAuthoringEngine.ts`)

Roblox Tools require precise `Grip` (CFrame offset and rotation relative to the character's `RightGrip` Motor6D / hand) to prevent weapons and items from pointing backwards or twisting through limbs.

The engine provides calibrated grip presets for R15 and R6:
- `Upright`: Rotates tool 90° so swords and rods point vertically out of the fist.
- `PointForward`: Calibrates ranged weapons and flashlights along look-vector.
- `ShieldHold`: Offsets defensive gear to forearm side attachment.
- `FishingRod`: Tailored grip with angled tip orientation.

---

## 3. Animation State Machines & Gameplay Integration

The `AnimationProvider` generates client controllers that wire gameplay events to animations:

```luau
-- Generated Animation Controller pattern
local player = game.Players.LocalPlayer
local char = player.Character or player.CharacterAdded:Wait()
local humanoid = char:WaitForChild("Humanoid")
local animator = humanoid:WaitForChild("Animator")

local castTrack = animator:LoadAnimation(script.CastAnim)
castTrack.Priority = Enum.AnimationPriority.Action

ReplicatedStorage.Events.CastStarted.OnClientEvent:Connect(function()
    castTrack:Play(0.1, 1, 1.0)
end)
```

---

## 4. API Limitations & Transparent Handling

> [!IMPORTANT]
> **Roblox Studio API Limitation**: Roblox Studio restricts plugins from directly uploading new asset IDs to the Creator Marketplace at runtime without interactive user publishing.
> 
> **How the Platform Handles This**:
> 1. Programmatic authoring is compiled into local `KeyframeSequence` or `CFrame` procedural joint animations.
> 2. For standard gameplay actions (Walk, Run, Jump, Emotes, Tool Swings), the engine binds to existing asset IDs or procedural motor tweens.
> 3. The engine never fabricates successful marketplace uploads—it generates the verified Lua controller and poses ready in Studio.
