export interface AppConfig {
  env: string;
  name: string;
  authentication: {
    enabled: boolean;
    oidcSettings: {
      authority: string;
      clientId: string;
      redirectUri: string;
      redirect_uri: string;
      responseType: string;
      scope: string;
      automaticSilentRenew: string;
      silentRedirectUri: string;
      post_logout_redirect_uri: string;
      extraQueryParams: any;
    };
  };
}

export class Configuration {
  public app!: AppConfig;
}
