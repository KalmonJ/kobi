import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./message.entity";
import { MessageService } from "./message.service";
import { ClassifyMessageHandler } from "./handlers/classify-message-handler";
import { CryptoModule } from "src/crypto/crypto.module";
import { RabbitMQModule } from "src/rabbitmq/rabbitmq.module";
import { MessageController } from "./message.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Message]), CryptoModule, RabbitMQModule],
  providers: [MessageService],
  controllers: [MessageController, ClassifyMessageHandler],
  exports: [MessageService],
})
export class MessagesModule {}
