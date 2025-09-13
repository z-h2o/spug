/**
 * 主机权限管理组件
 */
import React from 'react';
import { Modal } from 'antd';
import useSystemRoleStore from '@/stores/systemRoleStore';

const HostPerm: React.FC = () => {
  const { setHostPermVisible } = useSystemRoleStore();

  return (
    <Modal
      open
      width={800}
      title="主机权限"
      onCancel={() => setHostPermVisible(false)}
      onOk={() => setHostPermVisible(false)}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>主机权限管理</h3>
        <p>此功能正在开发中，敬请期待...</p>
      </div>
    </Modal>
  );
};

export default HostPerm;
