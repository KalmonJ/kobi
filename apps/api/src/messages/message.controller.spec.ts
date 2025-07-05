/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from "@nestjs/testing";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

describe("MessageController", () => {
  let controller: MessageController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            createMessage: jest.fn().mockResolvedValue({
              id: 1,
              content: "Test content",
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a new message", async () => {
    const body = { content: "Test content" };

    const result = await controller.createMessage(body);

    expect(service.createMessage).toHaveBeenCalledWith("Test content");
    expect(result).toEqual({
      id: 1,
      content: "Test content",
    });
  });
});
