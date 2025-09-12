/**
 * Git 仓库配置组件
 */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Radio, Input, message } from 'antd';
import http from '@/libs/http';

interface RepoProps {
  url?: string;
  onOk: (url: string) => void;
  onCancel: () => void;
}

const Repo: React.FC<RepoProps> = ({ url, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [key, setKey] = useState('');

  useEffect(() => {
    // 获取公钥
    http.post('/api/app/kit/key/', { key: 'public_key' })
      .then((res: any) => setKey(res))
      .catch(() => {});

    if (url) {
      const fields = url.match(/^(https?:\/\/)(.+):(.+)@(.*)$/);
      if (fields && fields.length === 5) {
        form.setFieldsValue({
          type: 'password',
          url: fields[1] + fields[4],
          username: decodeURIComponent(fields[2]),
          password: decodeURIComponent(fields[3])
        });
      } else if (url.startsWith('git@')) {
        form.setFieldsValue({ type: 'key', url });
      } else {
        form.setFieldsValue({ url });
      }
    }
  }, [form, url]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue();
      
      if (!formData.url) {
        message.error('请输入仓库地址');
        return;
      }

      let finalUrl = formData.url;
      
      if (formData.type === 'password') {
        if (!formData.username) {
          message.error('请输入账户');
          return;
        }
        if (!formData.password) {
          message.error('请输入密码');
          return;
        }
        if (formData.url.startsWith('http')) {
          const username = encodeURIComponent(formData.username);
          const password = encodeURIComponent(formData.password);
          finalUrl = formData.url.replace(/^(https?:\/\/)/, `$1${username}:${password}@`);
        } else {
          message.error('认证类型为账户密码，仓库地址需以http或https开头。');
          return;
        }
      } else if (formData.url.startsWith('http')) {
        message.error('输入的仓库地址以http或https开头，则认证类型需为账户密码认证。');
        return;
      }
      
      onOk(finalUrl);
      onCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const copyToClipBoard = () => {
    navigator.clipboard.writeText(key).then(() => {
      message.success('已复制');
    }).catch(() => {
      // 降级方案
      const t = document.createElement('input');
      t.value = key;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      message.success('已复制');
    });
  };

  return (
    <Modal
      open={true}
      maskClosable={false}
      title="设置Git仓库"
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        <Form.Item label="认证类型" name="type" initialValue="password">
          <Radio.Group>
            <Radio.Button value="password">账户密码</Radio.Button>
            <Radio.Button value="key">密钥</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item 
          label="仓库地址" 
          name="url"
          rules={[{ required: true, message: '请输入仓库地址' }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('type') === 'password' ? (
              <>
                <Form.Item 
                  label="账户" 
                  name="username"
                  rules={[{ required: true, message: '请输入账户' }]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item 
                  label="密码" 
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password placeholder="请输入" />
                </Form.Item>
              </>
            ) : (
              <Form.Item 
                label="密钥" 
                extra={
                  <span>
                    请复制该密钥，以Gitee为例可参考
                    <a 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      href="https://gitee.com/help/articles/4191"
                    >
                      Gitee文档
                    </a>
                    进行后续配置。
                  </span>
                }
              >
                <span 
                  className="btn" 
                  onClick={copyToClipBoard}
                  style={{ cursor: 'pointer', color: '#1890ff' }}
                >
                  点击复制密钥
                </span>
              </Form.Item>
            )
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Repo;
