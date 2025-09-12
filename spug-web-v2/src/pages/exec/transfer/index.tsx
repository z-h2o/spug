/**
 * 文件传输页面
 */
import React, { useState, useEffect } from 'react';
import {
  ThunderboltOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  CloudServerOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Form, Button, Tooltip, Space, Card, Table, Input, Upload, message } from 'antd';
import { AuthDiv, Breadcrumb } from '@/components';
import HostSelector from '@/pages/host/Selector';
import Output from './Output';
import http from '@/libs/http';
import { uniqueId } from '@/utils/common';
import dayjs from 'dayjs';
import useTransferStore from '@/stores/execTransferStore';
import styles from './index.module.scss';

interface FileItem {
  id: string;
  type: 'upload' | 'host';
  name: string;
  path: string | File;
  host_id?: number;
}

interface HistoryItem {
  host_id?: number;
  interpreter: string;
  host_ids: number[];
  dst_dir: string;
  updated_at: string;
}

const Transfer: React.FC = () => {
  const { setOutputs } = useTransferStore();

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dir, setDir] = useState('');
  const [hosts, setHosts] = useState<any[]>([]);
  const [percent, setPercent] = useState<string>();
  const [token, setToken] = useState<string>();
  const [histories, setHistories] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!loading) {
      http.get('/api/exec/transfer/')
        .then((res: any) => setHistories(res))
        .catch(() => setHistories([]));
    }
  }, [loading]);

  const handleProgress = (e: ProgressEvent) => {
    const data = (e.loaded / e.total) * 100;
    if (!percent && data === 100) return;
    setPercent(String(data).replace(/(\d+\.\d).*/, '$1'));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    if (files.length === 0) return message.error('请添加数据源');
    if (!dir) return message.error('请输入目标路径');
    if (hosts.length === 0) return message.error('请选择目标主机');

    const data = { dst_dir: dir, host_ids: hosts.map(x => x.id) };
    
    for (let index in files) {
      const item = files[index];
      if (item.type === 'host') {
        (data as any).host = JSON.stringify([item.host_id, item.path]);
      } else {
        formData.append(`file${index}`, item.path as File);
      }
    }
    
    formData.append('data', JSON.stringify(data));
    setLoading(true);
    
    http.post('/api/exec/transfer/', formData, {
      timeout: 600000,
      onUploadProgress: handleProgress as any
    })
      .then((res: any) => {
        const tmp: Record<string, any> = {};
        for (let host of hosts) {
          tmp[host.id] = {
            title: `${host.name}(${host.hostname}:${host.port})`,
            data: '\x1b[36m### WebSocket connecting ...\x1b[0m',
            status: -2
          };
        }
        setOutputs(tmp);
        setToken(res);
      })
      .finally(() => {
        setLoading(false);
        setPercent(undefined);
      });
  };

  const makeFile = (row: any) => {
    setFiles([{
      id: uniqueId(),
      type: 'host',
      name: row.name,
      path: '',
      host_id: row.id
    }]);
  };

  const handleUpload = (_: any, fileList: any[]) => {
    const tmp = files.length > 0 && files[0].type === 'upload' ? [...files] : [];
    for (let file of fileList) {
      tmp.push({
        id: uniqueId(),
        type: 'upload',
        name: '本地上传',
        path: file
      });
    }
    setFiles(tmp);
    return Upload.LIST_IGNORE;
  };

  const handleRemove = (index: number) => {
    files.splice(index, 1);
    setFiles([...files]);
  };

  const handlePathChange = (index: number, value: string) => {
    files[index].path = value;
    setFiles([...files]);
  };

  const handleCloseOutput = () => {
    setToken(undefined);
    const counter = useTransferStore.getState().getCounter();
    if (!counter['0'] && !counter['2']) {
      setFiles([]);
    }
  };

  return (
    <AuthDiv auth="exec.transfer.do">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>批量执行</Breadcrumb.Item>
        <Breadcrumb.Item>文件分发</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className={styles.index} style={{ display: token ? 'none' : 'flex' }}>
        <div className={styles.left}>
          <Card
            type="inner"
            title={`数据源${files.length ? `（${files.length}）` : ''}`}
            extra={
              <Space size={24}>
                <Upload multiple beforeUpload={handleUpload}>
                  <Space className="btn">
                    <UploadOutlined />
                    上传本地文件
                  </Space>
                </Upload>
                <HostSelector onlyOne mode="rows" onChange={row => makeFile(row)}>
                  <Space className="btn">
                    <CloudServerOutlined />
                    添加主机文件
                  </Space>
                </HostSelector>
              </Space>
            }
          >
            <Table
              rowKey="id"
              className={styles.table}
              showHeader={false}
              pagination={false}
              size="small"
              dataSource={files}
            >
              <Table.Column title="文件来源" dataIndex="name" />
              <Table.Column
                title="文件名称/路径"
                render={(info: FileItem, _, index) =>
                  info.type === 'upload' ? (
                    (info.path as File).name
                  ) : (
                    <Input
                      onChange={e => handlePathChange(index, e.target.value)}
                      placeholder="请输入要同步的目录路径"
                    />
                  )
                }
              />
              <Table.Column
                title="操作"
                render={(_, __, index) => (
                  <Button danger type="link" onClick={() => handleRemove(index)}>
                    移除
                  </Button>
                )}
              />
            </Table>
          </Card>
          
          <Card
            type="inner"
            title="分发目标"
            style={{ margin: '24px 0' }}
            bodyStyle={{ paddingBottom: 0 }}
            extra={
              <Tooltip
                className={styles.tips}
                title="文件分发功能依赖rsync，大部分linux发行版默认都已安装，如未安装可通过「批量执行/执行任务」进行批量安装。"
              >
                <BulbOutlined /> 小提示
              </Tooltip>
            }
          >
            <Form>
              <Form.Item required label="目标路径">
                <Input
                  value={dir}
                  onChange={e => setDir(e.target.value)}
                  placeholder="请输入目标路径"
                />
              </Form.Item>
              <Form.Item required label="目标主机">
                <HostSelector
                  type="button"
                  mode="rows"
                  value={hosts.map(x => x.id)}
                  onChange={rows => setHosts(rows)}
                />
              </Form.Item>
            </Form>
          </Card>

          <Button
            loading={loading}
            icon={<ThunderboltOutlined />}
            type="primary"
            onClick={handleSubmit}
          >
            {percent ? `上传中 ${percent}%` : '开始执行'}
          </Button>
        </div>

        <div className={styles.right}>
          <div className={styles.title}>
            分发记录
            <Tooltip title="每天自动清理，保留最近30条记录。">
              <QuestionCircleOutlined style={{ color: '#999', marginLeft: 8 }} />
            </Tooltip>
          </div>
          
          <div className={styles.inner}>
            {histories.map((item, index) => (
              <div key={index} className={styles.item}>
                {item.host_id ? (
                  <CloudServerOutlined className={styles.host} />
                ) : (
                  <UploadOutlined className={styles.upload} />
                )}
                <div className={styles[item.interpreter]}>{item.interpreter}</div>
                <div className={styles.number}>{item.host_ids.length}</div>
                <div className={styles.command}>{item.dst_dir}</div>
                <div className={styles.desc}>
                  {dayjs(item.updated_at).format('MM.DD HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {token && <Output token={token} onBack={handleCloseOutput} />}
    </AuthDiv>
  );
};

export default Transfer;