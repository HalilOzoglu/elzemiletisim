"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">Bir hata oluştu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message || "Beklenmeyen bir hata oluştu"}
            </p>
          </div>
          <Button onClick={reset}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    </div>
  );
}
