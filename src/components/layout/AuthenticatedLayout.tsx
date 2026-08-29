"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionClient } from "@/lib/session-client";
import Sidebar from "./Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const result = await getSessionClient();

      if (cancelled) return;

      if (!result.success || !result.session?.user) {
        router.push("/login");
        return;
      }

      setAuthenticated(true);
      setLoading(false);
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}