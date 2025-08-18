// 龙生九子·五行对战 - 输入处理系统

class InputManager {
    constructor() {
        this.keys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.isMouseOverCanvas = false;
        
        // 移动状态
        this.movement = { vx: 0, vy: 0 };
        this.lastMoveTime = 0;
        this.moveSendInterval = 1000 / 30; // 30fps发送频率
        
        // 输入状态
        this.inputEnabled = false;
        this.chatMode = false;
        
        // 绑定事件
        this.setupEventListeners();
        
        // 开始输入循环
        this.startInputLoop();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标事件
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // 画布事件
        const canvas = DOMUtils.$('#gameCanvas');
        if (canvas) {
            canvas.addEventListener('mouseenter', () => this.isMouseOverCanvas = true);
            canvas.addEventListener('mouseleave', () => this.isMouseOverCanvas = false);
        }
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    // 键盘按下
    handleKeyDown(e) {
        // 聊天模式下只处理特殊按键
        if (this.chatMode) {
            if (e.code === 'Enter') {
                this.handleChatSubmit();
                e.preventDefault();
            } else if (e.code === 'Escape') {
                this.exitChatMode();
                e.preventDefault();
            }
            return;
        }
        
        this.keys.add(e.code);
        
        // 处理即时按键
        this.handleInstantKey(e.code);
        
        e.preventDefault();
    }

    // 键盘抬起
    handleKeyUp(e) {
        this.keys.delete(e.code);
        e.preventDefault();
    }

    // 鼠标移动
    handleMouseMove(e) {
        const canvas = DOMUtils.$('#gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        }
    }

    // 鼠标按下
    handleMouseDown(e) {
        this.mouseButtons.add(e.button);
        
        if (!this.inputEnabled || !this.isMouseOverCanvas) return;
        
        // 左键 - 移动或攻击
        if (e.button === 0) {
            this.handleLeftClick(e);
        }
        
        // 右键 - 技能释放
        if (e.button === 2 && CONFIG.input.mouse.rightClickSkill) {
            this.handleRightClick(e);
        }
        
        e.preventDefault();
    }

    // 鼠标抬起
    handleMouseUp(e) {
        this.mouseButtons.delete(e.button);
        e.preventDefault();
    }

    // 处理即时按键
    handleInstantKey(code) {
        if (!this.inputEnabled) {
            // 非游戏状态下的按键
            this.handleMenuKey(code);
            return;
        }
        
        // 技能按键
        if (this.isKeyFor(code, 'skill1')) {
            this.castSkill(0);
        } else if (this.isKeyFor(code, 'skill2')) {
            this.castSkill(1);
        } else if (this.isKeyFor(code, 'skill3')) {
            this.castSkill(2);
        } else if (this.isKeyFor(code, 'skill4')) {
            this.castSkill(3);
        }
        
        // 道具按键
        else if (this.isKeyFor(code, 'item1')) {
            this.useItem(0);
        } else if (this.isKeyFor(code, 'item2')) {
            this.useItem(1);
        } else if (this.isKeyFor(code, 'item3')) {
            this.useItem(2);
        }
        
        // UI按键
        else if (this.isKeyFor(code, 'toggleLeaderboard')) {
            window.UI.toggleLeaderboard();
        } else if (this.isKeyFor(code, 'toggleChat')) {
            this.enterChatMode();
        } else if (this.isKeyFor(code, 'escape')) {
            window.UI.showPauseMenu();
        }
    }

    // 处理菜单按键
    handleMenuKey(code) {
        if (code === 'Enter') {
            const startButton = DOMUtils.$('#startGame');
            if (startButton && !startButton.disabled) {
                startButton.click();
            }
        } else if (code === 'Escape') {
            window.UI.showTitleScreen();
        }
    }

    // 检查按键是否匹配功能
    isKeyFor(code, action) {
        const keys = CONFIG.input.keys[action];
        return keys && keys.includes(code);
    }

    // 开始输入循环
    startInputLoop() {
        const update = () => {
            if (this.inputEnabled && !this.chatMode) {
                this.updateMovement();
            }
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // 更新移动
    updateMovement() {
        let vx = 0;
        let vy = 0;
        
        // 检查移动按键
        if (this.isKeyPressed('moveLeft')) vx -= 1;
        if (this.isKeyPressed('moveRight')) vx += 1;
        if (this.isKeyPressed('moveUp')) vy -= 1;
        if (this.isKeyPressed('moveDown')) vy += 1;
        
        // 标准化对角线移动
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }
        
        // 检查是否需要发送移动消息
        const now = Date.now();
        if (now - this.lastMoveTime >= this.moveSendInterval) {
            if (vx !== this.movement.vx || vy !== this.movement.vy) {
                this.movement.vx = vx;
                this.movement.vy = vy;
                
                if (window.wsClient && window.wsClient.isConnected()) {
                    window.wsClient.sendMove(vx, vy);
                }
                
                this.lastMoveTime = now;
            }
        }
    }

    // 检查按键是否按下
    isKeyPressed(action) {
        const keys = CONFIG.input.keys[action];
        if (!keys) return false;
        
        return keys.some(key => this.keys.has(key));
    }

    // 处理左键点击
    handleLeftClick(e) {
        const worldPos = window.renderer.screenToWorld(this.mousePosition.x, this.mousePosition.y);
        
        // 检查是否点击了其他玩家（攻击）
        const targetPlayer = this.getPlayerAtPosition(worldPos.x, worldPos.y);
        if (targetPlayer && targetPlayer.id !== window.Game.localPlayer?.id) {
            this.attackTarget(targetPlayer.id);
            return;
        }
        
        // 检查是否点击了地面物品（拾取）
        const groundItem = this.getGroundItemAtPosition(worldPos.x, worldPos.y);
        if (groundItem) {
            this.pickupItem(groundItem.id);
            return;
        }
        
        // 移动到点击位置
        this.moveToPosition(worldPos.x, worldPos.y);
    }

    // 处理右键点击
    handleRightClick(e) {
        const worldPos = window.renderer.screenToWorld(this.mousePosition.x, this.mousePosition.y);
        
        // 检查是否点击了其他玩家（技能攻击）
        const targetPlayer = this.getPlayerAtPosition(worldPos.x, worldPos.y);
        if (targetPlayer && targetPlayer.id !== window.Game.localPlayer?.id) {
            this.castSkillAtTarget(0, targetPlayer.id); // 默认使用第一个技能
        }
    }

    // 获取位置上的玩家
    getPlayerAtPosition(x, y) {
        if (!window.Game.gameState?.players) return null;
        
        const clickRadius = 2; // 点击检测半径
        
        for (const player of Object.values(window.Game.gameState.players)) {
            const distance = MathUtils.distance(x, y, player.x, player.y);
            if (distance <= clickRadius) {
                return player;
            }
        }
        
        return null;
    }

    // 获取位置上的地面物品
    getGroundItemAtPosition(x, y) {
        if (!window.Game.gameState?.entities) return null;
        
        const clickRadius = 1.5;
        
        for (const entity of window.Game.gameState.entities) {
            if (entity.type === 'fruit' || entity.type === 'item') {
                const distance = MathUtils.distance(x, y, entity.x, entity.y);
                if (distance <= clickRadius) {
                    return entity;
                }
            }
        }
        
        return null;
    }

    // 移动到位置
    moveToPosition(x, y) {
        if (!window.Game.localPlayer) return;
        
        const player = window.Game.localPlayer;
        const dx = x - player.x;
        const dy = y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
            const vx = dx / distance;
            const vy = dy / distance;
            
            if (window.wsClient && window.wsClient.isConnected()) {
                window.wsClient.sendMove(vx, vy);
            }
        }
    }

    // 攻击目标
    attackTarget(targetId) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendAttack(targetId);
            window.audioManager.playUISound('click');
        }
    }

