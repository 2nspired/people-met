import Navigation from "~/app/(main)/_components/Navigation";
import type { getAuth } from "~/data/auth/server";

type HeaderProps = {
  auth: Awaited<ReturnType<typeof getAuth>>;
};

export default function Header({ auth }: HeaderProps) {
  return (
    <div className="container flex items-center justify-between">
      <div className="">Header Logo</div>
      <Navigation auth={auth} />
    </div>
  );
}
