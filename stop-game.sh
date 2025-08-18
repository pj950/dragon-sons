#!/bin/bash

# 龙生九子·五行对战 - 游戏停止脚本

echo "🛑 正在停止龙生九子·五行对战..."

# 从PID文件读取进程ID
if [ -f .server.pid ]; then
    SERVER_PID=$(cat .server.pid)
    echo "🔄 停止服务器进程 (PID: $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null
    rm -f .server.pid
fi

if [ -f .client.pid ]; then
    CLIENT_PID=$(cat .client.pid)
    echo "🔄 停止客户端进程 (PID: $CLIENT_PID)..."
    kill $CLIENT_PID 2>/dev/null
    rm -f .client.pid
fi

# 强制杀死相关进程
echo "🔄 清理相关进程..."
pkill -f "node.*dragon-sons" 2>/dev/null || true
pkill -f "serve.*client" 2>/dev/null || true
pkill -f "node.*8787" 2>/dev/null || true
pkill -f "serve.*8080" 2>/dev/null || true

# 等待进程结束
sleep 2

# 检查端口是否释放
if lsof -i :8787 &> /dev/null; then
    echo "⚠️  端口 8787 仍被占用"
else
    echo "✅ 端口 8787 已释放"
fi

if lsof -i :8080 &> /dev/null; then
    echo "⚠️  端口 8080 仍被占用"
else
    echo "✅ 端口 8080 已释放"
fi

echo "✅ 游戏已完全停止"