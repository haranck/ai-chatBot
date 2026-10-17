import { CookieOptions, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { AuthResult } from "../types/auth.types";
import { AuthRequest } from "../middleware/auth.middleware";
import { googleLoginSchema } from "../validators/auth.validator";
import { authConfig } from "../config/auth";
import { HttpError } from "../utils/httpError";

const REFRESH_COOKIE = "refreshToken";

// httpOnly: page scripts can't read it. Only sent to /api/auth/*.
// Production uses SameSite=None because the client and API are on different sites.
const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: authConfig.isProduction,
  sameSite: authConfig.isProduction ? "none" : "lax",
  path: "/api/auth",
  maxAge: authConfig.refreshTokenTtlSeconds * 1000,
};

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async google(req: Request, res: Response): Promise<void> {
    const { credential } = googleLoginSchema.parse(req.body);
    const result = await this.authService.loginWithGoogle(credential, req.get("user-agent"));
    this.sendAuth(res, result);
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const token: string | undefined = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new HttpError(401, "Not signed in.", "NO_SESSION");

    try {
      this.sendAuth(res, await this.authService.refresh(token));
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
      throw err;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    await this.authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    res.json({ success: true });
  }

  async me(req: Request, res: Response): Promise<void> {
    const user = await this.authService.getUser((req as AuthRequest).userId);
    res.json({ success: true, user });
  }

  // Access token goes in the body (kept in memory by the client),
  // refresh token only in the httpOnly cookie
  private sendAuth(res: Response, { user, accessToken, refreshToken }: AuthResult): void {
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.json({ success: true, user, accessToken });
  }
}
