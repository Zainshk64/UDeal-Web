'use client'

import { Suspense } from "react";
import AddPostPage from "./AddPostClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AddPostPage />
    </Suspense>
  );
}