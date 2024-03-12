import { z } from "zod";

export const createPredictionSchema = z.object({
  name: z.string().min(1, { message: "Please enter a prediction name" }),
  category: z.string().min(1, { message: "Please select a prediction category" }),
  description: z.string().optional(),
  checkPrediction: z.date().optional(),
  possibleOutcomes: z.string().optional(),
  userPrediction: z.string().min(1, { message: "Please make a prediction" }),
});

export type CreatePredictionSchema = z.infer<typeof createPredictionSchema>;
