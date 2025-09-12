/**
 * 常规发布表单组件
 */
import React from 'react';
import { Modal, Steps } from 'antd';
import useDeployAppStore from '@/stores/deployAppStore';
import Ext1Setup1 from './Ext1Setup1';
import Ext1Setup2 from './Ext1Setup2';
import Ext1Setup3 from './Ext1Setup3';
import styles from '../index.module.scss';

const Ext1Form: React.FC = () => {
  const { 
    ext1Visible, 
    setExt1Visible, 
    getCurrentRecord,
    deploy, 
    isReadOnly, 
    page 
  } = useDeployAppStore();

  const currentRecord = getCurrentRecord();
  const appName = currentRecord?.name || '';
  let title = `常规发布 - ${appName}`;
  
  if (deploy.id) {
    title = isReadOnly ? '查看' + title : '编辑' + title;
  } else {
    title = '新建' + title;
  }

  return (
    <Modal
      open={ext1Visible}
      width={800}
      maskClosable={false}
      title={title}
      onCancel={() => setExt1Visible(false)}
      footer={null}
    >
      <Steps current={page} className={styles.steps}>
        <Steps.Step key={0} title="基本配置" />
        <Steps.Step key={1} title="构建配置" />
        <Steps.Step key={2} title="发布配置" />
      </Steps>
      {page === 0 && <Ext1Setup1 />}
      {page === 1 && <Ext1Setup2 />}
      {page === 2 && <Ext1Setup3 />}
    </Modal>
  );
};

export default Ext1Form;
