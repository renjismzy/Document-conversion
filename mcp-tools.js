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
          // 核心转换工具
          {
            name: 'convert_document',
            description: '将文档从一种格式转换为另一种格式',
            inputSchema: {
              type: 'object',
              properties: {
                input_path: {
                  type: 'string',
                  description: '输入文档的文件路径',
                },
                output_path: {
                  type: 'string',
                  description: '输出文档的文件路径',
                },
                target_format: {
                  type: 'string',
                  description: '目标格式 (pdf, docx, xlsx, pptx, md, html, txt, png, jpg)',
                },
                options: {
                  type: 'object',
                  description: '转换选项（可选）',
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
              required: ['input_path', 'output_path', 'target_format'],
            },
          },
          // 文档信息工具
          {
            name: 'get_document_info',
            description: '获取文档的基本信息',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: '文档文件路径',
                },
              },
              required: ['file_path'],
            },
          },
          // 格式支持工具
          {
            name: 'list_supported_formats',
            description: '列出所有支持的文档格式',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          // 批量转换工具
          {
            name: 'batch_convert',
            description: '批量转换多个文档',
            inputSchema: {
              type: 'object',
              properties: {
                input_directory: {
                  type: 'string',
                  description: '输入目录路径',
                },
                output_directory: {
                  type: 'string',
                  description: '输出目录路径',
                },
                target_format: {
                  type: 'string',
                  description: '目标格式',
                },
                file_pattern: {
                  type: 'string',
                  description: '文件匹配模式（可选）',
                },
              },
              required: ['input_directory', 'output_directory', 'target_format'],
            },
          },
          // 文件验证工具
          {
            name: 'validate_file',
            description: '验证文件是否存在且可读取',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: '要验证的文件路径',
                },
              },
              required: ['file_path'],
            },
          },
          // 目录扫描工具
          {
            name: 'scan_directory',
            description: '扫描目录中的文档文件',
            inputSchema: {
              type: 'object',
              properties: {
                directory_path: {
                  type: 'string',
                  description: '要扫描的目录路径',
                },
                file_extensions: {
                  type: 'array',
                  description: '要扫描的文件扩展名（可选）',
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['directory_path'],
            },
          },
          // 转换预览工具
          {
            name: 'preview_conversion',
            description: '预览转换操作而不实际执行',
            inputSchema: {
              type: 'object',
              properties: {
                input_path: {
                  type: 'string',
                  description: '输入文档的文件路径',
                },
                target_format: {
                  type: 'string',
                  description: '目标格式',
                },
              },
              required: ['input_path', 'target_format'],
            },
          },
          // 工具状态检查
          {
            name: 'check_tool_status',
            description: '检查MCP工具服务器状态和可用性',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'convert_document':
            return await this.handleConvertDocument(args);
          case 'get_document_info':
            return await this.handleGetDocumentInfo(args);
          case 'list_supported_formats':
            return await this.handleListSupportedFormats();
          case 'batch_convert':
            return await this.handleBatchConvert(args);
          case 'validate_file':
            return await this.handleValidateFile(args);
          case 'scan_directory':
            return await this.handleScanDirectory(args);
          case 'preview_conversion':
            return await this.handlePreviewConversion(args);
          case 'check_tool_status':
            return await this.handleCheckToolStatus();
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

    return {
      content: [
        {
          type: 'text',
          text: `🔄 批量转换完成！\n✅ 成功: ${results.success}\n❌ 失败: ${results.failed}\n📝 详情:\n${results.details.join('\n')}`,
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
    console.error('📚 Available tools: convert_document, get_document_info, list_supported_formats, batch_convert, validate_file, scan_directory, preview_conversion, check_tool_status');
  }
}

// 启动统一工具服务器
const server = new UnifiedMCPToolsServer();
server.run().catch(console.error);