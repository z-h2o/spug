/**
 * 统计卡片组件
 */
import React, { useState, useEffect } from 'react';
import { Statistic, Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import http from '@/libs/http';

interface StatisticData {
  app: number;
  host: number;
  task: number;
  detection: number;
}

const StatisticCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticData>({
    app: 0,
    host: 0,
    task: 0,
    detection: 0
  });

  useEffect(() => {
    http.get('/api/home/statistic/')
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Row gutter={16} style={{ marginBottom: 20 }}>
      <Col span={6}>
        <Card loading={loading}>
          <Statistic
            title="应用"
            value={data.app}
            suffix={<span style={{ fontSize: 16 }}>个</span>}
            formatter={v => <Link to="/deploy/app">{v}</Link>}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card loading={loading}>
          <Statistic
            title="主机"
            value={data.host}
            suffix={<span style={{ fontSize: 16 }}>台</span>}
            formatter={v => <Link to="/host">{v}</Link>}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card loading={loading}>
          <Statistic
            title="任务"
            value={data.task}
            suffix={<span style={{ fontSize: 16 }}>个</span>}
            formatter={v => <Link to="/schedule">{v}</Link>}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card loading={loading}>
          <Statistic
            title="监控"
            value={data.detection}
            suffix={<span style={{ fontSize: 16 }}>项</span>}
            formatter={v => <Link to="/monitor">{v}</Link>}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticCard;
