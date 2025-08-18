# 技能特效系统设计文档

## 概述

技能特效系统为《龙生九子·五行对战》游戏提供完整的视觉反馈和音效支持，包括技能施放特效、命中特效、UI提示和音效播放等功能。

## 系统架构

### 特效事件流程

```
技能释放 → 施放特效事件 → 命中检测 → 命中特效事件 → 客户端播放特效
    ↓              ↓              ↓              ↓
广播给所有客户端  播放施放动画    播放命中动画    更新UI状态
```

### 核心组件

1. **特效事件系统** - 服务端特效事件广播
2. **技能配置扩展** - 技能数据中包含特效信息
3. **客户端特效播放** - 接收并播放特效（待实现）

## 数据结构

### SkillEffectEvent 特效事件

```typescript
interface SkillEffectEvent {
  type: "cast" | "hit" | "area" | "projectile";  // 特效类型
  skillId: string;                               // 技能ID
  casterId: string;                              // 释放者ID
  targetId?: string;                             // 目标ID（命中时）
  x?: number;                                    // X坐标
  y?: number;                                    // Y坐标
  timestamp: number;                             // 时间戳
  data?: {                                       // 附加数据
    effects?: any;                               // 特效配置
    damage?: number;                             // 伤害值
    isCritical?: boolean;                        // 是否暴击
    castMs?: number;                             // 施放时间
  };
}
```

### 技能特效配置

每个技能可以包含以下特效配置：

```json
{
  "effects": {
    "castSound": "metal_charge.wav",        // 施放音效
    "hitSound": "metal_clang.wav",          // 命中音效
    "castEffect": "metal_glow",             // 施放粒子效果
    "hitEffect": "metal_sparks",            // 命中粒子效果
    "areaEffect": "metal_arc",              // 区域效果（AOE技能）
    "projectileEffect": "lightning_chain",  // 投射物效果
    "screenShake": 0.3,                     // 屏幕震动强度 (0-1)
    "flashColor": "#FFD700"                 // 闪光颜色
  },
  "ui": {
    "description": "蓄力重击，造成高额金系伤害", // 技能描述
    "color": "#FFD700",                     // UI主题色
    "category": "攻击"                       // 技能分类
  }
}
```

## 特效类型说明

### 1. Cast 施放特效
- **触发时机**: 技能开始施放时
- **包含信息**: 施放者位置、施放动画、音效
- **用途**: 显示角色动画、充能效果、施放音效

### 2. Hit 命中特效  
- **触发时机**: 技能命中目标时
- **包含信息**: 目标位置、伤害数值、命中动画、音效
- **用途**: 显示撞击效果、伤害数字、震动反馈

### 3. Area 区域特效
- **触发时机**: AOE技能释放时
- **包含信息**: 区域中心、半径、持续时间
- **用途**: 显示地面效果、范围指示器

### 4. Projectile 投射物特效
- **触发时机**: 远程技能释放时  
- **包含信息**: 起点、终点、飞行轨迹
- **用途**: 显示飞行特效、轨迹动画

## 已实现的技能特效

### 金系技能
- **重斩 (slash)**: 蓄力光效 + 金属撞击音效 + 屏幕震动
- **弧形剑气 (arcSlash)**: 剑气轨迹 + 金属切割音效

### 木系技能  
- **雷链 (thunderChain)**: 闪电链条 + 雷鸣音效 + 绿色闪光

## API 接口

### 服务端广播函数

```typescript
// 广播特效事件给房间内所有客户端
function broadcastSkillEffect(room: Room, effectEvent: SkillEffectEvent): void
```

### WebSocket 消息格式

**特效事件消息**:
```json
{
  "t": "skillEffect",
  "effect": {
    "type": "cast",
    "skillId": "slash", 
    "casterId": "player123",
    "x": 50.5,
    "y": 30.2,
    "timestamp": 1692356400000,
    "data": {
      "effects": { "castSound": "metal_charge.wav" },
      "castMs": 500
    }
  }
}
```

## 配置文件说明

### 技能配置扩展 (balance.json)

在现有技能配置中添加 `effects` 和 `ui` 字段：

```json
{
  "id": "slash",
  "name": "重斩",
  "power": 1.6,
  "cooldownMs": 4000,
  "castMs": 500,
  "element": "metal",
  "rarity": "common",
  "effects": {
    "castSound": "metal_charge.wav",
    "hitSound": "metal_clang.wav", 
    "castEffect": "metal_glow",
    "hitEffect": "metal_sparks",
    "screenShake": 0.3
  },
  "ui": {
    "description": "蓄力重击，造成高额金系伤害",
    "color": "#FFD700",
    "category": "攻击"
  }
}
```

## 实现状态

### ✅ 已完成
- [x] 特效事件数据结构设计
- [x] 服务端特效事件广播系统
- [x] 技能配置扩展（effects/ui字段）
- [x] 施放特效事件集成
- [x] 命中特效事件集成
- [x] 3个核心技能的特效配置

### 🔄 进行中
- [ ] 完善所有50+技能的特效配置
- [ ] 被动技能特效支持
- [ ] 区域特效和投射物特效完善

### 📋 待实现
- [ ] 客户端特效播放系统
- [ ] 粒子系统集成
- [ ] 音效资源管理
- [ ] UI冷却指示器
- [ ] 暴击特效增强
- [ ] 特效性能优化

## 扩展计划

### 1. 客户端集成
创建Web客户端来实际播放特效，包括：
- Canvas粒子系统
- 音效播放管理
- UI动画效果
- 屏幕震动实现

### 2. 特效资源管理
- 音效文件组织结构
- 粒子效果预设库
- 资源预加载机制
- 动态资源加载

### 3. 性能优化
- 特效事件缓冲池
- 批量特效处理
- 距离裁剪优化
- 帧率自适应

## 使用示例

### 添加新技能特效

1. 在 `balance.json` 中为技能添加特效配置：
```json
{
  "id": "newSkill",
  "effects": {
    "castSound": "new_cast.wav",
    "hitEffect": "new_particles"
  }
}
```

2. 服务端会自动广播特效事件，无需额外代码

3. 客户端接收到 `skillEffect` 消息后播放对应特效

### 调试特效事件

可以通过WebSocket监听来调试特效事件：
```javascript
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.t === 'skillEffect') {
    console.log('特效事件:', msg.effect);
  }
};
```

---

*本文档将随着特效系统的开发进展持续更新*