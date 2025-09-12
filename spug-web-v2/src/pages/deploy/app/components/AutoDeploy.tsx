/**
 * 自动部署 Webhook 配置组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Radio, Button, Alert, message } from 'antd';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import useDeployAppStore from '@/stores/deployAppStore';
import styles from '../index.module.scss';

const AutoDeploy: React.FC = () => {
  const { deploy, autoVisible, setAutoVisible } = useDeployAppStore();
  
  const [type, setType] = useState('branch');
  const [fetching, setFetching] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState<string>();
  const [url, setURL] = useState<string>();
  const [key, setKey] = useState<string>();

  useEffect(() => {
    if (deploy.extend === '1') {
      fetchVersions();
    }
    http.post('/api/app/kit/key/', { key: 'api_key' })
      .then((res: any) => setKey(res))
      .catch(() => {});
  }, [deploy.extend]);

  useEffect(() => {
    const prefix = window.location.origin;
    let tmp = `${prefix}/api/apis/deploy/${deploy.id}/${type}/`;
    if (type === 'branch') {
      tmp += `?name=${branch}`;
    }
    setURL(tmp);
  }, [type, branch, deploy.id]);

  const fetchVersions = () => {
    setFetching(true);
    http.get(`/api/app/deploy/${deploy.id}/versions/`)
      .then((res: any) => setBranches(Object.keys(res.branches)))
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  const copyToClipBoard = (data: string) => {
    navigator.clipboard.writeText(data).then(() => {
      message.success('已复制');
    }).catch(() => {
      // 降级方案
      const t = document.createElement('input');
      t.value = data;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      message.success('已复制');
    });
  };

  return (
    <Modal
      open={autoVisible}
      width={700}
      title="Webhook"
      onCancel={() => setAutoVisible(false)}
      footer={null}
    >
      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 20 }}
        message="该功能可以让你通过一个URL来触发发布动作，常用于Git仓库的钩子脚本以实现代码提交即发布。"
      />
      
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="发布类型">
          <Radio.Group value={type} onChange={e => setType(e.target.value)}>
            <Radio value="branch">分支</Radio>
            <Radio value="tag">标签</Radio>
          </Radio.Group>
        </Form.Item>
        
        {type === 'branch' && (
          <Form.Item 
            label="分支"
            extra={deploy.extend === '1' ? null : '如需查看分支列表请先保存发布配置'}
          >
            <Select
              value={branch}
              onChange={setBranch}
              placeholder="请选择分支"
              notFoundContent={fetching ? <LoadingOutlined /> : '暂无分支'}
              disabled={deploy.extend !== '1'}
              dropdownRender={menu => (
                <div>
                  {menu}
                  {deploy.extend === '1' && (
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={fetchVersions}
                        style={{ padding: 0 }}
                      >
                        刷新分支
                      </Button>
                    </div>
                  )}
                </div>
              )}
            >
              {branches.map(item => (
                <Select.Option key={item} value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item label="Webhook URL">
          <Input
            readOnly
            value={url}
            addonAfter={
              <span className={styles.webhook} onClick={() => url && copyToClipBoard(url)}>
                复制
              </span>
            }
          />
        </Form.Item>
        
        <Form.Item label="Secret">
          <Input
            readOnly
            value={key}
            addonAfter={
              <span className={styles.webhook} onClick={() => key && copyToClipBoard(key)}>
                复制
              </span>
            }
          />
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 6 }}>
          <Alert
            type="warning"
            showIcon
            message={
              <div>
                请妥善保管好 Secret，建议在Git仓库的 Webhook 中进行配置以确保请求来源的合法性。
                详细使用方法请参考
                <a 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  href="https://ops.spug.cc/docs/deploy-config/"
                  style={{ marginLeft: 4 }}
                >
                  官方文档
                </a>
                。
              </div>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutoDeploy;
