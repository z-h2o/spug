/**
 * 角色关联用户组件
 */
import React from 'react';
import { Badge, Table } from 'antd';
import useSystemAccountStore from '@/stores/systemAccountStore';

interface RoleUsersProps {
  id: number;
}

const RoleUsers: React.FC<RoleUsersProps> = ({ id }) => {
  const { records } = useSystemAccountStore();
  
  const users = records.filter(x => x.role_ids.includes(id));
  
  return (
    <Table 
      rowKey="id" 
      dataSource={users} 
      pagination={false} 
      scroll={{ y: 500 }}
    >
      <Table.Column 
        width={120} 
        title="姓名" 
        dataIndex="nickname" 
      />
      <Table.Column 
        width={90} 
        title="状态" 
        dataIndex="is_active"
        render={(isActive: boolean) => 
          isActive ? 
            <Badge status="success" text="正常" /> : 
            <Badge status="default" text="禁用" />
        }
      />
      <Table.Column 
        width={180} 
        title="最近登录" 
        dataIndex="last_login" 
      />
    </Table>
  );
};

export default RoleUsers;
