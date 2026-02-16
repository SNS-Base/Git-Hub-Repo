# Infrastructure Documentation - Document AI Backend

## Overview

The infrastructure layer handles all AWS service integrations including S3 for file storage and SQS for job queue management.

---

## 📁 Folder Structure

```
src/infra/
├── s3/
│   ├── s3.client.ts      # S3 client initialization
│   └── s3.presign.ts     # Presigned URL generation
└── sqs/
    ├── sqs.client.ts     # SQS client initialization
    ├── sqs.producer.ts   # Send messages to queue
    └── sqs.consumer.ts   # (Empty - planned for background processing)
```

---

## 🪣 S3 Integration

### Purpose
Handles file storage for uploaded documents and processed Excel files using AWS S3.

### Files

#### `s3.client.ts`
**Purpose**: Initialize and export AWS S3 client

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
  forcePathStyle: false,
});
```

**Configuration**:
- Uses AWS SDK v3 (`@aws-sdk/client-s3`)
- Region from environment variable
- Standard S3 endpoint (not path-style)
- Credentials from AWS environment (IAM role or env vars)

**Environment Variables Required**:
- `AWS_REGION` - AWS region (e.g., 'us-east-1')
- `AWS_ACCESS_KEY_ID` - AWS access key (optional if using IAM role)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional if using IAM role)

#### `s3.presign.ts`
**Purpose**: Generate presigned URLs for secure file downloads

```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3.client';

export async function generateDownloadUrl(
  bucket: string,
  key: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });
}
```

**Function Details**:
- **Name**: `generateDownloadUrl`
- **Parameters**:
  - `bucket` (string) - S3 bucket name
  - `key` (string) - S3 object key (file path)
- **Returns**: Promise<string> - Presigned URL valid for 5 minutes
- **Use Case**: Called by jobs controller to provide download URLs for completed conversions

**Security Features**:
- Time-limited URLs (5 minutes)
- No permanent public access
- Signed with AWS credentials
- Automatic expiration

**Usage Example**:
```typescript
const downloadUrl = await generateDownloadUrl(
  process.env.S3_BUCKET!,
  'outputs/abc123-result.xlsx'
);
// Returns: https://bucket.s3.region.amazonaws.com/outputs/abc123-result.xlsx?X-Amz-...
```

### S3 Bucket Structure

```
your-bucket-name/
├── uploads/
│   ├── {uuid}-invoice.pdf
│   ├── {uuid}-receipt.jpg
│   └── {uuid}-form.png
└── outputs/
    ├── {uuid}-result.xlsx
    └── {uuid}-result.xlsx
```

**Upload Flow**:
1. Frontend requests presigned URL from `/upload/presigned-url`
2. Backend generates presigned PUT URL for `uploads/{uuid}-{filename}`
3. Frontend uploads file directly to S3 using presigned URL
4. Backend stores S3 key in job record

**Download Flow**:
1. Frontend requests download from `/jobs/:id/download`
2. Backend retrieves job's `outputFileKey`
3. Backend generates presigned GET URL using `generateDownloadUrl()`
4. Frontend downloads file directly from S3

---

## 📨 SQS Integration

### Purpose
Manages asynchronous job processing using AWS SQS (Simple Queue Service) for decoupling API from background processing.

### Files

#### `sqs.client.ts`
**Purpose**: Initialize and export AWS SQS client

```typescript
import { SQSClient } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
});
```

**Configuration**:
- Uses AWS SDK v3 (`@aws-sdk/client-sqs`)
- Region from environment variable
- Credentials from AWS environment (IAM role or env vars)

**Environment Variables Required**:
- `AWS_REGION` - AWS region (e.g., 'us-east-1')
- `AWS_ACCESS_KEY_ID` - AWS access key (optional if using IAM role)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional if using IAM role)

#### `sqs.producer.ts`
**Purpose**: Send job messages to SQS queue

```typescript
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';

