// 前端埋点SDK
export class TrackingSDK {
  constructor(config = {}) {
    this.config = {
      endpoint: 'https://example.com/track',
      sender: 'jsonp',
      jsonp: {
        callbackParam: 'callback',
        timeout: 50
      },
      retry: {
        enabled: false,
        maxAttempts: 3,
        backoff: 'exponential',
        baseDelay: 1000
      },
      batch: {
        enabled: true,
        maxSize: 10,
        maxWait: 100
      },
      storage: {
        enabled: true,
        key: 'tracking_data',
        maxSize: 100
      },
      debug: false,
      fallbackSender: false, // 是否启用发送失败时的降级方案
      dataProcessor: (data) => data,
      beforeSend: (data) => data,
      afterSend: (response, data) => { },
      onError: (error, data) => { },
      ...config
    };

    this.isStarted = false;
    this.queue = [];
    this.stats = {
      totalTracked: 0,
      successCount: 0,
      errorCount: 0,
      queueSize: 0,
      lastSendTime: null
    };

    this.observers = new Map();
    this.trackedElements = new Set();
    this.retryQueue = [];
    this.batchTimer = null;

    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    this.setupSenders();
    this.setupStorage();
    this.bindEvents();

    if (this.config.debug) {
      this.enableDebug();
    }
  }

  setupSenders() {
    this.senders = {
      jsonp: this.createJSONPSender(),
      image: this.createImageSender(),
      xhr: this.createXHRSender(),
      fetch: this.createFetchSender()
    };
  }

