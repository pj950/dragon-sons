#!/bin/bash

# 龙生九子·五行对战 - 部署脚本
# 用于构建、测试和部署游戏服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SERVER_DIR="server"
PORT=${PORT:-8787}
NODE_ENV=${NODE_ENV:-production}

echo -e "${BLUE}🐉 龙生九子·五行对战 - 部署脚本${NC}"
echo "=================================="

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}📋 检查系统依赖...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}📦 安装项目依赖...${NC}"
    cd "$SERVER_DIR"
    
    if [ ! -d "node_modules" ]; then
        npm install
    else
        npm ci --only=production
    fi
    
    cd ..
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${YELLOW}🔨 构建项目...${NC}"
    cd "$SERVER_DIR"
    
    npm run build
    
    if [ ! -f "dist/index.js" ]; then
        echo -e "${RED}❌ 构建失败${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ 构建完成${NC}"
}

# 运行测试
run_tests() {
    echo -e "${YELLOW}🧪 运行测试...${NC}"
    cd "$SERVER_DIR"
    
    # 健康检查
    echo "检查服务器健康状态..."
    if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ 端口 $PORT 已被占用${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ 测试通过${NC}"
}

# 启动服务器
start_server() {
    echo -e "${YELLOW}🚀 启动服务器...${NC}"
    
    # 设置环境变量
    export CONFIG_PATH="$SERVER_DIR/dist/config/balance.json"
    export PORT="$PORT"
    export NODE_ENV="$NODE_ENV"
    
    echo "配置路径: $CONFIG_PATH"
    echo "端口: $PORT"
    echo "环境: $NODE_ENV"
    
    # 启动服务器
    cd "$SERVER_DIR"
    nohup node dist/index.js > server.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    echo "等待服务器启动..."
    sleep 5
    
    # 检查服务器状态
    if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务器启动成功 (PID: $SERVER_PID)${NC}"
        echo "日志文件: $SERVER_DIR/server.log"
        echo "健康检查: http://localhost:$PORT/health"
    else
        echo -e "${RED}❌ 服务器启动失败${NC}"
        echo "查看日志: tail -f $SERVER_DIR/server.log"
        exit 1
    fi
    
    cd ..
}

# 停止服务器
stop_server() {
    echo -e "${YELLOW}🛑 停止服务器...${NC}"
    
    # 查找并停止服务器进程
    PIDS=$(pgrep -f "node.*dist/index.js" || true)
    
    if [ -n "$PIDS" ]; then
        echo "找到服务器进程: $PIDS"
        kill $PIDS
        sleep 2
        
        # 强制停止
        PIDS=$(pgrep -f "node.*dist/index.js" || true)
        if [ -n "$PIDS" ]; then
            echo "强制停止进程: $PIDS"
            kill -9 $PIDS
        fi
        
        echo -e "${GREEN}✅ 服务器已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到运行中的服务器${NC}"
    fi
}

# 显示状态
show_status() {
    echo -e "${YELLOW}📊 服务器状态...${NC}"
    
    PIDS=$(pgrep -f "node.*dist/index.js" || true)
    if [ -n "$PIDS" ]; then
        echo -e "${GREEN}✅ 服务器正在运行 (PID: $PIDS)${NC}"
        
        if curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 健康检查通过${NC}"
        else
            echo -e "${RED}❌ 健康检查失败${NC}"
        fi
    else
        echo -e "${RED}❌ 服务器未运行${NC}"
    fi
}

# 显示日志
show_logs() {
    echo -e "${YELLOW}📝 显示服务器日志...${NC}"
    
    if [ -f "$SERVER_DIR/server.log" ]; then
        tail -f "$SERVER_DIR/server.log"
    else
        echo -e "${YELLOW}⚠️  日志文件不存在${NC}"
    fi
}

# 性能测试
run_performance_test() {
    echo -e "${YELLOW}⚡ 运行性能测试...${NC}"
    cd "$SERVER_DIR"
    
    # 检查服务器是否运行
    if ! curl -s "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ 服务器未运行，无法进行性能测试${NC}"
        exit 1
    fi
    
    # 运行性能测试
    npm run test:perf
    
    cd ..
}

# 显示帮助
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  install     安装依赖"
    echo "  build       构建项目"
    echo "  start       启动服务器"
    echo "  stop        停止服务器"
    echo "  restart     重启服务器"
    echo "  status      显示服务器状态"
    echo "  logs        显示服务器日志"
    echo "  test        运行性能测试"
    echo "  deploy      完整部署 (install + build + start)"
    echo "  help        显示此帮助信息"
    echo ""
    echo "环境变量:"
    echo "  PORT        服务器端口 (默认: 8787)"
    echo "  NODE_ENV    运行环境 (默认: production)"
    echo ""
    echo "示例:"
    echo "  $0 deploy                    # 完整部署"
    echo "  PORT=9000 $0 start          # 在端口9000启动"
    echo "  NODE_ENV=development $0 start # 开发模式启动"
}

# 主函数
main() {
    case "${1:-help}" in
        install)
            check_dependencies
            install_dependencies
            ;;
        build)
            check_dependencies
            install_dependencies
            build_project
            ;;
        start)
            check_dependencies
            install_dependencies
            build_project
            run_tests
            start_server
            ;;
        stop)
            stop_server
            ;;
        restart)
            stop_server
            sleep 2
            check_dependencies
            install_dependencies
            build_project
            run_tests
            start_server
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        test)
            run_performance_test
            ;;
        deploy)
            check_dependencies
            install_dependencies
            build_project
            run_tests
            start_server
            echo -e "${GREEN}🎉 部署完成!${NC}"
            ;;
        help|*)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"