export class SqsProducer {
  static async sendJobMessage(payload: {
    jobId: string;
    inputFileKey: string;
    documentType: string;
  }) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify(payload),
    });

    await sqsClient.send(command);
  }
}
```

**Class Details**:
- **Name**: `SqsProducer`
- **Method**: `sendJobMessage` (static)
- **Parameters**:
  - `payload.jobId` (string) - Unique job identifier
  - `payload.inputFileKey` (string) - S3 key of uploaded file
  - `payload.documentType` (string) - 'EXPENSE' or 'HR'
- **Returns**: Promise<void>
- **Use Case**: Called by jobs service when creating a new job

**Environment Variables Required**:
- `SQS_QUEUE_URL` - Full SQS queue URL (e.g., 'https://sqs.us-east-1.amazonaws.com/123456789/document-processing-queue')

**Message Format**:
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "inputFileKey": "uploads/abc123-invoice.pdf",
  "documentType": "EXPENSE"
}
```

**Usage Example**:
```typescript
await SqsProducer.sendJobMessage({
  jobId: job.id,
  inputFileKey: job.inputFileKey,
  documentType: job.documentType,
});
```

#### `sqs.consumer.ts`
**Status**: Empty/Not implemented

**Intended Purpose**: Background worker to process jobs from SQS queue

**Planned Implementation**:
```typescript
import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from './sqs.client';
import { JobsService } from '../../modules/jobs/jobs.service';
import { TextractService } from '../../modules/textract/textract.services';
import { ExcelExporter } from '../../modules/exports/excel.exporter';

export class SqsConsumer {
  static async pollMessages() {
    while (true) {
      const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20, // Long polling
      });

      const response = await sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          await this.processMessage(message);
          
          // Delete message after processing
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL!,
            ReceiptHandle: message.ReceiptHandle!,
          }));
        }
      }
    }
  }

  static async processMessage(message: any) {
    const payload = JSON.parse(message.Body);
    const { jobId, inputFileKey, documentType } = payload;

    try {
      // Update job status to PROCESSING
      await JobsService.updateJobStatus(jobId, 'PROCESSING');

      // Download file from S3
      const fileBuffer = await downloadFromS3(inputFileKey);

      // Process with Textract
      const extractedData = await TextractService.processDocument(
        fileBuffer,
        documentType
      );

      // Convert to Excel
      const excelBuffer = await ExcelExporter.convert(extractedData);

      // Upload result to S3
      const outputKey = `outputs/${jobId}-result.xlsx`;
      await uploadToS3(outputKey, excelBuffer);

      // Update job status to COMPLETED
      await JobsService.updateJobStatus(jobId, 'COMPLETED', {
        outputFileKey: outputKey,
      });
    } catch (error) {
      // Update job status to FAILED
      await JobsService.updateJobStatus(jobId, 'FAILED', {
        errorMessage: error.message,
      });
    }
  }
}
```

**Planned Features**:
- Long polling (20 seconds) for efficient message retrieval
- Automatic message deletion after successful processing
- Error handling with job status updates
- Integration with Textract and Excel export modules

---

## 🔄 Job Processing Flow

### Complete Workflow

```
1. User uploads file
   ↓
2. Frontend gets presigned URL from backend
   ↓
3. Frontend uploads file directly to S3 (uploads/)
   ↓
4. Frontend creates job via POST /jobs
   ↓
5. Backend creates job record (status: PENDING)
   ↓
6. Backend sends message to SQS via SqsProducer
   ↓
7. SQS Consumer polls queue (background worker)
   ↓
8. Consumer updates job status to PROCESSING
   ↓
9. Consumer downloads file from S3
   ↓
10. Consumer processes with AWS Textract
   ↓
11. Consumer converts to Excel format
   ↓
12. Consumer uploads result to S3 (outputs/)
   ↓
13. Consumer updates job status to COMPLETED
   ↓
14. Frontend polls GET /jobs/:id/status
   ↓
15. Frontend gets download URL from GET /jobs/:id/download
   ↓
16. Frontend downloads file directly from S3
```

### Status Transitions

```
PENDING → PROCESSING → COMPLETED
                    ↓
                  FAILED
```

---

## 🔐 AWS IAM Permissions Required

### S3 Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

