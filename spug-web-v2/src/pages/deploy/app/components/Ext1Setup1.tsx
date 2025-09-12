/**
 * 常规发布 - 第一步：基本配置
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Switch, Form, Input, Select, Button, Radio } from 'antd';
import HostSelector from '@/pages/host/Selector';
import useDeployAppStore from '@/stores/deployAppStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import Repo from './Repo';

const Ext1Setup1: React.FC = () => {
  const { 
    deploy, 
    getCurrentRecord,
    isReadOnly, 
    app_id, 
    loadDeploys, 
    setPage, 
    setDeploy 
  } = useDeployAppStore();

  const currentRecord = getCurrentRecord();
  
  const { records: envRecords } = useConfigEnvStore();
  
  const [envs, setEnvs] = useState<number[]>([]);
  const [visible, setVisible] = useState(false);

  const updateEnvs = () => {
    if (currentRecord && currentRecord.deploys) {
      const ids = currentRecord.deploys
        .map(x => x.env_id)
        .filter((id): id is number => id !== undefined && id !== deploy.env_id);
      setEnvs(ids);
    }
  };

  useEffect(() => {
    if (currentRecord && app_id) {
      if (currentRecord.deploys === undefined) {
        loadDeploys(app_id).then(updateEnvs);
      } else {
        updateEnvs();
      }
    }
  }, [currentRecord, app_id, loadDeploys, deploy.env_id]);

  const info = deploy;
  let modePlaceholder = '';
  switch (info.rst_notify?.mode) {
    case '0':
      modePlaceholder = '已关闭';
      break;
    case '1':
      modePlaceholder = 'https://oapi.dingtalk.com/robot/send?access_token=xxx';
      break;
    case '3':
      modePlaceholder = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx';
      break;
    case '4':
      modePlaceholder = 'https://open.feishu.cn/open-apis/bot/v2/hook/xxx';
      break;
    default:
      modePlaceholder = '请输入';
  }

  const handleNextStep = () => {
    setPage(1);
  };

  const updateDeploy = (key: string, value: any) => {
    setDeploy({ ...deploy, [key]: value });
  };

  const updateNotify = (key: string, value: any) => {
    const currentNotify = deploy.rst_notify || { mode: '0' };
    setDeploy({ 
      ...deploy, 
      rst_notify: { ...currentNotify, [key]: value } 
    });
  };

  return (
    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
      <Form.Item 
        required 
        label="发布环境" 
        style={{ marginBottom: 0 }} 
        tooltip="可以建立多个环境，实现同一应用在不同环境里配置不同的发布流程。"
      >
        <Form.Item style={{ display: 'inline-block', width: '80%' }}>
          <Select 
            disabled={isReadOnly} 
            value={info.env_id} 
            onChange={v => updateDeploy('env_id', v)} 
            placeholder="请选择发布环境"
          >
            {envRecords.map(item => (
              <Select.Option 
                disabled={envs.includes(item.id)} 
                value={item.id} 
                key={item.id}
              >
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ display: 'inline-block', width: '20%', textAlign: 'right' }}>
          <Link to="/config/environment">新建环境</Link>
        </Form.Item>
      </Form.Item>
      
      <Form.Item required label="目标主机" tooltip="该发布配置作用于哪些目标主机。">
        <HostSelector 
          value={info.host_ids?.filter((id): id is number => id !== undefined) || []} 
          onChange={(ids: number[]) => updateDeploy('host_ids', ids)} 
        />
      </Form.Item>
      
      <Form.Item 
        required 
        label="Git仓库地址" 
        extra={<span className="btn" onClick={() => setVisible(true)}>私有仓库？</span>}
      >
        <Input 
          disabled={isReadOnly} 
          value={info.git_repo} 
          onChange={e => updateDeploy('git_repo', e.target.value)}
          placeholder="请输入Git仓库地址"
        />
      </Form.Item>
      
      <Form.Item 
        label="发布模式" 
        tooltip="串行即发布时一台完成后再发布下一台，期间出现异常则终止发布。并行则每个主机相互独立发布同时进行。"
      >
        <Radio.Group
          buttonStyle="solid"
          value={info.is_parallel}
          onChange={e => updateDeploy('is_parallel', e.target.value)}
        >
          <Radio.Button value={true}>并行</Radio.Button>
          <Radio.Button value={false}>串行</Radio.Button>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item 
        label="发布审核" 
        tooltip="开启后发布申请需要审核（审核权限在系统管理/角色管理/功能权限中配置）通过后才能发布。"
      >
        <Switch
          disabled={isReadOnly}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={info.is_audit}
          onChange={v => updateDeploy('is_audit', v)}
        />
      </Form.Item>
      
      <Form.Item 
        label="消息通知" 
        extra={
          <span>
            应用审核及发布成功或失败结果通知，
            <a 
              target="_blank" 
              rel="noopener noreferrer"
              href="https://ops.spug.cc/docs/use-problem#use-dd"
            >
              钉钉收不到通知？
            </a>
          </span>
        }
      >
        <Input
          addonBefore={(
            <Select
              disabled={isReadOnly}
              value={info.rst_notify?.mode || '0'} 
              style={{ width: 100 }}
              onChange={v => updateNotify('mode', v)}
            >
              <Select.Option value="0">关闭</Select.Option>
              <Select.Option value="1">钉钉</Select.Option>
              <Select.Option value="4">飞书</Select.Option>
              <Select.Option value="3">企业微信</Select.Option>
              <Select.Option value="2">Webhook</Select.Option>
            </Select>
          )}
          disabled={isReadOnly || info.rst_notify?.mode === '0'}
          value={info.rst_notify?.value}
          onChange={e => updateNotify('value', e.target.value)}
          placeholder={modePlaceholder}
        />
      </Form.Item>
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button
          type="primary"
          disabled={!(info.env_id && info.git_repo && info.host_ids && info.host_ids.length)}
          onClick={handleNextStep}
        >
          下一步
        </Button>
      </Form.Item>
      
      {visible && (
        <Repo 
          url={info.git_repo} 
          onOk={(v: string) => updateDeploy('git_repo', v)} 
          onCancel={() => setVisible(false)} 
        />
      )}
    </Form>
  );
};

export default Ext1Setup1;
