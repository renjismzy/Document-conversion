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

### 本地安装

1. **克隆项目**
```bash
git clone https://github.com/renjismzy/Document-conversion.git
```

### 云端部署配置

本项目支持直接从GitHub仓库进行云端部署，无需本地安装。使用以下MCP配置：

```json
{
  "mcpServers": {
    "document-conversion": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=https://github.com/renjismzy/Document-conversion.git",
        "node",
        "mcp-tools.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 云端部署优势
- **无需本地安装**：直接从GitHub仓库运行
- **自动更新**：每次运行获取最新版本
- **跨平台兼容**：支持任何有Node.js环境的系统
- **简化部署**：一个配置文件即可部署

### 魔搭平台部署

本项目已配置支持魔搭平台部署，包含以下配置文件：

- `app.py` - Python入口文件
- `requirements.txt` - Python依赖（本项目主要使用Node.js）
- `modelscope.yaml` - 魔搭平台配置文件
- `Dockerfile` - 容器化部署配置

#### 部署步骤

1. **上传项目到魔搭平台**
   - 将整个项目文件夹上传到魔搭平台
   - 确保包含所有配置文件

2. **配置部署参数**
   - 运行时：Node.js 18.0.0+
   - 入口文件：`app.py`
   - 端口：8000

3. **环境变量设置**
   ```
   NODE_ENV=production
   MCP_SERVER_NAME=document-conversion
   ```

4. **资源配置**
   - CPU: 1核
   - 内存: 2GB
   - 存储: 根据需要调整

#### 部署验证

部署成功后，MCP服务器将在stdio传输模式下运行，支持以下工具：
- `convert_document` - 文档格式转换
- `get_document_info` - 获取文档信息
- `list_supported_formats` - 列出支持格式
- `batch_convert` - 批量转换
- `validate_file` - 文件验证
- `scan_directory` - 目录扫描
- `preview_conversion` - 转换预览
- `check_tool_status` - 状态检查

2. **进入项目目录**
```bash
cd Document-conversion
```

3. **自动安装**
```bash
node install.js
```

或者手动安装：

```bash
npm install
```

### 启动服务器

```bash
# 方式1：使用启动脚本
node start.js

# 方式2：直接启动
npm start

# 方式3：开发模式（自动重启）
npm run dev

# 方式4：使用服务器脚本
npm run server

# 方式5：启动统一工具服务器
npm run tools

# 方式6：统一工具开发模式
npm run tools-dev

# 方式7：使用交互式启动器
npm run launch
```

### 运行示例和测试

```bash
# 运行基础示例
npm run example

# 运行统一工具示例
npm run example-tools

# 运行基础测试
npm test

# 运行统一工具测试
npm run test-tools
```

### 使用交互式启动器

```bash
# 启动交互式启动器，可选择不同的服务器和功能
npm run launch
```

交互式启动器提供以下选项：
- 启动基础MCP服务器
- 启动统一工具服务器
- 运行各种示例和测试
- 安装项目依赖

## 使用示例

### 基础工具

#### convert_document - 文档转换

```javascript
// 将Word文档转换为PDF
{
  "tool": "convert_document",
  "arguments": {
    "input_path": "./documents/report.docx",
    "output_path": "./output/report.pdf",
    "target_format": "pdf"
  }
}
```

#### get_document_info - 获取文档信息

```javascript
// 获取文档基本信息
{
  "tool": "get_document_info",
  "arguments": {
    "file_path": "./documents/report.docx"
  }
}
```

#### batch_convert - 批量转换

```javascript
// 批量转换目录中的所有Word文档为PDF
{
  "tool": "batch_convert",
  "arguments": {
    "input_directory": "./documents",
    "output_directory": "./output",
    "target_format": "pdf",
    "file_pattern": "*.docx"
  }
}
```

#### list_supported_formats - 列出支持格式

```javascript
// 获取所有支持的格式
{
  "tool": "list_supported_formats",
  "arguments": {}
}
```

### 扩展工具

#### validate_file - 文件验证

```javascript
// 验证文件是否存在且可读取
{
  "tool": "validate_file",
  "arguments": {
    "file_path": "./documents/report.docx"
  }
}
```

#### scan_directory - 目录扫描

```javascript
// 扫描目录中的文档文件
{
  "tool": "scan_directory",
  "arguments": {
    "directory_path": "./documents",
    "file_extensions": ["docx", "pdf", "txt"]
  }
}
```

#### preview_conversion - 转换预览

```javascript
// 预览转换操作而不实际执行
{
  "tool": "preview_conversion",
  "arguments": {
    "input_path": "./documents/report.docx",
    "target_format": "pdf"
  }
}
```

#### check_tool_status - 工具状态检查

```javascript
// 检查MCP工具服务器状态
{
  "tool": "check_tool_status",
  "arguments": {}
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
│   ├── index.js                    # MCP服务器主入口
│   ├── converter.js                # 文档转换核心模块
│   └── utils.js                    # 工具函数
├── examples/                       # 示例文件目录
│   ├── input/                     # 输入示例
│   ├── output/                    # 输出示例
│   ├── example-usage.js           # 基础使用示例
│   └── unified-tools-example.js   # 统一工具示例
├── mcp-tools.js                   # 统一工具服务器
├── package.json                   # 项目配置
├── mcp.json                       # MCP服务器配置
├── start.js                       # 启动脚本
├── install.js                     # 安装脚本
├── test.js                        # 基础测试脚本
├── test-unified-tools.js          # 统一工具测试脚本
├── launch.js                      # 交互式启动器
└── README.md                      # 项目文档
```

### 添加新的转换格式

1. 在 `src/utils.js` 中添加格式定义
2. 在 `src/converter.js` 中实现转换方法
3. 更新 `mcp.json` 中的支持格式列表

## 🛠️ 统一工具服务器

统一工具服务器 (`mcp-tools.js`) 集成了所有文档转换工具，提供以下额外功能：

### 扩展工具

- **validate_file**: 验证文件是否存在且可读取
- **scan_directory**: 扫描目录中的文档文件
- **preview_conversion**: 预览转换操作而不实际执行
- **check_tool_status**: 检查MCP工具服务器状态和可用性

### 启动统一工具服务器

```bash
# 启动统一工具服务器
npm run tools

# 开发模式（自动重启）
npm run tools-dev
```

### 运行统一工具示例

```bash
# 运行完整的统一工具示例
npm run example-tools

# 运行统一工具测试套件
npm run test-tools
```

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