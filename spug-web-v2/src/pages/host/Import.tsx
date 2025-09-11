/**
 * Excel导入组件
 */
import React, { useState } from 'react';
import { Modal, Form, Upload, Button, Tooltip, Divider, Cascader, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Sync from './Sync';
import http from '@/libs/http';
import useHostStore from '@/stores/hostStore';

const Import: React.FC = () => {
  const {
    importVisible,
    getTreeData,
    setImportVisible,
    fetchRecords
  } = useHostStore();

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<number[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [token, setToken] = useState<string>();
  const [hosts, setHosts] = useState<Record<string, any>>();

  const treeData = getTreeData();

  function handleSubmit() {
    if (groupId.length === 0) return message.error('请选择要导入的分组');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('group_id', String(groupId[groupId.length - 1]));
    
    http.post('/api/host/import/', formData, { timeout: 120000 })
      .then((res: any) => {
        setToken(res.token);
        setHosts(res.hosts);
        setSummary(res.summary);
      })
      .finally(() => setLoading(false));
  }

  function handleUpload(v: any) {
    if (v.fileList.length === 0) {
      setFileList([]);
    } else {
      setFileList([v.file]);
    }
  }

  function handleClose() {
    setImportVisible(false);
    fetchRecords();
  }

  return (
    <Modal
      open={importVisible}
      maskClosable={false}
      title="批量导入"
      okText="导入"
      onCancel={handleClose}
      footer={null}
    >
      <Form hidden={!!token} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
        <Form.Item label="模板下载" extra="请下载使用该模板填充数据后导入">
          <a href="/resource/主机导入模板.xlsx">主机导入模板.xlsx</a>
        </Form.Item>
        
        <Form.Item required label="选择分组">
          <Cascader
            value={groupId}
            onChange={setGroupId}
            options={treeData}
            fieldNames={{ label: 'title', value: 'key', children: 'children' }}
            placeholder="请选择"
          />
        </Form.Item>
        
        <Form.Item 
          required 
          label="导入数据" 
          extra="Spug使用密钥认证连接服务器，导入或输入的密码仅作首次验证使用，不会存储。"
        >
          <Upload
            name="file"
            accept=".xls, .xlsx"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            {fileList.length === 0 && (
              <Button><UploadOutlined /> 点击上传</Button>
            )}
          </Upload>
        </Form.Item>
        
        <Form.Item wrapperCol={{ span: 14, offset: 6 }}>
          <Button 
            loading={loading} 
            disabled={!fileList.length} 
            type="primary" 
            onClick={handleSubmit}
          >
            导入主机
          </Button>
        </Form.Item>
      </Form>

      {token && hosts ? (
        <div>
          <Divider>导入结果</Divider>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>成功：{summary.success}</div>
            <div>失败：{summary.fail > 0 ? (
              <Tooltip 
                style={{ color: '#1890ff' }} 
                title={(
                  <div>
                    {summary.skip?.map((x: number) => (
                      <div key={x}>第 {x} 行，重复的服务器信息</div>
                    ))}
                    {summary.repeat?.map((x: number) => (
                      <div key={x}>第 {x} 行，重复的主机名称</div>
                    ))}
                    {summary.invalid?.map((x: number) => (
                      <div key={x}>第 {x} 行，无效的数据</div>
                    ))}
                  </div>
                )}
              >
                <span style={{ color: '#1890ff' }}>{summary.fail}</span>
              </Tooltip>
            ) : 0}</div>
          </div>
          
          {Object.keys(hosts).length > 0 && (
            <>
              <Divider>验证及同步</Divider>
              <Sync 
                token={token} 
                hosts={hosts} 
                style={{ maxHeight: 'calc(100vh - 400px)' }}
              />
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default Import;
