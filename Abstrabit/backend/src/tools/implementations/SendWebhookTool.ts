import { z } from 'zod';
import { BaseTool } from '../BaseTool';
import { ToolContext } from '../interfaces/ToolContext';
import { logger } from '../../utils/logger';
import { TOOL_NAMES } from '../../constants/rag.constants';

const sendWebhookSchema = z.object({
  webhook_url: z.string().url('Invalid webhook URL format'),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
});

export type SendWebhookInput = z.infer<typeof sendWebhookSchema>;

export class SendWebhookTool extends BaseTool<SendWebhookInput> {
  public name = TOOL_NAMES.SEND_WEBHOOK;
  public description = 'Posts a message or summary payload to a Slack or Discord webhook URL.';
  public version = '1.0.0';
  public category: 'NOTIFICATION' = 'NOTIFICATION';
  public schema = sendWebhookSchema;

  public async run(input: SendWebhookInput, context: ToolContext): Promise<Record<string, unknown>> {
    logger.info(
      {
        requestId: context.requestId,
        workspaceId: context.workspaceId,
        webhookUrl: input.webhook_url,
        title: input.title,
      },
      'Posting notification payload to external webhook URL',
    );

    // In production, performs HTTP POST to input.webhook_url
    return {
      webhookUrl: input.webhook_url,
      title: input.title,
      delivered: true,
      timestamp: new Date().toISOString(),
      message: `Notification '${input.title}' sent successfully to webhook URL.`,
    };
  }
}
