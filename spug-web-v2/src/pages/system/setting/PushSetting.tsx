/**
 * 推送服务设置组件
 */
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Spin, Popconfirm, message } from 'antd';
import useSystemSettingStore from '@/stores/systemSettingStore';
import http from '@/libs/http';
import styles from './index.module.scss';

interface Balance {
  is_vip?: boolean;
  vip_desc?: string;
  sms_balance?: number;
  voice_balance?: number;
  mail_balance?: number;
  mail_free?: number;
  wx_mp_balance?: number;
  wx_mp_free?: number;
}

const PushSetting: React.FC = () => {
  const { settings, fetchSettings } = useSystemSettingStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [balance, setBalance] = useState<Balance>({});
  const [pushKey, setPushKey] = useState(settings.spug_push_key || '');

  useEffect(() => {
    if (settings.spug_push_key) {
      setPushKey(settings.spug_push_key);
      fetchBalance();
    }
  }, [settings.spug_push_key]);

  const fetchBalance = () => {
    setFetching(true);
    http.get('/api/setting/push/balance/')
      .then(res => {
        setBalance(res.data || res);
      })
      .finally(() => {
        setLoading(false);
        setFetching(false);
      });
  };

  const handleBind = () => {
    if (!pushKey) {
      return message.error('请输入要绑定的推送助手用户ID');
    }
    setLoading(true);
    http.post('/api/setting/push/bind/', { spug_push_key: pushKey })
      .then(res => {
        message.success('绑定成功');
        fetchSettings();
        setBalance(res.data || res);
      })
      .finally(() => setLoading(false));
  };

  const handleUnbind = () => {
    if (settings.MFA?.enable) {
      message.error('请先关闭登录MFA认证，否则将造成无法登录');
      return;
    }
    setLoading(true);
    http.post('/api/setting/push/bind/', { spug_push_key: '' })
      .then(() => {
        message.success('解绑成功');
        fetchSettings();
        setBalance({});
        setPushKey('');
      })
      .finally(() => setLoading(false));
  };

  const isVip = balance.is_vip;
  const spugPushKey = settings.spug_push_key;

  return (
    <Spin spinning={fetching}>
      <div className={styles.title}>推送服务设置</div>
      <div style={{ maxWidth: 340 }}>
        <Form.Item
          label="推送助手账户绑定"
          labelCol={{ span: 24 }}
          style={{ marginTop: 12 }}
          extra={
            <div>
              请登录推送助手，至个人中心 / 个人设置查看用户ID，注意保密该ID请勿泄漏给第三方。
              <a
                href="https://push.spug.cc/guide/spug"
                target="_blank"
                rel="noopener noreferrer"
              >
                配置手册
              </a>
            </div>
          }
        >
          {spugPushKey ? (
            <Input.Group compact>
              <div
                className={styles.keyText}
                style={{
                  width: 'calc(100% - 100px)',
                  lineHeight: '32px',
                  fontWeight: 'bold'
                }}
              >
                {spugPushKey}
              </div>
              <Popconfirm title="确定要解除绑定？" onConfirm={handleUnbind}>
                <Button
                  ghost
                  type="primary"
                  danger
                  style={{ width: 80, marginLeft: 20 }}
                  loading={loading}
                >
                  解绑
                </Button>
              </Popconfirm>
            </Input.Group>
          ) : (
            <Input.Group compact>
              <Input
                value={pushKey}
                onChange={(e) => setPushKey(e.target.value)}
                style={{ width: 'calc(100% - 100px)' }}
                placeholder="请输入要绑定的推送助手用户ID"
              />
              <Button
                type="primary"
                style={{ width: 80, marginLeft: 20 }}
                onClick={handleBind}
                loading={loading}
              >
                确定
              </Button>
            </Input.Group>
          )}
        </Form.Item>
      </div>

      {balance.vip_desc && (
        <Form.Item
          style={{ marginTop: 24 }}
          extra={
            <div>
              如需充值请至{' '}
              <a
                href="https://push.spug.cc/buy/sms"
                target="_blank"
                rel="noopener noreferrer"
              >
                推送助手
              </a>
              ，具体计费规则及说明请查看推送助手官网。
            </div>
          }
        >
          <div className={styles.statistic}>
            <div className={styles.body}>
              <div className={styles.item}>
                <div className={styles.title}>短信余额</div>
                <div className={styles.value}>{balance.sms_balance}</div>
              </div>
              <div className={styles.item}>
                <div className={styles.title}>语音余额</div>
                <div className={styles.value}>{balance.voice_balance}</div>
              </div>
              <div className={styles.item}>
                <div className={styles.title}>邮件余额</div>
                <div className={styles.value}>{balance.mail_balance}</div>
                {isVip ? (
                  <div className={`${styles.tips} ${styles.active}`}>
                    + 会员赠送{balance.mail_free}封 / 天
                  </div>
                ) : (
                  <a
                    href="https://push.spug.cc/buy/vip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tips}
                    title={`订阅会员每天赠送${balance.mail_free}封`}
                  >
                    订阅会员
                  </a>
                )}
              </div>
              <div className={styles.item}>
                <div className={styles.title}>微信公众号余额</div>
                <div className={styles.value}>{balance.wx_mp_balance}</div>
                {isVip ? (
                  <div className={`${styles.tips} ${styles.active}`}>
                    + 会员赠送{balance.wx_mp_free}条 / 天
                  </div>
                ) : (
                  <a
                    href="https://push.spug.cc/buy/vip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tips}
                    title={`订阅会员每天赠送${balance.wx_mp_free}条`}
                  >
                    订阅会员
                  </a>
                )}
              </div>
              <a
                href="https://push.spug.cc/buy/vip"
                className={styles.badge}
                target="_blank"
                rel="noopener noreferrer"
                title={balance.vip_desc}
              >
                {balance.vip_desc}
              </a>
            </div>
          </div>
        </Form.Item>
      )}
    </Spin>
  );
};

export default PushSetting;
