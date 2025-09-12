/**
 * 模板表格组件
 */
import React, { useEffect } from 'react';
import { Modal, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Action, AuthButton, TableCard } from '@/components';
import http from '@/libs/http';
import useTemplateStore from '@/stores/execTemplateStore';

const TemplateTable: React.FC = () => {
  const {
    isFetching,
    getDataSource,
    fetchRecords,
    showForm,
  } = useTemplateStore();

  const dataSource = getDataSource();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除模板【${record.name}】?`,
      onOk: () => {
        return http.delete('/api/exec/template/', { params: { id: record.id } })
          .then(() => {
            message.success('删除成功');
            fetchRecords();
          });
      },
    });
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模板类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '解释器',
      dataIndex: 'interpreter',
      key: 'interpreter',
      render: (interpreter: string) => (
        <Tag color={interpreter === 'python' ? 'blue' : 'green'}>
          {interpreter}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (record: any) => (
        <Action>
          <Action.Button 
            auth="exec.template.edit" 
            onClick={() => showForm(record)}
          >
            编辑
          </Action.Button>
          <Action.Button 
            danger 
            auth="exec.template.del" 
            onClick={() => handleDelete(record)}
          >
            删除
          </Action.Button>
        </Action>
      ),
    },
  ];

  return (
    <TableCard
      rowKey="id"
      title="模板列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="exec.template.add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showForm()}
        >
          新建
        </AuthButton>,
      ]}
      columns={columns}
      pagination={{
        showSizeChanger: true,
        showLessItems: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
    />
  );
};

export default TemplateTable;
