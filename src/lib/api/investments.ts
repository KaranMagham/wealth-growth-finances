// src/lib/api/investments.ts

export async function refreshAllInvestments() {
  const response = await fetch(
    "/api/investments/refresh-all",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Unable to refresh investments"
    );
  }

  return data;
}