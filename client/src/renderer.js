// 龙生九子·五行对战 - 游戏渲染引擎

class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.0,
            targetX: 0,
            targetY: 0,
            smoothing: CONFIG.graphics.camera.smoothing
        };
        
        // 渲染状态
        this.worldSize = { width: 100, height: 100 };
        this.safeZone = { x: 50, y: 50, radius: 50 };
        
        // 性能监控
        this.fps = 0;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        
        // 缓存的图像和路径
        this.imageCache = new Map();
        this.pathCache = new Map();
        
        this.setupCanvas();
    }

    // 设置画布
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // 设置画布实际大小
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // 设置CSS大小
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // 缩放上下文以匹配设备像素比
        this.ctx.scale(dpr, dpr);
        
        // 设置渲染质量
        this.ctx.imageSmoothingEnabled = CONFIG.graphics.effects.quality !== 'low';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }

    // 开始渲染循环
    startRenderLoop() {
        const render = (timestamp) => {
            this.updateFPS(timestamp);
            this.render(timestamp);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    // 更新FPS
    updateFPS(timestamp) {
        this.frameCount++;
        if (timestamp - this.lastFrameTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (timestamp - this.lastFrameTime));
            this.frameCount = 0;
            this.lastFrameTime = timestamp;
        }
    }

    // 主渲染函数
    render(timestamp) {
        // 清空画布
        this.clear();
        
        // 更新摄像机
        this.updateCamera();
        
        // 保存上下文
        this.ctx.save();
        
        // 应用摄像机变换
        this.applyCameraTransform();
        
        // 渲染游戏世界
        this.renderWorld();
        
        // 恢复上下文
        this.ctx.restore();
        
        // 渲染UI（不受摄像机影响）
        this.renderUI();
        
        // 调试信息
        if (CONFIG.debug.enabled) {
            this.renderDebugInfo();
        }
    }

    // 清空画布
    clear() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 更新摄像机
    updateCamera() {
        if (CONFIG.graphics.camera.followPlayer && window.Game.localPlayer) {
            this.camera.targetX = window.Game.localPlayer.x;
            this.camera.targetY = window.Game.localPlayer.y;
        }
        
        // 平滑跟随
        this.camera.x = MathUtils.lerp(this.camera.x, this.camera.targetX, this.camera.smoothing);
        this.camera.y = MathUtils.lerp(this.camera.y, this.camera.targetY, this.camera.smoothing);
    }

    // 应用摄像机变换
    applyCameraTransform() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 平移到屏幕中心
        this.ctx.translate(centerX, centerY);
        
        // 缩放
        this.ctx.scale(this.camera.zoom * 6, this.camera.zoom * 6); // 6是世界到屏幕的基础缩放比例
        
        // 平移摄像机位置
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }

    // 渲染游戏世界
    renderWorld() {
        // 渲染地图区域
        this.renderMapAreas();
        
        // 渲染安全圈
        this.renderSafeZone();
        
        // 渲染地面物品
        this.renderGroundItems();
        
        // 渲染怪物
        this.renderMonsters();
        
        // 渲染玩家
        this.renderPlayers();
        
        // 渲染特效
        this.renderEffects();
        
        // 渲染投射物
        this.renderProjectiles();
    }

    // 渲染地图区域（五行分区）
    renderMapAreas() {
        const centerX = this.worldSize.width / 2;
        const centerY = this.worldSize.height / 2;
        const radius = Math.min(this.worldSize.width, this.worldSize.height) / 2;
        
        // 五个等弧区域
        const elements = ['metal', 'wood', 'water', 'fire', 'earth'];
        const angleStep = (Math.PI * 2) / elements.length;
        
        elements.forEach((element, index) => {
            const startAngle = index * angleStep - Math.PI / 2;
            const endAngle = (index + 1) * angleStep - Math.PI / 2;
            
            // 绘制扇形
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            
            // 填充颜色
            const elementColor = CONFIG.elements[element].color;
            this.ctx.fillStyle = ColorUtils.addAlpha(elementColor, 0.1);
            this.ctx.fill();
            
            // 边框
            this.ctx.strokeStyle = ColorUtils.addAlpha(elementColor, 0.3);
            this.ctx.lineWidth = 0.2;
            this.ctx.stroke();
            
            // 元素标签
            const labelAngle = startAngle + angleStep / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            this.ctx.fillStyle = elementColor;
            this.ctx.font = 'bold 3px Arial';
            this.ctx.fillText(CONFIG.elements[element].name, labelX, labelY);
        });
    }

    // 渲染安全圈
    renderSafeZone() {
        const { x, y, radius } = this.safeZone;
        
        // 安全圈边界
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 0.3;
        this.ctx.setLineDash([1, 0.5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 危险区域
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.beginPath();
        this.ctx.rect(-1000, -1000, 2000, 2000);
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fill();
        this.ctx.restore();
    }

    // 渲染地面物品
    renderGroundItems() {
        if (!window.Game.gameState || !window.Game.gameState.entities) return;
        
        window.Game.gameState.entities.forEach(entity => {
            if (entity.type === 'fruit') {
                this.renderFruit(entity);
            } else if (entity.type === 'item') {
                this.renderGroundItem(entity);
            }
        });
    }

    // 渲染水果
    renderFruit(fruit) {
        const elementColor = CONFIG.elements[fruit.element].color;
        
        // 水果主体
        this.ctx.beginPath();
        this.ctx.arc(fruit.x, fruit.y, 0.8, 0, Math.PI * 2);
        this.ctx.fillStyle = elementColor;
        this.ctx.fill();
        
        // 光晕效果
        const gradient = this.ctx.createRadialGradient(
            fruit.x, fruit.y, 0,
            fruit.x, fruit.y, 1.5
        );
        gradient.addColorStop(0, ColorUtils.addAlpha(elementColor, 0.6));
        gradient.addColorStop(1, ColorUtils.addAlpha(elementColor, 0));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(fruit.x, fruit.y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 元素符号
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 0.8px Arial';
        this.ctx.fillText(CONFIG.elements[fruit.element].name, fruit.x, fruit.y);
    }

    // 渲染地面道具
    renderGroundItem(item) {
        // 道具主体
        this.ctx.beginPath();
        this.ctx.roundRect(item.x - 0.6, item.y - 0.6, 1.2, 1.2, 0.2);
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 0.1;
        this.ctx.stroke();
        
        // 闪烁效果
        const time = Date.now() * 0.003;
        const alpha = 0.3 + 0.3 * Math.sin(time);
        this.ctx.fillStyle = ColorUtils.addAlpha('#ffd700', alpha);
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 渲染怪物
    renderMonsters() {
        if (!window.Game.gameState || !window.Game.gameState.entities) return;
        
        window.Game.gameState.entities.forEach(entity => {
            if (entity.type === 'monster') {
                this.renderMonster(entity);
            }
        });
    }

    // 渲染单个怪物
    renderMonster(monster) {
        // 怪物主体
        this.ctx.beginPath();
        this.ctx.arc(monster.x, monster.y, 1.2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fill();
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 0.2;
        this.ctx.stroke();
        
        // 血量条
        if (monster.hp < monster.maxHp) {
            this.renderHealthBar(monster.x, monster.y - 2, 2.4, 0.3, monster.hp, monster.maxHp);
        }
        
        // 元素标识
        if (monster.element) {
            const elementColor = CONFIG.elements[monster.element].color;
            this.ctx.fillStyle = elementColor;
            this.ctx.font = 'bold 0.6px Arial';
            this.ctx.fillText(CONFIG.elements[monster.element].name, monster.x, monster.y);
        }
    }

    // 渲染玩家
    renderPlayers() {
        if (!window.Game.gameState || !window.Game.gameState.players) return;
        
        Object.values(window.Game.gameState.players).forEach(player => {
            this.renderPlayer(player);
        });
    }

    // 渲染单个玩家
    renderPlayer(player) {
        const isLocalPlayer = window.Game.localPlayer && player.id === window.Game.localPlayer.id;
        
        // 玩家主体
        const radius = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
        
        // 元素颜色
        const elementColor = CONFIG.elements[player.element].color;
        this.ctx.fillStyle = elementColor;
        this.ctx.fill();
        
        // 边框（本地玩家特殊标识）
        if (isLocalPlayer) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 0.3;
            this.ctx.stroke();
        }
        
        // 血量条
        if (player.hp < player.maxHp || isLocalPlayer) {
            this.renderHealthBar(player.x, player.y - 3, 3, 0.4, player.hp, player.maxHp);
        }
        
        // 护盾条
        if (player.shieldHp && player.shieldHp > 0) {
            this.renderShieldBar(player.x, player.y - 3.8, 3, 0.3, player.shieldHp);
        }
        
        // 玩家名称
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 0.8px Arial';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 0.1;
        this.ctx.strokeText(player.name || `Player${player.id}`, player.x, player.y + 3);
        this.ctx.fillText(player.name || `Player${player.id}`, player.x, player.y + 3);
        
        // 状态效果
        this.renderPlayerEffects(player);
    }

    // 渲染玩家状态效果
    renderPlayerEffects(player) {
        let yOffset = -4.5;
        
        // 眩晕
        if (player.stunnedUntil && Date.now() < player.stunnedUntil) {
            this.renderStatusIcon(player.x - 1, player.y + yOffset, '⭐', '#ffff00');
            yOffset -= 0.8;
        }
        
        // 沉默
        if (player.silencedUntil && Date.now() < player.silencedUntil) {
            this.renderStatusIcon(player.x, player.y + yOffset, '🚫', '#ff0000');
            yOffset -= 0.8;
        }
        
        // 束缚
        if (player.rootedUntil && Date.now() < player.rootedUntil) {
            this.renderStatusIcon(player.x + 1, player.y + yOffset, '🌿', '#00ff00');
            yOffset -= 0.8;
        }
        
        // 无敌
        if (player.invulnUntil && Date.now() < player.invulnUntil) {
            this.renderStatusIcon(player.x, player.y + yOffset, '🛡️', '#ffd700');
        }
    }

    // 渲染状态图标
    renderStatusIcon(x, y, icon, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 0.8px Arial';
        this.ctx.fillText(icon, x, y);
    }

    // 渲染血量条
    renderHealthBar(x, y, width, height, current, max) {
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - width / 2, y, width, height);
        
        // 血量
        const healthPercent = current / max;
        const healthWidth = width * healthPercent;
        
        // 血量颜色渐变
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = '#00ff00';
        } else if (healthPercent > 0.3) {
            healthColor = '#ffff00';
        } else {
            healthColor = '#ff0000';
        }
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(x - width / 2, y, healthWidth, height);
        
        // 边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.05;
        this.ctx.strokeRect(x - width / 2, y, width, height);
    }

    // 渲染护盾条
    renderShieldBar(x, y, width, height, shield) {
        // 护盾条
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillRect(x - width / 2, y, width, height);
        
        // 边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.05;
        this.ctx.strokeRect(x - width / 2, y, width, height);
    }

    // 渲染特效
    renderEffects() {
        if (window.EffectsRenderer) {
            window.EffectsRenderer.render(this.ctx);
        }
    }

    // 渲染投射物
    renderProjectiles() {
        // 投射物渲染逻辑
        // 这里可以添加技能投射物的渲染
    }

    // 渲染UI（不受摄像机影响）
    renderUI() {
        // FPS显示
        if (CONFIG.ui.showFPS) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        }
        
        // 延迟显示
        if (CONFIG.ui.showPing && window.wsClient) {
            const latency = window.wsClient.getLatency();
            this.ctx.fillStyle = latency > 100 ? '#ff6b6b' : '#4ecdc4';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`延迟: ${latency}ms`, 10, 40);
        }
        
        // 重置文本对齐
        this.ctx.textAlign = 'center';
    }

    // 渲染调试信息
    renderDebugInfo() {
        if (!CONFIG.debug.enabled) return;
        
        let y = 60;
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        // 摄像机信息
        this.ctx.fillText(`Camera: (${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}) Zoom: ${this.camera.zoom.toFixed(2)}`, 10, y);
        y += 20;
        
        // 玩家信息
        if (window.Game.localPlayer) {
            const player = window.Game.localPlayer;
            this.ctx.fillText(`Player: (${player.x.toFixed(1)}, ${player.y.toFixed(1)}) HP: ${player.hp}/${player.maxHp}`, 10, y);
            y += 20;
        }
        
        // 连接信息
        if (window.wsClient) {
            const status = window.wsClient.isConnected() ? '已连接' : '未连接';
            this.ctx.fillText(`连接状态: ${status}`, 10, y);
            y += 20;
        }
        
        this.ctx.textAlign = 'center';
    }

    // 工具方法：屏幕坐标转世界坐标
    screenToWorld(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = screenX - rect.left;
        const y = screenY - rect.top;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const worldX = ((x - centerX) / (this.camera.zoom * 6)) + this.camera.x;
        const worldY = ((y - centerY) / (this.camera.zoom * 6)) + this.camera.y;
        
        return { x: worldX, y: worldY };
    }

    // 工具方法：世界坐标转屏幕坐标
    worldToScreen(worldX, worldY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const screenX = (worldX - this.camera.x) * this.camera.zoom * 6 + centerX;
        const screenY = (worldY - this.camera.y) * this.camera.zoom * 6 + centerY;
        
        return { x: screenX, y: screenY };
    }

    // 设置摄像机位置
    setCameraPosition(x, y) {
        this.camera.targetX = x;
        this.camera.targetY = y;
    }

    // 设置缩放级别
    setZoomLevel(zoom) {
        this.camera.zoom = MathUtils.clamp(zoom, CONFIG.graphics.camera.minZoom, CONFIG.graphics.camera.maxZoom);
    }

    // 更新世界大小
    updateWorldSize(width, height) {
        this.worldSize.width = width;
        this.worldSize.height = height;
    }

    // 更新安全圈
    updateSafeZone(x, y, radius) {
        this.safeZone.x = x;
        this.safeZone.y = y;
        this.safeZone.radius = radius;
    }

    // 获取FPS
    getFPS() {
        return this.fps;
    }
}

// 添加roundRect支持（如果浏览器不支持）
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// 导出渲染器
window.GameRenderer = GameRenderer;