import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SairComponent } from './sair/sair.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'sair', component: SairComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
