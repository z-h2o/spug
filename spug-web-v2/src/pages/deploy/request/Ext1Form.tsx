/**
 * 常规发布申请表单
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import HostSelector from './HostSelector';
import useRequestStore from '@/stores/requestStore';
import { includes } from '@/utils/common';
import http from '@/libs/http';
import { get, clone } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface GitVersions {
  branches: Record<string, Array<{ id: string; author: string; message: string; date: string }>>;
  tags: Record<string, { author: string; message: string; date: string }>;
}

interface Repository {
  id: number;
  version: string;
  created_at: string;
}

const NoVersions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <span>未找到符合条件的版本，</span>
      <Button
        type="link"
        style={{ padding: 0 }}
        onClick={() => navigate('/deploy/repository')}
      >
        去构建新版本？
      </Button>
    </div>
  );
};

const Ext1Form: React.FC = () => {
  const { 
    record, 
    setExt1Visible, 
    fetchRecords 
  } = useRequestStore();

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [hostIds, setHostIds] = useState<number[]>([]);
  const [plan, setPlan] = useState<Dayjs | null>(null);
  const [fetching, setFetching] = useState(false);
  const [gitType, setGitType] = useState<string>('branch');
  const [extra, setExtra] = useState<any[]>([]);
  const [extra1, setExtra1] = useState<string>('');
  const [extra2, setExtra2] = useState<string>('');
  const [versions, setVersions] = useState<GitVersions>({ branches: {}, tags: {} });

  useEffect(() => {
    const { app_host_ids, host_ids, plan: recordPlan } = record;
    setHostIds(clone(host_ids || app_host_ids || []));
    if (recordPlan) {
      setPlan(typeof recordPlan === 'string' ? dayjs(recordPlan) : recordPlan);
    }
    fetchVersions();
  }, [record]);

  const fetchVersions = async () => {
    setFetching(true);
    try {
      const deployId = record.deploy_id;
      const [res1, res2] = await Promise.all([
        http.get(`/api/app/deploy/${deployId}/versions/`, { timeout: 300000 }),
        http.get('/api/repository/', { params: { deploy_id: deployId } })
      ]);
      
      if (!versions.branches) {
        initial(res1 as any, res2 as any);
      }
      setVersions(res1 as any);
      setRepositories(res2 as any);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (hostIds.length === 0) {
      return message.error('请至少选择一个要发布的主机');
    }

    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        id: record.id,
        deploy_id: record.deploy_id,
        host_ids: hostIds,
        type: record.type,
        extra: [gitType, extra1, extra2]
      };
      
      if (plan) {
        formData.plan = plan.format('YYYY-MM-DD HH:mm:00');
      }

      await http.post('/api/deploy/request/ext1/', formData);
      message.success('操作成功');
      setExt1Visible(false);
      fetchRecords();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefault = (type: string, newExtra?: any[], newVersions?: GitVersions, newRepositories?: Repository[]) => {
    const nowExtra = newExtra || extra;
    const nowVersions = newVersions || versions;
    const nowRepositories = newRepositories || repositories;
    const { branches, tags } = nowVersions;
    
    if (type === 'branch') {
      let [branch, commit] = [nowExtra[1], ''];
      if (branches[branch]) {
        commit = get(branches[branch], '0.id') || '';
      } else {
        branch = get(Object.keys(branches), 0) || '';
        commit = get(branches, [branch, 0, 'id']) || '';
      }
      setExtra1(branch);
      setExtra2(commit);
    } else if (type === 'tag') {
      setExtra1(get(Object.keys(tags), 0) || '');
      setExtra2('');
    } else {
      setExtra1(String(get(nowRepositories, '0.id') || ''));
      setExtra2('');
    }
  };

  const initial = (versions: GitVersions, repositories: Repository[]) => {
    const { branches, tags } = versions;
    if (branches && tags) {
      // 简化处理，默认选择branch
      setGitType('branch');
      const branch = get(Object.keys(branches), 0) || '';
      const commit = get(branches, [branch, 0, 'id']) || '';
      setExtra1(branch);
      setExtra2(commit);
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

  const { app_host_ids = [], type, rb_id } = record;
  const { branches, tags } = versions;

  return (
    <Modal
      open
      width={800}
      maskClosable={false}
      title={`${record.id ? '编辑' : '新建'}发布申请`}
      onCancel={() => setExt1Visible(false)}
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
          name="name" 
          label="申请标题"
          rules={[{ required: true, message: '请输入申请标题' }]}
        >
          <Input placeholder="请输入申请标题" />
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
          <Form.Item 
            style={{ display: 'inline-block', marginBottom: 0, width: '450px' }}
          >
            <Input.Group compact>
              <Select 
                value={gitType} 
                onChange={switchType} 
                style={{ width: 100 }}
              >
                <Select.Option value="branch">Branch</Select.Option>
                <Select.Option value="tag">Tag</Select.Option>
                <Select.Option value="repository">构建仓库</Select.Option>
              </Select>
              <Select
                showSearch
                style={{ width: 350 }}
                value={extra1}
                placeholder="请稍等"
                onChange={switchExtra1}
                notFoundContent={gitType === 'repository' ? <NoVersions /> : undefined}
                filterOption={(input, option: any) => 
                  includes(option?.content || '', input)
                }
              >
                {gitType === 'branch' ? (
                  Object.keys(branches || {}).map(b => (
                    <Select.Option key={b} value={b} content={b}>
                      {b}
                    </Select.Option>
                  ))
                ) : gitType === 'tag' ? (
                  Object.entries(tags || {}).map(([tag, info]) => (
                    <Select.Option 
                      key={tag} 
                      value={tag} 
                      content={`${tag} ${info.author} ${info.message}`}
                    >
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
                ) : (
                  repositories.map(item => (
                    <Select.Option 
                      key={item.id} 
                      value={item.id} 
                      content={item.version}
                      disabled={type === '2' && item.id >= (rb_id || 0)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.version}</span>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          构建于 {dayjs(item.created_at).fromNow()}
                        </span>
                      </div>
                    </Select.Option>
                  ))
                )}
              </Select>
            </Input.Group>
          </Form.Item>
          
          <Form.Item 
            style={{ display: 'inline-block', width: 82, textAlign: 'center', marginBottom: 0 }}
          >
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
        
        <Form.Item 
          required 
          label="目标主机" 
          tooltip="可以通过创建多个发布申请单，选择主机分批发布。"
        >
          {hostIds.length > 0 && (
            <span style={{ marginRight: 16 }}>
              已选择 {hostIds.length} 台（可选{app_host_ids.length}）
            </span>
          )}
          <Button 
            type="link" 
            style={{ padding: 0 }} 
            onClick={() => setVisible(true)}
          >
            选择主机
          </Button>
        </Form.Item>
        
        <Form.Item name="desc" label="备注信息">
          <Input placeholder="请输入备注信息" />
        </Form.Item>
        
        {type !== '2' && (
          <Form.Item 
            label="定时发布" 
            tooltip="在到达指定时间后自动发布，会有最多1分钟的延迟。"
          >
            <DatePicker
              showTime
              value={plan}
              style={{ width: 180 }}
              format="YYYY-MM-DD HH:mm"
              placeholder="请设置发布时间"
              onChange={setPlan}
            />
            {plan && (
              <span style={{ marginLeft: 24, fontSize: 12, color: '#888' }}>
                大约 {plan.fromNow()}
              </span>
            )}
          </Form.Item>
        )}
      </Form>
      
      {visible && (
        <HostSelector
          host_ids={hostIds}
          app_host_ids={app_host_ids}
          onCancel={() => setVisible(false)}
          onOk={(ids: number[]) => {
            setHostIds(ids);
            setVisible(false);
          }}
        />
      )}
    </Modal>
  );
};

export default Ext1Form;
