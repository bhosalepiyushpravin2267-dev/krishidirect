import { otpRecords, users } from "@/lib/db/mock-db";
import type { OtpRecord, User } from "@/types/backend";

export function findUserByIdentifier(
  identifier: string
): User | undefined {
  return users.find(
    (user) =>
      user.phone === identifier ||
      user.email?.toLowerCase() === identifier.toLowerCase()
  );
}

export function findUserById(
  id: string
): User | undefined {
  return users.find((user) => user.id === id);
}

export function saveOtp(record: OtpRecord): OtpRecord {
  otpRecords.push(record);
  return record;
}

export function findLatestOtp(
  identifier: string
): OtpRecord | undefined {
  return [...otpRecords]
    .reverse()
    .find((record) => record.identifier === identifier);
}

export function updateOtp(
  id: string,
  updates: Partial<OtpRecord>
): OtpRecord | undefined {
  const index = otpRecords.findIndex(
    (record) => record.id === id
  );

  if (index === -1) {
    return undefined;
  }

  otpRecords[index] = {
    ...otpRecords[index],
    ...updates,
  };

  return otpRecords[index];
}