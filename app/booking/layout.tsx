import React, { ReactNode, Suspense } from "react";

export default function BookingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <Suspense>{children}</Suspense>;
}
