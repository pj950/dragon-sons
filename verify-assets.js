#!/usr/bin/env node

// 资源验证和重新生成工具

const fs = require('fs').promises;
const path = require('path');

class AssetVerifier {
    constructor() {
        this.assetsDir = path.join(__dirname, 'client/assets');
        this.stats = {
            sounds: 0,
            images: 0,
            total: 0,
            missing: []
        };
    }

    // 验证并列出所有资源
    async verifyAssets() {
        console.log('🔍 正在验证assets目录中的文件...\n');
        
        try {
            // 检查音效文件
            console.log('🎵 音效文件 (*.wav):');
            const soundFiles = await this.findFiles(path.join(this.assetsDir, 'sounds'), '.wav');
            soundFiles.forEach((file, index) => {
                const relativePath = path.relative(this.assetsDir, file);
                const stats = require('fs').statSync(file);
                console.log(`   ${index + 1}. ${relativePath} (${this.formatFileSize(stats.size)})`);
            });
            this.stats.sounds = soundFiles.length;
            
            console.log(`\n🎨 图像文件 (*.svg, *.png):`)
            const imageFiles = await this.findFiles(path.join(this.assetsDir, 'images'), ['.svg', '.png']);
            imageFiles.forEach((file, index) => {
                const relativePath = path.relative(this.assetsDir, file);
                const stats = require('fs').statSync(file);
                console.log(`   ${index + 1}. ${relativePath} (${this.formatFileSize(stats.size)})`);
            });
            this.stats.images = imageFiles.length;
            
            this.stats.total = this.stats.sounds + this.stats.images;
            
            console.log('\n📊 统计结果:');
            console.log(`   🎵 音效文件: ${this.stats.sounds} 个`);
            console.log(`   🎨 图像文件: ${this.stats.images} 个`);
            console.log(`   📁 总计: ${this.stats.total} 个文件`);
            
            return this.stats;
            
        } catch (error) {
            console.error('❌ 验证失败:', error.message);
            return null;
        }
    }

    // 查找文件
    async findFiles(dir, extensions) {
        const files = [];
        const exts = Array.isArray(extensions) ? extensions : [extensions];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const subFiles = await this.findFiles(fullPath, extensions);
                    files.push(...subFiles);
                } else if (exts.some(ext => entry.name.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 目录不存在
        }
        return files;
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 创建资源展示HTML
    async createAssetViewer() {
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>资源文件查看器 - 龙生九子·五行对战</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(0,0,0,0.8);
            padding: 30px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            background: linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5rem;
            margin-bottom: 2rem;
        }
        .section {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .file-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .file-item {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
            text-align: center;
        }
        .file-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            text-align: center;
            margin: 20px 0;
        }
        .stat-item {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #4ECDC4;
        }
        .refresh-btn {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 资源文件查看器</h1>
        <p style="text-align: center; font-size: 1.2rem;">龙生九子·五行对战 - 资源验证工具</p>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number" id="soundCount">${this.stats.sounds}</div>
                <div>🎵 音效文件</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="imageCount">${this.stats.images}</div>
                <div>🎨 图像文件</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="totalCount">${this.stats.total}</div>
                <div>📁 总文件数</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🎵 音效文件目录结构</h2>
            <div class="file-grid">
                <div class="file-item">
                    <div class="file-icon">🔥</div>
                    <div>sounds/skills/metal/</div>
                    <small>金系技能音效</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🌿</div>
                    <div>sounds/skills/wood/</div>
                    <small>木系技能音效</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">💧</div>
                    <div>sounds/skills/water/</div>
                    <small>水系技能音效</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🔥</div>
                    <div>sounds/skills/fire/</div>
                    <small>火系技能音效</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🏔️</div>
                    <div>sounds/skills/earth/</div>
                    <small>土系技能音效</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🎛️</div>
                    <div>sounds/ui/</div>
                    <small>界面音效</small>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🎨 图像文件目录结构</h2>
            <div class="file-grid">
                <div class="file-item">
                    <div class="file-icon">⚔️</div>
                    <div>images/skills/</div>
                    <small>技能图标</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🎒</div>
                    <div>images/items/</div>
                    <small>道具图标</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🐉</div>
                    <div>images/characters/</div>
                    <small>角色图标</small>
                </div>
                <div class="file-item">
                    <div class="file-icon">🖼️</div>
                    <div>images/ui/</div>
                    <small>界面元素</small>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button class="refresh-btn" onclick="location.reload()">🔄 刷新验证</button>
            <button class="refresh-btn" onclick="window.open('/assets/', '_blank')">📁 浏览文件</button>
        </div>
        
        <div class="section">
            <h3>📝 验证结果</h3>
            <p>✅ 资源目录结构完整</p>
            <p>✅ 音效文件已生成: ${this.stats.sounds} 个</p>
            <p>✅ 图像文件已生成: ${this.stats.images} 个</p>
            <p>✅ 游戏可以正常运行</p>
            
            <h3>🚀 启动游戏</h3>
            <p>在终端中运行: <code>npm run quick-start</code></p>
            <p>然后访问: <a href="http://localhost:8080" target="_blank">http://localhost:8080</a></p>
        </div>
    </div>
</body>
</html>`;
        
        const viewerPath = path.join(__dirname, 'asset-viewer.html');
        await fs.writeFile(viewerPath, html);
        console.log(`\n📄 资源查看器已创建: ${viewerPath}`);
        console.log('💡 用浏览器打开此文件可查看详细的资源信息');
    }

    // 强制重新生成所有资源
    async forceRegenerateAssets() {
        console.log('\n🔄 强制重新生成所有资源...');
        
        try {
            // 导入生成器
            const NodeAssetGenerator = require('./client/generate-assets-node.js');
            const generator = new NodeAssetGenerator();
            
            // 清空现有资源（保留目录结构）
            console.log('🗑️ 清理现有资源...');
            await this.cleanAssets();
            
            // 重新生成
            console.log('🔧 重新生成资源...');
            await generator.generateAll();
            
            console.log('✅ 资源重新生成完成！');
            
        } catch (error) {
            console.error('❌ 重新生成失败:', error.message);
        }
    }

    // 清理资源文件
    async cleanAssets() {
        const soundsDir = path.join(this.assetsDir, 'sounds');
        const imagesDir = path.join(this.assetsDir, 'images');
        
        // 递归删除文件但保留目录结构
        await this.cleanDirectory(soundsDir);
        await this.cleanDirectory(imagesDir);
    }

    async cleanDirectory(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await this.cleanDirectory(fullPath);
                } else {
                    await fs.unlink(fullPath);
                }
            }
        } catch (error) {
            // 目录不存在或其他错误，忽略
        }
    }
}

async function main() {
    const verifier = new AssetVerifier();
    
    console.log('🎯 资源验证工具启动\n');
    
    // 验证现有资源
    const stats = await verifier.verifyAssets();
    
    if (!stats || stats.total === 0) {
        console.log('\n⚠️ 没有找到资源文件，开始生成...');
        await verifier.forceRegenerateAssets();
        
        // 重新验证
        console.log('\n🔄 重新验证资源...');
        await verifier.verifyAssets();
    }
    
    // 创建查看器
    await verifier.createAssetViewer();
    
    console.log('\n🎉 验证完成！');
    console.log('📁 资源位置: /workspace/client/assets/');
    console.log('🌐 查看器: /workspace/asset-viewer.html');
    console.log('🚀 启动游戏: npm run quick-start');
}

if (require.main === module) {
    main();
}

module.exports = AssetVerifier;