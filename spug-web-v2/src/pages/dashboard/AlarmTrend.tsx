/**
 * 报警趋势组件
 */
import React, { useState, useEffect } from 'react';
import { Card, Cascader } from 'antd';
import ReactECharts from 'echarts-for-react';
import http from '@/libs/http';

interface AlarmData {
  date: string;
  value: number;
}

interface MonitorOption {
  value: string;
  label: string;
  children?: MonitorOption[];
}

interface FilterParams {
  name?: string;
  type?: string;
}

const AlarmTrend: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<MonitorOption[]>([]);
  const [params, setParams] = useState<FilterParams>({});
  const [data, setData] = useState<AlarmData[]>([]);

  useEffect(() => {
    setLoading(true);
    http.get('/api/home/alarm/', { params })
      .then((res: any) => setData(res))
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => {
    const optionData: Record<string, MonitorOption> = {};
    http.get('/api/monitor/')
      .then((res: any) => {
        for (const item of res.detections) {
          if (!optionData[item.type]) {
            optionData[item.type] = {
              value: item.type,
              label: item.type_alias,
              children: []
            };
          }
          optionData[item.type].children!.push({
            value: item.name,
            label: item.name
          });
        }
        setOptions(Object.values(optionData));
      });
  }, []);

  function handleChange(value: string[]) {
    switch (value.length) {
      case 2:
        setParams({ name: value[1] });
        break;
      case 1:
        setParams({ type: value[0] });
        break;
      default:
        setParams({});
    }
  }

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '报警次数',
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: data.map(item => item.value),
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  };

  return (
    <Card
      loading={loading}
      title="报警趋势"
      bodyStyle={{ height: 353 }}
      extra={
        <Cascader
          changeOnSelect
          style={{ width: 260 }}
          options={options}
          onChange={handleChange}
          placeholder="过滤监控项，默认所有"
        />
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

export default AlarmTrend;
