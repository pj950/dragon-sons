// 龙生九子·五行对战 - UI管理系统

class UIManager {
    constructor() {
        this.currentScreen = 'title';
        this.notifications = [];
        this.maxNotifications = CONFIG.ui.notifications.maxCount;
        
        // UI元素缓存
        this.elements = {
            // 屏幕
            titleScreen: DOMUtils.$('#titleScreen'),
            gameScreen: DOMUtils.$('#gameScreen'),
            settingsScreen: DOMUtils.$('#settingsScreen'),
            loadingScreen: DOMUtils.$('#loadingScreen'),
            gameOverScreen: DOMUtils.$('#gameOverScreen'),
            
            // 游戏UI
            playerInfo: DOMUtils.$('#playerInfo'),
            skillBar: DOMUtils.$('#skillBar'),
            inventory: DOMUtils.$('#inventory'),
            minimap: DOMUtils.$('#minimap'),
            leaderboard: DOMUtils.$('#leaderboard'),
            chatBox: DOMUtils.$('#chatBox'),
            
            // 状态显示
            healthBar: DOMUtils.$('#healthBar'),
            healthText: DOMUtils.$('#healthText'),
            shieldBar: DOMUtils.$('#shieldBar'),
            shieldText: DOMUtils.$('#shieldText'),
            playerElement: DOMUtils.$('#playerElement'),
            
            // 其他
            notifications: DOMUtils.$('#notifications'),
            serverStatus: DOMUtils.$('#serverStatus'),
            onlineCount: DOMUtils.$('#onlineCount')
        };
        
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 主菜单按钮
        EventUtils.on(DOMUtils.$('#startGame'), 'click', () => this.startGame());
        EventUtils.on(DOMUtils.$('#spectateGame'), 'click', () => this.spectateGame());
        EventUtils.on(DOMUtils.$('#showSettings'), 'click', () => this.showSettingsScreen());
        
        // 游戏控制按钮
        EventUtils.on(DOMUtils.$('#toggleLeaderboard'), 'click', () => this.toggleLeaderboard());
        EventUtils.on(DOMUtils.$('#toggleChat'), 'click', () => this.toggleChat());
        EventUtils.on(DOMUtils.$('#leaveGame'), 'click', () => this.leaveGame());
        
        // 设置界面
        EventUtils.on(DOMUtils.$('#saveSettings'), 'click', () => this.saveSettings());
        EventUtils.on(DOMUtils.$('#cancelSettings'), 'click', () => this.showTitleScreen());
        
        // 游戏结束界面
        EventUtils.on(DOMUtils.$('#playAgain'), 'click', () => this.startGame());
        EventUtils.on(DOMUtils.$('#backToMenu'), 'click', () => this.showTitleScreen());
        
        // 技能槽点击
        DOMUtils.$$('.skill-slot').forEach((slot, index) => {
            EventUtils.on(slot, 'click', () => this.castSkillByIndex(index));
        });
        
        // 道具槽点击
        DOMUtils.$$('.item-slot').forEach((slot, index) => {
            EventUtils.on(slot, 'click', () => this.useItemByIndex(index));
        });
        
        // 设置控件
        EventUtils.on(DOMUtils.$('#soundVolume'), 'input', (e) => this.updateSoundVolume(e.target.value));
        EventUtils.on(DOMUtils.$('#graphicsQuality'), 'change', (e) => this.updateGraphicsQuality(e.target.value));
        EventUtils.on(DOMUtils.$('#showEffects'), 'change', (e) => this.updateShowEffects(e.target.checked));
    }

    // 显示屏幕
    showScreen(screenName) {
        // 隐藏所有屏幕
        Object.values(this.elements).forEach(element => {
            if (element && element.classList.contains('screen')) {
                DOMUtils.hide(element);
            }
        });
        
        // 显示目标屏幕
        const screen = this.elements[screenName + 'Screen'];
        if (screen) {
            DOMUtils.show(screen);
            this.currentScreen = screenName;
        }
    }

    // 显示标题屏幕
    showTitleScreen() {
        this.showScreen('title');
        window.inputManager.disableInput();
    }

    // 显示加载屏幕
    showLoadingScreen(text = '连接服务器中...') {
        this.showScreen('loading');
        this.updateLoadingText(text);
        window.inputManager.disableInput();
    }

    // 显示游戏屏幕
    showGameScreen() {
        this.showScreen('game');
        window.inputManager.enableInput();
    }

    // 显示设置屏幕
    showSettingsScreen() {
        this.showScreen('settings');
        this.loadSettingsUI();
    }

