#!/usr/bin/env node

/**
 * 统一MCP工具测试脚本
 * 测试所有集成的文档转换工具功能
 */

const fs = require('fs');
const path = require('path');
const { UnifiedMCPToolsServer } = require('./mcp-tools.js');

class UnifiedToolsTest {
    constructor() {
        this.server = new UnifiedMCPToolsServer();
        this.testDir = path.join(__dirname, 'test-files');
        this.outputDir = path.join(__dirname, 'test-output');
        this.results = [];
    }

    // 创建测试环境
    async setupTestEnvironment() {
        console.log('🔧 设置测试环境...');
        
        // 创建测试目录
        if (!fs.existsSync(this.testDir)) {
            fs.mkdirSync(this.testDir, { recursive: true });
        }
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // 创建测试文件
        const testFiles = {
            'test.txt': 'This is a test text file for conversion testing.',
            'test.md': '# Test Markdown\n\nThis is a **test** markdown file.',
            'test.html': '<html><body><h1>Test HTML</h1><p>This is a test HTML file.</p></body></html>'
        };

        for (const [filename, content] of Object.entries(testFiles)) {
            const filePath = path.join(this.testDir, filename);
            fs.writeFileSync(filePath, content, 'utf8');
        }

        console.log('✅ 测试环境设置完成');
    }

    // 运行单个测试
    async runTest(testName, testFunction) {
        console.log(`\n🧪 运行测试: ${testName}`);
        try {
            const startTime = Date.now();
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            this.results.push({
                name: testName,
                status: 'PASS',
                duration,
                result
            });
            
            console.log(`✅ ${testName} - 通过 (${duration}ms)`);
            return result;
        } catch (error) {
            this.results.push({
                name: testName,
                status: 'FAIL',
                error: error.message
            });
            
            console.log(`❌ ${testName} - 失败: ${error.message}`);
            return null;
        }
    }

    // 测试工具状态检查
    async testCheckToolStatus() {
        return await this.runTest('检查工具状态', async () => {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'check_tool_status',
                    arguments: {}
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('工具状态检查返回结果无效');
            }
            
            return JSON.parse(result.content[0].text);
        });
    }

    // 测试支持格式列表
    async testListSupportedFormats() {
        return await this.runTest('列出支持格式', async () => {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'list_supported_formats',
                    arguments: {}
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('支持格式列表返回结果无效');
            }
            
            const formats = JSON.parse(result.content[0].text);
            if (!formats.input_formats || !formats.output_formats) {
                throw new Error('格式列表结构无效');
            }
            
            return formats;
        });
    }

    // 测试文件验证
    async testValidateFile() {
        return await this.runTest('文件验证', async () => {
            const testFile = path.join(this.testDir, 'test.txt');
            
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'validate_file',
                    arguments: {
                        file_path: testFile
                    }
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('文件验证返回结果无效');
            }
            
            const validation = JSON.parse(result.content[0].text);
            if (!validation.valid) {
                throw new Error('文件验证失败');
            }
            
            return validation;
        });
    }

    // 测试目录扫描
    async testScanDirectory() {
        return await this.runTest('目录扫描', async () => {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'scan_directory',
                    arguments: {
                        directory_path: this.testDir,
                        file_extensions: ['txt', 'md', 'html']
                    }
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('目录扫描返回结果无效');
            }
            
            const scanResult = JSON.parse(result.content[0].text);
            if (!scanResult.files || scanResult.files.length === 0) {
                throw new Error('目录扫描未找到文件');
            }
            
            return scanResult;
        });
    }

    // 测试转换预览
    async testPreviewConversion() {
        return await this.runTest('转换预览', async () => {
            const testFile = path.join(this.testDir, 'test.md');
            
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'preview_conversion',
                    arguments: {
                        input_path: testFile,
                        target_format: 'html'
                    }
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('转换预览返回结果无效');
            }
            
            const preview = JSON.parse(result.content[0].text);
            if (!preview.input_info || !preview.conversion_plan) {
                throw new Error('转换预览结构无效');
            }
            
            return preview;
        });
    }

    // 测试文档信息获取
    async testGetDocumentInfo() {
        return await this.runTest('获取文档信息', async () => {
            const testFile = path.join(this.testDir, 'test.txt');
            
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'get_document_info',
                    arguments: {
                        file_path: testFile
                    }
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('文档信息获取返回结果无效');
            }
            
            const info = JSON.parse(result.content[0].text);
            if (!info.file_path || !info.format) {
                throw new Error('文档信息结构无效');
            }
            
            return info;
        });
    }

    // 测试文档转换
    async testConvertDocument() {
        return await this.runTest('文档转换', async () => {
            const inputFile = path.join(this.testDir, 'test.md');
            const outputFile = path.join(this.outputDir, 'test-converted.html');
            
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'convert_document',
                    arguments: {
                        input_path: inputFile,
                        output_path: outputFile,
                        target_format: 'html'
                    }
                }
            });
            
            if (!result.content || !result.content[0] || !result.content[0].text) {
                throw new Error('文档转换返回结果无效');
            }
            
            const conversion = JSON.parse(result.content[0].text);
            if (!conversion.success) {
                throw new Error('文档转换失败');
            }
            
            // 验证输出文件是否存在
            if (!fs.existsSync(outputFile)) {
                throw new Error('转换后的文件不存在');
            }
            
            return conversion;
        });
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始运行统一MCP工具测试套件\n');
        
        await this.setupTestEnvironment();
        
        // 运行所有测试
        await this.testCheckToolStatus();
        await this.testListSupportedFormats();
        await this.testValidateFile();
        await this.testScanDirectory();
        await this.testPreviewConversion();
        await this.testGetDocumentInfo();
        await this.testConvertDocument();
        
        // 显示测试结果摘要
        this.showTestSummary();
    }

    // 显示测试结果摘要
    showTestSummary() {
        console.log('\n📊 测试结果摘要:');
        console.log('=' .repeat(50));
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;
        
        console.log(`总测试数: ${total}`);
        console.log(`通过: ${passed}`);
        console.log(`失败: ${failed}`);
        console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n❌ 失败的测试:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => {
                    console.log(`  - ${r.name}: ${r.error}`);
                });
        }
        
        console.log('\n' + '=' .repeat(50));
        console.log(failed === 0 ? '🎉 所有测试通过!' : `⚠️  ${failed} 个测试失败`);
    }

    // 清理测试环境
    cleanup() {
        console.log('\n🧹 清理测试环境...');
        try {
            if (fs.existsSync(this.testDir)) {
                fs.rmSync(this.testDir, { recursive: true, force: true });
            }
            if (fs.existsSync(this.outputDir)) {
                fs.rmSync(this.outputDir, { recursive: true, force: true });
            }
            console.log('✅ 测试环境清理完成');
        } catch (error) {
            console.log(`⚠️  清理测试环境时出错: ${error.message}`);
        }
    }
}

// 主函数
async function main() {
    const tester = new UnifiedToolsTest();
    
    try {
        await tester.runAllTests();
    } catch (error) {
        console.error('测试运行出错:', error);
        process.exit(1);
    } finally {
        // 可选：清理测试环境
        // tester.cleanup();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { UnifiedToolsTest };