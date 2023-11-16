import {
  TextAnalysisClient,
  AzureKeyCredential,
} from "@azure/ai-language-text";
import {
  SemRet,
  TextAnalysis_EndPoint,
  TextAnalysis_Key,
} from "../_const/chatconstants";

const endPoint = TextAnalysis_EndPoint;
const apiKey = TextAnalysis_Key;

export const sentimentAnalysis = async ({
  chatlog,
}: {
  chatlog: string;
}): Promise<SemRet> => {
  const mathRound = (num: number, rnd: number): number => {
    return Math.floor(num * Math.pow(10, rnd)) / Math.pow(10, rnd);
  };

  let json: string = "";
  let caption: string = "";
  let negative: number = 0;
  let neutral: number = 0;
  let positive: number = 0;

  const client = new TextAnalysisClient(
    endPoint as string,
    new AzureKeyCredential(apiKey as string)
  );
  const documents = [chatlog];
  const results = await client.analyze("SentimentAnalysis", documents);
  if (results) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result.error) {
        for (const { sentiment, confidenceScores, text } of result.sentences) {
          negative = mathRound(negative + confidenceScores.negative, 2);
          neutral = mathRound((neutral + confidenceScores.neutral), 2);
          positive = mathRound((positive + confidenceScores.positive), 2);
          json = JSON.stringify(result);
        }
      }
    }
    negative = negative>0 ? mathRound(negative*2,2) : negative
    neutral = neutral>0 ? mathRound(neutral/2,2) : neutral
    positive = positive>0 ? mathRound(positive/2,2) : positive
    if (positive > neutral && positive > negative) {
      caption = "positive";
    } else {
      if (negative > neutral && negative > positive) {
        caption = "negative";
      } else {
        caption = "neutral";
      }
    }
  }

  console.log(
    chatlog +
      "\n" +
      "感情=" +
      caption +
      "\n" +
      ",negative=" +
      negative +
      ",neutral=" +
      neutral +
      ",positive=" +
      positive
  );

  return {
    json,
    caption,
    negative,
    neutral,
    positive,
  };
};
