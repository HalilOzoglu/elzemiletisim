export const dynamic = 'force-dynamic';

import { getDevices } from "@/lib/supabase/devices";
import { CihazListesi } from "@/components/cihaz/CihazListesi";

export default async function CihazlarPage() {
  const { devices, total } = await getDevices({ pageSize: 100 });

  return (
    <div className="container mx-auto py-8 px-4">
      <CihazListesi initialDevices={devices} initialTotal={total} />
    </div>
  );
}
