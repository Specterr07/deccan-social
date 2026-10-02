import type { ReactNode } from "react";
import { FOOTER_EMAIL, FOOTER_WEBSITE } from "../brandInfo";

type FooterTone = "fruit" | "paper" | "clear";

const toneClass: Record<FooterTone, string> = {
  fruit: "dp-footer",
  paper: "dp-footer dp-footer-paper",
  clear: "dp-footer dp-footer-clear",
};

// The strip at the bottom of every post. Pass `children` to replace the default website + email pair.
export function Footer({ tone = "fruit", children }: { tone?: FooterTone; children?: ReactNode }) {
  return (
    <div className={toneClass[tone]}>
      {children ?? (
        <>
          <span>{FOOTER_WEBSITE}</span>
          <i className="dp-sep" />
          <span>{FOOTER_EMAIL}</span>
        </>
      )}
    </div>
  );
}
