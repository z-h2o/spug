/**
 * 常规发布 - 第三步：发布配置
 */
import React, { useState } from 'react';
import { Form, Button, Input, Row, Col, message } from 'antd';
import { ACEditor } from '@/components';
import useDeployAppStore from '@/stores/deployAppStore';
import { cleanCommand } from '@/utils/index';
import http from '@/libs/http';
import Tips from './Tips';

const Ext1Setup3: React.FC = () => {
  const { 
    deploy, 
    app_id, 
    setPage, 
    setExt1Visible, 
    fetchRecords,
    loadDeploys,
    setDeploy,
    isReadOnly
  } = useDeployAppStore();

  const [loading, setLoading] = useState(false);

  const handlePrevStep = () => {
    setPage(1);
  };

  const handleSubmit = async () => {
    const { dst_dir, dst_repo } = deploy;
    
    if (!dst_dir || !dst_repo) {
      message.error('请填写必填字段');
      return;
    }

    const t_dst_dir = dst_dir.replace(/\/*$/, '/');
    const t_dst_repo = dst_repo.replace(/\/*$/, '/');
    
    if (t_dst_repo.includes(t_dst_dir)) {
      return message.error('存储路径不能位于部署路径内');
    }

    setLoading(true);
    try {
      const info = {
        ...deploy,
        app_id,
        extend: '1'
      };
      
      await http.post('/api/app/deploy/', info);
      message.success('保存成功');
      
      if (app_id) {
        loadDeploys(app_id);
      }
      setExt1Visible(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeploy = (key: string, value: any) => {
    setDeploy({ ...deploy, [key]: value });
  };

  return (
    <Form layout="vertical" style={{ padding: '0 120px' }}>
      <Form.Item 
        required 
        label="部署路径" 
        tooltip="应用最终在主机上的部署路径，为了数据安全请确保该目录不存在，Spug 将会自动创建并接管该目录，可使用全局变量，例如：/www/$SPUG_APP_KEY"
      >
        <Input 
          value={deploy.dst_dir || ''} 
          onChange={e => updateDeploy('dst_dir', e.target.value)} 
          placeholder="请输入部署目标路径"
        />
      </Form.Item>
      
      <Row gutter={24}>
        <Col span={14}>
          <Form.Item 
            required 
            label="存储路径" 
            tooltip="此目录用于存储应用的历史版本，可使用全局变量，例如：/data/repos/$SPUG_APP_KEY"
          >
            <Input 
              value={deploy.dst_repo || ''} 
              onChange={e => updateDeploy('dst_repo', e.target.value)} 
              placeholder="请输入存储目标路径"
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item 
            required 
            label="版本数量" 
            tooltip="早于指定数量的构建纪录及历史版本会被删除，以释放磁盘空间。"
          >
            <Input 
              value={deploy.versions || ''} 
              onChange={e => updateDeploy('versions', e.target.value)} 
              placeholder="请输入保存的版本数量"
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        label="应用发布前执行"
        tooltip="在发布的目标主机上运行，当前目录为目标主机上待发布的源代码目录，可执行任意自定义命令。"
        extra={<span>{Tips}，此时还未进行文件变更，可进行一些发布前置操作。</span>}
      >
        <ACEditor
          readOnly={isReadOnly}
          mode="sh"
          theme="tomorrow"
          width="100%"
          height="150px"
          placeholder="输入要执行的命令"
          value={deploy.hook_pre_host || ''}
          onChange={v => updateDeploy('hook_pre_host', cleanCommand(v))}
          style={{ border: '1px solid #e8e8e8' }}
        />
      </Form.Item>
      
      <Form.Item
        label="应用发布后执行"
        style={{ marginTop: 12, marginBottom: 24 }}
        tooltip="在发布的目标主机上运行，当前目录为已发布的应用目录，可执行任意自定义命令。"
        extra={<span>{Tips}，可以在发布后进行重启服务等操作。</span>}
      >
        <ACEditor
          readOnly={isReadOnly}
          mode="sh"
          theme="tomorrow"
          width="100%"
          height="150px"
          placeholder="输入要执行的命令"
          value={deploy.hook_post_host || ''}
          onChange={v => updateDeploy('hook_post_host', cleanCommand(v))}
          style={{ border: '1px solid #e8e8e8' }}
        />
      </Form.Item>
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button 
          disabled={isReadOnly} 
          loading={loading} 
          type="primary" 
          onClick={handleSubmit}
        >
          提交
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={handlePrevStep}>上一步</Button>
      </Form.Item>
    </Form>
  );
};

export default Ext1Setup3;
