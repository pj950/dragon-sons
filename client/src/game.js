// 龙生九子·五行对战 - 游戏逻辑

class Game {
    constructor() {
        this.gameState = null;
        this.localPlayer = null;
        this.playerId = null;
        this.roomId = null;
        this.token = null;
        
        // 游戏状态
        this.matchState = null;
        this.leaderboard = [];
        
        // 插值和预测
        this.snapshots = [];
        this.maxSnapshots = CONFIG.game.snapshots;
        this.lastUpdateTime = 0;
        
        // 性能统计
        this.networkStats = {
            packetsReceived: 0,
            bytesReceived: 0,
            lastPacketTime: 0
        };
    }

    // 处理Hello消息
    handleHello(data) {
        console.log('Game initialized:', data);
        
        this.playerId = data.id;
        this.roomId = data.room;
        this.token = data.token;
        
        // 更新本地玩家元素
        if (data.element) {
            window.UI.updatePlayerElement(data.element);
        }
        
        window.UI.showNotification(`已加入房间 ${data.room}`, 'success');
        window.UI.updateServerStatus('已连接', '#4ECDC4');
    }

    // 处理快照消息
    handleSnapshot(data) {
        if (!data.s) return;
        
        // 更新网络统计
        this.updateNetworkStats(data);
        
        // 存储快照
        this.addSnapshot(data.s);
        
        // 更新游戏状态
        this.gameState = data.s;
        this.lastUpdateTime = Date.now();
        
        // 更新本地玩家
        this.updateLocalPlayer();
        
        // 更新匹配状态
        if (data.match) {
            this.matchState = data.match;
            this.updateMatchUI();
        }
        
        // 更新UI
        this.updateUI();
    }

    // 处理技能特效消息
    handleSkillEffect(data) {
        if (!data.effect) return;
        
        const effect = data.effect;
        console.log('Skill effect:', effect);
        
        // 播放音效
        if (effect.data?.effects) {
            this.playEffectAudio(effect);
        }
        
        // 播放视觉特效
        this.playEffectVisual(effect);
        
        // 屏幕效果
        this.playScreenEffects(effect);
    }

    // 播放特效音频
    playEffectAudio(effect) {
        const effects = effect.data.effects;
        
        if (effect.type === 'cast' && effects.castSound) {
            window.audioManager.playSound(effects.castSound, 0.8);
        } else if (effect.type === 'hit' && effects.hitSound) {
            window.audioManager.playSound(effects.hitSound, 1.0);
        } else if (effect.type === 'area' && effects.areaSound) {
            window.audioManager.playSound(effects.areaSound, 0.6);
        }
    }

    // 播放视觉特效
    playEffectVisual(effect) {
        if (!window.EffectsRenderer) return;
        
        const effects = effect.data?.effects;
        if (!effects) return;
        
        let effectName = null;
        
        if (effect.type === 'cast' && effects.castEffect) {
            effectName = effects.castEffect;
        } else if (effect.type === 'hit' && effects.hitEffect) {
            effectName = effects.hitEffect;
        } else if (effect.type === 'area' && effects.areaEffect) {
            effectName = effects.areaEffect;
        } else if (effect.type === 'projectile' && effects.projectileEffect) {
            effectName = effects.projectileEffect;
        }
        
        if (effectName && effect.x !== undefined && effect.y !== undefined) {
            window.EffectsRenderer.createEffect(effectName, effect.x, effect.y, effect.data);
        }
    }

    // 播放屏幕效果
    playScreenEffects(effect) {
        const effects = effect.data?.effects;
        if (!effects) return;
        
        // 屏幕震动
        if (effects.screenShake && window.EffectsRenderer) {
            window.EffectsRenderer.startScreenShake(effects.screenShake * 10, 300);
        }
        
        // 颜色闪烁
        if (effects.flashColor && window.EffectsRenderer) {
            window.EffectsRenderer.startColorFlash(effects.flashColor, 0.3, 200);
        }
    }

    // 处理房间列表
    handleRooms(data) {
        console.log('Rooms:', data.rooms);
        // 这里可以实现房间选择UI
    }

    // 处理倒计时取消
    handleCountdownCancel() {
        window.UI.showNotification('等待更多玩家加入...', 'info');
    }

    // 处理游戏开始
    handleGameStart() {
        window.UI.showNotification('游戏开始！', 'success');
        window.audioManager.playUISound('success');
    }

