/**
 * 任务调度Step2组件
 */
import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Select, Button } from 'antd';
import HostSelector from '../host/Selector';
import useScheduleStore from '@/stores/scheduleStore';
import useHostStore from '@/stores/hostStore';
import styles from './index.module.scss';

const ScheduleStep2: React.FC = () => {
  const { targets, setPage, editTarget, delTarget, setTargets } = useScheduleStore();
  const { rawRecords } = useHostStore();

  const handleChange = (ids: number[]) => {
    const newTargets: (string | number)[] = [...ids];
    if (targets.includes('local')) {
      newTargets.unshift('local');
    }
    setTargets(newTargets);
  };

  return (
    <>
      <Form labelCol={{ span: 7 }} wrapperCol={{ span: 14 }} style={{ minHeight: 350 }}>
        <Form.Item required label="执行对象">
          {targets.map((id, index) => (
            <React.Fragment key={index}>
              <Select
                value={id}
                showSearch
                placeholder="请选择"
                optionFilterProp="children"
                style={{ width: '80%', marginRight: 10, marginBottom: 12 }}
                filterOption={(input, option) => {
                  const children = option?.children;
                  if (typeof children === 'string') {
                    return (children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }
                  return false;
                }}
                onChange={v => editTarget(index, v)}
              >
                <Select.Option value="local" disabled={targets.includes('local')}>
                  本机
                </Select.Option>
                {rawRecords.map(item => (
                  <Select.Option 
                    key={item.id} 
                    value={item.id} 
                    disabled={targets.includes(item.id)}
                  >
                    {`${item.name}(${item.hostname}:${item.port})`}
                  </Select.Option>
                ))}
              </Select>
              {targets.length > 1 && (
                <MinusCircleOutlined 
                  className={styles.delIcon} 
                  onClick={() => delTarget(index)} 
                />
              )}
            </React.Fragment>
          ))}
        </Form.Item>
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <HostSelector 
            value={targets.filter(x => x !== 'local') as number[]} 
            onChange={handleChange}
          >
            <Button type="dashed" style={{ width: '80%' }}>
              <PlusOutlined />添加执行对象
            </Button>
          </HostSelector>
        </Form.Item>
      </Form>
      
      <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
        <Button 
          disabled={targets.filter(x => x).length === 0} 
          type="primary"
          onClick={() => setPage(2)}
        >
          下一步
        </Button>
        <Button 
          style={{ marginLeft: 20 }} 
          onClick={() => setPage(0)}
        >
          上一步
        </Button>
      </Form.Item>
    </>
  );
};

export default ScheduleStep2;
