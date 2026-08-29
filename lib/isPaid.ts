export async function requirePaid(_userId: string, _role = "user", _email = "") {
  // Pulsemed is 100% free — no paywall gate
}

export async function getIsPaid(_userId: string, _role = "user", _email = ""): Promise<boolean> {
  return true;
}
