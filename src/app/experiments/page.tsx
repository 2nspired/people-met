import { Suspense } from "react";
import { api } from "~/trpc/server";

export default async function ExperimentsPage() {
  const drivers = await api.drivers.getDrivers({
    season: 2025,
  });

  return (
    <div>
      <div className="font-bold">Experiments Page</div>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          {drivers && drivers.length > 0
            ? drivers.map((driver) => (
                <div key={driver.driverId}>
                  {`${driver.givenName}; driverId: ${driver.driverId}`}
                </div>
              ))
            : "No drivers"}
        </div>
      </Suspense>
    </div>
  );
}
