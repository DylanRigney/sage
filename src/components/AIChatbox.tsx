import { Message, experimental_useAssistant as useAssistant } from "ai/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Bot, CircleUserRound, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type AIChatBoxProps = {
  open: boolean;
  onClose: () => void;
};

const roleToColorMap: Record<Message["role"], string> = {
  system: "red",
  user: "black",
  function: "blue",
  tool: "purple",
  assistant: "black",
  data: "orange",
};

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const { status, messages, input, submitMessage, handleInputChange, error, } =
    useAssistant({
      api: "/api/predictions",
    });

  // When status changes to accepting messages, focus the input:
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  })

  useEffect(() => {
    if (status === "awaiting_message" || open ) {
      inputRef.current?.focus();
    }
  }, [status, open]);

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[550px] p-1 xl:right-36",
        open ? "fixed" : "hidden"
      )}
    >
      {error != null && (
        <div className="relative bg-red-500 text-white px-6 py-4 rounded-md">
          <span className="block sm:inline">
            Error: {(error as any).toString()}
          </span>
        </div>
      )}

      <button onClick={onClose} className="mb-1 ms-auto block">
        <XCircle size={30} />
      </button>

      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        <div className="h-full mt-3 px-3 overflow-y-auto" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}
        {/* loading indicator */}
          {status === "in_progress" && (
            <div className="flex alignItems-center">
              <div className=" h-14 w-full max-w-md p-2 ml-4 mb-8 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse" />
              <Bot size={30} className="h-14 ml-2 shrink-0" />
            </div>
          )}
          { !error && messages.length === 0 && (
              <div className="flex items-center h-full justify-center gap-3">
                <Bot size={30}/>
                An AI designed to help you get to know Dylan
              </div>
          )

          }
        </div>

        <form onSubmit={submitMessage} className="m-3 flex gap-1 ">
          {/* <Button variant="outline" className="shrink-0 h-11 shadow-xl rounded-md" title="Clear chat" size="icon" type="button" onClick={() => messages = []}><Trash/></Button> */}
          <Input
            ref={inputRef}
            disabled={status !== "awaiting_message"}
            className="shadow-xl h-11 text-sm "
            value={input}
            placeholder="What would you like to know?"
            onChange={handleInputChange}
          ></Input>
          <Button
            className="rounded-md text-md h-11 shadow-xl"
            type="submit"
            disabled={status !== "awaiting_message"}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * Renders a chat message component based on the provided message object.
 *
 * @param {Message} message - the message object containing role, content, and data
 * @return {JSX.Element} the rendered chat message component
 */
function ChatMessage({
  message: { role, content, data },
}: {
  message: Message;
}) {
  const isAIMessage = role === "data" || role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAIMessage ? "justify-end ms-5" : "me-5justify-start"
      )}
    >
      {!isAIMessage && <CircleUserRound size={30} className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          !isAIMessage ? "bg-background" : "bg-primary/90 text-primary-foreground"
        )}
      >
        {content}
      </p>
      {isAIMessage && <Bot size={30} className="ml-2 shrink-0" />}
    </div>
  );
}
