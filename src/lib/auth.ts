export function checkAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("admin_auth") === "true";
}

export function setAdminAuth(): void {
  localStorage.setItem("admin_auth", "true");
}

export function clearAdminAuth(): void {
  localStorage.removeItem("admin_auth");
}
