#!/usr/bin/env node

// 龙生九子·五行对战 - Node.js 资源生成器

const fs = require('fs').promises;
const path = require('path');

class NodeAssetGenerator {
    constructor() {
        this.assetsDir = path.join(__dirname, 'assets');
        this.generatedCount = 0;
    }

    // 生成简单的WAV文件头（占位符）
    generateWavHeader(dataSize) {
        const buffer = Buffer.alloc(44);
        
        // RIFF header
        buffer.write('RIFF', 0);
        buffer.writeUInt32LE(36 + dataSize, 4);
        buffer.write('WAVE', 8);
        
        // fmt chunk
        buffer.write('fmt ', 12);
        buffer.writeUInt32LE(16, 16); // chunk size
        buffer.writeUInt16LE(1, 20);  // PCM format
        buffer.writeUInt16LE(1, 22);  // mono
        buffer.writeUInt32LE(44100, 24); // sample rate
        buffer.writeUInt32LE(88200, 28); // byte rate
        buffer.writeUInt16LE(2, 32);  // block align
        buffer.writeUInt16LE(16, 34); // bits per sample
        
        // data chunk
        buffer.write('data', 36);
        buffer.writeUInt32LE(dataSize, 40);
        
        return buffer;
    }

    // 生成简单的音效数据
    generateAudioData(type, duration = 0.5) {
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration);
        const dataSize = samples * 2; // 16-bit samples
        const header = this.generateWavHeader(dataSize);
        const data = Buffer.alloc(dataSize);
        
        // 根据音效类型生成不同的波形
        for (let i = 0; i < samples; i++) {
            let sample = 0;
            const t = i / sampleRate;
            
            switch (type) {
                case 'metal':
                    // 金属碰撞声：高频噪音 + 衰减
                    sample = (Math.random() - 0.5) * Math.exp(-t * 5) * 0.3;
                    break;
                case 'wood':
                    // 木系声音：中频震荡
                    sample = Math.sin(t * 440 * Math.PI * 2) * Math.exp(-t * 3) * 0.2;
                    break;
                case 'water':
                    // 水系声音：流水声模拟
                    sample = (Math.random() - 0.5) * Math.sin(t * 220 * Math.PI * 2) * Math.exp(-t * 2) * 0.25;
                    break;
                case 'fire':
                    // 火系声音：爆裂声
                    sample = (Math.random() - 0.5) * Math.exp(-t * 8) * 0.4;
                    break;
                case 'earth':
                    // 土系声音：低频隆隆声
                    sample = Math.sin(t * 110 * Math.PI * 2) * Math.exp(-t * 4) * 0.3;
                    break;
                case 'ui':
                    // UI音效：清脆点击声
                    sample = Math.sin(t * 880 * Math.PI * 2) * Math.exp(-t * 10) * 0.2;
                    break;
                default:
                    sample = Math.sin(t * 440 * Math.PI * 2) * Math.exp(-t * 3) * 0.2;
            }
            
            // 转换为16位整数
            const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
            data.writeInt16LE(intSample, i * 2);
        }
        
