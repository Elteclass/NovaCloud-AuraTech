import { Component } from '@angular/core';
import { UserProfile } from '../../../../core/models/cloud-file.model';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {

  user: UserProfile = {
    fullName: 'JAIME ALVAREZ',
    role: 'ROL: EJECUTIVO DE VENTAS',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC68hj0edOjfnNUo2SkXhvKF0mdBfZunnHYgHnJqQwPmvufVJEthNFvVNJeS_IZeI3yPokiVEnO4QMT4JlenKGqZ6-nkaQPau8VGw0kSjeGDyK2q7kWIEXqvuwRqHkRRm1lxWCvT_ve6AK8bHMoroIRL-ndVIV4-lvyaL2AYB-HgxG8IiLNuREqXBIQqBLOQnIxnz22_3Ig-qrHDecEm_AlqJeLe8O0MzFfX54mcuMzhbEEG2pvXah31aUNGRDDLhR-iDNottRXpYEe',
  };

  notificationCount = 3;
}
