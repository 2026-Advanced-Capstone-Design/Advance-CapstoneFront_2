import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BeatLoader } from "react-spinners";
import './GeneralResult.css';
import ReactDOM from 'react-dom';

const BASE_URL = 'http://54.180.222.248:8080';

// 각 지표별 툴팁 설명
const TOOLTIP_INFO = {
  reliability: '종합 신뢰도입니다. 사실 기반도, 감정적 중립도, 생략 중립도, 편향도를 종합하여 산출한 점수입니다.',
  factBased: '기사 내 주장이 검증 가능한 사실에 근거하는 비율입니다. 수치가 높을수록 사실에 기반한 서술이 많습니다.',
  neutrality: '감정적으로 중립적인 어휘와 표현을 사용하는 정도입니다. 수치가 높을수록 감정 편향 없이 서술되었습니다.',
  omission: '중요한 정보나 반론이 생략되지 않은 정도입니다. 수치가 높을수록 편향된 생략이 적습니다.',
  bias: '특정 이념·진영으로의 편향 정도입니다. 수치가 높을수록 편향이 강하게 나타납니다.',
};

// ── 하이라이트 타입 한글 레이블 ──
const HIGHLIGHT_TYPE_LABEL = {
  fact:    '사실',
  bias:    '편향',
  emotion: '감정',
};

// 툴팁 아이콘 컴포넌트
function InfoIcon({ tooltipKey }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="info-icon-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="info-icon">i</span>
      {visible && (
        <span className="info-tooltip">{TOOLTIP_INFO[tooltipKey]}</span>
      )}
    </span>
  );
}

// 가로 점수 바 컴포넌트 (툴팁 + 분석 이유 포함)
function ScoreBar({ label, score, color, tooltipKey, subLabel, reason }) {
  return (
    <div className="score-bar-row">
      <span className="bar-label">
        {label}
        {subLabel && <span className="bar-sub-label"> ({subLabel})</span>}
        <InfoIcon tooltipKey={tooltipKey} />
      </span>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
      <span className="bar-score-num">{score}%</span>
    </div>
  );
}

