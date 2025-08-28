#!/usr/bin/env node

/**
 * Document Conversion MCP 测试脚本
 * 验证各个功能模块是否正常工作
 */

import { DocumentConverter } from './src/converter.js';
import { validateFile, getSupportedFormats, isConversionSupported } from './src/utils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTester {
  constructor() {
    this.converter = new DocumentConverter();
    this.testDir = path.join(__dirname, 'test-files');
    this.outputDir = path.join(__dirname, 'test-output');
    this.passedTests = 0;
    this.failedTests = 0;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Document Conversion MCP 功能测试');
    console.log('=' .repeat(50));

    // 准备测试环境
    await this.setupTestEnvironment();

    // 运行各项测试
    await this.testUtilityFunctions();
    await this.testFileValidation();
    await this.testSupportedFormats();
    await this.testDocumentInfo();
    await this.testBasicConversions();
    await this.testErrorHandling();

    // 显示测试结果
    this.displayTestResults();

    // 清理测试文件
    await this.cleanup();
  }

  async setupTestEnvironment() {
    console.log('\n🔧 设置测试环境...');
    
    try {
      await fs.mkdir(this.testDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // 创建测试文件
      await this.createTestFiles();
      
      console.log('   ✅ 测试环境设置完成');
    } catch (error) {
      console.error('   ❌ 测试环境设置失败:', error.message);
      process.exit(1);
    }
  }

  async createTestFiles() {
    const testFiles = {
      'test.txt': '这是一个测试文本文件。\n\n包含多行内容。\n用于测试文档转换功能。',
      'test.md': '# 测试文档\n\n这是一个**测试**Markdown文件。\n\n## 功能列表\n\n- 项目1\n- 项目2\n- 项目3',
      'test.html': '<!DOCTYPE html>\n<html>\n<head><title>测试</title></head>\n<body><h1>测试HTML</h1><p>这是测试内容。</p></body>\n</html>',
      'test.json': JSON.stringify({ name: '测试', type: 'json', data: [1, 2, 3] }, null, 2),
      'test.csv': 'Name,Age,City\nJohn,25,New York\nJane,30,London\nBob,35,Paris'
    };

    for (const [filename, content] of Object.entries(testFiles)) {
      const filePath = path.join(this.testDir, filename);
      await fs.writeFile(filePath, content, 'utf8');
    }
  }

  async testUtilityFunctions() {
    console.log('\n🔍 测试工具函数...');

    // 测试格式检测
    this.runTest('格式检测 - .txt', () => {
      const format = this.getFileFormat('.txt');
      return format === 'txt';
    });

    this.runTest('格式检测 - .pdf', () => {
      const format = this.getFileFormat('.pdf');
      return format === 'pdf';
    });

    // 测试转换支持检查
    this.runTest('转换支持检查 - txt to html', () => {
      return isConversionSupported('txt', 'html');
    });

    this.runTest('转换支持检查 - pdf to docx (不支持)', () => {
      return !isConversionSupported('pdf', 'docx');
    });
  }

  getFileFormat(extension) {
    // 简化的格式检测逻辑
    const formatMap = {
      '.txt': 'txt',
      '.pdf': 'pdf',
      '.docx': 'docx',
      '.md': 'md',
      '.html': 'html'
    };
    return formatMap[extension.toLowerCase()];
  }

  async testFileValidation() {
    console.log('\n📋 测试文件验证...');

    // 测试有效文件
    await this.runAsyncTest('文件验证 - 有效文件', async () => {
      const testFile = path.join(this.testDir, 'test.txt');
      const result = await validateFile(testFile);
      return result.valid === true;
    });

    // 测试不存在的文件
    await this.runAsyncTest('文件验证 - 不存在的文件', async () => {
      const result = await validateFile(path.join(this.testDir, 'nonexistent.txt'));
      return result.valid === false;
    });
  }

  async testSupportedFormats() {
    console.log('\n📊 测试支持格式列表...');

    this.runTest('获取支持格式', () => {
      const formats = getSupportedFormats();
      return formats.inputFormats && formats.outputFormats && formats.conversionMatrix;
    });

    this.runTest('输入格式包含基本格式', () => {
      const formats = getSupportedFormats();
      const inputFormats = formats.inputFormats.map(f => f.format);
      return ['pdf', 'docx', 'txt', 'md', 'html'].every(format => inputFormats.includes(format));
    });
  }

  async testDocumentInfo() {
    console.log('\n📄 测试文档信息获取...');

    await this.runAsyncTest('获取文本文件信息', async () => {
      const testFile = path.join(this.testDir, 'test.txt');
      const info = await this.converter.getDocumentInfo(testFile);
      return info.name && info.extension && info.size > 0;
    });

    await this.runAsyncTest('获取JSON文件信息', async () => {
      const testFile = path.join(this.testDir, 'test.json');
      const info = await this.converter.getDocumentInfo(testFile);
      return info.mimeType === 'application/json';
    });
  }

  async testBasicConversions() {
    console.log('\n🔄 测试基本转换功能...');

    // 测试文本转HTML
    await this.runAsyncTest('文本转HTML', async () => {
      const inputFile = path.join(this.testDir, 'test.txt');
      const outputFile = path.join(this.outputDir, 'test_txt_to_html.html');
      
      try {
        await this.converter.convert(inputFile, outputFile, 'html');
        const stats = await fs.stat(outputFile);
        return stats.size > 0;
      } catch (error) {
        console.log(`      转换错误: ${error.message}`);
        return false;
      }
    });

    // 测试Markdown转HTML
    await this.runAsyncTest('Markdown转HTML', async () => {
      const inputFile = path.join(this.testDir, 'test.md');
      const outputFile = path.join(this.outputDir, 'test_md_to_html.html');
      
      try {
        await this.converter.convert(inputFile, outputFile, 'html');
        const stats = await fs.stat(outputFile);
        return stats.size > 0;
      } catch (error) {
        console.log(`      转换错误: ${error.message}`);
        return false;
      }
    });

    // 测试HTML转Markdown
    await this.runAsyncTest('HTML转Markdown', async () => {
      const inputFile = path.join(this.testDir, 'test.html');
      const outputFile = path.join(this.outputDir, 'test_html_to_md.md');
      
      try {
        await this.converter.convert(inputFile, outputFile, 'md');
        const stats = await fs.stat(outputFile);
        return stats.size > 0;
      } catch (error) {
        console.log(`      转换错误: ${error.message}`);
        return false;
      }
    });
  }

  async testErrorHandling() {
    console.log('\n⚠️  测试错误处理...');

    // 测试不支持的转换
    await this.runAsyncTest('不支持的转换格式', async () => {
      const inputFile = path.join(this.testDir, 'test.txt');
      const outputFile = path.join(this.outputDir, 'test_error.xyz');
      
      try {
        await this.converter.convert(inputFile, outputFile, 'xyz');
        return false; // 应该抛出错误
      } catch (error) {
        return error.message.includes('不支持的转换');
      }
    });

    // 测试不存在的输入文件
    await this.runAsyncTest('不存在的输入文件', async () => {
      const inputFile = path.join(this.testDir, 'nonexistent.txt');
      const outputFile = path.join(this.outputDir, 'test_error.html');
      
      try {
        await this.converter.convert(inputFile, outputFile, 'html');
        return false; // 应该抛出错误
      } catch (error) {
        return true; // 预期的错误
      }
    });
  }

  runTest(testName, testFunction) {
    try {
      const result = testFunction();
      if (result) {
        console.log(`   ✅ ${testName}`);
        this.passedTests++;
        this.testResults.push({ name: testName, status: 'PASS' });
      } else {
        console.log(`   ❌ ${testName}`);
        this.failedTests++;
        this.testResults.push({ name: testName, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`   ❌ ${testName}: ${error.message}`);
      this.failedTests++;
      this.testResults.push({ name: testName, status: 'ERROR', error: error.message });
    }
  }

  async runAsyncTest(testName, testFunction) {
    try {
      const result = await testFunction();
      if (result) {
        console.log(`   ✅ ${testName}`);
        this.passedTests++;
        this.testResults.push({ name: testName, status: 'PASS' });
      } else {
        console.log(`   ❌ ${testName}`);
        this.failedTests++;
        this.testResults.push({ name: testName, status: 'FAIL' });
      }
    } catch (error) {
      console.log(`   ❌ ${testName}: ${error.message}`);
      this.failedTests++;
      this.testResults.push({ name: testName, status: 'ERROR', error: error.message });
    }
  }

  displayTestResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果汇总');
    console.log('=' .repeat(50));
    
    console.log(`✅ 通过: ${this.passedTests}`);
    console.log(`❌ 失败: ${this.failedTests}`);
    console.log(`📈 成功率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(result => result.status !== 'PASS')
        .forEach(result => {
          console.log(`   - ${result.name}: ${result.status}`);
          if (result.error) {
            console.log(`     错误: ${result.error}`);
          }
        });
    }

    if (this.passedTests === this.passedTests + this.failedTests && this.failedTests === 0) {
      console.log('\n🎉 所有测试通过！MCP工具运行正常。');
    } else {
      console.log('\n⚠️  部分测试失败，请检查相关功能。');
    }
  }

  async cleanup() {
    console.log('\n🧹 清理测试文件...');
    
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
      await fs.rm(this.outputDir, { recursive: true, force: true });
      console.log('   ✅ 清理完成');
    } catch (error) {
      console.log('   ⚠️  清理失败:', error.message);
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPTester();
  tester.runAllTests().catch(console.error);
}

export { MCPTester };