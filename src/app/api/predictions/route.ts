import { predictionsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
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
      notes,
    } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForPrediction(
      name,
      category,
      description,
      possibleOutcomes,
      userPrediction,
      notes,
    );

    const prediction = await prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.create({
        data: {
          name,
          category,
          description,
          userId,
          checkPrediction,
          possibleOutcomes,
          userPrediction,
          notes: notes,
        },
      });

      await predictionsIndex.upsert([
        {
          id: prediction.id,
          values: embedding,
          metadata: {
            userId: userId,
          },
        },
      ]);

      return prediction;
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
      notes,
    } = parseResult.data;

    const prediction = await prisma.prediction.findUnique({ where: { id } });

    if (!prediction) {
      return Response.json({ error: "Prediction not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== prediction.userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForPrediction(
      name,
      category,
      description,
      possibleOutcomes,
      userPrediction,
      notes,
    )

    const updatedPrediction = await prisma.$transaction(async (tx) => {
      const updatedPrediction = await tx.prediction.update({
        where: { id },
        data: {
          name,
          category,
          description,
          checkPrediction,
          possibleOutcomes,
          userPrediction,
          notes,
        },
      });

      await predictionsIndex.upsert([
        {
          id: id,
          values: embedding,
          metadata: {
            userId
          }, 
        }
      ])
      
      return updatedPrediction;
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

    const {
      id,
      name,
      category,
      description,
      checkPrediction,
      possibleOutcomes,
      userPrediction,
      notes,
      outcome,
      isAccurate,
    } = parseResult.data;

    const prediction = await prisma.prediction.findUnique({ where: { id } });

    if (!prediction) {
      return Response.json({ error: "Prediction not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== prediction.userId) {
      return Response.json({ error: "Not authorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForPrediction(
      name,
      category,
      description,
      possibleOutcomes,
      userPrediction,
      notes,
      outcome,
      isAccurate,
    );

    const resolvedPrediction = await prisma.$transaction(async (tx) => {
      const resolvedPrediction = await tx.prediction.update({
        where: { id },
        data: {
          outcome,
          isAccurate,
          notes,
        },
      });

      await predictionsIndex.upsert([
        {
          id: id,
          values: embedding,
          metadata: {
            userId
          },
        }
      ])

      return resolvedPrediction;
    })

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
    
    await prisma.$transaction(async (tx) => {
      await tx.prediction.delete({
        where: { id },
      });

      await predictionsIndex.deleteOne(id);
    })

    return Response.json(
      { message: "Prediction deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function getEmbeddingForPrediction(
  name: string,
  category: string,
  description: string,
  possibleOutcomes: string | undefined,
  userPrediction: string,
  notes: string | undefined,
  outcome?: string | undefined,
  isAccurate?: boolean | undefined,
) {
  return getEmbedding(
    "User Prediction \n\nPrediction name: " +
      name +
      "\n\nCategory: " +
      category +
      "\n\nDescription: " +
      description +
      "\n\nPossible outcomes: " +
      (possibleOutcomes ?? "No possible outcomes provided") +
      "\n\nUser Prediction: " +
      userPrediction +
      "\n\nOutcome: " +
      (outcome ?? "The prediction has not been resolved yet") +
      "\n\nPrediction result: " +
      (isAccurate ?? "The prediction has not been resolved yet") +
      "\n\nNotes: " +
      (notes ?? "No notes provided"),
  );
}
