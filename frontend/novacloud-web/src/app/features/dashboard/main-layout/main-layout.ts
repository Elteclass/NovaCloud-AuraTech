import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, Sidebar, Topbar],
  templateUrl: './main-layout.html'
})
export class MainLayout {} // O MainLayoutComponent, según como lo haya generado tu CLI