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

type PredictionOpsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function PredictionOpsDialog({
  open,
  setOpen,
}: PredictionOpsDialogProps) {
  const router = useRouter();

  const form = useForm<CreatePredictionSchema>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      //
      // checkPrediction: new Date(),
      possibleOutcomes: "",
      userPrediction: "",
    },
  });

  async function onSubmit(input: CreatePredictionSchema) {
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Status Code: " + response.statusText);
      }
      form.reset();
      router.refresh();
      setOpen(false);
    } catch (error) {
      alert(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Add Prediction</DialogTitle>
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
                      placeholder="What is being predicted? (optional)"
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
            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
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
