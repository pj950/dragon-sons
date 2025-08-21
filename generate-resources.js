#!/usr/bin/env node

// 龙生九子·五行对战 - 资源生成脚本
// 这个脚本将生成游戏所需的所有资源文件

const fs = require('fs').promises;
const path = require('path');

class ResourceGenerator {
    constructor() {
        this.assetsDir = path.join(__dirname, 'client', 'assets');
        this.generatedDir = path.join(__dirname, 'client', 'generated');
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
            path.join(this.assetsDir, 'images', 'fruits'),
            this.generatedDir
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

    // 生成简单的音效文件（使用Web Audio API的替代方案）
    async generateSimpleAudioFiles() {
        console.log('🎵 生成音效文件...');
        
        // 创建简单的音效文件（这里我们创建占位符文件）
        const audioFiles = [
            // 金系音效
            'sounds/skills/metal/metal_charge.wav',
            'sounds/skills/metal/metal_clang.wav',
            'sounds/skills/metal/sword_whoosh.wav',
            'sounds/skills/metal/metal_slice.wav',
            'sounds/skills/metal/metal_ring.wav',
            'sounds/skills/metal/electric_charge.wav',
            'sounds/skills/metal/blade_slice.wav',
            'sounds/skills/metal/metal_rain.wav',
            'sounds/skills/metal/metal_clank.wav',
            'sounds/skills/metal/blade_sharpen.wav',
            'sounds/skills/metal/speed_boost.wav',
            
            // 木系音效
            'sounds/skills/wood/thunder_charge.wav',
            'sounds/skills/wood/thunder_crack.wav',
            'sounds/skills/wood/wind_whoosh.wav',
            'sounds/skills/wood/wind_rush.wav',
            'sounds/skills/wood/wood_grow.wav',
            'sounds/skills/wood/vine_rustle.wav',
            'sounds/skills/wood/leaf_rustle.wav',
            'sounds/skills/wood/wind_gather.wav',
            'sounds/skills/wood/poison_brew.wav',
            'sounds/skills/wood/root_grow.wav',
            'sounds/skills/wood/wind_light.wav',
            'sounds/skills/wood/eagle_cry.wav',
            'sounds/skills/wood/life_pulse.wav',
            
            // 水系音效
            'sounds/skills/water/ice_form.wav',
            'sounds/skills/water/ice_shatter.wav',
            'sounds/skills/water/water_charge.wav',
            'sounds/skills/water/water_rush.wav',
            'sounds/skills/water/water_impact.wav',
            'sounds/skills/water/wind_cold.wav',
            'sounds/skills/water/mist_form.wav',
            'sounds/skills/water/steam_hiss.wav',
            
            // 火系音效
            'sounds/skills/fire/fire_charge.wav',
            'sounds/skills/fire/explosion.wav',
            'sounds/skills/fire/fire_roar.wav',
            'sounds/skills/fire/lava_bubble.wav',
            'sounds/skills/fire/meteor_call.wav',
            'sounds/skills/fire/fire_mark.wav',
            'sounds/skills/fire/fire_whip.wav',
            'sounds/skills/fire/solar_charge.wav',
            
            // 土系音效
            'sounds/skills/earth/stone_rumble.wav',
            'sounds/skills/earth/stone_crack.wav',
            'sounds/skills/earth/earth_charge.wav',
            'sounds/skills/earth/earthquake.wav',
            'sounds/skills/earth/stone_form.wav',
            'sounds/skills/earth/sand_swirl.wav',
            'sounds/skills/earth/mud_bubble.wav',
            'sounds/skills/earth/stone_armor.wav',
            'sounds/skills/earth/shield_activate.wav',
            'sounds/skills/earth/stone_harden.wav',
            
            // UI音效
            'sounds/ui/button_click.wav',
            'sounds/ui/notification.wav',
            'sounds/ui/error.wav',
            'sounds/ui/success.wav',
            
            // 环境音效
            'sounds/ambient/ambient_wind.wav',
            'sounds/ambient/ambient_battle.wav'
        ];

        for (const file of audioFiles) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated audio file placeholder');
                console.log(`✅ 生成音效: ${file}`);
            } catch (error) {
                console.error(`❌ 生成音效失败: ${file}`, error);
            }
        }
        