  createJSONPSender() {
    return (url, data) => {
      return new Promise((resolve, reject) => {
        const callbackName = 'tracking_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2);
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
          cleanup();
          reject('JSONP request timeout');
          // JSONP失败时自动降级到图片请求
          if (this.config.fallbackSender) {
            this.senders.image(url, data).then(resolve).catch(reject);
          }
        }, this.config.jsonp.timeout);

        const cleanup = () => {
          clearTimeout(timeout);
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          delete window[callbackName];
        };

        window[callbackName] = (response) => {
          cleanup();
          resolve(response);
        };

        const params = new URLSearchParams();
        params.append('data', JSON.stringify(data));
        params.append(this.config.jsonp.callbackParam, callbackName);

        script.src = `${url}?${params.toString()}`;
        script.onerror = () => {
          cleanup();
          reject('JSONP request failed');
          // JSONP失败时自动降级到图片请求
          if (this.config.fallbackSender) {
            this.senders.image(url, data).then(resolve).catch(reject);
          }
        };

        document.head.appendChild(script);
      });
    };
  }

  createImageSender() {
    return (url, data) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          reject(new Error('Image request timeout'));
        }, 10000);

        const cleanup = () => {
          clearTimeout(timeout);
          img.onload = img.onerror = null;
        };

        img.onload = () => {
          cleanup();
          resolve({ success: true, method: 'image' });
        };

        img.onerror = () => {
          cleanup();
          reject(new Error('Image request failed'));
        };

        // 将数据编码到URL参数中
        const params = new URLSearchParams();
        params.append('data', encodeURIComponent(JSON.stringify(data)));
        params.append('t', Date.now()); // 防止缓存

        img.src = `${url}?${params.toString()}`;
      });
    };
  }

  createXHRSender() {
    return (url, data) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                resolve({ success: true });
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));
        xhr.timeout = 10000;

        xhr.send(JSON.stringify(data));
      });
    };
  }

  createFetchSender() {
    return (url, data) => {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json().catch(() => ({ success: true }));
      });
    };
  }

  setupStorage() {
    if (!this.config.storage.enabled) return;

    try {
      const stored = localStorage.getItem(this.config.storage.key);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data) && data.length > 0) {
          this.queue.push(...data.slice(0, this.config.storage.maxSize));
          localStorage.removeItem(this.config.storage.key);
          this.log('info', 'Restored data from storage:', data.length);
        }
      }
    } catch (e) {
      this.log('error', 'Failed to restore data from storage:', e);
    }
  }

  saveToStorage() {
    if (!this.config.storage.enabled || this.queue.length === 0) return;

    try {
      const dataToStore = this.queue.slice(0, this.config.storage.maxSize);
      localStorage.setItem(this.config.storage.key, JSON.stringify(dataToStore));
      this.log('info', 'Saved data to storage:', dataToStore.length);
    } catch (e) {
      this.log('error', 'Failed to save data to storage:', e);
    }
  }

  bindEvents() {
    // 页面卸载时保存数据
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
        this.saveToStorage();
      }
    });
  }

  start() {
    if (this.isStarted) return;

    this.isStarted = true;
    this.setupClickTracking();
    this.setupViewTracking();
    this.startBatchProcessor();

    this.log('info', 'TrackingSDK started');
  }

  stop() {
    if (!this.isStarted) return;

    this.isStarted = false;
    this.observers.forEach((observer, type) => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers.clear();

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.log('info', 'TrackingSDK stopped');
  }

  setupClickTracking() {
    // 事件委托处理点击事件
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-spm]');
      if (target) {
        const triggerType = target.getAttribute('data-track-trigger') || 'click';
        if (triggerType === 'click') {
          this.trackElement(target, event);
        }
      }
    }, true);
  }

  setupViewTracking() {
    // 使用MutationObserver监听DOM变化
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              this.scanForViewTrackingElements(node);
            }
          });
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.set('mutation', mutationObserver);

    // 初始扫描现有元素
    this.scanForViewTrackingElements(document.body);

    // 使用IntersectionObserver监听元素可见性
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.trackedElements.has(entry.target)) {
          const element = entry.target;
          const delay = parseInt(element.getAttribute('data-track-delay')) || 0;
          if (delay > 0) {
            setTimeout(() => {
              if (this.isElementVisible(element)) {
                this.trackElement(element);
              }
            }, delay);
          } else {
            this.trackElement(element);
          }
        }
      });
    }, {
      threshold: 0.1, // 10%可见时触发
      rootMargin: '50px' // 提前50px触发
    });

    this.observers.set('intersection', intersectionObserver);
  }

  scanForViewTrackingElements(root) {
    const elements = root.querySelectorAll('[data-spm][data-track-trigger="view"]');
    elements.forEach((element) => {
      if (!this.trackedElements.has(element)) {
        const intersectionObserver = this.observers.get('intersection');
        if (intersectionObserver) {
          intersectionObserver.observe(element);
        }
      }
    });

    // 也检查root元素本身
    if (root.hasAttribute && root.hasAttribute('data-spm') &&
      root.getAttribute('data-track-trigger') === 'view' &&
      !this.trackedElements.has(root)) {
      const intersectionObserver = this.observers.get('intersection');
      if (intersectionObserver) {
        intersectionObserver.observe(root);
      }
    }
  }

  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  trackElement(element, event = null) {
    const spmId = this.getElementTrackingId(element);

    // 用 ID 判断是否已追踪
    if (this.trackedElements.has(spmId)) {
      return;
    }

    this.trackedElements.add(spmId); // 添加 ID

    const spm = element.getAttribute('data-spm');
    if (!spm) return;

    const data = this.buildTrackingData(element, event);
    this.track(data);

    if (this.config.debug) {
      element.classList.add('debug-enabled');
    }
  }

  buildTrackingData(element, event = null) {
    const rect = element.getBoundingClientRect();

    const data = {
      spm: element.getAttribute('data-spm'),
      timestamp: Date.now(),
      url: window.location.href,

      element: {
        tagName: element.tagName.toLowerCase(),
        className: element.className || '',
        id: element.id || '',
        text: element.textContent?.substring(0, 100) || '',
        attributes: this.getCustomAttributes(element)
      },

      position: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },

      page: {
        title: document.title,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },

      user: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },

      trigger: element.getAttribute('data-track-trigger') || 'click',
      custom: {}
    };

    // 添加事件信息
    if (event) {
      data.event = {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button
      };
    }

    return this.config.dataProcessor(data);
  }

  getCustomAttributes(element) {
    const attributes = {};
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-track-') && attr.name !== 'data-track-trigger' && attr.name !== 'data-track-delay') {
        const key = attr.name.replace('data-track-', '');
        attributes[key] = attr.value;
      }
    });
    return attributes;
  }

  track(eventData, options = {}) {
    if (!eventData) return;

    const processedData = this.config.beforeSend(eventData);
    if (!processedData) return;

    this.queue.push({
      data: processedData,
      timestamp: Date.now(),
      attempts: 0,
      options
    });

    this.stats.totalTracked++;
    this.stats.queueSize = this.queue.length;

    this.log('info', 'Tracked event:', processedData);

    if (!this.config.batch.enabled) {
      this.processSingleItem(this.queue.pop());
    }
  }

  // 主动发送
  sendTrack(data = {}) {
    this.track(data);
  }

  startBatchProcessor() {
    if (!this.config.batch.enabled) return;

    const processBatch = () => {
      if (this.queue.length > 0) {
        const batchSize = Math.min(this.config.batch.maxSize, this.queue.length);
        const batch = this.queue.splice(0, batchSize);
        this.processBatch(batch);
      }

      this.batchTimer = setTimeout(processBatch, this.config.batch.maxWait);
    };

    processBatch();
  }

  processSingleItem(item) {
    this.requestIdleCallback(() => {
      this.sendData([item]);
    });
  }

  processBatch(batch) {
    this.requestIdleCallback(() => {
      this.sendData(batch);
    });
  }

  sendData(items) {
    if (!items || items.length === 0) return;

    const sender = this.senders[this.config.sender];
    if (!sender) {
      this.log('error', 'Invalid sender type:', this.config.sender);
      return;
    }

    const data = items.map(item => item.data);
    const startTime = Date.now();

    sender(this.config.endpoint, data)
      .then(response => {
        this.handleSendSuccess(response, items, Date.now() - startTime);
      })
      .catch(error => {
        this.handleSendError(error, items);
      })
      .finally(() => {
        // 清除已追踪的元素this.trackedElements，允许重新追踪
        items.forEach(item => {
          const spm = item.data.spm;
          document.querySelectorAll(`[data-spm="${spm}"]`).forEach(el => {
            const spmId = el.getAttribute('data-spm-id');
            if (spmId) {
              this.trackedElements.delete(spmId); // 释放标记
              if (this.config.debug) {
                el.classList.remove('debug-enabled');
              }
            }
          });
        });
      });
  }

  handleSendSuccess(response, items, duration) {
    this.stats.successCount += items.length;
    this.stats.lastSendTime = Date.now();
    this.stats.queueSize = this.queue.length;

    this.log('info', `Sent ${items.length} items successfully in ${duration}ms`);

    items.forEach(item => {
      this.config.afterSend(response, item.data);
      if (item.options.onSuccess) {
        item.options.onSuccess(response);
      }
    });
  }

  handleSendError(error, items) {
    this.stats.errorCount += items.length;
    this.stats.queueSize = this.queue.length;

    this.log('error', 'Send failed:', error.message);

    if (this.config.retry.enabled) {
      items.forEach(item => {
        item.attempts++;
        if (item.attempts < this.config.retry.maxAttempts) {
          this.scheduleRetry(item);
        } else {
          this.log('error', 'Max retry attempts reached for item:', item.data.spm);
          if (item.options.onError) {
            item.options.onError(error);
          }
        }
      });
    } else {
      items.forEach(item => {
        this.config.onError(error, item.data);
        if (item.options.onError) {
          item.options.onError(error);
        }
      });
    }
  }

  scheduleRetry(item) {
    const delay = this.calculateRetryDelay(item.attempts);

    setTimeout(() => {
      this.log('info', `Retrying item (attempt ${item.attempts}):`, item.data.spm);
      this.processSingleItem(item);
    }, delay);
  }

  calculateRetryDelay(attempt) {
    const baseDelay = this.config.retry.baseDelay;

    if (this.config.retry.backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempt - 1);
    } else {
      return baseDelay * attempt;
    }
  }

  flush() {
    if (this.queue.length > 0) {
      const allItems = this.queue.splice(0);
      this.processBatch(allItems);
      this.log('info', 'Flushed queue:', allItems.length);
    }
  }

  clear() {
    this.queue = [];
    this.stats.queueSize = 0;
    this.log('info', 'Cleared queue');
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('info', 'Updated config:', newConfig);
  }

  getStats() {
    return { ...this.stats };
  }

  enableDebug() {
    this.config.debug = true;
    this.log('info', 'Debug mode enabled');

    // 高亮已追踪的元素
    document.querySelectorAll('[data-spm]').forEach(el => {
      if (this.trackedElements.has(el)) {
        el.classList.add('debug-enabled');
      }
    });
  }

  requestIdleCallback(callback) {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(callback, { timeout: 1000 });
    } else {
      setTimeout(callback, 0);
    }
  }

  log(level, message, ...args) {
    if (!this.config.debug && level === 'info') return;

    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console[level](logMessage, ...args);

    // 输出到页面控制台
    const consoleEl = document.getElementById('console-log');
    if (consoleEl) {
      const div = document.createElement('div');
      div.style.color = level === 'error' ? '#ff6b6b' : level === 'warn' ? '#ffa726' : '#00ff00';
      div.textContent = `${logMessage} ${args.length > 0 ? JSON.stringify(args) : ''}`;
      consoleEl.appendChild(div);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
  }

  // 生成或获取元素的唯一追踪 ID
  getElementTrackingId(element) {
    const existingId = element.getAttribute('data-spm-id');
    if (existingId) return existingId;

    // 生成唯一 ID: spm_{spm值}_{时间戳}_{随机数}
    const spm = element.getAttribute('data-spm') || 'unknown';
    const id = `spm_${spm}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    element.setAttribute('data-spm-id', id);
    return id;
  }
}