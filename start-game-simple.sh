#!/bin/bash

# 龙生九子·五行对战 - 简化启动脚本

echo "🐉 龙生九子·五行对战 - 游戏启动脚本"
echo "=================================="

# 检查Node.js版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本过低 (当前: $(node -v))，需要 16+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 检查资源文件
echo ""
echo "🔍 检查游戏资源..."
if [ ! -d "client/assets" ] || [ ! -f "client/assets/manifest.json" ]; then
    echo "⚠️  游戏资源不存在，正在生成..."
    if [ -f "generate-resources.js" ]; then
        node generate-resources.js
    elif [ -f "generate-real-assets.js" ]; then
        node generate-real-assets.js
    else
        echo "❌ 找不到资源生成脚本"
        exit 1
    fi
fi

echo "✅ 游戏资源检查完成"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

# 安装服务器依赖
echo ""
echo "📦 安装服务器依赖..."
cd server
npm install
cd ..

echo "✅ 依赖安装完成"

# 构建服务器
echo ""
echo "🔨 构建服务器..."
cd server
npm run build
cd ..

echo "✅ 服务器构建完成"

# 检查端口占用
echo ""
echo "🔍 检查端口占用..."

if lsof -i :8787 &> /dev/null; then
    echo "⚠️  端口 8787 已被占用，尝试关闭..."
    pkill -f "node.*8787" || true
    sleep 2
fi

if lsof -i :8080 &> /dev/null; then
    echo "⚠️  端口 8080 已被占用，尝试关闭..."
    pkill -f "serve.*8080" || true
    sleep 2
fi

# 启动服务器
echo ""
echo "🚀 启动游戏服务器 (端口 8787)..."
cd server
CONFIG_PATH=/workspace/server/dist/config/balance.json node dist/index.js &
SERVER_PID=$!
cd ..

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 检查服务器是否启动成功
if curl -s http://localhost:8787/health > /dev/null; then
    echo "✅ 服务器启动成功"
else
    echo "❌ 服务器启动失败"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# 启动客户端
echo ""
echo "🌐 启动Web客户端 (端口 8080)..."
cd client

# 检查是否有serve命令
if ! command -v serve &> /dev/null; then
    echo "📦 安装 serve..."
    npm install -g serve
fi

serve . -p 8080 &
CLIENT_PID=$!
cd ..

# 等待客户端启动
echo "⏳ 等待客户端启动..."
sleep 3

# 检查客户端是否启动成功
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ 客户端启动成功"
else
    echo "❌ 客户端启动失败"
    kill $CLIENT_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 游戏启动完成！"
echo "=================================="
echo "🎮 游戏入口: http://localhost:8080"
echo "🛠️  资源生成: http://localhost:8080/generate-assets.html"
echo "🧪 功能测试: http://localhost:8080/test.html"
echo "📊 服务器状态: http://localhost:8787/health"
echo ""
echo "💡 提示:"
echo "   - 使用 Ctrl+C 停止游戏"
echo "   - 游戏支持多人同时在线"
echo "   - 所有资源已自动生成完成"
echo ""
echo "🐉 龙生九子·五行对战 - 让五行之力在指尖绽放！"

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止游戏..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo "✅ 游戏已停止"; exit 0' INT

# 保持脚本运行
wait