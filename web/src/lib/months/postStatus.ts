// Post statuses and the plain words shown to the reviewer (never colour alone). Later tasks add rendering/approved states.
const POST_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  needs_image: "Needs image",
  rendering: "Rendering",
  rendered: "Ready for review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function postStatusLabel(status: string): string {
  return POST_STATUS_LABELS[status] ?? status;
}
