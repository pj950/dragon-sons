// 龙生九子·五行对战 - 音效系统

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        
        this.sounds = new Map();
        this.loadingPromises = new Map();
        this.activeSources = [];
        
        this.initialized = false;
        this.enabled = CONFIG.audio.enabled;
        
        // 音效文件映射
        this.soundFiles = this.setupSoundFiles();
    }

    // 设置音效文件映射
    setupSoundFiles() {
        return {
            // 金系音效
            'metal_charge.wav': 'assets/sounds/metal_charge.wav',
            'metal_clang.wav': 'assets/sounds/metal_clang.wav',
            'sword_whoosh.wav': 'assets/sounds/sword_whoosh.wav',
            'metal_slice.wav': 'assets/sounds/metal_slice.wav',
            'metal_ring.wav': 'assets/sounds/metal_ring.wav',
            'electric_charge.wav': 'assets/sounds/electric_charge.wav',
            'blade_slice.wav': 'assets/sounds/blade_slice.wav',
            'metal_rain.wav': 'assets/sounds/metal_rain.wav',
            
            // 木系音效
            'thunder_charge.wav': 'assets/sounds/thunder_charge.wav',
            'thunder_crack.wav': 'assets/sounds/thunder_crack.wav',
            'wind_whoosh.wav': 'assets/sounds/wind_whoosh.wav',
            'wind_rush.wav': 'assets/sounds/wind_rush.wav',
            'wood_grow.wav': 'assets/sounds/wood_grow.wav',
            'vine_rustle.wav': 'assets/sounds/vine_rustle.wav',
            'leaf_rustle.wav': 'assets/sounds/leaf_rustle.wav',
            'wind_gather.wav': 'assets/sounds/wind_gather.wav',
            
            // 水系音效
            'ice_form.wav': 'assets/sounds/ice_form.wav',
            'ice_shatter.wav': 'assets/sounds/ice_shatter.wav',
            'water_charge.wav': 'assets/sounds/water_charge.wav',
            'water_rush.wav': 'assets/sounds/water_rush.wav',
            'water_impact.wav': 'assets/sounds/water_impact.wav',
            'wind_cold.wav': 'assets/sounds/wind_cold.wav',
            'mist_form.wav': 'assets/sounds/mist_form.wav',
            'steam_hiss.wav': 'assets/sounds/steam_hiss.wav',
            
            // 火系音效
            'fire_charge.wav': 'assets/sounds/fire_charge.wav',
            'explosion.wav': 'assets/sounds/explosion.wav',
            'fire_roar.wav': 'assets/sounds/fire_roar.wav',
            'lava_bubble.wav': 'assets/sounds/lava_bubble.wav',
            'meteor_call.wav': 'assets/sounds/meteor_call.wav',
            'fire_mark.wav': 'assets/sounds/fire_mark.wav',
            'fire_whip.wav': 'assets/sounds/fire_whip.wav',
            'solar_charge.wav': 'assets/sounds/solar_charge.wav',
            
            // 土系音效
            'stone_rumble.wav': 'assets/sounds/stone_rumble.wav',
            'stone_crack.wav': 'assets/sounds/stone_crack.wav',
            'earth_charge.wav': 'assets/sounds/earth_charge.wav',
            'earthquake.wav': 'assets/sounds/earthquake.wav',
            'stone_form.wav': 'assets/sounds/stone_form.wav',
            'sand_swirl.wav': 'assets/sounds/sand_swirl.wav',
            'mud_bubble.wav': 'assets/sounds/mud_bubble.wav',
            'earth_rumble.wav': 'assets/sounds/earth_rumble.wav',
            
            // UI音效
            'button_click.wav': 'assets/sounds/ui/button_click.wav',
            'notification.wav': 'assets/sounds/ui/notification.wav',
            'error.wav': 'assets/sounds/ui/error.wav',
            'success.wav': 'assets/sounds/ui/success.wav',
            
            // 环境音效
            'ambient_wind.wav': 'assets/sounds/ambient/wind.wav',
            'ambient_battle.wav': 'assets/sounds/ambient/battle.wav'
        };
    }

    // 初始化音频系统
    async initialize() {
        if (this.initialized || !this.enabled) return;
        
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建增益节点
            this.masterGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            
            // 连接音频图
            this.sfxGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // 设置音量
            this.setMasterVolume(CONFIG.audio.masterVolume);
            this.setSFXVolume(CONFIG.audio.sfxVolume);
            this.setMusicVolume(CONFIG.audio.musicVolume);
            
            this.initialized = true;
            console.log('Audio system initialized');
            
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            this.enabled = false;
        }
    }

    // 恢复音频上下文（用户交互后）
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // 加载音效文件
    async loadSound(filename) {
        if (!this.enabled || !this.audioContext) return null;
        
        // 检查缓存
        if (this.sounds.has(filename)) {
            return this.sounds.get(filename);
        }
        
        // 检查是否正在加载
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }
        
        // 开始加载
        const loadPromise = this.loadSoundFile(filename);
        this.loadingPromises.set(filename, loadPromise);
        
        try {
            const audioBuffer = await loadPromise;
            this.sounds.set(filename, audioBuffer);
            this.loadingPromises.delete(filename);
            return audioBuffer;
        } catch (error) {
            console.warn(`Failed to load sound: ${filename}`, error);
            this.loadingPromises.delete(filename);
            return null;
        }
    }

    // 加载音效文件
    async loadSoundFile(filename) {
        const url = this.soundFiles[filename] || `assets/sounds/${filename}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            return audioBuffer;
        } catch (error) {
            // 如果加载失败，创建一个静音的音频缓冲区
            console.warn(`Sound file not found: ${filename}, creating silent buffer`);
            return this.createSilentBuffer(0.1);
        }
    }

    // 创建静音缓冲区
    createSilentBuffer(duration) {
        const length = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
        return buffer;
    }

    // 播放音效
    async playSound(filename, volume = 1.0, pitch = 1.0, loop = false) {
        if (!this.enabled || !this.audioContext) return null;
        
        await this.resumeAudioContext();
        
        const audioBuffer = await this.loadSound(filename);
        if (!audioBuffer) return null;
        
        try {
            // 创建音频源
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            source.loop = loop;
            source.playbackRate.value = pitch;
            
            // 连接音频图
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // 设置音量
            gainNode.gain.value = volume;
            
            // 播放
            source.start();
            
            // 跟踪活跃音源
            this.activeSources.push(source);
            
            // 清理完成的音源
            source.onended = () => {
                const index = this.activeSources.indexOf(source);
                if (index !== -1) {
                    this.activeSources.splice(index, 1);
                }
            };
            
            return source;
        } catch (error) {
            console.error('Failed to play sound:', error);
            return null;
        }
    }

    // 停止所有音效
    stopAllSounds() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // 忽略已停止的音源错误
            }
        });
        this.activeSources = [];
    }

    // 设置主音量
    setMasterVolume(volume) {
        CONFIG.audio.masterVolume = MathUtils.clamp(volume, 0, 1);
        if (this.masterGain) {
            this.masterGain.gain.value = CONFIG.audio.masterVolume;
        }
    }

    // 设置音效音量
    setSFXVolume(volume) {
        CONFIG.audio.sfxVolume = MathUtils.clamp(volume, 0, 1);
        if (this.sfxGain) {
            this.sfxGain.gain.value = CONFIG.audio.sfxVolume;
        }
    }

    // 设置音乐音量
    setMusicVolume(volume) {
        CONFIG.audio.musicVolume = MathUtils.clamp(volume, 0, 1);
        if (this.musicGain) {
            this.musicGain.gain.value = CONFIG.audio.musicVolume;
        }
    }

    // 获取音量
    getMasterVolume() { return CONFIG.audio.masterVolume; }
    getSFXVolume() { return CONFIG.audio.sfxVolume; }
    getMusicVolume() { return CONFIG.audio.musicVolume; }

    // 预加载常用音效
    async preloadSounds() {
        const commonSounds = [
            'metal_charge.wav',
            'thunder_crack.wav',
            'fire_roar.wav',
            'ice_shatter.wav',
            'stone_crack.wav',
            'button_click.wav',
            'notification.wav'
        ];
        
        console.log('Preloading sounds...');
        const promises = commonSounds.map(sound => this.loadSound(sound));
        
        try {
            await Promise.all(promises);
            console.log('Sounds preloaded successfully');
        } catch (error) {
            console.warn('Some sounds failed to preload:', error);
        }
    }

    // 播放技能音效
    playSkillSound(skillId, type = 'cast', volume = 1.0) {
        // 根据技能ID和类型确定音效文件
        const soundMap = {
            // 重斩
            'slash_cast': 'metal_charge.wav',
            'slash_hit': 'metal_clang.wav',
            
            // 弧形剑气
            'arcSlash_cast': 'sword_whoosh.wav',
            'arcSlash_hit': 'metal_slice.wav',
            
            // 雷链
            'thunderChain_cast': 'thunder_charge.wav',
            'thunderChain_hit': 'thunder_crack.wav',
            
            // 石壁
            'stoneWall_cast': 'stone_rumble.wav',
            'stoneWall_hit': 'stone_crack.wav',
            
            // 地裂踏击
            'earthStomp_cast': 'earth_charge.wav',
            'earthStomp_hit': 'earthquake.wav',
            
            // 炎爆
            'flameBurst_cast': 'fire_charge.wav',
            'flameBurst_hit': 'explosion.wav',
            
            // 冰环
            'iceNova_cast': 'ice_form.wav',
            'iceNova_hit': 'ice_shatter.wav'
        };
        
        const soundKey = `${skillId}_${type}`;
        const filename = soundMap[soundKey];
        
        if (filename) {
            this.playSound(filename, volume);
        }
    }

    // 播放UI音效
    playUISound(type) {
        const uiSounds = {
            'click': 'button_click.wav',
            'notification': 'notification.wav',
            'error': 'error.wav',
            'success': 'success.wav'
        };
        
        const filename = uiSounds[type];
        if (filename) {
            this.playSound(filename, 0.6);
        }
    }

    // 启用/禁用音频
    setEnabled(enabled) {
        this.enabled = enabled;
        CONFIG.audio.enabled = enabled;
        
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    // 检查是否启用
    isEnabled() {
        return this.enabled;
    }

    // 获取音频上下文状态
    getAudioContextState() {
        return this.audioContext ? this.audioContext.state : 'closed';
    }

    // 获取活跃音源数量
    getActiveSources() {
        return this.activeSources.length;
    }
}

// 创建全局音频管理器实例
window.AudioManager = AudioManager;
window.audioManager = new AudioManager();

// 用户首次交互时初始化音频
document.addEventListener('click', async () => {
    if (!window.audioManager.initialized) {
        await window.audioManager.initialize();
        await window.audioManager.preloadSounds();
    }
}, { once: true });

// 键盘交互也可以初始化音频
document.addEventListener('keydown', async () => {
    if (!window.audioManager.initialized) {
        await window.audioManager.initialize();
        await window.audioManager.preloadSounds();
    }
}, { once: true });