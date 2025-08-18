// 龙生九子·五行对战 - UI资源生成器

class UIGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI主题配色
        this.themes = {
            primary: '#4ECDC4',
            secondary: '#FF6B6B', 
            accent: '#FFD700',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            info: '#2196F3'
        };
    }

    // 生成按钮背景
    generateButton(width, height, type = 'primary', state = 'normal') {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        const colors = this.getButtonColors(type, state);
        
        // 背景渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(1, colors.bottom);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, width, height, 8);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = colors.border;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 高光
        if (state === 'hover') {
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.beginPath();
            this.ctx.roundRect(2, 2, width - 4, height/2, 6);
            this.ctx.fill();
        }
        
        return this.canvas.toDataURL();
    }

    // 获取按钮颜色
    getButtonColors(type, state) {
        const baseColors = {
            primary: { base: this.themes.primary, dark: '#3A9B9B' },
            secondary: { base: this.themes.secondary, dark: '#E55555' },
            success: { base: this.themes.success, dark: '#3E8E41' },
            warning: { base: this.themes.warning, dark: '#E68900' },
            error: { base: this.themes.error, dark: '#D32F2F' }
        };
        
        const colorSet = baseColors[type] || baseColors.primary;
        
        if (state === 'pressed') {
            return {
                top: colorSet.dark,
                bottom: colorSet.base,
                border: colorSet.dark
            };
        } else if (state === 'hover') {
            return {
                top: ColorUtils.lerpColor(colorSet.base, '#FFFFFF', 0.1),
                bottom: ColorUtils.lerpColor(colorSet.dark, '#FFFFFF', 0.1),
                border: colorSet.base
            };
        } else {
            return {
                top: colorSet.base,
                bottom: colorSet.dark,
                border: colorSet.base
            };
        }
    }

    // 生成进度条
    generateProgressBar(width, height, progress = 0.5, type = 'primary') {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        const color = this.themes[type] || this.themes.primary;
        
        // 背景
        this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, width, height, height/2);
        this.ctx.fill();
        
        // 进度
        const progressWidth = width * progress;
        if (progressWidth > 0) {
            const gradient = this.ctx.createLinearGradient(0, 0, progressWidth, 0);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, ColorUtils.lerpColor(color, '#FFFFFF', 0.2));
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(0, 0, progressWidth, height, height/2);
            this.ctx.fill();
        }
        
        // 边框
        this.ctx.strokeStyle = ColorUtils.addAlpha(color, 0.8);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, width, height, height/2);
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    // 生成面板背景
    generatePanel(width, height, opacity = 0.8) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        // 半透明背景
        this.ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, width, height, 12);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // 内部高光
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(1, 1, width - 2, height - 2, 11);
        this.ctx.stroke();
        
        return this.canvas.toDataURL();
    }

    // 生成元素徽章
    generateElementBadge(element, size = 32) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);
        
        const elementConfig = CONFIG.elements[element];
        if (!elementConfig) return this.canvas.toDataURL();
        
        // 背景圆形
        const gradient = this.ctx.createRadialGradient(
            size/2, size/2, 0,
            size/2, size/2, size/2
        );
        gradient.addColorStop(0, elementConfig.color);
        gradient.addColorStop(1, elementConfig.darkColor || ColorUtils.lerpColor(elementConfig.color, '#000000', 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = ColorUtils.lerpColor(elementConfig.color, '#FFFFFF', 0.3);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 元素文字
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${size * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(elementConfig.name, size/2, size/2);
        
        return this.canvas.toDataURL();
    }

    // 生成状态图标
    generateStatusIcon(status, size = 24) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);
        
        const statusConfig = {
            'stunned': { symbol: '⭐', color: '#FFD700' },
            'silenced': { symbol: '🚫', color: '#FF0000' },
            'rooted': { symbol: '🌿', color: '#00FF00' },
            'invulnerable': { symbol: '🛡️', color: '#FFD700' },
            'burning': { symbol: '🔥', color: '#FF4500' },
            'frozen': { symbol: '❄️', color: '#00BFFF' },
            'poisoned': { symbol: '🐍', color: '#9ACD32' }
        };
        
        const config = statusConfig[status];
        if (!config) return this.canvas.toDataURL();
        
        // 背景圆形
        this.ctx.fillStyle = ColorUtils.addAlpha(config.color, 0.8);
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 状态符号
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${size * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(config.symbol, size/2, size/2);
        
        return this.canvas.toDataURL();
    }

    // 生成小地图背景
    generateMinimapBackground(size = 150) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);
        
        // 背景
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, size, size);
        
        // 五行区域
        const center = size / 2;
        const radius = size / 2 - 10;
        const elements = ['metal', 'wood', 'water', 'fire', 'earth'];
        const angleStep = (Math.PI * 2) / elements.length;
        
        elements.forEach((element, index) => {
            const startAngle = index * angleStep - Math.PI / 2;
            const endAngle = (index + 1) * angleStep - Math.PI / 2;
            
            // 绘制扇形
            this.ctx.beginPath();
            this.ctx.moveTo(center, center);
            this.ctx.arc(center, center, radius, startAngle, endAngle);
            this.ctx.closePath();
            
            // 填充颜色
            const elementColor = CONFIG.elements[element].color;
            this.ctx.fillStyle = ColorUtils.addAlpha(elementColor, 0.3);
            this.ctx.fill();
            
            // 边框
            this.ctx.strokeStyle = ColorUtils.addAlpha(elementColor, 0.6);
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
        
        // 中心圆
        this.ctx.beginPath();
        this.ctx.arc(center, center, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        
        return this.canvas.toDataURL();
    }

    // 生成角色头像
    generateCharacterAvatar(characterId, size = 64) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx.clearRect(0, 0, size, size);
        
        // 角色配置
        const characters = {
            'qiuniu': { name: '囚牛', symbol: '🐂', color: '#FFD700' },
            'yazi': { name: '睚眦', symbol: '🐉', color: '#FF6B6B' },
            'chaofeng': { name: '嘲风', symbol: '🦅', color: '#4ECDC4' },
            'pulao': { name: '蒲牢', symbol: '🐲', color: '#45B7D1' },
            'suanni': { name: '狻猊', symbol: '🦁', color: '#FF4500' },
            'bixi': { name: '赑屃', symbol: '🐢', color: '#8B4513' },
            'bixie': { name: '狴犴', symbol: '🐺', color: '#9370DB' },
            'fuxi': { name: '负屃', symbol: '🐍', color: '#1E90FF' },
            'chiwen': { name: '蚩吻', symbol: '🐟', color: '#32CD32' }
        };
        
        const character = characters[characterId];
        if (!character) return this.canvas.toDataURL();
        
        // 背景圆形
        const gradient = this.ctx.createRadialGradient(
            size/2, size/2, 0,
            size/2, size/2, size/2
        );
        gradient.addColorStop(0, character.color);
        gradient.addColorStop(1, ColorUtils.lerpColor(character.color, '#000000', 0.5));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = ColorUtils.lerpColor(character.color, '#FFFFFF', 0.3);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 角色符号
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${size * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(character.symbol, size/2, size/2 - size * 0.05);
        
        // 角色名称
        this.ctx.font = `bold ${size * 0.15}px Arial`;
        this.ctx.fillText(character.name, size/2, size/2 + size * 0.25);
        
        return this.canvas.toDataURL();
    }

    // 生成装饰性背景
    generateDecorativeBackground(width, height, pattern = 'circuit') {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        switch (pattern) {
            case 'circuit':
                this.drawCircuitPattern(width, height);
                break;
            case 'elements':
                this.drawElementsPattern(width, height);
                break;
            case 'dragon':
                this.drawDragonPattern(width, height);
                break;
            default:
                this.drawDefaultPattern(width, height);
        }
        
        return this.canvas.toDataURL();
    }

    // 绘制电路图案
    drawCircuitPattern(width, height) {
        this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 20;
        
        // 网格线
        for (let x = 0; x < width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // 节点
        this.ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
        for (let x = gridSize; x < width; x += gridSize * 2) {
            for (let y = gridSize; y < height; y += gridSize * 2) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    // 绘制五行图案
    drawElementsPattern(width, height) {
        const elements = Object.keys(CONFIG.elements);
        const symbolSize = Math.min(width, height) / 10;
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const element = elements[Math.floor(Math.random() * elements.length)];
            const elementConfig = CONFIG.elements[element];
            
            this.ctx.fillStyle = ColorUtils.addAlpha(elementConfig.color, 0.2);
            this.ctx.font = `${symbolSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(elementConfig.name, x, y);
        }
    }

    // 绘制龙纹图案
    drawDragonPattern(width, height) {
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
        this.ctx.lineWidth = 2;
        
        // 绘制龙形曲线
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            
            let currentX = startX;
            let currentY = startY;
            
            this.ctx.moveTo(currentX, currentY);
            
            for (let j = 0; j < 10; j++) {
                const nextX = currentX + (Math.random() - 0.5) * 50;
                const nextY = currentY + (Math.random() - 0.5) * 50;
                const cpX = currentX + (Math.random() - 0.5) * 30;
                const cpY = currentY + (Math.random() - 0.5) * 30;
                
                this.ctx.quadraticCurveTo(cpX, cpY, nextX, nextY);
                currentX = nextX;
                currentY = nextY;
            }
            
            this.ctx.stroke();
        }
    }

    // 绘制默认图案
    drawDefaultPattern(width, height) {
        // 简单的点阵图案
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        
        for (let x = 10; x < width; x += 20) {
            for (let y = 10; y < height; y += 20) {
                if (Math.random() > 0.7) {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 1, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    // 生成稀有度边框
    generateRarityBorder(width, height, rarity = 'common') {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        
        const rarityColors = {
            'common': '#FFFFFF',
            'uncommon': '#00FF00',
            'rare': '#0080FF',
            'epic': '#FF00FF',
            'legendary': '#FFD700'
        };
        
        const color = rarityColors[rarity] || '#FFFFFF';
        
        // 外边框
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(1, 1, width - 2, height - 2, 6);
        this.ctx.stroke();
        
        // 稀有度装饰
        if (rarity !== 'common') {
            // 角落装饰
            this.ctx.fillStyle = color;
            const cornerSize = 8;
            
            // 四个角的小三角
            this.drawCornerTriangle(cornerSize, cornerSize, cornerSize);
            this.drawCornerTriangle(width - cornerSize, cornerSize, cornerSize);
            this.drawCornerTriangle(cornerSize, height - cornerSize, cornerSize);
            this.drawCornerTriangle(width - cornerSize, height - cornerSize, cornerSize);
        }
        
        return this.canvas.toDataURL();
    }

    // 绘制角落三角
    drawCornerTriangle(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - size/2, y - size/2);
        this.ctx.lineTo(x + size/2, y - size/2);
        this.ctx.lineTo(x - size/2, y + size/2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 批量生成UI资源
    async generateAllUIAssets() {
        const assets = new Map();
        
        // 按钮资源
        const buttonTypes = ['primary', 'secondary', 'success', 'warning', 'error'];
        const buttonStates = ['normal', 'hover', 'pressed'];
        const buttonSizes = [
            { name: 'large', width: 200, height: 50 },
            { name: 'medium', width: 150, height: 40 },
            { name: 'small', width: 100, height: 30 }
        ];
        
        for (const type of buttonTypes) {
            for (const state of buttonStates) {
                for (const size of buttonSizes) {
                    const key = `button_${type}_${state}_${size.name}.png`;
                    const url = this.generateButton(size.width, size.height, type, state);
                    assets.set(key, url);
                }
            }
        }
        
        // 进度条资源
        const progressTypes = ['health', 'shield', 'mana', 'experience'];
        const progressSizes = [
            { name: 'large', width: 200, height: 20 },
            { name: 'medium', width: 150, height: 16 },
            { name: 'small', width: 100, height: 12 }
        ];
        
        for (const type of progressTypes) {
            for (const size of progressSizes) {
                for (let progress = 0; progress <= 1; progress += 0.25) {
                    const key = `progress_${type}_${size.name}_${Math.round(progress * 100)}.png`;
                    const url = this.generateProgressBar(size.width, size.height, progress, type);
                    assets.set(key, url);
                }
            }
        }
        
        // 面板背景
        const panelSizes = [
            { name: 'small', width: 200, height: 150 },
            { name: 'medium', width: 300, height: 200 },
            { name: 'large', width: 400, height: 300 }
        ];
        
        for (const size of panelSizes) {
            const key = `panel_${size.name}.png`;
            const url = this.generatePanel(size.width, size.height);
            assets.set(key, url);
        }
        
        // 元素徽章
        const elements = Object.keys(CONFIG.elements);
        for (const element of elements) {
            const key = `element_${element}.png`;
            const url = this.generateElementBadge(element);
            assets.set(key, url);
        }
        
        // 状态图标
        const statuses = ['stunned', 'silenced', 'rooted', 'invulnerable', 'burning', 'frozen', 'poisoned'];
        for (const status of statuses) {
            const key = `status_${status}.png`;
            const url = this.generateStatusIcon(status);
            assets.set(key, url);
        }
        
        // 小地图背景
        assets.set('minimap_background.png', this.generateMinimapBackground());
        
        console.log(`Generated ${assets.size} UI assets`);
        return assets;
    }

    // 下载UI资源
    downloadUIAssets(assets) {
        assets.forEach((url, filename) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
}

// 创建全局UI生成器实例
window.UIGenerator = UIGenerator;