/**
 * 自定义发布 - 第二步：执行动作
 */
import React, { useState } from 'react';
import { 
  MinusCircleOutlined, 
  PlusOutlined, 
  UpOutlined, 
  DownOutlined 
} from '@ant-design/icons';
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Divider, 
  Alert, 
  Select 
} from 'antd';
import { ACEditor } from '@/components';
import useDeployAppStore, { type ServerAction, type HostAction } from '@/stores/deployAppStore';
import { cleanCommand } from '@/utils/common';
import http from '@/libs/http';
import Tips from './Tips';
import styles from '../index.module.scss';

const Ext2Setup2: React.FC = () => {
  const { 
    deploy, 
    app_id, 
    setPage, 
    setExt2Visible, 
    setDeploy,
    loadDeploys,
    isReadOnly 
  } = useDeployAppStore();

  const [loading, setLoading] = useState(false);

  const helpMap = {
    '0': null,
    '1': '相对于输入的本地路径的文件路径，仅将匹配到文件传输至要发布的目标主机。',
    '2': '支持模糊匹配，基于输入的本地路径匹配，匹配到文件将不会被传输。'
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const info = { ...deploy };
      info.app_id = app_id;
      info.extend = '2';
      
      // 过滤有效的执行动作
      info.host_actions = (info.host_actions || []).filter(x => 
        (x.title && x.data) || (x.title && (x.src || x.src_mode === '1') && x.dst)
      );
      info.server_actions = (info.server_actions || []).filter(x => 
        x.title && x.data
      );

      await http.post('/api/app/deploy/', info);
      message.success('保存成功');
      setExt2Visible(false);
      if (app_id) {
        loadDeploys(app_id);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    setPage(0);
  };

  const doAction = (actions: any[], index: number, action: string) => {
    if (action === 'up') {
      if (index > 0) {
        [actions[index], actions[index - 1]] = [actions[index - 1], actions[index]];
      }
    } else {
      if (index < actions.length - 1) {
        [actions[index], actions[index + 1]] = [actions[index + 1], actions[index]];
      }
    }
    // 更新 deploy 状态
    setDeploy({ ...deploy });
  };

  const handleHostAction = (index: number, action: string) => {
    const actions = deploy.host_actions || [];
    doAction(actions, index, action);
  };

  const handleServerAction = (index: number, action: string) => {
    const actions = deploy.server_actions || [];
    doAction(actions, index, action);
  };

  const updateServerAction = (index: number, key: string, value: any) => {
    const actions = [...(deploy.server_actions || [])];
    if (!actions[index]) actions[index] = {};
    actions[index] = { ...actions[index], [key]: value };
    setDeploy({ ...deploy, server_actions: actions });
  };

  const updateHostAction = (index: number, key: string, value: any) => {
    const actions = [...(deploy.host_actions || [])];
    if (!actions[index]) actions[index] = {};
    actions[index] = { ...actions[index], [key]: value };
    setDeploy({ ...deploy, host_actions: actions });
  };

  const addServerAction = () => {
    const actions = [...(deploy.server_actions || [])];
    actions.push({});
    setDeploy({ ...deploy, server_actions: actions });
  };

  const removeServerAction = (index: number) => {
    const actions = [...(deploy.server_actions || [])];
    actions.splice(index, 1);
    setDeploy({ ...deploy, server_actions: actions });
  };

  const addHostAction = () => {
    const actions = [...(deploy.host_actions || [])];
    actions.push({});
    setDeploy({ ...deploy, host_actions: actions });
  };

  const addTransferAction = () => {
    const actions = [...(deploy.host_actions || [])];
    actions.push({
      type: 'transfer',
      title: '数据传输',
      mode: '0',
      src_mode: '0'
    });
    setDeploy({ ...deploy, host_actions: actions });
  };

  const removeHostAction = (index: number) => {
    const actions = [...(deploy.host_actions || [])];
    actions.splice(index, 1);
    setDeploy({ ...deploy, host_actions: actions });
  };

  const server_actions = deploy.server_actions || [];
  const host_actions = deploy.host_actions || [];

  // 检查是否已有传输动作
  const hasTransferAction = host_actions.some(x => x.type === 'transfer');

  return (
    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} className={styles.ext2Form}>
      {!deploy.id && (
        <Alert
          closable
          showIcon
          type="info"
          message="小提示"
          style={{ margin: '0 80px 20px' }}
          description={[
            <p key={1}>
              Spug 将遵循先本地后目标主机的原则，按照顺序依次执行添加的动作，例如：本地动作1 → 本地动作2 → 目标主机动作1 → 目标主机动作2 ...
            </p>,
            <p key={2}>
              执行的命令内可以使用发布申请中设置的环境变量 SPUG_RELEASE，一般可用于标记一次发布的版本号或提交ID等，在执行的脚本内通过使用 $SPUG_RELEASE 获取其值来执行相应操作。
            </p>,
            <p key={3}>{Tips}。</p>,
          ]}
        />
      )}

      {/* 本地动作 */}
      {server_actions.map((item: ServerAction, index: number) => (
        <div key={index} style={{ marginBottom: 30, position: 'relative' }}>
          <Form.Item required label={`本地动作${index + 1}`}>
            <Input 
              disabled={isReadOnly} 
              value={item.title} 
              onChange={e => updateServerAction(index, 'title', e.target.value)}
              placeholder="请输入"
            />
          </Form.Item>

          <Form.Item required label="执行内容">
            <ACEditor
              readOnly={isReadOnly}
              mode="sh"
              theme="tomorrow"
              width="100%"
              height="100px"
              value={item.data || ''}
              onChange={v => updateServerAction(index, 'data', cleanCommand(v))}
              placeholder="请输入要执行的动作"
            />
          </Form.Item>

          {!isReadOnly && (
            <>
              <Button 
                type="dashed" 
                icon={<UpOutlined />} 
                className={styles.upAction}
                onClick={() => handleServerAction(index, 'up')}
              />
              <div 
                className={styles.delAction} 
                onClick={() => removeServerAction(index)}
              >
                <MinusCircleOutlined />移除
              </div>
              <Button 
                type="dashed" 
                icon={<DownOutlined />} 
                className={styles.downAction}
                onClick={() => handleServerAction(index, 'down')}
              />
            </>
          )}
        </div>
      ))}

      {!isReadOnly && (
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button type="dashed" block onClick={addServerAction}>
            <PlusOutlined />添加本地执行动作（在服务端本地执行）
          </Button>
        </Form.Item>
      )}

      <Divider />

      {/* 目标主机动作 */}
      {host_actions.map((item: HostAction, index: number) => (
        <div key={index} style={{ marginBottom: 30, position: 'relative' }}>
          <Form.Item required label={`目标主机动作${index + 1}`}>
            <Input 
              disabled={isReadOnly} 
              value={item.title} 
              onChange={e => updateHostAction(index, 'title', e.target.value)}
              placeholder="请输入"
            />
          </Form.Item>

          {item.type === 'transfer' ? (
            <>
              <Form.Item required label="数据来源">
                <Input
                  spellCheck={false}
                  disabled={isReadOnly || item.src_mode === '1'}
                  placeholder="请输入本地（部署spug的容器或主机）路径"
                  value={item.src_mode === '1' ? 'N/A' : item.src || ''}
                  onChange={e => updateHostAction(index, 'src', e.target.value)}
                  addonBefore={(
                    <Select 
                      disabled={isReadOnly} 
                      style={{ width: 120 }} 
                      value={item.src_mode || '0'}
                      onChange={v => updateHostAction(index, 'src_mode', v)}
                    >
                      <Select.Option value="0">本地路径</Select.Option>
                      <Select.Option value="1">发布时上传</Select.Option>
                    </Select>
                  )}
                />
              </Form.Item>

              {[undefined, '0'].includes(item.src_mode) && (
                <Form.Item label="过滤规则" extra={helpMap[item.mode as keyof typeof helpMap]}>
                  <Input
                    spellCheck={false}
                    placeholder={item.mode === '0' ? 'N/A' : '请输入逗号分割的过滤规则'}
                    value={item.rule || ''}
                    onChange={e => updateHostAction(index, 'rule', e.target.value.replace('，', ','))}
                    disabled={isReadOnly || item.mode === '0'}
                    addonBefore={(
                      <Select 
                        disabled={isReadOnly} 
                        style={{ width: 120 }} 
                        value={item.mode || '0'}
                        onChange={v => updateHostAction(index, 'mode', v)}
                      >
                        <Select.Option value="0">关闭</Select.Option>
                        <Select.Option value="1">包含</Select.Option>
                        <Select.Option value="2">排除</Select.Option>
                      </Select>
                    )}
                  />
                </Form.Item>
              )}

              <Form.Item 
                required 
                label="目标路径" 
                extra={
                  <a
                    target="_blank" 
                    rel="noopener noreferrer"
                    href="https://ops.spug.cc/docs/deploy-config#transfer"
                  >
                    使用前请务必阅读官方文档。
                  </a>
                }
              >
                <Input
                  disabled={isReadOnly}
                  spellCheck={false}
                  value={item.dst || ''}
                  placeholder="请输入目标主机路径"
                  onChange={e => updateHostAction(index, 'dst', e.target.value)}
                />
              </Form.Item>
            </>
          ) : (
            <Form.Item required label="执行内容">
              <ACEditor
                readOnly={isReadOnly}
                mode="sh"
                theme="tomorrow"
                width="100%"
                height="100px"
                value={item.data || ''}
                onChange={v => updateHostAction(index, 'data', cleanCommand(v))}
                placeholder="请输入要执行的动作"
              />
            </Form.Item>
          )}

          {!isReadOnly && (
            <>
              <Button 
                type="dashed" 
                icon={<UpOutlined />} 
                className={styles.upAction}
                onClick={() => handleHostAction(index, 'up')}
              />
              <div 
                className={styles.delAction} 
                onClick={() => removeHostAction(index)}
              >
                <MinusCircleOutlined />移除
              </div>
              <Button 
                type="dashed" 
                icon={<DownOutlined />} 
                className={styles.downAction}
                onClick={() => handleHostAction(index, 'down')}
              />
            </>
          )}
        </div>
      ))}

      {!isReadOnly && (
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button 
            disabled={isReadOnly} 
            type="dashed" 
            block 
            onClick={addHostAction}
          >
            <PlusOutlined />添加目标主机执行动作（在部署目标主机执行）
          </Button>
          <Button
            block
            type="dashed"
            style={{ marginTop: 8 }}
            disabled={isReadOnly || hasTransferAction}
            onClick={addTransferAction}
          >
            <PlusOutlined />添加数据传输动作（仅能添加一个）
          </Button>
        </Form.Item>
      )}
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }} style={{ marginTop: 24 }}>
        <Button
          type="primary"
          disabled={
            isReadOnly || 
            [...host_actions, ...server_actions].filter(x => x.title && x.data).length === 0
          }
          loading={loading}
          onClick={handleSubmit}
        >
          提交
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={handlePrevStep}>
          上一步
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Ext2Setup2;