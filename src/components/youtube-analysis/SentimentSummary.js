import React, { useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown } from "lucide-react";

const ANALYSIS_METHOD = 'AI가 댓글의 핵심 내용을 감정별로 분류하고, 각 감정 카테고리의 주요 의견과 트렌드를 요약했습니다.';

// SentimentChart와 동일한 i 아이콘 컴포넌트
function InfoIcon({ text }) {
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
          left: 22,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.95)',
          color: '#e2e8f0',
          fontSize: 12,
          lineHeight: 1.65,
          padding: '12px 14px',
          borderRadius: 12,
          width: 240,
          zIndex: 999,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.08)',
          whiteSpace: 'normal',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 11, letterSpacing: '0.06em' }}>
            💡 분석 방법
          </div>
          {text}
          {/* 말풍선 화살표 (좌측) */}
          <span style={{
            position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)',
            borderWidth: '5px 6px 5px 0', borderStyle: 'solid',
            borderColor: 'transparent rgba(15,23,42,0.95) transparent transparent',
          }} />
        </span>
      )}
    </span>
  );
}

// 접기/펼치기 섹션
function CollapsibleSection({ title, isOpen, onToggle, children, infoText }) {
  return (
    <div style={{
      borderRadius: 20,
      border: '1px solid #dde6f5',
      background: '#ffffff',
      boxShadow: '0 2px 16px rgba(99,120,220,0.07)',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 28px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{title}</span>
          {/* i 아이콘은 클릭 이벤트가 버블링되지 않도록 stopPropagation */}
          <span onClick={e => e.stopPropagation()}>
            <InfoIcon text={infoText} />
          </span>
        </div>
        <span style={{
          fontSize: 13,
          color: '#6366f1',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          transition: 'transform 0.2s',
        }}>
          {isOpen ? '▲ 접기' : '▼ 펼치기'}
        </span>
      </button>

      {/* 본문 — 펼쳐진 경우만 */}
      {isOpen && (
        <div style={{
          padding: '24px 28px',
          animation: 'summaryFadeIn 0.2s ease',
        }}>
          {children}
        </div>
      )}

      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const SUMMARY_ITEMS = [
  {
    key: 'positive',
    label: '긍정적 의견',
    emoji: '😊',
    Icon: ThumbsUp,
    accentColor: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    textColor: '#14532d',
    iconColor: '#16a34a',
  },
  {
    key: 'neutral',
    label: '중립적 의견',
    emoji: '😐',
    Icon: Minus,
    accentColor: '#94a3b8',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
    textColor: '#334155',
    iconColor: '#64748b',
  },
  {
    key: 'negative',
    label: '부정적 의견',
    emoji: '😞',
    Icon: ThumbsDown,
    accentColor: '#f87171',
    bgColor: '#fff5f5',
    borderColor: '#fca5a5',
    textColor: '#7f1d1d',
    iconColor: '#dc2626',
  },
];

export function SentimentSummary({ data }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <CollapsibleSection
      title="AI 감정별 요약"
      isOpen={isOpen}
      onToggle={() => setIsOpen(prev => !prev)}
      infoText={ANALYSIS_METHOD}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SUMMARY_ITEMS.map(item => (
          <div key={item.key} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '16px 20px',
            borderRadius: 14,
            background: item.bgColor,
            border: `1px solid ${item.borderColor}`,
            borderLeft: `4px solid ${item.accentColor}`,
          }}>
            {/* 아이콘 */}
            <div style={{
              flexShrink: 0,
              width: 36, height: 36,
              borderRadius: '50%',
              background: '#ffffff',
              border: `1.5px solid ${item.borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <item.Icon size={16} color={item.iconColor} />
            </div>

            {/* 텍스트 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: item.textColor,
                marginBottom: 6, letterSpacing: '0.02em',
              }}>
                {item.label}
              </div>
              <p style={{
                fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0,
              }}>
                {data[item.key] || '요약 정보가 없습니다.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}