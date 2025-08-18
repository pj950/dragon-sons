## Roadmap & Progress

- 基础工程
  - [x] 仓库初始化、LICENSE、.gitignore
  - [x] CI 构建（server）
  - [x] 服务端 TypeScript 工程、构建脚本

- 网络与协议
  - [x] WebSocket 连接/断开
  - [x] 消息：hello / ping/pong / move / pickup / attack / hit / snapshot / useItem / assignSlot / useSlot / rooms / createRoom / joinRoom / spectate / cast / start / rejoin
  - [x] 输入节流与速率限制（move 约30/s，攻击基于冷却）
  - [ ] 断线重连/重入（基础token已接，状态恢复待完善）

- 世界与地图
  - [x] 圆形安全圈，按配置缩圈
  - [x] 圈外持续伤害
  - [x] 世界循环 tick=20Hz，周期快照广播
  - [x] 五行地形分区与区域元素判定（zoneElement 注入）
  - [x] 边界约束（地图坐标夹取）
  - [ ] 出生点分布优化

- 移动
  - [x] 基础移动（vx, vy）
  - [x] 敏捷→移速映射（agiMoveCoef）
  - [x] 加速状态（神行鞋）
  - [ ] 敏捷→前摇映射（agiCastCoef）

- 战斗与数值
  - [x] 伤害：元素倍率/暴击/防御Kdef
  - [x] 命中与闪避（敏捷差与闪避率参与、命中上下限）
  - [x] 区域增益/被克减益（zoneElement 参与计算）
  - [x] 动态攻击冷却（敏捷→攻速；aspdCap/agiAspdCoef）
  - [x] 技能系统（前摇/冷却/敏捷缩短前摇）
  - [x] 全局上限：暴击/闪避 caps（critMax/dodgeMax）

- 成长与物品
  - [x] 地面水果与道具刷新
  - [x] 拾取生效：同元素递减与上限；非本命二级属性加成与上限
  - [x] 道具冷却（onUse 触发）
  - [x] 背包+槽位（assignSlot/useSlot）与使用去抖
  - [x] 新道具：疗愈丹（即时回血）、火雷丸（延时爆炸）、地刺阵（触发伤害）、瞬身符（位移）
  - [x] 技能特效系统基础框架（WebSocket事件广播）
  - [x] 技能配置扩展（effects/ui字段）
  - [x] 施放和命中特效事件集成
  - [x] 3个核心技能特效配置（重斩/弧形剑气/雷链）
  - [ ] 完善所有50+技能的特效配置
  - [ ] 新道具交互完善（特效、冷却提示、音效钩子）

- 角色与平衡
  - [x] 角色差异化初始面板（基于配置随机抽取）
  - [ ] 上限控制（暴击/闪避等 caps）与AB调参脚手架

- 怪物与掉落
  - [x] 定时刷怪
  - [x] 怪物AI（寻敌、移动、攻击）
  - [x] 玩家对怪物的攻击与技能伤害
  - [x] 击杀掉落水果与道具

- 房间与观战/匹配
  - [x] 房间创建/加入，容量限制
  - [x] 房间列表
  - [x] 观战模式
  - [x] 倒计时开局、对局时长、结束状态
  - [x] 匹配：最小人数自动开局/倒计时重置
  - [x] 结算：winner/MVP（按伤害），全局榜单广播
  - [x] 观战榜：全局（分页 wins/kills），房间榜（kills/damage/alive 排序）

- 持久化与榜单
  - [x] 运行时配置热更新（支持 AB 覆盖）
  - [x] 对局结算持久化：玩家累计战绩（场次/胜场/击杀）
  - [x] 全局排行榜（按胜场/击杀排序）
  - [x] 遥测事件日志（events.log）

- 同步与反作弊
  - [x] 服务器权威+快照广播
  - [x] 输入速度上限裁剪
  - [x] 重入令牌（简化）
  - [x] 可选消息签名校验（MSG_SECRET / HMAC 可切换）
  - [x] 轨迹审计（短期位置轨迹）
  - [x] 重入状态完整恢复（血量/冷却/背包/槽位），支持持久化（PERSIST_REJOIN=1）

- 数据与配置
  - [x] 数据驱动：元素矩阵/水果/道具/技能/平衡参数
  - [ ] 配置版本化/灰度（AB 配置）
  - [ ] 角色表全量与 DLC 角色接入

- 工具链与部署
  - [x] CI 构建
  - [x] Dockerfile/容器化部署
  - [x] HTTP /health 健康检查
  - [ ] 环境变量与监控（日志聚合/metrics）

- 客户端实现 🎮
  - [x] HTML5游戏界面和UI系统
  - [x] WebSocket客户端连接管理
  - [x] Canvas 2D渲染引擎（角色、地图、UI）
  - [x] 粒子特效系统（40+技能特效）
  - [x] Web Audio音效系统（120+音效支持）
  - [x] 输入处理系统（键盘+鼠标）
  - [x] 游戏状态管理和UI更新
  - [x] 设置系统和本地存储
  - [ ] 实际音效资源文件制作
  - [ ] 技能和道具图标制作
  - [ ] 移动端触屏优化

- 文档与演示
  - [x] 根 README 设计文档
  - [x] server README
  - [x] 客户端README和测试页面
  - [x] 技能特效系统设计文档（docs/skill-effects-system.md）
  - [x] 技能特效系统API文档（docs/skill-effects-api.md）

分支与PR流程
- 开发分支：feature/match-persistence-anticheat
- 每次开发完成后：提交到该分支并创建 Pull Request 合入 main