import React from 'react';
import { ThumbsUp, Bot } from 'lucide-react';

const CommentList = ({ comments }) => {
  // 감성 상태에 따른 테두리 색상 매핑
  const getBorderColor = (sentiment) => {
    switch (sentiment) {
      case '긍정': return 'border-green-500 bg-green-50/30';
      case '부정': return 'border-red-500 bg-red-50/30';
      case '중립': return 'border-gray-200 bg-white';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-4 mt-8">
      {comments.map((comment, index) => (
        <div
          key={comment.authorId + index}
          className={`relative p-5 rounded-xl border-2 transition-all hover:shadow-md ${getBorderColor(comment.sentiment)}`}
        >
          {/* 우측 상단: 좋아요 및 감성 점수 */}
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">{comment.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 ml-2 border-l pl-3 border-gray-300">
              <span className="text-xs font-bold text-gray-400"></span>
              <span className="text-sm font-mono font-semibold text-gray-600">
                {(comment.sentimentScore)*100}%
              </span>
            </div>
          </div>

          {/* 중앙: 댓글 본문 */}
          <div className="mb-6 pr-24">
            <p className="text-gray-800 leading-relaxed text-left">
              {comment.text}
            </p>
          </div>

          {/* 좌측 하단: 작성자 및 봇 정보 */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {comment.authorName}
              </span>
              
              {comment.is_bot && (
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                  <Bot className="w-3 h-3" />
                  <span>BOT {comment.botScore}</span>
                </div>
              )}
            </div>
            
            <div className={`text-xs font-bold px-2 py-1 rounded ${
              comment.sentiment === '긍정' ? 'text-green-600' : 
              comment.sentiment === '부정' ? 'text-red-600' : 'text-gray-400'
            }`}>
              {comment.sentiment}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;