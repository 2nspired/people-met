import type { JsonValue } from "@prisma/client/runtime/library";
import { type NextRequest } from "next/server";

import seedDataRaw from "~/data/seedData.json";
import { db } from "~/server/db";
import { devGuard } from "~/utilities/guard/guard";

// Type definitions based on Prisma schema
type ContactType =
  | "EMAIL"
  | "PHONE"
  | "INSTAGRAM"
  | "WHATSAPP"
  | "TELEGRAM"
  | "X"
  | "LINKEDIN"
  | "WEBSITE"
  | "OTHER";
type SocialType =
  | "INSTAGRAM"
  | "X"
  | "LINKEDIN"
  | "FACEBOOK"
  | "TIKTOK"
  | "YOUTUBE"
  | "WEBSITE"
  | "OTHER";
type AttachmentType = "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "LINK";
type ReminderStatus = "PENDING" | "DONE" | "SNOOZED" | "CANCELED";

// Type assertion for the JSON data
const seedData = seedDataRaw as {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
  };
  tags: string[];
  groups: Array<{
    name: string;
    notes: string;
  }>;
  people: Array<{
    name: string;
    nickname?: string;
    phonetic?: string;
    notes?: string;
    isFavorite?: boolean;
    tags?: string[];
    groups?: string[];
    socials?: Array<{
      type: SocialType;
      handle?: string;
      url?: string;
    }>;
    contacts?: Array<{
      type: ContactType;
      value: string;
      label?: string;
      isPrimary?: boolean;
    }>;
    encounters?: Array<{
      happenedAt: string;
      title?: string;
      note?: string;
      locationText?: string;
      latitude?: number;
      longitude?: number;
      attachments?: Array<{
        type: AttachmentType;
        url: string;
        title?: string;
      }>;
    }>;
    attachments?: Array<{
      type: AttachmentType;
      url: string;
      title?: string;
    }>;
  }>;
  reminders: Array<{
    note: string;
    dueAt: string;
    status: ReminderStatus;
  }>;
  eventLogs: Array<{
    entity: string;
    entityId: string;
    action: string;
    meta: Record<string, unknown>;
  }>;
};

