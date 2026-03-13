'use client'

import { Suspense } from "react";
import VerifyOtpClient from "./VerfiyOtpClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyOtpClient />
    </Suspense>
  );
}