        console.log(`🎵 音效文件生成完成: ${audioFiles.length}个文件`);
    }

    // 生成技能图标
    async generateSkillIcons() {
        console.log('🎨 生成技能图标...');
        
        const skillIcons = [
            // 金系技能
            'images/skills/slash.png',
            'images/skills/arcSlash.png',
            'images/skills/metalClash.png',
            'images/skills/staticField.png',
            'images/skills/silenceHex.png',
            'images/skills/bloodletting.png',
            'images/skills/ironRain.png',
            'images/skills/ironBody.png',
            'images/skills/arcaneFocus.png',
            'images/skills/keenEdge.png',
            'images/skills/quickCast.png',
            
            // 木系技能
            'images/skills/thunderChain.png',
            'images/skills/windDash.png',
            'images/skills/forestSnare.png',
            'images/skills/cyclone.png',
            'images/skills/venomStrike.png',
            'images/skills/galeStep.png',
            'images/skills/rootBind.png',
            'images/skills/leafBlade.png',
            'images/skills/vineWhip.png',
            'images/skills/swiftFeet.png',
            'images/skills/eagleEye.png',
            'images/skills/vitality.png',
            'images/skills/thorns.png',
            
            // 水系技能
            'images/skills/iceNova.png',
            'images/skills/waterJet.png',
            'images/skills/frostBite.png',
            'images/skills/steamCloud.png',
            'images/skills/iceWall.png',
            'images/skills/waterShield.png',
            'images/skills/mistVeil.png',
            'images/skills/iceSpike.png',
            
            // 火系技能
            'images/skills/flameBurst.png',
            'images/skills/meteorStrike.png',
            'images/skills/fireWhip.png',
            'images/skills/solarFlare.png',
            'images/skills/lavaFlow.png',
            'images/skills/fireMark.png',
            'images/skills/heatWave.png',
            'images/skills/emberStorm.png',
            
            // 土系技能
            'images/skills/stoneWall.png',
            'images/skills/earthStomp.png',
            'images/skills/sandTrap.png',
            'images/skills/stoneArmor.png',
            'images/skills/earthquake.png',
            'images/skills/mudSlide.png',
            'images/skills/rockThrow.png',
            'images/skills/groundPound.png'
        ];

        for (const file of skillIcons) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated skill icon placeholder');
                console.log(`✅ 生成技能图标: ${file}`);
            } catch (error) {
                console.error(`❌ 生成技能图标失败: ${file}`, error);
            }
        }
        
        console.log(`🎨 技能图标生成完成: ${skillIcons.length}个文件`);
    }

    // 生成道具图标
    async generateItemIcons() {
        console.log('🎁 生成道具图标...');
        
        const itemIcons = [
            'images/items/invuln.png',
            'images/items/boots.png',
            'images/items/potion.png',
            'images/items/bomb.png',
            'images/items/trap.png',
            'images/items/blink.png',
            'images/items/shield.png',
            'images/items/sword.png',
            'images/items/armor.png',
            'images/items/ring.png',
            'images/items/necklace.png',
            'images/items/gloves.png',
            'images/items/belt.png',
            'images/items/cloak.png',
            'images/items/helmet.png'
        ];

        for (const file of itemIcons) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated item icon placeholder');
                console.log(`✅ 生成道具图标: ${file}`);
            } catch (error) {
                console.error(`❌ 生成道具图标失败: ${file}`, error);
            }
        }
        
        console.log(`🎁 道具图标生成完成: ${itemIcons.length}个文件`);
    }

    // 生成水果图标
    async generateFruitIcons() {
        console.log('🍎 生成水果图标...');
        
        const fruitIcons = [
            'images/fruits/metal_fruit.png',
            'images/fruits/wood_fruit.png',
            'images/fruits/water_fruit.png',
            'images/fruits/fire_fruit.png',
            'images/fruits/earth_fruit.png'
        ];

        for (const file of fruitIcons) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated fruit icon placeholder');
                console.log(`✅ 生成水果图标: ${file}`);
            } catch (error) {
                console.error(`❌ 生成水果图标失败: ${file}`, error);
            }
        }
        
        console.log(`🍎 水果图标生成完成: ${fruitIcons.length}个文件`);
    }

    // 生成角色图标
    async generateCharacterIcons() {
        console.log('🐉 生成角色图标...');
        
        const characterIcons = [
            'images/characters/qiuniu.png',
            'images/characters/yazi.png',
            'images/characters/chaofeng.png',
            'images/characters/pulao.png',
            'images/characters/suanni.png',
            'images/characters/bixi.png',
            'images/characters/bian.png',
            'images/characters/fuxi.png',
            'images/characters/chiwen.png'
        ];

        for (const file of characterIcons) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated character icon placeholder');
                console.log(`✅ 生成角色图标: ${file}`);
            } catch (error) {
                console.error(`❌ 生成角色图标失败: ${file}`, error);
            }
        }
        
        console.log(`🐉 角色图标生成完成: ${characterIcons.length}个文件`);
    }

    // 生成UI资源
    async generateUIResources() {
        console.log('🖥️ 生成UI资源...');
        
        const uiResources = [
            'images/ui/button_normal.png',
            'images/ui/button_hover.png',
            'images/ui/button_pressed.png',
            'images/ui/panel_bg.png',
            'images/ui/panel_header.png',
            'images/ui/health_bar.png',
            'images/ui/mana_bar.png',
            'images/ui/exp_bar.png',
            'images/ui/minimap_bg.png',
            'images/ui/inventory_slot.png',
            'images/ui/skill_slot.png',
            'images/ui/close_button.png',
            'images/ui/minimize_button.png',
            'images/ui/maximize_button.png',
            'images/ui/scroll_bar.png',
            'images/ui/scroll_thumb.png'
        ];

        for (const file of uiResources) {
            const filePath = path.join(this.assetsDir, file);
            const dir = path.dirname(filePath);
            
            try {
                await fs.mkdir(dir, { recursive: true });
                // 创建一个简单的占位符文件
                await fs.writeFile(filePath, 'Generated UI resource placeholder');
                console.log(`✅ 生成UI资源: ${file}`);
            } catch (error) {
                console.error(`❌ 生成UI资源失败: ${file}`, error);
            }
        }
        
        console.log(`🖥️ UI资源生成完成: ${uiResources.length}个文件`);
    }

    // 生成资源清单
    async generateAssetManifest() {
        console.log('📋 生成资源清单...');
        
        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            description: '龙生九子·五行对战 - 游戏资源清单',
            totalFiles: 0,
            categories: {
                sounds: { count: 0, files: [] },
                images: { count: 0, files: [] }
            }
        };

        // 扫描assets目录
        const scanDirectory = async (dir) => {
            const files = [];
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        files.push(...await scanDirectory(fullPath));
                    } else {
                        const relativePath = path.relative(this.assetsDir, fullPath);
                        files.push(relativePath);
                    }
                }
            } catch (error) {
                console.error(`扫描目录失败: ${dir}`, error);
            }
            return files;
        };

        const allFiles = await scanDirectory(this.assetsDir);
        manifest.totalFiles = allFiles.length;

        // 分类文件
        for (const file of allFiles) {
            if (file.startsWith('sounds/')) {
                manifest.categories.sounds.files.push(file);
                manifest.categories.sounds.count++;
            } else if (file.startsWith('images/')) {
                manifest.categories.images.files.push(file);
                manifest.categories.images.count++;
            }
        }

        // 写入清单文件
        const manifestPath = path.join(this.assetsDir, 'manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`📋 资源清单生成完成: ${manifestPath}`);
        console.log(`📊 总计: ${manifest.totalFiles}个文件`);
        console.log(`🎵 音效: ${manifest.categories.sounds.count}个文件`);
        console.log(`🎨 图像: ${manifest.categories.images.count}个文件`);
    }

    // 生成所有资源
    async generateAllResources() {
        console.log('🚀 开始生成所有游戏资源...');
        console.log('=====================================');
        
        try {
            // 创建目录结构
            await this.createDirectories();
            
            // 生成各类资源
            await this.generateSimpleAudioFiles();
            await this.generateSkillIcons();
            await this.generateItemIcons();
            await this.generateFruitIcons();
            await this.generateCharacterIcons();
            await this.generateUIResources();
            
            // 生成资源清单
            await this.generateAssetManifest();
            
            console.log('=====================================');
            console.log('🎉 所有资源生成完成！');
            console.log(`📁 资源目录: ${this.assetsDir}`);
            console.log('💡 现在你可以启动游戏了！');
            
        } catch (error) {
            console.error('❌ 资源生成失败:', error);
            process.exit(1);
        }
    }
}

// 主函数
async function main() {
    const generator = new ResourceGenerator();
    await generator.generateAllResources();
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ResourceGenerator;