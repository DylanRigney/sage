import { predictionsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await predictionsIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantPredictions = await prisma.prediction.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant predictions found: ", relevantPredictions);

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "You are an intelligent prediction tracking assistant. You answer the user's question based on their existing predictions, giving them helpful insights to improve their prediction skill and accuracy. " +
        "The relevant predictions for this query are:\n\n" +
        relevantPredictions
          .map(
            (prediction) =>
              `Prediction Name: ${prediction.name}\n\nCategory:\n${prediction.category}\n\nDescription:\n${prediction.description}\n\nPossible Outcomes:\n${prediction.possibleOutcomes}\n\nUser Prediction:\n${prediction.userPrediction}\n\nOutcome:\n${prediction.outcome}\n\nPrediction Result:\n${prediction.isAccurate}\n\nNotes:\n${prediction.notes}`,
          )
          .join("\n\n"),
    };

    // const content = 
    //     "You are an intelligent prediction tracking assistant. You answer the user's question based on their existing predictions, giving them helpful insights to improve their prediction skill and accuracy. " +
    //     "The relevant predictions for this query are:\n\n" +
    //     relevantPredictions
    //       .map(
    //         (prediction) =>
    //           `Prediction Name: ${prediction.name}\n\nCategory:\n${prediction.category}\n\nDescription:\n${prediction.description}\n\nPossible Outcomes:\n${prediction.possibleOutcomes}\n\nUser Prediction:\n${prediction.userPrediction}\n\nOutcome:\n${prediction.outcome}\n\nPrediction Result:\n${prediction.isAccurate}\n\nNotes:\n${prediction.notes}`,
    //       )
    //       .join("\n\n");
   
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true, 
      messages: [systemMessage, ...messagesTruncated],
    })
    // messages: [{ role: "system", content: systemMessage.content || ""}, ...messagesTruncated],

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
