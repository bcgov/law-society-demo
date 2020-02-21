import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AppConfigService } from './services/app-config.service';
import { HeaderComponent } from './components/header/header.component';

const keycloakService = new KeycloakService();

export function configInitializer(appConfigService: AppConfigService) {
  return () => appConfigService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    NotFoundComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    KeycloakAngularModule
  ],
  providers: [
    {
      provide: KeycloakService,
      useValue: keycloakService
    },
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configInitializer,
      deps: [AppConfigService],
      multi: true
    }
  ],
  entryComponents: [AppComponent]
})
export class AppModule {
  ngDoBootstrap(app) {
    keycloakService
      .init({
        config: {
          url: AppConfigService.settings.keycloak.url,
          realm: AppConfigService.settings.keycloak.realm,
          clientId: AppConfigService.settings.keycloak.clientId
        },
        initOptions: {
          onLoad: 'check-sso',
          checkLoginIframe: false
        },
        bearerExcludedUrls: ['/assets', '/login']
      })
      .then(() => {
        console.log('[ngDoBootstrap] bootstrap app');
        app.bootstrap(AppComponent);
      })
      .catch(error =>
        console.error('[ngDoBootstrap] init Keycloak failed', error)
      );
  }
}