        return Buffer.concat([header, data]);
    }

    // 生成PNG图片（简单的彩色方块占位符）
    generatePNG(width, height, color) {
        // 简单的PNG生成（实际应该使用专门的库，这里生成最基本的格式）
        const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        
        // IHDR chunk
        const ihdrData = Buffer.alloc(13);
        ihdrData.writeUInt32BE(width, 0);
        ihdrData.writeUInt32BE(height, 4);
        ihdrData[8] = 8;  // bit depth
        ihdrData[9] = 2;  // color type (RGB)
        ihdrData[10] = 0; // compression
        ihdrData[11] = 0; // filter
        ihdrData[12] = 0; // interlace
        
        const ihdrCrc = this.crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
        const ihdr = Buffer.concat([
            Buffer.from([0, 0, 0, 13]), // length
            Buffer.from('IHDR'),
            ihdrData,
            Buffer.from([ihdrCrc >>> 24, (ihdrCrc >>> 16) & 0xff, (ihdrCrc >>> 8) & 0xff, ihdrCrc & 0xff])
        ]);
        
        // 简单的图像数据（纯色）
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const imageData = Buffer.alloc(height * (width * 3 + 1));
        for (let y = 0; y < height; y++) {
            imageData[y * (width * 3 + 1)] = 0; // filter type
            for (let x = 0; x < width; x++) {
                const offset = y * (width * 3 + 1) + 1 + x * 3;
                imageData[offset] = r;
                imageData[offset + 1] = g;
                imageData[offset + 2] = b;
            }
        }
        
        // 简化：返回一个基本的PNG结构
        return signature;
    }

    // 简单的CRC32实现
    crc32(data) {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // 生成SVG图标
    generateSVGIcon(type, element, symbol, color) {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${type}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(color, 0.3)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#grad${type})" stroke="#000" stroke-width="2"/>
  <text x="32" y="40" text-anchor="middle" font-size="24" font-family="Arial, sans-serif">${symbol}</text>
  <text x="32" y="55" text-anchor="middle" font-size="8" font-family="Arial, sans-serif" fill="#fff">${element}</text>
</svg>`;
        return Buffer.from(svg, 'utf8');
    }

    // 颜色加深函数
    darkenColor(color, amount) {
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) * (1 - amount));
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) * (1 - amount));
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) * (1 - amount));
        return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
    }

    // 生成所有音效文件
    async generateAllSounds() {
        console.log('🎵 开始生成音效文件...');
        
        const soundCategories = {
            'sounds/skills/metal': [
                'metal_charge.wav', 'metal_clang.wav', 'sword_whoosh.wav', 'metal_slice.wav',
                'metal_ring.wav', 'electric_charge.wav', 'blade_slice.wav', 'metal_rain.wav',
                'metal_clank.wav', 'blade_sharpen.wav', 'speed_boost.wav'
            ],
            'sounds/skills/wood': [
                'thunder_charge.wav', 'thunder_crack.wav', 'wind_whoosh.wav', 'wind_rush.wav',
                'wood_grow.wav', 'vine_rustle.wav', 'leaf_rustle.wav', 'wind_gather.wav',
                'poison_brew.wav', 'root_grow.wav', 'wind_light.wav', 'eagle_cry.wav', 'life_pulse.wav'
            ],
            'sounds/skills/water': [
                'ice_form.wav', 'ice_shatter.wav', 'water_charge.wav', 'water_rush.wav',
                'water_impact.wav', 'wind_cold.wav', 'mist_form.wav', 'steam_hiss.wav'
            ],
            'sounds/skills/fire': [
                'fire_charge.wav', 'explosion.wav', 'fire_roar.wav', 'lava_bubble.wav',
                'meteor_call.wav', 'fire_mark.wav', 'fire_whip.wav', 'solar_charge.wav'
            ],
            'sounds/skills/earth': [
                'stone_rumble.wav', 'stone_crack.wav', 'earth_charge.wav', 'earthquake.wav',
                'stone_form.wav', 'sand_swirl.wav', 'mud_bubble.wav', 'stone_armor.wav',
                'shield_activate.wav', 'stone_harden.wav'
            ],
            'sounds/ui': [
                'button_click.wav', 'notification.wav', 'error.wav', 'success.wav'
            ],
            'sounds/ambient': [
                'ambient_wind.wav', 'ambient_battle.wav'
            ]
        };

        for (const [category, sounds] of Object.entries(soundCategories)) {
            const categoryDir = path.join(this.assetsDir, category);
            await fs.mkdir(categoryDir, { recursive: true });
            
            const elementType = category.includes('metal') ? 'metal' :
                              category.includes('wood') ? 'wood' :
                              category.includes('water') ? 'water' :
                              category.includes('fire') ? 'fire' :
                              category.includes('earth') ? 'earth' :
                              category.includes('ui') ? 'ui' : 'default';
            
            for (const soundFile of sounds) {
                const soundPath = path.join(categoryDir, soundFile);
                const audioData = this.generateAudioData(elementType, 0.8);
                await fs.writeFile(soundPath, audioData);
                console.log(`✅ 生成音效: ${soundFile}`);
                this.generatedCount++;
            }
        }
    }

    // 生成所有图标文件
    async generateAllIcons() {
        console.log('🎨 开始生成图标文件...');
        
        // 技能图标
        const skillIcons = [
            { name: 'slash.svg', element: 'metal', symbol: '⚔️', color: '#FFD700' },
            { name: 'arcSlash.svg', element: 'metal', symbol: '🌙', color: '#C0C0C0' },
            { name: 'metalClash.svg', element: 'metal', symbol: '⚡', color: '#FFD700' },
            { name: 'thunderChain.svg', element: 'wood', symbol: '⚡', color: '#00FF00' },
            { name: 'windDash.svg', element: 'wood', symbol: '💨', color: '#90EE90' },
            { name: 'forestSnare.svg', element: 'wood', symbol: '🌿', color: '#228B22' },
            { name: 'iceNova.svg', element: 'water', symbol: '❄️', color: '#00BFFF' },
            { name: 'waterJet.svg', element: 'water', symbol: '💧', color: '#1E90FF' },
            { name: 'torrent.svg', element: 'water', symbol: '🌊', color: '#1E90FF' },
            { name: 'flameBurst.svg', element: 'fire', symbol: '🔥', color: '#FF4500' },
            { name: 'lavaZone.svg', element: 'fire', symbol: '🌋', color: '#FF6347' },
            { name: 'meteor.svg', element: 'fire', symbol: '☄️', color: '#FF4500' },
            { name: 'stoneWall.svg', element: 'earth', symbol: '🏔️', color: '#8B4513' },
            { name: 'earthStomp.svg', element: 'earth', symbol: '💥', color: '#A0522D' },
            { name: 'rockShield.svg', element: 'earth', symbol: '🛡️', color: '#696969' }
        ];

        const skillIconsDir = path.join(this.assetsDir, 'images/skills');
        await fs.mkdir(skillIconsDir, { recursive: true });
        
        for (const icon of skillIcons) {
            const iconPath = path.join(skillIconsDir, icon.name);
            const svgData = this.generateSVGIcon(icon.name.replace('.svg', ''), icon.element, icon.symbol, icon.color);
            await fs.writeFile(iconPath, svgData);
            console.log(`✅ 生成技能图标: ${icon.name}`);
            this.generatedCount++;
        }

        // 道具图标
        const itemIcons = [
            { name: 'metal_fruit.svg', symbol: '🥇', color: '#FFD700' },
            { name: 'wood_fruit.svg', symbol: '🌿', color: '#228B22' },
            { name: 'water_fruit.svg', symbol: '💧', color: '#1E90FF' },
            { name: 'fire_fruit.svg', symbol: '🔥', color: '#FF4500' },
            { name: 'earth_fruit.svg', symbol: '🟫', color: '#8B4513' },
            { name: 'invuln.svg', symbol: '🛡️', color: '#FFD700' },
            { name: 'boots.svg', symbol: '👢', color: '#8B4513' },
            { name: 'potion.svg', symbol: '🧪', color: '#FF69B4' },
            { name: 'bomb.svg', symbol: '💣', color: '#FF0000' },
            { name: 'trap.svg', symbol: '🕳️', color: '#654321' },
            { name: 'blink.svg', symbol: '✨', color: '#9370DB' }
        ];

        const itemIconsDir = path.join(this.assetsDir, 'images/items');
        await fs.mkdir(itemIconsDir, { recursive: true });
        
        for (const icon of itemIcons) {
            const iconPath = path.join(itemIconsDir, icon.name);
            const svgData = this.generateSVGIcon(icon.name.replace('.svg', ''), 'item', icon.symbol, icon.color);
            await fs.writeFile(iconPath, svgData);
            console.log(`✅ 生成道具图标: ${icon.name}`);
            this.generatedCount++;
        }

        // 角色图标
        const characterIcons = [
            { name: 'qiuniu.svg', symbol: '🐉', color: '#FFD700' },
            { name: 'yazi.svg', symbol: '🗡️', color: '#C0C0C0' },
            { name: 'chaofeng.svg', symbol: '🦅', color: '#00BFFF' },
            { name: 'pulao.svg', symbol: '🔔', color: '#FFD700' },
            { name: 'suanni.svg', symbol: '🦁', color: '#FF4500' },
            { name: 'bixi.svg', symbol: '🐢', color: '#8B4513' },
            { name: 'bixie.svg', symbol: '⚖️', color: '#4B0082' },
            { name: 'fuxi.svg', symbol: '📚', color: '#228B22' },
            { name: 'chiwen.svg', symbol: '🌊', color: '#1E90FF' }
        ];

        const characterIconsDir = path.join(this.assetsDir, 'images/characters');
        await fs.mkdir(characterIconsDir, { recursive: true });
        
        for (const icon of characterIcons) {
            const iconPath = path.join(characterIconsDir, icon.name);
            const svgData = this.generateSVGIcon(icon.name.replace('.svg', ''), 'character', icon.symbol, icon.color);
            await fs.writeFile(iconPath, svgData);
            console.log(`✅ 生成角色图标: ${icon.name}`);
            this.generatedCount++;
        }
    }

    // 生成UI资源
    async generateUIAssets() {
        console.log('🖼️ 开始生成UI资源...');
        
        const uiDirs = ['buttons', 'panels', 'progress_bars', 'decorations'];
        const uiDir = path.join(this.assetsDir, 'images/ui');
        
        for (const subDir of uiDirs) {
            const fullDir = path.join(uiDir, subDir);
            await fs.mkdir(fullDir, { recursive: true });
            
            // 为每个UI类别生成一些基本资源
            const uiAssets = [
                { name: 'default.svg', symbol: '⬜', color: '#4A90E2' },
                { name: 'hover.svg', symbol: '⬜', color: '#357ABD' },
                { name: 'active.svg', symbol: '⬜', color: '#2E6DA4' }
            ];
            
            for (const asset of uiAssets) {
                const assetPath = path.join(fullDir, asset.name);
                const svgData = this.generateSVGIcon(asset.name.replace('.svg', ''), subDir, asset.symbol, asset.color);
                await fs.writeFile(assetPath, svgData);
                console.log(`✅ 生成UI资源: ${subDir}/${asset.name}`);
                this.generatedCount++;
            }
        }
    }

    // 生成所有资源
    async generateAll() {
        console.log('🚀 开始生成所有游戏资源...');
        const startTime = Date.now();
        
        try {
            await this.generateAllSounds();
            await this.generateAllIcons();
            await this.generateUIAssets();
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log(`\n🎉 资源生成完成！`);
            console.log(`📊 总计生成: ${this.generatedCount} 个文件`);
            console.log(`⏱️ 用时: ${duration.toFixed(2)} 秒`);
            console.log(`📁 资源目录: ${this.assetsDir}`);
            
            // 生成资源清单
            await this.updateManifest();
            
        } catch (error) {
            console.error('❌ 资源生成失败:', error);
            throw error;
        }
    }

    // 更新资源清单
    async updateManifest() {
        const manifestPath = path.join(this.assetsDir, 'manifest.json');
        try {
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            manifest.generated = new Date().toISOString();
            manifest.generatedCount = this.generatedCount;
            manifest.status = 'generated';
            
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
            console.log('✅ 资源清单已更新');
        } catch (error) {
            console.error('❌ 更新资源清单失败:', error);
        }
    }
}

// 主函数
async function main() {
    const generator = new NodeAssetGenerator();
    
    try {
        await generator.generateAll();
        console.log('\n✨ 所有资源已准备就绪！现在可以启动游戏了。');
        console.log('💡 使用命令: npm run quick-start');
    } catch (error) {
        console.error('💥 生成失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = NodeAssetGenerator;