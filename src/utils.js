import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';

// 路径标准化函数 - 支持单斜杠和双反斜杠
export function normalizePath(filePath) {
  if (!filePath) return filePath;
  
  console.log('Debug - Input path:', filePath);
  console.log('Debug - Current working directory:', process.cwd());
  
  // 先处理路径分隔符统一
  let normalizedPath = filePath;
  
  // 在Windows系统上，将正斜杠转换为反斜杠
  if (process.platform === 'win32') {
    normalizedPath = normalizedPath.replace(/\//g, '\\');
  }
  
  // 解析为绝对路径
  if (!path.isAbsolute(normalizedPath)) {
    normalizedPath = path.resolve(process.cwd(), normalizedPath);
  }
  
  // 最后标准化路径
  const result = path.normalize(normalizedPath);
  console.log('Debug - Normalized path:', result);
  return result;
}

// 支持的文档格式配置
export const SUPPORTED_FORMATS = {
  input: {
    pdf: {
      extensions: ['.pdf'],
      mimeTypes: ['application/pdf'],
      description: 'PDF文档',
      canConvertTo: ['txt', 'md', 'html', 'png', 'jpg']
    },
    docx: {
      extensions: ['.docx', '.doc'],
      mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
      description: 'Microsoft Word文档',
      canConvertTo: ['txt', 'md', 'html', 'pdf']
    },
    xlsx: {
      extensions: ['.xlsx', '.xls'],
      mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      description: 'Microsoft Excel电子表格',
      canConvertTo: ['csv', 'json', 'html']
    },
    pptx: {
      extensions: ['.pptx', '.ppt'],
      mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'],
      description: 'Microsoft PowerPoint演示文稿',
      canConvertTo: ['pdf', 'html', 'png', 'jpg']
    },
    md: {
      extensions: ['.md', '.markdown'],
      mimeTypes: ['text/markdown'],
      description: 'Markdown文档',
      canConvertTo: ['html', 'pdf', 'docx']
    },
    html: {
      extensions: ['.html', '.htm'],
      mimeTypes: ['text/html'],
      description: 'HTML网页',
      canConvertTo: ['pdf', 'md', 'png', 'jpg']
    },
    txt: {
      extensions: ['.txt'],
      mimeTypes: ['text/plain'],
      description: '纯文本文件',
      canConvertTo: ['md', 'html', 'pdf']
    },
    csv: {
      extensions: ['.csv'],
      mimeTypes: ['text/csv'],
      description: 'CSV文件',
      canConvertTo: ['xlsx', 'json', 'html']
    },
    json: {
      extensions: ['.json'],
      mimeTypes: ['application/json'],
      description: 'JSON文件',
      canConvertTo: ['csv', 'xlsx', 'html']
    }
  },
  output: {
    pdf: {
      extension: '.pdf',
      mimeType: 'application/pdf',
      description: 'PDF文档'
    },
    docx: {
      extension: '.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Microsoft Word文档'
    },
    xlsx: {
      extension: '.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Microsoft Excel电子表格'
    },
    pptx: {
      extension: '.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      description: 'Microsoft PowerPoint演示文稿'
    },
    html: {
      extension: '.html',
      mimeType: 'text/html',
      description: 'HTML网页'
    },
    md: {
      extension: '.md',
      mimeType: 'text/markdown',
      description: 'Markdown文档'
    },
    txt: {
      extension: '.txt',
      mimeType: 'text/plain',
      description: '纯文本文件'
    },
    csv: {
      extension: '.csv',
      mimeType: 'text/csv',
      description: 'CSV文件'
    },
    json: {
      extension: '.json',
      mimeType: 'application/json',
      description: 'JSON文件'
    },
    png: {
      extension: '.png',
      mimeType: 'image/png',
      description: 'PNG图片'
    },
    jpg: {
      extension: '.jpg',
      mimeType: 'image/jpeg',
      description: 'JPEG图片'
    }
  }
};

/**
 * 验证文件是否存在且可读
 * @param {string} filePath - 文件路径
 * @returns {Promise<{valid: boolean, error?: string, format?: string}>}
 */
export async function validateFile(filePath) {
  try {
    // 标准化路径，支持单斜杠和双反斜杠
    const normalizedPath = normalizePath(filePath);
    
    // 检查文件是否存在
    const stats = await fs.stat(normalizedPath);
    
    if (!stats.isFile()) {
      return {
        valid: false,
        error: '指定路径不是一个文件'
      };
    }

    // 检查文件大小（限制为100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: `文件过大，最大支持 ${maxSize / 1024 / 1024}MB`
      };
    }

    // 检查文件格式
    const ext = path.extname(normalizedPath).toLowerCase();
    const format = getFileFormat(ext);
    
    if (!format) {
      return {
        valid: false,
        error: `不支持的文件格式: ${ext}`
      };
    }

    return {
      valid: true,
      format: format
    };
  } catch (error) {
    return {
      valid: false,
      error: `文件访问错误: ${error.message}`
    };
  }
}

