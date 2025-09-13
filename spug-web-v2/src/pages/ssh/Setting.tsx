/**
 * SSH终端设置组件
 */
import React, { useState, useEffect } from 'react';
import { Drawer, Form, Button, Select, Space, message } from 'antd';
import themes from './themes';
import styles from './setting.module.scss';

interface SettingProps {
  visible: boolean;
  onClose: () => void;
}

const Setting: React.FC<SettingProps> = ({ visible, onClose }) => {
  const [theme, setTheme] = useState('dark');
  const [themeStyles, setThemeStyles] = useState(themes['dark']);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Courier');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 从localStorage或其他地方获取终端设置
    const savedSettings = localStorage.getItem('terminal_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTheme(settings.theme || 'dark');
        setFontSize(settings.fontSize || 14);
        setFontFamily(settings.fontFamily || 'Courier');
      } catch {
        // 使用默认设置
      }
    }
  }, []);

  useEffect(() => {
    setThemeStyles(themes[theme as keyof typeof themes]);
  }, [theme]);

  const handleSubmit = () => {
    setLoading(true);
    const data = { fontSize, fontFamily, theme };
    
    // 保存到localStorage
    localStorage.setItem('terminal_settings', JSON.stringify(data));
    
    setTimeout(() => {
      message.success('已保存');
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <Drawer
      title="终端设置"
      placement="right"
      width={300}
      open={visible}
      onClose={onClose}
    >
      <Form layout="vertical">
        <Form.Item label="字体大小">
          <Select value={fontSize} placeholder="请选择字体大小" onChange={setFontSize}>
            <Select.Option value={12}>12</Select.Option>
            <Select.Option value={14}>14</Select.Option>
            <Select.Option value={16}>16</Select.Option>
            <Select.Option value={18}>18</Select.Option>
            <Select.Option value={20}>20</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="字体名称">
          <Select value={fontFamily} placeholder="请选择字体" onChange={setFontFamily}>
            <Select.Option value="Courier">Courier</Select.Option>
            <Select.Option value="Consolas">Consolas</Select.Option>
            <Select.Option value="DejaVu Sans Mono">DejaVu Sans Mono</Select.Option>
            <Select.Option value="Droid Sans Mono">Droid Sans Mono</Select.Option>
            <Select.Option value="Monaco">Monaco</Select.Option>
            <Select.Option value="Menlo">Menlo</Select.Option>
            <Select.Option value="monospace">monospace</Select.Option>
            <Select.Option value="Source Code Pro">Source Code Pro</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="主题配色">
          <Space wrap className={styles.theme} size={12}>
            {Object.entries(themes).map(([key, item]) => (
              <pre 
                key={key} 
                style={{ background: item.background, color: item.foreground }}
                onClick={() => setTheme(key)}
              >
                spug
              </pre>
            ))}
          </Space>
        </Form.Item>
        <Form.Item label="预览">
          <div 
            className={styles.preview}
            style={{ 
              fontSize, 
              fontFamily, 
              background: themeStyles.background, 
              color: themeStyles.foreground 
            }}
          >
            <div>Welcome to Spug !</div>
            <div>* Website: https://spug.cc</div>
            <div>[root@iZ8vb48roZ ~]# ls</div>
            <div>
              <span style={{ color: themeStyles.brightBlue }}>apps </span>
              <span style={{ color: themeStyles.brightRed }}>bak.tar.gz </span>
              <span style={{ color: themeStyles.brightGreen }}>manage.py </span>
              <span>README.md</span>
            </div>
            <div>[root@iZ8vb48roZ ~]# pwd</div>
            <div>/data/api</div>
            <div>[root@iZ8vb48roZ ~]#</div>
          </div>
        </Form.Item>
        <Button 
          block 
          type="primary" 
          className={styles.btn} 
          loading={loading} 
          onClick={handleSubmit}
        >
          保存
        </Button>
      </Form>
    </Drawer>
  );
};

export default Setting;
