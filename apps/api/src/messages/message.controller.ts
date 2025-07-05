import { Controller, Post, Body } from "@nestjs/common";
import { MessageService } from "./message.service";

@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  createMessage(@Body() { content }: { content: string }) {
    return this.messageService.createMessage(content);
  }
}
