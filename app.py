#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MCP Document Conversion Server for ModelScope
魔搭平台MCP文档转换服务器
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_node_installation():
    """检查Node.js是否已安装"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"Node.js version: {version}")
            return True
    except FileNotFoundError:
        pass
    return False

def install_dependencies():
    """安装项目依赖"""
    try:
        print("Installing Node.js dependencies...")
        result = subprocess.run(['npm', 'install'], cwd=Path(__file__).parent, capture_output=True, text=True)
        if result.returncode == 0:
            print("Dependencies installed successfully")
            return True
        else:
            print(f"Failed to install dependencies: {result.stderr}")
            return False
    except Exception as e:
        print(f"Error installing dependencies: {e}")
        return False

def start_mcp_server():
    """启动MCP服务器"""
    try:
        print("Starting MCP Document Conversion Server...")
        # 使用统一工具服务器
        process = subprocess.Popen(
            ['node', 'mcp-tools.js'],
            cwd=Path(__file__).parent,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print(f"MCP Server started with PID: {process.pid}")
        print("Server is running on stdio transport")
        
        # 保持进程运行
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\nShutting down MCP server...")
            process.terminate()
            process.wait()
            
    except Exception as e:
        print(f"Error starting MCP server: {e}")
        sys.exit(1)

def main():
    """主函数"""
    print("=== MCP Document Conversion Server ===")
    print("魔搭平台MCP文档转换服务器")
    
    # 检查Node.js
    if not check_node_installation():
        print("Error: Node.js is not installed or not in PATH")
        print("Please install Node.js 18.0.0 or higher")
        sys.exit(1)
    
    # 安装依赖
    if not install_dependencies():
        print("Failed to install dependencies")
        sys.exit(1)
    
    # 启动服务器
    start_mcp_server()

if __name__ == "__main__":
    main()