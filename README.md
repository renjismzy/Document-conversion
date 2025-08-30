# Document Conversion MCP

一个强大的文档格式转换MCP (Model Context Protocol) 工具，支持多种文档格式之间的相互转换。

## 🌟 特性

- **多格式支持**: 支持PDF、Word、Excel、PowerPoint、Markdown、HTML、文本等多种格式
- **批量转换**: 支持批量处理多个文档
- **MCP协议**: 完全兼容Model Context Protocol标准
- **本地运行**: 在本地安装并运行，加速启动
- **跨平台**: 支持任何有Node.js环境的系统
- **性能优化**: 浏览器实例复用减少启动开销

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
- npm 包管理器
- 支持MCP协议的客户端

### 本地部署配置（推荐）

本项目支持本地安装和运行，以加速配置加载。

#### MCP配置文件

在您的MCP客户端配置文件中添加以下配置（假设项目位于 e:\Document-conversion）：

```json
{
  "mcpServers": {
    "document-conversion": {
      "command": "node",
      "args": [
        "e:\\Document-conversion\\mcp-tools.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 本地部署优势

- ✅ **快速启动**: 使用本地文件，避免下载延迟
- ✅ **离线可用**: 无需网络连接
- ✅ **自定义修改**: 易于本地调试和修改
- ✅ **跨平台**: 在任何支持Node.js的环境中运行
- ✅ **浏览器复用**: 在转换中使用共享浏览器实例，减少重复启动开销，提高效率。

#### 使用步骤

1. **确保环境**: 安装Node.js 18.0.0+和npm
2. **安装依赖**: 在项目目录运行 `npm install`
3. **配置MCP**: 将上述配置添加到您的MCP客户端
4. **启动服务**: MCP客户端会直接启动本地服务
5. **开始使用**: 立即可用统一的文档转换工具，支持8种操作



## 🛠️ 统一转换工具

托管部署后，您将获得一个强大的统一文档转换工具 `document_converter`，支持8种不同的操作：

### 使用方法

所有功能都通过 `document_converter` 工具实现，通过 `operation` 参数指定具体操作：

#### 1. 文档格式转换 (convert)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "convert",
    "input_path": "./documents/report.docx",
    "output_path": "./output/report.pdf",
    "target_format": "pdf",
    "options": {
      "quality": 90
    }
  }
}
```

#### 2. 获取文档信息 (get_info)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "get_info",
    "file_path": "./documents/report.docx"
  }
}
```

#### 3. 批量转换 (batch_convert)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "batch_convert",
    "input_directory": "./documents",
    "output_directory": "./output",
    "target_format": "pdf",
    "file_pattern": "*.docx"
  }
}
```

#### 4. 列出支持格式 (list_formats)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "list_formats"
  }
}
```

#### 5. 文件验证 (validate_file)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "validate_file",
    "file_path": "./documents/report.docx"
  }
}
```

#### 6. 目录扫描 (scan_directory)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "scan_directory",
    "directory_path": "./documents",
    "file_extensions": ["docx", "pdf", "txt"]
  }
}
```

#### 7. 转换预览 (preview_conversion)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "preview_conversion",
    "input_path": "./documents/report.docx",
    "target_format": "pdf"
  }
}
```

#### 8. 状态检查 (check_status)
```json
{
  "tool": "document_converter",
  "arguments": {
    "operation": "check_status"
  }
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

### 环境变量

- **NODE_ENV**: 运行环境 (production/development)
- **MCP_SERVER_NAME**: MCP服务器名称

## 🐛 故障排除

### 常见问题

1. **npx下载失败**
   - 检查网络连接
   - 确保npm版本为最新
   - 尝试清除npm缓存: `npm cache clean --force`

2. **Node.js版本不兼容**
   - 确保使用Node.js 18.0.0或更高版本
   - 使用nvm管理Node.js版本

3. **权限问题**
   - 在Windows上以管理员身份运行
   - 在Linux/macOS上使用sudo（如需要）

4. **PDF转换失败**
   - 确保PDF文件没有密码保护
   - 检查文件路径是否正确

### 调试模式

如需调试，可以设置环境变量：
```bash
DEBUG=* npx --yes --package=https://github.com/renjismzy/Document-conversion.git -- node ./mcp-tools.js
```

## 🔄 版本更新

使用托管部署的优势之一是自动更新。每次启动MCP服务器时，npx会自动检查并下载最新版本。

如果您想强制更新到最新版本：
```bash
npm cache clean --force
```

### 更新日志
- v1.0.0: 初始版本，支持基本转换
- v1.1.0: 添加批量转换和文档信息提取
- v1.2.0: 改进错误处理和添加更多格式支持
- v1.3.0: 添加浏览器实例复用优化

## 📞 支持与贡献

### 获取帮助

- 📋 [提交Issue](https://github.com/renjismzy/Document-conversion/issues)
- 📖 [查看Wiki](https://github.com/renjismzy/Document-conversion/wiki)
- 💬 [讨论区](https://github.com/renjismzy/Document-conversion/discussions)

### 贡献代码

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**Document Conversion MCP** - 让文档转换变得简单高效！ 🚀

> 💡 **提示**: 推荐使用托管部署方式，享受零配置、自动更新的便利体验！