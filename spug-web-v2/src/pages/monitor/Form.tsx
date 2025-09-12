/**
 * 监控管理表单组件
 */
import React, { useEffect } from 'react';
import { Modal, Steps } from 'antd';
import Step1 from './Step1';
import Step2 from './Step2';
import useMonitorStore from '@/stores/monitorStore';
import useAlarmGroupStore from '@/stores/alarmGroupStore';
import styles from './index.module.scss';

const MonitorForm: React.FC = () => {
  const { record, page, setFormVisible } = useMonitorStore();
  const { fetchRecords: fetchAlarmGroups } = useAlarmGroupStore();

  useEffect(() => {
    fetchAlarmGroups();
  }, [fetchAlarmGroups]);

  return (
    <Modal
      open
      width={800}
      maskClosable={false}
      title={record.id ? '编辑任务' : '新建任务'}
      onCancel={() => setFormVisible(false)}
      footer={null}
    >
      <Steps current={page} className={styles.steps}>
        <Steps.Step key={0} title="创建任务" />
        <Steps.Step key={1} title="设置规则" />
      </Steps>
      {page === 0 && <Step1 />}
      {page === 1 && <Step2 />}
    </Modal>
  );
};

export default MonitorForm;