    // 显示游戏结束屏幕
    showGameOverScreen(stats) {
        this.showScreen('gameOver');
        this.updateGameOverStats(stats);
        window.inputManager.disableInput();
    }

    // 开始游戏
    startGame() {
        if (!window.wsClient.isConnected()) {
            this.showLoadingScreen('连接服务器中...');
            window.wsClient.connect();
            
            // 连接成功后自动进入游戏
            window.wsClient.addEventListener('connect', () => {
                this.showGameScreen();
                this.showNotification('已连接到服务器', 'success');
            });
            
            window.wsClient.addEventListener('error', () => {
                this.showTitleScreen();
                this.showNotification('连接服务器失败', 'error');
            });
        } else {
            this.showGameScreen();
        }
        
        window.audioManager.playUISound('click');
    }

    // 观战游戏
    spectateGame() {
        if (!window.wsClient.isConnected()) {
            this.showLoadingScreen('连接服务器中...');
            window.wsClient.connect();
        }
        
        // 发送观战请求
        window.wsClient.sendSpectate('default');
        this.showGameScreen();
        window.audioManager.playUISound('click');
    }

    // 离开游戏
    leaveGame() {
        window.wsClient.disconnect();
        this.showTitleScreen();
        this.showNotification('已离开游戏', 'info');
        window.audioManager.playUISound('click');
    }

    // 更新玩家信息
    updatePlayerInfo(player) {
        if (!player) return;
        
        // 更新血量
        this.updateHealthBar(player.hp, player.maxHp);
        
        // 更新护盾
        this.updateShieldBar(player.shieldHp || 0);
        
        // 更新元素
        this.updatePlayerElement(player.element);
        
        // 更新技能
        this.updateSkillBar(player.skills, player.cooldowns);
        
        // 更新背包
        this.updateInventory(player.bag, player.slots);
    }

    // 更新血量条
    updateHealthBar(current, max) {
        const percentage = (current / max) * 100;
        
        if (this.elements.healthBar) {
            this.elements.healthBar.style.width = percentage + '%';
        }
        
        if (this.elements.healthText) {
            this.elements.healthText.textContent = `${current}/${max}`;
        }
    }

    // 更新护盾条
    updateShieldBar(shield) {
        const percentage = Math.min((shield / 100) * 100, 100); // 假设最大护盾100
        
        if (this.elements.shieldBar) {
            this.elements.shieldBar.style.width = percentage + '%';
        }
        
        if (this.elements.shieldText) {
            this.elements.shieldText.textContent = shield.toString();
        }
    }

    // 更新玩家元素
    updatePlayerElement(element) {
        if (this.elements.playerElement) {
            this.elements.playerElement.textContent = CONFIG.elements[element]?.name || element;
            this.elements.playerElement.className = `element-badge element-${element}`;
        }
    }