const seedUsers = async () => {
  console.log("🌱 Seeding users...");
  try {
    const user = await db.userProfile.upsert({
      where: { email: seedData.user.email },
      create: seedData.user,
      update: seedData.user,
    });
    console.log(`✅ User seeded: ${user.email} (${user.id})`);
    return { success: true, data: user, error: null };
  } catch (error) {
    console.error("❌ Failed to seed users:", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const seedTags = async (userId: string) => {
  console.log("🌱 Seeding tags...");
  const totalTags = seedData.tags.length;
  let seededCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < seedData.tags.length; i++) {
    const tagName = seedData.tags[i];
    if (!tagName) continue;
    try {
      const tag = await db.tag.upsert({
        where: {
          userId_name: {
            userId,
            name: tagName,
          },
        },
        create: {
          userId,
          name: tagName,
        },
        update: { name: tagName },
      });
      seededCount++;
      console.log(`  ✅ Tag: ${tag.name} (${tag.id}) - ${i + 1}/${totalTags}`);
    } catch (error) {
      const errorMsg = `Tag "${tagName}": ${error instanceof Error ? error.message : "Unknown error"}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Seeded ${seededCount}/${totalTags} tags`);
  return {
    success: seededCount > 0,
    seeded: seededCount,
    total: totalTags,
    errors,
  };
};

const seedGroups = async (userId: string) => {
  console.log("🌱 Seeding groups...");
  const totalGroups = seedData.groups.length;
  let seededCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < seedData.groups.length; i++) {
    const group = seedData.groups[i];
    if (!group) continue;
    try {
      const createdGroup = await db.group.upsert({
        where: {
          userId_name: {
            userId,
            name: group.name,
          },
        },
        create: {
          userId,
          name: group.name,
          notes: group.notes,
        },
        update: {
          name: group.name,
          notes: group.notes,
        },
      });
      seededCount++;
      console.log(
        `  ✅ Group: ${createdGroup.name} (${createdGroup.id}) - ${i + 1}/${totalGroups}`,
      );
    } catch (error) {
      const errorMsg = `Group "${group.name}": ${error instanceof Error ? error.message : "Unknown error"}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Seeded ${seededCount}/${totalGroups} groups`);
  return {
    success: seededCount > 0,
    seeded: seededCount,
    total: totalGroups,
    errors,
  };
};

const seedPeople = async (userId: string) => {
  console.log("🌱 Seeding people...");
  const totalPeople = seedData.people.length;
  let seededCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < seedData.people.length; i++) {
    const personData = seedData.people[i];
    if (!personData) continue;
    try {
      const person = await db.person.create({
        data: {
          userId,
          name: personData.name,
          nickname: personData.nickname,
          phonetic: personData.phonetic,
          notes: personData.notes,
          isFavorite: personData.isFavorite ?? false,
        },
      });

      // Seed tags for this person
      if (personData.tags) {
        for (const tagName of personData.tags) {
          const tag = await db.tag.findFirst({
            where: { userId, name: tagName },
          });
          if (tag) {
            await db.personTag.create({
              data: { personId: person.id, tagId: tag.id },
            });
          }
        }
      }

      // Seed groups for this person
      if (personData.groups) {
        for (const groupName of personData.groups) {
          const group = await db.group.findFirst({
            where: { userId, name: groupName },
          });
          if (group) {
            await db.personGroup.create({
              data: { personId: person.id, groupId: group.id },
            });
          }
        }
      }

      // Seed social profiles
      if (personData.socials) {
        for (const social of personData.socials) {
          await db.socialProfile.create({
            data: {
              personId: person.id,
              type: social.type,
              handle: social.handle,
              url: social.url,
            },
          });
        }
      }

      // Seed contact methods
      if (personData.contacts) {
        for (const contact of personData.contacts) {
          await db.contactMethod.create({
            data: {
              personId: person.id,
              type: contact.type,
              value: contact.value,
              label: contact.label,
              isPrimary: contact.isPrimary ?? false,
            },
          });
        }
      }

      // Seed encounters
      if (personData.encounters) {
        for (const encounterData of personData.encounters) {
          const encounter = await db.encounter.create({
            data: {
              personId: person.id,
              createdById: userId,
              happenedAt: new Date(encounterData.happenedAt),
              title: encounterData.title,
              note: encounterData.note,
              locationText: encounterData.locationText,
              latitude: encounterData.latitude
                ? encounterData.latitude.toString()
                : null,
              longitude: encounterData.longitude
                ? encounterData.longitude.toString()
                : null,
            },
          });

          // Seed encounter attachments
          if (encounterData.attachments) {
            for (const attachment of encounterData.attachments) {
              await db.encounterAttachment.create({
                data: {
                  encounterId: encounter.id,
                  type: attachment.type,
                  url: attachment.url,
                  title: attachment.title,
                },
              });
            }
          }
        }
      }

      // Seed person attachments
      if (personData.attachments) {
        for (const attachment of personData.attachments) {
          await db.personAttachment.create({
            data: {
              personId: person.id,
              type: attachment.type,
              url: attachment.url,
              title: attachment.title,
            },
          });
        }
      }
      seededCount++;
      console.log(
        `  ✅ Person: ${person.name} (${person.id}) - ${i + 1}/${totalPeople}`,
      );
    } catch (error) {
      const errorMsg = `Person "${personData.name}": ${error instanceof Error ? error.message : "Unknown error"}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Seeded ${seededCount}/${totalPeople} people`);
  return {
    success: seededCount > 0,
    seeded: seededCount,
    total: totalPeople,
    errors,
  };
};

const seedReminders = async (userId: string) => {
  console.log("🌱 Seeding reminders...");
  const totalReminders = seedData.reminders.length;
  let seededCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < seedData.reminders.length; i++) {
    const reminder = seedData.reminders[i];
    if (!reminder) continue;
    try {
      const createdReminder = await db.reminder.create({
        data: {
          userId,
          dueAt: new Date(reminder.dueAt),
          status: reminder.status,
          note: reminder.note,
        },
      });
      seededCount++;
      console.log(
        `  ✅ Reminder: ${createdReminder.note} (${createdReminder.id}) - ${i + 1}/${totalReminders}`,
      );
    } catch (error) {
      const errorMsg = `Reminder "${reminder.note}": ${error instanceof Error ? error.message : "Unknown error"}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Seeded ${seededCount}/${totalReminders} reminders`);
  return {
    success: seededCount > 0,
    seeded: seededCount,
    total: totalReminders,
    errors,
  };
};

const seedEventLogs = async (userId: string) => {
  console.log("🌱 Seeding event logs...");
  const totalEventLogs = seedData.eventLogs.length;
  let seededCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < seedData.eventLogs.length; i++) {
    const eventLog = seedData.eventLogs[i];
    if (!eventLog) continue;
    try {
      const createdEventLog = await db.eventLog.create({
        data: {
          userId,
          entity: eventLog.entity,
          entityId: eventLog.entityId,
          action: eventLog.action,
          meta: (eventLog.meta as JsonValue) ?? undefined,
        },
      });
      seededCount++;
      console.log(
        `  ✅ EventLog: ${createdEventLog.entity} ${createdEventLog.action} (${createdEventLog.id}) - ${i + 1}/${totalEventLogs}`,
      );
    } catch (error) {
      const errorMsg = `EventLog "${eventLog.entity} ${eventLog.action}": ${error instanceof Error ? error.message : "Unknown error"}`;
      errors.push(errorMsg);
      console.error(`  ❌ ${errorMsg}`);
    }
  }

  console.log(`✅ Seeded ${seededCount}/${totalEventLogs} event logs`);
  return {
    success: seededCount > 0,
    seeded: seededCount,
    total: totalEventLogs,
    errors,
  };
};

export async function GET(request: NextRequest) {
  // Apply development route guard
  const guardResponse = devGuard(request);
  if (guardResponse) {
    return guardResponse;
  }

  console.log("🚀 Starting database seeding...");

  const results = {
    users: {
      success: false,
      seeded: 0,
      total: 1,
      errors: [] as string[],
      data: null as unknown,
    },
    tags: { success: false, seeded: 0, total: 0, errors: [] as string[] },
    groups: { success: false, seeded: 0, total: 0, errors: [] as string[] },
    people: { success: false, seeded: 0, total: 0, errors: [] as string[] },
    reminders: { success: false, seeded: 0, total: 0, errors: [] as string[] },
    eventLogs: { success: false, seeded: 0, total: 0, errors: [] as string[] },
  };

  // Seed all data in order
  const userResult = await seedUsers();
  results.users = {
    success: userResult.success,
    seeded: userResult.success ? 1 : 0,
    total: 1,
    errors: userResult.success ? [] : [userResult.error ?? "Unknown error"],
    data: userResult.data,
  };

  if (userResult.success && userResult.data) {
    const tagsResult = await seedTags(userResult.data.id);
    results.tags = tagsResult;

    const groupsResult = await seedGroups(userResult.data.id);
    results.groups = groupsResult;

    const peopleResult = await seedPeople(userResult.data.id);
    results.people = peopleResult;

    const remindersResult = await seedReminders(userResult.data.id);
    results.reminders = remindersResult;

    const eventLogsResult = await seedEventLogs(userResult.data.id);
    results.eventLogs = eventLogsResult;
  }

  // Calculate totals
  const totalSeeded = Object.values(results).reduce(
    (sum, result) => sum + result.seeded,
    0,
  );
  const totalItems = Object.values(results).reduce(
    (sum, result) => sum + result.total,
    0,
  );
  const totalErrors = Object.values(results).reduce(
    (sum, result) => sum + result.errors.length,
    0,
  );
  const allSuccessful = Object.values(results).every(
    (result) => result.success,
  );

  console.log("\n📊 SEEDING SUMMARY:");
  console.log(`✅ Total items seeded: ${totalSeeded}/${totalItems}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log(
    `🎯 Success rate: ${totalItems > 0 ? Math.round((totalSeeded / totalItems) * 100) : 0}%`,
  );

  if (totalErrors > 0) {
    console.log("\n❌ ERRORS:");
    Object.entries(results).forEach(([category, result]) => {
      if (result.errors.length > 0) {
        console.log(`  ${category.toUpperCase()}:`);
        result.errors.forEach((error) => console.log(`    - ${error}`));
      }
    });
  }

  if (allSuccessful) {
    console.log("🎉 Database seeding completed successfully!");
  } else {
    console.log("⚠️ Database seeding completed with some errors");
  }

  return Response.json({
    message: allSuccessful
      ? "Database seeded successfully"
      : "Database seeded with some errors",
    summary: {
      totalSeeded,
      totalItems,
      totalErrors,
      successRate:
        totalItems > 0 ? Math.round((totalSeeded / totalItems) * 100) : 0,
    },
    results,
    user:
      userResult.success && userResult.data
        ? { id: userResult.data.id, email: userResult.data.email }
        : null,
    timestamp: new Date().toISOString(),
  });
}
