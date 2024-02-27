import { ParticipantTag, SplittingMethod } from '@prisma/client';

import validator from 'validator';

import { ORDER_BY, PARTICIPANT_SORT_BY, SORT_BY } from '~/common/constants';

import {
  CreateExpensePayload,
  ExpenseParticipantsPayload,
  GetExpensesByEventSlugRequest,
  GetParticipantsByExpenseIdRequest,
  UpdateExpensePayload,
} from './expense.type';

export class ExpenseValidator {
  validateGetExpensesQuery(query: GetExpensesByEventSlugRequest) {
    const { event_slug, order_by, sort_by } = query || {};

    if (!event_slug?.trim()) {
      return 'Missing event_slug query parameter in request';
    }

    if (order_by && !ORDER_BY.includes(query.order_by)) {
      return 'Invalid order_by query parameter in request';
    }

    if (sort_by && !SORT_BY.includes(query.sort_by)) {
      return 'Invalid sort_by query parameter in request';
    }
  }

  validateCreateExpensePayload(payload: CreateExpensePayload) {
    const {
      event_id,
      name,
      amount,
      start_date,
      end_date,
      splitting_method,
      participants,
    } = payload;

    // Check if all required fields are present
    if (
      !event_id ||
      !name?.trim() ||
      !amount ||
      !start_date?.trim() ||
      !end_date?.trim() ||
      !splitting_method?.trim() ||
      !participants?.length
    ) {
      const missingFields = [];
      Object.entries({
        event_id,
        name,
        amount,
        start_date,
        end_date,
        splitting_method,
      }).forEach(
        ([key, value]) => !value?.toString()?.trim() && missingFields.push(key),
      );

      if (!participants?.length) {
        missingFields.push('participants');
      }

      return `Missing required fields (${missingFields.join(', ')})`;
    }

    // Check if start_date and end_date are in RFC3339 format
    if (!validator.isRFC3339(start_date) || !validator.isRFC3339(end_date)) {
      return 'Date must be in RFC3339 format (YYYY-MM-DDTHH:mm:ssZ)';
    }

    // Check if start_date is before end_date
    if (validator.isAfter(start_date, end_date)) {
      return 'Start date cannot be after end date';
    }

    const participantIds = participants.map((p) => p.id);
    const participantTags = participants.map((p) => p.tag);

    // Check if all participant ids are unique
    if (participantIds.length !== new Set(participantIds).size) {
      return 'participants.id must be unique';
    }

    // Check if all participant tags are valid (PAYER or PARTICIPANT)
    if (
      !participantTags.every((tag) =>
        Object.values(ParticipantTag).includes(tag),
      )
    ) {
      return 'participants.tag must be either PAYER or PARTICIPANT';
    }

    // Check if there is at least one payer
    if (!participantTags.includes(ParticipantTag.PAYER)) {
      return 'There must be at least one payer';
    }

    // check if splitting_method is valid
    if (!Object.values(SplittingMethod).includes(splitting_method)) {
      return 'Invalid splitting_method';
    }

    return undefined;
  }

  validateCreateExpenseTotalAmount(payload: CreateExpensePayload) {
    const {
      amount = 0,
      tax = 0,
      service_fee = 0,
      discount = 0,
      splitting_method,
      participants,
    } = payload;

    const totalAmount = amount + tax + service_fee - discount;
    const expenseParticipants = participants.filter(
      (p) => p.tag === ParticipantTag.PARTICIPANT,
    );

    switch (splitting_method) {
      case SplittingMethod.PERCENTAGE:
        if (expenseParticipants.every((p) => !p.amount_to_pay_percentage)) {
          return 'Missing amount_to_pay_percentage';
        }

        const totalPercentage = this.getTotalPercentage(expenseParticipants);

        if (totalPercentage !== 100) {
          return 'Total percentage of amount_to_pay_percentage must be 100';
        }
        break;
      case SplittingMethod.CUSTOM_AMOUNT:
        if (expenseParticipants.every((p) => !p.amount_to_pay_nominal)) {
          return 'Missing amount_to_pay_nominal';
        }

        const totalNominal = this.getTotalNominal(expenseParticipants);

        if (totalNominal !== totalAmount) {
          return 'Total nominal of amount_to_pay_nominal must be equal to total amount (amount + tax + service_fee - discount)';
        }
        break;
      default:
        break;
    }

    return undefined;
  }

  validateGetParticipantsByExpenseIdQuery(
    query: GetParticipantsByExpenseIdRequest,
  ) {
    const { page, limit, order_by, sort_by } = query || {};

    if (page && isNaN(Number(page))) {
      return 'page must be a number';
    }

    if (limit && isNaN(Number(limit))) {
      return 'limit must be a number';
    }

    if (order_by && !ORDER_BY.includes(order_by)) {
      return 'Invalid order_by query parameter in request';
    }

    if (sort_by && !PARTICIPANT_SORT_BY.includes(sort_by)) {
      return 'Invalid sort_by query parameter in request';
    }
  }

  validateUpdateExpensePayload(id: string, payload: UpdateExpensePayload) {
    if (isNaN(Number(id))) return 'Expense ID must be a number';

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

    // Check if start_date is before end_date
    if (validator.isAfter(start_date, end_date)) {
      return 'Start date cannot be after end date';
    }
  }

  validateDeleteExpensePayload(payment_proofs_ids?: Array<string>) {
    if (!payment_proofs_ids?.length) {
      return 'Missing required fields (payment_proofs_ids)';
    }

    if (payment_proofs_ids?.some((id) => !validator.isUUID(id))) {
      return 'Invalid payment_proofs_ids';
    }
  }

  validatePayExpensePayload(
    participant_id: string,
    amount: number,
    payment_proofs: Array<Express.Multer.File>,
  ) {
    if (!participant_id) {
      return {
        status: 401,
        message: 'Missing required headers (participant_id)',
      };
    }

    if (!validator.isUUID(participant_id)) {
      return {
        status: 400,
        message: 'Invalid participant_id',
      };
    }

    if (!amount || amount <= 0) {
      return { status: 400, message: 'amount must be greater than 0' };
    }

    if (!payment_proofs?.length) {
      return {
        status: 400,
        message: 'Missing required fields (payment_proofs)',
      };
    }
  }

  validateAddPaymentProofsPayload(payment_proofs: Array<Express.Multer.File>) {
    if (!payment_proofs?.length) {
      return 'Missing required fields (payment_proofs)';
    }
  }

  private getTotalPercentage(participants: ExpenseParticipantsPayload[]) {
    return participants.reduce(
      (acc, curr) => acc + curr.amount_to_pay_percentage,
      0,
    );
  }

  private getTotalNominal(participants: ExpenseParticipantsPayload[]) {
    return participants.reduce(
      (acc, curr) => acc + curr.amount_to_pay_nominal,
      0,
    );
  }
}
