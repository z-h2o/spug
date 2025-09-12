/**
 * 自定义发布表单组件
 */
import React from 'react';
import { Modal, Steps } from 'antd';
import useDeployAppStore from '@/stores/deployAppStore';
import Ext2Setup1 from './Ext2Setup1';
import Ext2Setup2 from './Ext2Setup2';
import styles from '../index.module.scss';

const Ext2Form: React.FC = () => {
  const { 
    ext2Visible, 
    setExt2Visible, 
    getCurrentRecord,
    deploy, 
    isReadOnly, 
    page 
  } = useDeployAppStore();

  const currentRecord = getCurrentRecord();
  const appName = currentRecord?.name || '';
  let title = `自定义发布 - ${appName}`;
  
  if (deploy.id) {
    title = isReadOnly ? '查看' + title : '编辑' + title;
  } else {
    title = '新建' + title;
  }

  return (
    <Modal
      open={ext2Visible}
      width={900}
      maskClosable={false}
      title={title}
      onCancel={() => setExt2Visible(false)}
      footer={null}
    >
      <Steps current={page} className={styles.steps}>
        <Steps.Step key={0} title="基本配置" />
        <Steps.Step key={1} title="执行动作" />
      </Steps>
      {page === 0 && <Ext2Setup1 />}
      {page === 1 && <Ext2Setup2 />}
    </Modal>
  );
};

export default Ext2Form;
