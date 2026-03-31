export interface TokenPayload {
  exp?: number;
  role?: string;
  userRole?: string;
  rank?: string;
  name?: string;
}

export interface OperatorIdentity {
  rank: string;
  name: string;
  role: string;
}

export function readTokenPayload(): TokenPayload | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1])) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload | null): boolean {
  if (!payload) return true;
  const exp = payload?.exp;
  if (typeof exp !== "number") return true;
  return Date.now() >= exp * 1000;
}

export function readOperatorRole(): string | null {
  const payload = readTokenPayload();
  const role = payload?.role || payload?.userRole;
  return typeof role === "string" ? role : null;
}

export function readOperatorIdentity(): OperatorIdentity | null {
  const payload = readTokenPayload();
  if (!payload) return null;

  const rank = typeof payload.rank === "string" ? payload.rank : "";
  const name = typeof payload.name === "string" ? payload.name : "";
  const role = readOperatorRole() || "";

  if (!rank || !name || !role) return null;
  return { rank, name, role };
}
