#!/usr/bin/env node

/**
 * NPX 功能测试脚本
 * 验证 document-conversion-mcp 包的 npx 功能是否正常
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NPXTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '📋';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testNPXCommand() {
    this.log('开始测试 NPX 命令...', 'info');
    
    return new Promise((resolve) => {
      const child = spawn('npx', ['document-conversion-mcp'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let hasOutput = false;

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (!hasOutput) {
          hasOutput = true;
          this.log('NPX 命令成功启动', 'success');
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // 给命令一些时间启动
      setTimeout(() => {
        child.kill('SIGTERM');
        
        if (hasOutput && stdout.includes('Unified Document Conversion MCP Tools Server')) {
          this.log('NPX 测试通过：服务器成功启动', 'success');
          resolve({ success: true, stdout, stderr });
        } else {
          this.log('NPX 测试失败：服务器未正常启动', 'error');
          this.log(`STDOUT: ${stdout}`, 'error');
          this.log(`STDERR: ${stderr}`, 'error');
          resolve({ success: false, stdout, stderr });
        }
      }, 3000);

      child.on('error', (error) => {
        this.log(`NPX 命令执行错误: ${error.message}`, 'error');
        resolve({ success: false, error: error.message });
      });
    });
  }

  async testPackageJSON() {
    this.log('检查 package.json 配置...', 'info');
    
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const { default: fs } = await import('fs/promises');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      // 检查 bin 配置
      if (packageJson.bin && packageJson.bin['document-conversion-mcp']) {
        this.log('✓ bin 配置正确', 'success');
      } else {
        this.log('✗ bin 配置缺失或错误', 'error');
        return false;
      }

      // 检查 files 配置
      if (packageJson.files && Array.isArray(packageJson.files)) {
        this.log('✓ files 配置存在', 'success');
      } else {
        this.log('✗ files 配置缺失', 'warning');
      }

      // 检查 engines 配置
      if (packageJson.engines && packageJson.engines.node) {
        this.log('✓ Node.js 版本要求已设置', 'success');
      } else {
        this.log('✗ Node.js 版本要求未设置', 'warning');
      }

      return true;
    } catch (error) {
      this.log(`package.json 检查失败: ${error.message}`, 'error');
      return false;
    }
  }

  async testBinFile() {
    this.log('检查 bin 文件...', 'info');
    
    try {
      const { default: fs } = await import('fs/promises');
      const binPath = path.join(__dirname, 'mcp-tools.js');
      
      // 检查文件是否存在
      await fs.access(binPath);
      this.log('✓ mcp-tools.js 文件存在', 'success');
      
      // 检查 shebang
      const content = await fs.readFile(binPath, 'utf8');
      if (content.startsWith('#!/usr/bin/env node')) {
        this.log('✓ shebang 配置正确', 'success');
      } else {
        this.log('✗ shebang 配置错误或缺失', 'error');
        return false;
      }
      
      return true;
    } catch (error) {
      this.log(`bin 文件检查失败: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 开始 NPX 功能完整测试', 'info');
    this.log('=' * 50, 'info');
    
    const results = {
      packageJson: await this.testPackageJSON(),
      binFile: await this.testBinFile(),
      npxCommand: await this.testNPXCommand()
    };
    
    this.log('=' * 50, 'info');
    this.log('📊 测试结果汇总:', 'info');
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result.success !== false ? '✅ 通过' : '❌ 失败';
      this.log(`  ${test}: ${status}`);
    });
    
    const allPassed = Object.values(results).every(r => r.success !== false);
    
    if (allPassed) {
      this.log('🎉 所有测试通过！NPX 功能正常', 'success');
      this.log('💡 可以使用以下命令测试:', 'info');
      this.log('   npx document-conversion-mcp', 'info');
    } else {
      this.log('⚠️  部分测试失败，请检查配置', 'warning');
    }
    
    return allPassed;
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new NPXTester();
  tester.runAllTests().catch(console.error);
}

export default NPXTester;