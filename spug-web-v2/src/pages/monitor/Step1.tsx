/**
 * 监控管理Step1组件
 */
import React, { useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import TemplateSelector from '../exec/task/TemplateSelector';
import HostSelector from '../host/Selector';
import { LinkButton, ACEditor } from '@/components';
import http from '@/libs/http';
import { cleanCommand } from '@/utils/functools';
import useMonitorStore from '@/stores/monitorStore';

const helpMap = {
  '1': '返回HTTP状态码200-399则判定为正常，其他为异常。',
  '4': '脚本执行退出状态码为 0 则判定为正常，其他为异常。'
};

const MonitorStep1: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showTmp, setShowTmp] = useState(false);
  const { record, groups, updateRecord, setPage } = useMonitorStore();

  const handleTest = async () => {
    setLoading(true);
    const formData = {
      type: record.type,
      targets: record.targets,
      extra: record.extra
    };
    
    try {
      const res = await http.post('/api/monitor/test/', formData, { timeout: 120000 });
      const result = res.data || res;
      if (result.is_success) {
        Modal.success({ content: result.message });
      } else {
        Modal.warning({ content: result.message });
      }
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleChangeType = (v: string) => {
    updateRecord({
      type: v,
      targets: [],
      extra: undefined
    });
  };

  const handleAddGroup = () => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: '添加监控分组',
      content: (
        <Form layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item required label="监控分组">
            <Input onChange={e => updateRecord({ group: e.target.value })} />
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        if (record.group) {
          // Add to groups list (this would typically update the store)
          console.log('Adding group:', record.group);
        }
      },
    });
  };

  const canNext = () => {
    const { type, targets, extra, group, name } = record;
    const is_verify = name && group && targets && targets.length;
    if (['2', '3', '4'].includes(type || '')) {
      return is_verify && extra;
    } else {
      return is_verify;
    }
  };

  const toNext = () => {
    const { type, extra } = record;
    if (type === '1' && extra && !Number(extra)) {
      return message.error('请输入正确的响应时间');
    }
    if (type === '2' && (!extra || !Number(extra) || Number(extra) <= 0)) {
      return message.error('请输入正确的端口号');
    }
    setPage(1);
  };

  const getStyle = (types: string[]) => {
    return types.includes(record.type || '') ? {} : { display: 'none' };
  };

  const { name, desc, type, targets, extra, group } = record;

  return (
    <Form labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
      <Form.Item required label="监控分组" style={{ marginBottom: 0 }}>
        <Form.Item style={{ display: 'inline-block', width: 'calc(75%)', marginRight: 8 }}>
          <Select 
            value={group} 
            placeholder="请选择监控分组" 
            onChange={v => updateRecord({ group: v })}
          >
            {groups.map(item => (
              <Select.Option value={item} key={item}>{item}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ display: 'inline-block', width: 'calc(25%-8px)' }}>
          <Button type="link" onClick={handleAddGroup}>添加分组</Button>
        </Form.Item>
      </Form.Item>
      
      <Form.Item label="监控类型" tooltip={helpMap[type as keyof typeof helpMap]}>
        <Select placeholder="请选择监控类型" value={type} onChange={handleChangeType}>
          <Select.Option value="1">站点检测</Select.Option>
          <Select.Option value="2">端口检测</Select.Option>
          <Select.Option value="5">Ping检测</Select.Option>
          <Select.Option value="3">进程检测</Select.Option>
          <Select.Option value="4">自定义脚本</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item required label="监控名称">
        <Input 
          value={name} 
          onChange={e => updateRecord({ name: e.target.value })} 
          placeholder="请输入监控名称" 
        />
      </Form.Item>
      
      <Form.Item required label="监控地址" style={getStyle(['1'])}>
        <Select
          mode="tags"
          value={targets as string[]}
          tokenSeparators={[',', ' ']}
          onChange={v => updateRecord({ targets: v })}
          placeholder="http(s)://开头，支持多个地址，每输入完成一个后按回车确认"
          notFoundContent={null}
        />
      </Form.Item>
      
      <Form.Item required label="监控地址" style={getStyle(['2', '5'])}>
        <Select
          mode="tags"
          value={targets as string[]}
          tokenSeparators={[',', ' ']}
          onChange={v => updateRecord({ targets: v })}
          placeholder="IP或域名，支持多个地址，每输入完成一个后按回车确认"
          notFoundContent={null}
        />
      </Form.Item>
      
      <Form.Item required label="监控主机" style={getStyle(['3', '4'])}>
        <HostSelector 
          value={targets as number[]} 
          onChange={ids => updateRecord({ targets: ids })} 
        />
      </Form.Item>
      
      <Form.Item label="响应时间" style={getStyle(['1'])}>
        <Input 
          suffix="ms" 
          value={extra} 
          placeholder="最长响应时间（毫秒），不设置则默认10秒超时"
          onChange={e => updateRecord({ extra: e.target.value })}
        />
      </Form.Item>
      
      <Form.Item required label="检测端口" style={getStyle(['2'])}>
        <Input 
          value={extra} 
          placeholder="请输入端口号" 
          onChange={e => updateRecord({ extra: e.target.value })}
        />
      </Form.Item>
      
      <Form.Item 
        required 
        label="进程名称" 
        extra="执行 ps -ef 看到的进程名称。" 
        style={getStyle(['3'])}
      >
        <Input 
          value={extra} 
          placeholder="请输入进程名称" 
          onChange={e => updateRecord({ extra: e.target.value })}
        />
      </Form.Item>
      
      <Form.Item
        required
        label="脚本内容"
        style={getStyle(['4'])}
        extra={<LinkButton onClick={() => setShowTmp(true)}>从模板添加</LinkButton>}
      >
        <ACEditor
          mode="sh"
          value={extra || ''}
          width="100%"
          height="200px"
          onChange={e => updateRecord({ extra: cleanCommand(e) })}
        />
      </Form.Item>
      
      <Form.Item label="备注信息">
        <Input.TextArea 
          value={desc} 
          onChange={e => updateRecord({ desc: e.target.value })} 
          placeholder="请输入备注信息" 
        />
      </Form.Item>

      <Form.Item wrapperCol={{ span: 14, offset: 6 }} style={{ marginTop: 12 }}>
        <Button disabled={!canNext()} type="primary" onClick={toNext}>
          下一步
        </Button>
        <Button disabled={!canNext()} type="link" loading={loading} onClick={handleTest}>
          执行测试
        </Button>
        <span style={{ color: '#888', fontSize: 12 }}>Tips: 仅测试第一个监控地址</span>
      </Form.Item>
      
      {showTmp && (
        <TemplateSelector 
          onOk={({ body }: { body: string }) => updateRecord({ extra: body })} 
          onCancel={() => setShowTmp(false)} 
        />
      )}
    </Form>
  );
};

export default MonitorStep1;
