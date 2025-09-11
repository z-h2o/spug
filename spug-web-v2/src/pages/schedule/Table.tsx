/**
 * 任务计划表格组件
 */
import React from 'react';
import { Modal, Tag, Dropdown, Menu, Radio, message } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { LinkButton, Action, TableCard, AuthButton } from '@/components';
import http from '@/libs/http';
import useScheduleStore from '@/stores/scheduleStore';

const ScheduleTable: React.FC = () => {
  const {
    isFetching,
    f_active,
    getDataSource,
    fetchRecords,
    showForm,
    showInfo,
    showRecord,
    setFilterActive
  } = useScheduleStore();

  const dataSource = getDataSource();
  const colors = ['orange', 'green', 'red'];

  const moreMenus = (info: any) => (
    <Menu>
      <Menu.Item>
        <LinkButton auth="schedule.schedule.edit" onClick={() => handleTest(info)}>
          执行测试
        </LinkButton>
      </Menu.Item>
      <Menu.Item>
        <LinkButton auth="schedule.schedule.edit" onClick={() => handleActive(info)}>
          {info.is_active ? '禁用任务' : '激活任务'}
        </LinkButton>
      </Menu.Item>
      <Menu.Item>
        <LinkButton onClick={() => showRecord(info)}>历史记录</LinkButton>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <LinkButton danger auth="schedule.schedule.del" onClick={() => handleDelete(info)}>
          删除
        </LinkButton>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '任务类型',
      dataIndex: 'type',
    },
    {
      title: '最新状态',
      render: (info: any) => {
        if (info.is_active) {
          if (info.latest_status_alias) {
            return <Tag color={colors[info.latest_status]}>{info.latest_status_alias}</Tag>;
          } else {
            return <Tag color="blue">待调度</Tag>;
          }
        } else {
          return <Tag>未激活</Tag>;
        }
      },
    },
    {
      title: '更新于',
      dataIndex: 'latest_run_time_alias',
      sorter: (a: any, b: any) => a.latest_run_time.localeCompare(b.latest_run_time),
    },
    {
      title: '描述信息',
      dataIndex: 'desc',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 180,
      render: (info: any) => (
        <Action>
          <Action.Button
            disabled={info.latest_run_time === '1970-01-01'}
            onClick={() => showInfo(info)}
          >
            详情
          </Action.Button>
          <Action.Button auth="schedule.schedule.edit" onClick={() => showForm(info)}>
            编辑
          </Action.Button>
          <Dropdown overlay={() => moreMenus(info)} trigger={['click']}>
            <LinkButton>
              更多 <DownOutlined />
            </LinkButton>
          </Dropdown>
        </Action>
      ),
    },
  ];

  const handleActive = (record: any) => {
    Modal.confirm({
      title: '操作确认',
      content: `确定要${record.is_active ? '禁用' : '激活'}任务【${record.name}】?`,
      onOk: () => {
        return http.patch('/api/schedule/', { 
          id: record.id, 
          is_active: !record.is_active 
        }).then(() => {
          message.success('操作成功');
          fetchRecords();
        });
      },
    });
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除【${record.name}】?`,
      onOk: () => {
        return http.delete('/api/schedule/', { params: { id: record.id } })
          .then(() => {
            message.success('删除成功');
            fetchRecords();
          });
      },
    });
  };

  const handleTest = (record: any) => {
    Modal.confirm({
      title: '操作确认',
      content: '立即以串行模式执行该任务（不影响调度规则，且不会触发失败通知，测试执行会有120秒的超时，真实调度执行无此限制）？',
      onOk: () =>
        http.post(`/api/schedule/${record.id}/`, null, { timeout: 120000 })
          .then((res: any) => showInfo(record, res)),
    });
  };

  return (
    <TableCard
      rowKey="id"
      title="任务列表"
      loading={isFetching}
      dataSource={dataSource}
      onReload={fetchRecords}
      actions={[
        <AuthButton
          key="add"
          auth="schedule.schedule.add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showForm()}
        >
          新建
        </AuthButton>,
        <Radio.Group
          key="filter"
          value={f_active}
          onChange={e => setFilterActive(e.target.value)}
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="1">已激活</Radio.Button>
          <Radio.Button value="0">未激活</Radio.Button>
        </Radio.Group>,
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

export default ScheduleTable;
