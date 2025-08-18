// 龙生九子·五行对战 - 资源管理器

class AssetManager {
    constructor() {
        this.assets = {
            sounds: new Map(),
            images: new Map(),
            fonts: new Map()
        };
        
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        
        // 资源路径配置
        this.basePaths = {
            sounds: 'assets/sounds/',
            images: 'assets/images/',
            fonts: 'assets/fonts/'
        };
        
        // 默认资源（程序生成）
        this.useGeneratedAssets = true;
        this.audioGenerator = null;
        this.iconGenerator = null;
    }

    // 初始化资源管理器
    async initialize() {
        console.log('Initializing Asset Manager...');
        
        // 初始化生成器
        if (this.useGeneratedAssets) {
            this.audioGenerator = new AudioGenerator();
            this.iconGenerator = new IconGenerator();
            await this.audioGenerator.initialize();
        }
        
        console.log('Asset Manager initialized');
    }

    // 预加载核心资源
    async preloadCoreAssets() {
        console.log('Preloading core assets...');
        
        const coreAssets = {
            sounds: [
                'button_click.wav',
                'notification.wav', 
                'error.wav',
                'success.wav'
            ],
            images: [
                // 核心UI图标会在这里列出
            ]
        };
        
        await this.loadAssets(coreAssets);
        console.log('Core assets preloaded');
    }

    // 预加载游戏资源
    async preloadGameAssets() {
        console.log('Preloading game assets...');
        
        const gameAssets = {
            sounds: [
                // 金系音效
                'metal_charge.wav', 'metal_clang.wav', 'sword_whoosh.wav', 'metal_slice.wav',
                
                // 木系音效
                'thunder_charge.wav', 'thunder_crack.wav', 'wind_whoosh.wav', 'wind_rush.wav',
                
                // 水系音效
                'ice_form.wav', 'ice_shatter.wav', 'water_charge.wav', 'water_impact.wav',
                
                // 火系音效
                'fire_charge.wav', 'explosion.wav', 'fire_roar.wav', 'lava_bubble.wav',
                
                // 土系音效
                'stone_rumble.wav', 'stone_crack.wav', 'earth_charge.wav', 'earthquake.wav'
            ],
            images: [
                // 技能图标
                'slash.png', 'arcSlash.png', 'thunderChain.png', 'stoneWall.png',
                'flameBurst.png', 'iceNova.png', 'windDash.png', 'waterJet.png',
                
                // 道具图标
                'invuln.png', 'boots.png', 'potion.png', 'bomb.png', 'trap.png', 'blink.png',
                
                // 水果图标
                'metal_fruit.png', 'wood_fruit.png', 'water_fruit.png', 'fire_fruit.png', 'earth_fruit.png'
            ]
        };
        
        await this.loadAssets(gameAssets);
        console.log('Game assets preloaded');
    }

