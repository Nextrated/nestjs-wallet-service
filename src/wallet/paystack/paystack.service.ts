import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly axiosInstance: AxiosInstance;
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not set in environment');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });
  }


  verifySignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;

    const computed = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');

    return computed === signature;
  }
}
