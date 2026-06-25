import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ToolRent Pro – Equipment Rental System",
  description: "Professional tool and equipment rental management. Lender, Borrower, Admin, Inspector, and Delivery portals.",
  keywords: ["tool rental", "equipment rental", "rental management"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
