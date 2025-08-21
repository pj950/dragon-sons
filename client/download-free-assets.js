#!/usr/bin/env node

// 龙生九子·五行对战 - 免费资源下载助手
// 帮助从免费资源网站获取游戏资源

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log(`
🎮 龙生九子·五行对战 - 免费资源下载助手
${'='.repeat(50)}

本工具提供以下功能：
1. 生成资源下载清单
2. 提供免费资源网站链接
3. 协助整理下载的资源

`);

// 免费资源网站集合
const freeResourceSites = {
    sounds: {
        'OpenGameArt.org': {
            url: 'https://opengameart.org/content-search?keys=&field_art_type_tid%5B%5D=13',
            description: '完全免费的游戏音效，CC0授权',
            searchTips: [
                '搜索 "sword" 获取剑类音效',
                '搜索 "magic" 获取魔法音效',
                '搜索 "element" 获取元素音效'
            ]
        },
        'Freesound.org': {
            url: 'https://freesound.org/search/?q=game',
            description: '需要免费注册，高质量音效库',
            searchTips: [
                '使用标签筛选: "game", "fantasy", "combat"',
                '下载WAV格式，44.1kHz'
            ]
        },
        'Zapsplat.com': {
            url: 'https://www.zapsplat.com/sound-effect-categories/',
            description: '专业音效库，需要免费注册',
            searchTips: [
                '分类浏览: Games > Fantasy',
                '使用筛选器找到合适长度的音效'
            ]
        }
    },
    images: {
        'Game-icons.net': {
            url: 'https://game-icons.net/',
            description: '3000+免费游戏图标，SVG格式',
            searchTips: [
                '使用搜索框查找技能图标',
                '可以自定义颜色和背景',
                '下载后转换为64x64 PNG'
            ]
        },
        'OpenGameArt.org': {
            url: 'https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=9',
            description: '免费游戏美术资源',
            searchTips: [
                '搜索 "skill icons" 或 "ability icons"',
                '查找 "UI elements" 获取界面元素'
            ]
        },
        'Kenney.nl': {
            url: 'https://kenney.nl/assets',
            description: '高质量免费游戏资源包',
            searchTips: [
                '下载 "Game Icons" 包',
                '查看 "UI Pack" 系列'
            ]
        }
    }
};

// 生成资源下载清单
function generateDownloadList() {
    const downloadList = `
# 资源下载清单

## 需要下载的音效文件

### 金属系技能音效 (Metal)
- [ ] metal_charge.wav - 金属充能音效
- [ ] metal_clang.wav - 金属碰撞音
- [ ] sword_whoosh.wav - 剑风音效
- [ ] metal_slice.wav - 金属切割音
- [ ] blade_slice.wav - 刀刃切割音

### 木系技能音效 (Wood)
- [ ] thunder_charge.wav - 雷电充能音
- [ ] wind_whoosh.wav - 风声呼啸
- [ ] leaf_rustle.wav - 树叶沙沙声
- [ ] vine_rustle.wav - 藤蔓生长音

### 水系技能音效 (Water)  
- [ ] ice_form.wav - 冰冻形成音
- [ ] water_rush.wav - 水流冲击音
- [ ] steam_hiss.wav - 蒸汽嘶嘶声

### 火系技能音效 (Fire)
- [ ] fire_charge.wav - 火焰充能音
- [ ] explosion.wav - 爆炸音效
- [ ] lava_bubble.wav - 熔岩冒泡音

### 土系技能音效 (Earth)
- [ ] stone_rumble.wav - 岩石隆隆声
- [ ] earthquake.wav - 地震音效
- [ ] mud_bubble.wav - 泥浆冒泡音

### UI音效
- [ ] button_click.wav - 按钮点击音
- [ ] notification.wav - 通知提示音
- [ ] error.wav - 错误提示音
- [ ] success.wav - 成功提示音

## 需要下载的图像文件

### 技能图标 (64x64 PNG)
- [ ] 各类技能图标 (参考 manifest.json)

### 道具图标 (48x48 PNG)
- [ ] 五行水果图标
- [ ] 功能道具图标

### UI元素
- [ ] 按钮素材
- [ ] 面板背景
- [ ] 进度条素材

---
保存这个清单并在下载资源时勾选已完成的项目。
`;

    const listPath = path.join(__dirname, 'assets', 'DOWNLOAD_CHECKLIST.md');
    fs.writeFileSync(listPath, downloadList);
    console.log(`✅ 已生成下载清单: ${listPath}`);
}

// 显示资源网站信息
function showResourceSites() {
    console.log('\n📚 推荐的免费资源网站：\n');
    
    console.log('🎵 音效资源网站：');
    Object.entries(freeResourceSites.sounds).forEach(([name, info]) => {
        console.log(`\n${name}:`);
        console.log(`  🔗 ${info.url}`);
        console.log(`  📝 ${info.description}`);
        console.log('  💡 搜索建议:');
        info.searchTips.forEach(tip => console.log(`     - ${tip}`));
    });
    
    console.log('\n\n🎨 图像资源网站：');
    Object.entries(freeResourceSites.images).forEach(([name, info]) => {
        console.log(`\n${name}:`);
        console.log(`  🔗 ${info.url}`);
        console.log(`  📝 ${info.description}`);
        console.log('  💡 搜索建议:');
        info.searchTips.forEach(tip => console.log(`     - ${tip}`));
    });
}

// 生成资源整理脚本
function generateOrganizeScript() {
    const script = `#!/bin/bash
# 资源整理脚本 - 将下载的资源移动到正确位置

echo "🎮 开始整理游戏资源..."

# 创建备份
if [ -d "assets_backup" ]; then
    rm -rf assets_backup
fi
cp -r assets assets_backup
echo "✅ 已备份现有资源到 assets_backup/"

# 整理音效文件
echo "🎵 整理音效文件..."
# 将下载的音效文件移动到对应目录
# 例如: mv downloads/*.wav assets/sounds/skills/metal/

# 整理图像文件  
echo "🎨 整理图像文件..."
# 将下载的图像文件移动到对应目录
# 例如: mv downloads/skill_*.png assets/images/skills/

echo "✅ 资源整理完成！"
echo "📝 请手动检查并重命名文件以匹配 manifest.json 中的命名"
`;

    const scriptPath = path.join(__dirname, 'organize-assets.sh');
    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
    console.log(`\n✅ 已生成资源整理脚本: ${scriptPath}`);
}

// 主函数
function main() {
    // 生成下载清单
    generateDownloadList();
    
    // 显示资源网站
    showResourceSites();
    
    // 生成整理脚本
    generateOrganizeScript();
    
    console.log(`
${'='.repeat(50)}

📋 使用步骤：
1. 查看 assets/DOWNLOAD_CHECKLIST.md 了解需要的资源
2. 访问上述网站下载对应资源
3. 将下载的文件放入 downloads/ 目录
4. 运行 ./organize-assets.sh 整理资源
5. 根据 manifest.json 重命名文件

💡 提示：
- 优先下载 CC0 或 Public Domain 授权的资源
- 音效格式：WAV, 44.1kHz, 16-bit, Mono, <1.2秒
- 图像格式：PNG, 透明背景
- 技能图标：64x64 像素
- 道具图标：48x48 像素

🌟 也可以使用 generate-assets.html 在浏览器中生成基础资源！
`);
}

// 运行主函数
main();