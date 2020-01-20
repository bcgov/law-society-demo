import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: string;

  constructor(private keycloakService: KeycloakService) {
    this.keycloakService.loadUserProfile();
  }

  ngOnInit() {
    this.keycloakService
      .loadUserProfile()
      .then((profile: Keycloak.KeycloakProfile) => {
        if (profile.firstName && profile.lastName) {
          this.currentUser = `${profile.firstName} ${profile.lastName}`;
        } else {
          this.currentUser = profile.username;
        }
      });
  }
}
