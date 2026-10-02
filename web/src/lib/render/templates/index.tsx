import type { RenderInput, TemplateName } from "../types";
import { BehindTheScenesPost } from "./BehindTheScenesPost";
import { DayOfPost } from "./DayOfPost";
import { ExhibitionPost } from "./ExhibitionPost";
import { FestivalPost } from "./FestivalPost";
import { InfoCarouselCover } from "./InfoCarouselCover";
import { InfoCarouselCta } from "./InfoCarouselCta";
import { InfoCarouselInner } from "./InfoCarouselInner";

const templateByName: Record<TemplateName, (props: { input: RenderInput }) => React.JSX.Element> = {
  festival: FestivalPost,
  day_of: DayOfPost,
  exhibition: ExhibitionPost,
  behind_the_scenes: BehindTheScenesPost,
  info_cover: InfoCarouselCover,
  info_inner: InfoCarouselInner,
  info_cta: InfoCarouselCta,
};

// Picks the right template component for a slide.
export function PostTemplate({ input }: { input: RenderInput }) {
  const Template = templateByName[input.template];
  return <Template input={input} />;
}
