import {
  Component,
  ElementRef,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
  AfterViewInit, // 1. CRITICAL: Add this import
  OnDestroy
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlowbiteService } from '../../services/flowbite.service';
import { initFlowbite } from 'flowbite'; // 2. CRITICAL: DO NOT import 'Datepicker' here!
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true, // Mark true if using a standalone architecture
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, AfterViewInit, OnDestroy { // 3. Added 'AfterViewInit' interface
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly _FlowbiteService = inject(FlowbiteService);
  registerErrorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  @ViewChild('dobPicker') datepickerInput!: ElementRef;
  
  // Keep track of the active instance to avoid memory duplication leaks
  private pickerInstance: any = null;

  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ]),
      username: new FormControl(null, [Validators.minLength(5), Validators.maxLength(20)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      gender: new FormControl(null, [Validators.required, Validators.pattern(/^(male|female)$/)]),
      dateOfBirth: new FormControl('', [Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/),
      ]),
      rePassword: new FormControl(null, [Validators.required]),
    },
    {
      validators: this.confirmPassword,
    },
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this._FlowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }

  // 4. Async browser initialization strategy bypasses the SSR block
  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.datepickerInput && !this.pickerInstance) {
        const nativeInput = this.datepickerInput.nativeElement;

        try {
          // Dynamic client import: Node.js server completely ignores this during builds
          const module = await import('flowbite');
          const DatepickerClass = (module as any).Datepicker;

          if (DatepickerClass) {
            // Instantiate instance cleanly using fallback type validation rules
            this.pickerInstance = new DatepickerClass(nativeInput, {
              autohide: true,
              format: 'mm/dd/yyyy',
            });

            // Listen directly to the native event fired when a calendar card day is clicked
            nativeInput.addEventListener('changeDate', () => {
              const control = this.registerForm.get('dateOfBirth');
              if (control) {
                control.setValue(nativeInput.value);
                control.markAsDirty(); // Informs validation engine that value changed
              }
            });
          }
        } catch (error) {
          console.error('Flowbite datepicker manual runtime loading exception:', error);
        }
      }
    }
  }

  ngOnDestroy() {
    // Unmount and destroy DOM event listeners cleanly when navigating away
    if (this.pickerInstance) {
      this.pickerInstance.destroy();
      this.pickerInstance = null;
    }
  }

  registerFormSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this._AuthService.register(this.registerForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this._Router.navigate(['/auth/login']);
          }
        },
        error: (err) => {
          this.registerErrorMessage.set(err.error.message);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  confirmPassword(form: AbstractControl) {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;

    if (password !== rePassword && form.get('rePassword')?.touched) {
      form.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  showPassword(passwordElement: any) {
    passwordElement.type = passwordElement.type === 'password' ? 'text' : 'password';
  }
}
