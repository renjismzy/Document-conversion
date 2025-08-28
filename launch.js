#!/usr/bin/env node

/**
 * 文档转换MCP启动器
 * 提供交互式界面选择启动不同的服务器
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

class MCPLauncher {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // 显示启动选项
    showOptions() {
        console.log('\n🚀 文档转换MCP启动器');
        console.log('=' .repeat(50));
        console.log('请选择要启动的服务器:');
        console.log('');
        console.log('1. 基础MCP服务器 (src/index.js)');
        console.log('2. 统一工具服务器 (mcp-tools.js)');
        console.log('3. 运行基础示例 (examples/example-usage.js)');
        console.log('4. 运行统一工具示例 (examples/unified-tools-example.js)');
        console.log('5. 运行基础测试 (test.js)');
        console.log('6. 运行统一工具测试 (test-unified-tools.js)');
        console.log('7. 安装依赖 (install.js)');
        console.log('0. 退出');
        console.log('');
        console.log('=' .repeat(50));
    }

    // 获取用户选择
    async getUserChoice() {
        return new Promise((resolve) => {
            this.rl.question('请输入选项 (0-7): ', (answer) => {
                resolve(answer.trim());
            });
        });
    }

    // 启动进程
    async startProcess(command, args, description) {
        console.log(`\n🔄 启动: ${description}`);
        console.log(`命令: node ${args.join(' ')}`);
        console.log('-'.repeat(50));
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            cwd: __dirname
        });

        return new Promise((resolve, reject) => {
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`\n✅ ${description} 完成`);
                    resolve(code);
                } else {
                    console.log(`\n❌ ${description} 退出，代码: ${code}`);
                    resolve(code);
                }
            });

            child.on('error', (error) => {
                console.error(`\n❌ 启动 ${description} 时出错:`, error.message);
                reject(error);
            });
        });
    }

    // 处理用户选择
    async handleChoice(choice) {
        switch (choice) {
            case '1':
                await this.startProcess('node', ['src/index.js'], '基础MCP服务器');
                break;
                
            case '2':
                await this.startProcess('node', ['mcp-tools.js'], '统一工具服务器');
                break;
                
            case '3':
                await this.startProcess('node', ['examples/example-usage.js'], '基础示例');
                break;
                
            case '4':
                await this.startProcess('node', ['examples/unified-tools-example.js'], '统一工具示例');
                break;
                
            case '5':
                await this.startProcess('node', ['test.js'], '基础测试');
                break;
                
            case '6':
                await this.startProcess('node', ['test-unified-tools.js'], '统一工具测试');
                break;
                
            case '7':
                await this.startProcess('node', ['install.js'], '依赖安装');
                break;
                
            case '0':
                console.log('\n👋 再见!');
                return false;
                
            default:
                console.log('\n❌ 无效选项，请重新选择');
                break;
        }
        
        return true;
    }

    // 主循环
    async run() {
        console.log('欢迎使用文档转换MCP工具!');
        
        while (true) {
            this.showOptions();
            const choice = await this.getUserChoice();
            
            const shouldContinue = await this.handleChoice(choice);
            if (!shouldContinue) {
                break;
            }
            
            // 询问是否继续
            const continueChoice = await new Promise((resolve) => {
                this.rl.question('\n是否继续使用启动器? (y/n): ', (answer) => {
                    resolve(answer.toLowerCase().trim());
                });
            });
            
            if (continueChoice !== 'y' && continueChoice !== 'yes') {
                console.log('\n👋 再见!');
                break;
            }
        }
        
        this.rl.close();
    }

    // 显示帮助信息
    static showHelp() {
        console.log('\n📖 文档转换MCP启动器帮助');
        console.log('=' .repeat(50));
        console.log('使用方法:');
        console.log('  node launch.js          # 交互式启动器');
        console.log('  node launch.js --help   # 显示帮助信息');
        console.log('');
        console.log('直接启动选项:');
        console.log('  npm start               # 启动基础MCP服务器');
        console.log('  npm run tools           # 启动统一工具服务器');
        console.log('  npm run example         # 运行基础示例');
        console.log('  npm run example-tools   # 运行统一工具示例');
        console.log('  npm test                # 运行基础测试');
        console.log('  npm run test-tools      # 运行统一工具测试');
        console.log('  npm run install-deps    # 安装依赖');
        console.log('');
        console.log('开发模式:');
        console.log('  npm run dev             # 基础服务器开发模式');
        console.log('  npm run tools-dev       # 统一工具开发模式');
        console.log('');
        console.log('=' .repeat(50));
    }
}

// 主函数
async function main() {
    // 检查命令行参数
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        MCPLauncher.showHelp();
        return;
    }
    
    const launcher = new MCPLauncher();
    
    try {
        await launcher.run();
    } catch (error) {
        console.error('启动器运行出错:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { MCPLauncher };