import * as z from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1), // Current page number
  limit: z.coerce.number().min(1).max(10000).default(10), // Items per page
  search: z.string().optional(), // Optional search term
  isActive: z.enum(['true', 'false', 'all']).default('all'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;