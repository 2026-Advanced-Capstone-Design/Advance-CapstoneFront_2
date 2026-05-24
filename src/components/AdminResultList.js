import React, { useState, useEffect, useRef } from 'react';
import './AdminResultList.css';

const BASE_URL = 'http://54.180.222.248:8080';
const PAGE_SIZE = 10;

/* ─────────────────────────────────────────
   유틸 함수
───────────────────────────────────────── */
const getScoreClass = (score) => {
  if (score >= 65) return 'score-high';
  if (score >= 35) return 'score-mid';
  return 'score-low';
};

const getBarColor = (val) => {
  const pct = val > 1 ? val : val * 100;
  if (pct >= 65) return '#22c55e';
  if (pct >= 35) return '#f59e0b';
  return '#ef4444';
};

const pct = (val) => Math.round((val > 1 ? val : (val ?? 0) * 100));

const parseJsonArr = (str) => {
  try { return JSON.parse(str); } catch { return []; }
};

/* ─────────────────────────────────────────
   ScoreBar (재사용 컴포넌트)
───────────────────────────────────────── */
function ScoreBar({ label, value }) {
  const p = pct(value);
  return (
    <div className="bar-row">
      <span className="bar-name">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${p}%`, backgroundColor: getBarColor(value) }} />
      </div>
      <span className="bar-val">{p}%</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   탭 내용: 요약 & 점수
───────────────────────────────────────── */
function TabOverview({ data }) {
  const { totalScore, indicators = {}, summary = {}, analyzedAt, articleId, factRatioSource } = data;
  const keywords = parseJsonArr(summary.keywords || '[]');
  const keyFacts = parseJsonArr(summary.keyFacts || '[]');

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="metric-card">
          <div className="metric-num">{totalScore ?? '-'}</div>
          <div className="metric-label">종합 신뢰도 점수</div>
        </div>
        <div className="metric-card">
          <div className="metric-num">{articleId ?? '-'}</div>
          <div className="metric-label">Article ID</div>
        </div>
        <div className="metric-card">
          <div className="metric-num" style={{ fontSize: '0.95rem' }}>
            {analyzedAt ? new Date(analyzedAt).toLocaleDateString('ko-KR') : '-'}
          </div>
          <div className="metric-label">분석 일시</div>
        </div>
      </div>

      <div className="field-group">
        <div className="field-label">지표 분석</div>
        <ScoreBar label="사실 기반도" value={indicators.factRatio ?? 0} />
        <ScoreBar label="감정 중립도" value={indicators.emotionNeutrality ?? 0} />
        <ScoreBar label="출처 균형" value={indicators.sourceBalance ?? 0} />
        <ScoreBar label="생략 중립도" value={indicators.omissionNeutrality ?? 0} />
        <ScoreBar label="편향 점수" value={indicators.biasScore ?? 0} />
      </div>

      {keyFacts.length > 0 && (
        <div className="field-group">
          <div className="field-label">핵심 사실</div>
          {keyFacts.map((f, i) => (
            <div key={i} className="field-value" style={{ borderBottom: '1px solid #f3f4f6', padding: '5px 0' }}>
              • {f}
            </div>
          ))}
        </div>
      )}

      {keywords.length > 0 && (
        <div className="field-group">
          <div className="field-label">키워드</div>
          <div>{keywords.map((k, i) => <span key={i} className="pill">{k}</span>)}</div>
        </div>
      )}

      <div className="grid-2">
        <div className="field-group">
          <div className="field-label">사실비율 출처</div>
          <div className="field-value">{factRatioSource ?? '-'}</div>
        </div>
        <div className="field-group">
          <div className="field-label">분석 일시 (전체)</div>
          <div className="field-value" style={{ fontSize: '0.78rem' }}>
            {analyzedAt ? new Date(analyzedAt).toLocaleString('ko-KR') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   탭 내용: 본문
───────────────────────────────────────── */
function TabText({ data }) {
  const { background, cleanedText, originalText, sentences = [] } = data;

  return (
    <div>
      <div className="field-group">
        <div className="field-label">배경 설명</div>
        <div className="text-box">{background || '-'}</div>
      </div>
      <div className="field-group">
        <div className="field-label">정제된 본문 (cleanedText)</div>
        <div className="text-box">{cleanedText || '-'}</div>
      </div>
      <div className="field-group">
        <div className="field-label">원문 (originalText)</div>
        <div className="text-box" style={{ maxHeight: 220, overflowY: 'auto' }}>
          {originalText || '-'}
        </div>
      </div>
      {sentences.length > 0 && (
        <div className="field-group">
          <div className="field-label">문장 분석 ({sentences.length}건)</div>
          <ul className="sentence-list">
            {sentences.map((s, i) => (
              <li key={i}>
                <span className="sent-num">{i + 1}</span>
                <span>{typeof s === 'string' ? s : (s.text || JSON.stringify(s))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   탭 내용: 편향 분석
───────────────────────────────────────── */
function TabBias({ data }) {
  const { bias = {}, sectionBiasScore } = data;
  const dir = bias.biasDirection || 'center';
  const badgeCls = dir === 'right' ? 'bias-right' : dir === 'left' ? 'bias-left' : 'bias-center';
  const dirLabel = dir === 'right' ? '▶ 우편향' : dir === 'left' ? '◀ 좌편향' : '● 중립';

  return (
    <div>
      <div className="field-group">
        <div className="field-label">편향 방향</div>
        <span className={`bias-badge ${badgeCls}`}>
          {dirLabel} &nbsp;|&nbsp; {bias.spectrumLabel ?? '-'}
        </span>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div>
            <div className="field-label">편향 레이블</div>
            <div className="field-value">{bias.biasLabel ?? '-'}</div>
          </div>
          <div>
            <div className="field-label">편향 신뢰도</div>
            <div className="field-value">{Math.round((bias.biasConfidence ?? 0) * 100)}%</div>
          </div>
        </div>
      </div>

      <div className="field-group">
        <div className="field-label">편향 이유</div>
        <div className="text-box">{bias.biasReason ?? '-'}</div>
      </div>

      <div className="field-group">
        <div className="field-label">섹션별 편향 점수 (sectionBiasScore)</div>
        <ScoreBar label="sectionBias" value={sectionBiasScore ?? 0} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   탭 내용: CoT / 섹션
───────────────────────────────────────── */
function TabDetail({ data }) {
  const { cotReasons = {}, sections = [] } = data;
  const cotKeys = ['vocab', 'framing', 'citation', 'omission'];
  const cotLabels = { vocab: '어휘 분석', framing: '프레이밍', citation: '인용 분석', omission: '생략 분석' };

  return (
    <div>
      <div className="field-group">
        <div className="field-label">CoT 분석 이유</div>
        {cotKeys.map(k => cotReasons[k] ? (
          <div key={k} className="cot-item">
            <div className="cot-key">{cotLabels[k]}</div>
            <div className="text-box">{cotReasons[k]}</div>
          </div>
        ) : null)}
        {cotKeys.every(k => !cotReasons[k]) && <div className="field-value">-</div>}
      </div>

      {sections.length > 0 && (
        <div className="field-group">
          <div className="field-label">섹션 분석 ({sections.length}건)</div>
          {sections.map((s, i) => (
            <div key={i} className="section-block">
              <div className="section-block-title">{s.title || `섹션 ${i + 1}`}</div>
              <div className="section-block-meta">
                편향 점수: {Math.round((s.biasScore ?? 0) * 100)}%
              </div>
              {s.content && (
                <div className="field-value" style={{ marginTop: 6, fontSize: '0.78rem', color: '#6b7280' }}>
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   탭 내용: Raw JSON
───────────────────────────────────────── */
function TabRaw({ data }) {
  return (
    <div>
      <div className="field-label" style={{ marginBottom: 8 }}>전체 Raw JSON</div>
      <pre className="raw-json">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/* ─────────────────────────────────────────
   블럭 상세 뷰 (탭 포함)
───────────────────────────────────────── */
const TABS = [
  { id: 'overview', label: '요약 & 점수' },
  { id: 'text',     label: '본문' },
  { id: 'bias',     label: '편향 분석' },
  { id: 'detail',   label: 'CoT / 섹션' },
  { id: 'raw',      label: 'Raw JSON' },
];

function BlockDetail({ data }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="block-body">
      <div className="detail-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`detail-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`tab-panel ${activeTab === 'overview' ? 'active' : ''}`}>
        <TabOverview data={data} />
      </div>
      <div className={`tab-panel ${activeTab === 'text' ? 'active' : ''}`}>
        <TabText data={data} />
      </div>
      <div className={`tab-panel ${activeTab === 'bias' ? 'active' : ''}`}>
        <TabBias data={data} />
      </div>
      <div className={`tab-panel ${activeTab === 'detail' ? 'active' : ''}`}>
        <TabDetail data={data} />
      </div>
      <div className={`tab-panel ${activeTab === 'raw' ? 'active' : ''}`}>
        <TabRaw data={data} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   단일 블럭 (헤더 + 상세)
───────────────────────────────────────── */
function ResultBlock({ resultId, isOpen, onToggle }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error | not_found
  const [data, setData] = useState(null);
  const fetchedRef = useRef(false);

  // 열릴 때 한 번만 fetch
  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    setState('loading');

    fetch(`${BASE_URL}/api/v1/articles/${resultId}/result`)
      .then(res => {
        if (res.status === 404) { setState('not_found'); return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json === null) return;
        const d = json.data ?? json;
        setData(d);
        setState('done');
      })
      .catch(err => {
        console.error(`resultId ${resultId} fetch error:`, err);
        setState('error');
      });
  }, [isOpen, resultId]);

  /* ── 헤더 렌더 ── */
  const renderHeader = () => {
    if (state === 'done' && data) {
      const title = data.summary?.title || `결과 #${resultId}`;
      const scoreClass = getScoreClass(data.totalScore);
      return (
        <>
          <span className="block-id-badge">ID {resultId}</span>
          <span className="block-title-text">{title}</span>
          <span className={`block-score-badge ${scoreClass}`}>{data.totalScore}점</span>
        </>
      );
    }
    if (state === 'loading') {
      return (
        <>
          <span className="block-id-badge">ID {resultId}</span>
          <span className="block-title-text block-state-loading">
            <span className="spinner-sm" />
            불러오는 중...
          </span>
        </>
      );
    }
    if (state === 'not_found') {
      return (
        <>
          <span className="block-id-badge">ID {resultId}</span>
          <span className="block-title-text block-state-pending">분석 결과 없음 (404)</span>
        </>
      );
    }
    if (state === 'error') {
      return (
        <>
          <span className="block-id-badge">ID {resultId}</span>
          <span className="block-title-text block-state-error">데이터 로드 실패</span>
        </>
      );
    }
    // idle (아직 열지 않음)
    return (
      <>
        <span className="block-id-badge">ID {resultId}</span>
        <span className="block-title-text" style={{ color: '#9ca3af' }}>클릭하여 불러오기</span>
      </>
    );
  };

  return (
    <div className={`result-block ${isOpen ? 'is-open' : ''}`}>
      <div className="block-header" onClick={onToggle}>
        {renderHeader()}
        <span className={`block-chevron ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && state === 'done' && data && (
        <BlockDetail data={data} />
      )}
      {isOpen && state === 'loading' && (
        <div className="block-body" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: '0.85rem' }}>
          <div className="spinner" />
          데이터를 가져오는 중입니다...
        </div>
      )}
      {isOpen && state === 'not_found' && (
        <div className="block-body" style={{ padding: 20, color: '#f59e0b', fontSize: '0.85rem' }}>
          해당 ID에 대한 분석 결과가 없습니다. (404)
        </div>
      )}
      {isOpen && state === 'error' && (
        <div className="block-body" style={{ padding: 20, color: '#ef4444', fontSize: '0.85rem' }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   메인 페이지
───────────────────────────────────────── */
function AdminResultList() {
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState(null);

  // 추가
  const [searchInput, setSearchInput] = useState('');
  const [searchId, setSearchId] = useState(null); // null이면 일반 페이지 모드

  const handleSearch = () => {
    const id = parseInt(searchInput, 10);
    if (isNaN(id) || id < 0) {
      alert('올바른 Result ID를 입력해주세요.');
      return;
    }
    setSearchId(id);
    setOpenId(id); // 바로 열어줌
  };

  const handleSearchClear = () => {
    setSearchId(null);
    setSearchInput('');
    setOpenId(null);
  };

  const handlePageChange = (dir) => {
    const next = page + dir;
    if (next < 0) return;
    setPage(next);
    setOpenId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startId = page * PAGE_SIZE;
  const ids = Array.from({ length: PAGE_SIZE }, (_, i) => startId + i);

  return (
    <div className="admin-page">
      {/* 헤더 */}
      <div className="admin-header">
        <h1>전체 분석 결과 목록</h1>
        <span className="admin-header-meta">
          ID {startId} ~ {startId + PAGE_SIZE - 1} &nbsp;|&nbsp; {PAGE_SIZE}개씩 표시
        </span>
      </div>

      {/* ID 검색바 */}
      <div className="id-search-bar">
        <input
          type="number"
          min="0"
          className="id-search-input"
          placeholder="Result ID 직접 입력..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="id-search-btn" onClick={handleSearch}>조회</button>
        {searchId !== null && (
          <button className="id-search-clear-btn" onClick={handleSearchClear}>
            ✕ 목록으로
          </button>
        )}
      </div>

      {/* 검색 모드 or 일반 목록 모드 */}
      {searchId !== null ? (
        // 검색 모드: 해당 ID 하나만 표시
        <div>
          <div className="search-mode-label">
            Result ID {searchId} 조회 결과
          </div>
          <ResultBlock
            key={`search-${searchId}`}
            resultId={searchId}
            isOpen={openId === searchId}
            onToggle={() => setOpenId(prev => prev === searchId ? null : searchId)}
          />
        </div>
      ) : (
        // 일반 목록 모드
        <>
          {ids.map(id => (
            <ResultBlock
              key={`${page}-${id}`}
              resultId={id}
              isOpen={openId === id}
              onToggle={() => setOpenId(prev => prev === id ? null : id)}
            />
          ))}

          <div className="pagination">
            <button
              className="page-btn page-btn-large"
              disabled={page < 10}
              onClick={() => handlePageChange(-10)}
            >
              ◀◀ 100
            </button>
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => handlePageChange(-1)}
            >
              ← 이전
            </button>
            <span className="page-indicator">{page + 1} 페이지</span>
            <button className="page-btn" onClick={() => handlePageChange(1)}>
              다음 →
            </button>
            <button className="page-btn page-btn-large" onClick={() => handlePageChange(10)}>
              100 ▶▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminResultList;
