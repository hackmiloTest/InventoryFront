import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../service/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  formData: any = {
    email: '',
    password: ''
  };

  message: string | null = null;

  async handleSubmit(){
    if (!this.formData.email || !this.formData.password) {
      this.showMessage("All fields are required");
      return;
    }
  
    try {
      const response: any = await firstValueFrom(this.apiService.loginUser(this.formData));
      
      if (response.status === 200) {
        this.apiService.encryptAndSaveToStorage('token', response.token);
        this.apiService.encryptAndSaveToStorage('role', response.role);
  
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/profile';
        this.router.navigate([returnUrl]);
      }
  
    } catch (error: any) {
      console.log(error);
      this.showMessage(error?.error?.message || error?.message || "Unable to login user");
    }
  }
  

  showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = null
    }, 4000)
  }

}
