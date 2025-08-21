#!/bin/bash

# 龙生九子·五行对战 - 免费资源下载脚本
# Dragon Sons: Five Elements Battle - Free Assets Download Script

set -e

echo "🚀 开始下载免费游戏资源..."
echo "🌟 Downloading free game assets..."

# 创建下载目录
DOWNLOAD_DIR="./downloads"
ASSETS_DIR="./client/assets"

mkdir -p "$DOWNLOAD_DIR"/{sounds,images,ui,temp}

# 颜色输出函数
print_status() {
    echo -e "\033[32m✅ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

# 检查工具
check_tools() {
    print_info "检查必要工具..."
    
    if ! command -v curl &> /dev/null; then
        print_error "curl 未安装，请安装: sudo apt-get install curl"
        exit 1
    fi
    
    if ! command -v unzip &> /dev/null; then
        print_error "unzip 未安装，请安装: sudo apt-get install unzip"
        exit 1
    fi
    
    print_status "工具检查完成"
}

# 下载Kenney资源包 (CC0许可证)
download_kenney_assets() {
    print_info "下载Kenney游戏资源包 (CC0许可证)..."
    
    # UI Pack
    if ! curl -L "https://www.kenney.nl/content/3-assets/ui-pack.zip" -o "$DOWNLOAD_DIR/temp/kenney-ui.zip" --fail; then
        print_warning "Kenney UI包下载失败，跳过..."
    else
        cd "$DOWNLOAD_DIR/temp"
        unzip -q kenney-ui.zip -d ../ui/kenney-ui/
        print_status "Kenney UI包下载完成"
        cd - > /dev/null
    fi
    
    # Game Icons
    if ! curl -L "https://www.kenney.nl/content/3-assets/game-icons.zip" -o "$DOWNLOAD_DIR/temp/kenney-icons.zip" --fail; then
        print_warning "Kenney图标包下载失败，跳过..."
    else
        cd "$DOWNLOAD_DIR/temp"
        unzip -q kenney-icons.zip -d ../images/kenney-icons/
        print_status "Kenney图标包下载完成"
        cd - > /dev/null
    fi
}

# 下载开源音效资源
download_open_sounds() {
    print_info "下载开源音效资源..."
    
    # 创建音效目录
    mkdir -p "$DOWNLOAD_DIR/sounds/open-sounds"
    
    # 一些CC0音效的直接链接（需要验证可用性）
    declare -A sound_urls=(
        ["button_click.wav"]="https://www.soundjay.com/misc/sounds/button-09.wav"
        ["sword_clash.wav"]="https://www.soundjay.com/misc/sounds/sword-02.wav"
    )
    
    for sound_name in "${!sound_urls[@]}"; do
        sound_url="${sound_urls[$sound_name]}"
        if curl -L "$sound_url" -o "$DOWNLOAD_DIR/sounds/open-sounds/$sound_name" --fail --silent; then
            print_status "下载音效: $sound_name"
        else
            print_warning "音效下载失败: $sound_name"
        fi
    done
}

# 下载游戏图标资源
download_game_icons() {
    print_info "准备游戏图标资源..."
    
    # 创建图标目录
    mkdir -p "$DOWNLOAD_DIR/images/game-icons"
    
    print_info "游戏图标可以从以下网站手动下载："
    echo "  🎯 Game Icons: https://game-icons.net/"
    echo "  🎯 OpenGameArt: https://opengameart.org/"
    echo "  🎯 Itch.io: https://itch.io/game-assets/free"
    
    # 创建图标需求清单
    cat > "$DOWNLOAD_DIR/images/game-icons/REQUIREMENTS.md" << EOF
# 图标需求清单 Icon Requirements

## 技能图标 Skill Icons (64x64 PNG)

### 金系技能 Metal Skills
- slash.png - 重斩 (剑类图标)
- arcSlash.png - 弧形剑气 (弧形攻击)
- metalClash.png - 金鸣 (金属碰撞)
- staticField.png - 静电场 (电击效果)
- silenceHex.png - 缄咒 (沉默法术)
- bloodletting.png - 流血 (流血效果)
- ironRain.png - 铁雨 (范围攻击)

### 木系技能 Wood Skills  
- thunderChain.png - 雷链 (闪电链)
- windDash.png - 风驰 (风系移动)
- forestSnare.png - 缚根 (控制技能)
- cyclone.png - 龙卷 (龙卷风)
- venomStrike.png - 蛇毒 (毒系攻击)
- galeStep.png - 疾风步 (敏捷技能)
- rootBind.png - 缚术 (束缚技能)

### 水系技能 Water Skills
- iceNova.png - 冰环 (冰系范围)
- waterJet.png - 水矢 (水系射击)
- torrent.png - 急流 (水流攻击)
- blizzard.png - 暴雪 (冰雪风暴)
- mistVeil.png - 迷雾 (隐身技能)
- steamBurst.png - 蒸腾 (蒸汽攻击)

### 火系技能 Fire Skills
- flameBurst.png - 炎爆 (火焰爆炸)
- lavaZone.png - 熔域 (岩浆区域)
- meteor.png - 陨星 (陨石攻击)
- burningMark.png - 灼印 (燃烧标记)

### 土系技能 Earth Skills
- stoneWall.png - 石墙 (防御技能)
- earthStomp.png - 大地践踏 (震击攻击)
- rockShield.png - 岩石护盾 (护盾技能)

## 道具图标 Item Icons (48x48 PNG)
- metal_fruit.png - 金果 (金色水果)
- wood_fruit.png - 木果 (绿色水果)  
- water_fruit.png - 水果 (蓝色水果)
- fire_fruit.png - 火果 (红色水果)
- earth_fruit.png - 土果 (棕色水果)
- invuln.png - 金钟罩 (无敌道具)
- boots.png - 神行鞋 (靴子道具)

## 角色图标 Character Icons (64x64 PNG)
- qiuniu.png - 囚牛 (龙头角色)
- yazi.png - 睚眦 (战士角色)
- chaofeng.png - 嘲风 (飞行角色)
- pulao.png - 蒲牢 (声音角色)
- suanni.png - 狻猊 (狮子角色)
- bixi.png - 赑屃 (龟类角色)
- bixie.png - 狴犴 (正义角色)
- fuxi.png - 负屃 (文学角色)
- chiwen.png - 螭吻 (水龙角色)

## 搜索建议 Search Suggestions
- 在 game-icons.net 搜索: sword, lightning, fire, water, earth, wind
- 在 opengameart.org 搜索: fantasy icons, RPG skills, elemental magic
- 使用关键词: fantasy, medieval, magic, elemental, skill icons
EOF

    print_status "图标需求清单已创建"
}

# 创建资源使用指南
create_usage_guide() {
    print_info "创建资源使用指南..."
    
    cat > "$DOWNLOAD_DIR/USAGE_GUIDE.md" << EOF
# 资源使用指南 Asset Usage Guide

## 📁 目录结构 Directory Structure
\`\`\`
downloads/
├── sounds/          # 音效资源
│   └── open-sounds/ # 开源音效
├── images/          # 图像资源  
│   ├── kenney-icons/# Kenney图标包
│   └── game-icons/  # 游戏图标
└── ui/              # UI资源
    └── kenney-ui/   # Kenney UI包
\`\`\`

## 🔄 替换现有资源 Replace Existing Assets

### 1. 备份当前资源
\`\`\`bash
cp -r client/assets client/assets.backup
\`\`\`

### 2. 复制新资源
\`\`\`bash
# 复制音效
cp downloads/sounds/open-sounds/* client/assets/sounds/ui/

# 复制UI资源
cp -r downloads/ui/kenney-ui/* client/assets/images/ui/

# 复制图标 (需要重命名以匹配游戏需求)
cp downloads/images/game-icons/* client/assets/images/skills/
\`\`\`

### 3. 重新生成资源清单
\`\`\`bash
cd client
node deploy-assets.js
\`\`\`

## 📋 许可证信息 License Information

### Kenney资源 (CC0)
- 完全免费使用
- 无需署名
- 可商用

### 其他资源
- 请查看各资源的许可证要求
- 如需署名，请在游戏中添加致谢信息

## 🎯 质量优化建议 Quality Optimization Tips

### 音效优化
\`\`\`bash
# 使用ffmpeg转换格式
ffmpeg -i input.mp3 -ar 44100 -ac 1 -f wav output.wav
\`\`\`

### 图像优化
\`\`\`bash
# 使用ImageMagick调整大小
mogrify -resize 64x64 *.png
\`\`\`
EOF

    print_status "使用指南已创建"
}

# 主函数
main() {
    print_info "开始免费资源下载流程..."
    
    check_tools
    download_kenney_assets
    download_open_sounds
    download_game_icons
    create_usage_guide
    
    echo ""
    print_status "资源下载完成！"
    echo ""
    print_info "📁 下载目录: $DOWNLOAD_DIR"
    print_info "📖 使用指南: $DOWNLOAD_DIR/USAGE_GUIDE.md"
    print_info "📋 图标需求: $DOWNLOAD_DIR/images/game-icons/REQUIREMENTS.md"
    echo ""
    print_info "🔗 推荐资源网站:"
    echo "   • OpenGameArt: https://opengameart.org/"
    echo "   • Kenney: https://www.kenney.nl/assets"
    echo "   • Game Icons: https://game-icons.net/"
    echo "   • Freesound: https://freesound.org/"
    echo "   • Itch.io: https://itch.io/game-assets/free"
    echo ""
    print_info "💡 下一步: 手动下载高质量资源并替换现有占位符"
}

# 运行主函数
main "$@"