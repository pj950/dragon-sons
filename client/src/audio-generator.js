// 龙生九子·五行对战 - 音效生成器

class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.sampleRate = 44100;
        this.generatedSounds = new Map();
    }

    // 初始化音频上下文
    async initialize() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // 生成音效文件
    generateSound(type, params = {}) {
        const duration = params.duration || 1.0;
        const volume = params.volume || 0.3;
        
        const length = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, this.sampleRate);
        const data = buffer.getChannelData(0);
        
        switch (type) {
            case 'metal_charge':
                this.generateMetalCharge(data, params);
                break;
            case 'metal_clang':
                this.generateMetalClang(data, params);
                break;
            case 'thunder_crack':
                this.generateThunderCrack(data, params);
                break;
            case 'fire_roar':
                this.generateFireRoar(data, params);
                break;
            case 'ice_shatter':
                this.generateIceShatter(data, params);
                break;
            case 'earth_rumble':
                this.generateEarthRumble(data, params);
                break;
            case 'wind_whoosh':
                this.generateWindWhoosh(data, params);
                break;
            case 'water_splash':
                this.generateWaterSplash(data, params);
                break;
            case 'ui_click':
                this.generateUIClick(data, params);
                break;
            case 'notification':
                this.generateNotification(data, params);
                break;
            default:
                this.generateDefault(data, params);
        }
        
        // 应用音量
        for (let i = 0; i < data.length; i++) {
            data[i] *= volume;
        }
        
        return buffer;
    }

    // 生成金属充能音效
    generateMetalCharge(data, params) {
        const frequency = params.frequency || 220;
        const harmonics = params.harmonics || 3;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            let sample = 0;
            
            // 基础频率和谐波
            for (let h = 1; h <= harmonics; h++) {
                const harmonic = frequency * h;
                const amplitude = 1 / h;
                sample += Math.sin(2 * Math.PI * harmonic * t) * amplitude;
            }
            
            // 充能效果 - 频率上升
            const ramp = Math.min(t * 3, 1);
            const freqMod = 1 + ramp * 0.5;
            sample *= Math.sin(2 * Math.PI * frequency * freqMod * t);
            
            // 包络
            const envelope = Math.exp(-t * 2) * (1 - Math.exp(-t * 10));
            data[i] = sample * envelope;
        }
    }

    // 生成金属撞击音效
    generateMetalClang(data, params) {
        const baseFreq = params.frequency || 800;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 多个金属频率混合
            let sample = 0;
            const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2.1, baseFreq * 3.2];
            
            frequencies.forEach((freq, index) => {
                const amplitude = 1 / (index + 1);
                sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
            });
            
            // 快速衰减
            const envelope = Math.exp(-t * 8);
            
            // 添加噪声
            const noise = (Math.random() - 0.5) * 0.3;
            sample = sample * 0.7 + noise * 0.3;
            
            data[i] = sample * envelope;
        }
    }

    // 生成雷电音效
    generateThunderCrack(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 白噪声基础
            let sample = (Math.random() - 0.5) * 2;
            
            // 低频隆隆声
            sample += Math.sin(2 * Math.PI * 60 * t) * 0.5;
            sample += Math.sin(2 * Math.PI * 80 * t) * 0.3;
            
            // 高频噼啪声
            if (t < 0.1) {
                sample += (Math.random() - 0.5) * 3 * Math.exp(-t * 20);
            }
            
            // 包络
            const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 50));
            data[i] = sample * envelope;
        }
    }

    // 生成火焰咆哮音效
    generateFireRoar(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 低频咆哮
            let sample = Math.sin(2 * Math.PI * 120 * t) * 0.6;
            sample += Math.sin(2 * Math.PI * 180 * t) * 0.4;
            
            // 火焰噼啪声
            const crackle = (Math.random() - 0.5) * 0.4 * Math.sin(2 * Math.PI * 2000 * t);
            sample += crackle;
            
            // 调制
            const modulation = 1 + Math.sin(2 * Math.PI * 5 * t) * 0.2;
            sample *= modulation;
            
            // 包络
            const envelope = Math.exp(-t * 1.5) * (1 - Math.exp(-t * 8));
            data[i] = sample * envelope;
        }
    }

    // 生成冰碎音效
    generateIceShatter(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 高频碎裂声
            let sample = 0;
            const frequencies = [2000, 3000, 4000, 5000];
            
            frequencies.forEach((freq, index) => {
                const phase = Math.random() * Math.PI * 2;
                const amplitude = 1 / (index + 1);
                sample += Math.sin(2 * Math.PI * freq * t + phase) * amplitude;
            });
            
            // 添加噪声
            const noise = (Math.random() - 0.5) * 0.5;
            sample = sample * 0.6 + noise * 0.4;
            
            // 快速衰减
            const envelope = Math.exp(-t * 6) * (1 - Math.exp(-t * 30));
            data[i] = sample * envelope;
        }
    }

    // 生成大地隆隆音效
    generateEarthRumble(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 低频隆隆声
            let sample = Math.sin(2 * Math.PI * 40 * t) * 0.8;
            sample += Math.sin(2 * Math.PI * 60 * t) * 0.6;
            sample += Math.sin(2 * Math.PI * 80 * t) * 0.4;
            
            // 添加噪声
            const noise = (Math.random() - 0.5) * 0.3;
            sample += noise;
            
            // 缓慢衰减
            const envelope = Math.exp(-t * 0.8) * (1 - Math.exp(-t * 5));
            data[i] = sample * envelope;
        }
    }

    // 生成风声音效
    generateWindWhoosh(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 风声噪声
            let sample = (Math.random() - 0.5) * 2;
            
            // 低通滤波效果
            const cutoff = 500 + Math.sin(2 * Math.PI * 2 * t) * 200;
            sample = this.lowPassFilter(sample, cutoff, this.sampleRate);
            
            // 包络
            const envelope = Math.sin(Math.PI * t / (data.length / this.sampleRate));
            data[i] = sample * envelope;
        }
    }

    // 生成水花音效
    generateWaterSplash(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 水花声
            let sample = (Math.random() - 0.5) * 2;
            
            // 高频成分
            sample += Math.sin(2 * Math.PI * 1000 * t) * 0.3 * Math.exp(-t * 5);
            
            // 气泡声
            if (Math.random() < 0.1) {
                sample += Math.sin(2 * Math.PI * 500 * t) * 0.5;
            }
            
            // 包络
            const envelope = Math.exp(-t * 4) * (1 - Math.exp(-t * 20));
            data[i] = sample * envelope;
        }
    }

    // 生成UI点击音效
    generateUIClick(data, params) {
        const frequency = params.frequency || 800;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            let sample = Math.sin(2 * Math.PI * frequency * t);
            sample += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.5;
            
            // 快速衰减
            const envelope = Math.exp(-t * 15);
            data[i] = sample * envelope;
        }
    }

    // 生成通知音效
    generateNotification(data, params) {
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            
            // 两个音调
            let sample = 0;
            if (t < 0.1) {
                sample = Math.sin(2 * Math.PI * 600 * t);
            } else if (t < 0.2) {
                sample = Math.sin(2 * Math.PI * 800 * (t - 0.1));
            }
            
            // 包络
            const envelope = Math.exp(-t * 8);
            data[i] = sample * envelope;
        }
    }

    // 生成默认音效
    generateDefault(data, params) {
        const frequency = params.frequency || 440;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.sampleRate;
            const sample = Math.sin(2 * Math.PI * frequency * t);
            const envelope = Math.exp(-t * 2);
            data[i] = sample * envelope;
        }
    }

    // 简单低通滤波器
    lowPassFilter(sample, cutoff, sampleRate) {
        const rc = 1.0 / (cutoff * 2 * Math.PI);
        const dt = 1.0 / sampleRate;
        const alpha = dt / (rc + dt);
        return sample * alpha;
    }

    // 将AudioBuffer转换为WAV文件
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const data = buffer.getChannelData(0);
        
        // WAV文件头
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.sampleRate, true);
        view.setUint32(28, this.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // 音频数据
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
    }

    // 生成并保存音效文件
    async generateAndSave(soundName, type, params = {}) {
        await this.initialize();
        
        const buffer = this.generateSound(type, params);
        const wavData = this.audioBufferToWav(buffer);
        
        // 创建下载链接
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // 缓存生成的音效
        this.generatedSounds.set(soundName, {
            buffer: buffer,
            blob: blob,
            url: url
        });
        
        return url;
    }

    // 批量生成所有音效
    async generateAllSounds() {
        console.log('开始生成音效文件...');
        
        const soundDefinitions = [
            // 金系音效
            { name: 'metal_charge.wav', type: 'metal_charge', params: { duration: 0.8, frequency: 220 } },
            { name: 'metal_clang.wav', type: 'metal_clang', params: { duration: 0.6, frequency: 800 } },
            { name: 'sword_whoosh.wav', type: 'wind_whoosh', params: { duration: 0.4 } },
            { name: 'metal_slice.wav', type: 'metal_clang', params: { duration: 0.3, frequency: 1200 } },
            { name: 'metal_ring.wav', type: 'metal_charge', params: { duration: 0.5, frequency: 440 } },
            { name: 'electric_charge.wav', type: 'metal_charge', params: { duration: 0.7, frequency: 880 } },
            { name: 'blade_slice.wav', type: 'metal_clang', params: { duration: 0.4, frequency: 1000 } },
            { name: 'metal_rain.wav', type: 'metal_clang', params: { duration: 1.2, frequency: 600 } },
            
            // 木系音效
            { name: 'thunder_charge.wav', type: 'metal_charge', params: { duration: 0.6, frequency: 160 } },
            { name: 'thunder_crack.wav', type: 'thunder_crack', params: { duration: 0.8 } },
            { name: 'wind_whoosh.wav', type: 'wind_whoosh', params: { duration: 0.5 } },
            { name: 'wind_rush.wav', type: 'wind_whoosh', params: { duration: 0.3 } },
            { name: 'wood_grow.wav', type: 'earth_rumble', params: { duration: 0.8, frequency: 100 } },
            { name: 'vine_rustle.wav', type: 'wind_whoosh', params: { duration: 0.6 } },
            { name: 'leaf_rustle.wav', type: 'wind_whoosh', params: { duration: 0.4 } },
            { name: 'wind_gather.wav', type: 'wind_whoosh', params: { duration: 0.7 } },
            
            // 水系音效
            { name: 'ice_form.wav', type: 'ice_shatter', params: { duration: 0.6 } },
            { name: 'ice_shatter.wav', type: 'ice_shatter', params: { duration: 0.5 } },
            { name: 'water_charge.wav', type: 'water_splash', params: { duration: 0.5 } },
            { name: 'water_rush.wav', type: 'water_splash', params: { duration: 0.7 } },
            { name: 'water_impact.wav', type: 'water_splash', params: { duration: 0.4 } },
            { name: 'wind_cold.wav', type: 'wind_whoosh', params: { duration: 0.8 } },
            { name: 'mist_form.wav', type: 'wind_whoosh', params: { duration: 0.6 } },
            { name: 'steam_hiss.wav', type: 'water_splash', params: { duration: 0.5 } },
            
            // 火系音效
            { name: 'fire_charge.wav', type: 'fire_roar', params: { duration: 0.6 } },
            { name: 'explosion.wav', type: 'thunder_crack', params: { duration: 0.8 } },
            { name: 'fire_roar.wav', type: 'fire_roar', params: { duration: 1.0 } },
            { name: 'lava_bubble.wav', type: 'water_splash', params: { duration: 0.4 } },
            { name: 'meteor_call.wav', type: 'earth_rumble', params: { duration: 1.2 } },
            { name: 'fire_mark.wav', type: 'fire_roar', params: { duration: 0.3 } },
            { name: 'fire_whip.wav', type: 'wind_whoosh', params: { duration: 0.4 } },
            { name: 'solar_charge.wav', type: 'fire_roar', params: { duration: 0.8 } },
            
            // 土系音效
            { name: 'stone_rumble.wav', type: 'earth_rumble', params: { duration: 0.8 } },
            { name: 'stone_crack.wav', type: 'metal_clang', params: { duration: 0.5, frequency: 400 } },
            { name: 'earth_charge.wav', type: 'earth_rumble', params: { duration: 0.6 } },
            { name: 'earthquake.wav', type: 'earth_rumble', params: { duration: 1.0 } },
            { name: 'stone_form.wav', type: 'earth_rumble', params: { duration: 0.5 } },
            { name: 'sand_swirl.wav', type: 'wind_whoosh', params: { duration: 0.6 } },
            { name: 'mud_bubble.wav', type: 'water_splash', params: { duration: 0.4 } },
            
            // UI音效
            { name: 'button_click.wav', type: 'ui_click', params: { duration: 0.1, frequency: 800 } },
            { name: 'notification.wav', type: 'notification', params: { duration: 0.3 } },
            { name: 'error.wav', type: 'ui_click', params: { duration: 0.2, frequency: 200 } },
            { name: 'success.wav', type: 'notification', params: { duration: 0.4 } }
        ];
        
        const results = [];
        for (const sound of soundDefinitions) {
            try {
                const url = await this.generateAndSave(sound.name, sound.type, sound.params);
                results.push({ name: sound.name, url: url, success: true });
                console.log(`✅ 生成音效: ${sound.name}`);
            } catch (error) {
                console.error(`❌ 生成音效失败: ${sound.name}`, error);
                results.push({ name: sound.name, error: error.message, success: false });
            }
        }
        
        console.log(`音效生成完成: ${results.filter(r => r.success).length}/${results.length}`);
        return results;
    }

    // 下载所有生成的音效
    downloadAllSounds() {
        this.generatedSounds.forEach((soundData, filename) => {
            const a = document.createElement('a');
            a.href = soundData.url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // 获取生成的音效
    getGeneratedSound(filename) {
        return this.generatedSounds.get(filename);
    }

    // 清理资源
    cleanup() {
        this.generatedSounds.forEach((soundData) => {
            URL.revokeObjectURL(soundData.url);
        });
        this.generatedSounds.clear();
    }
}

// 创建全局音效生成器实例
window.AudioGenerator = AudioGenerator;