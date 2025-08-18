# 技能特效系统 API 参考

## WebSocket 消息协议

### 客户端 → 服务端

#### 技能释放消息
```json
{
  "t": "cast",
  "skillId": "slash",
  "target": "player456"
}
```

**字段说明**:
- `skillId`: 要释放的技能ID
- `target`: 目标玩家ID

### 服务端 → 客户端

#### 技能特效事件消息
```json
{
  "t": "skillEffect",
  "effect": {
    "type": "cast|hit|area|projectile",
    "skillId": "string",
    "casterId": "string", 
    "targetId": "string?",
    "x": "number?",
    "y": "number?",
    "timestamp": "number",
    "data": "object?"
  }
}
```

**字段说明**:
- `type`: 特效类型，可选值：
  - `"cast"`: 施放特效
  - `"hit"`: 命中特效  
  - `"area"`: 区域特效
  - `"projectile"`: 投射物特效
- `skillId`: 技能ID
- `casterId`: 释放者玩家ID
- `targetId`: 目标玩家ID（可选）
- `x`, `y`: 特效坐标（可选）
- `timestamp`: 事件时间戳
- `data`: 附加数据对象

#### 特效数据对象结构

**施放特效数据**:
```json
{
  "effects": {
    "castSound": "metal_charge.wav",
    "castEffect": "metal_glow",
    "screenShake": 0.3
  },
  "castMs": 500
}
```

**命中特效数据**:
```json
{
  "effects": {
    "hitSound": "metal_clang.wav",
    "hitEffect": "metal_sparks", 
    "screenShake": 0.3,
    "flashColor": "#FFD700"
  },
  "damage": 45,
  "isCritical": false
}
```

## 技能配置格式

### 完整技能配置示例

```json
{
  "id": "thunderChain",
  "name": "雷链",
  "power": 0.9,
  "cooldownMs": 6000,
  "castMs": 200,
  "chainCount": 3,
  "range": 8,
  "element": "wood",
  "rarity": "rare",
  "effects": {
    "castSound": "thunder_charge.wav",
    "hitSound": "thunder_crack.wav",
    "castEffect": "wood_lightning_charge",
    "hitEffect": "lightning_explosion", 
    "projectileEffect": "lightning_chain",
    "screenShake": 0.4,
    "flashColor": "#00FF00"
  },
  "ui": {
    "description": "雷电链击，最多跳跃3次攻击附近敌人",
    "color": "#00FF00",
    "category": "攻击"
  }
}
```

### effects 字段规范

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `castSound` | string | 施放音效文件名 | `"thunder_charge.wav"` |
| `hitSound` | string | 命中音效文件名 | `"thunder_crack.wav"` |
| `castEffect` | string | 施放粒子效果名 | `"metal_glow"` |
| `hitEffect` | string | 命中粒子效果名 | `"metal_sparks"` |
| `areaEffect` | string | 区域粒子效果名 | `"fire_explosion"` |
| `projectileEffect` | string | 投射物效果名 | `"lightning_chain"` |
| `screenShake` | number | 屏幕震动强度 (0-1) | `0.3` |
| `flashColor` | string | 闪光颜色 (hex) | `"#FFD700"` |

### ui 字段规范

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `description` | string | 技能描述文本 | `"蓄力重击，造成高额金系伤害"` |
| `color` | string | UI主题色 (hex) | `"#FFD700"` |
| `category` | string | 技能分类 | `"攻击"`, `"防御"`, `"控制"`, `"位移"`, `"被动"` |

## 服务端 API

### broadcastSkillEffect 函数

```typescript
function broadcastSkillEffect(room: Room, effectEvent: SkillEffectEvent): void
```

**参数**:
- `room`: 房间对象
- `effectEvent`: 特效事件对象

**功能**: 向房间内所有客户端（包括观战者）广播技能特效事件

**调用示例**:
```typescript
broadcastSkillEffect(room, {
  type: "cast",
  skillId: "slash",
  casterId: "player123",
  x: 50.5,
  y: 30.2,
  timestamp: Date.now(),
  data: {
    effects: skill.effects,
    castMs: 500
  }
});
```

## 客户端集成指南

### 特效事件监听

