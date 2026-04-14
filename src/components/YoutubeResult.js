import React , {useEffect, useState} from 'react';
import { SentimentChart } from "./youtube-analysis/SentimentChart";
import { BotDetection } from "./youtube-analysis/BotDetection";
import { SentimentSummary } from "./youtube-analysis/SentimentSummary";
import axios from 'axios';
import { BeatLoader } from "react-spinners";

const BASE_URL = 'http://54.180.222.248:8080';

const YoutubeResult = ({ result_id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayData = data && !data.error ? data : {
    videoInfo: {
      thumbnail: null,
      title: "백엔드에서 영상 제목을 받아야 함",
      channel: "백엔드에서 채널명을 받아야 함",
      views: "백엔드에서 조회수를 받아야 함",
      date: "백엔드에서 업로드 날짜를 받아야 함"
    },
    sentiment: { positive: 1247, neutral: 856, negative: 423 },
    botDetection: { totalComments: 2526, suspiciousBots: 89, botPercentage: 3.5, riskLevel: "low" },
    summary: {
      positive: "시청자들은 콘텐츠의 높은 퀄리티에 대해 긍정적으로 평가하고 있습니다.",
      neutral: "일부 시청자들은 추가 설명을 요청하고 있습니다.",
      negative: "몇몇 시청자들은 정보의 정확성에 의문을 제기하고 있습니다.",
    },
  };
  /*
  useEffect(() => {
    // 데이터 요청 함수
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/v1/articles/${result_id}/result`);
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
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-6 animate-in fade-in duration-700">
      
      {/* 1단: 영상 정보 (가로로 긴 카드 형태) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-2/5 aspect-video bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
          {displayData.videoInfo.thumbnail ? (
            <img src={displayData.videoInfo.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
          ) : (
            "백엔드에서 썸네일을 받아야 함"
          )}
        </div>
        <div className="w-full md:w-3/5 space-y-4">
          <h3 className="text-sm font-bold text-red-500 flex items-center gap-1">▶ 영상 정보</h3>
          <h4 className="text-2xl font-bold text-slate-900 leading-tight">{displayData.videoInfo.title}</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">👤 {displayData.videoInfo.channel}</span>
            <span className="flex items-center gap-2">👁️ {displayData.videoInfo.views}</span>
            <span className="flex items-center gap-2">📅 {displayData.videoInfo.date}</span>
          </div>
        </div>
      </div>

      {/* 2단: 댓글 감정 분석 차트 (가로 꽉 채우기) */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full min-h-[500px] flex flex-col">
        <h3 className="text-lg font-bold mb-8 text-slate-800">댓글 감정 분석</h3>
        <div className="flex-1 w-full">
          {/* 차트 컴포넌트 내부의 이중 박스를 제거했으므로 여기서 공간을 꽉 채웁니다 */}
          <SentimentChart data={displayData.sentiment} />
        </div>
      </div>

      {/* 3단: AI 감정별 요약 */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-purple-500">✨</span> AI 감정별 요약
        </h3>
        <SentimentSummary data={displayData.summary} />
      </div>

      {/* 4단: 댓글 봇 탐지 */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-blue-500">🤖</span> 댓글 봇 탐지 분석
        </h3>
        <BotDetection data={displayData.botDetection} />
      </div>

    </div>
  );
};

export default YoutubeResult;