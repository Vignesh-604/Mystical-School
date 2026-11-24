import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

// ─── People ────────────────────────────────────────────────────────────────

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["member", "admin"] }).notNull().default("member"),
    bio: text("bio"),
    location: text("location"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256 of the cookie token
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** One row per member: what they came for, and what Sophia remembers. */
export const journeys = sqliteTable("journeys", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  intention: text("intention"),
  focusAreas: text("focus_areas", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  traditions: text("traditions"),
  experience: text("experience", { enum: ["new", "some", "practising", "teaching"] }),
  memorySummary: text("memory_summary"),
  memoryUpdatedAt: integer("memory_updated_at", { mode: "timestamp_ms" }),
  onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
});

// ─── Membership and money ──────────────────────────────────────────────────

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan", { enum: ["initiate"] }).notNull(),
    interval: text("interval", { enum: ["month", "year"] }).notNull(),
    status: text("status", { enum: ["active", "cancelled", "expired"] }).notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }).notNull(),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
    orderId: text("order_id"),
    createdAt: createdAt(),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)],
);

export type OrderKind = "course" | "retreat" | "subscription";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["course", "retreat", "subscription"] }).notNull(),
    /** course id, booking id, or "initiate:month" / "initiate:year" */
    refId: text("ref_id").notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    status: text("status", { enum: ["pending", "paid", "cancelled", "refunded"] })
      .notNull()
      .default("pending"),
    provider: text("provider").notNull(),
    providerRef: text("provider_ref"),
    createdAt: createdAt(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_ref_idx").on(t.kind, t.refId)],
);

export const usageEvents = sqliteTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["chat_message", "voice_seconds", "video_seconds"] }).notNull(),
    amount: integer("amount").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("usage_user_kind_idx").on(t.userId, t.kind, t.createdAt)],
);

// ─── Guide ─────────────────────────────────────────────────────────────────

export const guideConversations = sqliteTable(
  "guide_conversations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New conversation"),
    mode: text("mode", { enum: ["text", "voice", "video"] }).notNull().default("text"),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("conversations_user_idx").on(t.userId, t.updatedAt)],
);

export const guideMessages = sqliteTable(
  "guide_messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => guideConversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    /** Set when the safety screen matched: "self_harm", "abuse", "medical" … */
    safetyFlag: text("safety_flag"),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId, t.createdAt)],
);

export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["reflection", "practice", "action", "insight"] }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    studyArea: text("study_area"),
    source: text("source"), // "guide", "lesson:<id>", "manual"
    createdAt: createdAt(),
  },
  (t) => [index("journal_user_idx").on(t.userId, t.createdAt)],
);

export const liveSessions = sqliteTable(
  "live_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["voice", "video"] }).notNull(),
    conversationId: text("conversation_id"),
    providerRef: text("provider_ref"),
    maxSeconds: integer("max_seconds").notNull(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    endedAt: integer("ended_at", { mode: "timestamp_ms" }),
    chargedSeconds: integer("charged_seconds"),
  },
  (t) => [index("live_sessions_user_idx").on(t.userId, t.startedAt)],
);

// ─── Courses ───────────────────────────────────────────────────────────────

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description").notNull(),
    studyArea: text("study_area").notNull(),
    level: text("level", { enum: ["foundation", "intermediate", "advanced"] }).notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    teacherName: text("teacher_name").notNull(),
    teacherBio: text("teacher_bio").notNull(),
    durationLabel: text("duration_label").notNull(),
    outcomes: text("outcomes", { mode: "json" }).$type<string[]>().notNull(),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("courses_slug_unique").on(t.slug)],
);

