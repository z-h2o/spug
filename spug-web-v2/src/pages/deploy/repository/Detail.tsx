/**
 * 构建仓库详情组件
 */
import React from 'react';
import { Modal } from 'antd';
import useRepositoryStore from '@/stores/repositoryStore';
import { PagePlaceholder } from '@/components';

interface DetailProps {
  visible: boolean;
}

const Detail: React.FC<DetailProps> = ({ visible }) => {
  const { record, setDetailVisible } = useRepositoryStore();

  return (
    <Modal
      open={visible}
      width={800}
      title={`构建详情 - ${record.version}`}
      onCancel={() => setDetailVisible(false)}
      footer={null}
      destroyOnClose
    >
      <PagePlaceholder 
        title="构建详情"
        description="构建详情功能正在开发中，敬请期待..."
      />
    </Modal>
  );
};

export default Detail;
