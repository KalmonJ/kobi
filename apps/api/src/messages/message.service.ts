import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FunnelStage, FunnelStatus, Message } from "./message.entity";
import { CryptoService } from "src/crypto/crypto.service";
import { RabbitMQService } from "src/rabbitmq/rabbitmq.service";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly cryptoService: CryptoService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async createMessage(content: string): Promise<Message> {
    const encryptedContent = this.cryptoService.encrypt(content);
    const message = this.messageRepository.create({
      content: encryptedContent,
    });
    await this.rabbitMQService.sendMessage({
      content,
      messageId: message.id,
    });
    return this.messageRepository.save(message);
  }

  async getMessage(id: number): Promise<Message> {
    const message = await this.messageRepository.findOneBy({
      id,
    });
    if (!message) throw new NotFoundException("Mensagem não encontrada");
    return message;
  }

  async updateMessageClassification(id: number, classification: FunnelStage) {
    const message = await this.messageRepository.findOneBy({
      id,
    });
    if (!message) throw new NotFoundException("Message not found");
    message.status = FunnelStatus[classification];
    await this.messageRepository.save(message);
  }
}
