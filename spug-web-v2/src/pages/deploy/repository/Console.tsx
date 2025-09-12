/**
 * 构建仓库控制台组件
 */
import React from 'react';
import { Modal } from 'antd';
import useRepositoryStore from '@/stores/repositoryStore';
import { PagePlaceholder } from '@/components';

const Console: React.FC = () => {
  const { record, setLogVisible } = useRepositoryStore();

  return (
    <Modal
      open
      width={1000}
      title={`构建日志 - ${record.version}`}
      onCancel={() => setLogVisible(false)}
      footer={null}
      destroyOnClose
    >
      <PagePlaceholder 
        title="构建控制台"
        description="构建日志功能正在开发中，敬请期待..."
      />
    </Modal>
  );
};

export default Console;
