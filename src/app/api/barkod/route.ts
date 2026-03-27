import { NextRequest, NextResponse } from "next/server";
import { getDeviceByBarcode } from "@/lib/supabase/devices";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");

  if (!barcode || barcode.trim() === "") {
    return NextResponse.json({ error: "Barkod parametresi gerekli" }, { status: 400 });
  }

  try {
    const device = await getDeviceByBarcode(barcode.trim());
    return NextResponse.json({ device: device ?? null }, { status: 200 });
  } catch (error) {
    console.error("Barkod sorgulama hatası:", error);
    return NextResponse.json({ error: "Sorgulama sırasında bir hata oluştu" }, { status: 500 });
  }
}
