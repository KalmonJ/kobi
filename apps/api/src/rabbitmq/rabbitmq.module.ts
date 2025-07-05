import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RabbitMQService } from "./rabbitmq.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "FUNNEL_SERVICE",
        transport: Transport.RMQ,
        options: {
          consumerTag: "FUNNEL",
          urls: [process.env.RABBITMQ_URL!],
          queue: "message_funnel_queue",
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
