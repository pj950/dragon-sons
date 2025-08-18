#!/usr/bin/env node

// 龙生九子·五行对战 - 资源部署脚本

const fs = require('fs').promises;
const path = require('path');

class AssetDeployer {
    constructor() {
        this.assetsDir = path.join(__dirname, 'assets');
        this.generatedDir = path.join(__dirname, 'generated');
        this.deployDir = path.join(__dirname, 'dist');
    }

    // 创建目录结构
    async createDirectories() {
        const dirs = [
            path.join(this.assetsDir, 'sounds', 'skills', 'metal'),
            path.join(this.assetsDir, 'sounds', 'skills', 'wood'),
            path.join(this.assetsDir, 'sounds', 'skills', 'water'),
            path.join(this.assetsDir, 'sounds', 'skills', 'fire'),
            path.join(this.assetsDir, 'sounds', 'skills', 'earth'),
            path.join(this.assetsDir, 'sounds', 'ui'),
            path.join(this.assetsDir, 'sounds', 'ambient'),
            path.join(this.assetsDir, 'images', 'skills'),
            path.join(this.assetsDir, 'images', 'items'),
            path.join(this.assetsDir, 'images', 'ui'),
            path.join(this.assetsDir, 'images', 'characters'),
            this.generatedDir,
            this.deployDir
        ];

        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`✅ 创建目录: ${dir}`);
            } catch (error) {
                console.error(`❌ 创建目录失败: ${dir}`, error);
            }
        }
    }

    // 创建资源清单文件
    async createAssetManifest() {
        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            description: '龙生九子·五行对战 - 游戏资源清单',
            
            // 音效文件清单
            sounds: {
                skills: {
                    metal: [
                        'metal_charge.wav', 'metal_clang.wav', 'sword_whoosh.wav',
                        'metal_slice.wav', 'metal_ring.wav', 'electric_charge.wav',
                        'blade_slice.wav', 'metal_rain.wav', 'metal_clank.wav',
                        'blade_sharpen.wav', 'speed_boost.wav'
                    ],
                    wood: [
                        'thunder_charge.wav', 'thunder_crack.wav', 'wind_whoosh.wav',
                        'wind_rush.wav', 'wood_grow.wav', 'vine_rustle.wav',
                        'leaf_rustle.wav', 'wind_gather.wav', 'poison_brew.wav',
                        'root_grow.wav', 'wind_light.wav', 'eagle_cry.wav', 'life_pulse.wav'
                    ],
                    water: [
                        'ice_form.wav', 'ice_shatter.wav', 'water_charge.wav',
                        'water_rush.wav', 'water_impact.wav', 'wind_cold.wav',
                        'mist_form.wav', 'steam_hiss.wav'
                    ],
                    fire: [
                        'fire_charge.wav', 'explosion.wav', 'fire_roar.wav',
                        'lava_bubble.wav', 'meteor_call.wav', 'fire_mark.wav',
                        'fire_whip.wav', 'solar_charge.wav'
                    ],
                    earth: [
                        'stone_rumble.wav', 'stone_crack.wav', 'earth_charge.wav',
                        'earthquake.wav', 'stone_form.wav', 'sand_swirl.wav',
                        'mud_bubble.wav', 'stone_armor.wav', 'shield_activate.wav',
                        'stone_harden.wav'
                    ]
                },
                ui: [
                    'button_click.wav', 'notification.wav', 'error.wav', 'success.wav'
                ],
                ambient: [
                    'ambient_wind.wav', 'ambient_battle.wav'
                ]
            },

            // 图像文件清单
            images: {
                skills: [
                    // 技能图标 (49个)
                    'slash.png', 'arcSlash.png', 'metalClash.png', 'staticField.png',
                    'silenceHex.png', 'bloodletting.png', 'ironRain.png', 'ironBody.png',
                    'arcaneFocus.png', 'keenEdge.png', 'quickCast.png',
                    
                    'thunderChain.png', 'windDash.png', 'forestSnare.png', 'cyclone.png',
                    'venomStrike.png', 'galeStep.png', 'rootBind.png', 'leafBlade.png',
                    'vineWhip.png', 'swiftFeet.png', 'eagleEye.png', 'vitality.png', 'thorns.png',
                    
                    'iceNova.png', 'waterJet.png', 'torrent.png', 'blizzard.png',
                    'mistVeil.png', 'steamBurst.png', 'serpent.png',
                    
                    'flameBurst.png', 'lavaZone.png', 'meteor.png', 'burningMark.png',
                    'emberLash.png', 'solarFlare.png', 'phoenix.png', 'berserk.png',
                    
                    'stoneWall.png', 'earthStomp.png', 'rockShield.png', 'quake.png',
                    'sandPrison.png', 'mudTrap.png', 'thickHide.png', 'shieldWard.png',
                    'aurashield.png', 'stoneSkin.png'
                ],
                items: [
                    // 水果图标 (5个)
                    'metal_fruit.png', 'wood_fruit.png', 'water_fruit.png',
                    'fire_fruit.png', 'earth_fruit.png',
                    
                    // 道具图标 (6个)
                    'invuln.png', 'boots.png', 'potion.png',
                    'bomb.png', 'trap.png', 'blink.png'
                ],
                characters: [
                    // 角色头像 (9个)
                    'qiuniu.png', 'yazi.png', 'chaofeng.png',
                    'pulao.png', 'suanni.png', 'bixi.png',
                    'bixie.png', 'fuxi.png', 'chiwen.png'
                ],
                ui: [
                    // UI元素 (动态生成)
                    'buttons/', 'panels/', 'progress_bars/', 'decorations/'
                ]
            },

            // 使用说明
            usage: {
                development: {
                    description: '开发环境使用程序生成的资源',
                    command: 'npm run generate-assets'
                },
                production: {
                    description: '生产环境使用优化后的资源文件',
                    command: 'npm run deploy-assets'
                }
            },

            // 技术规格
            specifications: {
                audio: {
                    format: 'WAV',
                    sampleRate: '44.1kHz',
                    bitDepth: '16-bit',
                    channels: 'Mono',
                    maxDuration: '1.2s'
                },
                images: {
                    skillIcons: {
                        format: 'PNG',
                        size: '64x64',
                        transparency: true
                    },
                    itemIcons: {
                        format: 'PNG', 
                        size: '48x48',
                        transparency: true
                    },
                    ui: {
                        format: 'PNG',
                        sizes: 'Variable',
                        transparency: true
                    }
                }
            }
        };

        return manifest;
    }

    // 部署资源文件
    async deploy() {
        console.log('🚀 开始部署资源文件...');
        
        try {
            // 创建目录结构
            await this.createDirectories();
            
            // 生成资源清单
            const manifest = await this.createAssetManifest();
            
            // 保存清单文件
            const manifestPath = path.join(this.assetsDir, 'manifest.json');
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
            console.log('✅ 资源清单已生成:', manifestPath);
            
            // 创建README文件
            await this.createAssetsReadme();
            
            console.log('🎉 资源部署完成！');
            console.log(`📁 资源目录: ${this.assetsDir}`);
            console.log('💡 使用 generate-assets.html 生成实际文件');
            
        } catch (error) {
            console.error('❌ 资源部署失败:', error);
        }
    }

    // 创建资源README
    async createAssetsReadme() {
        const readmeContent = `# 游戏资源文件

## 📊 资源统计
- **音效文件**: 54个 (WAV格式)
- **技能图标**: 49个 (64x64 PNG)
- **道具图标**: 11个 (48x48 PNG)  
- **角色头像**: 9个 (64x64 PNG)
- **UI资源**: 100+ 个 (可变尺寸 PNG)

## 🛠️ 生成方法
1. 打开 \`generate-assets.html\`
2. 点击"生成所有资源"
3. 下载生成的文件到对应目录

## 📁 目录结构
\`\`\`
assets/
├── sounds/
│   ├── skills/
│   │   ├── metal/     # 金系技能音效 (11个)
│   │   ├── wood/      # 木系技能音效 (13个)
│   │   ├── water/     # 水系技能音效 (8个)
│   │   ├── fire/      # 火系技能音效 (8个)
│   │   └── earth/     # 土系技能音效 (10个)
│   ├── ui/            # UI音效 (4个)
│   └── ambient/       # 环境音效 (2个)
├── images/
│   ├── skills/        # 技能图标 (49个)
│   ├── items/         # 道具图标 (11个)
│   ├── characters/    # 角色头像 (9个)
│   └── ui/            # UI元素 (100+个)
└── manifest.json      # 资源清单文件
\`\`\`

## 🎯 使用说明
资源文件通过程序生成，确保：
- 版权清晰（程序生成）
- 风格一致（配置驱动）
- 易于维护（可重新生成）
- 性能优化（自动压缩）

---
*此文件由部署脚本自动生成*`;

        const readmePath = path.join(this.assetsDir, 'README.md');
        await fs.writeFile(readmePath, readmeContent);
        console.log('✅ 资源README已生成:', readmePath);
    }
}

// 如果作为脚本运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetDeployer;
    
    // 命令行运行
    if (require.main === module) {
        const deployer = new AssetDeployer();
        deployer.deploy().catch(console.error);
    }
} else {
    // 浏览器环境
    window.AssetDeployer = AssetDeployer;
}