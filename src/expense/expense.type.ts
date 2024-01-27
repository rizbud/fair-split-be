import { PaginationInput } from '~/common/interface';

export interface GetExpensesByEventSlugRequest extends PaginationInput {
  event_slug: string;
  sort_by?: 'created_at' | 'name' | 'start_date' | 'end_date';
}
