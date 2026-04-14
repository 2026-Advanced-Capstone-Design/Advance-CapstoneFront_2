import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BeatLoader } from "react-spinners";
import './GeneralResult.css';

const BASE_URL = 'http://54.180.222.248:8080';

function GeneralResult({result_Id}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 피드백 관련 상태
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'up', 'down', null
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  // 백엔드 연동 전 임의 데이터
  const initialFact = Math.floor(Math.random() * 101);
  const initialNeutral = Math.floor(Math.random() * 101);
  const initialBias = Math.floor(Math.random() * 101);

  const mockData = {
    title: "백엔드에서 받아온 제목 표시되는 부분",
    summary: "백엔드에서 받아온 요약이 표시되는 부분",
    score: {
      reliability: Math.round((initialFact + initialNeutral + initialBias)/3),
      factBased: initialFact,
      neutrality: initialNeutral,
      bias: initialBias
    },
    content: "최근 인공지능 기술은 급격하게 발전하고 있습니다. 하지만 개인정보 유출 문제는 여전히 해결되지 않은 숙제입니다. 데이터의 투명성을 확보하는 것이 무엇보다 중요합니다.",
    highlights: [
      { text: "급격하게 발전", type: "pos" },   // 초록색 (긍정/사실 등)
      { text: "개인정보 유출 문제", type: "neg" }, // 빨간색 (부정/오류 등)
      { text: "투명성을 확보", type: "pos" }
    ]
  };

  // 백엔드 응답을 화면 표시 구조로 변환
  const displayData = data ? {
    title: data.summary?.title || '-',
    summary: data.summary?.content || '-',
    score: {
      reliability: data.totalScore || 0,
      factBased: Math.round((data.indicators?.factRatio || 0) * 100),
      neutrality: Math.round((data.indicators?.emotionNeutrality || 0) * 100),
      bias: Math.round((data.indicators?.biasScore || 0) * 100),
    },
    content: data.summary?.content || '-',
  } : mockData;

  /*
  useEffect(() => {
    // 데이터 요청 함수
    const fetchData = async () => {
      try {
        setLoading(true);
        // 서버의 API 엔드포인트 주소 입력
        const response = await axios.get(`${BASE_URL}/api/v1/articles/${result_Id}/result`);

        // 서버 응답 데이터 저장 (mockData 형식과 일치해야 함)
        setData(response.data);
      } catch (e) {
        setError(e);
        console.error("데이터를 불러오는데 실패했습니다:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [result_Id]);

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner"><BeatLoader /></div>
        <p>데이터를 분석하고 있습니다. 잠시만 기다려 주세요...</p>
      </div>
    );
  }
  if (error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  }
  */

  // 점수에 따른 색
  const getColor = (score) => {
    if (score >= 65) return '#1a73e8';
    if (score >= 35) return '#f9ab00';
    return '#ea4335';
  };

  // 본문 텍스트를 하이라이트 태그로 변환하는 함수
  const renderHighlightedContent = () => {
    let content = displayData.content;
    if (!displayData.highlights || displayData.highlights.length === 0) return content;

    // 하이라이트 텍스트들을 정규식 패턴으로 만듦
    const patterns = displayData.highlights.map(h => h.text).join('|');
    const regex = new RegExp(`(${patterns})`, 'g');

    // 텍스트를 쪼갠 후 매칭되는 부분만 <span>으로 감쌈
    return content.split(regex).map((part, index) => {
      const highlight = displayData.highlights.find(h => h.text === part);
      
      if (highlight) {
        return (
          <span 
            key={index} 
            className={`highlight ${highlight.type === 'pos' ? 'pos' : 'neg'}`}
            title={highlight.type === 'pos' ? '신뢰할 수 있는 부분' : '주의가 필요한 부분'}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

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
    <div className="result-container">
      {/* 제목 및 요약 */}
      <header className="result-header">
        <h1 className="result-title">{displayData.title}</h1>
        <p className="result-summary">{displayData.summary}</p>
      </header>

      {/* 지수 표시 섹션 */}
      <section className="score-section">
        {/* 좌측 신뢰도 원형 그래프 */}
        <div className="reliability-box">
          <span className="score-label">신뢰도</span>
          <div className="circle-graph" style={{
            background: `conic-gradient(${getColor(displayData.score.reliability)} ${displayData.score.reliability * 3.6}deg, #e0e0e0 0deg)`,
          }}>
            <div className="circle-inner">
              <span className="score-text">{displayData.score.reliability}%</span>
            </div>
          </div>
        </div>

        {/* 우측 기타 지수 표시 */}
        <div className="other-scores-box">
          <ScoreBar label="사실 기반도" score={displayData.score.factBased} color={getColor(displayData.score.factBased)} />
          <ScoreBar label="감정적 중립도" score={displayData.score.neutrality} color={getColor(displayData.score.neutrality)} />
          <ScoreBar label="편향도" score={displayData.score.bias} color={getColor(displayData.score.bias)} />
        </div>
      </section>

      <hr className="divider" />

      {/* 본문 섹션 */}
      <article className="content-body">
        {renderHighlightedContent()}
        <pre style={{ backgroundColor: '#f4f4f4', padding: '10px'}}>
          {JSON.stringify(result_Id, null, 2)}
        </pre>
      </article>

      <hr className="divider" />

      {/* 피드백 섹션 */}
      <section className="feedback-section">
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
  );
}

// 가로 점수 바 컴포넌트
function ScoreBar({ label, score, color }) {
  return (
    <div className="score-bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
      <span className="bar-score-num">{score}%</span>
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
