// Game Client for 龙生九子
class GameClient {
    constructor() {
        this.ws = null;
        this.state = 'disconnected';
        this.playerId = null;
        this.playerName = '';
        this.roomId = null;
        this.gameState = null;
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0 };
        this.inputState = {
            keys: {},
            mouse: { x: 0, y: 0 },
            mouseWorld: { x: 0, y: 0 }
        };
        this.lastMoveTime = 0;
        this.moveThrottle = 33; // ~30Hz
        this.skillKeys = ['q', 'w', 'e', 'r'];
        this.itemKeys = ['1', '2', '3'];
        
        this.elementColors = {
            metal: '#95a5a6',
            wood: '#27ae60',
            water: '#3498db',
            fire: '#e74c3c',
            earth: '#f39c12'
        };
        
        this.skillIcons = {
            slash: '⚔️',
            arcSlash: '🌙',
            thunderChain: '⚡',
            cyclone: '🌪️',
            stoneWall: '🛡️',
            earthStomp: '💥',
            flameBurst: '🔥',
            heal: '💚',
            // Add more skill icons as needed
        };
        
        this.itemIcons = {
            healingPill: '💊',
            goldenBell: '🔔',
            swiftBoots: '👟',
            bomb: '💣',
            trap: '🕸️',
            blink: '✨'
        };
        
