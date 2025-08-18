@echo off
chcp 65001 >nul
title 龙生九子·五行对战

echo 🐉 龙生九子·五行对战 - 游戏启动脚本
echo ==================================

:: 检查Node.js
echo 📋 检查环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js 16+
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%i in ('node -v') do set NODE_MAJOR=%%i
set NODE_MAJOR=%NODE_MAJOR:~1%
if %NODE_MAJOR% LSS 16 (
    echo ❌ Node.js 版本过低，需要 16+
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node -v

:: 检查npm
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)

echo ✅ npm 版本:
npm -v

:: 安装依赖
echo.
echo 📦 安装项目依赖...
call npm install

echo.
echo 📦 安装服务器依赖...
cd server
call npm install
cd ..

echo ✅ 依赖安装完成

:: 检查端口占用
echo.
echo 🔍 检查端口占用...
netstat -an | find ":8787" >nul
if not errorlevel 1 (
    echo ⚠️  端口 8787 已被占用，请手动关闭相关程序
)

netstat -an | find ":8080" >nul
if not errorlevel 1 (
    echo ⚠️  端口 8080 已被占用，请手动关闭相关程序
)

:: 启动服务器
echo.
echo 🚀 启动游戏服务器 (端口 8787)...
cd server
start "Dragon Sons Server" cmd /k "npm start"
cd ..

:: 等待服务器启动
echo ⏳ 等待服务器启动...
timeout /t 3 /nobreak >nul

:: 检查服务器状态
curl -s http://localhost:8787/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 服务器启动失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 服务器启动成功

:: 启动客户端
echo.
echo 🌐 启动Web客户端 (端口 8080)...
cd client

:: 检查serve命令
where serve >nul 2>&1
if errorlevel 1 (
    echo 📦 安装 serve...
    call npm install -g serve
)

start "Dragon Sons Client" cmd /k "npx serve . -p 8080"
cd ..

:: 等待客户端启动
echo ⏳ 等待客户端启动...
timeout /t 2 /nobreak >nul

:: 检查客户端状态
curl -s http://localhost:8080 >nul 2>&1
if errorlevel 1 (
    echo ❌ 客户端启动失败
    pause
    exit /b 1
)

echo ✅ 客户端启动成功

:: 启动成功提示
echo.
echo 🎉 游戏启动成功！
echo ==================================
echo 🎮 游戏地址:     http://localhost:8080
echo 🛠️  资源生成:     http://localhost:8080/generate-assets.html
echo 🧪 功能测试:     http://localhost:8080/test.html
echo 📊 服务器状态:   http://localhost:8787/health
echo.
echo ⌨️  操作说明:
echo    移动: WASD
echo    技能: QWER
echo    道具: 123
echo    排行榜: Tab
echo    聊天: Enter
echo.
echo 🛑 停止游戏: 关闭命令行窗口或运行 stop-game.bat

:: 自动打开浏览器
timeout /t 1 /nobreak >nul
start http://localhost:8080

echo.
echo ⏳ 游戏运行中... (关闭此窗口将停止游戏)
pause