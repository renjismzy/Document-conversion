#!/usr/bin/env node

/**
 * Document Conversion MCP Server 启动脚本
 * 这个脚本提供了一个简单的方式来启动MCP服务器
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'src', 'index.js');

console.log('🚀 启动 Document Conversion MCP Server...');
console.log(`📁 服务器路径: ${serverPath}`);
console.log('📋 支持的转换格式:');
console.log('   输入: PDF, Word, Excel, PowerPoint, Markdown, HTML, 文本, CSV, JSON');
console.log('   输出: PDF, Word, Excel, PowerPoint, HTML, Markdown, 文本, CSV, JSON, PNG, JPG');
console.log('\n💡 使用方法:');
console.log('   1. convert_document - 转换单个文档');
console.log('   2. get_document_info - 获取文档信息');
console.log('   3. list_supported_formats - 查看支持的格式');
console.log('   4. batch_convert - 批量转换文档');
console.log('\n' + '='.repeat(50));

// 启动服务器
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ 服务器启动失败:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ 服务器异常退出，退出码: ${code}`);
  } else {
    console.log('✅ 服务器正常退出');
  }
  process.exit(code);
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭服务器...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在关闭服务器...');
  server.kill('SIGTERM');
});