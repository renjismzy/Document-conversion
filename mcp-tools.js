#!/usr/bin/env node

/**
 * MCP文档转换工具集成器
 * 将所有文档转换工具整合在一个统一的接口中
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DocumentConverter } from './src/converter.js';
import { validateFile, getSupportedFormats, formatFileSize } from './src/utils.js';
import fs from 'fs/promises';
import path from 'path';

class UnifiedMCPToolsServer {
  constructor() {
    this.server = new Server(
      {
        name: 'unified-document-conversion-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.converter = new DocumentConverter();
    this.setupAllTools();
  }

  setupAllTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'document_converter',
            description: '统一的文档转换工具，支持格式转换、信息获取、批量处理、文件验证等所有功能',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: '操作类型',
                  enum: [
                    'convert',
                    'get_info', 
                    'list_formats',
                    'batch_convert',
                    'validate_file',
                    'scan_directory',
                    'preview_conversion',
                    'check_status'
                  ],
                },
                // 文件路径参数
                input_path: {
                  type: 'string',
                  description: '输入文档的文件路径（convert, get_info, validate_file, preview_conversion操作需要）',
                },
                output_path: {
                  type: 'string',
                  description: '输出文档的文件路径（convert操作需要）',
                },
                file_path: {
                  type: 'string',
                  description: '文档文件路径（get_info, validate_file操作的别名）',
                },
                // 目录参数
                input_directory: {
                  type: 'string',
                  description: '输入目录路径（batch_convert操作需要）',
                },
                output_directory: {
                  type: 'string',
                  description: '输出目录路径（batch_convert操作需要）',
                },
                directory_path: {
                  type: 'string',
                  description: '要扫描的目录路径（scan_directory操作需要）',
                },
                // 格式参数
                target_format: {
                  type: 'string',
                  description: '目标格式 (pdf, docx, xlsx, pptx, md, html, txt, png, jpg)',
                },
                // 其他参数
                file_pattern: {
                  type: 'string',
                  description: '文件匹配模式（batch_convert操作可选）',
                },
                file_extensions: {
                  type: 'array',
                  description: '要扫描的文件扩展名（scan_directory操作可选）',
                  items: {
                    type: 'string',
                  },
                },
                options: {
                  type: 'object',
                  description: '转换选项（convert操作可选）',
                  properties: {
                    quality: {
                      type: 'number',
                      description: '图片质量 (0-100)',
                      minimum: 0,
                      maximum: 100,
                    },
                    page_range: {
                      type: 'string',
                      description: 'PDF页面范围，如 "1-5" 或 "1,3,5"',
                    },
                    extract_images: {
                      type: 'boolean',
                      description: '是否提取图片',
                    },
                  },
                },
              },
              required: ['operation'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'document_converter':
            return await this.handleDocumentConverter(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知工具: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行错误: ${error.message}`
        );
      }
    });
  }

  // 统一文档转换处理器
  async handleDocumentConverter(args) {
    // 参数验证
    if (!args || typeof args !== 'object') {
      throw new Error('参数不能为空且必须是对象类型');
    }
    
    const { operation } = args;
    
    if (!operation) {
      throw new Error('operation参数是必需的');
    }

    switch (operation) {
      case 'convert':
        return await this.handleConvertDocument(args);
      case 'get_info':
        // 支持input_path作为file_path的别名
        const infoArgs = { ...args, file_path: args.file_path || args.input_path };
        return await this.handleGetDocumentInfo(infoArgs);
      case 'list_formats':
        return await this.handleListSupportedFormats();
      case 'batch_convert':
        return await this.handleBatchConvert(args);
      case 'validate_file':
        // 支持input_path作为file_path的别名
        const validateArgs = { ...args, file_path: args.file_path || args.input_path };
        return await this.handleValidateFile(validateArgs);
      case 'scan_directory':
        return await this.handleScanDirectory(args);
      case 'preview_conversion':
        return await this.handlePreviewConversion(args);
      case 'check_status':
        return await this.handleCheckToolStatus();
      default:
        throw new Error(`不支持的操作类型: ${operation}`);
    }
  }

  // 核心转换功能
  async handleConvertDocument(args) {
    const { input_path, output_path, target_format, options = {} } = args;

    const validation = await validateFile(input_path);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const result = await this.converter.convert(
      input_path,
      output_path,
      target_format,
      options
    );

    return {
      content: [
        {
          type: 'text',
          text: `✅ 文档转换成功！\n📁 输入: ${input_path}\n📄 输出: ${output_path}\n🔄 格式: ${target_format}\n${result.message || ''}`,
        },
      ],
    };
  }

  // 获取文档信息
  async handleGetDocumentInfo(args) {
    const { file_path } = args;
    const info = await this.converter.getDocumentInfo(file_path);

    return {
      content: [
        {
          type: 'text',
          text: `📋 文档信息:\n${JSON.stringify(info, null, 2)}`,
        },
      ],
    };
  }

  // 列出支持的格式
  async handleListSupportedFormats() {
    const formats = getSupportedFormats();

    return {
      content: [
        {
          type: 'text',
          text: `📚 支持的文档格式:\n${JSON.stringify(formats, null, 2)}`,
        },
      ],
    };
  }

  // 批量转换
  async handleBatchConvert(args) {
    const { input_directory, output_directory, target_format, file_pattern } = args;

    const results = await this.converter.batchConvert(
      input_directory,
      output_directory,
      target_format,
      file_pattern
    );

    // 验证results结构
    const details = results.details && Array.isArray(results.details) ? results.details : [];
    
    return {
      content: [
        {
          type: 'text',
          text: `🔄 批量转换完成！\n✅ 成功: ${results.success || 0}\n❌ 失败: ${results.failed || 0}\n📝 详情:\n${details.join('\n')}`,
        },
      ],
    };
  }

  // 验证文件
  async handleValidateFile(args) {
    const { file_path } = args;
    const validation = await validateFile(file_path);

    return {
      content: [
        {
          type: 'text',
          text: validation.valid 
            ? `✅ 文件验证通过: ${file_path}\n📊 大小: ${formatFileSize(validation.size)}\n📅 修改时间: ${validation.lastModified}`
            : `❌ 文件验证失败: ${validation.error}`,
        },
      ],
    };
  }

  // 扫描目录
  async handleScanDirectory(args) {
    const { directory_path, file_extensions = [] } = args;
    
    // 验证file_extensions参数
    if (file_extensions && !Array.isArray(file_extensions)) {
      throw new Error('file_extensions参数必须是数组类型');
    }

    try {
      const files = await fs.readdir(directory_path, { withFileTypes: true });
      const documentFiles = [];

      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(directory_path, file.name);
          const ext = path.extname(file.name).toLowerCase();
          
          if (file_extensions.length === 0 || file_extensions.includes(ext)) {
            const stats = await fs.stat(filePath);
            documentFiles.push({
              name: file.name,
              path: filePath,
              extension: ext,
              size: formatFileSize(stats.size),
              lastModified: stats.mtime.toISOString(),
            });
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `📁 目录扫描结果: ${directory_path}\n📄 找到 ${documentFiles.length} 个文件:\n${JSON.stringify(documentFiles, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`目录扫描失败: ${error.message}`);
    }
  }

  // 预览转换
  async handlePreviewConversion(args) {
    const { input_path, target_format } = args;

    const validation = await validateFile(input_path);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const inputFormat = path.extname(input_path).toLowerCase().slice(1);
    const formats = getSupportedFormats();
    
    const isSupported = formats.input.includes(inputFormat) && formats.output.includes(target_format);

    return {
      content: [
        {
          type: 'text',
          text: `🔍 转换预览:\n📁 输入文件: ${input_path}\n📊 文件大小: ${formatFileSize(validation.size)}\n🔄 输入格式: ${inputFormat}\n🎯 目标格式: ${target_format}\n${isSupported ? '✅ 支持此转换' : '❌ 不支持此转换'}`,
        },
      ],
    };
  }

  // 检查工具状态
  async handleCheckToolStatus() {
    const formats = getSupportedFormats();
    const status = {
      server: 'running',
      version: '1.0.0',
      supportedInputFormats: formats.input.length,
      supportedOutputFormats: formats.output.length,
      availableTools: 8,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🚀 MCP工具服务器状态:\n${JSON.stringify(status, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Unified Document Conversion MCP Tools Server running on stdio');
    console.error('📚 Available tool: document_converter (支持8种操作: convert, get_info, list_formats, batch_convert, validate_file, scan_directory, preview_conversion, check_status)');
  }
}

// 启动统一工具服务器
const server = new UnifiedMCPToolsServer();
server.run().catch(console.error);