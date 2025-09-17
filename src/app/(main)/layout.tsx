import DevWindowBreakpoint from "~/components/DevWindowBreakpoint";
import MaintenanceMode from "~/app/(main)/_components/MaintenanceMode";
import { isDev, isProd } from "~/utilities/platform/platform";
import Header from "~/app/(main)/_components/Header";
import { getAuth } from "~/data/auth/server";

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const MAINTENANCE_MODE = false;

export default async function MainLayout({ children }: LayoutProps) {
  if (MAINTENANCE_MODE && isProd) {
    return <MaintenanceMode />;
  }

  const auth = await getAuth();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-black text-white">
        {isDev && !isProd && <DevWindowBreakpoint />}
        <Header auth={auth} />
        <main className="flex grow flex-col items-center">{children}</main>
      </div>
    </>
  );
}
