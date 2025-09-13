/**
 * 主机权限管理组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, message, TreeSelect } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import useHostStore from '@/stores/hostStore';
import http from '@/libs/http';
import useSystemRoleStore from '@/stores/systemRoleStore';
import styles from './index.module.scss';

const HostPerm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<(number | undefined)[]>([]);
  
  const { 
    record, 
    setHostPermVisible, 
    fetchRecords 
  } = useSystemRoleStore();
  
  const { rawTreeData, fetchRecords: fetchHosts } = useHostStore();

  useEffect(() => {
    fetchHosts();
    // 初始化主机组权限
    setGroups([...(record.group_perms || [])]);
  }, [record.group_perms, fetchHosts]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await http.patch('/api/account/role/', { 
        id: record.id, 
        group_perms: groups.filter(g => g !== undefined) 
      });
      message.success('操作成功');
      setHostPermVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to update host permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index?: number, value?: number) => {
    const tmp = [...groups];
    if (index !== undefined) {
      if (value !== undefined) {
        tmp[index] = value;
      } else {
        tmp.splice(index, 1);
      }
    } else {
      tmp.push(undefined);
    }
    setGroups(tmp);
  };

  return (
    <Modal
      open
      width={400}
      maskClosable={false}
      title="主机权限设置"
      onCancel={() => setHostPermVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form layout="vertical">
        <Form.Item 
          label="授权访问主机组" 
          tooltip="主机权限将全局影响属于该角色的用户能够看到的主机。"
        >
          {groups.map((id, index) => (
            <div className={styles.groupItem} key={index}>
              <TreeSelect
                value={id}
                allowClear
                showSearch={false}
                treeNodeLabelProp="name"
                treeData={rawTreeData}
                onChange={(value) => handleChange(index, value)}
                placeholder="请选择分组"
              />
              {groups.length > 1 && (
                <MinusCircleOutlined 
                  className={styles.delIcon} 
                  onClick={() => handleChange(index)} 
                />
              )}
            </div>
          ))}
        </Form.Item>
        
        <Form.Item>
          <Button 
            type="dashed" 
            style={{ width: '100%' }} 
            onClick={() => handleChange()}
          >
            <PlusOutlined />添加授权主机组
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HostPerm;
