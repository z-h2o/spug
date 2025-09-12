/**
 * 发布方式选择组件
 */
import React from 'react';
import { Modal, Card } from 'antd';
import { BuildOutlined, OrderedListOutlined } from '@ant-design/icons';
import useDeployAppStore from '@/stores/deployAppStore';
import styles from '../index.module.scss';

const AddSelect: React.FC = () => {
  const { addVisible, setDeploy, setExt1Visible, setExt2Visible, setAddVisible } = useDeployAppStore();

  const switchExt1 = () => {
    setAddVisible(false);
    setExt1Visible(true);
    setDeploy({
      extend: '1',
      git_type: 'branch',
      is_audit: false,
      is_parallel: true, // 默认选中并行
      rst_notify: { mode: '0' },
      host_ids: [],
      filter_rule: { type: 'contain', data: '' }
    });
  };

  const switchExt2 = () => {
    setAddVisible(false);
    setExt2Visible(true);
    setDeploy({
      extend: '2',
      is_audit: false,
      is_parallel: true, // 默认选中并行
      rst_notify: { mode: '0' },
      host_ids: [],
      host_actions: [],
      server_actions: []
    });
  };

  return (
    <Modal
      open={addVisible}
      width={800}
      maskClosable={false}
      title="选择发布方式"
      onCancel={() => setAddVisible(false)}
      footer={null}
    >
      <div className={styles.cardBlock}>
        <Card
          style={{ width: 300, cursor: 'pointer' }}
          bodyStyle={{ display: 'flex' }}
          onClick={switchExt1}
        >
          <div style={{ marginRight: 16 }}>
            <OrderedListOutlined style={{ fontSize: 36, color: '#1890ff' }} />
          </div>
          <div>
            <div className={styles.cardTitle}>常规发布</div>
            <div className={styles.cardDesc}>
              由 Spug 来控制发布的主流程，你可以通过添加钩子脚本来执行额外的自定义操作。
            </div>
          </div>
        </Card>
        <Card
          style={{ width: 300, cursor: 'pointer' }}
          bodyStyle={{ display: 'flex' }}
          onClick={switchExt2}
        >
          <div style={{ marginRight: 16 }}>
            <BuildOutlined style={{ fontSize: 36, color: '#1890ff' }} />
          </div>
          <div>
            <div className={styles.cardTitle}>自定义发布</div>
            <div className={styles.cardDesc}>
              你可以完全自己定义发布的所有流程和操作，Spug 负责按顺序依次执行你记录的动作。
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default AddSelect;
