import { ParticipantTag, SplittingMethod } from '@prisma/client';

import { PaginationInput } from '~/common/interface';

export interface GetExpensesByEventSlugRequest extends PaginationInput {
  event_slug: string;
  sort_by?: 'created_at' | 'name' | 'start_date' | 'end_date';
}

export interface ExpenseParticipantsPayload {
  id: string;
  tag: ParticipantTag;
  amount_to_pay_nominal?: number;
  amount_to_pay_percentage?: number;
  amount_to_pay_adjusment?: number;
}

export interface CreateExpensePayload {
  event_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  amount: number;
  tax?: number;
  service_fee?: number;
  discount?: number;
  splitting_method: SplittingMethod;
  participants?: ExpenseParticipantsPayload[];
}

export interface UpdateExpensePayload {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface GetParticipantsByExpenseIdRequest extends PaginationInput {
  sort_by?: 'created_at' | 'name' | 'amount_to_pay';
}