    // 添加快照
    addSnapshot(snapshot) {
        this.snapshots.push({
            data: snapshot,
            timestamp: Date.now()
        });
        
        // 限制快照数量
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }
    }

    // 更新本地玩家
    updateLocalPlayer() {
        if (!this.gameState?.players || !this.playerId) return;
        
        this.localPlayer = this.gameState.players[this.playerId];
        
        // 如果本地玩家死亡
        if (this.localPlayer && this.localPlayer.hp <= 0) {
            this.handlePlayerDeath();
        }
    }

    // 处理玩家死亡
    handlePlayerDeath() {
        window.UI.showNotification('你已死亡', 'error');
        window.inputManager.disableInput();
        
        // 延迟显示游戏结束界面
        setTimeout(() => {
            this.showGameOverScreen();
        }, 2000);
    }

    // 显示游戏结束界面
    showGameOverScreen() {
        const stats = this.calculateFinalStats();
        window.UI.showGameOverScreen(stats);
    }

    // 计算最终统计
    calculateFinalStats() {
        if (!this.localPlayer || !this.leaderboard) {
            return { rank: '-', kills: 0, damage: 0, time: 0 };
        }
        
        // 查找排名
        const rank = this.leaderboard.findIndex(entry => entry.id === this.playerId) + 1;
        
        return {
            rank: rank > 0 ? rank : '-',
            kills: this.localPlayer.kills || 0,
            damage: this.localPlayer.damageDealt || 0,
            time: Date.now() - (this.gameStartTime || Date.now())
        };
    }

    // 更新匹配UI
    updateMatchUI() {
        if (!this.matchState) return;
        
        // 更新存活人数
        if (this.matchState.leaderboard) {
            const aliveCount = this.matchState.leaderboard.filter(p => p.alive).length;
            window.UI.updateOnlineCount(aliveCount);
            
            // 更新排行榜
            this.leaderboard = this.matchState.leaderboard;
            window.UI.updateLeaderboard(this.leaderboard);
        }
        
        // 更新缩圈倒计时
        if (this.matchState.countdownEndAt) {
            const remaining = this.matchState.countdownEndAt - Date.now();
            const zoneTimer = DOMUtils.$('#zoneTimer');
            if (zoneTimer) {
                zoneTimer.textContent = TimeUtils.formatCountdown(Math.max(0, remaining));
            }
        }
        
        // 游戏状态
        if (this.matchState.state === 'ended') {
            this.handleGameEnd();
        }
    }

    // 处理游戏结束
    handleGameEnd() {
        window.UI.showNotification('游戏结束！', 'info');
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }

    // 更新UI
    updateUI() {
        if (this.localPlayer) {
            window.UI.updatePlayerInfo(this.localPlayer);
        }
        
        if (this.gameState) {
            window.UI.updateMinimap(this.gameState);
        }
    }

    // 更新网络统计
    updateNetworkStats(data) {
        this.networkStats.packetsReceived++;
        this.networkStats.bytesReceived += JSON.stringify(data).length;
        this.networkStats.lastPacketTime = Date.now();
    }

    // 检查技能是否在冷却
    isSkillOnCooldown(skillId) {
        if (!this.localPlayer?.cooldowns) return false;
        
        const cooldownEnd = this.localPlayer.cooldowns[skillId] || 0;
        return Date.now() < cooldownEnd;
    }

    // 获取技能剩余冷却时间
    getSkillCooldownRemaining(skillId) {
        if (!this.localPlayer?.cooldowns) return 0;
        
        const cooldownEnd = this.localPlayer.cooldowns[skillId] || 0;
        return Math.max(0, cooldownEnd - Date.now());
    }

    // 重置游戏状态
    reset() {
        this.gameState = null;
        this.localPlayer = null;
        this.playerId = null;
        this.roomId = null;
        this.matchState = null;
        this.leaderboard = [];
        this.snapshots = [];
        
        // 清理特效
        if (window.EffectsRenderer) {
            window.EffectsRenderer.clear();
        }
        
        console.log('Game state reset');
    }

    // 获取网络统计
    getNetworkStats() {
        return { ...this.networkStats };
    }

    // 获取性能统计
    getPerformanceStats() {
        return {
            fps: window.renderer?.getFPS() || 0,
            particles: window.EffectsRenderer?.getParticleCount() || 0,
            snapshots: this.snapshots.length,
            latency: window.wsClient?.getLatency() || 0
        };
    }

    // 开始游戏循环
    startGameLoop() {
        const update = (timestamp) => {
            this.update(timestamp);
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // 游戏更新循环
    update(timestamp) {
        // 这里可以添加客户端预测和插值逻辑
        
        // 更新UI（如果需要）
        if (this.localPlayer && window.UI.isInGame()) {
            // 更新技能冷却显示
            this.updateSkillCooldowns();
        }
    }

    // 更新技能冷却显示
    updateSkillCooldowns() {
        if (!this.localPlayer?.skills || !this.localPlayer?.cooldowns) return;
        
        window.UI.updateSkillBar(this.localPlayer.skills, this.localPlayer.cooldowns);
    }
}

// 创建全局游戏实例
window.Game = new Game();