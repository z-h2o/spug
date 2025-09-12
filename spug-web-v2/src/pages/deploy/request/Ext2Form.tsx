/**
 * 自定义发布申请表单
 */
import React, { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Upload, DatePicker, message, Button } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import HostSelector from './HostSelector';
import useRequestStore from '@/stores/requestStore';
import { X_TOKEN } from '@/utils/auth';
import http from '@/libs/http';
import { clone, pick } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Ext2Form: React.FC = () => {
  const { 
    record, 
    setExt2Visible, 
    fetchRecords 
  } = useRequestStore();

  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [hostIds, setHostIds] = useState<number[]>([]);
  const [plan, setPlan] = useState<Dayjs | null>(null);

  useEffect(() => {
    const { app_host_ids, host_ids, extra, plan: recordPlan } = record;
    setHostIds(clone(host_ids || app_host_ids || []));
    
    if (record.extra) {
      setFileList([{ ...extra, uid: '0' } as UploadFile]);
    }
    
    if (recordPlan) {
      setPlan(typeof recordPlan === 'string' ? dayjs(recordPlan) : recordPlan);
    }
  }, [record]);

  const handleSubmit = async () => {
    if (hostIds.length === 0) {
      return message.error('请至少选择一个要发布的目标主机');
    }

    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formData = {
        ...values,
        id: record.id,
        host_ids: hostIds,
        type: record.type,
        deploy_id: record.deploy_id
      };
      
      if (plan) {
        formData.plan = plan.format('YYYY-MM-DD HH:mm:00');
      }
      
      if (fileList.length > 0) {
        formData.extra = pick(fileList[0], ['path', 'name']);
      }

      await http.post('/api/deploy/request/ext2/', formData);
      message.success('操作成功');
      setExt2Visible(false);
      fetchRecords();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = (info: any) => {
    if (info.fileList.length === 0) {
      setFileList([]);
    }
  };

  const handleUpload = (file: UploadFile) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('deploy_id', String(record.deploy_id));
    
    http.post('/api/deploy/request/upload/', formData, { timeout: 300000 })
      .then((res: any) => {
        (file as any).path = res;
        setFileList([file]);
      })
      .finally(() => setUploading(false));
    
    return false;
  };

  const { app_host_ids = [], deploy_id, type, require_upload } = record;

  return (
    <Modal
      open
      width={700}
      maskClosable={false}
      title={`${record.id ? '编辑' : '新建'}发布申请`}
      onCancel={() => setExt2Visible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form 
        form={form} 
        initialValues={record} 
        labelCol={{ span: 6 }} 
        wrapperCol={{ span: 16 }}
      >
        <Form.Item 
          required 
          name="name" 
          label="申请标题"
          rules={[{ required: true, message: '请输入申请标题' }]}
        >
          <Input placeholder="请输入申请标题" />
        </Form.Item>
        
        <Form.Item
          name="version"
          label="SPUG_RELEASE"
          tooltip="可以在自定义脚本中引用该变量，用于设置本次发布相关的动态变量，在脚本中通过 $SPUG_RELEASE 来使用该值。"
        >
          <Input placeholder="请输入环境变量 SPUG_RELEASE 的值" />
        </Form.Item>
        
        {require_upload && (
          <Form.Item 
            required 
            label="上传数据" 
            tooltip="通过数据传输动作来使用上传的文件。"
            className={fileList.length ? 'upload-hide' : ''}
          >
            <Upload.Dragger 
              name="file" 
              fileList={fileList} 
              headers={{ 'X-Token': X_TOKEN || '' }} 
              beforeUpload={handleUpload}
              data={{ deploy_id }} 
              onChange={handleUploadChange}
              maxCount={1}
            >
              <Button 
                type="link" 
                loading={uploading} 
                icon={<UploadOutlined />}
              >
                点击或拖动文件至此区域上传
              </Button>
            </Upload.Dragger>
          </Form.Item>
        )}
        
        <Form.Item 
          required 
          label="目标主机" 
          tooltip="可以通过创建多个发布申请单，选择主机分批发布。"
        >
          {hostIds.length > 0 && (
            <span style={{ marginRight: 16 }}>
              已选择 {hostIds.length} 台（可选{app_host_ids.length}）
            </span>
          )}
          <Button 
            type="link" 
            style={{ padding: 0 }} 
            onClick={() => setVisible(true)}
          >
            选择主机
          </Button>
        </Form.Item>
        
        <Form.Item name="desc" label="备注信息">
          <Input placeholder="请输入备注信息" />
        </Form.Item>
        
        {type !== '2' && (
          <Form.Item 
            label="定时发布" 
            tooltip="在到达指定时间后自动发布，会有最多1分钟的延迟。"
          >
            <DatePicker
              showTime
              value={plan}
              style={{ width: 180 }}
              format="YYYY-MM-DD HH:mm"
              placeholder="请设置发布时间"
              onChange={setPlan}
            />
            {plan && (
              <span style={{ marginLeft: 24, fontSize: 12, color: '#888' }}>
                大约 {plan.fromNow()}
              </span>
            )}
          </Form.Item>
        )}
      </Form>
      
      {visible && (
        <HostSelector
          host_ids={hostIds}
          app_host_ids={app_host_ids}
          onCancel={() => setVisible(false)}
          onOk={(ids: number[]) => {
            setHostIds(ids);
            setVisible(false);
          }}
        />
      )}
    </Modal>
  );
};

export default Ext2Form;
