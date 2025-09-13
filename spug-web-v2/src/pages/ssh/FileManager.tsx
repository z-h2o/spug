/**
 * SSH文件管理器组件
 */
import React, { useState, useEffect } from 'react';
import { 
  Breadcrumb, 
  Table, 
  Switch, 
  Progress, 
  Modal, 
  Input, 
  message, 
  Button,
  Space,
  Upload
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FolderOutlined,
  HomeOutlined,
  UploadOutlined,
  EditOutlined
} from '@ant-design/icons';
import { AuthButton, Action } from '@/components';
import http from '@/libs/http';
import { getToken } from '@/utils/auth';
import { uniqueId } from '@/utils/functools';
import styles from './index.module.scss';
import moment from 'moment';

interface FileObject {
  name: string;
  size: number;
  is_dir: boolean;
  date: string;
  mode: string;
}

interface FileManagerProps {
  id?: number;
}

const FileManager: React.FC<FileManagerProps> = ({ id }) => {
  const [fetching, setFetching] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputPath, setInputPath] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'active' | 'success' | 'exception'>('active');
  const [pwd, setPwd] = useState<string[]>([]);
  const [objects, setObjects] = useState<FileObject[]>([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (id) {
      fetchFiles();
    }
  }, [id]);

  const fetchFiles = async (path?: string[]) => {
    if (!id) return;
    
    setFetching(true);
    try {
      const currentPath = path || pwd;
      const res = await http.get('/api/file/', {
        params: { id, path: currentPath.join('/') }
      });
      setObjects(res.data || res);
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      setFetching(false);
    }
  };

  const handlePathClick = (index: number) => {
    const newPwd = pwd.slice(0, index + 1);
    setPwd(newPwd);
    fetchFiles(newPwd);
  };

  const handleObjectClick = (obj: FileObject) => {
    if (obj.is_dir) {
      const newPwd = [...pwd, obj.name];
      setPwd(newPwd);
      fetchFiles(newPwd);
    }
  };

  const handleDownload = (obj: FileObject) => {
    const token = getToken();
    const path = [...pwd, obj.name].join('/');
    const url = `/api/file/object/?id=${id}&path=${encodeURIComponent(path)}&x-token=${token}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = obj.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (obj: FileObject) => {
    Modal.confirm({
      title: '删除确认',
      content: `确定要删除 ${obj.name} 吗？`,
      onOk: async () => {
        try {
          const path = [...pwd, obj.name].join('/');
          await http.delete('/api/file/object/', {
            params: { id, path }
          });
          message.success('删除成功');
          fetchFiles();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, record: FileObject) => (
        <Space 
          style={{ cursor: record.is_dir ? 'pointer' : 'default' }}
          onClick={() => handleObjectClick(record)}
        >
          {record.is_dir ? <FolderOutlined /> : <FileOutlined />}
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 120,
      render: (size: number, record: FileObject) => 
        record.is_dir ? '-' : formatFileSize(size)
    },
    {
      title: '修改时间',
      dataIndex: 'date',
      width: 180,
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '权限',
      dataIndex: 'mode',
      width: 100
    },
    {
      title: '操作',
      width: 120,
      render: (record: FileObject) => (
        <Action>
          {!record.is_dir && (
            <Action.Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              下载
            </Action.Button>
          )}
          <Action.Button 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Action.Button>
        </Action>
      )
    }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!id) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>请选择主机</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.drawerHeader}>
        <div className={styles.bread}>
          {inputPath ? (
            <Input 
              className={styles.input}
              value={inputPath}
              onChange={e => setInputPath(e.target.value)}
              onPressEnter={() => {
                const newPwd = inputPath.split('/').filter(x => x);
                setPwd(newPwd);
                fetchFiles(newPwd);
                setInputPath(null);
              }}
              onBlur={() => setInputPath(null)}
            />
          ) : (
            <Breadcrumb>
              <Breadcrumb.Item>
                <HomeOutlined 
                  onClick={() => {
                    setPwd([]);
                    fetchFiles([]);
                  }}
                />
              </Breadcrumb.Item>
              {pwd.map((item, index) => (
                <Breadcrumb.Item 
                  key={index}
                  onClick={() => handlePathClick(index)}
                >
                  <span style={{ cursor: 'pointer' }}>{item}</span>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <EditOutlined 
            className={styles.edit}
            onClick={() => setInputPath(pwd.join('/'))}
          />
        </div>
        <div className={styles.action}>
          <Switch 
            size="small"
            checked={showDot}
            onChange={setShowDot}
            checkedChildren="显示隐藏文件"
            unCheckedChildren="隐藏文件"
          />
          <Upload
            name="file"
            action={`/api/file/object/`}
            data={{ id, path: pwd.join('/') }}
            headers={{ 'X-Token': getToken() || '' }}
            showUploadList={false}
            onChange={(info) => {
              if (info.file.status === 'uploading') {
                setUploading(true);
                setPercent(info.file.percent || 0);
              } else if (info.file.status === 'done') {
                setUploading(false);
                setPercent(0);
                message.success('上传成功');
                fetchFiles();
              } else if (info.file.status === 'error') {
                setUploading(false);
                setPercent(0);
                message.error('上传失败');
              }
            }}
          >
            <Button 
              size="small" 
              icon={<UploadOutlined />}
              loading={uploading}
            >
              上传文件
            </Button>
          </Upload>
          {uploading && (
            <Progress 
              className={styles.progress}
              size="small"
              percent={percent}
              status={uploadStatus}
            />
          )}
        </div>
      </div>
      
      <Table
        size="small"
        rowKey="name"
        loading={fetching}
        dataSource={objects.filter(obj => showDot || !obj.name.startsWith('.'))}
        columns={columns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 200px)' }}
      />
    </div>
  );
};

export default FileManager;
