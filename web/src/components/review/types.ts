import type { getMonthWithPosts } from "@/lib/months/queries";

// A post as the month page loads it: its slides (in order) and each slide's required image.
export type ReviewPost = NonNullable<Awaited<ReturnType<typeof getMonthWithPosts>>>["posts"][number];
