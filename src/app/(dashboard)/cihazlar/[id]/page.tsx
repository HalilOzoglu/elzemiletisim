export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { getDeviceById } from "@/lib/supabase/devices";
import { getExpensesByDevice } from "@/lib/supabase/expenses";
import { getSaleByDevice } from "@/lib/supabase/sales";
import { CihazDetayClient } from "./CihazDetayClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CihazDetayPage({ params }: PageProps) {
  const { id } = await params;

  let device, expenses, sale;
  try {
    [device, expenses, sale] = await Promise.all([
      getDeviceById(id),
      getExpensesByDevice(id),
      getSaleByDevice(id),
    ]);
  } catch {
    notFound();
  }

  if (!device) notFound();

  return <CihazDetayClient device={device} expenses={expenses} sale={sale} />;
}
