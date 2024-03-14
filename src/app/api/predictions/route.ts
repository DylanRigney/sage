import prisma from "@/lib/db/prisma";
import {
  createPredictionSchema,
  deletePredictionSchema,
  resolvePredictionSchema,
  updatePredictionSchema,
} from "@/lib/validation/prediction";
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updatePredictionSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const {
      id,
      name,
      category,
      description,
      checkPrediction,
      possibleOutcomes,
      userPrediction,
    } = parseResult.data;

    const prediction = await prisma.prediction.findUnique({ where: { id } });

    if (!prediction) {
      return Response.json({ error: "Prediction not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== prediction.userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const updatedPrediction = await prisma.prediction.update({
      where: { id },
      data: {
        name,
        category,
        description,
        checkPrediction,
        possibleOutcomes,
        userPrediction,
      },
    });

    return Response.json({ prediction: updatedPrediction }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const parseResult = resolvePredictionSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, isAccurate, resultNotes } = parseResult.data;

    const prediction = await prisma.prediction.findUnique({ where: { id } });

    if (!prediction) {
      return Response.json({ error: "Prediction not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== prediction.userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const resolvedPrediction = await prisma.prediction.update({
      where: { id },
      data: {
        isAccurate,
        resultNotes,
      },
    });

    return Response.json({ prediction: resolvedPrediction }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deletePredictionSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const prediction = await prisma.prediction.findUnique({ where: { id } });

    if (!prediction) {
      return Response.json({ error: "Prediction not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== prediction.userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    await prisma.prediction.delete({
      where: { id },
    });

    return Response.json({message: "Prediction deleted successfully"},{ status: 200 });
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