```javascript
// WebSocket消息监听
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.t === 'skillEffect') {
    handleSkillEffect(msg.effect);
  }
};

// 特效处理函数
function handleSkillEffect(effect) {
  switch (effect.type) {
    case 'cast':
      playCastEffect(effect);
      break;
    case 'hit':
      playHitEffect(effect);
      break;
    case 'area':
      playAreaEffect(effect);
      break;
    case 'projectile':
      playProjectileEffect(effect);
      break;
  }
}
```

### 施放特效播放

```javascript
function playCastEffect(effect) {
  const { skillId, casterId, x, y, data } = effect;
  const { effects, castMs } = data;
  
  // 播放施放音效
  if (effects.castSound) {
    playSound(effects.castSound);
  }
  
  // 显示施放粒子效果
  if (effects.castEffect) {
    showParticleEffect(effects.castEffect, x, y, castMs);
  }
  
  // 屏幕震动
  if (effects.screenShake) {
    shakeScreen(effects.screenShake);
  }
}
```

### 命中特效播放

```javascript
function playHitEffect(effect) {
  const { skillId, targetId, x, y, data } = effect;
  const { effects, damage, isCritical } = data;
  
  // 播放命中音效
  if (effects.hitSound) {
    playSound(effects.hitSound);
  }
  
  // 显示命中粒子效果
  if (effects.hitEffect) {
    showParticleEffect(effects.hitEffect, x, y, 300);
  }
  
  // 显示伤害数字
  showDamageNumber(x, y, damage, isCritical);
  
  // 屏幕闪光
  if (effects.flashColor) {
    flashScreen(effects.flashColor, 100);
  }
  
  // 屏幕震动
  if (effects.screenShake) {
    shakeScreen(effects.screenShake);
  }
}
```

## 资源文件组织

### 建议的目录结构

```
assets/
├── sounds/
│   ├── skills/
│   │   ├── metal_charge.wav
│   │   ├── metal_clang.wav
│   │   ├── thunder_charge.wav
│   │   └── thunder_crack.wav
│   └── ui/
│       ├── button_click.wav
│       └── notification.wav
├── effects/
│   ├── particles/
│   │   ├── metal_glow.json
│   │   ├── metal_sparks.json
│   │   └── lightning_chain.json
│   └── animations/
│       ├── cast_animations.json
│       └── hit_animations.json
└── ui/
    ├── skill_icons/
    │   ├── slash.png
    │   └── thunder_chain.png
    └── themes/
        └── element_colors.json
```

### 音效文件规范

- **格式**: WAV 或 OGG
- **采样率**: 44.1kHz
- **比特率**: 16-bit
- **时长**: 建议不超过3秒
- **命名**: `{技能类型}_{动作}.wav`

### 粒子效果规范

- **格式**: JSON配置文件
- **引擎**: 支持常见粒子引擎格式
- **性能**: 粒子数量建议不超过100个
- **命名**: `{元素}_{效果名}.json`

## 调试工具

### 特效事件日志

```javascript
// 启用特效调试日志
const DEBUG_EFFECTS = true;

if (DEBUG_EFFECTS) {
  console.log(`[特效] ${effect.type} - ${effect.skillId}`, effect);
}
```

### 性能监控

```javascript
// 特效性能统计
const effectStats = {
  totalEvents: 0,
  eventsByType: {},
  averageLatency: 0
};

function trackEffectPerformance(effect) {
  effectStats.totalEvents++;
  effectStats.eventsByType[effect.type] = 
    (effectStats.eventsByType[effect.type] || 0) + 1;
}
```

## 错误处理

### 常见错误及解决方案

1. **音效文件未找到**
   ```javascript
   function playSound(filename) {
     try {
       audio.play(filename);
     } catch (error) {
       console.warn(`音效文件未找到: ${filename}`);
     }
   }
   ```

2. **特效配置缺失**
   ```javascript
   function getEffectConfig(skillId) {
     const config = skillEffects[skillId];
     if (!config) {
       console.warn(`技能 ${skillId} 缺少特效配置`);
       return getDefaultEffectConfig();
     }
     return config;
   }
   ```

3. **性能降级处理**
   ```javascript
   function adaptiveEffectQuality() {
     if (getFrameRate() < 30) {
       // 降低特效质量
       reduceParticleCount();
       disableScreenEffects();
     }
   }
   ```

---

*此API文档与特效系统同步更新*