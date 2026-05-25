import React , {useEffect, useState} from 'react';
import { SentimentChart } from "./youtube-analysis/SentimentChart";
import { BotDetection } from "./youtube-analysis/BotDetection";
import { SentimentSummary } from "./youtube-analysis/SentimentSummary";
import CommentList from "./youtube-analysis/CommentList";
import axios from 'axios';
import { BeatLoader } from "react-spinners";

const BASE_URL = 'http://54.180.222.248:8080';

const YoutubeResult = ({ result_Id, youtubeUrl }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayData = data && !data.error ? {
    videoInfo: {
      thumbnail: null,
      title: data.result.videoTitle,
      channel: data.result.channelName,
      views: data.result.viewCount,
      date: data.result.publishedAt
    },
    sentiment: {
      positive: data.result.positive,
      neutral: data.result.neutral,
      negative: data.result.negative,
      totalComments: data.result.total,
      suspiciousBots: data.result.botCount,
      botPercentage: data.result.botPct
    },
    botDetection: {
      totalComments: data.result.total,
      suspiciousBots: data.result.botCount,
      botPercentage: data.result.botPct
    },
    summary: {
      positive: data.result.positiveSummary,
      neutral:  data.result.negativeSummary,
      negative:  data.result.neutralSummary
    },
    comments : data.result.comments
  } : {
    videoInfo: {  //mockData
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
    comments : [
      {
        "text": "충격적인 인트로 ㅋㅋㅋㅋㅋㅋ",
        "likes": 712,
        "author_name": "@콩_ẞeans",
        "author_id": "UConUZw1hmZkcM17XhMtn3_w",
        "sentiment": "긍정",
        "sentiment_score": 0.95,
        "bot_score": 0,
        "is_bot": false,
        "bot_reasons": []
      },
      {
        "text": "아니 진짜 보스랑 소니 둘 다 살 가격은 에바긴 해 ㅋㅋㅋㅋ",
        "likes": 83,
        "author_name": "@소원이있어요",
        "author_id": "UCgx_q5VdNmjajBYi-iX-wPA",
        "sentiment": "부정",
        "sentiment_score": 0.2,
        "bot_score": 0,
        "is_bot": false,
        "bot_reasons": []
      },
      {
        "text": "영상 요약: 차이 없다",
        "likes": 475,
        "author_name": "@파란하늘-g3e",
        "author_id": "UCmz57WLTWfPWByuGOZJMgBA",
        "sentiment": "중립",
        "sentiment_score": 0.5,
        "bot_score": 75,
        "is_bot": true,
        "bot_reasons": []
      }
    ]
  };

  useEffect(() => {
    let timer;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/youtube/analysis/${result_Id}`);
        console.log(response.data);
        if (response.data.data.status === "PROCESSING") {
          console.log("분석 진행 중 (3초 간격)");
          timer = setTimeout(fetchData, 3000);
        } else if(response.data.data.status === "FAILED") {
          setError(response.data.data.errorMessage);
          console.error("1데이터를 불러오는데 실패했습니다:", error);
          setLoading(false);
        } else {
          setData(response.data.data);
          setLoading(false);
        }
      } catch (e) {
        if (e.response && e.response.status === 404) {
          console.log("데이터를 찾을 수 없음 (3초 뒤 재시도)");
          timer = setTimeout(fetchData, 3000);
        } else {
          setError(e);
          console.error("2데이터를 불러오는데 실패했습니다:", e);
          setLoading(false);
        } 
      }
    };
    timer = setTimeout(fetchData, 8000);

    return () => {
      if (timer) clearTimeout(timer);
    }
  }, [result_Id]);

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div><BeatLoader /></div>
        <p>데이터를 분석하고 있습니다. 잠시만 기다려 주세요...</p>
      </div>
    );
  }
  if (error) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</div>;
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = String(url).match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(youtubeUrl);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-6 animate-in fade-in duration-700">
      
      {/* 1단: 영상 정보 (가로로 긴 카드 형태) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-2/5 aspect-video bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full object-cover"
          ></iframe>
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

      {/* 댓글 감정 분석 차트 (가로 꽉 채우기) */}
      <div className="w-full">
        <h3 className="text-lg font-bold mb-4 text-slate-800">댓글 감정 분석</h3>
        <SentimentChart data={displayData.sentiment} />
      </div>

      {/* 댓글 봇 탐지 */}
      {/* <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-blue-500">🤖</span> 댓글 봇 탐지 분석
        </h3>
        <BotDetection data={displayData.botDetection} />
      </div> */}

      {/* AI 감정별 요약 */}
      <SentimentSummary data={displayData.summary} />

      <CommentList comments={displayData.comments} />
    </div>
  );
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontSize: '1.2rem'
};

export default YoutubeResult;