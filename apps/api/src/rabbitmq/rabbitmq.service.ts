import { Injectable } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        consumerTag: "FUNNEL",
        urls: [process.env.RABBITMQ_URL!],
        queue: "message_funnel_queue",
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async sendMessage(message: { messageId: number; content: string }) {
    await this.client.connect();
    return this.client.emit("message_funnel_classifier", message);
  }
}
