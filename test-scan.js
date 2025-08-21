#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function testScan() {
    const assetsDir = path.join(__dirname, 'client', 'assets');
    console.log('Assets dir:', assetsDir);
    
    try {
        // 测试扫描sounds目录
        console.log('\n=== 扫描sounds目录 ===');
        const soundsDir = path.join(assetsDir, 'sounds');
        const soundsItems = await fs.readdir(soundsDir, { withFileTypes: true });
        
        for (const item of soundsItems) {
            if (item.isDirectory()) {
                const subDir = path.join(soundsDir, item.name);
                const subItems = await fs.readdir(subDir, { withFileTypes: true });
                const wavFiles = subItems.filter(item => item.name.endsWith('.wav'));
                console.log(`${item.name}: ${wavFiles.length}个WAV文件`);
            }
        }
        
        // 测试扫描images目录
        console.log('\n=== 扫描images目录 ===');
        const imagesDir = path.join(assetsDir, 'images');
        const imagesItems = await fs.readdir(imagesDir, { withFileTypes: true });
        
        for (const item of imagesItems) {
            if (item.isDirectory()) {
                const subDir = path.join(imagesDir, item.name);
                const subItems = await fs.readdir(subDir, { withFileTypes: true });
                const pngFiles = subItems.filter(item => item.name.endsWith('.png'));
                console.log(`${item.name}: ${pngFiles.length}个PNG文件`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testScan();