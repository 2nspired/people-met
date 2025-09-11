import { useLayoutEffect, useState } from "react";

export function useWindowBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>("1200px");

  useLayoutEffect(() => {
    const handleResize = () => {
      let tempBreakpoint = "1200px";

      if (window.innerWidth >= 2400) {
        tempBreakpoint = "2400px";
      } else if (window.innerWidth >= 1920) {
        tempBreakpoint = "1920px";
      } else if (window.innerWidth >= 1200) {
        tempBreakpoint = "1200px";
      } else if (window.innerWidth >= 1024) {
        tempBreakpoint = "1024px";
      } else if (window.innerWidth >= 768) {
        tempBreakpoint = "768px";
      } else if (window.innerWidth >= 640) {
        tempBreakpoint = "640px";
      }
      setBreakpoint(tempBreakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return breakpoint;
}
