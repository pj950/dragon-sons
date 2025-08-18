# 龙生九子·五行对战 - 本地运行指南

## 🚀 快速开始 (5分钟运行)

### 前置要求
- **Node.js** 16+ 
- **npm** 或 **yarn**
- **现代浏览器** (Chrome 80+, Firefox 75+, Safari 13+)

### 一键启动脚本

```bash
# 克隆项目
git clone https://github.com/pj950/dragon-sons.git
cd dragon-sons

# 自动安装和启动
npm run quick-start
```

### 手动启动步骤

#### 1. 启动游戏服务器
```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 启动服务器 (端口8787)
npm start
```

**服务器启动成功标志**:
```
🚀 Dragon Sons server listening on port 8787
📊 Health check: http://localhost:8787/health
🎮 WebSocket ready for connections
```

#### 2. 启动Web客户端
```bash
# 新开终端，进入客户端目录
cd client

# 启动HTTP服务器 (端口8080)
npx serve . -p 8080
```

**客户端启动成功标志**:
```
   ┌─────────────────────────────────────────────────┐
   │                                                 │
   │   Serving!                                      │
   │                                                 │
   │   - Local:            http://localhost:8080     │
   │   - On Your Network:  http://192.168.x.x:8080  │
   │                                                 │
   └─────────────────────────────────────────────────┘
```

#### 3. 生成游戏资源 (可选)
```bash
# 访问资源生成工具
open http://localhost:8080/generate-assets.html

# 或者使用命令行
cd client
npm run generate-assets
```

#### 4. 开始游戏
```bash
# 打开游戏
open http://localhost:8080
```

## 🎮 游戏体验指南

### 基础操作
- **移动**: WASD 或 方向键
- **攻击**: 左键点击敌人
- **技能**: Q/W/E/R 或 右键点击敌人
- **道具**: 1/2/3 数字键
- **排行榜**: Tab键
- **聊天**: Enter键

### 游戏流程
1. **连接服务器** - 自动连接到本地服务器
2. **选择角色** - 随机分配9个龙子角色之一
3. **获得技能** - 每个角色随机获得4个技能
4. **进入战场** - 圆形地图，五行区域分布
5. **收集成长** - 拾取水果提升属性，获得道具
6. **战斗求生** - 与其他玩家战斗，躲避缩圈
7. **获得胜利** - 成为最后的生存者

### 技能系统体验
- **50+技能池** - 每局随机4个技能
- **五行克制** - 金克木，木克土，土克水，水克火，火克金
- **区域加成** - 在对应元素区域释放技能有15%加成
- **视觉特效** - 每个技能都有独特的粒子效果和音效

## 🔧 开发环境配置

### 环境变量配置

#### 服务器环境变量 (.env)
```bash
# 服务器配置
PORT=8787
NODE_ENV=development

# 数据存储
DATA_DIR=./data
PERSIST_REJOIN=1

# 安全配置  
MSG_SECRET=your-secret-key
HMAC=0

# 调试选项
DEBUG=1
LOG_LEVEL=info
```

#### 客户端配置
```javascript
// client/src/config.js 中修改
CONFIG.server.host = 'localhost';  // 服务器地址
CONFIG.server.port = 8787;         // 服务器端口
CONFIG.graphics.effects.quality = 'high';  // 画质设置
CONFIG.audio.enabled = true;       // 音效开关
```

### 端口配置
- **服务器端口**: 8787 (可在server/src/index.ts修改)
- **客户端端口**: 8080 (可修改serve命令参数)
- **健康检查**: http://localhost:8787/health

## 🐛 故障排除

### 常见问题及解决方案

#### 1. 服务器启动失败
**问题**: `Error: listen EADDRINUSE :::8787`
**解决**: 端口被占用
```bash
# 查找占用进程
lsof -i :8787
# 或者
netstat -tlnp | grep :8787

# 杀死进程
kill -9 <PID>

# 或者换端口
PORT=8788 npm start
```

#### 2. 客户端连接失败
**问题**: WebSocket连接失败
**检查清单**:
- [ ] 服务器是否正常启动
- [ ] 端口8787是否开放
- [ ] 防火墙是否阻止连接
- [ ] 浏览器控制台是否有错误

**解决方案**:
```bash
# 检查服务器状态
curl http://localhost:8787/health

# 检查WebSocket连接
# 在浏览器控制台执行:
new WebSocket('ws://localhost:8787')
```

#### 3. 资源加载失败
**问题**: 音效或图标无法加载
**解决**: 生成资源文件
```bash
# 访问资源生成工具
http://localhost:8080/generate-assets.html

# 点击"生成所有资源"
# 下载并放置到assets目录
```

#### 4. 性能问题
**问题**: 游戏卡顿或帧率低
**优化方案**:
```javascript
// 在浏览器控制台执行
CONFIG.graphics.effects.quality = 'low';  // 降低画质
CONFIG.graphics.effects.particles = false; // 关闭粒子
```

### 调试工具

#### 浏览器调试
```javascript
// 开启调试模式
enableDebug()

// 查看游戏状态
debugInfo()

// 查看性能信息
dragonSonsClient.getPerformanceInfo()

// 查看网络状态
wsClient.getLatency()
```

#### 服务器调试
```bash
# 查看服务器日志
tail -f server/data/events.log

# 查看在线玩家
curl http://localhost:8787/health
```

## 📱 多设备测试

### 本地网络测试
```bash
# 获取本机IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux

# 其他设备访问
http://192.168.x.x:8080  # 客户端
ws://192.168.x.x:8787    # 服务器
```

### 移动设备测试
1. 确保设备在同一WiFi网络
2. 使用本机IP地址访问
3. 在移动浏览器中打开游戏
4. 注意：移动端操作体验尚未优化

## 🔄 开发工作流

### 代码修改后重启
```bash
# 服务器代码修改后
cd server
npm run build  # 编译TypeScript
npm start      # 重启服务器

# 客户端代码修改后
# 刷新浏览器即可，无需重启
```

### 配置修改热更新
```bash
# 服务器配置支持热更新
# 修改 server/src/config/balance.json 后会自动重载
# 无需重启服务器
```

### 查看实时日志
```bash
# 服务器日志
tail -f server/data/events.log

# 客户端日志
# 打开浏览器开发者工具 Console 面板
```

## 📊 性能监控

### 服务器性能
```bash
# 查看服务器资源使用
top -p $(pgrep node)

# 查看连接数
netstat -an | grep :8787 | wc -l
```

### 客户端性能
```javascript
// 在浏览器控制台查看FPS
renderer.getFPS()

// 查看粒子数量
EffectsRenderer.getParticleCount()

// 查看内存使用
PerformanceUtils.getMemoryUsage()
```

## 🎯 测试建议

### 单人测试
1. 启动服务器和客户端
2. 打开游戏，体验基础操作
3. 测试技能释放和特效
4. 测试道具拾取和使用

### 多人测试
1. 在多个浏览器标签页打开游戏
2. 测试多人对战
3. 测试实时同步效果
4. 测试排行榜和观战功能

### 移动端测试
1. 在手机浏览器打开游戏
2. 测试触屏操作（基础支持）
3. 检查性能表现
4. 记录优化需求

---

## 💡 提示

- **首次运行建议生成资源文件**，获得完整的视听体验
- **多开浏览器标签页**可以模拟多人对战
- **使用开发者工具**查看详细的调试信息
- **遇到问题查看浏览器控制台**，通常有详细的错误信息

---

*如有问题，请查看项目文档或提交Issue*