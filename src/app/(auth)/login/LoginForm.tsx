"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("E-posta adresiniz doğrulanmamış. Supabase Dashboard'dan email confirmation'ı devre dışı bırakın veya e-postanızı doğrulayın.");
        } else {
          toast.error("E-posta veya şifre hatalı");
        }
        return;
      }

      router.push("/panel");
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
        <CardDescription className="text-center">
          Hesabınıza erişmek için bilgilerinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">E-posta</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="ornek@email.com"
                  disabled={isLoading}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Şifre</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••"
                  disabled={isLoading}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
