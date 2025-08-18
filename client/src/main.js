// 龙生九子·五行对战 - 主入口文件

class DragonSonsClient {
    constructor() {
        this.initialized = false;
        this.renderer = null;
    }

    // 初始化客户端
    async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing Dragon Sons client...');
        
        try {
            // 初始化渲染器
            const canvas = DOMUtils.$('#gameCanvas');
            if (!canvas) {
                throw new Error('Game canvas not found');
            }
            
            this.renderer = new GameRenderer(canvas);
            window.renderer = this.renderer;
            
            // 设置WebSocket事件监听
            this.setupWebSocketEvents();
            
            // 设置窗口事件
            this.setupWindowEvents();
            
            // 开始渲染循环
            this.renderer.startRenderLoop();
            
            // 开始游戏循环
            window.Game.startGameLoop();
            
            // 初始化完成
            this.initialized = true;
            console.log('Dragon Sons client initialized successfully');
            
            // 显示初始UI状态
            this.updateInitialUI();
            
        } catch (error) {
            console.error('Failed to initialize client:', error);
            window.UI.showNotification('客户端初始化失败', 'error');
        }
    }

    // 设置WebSocket事件
    setupWebSocketEvents() {
        // 连接事件
        window.wsClient.addEventListener('connect', () => {
            console.log('Connected to server');
            window.UI.updateServerStatus('已连接', '#4ECDC4');
            window.UI.showNotification('已连接到服务器', 'success');
        });

        // 断开连接事件
        window.wsClient.addEventListener('disconnect', (event) => {
            console.log('Disconnected from server:', event);
            window.UI.updateServerStatus('已断开', '#FF6B6B');
            window.UI.showNotification('与服务器断开连接', 'error');
            
            // 如果在游戏中，返回主菜单
            if (window.UI.isInGame()) {
                setTimeout(() => {
                    window.UI.showTitleScreen();
                    window.Game.reset();
                }, 2000);
            }
        });

        // 重连事件
        window.wsClient.addEventListener('reconnect', (attempts) => {
            console.log('Reconnecting...', attempts);
            window.UI.updateServerStatus(`重连中 (${attempts})`, '#FFD700');
            window.UI.showNotification(`正在重连... (${attempts})`, 'warning');
        });

        // 错误事件
        window.wsClient.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            window.UI.updateServerStatus('连接错误', '#FF6B6B');
            window.UI.showNotification('连接错误', 'error');
        });
    }

    // 设置窗口事件
    setupWindowEvents() {
        // 窗口大小变化
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.setupCanvas();
            }
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停音效
                if (window.audioManager) {
                    window.audioManager.stopAllSounds();
                }
            }
        });

        // 页面卸载前清理
        window.addEventListener('beforeunload', () => {
            if (window.wsClient) {
                window.wsClient.disconnect();
            }
        });

        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            window.UI.showNotification('发生错误，请刷新页面', 'error');
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    // 更新初始UI状态
    updateInitialUI() {
        // 设置初始服务器状态
        window.UI.updateServerStatus('未连接', '#FF6B6B');
        window.UI.updateOnlineCount(0);
        
        // 显示标题屏幕
        window.UI.showTitleScreen();
        
        // 如果配置了自动连接，则尝试连接
        if (CONFIG.server.autoConnect) {
            setTimeout(() => {
                window.wsClient.connect();
            }, 1000);
        }
    }

    // 获取客户端状态
    getStatus() {
        return {
            initialized: this.initialized,
            connected: window.wsClient?.isConnected() || false,
            gameState: window.Game.gameState ? 'active' : 'inactive',
            playerId: window.Game.playerId,
            roomId: window.Game.roomId,
            screen: window.UI.getCurrentScreen()
        };
    }

    // 获取性能信息
    getPerformanceInfo() {
        return {
            client: {
                fps: this.renderer?.getFPS() || 0,
                particles: window.EffectsRenderer?.getParticleCount() || 0,
                memoryUsage: PerformanceUtils.getMemoryUsage()
            },
            network: {
                latency: window.wsClient?.getLatency() || 0,
                connected: window.wsClient?.isConnected() || false,
                reconnectAttempts: window.wsClient?.getReconnectAttempts() || 0,
                ...window.Game.getNetworkStats()
            },
            audio: {
                enabled: window.audioManager?.isEnabled() || false,
                context: window.audioManager?.getAudioContextState() || 'closed',
                activeSources: window.audioManager?.getActiveSources() || 0
            }
        };
    }

    // 开启调试模式
    enableDebugMode() {
        CONFIG.debug.enabled = true;
        CONFIG.ui.showFPS = true;
        CONFIG.ui.showPing = true;
        CONFIG.ui.showDebugInfo = true;
        console.log('Debug mode enabled');
    }

    // 关闭调试模式
    disableDebugMode() {
        CONFIG.debug.enabled = false;
        CONFIG.ui.showFPS = false;
        CONFIG.ui.showPing = false;
        CONFIG.ui.showDebugInfo = false;
        console.log('Debug mode disabled');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing Dragon Sons client...');
    
    try {
        // 创建客户端实例
        window.dragonSonsClient = new DragonSonsClient();
        
        // 初始化客户端
        await window.dragonSonsClient.initialize();
        
        // 添加全局调试函数
        window.debugInfo = () => {
            console.log('=== Dragon Sons Debug Info ===');
            console.log('Client Status:', window.dragonSonsClient.getStatus());
            console.log('Performance:', window.dragonSonsClient.getPerformanceInfo());
            console.log('Config:', CONFIG);
            console.log('Game State:', window.Game.gameState);
            console.log('Local Player:', window.Game.localPlayer);
        };
        
        window.enableDebug = () => window.dragonSonsClient.enableDebugMode();
        window.disableDebug = () => window.dragonSonsClient.disableDebugMode();
        
        console.log('Dragon Sons client ready! Type debugInfo() for debug information.');
        
    } catch (error) {
        console.error('Failed to initialize Dragon Sons client:', error);
        alert('游戏初始化失败，请刷新页面重试');
    }
});

// 导出主类
window.DragonSonsClient = DragonSonsClient;