import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* eslint-disable @typescript-eslint/no-unused-vars*/
const geistSans = localFont({
    src: "./lib/fonts/geist/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const geistMono = localFont({
    src: "./lib/fonts/geist/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const metropolis = localFont({
    src: [
        { path: './lib/fonts/metropolis/Metropolis-Thin.otf', weight: '100' },
        { path: './lib/fonts/metropolis/Metropolis-ExtraLight.otf', weight: '200' },
        { path: './lib/fonts/metropolis/Metropolis-Light.otf', weight: '300' },
        { path: './lib/fonts/metropolis/Metropolis-Regular.otf', weight: '400' },
        { path: './lib/fonts/metropolis/Metropolis-Medium.otf', weight: '500' },
        { path: './lib/fonts/metropolis/Metropolis-SemiBold.otf', weight: '600' },
        { path: './lib/fonts/metropolis/Metropolis-Bold.otf', weight: '700' },
        { path: './lib/fonts/metropolis/Metropolis-ExtraBold.otf', weight: '800' },
        { path: './lib/fonts/metropolis/Metropolis-Black.otf', weight: '900' },
    ],
    variable: "--font-metropolis",
});
/* eslint-enable @typescript-eslint/no-unused-vars*/

export const metadata: Metadata = {
    title: "COACH",
    description: "Coaching you throughout your school career.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return ( // suppressHydrationWarning, suppresses Error by React, caused when client and server render two different things after compiling. This may be caused by client-extensions, like grammar checkers. More Info: https://nextjs.org/docs/messages/react-hydration-error
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased font-metropolis`}>
                {children}
            </body>
        </html>
    );
}
