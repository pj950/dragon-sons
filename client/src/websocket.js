// 龙生九子·五行对战 - WebSocket客户端

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.messageHandlers = new Map();
        this.pingInterval = null;
        this.lastPingTime = 0;
        this.latency = 0;
        
        // 消息队列（离线时缓存）
        this.messageQueue = [];
        
        // 事件监听器
        this.eventListeners = {
            connect: [],
            disconnect: [],
            reconnect: [],
            error: [],
            message: []
        };
        
        this.setupMessageHandlers();
    }

    // 连接到服务器
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        const url = getWebSocketURL();
        console.log('Connecting to:', url);
        
        try {
            this.ws = new WebSocket(url);
            this.setupWebSocketEvents();
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.handleError(error);
        }
    }

    // 设置WebSocket事件
    setupWebSocketEvents() {
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // 发送缓存的消息
            this.flushMessageQueue();
            
            // 开始ping
            this.startPing();
            
            // 触发连接事件
            this.emit('connect');
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            this.connected = false;
            this.stopPing();
            
            // 触发断开连接事件
            this.emit('disconnect', event);
            
            // 自动重连
            if (!event.wasClean && this.reconnectAttempts < CONFIG.server.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleError(error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse message:', error, event.data);
            }
        };
    }

    // 处理错误
    handleError(error) {
        this.emit('error', error);
    }

    // 计划重连
    scheduleReconnect() {
        if (this.reconnectTimer) return;
        
        this.reconnectAttempts++;
        const delay = Math.min(CONFIG.server.reconnectInterval * this.reconnectAttempts, 30000);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${CONFIG.server.maxReconnectAttempts})`);
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
            this.emit('reconnect', this.reconnectAttempts);
        }, delay);
    }

    // 断开连接
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.stopPing();
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        
        this.connected = false;
    }

    // 发送消息
    send(message) {
        if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // 缓存消息
            this.messageQueue.push(message);
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    // 发送缓存的消息
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    // 开始ping
    startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            if (this.connected) {
                this.lastPingTime = Date.now();
                this.send({ t: 'ping', timestamp: this.lastPingTime });
            }
        }, 5000);
    }

    // 停止ping
    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    // 设置消息处理器
    setupMessageHandlers() {
        // Hello消息
        this.onMessage('hello', (data) => {
            console.log('Received hello:', data);
            window.Game.handleHello(data);
        });

        // Pong消息
        this.onMessage('pong', (data) => {
            if (data.timestamp && this.lastPingTime) {
                this.latency = Date.now() - this.lastPingTime;
            }
        });

        // 快照消息
        this.onMessage('snapshot', (data) => {
            window.Game.handleSnapshot(data);
        });

        // 技能特效消息
        this.onMessage('skillEffect', (data) => {
            window.Game.handleSkillEffect(data);
        });

        // 房间消息
        this.onMessage('rooms', (data) => {
            window.Game.handleRooms(data);
        });

        // 倒计时消息
        this.onMessage('countdown_cancel', () => {
            window.Game.handleCountdownCancel();
        });

        // 开始游戏消息
        this.onMessage('start', () => {
            window.Game.handleGameStart();
        });

        // 错误消息
        this.onMessage('error', (data) => {
            console.error('Server error:', data);
            window.UI.showNotification(data.message || 'Server error', 'error');
        });
    }

    // 注册消息处理器
    onMessage(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    // 移除消息处理器
    offMessage(type, handler) {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // 处理收到的消息
    handleMessage(message) {
        this.emit('message', message);
        
        const handlers = this.messageHandlers.get(message.t);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(message);
                } catch (error) {
                    console.error('Message handler error:', error);
                }
            });
        }
    }

    // 添加事件监听器
    addEventListener(event, listener) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(listener);
        }
    }

    // 移除事件监听器
    removeEventListener(event, listener) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(listener);
            if (index !== -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    // 触发事件
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error('Event listener error:', error);
                }
            });
        }
    }

    // 获取连接状态
    isConnected() {
        return this.connected;
    }

    // 获取延迟
    getLatency() {
        return this.latency;
    }

    // 获取重连次数
    getReconnectAttempts() {
        return this.reconnectAttempts;
    }

    // 游戏相关消息发送方法
    
    // 移动
    sendMove(vx, vy) {
        this.send({ t: 'move', vx, vy });
    }

    // 攻击
    sendAttack(targetId) {
        this.send({ t: 'attack', target: targetId });
    }

    // 释放技能
    sendCast(skillId, targetId) {
        this.send({ t: 'cast', skillId, target: targetId });
    }

    // 拾取物品
    sendPickup(entityId) {
        this.send({ t: 'pickup', id: entityId });
    }

    // 使用道具
    sendUseItem(itemId) {
        this.send({ t: 'useItem', itemId });
    }

    // 分配道具到槽位
    sendAssignSlot(itemId, slot) {
        this.send({ t: 'assignSlot', itemId, slot });
    }

    // 使用槽位道具
    sendUseSlot(slot) {
        this.send({ t: 'useSlot', slot });
    }

    // 创建房间
    sendCreateRoom() {
        this.send({ t: 'createRoom' });
    }

    // 加入房间
    sendJoinRoom(roomId) {
        this.send({ t: 'joinRoom', room: roomId });
    }

    // 观战
    sendSpectate(roomId) {
        this.send({ t: 'spectate', room: roomId });
    }

    // 获取房间列表
    sendGetRooms() {
        this.send({ t: 'rooms' });
    }
}

// 创建全局WebSocket客户端实例
window.WebSocketClient = WebSocketClient;
window.wsClient = new WebSocketClient();