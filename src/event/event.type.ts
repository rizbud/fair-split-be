import { PaginationInput } from '~/common/interface';

export interface CreateEventPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  creator_name: string;
}

export type UpdateEventPayload = Partial<
  Omit<CreateEventPayload, 'creator_name'>
>;

export interface ParticipateEventPayload {
  participant_name: string;
}

export interface GetEventParticipantsRequest extends PaginationInput {
  sort_by?: 'name' | 'created_at';
}
