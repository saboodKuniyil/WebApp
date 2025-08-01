
import { z } from 'zod';

export const EstimationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  type: z.enum(['product', 'adhoc']),
});
