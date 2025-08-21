# 资源使用指南 Asset Usage Guide

## 📁 目录结构 Directory Structure
```
downloads/
├── sounds/          # 音效资源
│   └── open-sounds/ # 开源音效
├── images/          # 图像资源  
│   ├── kenney-icons/# Kenney图标包
│   └── game-icons/  # 游戏图标
└── ui/              # UI资源
    └── kenney-ui/   # Kenney UI包
```

## 🔄 替换现有资源 Replace Existing Assets

### 1. 备份当前资源
```bash
cp -r client/assets client/assets.backup
```

### 2. 复制新资源
```bash
# 复制音效
cp downloads/sounds/open-sounds/* client/assets/sounds/ui/

# 复制UI资源
cp -r downloads/ui/kenney-ui/* client/assets/images/ui/

# 复制图标 (需要重命名以匹配游戏需求)
cp downloads/images/game-icons/* client/assets/images/skills/
```

### 3. 重新生成资源清单
```bash
cd client
node deploy-assets.js
```

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
```bash
# 使用ffmpeg转换格式
ffmpeg -i input.mp3 -ar 44100 -ac 1 -f wav output.wav
```

### 图像优化
```bash
# 使用ImageMagick调整大小
mogrify -resize 64x64 *.png
```
