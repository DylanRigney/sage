import logo from "@/assets/SageLogo1.png";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/predictions");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="Sage Logo" width={100} height={100}></Image>
        <span className="text-4xl font-bold tracking-tight lg:text-5xl">
          Sage
        </span>
      </div>
      <p className="max-w-prose text-center">
        An intelligent prediction creation app with AI integration, built with
        OpenAI, Pinecone, Next.js, Clerk, Shadcn UI, MongoDB and more.
      </p>
      <Button size="lg" asChild>
        <Link href={"/predictions"}>Open</Link>
      </Button>
    </main>
  );
}
