-- CreateEnum
CREATE TYPE "SplittingMethod" AS ENUM ('EQUAL', 'EQUAL_WITH_CUSTOM_ADJUSTMENT', 'PERCENTAGE', 'CUSTOM_AMOUNT');

-- CreateEnum
CREATE TYPE "ParticipantTag" AS ENUM ('PARTICIPANT', 'PAYER');

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "participant_id" TEXT NOT NULL,
    "is_event_creator" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "amount" BIGINT NOT NULL,
    "tax" BIGINT NOT NULL DEFAULT 0,
    "service_fee" BIGINT NOT NULL DEFAULT 0,
    "discount" BIGINT NOT NULL DEFAULT 0,
    "splitting_method" "SplittingMethod" NOT NULL DEFAULT 'EQUAL',
    "payment_proof_path" TEXT,
    "event_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_participants" (
    "id" SERIAL NOT NULL,
    "expense_id" INTEGER NOT NULL,
    "participant_id" TEXT NOT NULL,
    "tag" "ParticipantTag" NOT NULL DEFAULT 'PARTICIPANT',
    "pay_amount" BIGINT NOT NULL DEFAULT 0,
    "payed_amount" BIGINT NOT NULL DEFAULT 0,
    "payed_at" TIMESTAMP(3),
    "payment_proof_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_slug_unique" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "participants_slug_key" ON "participants"("slug");

-- CreateIndex
CREATE INDEX "participants_slug_unique" ON "participants"("slug");

-- CreateIndex
CREATE INDEX "event_participants_event_id_index" ON "event_participants"("event_id");

-- CreateIndex
CREATE INDEX "event_participants_participant_id_index" ON "event_participants"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_event_id_participant_id_key" ON "event_participants"("event_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_participant_id_event_id_key" ON "event_participants"("participant_id", "event_id");

-- CreateIndex
CREATE INDEX "expenses_event_id_index" ON "expenses"("event_id");

-- CreateIndex
CREATE INDEX "expense_participants_expense_id_index" ON "expense_participants"("expense_id");

-- CreateIndex
CREATE INDEX "expense_participants_participant_id_index" ON "expense_participants"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_participants_expense_id_participant_id_key" ON "expense_participants"("expense_id", "participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_participants_participant_id_expense_id_key" ON "expense_participants"("participant_id", "expense_id");

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_participants" ADD CONSTRAINT "expense_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
