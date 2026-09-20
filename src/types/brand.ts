import { z } from "zod";

const chainIdSchema = z.string().brand<"ChainId">();
export type ChainId = z.infer<typeof chainIdSchema>;
export const brandChainId = (id: string): ChainId => chainIdSchema.parse(id);

const branchIdSchema = z.string().brand<"BranchId">();
export type BranchId = z.infer<typeof branchIdSchema>;
export const brandBranchId = (id: string): BranchId => branchIdSchema.parse(id);

const locationIdSchema = z.string().brand<"LocationId">();
export type LocationId = z.infer<typeof locationIdSchema>;
export const brandLocationId = (id: string): LocationId => locationIdSchema.parse(id);

const activityIdSchema = z.string().brand<"ActivityId">();
export type ActivityId = z.infer<typeof activityIdSchema>;
export const brandActivityId = (id: string): ActivityId => activityIdSchema.parse(id);

const classIdSchema = z.string().brand<"ClassId">();
export type ClassId = z.infer<typeof classIdSchema>;
export const brandClassId = (id: string): ClassId => classIdSchema.parse(id);

// Derived `activityId_weekday_hour_minute` id (see src/lib/helpers/recurrentId.ts), distinct from ClassId
const recurrentClassIdSchema = z.string().brand<"RecurrentClassId">();
export type RecurrentClassId = z.infer<typeof recurrentClassIdSchema>;
export const brandRecurrentClassId = (id: string): RecurrentClassId => recurrentClassIdSchema.parse(id);

const userIdSchema = z.string().brand<"UserId">();
export type UserId = z.infer<typeof userIdSchema>;
export const brandUserId = (id: string): UserId => userIdSchema.parse(id);

const terminalIdSchema = z.string().brand<"TerminalId">();
export type TerminalId = z.infer<typeof terminalIdSchema>;
export const brandTerminalId = (id: string): TerminalId => terminalIdSchema.parse(id);
