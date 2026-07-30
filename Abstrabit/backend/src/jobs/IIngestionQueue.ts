export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IngestionJobData {
  jobId: string;
  workspaceId: string;
  filename: string;
  fileBufferBase64: string;
  mimeType?: string;
  requestId: string;
  attempts: number;
}

export interface IIngestionQueue {
  enqueue(jobData: Omit<IngestionJobData, 'jobId' | 'attempts'>): Promise<string>;
  processNext(handler: (job: IngestionJobData) => Promise<void>): Promise<boolean>;
  getJobStatus(jobId: string): Promise<JobStatus | null>;
}
