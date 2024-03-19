import {
  CreatePredictionSchema,
  createPredictionSchema,
} from "@/lib/validation/prediction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { useRouter } from "next/navigation";
import { Prediction } from "@prisma/client";
import { useState } from "react";

type PredictionOpsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  predictionToEdit?: Prediction;
};

export default function PredictionOpsDialog({
  open,
  setOpen,
  predictionToEdit,
}: PredictionOpsDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const router = useRouter();

  const form = useForm<CreatePredictionSchema>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: {
      name: predictionToEdit?.name ?? "",
      category: predictionToEdit?.category ?? "",
      description: predictionToEdit?.description ?? "",
      // Add date once you add reminder feature
      // checkPrediction: new Date(),
      possibleOutcomes: predictionToEdit?.possibleOutcomes ?? "",
      userPrediction: predictionToEdit?.userPrediction ?? "",
    },
  });

  async function onSubmit(input: CreatePredictionSchema) {
    try {
      if (predictionToEdit) {
        const response = await fetch("/api/predictions", {
          method: "PUT",
          body: JSON.stringify({ id: predictionToEdit.id, ...input }),
        });
        if (!response.ok) {
          throw new Error("Status Code: " + response.status);
        }
      } else {
        const response = await fetch("/api/predictions", {
          method: "POST",
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error("Status Code: " + response.status);
        }
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function deletePrediction() {
    if (!predictionToEdit) {
      return;
    }
    setDeleteInProgress(true);
    try {
      const response = await fetch("api/predictions", {
        method: "DELETE",
        body: JSON.stringify({ id: predictionToEdit.id }),
      });
      if (!response.ok) {
        throw new Error("Status Code: " + response.status);
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">{predictionToEdit ? "Edit Prediction" : "Create Prediction"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name={"name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prediction name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"category"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prediction category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"description"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is being predicted?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"possibleOutcomes"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Possible outcomes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="List the outcomes or possible results (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"userPrediction"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your prediction</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What do you think will happen?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {predictionToEdit && (
                <LoadingButton
                  variant="destructive"
                  type="button"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deletePrediction}
                >
                  Delete
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
