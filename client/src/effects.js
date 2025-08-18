// 龙生九子·五行对战 - 特效渲染系统

class EffectsRenderer {
    constructor() {
        this.particles = [];
        this.screenEffects = [];
        this.particlePool = [];
        this.maxParticles = 1000;
        
        // 特效模板
        this.effectTemplates = this.setupEffectTemplates();
        
        // 屏幕震动
        this.screenShake = {
            intensity: 0,
            duration: 0,
            startTime: 0,
            offsetX: 0,
            offsetY: 0
        };
        
        // 颜色闪烁
        this.colorFlash = {
            color: '#ffffff',
            intensity: 0,
            duration: 0,
            startTime: 0
        };
    }

    // 设置特效模板
    setupEffectTemplates() {
        return {
            // 金系特效
            metal_glow: {
                color: '#FFD700',
                particles: 20,
                size: { min: 0.5, max: 1.5 },
                speed: { min: 0.5, max: 2 },
                life: { min: 500, max: 1000 },
                type: 'glow'
            },
            metal_sparks: {
                color: '#FFD700',
                particles: 30,
                size: { min: 0.2, max: 0.8 },
                speed: { min: 2, max: 5 },
                life: { min: 300, max: 600 },
                type: 'spark'
            },
            metal_arc: {
                color: '#C0C0C0',
                particles: 15,
                size: { min: 0.8, max: 1.5 },
                speed: { min: 1, max: 3 },
                life: { min: 400, max: 800 },
                type: 'arc'
            },

            // 木系特效
            lightning_chain: {
                color: '#00FF00',
                particles: 25,
                size: { min: 0.3, max: 1.2 },
                speed: { min: 3, max: 8 },
                life: { min: 200, max: 500 },
                type: 'lightning'
            },
            wind_swirl: {
                color: '#90EE90',
                particles: 40,
                size: { min: 0.4, max: 1.0 },
                speed: { min: 1, max: 4 },
                life: { min: 600, max: 1200 },
                type: 'swirl'
            },
            wood_vines_emerge: {
                color: '#228B22',
                particles: 20,
                size: { min: 0.6, max: 1.4 },
                speed: { min: 0.5, max: 2 },
                life: { min: 800, max: 1500 },
                type: 'emerge'
            },

            // 水系特效
            ice_crystal_form: {
                color: '#00BFFF',
                particles: 30,
                size: { min: 0.4, max: 1.2 },
                speed: { min: 0.5, max: 2 },
                life: { min: 600, max: 1200 },
                type: 'crystal'
            },
            water_splash: {
                color: '#1E90FF',
                particles: 35,
                size: { min: 0.3, max: 0.9 },
                speed: { min: 2, max: 6 },
                life: { min: 300, max: 700 },
                type: 'splash'
            },
            ice_nova_expand: {
                color: '#B0E0E6',
                particles: 50,
                size: { min: 0.5, max: 1.5 },
                speed: { min: 1, max: 4 },
                life: { min: 500, max: 1000 },
                type: 'nova'
            },

            // 火系特效
            fire_orb_charge: {
                color: '#FF4500',
                particles: 25,
                size: { min: 0.6, max: 1.8 },
                speed: { min: 0.5, max: 2 },
                life: { min: 400, max: 800 },
                type: 'orb'
            },
            fire_explosion: {
                color: '#FF6347',
                particles: 60,
                size: { min: 0.8, max: 2.5 },
                speed: { min: 3, max: 8 },
                life: { min: 300, max: 600 },
                type: 'explosion'
            },
            lava_pool: {
                color: '#FF6347',
                particles: 40,
                size: { min: 0.4, max: 1.2 },
                speed: { min: 0.2, max: 1 },
                life: { min: 1000, max: 2000 },
                type: 'pool'
            },

            // 土系特效
            earth_stone_rise: {
                color: '#8B4513',
                particles: 20,
                size: { min: 0.8, max: 2.0 },
                speed: { min: 0.5, max: 2 },
                life: { min: 800, max: 1500 },
                type: 'rise'
            },
            earth_shockwave: {
                color: '#8B4513',
                particles: 45,
                size: { min: 0.6, max: 1.8 },
                speed: { min: 2, max: 6 },
                life: { min: 400, max: 800 },
                type: 'shockwave'
            },
            stone_wall_emerge: {
                color: '#696969',
                particles: 30,
                size: { min: 1.0, max: 2.5 },
                speed: { min: 0.3, max: 1.5 },
                life: { min: 1200, max: 2000 },
                type: 'wall'
            }
        };
    }

