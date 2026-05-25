import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  positive: '#4ade80',
  neutral:  '#94a3b8',
  negative: '#f87171',
};

const BOT_CRITERIA = [
  '동일하거나 유사한 패턴의 반복적인 댓글',
  '짧은 시간 내 대량 댓글 작성',
  '비정상적인 사용자 프로필 패턴',
  '스팸성 키워드 및 링크 포함',
];

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

// 커스텀 라벨
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

// i 아이콘 + 툴팁
function InfoIcon() {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 16, height: 16, borderRadius: '50%',
        background: visible ? '#6366f1' : '#cbd5e1',
        color: visible ? '#fff' : '#64748b',
        fontSize: 10, fontWeight: 700, fontStyle: 'italic',
        cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
        userSelect: 'none',
      }}>i</span>

      {visible && (
        <span style={{
          position: 'absolute',
          right: 22,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.95)',
          color: '#e2e8f0',
          fontSize: 12,
          lineHeight: 1.65,
          padding: '12px 14px',
          borderRadius: 12,
          width: 220,
          zIndex: 999,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 11, letterSpacing: '0.06em' }}>
            🔍 봇 탐지 기준
          </div>
          {BOT_CRITERIA.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: i < BOT_CRITERIA.length - 1 ? 6 : 0 }}>
              <span style={{ color: '#6366f1', marginTop: 1, flexShrink: 0 }}>•</span>
              <span>{c}</span>
            </div>
          ))}
          {/* 말풍선 화살표 (우측) */}
          <span style={{
            position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
            borderWidth: '5px 0 5px 6px', borderStyle: 'solid',
            borderColor: 'transparent transparent transparent rgba(15,23,42,0.95)',
          }} />
        </span>
      )}
    </span>
  );
}

// 봇 위험도 계산
function getRiskLevel(pct) {
  if (pct === undefined || pct === null) return { label: '알 수 없음', color: '#94a3b8' };
  if (pct < 5)  return { label: '낮음 🟢', color: '#4ade80' };
  if (pct < 15) return { label: '보통 🟡', color: '#fbbf24' };
  return { label: '높음 🔴', color: '#f87171' };
}

export function SentimentChart({ data }) {
  if (!data) return null;

  const total = data.positive + data.neutral + data.negative;
  const botPct   = data.botPercentage ?? 0;
  const botCount = data.suspiciousBots ?? 0;
  const totalComments = data.totalComments ?? total;
  const risk = getRiskLevel(botPct);

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
      background: '#ffffff',
      borderRadius: 20,
      border: '1px solid #dde6f5',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>
                    {item.value.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{pct}%</span>
                </div>
              </div>
              <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%', background: item.color,
                  borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                }} />
              </div>
            </div>
          );
        })}

        {/* 총합 */}
        <div style={{
          marginTop: 4, paddingTop: 14, borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{totalComments.toLocaleString()}</span>
        </div>
      </div>

      {/* 중앙: 원형 그래프 */}
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
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={95}
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
      </div>

      {/* 우측: 봇 탐지 수치 */}
      <div style={{
        flex: '0 0 auto', minWidth: 230,
        display: 'flex', flexDirection: 'column', gap: 22,
        position: 'relative',
        paddingLeft: 24,
        borderLeft: '1px solid #e2e8f0',
      }}>
        {/* i 아이콘 — 우측 상단 */}
        <div style={{ position: 'absolute', top: -8, right: 0 }}>
          <InfoIcon />
        </div>

        {/* 의심 봇 수 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>의심 봇</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>
                {botCount.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                {botPct.toFixed(1)}%
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: 7, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(botPct, 100)}%`, height: '100%',
              background: '#818cf8',
              borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        </div>

        {/* 위험도 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>위험도</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: risk.color }}>
              {risk.label}
            </span>
          </div>
          <div style={{ width: '100%', height: 7, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(botPct * 3, 100)}%`, height: '100%',
              background: risk.color,
              borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        </div>

        {/* 구분선 + 총 댓글 */}
        <div style={{
          marginTop: 4, paddingTop: 14, borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>BOT / TOTAL</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
            {botCount} / {totalComments.toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
}