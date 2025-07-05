import { MessagePattern, Payload } from "@nestjs/microservices";
import { Controller, Logger } from "@nestjs/common";
import { MessageService } from "../message.service";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { FunnelStatus } from "../message.entity";

const ClassificationSchema = z.object({
  classification: z.enum([
    FunnelStatus.NEW_LEAD,
    FunnelStatus.QUALIFIED,
    FunnelStatus.CONTACTED,
    FunnelStatus.OPPORTUNITY,
    FunnelStatus.PROPOSAL_SENT,
    FunnelStatus.NEGOTIATION,
    FunnelStatus.CLOSED_WON,
    FunnelStatus.CLOSED_LOST,
  ]),
});

const CLASSIFICATION_PROMPT = (message: string) =>
  `
Classify the following message according to the stage of a sales funnel (CRM):

Available stages:
- NEW_LEAD
- QUALIFIED
- CONTACTED
- OPPORTUNITY
- PROPOSAL_SENT
- NEGOTIATION
- CLOSED_WON
- CLOSED_LOST

Return only the most appropriate stage in the "classification" field.

Message:
"""${message}"""
`.trim();

@Controller()
export class ClassifyMessageHandler {
  private readonly logger = new Logger(ClassifyMessageHandler.name);

  constructor(private readonly messagesService: MessageService) {}

  @MessagePattern("message_funnel_classifier")
  async handle(@Payload() payload: { content: string; messageId: number }) {
    const { content, messageId } = payload;

    if (!content || !messageId) {
      this.logger.warn("Invalid payload received", JSON.stringify(payload));
      return;
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        "GOOGLE_API_KEY not found. Falling back to OPPORTUNITY.",
      );
      await this.messagesService.updateMessageClassification(
        messageId,
        FunnelStatus.OPPORTUNITY,
      );
      return;
    }

    try {
      const google = createGoogleGenerativeAI({ apiKey });

      const result = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: ClassificationSchema,
        prompt: CLASSIFICATION_PROMPT(content),
      });

      await this.messagesService.updateMessageClassification(
        messageId,
        result.object.classification,
      );

      this.logger.log(
        `Message ${messageId} classified as ${result.object.classification}`,
      );
    } catch (error) {
      this.logger.error(`Failed to classify message ${messageId}`, error);
      await this.messagesService.updateMessageClassification(
        messageId,
        FunnelStatus.OPPORTUNITY,
      );
    }
  }
}
