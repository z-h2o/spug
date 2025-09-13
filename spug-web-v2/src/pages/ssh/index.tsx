/**
 * SSH终端页面
 */
import React, { useEffect, useState } from 'react';
import { Tabs, Tree, Input, Spin, Dropdown, Menu, Button, Drawer } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  CloudServerOutlined,
  SearchOutlined,
  SyncOutlined,
  CopyOutlined,
  ReloadOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  CloseOutlined,
  LeftOutlined,
  SkinFilled,
} from '@ant-design/icons';
import { NotFound, AuthButton } from '@/components';
import Terminal from './Terminal';
import FileManager from './FileManager';
import Setting from './Setting';
import http from '@/libs/http';
import { hasPermission, includes } from '@/utils/functools';
import { cloneDeep, find, findIndex } from 'lodash';
import styles from './index.module.scss';
import { useLocation } from 'react-router-dom';

let posX = 0;

interface Host {
  id: number;
  title: string;
  hostname: string;
  isLeaf?: boolean;
  vId?: string;
  children?: Host[];
  expanded?: boolean;
}

const WebSSH: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [rawTreeData, setRawTreeData] = useState<Host[]>([]);
  const [rawHostList, setRawHostList] = useState<Host[]>([]);
  const [treeData, setTreeData] = useState<Host[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [hosts, setHosts] = useState<Host[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [hostId, setHostId] = useState<number>();
  const [width, setWidth] = useState(280);
  const sshMode = hasPermission('host.console.view');

  useEffect(() => {
    window.document.title = 'Spug web terminal';
    window.addEventListener('beforeunload', leaveTips);
    fetchNodes();
    return () => window.removeEventListener('beforeunload', leaveTips);
  }, []);

  useEffect(() => {
    if (searchValue) {
      const newTreeData = rawHostList.filter(x => 
        includes([x.title, x.hostname], searchValue)
      );
      setTreeData(newTreeData);
    } else {
      setTreeData(rawTreeData);
    }
  }, [searchValue, rawTreeData, rawHostList]);

  function leaveTips(e: BeforeUnloadEvent) {
    e.returnValue = '确定要离开页面？';
  }

  function fetchNodes() {
    setFetching(true);
    http.get('/api/host/group/?with_hosts=1')
      .then((res: any) => {
        const tmp: Record<number, Host> = {};
        setRawTreeData(res.treeData || res.data?.treeData || []);
        setTreeData(res.treeData || res.data?.treeData || []);
        
        const loop = (data: Host[]) => {
          for (let item of data) {
            if (item.children) {
              loop(item.children);
            } else if (item.isLeaf) {
              tmp[item.id] = item;
            }
          }
        };
        
        loop(res.treeData || res.data?.treeData || []);
        setRawHostList(Object.values(tmp));
        
        const query = new URLSearchParams(location.search);
        const id = query.get('id');
        if (id) {
          const node = find(Object.values(tmp), { id: Number(id) });
          if (node) _openNode(node);
        }
      })
      .finally(() => setFetching(false));
  }

  function _openNode(node: Host, replace?: boolean) {
    const newNode = { ...node };
    newNode.vId = String(new Date().getTime());
    
    if (replace) {
      const index = findIndex(hosts, { vId: node.vId });
      if (index >= 0) {
        const newHosts = [...hosts];
        newHosts[index] = newNode;
        setHosts(newHosts);
      }
    } else {
      setHosts([...hosts, newNode]);
    }
    setActiveId(newNode.vId);
  }

  function handleSelect(e: any) {
    if (e.nativeEvent.detail > 1 && e.node.isLeaf) {
      _openNode(e.node);
    }
  }

  function handleRemove(key: string, target: string) {
    const index = findIndex(hosts, x => x.vId === key);
    if (index === -1) return;
    
    let newHosts = [...hosts];
    
    switch (target) {
      case 'self':
        newHosts.splice(index, 1);
        setHosts(newHosts);
        if (newHosts.length > index) {
          setActiveId(newHosts[index].vId);
        } else if (newHosts.length) {
          setActiveId(newHosts[index - 1].vId);
        } else {
          setActiveId(undefined);
        }
        break;
      case 'right':
        newHosts.splice(index + 1, newHosts.length);
        setHosts(newHosts);
        setActiveId(key);
        break;
      case 'other':
        setHosts([hosts[index]]);
        setActiveId(key);
        break;
      case 'all':
        setHosts([]);
        setActiveId(undefined);
        break;
      default:
        break;
    }
  }

  function handleOpenFileManager() {
    const index = findIndex(hosts, x => x.vId === activeId);
    if (index !== -1) {
      setHostId(hosts[index].id);
      setVisible(true);
    }
  }

  function renderIcon(props: any) {
    const node = props as Host;
    if (node.isLeaf) {
      return <CloudServerOutlined />;
    } else if (node.expanded) {
      return <FolderOpenOutlined />;
    } else {
      return <FolderOutlined />;
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (posX) {
      setWidth(e.pageX);
    }
  }

  function handleTabAction(action: string, host: Host, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    switch (action) {
      case 'copy':
        return _openNode(host);
      case 'reconnect':
        return _openNode(host, true);
      case 'rClose':
        return handleRemove(host.vId!, 'right');
      case 'oClose':
        return handleRemove(host.vId!, 'other');
      case 'aClose':
        return handleRemove(host.vId!, 'all');
      default:
        break;
    }
  }

  const TabRender: React.FC<{ host: Host }> = ({ host }) => {
    return (
      <Dropdown 
        trigger={['contextMenu']} 
        overlay={
          <Menu onClick={({ key, domEvent }) => handleTabAction(key, host, domEvent as any)}>
            <Menu.Item key="copy" icon={<CopyOutlined />}>复制窗口</Menu.Item>
            <Menu.Item key="reconnect" icon={<ReloadOutlined />}>重新连接</Menu.Item>
            <Menu.Item 
              key="rClose"
              icon={<VerticalAlignBottomOutlined style={{ transform: 'rotate(90deg)' }} />}
            >
              关闭右侧
            </Menu.Item>
            <Menu.Item 
              key="oClose"
              icon={<VerticalAlignMiddleOutlined style={{ transform: 'rotate(90deg)' }} />}
            >
              关闭其他
            </Menu.Item>
            <Menu.Item key="aClose" icon={<CloseOutlined />}>关闭所有</Menu.Item>
          </Menu>
        }
      >
        <div 
          className={styles.tabRender} 
          onDoubleClick={() => handleTabAction('copy', host)}
        >
          {host.title}
        </div>
      </Dropdown>
    );
  };

  const spugWebTerminal =
    '                                                 __       __                          _                __\n' +
    '   _____ ____   __  __ ____ _   _      __ ___   / /_     / /_ ___   _____ ____ ___   (_)____   ____ _ / /\n' +
    '  / ___// __ \\ / / / // __ `/  | | /| / // _ \\ / __ \\   / __// _ \\ / ___// __ `__ \\ / // __ \\ / __ `// / \n' +
    ' (__  )/ /_/ // /_/ // /_/ /   | |/ |/ //  __// /_/ /  / /_ /  __// /   / / / / / // // / / // /_/ // /  \n' +
    '/____// .___/ \\__,_/ \\__, /    |__/|__/ \\___//_.___/   \\__/ \\___//_/   /_/ /_/ /_//_//_/ /_/ \\__,_//_/   \n' +
    '     /_/            /____/                                                                               \n';

  return hasPermission('host.console.view|host.console.list') || process.env.NODE_ENV === 'development' ? (
    <div 
      className={styles.container} 
      onMouseUp={() => posX = 0} 
      onMouseMove={handleMouseMove}
    >
      <div className={styles.sider} style={{ width }}>
        <a className={styles.logo} href="/host" target="_blank" rel="noopener noreferrer">
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Spug</div>
        </a>
        <div className={styles.hosts}>
          <Spin spinning={fetching}>
            <Input 
              allowClear 
              className={styles.search} 
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              placeholder="输入主机名/IP检索" 
              onChange={e => setSearchValue(e.target.value)} 
            />
            <Button 
              icon={<SyncOutlined />} 
              type="link" 
              loading={fetching} 
              onClick={fetchNodes} 
            />
            {treeData.length > 0 ? (
              <Tree.DirectoryTree
                defaultExpandAll={treeData.length > 0 && treeData.length < 5}
                expandAction="doubleClick"
                treeData={treeData}
                icon={renderIcon}
                onSelect={(k, e) => handleSelect(e)}
              />
            ) : null}
          </Spin>
        </div>
        <div className={styles.split} onMouseDown={e => posX = e.pageX} />
      </div>
      <div className={styles.content}>
        <Tabs
          hideAdd
          activeKey={activeId}
          type="editable-card"
          onTabClick={key => setActiveId(key)}
          onEdit={(key, action) => action === 'remove' ? handleRemove(key as string, 'self') : null}
          style={{ background: '#fff', width: `calc(100vw - ${width}px)` }}
          tabBarExtraContent={hosts.length === 0 ? (
            <div className={styles.tips}>小提示：双击标签快速复制窗口，右击标签展开更多操作。</div>
          ) : sshMode ? (
            <React.Fragment>
              <AuthButton
                auth="host.console.list"
                type="link"
                disabled={!activeId}
                onClick={handleOpenFileManager}
                icon={<LeftOutlined />}
              >
                文件管理器
              </AuthButton>
              <SkinFilled className={styles.setting} onClick={() => setVisible2(true)} />
            </React.Fragment>
          ) : null}
        >
          {hosts.map(item => (
            <Tabs.TabPane key={item.vId} tab={<TabRender host={item} />}>
              {sshMode ? (
                <Terminal id={item.id} vId={item.vId!} activeId={activeId} />
              ) : (
                <div className={styles.fileManager}>
                  <FileManager id={item.id} />
                </div>
              )}
            </Tabs.TabPane>
          ))}
        </Tabs>
        {hosts.length === 0 && (
          <pre className={sshMode ? styles.fig : styles.fig2}>{spugWebTerminal}</pre>
        )}
      </div>
      <Drawer
        title="文件管理器"
        placement="right"
        width={900}
        className={styles.drawerContainer}
        open={visible}
        onClose={() => setVisible(false)}
      >
        <FileManager id={hostId} />
      </Drawer>
      <Setting visible={visible2} onClose={() => setVisible2(false)} />
    </div>
  ) : (
    <div style={{ height: '100vh' }}>
      <NotFound />
    </div>
  );
};

export default WebSSH;