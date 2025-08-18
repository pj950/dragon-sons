@echo off
chcp 65001 >nul
title 停止龙生九子·五行对战

echo 🛑 正在停止龙生九子·五行对战...

:: 杀死相关进程
echo 🔄 清理游戏进程...
taskkill /f /im node.exe 2>nul
taskkill /f /im serve.exe 2>nul

:: 等待进程结束
timeout /t 2 /nobreak >nul

:: 检查端口释放
echo 🔍 检查端口状态...
netstat -an | find ":8787" >nul
if errorlevel 1 (
    echo ✅ 端口 8787 已释放
) else (
    echo ⚠️  端口 8787 仍被占用
)

netstat -an | find ":8080" >nul
if errorlevel 1 (
    echo ✅ 端口 8080 已释放
) else (
    echo ⚠️  端口 8080 仍被占用
)

echo ✅ 游戏已停止

pause