    // 创建粒子特效
    createEffect(effectName, x, y, data = {}) {
        if (!CONFIG.graphics.effects.particles) return;
        
        const template = this.effectTemplates[effectName];
        if (!template) {
            console.warn('Unknown effect:', effectName);
            return;
        }

        const particleCount = Math.floor(template.particles * this.getQualityMultiplier());
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle(template, x, y, data);
            if (particle) {
                this.particles.push(particle);
            }
        }
    }

    // 创建单个粒子
    createParticle(template, x, y, data) {
        if (this.particles.length >= this.maxParticles) {
            return null;
        }

        const particle = {
            x: x + MathUtils.random(-0.5, 0.5),
            y: y + MathUtils.random(-0.5, 0.5),
            vx: MathUtils.random(-template.speed.max, template.speed.max),
            vy: MathUtils.random(-template.speed.max, template.speed.max),
            size: MathUtils.random(template.size.min, template.size.max),
            life: MathUtils.random(template.life.min, template.life.max),
            maxLife: 0,
            color: template.color,
            type: template.type,
            alpha: 1,
            rotation: MathUtils.random(0, Math.PI * 2),
            rotationSpeed: MathUtils.random(-0.1, 0.1),
            gravity: template.type === 'spark' ? 0.05 : 0,
            data: data
        };

        particle.maxLife = particle.life;
        
        // 特殊类型的粒子行为
        this.setupParticleType(particle, template);
        
        return particle;
    }

    // 设置粒子类型特殊行为
    setupParticleType(particle, template) {
        switch (template.type) {
            case 'lightning':
                particle.vx *= 2;
                particle.vy *= 2;
                particle.flicker = true;
                break;
            case 'swirl':
                particle.angle = Math.atan2(particle.vy, particle.vx);
                particle.radius = MathUtils.distance(0, 0, particle.vx, particle.vy);
                particle.angularSpeed = MathUtils.random(0.05, 0.15);
                break;
            case 'explosion':
                const angle = MathUtils.random(0, Math.PI * 2);
                const speed = MathUtils.random(template.speed.min, template.speed.max);
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                break;
            case 'nova':
                particle.expandSpeed = MathUtils.random(0.02, 0.05);
                break;
        }
    }

    // 更新粒子
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新生命
            particle.life -= deltaTime;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // 更新透明度
            particle.alpha = particle.life / particle.maxLife;
            
            // 更新位置
            this.updateParticlePosition(particle, deltaTime);
            
            // 更新旋转
            particle.rotation += particle.rotationSpeed * deltaTime;
            
            // 特殊类型更新
            this.updateParticleType(particle, deltaTime);
        }
    }

    // 更新粒子位置
    updateParticlePosition(particle, deltaTime) {
        const dt = deltaTime * 0.016; // 标准化到60fps
        
        switch (particle.type) {
            case 'swirl':
                particle.angle += particle.angularSpeed * dt;
                particle.x += Math.cos(particle.angle) * particle.radius * dt;
                particle.y += Math.sin(particle.angle) * particle.radius * dt;
                break;
            default:
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.vy += particle.gravity * dt;
                break;
        }
    }

    // 更新特殊粒子类型
    updateParticleType(particle, deltaTime) {
        const dt = deltaTime * 0.016;
        
        switch (particle.type) {
            case 'nova':
                particle.size += particle.expandSpeed * dt;
                break;
            case 'lightning':
                if (particle.flicker) {
                    particle.alpha *= (0.5 + 0.5 * Math.sin(Date.now() * 0.02));
                }
                break;
        }
    }

    // 渲染粒子
    render(ctx) {
        if (!CONFIG.graphics.effects.particles) return;
        
        // 更新粒子
        this.updateParticles(16.67); // 假设60fps
        
        // 渲染粒子
        ctx.save();
        
        this.particles.forEach(particle => {
            this.renderParticle(ctx, particle);
        });
        
        ctx.restore();
        
        // 更新屏幕效果
        this.updateScreenEffects();
    }

    // 渲染单个粒子
    renderParticle(ctx, particle) {
        ctx.save();
        
        ctx.globalAlpha = particle.alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        // 根据类型渲染
        switch (particle.type) {
            case 'glow':
                this.renderGlowParticle(ctx, particle);
                break;
            case 'spark':
                this.renderSparkParticle(ctx, particle);
                break;
            case 'lightning':
                this.renderLightningParticle(ctx, particle);
                break;
            case 'explosion':
                this.renderExplosionParticle(ctx, particle);
                break;
            case 'crystal':
                this.renderCrystalParticle(ctx, particle);
                break;
            default:
                this.renderDefaultParticle(ctx, particle);
                break;
        }
        
        ctx.restore();
    }

    // 渲染发光粒子
    renderGlowParticle(ctx, particle) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, ColorUtils.addAlpha(particle.color, 0));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 渲染火花粒子
    renderSparkParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾迹
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size * 0.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-particle.vx * 0.1, -particle.vy * 0.1);
        ctx.stroke();
    }

    // 渲染闪电粒子
    renderLightningParticle(ctx, particle) {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size * 0.5;
        ctx.lineCap = 'round';
        
        // 锯齿状闪电
        ctx.beginPath();
        ctx.moveTo(-particle.size, 0);
        ctx.lineTo(-particle.size * 0.3, MathUtils.random(-particle.size * 0.5, particle.size * 0.5));
        ctx.lineTo(particle.size * 0.3, MathUtils.random(-particle.size * 0.5, particle.size * 0.5));
        ctx.lineTo(particle.size, 0);
        ctx.stroke();
    }

    // 渲染爆炸粒子
    renderExplosionParticle(ctx, particle) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.7, ColorUtils.addAlpha(particle.color, 0.5));
        gradient.addColorStop(1, ColorUtils.addAlpha(particle.color, 0));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 渲染水晶粒子
    renderCrystalParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.strokeStyle = ColorUtils.addAlpha(particle.color, 0.8);
        ctx.lineWidth = 0.1;
        
        // 六边形水晶
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // 渲染默认粒子
    renderDefaultParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // 屏幕震动
    startScreenShake(intensity, duration) {
        if (!CONFIG.graphics.effects.screenShake) return;
        
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.startTime = Date.now();
    }

    // 颜色闪烁
    startColorFlash(color, intensity, duration) {
        if (!CONFIG.graphics.effects.colorFlash) return;
        
        this.colorFlash.color = color;
        this.colorFlash.intensity = intensity;
        this.colorFlash.duration = duration;
        this.colorFlash.startTime = Date.now();
    }

    // 更新屏幕效果
    updateScreenEffects() {
        const now = Date.now();
        
        // 更新屏幕震动
        if (this.screenShake.duration > 0) {
            const elapsed = now - this.screenShake.startTime;
            if (elapsed < this.screenShake.duration) {
                const progress = elapsed / this.screenShake.duration;
                const intensity = this.screenShake.intensity * (1 - progress);
                this.screenShake.offsetX = MathUtils.random(-intensity, intensity);
                this.screenShake.offsetY = MathUtils.random(-intensity, intensity);
            } else {
                this.screenShake.intensity = 0;
                this.screenShake.duration = 0;
                this.screenShake.offsetX = 0;
                this.screenShake.offsetY = 0;
            }
        }
        
        // 更新颜色闪烁
        if (this.colorFlash.duration > 0) {
            const elapsed = now - this.colorFlash.startTime;
            if (elapsed >= this.colorFlash.duration) {
                this.colorFlash.intensity = 0;
                this.colorFlash.duration = 0;
            }
        }
    }

    // 获取屏幕震动偏移
    getScreenShakeOffset() {
        return {
            x: this.screenShake.offsetX,
            y: this.screenShake.offsetY
        };
    }

    // 获取颜色闪烁
    getColorFlash() {
        if (this.colorFlash.duration <= 0) return null;
        
        const elapsed = Date.now() - this.colorFlash.startTime;
        const progress = elapsed / this.colorFlash.duration;
        const alpha = this.colorFlash.intensity * (1 - progress);
        
        return {
            color: this.colorFlash.color,
            alpha: alpha
        };
    }

    // 获取质量倍数
    getQualityMultiplier() {
        switch (CONFIG.graphics.effects.quality) {
            case 'low': return 0.5;
            case 'medium': return 1.0;
            case 'high': return 1.5;
            default: return 1.0;
        }
    }

    // 清理所有特效
    clear() {
        this.particles = [];
        this.screenEffects = [];
        this.screenShake.intensity = 0;
        this.screenShake.duration = 0;
        this.colorFlash.intensity = 0;
        this.colorFlash.duration = 0;
    }

    // 获取粒子数量
    getParticleCount() {
        return this.particles.length;
    }
}

// 创建全局特效渲染器实例
window.EffectsRenderer = new EffectsRenderer();