/**
 * HTTP 请求封装
 */
import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { X_TOKEN } from '@/utils/auth';

// 创建 axios 实例
const http = axios.create({
  timeout: 30000,
});

// 响应处理函数
function handleResponse(response: AxiosResponse): any {
  let result: string | undefined;
  if (response.status === 401) {
    result = '会话过期，请重新登录';
    if (window.location.pathname !== '/') {
      window.location.href = '/?from=' + encodeURIComponent(window.location.pathname);
    } else {
      return Promise.reject();
    }
  } else if (response.status === 200) {
    if (response.data.error) {
      result = response.data.error;
    } else if (Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return Promise.resolve(response.data.data);
    } else if (response.headers['content-type'] === 'application/octet-stream') {
      return Promise.resolve(response);
    } else if (!(response.config as any).isInternal) {
      return Promise.resolve(response.data);
    } else {
      result = '无效的数据格式';
    }
  } else {
    result = `请求失败: ${response.status} ${response.statusText}`;
  }
  message.error(result);
  return Promise.reject(result);
}

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 标记内部API请求
    (config as any).isInternal = config.url?.startsWith('/api/');
    
    // 为内部API请求添加认证头
    if ((config as any).isInternal && X_TOKEN) {
      config.headers['X-Token'] = X_TOKEN;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return handleResponse(response);
  },
  (error: AxiosError) => {
    if (error.response) {
      return handleResponse(error.response);
    }
    const result = '请求异常: ' + error.message;
    message.error(result);
    return Promise.reject(result);
  }
);

export default http;
