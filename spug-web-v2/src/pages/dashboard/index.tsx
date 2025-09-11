/**
 * Dashboard页面
 */
import React from 'react';
import { AuthDiv } from '@/components';
import StatisticCard from './StatisticCard';
import AlarmTrend from './AlarmTrend';
import RequestTop from './RequestTop';

const Dashboard: React.FC = () => {
  return (
    <AuthDiv auth="dashboard.dashboard.view">
      <StatisticCard />
      <AlarmTrend />
      <RequestTop />
    </AuthDiv>
  );
};

export default Dashboard;
