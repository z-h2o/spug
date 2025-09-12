/**
 * 构建仓库主页面
 */
import React, { useEffect } from 'react';
import { Select } from 'antd';
import { SearchForm, Breadcrumb } from '@/components';
import { includes } from '@/utils/common';
import useRepositoryStore from '@/stores/repositoryStore';
import useConfigEnvStore from '@/stores/configEnvStore';
import useConfigAppStore from '@/stores/configAppStore';
import { hasPermission } from '@/utils/auth';
import RepositoryTable from './Table';
import RepositoryForm from './Form';
import Console from './Console';
import Detail from './Detail';
import AppSelector from '@/pages/deploy/app/components/AppSelector';

const RepositoryIndex: React.FC = () => {
  const {
    fetchRecords,
    f_app_id,
    f_env_id,
    setAppId,
    setEnvId,
    addVisible,
    setAddVisible,
    formVisible,
    logVisible,
    detailVisible,
    confirmAdd
  } = useRepositoryStore();

  const { records: envRecords, fetchRecords: fetchEnvRecords } = useConfigEnvStore();
  const { records: appRecords, fetchRecords: fetchAppRecords } = useConfigAppStore();

  useEffect(() => {
    fetchRecords();
    if (!appRecords.length) {
      fetchAppRecords();
    }
    if (!envRecords.length) {
      fetchEnvRecords();
    }
  }, [fetchRecords, fetchAppRecords, fetchEnvRecords, appRecords.length, envRecords.length]);

  if (!hasPermission('deploy.repository.view')) {
    return null;
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>应用发布</Breadcrumb.Item>
        <Breadcrumb.Item>构建仓库</Breadcrumb.Item>
      </Breadcrumb>
      
      <SearchForm>
        <SearchForm.Item span={6} title="应用">
          <Select
            allowClear
            showSearch
            value={f_app_id}
            onChange={setAppId}
            filterOption={(input, option) => 
              includes(String(option?.children || ''), input)
            }
            placeholder="请选择"
          >
            {appRecords.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </SearchForm.Item>
        
        <SearchForm.Item span={6} title="环境">
          <Select
            allowClear
            showSearch
            value={f_env_id}
            onChange={setEnvId}
            filterOption={(input, option) => 
              includes(String(option?.children || ''), input)
            }
            placeholder="请选择"
          >
            {envRecords.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </SearchForm.Item>
      </SearchForm>
      
      <RepositoryTable />
      
      {addVisible && (
        <AppSelector
          visible
          filter={item => item.extend === '1'}
          onCancel={() => setAddVisible(false)}
          onSelect={confirmAdd}
        />
      )}

      <Detail visible={detailVisible} />
      
      {formVisible && <RepositoryForm />}
      
      {logVisible && <Console />}
    </div>
  );
};

export default RepositoryIndex;