export const courseModules = sqliteTable(
  "course_modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
  },
  (t) => [index("modules_course_idx").on(t.courseId, t.position)],
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    durationMin: integer("duration_min").notNull(),
    body: text("body").notNull(),
    practice: text("practice").notNull(),
    actionPrompt: text("action_prompt").notNull(),
    isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("lessons_module_idx").on(t.moduleId, t.position), index("lessons_course_idx").on(t.courseId)],
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    orderId: text("order_id"),
    createdAt: createdAt(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (t) => [uniqueIndex("enrollments_user_course_unique").on(t.userId, t.courseId)],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
    reflection: text("reflection"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

// ─── Retreats ──────────────────────────────────────────────────────────────

export type ItineraryDay = { day: string; title: string; detail: string };

export const retreats = sqliteTable(
  "retreats",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    location: text("location").notNull(),
    country: text("country").notNull(),
    studyArea: text("study_area").notNull(),
    startDate: text("start_date").notNull(), // ISO date, local to the venue
    endDate: text("end_date").notNull(),
    hostName: text("host_name").notNull(),
    depositPercent: integer("deposit_percent").notNull().default(25),
    currency: text("currency").notNull().default("USD"),
    itinerary: text("itinerary", { mode: "json" }).$type<ItineraryDay[]>().notNull(),
    includes: text("includes", { mode: "json" }).$type<string[]>().notNull(),
    notIncluded: text("not_included", { mode: "json" }).$type<string[]>().notNull(),
    cancellationPolicy: text("cancellation_policy").notNull(),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("retreats_slug_unique").on(t.slug)],
);

export const retreatRooms = sqliteTable(
  "retreat_rooms",
  {
    id: text("id").primaryKey(),
    retreatId: text("retreat_id")
      .notNull()
      .references(() => retreats.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    /** Price per guest for the whole retreat */
    priceCents: integer("price_cents").notNull(),
    /** Guests the retreat can take in this room type */
    capacity: integer("capacity").notNull(),
    maxGuestsPerBooking: integer("max_guests_per_booking").notNull().default(2),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("rooms_retreat_idx").on(t.retreatId)],
);

export type BookingContact = {
  phone?: string;
  dietary?: string;
  accessibility?: string;
  notes?: string;
  guestNames?: string[];
};

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    reference: text("reference").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    retreatId: text("retreat_id")
      .notNull()
      .references(() => retreats.id, { onDelete: "cascade" }),
    roomId: text("room_id")
      .notNull()
      .references(() => retreatRooms.id, { onDelete: "cascade" }),
    guests: integer("guests").notNull(),
    status: text("status", { enum: ["held", "confirmed", "cancelled", "expired"] }).notNull(),
    paymentPlan: text("payment_plan", { enum: ["deposit", "full"] }).notNull(),
    totalCents: integer("total_cents").notNull(),
    paidCents: integer("paid_cents").notNull().default(0),
    contact: text("contact", { mode: "json" }).$type<BookingContact>().notNull(),
    holdExpiresAt: integer("hold_expires_at", { mode: "timestamp_ms" }),
    orderId: text("order_id"),
    createdAt: createdAt(),
    confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("bookings_reference_unique").on(t.reference),
    index("bookings_room_status_idx").on(t.roomId, t.status),
    index("bookings_user_idx").on(t.userId),
  ],
);

// ─── Community ─────────────────────────────────────────────────────────────

export const circles = sqliteTable(
  "circles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    studyArea: text("study_area"),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("circles_slug_unique").on(t.slug)],
);

export const circleMembers = sqliteTable(
  "circle_members",
  {
    circleId: text("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.circleId, t.userId] }), index("circle_members_user_idx").on(t.userId)],
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    circleId: text("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("posts_circle_idx").on(t.circleId, t.createdAt)],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("comments_post_idx").on(t.postId, t.createdAt)],
);

export const reactions = sqliteTable(
  "reactions",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    studyArea: text("study_area").notNull(),
    helpWanted: text("help_wanted"),
    status: text("status", { enum: ["forming", "active", "completed"] }).notNull().default("forming"),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("projects_slug_unique").on(t.slug)],
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["lead", "member"] }).notNull().default("member"),
    joinedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] }), index("project_members_user_idx").on(t.userId)],
);

export const projectUpdates = sqliteTable(
  "project_updates",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("project_updates_project_idx").on(t.projectId, t.createdAt)],
);

export const gatherings = sqliteTable(
  "gatherings",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    hostId: text("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    circleId: text("circle_id").references(() => circles.id, { onDelete: "set null" }),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    durationMin: integer("duration_min").notNull(),
    provider: text("provider", { enum: ["smartmeet", "link", "none"] }).notNull(),
    joinUrl: text("join_url"),
    externalId: text("external_id"),
    cancelled: integer("cancelled", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("gatherings_starts_idx").on(t.startsAt)],
);

export const gatheringRsvps = sqliteTable(
  "gathering_rsvps",
  {
    gatheringId: text("gathering_id")
      .notNull()
      .references(() => gatherings.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.gatheringId, t.userId] })],
);

export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["post", "comment", "project_update"] }).notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status", { enum: ["open", "actioned", "dismissed"] }).notNull().default("open"),
    resolvedBy: text("resolved_by"),
    createdAt: createdAt(),
  },
  (t) => [index("reports_status_idx").on(t.status, t.createdAt)],
);

// ─── Operations ────────────────────────────────────────────────────────────

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    target: text("target"),
    meta: text("meta", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Journey = typeof journeys.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Retreat = typeof retreats.$inferSelect;
export type RetreatRoom = typeof retreatRooms.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Circle = typeof circles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Gathering = typeof gatherings.$inferSelect;
