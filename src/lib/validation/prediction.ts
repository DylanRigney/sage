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

export const updatePredictionSchema = createPredictionSchema.extend({
  id: z.string().min(1),
})


export const deletePredictionSchema = z.object({
  id: z.string().min(1),
})

export const resolvePredictionSchema = z.object({
  id: z.string().min(1),
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
  resultNotes: z.string().optional(),
})