function CollapsibleSection({ icon, title, children, sectionRef }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`collapsible-section ${open ? 'is-open' : ''}`} ref={sectionRef}>
      <div className="collapsible-header" onClick={() => setOpen(prev => !prev)}>
        <span className="collapsible-icon">{icon}</span>
        <span className="collapsible-title">{title}</span>
        <span className={`collapsible-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>
      {open && (
        <div className="collapsible-body">
          {children}
        </div>
      )}
    </div>
  );
}

function GeneralResult({result_Id, inputText}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 피드백 관련 상태
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'up', 'down', null
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  // 점수 섹션 확장 상태
    const [scoreExpanded, setScoreExpanded] = useState(false);

  // 섹션 스크롤 네비게이터 관련
  const [activeSection, setActiveSection] = useState('score');
  
  const scoreRef = useRef(null);
  const contentRef = useRef(null);
  const sourceRef = useRef(null);
  const feedbackRef = useRef(null);

  const parseJsonArr = (val) => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  // 백엔드 연동 전 임의 데이터
  const initialFact = Math.floor(Math.random() * 101);
  const initialNeutral = Math.floor(Math.random() * 101);
  const initialOmission = Math.floor(Math.random() * 101);
  const initialBias = Math.floor(Math.random() * 101);

  const mockData = {
    title: "백엔드에서 받아온 제목 표시되는 부분",
    keywords: ["인공지능", "개인정보", "데이터", "투명성"],
    keyFacts: [
      "인공지능 기술이 급격히 발전하고 있습니다.",
      "개인정보 유출 문제는 여전히 해결되지 않았습니다.",
      "데이터 투명성 확보가 중요합니다.",
    ],
    score: {
      reliability: Math.round((initialFact + initialNeutral + initialOmission + initialBias) / 4),
      factBased: initialFact,
      neutrality: initialNeutral,
      omission: initialOmission,
      bias: initialBias
    },
    biasLabel: '보수',
    cotReasons: {
      factRatio: '사실 기반 분석 이유가 여기에 표시됩니다.',
      emotionNeutrality: '감정적 중립도 분석 이유가 여기에 표시됩니다.',
      bias: '편향도 분석 이유가 여기에 표시됩니다.',
    },
    content: "최근 인공지능 기술은 급격하게 발전하고 있습니다. 하지만 개인정보 유출 문제는 여전히 해결되지 않은 숙제입니다. 데이터의 투명성을 확보하는 것이 무엇보다 중요합니다.",
    highlights: [
      { text: "급격하게 발전하고 있습니다.",         type: "pos", highlightReason: "framing", biasScore: 0.3 },
      { text: "개인정보 유출 문제는 여전히 해결되지 않은 숙제입니다.", type: "pos", highlightReason: "omission", biasScore: 0.6 },
      { text: "투명성을 확보하는 것이 무엇보다 중요합니다.",        type: "pos", highlightReason: "vocab",    biasScore: 0.2 },
    ],
    sources: [
      { url : "https://www.lipsum.com/", title : "Lorem Ipsum" },
      { title : "인공지능 관련 출처 자료의 제목"}
    ]
  };

  // 백엔드 응답을 화면 표시 구조로 변환
  const displayData = data ? {
    title: data.summary.title || '-',
    keywords: parseJsonArr(data.summary?.keywords || '[]'),
    keyFacts: parseJsonArr(data.summary?.keyFacts  || '[]'),
    score: {
      reliability: data.totalScore || 0,
      factBased: Math.round((data.indicators.factRatio || 0) * 100),
      neutrality: Math.round((data.indicators.emotionNeutrality || 0) * 100),
      bias: Math.round((1 - data.indicators.biasScore || 0) * 100)
    },
    biasLabel: data.bias?.spectrumLabel || data.bias?.biasDirection || '',
    cotReasons: {
      factRatio: data.indicators.factCheckReason || '',
      emotionNeutrality: data.cotReasons.emotionNeutrality || '',
      bias: data.bias.biasReason || '',
    },
    content: data.originalText || '-',
    highlights: (data.sentences || []).map(s => ({
      text:            s.sentenceText,
      type:            s.highlightType,           // 'fact' | 'bias' | 'emotion'
      highlightReason: s.highlightReason || '',
      highlightScore:  1-s.highlightScore  ?? 0.5,
    })),
    sources: [

    ]
  } : mockData;

  
useEffect(() => {
  let timer;
  if (!result_Id) return;

  // 데이터 요청 함수
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/articles/${result_Id}/result`);

      if (response.status === 200) {
        setData(response.data.data);
        console.log(response.data.data);
        setLoading(false);
      }
    } catch (e) {
      if (e.response && e.response.status === 404)  {
        console.log("분석 진행 중 (3초 간격)");
        timer = setTimeout(fetchData, 3000);
      } else {
        setError(e);
        console.error("데이터를 불러오는데 실패했습니다:", e);
        setLoading(false);
      } 
    }
  };
  timer = setTimeout(fetchData, 10000);

  return () => {
    if (timer) clearTimeout(timer);
  }
}, [result_Id]);

if (loading) {
  return (
    <div style={loadingContainerStyle}>
      <div><BeatLoader /></div>
      <p>데이터를 분석하고 있습니다. 잠시만 기다려 주세요... (예상 소요시간 : 30초)</p>
    </div>
  );
}
if (error) {
  return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
}
  

// 점수에 따른 색
const getColor = (score) => {
  if (score >= 65) return '#1a73e8';
  if (score >= 35) return '#f9ab00';
  return '#ea4335';
};

// ── highlightScore → CSS 클래스 ──
// 높을수록(≥0.65) 초록, 낮을수록(≤0.35) 빨강, 중간 노랑
function scoreToColorClass(score) {
  if (score >= 0.65) return 'hl-green';
  if (score >= 0.35) return 'hl-yellow';
  return 'hl-red';
}

