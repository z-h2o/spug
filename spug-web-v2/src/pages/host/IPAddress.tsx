/**
 * IP地址组件
 */
import React from 'react';

interface IPAddressProps {
  ip?: string[];
  isPublic?: boolean;
}

const IPAddress: React.FC<IPAddressProps> = ({ ip, isPublic }) => {
  const publicStyle = {
    background: '#ffe7ba',
    borderRadius: 4,
    color: '#333',
    fontSize: 10,
    marginRight: 4,
    padding: '0 8px'
  };

  const privateStyle = {
    background: '#bae7ff',
    borderRadius: 4,
    color: '#333',
    fontSize: 10,
    marginRight: 4,
    padding: '0 8px'
  };

  return (ip && ip.length > 0) ? (
    <div style={{ width: 150, display: 'flex', alignItems: 'center' }}>
      {isPublic ? <span style={publicStyle}>公</span> : <span style={privateStyle}>内</span>}
      <span>{ip[0]}</span>
    </div>
  ) : null;
};

export default IPAddress;
