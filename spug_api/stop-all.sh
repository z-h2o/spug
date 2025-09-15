#!/bin/bash
# Spug 一键停止脚本
# 作者: AI Assistant
# 功能: 一键停止所有 Spug 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

echo "=========================================="
echo "        Spug 项目一键停止脚本"
echo "=========================================="
echo

log_info "开始停止 Spug 服务..."

# 停止服务函数
stop_service() {
    local service_name=$1
    local pid_file="$PROJECT_DIR/logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "停止 ${service_name} 服务 (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            
            # 等待进程结束
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # 如果还没结束，强制杀死
            if kill -0 "$pid" 2>/dev/null; then
                log_warning "强制停止 ${service_name} 服务..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            log_success "${service_name} 服务已停止"
        else
            log_warning "${service_name} 服务进程不存在"
        fi
        rm -f "$pid_file"
    else
        log_warning "未找到 ${service_name} 服务的 PID 文件"
    fi
}

# 按照关键程度停止服务
services=("api" "ws" "worker" "scheduler" "monitor")

for service in "${services[@]}"; do
    stop_service "$service"
done

# 检查端口是否还有占用
log_info "检查端口占用情况..."

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        log_warning "端口 $port ($service) 仍被进程 $pid 占用"
        read -p "是否强制杀死该进程？ (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill -9 $pid 2>/dev/null || true
            log_success "已强制停止进程 $pid"
        fi
    else
        log_success "端口 $port ($service) 已释放"
    fi
}

check_port 9001 "API服务"
check_port 9002 "WebSocket服务"

# 清理可能残留的 Python 进程
log_info "清理可能残留的 Spug 相关进程..."

# 查找包含 spug 相关关键词的 Python 进程
spug_processes=$(ps aux | grep python | grep -E "(manage\.py|spug|gunicorn|daphne)" | grep -v grep | awk '{print $2}' || true)

if [ -n "$spug_processes" ]; then
    log_warning "发现可能的 Spug 相关进程:"
    ps aux | grep python | grep -E "(manage\.py|spug|gunicorn|daphne)" | grep -v grep
    echo
    read -p "是否停止这些进程？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$spug_processes" | xargs kill 2>/dev/null || true
        log_success "已停止相关进程"
    fi
else
    log_success "未发现残留的 Spug 进程"
fi

# 清理日志文件（可选）
if [ -d "$PROJECT_DIR/logs" ]; then
    echo
    read -p "是否清理日志文件？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$PROJECT_DIR/logs"/*.log
        rm -f "$PROJECT_DIR/logs"/*.pid
        log_success "日志文件已清理"
    fi
fi

echo
log_success "🛑 所有 Spug 服务已停止！"
echo
log_info "如果需要重新启动，请运行: ./start-all.sh"
echo
