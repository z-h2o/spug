#!/bin/bash
# Spug 服务状态检查脚本
# 作者: AI Assistant
# 功能: 检查所有 Spug 服务的运行状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_status() {
    echo -e "${CYAN}[STATUS]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

echo "=========================================="
echo "        Spug 项目状态检查"
echo "=========================================="
echo

# 检查服务状态
check_service_status() {
    local service_name=$1
    local port=$2
    local pid_file="$PROJECT_DIR/logs/${service_name}.pid"
    
    echo "🔍 检查 ${service_name} 服务:"
    
    # 检查 PID 文件
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "  ✅ 进程状态: 运行中 (PID: $pid)"
            
            # 检查进程详情
            local process_info=$(ps -p "$pid" -o pid,ppid,pcpu,pmem,etime,cmd --no-headers 2>/dev/null || echo "")
            if [ -n "$process_info" ]; then
                echo "  📊 进程信息: $process_info"
            fi
        else
            echo "  ❌ 进程状态: 已停止 (PID文件存在但进程不存在)"
            rm -f "$pid_file"
        fi
    else
        echo "  ❓ 进程状态: 未知 (无PID文件)"
    fi
    
    # 检查端口占用
    if [ -n "$port" ]; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local port_pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
            echo "  🌐 端口状态: $port 已监听 (PID: $port_pid)"
        else
            echo "  ❌ 端口状态: $port 未监听"
        fi
    fi
    
    # 检查日志文件
    local log_file="$PROJECT_DIR/logs/${service_name}.log"
    if [ -f "$log_file" ]; then
        local log_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo "0")
        local log_lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
        echo "  📋 日志文件: 存在 (大小: ${log_size} 字节, 行数: ${log_lines})"
        
        # 检查最近的错误
        local recent_errors=$(tail -n 50 "$log_file" 2>/dev/null | grep -i "error\|exception\|failed\|traceback" | wc -l || echo "0")
        if [ "$recent_errors" -gt "0" ]; then
            echo "  ⚠️  最近错误: 发现 $recent_errors 条错误信息"
        else
            echo "  ✅ 最近错误: 无错误信息"
        fi
    else
        echo "  ❓ 日志文件: 不存在"
    fi
    
    echo
}

# 检查系统依赖
check_dependencies() {
    echo "🔍 检查系统依赖:"
    
    # 检查 Python
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version 2>&1)
        echo "  ✅ Python: $python_version"
    else
        echo "  ❌ Python: 未安装"
    fi
    
    # 检查虚拟环境
    if [ -d "$PROJECT_DIR/venv" ]; then
        echo "  ✅ 虚拟环境: 存在"
        if [ "$VIRTUAL_ENV" = "$PROJECT_DIR/venv" ]; then
            echo "  ✅ 虚拟环境: 已激活"
        else
            echo "  ⚠️  虚拟环境: 未激活"
        fi
    else
        echo "  ❌ 虚拟环境: 不存在"
    fi
    
    # 检查 Redis
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            local redis_info=$(redis-cli info server | grep "redis_version" | cut -d: -f2 | tr -d '\r' || echo "未知")
            echo "  ✅ Redis: 运行中 (版本: $redis_info)"
        else
            echo "  ❌ Redis: 未运行"
        fi
    else
        echo "  ❌ Redis: 未安装"
    fi
    
    echo
}

# 检查数据库状态
check_database() {
    echo "🔍 检查数据库状态:"
    
    cd "$PROJECT_DIR"
    
    # 检查数据库文件
    if [ -f "db.sqlite3" ]; then
        local db_size=$(stat -f%z "db.sqlite3" 2>/dev/null || stat -c%s "db.sqlite3" 2>/dev/null || echo "0")
        echo "  ✅ 数据库文件: 存在 (大小: ${db_size} 字节)"
    else
        echo "  ❌ 数据库文件: 不存在"
        return
    fi
    
    # 检查迁移状态
    if command -v python3 &> /dev/null && [ -f "manage.py" ]; then
        local pending_migrations=$(python3 manage.py showmigrations --plan 2>/dev/null | grep '\[ \]' | wc -l || echo "0")
        if [ "$pending_migrations" -eq "0" ]; then
            echo "  ✅ 数据库迁移: 已完成"
        else
            echo "  ⚠️  数据库迁移: 有 $pending_migrations 个待应用的迁移"
        fi
        
        # 检查用户数量
        local user_count=$(python3 manage.py shell -c "from apps.account.models import User; print(User.objects.count())" 2>/dev/null || echo "0")
        echo "  📊 用户数量: $user_count"
    else
        echo "  ❓ 无法检查迁移状态"
    fi
    
    echo
}

