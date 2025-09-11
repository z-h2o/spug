/**
 * 主机表单组件
 */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, TreeSelect, Button, Upload, Alert, message } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import http from '@/libs/http';
import { X_TOKEN } from '@/utils/auth';
import useHostStore from '@/stores/hostStore';
import styles from './index.module.scss';

const HostForm: React.FC = () => {
  const {
    record,
    formVisible,
    getTreeData,
    setFormVisible,
    fetchRecords,
    fetchExtend
  } = useHostStore();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const treeData = getTreeData();

  useEffect(() => {
    if (record.pkey) {
      setFileList([{ uid: '0', name: '独立密钥', data: record.pkey }]);
    }
  }, [record.pkey]);

  function handleSubmit() {
    setLoading(true);
    const formData = form.getFieldsValue();
    formData.id = record.id;
    const file = fileList[0];
    if (file && file.data) formData.pkey = file.data;

    http.post('/api/host/', formData)
      .then((res: any) => {
        if (res === 'auth fail') {
          setLoading(false);
          if (formData.pkey) {
            message.error('独立密钥认证失败');
          } else {
            const onChange = (v: string) => formData.password = v;
            Modal.confirm({
              icon: <ExclamationCircleOutlined />,
              title: '首次验证请输入密码',
              content: <ConfirmForm username={formData.username} onChange={onChange} />,
              onOk: () => handleConfirm(formData),
            });
          }
        } else {
          message.success('验证成功');
          setFormVisible(false);
          fetchRecords();
          fetchExtend(res.id);
        }
      }, () => setLoading(false));
  }

  function handleConfirm(formData: any) {
    if (formData.password) {
      return http.post('/api/host/', formData)
        .then((res: any) => {
          message.success('验证成功');
          setFormVisible(false);
          fetchRecords();
          fetchExtend(res.id);
        });
    }
    message.error('请输入授权密码');
  }

  const ConfirmForm: React.FC<{ username: string; onChange: (v: string) => void }> = ({ username, onChange }) => (
    <Form layout="vertical" style={{ marginTop: 24 }}>
      <Form.Item 
        required 
        label="授权密码" 
        extra={`用户 ${username} 的密码， 该密码仅做首次验证使用，不会存储该密码。`}
      >
        <Input.Password onChange={e => onChange(e.target.value)} />
      </Form.Item>
    </Form>
  );

  function handleUploadChange(v: any) {
    if (v.fileList.length === 0) {
      setFileList([]);
    }
  }

  function handleUpload(file: any) {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    http.post('/api/host/parse/', formData)
      .then((res: any) => {
        file.data = res;
        setFileList([file]);
      })
      .finally(() => setUploading(false));
    
    return false;
  }

  return (
    <Modal
      open={formVisible}
      width={700}
      maskClosable={false}
      title={record.id ? '编辑主机' : '新建主机'}
      okText="验证"
      onCancel={() => setFormVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} initialValues={record}>
        <Form.Item required name="group_ids" label="主机分组">
          <TreeSelect
            multiple
            treeNodeLabelProp="title"
            treeData={treeData}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            placeholder="请选择分组"
            fieldNames={{ label: 'title', value: 'key', children: 'children' }}
          />
        </Form.Item>
        <Form.Item required name="name" label="主机名称">
          <Input placeholder="请输入主机名称" />
        </Form.Item>
        <Form.Item required label="连接地址" style={{ marginBottom: 0 }}>
          <Form.Item name="username" className={styles.formAddress1} style={{ width: 'calc(30%)' }}>
            <Input addonBefore="ssh" placeholder="用户名" />
          </Form.Item>
          <Form.Item name="hostname" className={styles.formAddress2} style={{ width: 'calc(40%)' }}>
            <Input addonBefore="@" placeholder="主机名/IP" />
          </Form.Item>
          <Form.Item name="port" className={styles.formAddress3} style={{ width: 'calc(30%)' }}>
            <Input addonBefore="-p" placeholder="端口" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="独立密钥" extra="默认使用全局密钥，如果上传了独立密钥（私钥）则优先使用该密钥。">
          <Upload 
            name="file" 
            fileList={fileList} 
            headers={{ 'X-Token': X_TOKEN || '' }} 
            beforeUpload={handleUpload}
            onChange={handleUploadChange}
          >
            {fileList.length === 0 ? (
              <Button loading={uploading} icon={<UploadOutlined />}>点击上传</Button>
            ) : null}
          </Upload>
        </Form.Item>
        <Form.Item name="desc" label="备注信息">
          <Input.TextArea placeholder="请输入主机备注信息" />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 17, offset: 5 }}>
          <Alert 
            showIcon 
            type="info" 
            message="首次验证时需要输入登录用户名对应的密码，该密码会用于配置SSH密钥认证，不会存储该密码。" 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HostForm;