### SQS Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:us-east-1:123456789:document-processing-queue"
    }
  ]
}
```

### Textract Permissions (Planned)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeExpense",
        "textract:AnalyzeDocument",
        "textract:DetectDocumentText"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 📊 AWS Service Configuration

### S3 Bucket Configuration

**Bucket Name**: `document-ai-{environment}`

**CORS Configuration**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://your-frontend-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Lifecycle Rules**:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldUploads",
      "Status": "Enabled",
      "Prefix": "uploads/",
      "Expiration": {
        "Days": 7
      }
    },
    {
      "Id": "DeleteOldOutputs",
      "Status": "Enabled",
      "Prefix": "outputs/",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

### SQS Queue Configuration

**Queue Name**: `document-processing-queue`

**Settings**:
- **Visibility Timeout**: 300 seconds (5 minutes)
- **Message Retention**: 4 days
- **Receive Wait Time**: 20 seconds (long polling)
- **Dead Letter Queue**: `document-processing-dlq` (after 3 retries)

**Dead Letter Queue**:
- Captures failed messages after 3 processing attempts
- Allows manual inspection and reprocessing
- Retention: 14 days

---

## 🚨 Error Handling

### S3 Errors
- **NoSuchKey**: File not found in S3
- **AccessDenied**: Insufficient permissions
- **InvalidBucketName**: Bucket doesn't exist
- **SignatureDoesNotMatch**: Invalid AWS credentials

### SQS Errors
- **QueueDoesNotExist**: Queue URL is invalid
- **MessageTooLong**: Message exceeds 256KB limit
- **ReceiptHandleIsInvalid**: Message already deleted or expired

### Retry Strategy
- S3 operations: 3 retries with exponential backoff
- SQS send: 3 retries with exponential backoff
- SQS receive: Continuous polling with error logging

---

## 📈 Monitoring & Logging

### CloudWatch Metrics (Recommended)

**S3 Metrics**:
- `NumberOfObjects` - Total files in bucket
- `BucketSizeBytes` - Total storage used
- `AllRequests` - Total API requests

**SQS Metrics**:
- `NumberOfMessagesSent` - Messages added to queue
- `NumberOfMessagesReceived` - Messages retrieved
- `ApproximateNumberOfMessagesVisible` - Queue depth
- `ApproximateAgeOfOldestMessage` - Processing lag

**Custom Metrics**:
- Job processing time
- Success/failure rates
- Average file size
- Textract API costs

### Logging Strategy
```typescript
// Log S3 operations
console.log(`[S3] Generating download URL for key: ${key}`);

// Log SQS operations
console.log(`[SQS] Sending job message: ${JSON.stringify(payload)}`);

// Log errors
console.error(`[S3] Failed to generate presigned URL:`, error);
console.error(`[SQS] Failed to send message:`, error);
```

---

## 🔧 Environment Variables Summary

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Configuration
S3_BUCKET=document-ai-production

# SQS Configuration
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/document-processing-queue
```

---

## 🎯 Next Steps

### High Priority
1. **Implement SQS Consumer** (`sqs.consumer.ts`)
   - Message polling loop
   - Job processing logic
   - Error handling and retries

2. **Add S3 Upload Function**
   - Upload processed Excel files
   - Generate unique output keys
   - Set proper content types

3. **Add S3 Download Function**
   - Download input files for processing
   - Stream large files efficiently

### Medium Priority
4. **Add CloudWatch Logging**
   - Structured logging
   - Error tracking
   - Performance metrics

5. **Implement Dead Letter Queue Handling**
   - Monitor DLQ for failed jobs
   - Retry mechanism
   - Alert on repeated failures

6. **Add S3 Lifecycle Policies**
   - Auto-delete old uploads
   - Archive old outputs
   - Cost optimization

### Low Priority
7. **Add S3 Encryption**
   - Server-side encryption (SSE-S3 or SSE-KMS)
   - Encryption in transit

8. **Implement S3 Versioning**
   - Track file changes
   - Recover deleted files

9. **Add SQS FIFO Queue**
   - Guaranteed order processing
   - Exactly-once delivery

---

## 📝 Notes

1. **AWS SDK v3**: Uses modular imports for smaller bundle size
2. **Presigned URLs**: Avoid backend bottleneck for file transfers
3. **Long Polling**: Reduces SQS costs and improves responsiveness
4. **Environment Variables**: Use AWS Secrets Manager in production
5. **IAM Roles**: Prefer IAM roles over access keys for EC2/ECS deployments
6. **Cost Optimization**: Implement lifecycle policies to auto-delete old files
7. **Security**: Never commit AWS credentials to version control

---

## 🔗 Related Documentation

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SQS Documentation](https://docs.aws.amazon.com/sqs/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Presigned URLs Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
