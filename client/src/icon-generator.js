// 龙生九子·五行对战 - 图标生成器

class IconGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.size = 64; // 默认图标大小
        
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        // 图标样式配置
        this.styles = {
            metal: {
                primary: '#FFD700',
                secondary: '#B8860B',
                accent: '#FFF8DC',
                gradient: ['#FFD700', '#FFA500', '#FF8C00']
            },
            wood: {
                primary: '#228B22',
                secondary: '#006400',
                accent: '#90EE90',
                gradient: ['#32CD32', '#228B22', '#006400']
            },
            water: {
                primary: '#1E90FF',
                secondary: '#0066CC',
                accent: '#87CEEB',
                gradient: ['#87CEEB', '#1E90FF', '#0066CC']
            },
            fire: {
                primary: '#FF4500',
                secondary: '#CC3300',
                accent: '#FFB347',
                gradient: ['#FF6347', '#FF4500', '#DC143C']
            },
            earth: {
                primary: '#8B4513',
                secondary: '#654321',
                accent: '#D2B48C',
                gradient: ['#CD853F', '#8B4513', '#654321']
            }
        };
    }

    // 生成技能图标
    generateSkillIcon(skillData) {
        this.clearCanvas();
        
        const style = this.styles[skillData.element] || this.styles.metal;
        const center = this.size / 2;
        
        // 背景渐变
        this.drawBackground(style);
        
        // 元素边框
        this.drawElementBorder(style);
        
        // 技能符号
        this.drawSkillSymbol(skillData, style);
        
        // 稀有度装饰
        this.drawRarityDecoration(skillData.rarity, style);
        
        // 元素标识
        this.drawElementIndicator(skillData.element, style);
        
        return this.canvas.toDataURL('image/png');
    }

    // 生成道具图标
    generateItemIcon(itemData) {
        this.clearCanvas();
        
        const center = this.size / 2;
        
        // 道具背景
        this.drawItemBackground(itemData);
        
        // 道具符号
        this.drawItemSymbol(itemData);
        
        // 品质边框
        this.drawQualityBorder(itemData.quality || 'common');
        
        return this.canvas.toDataURL('image/png');
    }

    // 清空画布
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.size, this.size);
    }

    // 绘制背景
    drawBackground(style) {
        const center = this.size / 2;
        
        // 径向渐变背景
        const gradient = this.ctx.createRadialGradient(
            center, center, 0,
            center, center, center
        );
        
        gradient.addColorStop(0, style.gradient[0]);
        gradient.addColorStop(0.5, style.gradient[1]);
        gradient.addColorStop(1, style.gradient[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制元素边框
    drawElementBorder(style) {
        const center = this.size / 2;
        
        // 外边框
        this.ctx.strokeStyle = style.primary;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 内边框
        this.ctx.strokeStyle = style.accent;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // 绘制技能符号
    drawSkillSymbol(skillData, style) {
        const center = this.size / 2;
        
        // 主符号
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 添加阴影
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        this.ctx.fillText(skillData.symbol || '⚔️', center, center - 2);
        
        // 清除阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    // 绘制稀有度装饰
    drawRarityDecoration(rarity, style) {
        if (!rarity || rarity === 'common') return;
        
        const center = this.size / 2;
        const radius = center - 8;
        
        // 稀有度颜色
        const rarityColors = {
            'uncommon': '#00FF00',
            'rare': '#0080FF', 
            'epic': '#FF00FF',
            'legendary': '#FFD700'
        };
        
        const color = rarityColors[rarity] || '#FFFFFF';
        
        // 绘制稀有度光环
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(center, center, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 稀有度星星
        if (rarity === 'epic' || rarity === 'legendary') {
            this.drawStar(center + radius - 5, center - radius + 5, 4, color);
        }
    }

    // 绘制元素指示器
    drawElementIndicator(element, style) {
        const elementSymbols = {
            metal: '金',
            wood: '木', 
            water: '水',
            fire: '火',
            earth: '土'
        };
        
        // 右下角元素标识
        this.ctx.fillStyle = style.primary;
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 小圆圈背景
        this.ctx.beginPath();
        this.ctx.arc(this.size - 12, this.size - 12, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 文字
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(elementSymbols[element] || '?', this.size - 12, this.size - 12);
    }

    // 绘制道具背景
    drawItemBackground(itemData) {
        const center = this.size / 2;
        
        // 根据道具类型选择颜色
        const typeColors = {
            'fruit': '#32CD32',
            'potion': '#FF69B4',
            'equipment': '#FFD700',
            'consumable': '#87CEEB',
            'special': '#9370DB'
        };
        
        const color = typeColors[itemData.type] || '#888888';
        
        // 圆形背景
        const gradient = this.ctx.createRadialGradient(
            center, center, 0,
            center, center, center - 4
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, ColorUtils.addAlpha(color, 0.6));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制道具符号
    drawItemSymbol(itemData) {
        const center = this.size / 2;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 添加阴影
        this.ctx.shadowColor = 'rgba(0,0,0,0.7)';
        this.ctx.shadowBlur = 2;
        
        this.ctx.fillText(itemData.symbol || '?', center, center);
        
        // 清除阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    // 绘制品质边框
    drawQualityBorder(quality) {
        const center = this.size / 2;
        
        const qualityColors = {
            'common': '#FFFFFF',
            'uncommon': '#00FF00',
            'rare': '#0080FF',
            'epic': '#FF00FF',
            'legendary': '#FFD700'
        };
        
        const color = qualityColors[quality] || '#FFFFFF';
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 2, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // 绘制星星
    drawStar(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        
        for (let i = 0; i < 5; i++) {
            const angle = (i * 144 - 90) * Math.PI / 180;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 批量生成所有技能图标
    async generateAllSkillIcons() {
        const skills = await this.getSkillDefinitions();
        const results = new Map();
        
        for (const skill of skills) {
            try {
                const iconUrl = this.generateSkillIcon(skill);
                results.set(`${skill.id}.png`, iconUrl);
            } catch (error) {
                console.error(`生成技能图标失败: ${skill.id}`, error);
            }
        }
        
        return results;
    }

    // 批量生成所有道具图标
    async generateAllItemIcons() {
        const items = this.getItemDefinitions();
        const results = new Map();
        
        for (const item of items) {
            try {
                const iconUrl = this.generateItemIcon(item);
                results.set(`${item.id}.png`, iconUrl);
            } catch (error) {
                console.error(`生成道具图标失败: ${item.id}`, error);
            }
        }
        
        return results;
    }

    // 获取技能定义
    async getSkillDefinitions() {
        // 从服务器配置获取技能定义
        try {
            const response = await fetch('../server/src/config/balance.json');
            const config = await response.json();
            
            return config.skills.map(skill => ({
                id: skill.id,
                name: skill.name,
                element: skill.element || 'metal',
                rarity: skill.rarity || 'common',
                symbol: this.getSkillSymbol(skill.id),
                category: skill.ui?.category || '攻击'
            }));
        } catch (error) {
            console.warn('无法从服务器加载技能配置，使用默认配置');
            return this.getDefaultSkillDefinitions();
        }
    }

    // 获取技能符号
    getSkillSymbol(skillId) {
        const symbols = {
            // 金系
            'slash': '⚔️', 'arcSlash': '🌙', 'metalClash': '⚡', 'staticField': '🔆',
            'silenceHex': '🚫', 'bloodletting': '🩸', 'ironRain': '🌧️',
            'ironBody': '🛡️', 'arcaneFocus': '🔮', 'keenEdge': '🗡️', 'quickCast': '⚡',
            
            // 木系
            'thunderChain': '⚡', 'windDash': '💨', 'forestSnare': '🌿', 'cyclone': '🌪️',
            'venomStrike': '🐍', 'galeStep': '🌪️', 'rootBind': '🌳', 'leafBlade': '🍃',
            'vineWhip': '🌿', 'swiftFeet': '👟', 'eagleEye': '👁️', 'vitality': '💚',
            'thorns': '🌹',
            
            // 水系
            'iceNova': '❄️', 'waterJet': '💧', 'torrent': '🌊', 'blizzard': '🌨️',
            'mistVeil': '🌫️', 'steamBurst': '💨', 'serpent': '🐍',
            
            // 火系
            'flameBurst': '🔥', 'lavaZone': '🌋', 'meteor': '☄️', 'burningMark': '🔥',
            'emberLash': '✨', 'solarFlare': '☀️', 'phoenix': '🔥', 'berserk': '😤',
            
            // 土系
            'stoneWall': '🧱', 'earthStomp': '💥', 'rockShield': '🛡️', 'quake': '🏔️',
            'sandPrison': '🏜️', 'mudTrap': '🕳️', 'thickHide': '🛡️', 'shieldWard': '🛡️',
            'aurashield': '✨', 'stoneSkin': '🗿'
        };
        
        return symbols[skillId] || '❓';
    }

    // 获取默认技能定义
    getDefaultSkillDefinitions() {
        return [
            { id: 'slash', name: '重斩', element: 'metal', rarity: 'common', symbol: '⚔️' },
            { id: 'arcSlash', name: '弧形剑气', element: 'metal', rarity: 'common', symbol: '🌙' },
            { id: 'thunderChain', name: '雷链', element: 'wood', rarity: 'rare', symbol: '⚡' },
            { id: 'stoneWall', name: '石壁', element: 'earth', rarity: 'uncommon', symbol: '🧱' },
            { id: 'flameBurst', name: '炎爆', element: 'fire', rarity: 'uncommon', symbol: '🔥' },
            { id: 'iceNova', name: '冰环', element: 'water', rarity: 'common', symbol: '❄️' }
        ];
    }

    // 获取道具定义
    getItemDefinitions() {
        return [
            // 五行水果
            { id: 'metal_fruit', name: '金果', type: 'fruit', symbol: '🥇', color: '#FFD700' },
            { id: 'wood_fruit', name: '木果', type: 'fruit', symbol: '🌰', color: '#228B22' },
            { id: 'water_fruit', name: '水果', type: 'fruit', symbol: '🫐', color: '#1E90FF' },
            { id: 'fire_fruit', name: '火果', type: 'fruit', symbol: '🍎', color: '#FF4500' },
            { id: 'earth_fruit', name: '土果', type: 'fruit', symbol: '🥔', color: '#8B4513' },
            
            // 道具
            { id: 'invuln', name: '金钟罩', type: 'consumable', symbol: '🛡️', color: '#FFD700', quality: 'epic' },
            { id: 'boots', name: '神行鞋', type: 'equipment', symbol: '👟', color: '#4ECDC4', quality: 'rare' },
            { id: 'potion', name: '疗愈丹', type: 'potion', symbol: '🧪', color: '#FF69B4', quality: 'common' },
            { id: 'bomb', name: '火雷丸', type: 'consumable', symbol: '💣', color: '#FF4500', quality: 'uncommon' },
            { id: 'trap', name: '地刺阵', type: 'consumable', symbol: '🪤', color: '#8B4513', quality: 'uncommon' },
            { id: 'blink', name: '瞬身符', type: 'consumable', symbol: '✨', color: '#9370DB', quality: 'rare' }
        ];
    }

    // 获取角色定义
    getCharacterDefinitions() {
        return [
            { id: 'qiuniu', name: '囚牛', symbol: '🎵', colors: ['#FFD700', '#32CD32'], personality: '音律之龙' },
            { id: 'yazi', name: '睚眦', symbol: '⚔️', colors: ['#DC143C', '#C0C0C0'], personality: '战斗之龙' },
            { id: 'chaofeng', name: '嘲风', symbol: '🌪️', colors: ['#40E0D0', '#87CEEB'], personality: '风险之龙' },
            { id: 'pulao', name: '蒲牢', symbol: '📯', colors: ['#FFD700', '#4169E1'], personality: '音鸣之龙' },
            { id: 'suanni', name: '狻猊', symbol: '🔥', colors: ['#FF4500', '#8A2BE2'], personality: '烟火之龙' },
            { id: 'bixi', name: '赑屃', symbol: '🗿', colors: ['#8B4513', '#696969'], personality: '负重之龙' },
            { id: 'bixie', name: '狴犴', symbol: '⚖️', colors: ['#B8860B', '#F8F8FF'], personality: '诉讼之龙' },
            { id: 'fuxi', name: '负屃', symbol: '📜', colors: ['#191970', '#F5F5DC'], personality: '文学之龙' },
            { id: 'chiwen', name: '蚩吻', symbol: '🌊', colors: ['#006994', '#FF6347'], personality: '吞海之龙' }
        ];
    }

    // 生成角色头像
    generateCharacterAvatar(characterData, size = 128) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const [primaryColor, secondaryColor] = characterData.colors;
        
        // 背景渐变
        const gradient = ctx.createRadialGradient(
            size/2, size/2, 0,
            size/2, size/2, size/2
        );
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.7, secondaryColor);
        gradient.addColorStop(1, ColorUtils.addAlpha(primaryColor, 0.8));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 装饰边框
        ctx.strokeStyle = ColorUtils.lerpColor(primaryColor, '#FFFFFF', 0.3);
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // 角色符号
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${size * 0.25}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(characterData.symbol, size/2, size/2 - size * 0.05);
        
        // 角色名称
        ctx.font = `bold ${size * 0.12}px Arial`;
        ctx.fillText(characterData.name, size/2, size/2 + size * 0.25);
        
        // 个性描述
        ctx.font = `${size * 0.08}px Arial`;
        ctx.fillText(characterData.personality, size/2, size/2 + size * 0.35);
        
        // 清除阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        return canvas.toDataURL();
    }

    // 批量生成角色头像
    async generateAllCharacterAvatars() {
        const characters = this.getCharacterDefinitions();
        const results = new Map();
        
        for (const character of characters) {
            try {
                const avatarUrl = this.generateCharacterAvatar(character);
                results.set(`${character.id}.png`, avatarUrl);
            } catch (error) {
                console.error(`生成角色头像失败: ${character.id}`, error);
            }
        }
        
        return results;
    }

    // 绘制道具背景
    drawItemBackground(itemData) {
        const center = this.size / 2;
        
        // 根据道具类型的背景形状
        if (itemData.type === 'fruit') {
            // 水果 - 圆形
            this.drawFruitBackground(itemData.color);
        } else if (itemData.type === 'potion') {
            // 药剂 - 瓶子形状
            this.drawPotionBackground(itemData.color);
        } else if (itemData.type === 'equipment') {
            // 装备 - 六边形
            this.drawEquipmentBackground(itemData.color);
        } else {
            // 消耗品 - 方形
            this.drawConsumableBackground(itemData.color);
        }
    }

    // 绘制水果背景
    drawFruitBackground(color) {
        const center = this.size / 2;
        
        const gradient = this.ctx.createRadialGradient(
            center - 8, center - 8, 0,
            center, center, center - 4
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, ColorUtils.addAlpha(color, 0.7));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(center, center, center - 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制药剂背景
    drawPotionBackground(color) {
        const center = this.size / 2;
        
        // 瓶身
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(center - 12, center - 8, 24, 20, 8);
        this.ctx.fill();
        
        // 瓶颈
        this.ctx.fillStyle = ColorUtils.addAlpha(color, 0.8);
        this.ctx.fillRect(center - 4, center - 16, 8, 8);
        
        // 液体效果
        this.ctx.fillStyle = ColorUtils.addAlpha('#FFFFFF', 0.3);
        this.ctx.beginPath();
        this.ctx.arc(center - 6, center - 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制装备背景
    drawEquipmentBackground(color) {
        const center = this.size / 2;
        const radius = center - 4;
        
        // 六边形
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 绘制消耗品背景
    drawConsumableBackground(color) {
        const center = this.size / 2;
        
        // 圆角矩形
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(center - 16, center - 16, 32, 32, 6);
        this.ctx.fill();
        
        // 光泽效果
        const gradient = this.ctx.createLinearGradient(0, 0, this.size, this.size);
        gradient.addColorStop(0, ColorUtils.addAlpha('#FFFFFF', 0.3));
        gradient.addColorStop(1, ColorUtils.addAlpha('#FFFFFF', 0));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(center - 16, center - 16, 32, 32, 6);
        this.ctx.fill();
    }

    // 绘制道具符号
    drawItemSymbol(itemData) {
        const center = this.size / 2;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // 添加描边
        this.ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(itemData.symbol || '?', center, center);
        this.ctx.fillText(itemData.symbol || '?', center, center);
    }

    // 设置图标大小
    setSize(size) {
        this.size = size;
        this.canvas.width = size;
        this.canvas.height = size;
    }

    // 导出为不同格式
    exportAs(format = 'png', quality = 0.9) {
        if (format === 'jpg' || format === 'jpeg') {
            return this.canvas.toDataURL('image/jpeg', quality);
        } else if (format === 'webp') {
            return this.canvas.toDataURL('image/webp', quality);
        } else {
            return this.canvas.toDataURL('image/png');
        }
    }
}

// 添加roundRect支持
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// 创建全局图标生成器实例
window.IconGenerator = IconGenerator;