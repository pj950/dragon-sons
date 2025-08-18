#!/usr/bin/env node

/**
 * 龙生九子服务器性能测试脚本
 * 测试并发连接、消息处理和游戏逻辑性能
 */

const WebSocket = require('ws');

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8787';
const CONCURRENT_CLIENTS = parseInt(process.env.CLIENTS || '10');
const TEST_DURATION = parseInt(process.env.DURATION || '30'); // 秒
const MESSAGE_INTERVAL = parseInt(process.env.INTERVAL || '100'); // 毫秒

class PerformanceTest {
    constructor() {
        this.clients = [];
        this.stats = {
            connected: 0,
            messagesSent: 0,
            messagesReceived: 0,
            errors: 0,
            startTime: Date.now(),
            endTime: null
        };
        this.running = false;
    }

    async start() {
        console.log(`🚀 开始性能测试`);
        console.log(`📊 配置: ${CONCURRENT_CLIENTS} 个并发客户端, ${TEST_DURATION} 秒测试时长`);
        console.log(`🔗 服务器: ${SERVER_URL}`);
        console.log(`📡 消息间隔: ${MESSAGE_INTERVAL}ms`);
        console.log('─'.repeat(50));

        this.running = true;
        this.stats.startTime = Date.now();

        // 创建客户端
        await this.createClients();

        // 开始发送消息
        this.startMessageSending();

        // 设置测试结束定时器
        setTimeout(() => {
            this.stop();
        }, TEST_DURATION * 1000);

        // 定期显示统计信息
        this.startStatsReporting();
    }

    async createClients() {
        console.log(`🔌 创建 ${CONCURRENT_CLIENTS} 个客户端连接...`);
        
        const promises = [];
        for (let i = 0; i < CONCURRENT_CLIENTS; i++) {
            promises.push(this.createClient(i));
        }

        await Promise.all(promises);
        console.log(`✅ 所有客户端连接完成`);
    }

    async createClient(id) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(SERVER_URL);
            const client = { id, ws, connected: false, messages: 0 };

            ws.on('open', () => {
                client.connected = true;
                this.stats.connected++;
                resolve(client);
            });

            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    this.stats.messagesReceived++;
                    client.messages++;
                } catch (e) {
                    this.stats.errors++;
                }
            });

            ws.on('error', (error) => {
                this.stats.errors++;
                console.error(`❌ 客户端 ${id} 错误:`, error.message);
            });

            ws.on('close', () => {
                client.connected = false;
                this.stats.connected--;
            });

            // 超时处理
            setTimeout(() => {
                if (!client.connected) {
                    reject(new Error(`客户端 ${id} 连接超时`));
                }
            }, 5000);

            this.clients.push(client);
        });
    }

    startMessageSending() {
        setInterval(() => {
            if (!this.running) return;

            for (const client of this.clients) {
                if (client.connected && client.ws.readyState === WebSocket.OPEN) {
                    // 随机发送不同类型的消息
                    const messageTypes = ['move', 'pickup', 'attack'];
                    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
                    
                    let message;
                    switch (randomType) {
                        case 'move':
                            message = {
                                t: 'move',
                                vx: (Math.random() - 0.5) * 2,
                                vy: (Math.random() - 0.5) * 2
                            };
                            break;
                        case 'pickup':
                            message = { t: 'pickup' };
                            break;
                        case 'attack':
                            message = { t: 'attack' };
                            break;
                    }

                    try {
                        client.ws.send(JSON.stringify(message));
                        this.stats.messagesSent++;
                    } catch (e) {
                        this.stats.errors++;
                    }
                }
            }
        }, MESSAGE_INTERVAL);
    }

    startStatsReporting() {
        setInterval(() => {
            if (!this.running) return;

            const elapsed = (Date.now() - this.stats.startTime) / 1000;
            const msgRate = this.stats.messagesSent / elapsed;
            const recvRate = this.stats.messagesReceived / elapsed;

            console.log(`📈 运行时间: ${elapsed.toFixed(1)}s | 连接: ${this.stats.connected}/${CONCURRENT_CLIENTS} | 发送: ${this.stats.messagesSent} (${msgRate.toFixed(1)}/s) | 接收: ${this.stats.messagesReceived} (${recvRate.toFixed(1)}/s) | 错误: ${this.stats.errors}`);
        }, 2000);
    }

    stop() {
        console.log('\n🛑 停止性能测试');
        this.running = false;
        this.stats.endTime = Date.now();

        // 关闭所有连接
        for (const client of this.clients) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
        }

        // 显示最终统计
        this.showFinalStats();
        process.exit(0);
    }

    showFinalStats() {
        const totalTime = (this.stats.endTime - this.stats.startTime) / 1000;
        const avgMsgRate = this.stats.messagesSent / totalTime;
        const avgRecvRate = this.stats.messagesReceived / totalTime;
        const successRate = ((this.stats.messagesSent - this.stats.errors) / this.stats.messagesSent * 100) || 0;

        console.log('\n📊 最终测试结果');
        console.log('─'.repeat(50));
        console.log(`⏱️  总测试时间: ${totalTime.toFixed(2)} 秒`);
        console.log(`🔌 并发客户端: ${CONCURRENT_CLIENTS}`);
        console.log(`📤 总发送消息: ${this.stats.messagesSent}`);
        console.log(`📥 总接收消息: ${this.stats.messagesReceived}`);
        console.log(`❌ 总错误数: ${this.stats.errors}`);
        console.log(`📈 平均发送速率: ${avgMsgRate.toFixed(2)} 消息/秒`);
        console.log(`📉 平均接收速率: ${avgRecvRate.toFixed(2)} 消息/秒`);
        console.log(`✅ 成功率: ${successRate.toFixed(2)}%`);
        
        // 性能评估
        if (avgMsgRate > 100 && successRate > 95) {
            console.log(`🎉 性能优秀! 服务器处理能力很强`);
        } else if (avgMsgRate > 50 && successRate > 90) {
            console.log(`👍 性能良好! 服务器运行稳定`);
        } else if (avgMsgRate > 20 && successRate > 80) {
            console.log(`⚠️  性能一般! 可能需要优化`);
        } else {
            console.log(`🚨 性能较差! 建议检查服务器配置`);
        }
    }
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    process.exit(1);
});

// 启动测试
const test = new PerformanceTest();
test.start().catch(error => {
    console.error('❌ 测试启动失败:', error);
    process.exit(1);
});