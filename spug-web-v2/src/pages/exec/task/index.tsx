/**
 * 批量执行任务页面
 */
import React, { useState, useEffect } from 'react';
import { PlusOutlined, ThunderboltOutlined, BulbOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Button, Radio, Tooltip } from 'antd';
import { ACEditor, AuthDiv, Breadcrumb } from '@/components';
import HostSelector from '@/pages/host/Selector';
import TemplateSelector from './TemplateSelector';
import Parameter from './Parameter';
import Output from './Output';
import http from '@/libs/http';
import { cleanCommand } from '@/utils/common';
import dayjs from 'dayjs';
import useExecTaskStore from '@/stores/execTaskStore';
import { useGlobalStore } from '@/stores/globalStore';
import styles from './index.module.scss';

interface HistoryItem {
  template_id?: number;
  template_name?: string;
  interpreter: string;
  command: string;
  parameters?: any[];
  host_ids: number[];
  updated_at: string;
}

const ExecTask: React.FC = () => {
  const {
    host_ids,
    showTemplate,
    showConsole,
    setHostIds,
    switchTemplate,
    switchConsole
  } = useExecTaskStore();

  const { fetchUserSettings } = useGlobalStore();

  const [loading, setLoading] = useState(false);
  const [interpreter, setInterpreter] = useState('sh');
  const [command, setCommand] = useState('');
  const [templateId, setTemplateId] = useState<number>();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [parameters, setParameters] = useState<any[]>([]);
  const [parameterVisible, setParameterVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      http.get('/api/exec/do/')
        .then((res: any) => setHistories(res))
        .catch(() => setHistories([]));
    }
  }, [loading]);

  useEffect(() => {
    if (!command) {
      setParameters([]);
    }
  }, [command]);

  useEffect(() => {
    fetchUserSettings();
    
    return () => {
      setHostIds([]);
      if (showConsole) {
        switchConsole();
      }
    };
  }, [fetchUserSettings, setHostIds, showConsole, switchConsole]);

  const handleSubmit = (params?: any) => {
    if (!params && parameters.length > 0) {
      return setParameterVisible(true);
    }
    
    setLoading(true);
    const formData = {
      interpreter,
      template_id: templateId,
      params,
      host_ids,
      command: cleanCommand(command)
    };
    
    http.post('/api/exec/do/', formData)
      .then((token: any) => switchConsole(token))
      .finally(() => setLoading(false));
  };

  const handleTemplate = (tpl: any) => {
    if (tpl.host_ids.length > 0) {
      setHostIds(tpl.host_ids);
    }
    setTemplateId(tpl.id);
    setInterpreter(tpl.interpreter);
    setCommand(tpl.body);
    setParameters(tpl.parameters || []);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setTemplateId(item.template_id);
    setInterpreter(item.interpreter);
    setCommand(item.command);
    setParameters(item.parameters || []);
    setHostIds(item.host_ids);
  };

  return (
    <AuthDiv auth="exec.task.do">
      <Breadcrumb>
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>批量执行</Breadcrumb.Item>
        <Breadcrumb.Item>执行任务</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className={styles.index} style={{ display: showConsole ? 'none' : 'flex' }}>
        <Form layout="vertical" className={styles.left}>
          <Form.Item required label="目标主机">
            <HostSelector 
              type="button" 
              value={host_ids} 
              onChange={(ids: number[]) => setHostIds(ids)} 
            />
          </Form.Item>

          <Form.Item required label="执行命令" style={{ position: 'relative' }}>
            <Radio.Group
              buttonStyle="solid"
              style={{ marginBottom: 12 }}
              value={interpreter}
              onChange={e => setInterpreter(e.target.value)}
            >
              <Radio.Button value="sh" style={{ width: 80, textAlign: 'center' }}>
                Shell
              </Radio.Button>
              <Radio.Button value="python" style={{ width: 80, textAlign: 'center' }}>
                Python
              </Radio.Button>
            </Radio.Group>
            
            <a
              href="https://ops.spug.cc/docs/batch-exec"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tips}
            >
              <BulbOutlined /> 使用全局变量？
            </a>
            
            <Button
              style={{ float: 'right' }}
              icon={<PlusOutlined />}
              onClick={switchTemplate}
            >
              从执行模版中选择
            </Button>
            
            <ACEditor
              className={styles.editor}
              mode={interpreter}
              value={command}
              width="100%"
              height="200px"
              onChange={setCommand}
            />
          </Form.Item>
          
          <Button
            loading={loading}
            icon={<ThunderboltOutlined />}
            type="primary"
            onClick={() => handleSubmit()}
          >
            开始执行
          </Button>
        </Form>

        <div className={styles.right}>
          <div className={styles.title}>
            执行记录
            <Tooltip title="多次相同的执行记录将会合并展示，每天自动清理，保留最近30条记录。">
              <QuestionCircleOutlined style={{ color: '#999', marginLeft: 8 }} />
            </Tooltip>
          </div>
          
          <div className={styles.inner}>
            {histories.map((item, index) => (
              <div key={index} className={styles.item} onClick={() => handleHistoryClick(item)}>
                <div className={styles[item.interpreter]}>
                  {item.interpreter.substr(0, 2)}
                </div>
                <div className={styles.number}>{item.host_ids.length}</div>
                {item.template_name ? (
                  <div className={styles.tpl}>{item.template_name}</div>
                ) : (
                  <div className={styles.command}>{item.command}</div>
                )}
                <div className={styles.desc}>
                  {dayjs(item.updated_at).format('MM.DD HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTemplate && (
        <TemplateSelector 
          onCancel={switchTemplate} 
          onOk={handleTemplate} 
        />
      )}
      
      {showConsole && <Output onBack={switchConsole} />}
      
      {parameterVisible && (
        <Parameter
          parameters={parameters}
          onCancel={() => setParameterVisible(false)}
          onOk={(v: any) => handleSubmit(v)}
        />
      )}
    </AuthDiv>
  );
};

export default ExecTask;