import prisma from "@/lib/db/prisma";
import { createPredictionSchema } from "@/lib/validation/prediction";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createPredictionSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      name,
      category,
      description,
      checkPrediction,
      possibleOutcomes,
      userPrediction,
    } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const prediction = await prisma.prediction.create({
      data: {
        name,
        category,
        description,
        userId,
        checkPrediction,
        possibleOutcomes,
        userPrediction,
      },
    });

    return Response.json({ prediction }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// import { experimental_AssistantResponse } from "ai";
// import OpenAI from "openai";
// import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
// import { threadId } from "worker_threads";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || "",
// });

// export const runtime = "edge";

// export async function POST(req: Request) {

//   const input: {
//     threadId: string | null;
//     message: string;
//   } = await req.json();

//   // Create a thread if needed
//   const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;

//   // Add a message to the thread
//   const createdMessage = await openai.beta.threads.messages.create(threadId, {
//     role: "user",
//     content: input.message,
//   });

//   return experimental_AssistantResponse(
//     { threadId, messageId: createdMessage.id },
//     async ({ threadId, sendMessage }) => {
//       // Run the assistant on the thread
//     },
//   );
// }
