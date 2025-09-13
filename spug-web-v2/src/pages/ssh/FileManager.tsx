/**
 * SSH文件管理器组件
 */
import React from 'react';

interface FileManagerProps {
  id?: number;
}

const FileManager: React.FC<FileManagerProps> = ({ id }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>文件管理器</h3>
      <p>主机ID: {id}</p>
      <p>文件管理器功能正在开发中，敬请期待...</p>
    </div>
  );
};

export default FileManager;
