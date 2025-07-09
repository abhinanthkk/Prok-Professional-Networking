import { api } from '../../services/api';

export const jobsApi = {
  getJobs: async (page: number = 1, per_page: number = 10) => {
    return api.getJobs(page, per_page);
  },

  getJob: async (jobId: number) => {
    return api.getJob(jobId);
  },

  applyForJob: async (jobId: number, coverLetter?: string) => {
    return api.applyForJob(jobId, coverLetter);
  },

  createJob: async (jobData: any) => {
    return api.createJob(jobData);
  },
}; 