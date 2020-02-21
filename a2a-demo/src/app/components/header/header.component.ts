import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean;

  constructor(private keycloakService: KeycloakService) {
    this.keycloakService
      .isLoggedIn()
      .then(isLoggedIn => (this.isLoggedIn = isLoggedIn));
  }

  ngOnInit() {}

  async logout(uri?: string) {
    return this.keycloakService.logout(uri || '');
  }
}
