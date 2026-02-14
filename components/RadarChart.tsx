
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
}

const RadarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#475569' }} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Radar
            name="Current Proficiency"
            dataKey="current"
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.6}
          />
          <Radar
            name="Required for Dream Job"
            dataKey="required"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
