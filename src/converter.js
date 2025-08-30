import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// import pdfParse from 'pdf-parse'; // 延迟加载以避免测试文件执行
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import { marked } from 'marked';
import TurndownService from 'turndown';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: 'new' });
  }
  return browserInstance;
}

export class DocumentConverter {
  constructor() {
    this.turndownService = new TurndownService();
    this.infoCache = new Map();
    this.convertCache = new Map();
    this.maxCacheSize = 100; // 最大缓存条目
  }

  async convert(inputPath, outputPath, targetFormat, options = {}) {
    try {
      const cacheKey = `${inputPath}-${targetFormat}-${JSON.stringify(options)}`;
      if (this.convertCache.has(cacheKey)) {
        console.log(`缓存命中: ${cacheKey}`);
        await fs.writeFile(outputPath, this.convertCache.get(cacheKey));
        return { message: '从缓存中加载转换结果' };
      }
      const inputExt = path.extname(inputPath).toLowerCase();
      const outputExt = `.${targetFormat.toLowerCase()}`;

      // 确保输出目录存在
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      console.log(`开始转换: ${inputPath} -> ${outputPath} (${targetFormat})`);

      // 根据输入和输出格式选择转换方法
      const conversionKey = `${inputExt}_to_${outputExt}`;
      let result;
      switch (conversionKey) {
      // PDF 转换
      case '.pdf_to_.txt':
        return await this.pdfToText(inputPath, outputPath);
      case '.pdf_to_.md':
        return await this.pdfToMarkdown(inputPath, outputPath);
      case '.pdf_to_.html':
        return await this.pdfToHtml(inputPath, outputPath);
      case '.pdf_to_.png':
      case '.pdf_to_.jpg':
        return await this.pdfToImage(inputPath, outputPath, targetFormat, options);

      // Word 文档转换
      case '.docx_to_.txt':
        return await this.docxToText(inputPath, outputPath);
      case '.docx_to_.md':
        return await this.docxToMarkdown(inputPath, outputPath);
      case '.docx_to_.html':
        return await this.docxToHtml(inputPath, outputPath);
      case '.docx_to_.pdf':
        return await this.docxToPdf(inputPath, outputPath);

      // Excel 转换
      case '.xlsx_to_.csv':
        return await this.xlsxToCsv(inputPath, outputPath, options);
      case '.xlsx_to_.json':
        return await this.xlsxToJson(inputPath, outputPath, options);
      case '.xlsx_to_.html':
        return await this.xlsxToHtml(inputPath, outputPath, options);

      // Markdown 转换
      case '.md_to_.html':
        return await this.markdownToHtml(inputPath, outputPath);
      case '.md_to_.pdf':
        return await this.markdownToPdf(inputPath, outputPath);
      case '.md_to_.docx':
        return await this.markdownToDocx(inputPath, outputPath);

      // HTML 转换
      case '.html_to_.pdf':
        return await this.htmlToPdf(inputPath, outputPath, options);
      case '.html_to_.md':
        return await this.htmlToMarkdown(inputPath, outputPath);
      case '.html_to_.png':
      case '.html_to_.jpg':
        return await this.htmlToImage(inputPath, outputPath, targetFormat, options);

      // 文本转换
      case '.txt_to_.md':
        return await this.textToMarkdown(inputPath, outputPath);
      case '.txt_to_.html':
        return await this.textToHtml(inputPath, outputPath);
      case '.txt_to_.pdf':
        return await this.textToPdf(inputPath, outputPath);

      default:
        throw new Error(`不支持的转换: ${inputExt} -> ${outputExt}`);
    }
      const content = await fs.readFile(outputPath);
      this.convertCache.set(cacheKey, content);
    if (this.convertCache.size > this.maxCacheSize) {
      const oldestKey = this.convertCache.keys().next().value;
      this.convertCache.delete(oldestKey);
      console.log(`内存优化: 删除旧缓存 ${oldestKey}`);
    }
    console.log(`转换完成: ${outputPath}`);
    return result;
    } catch (error) {
      console.error(`转换错误: ${inputPath} -> ${targetFormat} - ${error.message}`);
      throw new Error(`转换失败: ${error.message}`);
    }
  }