    // 拾取物品
    pickupItem(entityId) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendPickup(entityId);
            window.audioManager.playUISound('success');
        }
    }

    // 释放技能
    castSkill(skillIndex) {
        if (!window.Game.localPlayer?.skills) return;
        
        const skillId = window.Game.localPlayer.skills[skillIndex];
        if (!skillId) return;
        
        // 检查冷却
        if (window.Game.isSkillOnCooldown(skillId)) {
            window.audioManager.playUISound('error');
            return;
        }
        
        // 需要目标的技能
        const needsTarget = !this.isAOESkill(skillId);
        
        if (needsTarget) {
            // 寻找最近的敌人作为目标
            const target = this.findNearestEnemy();
            if (target) {
                this.castSkillAtTarget(skillIndex, target.id);
            } else {
                window.UI.showNotification('没有可攻击的目标', 'warning');
                window.audioManager.playUISound('error');
            }
        } else {
            // AOE技能直接释放
            this.castSkillAtTarget(skillIndex, window.Game.localPlayer.id);
        }
    }

    // 对目标释放技能
    castSkillAtTarget(skillIndex, targetId) {
        if (!window.Game.localPlayer?.skills) return;
        
        const skillId = window.Game.localPlayer.skills[skillIndex];
        if (!skillId) return;
        
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendCast(skillId, targetId);
            window.audioManager.playSkillSound(skillId, 'cast');
        }
    }

    // 使用道具
    useItem(slotIndex) {
        if (window.wsClient && window.wsClient.isConnected()) {
            window.wsClient.sendUseSlot(slotIndex);
            window.audioManager.playUISound('click');
        }
    }

    // 检查是否是AOE技能
    isAOESkill(skillId) {
        const aoeSkills = [
            'arcSlash', 'earthStomp', 'flameBurst', 'iceNova', 
            'stoneWall', 'lavaZone', 'cyclone', 'staticField', 
            'quake', 'blizzard', 'meteor'
        ];
        return aoeSkills.includes(skillId);
    }

    // 寻找最近的敌人
    findNearestEnemy() {
        if (!window.Game.localPlayer || !window.Game.gameState?.players) return null;
        
        const localPlayer = window.Game.localPlayer;
        let nearestEnemy = null;
        let minDistance = Infinity;
        const maxRange = 15; // 最大攻击范围
        
        for (const player of Object.values(window.Game.gameState.players)) {
            if (player.id === localPlayer.id || player.hp <= 0) continue;
            
            const distance = MathUtils.distance(
                localPlayer.x, localPlayer.y,
                player.x, player.y
            );
            
            if (distance <= maxRange && distance < minDistance) {
                minDistance = distance;
                nearestEnemy = player;
            }
        }
        
        return nearestEnemy;
    }

    // 进入聊天模式
    enterChatMode() {
        this.chatMode = true;
        const chatInput = DOMUtils.$('#chatInput');
        const chatBox = DOMUtils.$('#chatBox');
        
        if (chatInput && chatBox) {
            DOMUtils.show(chatBox);
            chatInput.focus();
            chatInput.value = '';
        }
    }

    // 退出聊天模式
    exitChatMode() {
        this.chatMode = false;
        const chatInput = DOMUtils.$('#chatInput');
        const chatBox = DOMUtils.$('#chatBox');
        
        if (chatInput) {
            chatInput.blur();
        }
        
        if (chatBox && !CONFIG.ui.showChat) {
            DOMUtils.hide(chatBox);
        }
    }

    // 处理聊天提交
    handleChatSubmit() {
        const chatInput = DOMUtils.$('#chatInput');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (message) {
            // 发送聊天消息（如果服务端支持）
            if (window.wsClient && window.wsClient.isConnected()) {
                window.wsClient.send({ t: 'chat', message });
            }
            
            // 本地显示
            window.UI.addChatMessage('你', message, 'player');
        }
        
        this.exitChatMode();
    }

    // 启用输入
    enableInput() {
        this.inputEnabled = true;
        console.log('Input enabled');
    }

    // 禁用输入
    disableInput() {
        this.inputEnabled = false;
        this.keys.clear();
        this.mouseButtons.clear();
        this.movement.vx = 0;
        this.movement.vy = 0;
        console.log('Input disabled');
    }

    // 检查输入是否启用
    isInputEnabled() {
        return this.inputEnabled;
    }

    // 获取当前移动向量
    getMovement() {
        return { ...this.movement };
    }

    // 获取鼠标位置
    getMousePosition() {
        return { ...this.mousePosition };
    }

    // 获取鼠标世界坐标
    getMouseWorldPosition() {
        if (window.renderer) {
            return window.renderer.screenToWorld(this.mousePosition.x, this.mousePosition.y);
        }
        return { x: 0, y: 0 };
    }

    // 检查按键是否按下
    isKeyDown(code) {
        return this.keys.has(code);
    }

    // 检查鼠标按钮是否按下
    isMouseButtonDown(button) {
        return this.mouseButtons.has(button);
    }

    // 设置键位绑定
    setKeyBinding(action, keys) {
        CONFIG.input.keys[action] = Array.isArray(keys) ? keys : [keys];
        saveUserSettings();
    }

    // 获取键位绑定
    getKeyBinding(action) {
        return CONFIG.input.keys[action] || [];
    }

    // 重置为默认键位
    resetToDefaults() {
        // 重新加载默认配置
        loadUserSettings();
    }
}

// 创建全局输入管理器实例
window.InputManager = InputManager;
window.inputManager = new InputManager();