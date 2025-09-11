/**
 * 主机分组组件
 */
import React, { useState, useEffect } from 'react';
import { Input, Card, Tree, Dropdown, Menu, Switch, Tooltip, Spin, Modal } from 'antd';
import {
  FolderOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CloseOutlined,
  ScissorOutlined,
  LoadingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { AuthFragment } from '@/components';
import { hasPermission } from '@/utils/auth';
import http from '@/libs/http';
import { cloneDeep } from '@/utils/helper';
import useHostStore from '@/stores/hostStore';
import styles from './index.module.scss';

const Group: React.FC = () => {
  const {
    rawTreeData,
    group,
    grpFetching,
    getTreeData,
    getCounter,
    fetchGroups,
    fetchRecords,
    showSelector,
    setGroup
  } = useHostStore();

  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const [action, setAction] = useState('');
  const [expands, setExpands] = useState<React.Key[]>([]);
  const [bakTreeData, setBakTreeData] = useState<any>();

  const treeData = getTreeData();
  const counter = getCounter();

  useEffect(() => {
    if (loading === false) fetchGroups();
  }, [loading, fetchGroups]);

  useEffect(() => {
    if (!isReady) {
      const length = treeData.length;
      if (length > 0 && length < 5) {
        const tmp = treeData.filter(x => x.children.length);
        setExpands(tmp.map(x => x.key));
        setIsReady(true);
      }
    }
  }, [treeData, isReady]);

  const menus = (
    <Menu onClick={() => setVisible(false)}>
      <Menu.Item key="0" icon={<FolderOutlined />} onClick={handleAddRoot}>
        新建根分组
      </Menu.Item>
      <Menu.Item key="1" icon={<FolderAddOutlined />} onClick={handleAdd}>
        新建子分组
      </Menu.Item>
      <Menu.Item key="2" icon={<EditOutlined />} onClick={() => setAction('edit')}>
        重命名
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" icon={<CopyOutlined />} onClick={() => showSelector(true)}>
        添加主机
      </Menu.Item>
      <Menu.Item key="4" icon={<ScissorOutlined />} onClick={() => showSelector(false)}>
        移动主机
      </Menu.Item>
      <Menu.Item key="5" icon={<CloseOutlined />} danger onClick={handleRemoveHosts}>
        删除主机
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="6" icon={<DeleteOutlined />} danger onClick={handleRemove}>
        删除此分组
      </Menu.Item>
    </Menu>
  );

  function handleSubmit() {
    if (group.title) {
      setLoading(true);
      const { key, parent_id, title } = group;
      http.post('/api/host/group/', { id: key || undefined, parent_id, name: title })
        .then(() => setAction(''))
        .finally(() => setLoading(false));
    } else {
      if (group.key === 0) {
        useHostStore.setState({ rawTreeData: bakTreeData });
      }
      setAction('');
    }
  }

  function handleRemoveHosts() {
    if (!group.key) return;
    Modal.confirm({
      title: '操作确认',
      content: `批量删除【${group.title}】分组内的 ${counter[group.key]?.size || 0} 个主机？`,
      onOk: () => http.delete('/api/host/', { params: { group_id: group.key } })
        .then(fetchRecords)
    });
  }

  function handleRemove() {
    setAction('del');
    setLoading(true);
    http.delete('/api/host/group/', { params: { id: group.key } })
      .finally(() => {
        setAction('');
        setLoading(false);
      });
  }

  function handleAddRoot() {
    setBakTreeData(cloneDeep(rawTreeData));
    const current = { key: 0, parent_id: 0, title: '', children: [] };
    const newTreeData = [current, ...rawTreeData];
    useHostStore.setState({ rawTreeData: newTreeData });
    setGroup(current);
    setAction('edit');
  }

  function handleAdd() {
    setBakTreeData(cloneDeep(rawTreeData));
    const current = { key: 0, parent_id: group.key, title: '', children: [] };
    const node = findNode(rawTreeData, group.key!);
    if (node) {
      node.children.unshift(current);
      useHostStore.setState({ rawTreeData: cloneDeep(rawTreeData) });
      if (!expands.includes(group.key!)) {
        setExpands([group.key!, ...expands]);
      }
      setGroup(current);
      setAction('edit');
    }
  }

  function findNode(list: any[], key: number): any {
    for (const item of list) {
      if (item.key === key) return item;
      const node = findNode(item.children, key);
      if (node) return node;
    }
    return null;
  }

  function handleDrag(v: any) {
    setLoading(true);
    const pos = v.node.pos.split('-');
    const dropPosition = v.dropPosition - Number(pos[pos.length - 1]);
    http.patch('/api/host/group/', { s_id: v.dragNode.key, d_id: v.node.key, action: dropPosition })
      .then(() => setLoading(false));
  }

  function handleRightClick(v: any) {
    if (hasPermission('admin')) {
      setGroup(v.node);
      setVisible(true);
    }
  }

  function handleExpand(keys: React.Key[], { node }: any) {
    if (node.children.length > 0) {
      setExpands(keys);
    }
  }

  function treeRender(nodeData: any) {
    if (action === 'edit' && nodeData.key === group.key) {
      return (
        <Input
          autoFocus
          size="small"
          style={{ width: 'calc(100% - 24px)' }}
          defaultValue={nodeData.title}
          placeholder="请输入"
          suffix={loading ? <LoadingOutlined /> : <span />}
          onClick={e => e.stopPropagation()}
          onBlur={handleSubmit}
          onChange={e => setGroup({ ...group, title: e.target.value })}
          onPressEnter={handleSubmit}
        />
      );
    } else if (action === 'del' && nodeData.key === group.key) {
      return <LoadingOutlined style={{ marginLeft: '4px' }} />;
    } else {
      const length = counter[nodeData.key]?.size;
      return (
        <div className={styles.treeNode}>
          {expands.includes(nodeData.key) ? <FolderOpenOutlined /> : <FolderOutlined />}
          <div className={styles.title}>{nodeData.title}</div>
          {length ? <div className={styles.number}>{length}</div> : null}
        </div>
      );
    }
  }

  return (
    <Card
      title="分组列表"
      className={styles.group}
      extra={
        <AuthFragment auth="admin">
          <Switch
            checked={draggable}
            onChange={setDraggable}
            checkedChildren="排版"
            unCheckedChildren="浏览"
          />
          <Tooltip title="排版模式下，可通过拖拽分组实现快速排序，右键点击分组进行分组管理。">
            <QuestionCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
          </Tooltip>
        </AuthFragment>
      }
    >
      <Spin spinning={grpFetching}>
        <Dropdown
          overlay={menus}
          open={visible}
          trigger={['contextMenu']}
          onOpenChange={v => v || setVisible(v)}
        >
          <Tree.DirectoryTree
            showIcon={false}
            autoExpandParent
            expandAction="doubleClick"
            draggable={draggable}
            treeData={treeData}
            titleRender={treeRender}
            expandedKeys={expands}
            selectedKeys={[group.key!]}
            onSelect={(_, { node }) => setGroup(node)}
            onExpand={handleExpand}
            onDrop={handleDrag}
            onRightClick={handleRightClick}
          />
        </Dropdown>
      </Spin>
      {treeData.length === 1 && treeData[0].children.length === 0 && (
        <div style={{ color: '#999', marginTop: 20, textAlign: 'center' }}>
          右键点击分组进行分组管理哦~
        </div>
      )}
      {rawTreeData.length === 0 && (
        <div style={{ color: '#999' }}>
          你还没有可访问的主机分组，请联系管理员分配主机权限。
        </div>
      )}
    </Card>
  );
};

export default Group;