  // PDF 转换方法
  async pdfToText(inputPath, outputPath) {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(inputPath);
    const data = await pdfParse(dataBuffer);
    await fs.writeFile(outputPath, data.text, 'utf8');
    return { message: `成功提取 ${data.numpages} 页文本` };
  }

  async pdfToMarkdown(inputPath, outputPath) {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(inputPath);
    const data = await pdfParse(dataBuffer);
    
    // 简单的文本到Markdown转换
    let markdown = data.text
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // 检测可能的标题
        if (paragraph.length < 100 && !paragraph.includes('.')) {
          return `## ${paragraph}`;
        }
        return paragraph;
      })
      .join('\n\n');

    await fs.writeFile(outputPath, markdown, 'utf8');
    return { message: `成功转换 ${data.numpages} 页为Markdown` };
  }

  async pdfToHtml(inputPath, outputPath) {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(inputPath);
    const data = await pdfParse(dataBuffer);
    
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PDF转换结果</title>
</head>
<body>
    <pre>${data.text}</pre>
</body>
</html>`;

    await fs.writeFile(outputPath, html, 'utf8');
    return { message: `成功转换 ${data.numpages} 页为HTML` };
  }

  async pdfToImage(inputPath, outputPath, format, options = {}) {
    // 这里需要使用pdf2pic或类似库，暂时返回错误
    throw new Error('PDF转图片功能需要额外配置，请安装pdf2pic库');
  }

  // Word 文档转换方法
  async docxToText(inputPath, outputPath) {
    const buffer = await fs.readFile(inputPath);
    const result = await mammoth.extractRawText({ buffer });
    await fs.writeFile(outputPath, result.value, 'utf8');
    return { message: '成功提取Word文档文本' };
  }

  async docxToMarkdown(inputPath, outputPath) {
    const buffer = await fs.readFile(inputPath);
    const result = await mammoth.convertToMarkdown({ buffer });
    await fs.writeFile(outputPath, result.value, 'utf8');
    return { message: '成功转换Word文档为Markdown' };
  }

  async docxToHtml(inputPath, outputPath) {
    const buffer = await fs.readFile(inputPath);
    const result = await mammoth.convertToHtml({ buffer });
    await fs.writeFile(outputPath, result.value, 'utf8');
    return { message: '成功转换Word文档为HTML' };
  }

  async docxToPdf(inputPath, outputPath) {
    // 通过HTML中转
    const tempHtml = outputPath.replace(/\.pdf$/, '.temp.html');
    await this.docxToHtml(inputPath, tempHtml);
    await this.htmlToPdf(tempHtml, outputPath);
    await fs.unlink(tempHtml);
    return { message: '成功转换Word文档为PDF' };
  }

  // Excel 转换方法
  async xlsxToCsv(inputPath, outputPath, options = {}) {
    const workbook = XLSX.readFile(inputPath);
    const sheetName = options.sheet || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    await fs.writeFile(outputPath, csv, 'utf8');
    return { message: `成功转换工作表 "${sheetName}" 为CSV` };
  }

  async xlsxToJson(inputPath, outputPath, options = {}) {
    const workbook = XLSX.readFile(inputPath);
    const result = {};
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    }
    
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
    return { message: `成功转换 ${workbook.SheetNames.length} 个工作表为JSON` };
  }

  async xlsxToHtml(inputPath, outputPath, options = {}) {
    const workbook = XLSX.readFile(inputPath);
    const sheetName = options.sheet || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Excel转换结果</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
    
    await fs.writeFile(outputPath, fullHtml, 'utf8');
    return { message: `成功转换工作表 "${sheetName}" 为HTML` };
  }

  // Markdown 转换方法
  async markdownToHtml(inputPath, outputPath) {
    const markdown = await fs.readFile(inputPath, 'utf8');
    const html = marked(markdown);
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown转换结果</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
    
    await fs.writeFile(outputPath, fullHtml, 'utf8');
    return { message: '成功转换Markdown为HTML' };
  }

  async markdownToPdf(inputPath, outputPath) {
    const tempHtml = outputPath.replace(/\.pdf$/, '.temp.html');
    await this.markdownToHtml(inputPath, tempHtml);
    await this.htmlToPdf(tempHtml, outputPath);
    await fs.unlink(tempHtml);
    return { message: '成功转换Markdown为PDF' };
  }

  async markdownToDocx(inputPath, outputPath) {
    try {
      // 读取Markdown文件
      const markdown = await fs.readFile(inputPath, 'utf8');
      
      // 转换为HTML
      const html = marked(markdown);
      
      // 创建临时HTML文件
      const tempHtml = outputPath.replace(/\.docx$/, '.temp.html');
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown转换结果</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
      
      await fs.writeFile(tempHtml, fullHtml, 'utf8');
      
      // 使用puppeteer生成PDF，然后转换为Word格式
      // 由于直接转换为Word格式比较复杂，我们先生成一个富文本HTML
      // 然后使用mammoth的反向功能或其他方法
      
      // 简化方案：创建一个包含样式的HTML文件，用户可以手动复制到Word中
       // 或者我们可以生成RTF格式，Word可以直接打开
       const rtfContent = this.htmlToRtf(html);
       const rtfPath = outputPath.replace(/\.docx$/, '.rtf').replace(/\//g, path.sep);
       console.log('生成RTF文件路径:', rtfPath);
       await fs.writeFile(rtfPath, rtfContent, 'utf8');
       console.log('RTF文件已生成');
      
      // 清理临时文件
      await fs.unlink(tempHtml);
      
      return { 
        message: `成功转换Markdown为RTF格式 (${rtfPath})，可以用Word打开并另存为DOCX格式`,
        outputPath: rtfPath
      };
    } catch (error) {
      throw new Error(`Markdown转Word转换失败: ${error.message}`);
    }
  }
  
  // 简单的HTML到RTF转换器
  htmlToRtf(html) {
    // RTF文档头
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ';
    
    // 简单的HTML标签转RTF
    let content = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\\fs32\\b $1\\b0\\fs24\\par ')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\\fs28\\b $1\\b0\\fs24\\par ')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\\fs26\\b $1\\b0\\fs24\\par ')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\\par ')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '\\b $1\\b0 ')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '\\b $1\\b0 ')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '\\i $1\\i0 ')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\i $1\\i0 ')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '\\f1 $1\\f0 ')
      .replace(/<br\s*\/?>/gi, '\\line ')
      .replace(/<[^>]+>/g, '') // 移除其他HTML标签
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    rtf += content + '}';
    return rtf;
  }

  // HTML 转换方法
  async htmlToPdf(inputPath, outputPath, options = {}) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    const html = await fs.readFile(inputPath, 'utf8');
    await page.setContent(html);
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      ...options
    });
    
    await page.close();
    return { message: '成功转换HTML为PDF' };
  }

  async htmlToMarkdown(inputPath, outputPath) {
    const html = await fs.readFile(inputPath, 'utf8');
    const markdown = this.turndownService.turndown(html);
    await fs.writeFile(outputPath, markdown, 'utf8');
    return { message: '成功转换HTML为Markdown' };
  }

  async htmlToImage(inputPath, outputPath, format, options = {}) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    const html = await fs.readFile(inputPath, 'utf8');
    await page.setContent(html);
    
    const screenshot = await page.screenshot({
      type: format === 'jpg' ? 'jpeg' : 'png',
      quality: format === 'jpg' ? (options.quality || 80) : undefined,
      fullPage: true
    });
    
    await fs.writeFile(outputPath, screenshot);
    await page.close();
    return { message: `成功转换HTML为${format.toUpperCase()}` };
  }

  // 文本转换方法
  async textToMarkdown(inputPath, outputPath) {
    const text = await fs.readFile(inputPath, 'utf8');
    const markdown = text
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
    
    await fs.writeFile(outputPath, markdown, 'utf8');
    return { message: '成功转换文本为Markdown' };
  }

  async textToHtml(inputPath, outputPath) {
    const text = await fs.readFile(inputPath, 'utf8');
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>文本转换结果</title>
</head>
<body>
    <pre>${text}</pre>
</body>
</html>`;
    
    await fs.writeFile(outputPath, html, 'utf8');
    return { message: '成功转换文本为HTML' };
  }

  async textToPdf(inputPath, outputPath) {
    const tempHtml = outputPath.replace(/\.pdf$/, '.temp.html');
    await this.textToHtml(inputPath, tempHtml);
    await this.htmlToPdf(tempHtml, outputPath);
    await fs.unlink(tempHtml);
    return { message: '成功转换文本为PDF' };
  }

  // 获取文档信息
  async getDocumentInfo(filePath) {
    if (this.infoCache.has(filePath)) {
      return this.infoCache.get(filePath);
    }
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mime.lookup(filePath) || 'unknown';
    
    const info = {
      path: filePath,
      name: path.basename(filePath),
      extension: ext,
      mimeType,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };

    // 根据文件类型获取额外信息
    try {
      switch (ext) {
        case '.pdf':
          const pdfParse = (await import('pdf-parse')).default;
          const pdfBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          info.pages = pdfData.numpages;
          info.textLength = pdfData.text.length;
          break;
        
        case '.xlsx':
        case '.xls':
          const workbook = XLSX.readFile(filePath);
          info.sheets = workbook.SheetNames;
          info.sheetCount = workbook.SheetNames.length;
          break;
        
        case '.docx':
          const docBuffer = await fs.readFile(filePath);
          const docResult = await mammoth.extractRawText({ buffer: docBuffer });
          info.textLength = docResult.value.length;
          break;
      }
    } catch (error) {
      info.error = `无法获取详细信息: ${error.message}`;
    }
    this.infoCache.set(filePath, info);
    if (this.infoCache.size > this.maxCacheSize) {
      const oldestKey = this.infoCache.keys().next().value;
      this.infoCache.delete(oldestKey);
      console.log(`内存优化: 删除旧信息缓存 ${oldestKey}`);
    }
    return info;
  }

  // 批量转换
  async batchConvert(inputDir, outputDir, targetFormat, filePattern = '*') {
    try {
      const files = await fs.readdir(inputDir);
      const results = {
        success: 0,
        failed: 0,
        details: []
      };

      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`开始批量转换: ${inputDir} -> ${outputDir} (${targetFormat})`);

      const conversionPromises = files.map(async (file) => {
        const inputPath = path.join(inputDir, file);
        const stats = await fs.stat(inputPath);
        
        if (stats.isFile()) {
          try {
            const baseName = path.parse(file).name;
            const outputPath = path.join(outputDir, `${baseName}.${targetFormat}`);
            
            await this.convert(inputPath, outputPath, targetFormat);
            return `✓ ${file} -> ${baseName}.${targetFormat}`;
          } catch (error) {
            console.error(`批量转换错误: ${file} - ${error.message}`);
            return `✗ ${file}: ${error.message}`;
          }
        }
        return null;
      });

      const conversionResults = await Promise.all(conversionPromises);
      conversionResults.forEach(result => {
        if (result) {
          if (result.startsWith('✓')) {
            results.success++;
          } else {
            results.failed++;
          }
          results.details.push(result);
        }
      });

      console.log(`批量转换完成: 成功 ${results.success}, 失败 ${results.failed}`);
      return results;
    } catch (error) {
      console.error(`批量转换失败: ${error.message}`);
      throw error;
    }
  }
}