    // 更新技能栏
    updateSkillBar(skills, cooldowns) {
        const skillSlots = DOMUtils.$$('.skill-slot');
        const now = Date.now();
        
        skillSlots.forEach((slot, index) => {
            const skillId = skills[index];
            const icon = slot.querySelector('.skill-icon');
            const cooldownOverlay = slot.querySelector('.cooldown-overlay');
            const cooldownText = slot.querySelector('.cooldown-text');
            
            if (skillId) {
                // 设置技能图标（暂时用颜色代替）
                const skillElement = this.getSkillElement(skillId);
                if (icon && skillElement) {
                    icon.style.backgroundColor = CONFIG.elements[skillElement].color;
                }
                
                // 更新冷却状态
                const cooldownEnd = cooldowns[skillId] || 0;
                const remainingTime = Math.max(0, cooldownEnd - now);
                
                if (remainingTime > 0) {
                    // 技能在冷却中
                    DOMUtils.removeClass(slot, 'available');
                    DOMUtils.addClass(slot, 'cooldown');
                    
                    const cooldownDuration = this.getSkillCooldown(skillId);
                    const progress = 1 - (remainingTime / cooldownDuration);
                    
                    if (cooldownOverlay) {
                        cooldownOverlay.style.height = (100 - progress * 100) + '%';
                    }
                    
                    if (cooldownText) {
                        cooldownText.textContent = Math.ceil(remainingTime / 1000);
                    }
                } else {
                    // 技能可用
                    DOMUtils.addClass(slot, 'available');
                    DOMUtils.removeClass(slot, 'cooldown');
                    
                    if (cooldownOverlay) {
                        cooldownOverlay.style.height = '0%';
                    }
                    
                    if (cooldownText) {
                        cooldownText.textContent = '';
                    }
                }
            } else {
                // 没有技能
                if (icon) {
                    icon.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
                DOMUtils.removeClass(slot, 'available');
                DOMUtils.removeClass(slot, 'cooldown');
            }
        });
    }

    // 更新背包
    updateInventory(bag, slots) {
        const itemSlots = DOMUtils.$$('.item-slot');
        
        itemSlots.forEach((slot, index) => {
            const itemId = slots[index];
            const icon = slot.querySelector('.item-icon');
            const count = slot.querySelector('.item-count');
            
            if (itemId && bag[itemId] > 0) {
                // 有道具
                if (icon) {
                    icon.style.backgroundColor = '#FFD700'; // 暂时用颜色代替图标
                }
                if (count) {
                    count.textContent = bag[itemId];
                    DOMUtils.show(count);
                }
            } else {
                // 没有道具
                if (icon) {
                    icon.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
                if (count) {
                    DOMUtils.hide(count);
                }
            }
        });
    }

    // 更新小地图
    updateMinimap(gameState) {
        const canvas = DOMUtils.$('#minimapCanvas');
        if (!canvas || !gameState) return;
        
        const ctx = canvas.getContext('2d');
        const size = CONFIG.ui.minimap.size;
        const zoom = CONFIG.ui.minimap.zoom;
        
        // 清空小地图
        ctx.clearRect(0, 0, size, size);
        
        // 绘制安全圈
        if (window.renderer && window.renderer.safeZone) {
            const zone = window.renderer.safeZone;
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = zone.radius * zoom * size / 100;
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 绘制玩家
        if (gameState.players) {
            Object.values(gameState.players).forEach(player => {
                const x = (player.x * zoom) * size / 100;
                const y = (player.y * zoom) * size / 100;
                
                ctx.fillStyle = CONFIG.elements[player.element]?.color || '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // 本地玩家特殊标识
                if (window.Game.localPlayer && player.id === window.Game.localPlayer.id) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }
    }

    // 更新排行榜
    updateLeaderboard(leaderboard) {
        const list = DOMUtils.$('#leaderboardList');
        if (!list || !leaderboard) return;
        
        list.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const item = DOMUtils.createElement('div', { className: 'leaderboard-item' });
            
            // 如果是本地玩家，添加特殊样式
            if (window.Game.localPlayer && entry.id === window.Game.localPlayer.id) {
                DOMUtils.addClass(item, 'self');
            }
            
            item.innerHTML = `
                <span>#${index + 1} ${entry.name || 'Player'}</span>
                <span>${entry.kills} 击杀</span>
            `;
            
            list.appendChild(item);
        });
    }

    // 切换排行榜显示
    toggleLeaderboard() {
        const leaderboard = this.elements.leaderboard;
        if (leaderboard) {
            DOMUtils.toggleClass(leaderboard, 'hidden');
        }
    }

    // 切换聊天框显示
    toggleChat() {
        const chatBox = this.elements.chatBox;
        if (chatBox) {
            DOMUtils.toggleClass(chatBox, 'hidden');
            CONFIG.ui.showChat = !DOMUtils.hasClass(chatBox, 'hidden');
        }
    }

    // 添加聊天消息
    addChatMessage(sender, message, type = 'player') {
        const chatMessages = DOMUtils.$('#chatMessages');
        if (!chatMessages) return;
        
        const messageElement = DOMUtils.createElement('div', { className: `chat-message ${type}` });
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 限制消息数量
        const messages = chatMessages.children;
        if (messages.length > 50) {
            chatMessages.removeChild(messages[0]);
        }
    }

    // 显示通知
    showNotification(message, type = 'info', duration = CONFIG.ui.notifications.duration) {
        // 限制通知数量
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldestNotification();
        }
        
        const notification = DOMUtils.createElement('div', { className: `notification ${type}` });
        notification.textContent = message;
        
        this.elements.notifications.appendChild(notification);
        this.notifications.push(notification);
        
        // 播放通知音效
        if (type === 'error') {
            window.audioManager.playUISound('error');
        } else if (type === 'success') {
            window.audioManager.playUISound('success');
        } else {
            window.audioManager.playUISound('notification');
        }
        
        // 自动移除
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    // 移除通知
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index !== -1) {
            this.notifications.splice(index, 1);
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }
    }

    // 移除最旧的通知
    removeOldestNotification() {
        if (this.notifications.length > 0) {
            this.removeNotification(this.notifications[0]);
        }
    }

    // 更新服务器状态
    updateServerStatus(status, color = '#4ECDC4') {
        if (this.elements.serverStatus) {
            this.elements.serverStatus.textContent = status;
            this.elements.serverStatus.style.color = color;
        }
    }

    // 更新在线人数
    updateOnlineCount(count) {
        if (this.elements.onlineCount) {
            this.elements.onlineCount.textContent = count.toString();
        }
    }

    // 更新加载文本
    updateLoadingText(text) {
        const loadingText = DOMUtils.$('#loadingText');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    // 更新游戏结束统计
    updateGameOverStats(stats) {
        const elements = {
            finalRank: DOMUtils.$('#finalRank'),
            finalKills: DOMUtils.$('#finalKills'),
            finalDamage: DOMUtils.$('#finalDamage'),
            finalTime: DOMUtils.$('#finalTime')
        };
        
        if (elements.finalRank) elements.finalRank.textContent = stats.rank || '-';
        if (elements.finalKills) elements.finalKills.textContent = stats.kills || '0';
        if (elements.finalDamage) elements.finalDamage.textContent = stats.damage || '0';
        if (elements.finalTime) elements.finalTime.textContent = TimeUtils.formatTime(stats.time || 0);
    }

    // 加载设置UI
    loadSettingsUI() {
        const soundVolume = DOMUtils.$('#soundVolume');
        const soundVolumeText = DOMUtils.$('#soundVolumeText');
        const graphicsQuality = DOMUtils.$('#graphicsQuality');
        const showEffects = DOMUtils.$('#showEffects');
        
        if (soundVolume) {
            soundVolume.value = CONFIG.audio.sfxVolume * 100;
        }
        if (soundVolumeText) {
            soundVolumeText.textContent = Math.round(CONFIG.audio.sfxVolume * 100) + '%';
        }
        if (graphicsQuality) {
            graphicsQuality.value = CONFIG.graphics.effects.quality;
        }
        if (showEffects) {
            showEffects.checked = CONFIG.graphics.effects.particles;
        }
    }

    // 保存设置
    saveSettings() {
        saveUserSettings();
        this.showNotification('设置已保存', 'success');
        this.showTitleScreen();
        window.audioManager.playUISound('success');
    }

    // 更新音量设置
    updateSoundVolume(value) {
        const volume = value / 100;
        window.audioManager.setSFXVolume(volume);
        
        const soundVolumeText = DOMUtils.$('#soundVolumeText');
        if (soundVolumeText) {
            soundVolumeText.textContent = value + '%';
        }
    }

    // 更新画面质量
    updateGraphicsQuality(quality) {
        CONFIG.graphics.effects.quality = quality;
    }

    // 更新特效显示
    updateShowEffects(show) {
        CONFIG.graphics.effects.particles = show;
    }

    // 释放技能（通过索引）
    castSkillByIndex(index) {
        window.inputManager.castSkill(index);
    }

    // 使用道具（通过索引）
    useItemByIndex(index) {
        window.inputManager.useItem(index);
    }

    // 获取技能元素
    getSkillElement(skillId) {
        // 简化的技能元素映射
        const skillElements = {
            'slash': 'metal', 'arcSlash': 'metal', 'metalClash': 'metal',
            'thunderChain': 'wood', 'windDash': 'wood', 'forestSnare': 'wood',
            'iceNova': 'water', 'waterJet': 'water', 'torrent': 'water',
            'flameBurst': 'fire', 'lavaZone': 'fire', 'meteor': 'fire',
            'stoneWall': 'earth', 'earthStomp': 'earth', 'quake': 'earth'
        };
        return skillElements[skillId] || 'metal';
    }

    // 获取技能冷却时间
    getSkillCooldown(skillId) {
        // 简化的技能冷却映射
        const skillCooldowns = {
            'slash': 4000, 'arcSlash': 3500, 'thunderChain': 6000,
            'stoneWall': 8000, 'earthStomp': 7000, 'flameBurst': 5000,
            'iceNova': 5200, 'windDash': 4000, 'waterJet': 3200
        };
        return skillCooldowns[skillId] || 5000;
    }

    // 显示暂停菜单
    showPauseMenu() {
        // 简化的暂停菜单
        const resume = confirm('游戏已暂停\n\n点击确定继续游戏\n点击取消返回主菜单');
        if (!resume) {
            this.leaveGame();
        }
    }

    // 获取当前屏幕
    getCurrentScreen() {
        return this.currentScreen;
    }

    // 检查是否在游戏中
    isInGame() {
        return this.currentScreen === 'game';
    }
}

// 创建全局UI管理器实例
window.UIManager = UIManager;
window.UI = new UIManager();