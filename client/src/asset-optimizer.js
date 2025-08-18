// 龙生九子·五行对战 - 资源优化器

class AssetOptimizer {
    constructor() {
        this.compressionSettings = {
            audio: {
                quality: 0.8,
                format: 'wav', // 可选: wav, ogg, mp3
                sampleRate: 44100,
                bitRate: 128
            },
            images: {
                quality: 0.9,
                format: 'png', // 可选: png, jpg, webp
                maxSize: 1024 // 最大尺寸
            }
        };
        
        this.optimizedAssets = new Map();
    }

    // 优化音频文件
    async optimizeAudio(audioBuffer, filename) {
        try {
            // 音频压缩和格式转换
            const optimized = await this.compressAudio(audioBuffer);
            
            // 生成优化后的文件
            const blob = this.audioBufferToBlob(optimized, this.compressionSettings.audio.format);
            const url = URL.createObjectURL(blob);
            
            this.optimizedAssets.set(filename, {
                type: 'audio',
                original: audioBuffer,
                optimized: optimized,
                blob: blob,
                url: url,
                size: blob.size,
                compression: this.calculateCompressionRatio(audioBuffer, blob)
            });
            
            return url;
        } catch (error) {
            console.error('Audio optimization failed:', error);
            throw error;
        }
    }

    // 压缩音频
    async compressAudio(audioBuffer) {
        const settings = this.compressionSettings.audio;
        
        // 重采样（如果需要）
        let optimizedBuffer = audioBuffer;
        if (audioBuffer.sampleRate !== settings.sampleRate) {
            optimizedBuffer = await this.resampleAudio(audioBuffer, settings.sampleRate);
        }
        
        // 动态范围压缩
        optimizedBuffer = this.compressDynamicRange(optimizedBuffer);
        
        // 噪声门限
        optimizedBuffer = this.applyNoiseGate(optimizedBuffer);
        
        return optimizedBuffer;
    }

