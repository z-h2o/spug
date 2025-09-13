/**
 * 关于组件
 */
import React, { useState, useEffect } from 'react';
import { SmileTwoTone } from '@ant-design/icons';
import { Descriptions, Spin, Button, Alert, notification } from 'antd';
import http from '@/libs/http';
import styles from './index.module.scss';

const VERSION = '3.0.0'; // 新版本号

interface AboutInfo {
  system_version?: string;
  python_version?: string;
  django_version?: string;
  spug_version?: string;
}

const About: React.FC = () => {
  const [fetching, setFetching] = useState(true);
  const [info, setInfo] = useState<AboutInfo>({});

  useEffect(() => {
    // 获取系统信息
    http.get('/api/setting/about/')
      .then(res => setInfo(res.data || res))
      .finally(() => setFetching(false));

    // 检查版本更新
    http.get(`https://api.spug.cc/apis/release/latest/?version=${VERSION}`)
      .then((res: any) => {
        if (res.has_new) {
          notification.open({
            key: 'new_version',
            duration: 0,
            placement: 'topRight',
            message: `发现新版本 ${res.version}`,
            icon: <SmileTwoTone />,
            btn: (
              <a 
                target="_blank" 
                rel="noopener noreferrer" 
                href="https://ops.spug.cc/docs/update-version/"
              >
                如何升级？
              </a>
            ),
            description: (
              <pre style={{ lineHeight: '30px' }}>
                {res.content}<br />{res.extra}
              </pre>
            )
          });
        } else if (res.extra) {
          notification.open({
            key: 'new_version',
            duration: 0,
            placement: 'topRight',
            message: '已是最新版本',
            icon: <SmileTwoTone />,
            btn: (
              <Button 
                type="link" 
                onClick={() => notification.destroy('new_version')}
              >
                知道了
              </Button>
            ),
            description: (
              <pre style={{ lineHeight: '30px' }}>{res.extra}</pre>
            )
          });
        }
      })
      .catch(() => {
        // 忽略版本检查错误
      });
  }, []);

  return (
    <Spin spinning={fetching}>
      <div className={styles.title}>关于</div>
      <Descriptions column={1}>
        <Descriptions.Item label="操作系统">{info.system_version}</Descriptions.Item>
        <Descriptions.Item label="Python版本">{info.python_version}</Descriptions.Item>
        <Descriptions.Item label="Django版本">{info.django_version}</Descriptions.Item>
        <Descriptions.Item label="Spug API版本">{info.spug_version}</Descriptions.Item>
        <Descriptions.Item label="Spug Web版本">{VERSION}</Descriptions.Item>
        <Descriptions.Item label="官网文档">
          <a href="https://spug.cc" target="_blank" rel="noopener noreferrer">
            https://spug.cc
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="更新日志">
          <a 
            href="https://ops.spug.cc/docs/change-log/" 
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ops.spug.cc/docs/change-log/
          </a>
        </Descriptions.Item>
      </Descriptions>
      
      {info.spug_version !== VERSION && (
        <Alert 
          showIcon 
          style={{ width: 500 }} 
          type="warning" 
          message="Spug API版本与Web版本不匹配，请尝试刷新浏览器后再次查看。" 
        />
      )}
    </Spin>
  );
};

export default About;
