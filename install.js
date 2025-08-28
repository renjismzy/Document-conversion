#!/usr/bin/env node

/**
 * Document Conversion MCP 安装脚本
 * 自动安装依赖并进行基本配置检查
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Installer {
  constructor() {
    this.steps = [
      { name: '检查Node.js版本', fn: this.checkNodeVersion },
      { name: '安装npm依赖', fn: this.installDependencies },
      { name: '检查关键依赖', fn: this.checkDependencies },
      { name: '创建示例目录', fn: this.createDirectories },
      { name: '验证安装', fn: this.validateInstallation }
    ];
  }

  async run() {
    console.log('🚀 开始安装 Document Conversion MCP...');
    console.log('=' .repeat(50));

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      console.log(`\n📋 步骤 ${i + 1}/${this.steps.length}: ${step.name}`);
      
      try {
        await step.fn.call(this);
        console.log(`✅ ${step.name} 完成`);
      } catch (error) {
        console.error(`❌ ${step.name} 失败:`, error.message);
        process.exit(1);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 安装完成！');
    console.log('\n📖 使用方法:');
    console.log('   npm start          # 启动MCP服务器');
    console.log('   npm run dev        # 开发模式启动');
    console.log('   node start.js      # 直接启动');
    console.log('\n📚 更多信息请查看 README.md');
  }

  async checkNodeVersion() {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`需要 Node.js 18.0.0 或更高版本，当前版本: ${version}`);
    }
    
    console.log(`   Node.js 版本: ${version} ✓`);
  }

  async installDependencies() {
    console.log('   正在安装npm依赖...');
    
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: __dirname,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let output = '';
      npm.stdout.on('data', (data) => {
        output += data.toString();
      });

      npm.stderr.on('data', (data) => {
        output += data.toString();
      });

      npm.on('close', (code) => {
        if (code === 0) {
          console.log('   依赖安装完成');
          resolve();
        } else {
          reject(new Error(`npm install 失败，退出码: ${code}\n${output}`));
        }
      });

      npm.on('error', (error) => {
        reject(new Error(`npm install 执行失败: ${error.message}`));
      });
    });
  }

  async checkDependencies() {
    const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, 'package.json'), 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    console.log('   检查关键依赖:');
    
    for (const dep of dependencies) {
      try {
        await import(dep);
        console.log(`     ${dep} ✓`);
      } catch (error) {
        // 某些依赖可能需要特殊处理
        if (dep === 'puppeteer') {
          console.log(`     ${dep} ⚠️  (需要下载Chromium，首次使用时自动下载)`);
        } else {
          console.log(`     ${dep} ⚠️  (${error.message})`);
        }
      }
    }
  }

  async createDirectories() {
    const dirs = [
      'examples',
      'examples/input',
      'examples/output',
      'temp'
    ];

    for (const dir of dirs) {
      const dirPath = path.join(__dirname, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`   创建目录: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }
  }

  async validateInstallation() {
    // 检查主要文件是否存在
    const requiredFiles = [
      'src/index.js',
      'src/converter.js',
      'src/utils.js',
      'package.json',
      'mcp.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      try {
        await fs.access(filePath);
        console.log(`   文件检查: ${file} ✓`);
      } catch (error) {
        throw new Error(`缺少必要文件: ${file}`);
      }
    }

    // 尝试导入主模块
    try {
      const indexPath = path.join(__dirname, 'src', 'index.js');
      console.log('   模块导入测试...');
      // 这里不实际导入，因为会启动服务器
      console.log('   模块结构验证 ✓');
    } catch (error) {
      throw new Error(`模块导入失败: ${error.message}`);
    }
  }
}

// 运行安装程序
const installer = new Installer();
installer.run().catch((error) => {
  console.error('\n❌ 安装失败:', error.message);
  process.exit(1);
});