import Prediction from "@/components/prediction";
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  ">
      {allPredictions.map((prediction) => (
        <Prediction key={prediction.id} prediction={prediction} />
      ))}
      {allPredictions.length === 0 && (
        <div className="col-span-full text-center mt-12">You haven&apos;t made any predictions yet</div>
      )}
    </div>
  );
}
