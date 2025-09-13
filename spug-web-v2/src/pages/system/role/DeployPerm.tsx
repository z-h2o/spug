/**
 * 发布权限管理组件
 */
import React from 'react';
import { Modal } from 'antd';
import useSystemRoleStore from '@/stores/systemRoleStore';

const DeployPerm: React.FC = () => {
  const { setDeployPermVisible } = useSystemRoleStore();

  return (
    <Modal
      open
      width={800}
      title="发布权限"
      onCancel={() => setDeployPermVisible(false)}
      onOk={() => setDeployPermVisible(false)}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>发布权限管理</h3>
        <p>此功能正在开发中，敬请期待...</p>
      </div>
    </Modal>
  );
};

export default DeployPerm;
