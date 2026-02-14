
import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { SkillGap } from '../types';

interface Props {
  data: SkillGap[];
  completionRatio: number; // 0 to 1
}

const RadarChart: React.FC<Props> = ({ data, completionRatio }) => {
  // Calculate adjusted data based on completion
  const adjustedData = data.map(item => {
    const gap = item.required - item.current;
    const progressBoost = gap > 0 ? gap * completionRatio : 0;
    return {
      ...item,
      // The proficiency grows towards the requirement as tasks are checked off
      current: Math.min(10, parseFloat((item.current + progressBoost).toFixed(1)))
    };
  });

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={adjustedData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#475569' }} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Radar
            name="Current Proficiency (Evolving)"
            dataKey="current"
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.6}
          />
          <Radar
            name="Target Proficiency"
            dataKey="required"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
