import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap | Cep Telefonu Muhasebe",
  description: "Muhasebe sistemine giriş yapın",
};

export default function LoginPage() {
  return <LoginForm />;
}
