#!/usr/bin/env node

// 龙生九子·五行对战 - 资源状态检查脚本

const fs = require('fs').promises;
const path = require('path');

class AssetChecker {
    constructor() {
        this.assetsDir = path.join(__dirname, 'client', 'assets');
    }

    // 检查资源目录结构
    async checkDirectoryStructure() {
        console.log('📁 检查目录结构...');
        
        const requiredDirs = [
            'sounds/skills/metal',
            'sounds/skills/wood',
            'sounds/skills/water',
            'sounds/skills/fire',
            'sounds/skills/earth',
            'sounds/ui',
            'sounds/ambient',
            'images/skills',
            'images/items',
            'images/fruits',
            'images/characters',
            'images/ui'
        ];

        let missingDirs = [];
        for (const dir of requiredDirs) {
            const fullPath = path.join(this.assetsDir, dir);
            try {
                await fs.access(fullPath);
                console.log(`✅ ${dir}`);
            } catch (error) {
                console.log(`❌ ${dir} - 缺失`);
                missingDirs.push(dir);
            }
        }

        if (missingDirs.length > 0) {
            console.log(`⚠️  缺失目录: ${missingDirs.length}个`);
        } else {
            console.log('✅ 所有必需目录都存在');
        }

        return missingDirs.length === 0;
    }

    // 检查音效文件
    async checkAudioFiles() {
        console.log('\n🎵 检查音效文件...');
        
        const audioExtensions = ['.wav', '.mp3', '.ogg'];
        let audioFiles = [];
        
        try {
            const scanDirectory = async (dir) => {
                const items = await fs.readdir(dir, { withFileTypes: true });
                const files = [];
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        const subFiles = await scanDirectory(fullPath);
                        files.push(...subFiles);
                    } else if (audioExtensions.some(ext => item.name.endsWith(ext))) {
                        const relativePath = path.relative(this.assetsDir, fullPath);
                        files.push(relativePath);
                    }
                }
                return files;
            };

            audioFiles = await scanDirectory(path.join(this.assetsDir, 'sounds'));
            
            console.log(`📊 音效文件总数: ${audioFiles.length}`);
            
            // 按类别统计
            const categories = {};
            for (const file of audioFiles) {
                const category = file.split('/')[1] || 'unknown';
                categories[category] = (categories[category] || 0) + 1;
            }
            
            for (const [category, count] of Object.entries(categories)) {
                console.log(`   ${category}: ${count}个文件`);
            }
            
            return audioFiles.length;
        } catch (error) {
            console.error('❌ 扫描音效文件失败:', error);
            return 0;
        }
    }

    // 检查图像文件
    async checkImageFiles() {
        console.log('\n🎨 检查图像文件...');
        
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
        let imageFiles = [];
        
        try {
            const scanDirectory = async (dir) => {
                const items = await fs.readdir(dir, { withFileTypes: true });
                const files = [];
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        const subFiles = await scanDirectory(fullPath);
                        files.push(...subFiles);
                    } else if (imageExtensions.some(ext => item.name.endsWith(ext))) {
                        const relativePath = path.relative(this.assetsDir, fullPath);
                        files.push(relativePath);
                    }
                }
                return files;
            };

            imageFiles = await scanDirectory(path.join(this.assetsDir, 'images'));
            
            console.log(`📊 图像文件总数: ${imageFiles.length}`);
            
            // 按类别统计
            const categories = {};
            for (const file of imageFiles) {
                const category = file.split('/')[1] || 'unknown';
                categories[category] = (categories[category] || 0) + 1;
            }
            
            for (const [category, count] of Object.entries(categories)) {
                console.log(`   ${category}: ${count}个文件`);
            }
            
            return imageFiles.length;
        } catch (error) {
            console.error('❌ 扫描图像文件失败:', error);
            return 0;
        }
    }

    // 检查配置文件
    async checkConfigFiles() {
        console.log('\n⚙️ 检查配置文件...');
        
        const configFiles = [
            'manifest.json',
            'game-config.json',
            'README.md'
        ];

        let existingConfigs = 0;
        for (const file of configFiles) {
            const filePath = path.join(this.assetsDir, file);
            try {
                await fs.access(filePath);
                console.log(`✅ ${file}`);
                existingConfigs++;
            } catch (error) {
                console.log(`❌ ${file} - 缺失`);
            }
        }

        return existingConfigs;
    }

    // 检查文件大小
    async checkFileSizes() {
        console.log('\n📏 检查文件大小...');
        
        try {
            const stats = await fs.stat(this.assetsDir);
            const totalSize = await this.calculateDirectorySize(this.assetsDir);
            
            console.log(`📁 资源目录总大小: ${this.formatBytes(totalSize)}`);
            
            // 检查是否有异常大的文件
            const largeFiles = await this.findLargeFiles(this.assetsDir, 1024 * 1024); // 1MB
            if (largeFiles.length > 0) {
                console.log('⚠️  发现大文件:');
                for (const file of largeFiles) {
                    console.log(`   ${file.path}: ${this.formatBytes(file.size)}`);
                }
            }
            
        } catch (error) {
            console.error('❌ 检查文件大小失败:', error);
        }
    }

    // 计算目录大小
    async calculateDirectorySize(dir) {
        let totalSize = 0;
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    totalSize += await this.calculateDirectorySize(fullPath);
                } else {
                    const stats = await fs.stat(fullPath);
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            // 忽略错误
        }
        return totalSize;
    }

    // 查找大文件
    async findLargeFiles(dir, threshold) {
        const largeFiles = [];
        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    largeFiles.push(...await this.findLargeFiles(fullPath, threshold));
                } else {
                    const stats = await fs.stat(fullPath);
                    if (stats.size > threshold) {
                        largeFiles.push({
                            path: path.relative(this.assetsDir, fullPath),
                            size: stats.size
                        });
                    }
                }
            }
        } catch (error) {
            // 忽略错误
        }
        return largeFiles;
    }

    // 格式化字节数
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 生成资源报告
    async generateReport() {
        console.log('🚀 龙生九子·五行对战 - 资源状态检查');
        console.log('=====================================');
        
        const startTime = Date.now();
        
        try {
            // 检查目录结构
            const dirsOk = await this.checkDirectoryStructure();
            
            // 检查音效文件
            const audioCount = await this.checkAudioFiles();
            
            // 检查图像文件
            const imageCount = await this.checkImageFiles();
            
            // 检查配置文件
            const configCount = await this.checkConfigFiles();
            
            // 检查文件大小
            await this.checkFileSizes();
            
            // 生成总结
            console.log('\n📊 资源状态总结');
            console.log('=====================================');
            console.log(`✅ 目录结构: ${dirsOk ? '完整' : '不完整'}`);
            console.log(`🎵 音效文件: ${audioCount}个`);
            console.log(`🎨 图像文件: ${imageCount}个`);
            console.log(`⚙️ 配置文件: ${configCount}个`);
            console.log(`📁 总文件数: ${audioCount + imageCount + configCount}个`);
            
            const totalTime = Date.now() - startTime;
            console.log(`⏱️  检查耗时: ${totalTime}ms`);
            
            if (dirsOk && audioCount > 0 && imageCount > 0) {
                console.log('\n🎉 资源状态良好！游戏可以正常运行。');
            } else {
                console.log('\n⚠️  资源状态不完整，建议重新生成资源。');
            }
            
        } catch (error) {
            console.error('❌ 资源检查失败:', error);
        }
    }
}

// 主函数
async function main() {
    const checker = new AssetChecker();
    await checker.generateReport();
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AssetChecker;