    // 加载资源列表
    async loadAssets(assetList) {
        const promises = [];
        this.totalCount = 0;
        this.loadedCount = 0;
        
        // 计算总数
        Object.values(assetList).forEach(list => {
            this.totalCount += list.length;
        });
        
        // 加载音效
        if (assetList.sounds) {
            assetList.sounds.forEach(filename => {
                promises.push(this.loadSound(filename));
            });
        }
        
        // 加载图像
        if (assetList.images) {
            assetList.images.forEach(filename => {
                promises.push(this.loadImage(filename));
            });
        }
        
        // 等待所有资源加载完成
        const results = await Promise.allSettled(promises);
        
        // 统计结果
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Assets loaded: ${successful} successful, ${failed} failed`);
        
        return { successful, failed, total: results.length };
    }

    // 加载音效文件
    async loadSound(filename) {
        const key = filename;
        
        if (this.assets.sounds.has(key)) {
            return this.assets.sounds.get(key);
        }
        
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const loadPromise = this.loadSoundFile(filename);
        this.loadingPromises.set(key, loadPromise);
        
        try {
            const audioBuffer = await loadPromise;
            this.assets.sounds.set(key, audioBuffer);
            this.loadingPromises.delete(key);
            this.updateProgress();
            return audioBuffer;
        } catch (error) {
            console.warn(`Failed to load sound: ${filename}`, error);
            this.loadingPromises.delete(key);
            this.updateProgress();
            throw error;
        }
    }

    // 加载音效文件实现
    async loadSoundFile(filename) {
        // 首先尝试生成的音效
        if (this.useGeneratedAssets && this.audioGenerator) {
            try {
                const soundType = this.getSoundType(filename);
                const params = this.getSoundParams(filename);
                return await this.audioGenerator.generateSound(soundType, params);
            } catch (error) {
                console.warn(`Failed to generate sound: ${filename}`, error);
            }
        }
        
        // 尝试加载实际文件
        try {
            const url = this.basePaths.sounds + filename;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioGenerator.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            // 创建静音替代
            console.warn(`Sound file not found: ${filename}, using silent buffer`);
            return this.audioGenerator.createSilentBuffer(0.5);
        }
    }

    // 加载图像文件
    async loadImage(filename) {
        const key = filename;
        
        if (this.assets.images.has(key)) {
            return this.assets.images.get(key);
        }
        
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const loadPromise = this.loadImageFile(filename);
        this.loadingPromises.set(key, loadPromise);
        
        try {
            const image = await loadPromise;
            this.assets.images.set(key, image);
            this.loadingPromises.delete(key);
            this.updateProgress();
            return image;
        } catch (error) {
            console.warn(`Failed to load image: ${filename}`, error);
            this.loadingPromises.delete(key);
            this.updateProgress();
            throw error;
        }
    }

    // 加载图像文件实现
    async loadImageFile(filename) {
        // 首先尝试生成的图标
        if (this.useGeneratedAssets && this.iconGenerator) {
            try {
                return await this.generateImageAsset(filename);
            } catch (error) {
                console.warn(`Failed to generate image: ${filename}`, error);
            }
        }
        
        // 尝试加载实际文件
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                // 创建占位符图像
                resolve(this.createPlaceholderImage(filename));
            };
            img.src = this.basePaths.images + filename;
        });
    }

    // 生成图像资源
    async generateImageAsset(filename) {
        const [name, ext] = filename.split('.');
        
        // 技能图标
        if (filename.includes('.png') && !filename.includes('_fruit')) {
            const skillData = await this.getSkillData(name);
            if (skillData) {
                const iconUrl = this.iconGenerator.generateSkillIcon(skillData);
                const img = new Image();
                return new Promise((resolve) => {
                    img.onload = () => resolve(img);
                    img.src = iconUrl;
                });
            }
        }
        
        // 道具图标
        if (filename.includes('_fruit.png') || ['invuln.png', 'boots.png', 'potion.png', 'bomb.png', 'trap.png', 'blink.png'].includes(filename)) {
            const itemData = await this.getItemData(name);
            if (itemData) {
                const iconUrl = this.iconGenerator.generateItemIcon(itemData);
                const img = new Image();
                return new Promise((resolve) => {
                    img.onload = () => resolve(img);
                    img.src = iconUrl;
                });
            }
        }
        
        throw new Error(`Cannot generate image: ${filename}`);
    }

    // 创建占位符图像
    createPlaceholderImage(filename) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 灰色背景
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, 64, 64);
        
        // 问号
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 32, 32);
        
        // 文件名
        ctx.font = '8px Arial';
        ctx.fillText(filename.split('.')[0], 32, 54);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    // 获取音效类型
    getSoundType(filename) {
        if (filename.includes('metal')) return 'metal_charge';
        if (filename.includes('thunder')) return 'thunder_crack';
        if (filename.includes('fire')) return 'fire_roar';
        if (filename.includes('ice')) return 'ice_shatter';
        if (filename.includes('earth') || filename.includes('stone')) return 'earth_rumble';
        if (filename.includes('wind')) return 'wind_whoosh';
        if (filename.includes('water')) return 'water_splash';
        if (filename.includes('button') || filename.includes('click')) return 'ui_click';
        if (filename.includes('notification')) return 'notification';
        return 'default';
    }

    // 获取音效参数
    getSoundParams(filename) {
        const params = { duration: 0.5, volume: 0.3 };
        
        if (filename.includes('charge')) params.duration = 0.8;
        if (filename.includes('explosion') || filename.includes('crash')) params.duration = 1.0;
        if (filename.includes('click')) params.duration = 0.1;
        if (filename.includes('whoosh')) params.duration = 0.4;
        
        return params;
    }

    // 获取技能数据
    async getSkillData(skillId) {
        // 简化的技能数据映射
        const skillsData = {
            'slash': { id: 'slash', name: '重斩', element: 'metal', rarity: 'common', symbol: '⚔️' },
            'arcSlash': { id: 'arcSlash', name: '弧形剑气', element: 'metal', rarity: 'common', symbol: '🌙' },
            'thunderChain': { id: 'thunderChain', name: '雷链', element: 'wood', rarity: 'rare', symbol: '⚡' },
            'stoneWall': { id: 'stoneWall', name: '石壁', element: 'earth', rarity: 'uncommon', symbol: '🧱' },
            'flameBurst': { id: 'flameBurst', name: '炎爆', element: 'fire', rarity: 'uncommon', symbol: '🔥' },
            'iceNova': { id: 'iceNova', name: '冰环', element: 'water', rarity: 'common', symbol: '❄️' }
        };
        
        return skillsData[skillId] || null;
    }

    // 获取道具数据
    async getItemData(itemId) {
        const itemsData = {
            'metal_fruit': { id: 'metal_fruit', name: '金果', type: 'fruit', symbol: '🥇', color: '#FFD700' },
            'wood_fruit': { id: 'wood_fruit', name: '木果', type: 'fruit', symbol: '🌰', color: '#228B22' },
            'water_fruit': { id: 'water_fruit', name: '水果', type: 'fruit', symbol: '🫐', color: '#1E90FF' },
            'fire_fruit': { id: 'fire_fruit', name: '火果', type: 'fruit', symbol: '🍎', color: '#FF4500' },
            'earth_fruit': { id: 'earth_fruit', name: '土果', type: 'fruit', symbol: '🥔', color: '#8B4513' },
            'invuln': { id: 'invuln', name: '金钟罩', type: 'consumable', symbol: '🛡️', color: '#FFD700', quality: 'epic' },
            'boots': { id: 'boots', name: '神行鞋', type: 'equipment', symbol: '👟', color: '#4ECDC4', quality: 'rare' },
            'potion': { id: 'potion', name: '疗愈丹', type: 'potion', symbol: '🧪', color: '#FF69B4', quality: 'common' },
            'bomb': { id: 'bomb', name: '火雷丸', type: 'consumable', symbol: '💣', color: '#FF4500', quality: 'uncommon' },
            'trap': { id: 'trap', name: '地刺阵', type: 'consumable', symbol: '🪤', color: '#8B4513', quality: 'uncommon' },
            'blink': { id: 'blink', name: '瞬身符', type: 'consumable', symbol: '✨', color: '#9370DB', quality: 'rare' }
        };
        
        return itemsData[itemId] || null;
    }

    // 获取音效
    getSound(filename) {
        return this.assets.sounds.get(filename);
    }

    // 获取图像
    getImage(filename) {
        return this.assets.images.get(filename);
    }

    // 播放音效
    async playSound(filename, volume = 1.0) {
        if (!window.audioManager) return;
        
        let audioBuffer = this.getSound(filename);
        
        // 如果没有加载，尝试加载
        if (!audioBuffer) {
            try {
                audioBuffer = await this.loadSound(filename);
            } catch (error) {
                console.warn(`Cannot play sound: ${filename}`, error);
                return;
            }
        }
        
        return window.audioManager.playSound(filename, volume);
    }

    // 获取图像元素
    getImageElement(filename) {
        const image = this.getImage(filename);
        if (image) {
            return image;
        }
        
        // 返回占位符
        return this.createPlaceholderImage(filename);
    }

    // 更新加载进度
    updateProgress() {
        this.loadedCount++;
        
        if (this.onProgress) {
            const progress = this.totalCount > 0 ? (this.loadedCount / this.totalCount) : 0;
            this.onProgress(progress, this.loadedCount, this.totalCount);
        }
    }

    // 设置进度回调
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    // 获取加载统计
    getLoadingStats() {
        return {
            sounds: this.assets.sounds.size,
            images: this.assets.images.size,
            total: this.assets.sounds.size + this.assets.images.size,
            loadedCount: this.loadedCount,
            totalCount: this.totalCount,
            progress: this.totalCount > 0 ? (this.loadedCount / this.totalCount) : 0
        };
    }

    // 清理资源
    cleanup() {
        this.assets.sounds.clear();
        this.assets.images.clear();
        this.loadingPromises.clear();
        
        console.log('Assets cleaned up');
    }

    // 预热资源（预先生成常用资源）
    async warmupAssets() {
        if (!this.useGeneratedAssets) return;
        
        console.log('Warming up generated assets...');
        
        try {
            // 预生成核心音效
            const coreAudioTypes = [
                { name: 'button_click.wav', type: 'ui_click', params: { duration: 0.1 } },
                { name: 'notification.wav', type: 'notification', params: { duration: 0.3 } },
                { name: 'metal_charge.wav', type: 'metal_charge', params: { duration: 0.8 } },
                { name: 'thunder_crack.wav', type: 'thunder_crack', params: { duration: 0.8 } }
            ];
            
            for (const audio of coreAudioTypes) {
                await this.audioGenerator.generateAndSave(audio.name, audio.type, audio.params);
            }
            
            // 预生成核心图标
            const coreIcons = ['slash', 'thunderChain', 'flameBurst', 'iceNova'];
            for (const iconId of coreIcons) {
                const skillData = await this.getSkillData(iconId);
                if (skillData) {
                    const iconUrl = this.iconGenerator.generateSkillIcon(skillData);
                    // 转换为Image对象并缓存
                    const img = new Image();
                    img.src = iconUrl;
                    this.assets.images.set(`${iconId}.png`, img);
                }
            }
            
            console.log('Asset warmup completed');
        } catch (error) {
            console.error('Asset warmup failed:', error);
        }
    }

    // 检查资源是否可用
    isAssetAvailable(type, filename) {
        return this.assets[type] && this.assets[type].has(filename);
    }

    // 获取所有已加载的资源列表
    getLoadedAssets() {
        return {
            sounds: Array.from(this.assets.sounds.keys()),
            images: Array.from(this.assets.images.keys())
        };
    }
}

// 创建全局资源管理器实例
window.AssetManager = AssetManager;
window.assetManager = new AssetManager();