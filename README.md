## 龙生九子 · 五行对战（多人对战游戏设计）

一个围绕五行克制与成长的多人对战（MOBA/吃鸡混合）玩法：圆形地图、五行区域、元素水果成长、随机道具与小怪掉落、圈缩逼战、权威服同步。

### 核心玩法概览
- 出生：每名玩家携带1种本命五行（金/木/水/火/土）。
- 地图：圆形边界，划分为五个等弧区域（对应五行）。
- 区域增益：处于与自身同元素的区块时，攻击+5%；处于被克区时防御-5%。
- 成长：吃同元素水果永久加攻击；吃其他元素水果提升敏捷/闪避/防御/暴击等（各有上限）。
- 战斗：五行克制与相生影响伤害倍率；命中-闪避-暴击-减伤决定最终伤害。
- 圈缩：10分钟局内多次缩圈，圈外持续掉血，推动交战。
- 刷新：外圈周期刷新小怪，掉落水果（100%）+道具（10%）。

### 五行与克制
- 克：金→木，木→土，土→水，水→火，火→金
- 生：金→水→木→火→土→金
- 伤害倍率（默认）
  - 克到对手：1.25
  - 被对手克：0.85
  - 相生（我生他）：1.10
  - 相生（他生我）：0.95
  - 同元素：1.00

### 水果系统（五行）
- 同元素水果：永久增加攻击（可叠加，上限与递减）。
- 其他元素水果：提升次要属性（有上限）。
- 建议：
  - 金果：本命→攻击+8；非本命→暴击率+2%（上限+12%）
  - 木果：本命→攻击+8；非本命→敏捷+5（上限+40）
  - 水果：本命→攻击+8；非本命→闪避+2%（上限+12%）
  - 火果：本命→攻击+8；非本命→暴击伤害+0.10（上限+0.60）
  - 土果：本命→攻击+8；非本命→防御+8（上限+64）
- 同元素攻击加成上限：+64/局；从第5个起每个效率×0.7（递减）。

### 道具（示例）
- 金钟罩：5秒无敌（免伤与控制），冷却90秒。
- 神行鞋：6秒移速×2，冷却90秒；与其他加速不叠加，取最大值。

### 角色（龙生九子，基础数值）
统一基线：攻击=100，敏捷=100，防御=80，闪避=10%，暴击率=10%，暴击伤害=1.5
- 囚牛：攻100 敏95 闪12% 防90 暴10% 爆1.50
- 睚眦：攻115 敏95 闪8% 防75 暴14% 爆1.60
- 嘲风：攻95 敏110 闪14% 防80 暴11% 爆1.50
- 蒲牢：攻105 敏115 闪10% 防70 暴11% 爆1.50
- 狻猊：攻100 敏90 闪9% 防100 暴12% 爆1.60
- 赑屃：攻90 敏85 闪8% 防120 暴9% 爆1.50
- 狴犴：攻100 敏90 闪10% 防105 暴10% 爆1.50
- 负屃：攻95 敏110 闪15% 防75 暴10% 爆1.50
- 蚩吻：攻105 敏100 闪11% 防85 暴12% 爆1.55

未来 DLC 角色池：螭首、麒麟、望天吼、貔貅、龙马、虭蛥、鳌鱼、兽𧉚、金吾、螭虎、𧖣𧊲、宪章、徙牢、蟋蜴、蚵蛉。

### 战斗与数值公式（建议）
- 命中率 = clamp(基础命中 + 攻击方敏捷系数 − 防守方闪避, 40%, 100%)
- 暴击：命中后判定；默认暴击伤害=1.5
- 防御减伤：净伤系数 = 1 − DEF / (DEF + Kdef)，Kdef=100
- 有效攻击 = (基础攻 + 同元素水果加成) × (1 + 区域同元素5%)
- 最终伤害 = Raw × 元素倍率 × 暴击系数 × 净伤系数

