export async function getBalance() {
  const res = await fetch("/api/plaid/get-balance");

  if (!res.ok) {
    throw new Error("Failed to fetch balance");
  }

  const data = await res.json();

  return data;
}