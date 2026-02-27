import type { Metadata } from "next";
import { Dela_Gothic_One, Golos_Text } from "next/font/google";
import "./globals.css";

const delaGothic = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-dela-gothic",
  display: "swap",
});

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "АЛТЕХ — масла и фильтры в Якутске",
    template: "%s | АЛТЕХ",
  },
  description:
    "Официальный дистрибьютор ROLF, SINTEC, KIXX, RHINOIL, ХИМАВТО. Моторные масла, фильтры, технические жидкости. Бесплатная доставка по Якутску.",
  keywords: [
    "масла Якутск",
    "моторное масло",
    "фильтры",
    "ROLF",
    "KIXX",
    "АЛТЕХ",
    "смазочные материалы",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "АЛТЕХ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${delaGothic.variable} ${golosText.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
