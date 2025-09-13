/**
 * 功能权限管理组件
 */
import React from 'react';
import { Modal } from 'antd';
import useSystemRoleStore from '@/stores/systemRoleStore';

const PagePerm: React.FC = () => {
  const { setPagePermVisible } = useSystemRoleStore();

  return (
    <Modal
      open
      width={800}
      title="功能权限"
      onCancel={() => setPagePermVisible(false)}
      onOk={() => setPagePermVisible(false)}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>功能权限管理</h3>
        <p>此功能正在开发中，敬请期待...</p>
      </div>
    </Modal>
  );
};

export default PagePerm;
