#!/usr/bin/env node

/**
 * 统一MCP工具使用示例
 * 演示如何使用集成的文档转换工具
 */

const fs = require('fs');
const path = require('path');
const { UnifiedMCPToolsServer } = require('../mcp-tools.js');

class UnifiedToolsExample {
    constructor() {
        this.server = new UnifiedMCPToolsServer();
        this.exampleDir = path.join(__dirname, 'sample-files');
        this.outputDir = path.join(__dirname, 'output');
    }

    // 创建示例环境
    async setupExampleEnvironment() {
        console.log('🔧 设置示例环境...');
        
        // 创建目录
        if (!fs.existsSync(this.exampleDir)) {
            fs.mkdirSync(this.exampleDir, { recursive: true });
        }
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // 创建示例文件
        const sampleFiles = {
            'sample.txt': `这是一个示例文本文件。

包含多行内容，用于演示文档转换功能。

支持的格式包括：
- 文本文件 (.txt)
- Markdown (.md)
- HTML (.html)
- PDF (.pdf)
- Word文档 (.docx)
- Excel表格 (.xlsx)
- PowerPoint演示文稿 (.pptx)

这个工具可以在这些格式之间进行转换。`,
            
            'sample.md': `# 示例Markdown文档

这是一个**示例**Markdown文档，用于演示文档转换功能。

## 功能特性

- 支持多种文档格式
- 批量转换处理
- 文件验证和扫描
- 转换预览功能

## 代码示例

\`\`\`javascript
const converter = new DocumentConverter();
const result = await converter.convert('input.md', 'output.html', 'html');
console.log('转换完成:', result);
\`\`\`

## 表格示例

| 格式 | 扩展名 | 支持 |
|------|--------|------|
| Markdown | .md | ✅ |
| HTML | .html | ✅ |
| PDF | .pdf | ✅ |
| Word | .docx | ✅ |

> 这是一个引用块，用于强调重要信息。`,
            
            'sample.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>示例HTML文档</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .highlight { background-color: #ffff99; }
        .code { background-color: #f4f4f4; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>示例HTML文档</h1>
    <p>这是一个<span class="highlight">示例HTML文档</span>，用于演示文档转换功能。</p>
    
    <h2>功能列表</h2>
    <ul>
        <li>文档格式转换</li>
        <li>批量处理</li>
        <li>文件验证</li>
        <li>目录扫描</li>
    </ul>
    
    <h2>代码示例</h2>
    <div class="code">
        <pre>const result = await convertDocument('input.html', 'output.md', 'markdown');</pre>
    </div>
    
    <p><strong>注意：</strong>转换过程中会保持原有的格式和结构。</p>
</body>
</html>`
        };

        for (const [filename, content] of Object.entries(sampleFiles)) {
            const filePath = path.join(this.exampleDir, filename);
            fs.writeFileSync(filePath, content, 'utf8');
        }

        console.log('✅ 示例环境设置完成');
    }

    // 示例1：检查工具状态
    async example1_CheckToolStatus() {
        console.log('\n📋 示例1：检查工具状态');
        console.log('-'.repeat(40));
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'check_tool_status',
                    arguments: {}
                }
            });
            
            const status = JSON.parse(result.content[0].text);
            console.log('工具状态:', JSON.stringify(status, null, 2));
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例2：列出支持的格式
    async example2_ListSupportedFormats() {
        console.log('\n📝 示例2：列出支持的格式');
        console.log('-'.repeat(40));
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'list_supported_formats',
                    arguments: {}
                }
            });
            
            const formats = JSON.parse(result.content[0].text);
            console.log('支持的输入格式:', formats.input_formats.join(', '));
            console.log('支持的输出格式:', formats.output_formats.join(', '));
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例3：扫描目录
    async example3_ScanDirectory() {
        console.log('\n🔍 示例3：扫描目录');
        console.log('-'.repeat(40));
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'scan_directory',
                    arguments: {
                        directory_path: this.exampleDir,
                        file_extensions: ['txt', 'md', 'html']
                    }
                }
            });
            
            const scanResult = JSON.parse(result.content[0].text);
            console.log(`找到 ${scanResult.files.length} 个文件:`);
            scanResult.files.forEach(file => {
                console.log(`  - ${file.name} (${file.size} 字节, ${file.format})`);
            });
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例4：验证文件
    async example4_ValidateFile() {
        console.log('\n✅ 示例4：验证文件');
        console.log('-'.repeat(40));
        
        const testFile = path.join(this.exampleDir, 'sample.md');
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'validate_file',
                    arguments: {
                        file_path: testFile
                    }
                }
            });
            
            const validation = JSON.parse(result.content[0].text);
            console.log('文件验证结果:');
            console.log(`  - 文件路径: ${validation.file_path}`);
            console.log(`  - 是否有效: ${validation.valid ? '是' : '否'}`);
            console.log(`  - 文件大小: ${validation.size} 字节`);
            console.log(`  - 检测格式: ${validation.detected_format}`);
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例5：预览转换
    async example5_PreviewConversion() {
        console.log('\n👁️ 示例5：预览转换');
        console.log('-'.repeat(40));
        
        const inputFile = path.join(this.exampleDir, 'sample.md');
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'preview_conversion',
                    arguments: {
                        input_path: inputFile,
                        target_format: 'html'
                    }
                }
            });
            
            const preview = JSON.parse(result.content[0].text);
            console.log('转换预览:');
            console.log(`  - 输入文件: ${preview.input_info.file_path}`);
            console.log(`  - 输入格式: ${preview.input_info.format}`);
            console.log(`  - 目标格式: ${preview.conversion_plan.target_format}`);
            console.log(`  - 转换方法: ${preview.conversion_plan.method}`);
            console.log(`  - 预计大小: ${preview.conversion_plan.estimated_output_size}`);
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例6：获取文档信息
    async example6_GetDocumentInfo() {
        console.log('\n📄 示例6：获取文档信息');
        console.log('-'.repeat(40));
        
        const testFile = path.join(this.exampleDir, 'sample.html');
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'get_document_info',
                    arguments: {
                        file_path: testFile
                    }
                }
            });
            
            const info = JSON.parse(result.content[0].text);
            console.log('文档信息:');
            console.log(`  - 文件路径: ${info.file_path}`);
            console.log(`  - 格式: ${info.format}`);
            console.log(`  - 大小: ${info.size} 字节`);
            console.log(`  - 创建时间: ${new Date(info.created).toLocaleString()}`);
            console.log(`  - 修改时间: ${new Date(info.modified).toLocaleString()}`);
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例7：转换文档
    async example7_ConvertDocument() {
        console.log('\n🔄 示例7：转换文档');
        console.log('-'.repeat(40));
        
        const inputFile = path.join(this.exampleDir, 'sample.md');
        const outputFile = path.join(this.outputDir, 'converted-sample.html');
        
        try {
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
            
            const conversion = JSON.parse(result.content[0].text);
            console.log('转换结果:');
            console.log(`  - 成功: ${conversion.success ? '是' : '否'}`);
            console.log(`  - 输入文件: ${conversion.input_path}`);
            console.log(`  - 输出文件: ${conversion.output_path}`);
            console.log(`  - 输出大小: ${conversion.output_size} 字节`);
            console.log(`  - 转换时间: ${conversion.conversion_time}ms`);
            
            // 显示转换后文件的前几行
            if (fs.existsSync(outputFile)) {
                const content = fs.readFileSync(outputFile, 'utf8');
                const preview = content.substring(0, 200) + (content.length > 200 ? '...' : '');
                console.log('\n转换后内容预览:');
                console.log(preview);
            }
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 示例8：批量转换
    async example8_BatchConvert() {
        console.log('\n📦 示例8：批量转换');
        console.log('-'.repeat(40));
        
        try {
            const result = await this.server.handleRequest({
                method: 'tools/call',
                params: {
                    name: 'batch_convert',
                    arguments: {
                        input_directory: this.exampleDir,
                        output_directory: this.outputDir,
                        target_format: 'html',
                        file_pattern: '*.md'
                    }
                }
            });
            
            const batchResult = JSON.parse(result.content[0].text);
            console.log('批量转换结果:');
            console.log(`  - 总文件数: ${batchResult.total_files}`);
            console.log(`  - 成功转换: ${batchResult.successful_conversions}`);
            console.log(`  - 转换失败: ${batchResult.failed_conversions}`);
            console.log(`  - 总耗时: ${batchResult.total_time}ms`);
            
            if (batchResult.results && batchResult.results.length > 0) {
                console.log('\n详细结果:');
                batchResult.results.forEach((result, index) => {
                    console.log(`  ${index + 1}. ${result.input_file} -> ${result.success ? '成功' : '失败'}`);
                    if (!result.success && result.error) {
                        console.log(`     错误: ${result.error}`);
                    }
                });
            }
        } catch (error) {
            console.error('错误:', error.message);
        }
    }

    // 运行所有示例
    async runAllExamples() {
        console.log('🚀 统一MCP工具使用示例\n');
        console.log('=' .repeat(60));
        
        await this.setupExampleEnvironment();
        
        // 运行所有示例
        await this.example1_CheckToolStatus();
        await this.example2_ListSupportedFormats();
        await this.example3_ScanDirectory();
        await this.example4_ValidateFile();
        await this.example5_PreviewConversion();
        await this.example6_GetDocumentInfo();
        await this.example7_ConvertDocument();
        await this.example8_BatchConvert();
        
        console.log('\n' + '=' .repeat(60));
        console.log('🎉 所有示例运行完成!');
        console.log('\n💡 提示:');
        console.log('  - 查看输出目录中的转换结果');
        console.log('  - 可以修改示例文件来测试不同的转换场景');
        console.log('  - 使用 npm run test-tools 运行完整的测试套件');
    }

    // 清理示例环境
    cleanup() {
        console.log('\n🧹 清理示例环境...');
        try {
            // 可选：清理生成的文件
            // if (fs.existsSync(this.exampleDir)) {
            //     fs.rmSync(this.exampleDir, { recursive: true, force: true });
            // }
            // if (fs.existsSync(this.outputDir)) {
            //     fs.rmSync(this.outputDir, { recursive: true, force: true });
            // }
            console.log('✅ 示例环境保留，可查看生成的文件');
        } catch (error) {
            console.log(`⚠️  清理示例环境时出错: ${error.message}`);
        }
    }
}

// 主函数
async function main() {
    const example = new UnifiedToolsExample();
    
    try {
        await example.runAllExamples();
    } catch (error) {
        console.error('示例运行出错:', error);
        process.exit(1);
    } finally {
        example.cleanup();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { UnifiedToolsExample };