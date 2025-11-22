const STORAGE_KEYS = {
  ACCESS_TOKEN: 'healthpulse_access_token',
  REFRESH_TOKEN: 'healthpulse_refresh_token',
  USER: 'healthpulse_user',
} as const;

export const storageService = {
  // Tokens
  setAccessToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setRefreshToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    storageService.setAccessToken(accessToken);
    storageService.setRefreshToken(refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // User
  setUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (!user || user === 'undefined') return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Clear all
  clearAll: () => {
    storageService.clearTokens();
    storageService.clearUser();
  },
};
