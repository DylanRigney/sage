import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sage - Predictions",
};

export default async function PredictionsPage() {
  const { userId } = auth();

  if (!userId) {
    throw Error("User not defined");
  }

  const allPredictions = await prisma.prediction.findMany({
    where: {
      userId,
    },
  });

  return <div>{JSON.stringify(allPredictions)}</div>;
}
