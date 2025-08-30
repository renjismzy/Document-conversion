#!/usr/bin/env node

/**
 * Document Conversion MCP 性能测试脚本
 * 测量转换时间、缓存效率等性能指标
 */

import { DocumentConverter } from './src/converter.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTester {
  constructor() {
    this.converter = new DocumentConverter();
    this.testDir = path.join(__dirname, 'test-files');
    this.outputDir = path.join(__dirname, 'perf-output');
    this.testFile = path.join(this.testDir, 'perf-test.md');
  }

  async setup() {
    await fs.mkdir(this.testDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.writeFile(this.testFile, '# Performance Test\n\nThis is a test document for performance measurement.', 'utf8');
  }

  async cleanup() {
    await fs.rm(this.outputDir, { recursive: true, force: true });
  }

  async measureConversionTime(format, runs = 5) {
    const times = [];
    for (let i = 0; i < runs; i++) {
      const outputFile = path.join(this.outputDir, `perf-${format}-${i}.html`);
      const start = performance.now();
      await this.converter.convert(this.testFile, outputFile, format);
      const end = performance.now();
      times.push(end - start);
      if (i > 0) await fs.unlink(outputFile); // 清理除最后一个外的文件
    }
    const avg = times.reduce((a, b) => a + b, 0) / runs;
    console.log(`平均转换时间到 ${format}: ${avg.toFixed(2)} ms (过 ${runs} 次运行)`);
    return avg;
  }

  async testCacheEfficiency() {
    console.log('\n测试缓存效率:');
    await this.measureConversionTime('html', 3); // 第一次无缓存，后续应命中缓存
  }

  async testStressConversion(concurrency = 10) {
    console.log(`\n压力测试: ${concurrency} 个并发转换`);
    const promises = [];
    const start = performance.now();
    for (let i = 0; i < concurrency; i++) {
      const outputFile = path.join(this.outputDir, `stress-${i}.html`);
      promises.push(this.converter.convert(this.testFile, outputFile, 'html'));
    }
    await Promise.all(promises);
    const end = performance.now();
    console.log(`完成 ${concurrency} 个并发转换，用时: ${(end - start).toFixed(2)} ms`);
  }

  async runAllPerfTests() {
    console.log('🚀 Document Conversion MCP 性能测试');
    await this.setup();

    await this.testCacheEfficiency();
    await this.testStressConversion(20);
    // 添加更多性能测试...

    await this.cleanup();
    console.log('性能测试完成');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  tester.runAllPerfTests().catch(console.error);
}