import{GoogleGenAI} from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export default async function handler(req, res){
    const allowedOrigin = "https://ssseen.github.io"
    
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if(req.method === "OPTIONS"){
        return res.status(200).end();
    }

   const {foodStyle, mainIngredient} = req.body || {};
   
    if (!foodStyle || !mainIngredient){
        return res .status(400).json({error: "음식 종류(foodStyle)와 메인 재료(mainIngredient)가 필요합니다."});
    }
    try{
        const prompt = `
        음식 종류: ${foodStyle}
        메인 재료: ${mainIngredient}

        이거에 맞는 점심메뉴 랜덤으로 하나만 추천해줘. 추천 메뉴 이름과 그 메뉴와 궁합이 좋은 메뉴 또는 음료를 추천해.
        결과는 이 형식으로 표시해
        메뉴 : [추천 메뉴 이름]
        베스트 궁합 : [궁합이 좋은 메뉴 또는 음료]
        `;
        
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                systemInstruction:
                "너는 여러나라의 음식을 잘 알아. 해당 음식 종류와 메인 재료에 걸맞는 점심으로 먹기 좋은 메뉴를 추천해줘. 다른건 필요없고 그냥 추천 메뉴 이름과 그 메뉴와 궁합이 좋은 메뉴 또는 음료만 말해. 만약 음식 종류나 메인 재료를 2개 이상씩 말하는 경우에도 해당하는 음식들 중 하나만 랜덤으로 추천해줘. 독특한 메뉴로 말해. 실제로 있는 음식을 말해."
            },
        });

        res.status(200).json({answer: result.text});
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Gemini API 오류 발생"});
    }
}