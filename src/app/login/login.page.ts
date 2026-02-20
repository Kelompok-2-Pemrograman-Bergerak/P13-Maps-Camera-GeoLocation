import { Component } from '@angular/core';
import {
  IonContent, IonInput, IonButton, IonIcon, IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  bicycleOutline, mailOutline, lockClosedOutline,
  logInOutline, personAddOutline
} from 'ionicons/icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonInput, IonButton, IonIcon, IonSpinner,
    CommonModule, FormsModule,
  ]
})
export class LoginPage {
  email = '';
  password = '';
  isLoading = false;

  constructor(private router: Router, private alertCtrl: AlertController) {
    addIcons({ bicycleOutline, mailOutline, lockClosedOutline, logInOutline, personAddOutline });
  }

  async login() {
    if (!this.email || !this.password) { await this.showAlert('Email dan Password wajib diisi'); return; }
    try {
      this.isLoading = true;
      await signInWithEmailAndPassword(auth, this.email.trim(), this.password);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      await this.showAlert(e?.message || 'Login gagal');
    } finally { this.isLoading = false; }
  }

  async register() {
    if (!this.email || !this.password) { await this.showAlert('Email dan Password wajib diisi'); return; }
    try {
      this.isLoading = true;
      await createUserWithEmailAndPassword(auth, this.email.trim(), this.password);
      await this.showAlert('Akun berhasil dibuat! Silakan login.');
    } catch (e: any) {
      await this.showAlert(e?.message || 'Register gagal');
    } finally { this.isLoading = false; }
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({ header: 'Informasi', message, buttons: ['OK'] });
    await alert.present();
  }
}