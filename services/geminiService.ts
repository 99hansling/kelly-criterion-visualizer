import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real production environment, handle API keys securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSimulation = async (
  winRate: number,
  odds: number,
  kellyFraction: number
): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    我正在运行一个凯利公式（Kelly Criterion）的投资模拟。
    
    参数如下：
    - 胜率 (Win Rate): ${(winRate * 100).toFixed(1)}%
    - 小数赔率 (Decimal Odds): ${odds.toFixed(2)} (净赔率 b = ${(odds - 1).toFixed(2)})
    - 计算出的凯利比例 (f*): ${(kellyFraction * 100).toFixed(2)}%
    
    任务：
    请用**中文**为学习风险管理的用户提供一段简明扼要的分析（3句话左右）。
    1. 这个游戏值得玩吗？(检查数学期望/优势 Edge 是否 > 0)。
    2. 如果凯利比例为正，解释为什么按照这个特定比例下注比“全仓（All In）”更好。
    3. 如果凯利比例为 0 或负数，严厉警告用户为什么不应该玩。
    
    语调：教育性、金融专业但通俗易懂。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "暂时无法生成分析。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "分析服务暂时不可用 (API Error)。";
  }
};