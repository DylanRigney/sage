import { z } from "zod";

export const createPredictionSchema = z.object({
  name: z.string().min(1, { message: "Please enter a prediction name" }),
  category: z.string().min(1, { message: "Please select a prediction category" }),
  description: z.string().min(1, { message: "Please describe what is being predicted" }),
  checkPrediction: z.date().optional(),
  possibleOutcomes: z.string().optional(),
  userPrediction: z.string().min(1, { message: "Please make a prediction" }),
  notes: z.string().optional(),
});

export type CreatePredictionSchema = z.infer<typeof createPredictionSchema>;

export const updatePredictionSchema = createPredictionSchema.extend({
  id: z.string().min(1),
})

export const resolvePredictionSchema = updatePredictionSchema.extend({
  isAccurate: z.boolean(),
  // isAccurate: z.string().transform(value => {
  //   if (value === "true") {
  //       return true;
  //   } else if (value === "false") {
  //       return false;
  //   } else {
  //       throw new Error("Invalid boolean value");
  //   }
  // }),
  outcome: z.string().optional(),
});

export const deletePredictionSchema = z.object({
  id: z.string().min(1),
})