        this.init();
    }
    
    init() {
        // Setup event listeners
        this.setupUI();
        this.setupCanvas();
        this.setupInput();
        
        // Try to connect when page loads
        this.connect();
    }
    
    setupUI() {
        // Login screen
        document.getElementById('play-btn').addEventListener('click', () => {
            const username = document.getElementById('username').value.trim();
            if (username) {
                this.playerName = username;
                this.showScreen('room-screen');
                this.requestRooms();
            }
        });
        
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('play-btn').click();
            }
        });
        
        // Room screen
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.createRoom();
        });
        
        document.getElementById('quick-match-btn').addEventListener('click', () => {
            this.quickMatch();
        });
        
        document.getElementById('refresh-rooms-btn').addEventListener('click', () => {
            this.requestRooms();
        });
        
        document.getElementById('back-to-login').addEventListener('click', () => {
            this.showScreen('login-screen');
        });
        
        // Game screen
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const msg = e.target.value.trim();
                if (msg) {
                    this.sendChat(msg);
                    e.target.value = '';
                }
            }
        });
        
        // Spectator screen
        document.getElementById('leave-spectate').addEventListener('click', () => {
            this.leaveSpectate();
        });
        
        // Game over screen
        document.getElementById('return-to-rooms').addEventListener('click', () => {
            this.showScreen('room-screen');
            this.requestRooms();
        });
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.spectatorCanvas = document.getElementById('spectator-canvas');
        this.spectatorCtx = this.spectatorCanvas.getContext('2d');
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const canvases = [this.canvas, this.spectatorCanvas];
        canvases.forEach(canvas => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    setupInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;
            if (document.activeElement.tagName === 'INPUT') return;
            
            const key = e.key.toLowerCase();
            this.inputState.keys[key] = true;
            
            // Handle skill keys
            const skillIndex = this.skillKeys.indexOf(key);
            if (skillIndex !== -1) {
                this.useSkill(skillIndex);
                e.preventDefault();
            }
            
            // Handle item keys
            const itemIndex = this.itemKeys.indexOf(key);
            if (itemIndex !== -1) {
                this.useItem(itemIndex);
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            delete this.inputState.keys[key];
        });
        
        // Mouse input
        window.addEventListener('mousemove', (e) => {
            this.inputState.mouse.x = e.clientX;
            this.inputState.mouse.y = e.clientY;
            
            if (this.gameState && this.gameState.player) {
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                this.inputState.mouseWorld.x = this.camera.x + (e.clientX - centerX);
                this.inputState.mouseWorld.y = this.camera.y + (e.clientY - centerY);
            }
        });
        
        window.addEventListener('click', (e) => {
            if (this.state !== 'playing') return;
            if (e.target.closest('.game-ui')) return;
            
            // Attack on click
            this.attack();
        });
        
        // Item slot clicks
        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotIndex = parseInt(slot.dataset.slot);
                this.useItem(slotIndex);
            });
        });
        
        // Skill slot clicks
        document.querySelectorAll('.skill-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const skillIndex = parseInt(slot.dataset.skill);
                this.useSkill(skillIndex);
            });
        });
    }
    
    connect() {
        const wsUrl = `ws://localhost:8080`;
        console.log('Connecting to server:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to server');
            this.state = 'connected';
            this.updateServerStatus('已连接', 'green');
            this.send({ t: 'hello', name: this.playerName || 'Player' });
        };
        
        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            this.handleMessage(msg);
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.state = 'disconnected';
            this.updateServerStatus('断开连接', 'red');
            
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (this.state === 'disconnected') {
                    this.connect();
                }
            }, 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateServerStatus('连接错误', 'red');
        };
    }
    
    send(msg) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
    }
    
    handleMessage(msg) {
        switch (msg.t) {
            case 'hello':
                this.playerId = msg.id;
                console.log('Received player ID:', this.playerId);
                break;
                
            case 'rooms':
                this.updateRoomList(msg.rooms);
                break;
                
            case 'joinRoom':
                if (msg.success) {
                    this.roomId = msg.roomId;
                    this.state = 'playing';
                    this.showScreen('game-screen');
                    this.startGameLoop();
                }
                break;
                
            case 'spectate':
                if (msg.success) {
                    this.roomId = msg.roomId;
                    this.state = 'spectating';
                    this.showScreen('spectator-screen');
                    this.startSpectatorLoop();
                }
                break;
                
            case 'snapshot':
                this.gameState = msg;
                this.updateGameUI();
                break;
                
            case 'hit':
                this.showDamageNumber(msg);
                break;
                
            case 'chat':
                this.addChatMessage(msg.from, msg.msg);
                break;
                
            case 'start':
                this.addChatMessage('System', '游戏开始！');
                break;
                
            case 'gameOver':
                this.handleGameOver(msg);
                break;
                
            case 'leaderboard':
                this.updateLeaderboard(msg.board);
                break;
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateServerStatus(text, color) {
        const status = document.getElementById('server-status');
        status.textContent = text;
        status.style.color = color;
    }
    
    requestRooms() {
        this.send({ t: 'rooms' });
    }
    
    createRoom() {
        const roomName = prompt('输入房间名称:') || `Room ${Date.now()}`;
        this.send({ t: 'createRoom', name: roomName });
    }
    
    quickMatch() {
        // Find first available room or create new one
        this.send({ t: 'rooms' });
        setTimeout(() => {
            const rooms = this.lastRooms || [];
            const availableRoom = rooms.find(r => r.state === 'waiting' && r.players < r.maxPlayers);
            if (availableRoom) {
                this.joinRoom(availableRoom.id);
            } else {
                this.createRoom();
            }
        }, 100);
    }
    
    joinRoom(roomId) {
        this.send({ t: 'joinRoom', roomId });
    }
    
    spectateRoom(roomId) {
        this.send({ t: 'spectate', roomId });
    }
    
    leaveSpectate() {
        this.state = 'connected';
        this.roomId = null;
        this.showScreen('room-screen');
        this.requestRooms();
    }
    
    updateRoomList(rooms) {
        this.lastRooms = rooms;
        const container = document.getElementById('room-list');
        container.innerHTML = '';
        
        if (rooms.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #666;">暂无房间</div>';
            return;
        }
        
        rooms.forEach(room => {
            const roomEl = document.createElement('div');
            roomEl.className = 'room-item';
            
            let stateText = '';
            let stateColor = '';
            switch (room.state) {
                case 'waiting':
                    stateText = '等待中';
                    stateColor = '#f39c12';
                    break;
                case 'playing':
                    stateText = '游戏中';
                    stateColor = '#27ae60';
                    break;
                case 'ended':
                    stateText = '已结束';
                    stateColor = '#e74c3c';
                    break;
            }
            
            roomEl.innerHTML = `
                <div class="room-info">
                    <div class="room-name">${room.name}</div>
                    <div class="room-players">
                        玩家: ${room.players}/${room.maxPlayers} | 
                        <span style="color: ${stateColor}">${stateText}</span>
                    </div>
                </div>
                <div class="room-actions">
                    ${room.state === 'waiting' && room.players < room.maxPlayers ? 
                        `<button class="join-btn" onclick="gameClient.joinRoom('${room.id}')">加入</button>` : ''}
                    ${room.state === 'playing' ? 
                        `<button class="spectate-btn" onclick="gameClient.spectateRoom('${room.id}')">观战</button>` : ''}
                </div>
            `;
            
            container.appendChild(roomEl);
        });
    }
    
    updateGameUI() {
        if (!this.gameState) return;
        
        const player = this.gameState.player;
        if (!player) return;
        
        // Update player info
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('player-element').textContent = player.element;
        document.getElementById('player-element').className = `element-badge ${player.element}`;
        
        // Update health
        const healthPercent = (player.hp / player.maxHp) * 100;
        document.getElementById('health-fill').style.width = healthPercent + '%';
        document.getElementById('health-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
        
        // Update stats
        document.getElementById('stat-atk').textContent = Math.round(player.baseAtk + player.fruitAtkFlat);
        document.getElementById('stat-agi').textContent = Math.round(player.agi);
        document.getElementById('stat-def').textContent = Math.round(player.def);
        document.getElementById('stat-dodge').textContent = Math.round(player.dodge * 100) + '%';
        document.getElementById('stat-crit').textContent = Math.round(player.crit * 100) + '%';
        
        // Update game timer
        if (this.gameState.timeRemaining) {
            const minutes = Math.floor(this.gameState.timeRemaining / 60);
            const seconds = this.gameState.timeRemaining % 60;
            document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update alive count
        if (this.gameState.players) {
            const aliveCount = this.gameState.players.filter(p => p.hp > 0).length;
            document.getElementById('alive-count').textContent = `存活: ${aliveCount}`;
        }
        
        // Update inventory
        player.slots.forEach((itemId, index) => {
            const slot = document.querySelector(`.slot[data-slot="${index}"] .slot-content`);
            if (slot) {
                slot.textContent = itemId ? (this.itemIcons[itemId] || '📦') : '';
            }
        });
        
        // Update skills
        player.skills.forEach((skillId, index) => {
            const skillSlot = document.querySelector(`.skill-slot[data-skill="${index}"]`);
            if (skillSlot) {
                const icon = skillSlot.querySelector('.skill-icon');
                const cooldown = skillSlot.querySelector('.skill-cooldown');
                
                icon.textContent = this.skillIcons[skillId] || '✨';
                
                // Check cooldown
                const cd = player.cooldowns[skillId];
                if (cd && cd > Date.now()) {
                    cooldown.classList.add('active');
                    cooldown.textContent = Math.ceil((cd - Date.now()) / 1000);
                } else {
                    cooldown.classList.remove('active');
                }
            }
        });
        
        // Update camera to follow player
        this.camera.x = player.x;
        this.camera.y = player.y;
    }
    
    startGameLoop() {
        const loop = () => {
            if (this.state !== 'playing') return;
            
            this.handleInput();
            this.render();
            
            requestAnimationFrame(loop);
        };
        loop();
    }
    
    startSpectatorLoop() {
        const loop = () => {
            if (this.state !== 'spectating') return;
            
            this.renderSpectator();
            
            requestAnimationFrame(loop);
        };
        loop();
    }
    
    handleInput() {
        const now = Date.now();
        
        // Movement
        if (now - this.lastMoveTime > this.moveThrottle) {
            let vx = 0, vy = 0;
            
            if (this.inputState.keys['w'] || this.inputState.keys['arrowup']) vy = -1;
            if (this.inputState.keys['s'] || this.inputState.keys['arrowdown']) vy = 1;
            if (this.inputState.keys['a'] || this.inputState.keys['arrowleft']) vx = -1;
            if (this.inputState.keys['d'] || this.inputState.keys['arrowright']) vx = 1;
            
            if (vx !== 0 || vy !== 0) {
                // Normalize diagonal movement
                const mag = Math.sqrt(vx * vx + vy * vy);
                vx /= mag;
                vy /= mag;
                
                this.send({ t: 'move', vx, vy });
                this.lastMoveTime = now;
            }
        }
    }
    
    attack() {
        if (!this.gameState || !this.gameState.player) return;
        
        const dx = this.inputState.mouseWorld.x - this.gameState.player.x;
        const dy = this.inputState.mouseWorld.y - this.gameState.player.y;
        const angle = Math.atan2(dy, dx);
        
        this.send({ t: 'attack', angle });
    }
    
    useSkill(index) {
        if (!this.gameState || !this.gameState.player) return;
        
        const skillId = this.gameState.player.skills[index];
        if (!skillId) return;
        
        // Find nearest enemy as target
        let targetId = null;
        let minDist = Infinity;
        
        this.gameState.players.forEach(p => {
            if (p.id === this.playerId || p.hp <= 0) return;
            const dist = Math.hypot(p.x - this.gameState.player.x, p.y - this.gameState.player.y);
            if (dist < minDist) {
                minDist = dist;
                targetId = p.id;
            }
        });
        
        if (targetId) {
            this.send({ t: 'cast', skillId, target: targetId });
        }
    }
    
    useItem(slotIndex) {
        this.send({ t: 'useSlot', slot: slotIndex });
    }
    
    sendChat(message) {
        this.send({ t: 'chat', msg: message });
    }
    
    addChatMessage(username, message) {
        const container = document.getElementById('chat-messages');
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-message';
        msgEl.innerHTML = `<span class="username">${username}:</span> ${message}`;
        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
    }
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!this.gameState) return;
        
        // Save context
        ctx.save();
        
        // Center camera on player
        ctx.translate(canvas.width / 2 - this.camera.x, canvas.height / 2 - this.camera.y);
        
        // Draw map bounds
        this.drawMap(ctx);
        
        // Draw items
        if (this.gameState.items) {
            this.gameState.items.forEach(item => {
                this.drawItem(ctx, item);
            });
        }
        
        // Draw fruits
        if (this.gameState.fruits) {
            this.gameState.fruits.forEach(fruit => {
                this.drawFruit(ctx, fruit);
            });
        }
        
        // Draw monsters
        if (this.gameState.monsters) {
            this.gameState.monsters.forEach(monster => {
                this.drawMonster(ctx, monster);
            });
        }
        
        // Draw players
        if (this.gameState.players) {
            this.gameState.players.forEach(player => {
                this.drawPlayer(ctx, player);
            });
        }
        
        // Draw projectiles/effects
        // TODO: Add projectile rendering
        
        // Restore context
        ctx.restore();
        
        // Draw UI overlay
        this.drawUIOverlay(ctx);
    }
    
    renderSpectator() {
        const ctx = this.spectatorCtx;
        const canvas = this.spectatorCanvas;
        
        // Similar to render() but with different camera logic
        // Center on map center or follow specific player
        
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!this.gameState) return;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        this.drawMap(ctx);
        
        // Draw all game objects
        // ... similar to render()
        
        ctx.restore();
    }
    
    drawMap(ctx) {
        const radius = this.gameState.mapRadius || 50;
        
        // Draw outer boundary
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw element zones
        const elements = ['metal', 'wood', 'water', 'fire', 'earth'];
        const angleStep = (Math.PI * 2) / elements.length;
        
        elements.forEach((element, i) => {
            const startAngle = i * angleStep - Math.PI / 2;
            const endAngle = (i + 1) * angleStep - Math.PI / 2;
            
            ctx.fillStyle = this.elementColors[element] + '20';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Draw zone label
            const midAngle = (startAngle + endAngle) / 2;
            const labelX = Math.cos(midAngle) * (radius * 0.7);
            const labelY = Math.sin(midAngle) * (radius * 0.7);
            
            ctx.fillStyle = this.elementColors[element];
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.toUpperCase(), labelX, labelY);
        });
        
        // Draw safe zone
        if (this.gameState.safeRadius) {
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, this.gameState.safeRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    drawPlayer(ctx, player) {
        const isMe = player.id === this.playerId;
        const isDead = player.hp <= 0;
        
        if (isDead) {
            ctx.globalAlpha = 0.3;
        }
        
        // Draw player circle
        ctx.fillStyle = isMe ? '#fff' : this.elementColors[player.element];
        ctx.beginPath();
        ctx.arc(player.x, player.y, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = isMe ? '#ffd700' : '#333';
        ctx.lineWidth = isMe ? 3 : 2;
        ctx.stroke();
        
        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(player.name, player.x, player.y - 15);
        
        // Draw health bar
        const barWidth = 40;
        const barHeight = 4;
        const barY = player.y - 10;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(player.x - barWidth/2, barY, barWidth, barHeight);
        
        const healthPercent = player.hp / player.maxHp;
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(player.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        ctx.globalAlpha = 1;
    }
    
    drawMonster(ctx, monster) {
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        const barWidth = 30;
        const barHeight = 3;
        const barY = monster.y - 8;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(monster.x - barWidth/2, barY, barWidth, barHeight);
        
        const healthPercent = monster.hp / monster.maxHp;
        ctx.fillStyle = '#f00';
        ctx.fillRect(monster.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    }
    
    drawFruit(ctx, fruit) {
        ctx.fillStyle = this.elementColors[fruit.element];
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.elementColors[fruit.element];
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawItem(ctx, item) {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(item.x, item.y, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw item icon
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.itemIcons[item.type] || '?', item.x, item.y);
    }
    
    drawUIOverlay(ctx) {
        // Draw minimap
        const minimapSize = 150;
        const minimapX = ctx.canvas.width - minimapSize - 20;
        const minimapY = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        ctx.save();
        ctx.translate(minimapX + minimapSize/2, minimapY + minimapSize/2);
        
        const scale = minimapSize / (this.gameState.mapRadius * 2.2);
        ctx.scale(scale, scale);
        
        // Draw minimap content
        this.drawMap(ctx);
        
        // Draw player positions on minimap
        if (this.gameState.players) {
            this.gameState.players.forEach(p => {
                ctx.fillStyle = p.id === this.playerId ? '#ffd700' : '#f00';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        ctx.restore();
    }
    
    showDamageNumber(data) {
        // TODO: Implement floating damage numbers
        console.log('Damage:', data);
    }
    
    handleGameOver(data) {
        this.state = 'gameOver';
        
        const result = data.winner === this.playerId ? 'victory' : 'defeat';
        const resultText = result === 'victory' ? '胜利！' : '失败';
        
        document.getElementById('game-result').textContent = resultText;
        document.getElementById('game-result').className = result;
        
        // Show final stats
        const stats = `
            <h3>战斗统计</h3>
            <p>击杀数: ${data.kills || 0}</p>
            <p>造成伤害: ${data.damage || 0}</p>
            <p>存活时间: ${data.surviveTime || 0}秒</p>
        `;
        document.getElementById('final-stats').innerHTML = stats;
        
        // Update leaderboard
        if (data.leaderboard) {
            this.updateLeaderboard(data.leaderboard);
        }
        
        this.showScreen('game-over-screen');
    }
    
    updateLeaderboard(board) {
        const container = document.getElementById('leaderboard');
        container.innerHTML = '<h3>排行榜</h3>';
        
        board.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${player.score}</span>
            `;
            container.appendChild(item);
        });
    }
}

// Initialize game client when page loads
const gameClient = new GameClient();