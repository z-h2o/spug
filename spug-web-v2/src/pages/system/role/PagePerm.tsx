/**
 * 功能权限管理组件
 */
import React, { useState, useCallback } from 'react';
import { Modal, Checkbox, Row, Col, message, Alert } from 'antd';
import http from '@/libs/http';
import useSystemRoleStore from '@/stores/systemRoleStore';
import codes from './codes';
import styles from './index.module.scss';
import { cloneDeep } from 'lodash-es';

const PagePerm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState({});
  
  const { 
    record, 
    permissions, 
    allPerms,
    setPagePermVisible, 
    fetchRecords 
  } = useSystemRoleStore();

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await http.patch('/api/account/role/', { 
        id: record.id, 
        page_perms: permissions 
      });
      message.success('操作成功');
      setPagePermVisible(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to update permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllCheck = (checked: boolean, mod: string, page: string) => {
    const key = `${mod}.${page}`;
    if (checked) {
      if (!permissions[mod]) permissions[mod] = {};
      permissions[mod][page] = cloneDeep(allPerms[key] || []);
    } else {
      if (!permissions[mod]) permissions[mod] = {};
      permissions[mod][page] = [];
    }
    triggerUpdate();
  };

  const handlePermCheck = (mod: string, page: string, perm: string) => {
    if (!permissions[mod]) permissions[mod] = {};
    if (!permissions[mod][page]) permissions[mod][page] = [];
    const perms = permissions[mod][page];
    const index = perms.indexOf(perm);
    if (index > -1) {
      perms.splice(index, 1);
    } else {
      perms.push(perm);
    }
    triggerUpdate();
  };

  const PermBox: React.FC<{ mod: string; page: string; perm: string; children: React.ReactNode }> = ({ 
    mod, 
    page, 
    perm, 
    children 
  }) => (
    <Checkbox
      value={perm}
      onChange={() => handlePermCheck(mod, page, perm)}
      checked={permissions[mod]?.[page]?.includes(perm) || false}
    >
      {children}
    </Checkbox>
  );

  return (
    <Modal
      open
      width={1000}
      maskClosable={false}
      title="功能权限设置"
      className={styles.container}
      onCancel={() => setPagePermVisible(false)}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Alert
        closable
        showIcon
        type="info"
        style={{ marginBottom: 12 }}
        message="功能权限仅影响页面功能，管理应用的发布权限请在发布权限中设置。权限更改成功后会强制属于该角色的账户重新登录。"
      />
      
      <table border={1} className={styles.table}>
        <thead>
          <tr>
            <th>模块</th>
            <th>页面</th>
            <th>功能</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(mod => (
            mod.pages.map((page, index) => (
              <tr key={page.key}>
                {index === 0 && <td rowSpan={mod.pages.length}>{mod.label}</td>}
                <td>
                  <Checkbox 
                    onChange={(e) => handleAllCheck(e.target.checked, mod.key, page.key)}
                  >
                    {page.label}
                  </Checkbox>
                </td>
                <td>
                  <Row>
                    {page.perms.map(perm => (
                      <Col key={perm.key} span={8}>
                        <PermBox mod={mod.key} page={page.key} perm={perm.key}>
                          {perm.label}
                        </PermBox>
                      </Col>
                    ))}
                  </Row>
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </Modal>
  );
};

export default PagePerm;