// ── 하이라이트 span + 포탈 툴팁 ──
function HighlightSpan({ highlight }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
  const spanRef = useRef(null);
 
  const colorClass = scoreToColorClass(highlight.highlightScore ?? 0.5);
  const typeLabel  = HIGHLIGHT_TYPE_LABEL[highlight.type] || highlight.type || '';
  const scorePct   = Math.round((highlight.highlightScore ?? 0) * 100);
 
  const handleMouseEnter = () => {
    const rect = spanRef.current.getBoundingClientRect();
    const tooltipWidth  = 240;
    const tooltipHeight = 80;
 
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (x + tooltipWidth > window.innerWidth - 12) x = window.innerWidth - tooltipWidth - 12;
    if (x < 12) x = 12;
 
    const y = rect.top > tooltipHeight + 10
      ? rect.top - tooltipHeight - 10
      : rect.bottom + 10;
 
    setTooltip({ visible: true, x, y });
  };
 
  const handleMouseLeave = () => setTooltip({ visible: false, x: 0, y: 0 });
 
  return (
    <>
      <span
        ref={spanRef}
        className={`highlight ${colorClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {highlight.text}
      </span>
 
      {tooltip.visible && ReactDOM.createPortal(
        <div
          className="highlight-tooltip-portal"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <span className="highlight-tooltip-type">{typeLabel} 문장</span>
          <span className="highlight-tooltip-reason">{highlight.highlightReason}</span>
          <span className="highlight-tooltip-score">
            {typeLabel} 지수 : {scorePct}%
          </span>
        </div>,
        document.body
      )}
    </>
  );
}
 
// ── 본문 텍스트를 하이라이트 태그로 변환 ──
function renderHighlightedContent(displayData) {
  const content = displayData.content;
  if (!displayData.highlights || displayData.highlights.length === 0) return content;
 
  const patterns = displayData.highlights
    .map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${patterns})`, 'g');
 
  return content.split(regex).map((part, index) => {
    const highlight = displayData.highlights.find(h => h.text === part);
    if (highlight) {
      return <HighlightSpan key={index} highlight={highlight} />;
    }
    return part;
  });
}

// 따봉 클릭
const handleThumbUp = () => {
  setFeedbackStatus('up');
  setShowCommentBox(false);
};

// 썸다운 클릭
const handleThumbDown = () => {
  setFeedbackStatus('down');
  setShowCommentBox(true);
};

// 피드백 창 취소
const handleCancel = () => {
  setShowCommentBox(false);
  if (!comment.trim()) {
    setFeedbackStatus(null);
  }
};

// 피드백 전송
const handleSendFeedback = async () => {
  try {
    // await axios.post('/api/feedback', { status: 'down', comment });
    alert("피드백이 전송되었습니다.");
    setShowCommentBox(false);
  } catch (error) {
    console.error("피드백 전송 실패", error);
  }
};

  return (
    <div className="result-page-wrapper">
      <div className="result-container">
        {/* 제목 + 키워드 + 핵심 사실 */}
        <header className="result-header" ref={scoreRef}>
          <h1 className="result-title">{displayData.title}</h1>

          {displayData.keywords && displayData.keywords.length > 0 && (
            <div className="keyword-row">
              <span className="keyword-section-label">키워드</span>
              {displayData.keywords.map((kw, i) => (
                <span key={i} className="keyword-pill">{kw}</span>
              ))}
            </div>
          )}

          {displayData.keyFacts && displayData.keyFacts.length > 0 && (
            <div className="keyfacts-box">
              <span className="keyfacts-label">핵심 요약</span>
              <ul className="keyfacts-list">
                {displayData.keyFacts.map((fact, i) => (
                  <li key={i} className="keyfacts-item">
                    <span className="keyfacts-bullet">•</span>{fact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* 지수 표시 섹션 — 클릭 시 확장 */}
        <section
          className={`score-section ${scoreExpanded ? 'expanded' : ''}`}
          onClick={() => setScoreExpanded(prev => !prev)}
          title={scoreExpanded ? '접기' : '클릭하여 분석 이유 보기'}
        >
          {/* 우측 상단 확장 힌트 */}
          <div className="score-expand-hint">
            {scoreExpanded ? '▲ 접기' : '▼ 분석 이유 보기'}
          </div>

          {/* 상단: 원형 그래프 + 바 차트 */}
          <div className="score-main-row">
            {/* 좌측 신뢰도 원형 그래프 */}
            <div className="reliability-box">
              <span className="score-label">
                신뢰도
                <InfoIcon tooltipKey="reliability" />
              </span>
              <div
                className="circle-graph"
                style={{
                  background: `conic-gradient(${getColor(displayData.score.reliability)} ${displayData.score.reliability * 3.6}deg, #e0e0e0 0deg)`,
                }}
              >
                <div className="circle-inner">
                  <span className="score-text">{displayData.score.reliability}%</span>
                </div>
              </div>
            </div>

            {/* 우측 기타 지수 */}
            <div className="other-scores-box">
              <ScoreBar
                label="사실 기반도"
                score={displayData.score.factBased}
                color={getColor(displayData.score.factBased)}
                tooltipKey="factBased"
              />
              <ScoreBar
                label="감정적 중립도"
                score={displayData.score.neutrality}
                color={getColor(displayData.score.neutrality)}
                tooltipKey="neutrality"
              />
              <ScoreBar
                label="편향도"
                subLabel={displayData.biasLabel}
                score={displayData.score.bias}
                color={getColor(displayData.score.bias)}
                tooltipKey="bias"
              />
            </div>
          </div>

          {/* 확장 영역: 각 지표별 분석 이유 */}
          {scoreExpanded && (
            <div
              className="score-detail-panel"
              onClick={e => e.stopPropagation()} // 내부 클릭이 섹션 토글에 전파되지 않도록
            >
              <ReasonItem
                label="사실 기반도"
                score={displayData.score.factBased}
                color={getColor(displayData.score.factBased)}
                reason={displayData.cotReasons.factRatio}
              />
              <ReasonItem
                label="감정적 중립도"
                score={displayData.score.neutrality}
                color={getColor(displayData.score.neutrality)}
                reason={displayData.cotReasons.emotionNeutrality}
              />
              <ReasonItem
                label={`편향도${displayData.biasLabel ? ` (${displayData.biasLabel})` : ''}`}
                score={displayData.score.bias}
                color={getColor(displayData.score.bias)}
                reason={displayData.cotReasons.bias}
              />
            </div>
          )}
        </section>

        <hr className="divider" />


        {/* 본문 접이식 */}
        <CollapsibleSection title="본문" sectionRef={contentRef}>
          <article className="content-body" ref={contentRef}>
            {renderHighlightedContent(displayData)}
          </article>
        </CollapsibleSection>

        <hr className="divider" />
        
        {/* 관련 기사 접이식 */}
        <CollapsibleSection title={`관련 기사 (${displayData.sources?.length || 0})`} sectionRef={sourceRef}>
          <ul className="source-list">
            {displayData.sources && displayData.sources.length > 0 ? (
              displayData.sources.map((source, index) => (
                <li key={index} className="source-item">  
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link active">
                      <span className="source-index">{index + 1}.</span> {source.title || "원문 링크"} 🔗
                    </a>
                  ) : (
                    <span className="source-link disabled">
                      <span className="source-index">{index + 1}.</span> {source.title || "관련 기사 정보 없음"}
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="source-item disabled">확인된 관련 기사 정보가 없습니다.</li>
            )}
          </ul>
        </CollapsibleSection>

        <hr className="divider" />

        {/* 피드백 섹션 */}
        <section className="feedback-section" ref={feedbackRef}>
          <p className="feedback-title">이 분석 결과가 도움이 되었나요?</p>
          <div className="feedback-buttons">
            <button 
              className={`feedback-btn ${feedbackStatus === 'up' ? 'active' : ''}`}
              onClick={handleThumbUp}
            >
              👍
            </button>
            <button 
              className={`feedback-btn ${feedbackStatus === 'down' ? 'active' : ''}`}
              onClick={handleThumbDown}
            >
              👎
            </button>
          </div>

          {/* 피드백 작성 창 (조건부 렌더링) */}
          {showCommentBox && (
            <div className="comment-box-container">
              <textarea 
                placeholder="어떤 점이 아쉬웠는지 알려주세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="comment-actions">
                <button className="cancel-btn" onClick={handleCancel}>취소</button>
                <button className="send-btn" onClick={handleSendFeedback}>보내기</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// 분석 이유 아이템 컴포넌트
function ReasonItem({ label, score, color, reason }) {
  return (
    <div className="reason-item">
      <div className="reason-item-header">
        <span className="reason-label">{label}</span>
        <span className="reason-score-badge" style={{ backgroundColor: color }}>
          {score}%
        </span>
      </div>
      <p className="reason-text">{reason || '분석 이유 정보가 없습니다.'}</p>
    </div>
  );
}

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontSize: '1.2rem'
};


export default GeneralResult;
