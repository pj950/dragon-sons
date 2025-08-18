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

    // 角色样式配置
    characters: {
        qiuniu: {
            name: '囚牛',
            bodyColor: '#FFD700',
            accentColor: '#32CD32', 
            symbol: '🎵',
            size: 1.0,
            specialEffect: 'musical_notes',
            personality: '沉稳、艺术气质、平衡感强'
        },
        yazi: {
            name: '睚眦',
            bodyColor: '#DC143C',
            accentColor: '#C0C0C0',
            symbol: '⚔️', 
            size: 1.1,
            specialEffect: 'blade_aura',
            personality: '好斗、激进、暴烈'
        },
        chaofeng: {
            name: '嘲风',
            bodyColor: '#40E0D0',
            accentColor: '#87CEEB',
            symbol: '🌪️',
            size: 0.9,
            specialEffect: 'wind_trail',
            personality: '机敏、冒险、不拘一格'
        },
        pulao: {
            name: '蒲牢',
            bodyColor: '#FFD700',
            accentColor: '#4169E1',
            symbol: '📯',
            size: 0.95,
            specialEffect: 'sound_waves',
            personality: '活跃、声音洪亮、速度至上'
        },
        suanni: {
            name: '狻猊',
            bodyColor: '#FF4500',
            accentColor: '#8A2BE2',
            symbol: '🔥',
            size: 1.05,
            specialEffect: 'smoke_swirl',
            personality: '威严、稳重、力量感强'
        },
        bixi: {
            name: '赑屃',
            bodyColor: '#8B4513',
            accentColor: '#696969',
            symbol: '🗿',
            size: 1.2,
            specialEffect: 'stone_debris',
            personality: '坚韧、可靠、承担重任'
        },
        bixie: {
            name: '狴犴',
            bodyColor: '#B8860B',
            accentColor: '#F8F8FF',
            symbol: '⚖️',
            size: 1.0,
            specialEffect: 'justice_light',
            personality: '公正、严肃、守护秩序'
        },
        fuxi: {
            name: '负屃',
            bodyColor: '#191970',
            accentColor: '#F5F5DC',
            symbol: '📜',
            size: 0.95,
            specialEffect: 'text_swirl',
            personality: '智慧、文雅、机敏'
        },
        chiwen: {
            name: '蚩吻',
            bodyColor: '#006994',
            accentColor: '#FF6347',
            symbol: '🌊',
            size: 1.1,
            specialEffect: 'water_fire_mix',
            personality: '包容、变化、平衡'
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