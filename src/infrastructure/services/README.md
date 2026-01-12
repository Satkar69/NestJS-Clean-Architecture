# External Services

This directory contains adapters for integrating with third-party services and APIs.

## Use Case

External services are used to:

- Integrate with third-party APIs (payment gateways, email services, etc.)
- Implement external service ports from the application layer
- Handle external communication
- Abstract external dependencies

## Guidelines

- **Implement Ports**: Implement interfaces defined in `core/application/ports/out`
- **Error Handling**: Handle external service failures gracefully
- **Retry Logic**: Implement retry mechanisms for transient failures
- **Configuration**: Use environment variables for API keys and endpoints
- **Logging**: Log external API calls for debugging

## Example - Email Service

```typescript
// email.service.port.ts (in core/application/ports/out)
export interface EmailServicePort {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
```

```typescript
// sendgrid-email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { EmailServicePort } from '../../core/application/ports/out/email.service.port';

@Injectable()
export class SendGridEmailService implements EmailServicePort {
  private readonly logger = new Logger(SendGridEmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: process.env.SENDER_EMAIL,
        subject,
        html: body,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Our Platform!';
    const body = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our platform.</p>
    `;

    await this.sendEmail(email, subject, body);
  }
}
```

## Example - Payment Service

```typescript
// payment.service.port.ts (in core/application/ports/out)
export interface PaymentServicePort {
  processPayment(
    amount: number,
    currency: string,
    paymentMethodId: string,
  ): Promise<PaymentResult>;
  refundPayment(paymentId: string): Promise<void>;
}

export interface PaymentResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: number;
}

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');
```

```typescript
// stripe-payment.service.ts
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  PaymentServicePort,
  PaymentResult,
} from '../../core/application/ports/out/payment.service.port';

@Injectable()
export class StripePaymentService implements PaymentServicePort {
  private readonly logger = new Logger(StripePaymentService.name);
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async processPayment(
    amount: number,
    currency: string,
    paymentMethodId: string,
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        payment_method: paymentMethodId,
        confirm: true,
      });

      this.logger.log(`Payment processed: ${paymentIntent.id}`);

      return {
        id: paymentIntent.id,
        status: paymentIntent.status as any,
        amount: paymentIntent.amount / 100,
      };
    } catch (error) {
      this.logger.error('Payment processing failed', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async refundPayment(paymentId: string): Promise<void> {
    try {
      await this.stripe.refunds.create({
        payment_intent: paymentId,
      });

      this.logger.log(`Payment refunded: ${paymentId}`);
    } catch (error) {
      this.logger.error(`Refund failed for ${paymentId}`, error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
```

## Example - Storage Service

```typescript
// storage.service.port.ts (in core/application/ports/out)
export interface StorageServicePort {
  uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
  getSignedUrl(filename: string): Promise<string>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
```

```typescript
// aws-s3-storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageServicePort } from '../../core/application/ports/out/storage.service.port';

@Injectable()
export class AwsS3StorageService implements StorageServicePort {
  private readonly logger = new Logger(AwsS3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    try {
      const key = `uploads/${Date.now()}-${filename}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: mimetype,
        }),
      );

      const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      this.logger.log(`File uploaded: ${url}`);

      return url;
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = url.split('.com/')[1];

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${url}`);
    } catch (error) {
      this.logger.error('File deletion failed', error);
      throw new Error(`Deletion failed: ${error.message}`);
    }
  }

  async getSignedUrl(filename: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

## Module Registration

```typescript
// infrastructure.module.ts
import { Module } from '@nestjs/common';
import { EMAIL_SERVICE } from '../core/application/ports/out/email.service.port';
import { PAYMENT_SERVICE } from '../core/application/ports/out/payment.service.port';
import { STORAGE_SERVICE } from '../core/application/ports/out/storage.service.port';
import { SendGridEmailService } from './external-services/sendgrid-email.service';
import { StripePaymentService } from './external-services/stripe-payment.service';
import { AwsS3StorageService } from './external-services/aws-s3-storage.service';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: SendGridEmailService,
    },
    {
      provide: PAYMENT_SERVICE,
      useClass: StripePaymentService,
    },
    {
      provide: STORAGE_SERVICE,
      useClass: AwsS3StorageService,
    },
  ],
  exports: [EMAIL_SERVICE, PAYMENT_SERVICE, STORAGE_SERVICE],
})
export class InfrastructureModule {}
```

## Common External Services

- **Email Services**: SendGrid, AWS SES, Mailgun
- **Payment Gateways**: Stripe, PayPal, Square
- **Storage Services**: AWS S3, Google Cloud Storage, Azure Blob
- **SMS Services**: Twilio, AWS SNS
- **Search Services**: Elasticsearch, Algolia
- **Analytics**: Google Analytics, Mixpanel
- **Monitoring**: Sentry, DataDog
- **Authentication**: Auth0, Firebase Auth
