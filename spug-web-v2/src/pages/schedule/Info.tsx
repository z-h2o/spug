/**
 * 任务执行详情组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Spin } from 'antd';
import http from '@/libs/http';
import useScheduleStore from '@/stores/scheduleStore';
import dayjs from 'dayjs';

interface InfoData {
  run_time?: string;
  success?: number;
  failure?: number;
  duration?: number;
  outputs?: Array<{
    name: string;
    code: number;
    duration: number;
    output: string;
  }>;
}

const ScheduleInfo: React.FC = () => {
  const { record, infoVisible, setInfoVisible } = useScheduleStore();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<InfoData>({});

  useEffect(() => {
    if (infoVisible && record.id) {
      setLoading(true);
      http.get(`/api/schedule/${record.id}/?id=${record.h_id}`)
        .then((res: any) => setInfo(res))
        .finally(() => setLoading(false));
    }
  }, [infoVisible, record.id, record.h_id]);

  const { run_time, success, failure, duration, outputs } = info;
  
  const preStyle: React.CSSProperties = {
    marginTop: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    padding: 10,
    maxHeight: 215,
    overflowY: 'auto',
    fontSize: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  };

  // 创建一个简单的统计卡片组件
  const StatisticsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      padding: '16px 0',
      borderBottom: '1px solid #f0f0f0',
      marginBottom: 16
    }}>
      {children}
    </div>
  );

  const StatisticsItem: React.FC<{ 
    title: string; 
    value: React.ReactNode; 
  }> = ({ title, value }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ color: '#666', fontSize: 14 }}>
        {title}
      </div>
    </div>
  );

  return (
    <Modal
      open={infoVisible}
      width={800}
      maskClosable={false}
      title="任务执行详情"
      onCancel={() => setInfoVisible(false)}
      footer={null}
    >
      <Spin spinning={loading}>
        <StatisticsCard>
          <StatisticsItem 
            title="执行成功" 
            value={<span style={{ color: '#3f8600' }}>{success || 0}</span>} 
          />
          <StatisticsItem 
            title="执行失败" 
            value={<span style={{ color: '#cf1322' }}>{failure || 0}</span>} 
          />
          <StatisticsItem 
            title="平均耗时(秒)" 
            value={<span>{duration || 0}</span>} 
          />
        </StatisticsCard>
        
        {outputs && outputs.length > 0 && (
          <Tabs 
            tabPosition="left" 
            defaultActiveKey="0" 
            style={{ width: 700, height: 350, margin: 'auto' }}
          >
            {outputs.map((item, index) => (
              <Tabs.TabPane
                key={`${index}`}
                tab={item.code === 0 ? item.name : <span style={{ color: 'red' }}>{item.name}</span>}
              >
                <div>
                  <div>执行时间：{run_time}（{run_time ? dayjs(run_time).fromNow() : ''}）</div>
                  <div style={{ marginTop: 5 }}>运行耗时：{item.duration} s</div>
                  <div style={{ marginTop: 5 }}>
                    返回状态：{item.code}（非 0 则判定为失败）
                  </div>
                  <div style={{ marginTop: 5 }}>
                    执行输出：
                    <pre style={preStyle}>{item.output || '无输出'}</pre>
                  </div>
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        )}
        
        {(!outputs || outputs.length === 0) && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            暂无执行输出数据
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ScheduleInfo;
