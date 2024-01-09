export interface EventPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  creator_name: string;
}

export interface ParticipateEventPayload {
  participant_name: string;
}
