import { Prediction as PredictionModel } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Heading, Heading1 } from "lucide-react";

type PredictionProps = {
  prediction: PredictionModel;
};

export default function Prediction({ prediction }: PredictionProps) {
  const wasUpdated = prediction.updatedAt > prediction.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? prediction.updatedAt : prediction.createdAt
  ).toDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="border-b pb-2 text-center">
          {prediction.name}
        </CardTitle>
        <CardDescription className="pt-1">
          {createdUpdatedAtTimestamp}
          {wasUpdated && " (Updated)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-2 whitespace-break-spaces">
          Category:      {prediction.category}
        </p>
        <p className="mb-2 whitespace-break-spaces">Description:  {prediction.description}</p>
        <p className="whitespace-break-spaces">
          Prediction:    {prediction.userPrediction}
        </p>
      </CardContent>
    </Card>
  );
}
