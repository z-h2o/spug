/**
 * 发布申请Top20组件
 */
import React, { useState, useEffect } from 'react';
import { Card, DatePicker } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs, { Dayjs } from 'dayjs';
import http from '@/libs/http';
import styles from './index.module.scss';

interface RequestData {
  name: string;
  count: number;
}

type RangeValue = [Dayjs, Dayjs];

const RequestTop: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState<RangeValue>([dayjs(), dayjs()]);
  const [range, setRange] = useState('day');
  const [data, setData] = useState<RequestData[]>([]);

  useEffect(() => {
    setLoading(true);
    const strDuration = duration.map(x => x.format('YYYY-MM-DD'));
    http.post('/api/home/request/', { duration: strDuration })
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  }, [duration]);

  function handleClick(val: string | RangeValue) {
    let newDuration: RangeValue;
    if (typeof val === 'string') {
      switch (val) {
        case 'day':
          setRange('day');
          newDuration = [dayjs(), dayjs()];
          break;
        case 'week':
          setRange('week');
          newDuration = [dayjs().startOf('week'), dayjs().endOf('week')];
          break;
        case 'month':
          setRange('month');
          newDuration = [dayjs().startOf('month'), dayjs().endOf('month')];
          break;
        default:
          return;
      }
    } else {
      setRange('custom');
      newDuration = val;
    }
    setDuration(newDuration);
  }

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 80
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        rotate: 45,
        interval: 0
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '发布申请数量',
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  };

  return (
    <Card
      loading={loading}
      title="发布申请Top20"
      style={{ marginTop: 20 }}
      styles={{ body: { height: 353 }}}
      extra={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            className={range === 'day' ? styles.spanButtonActive : styles.spanButton}
            onClick={() => handleClick('day')}
          >
            今日
          </span>
          <span
            className={range === 'week' ? styles.spanButtonActive : styles.spanButton}
            onClick={() => handleClick('week')}
          >
            本周
          </span>
          <span
            className={range === 'month' ? styles.spanButtonActive : styles.spanButton}
            onClick={() => handleClick('month')}
          >
            本月
          </span>
          <DatePicker.RangePicker
            allowClear={false}
            style={{ width: 250 }}
            value={duration}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                handleClick([dates[0], dates[1]]);
              }
            }}
          />
        </div>
      }
    >
      <ReactECharts
        option={chartOption}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
      />
    </Card>
  );
};

export default RequestTop;
