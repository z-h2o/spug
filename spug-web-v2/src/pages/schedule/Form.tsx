/**
 * 任务调度表单组件
 */
import React, { useEffect } from 'react';
import { Modal, Steps } from 'antd';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import useScheduleStore from '@/stores/scheduleStore';
import useHostStore from '@/stores/hostStore';
import styles from './index.module.scss';

const ScheduleForm: React.FC = () => {
  const { record, page, setFormVisible, setTargets } = useScheduleStore();
  const { initial } = useHostStore();

  useEffect(() => {
    initial();
    setTargets(record.id ? record.targets || [] : [undefined]);
  }, [initial, record.id, record.targets, setTargets]);

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
        <Steps.Step key={1} title="选择执行对象" />
        <Steps.Step key={2} title="设置触发器" />
      </Steps>
      {page === 0 && <Step1 />}
      {page === 1 && <Step2 />}
      {page === 2 && <Step3 />}
    </Modal>
  );
};

export default ScheduleForm;