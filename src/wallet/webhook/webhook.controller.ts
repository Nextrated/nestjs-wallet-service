import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PaystackService } from '../paystack/paystack.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Paystack Webhook endpoint
   * Verifies the signature header before processing events
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // Verify Paystack webhook signature
    if (!this.paystackService.verifySignature(JSON.stringify(body), signature)) {
      console.warn('Invalid Paystack signature');
      return { status: false };
    }

    const event = body.event;
    const eventData = body.data;

    try {
      switch (event) {
        case 'charge.success':
          await this.webhookService.handleChargeSuccess(eventData);
          break;

        // You can handle more events here if needed
        default:
          console.log(`Unhandled event type: ${event}`);
          break;
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      // Errors do not block Paystack from retrying
    }

    return { status: true };
  }
}
