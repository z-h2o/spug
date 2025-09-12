/**
 * 任务调度Step3组件
 */
import React, { useState } from 'react';
import { Form, Tabs, DatePicker, InputNumber, Input, Button, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import useScheduleStore from '@/stores/scheduleStore';
import moment from 'moment';
import { get } from 'lodash';

let lastFetchId = 0;

const ScheduleStep3: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState('interval');
  const [args, setArgs] = useState<Record<string, any>>({});
  const [nextRunTime, setNextRunTime] = useState<React.ReactNode>(null);
  
  const { record, targets, setFormVisible, fetchRecords, setPage } = useScheduleStore();

  React.useEffect(() => {
    setTrigger(record.trigger || 'interval');
    setArgs({ [record.trigger || 'interval']: record.trigger_args });
  }, [record.trigger, record.trigger_args]);

  const handleSubmit = async () => {
    if (trigger === 'date' && args['date'] <= moment()) {
      return message.error('任务执行时间不能早于当前时间');
    }
    
    setLoading(true);
    try {
      const formData = {
        id: record.id,
        name: record.name,
        type: record.type,
        interpreter: record.interpreter,
        command: record.command,
        desc: record.desc,
        rst_notify: record.rst_notify,
        targets: targets.filter(x => x),
        trigger,
        trigger_args: parseArgs()
      };
      
      await http.post('/api/schedule/', formData);
      message.success('操作成功');
      setFormVisible(false);
      fetchRecords();
    } catch (error) {
      // Error handled by http interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleArgs = (key: string, val: any) => {
    setArgs({ ...args, [key]: val });
  };

  const handleCronArgs = (key: string, val: any) => {
    let tmp = args['cron'] || {};
    tmp = { ...tmp, [key]: val };
    setArgs({ ...args, cron: tmp });
    fetchNextRunTime();
  };

  const parseArgs = () => {
    switch (trigger) {
      case 'date':
        return moment(args['date']).format('YYYY-MM-DD HH:mm:ss');
      case 'cron':
        const { rule, start, stop } = args['cron'] || {};
        return JSON.stringify({
          rule,
          start: start ? moment(start).format('YYYY-MM-DD HH:mm:ss') : null,
          stop: stop ? moment(stop).format('YYYY-MM-DD HH:mm:ss') : null
        });
      default:
        return args[trigger];
    }
  };

  const fetchNextRunTime = () => {
    if (trigger === 'cron') {
      const rule = get(args, 'cron.rule');
      if (rule && rule.trim().split(/ +/).length === 5) {
        setNextRunTime(<LoadingOutlined />);
        lastFetchId += 1;
        const fetchId = lastFetchId;
        const cronArgs = parseArgs();
        
        http.post('/api/schedule/run_time/', JSON.parse(cronArgs))
          .then((res: any) => {
            if (fetchId !== lastFetchId) return;
            const result = res.data || res;
            if (result.success) {
              setNextRunTime(
                <span style={{ fontSize: 12, color: '#52c41a' }}>{result.msg}</span>
              );
            } else {
              setNextRunTime(
                <span style={{ fontSize: 12, color: '#ff4d4f' }}>{result.msg}</span>
              );
            }
          })
          .catch(() => {
            if (fetchId !== lastFetchId) return;
            setNextRunTime(
              <span style={{ fontSize: 12, color: '#ff4d4f' }}>获取下次执行时间失败</span>
            );
          });
      } else {
        setNextRunTime(null);
      }
    }
  };

  return (
    <Form layout="vertical" wrapperCol={{ span: 14, offset: 6 }}>
      <Form.Item>
        <Tabs activeKey={trigger} onChange={setTrigger} tabPosition="left" style={{ minHeight: 200 }}>
          <Tabs.TabPane tab="普通间隔" key="interval">
            <Form.Item required label="间隔时间(秒)" extra="每隔指定n秒执行一次。">
              <InputNumber
                style={{ width: 200 }}
                placeholder="请输入"
                value={args['interval']}
                onChange={v => handleArgs('interval', v)}
              />
            </Form.Item>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="一次性" key="date">
            <Form.Item required label="执行时间" extra="仅在指定时间运行一次。">
              <DatePicker
                showTime
                disabledDate={v => v && v.format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')}
                style={{ width: 200 }}
                placeholder="请选择执行时间"
                value={args['date'] ? moment(args['date']) : undefined}
                onChange={v => handleArgs('date', v)}
              />
            </Form.Item>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="UNIX Cron" key="cron">
            <Form.Item required label="执行规则" extra="兼容Cron风格，可参考官方例子">
              <Input
                suffix={nextRunTime || <span />}
                value={get(args, 'cron.rule')}
                placeholder="例如每天凌晨1点执行：0 1 * * *"
                onChange={e => handleCronArgs('rule', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="生效时间" extra="定义的执行规则在到达该时间后生效">
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="可选输入"
                value={get(args, 'cron.start') ? moment(args['cron']['start']) : undefined}
                onChange={v => handleCronArgs('start', v)}
              />
            </Form.Item>
            <Form.Item label="结束时间" extra="执行规则在到达该时间后不再执行">
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="可选输入"
                value={get(args, 'cron.stop') ? moment(args['cron']['stop']) : undefined}
                onChange={v => handleCronArgs('stop', v)}
              />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>
      </Form.Item>
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button 
          type="primary" 
          loading={loading} 
          disabled={!args[trigger]} 
          onClick={handleSubmit}
        >
          提交
        </Button>
        <Button 
          style={{ marginLeft: 20 }} 
          onClick={() => setPage(1)}
        >
          上一步
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ScheduleStep3;