# 检查网络连接
check_network() {
    echo "🔍 检查网络连接:"
    
    # 测试 API 服务
    if curl -s --connect-timeout 5 http://127.0.0.1:9001/api/account/login/ >/dev/null 2>&1; then
        echo "  ✅ API 服务: 可访问 (http://127.0.0.1:9001)"
    else
        echo "  ❌ API 服务: 无法访问"
    fi
    
    # 测试 WebSocket 端口
    if nc -z 127.0.0.1 9002 2>/dev/null; then
        echo "  ✅ WebSocket: 端口开放 (ws://127.0.0.1:9002)"
    else
        echo "  ❌ WebSocket: 端口未开放"
    fi
    
    echo
}

# 显示系统资源使用情况
show_system_resources() {
    echo "🔍 系统资源使用情况:"
    
    # CPU 使用率
    if command -v top &> /dev/null; then
        local cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "未知")
        echo "  💻 CPU 使用率: ${cpu_usage}%"
    fi
    
    # 内存使用情况
    if command -v free &> /dev/null; then
        local mem_info=$(free -h | grep "Mem:" | awk '{print "已用: " $3 "/" $2 " (" $3/$2*100 "%)"}' 2>/dev/null || echo "未知")
        echo "  🧠 内存使用: $mem_info"
    elif command -v vm_stat &> /dev/null; then
        local mem_pressure=$(memory_pressure 2>/dev/null | grep "System-wide memory" | awk '{print $4}' || echo "未知")
        echo "  🧠 内存压力: $mem_pressure"
    fi
    
    # 磁盘空间
    local disk_usage=$(df -h . | tail -1 | awk '{print "已用: " $3 "/" $2 " (" $5 ")"}' 2>/dev/null || echo "未知")
    echo "  💾 磁盘使用: $disk_usage"
    
    echo
}

# 显示最近的日志
show_recent_logs() {
    echo "🔍 最近的日志信息:"
    
    local services=("api" "ws" "worker" "scheduler" "monitor")
    
    for service in "${services[@]}"; do
        local log_file="$PROJECT_DIR/logs/${service}.log"
        if [ -f "$log_file" ]; then
            echo "  📋 ${service} 服务最近日志:"
            tail -n 3 "$log_file" 2>/dev/null | sed 's/^/    /' || echo "    无法读取日志"
        fi
    done
    
    echo
}

# 提供操作建议
show_suggestions() {
    echo "🔍 操作建议:"
    
    local all_running=true
    local services=("api" "ws" "worker" "scheduler" "monitor")
    
    for service in "${services[@]}"; do
        local pid_file="$PROJECT_DIR/logs/${service}.pid"
        if [ ! -f "$pid_file" ] || ! kill -0 "$(cat "$pid_file")" 2>/dev/null; then
            all_running=false
            break
        fi
    done
    
    if $all_running; then
        echo "  ✅ 所有服务运行正常"
        echo "  💡 建议操作:"
        echo "    - 查看详细日志: tail -f logs/api.log"
        echo "    - 测试API接口: curl http://127.0.0.1:9001/api/account/login/"
        echo "    - 停止服务: ./stop-all.sh"
    else
        echo "  ⚠️  发现服务异常"
        echo "  💡 建议操作:"
        echo "    - 启动所有服务: ./start-all.sh"
        echo "    - 查看错误日志: tail -f logs/*.log"
        echo "    - 检查端口占用: lsof -i :9001 -i :9002"
    fi
    
    echo
}

# 主函数
main() {
    # 检查各个组件
    check_dependencies
    check_database
    
    # 检查服务状态
    check_service_status "api" "9001"
    check_service_status "ws" "9002"
    check_service_status "worker" ""
    check_service_status "scheduler" ""
    check_service_status "monitor" ""
    
    # 检查网络
    check_network
    
    # 显示系统资源
    show_system_resources
    
    # 显示最近日志
    show_recent_logs
    
    # 显示建议
    show_suggestions
    
    echo "=========================================="
    echo "状态检查完成! 当前时间: $(date)"
    echo "=========================================="
}

# 处理命令行参数
case "${1:-}" in
    --help|-h)
        echo "用法: $0 [选项]"
        echo "选项:"
        echo "  --help, -h     显示此帮助信息"
        echo "  --watch, -w    持续监控模式"
        echo "  --simple, -s   简化输出"
        exit 0
        ;;
    --watch|-w)
        echo "进入持续监控模式 (按 Ctrl+C 退出)..."
        while true; do
            clear
            main
            sleep 10
        done
        ;;
    --simple|-s)
        # 简化模式，只显示核心状态
        echo "Spug 服务状态:"
        services=("api:9001" "ws:9002" "worker:" "scheduler:" "monitor:")
        for service_port in "${services[@]}"; do
            IFS=':' read -r service port <<< "$service_port"
            pid_file="$PROJECT_DIR/logs/${service}.pid"
            if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
                echo "  ✅ $service"
            else
                echo "  ❌ $service"
            fi
        done
        ;;
    *)
        main
        ;;
esac
