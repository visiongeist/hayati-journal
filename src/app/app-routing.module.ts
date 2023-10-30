import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiaryEntryComponent } from './pages/diary-entry/diary-entry.component';
import { StartComponent } from './pages/start/start.component';

const routes: Routes = [
  {
    path: '', component: StartComponent,
    children: [
      { path: '', component: DiaryEntryComponent },
    ]
  },
  { path: '',   redirectTo: '', pathMatch: 'full' }, // redirect
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
