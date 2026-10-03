import { PostCard } from "./PostCard";
import type { ReviewPost } from "./types";

// The month's posts by date, with a count of how many are approved. One column on a phone, two on a wide screen.
export function PostFeed({ posts }: { posts: ReviewPost[] }) {
  const approvedCount = posts.filter((post) => post.status === "approved").length;
  const needImageCount = posts.filter((post) => post.status === "needs_image").length;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground" role="status">
        <strong className="text-foreground">{approvedCount} of {posts.length}</strong> approved
        {needImageCount > 0 && <> · <span className="font-medium text-destructive">{needImageCount} {needImageCount === 1 ? "post needs" : "posts need"} an image</span></>}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
