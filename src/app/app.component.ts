import { Component } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'diary';
  session: any;

  constructor(private readonly supabase: SupabaseService) {
    
  }

  async ngOnInit() {
    this.session = await this.supabase.getSession();
    this.supabase.authChanges((_, session) => (this.session = session))
  }
}
