#!/usr/bin/env node

/**
 * Document Conversion MCP 使用示例
 * 这个文件展示了如何使用各种转换功能
 */

import { DocumentConverter } from '../src/converter.js';
import { validateFile, getSupportedFormats } from '../src/utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExampleUsage {
  constructor() {
    this.converter = new DocumentConverter();
    this.inputDir = path.join(__dirname, 'input');
    this.outputDir = path.join(__dirname, 'output');
  }

  async runExamples() {
    console.log('🚀 Document Conversion MCP 使用示例');
    console.log('=' .repeat(50));

    // 显示支持的格式
    await this.showSupportedFormats();

    // 示例1: 创建示例文档
    await this.createSampleDocuments();

    // 示例2: 文本转换
    await this.textConversionExamples();

    // 示例3: 获取文档信息
    await this.documentInfoExamples();

    // 示例4: 批量转换
    await this.batchConversionExample();

    console.log('\n✅ 所有示例执行完成！');
    console.log('📁 查看输出文件: ' + this.outputDir);
  }

  async showSupportedFormats() {
    console.log('\n📋 支持的文档格式:');
    const formats = getSupportedFormats();
    
    console.log('\n输入格式:');
    formats.inputFormats.forEach(format => {
      console.log(`  ${format.format}: ${format.description} (${format.extensions.join(', ')})`);
    });

    console.log('\n输出格式:');
    formats.outputFormats.forEach(format => {
      console.log(`  ${format.format}: ${format.description}`);
    });
  }

  async createSampleDocuments() {
    console.log('\n📝 创建示例文档...');

    // 创建示例文本文件
    const sampleText = `# 示例文档

这是一个示例文档，用于演示文档转换功能。

## 功能特性

- 支持多种文档格式
- 高质量转换
- 批量处理
- 易于使用

## 技术栈

1. Node.js
2. MCP协议
3. 各种文档处理库

**注意**: 这只是一个演示文档。

---

*Document Conversion MCP* - 让文档转换变得简单！`;

    const sampleTextPath = path.join(this.inputDir, 'sample.txt');
    const fs = await import('fs/promises');
    await fs.mkdir(this.inputDir, { recursive: true });
    await fs.writeFile(sampleTextPath, sampleText, 'utf8');
    console.log('   ✓ 创建示例文本文件: sample.txt');

    // 创建示例Markdown文件
    const sampleMdPath = path.join(this.inputDir, 'sample.md');
    await fs.writeFile(sampleMdPath, sampleText, 'utf8');
    console.log('   ✓ 创建示例Markdown文件: sample.md');

    // 创建示例JSON文件
    const sampleJson = {
      title: '文档转换示例数据',
      documents: [
        { name: 'report.pdf', type: 'pdf', size: '2.5MB' },
        { name: 'presentation.pptx', type: 'powerpoint', size: '5.1MB' },
        { name: 'data.xlsx', type: 'excel', size: '1.2MB' }
      ],
      conversion_stats: {
        total_conversions: 1250,
        success_rate: 98.5,
        average_time: '2.3s'
      }
    };

    const sampleJsonPath = path.join(this.inputDir, 'sample.json');
    await fs.writeFile(sampleJsonPath, JSON.stringify(sampleJson, null, 2), 'utf8');
    console.log('   ✓ 创建示例JSON文件: sample.json');
  }

  async textConversionExamples() {
    console.log('\n🔄 文档转换示例...');
    await import('fs/promises').then(fs => fs.mkdir(this.outputDir, { recursive: true }));

    const examples = [
      {
        name: '文本转HTML',
        input: path.join(this.inputDir, 'sample.txt'),
        output: path.join(this.outputDir, 'sample_from_txt.html'),
        format: 'html'
      },
      {
        name: '文本转Markdown',
        input: path.join(this.inputDir, 'sample.txt'),
        output: path.join(this.outputDir, 'sample_from_txt.md'),
        format: 'md'
      },
      {
        name: 'Markdown转HTML',
        input: path.join(this.inputDir, 'sample.md'),
        output: path.join(this.outputDir, 'sample_from_md.html'),
        format: 'html'
      },
      {
        name: 'JSON转HTML',
        input: path.join(this.inputDir, 'sample.json'),
        output: path.join(this.outputDir, 'sample_data.html'),
        format: 'html'
      }
    ];

    for (const example of examples) {
      try {
        console.log(`   🔄 ${example.name}...`);
        
        // 验证输入文件
        const validation = await validateFile(example.input);
        if (!validation.valid) {
          console.log(`   ❌ ${example.name}: ${validation.error}`);
          continue;
        }

        // 执行转换（第一次，可能无缓存）
        const result1 = await this.converter.convert(
          example.input,
          example.output,
          example.format
        );
        console.log(`   ✅ ${example.name} (第一次): ${result1.message}`);

        // 执行相同转换（应命中缓存）
        const tempOutput = example.output.replace('.html', '_temp.html');
        const result2 = await this.converter.convert(
          example.input,
          tempOutput,
          example.format
        );
        console.log(`   ✅ ${example.name} (第二次，缓存): ${result2.message}`);
      } catch (error) {
        console.log(`   ❌ ${example.name}: ${error.message}`);
      }
    }
  }

  async documentInfoExamples() {
    console.log('\n📊 文档信息示例...');

    const files = [
      path.join(this.inputDir, 'sample.txt'),
      path.join(this.inputDir, 'sample.md'),
      path.join(this.inputDir, 'sample.json')
    ];

    for (const file of files) {
      try {
        console.log(`\n   📄 ${path.basename(file)}:`);
        const info = await this.converter.getDocumentInfo(file);
        
        console.log(`      大小: ${this.formatFileSize(info.size)}`);
        console.log(`      类型: ${info.mimeType}`);
        console.log(`      修改时间: ${info.modified.toLocaleString()}`);
        
        if (info.textLength) {
          console.log(`      文本长度: ${info.textLength} 字符`);
        }
        if (info.pages) {
          console.log(`      页数: ${info.pages}`);
        }
        if (info.sheets) {
          console.log(`      工作表: ${info.sheets.join(', ')}`);
        }
      } catch (error) {
        console.log(`   ❌ 获取 ${path.basename(file)} 信息失败: ${error.message}`);
      }
    }
  }

  async batchConversionExample() {
    console.log('\n📦 批量转换示例...');

    try {
      const results = await this.converter.batchConvert(
        this.inputDir,
        path.join(this.outputDir, 'batch'),
        'html'
      );

      console.log(`   ✅ 批量转换完成:`);
      console.log(`      成功: ${results.success} 个文件`);
      console.log(`      失败: ${results.failed} 个文件`);
      
      if (results.details.length > 0) {
        console.log('   详细结果:');
        results.details.forEach(detail => {
          console.log(`      ${detail}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ 批量转换失败: ${error.message}`);
    }
  }

  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  const examples = new ExampleUsage();
  examples.runExamples().catch(console.error);
}

export { ExampleUsage };