# Document Conversion MCP

一个强大的文档格式转换MCP (Model Context Protocol) 工具，支持多种文档格式之间的相互转换。

## 🌟 特性

- **多格式支持**: 支持PDF、Word、Excel、PowerPoint、Markdown、HTML、文本等多种格式
- **批量转换**: 支持批量处理多个文档
- **MCP协议**: 完全兼容Model Context Protocol标准
- **易于使用**: 简单的API接口，易于集成
- **高质量转换**: 保持文档格式和内容的完整性
- **可配置选项**: 支持自定义转换参数

## 📋 支持的格式

### 输入格式
- **PDF** (.pdf)
- **Microsoft Word** (.docx, .doc)
- **Microsoft Excel** (.xlsx, .xls)
- **Microsoft PowerPoint** (.pptx, .ppt)
- **Markdown** (.md, .markdown)
- **HTML** (.html, .htm)
- **纯文本** (.txt)
- **CSV** (.csv)
- **JSON** (.json)

### 输出格式
- **PDF** (.pdf)
- **Microsoft Word** (.docx)
- **Microsoft Excel** (.xlsx)
- **Microsoft PowerPoint** (.pptx)
- **HTML** (.html)
- **Markdown** (.md)
- **纯文本** (.txt)
- **CSV** (.csv)
- **JSON** (.json)
- **图片** (.png, .jpg)

## 🚀 快速开始

### 系统要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器

### 安装

1. **克隆项目**
```bash
git clone https://github.com/renjismzy/Document-conversion.git
cd Document-conversion
```

2. **自动安装**
```bash
node install.js
```

或者手动安装：

```bash
npm install
```

### 启动服务器

```bash
# 使用启动脚本
node start.js

# 或者直接启动
npm start

# 开发模式
npm run dev
```

## 🛠️ 使用方法

### 1. 转换单个文档

```javascript
{
  "tool": "convert_document",
  "parameters": {
    "input_path": "./documents/sample.pdf",
    "output_path": "./output/sample.txt",
    "target_format": "txt",
    "options": {
      "quality": 80,
      "page_range": "1-5"
    }
  }
}
```

### 2. 获取文档信息

```javascript
{
  "tool": "get_document_info",
  "parameters": {
    "file_path": "./documents/sample.pdf"
  }
}
```

### 3. 批量转换

```javascript
{
  "tool": "batch_convert",
  "parameters": {
    "input_directory": "./input",
    "output_directory": "./output",
    "target_format": "pdf",
    "file_pattern": "*.docx"
  }
}
```

### 4. 查看支持的格式

```javascript
{
  "tool": "list_supported_formats",
  "parameters": {}
}
```

## 📖 转换示例

### PDF 转换
- PDF → 文本: 提取PDF中的文本内容
- PDF → Markdown: 转换为Markdown格式，自动识别标题
- PDF → HTML: 转换为HTML网页格式
- PDF → 图片: 将PDF页面转换为PNG/JPG图片

### Word 文档转换
- Word → PDF: 保持格式的PDF转换
- Word → HTML: 转换为网页格式
- Word → Markdown: 提取文本并转换为Markdown
- Word → 文本: 纯文本提取

### Excel 转换
- Excel → CSV: 转换工作表为CSV格式
- Excel → JSON: 将数据转换为JSON格式
- Excel → HTML: 生成HTML表格

### Markdown 转换
- Markdown → HTML: 渲染为HTML网页
- Markdown → PDF: 生成PDF文档
- Markdown → Word: 转换为Word文档

## ⚙️ 配置选项

### 转换选项

- **quality**: 图片质量 (0-100)
- **page_range**: PDF页面范围，如 "1-5" 或 "1,3,5"
- **extract_images**: 是否提取图片
- **sheet**: Excel工作表名称

### 示例配置

```javascript
{
  "options": {
    "quality": 90,
    "page_range": "1-10",
    "extract_images": true
  }
}
```

## 🔧 开发

### 项目结构

```
Document-conversion/
├── src/
│   ├── index.js          # MCP服务器主入口
│   ├── converter.js      # 文档转换核心模块
│   └── utils.js          # 工具函数
├── examples/             # 示例文件目录
│   ├── input/           # 输入示例
│   └── output/          # 输出示例
├── package.json         # 项目配置
├── mcp.json            # MCP服务器配置
├── start.js            # 启动脚本
├── install.js          # 安装脚本
└── README.md           # 项目文档
```

### 添加新的转换格式

1. 在 `src/utils.js` 中添加格式定义
2. 在 `src/converter.js` 中实现转换方法
3. 更新 `mcp.json` 中的支持格式列表

## 🐛 故障排除

### 常见问题

1. **Puppeteer安装失败**
   ```bash
   npm config set puppeteer_skip_chromium_download true
   npm install
   ```

2. **PDF转换失败**
   - 确保PDF文件没有密码保护
   - 检查文件路径是否正确

3. **内存不足**
   - 处理大文件时增加Node.js内存限制
   ```bash
   node --max-old-space-size=4096 src/index.js
   ```

### 日志调试

启用详细日志：
```bash
DEBUG=* node src/index.js
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📞 支持

如果您遇到问题或有建议，请：

- 提交 [Issue](https://github.com/renjismzy/Document-conversion/issues)
- 发送邮件至：support@example.com
- 查看 [Wiki](https://github.com/renjismzy/Document-conversion/wiki) 获取更多信息

---

**Document Conversion MCP** - 让文档转换变得简单高效！ 🚀