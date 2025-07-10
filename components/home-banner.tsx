"use client";

import { useState } from "react";
import { LinkIcon } from "lucide-react";
import { Banner } from "@/components/ui/banner";

export function BannerDemo() {
  const [show, setShow] = useState(true);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Banner
        show={show}
        onHide={() => setShow(false)}
        icon={<LinkIcon className="m-px h-4 w-4 text-green-800" />}
        title={
          <>
            Claim a free <span className="font-semibold">.link</span> domain,
            free for 1 year.
          </>
        }
        action={{
          label: "Claim Domain",
          onClick: () => console.log("Claim domain clicked"),
        }}
        learnMoreUrl="https://dub.co/help/article/free-dot-link-domain"
      />
    </div>
  );
}
