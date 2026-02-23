"use client";

import { Suspense } from "react";
import { CompaniesContent } from "./companies-content";

export default function CompaniesPage() {
  return (
    <Suspense>
      <CompaniesContent />
    </Suspense>
  );
}

