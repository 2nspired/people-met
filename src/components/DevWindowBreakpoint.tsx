"use client";

import { useWindowBreakpoint } from "~/hooks/use-window-breakpoint";

export default function DevWindowSize() {
  const windowBreakpoint = useWindowBreakpoint();

  return (
    <>
      <div
        data-size={windowBreakpoint}
        className="fixed right-0 bottom-0 z-[100] bg-black px-2 py-1 text-sm font-bold text-white"
      >
        <div className="hidden max-sm:flex">XS</div>
        <div className="hidden sm:max-md:flex">SM</div>
        <div className="hidden md:max-lg:flex">MD</div>
        <div className="hidden lg:max-xl:flex">LG</div>
        <div className="hidden xl:max-2xl:flex">XL</div>
        <div className="2xl:max-3xl:flex hidden">2XL</div>
        <div className="3xl:max-4xl:flex hidden">3XL</div>
        <div className="4xl:flex hidden">4XL</div>
      </div>
    </>
  );
}
