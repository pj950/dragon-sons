#!/usr/bin/env node

// 高质量资源爬取器 - Premium Asset Crawler

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class PremiumAssetCrawler {
    constructor() {
        this.downloadDir = path.join(__dirname, 'downloads/premium');
        this.assetsDir = path.join(__dirname, 'client/assets');
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        this.downloadStats = { success: 0, failed: 0, total: 0 };
    }

    // 初始化下载目录
    async initialize() {
        await fs.mkdir(this.downloadDir, { recursive: true });
        await fs.mkdir(path.join(this.downloadDir, 'sounds'), { recursive: true });
        await fs.mkdir(path.join(this.downloadDir, 'images'), { recursive: true });
        await fs.mkdir(path.join(this.downloadDir, 'ui'), { recursive: true });
    }

    // 获取免费资源URL列表
    getAssetUrls() {
        return {
            // 高质量音效资源 (CC0/CC-BY)
            sounds: {
                // UI音效
                'button_click.wav': 'https://www.soundjay.com/misc/sounds/button-09.wav',
                'success.wav': 'https://www.soundjay.com/misc/sounds/success-1.wav',
                'error.wav': 'https://www.soundjay.com/misc/sounds/error-1.wav',
                'notification.wav': 'https://www.soundjay.com/misc/sounds/notification-1.wav',
                
                // 战斗音效
                'sword_clash.wav': 'https://www.soundjay.com/misc/sounds/sword-02.wav',
                'magic_cast.wav': 'https://www.soundjay.com/misc/sounds/magic-1.wav',
                'explosion.wav': 'https://www.soundjay.com/misc/sounds/explosion-01.wav',
                
                // 环境音效
                'wind.wav': 'https://www.soundjay.com/nature/sounds/wind-1.wav',
                'fire.wav': 'https://www.soundjay.com/nature/sounds/fire-1.wav'
            },
            
            // 开源图标资源
            icons: {
                // Game-icons.net 的一些直链图标 (CC BY 3.0)
                'sword.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/sword-clash.svg',
                'fire.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/fire-symbol.svg',
                'water.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/water-drop.svg',
                'wind.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/tornado.svg',
                'earth.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/stone-pile.svg',
                'shield.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/shield.svg',
                'potion.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/potion-ball.svg',
                'boots.svg': 'https://game-icons.net/icons/ffffff/000000/1x1/lorc/boots.svg'
            },
            
            // GitHub上的开源资源包
            packages: {
                'kenney_ui': 'https://github.com/KenneyNL/Assets/archive/refs/heads/main.zip',
                'opengameart_fantasy': 'https://github.com/OpenGameArt/art-collection/archive/refs/heads/main.zip'
            }
        };
    }

    // 下载单个文件
    async downloadFile(url, outputPath, filename) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;
            
            const options = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': '*/*'
                }
            };
            
            console.log(`   📥 下载: ${filename}`);
            
            client.get(url, options, (response) => {
                // 处理重定向
                if (response.statusCode === 301 || response.statusCode === 302) {
                    return this.downloadFile(response.headers.location, outputPath, filename)
                        .then(resolve)
                        .catch(reject);
                }
                
                if (response.statusCode === 200) {
                    const file = require('fs').createWriteStream(outputPath);
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        console.log(`   ✅ 完成: ${filename}`);
                        this.downloadStats.success++;
                        resolve(outputPath);
                    });
                    
                    file.on('error', (err) => {
                        console.log(`   ❌ 失败: ${filename} - ${err.message}`);
                        this.downloadStats.failed++;
                        reject(err);
                    });
                } else {
                    console.log(`   ❌ HTTP错误: ${filename} - ${response.statusCode}`);
                    this.downloadStats.failed++;
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            }).on('error', (err) => {
                console.log(`   ❌ 网络错误: ${filename} - ${err.message}`);
                this.downloadStats.failed++;
                reject(err);
            });
        });
    }

    // 批量下载音效
    async downloadSounds() {
        console.log('🎵 下载高质量音效资源...');
        const sounds = this.getAssetUrls().sounds;
        const soundsDir = path.join(this.downloadDir, 'sounds');
        
        for (const [filename, url] of Object.entries(sounds)) {
            const outputPath = path.join(soundsDir, filename);
            this.downloadStats.total++;
            
            try {
                await this.downloadFile(url, outputPath, filename);
                await new Promise(resolve => setTimeout(resolve, 500)); // 避免请求过快
            } catch (error) {
                console.log(`   ⚠️  跳过: ${filename}`);
            }
        }
    }

    // 批量下载图标
    async downloadIcons() {
        console.log('🎨 下载高质量图标资源...');
        const icons = this.getAssetUrls().icons;
        const iconsDir = path.join(this.downloadDir, 'images');
        
        for (const [filename, url] of Object.entries(icons)) {
            const outputPath = path.join(iconsDir, filename);
            this.downloadStats.total++;
            
            try {
                await this.downloadFile(url, outputPath, filename);
                await new Promise(resolve => setTimeout(resolve, 500)); // 避免请求过快
            } catch (error) {
                console.log(`   ⚠️  跳过: ${filename}`);
            }
        }
    }

    // 创建资源映射文件
    async createResourceMapping() {
        const mapping = {
            sounds: {
                // 将下载的音效映射到游戏需要的文件名
                'button_click.wav': 'sounds/ui/button_click.wav',
                'success.wav': 'sounds/ui/success.wav',
                'error.wav': 'sounds/ui/error.wav',
                'notification.wav': 'sounds/ui/notification.wav',
                'sword_clash.wav': 'sounds/skills/metal/metal_clang.wav',
                'magic_cast.wav': 'sounds/skills/wood/thunder_charge.wav',
                'explosion.wav': 'sounds/skills/fire/explosion.wav',
                'wind.wav': 'sounds/ambient/ambient_wind.wav',
                'fire.wav': 'sounds/skills/fire/fire_roar.wav'
            },
            images: {
                // 将下载的图标映射到游戏需要的文件名
                'sword.svg': 'images/skills/slash.svg',
                'fire.svg': 'images/skills/flameBurst.svg',
                'water.svg': 'images/skills/waterJet.svg',
                'wind.svg': 'images/skills/windDash.svg',
                'earth.svg': 'images/skills/earthStomp.svg',
                'shield.svg': 'images/skills/rockShield.svg',
                'potion.svg': 'images/items/potion.svg',
                'boots.svg': 'images/items/boots.svg'
            }
        };
        
        const mappingPath = path.join(this.downloadDir, 'resource-mapping.json');
        await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
        console.log('📋 资源映射文件已创建');
    }

    // 应用下载的资源到游戏
    async applyDownloadedAssets() {
        console.log('🔄 应用下载的资源到游戏...');
        
        try {
            const mappingPath = path.join(this.downloadDir, 'resource-mapping.json');
            const mapping = JSON.parse(await fs.readFile(mappingPath, 'utf8'));
            
            let appliedCount = 0;
            
            // 应用音效文件
            for (const [downloadedFile, targetPath] of Object.entries(mapping.sounds)) {
                const sourcePath = path.join(this.downloadDir, 'sounds', downloadedFile);
                const targetFullPath = path.join(this.assetsDir, targetPath);
                
                try {
                    await fs.access(sourcePath);
                    await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
                    await fs.copyFile(sourcePath, targetFullPath);
                    console.log(`   ✅ 应用音效: ${downloadedFile} → ${targetPath}`);
                    appliedCount++;
                } catch (error) {
                    console.log(`   ⚠️  跳过音效: ${downloadedFile} (文件不存在)`);
                }
            }
            
            // 应用图像文件
            for (const [downloadedFile, targetPath] of Object.entries(mapping.images)) {
                const sourcePath = path.join(this.downloadDir, 'images', downloadedFile);
                const targetFullPath = path.join(this.assetsDir, targetPath);
                
                try {
                    await fs.access(sourcePath);
                    await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
                    await fs.copyFile(sourcePath, targetFullPath);
                    console.log(`   ✅ 应用图像: ${downloadedFile} → ${targetPath}`);
                    appliedCount++;
                } catch (error) {
                    console.log(`   ⚠️  跳过图像: ${downloadedFile} (文件不存在)`);
                }
            }
            
            console.log(`🎯 成功应用 ${appliedCount} 个高质量资源`);
            
        } catch (error) {
            console.error('❌ 应用资源失败:', error.message);
        }
    }

    // 生成使用指南
    async generateUsageGuide() {
        const guide = `# 高质量资源使用指南

## 📥 已下载资源

### 🎵 音效资源 (${this.downloadStats.success} 个成功)
- UI音效: 按钮点击、成功、错误、通知
- 战斗音效: 剑击、魔法、爆炸
- 环境音效: 风声、火焰

### 🎨 图像资源
- 技能图标: 剑、火、水、风、土、盾
- 道具图标: 药剂、靴子

## 📋 许可证信息

### SoundJay.com
- 许可证: 免费个人使用
- 商用: 需要购买许可证
- 署名: 建议但非必需

### Game-icons.net  
- 许可证: CC BY 3.0
- 商用: 允许
- 署名: 必需 - "Icons by game-icons.net"

## 🔄 替换建议

1. **立即可用**: 当前下载的资源可直接使用
2. **质量升级**: 考虑购买专业音效库
3. **原创定制**: 委托专业设计师制作独特资源

## 🎮 游戏集成

资源已自动映射到游戏所需位置:
- \`sounds/ui/\` - UI交互音效
- \`sounds/skills/\` - 技能音效  
- \`images/skills/\` - 技能图标
- \`images/items/\` - 道具图标

## ⚖️ 法律声明

请确保遵守所有资源的许可证要求。商用前请验证许可证条款。
`;
        
        const guidePath = path.join(this.downloadDir, 'USAGE_GUIDE.md');
        await fs.writeFile(guidePath, guide);
        console.log('📖 使用指南已生成');
    }

    // 主执行函数
    async execute() {
        console.log('🚀 启动高质量资源爬取器...');
        console.log('🎯 目标: 获取免费高质量游戏资源\n');
        
        try {
            // 初始化
            await this.initialize();
            
            // 下载资源
            await this.downloadSounds();
            await this.downloadIcons();
            
            // 创建映射和指南
            await this.createResourceMapping();
            await this.generateUsageGuide();
            
            // 应用到游戏
            await this.applyDownloadedAssets();
            
            // 生成报告
            this.generateReport();
            
        } catch (error) {
            console.error('💥 爬取失败:', error.message);
        }
    }

    // 生成最终报告
    generateReport() {
        console.log('\n📊 爬取完成报告');
        console.log('='.repeat(50));
        console.log(`📥 尝试下载: ${this.downloadStats.total} 个文件`);
        console.log(`✅ 成功下载: ${this.downloadStats.success} 个文件`);
        console.log(`❌ 下载失败: ${this.downloadStats.failed} 个文件`);
        console.log(`📁 下载目录: ${this.downloadDir}`);
        console.log('='.repeat(50));
        
        if (this.downloadStats.success > 0) {
            console.log('\n🎉 成功获取高质量资源！');
            console.log('💡 建议: 查看 downloads/premium/USAGE_GUIDE.md');
            console.log('🎮 游戏状态: 资源已升级，体验更佳！');
        } else {
            console.log('\n⚠️  未能下载新资源，但现有生成资源仍可使用');
            console.log('🎮 游戏状态: 使用生成资源，功能完整');
        }
        
        console.log('\n🚀 启动游戏: npm run quick-start');
    }
}

// 主函数
async function main() {
    const crawler = new PremiumAssetCrawler();
    await crawler.execute();
}

// 如果直接运行
if (require.main === module) {
    main();
}

module.exports = PremiumAssetCrawler;