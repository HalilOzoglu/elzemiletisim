"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Plus, Search, ChevronLeft, ChevronRight, Smartphone } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Device } from "@/types";

type DeviceRow = Device & {
  brandName?: string;
  modelName?: string;
  storageName?: string;
  colorName?: string;
  ydStatusName?: string;
  purchaseTypeName?: string;
};

interface CihazListesiProps {
  initialDevices: DeviceRow[];
  initialTotal: number;
}

const columns: ColumnDef<DeviceRow>[] = [
  {
    accessorKey: "brandName",
    header: "Marka",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-medium">{row.getValue("brandName") ?? "—"}</span>
      </div>
    ),
  },
  {
    accessorKey: "modelName",
    header: "Model",
    cell: ({ row }) => row.getValue("modelName") ?? "—",
  },
  {
    accessorKey: "storageName",
    header: "Hafıza",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("storageName") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "colorName",
    header: "Renk",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("colorName") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "purchasePrice",
    header: "Alış Fiyatı",
    cell: ({ row }) => {
      const val = row.getValue<number | undefined>("purchasePrice");
      return val != null ? (
        <span className="tabular-nums font-medium">{formatCurrency(val)}</span>
      ) : "—";
    },
  },
  {
    accessorKey: "isSold",
    header: "Durum",
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === undefined || filterValue === null) return true;
      return row.getValue(columnId) === filterValue;
    },
    cell: ({ row }) => {
      const isSold = row.getValue<boolean>("isSold");
      return isSold ? (
        <Badge variant="outline" className="text-muted-foreground border-white/10">Satıldı</Badge>
      ) : (
        <Badge className="text-green-400 border-green-400/30 bg-green-400/10 border">Stokta</Badge>
      );
    },
  },
];

export function CihazListesi({ initialDevices }: CihazListesiProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "stokta" | "satildi">("all");

  const data = useMemo(() => initialDevices, [initialDevices]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const brand = String(row.original.brandName ?? "").toLowerCase();
      const model = String(row.original.modelName ?? "").toLowerCase();
      const barcode = String(row.original.barcode ?? "").toLowerCase();
      return brand.includes(search) || model.includes(search) || barcode.includes(search);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "stokta" | "satildi");
    const col = table.getColumn("isSold");
    if (value === "stokta") col?.setFilterValue(false);
    else if (value === "satildi") col?.setFilterValue(true);
    else col?.setFilterValue(undefined);
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 p-5 border-b border-white/5">
        <h2 className="text-xl font-semibold">Cihazlar</h2>
        <Link href="/cihazlar/yeni" prefetch>
          <Button
            size="sm"
            className="gap-1.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-150 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Yeni Cihaz
          </Button>
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Marka, model veya barkod ara..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 bg-white/5 border-white/10 focus:border-primary/50"
            />
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="stokta">Stokta</TabsTrigger>
              <TabsTrigger value="satildi">Satıldı</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tablo */}
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-muted-foreground text-xs uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-white/5 hover:bg-white/3 transition-colors duration-100 p-0"
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell key={cell.id} className="p-0">
                        <Link
                          href={`/cihazlar/${row.original.id}`}
                          prefetch
                          className="flex items-center px-4 py-3 w-full h-full"
                        >
                          {cellIndex === 0 ? (
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <Smartphone className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="font-medium">{row.original.brandName ?? "—"}</span>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </Link>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Cihaz bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Sayfalama */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} cihaz
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Önceki sayfa"
              className="border-white/10 hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Sonraki sayfa"
              className="border-white/10 hover:bg-white/5"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
