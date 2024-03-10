import {
  CreatePredictionSchema,
  createPredictionSchema,
} from "@/lib/validation/prediction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

type AddNoteDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddPredictionDialog({
  open,
  setOpen,
}: AddNoteDialogProps) {
  const form = useForm<CreatePredictionSchema>({
    resolver: zodResolver(createPredictionSchema),
  });

  async function onSubmit(input: CreatePredictionSchema) {
    alert(input);
  }

  return (
    
    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Prediction</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
