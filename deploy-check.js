#!/usr/bin/env node
/**
 * 魔搭平台部署检查脚本
 * ModelScope Deployment Check Script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentChecker {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }

    log(type, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        switch(type) {
            case 'error':
                this.errors.push(message);
                break;
            case 'warning':
                this.warnings.push(message);
                break;
            case 'success':
                this.success.push(message);
                break;
        }
    }

    checkFile(filePath, description) {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            this.log('success', `✓ ${description}: ${filePath}`);
            return true;
        } else {
            this.log('error', `✗ 缺少${description}: ${filePath}`);
            return false;
        }
    }

    checkPackageJson() {
        this.log('info', '检查 package.json 配置...');
        
        const packagePath = path.join(__dirname, 'package.json');
        if (!fs.existsSync(packagePath)) {
            this.log('error', '缺少 package.json 文件');
            return false;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // 检查必要字段
            const requiredFields = ['name', 'version', 'main', 'scripts'];
            for (const field of requiredFields) {
                if (!packageJson[field]) {
                    this.log('error', `package.json 缺少必要字段: ${field}`);
                } else {
                    this.log('success', `✓ package.json 包含字段: ${field}`);
                }
            }

            // 检查Node.js版本要求
            if (packageJson.engines && packageJson.engines.node) {
                this.log('success', `✓ Node.js 版本要求: ${packageJson.engines.node}`);
            } else {
                this.log('warning', 'package.json 未指定 Node.js 版本要求');
            }

            // 检查依赖
            if (packageJson.dependencies) {
                this.log('success', `✓ 项目依赖数量: ${Object.keys(packageJson.dependencies).length}`);
            }

            return true;
        } catch (error) {
            this.log('error', `package.json 格式错误: ${error.message}`);
            return false;
        }
    }

    checkMcpConfig() {
        this.log('info', '检查 MCP 配置文件...');
        
        const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
        if (!fs.existsSync(mcpConfigPath)) {
            this.log('warning', 'mcp-config.json 文件不存在（可选）');
            return true;
        }

        try {
            const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
            
            if (mcpConfig.mcpServers) {
                this.log('success', '✓ MCP 服务器配置存在');
            }
            
            if (mcpConfig.tools) {
                this.log('success', `✓ MCP 工具配置: ${Array.isArray(mcpConfig.tools) ? mcpConfig.tools.length : Object.keys(mcpConfig.tools).length} 个工具`);
            }

            return true;
        } catch (error) {
            this.log('error', `mcp-config.json 格式错误: ${error.message}`);
            return false;
        }
    }

    checkDeploymentFiles() {
        this.log('info', '检查部署相关文件...');
        
        const deploymentFiles = [
            { path: 'app.py', desc: 'Python入口文件' },
            { path: 'requirements.txt', desc: 'Python依赖文件' },
            { path: 'modelscope.yaml', desc: '魔搭平台配置文件' },
            { path: 'Dockerfile', desc: 'Docker配置文件' }
        ];

        let allExists = true;
        for (const file of deploymentFiles) {
            if (!this.checkFile(file.path, file.desc)) {
                allExists = false;
            }
        }

        return allExists;
    }

    checkCoreFiles() {
        this.log('info', '检查核心文件...');
        
        const coreFiles = [
            { path: 'mcp-tools.js', desc: '统一MCP工具服务器' },
            { path: 'src/index.js', desc: '基础MCP服务器' },
            { path: 'src/converter.js', desc: '文档转换器' },
            { path: 'src/utils.js', desc: '工具函数' }
        ];

        let allExists = true;
        for (const file of coreFiles) {
            if (!this.checkFile(file.path, file.desc)) {
                allExists = false;
            }
        }

        return allExists;
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('魔搭平台部署检查报告');
        console.log('ModelScope Deployment Check Report');
        console.log('='.repeat(60));
        
        console.log(`\n✅ 成功项目 (${this.success.length}):`);
        this.success.forEach(item => console.log(`   ${item}`));
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  警告项目 (${this.warnings.length}):`);
            this.warnings.forEach(item => console.log(`   ${item}`));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ 错误项目 (${this.errors.length}):`);
            this.errors.forEach(item => console.log(`   ${item}`));
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (this.errors.length === 0) {
            console.log('🎉 部署检查通过！项目已准备好部署到魔搭平台。');
            console.log('🎉 Deployment check passed! Ready for ModelScope deployment.');
            return true;
        } else {
            console.log('❌ 部署检查失败！请修复上述错误后重试。');
            console.log('❌ Deployment check failed! Please fix the errors above.');
            return false;
        }
    }

    async run() {
        console.log('开始魔搭平台部署检查...');
        console.log('Starting ModelScope deployment check...\n');
        
        // 执行各项检查
        this.checkPackageJson();
        this.checkMcpConfig();
        this.checkDeploymentFiles();
        this.checkCoreFiles();
        
        // 生成报告
        const success = this.generateReport();
        
        process.exit(success ? 0 : 1);
    }
}

// 运行检查
const checker = new DeploymentChecker();
checker.run().catch(error => {
    console.error('检查过程中发生错误:', error);
    process.exit(1);
});