    // 重采样音频
    async resampleAudio(audioBuffer, targetSampleRate) {
        const ratio = targetSampleRate / audioBuffer.sampleRate;
        const newLength = Math.floor(audioBuffer.length * ratio);
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const newBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            newLength,
            targetSampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < newLength; i++) {
                const index = i / ratio;
                const indexFloor = Math.floor(index);
                const indexCeil = Math.min(indexFloor + 1, oldData.length - 1);
                const fraction = index - indexFloor;
                
                newData[i] = oldData[indexFloor] * (1 - fraction) + oldData[indexCeil] * fraction;
            }
        }
        
        return newBuffer;
    }

    // 动态范围压缩
    compressDynamicRange(audioBuffer, threshold = 0.8, ratio = 4) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const newBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < oldData.length; i++) {
                let sample = oldData[i];
                const amplitude = Math.abs(sample);
                
                if (amplitude > threshold) {
                    const excess = amplitude - threshold;
                    const compressedExcess = excess / ratio;
                    const newAmplitude = threshold + compressedExcess;
                    sample = sample > 0 ? newAmplitude : -newAmplitude;
                }
                
                newData[i] = sample;
            }
        }
        
        return newBuffer;
    }

    // 噪声门限
    applyNoiseGate(audioBuffer, threshold = 0.01) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const newBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            
            for (let i = 0; i < oldData.length; i++) {
                const sample = oldData[i];
                newData[i] = Math.abs(sample) > threshold ? sample : 0;
            }
        }
        
        return newBuffer;
    }

    // AudioBuffer转Blob
    audioBufferToBlob(audioBuffer, format = 'wav') {
        if (format === 'wav') {
            return this.audioBufferToWavBlob(audioBuffer);
        }
        // 其他格式可以在这里扩展
        return this.audioBufferToWavBlob(audioBuffer);
    }

    // AudioBuffer转WAV Blob
    audioBufferToWavBlob(audioBuffer) {
        const length = audioBuffer.length;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV文件头
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // 音频数据
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // 优化图像
    async optimizeImage(imageData, filename) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 获取原始图像
            const img = await this.dataURLToImage(imageData);
            
            // 计算优化后的尺寸
            const { width, height } = this.calculateOptimalSize(img.width, img.height);
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制优化后的图像
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为优化格式
            const format = this.compressionSettings.images.format;
            const quality = this.compressionSettings.images.quality;
            
            let optimizedDataURL;
            if (format === 'jpg' || format === 'jpeg') {
                optimizedDataURL = canvas.toDataURL('image/jpeg', quality);
            } else if (format === 'webp') {
                optimizedDataURL = canvas.toDataURL('image/webp', quality);
            } else {
                optimizedDataURL = canvas.toDataURL('image/png');
            }
            
            // 转换为Blob
            const blob = await this.dataURLToBlob(optimizedDataURL);
            const url = URL.createObjectURL(blob);
            
            this.optimizedAssets.set(filename, {
                type: 'image',
                original: imageData,
                optimized: optimizedDataURL,
                blob: blob,
                url: url,
                size: blob.size,
                dimensions: { width, height },
                compression: this.calculateImageCompressionRatio(imageData, blob)
            });
            
            return url;
        } catch (error) {
            console.error('Image optimization failed:', error);
            throw error;
        }
    }

    // 计算最优尺寸
    calculateOptimalSize(originalWidth, originalHeight) {
        const maxSize = this.compressionSettings.images.maxSize;
        
        if (originalWidth <= maxSize && originalHeight <= maxSize) {
            return { width: originalWidth, height: originalHeight };
        }
        
        const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);
        return {
            width: Math.floor(originalWidth * ratio),
            height: Math.floor(originalHeight * ratio)
        };
    }

    // DataURL转Image
    dataURLToImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    // DataURL转Blob
    async dataURLToBlob(dataURL) {
        const response = await fetch(dataURL);
        return response.blob();
    }

    // 计算压缩比
    calculateCompressionRatio(original, compressed) {
        const originalSize = this.getAudioBufferSize(original);
        const compressedSize = compressed.size;
        return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    }

    // 计算图像压缩比
    calculateImageCompressionRatio(originalDataURL, compressedBlob) {
        const originalSize = originalDataURL.length;
        const compressedSize = compressedBlob.size;
        return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    }

    // 获取AudioBuffer大小估算
    getAudioBufferSize(audioBuffer) {
        return audioBuffer.length * audioBuffer.numberOfChannels * 2; // 16-bit PCM
    }

    // 批量优化资源
    async optimizeAllAssets(assets) {
        const optimized = new Map();
        let completed = 0;
        const total = assets.sounds.size + assets.icons.size + assets.items.size + assets.ui.size;
        
        console.log(`开始优化 ${total} 个资源文件...`);
        
        // 优化音效
        for (const [filename, audioBuffer] of assets.sounds) {
            try {
                const optimizedUrl = await this.optimizeAudio(audioBuffer, filename);
                optimized.set(filename, optimizedUrl);
                completed++;
                console.log(`✅ 音效优化: ${filename} (${completed}/${total})`);
            } catch (error) {
                console.error(`❌ 音效优化失败: ${filename}`, error);
            }
        }
        
        // 优化图标
        for (const [filename, imageData] of assets.icons) {
            try {
                const optimizedUrl = await this.optimizeImage(imageData, filename);
                optimized.set(filename, optimizedUrl);
                completed++;
                console.log(`✅ 图标优化: ${filename} (${completed}/${total})`);
            } catch (error) {
                console.error(`❌ 图标优化失败: ${filename}`, error);
            }
        }
        
        // 优化道具图标
        for (const [filename, imageData] of assets.items) {
            try {
                const optimizedUrl = await this.optimizeImage(imageData, filename);
                optimized.set(filename, optimizedUrl);
                completed++;
                console.log(`✅ 道具图标优化: ${filename} (${completed}/${total})`);
            } catch (error) {
                console.error(`❌ 道具图标优化失败: ${filename}`, error);
            }
        }
        
        // 优化UI资源
        for (const [filename, imageData] of assets.ui) {
            try {
                const optimizedUrl = await this.optimizeImage(imageData, filename);
                optimized.set(filename, optimizedUrl);
                completed++;
                console.log(`✅ UI资源优化: ${filename} (${completed}/${total})`);
            } catch (error) {
                console.error(`❌ UI资源优化失败: ${filename}`, error);
            }
        }
        
        console.log(`资源优化完成: ${optimized.size}/${total}`);
        return optimized;
    }

    // 生成资源清单
    generateManifest(assets) {
        const manifest = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            assets: {
                sounds: [],
                images: []
            },
            stats: {
                totalFiles: 0,
                totalSize: 0,
                compressionRatio: 0
            }
        };
        
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        
        // 处理资源信息
        this.optimizedAssets.forEach((assetData, filename) => {
            const assetInfo = {
                filename: filename,
                size: assetData.size,
                compression: assetData.compression,
                url: assetData.url
            };
            
            if (assetData.type === 'audio') {
                manifest.assets.sounds.push(assetInfo);
            } else {
                manifest.assets.images.push(assetInfo);
            }
            
            totalCompressedSize += assetData.size;
            manifest.stats.totalFiles++;
        });
        
        manifest.stats.totalSize = totalCompressedSize;
        manifest.stats.compressionRatio = totalOriginalSize > 0 ? 
            ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1) : 0;
        
        return manifest;
    }

    // 创建资源包
    async createAssetPack(assets, packName = 'dragon-sons-assets') {
        console.log('创建资源包...');
        
        // 优化所有资源
        const optimizedAssets = await this.optimizeAllAssets(assets);
        
        // 生成清单
        const manifest = this.generateManifest(optimizedAssets);
        
        // 创建ZIP包（简化版，实际应该使用JSZip库）
        const packData = {
            manifest: manifest,
            assets: Array.from(this.optimizedAssets.entries()).map(([filename, data]) => ({
                filename: filename,
                url: data.url,
                size: data.size
            }))
        };
        
        // 保存为JSON文件
        const packBlob = new Blob([JSON.stringify(packData, null, 2)], { 
            type: 'application/json' 
        });
        const packUrl = URL.createObjectURL(packBlob);
        
        // 下载清单文件
        const a = document.createElement('a');
        a.href = packUrl;
        a.download = `${packName}-manifest.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log('资源包创建完成');
        return packData;
    }

    // 获取优化统计
    getOptimizationStats() {
        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;
        let audioCount = 0;
        let imageCount = 0;
        
        this.optimizedAssets.forEach((data) => {
            totalOptimizedSize += data.size;
            
            if (data.type === 'audio') {
                audioCount++;
                totalOriginalSize += this.getAudioBufferSize(data.original);
            } else {
                imageCount++;
                totalOriginalSize += data.original.length; // DataURL length approximation
            }
        });
        
        return {
            totalFiles: this.optimizedAssets.size,
            audioFiles: audioCount,
            imageFiles: imageCount,
            originalSize: totalOriginalSize,
            optimizedSize: totalOptimizedSize,
            compressionRatio: totalOriginalSize > 0 ? 
                ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1) : 0,
            sizeSaved: totalOriginalSize - totalOptimizedSize
        };
    }

    // 设置压缩质量
    setCompressionQuality(type, quality) {
        if (type === 'audio') {
            this.compressionSettings.audio.quality = MathUtils.clamp(quality, 0.1, 1.0);
        } else if (type === 'images') {
            this.compressionSettings.images.quality = MathUtils.clamp(quality, 0.1, 1.0);
        }
    }

    // 设置输出格式
    setOutputFormat(type, format) {
        if (type === 'audio') {
            this.compressionSettings.audio.format = format;
        } else if (type === 'images') {
            this.compressionSettings.images.format = format;
        }
    }

    // 清理优化资源
    cleanup() {
        this.optimizedAssets.forEach((data) => {
            URL.revokeObjectURL(data.url);
        });
        this.optimizedAssets.clear();
    }

    // 获取AudioBuffer大小
    getAudioBufferSize(audioBuffer) {
        return audioBuffer.length * audioBuffer.numberOfChannels * 2;
    }
}

// 创建全局资源优化器实例
window.AssetOptimizer = AssetOptimizer;