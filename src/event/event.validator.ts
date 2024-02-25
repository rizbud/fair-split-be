import validator from 'validator';

import { CreateEventPayload, UpdateEventPayload } from './event.type';

export class EventValidator {
  validateCreateEventPayload(payload: CreateEventPayload) {
    const { name, start_date, end_date, creator_name } = payload;

    if (
      !name?.trim() ||
      !start_date?.trim() ||
      !end_date?.trim() ||
      !creator_name?.trim()
    ) {
      const missingFields = [];
      Object.entries({
        name,
        start_date,
        end_date,
        creator_name,
      }).forEach(([key, value]) => !value?.trim() && missingFields.push(key));

      return `Missing required fields (${missingFields.join(', ')})`;
    }

    if (!validator.isRFC3339(start_date) || !validator.isRFC3339(end_date)) {
      return 'Date must be in RFC3339 format (YYYY-MM-DDTHH:mm:ssZ)';
    }

    if (validator.isAfter(start_date, end_date)) {
      return 'Start date cannot be after end date';
    }
  }

  validateUpdateEventPayload(id: string, payload: UpdateEventPayload) {
    if (isNaN(Number(id))) return 'Event ID must be a number';

    const { start_date, end_date } = payload;

    if (!start_date && !end_date) return;

    // if start_date or end_date is present, both must be present
    if ((!start_date && end_date) || (start_date && !end_date)) {
      return 'Both start_date and end_date must be present';
    }

    // Check if start_date and end_date are in RFC3339 format
    if (!validator.isRFC3339(start_date) || !validator.isRFC3339(end_date)) {
      return 'Date must be in RFC3339 format (YYYY-MM-DDTHH:mm:ssZ)';
    }

    if (validator.isAfter(start_date, end_date)) {
      return 'Start date cannot be after end date';
    }
  }
}
