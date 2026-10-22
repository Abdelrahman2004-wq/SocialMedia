import { Component, inject, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from 'express';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  loginErrorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  loginForm: FormGroup = new FormGroup(
    {
      // Email Validation
      email: new FormControl(null, [Validators.required, Validators.email]),

      // Password Validation
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-Z][a-z][0-9]{3}$/),
      ]),
    },
    {
      updateOn: 'submit',
    },
  );

  loginFormSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      this.isLoading.set(true);
      //Calling API
      this._AuthService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          if (res.success) {
            this._Router.navigate(['/feed']);
          }
        },
        error: (err) => {
          console.log(err.error.message);
          this.loginErrorMessage.set(err.error.message);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.loginForm.markAllAsTouched;
    }
  }
}
