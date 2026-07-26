import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [notifiedTimes, setNotifiedTimes] = useState([]);

  // 웹 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 타임테이블 기반 실시간 알림 스케줄러 (1초마다 체크)
  useEffect(() => {
    if (!result || !result.timetable) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5); // "HH:MM"

      result.timetable.forEach((item) => {
        if (item.time === currentHHMM && !notifiedTimes.includes(item.time)) {
          // 알림 실행
          triggerAlarm(item);
          setNotifiedTimes((prev) => [...prev, item.time]);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [result, notifiedTimes]);

  const triggerAlarm = (item) => {
    setActiveAlarm(item);

    // 브라우저 데스크톱 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 [마감 임박 긴급 알림]', {
        body: `${item.time} - ${item.action}\n${item.alarmMessage}`,
        icon: '/favicon.ico',
      });
    }

    // 경고음 재생
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio Context error:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task || !deadline) return alert('작업과 마감 기한을 모두 입력해 주세요!');

    setLoading(true);
    setResult(null);
    setNotifiedTimes([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, deadline }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      alert(`오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>DEADLINE EMERGENCY - 마감 임박 알람</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="container">
        {/* 상단 팝업 알람 Modal */}
        {activeAlarm && (
          <div className="alarm-modal-overlay">
            <div className="alarm-modal">
              <h2>🚨 긴급 실행 시각 ({activeAlarm.time})</h2>
              <p className="alarm-action">{activeAlarm.action}</p>
              <p className="alarm-msg">{activeAlarm.alarmMessage}</p>
              <button onClick={() => setActiveAlarm(null)}>지금 즉시 실행하기</button>
            </div>
          </div>
        )}

        <header className="header">
          <h1 className="title">⚡ DEADLINE EMERGENCY ⚡</h1>
          <p className="subtitle">더 이상 미룰 시간이 없습니다. AI가 초단위 타임테이블을 강제로 집행합니다.</p>
        </header>

        {/* 1. 상단 입력창 */}
        <section className="input-section">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-group">
              <label>미루고 있는 작업</label>
              <input
                type="text"
                placeholder="예: 보고서 작성, 코딩 과제 제출, 발표 자료 제작"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>최종 마감 시각</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '생존 계획 생성 중...' : '🔥 지금 당장 타임테이블 생성'}
            </button>
          </form>
        </section>

        {/* 2. 하단 2분할 출력창 */}
        <main className="output-section">
          {/* 왼쪽: 타임테이블 */}
          <div className="panel left-panel">
            <h2>⏳ 긴급 타임테이블</h2>
            {!result ? (
              <div className="placeholder">
                {loading ? 'AI가 피말리는 타임라인을 짜는 중입니다...' : '상단에 입력 후 버튼을 누르면 시간대별 계획이 표시됩니다.'}
              </div>
            ) : (
              <div className="timetable-list">
                {result.timetable?.map((item, idx) => (
                  <div key={idx} className="timetable-card">
                    <span className="time-badge">{item.time}</span>
                    <div className="card-content">
                      <div className="action">{item.action}</div>
                      <div className="alarm-preview">🔔 {item.alarmMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 텍스트 설명 */}
          <div className="panel right-panel">
            <h2>🚨 벼락치기 실행 지침</h2>
            {!result ? (
              <div className="placeholder">작업 설명과 돌파 전략이 이곳에 표시됩니다.</div>
            ) : (
              <div className="explanation-text">
                <p>{result.explanation}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
