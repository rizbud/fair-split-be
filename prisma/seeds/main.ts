import { ParticipantTag, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await Promise.allSettled(
    [1, 2, 3, 4, 5].map(async (i) => {
      await prisma.participant.upsert({
        where: { slug: 'participant-' + i },
        update: {},
        create: { name: 'Participant ' + i, slug: 'participant-' + i },
      });
    }),
  );

  const participants = await prisma.participant.findMany();

  const event = await prisma.event.upsert({
    where: { slug: 'event-1' },
    update: {},
    create: {
      name: 'Event 1',
      slug: 'event-1',
      description: 'Event 1 description',
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-01-05T00:00:00.000Z',
      event_participants: {
        createMany: {
          data: participants.map((participant, idx) => ({
            participant_id: participant.id,
            is_event_creator: idx === 0,
          })),
        },
      },
    },
    include: {
      event_participants: {
        select: { participant: true, is_event_creator: true },
      },
    },
  });

  const expenses = await Promise.allSettled(
    [1, 2].map(async (i) => {
      return await prisma.expense.upsert({
        where: { id: i },
        update: {},
        create: {
          name: 'Expense ' + i,
          description: `Expense ${i} description`,
          amount: 100,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-01-05T00:00:00.000Z',
          event: { connect: { id: event.id } },
          expense_participants: {
            createMany: {
              data: participants.map((participant) => {
                const isEventCreator =
                  participant.id === participants[i - 1].id;

                return {
                  participant_id: participant.id,
                  tag: isEventCreator
                    ? ParticipantTag.PAYER
                    : ParticipantTag.PARTICIPANT,
                  amount_to_pay: isEventCreator
                    ? 0
                    : 100 / (participants.length - 1),
                };
              }),
            },
          },
        },
        include: {
          expense_participants: {
            include: { participant: true },
          },
        },
      });
    }),
  );

  console.log({ event, expenses, participants });
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
