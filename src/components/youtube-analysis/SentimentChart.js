import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  positive: '#4ade80',
  neutral:  '#94a3b8',
  negative: '#f87171',
};

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{
        background: 'rgba(15,23,42,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 14px',
        color: '#f1f5f9',
        fontSize: 13,
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ fontWeight: 700 }}>{name}</span>
        <span style={{ marginLeft: 8, color: '#94a3b8' }}>{value.toLocaleString()}개</span>
      </div>
    );
  }
  return null;
};

// 커스텀 라벨 (퍼센트 텍스트)
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export function SentimentChart({ data }) {
  if (!data) return null;

  const total = data.positive + data.neutral + data.negative;

  const items = [
    { key: 'positive', label: '긍정', value: data.positive, color: COLORS.positive, emoji: '😊' },
    { key: 'neutral',  label: '중립', value: data.neutral,  color: COLORS.neutral,  emoji: '😐' },
    { key: 'negative', label: '부정', value: data.negative, color: COLORS.negative, emoji: '😞' },
  ];

  const pieData = items.map(i => ({ name: i.label, value: i.value, color: i.color }));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      padding: '28px 32px',
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
      borderRadius: 20,
      border: '1px solid #e2e8f8',
      boxShadow: '0 2px 16px rgba(99,120,220,0.07)',
      minHeight: 220,
    }}>

      {/* 좌측: 감정별 수치 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: '0 0 auto', minWidth: 200 }}>
        {items.map(item => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
          const barWidth = total > 0 ? (item.value / total) * 100 : 0;

          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* 라벨 행 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>
                    {item.value.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* 미니 바 */}
              <div style={{
                width: '100%', height: 5, background: '#e2e8f0',
                borderRadius: 99, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%',
                  background: item.color,
                  borderRadius: 99,
                  transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                }} />
              </div>
            </div>
          );
        })}

        {/* 총합 */}
        <div style={{
          marginTop: 4, paddingTop: 14,
          borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
            TOTAL
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 우측: 원형 그래프 */}
      <div style={{ flex: 1, minWidth: 0, height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {items.map(item => (
                <radialGradient key={item.key} id={`grad-${item.key}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={item.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0.7} />
                </radialGradient>
              ))}
            </defs>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#grad-${items[index].key})`}
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* 도넛 중앙 텍스트 — SVG 오버레이 불가이므로 절대 위치로 표현 */}
      </div>

    </div>
  );
}