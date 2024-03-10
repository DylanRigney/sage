"use client";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/SageLogo1.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddPredictionDialog from "@/components/addpredictiondialog";

export default function NavBar() {
  const [showAddPredictionDialog, setShowAddPredictionDialog] = useState(false);

  return (
    <>
      <div className="p-4 shadow ">
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/predictions" className="flex items-center gap-2">
            <Image src={logo} alt="Sage Logo" width={50} height={50} />
            <span className="font-bold">Sage</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddPredictionDialog(true)}>
              <Plus size={20} className="mr-2" />
              Create Prediction
            </Button>
            <div className="mx-3 h-12 border-l border-solid border-gray-300" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: { width: "2.75rem", height: "2.75rem" },
                },
              }}
            />
          </div>
        </div>
      </div>
      <AddPredictionDialog open={showAddPredictionDialog} setOpen={setShowAddPredictionDialog}></AddPredictionDialog>
    </>
  );
}