/**
 * 根据文件扩展名获取格式信息
 * @param {string} extension - 文件扩展名
 * @returns {string|null} - 格式名称
 */
export function getFileFormat(extension) {
  const ext = extension.toLowerCase();
  
  for (const [format, config] of Object.entries(SUPPORTED_FORMATS.input)) {
    if (config.extensions.includes(ext)) {
      return format;
    }
  }
  
  return null;
}

/**
 * 检查转换是否支持
 * @param {string} inputFormat - 输入格式
 * @param {string} outputFormat - 输出格式
 * @returns {boolean}
 */
export function isConversionSupported(inputFormat, outputFormat) {
  const inputConfig = SUPPORTED_FORMATS.input[inputFormat];
  if (!inputConfig) {
    return false;
  }
  
  return inputConfig.canConvertTo.includes(outputFormat);
}

/**
 * 获取所有支持的格式信息
 * @returns {object}
 */
export function getSupportedFormats() {
  return {
    inputFormats: Object.keys(SUPPORTED_FORMATS.input).map(format => ({
      format,
      ...SUPPORTED_FORMATS.input[format]
    })),
    outputFormats: Object.keys(SUPPORTED_FORMATS.output).map(format => ({
      format,
      ...SUPPORTED_FORMATS.output[format]
    })),
    conversionMatrix: Object.entries(SUPPORTED_FORMATS.input).reduce((matrix, [input, config]) => {
      matrix[input] = config.canConvertTo;
      return matrix;
    }, {})
  };
}

/**
 * 生成安全的输出文件名
 * @param {string} inputPath - 输入文件路径
 * @param {string} outputFormat - 输出格式
 * @param {string} outputDir - 输出目录（可选）
 * @returns {string}
 */
export function generateOutputPath(inputPath, outputFormat, outputDir = null) {
  const inputDir = path.dirname(inputPath);
  const baseName = path.parse(inputPath).name;
  const outputExt = SUPPORTED_FORMATS.output[outputFormat]?.extension || `.${outputFormat}`;
  
  const outputFileName = `${baseName}${outputExt}`;
  const targetDir = outputDir || inputDir;
  
  return path.join(targetDir, outputFileName);
}

/**
 * 清理临时文件
 * @param {string[]} filePaths - 要删除的文件路径数组
 */
export async function cleanupTempFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`清理临时文件失败: ${filePath}`, error.message);
    }
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
export function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 验证转换选项
 * @param {string} inputFormat - 输入格式
 * @param {string} outputFormat - 输出格式
 * @param {object} options - 转换选项
 * @returns {object} - 验证结果和清理后的选项
 */
export function validateConversionOptions(inputFormat, outputFormat, options = {}) {
  const validatedOptions = { ...options };
  const errors = [];
  
  // 验证图片质量
  if (validatedOptions.quality !== undefined) {
    if (typeof validatedOptions.quality !== 'number' || 
        validatedOptions.quality < 0 || 
        validatedOptions.quality > 100) {
      errors.push('图片质量必须是0-100之间的数字');
    }
  }
  
  // 验证页面范围（PDF相关）
  if (validatedOptions.page_range !== undefined) {
    const pageRangePattern = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
    if (!pageRangePattern.test(validatedOptions.page_range)) {
      errors.push('页面范围格式无效，应为 "1-5" 或 "1,3,5" 格式');
    }
  }
  
  // 根据输出格式设置默认选项
  if (['png', 'jpg'].includes(outputFormat)) {
    validatedOptions.quality = validatedOptions.quality || 80;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    options: validatedOptions
  };
}

/**
 * 创建进度跟踪器
 * @param {number} total - 总数
 * @returns {object}
 */
export function createProgressTracker(total) {
  let current = 0;
  
  return {
    update(increment = 1) {
      current += increment;
      return {
        current,
        total,
        percentage: Math.round((current / total) * 100)
      };
    },
    
    getProgress() {
      return {
        current,
        total,
        percentage: Math.round((current / total) * 100)
      };
    }
  };
}