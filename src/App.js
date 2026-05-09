import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import GeneralResult from './components/GeneralResult';
import YoutubeResult from './components/YoutubeResult';
import AdminResult from './components/AdminResultList';
import logoImg from './sources/image.png';
import mainImg from './sources/newslensLogo.png';
import axios from 'axios';

const BASE_URL = 'http://54.180.222.248:8080';

function App() {
  const [isSearched, setIsSearched] = useState(false);
  const [inputText, setInputText] = useState('');
  const [fixedInput, setFixedInput] = useState('');
  const [activeTab, setActiveTab] = useState('텍스트');
  const [renderedTab, setRenderedTab] = useState('텍스트');
  const [selectedImage, setSelectedImage] = useState(null); // 업로드된 이미지 상태
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [apiData, setApiData] = useState(null); // 백엔드에서 받은 데이터

  // 타입별 플레이스홀더
  const placeholders = {
    '텍스트': '텍스트를 입력하세요..',
    '이미지': '이미지를 드래그하여 업로드하세요..',
    'URL': 'URL을 입력하세요..',
    'Youtube': '유튜브 영상 링크를 입력하세요..'
  };

  useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight;

    if (isSearched && !isFocused) {
      textareaRef.current.style.height = '24px';
    } else {
      const maxHeight = isSearched ? 120 : 360;
      textareaRef.current.style.height = scrollHeight > maxHeight ? `${maxHeight}px` : `${scrollHeight}px`;
    }
  }
}, [inputText, isSearched, isFocused]);

const tabtoInputType = {
  '텍스트' : 'TEXT',
  '이미지' : 'IMAGE',
  'URL' : 'URL'
};

const handleSearch = async () => {
  if (activeTab === '텍스트' && inputText.trim().length < 50) {
    alert("텍스트는 50글자 이상 입력해주세요.");
    return;
  }
  if (activeTab !== '이미지' && !inputText.trim()) {
    alert("내용을 입력해주세요!");
    return;
  }
  if (activeTab === '이미지' && !selectedImage) {
    alert("이미지를 업로드해주세요!");
    return;
  }

  setRenderedTab(activeTab);
  // 기존 결과 초기화 (재검색 시 결과 섹션 리셋)
  setIsSearched(false);
  setApiData(null);

  // 다음 tick에 다시 true로 설정해 컴포넌트 리마운트 유도
  await new Promise(resolve => setTimeout(resolve, 0));
  setIsSearched(true);
  setFixedInput(inputText);

  try {
    if (activeTab === 'Youtube') {
      // Youtube는 ngrok 서버로
      setIsSearched(true);
      const res = await axios.post(`${BASE_URL}/api/youtube/analysis`, {
        youtubeUrl : inputText
      });
      setApiData(res.data.data.requestId);
    } else {
      // 텍스트/이미지/URL은 EC2 백엔드로
      let res;
      if (activeTab === '텍스트') {
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/text`, { inputType : tabtoInputType[activeTab], text: inputText });
      } else if (activeTab === 'URL') {
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/url`, { inputType : tabtoInputType[activeTab], url: inputText });
      } else if (activeTab === '이미지' && selectedImage) {
        const formData = new FormData();
        formData.append('inputType', tabtoInputType[activeTab]);
        formData.append('image', fileInputRef.current.files[0]);
        res = await axios.post(`${BASE_URL}/api/v1/articles/analyze/image`, formData);
      }

      const articleId = res.data.data.articleId;
      setIsSearched(true);
      //await pollStatus(articleId);
      setApiData(articleId); // articleId를 GeneralResult로 전달
    }
  } catch (error) {
    console.error("데이터 요청 중 에러 발생:", error);
    setApiData({ error: "데이터를 불러오는데 실패했습니다." });
  }
};

  // 이미지 업로드
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("이미지 파일은 50MB 이하만 업로드 가능합니다.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdminList = () => {
    setRenderedTab('Admin');
    setIsSearched(true);
  }

  const tabs = ['텍스트', '이미지', 'URL', 'Youtube'];

  return (
    <div className={`container ${isSearched ? 'searched' : 'home'}`}>
      <div className={`fixed z-50 cursor-pointer flex items-center transition-all duration-500 ${
            isSearched ? 'top-2 left-4'           // 검색 후: 왼쪽 상단 고정
                      : 'top-2 left-4'          // 검색 전: 홈 화면 왼쪽 상단 (원하는 위치로 조절 가능)
            }`} 
            onClick={handleAdminList}
      >
        <img src={logoImg} alt="Logo" className="h-16 mr-2" /> 

      </div>
    
      {/* 검색 바 영역: 상단에 고정되거나 홈 중앙에 위치 */}
      <header className={"search-wrapper"}>
        <div className="logo-container" onClick={() => window.location.reload()} style={{cursor:'pointer'}}>
          <img src={mainImg} alt="Is It Real Logo" className="logo-img" />
        </div>

          <div className="mb-8 cursor-pointer" onClick={() => window.location.reload()}>
            {isSearched ? null : (
              <span className='logo-text-large'>
                균형잡힌 시각,
                AI 분석으로 객관적인 시각을 더하세요.
              </span>
            )}
          </div>

          <div className="input-container">
            {(activeTab === '이미지' || selectedImage) && (
              <div className="image-upload-section">
                {!selectedImage ? (
                  <div className="upload-placeholder" onClick={() => fileInputRef.current.click()}>
                    <span className="text-slate-400">+ 클릭하여 이미지 업로드</span>
                  </div>
                ) : (
                  <div className="image-preview">
                    <img src={selectedImage} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    <button className="remove-img" onClick={removeImage}>✕</button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows="1"
              placeholder={placeholders[activeTab]}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            <div className="input-footer">
              <div className="tab-group">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={
                      activeTab === tab
                        ? tab === 'Youtube' ? 'youtube-active' : 'active'
                        : ''
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                className={`search-submit-btn ${activeTab === 'Youtube' ? 'youtube' : ''}`}
                onClick={handleSearch}
              >
                <span className="magnifier">🔍</span>
              </button>
            </div>
          </div>
      </header>

      
      {isSearched && (
        <main className="results-section">
          {renderedTab === 'Youtube' ? (
            <YoutubeResult result_Id={apiData} youtubeUrl={fixedInput} />
          ) : renderedTab === 'Admin' ? (
            <AdminResult />
          ) : (
            <GeneralResult result_Id={apiData} inputText={fixedInput} />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
