export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { task, deadline } = req.body;

  if (!task || !deadline) {
    return res.status(400).json({ error: '작업 내용과 마감 시간을 모두 입력해 주세요.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
  }

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const prompt = `
[긴급 임무 명령]
사용자가 지금 미루고 있는 작업과 최종 마감 시간이 설정되었습니다.
- 현재 시간: ${now}
- 미루고 있는 작업: "${task}"
- 최종 마감 시간: "${deadline}"

이 작업을 기한 내 완성하기 위해 지금 당장 실행해야 하는 **단계별 벼락치기 타임테이블**과 **실행 지침 설명**을 작성해 주세요.
분위기는 매우 긴박하고, 조급하며, 지금 당장 시작하도록 강력하게 촉구하는 톤이어야 합니다.

응답은 반드시 아래 JSON 구조로만 출력하세요. 마크다운(\`\`\`json 등)은 절대 포함하지 마세요.

{
  "timetable": [
    {
      "time": "HH:MM",
      "action": "지금 당장 실행해야 할 핵심 행동 요약 ( short & urgent )",
      "alarmMessage": "해당 시간에 울릴 위기감 넘치는 알림 메시지"
    }
  ],
  "explanation": "전체적인 타임라인 진행 전략과 당장 움직여야 하는 이유에 대한 텍스트 설명 (보라색/긴박한 언어 사용)"
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Gemini API 호출에 실패했습니다.');
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const parsedData = JSON.parse(rawText);
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || '서버 오류가 발생했습니다.' });
  }
}
