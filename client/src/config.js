// 龙生九子·五行对战 - 客户端配置

const CONFIG = {
    // 服务器配置
    server: {
        host: 'localhost',
        port: 8787,
        secure: false, // 是否使用WSS
        reconnectInterval: 3000,
        maxReconnectAttempts: 5
    },

    // 游戏配置
    game: {
        tickRate: 20, // 服务器tick频率
        interpolation: true, // 是否启用插值
        prediction: true, // 是否启用预测
        snapshots: 60 // 保留的快照数量
    },

    // 渲染配置
    graphics: {
        canvas: {
            width: 1200,
            height: 800,
            scale: 1.0
        },
        camera: {
            followPlayer: true,
            smoothing: 0.1,
            zoomLevel: 1.0,
            minZoom: 0.5,
            maxZoom: 2.0
        },
        effects: {
            particles: true,
            screenShake: true,
            colorFlash: true,
            quality: 'medium' // low, medium, high
        }
    },

    // 音频配置
    audio: {
        enabled: true,
        masterVolume: 0.8,
        sfxVolume: 0.8,
        musicVolume: 0.6,
        maxSources: 32
    },

    // 输入配置
    input: {
        keys: {
            // 移动
            moveUp: ['KeyW', 'ArrowUp'],
            moveDown: ['KeyS', 'ArrowDown'], 
            moveLeft: ['KeyA', 'ArrowLeft'],
            moveRight: ['KeyD', 'ArrowRight'],
            
            // 技能
            skill1: ['KeyQ'],
            skill2: ['KeyW'],
            skill3: ['KeyE'],
            skill4: ['KeyR'],
            
            // 道具
            item1: ['Digit1'],
            item2: ['Digit2'],
            item3: ['Digit3'],
            
            // UI
            toggleLeaderboard: ['Tab'],
            toggleChat: ['Enter'],
            escape: ['Escape']
        },
        mouse: {
            sensitivity: 1.0,
            rightClickSkill: true // 右键释放技能
        }
    },

    // UI配置
    ui: {
        showFPS: false,
        showPing: true,
        showDebugInfo: false,
        minimap: {
            size: 150,
            zoom: 0.1
        },
        notifications: {
            duration: 3000,
            maxCount: 5
        }
    },

    // 五行元素配置
    elements: {
        metal: {
            name: '金',
            color: '#FFD700',
            darkColor: '#B8860B'
        },
        wood: {
            name: '木', 
            color: '#228B22',
            darkColor: '#006400'
        },
        water: {
            name: '水',
            color: '#1E90FF',
            darkColor: '#0066CC'
        },
        fire: {
            name: '火',
            color: '#FF4500',
            darkColor: '#CC3300'
        },
        earth: {
            name: '土',
            color: '#8B4513',
            darkColor: '#654321'
        }
    },

    // 技能分类配置
    skillCategories: {
        '攻击': {
            color: '#FF6B6B',
            icon: '⚔️'
        },
        '防御': {
            color: '#4ECDC4',
            icon: '🛡️'
        },
        '控制': {
            color: '#45B7D1', 
            icon: '🔒'
        },
        '位移': {
            color: '#96CEB4',
            icon: '💨'
        },
        '被动': {
            color: '#FFEAA7',
            icon: '✨'
        },
        '区域': {
            color: '#DDA0DD',
            icon: '🌀'
        }
    },

    // 调试配置
    debug: {
        enabled: false,
        showHitboxes: false,
        showNetworkStats: false,
        showPerformanceStats: false,
        logLevel: 'info' // debug, info, warn, error
    }
};

// 根据环境调整配置
if (window.location.hostname !== 'localhost') {
    CONFIG.server.host = window.location.hostname;
    CONFIG.server.secure = window.location.protocol === 'https:';
}

// 从localStorage加载用户设置
function loadUserSettings() {
    const saved = localStorage.getItem('dragonSonsSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            // 合并设置
            if (settings.audio) {
                Object.assign(CONFIG.audio, settings.audio);
            }
            if (settings.graphics) {
                Object.assign(CONFIG.graphics, settings.graphics);
            }
            if (settings.input) {
                Object.assign(CONFIG.input, settings.input);
            }
            if (settings.ui) {
                Object.assign(CONFIG.ui, settings.ui);
            }
        } catch (e) {
            console.warn('Failed to load user settings:', e);
        }
    }
}

// 保存用户设置
function saveUserSettings() {
    const settings = {
        audio: CONFIG.audio,
        graphics: CONFIG.graphics,
        input: CONFIG.input,
        ui: CONFIG.ui
    };
    localStorage.setItem('dragonSonsSettings', JSON.stringify(settings));
}

// 获取WebSocket URL
function getWebSocketURL() {
    const protocol = CONFIG.server.secure ? 'wss:' : 'ws:';
    return `${protocol}//${CONFIG.server.host}:${CONFIG.server.port}`;
}

// 导出配置
window.CONFIG = CONFIG;
window.loadUserSettings = loadUserSettings;
window.saveUserSettings = saveUserSettings;
window.getWebSocketURL = getWebSocketURL;

// 初始化时加载设置
loadUserSettings();