/**
 * 克隆确认组件
 */
import React, { useState, useEffect } from 'react';
import { Select, Form } from 'antd';
import useDeployAppStore, { type DeployRecord } from '@/stores/deployAppStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import { includes } from '@/utils/common';

interface CloneConfirmProps {
  onChange: (deploy: DeployRecord | null) => void;
}

const CloneConfirm: React.FC<CloneConfirmProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const { records: appRecords, loadDeploys } = useDeployAppStore();
  const { idMap: envIdMap } = useConfigEnvStore();
  
  const [apps] = useState(Object.values(appRecords));
  const [appId, setAppId] = useState<number>();
  const [deploys, setDeploys] = useState<DeployRecord[]>([]);

  useEffect(() => {
    if (appId) {
      onChange(null);
      form.setFieldsValue({ env_id: undefined });
      loadDeploys(appId).then(() => {
        // 获取加载后的部署配置
        const appRecord = appRecords[`a${appId}`];
        if (appRecord && appRecord.deploys) {
          setDeploys(appRecord.deploys);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const handleChange = (deployId: number) => {
    const deploy = deploys.find(d => d.id === deployId);
    onChange(deploy || null);
  };

  return (
    <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
      <Form.Item required label="克隆的应用">
        <Select 
          showSearch 
          filterOption={(input, option) => {
            const children = option?.children;
            if (typeof children === 'string') {
              return includes(children, input);
            }
            return false;
          }} 
          placeholder="请选择要克隆的应用" 
          onChange={setAppId}
        >
          {apps.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item required name="env_id" label="克隆的环境">
        <Select
          showSearch
          filterOption={(input, option) => {
            const children = option?.children;
            if (typeof children === 'string') {
              return includes(children, input);
            }
            return false;
          }}
          placeholder="请选择要克隆的环境"
          disabled={deploys.length === 0}
          onChange={handleChange}
        >
          {deploys.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {envIdMap[item.env_id || 0]?.name || `环境${item.env_id}`}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default CloneConfirm;
