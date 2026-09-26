import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/lib/auth/context";
import { CommandPalette } from "@/components/ui/CommandPalette";

/**
 * Bricolage Grotesque for display: its optical-size axis tightens at large
 * sizes, so headlines can be set big and sentence case instead of relying on
 * all caps for presence. Instrument Sans for everything else.
 */
const display = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Higgsfield — AI-native creative suite",
  description:
    "Rebuild of higgsfield.ai. Generate images, video and audio from a prompt or a reference.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-hf-black text-hf-text font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <CommandPalette />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
