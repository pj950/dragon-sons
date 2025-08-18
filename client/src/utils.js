// 龙生九子·五行对战 - 工具函数

// 数学工具
const MathUtils = {
    // 计算两点距离
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // 计算角度
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // 角度转弧度
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },

    // 弧度转角度
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    // 限制数值范围
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // 线性插值
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // 随机数
    random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    },

    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// 颜色工具
const ColorUtils = {
    // 十六进制转RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // RGB转十六进制
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // 颜色插值
    lerpColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        if (!c1 || !c2) return color1;

        const r = Math.round(MathUtils.lerp(c1.r, c2.r, factor));
        const g = Math.round(MathUtils.lerp(c1.g, c2.g, factor));
        const b = Math.round(MathUtils.lerp(c1.b, c2.b, factor));
        
        return this.rgbToHex(r, g, b);
    },

    // 添加透明度
    addAlpha(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
};

// 时间工具
const TimeUtils = {
    // 格式化时间 (ms -> mm:ss)
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // 格式化倒计时
    formatCountdown(milliseconds) {
        if (milliseconds <= 0) return '00:00';
        return this.formatTime(milliseconds);
    },

    // 获取时间戳
    now() {
        return Date.now();
    },

    // 时间差
    delta(start, end = Date.now()) {
        return end - start;
    }
};

// DOM工具
const DOMUtils = {
    // 获取元素
    $(selector) {
        return document.querySelector(selector);
    },

    // 获取所有元素
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // 添加类
    addClass(element, className) {
        if (element) element.classList.add(className);
    },

    // 移除类
    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },

    // 切换类
    toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    },

    // 检查是否有类
    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    },

    // 设置样式
    setStyle(element, styles) {
        if (!element) return;
        Object.assign(element.style, styles);
    },

    // 创建元素
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        Object.assign(element, attributes);
        if (textContent) element.textContent = textContent;
        return element;
    },

    // 显示元素
    show(element) {
        if (element) element.classList.remove('hidden');
    },

    // 隐藏元素
    hide(element) {
        if (element) element.classList.add('hidden');
    }
};

// 事件工具
const EventUtils = {
    // 添加事件监听
    on(element, event, handler) {
        if (element) element.addEventListener(event, handler);
    },

    // 移除事件监听
    off(element, event, handler) {
        if (element) element.removeEventListener(event, handler);
    },

    // 触发自定义事件
    emit(element, eventName, data) {
        if (!element) return;
        const event = new CustomEvent(eventName, { detail: data });
        element.dispatchEvent(event);
    },

    // 阻止默认行为
    prevent(event) {
        event.preventDefault();
    },

    // 阻止冒泡
    stop(event) {
        event.stopPropagation();
    }
};

// 存储工具
const StorageUtils = {
    // 设置本地存储
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
            return false;
        }
    },

    // 获取本地存储
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },

    // 移除本地存储
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
            return false;
        }
    },

    // 清空本地存储
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
            return false;
        }
    }
};

// 网络工具
const NetworkUtils = {
    // 检查网络状态
    isOnline() {
        return navigator.onLine;
    },

    // 获取网络类型
    getConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? connection.effectiveType : 'unknown';
    },

    // 估算延迟
    async measureLatency(url = '/ping') {
        try {
            const start = performance.now();
            await fetch(url, { method: 'HEAD' });
            const end = performance.now();
            return Math.round(end - start);
        } catch (e) {
            return -1;
        }
    }
};

// 性能工具
const PerformanceUtils = {
    // FPS计数器
    createFPSCounter() {
        let frames = 0;
        let lastTime = performance.now();
        let fps = 0;

        return {
            update() {
                frames++;
                const currentTime = performance.now();
                if (currentTime - lastTime >= 1000) {
                    fps = Math.round(frames * 1000 / (currentTime - lastTime));
                    frames = 0;
                    lastTime = currentTime;
                }
                return fps;
            },
            getFPS() {
                return fps;
            }
        };
    },

    // 内存使用情况
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    },

    // 性能标记
    mark(name) {
        performance.mark(name);
    },

    // 性能测量
    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure ? measure.duration : 0;
    }
};

// 动画工具
const AnimationUtils = {
    // 缓动函数
    easing: {
        linear: t => t,
        easeIn: t => t * t,
        easeOut: t => 1 - (1 - t) * (1 - t),
        easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    },

    // 创建补间动画
    tween(from, to, duration, easingFunc = this.easing.linear, onUpdate, onComplete) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunc(progress);
            const value = MathUtils.lerp(from, to, easedProgress);
            
            if (onUpdate) onUpdate(value, progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// 导出工具
window.MathUtils = MathUtils;
window.ColorUtils = ColorUtils;
window.TimeUtils = TimeUtils;
window.DOMUtils = DOMUtils;
window.EventUtils = EventUtils;
window.StorageUtils = StorageUtils;
window.NetworkUtils = NetworkUtils;
window.PerformanceUtils = PerformanceUtils;
window.AnimationUtils = AnimationUtils;