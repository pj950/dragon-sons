#!/bin/bash
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
