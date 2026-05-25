import React, { useState } from 'react';
import { ThumbsUp, Bot } from 'lucide-react';

// 접기/펼치기 섹션 (SentimentSummary와 동일)
function CollapsibleSection({ title, isOpen, onToggle, children, count }) {
  return (
    <div style={{
      borderRadius: 20,
      border: '1px solid #dde6f5',
      background: '#ffffff',
      boxShadow: '0 2px 16px rgba(99,120,220,0.07)',
      overflow: 'hidden',
    }}>
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
          {count !== undefined && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: '#eef2ff', color: '#6366f1',
              padding: '2px 10px', borderRadius: 99,
            }}>
              {count}개
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
          {isOpen ? '▲ 접기' : '▼ 펼치기'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '20px 28px 28px',
          animation: 'commentFadeIn 0.2s ease',
        }}>
          {children}
        </div>
      )}

      <style>{`
        @keyframes commentFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const getBorderStyle = (sentiment) => {
  switch (sentiment) {
    case '긍정': return { borderLeft: '4px solid #22c55e', background: '#f0fdf4', border: '1px solid #86efac' };
    case '부정': return { borderLeft: '4px solid #f87171', background: '#fff5f5', border: '1px solid #fca5a5' };
    default:     return { borderLeft: '4px solid #94a3b8', background: '#f8fafc', border: '1px solid #cbd5e1' };
  }
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case '긍정': return '#16a34a';
    case '부정': return '#dc2626';
    default:     return '#64748b';
  }
};

const CommentList = ({ comments }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!comments || comments.length === 0) return null;

  return (
    <CollapsibleSection
      title="댓글 리스트"
      isOpen={isOpen}
      onToggle={() => setIsOpen(prev => !prev)}
      count={comments.length}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map((comment, index) => {
          const borderStyle = getBorderStyle(comment.sentiment);
          return (
            <div
              key={comment.author_id + index}
              style={{
                ...borderStyle,
                borderRadius: 14,
                padding: '14px 18px',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* 상단: 댓글 본문 + 좋아요/감성점수 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
                <p style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.7, margin: 0, flex: 1 }}>
                  {comment.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
                    <ThumbsUp size={14} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.likes.toLocaleString()}</span>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: getSentimentColor(comment.sentiment),
                    background: '#ffffff',
                    border: `1px solid ${getSentimentColor(comment.sentiment)}40`,
                    padding: '2px 10px', borderRadius: 99,
                  }}>
                    {(comment.sentimentScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* 하단: 작성자 + 감성 라벨 + 봇 배지 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    {comment.authorName}
                  </span>
                  {comment.is_bot && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: '#fef3c7', color: '#92400e',
                      border: '1px solid #fcd34d',
                      padding: '2px 8px', borderRadius: 99,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <Bot size={11} />
                      BOT {comment.botScore}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: getSentimentColor(comment.sentiment),
                }}>
                  {comment.sentiment}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};

export default CommentList;