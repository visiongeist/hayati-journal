import { Component, OnInit } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { SupabaseService } from '../../supabase.service'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  loading = false

  codeRequested = false

  signInForm = this.formBuilder.group({
    email: '',
    otp: '',
  })

  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) { }

  async onSubmit(): Promise<void> {
    try {
      this.loading = true
      const email = this.signInForm.value.email as string
      const token = this.signInForm.value.otp as string
      if (this.codeRequested) { // OTP confirm flow
        const { error } = await this.supabase.confirmOtp(email, token)
        if (error) throw error
        this.signInForm.reset();
      } else {
        const { error } = await this.supabase.signIn(email)
        if (error) throw error
        this.codeRequested = true;
        alert('Check your email for the login link!')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      this.loading = false
    }
  }
}