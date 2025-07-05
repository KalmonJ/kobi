"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, Send } from "lucide-react";
import { FormEvent, useTransition } from "react";
import { sendMessage } from "./_actions";
import { toast } from "sonner";

export default function ChatPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content");

    if (!content) return;

    startTransition(async () => {
      const result = await sendMessage(content.toString());

      if (!result.success) {
        toast.error("Falha ao enviar mensagem");
        return;
      }

      toast.success("Sucesso ao enviar mensagem");
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 max-w-[600px]"
      >
        <div className="flex items-baseline gap-4">
          <Textarea name="content" placeholder="Enviar uma mensagem" />
          <Button disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>
                Send <Send />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
