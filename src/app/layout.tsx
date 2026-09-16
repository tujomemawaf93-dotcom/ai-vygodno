import type { Metadata } from "next";
import "./globals.css";
import { CalculationProvider } from "@/components/calculation";
export const metadata: Metadata = {
  title: "ИИ Выгодно — расчет эффективности ИИ",
  description: "Оценка эффекта внедрения ИИ для бизнеса",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <CalculationProvider>{children}</CalculationProvider>
      </body>
    </html>
  );
}
