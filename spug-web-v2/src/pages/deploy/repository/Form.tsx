/**
 * 构建仓库表单组件
 */
import React, { useState, useEffect } from 'react';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import useRepositoryStore from '@/stores/repositoryStore';
import http from '@/libs/http';
import { get } from 'lodash';

interface GitVersions {
  branches: Record<string, Array<{ id: string; author: string; message: string; date: string }>>;
  tags: Record<string, { author: string; message: string; date: string }>;
}

const RepositoryForm: React.FC = () => {
  const { 
    record, 
    deploy, 
    setFormVisible,
    showConsole
  } = useRepositoryStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [gitType, setGitType] = useState<string>('branch');
  const [extra, setExtra] = useState<any[]>([]);
  const [extra1, setExtra1] = useState<string>('');
  const [extra2, setExtra2] = useState<string>('');
  const [versions, setVersions] = useState<GitVersions>({ branches: {}, tags: {} });

  useEffect(() => {
    fetchVersions();
  }, []);

  const setDefault = (type: string, newExtra?: any[], newVersions?: GitVersions) => {
    const nowExtra = newExtra || extra;
    const nowVersions = newVersions || versions;
    const { branches, tags } = nowVersions;
    
    if (type === 'branch') {
      let [branch, commit] = [nowExtra[1], ''];
      if (branches[branch]) {
        commit = get(branches[branch], '0.id') || '';
      } else {
        branch = get(Object.keys(branches), 0) || '';
        commit = get(branches[branch], '0.id') || '';
      }
      setExtra1(branch);
      setExtra2(commit);
    } else {
      setExtra1(get(Object.keys(tags), 0) || '');
      setExtra2('');
    }
  };

  const initial = (versions: GitVersions) => {
    const { branches, tags } = versions;
    if (branches && tags) {
      // 这里需要从store.records中查找，但我们暂时简化处理
      setGitType('branch');
      const branch = get(Object.keys(branches), 0) || '';
      const commit = get(branches[branch], '0.id') || '';
      setExtra1(branch);
      setExtra2(commit);
    }
  };

  const fetchVersions = async () => {
    setFetching(true);
    try {
      const res: GitVersions = await http.get(`/api/app/deploy/${deploy.id}/versions/`, { timeout: 120000 });
      setVersions(res);
      initial(res);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setFetching(false);
    }
  };

  const switchType = (v: string) => {
    setGitType(v);
    setDefault(v);
  };

  const switchExtra1 = (v: string) => {
    setExtra1(v);
    if (gitType === 'branch') {
      setExtra2(get(versions.branches[v], '0.id') || '');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        deploy_id: deploy.id,
        extra: [gitType, extra1, extra2]
      };
      
      const res: any = await http.post('/api/repository/', formData);
      message.success('操作成功');
      setFormVisible(false);
      showConsole(res);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const { branches, tags } = versions;

  return (
    <Modal
      open
      width={800}
      maskClosable={false}
      title="新建构建"
      onCancel={() => setFormVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        initialValues={record} 
        labelCol={{ span: 5 }} 
        wrapperCol={{ span: 17 }}
      >
        <Form.Item 
          required 
          name="version" 
          label="构建版本"
          rules={[{ required: true, message: '请输入构建版本' }]}
        >
          <Input placeholder="请输入构建版本" />
        </Form.Item>
        
        <Form.Item 
          required 
          label="选择分支/标签/版本" 
          style={{ marginBottom: 12 }} 
          extra={
            <span>
              根据网络情况，首次刷新可能会很慢，请耐心等待。
              <a 
                target="_blank" 
                rel="noopener noreferrer"
                href="https://ops.spug.cc/docs/use-problem#clone"
              >
                clone 失败？
              </a>
            </span>
          }
        >
          <Form.Item style={{ display: 'inline-block', marginBottom: 0, width: '450px' }}>
            <Input.Group compact>
              <Select value={gitType} onChange={switchType} style={{ width: 100 }}>
                <Select.Option value="branch">Branch</Select.Option>
                <Select.Option value="tag">Tag</Select.Option>
              </Select>
              <Select
                showSearch
                style={{ width: 350 }}
                value={extra1}
                placeholder="请稍等"
                onChange={switchExtra1}
                filterOption={(input, option) => 
                  String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {gitType === 'branch' ? (
                  Object.keys(branches || {}).map(b => (
                    <Select.Option key={b} value={b}>{b}</Select.Option>
                  ))
                ) : (
                  Object.entries(tags || {}).map(([tag, info]) => (
                    <Select.Option key={tag} value={tag}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{
                          width: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {`${tag} ${info.author} ${info.message}`}
                        </span>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          {info.date}
                        </span>
                      </div>
                    </Select.Option>
                  ))
                )}
              </Select>
            </Input.Group>
          </Form.Item>
          
          <Form.Item style={{ display: 'inline-block', width: 82, textAlign: 'center', marginBottom: 0 }}>
            {fetching ? (
              <LoadingOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            ) : (
              <Button 
                type="link" 
                icon={<SyncOutlined />} 
                disabled={fetching} 
                onClick={fetchVersions}
              >
                刷新
              </Button>
            )}
          </Form.Item>
        </Form.Item>
        
        {gitType === 'branch' && (
          <Form.Item required label="选择Commit ID">
            <Select 
              value={extra2} 
              placeholder="请选择" 
              onChange={v => setExtra2(v)}
            >
              {extra1 && branches ? branches[extra1]?.map(item => (
                <Select.Option key={item.id} value={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{
                      width: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.id.substr(0, 6)} {item.author} {item.message}
                    </span>
                    <span style={{ color: '#999', fontSize: 12 }}>
                      {item.date}
                    </span>
                  </div>
                </Select.Option>
              )) : null}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item name="remarks" label="备注信息">
          <Input placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RepositoryForm;
