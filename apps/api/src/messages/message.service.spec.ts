/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from "@nestjs/testing";
import { MessageService } from "./message.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Message, FunnelStatus } from "./message.entity";
import { Repository } from "typeorm";
import { CryptoService } from "../crypto/crypto.service";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { NotFoundException } from "@nestjs/common";

describe("MessageService", () => {
  let service: MessageService;
  let messageRepository: jest.Mocked<Repository<Message>>;
  let cryptoService: jest.Mocked<CryptoService>;
  let rabbitMQService: jest.Mocked<RabbitMQService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            encrypt: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get(getRepositoryToken(Message));
    cryptoService = module.get(CryptoService);
    rabbitMQService = module.get(RabbitMQService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createMessage", () => {
    it("should create and save an encrypted message and send it to RabbitMQ", async () => {
      const plainContent = "Test message";
      const encrypted = "encrypted_content";
      const message = { id: 1, content: encrypted };

      cryptoService.encrypt.mockReturnValue(encrypted);
      messageRepository.create.mockReturnValue(message as any);
      messageRepository.save.mockResolvedValue(message as any);

      const result = await service.createMessage(plainContent);

      expect(cryptoService.encrypt).toHaveBeenCalledWith(plainContent);
      expect(messageRepository.create).toHaveBeenCalledWith({
        content: encrypted,
      });
      expect(rabbitMQService.sendMessage).toHaveBeenCalledWith({
        content: plainContent,
        messageId: message.id,
      });
      expect(messageRepository.save).toHaveBeenCalledWith(message);
      expect(result).toEqual(message);
    });
  });

  describe("getMessage", () => {
    it("should return an existing message", async () => {
      const message = { id: 1, content: "..." } as Message;
      messageRepository.findOneBy.mockResolvedValue(message);

      const result = await service.getMessage(1);

      expect(result).toEqual(message);
    });

    it("should throw NotFoundException if the message is not found", async () => {
      messageRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getMessage(123)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateMessageClassification", () => {
    it("should update the message's funnel status", async () => {
      const message = {
        id: 1,
        content: "test content",
        status: "NEW_LEAD",
      } as Message;
      messageRepository.findOneBy.mockResolvedValue(message);
      messageRepository.save.mockResolvedValue(message);

      await service.updateMessageClassification(1, "QUALIFIED");

      expect(messageRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(message.status).toBe(FunnelStatus.QUALIFIED);
      expect(messageRepository.save).toHaveBeenCalledWith(message);
    });

    it("should throw NotFoundException if the message is not found", async () => {
      messageRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateMessageClassification(123, "CLOSED_LOST"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