TypeScript 示例：
```ts
function computeDamage(ctx: Ctx, atk: Actor, def: Actor, skill: Skill): number {
  if (!rollHit(atk, def, ctx)) return 0;
  const zoneAtkMul = atk.zoneElement === atk.element ? 1 + ctx.balance.zoneBuffAtkPct : 1;
  const zoneDefMul = def.zoneElement && isCounter(def.zoneElement, def.element) ? 1 - ctx.balance.zoneDebuffDefPct : 1;
  const effectiveAtk = (atk.baseAtk + atk.fruitAtkFlat) * zoneAtkMul * skill.power;
  const elementMul = ctx.elementMatrix[atk.element]?.[def.element] ?? 1;
  const critMul = roll(atk.crit) ? atk.critDmg : 1;
  const defMit = 1 - def.def / (def.def + ctx.balance.kDef);
  const damage = effectiveAtk * elementMul * critMul * defMit * zoneDefMul;
  return Math.max(1, Math.floor(damage));
}

function applyFruit(player: Player, fruit: Fruit, bal: Balance) {
  const same = fruit.element === player.element;
  if (same) {
    const stacks = player.sameFruitStacks[fruit.element] ?? 0;
    const diminish = stacks >= bal.sameFruitDiminishStart ? bal.sameFruitDiminishRate : 1;
    const gain = Math.round(fruit.selfAtkFlat * diminish);
    const capRemain = bal.sameFruitAtkCap - player.fruitAtkFlat;
    player.fruitAtkFlat += Math.max(0, Math.min(gain, capRemain));
    player.sameFruitStacks[fruit.element] = stacks + 1;
  } else {
    grantSecondary(player, fruit.other);
  }
}
```

### 数据配置示例（JSON）
```json
{
  "elements": ["metal","wood","water","fire","earth"],
  "elementMatrix": {
    "metal": {"wood":1.25,"fire":0.85,"water":1.10,"earth":0.95},
    "wood":  {"earth":1.25,"metal":0.85,"fire":1.10,"water":0.95},
    "water": {"fire":1.25,"earth":0.85,"wood":1.10,"metal":0.95},
    "fire":  {"metal":1.25,"water":0.85,"earth":1.10,"wood":0.95},
    "earth": {"water":1.25,"wood":0.85,"metal":1.10,"fire":0.95}
  },
  "characters": [
    {"id":"qiuniu","name":"囚牛","element":"random","atk":100,"agi":95,"dodge":0.12,"def":90,"crit":0.10,"critDmg":1.5},
    {"id":"yazi","name":"睚眦","element":"random","atk":115,"agi":95,"dodge":0.08,"def":75,"crit":0.14,"critDmg":1.6}
  ],
  "fruits": [
    {"element":"metal","selfAtkFlat":8,"other": {"critRatePct":0.02,"max":0.12}},
    {"element":"wood", "selfAtkFlat":8,"other": {"agiFlat":5,"max":40}},
    {"element":"water","selfAtkFlat":8,"other": {"dodgePct":0.02,"max":0.12}},
    {"element":"fire", "selfAtkFlat":8,"other": {"critDmg":0.10,"max":0.60}},
    {"element":"earth","selfAtkFlat":8,"other": {"defFlat":8,"max":64}}
  ],
  "items": [
    {"id":"invuln","name":"金钟罩","duration":5,"cooldown":90,"type":"invulnerable"},
    {"id":"boots","name":"神行鞋","duration":6,"cooldown":90,"type":"speed","multiplier":2.0}
  ],
  "balance": {
    "tickRate":20,"baseMove":5.0,
    "agiMoveCoef":0.02,"agiAspdCoef":0.003,"agiCastCoef":0.001,
    "aspdCap":1.3,"castCap":0.15,"kDef":100,
    "zoneBuffAtkPct":0.05,"zoneDebuffDefPct":0.05,
    "stormDpsPct":[0.05,0.07,0.09,0.11,0.13],
    "ringShrinkTimes":[180,270,360,450,540],
    "ringShrinkFactor":0.8,
    "sameFruitAtkCap":64,"sameFruitDiminishStart":5,"sameFruitDiminishRate":0.7,
    "mobSpawnEvery":20,"itemDropChance":0.1
  }
}
```

### 圈缩与小怪
- 缩圈时点：T=180/270/360/450/540s，每次半径×0.8
- 圈外伤害：每秒5%当前生命，随阶段每段+2%
- 小怪：每20秒外圈刷新一批，三档强度推进；100%掉水果，10%掉道具

### 网络与同步建议
- 服务器权威：Tick=20Hz；命中/伤害/拾取/圈缩在服端判定
- 客户端：移动/施法输入上报，插值与预测
- 反作弊：输入节流、速度上限、命中重验、状态签名

### 开发与扩展
- 数据驱动：新增角色/道具/水果仅需改配置
- 指标：对局时长、击杀分布、同元素叠层、被克击杀率、圈外死亡率
- 可选技术栈：客户端 Unity/Unreal/Phaser；服务端 Node.js + WebSocket/Colyseus

如需，我可在本仓库直接生成服务端（TypeScript，权威服）与客户端样例场景的骨架工程，开箱即跑。

### 进度与路线图
- 请见 `ROADMAP.md` 获取完整的实现清单与进度勾选，以及优先排期：
  - 角色差异化初始面板
  - 元素水果的完整二级属性与上限、同元素递减
  - 区域元素判定与同区增益/被克减益
  - 更多道具与冷却、状态同步与去抖
  - 房间匹配/观战、持久化与部署脚本
