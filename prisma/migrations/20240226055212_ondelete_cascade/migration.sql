-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_participants" DROP CONSTRAINT "expense_participants_expense_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_participants" DROP CONSTRAINT "expense_participants_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_event_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_proofs" DROP CONSTRAINT "payment_proofs_expense_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_proofs" DROP CONSTRAINT "payment_proofs_expense_participant_id_fkey";

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_expense_participant_id_fkey" FOREIGN KEY ("expense_participant_id") REFERENCES "expense_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
