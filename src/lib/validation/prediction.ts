import { z } from "zod";

export const createPredictionSchema = z.object({
  title: z.string().min(1, { message: "Please enter a title" }),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().optional(),
  checkPrediction: z.date().optional(),
  possibleOutcomes: z.array(z.string().min(1, { message: "Please enter possible outcomes" })),
  userPrediction: z.string().min(1, { message: "Please make a prediction" }),
});

export type CreatePredictionSchema = z.infer<typeof createPredictionSchema>;
