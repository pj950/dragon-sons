#!/usr/bin/env node

// 资源文件浏览器服务器

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

class AssetBrowser {
    constructor(port = 3001) {
        this.port = port;
        this.assetsDir = path.join(__dirname, 'client/assets');
    }

    // 启动服务器
    start() {
        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;

            try {
                if (pathname === '/') {
                    await this.serveAssetBrowser(res);
                } else if (pathname === '/api/assets') {
                    await this.serveAssetList(res);
                } else if (pathname.startsWith('/assets/')) {
                    await this.serveAssetFile(req, res);
                } else {
                    this.serve404(res);
                }
            } catch (error) {
                this.serve500(res, error);
            }
        });

        server.listen(this.port, () => {
            console.log(`🌐 资源浏览器已启动: http://localhost:${this.port}`);
            console.log('📁 可以直接查看所有assets文件');
        });
    }

    // 服务资源浏览器页面
    async serveAssetBrowser(res) {
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>资源文件浏览器 - 龙生九子·五行对战</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
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
        .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            text-align: center;
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
        .file-category {
            margin-bottom: 30px;
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .file-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .file-item {
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .file-item:hover {
            background: rgba(255,255,255,0.15);
            transform: translateY(-2px);
        }
        .file-icon {
            font-size: 1.5rem;
            margin-right: 10px;
        }
        .file-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .file-size {
            color: #ccc;
            font-size: 0.9rem;
        }
        .loading {
            text-align: center;
            padding: 40px;
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
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 资源文件浏览器</h1>
        <div style="text-align: center;">
            <button class="refresh-btn" onclick="loadAssets()">🔄 刷新资源列表</button>
        </div>
        
        <div class="stats" id="stats">
            <div class="stat-item">
                <div class="stat-number" id="soundCount">-</div>
                <div>🎵 音效文件</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="imageCount">-</div>
                <div>🎨 图像文件</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="totalCount">-</div>
                <div>📁 总文件数</div>
            </div>
        </div>
        
        <div id="content" class="loading">
            <h2>📥 正在加载资源列表...</h2>
        </div>
    </div>

    <script>
        let assets = {};
        
        async function loadAssets() {
            try {
                document.getElementById('content').innerHTML = '<div class="loading"><h2>📥 正在加载资源列表...</h2></div>';
                
                const response = await fetch('/api/assets');
                assets = await response.json();
                
                displayAssets();
                updateStats();
            } catch (error) {
                document.getElementById('content').innerHTML = '<div class="loading"><h2>❌ 加载失败: ' + error.message + '</h2></div>';
            }
        }
        
        function displayAssets() {
            let html = '';
            
            // 音效文件
            if (assets.sounds && assets.sounds.length > 0) {
                html += '<div class="file-category"><h2>🎵 音效文件 (' + assets.sounds.length + '个)</h2>';
                html += '<div class="file-list">';
                assets.sounds.forEach(file => {
                    html += '<div class="file-item" onclick="playAudio(\\'assets/' + file.path + '\\')">';
                    html += '<div class="file-icon">🎵</div>';
                    html += '<div class="file-name">' + file.name + '</div>';
                    html += '<div class="file-size">' + file.size + '</div>';
                    html += '</div>';
                });
                html += '</div></div>';
            }
            
            // 图像文件
            if (assets.images && assets.images.length > 0) {
                html += '<div class="file-category"><h2>🎨 图像文件 (' + assets.images.length + '个)</h2>';
                html += '<div class="file-list">';
                assets.images.forEach(file => {
                    html += '<div class="file-item" onclick="viewImage(\\'assets/' + file.path + '\\')">';
                    html += '<div class="file-icon">🎨</div>';
                    html += '<div class="file-name">' + file.name + '</div>';
                    html += '<div class="file-size">' + file.size + '</div>';
                    html += '</div>';
                });
                html += '</div></div>';
            }
            
            document.getElementById('content').innerHTML = html;
        }
        
        function updateStats() {
            const soundCount = assets.sounds ? assets.sounds.length : 0;
            const imageCount = assets.images ? assets.images.length : 0;
            const totalCount = soundCount + imageCount;
            
            document.getElementById('soundCount').textContent = soundCount;
            document.getElementById('imageCount').textContent = imageCount;
            document.getElementById('totalCount').textContent = totalCount;
        }
        
        function playAudio(path) {
            const audio = new Audio(path);
            audio.play().catch(e => alert('无法播放音频: ' + e.message));
        }
        
        function viewImage(path) {
            window.open(path, '_blank');
        }
        
        // 页面加载时自动加载资源
        window.onload = loadAssets;
    </script>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }

    // 服务资源列表API
    async serveAssetList(res) {
        try {
            const assets = await this.scanAssets();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(assets));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // 扫描资源文件
    async scanAssets() {
        const sounds = await this.findFiles(path.join(this.assetsDir, 'sounds'), ['.wav', '.mp3']);
        const images = await this.findFiles(path.join(this.assetsDir, 'images'), ['.svg', '.png', '.jpg']);

        return {
            sounds: sounds.map(file => this.getFileInfo(file)),
            images: images.map(file => this.getFileInfo(file))
        };
    }

    // 查找文件
    async findFiles(dir, extensions) {
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const subFiles = await this.findFiles(fullPath, extensions);
                    files.push(...subFiles);
                } else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 目录不存在
        }
        return files;
    }

    // 获取文件信息
    getFileInfo(filePath) {
        const stats = require('fs').statSync(filePath);
        const relativePath = path.relative(this.assetsDir, filePath);
        return {
            name: path.basename(filePath),
            path: relativePath,
            size: this.formatFileSize(stats.size)
        };
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 服务资源文件
    async serveAssetFile(req, res) {
        const filePath = path.join(__dirname, 'client', url.parse(req.url).pathname);
        
        try {
            const data = await fs.readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            
            let contentType = 'application/octet-stream';
            if (ext === '.wav') contentType = 'audio/wav';
            else if (ext === '.mp3') contentType = 'audio/mpeg';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        } catch (error) {
            this.serve404(res);
        }
    }

    // 404错误
    serve404(res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('文件未找到');
    }

    // 500错误
    serve500(res, error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('服务器错误: ' + error.message);
    }
}

// 启动服务器
const browser = new AssetBrowser(3001);
browser.start();