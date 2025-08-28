#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DocumentConverter } from './converter.js';
import { validateFile, getSupportedFormats } from './utils.js';

class DocumentConversionServer {
  constructor() {
    this.server = new Server(
      {
        name: 'document-conversion-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.converter = new DocumentConverter();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
          {
            name: 'list_supported_formats',
            description: '列出所有支持的文档格式',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
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

  async handleConvertDocument(args) {
    const { input_path, output_path, target_format, options = {} } = args;

    // 验证输入文件
    const validation = await validateFile(input_path);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 执行转换
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
          text: `文档转换成功！\n输入: ${input_path}\n输出: ${output_path}\n格式: ${target_format}\n${result.message || ''}`,
        },
      ],
    };
  }

  async handleGetDocumentInfo(args) {
    const { file_path } = args;

    const info = await this.converter.getDocumentInfo(file_path);

    return {
      content: [
        {
          type: 'text',
          text: `文档信息:\n${JSON.stringify(info, null, 2)}`,
        },
      ],
    };
  }

  async handleListSupportedFormats() {
    const formats = getSupportedFormats();

    return {
      content: [
        {
          type: 'text',
          text: `支持的文档格式:\n${JSON.stringify(formats, null, 2)}`,
        },
      ],
    };
  }

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
          text: `批量转换完成！\n成功: ${results.success}\n失败: ${results.failed}\n详情:\n${results.details.join('\n')}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Document Conversion MCP server running on stdio');
  }
}

const server = new DocumentConversionServer();
server.run().catch(console.error);