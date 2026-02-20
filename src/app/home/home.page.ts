import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import {
  IonHeader, IonToolbar, IonContent,
  IonButtons, IonButton, IonIcon, IonInput,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  logOutOutline, cubeOutline, barcodeOutline, bicycleOutline,
  cameraOutline, sendOutline, checkmarkCircle,
  warningOutline, navigateOutline, mapOutline, layersOutline, cloudOutline
} from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { firestore } from '../firebase-config';

declare const L: any;

interface MapLayer {
  id: string;
  label: string;
  icon: string;
  url: string;
  attribution: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonContent,
    IonButtons, IonButton, IonIcon, IonInput,
    CommonModule, FormsModule, DecimalPipe
  ]
})
export class HomePage implements AfterViewInit, OnDestroy {

  @ViewChild('map', { static: false }) mapRef!: ElementRef;
  leafletMap: any;
  marker: any;
  tileLayer: any;

  noResi = '';
  latitude = 0;
  longitude = 0;
  fotoPreview: string | undefined;
  mapState: 'loading' | 'ready' | 'error' | 'location-off' = 'loading';
  mapErrorMsg = '';
  activeLayer = 'street';
  auth = getAuth();

  mapLayers: MapLayer[] = [
    {
      id: 'street',
      label: 'Jalan',
      icon: 'map-outline',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    {
      id: 'satellite',
      label: 'Satelit',
      icon: 'cloud-outline',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    {
      id: 'terrain',
      label: 'Terrain',
      icon: 'layers-outline',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap'
    }
  ];

  constructor(private alertCtrl: AlertController, private router: Router) {
    addIcons({
      logOutOutline, cubeOutline, barcodeOutline, bicycleOutline,
      cameraOutline, sendOutline, checkmarkCircle,
      warningOutline, navigateOutline, mapOutline, layersOutline, cloudOutline
    });
  }

  async ngAfterViewInit() {
    setTimeout(() => this.initMap(), 400);
  }

  ngOnDestroy() {
    if (this.leafletMap) { this.leafletMap.remove(); this.leafletMap = null; }
  }

  async initMap() {
    try {
      this.mapState = 'loading';
      if (typeof L === 'undefined') {
        this.mapState = 'error';
        this.mapErrorMsg = 'Leaflet gagal dimuat.';
        return;
      }
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') {
        this.mapState = 'error';
        this.mapErrorMsg = 'Izin lokasi ditolak.';
        this.renderLeaflet(-2.5, 118, 5);
        return;
      }
      try {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        this.renderLeaflet(this.latitude, this.longitude, 17);
        this.mapState = 'ready';
      } catch (gpsErr: any) {
        const msg: string = gpsErr?.message ?? '';
        this.mapState = msg.includes('disabled') || msg.includes('unavailable') ? 'location-off' : 'error';
        this.mapErrorMsg = 'Gagal ambil lokasi.';
        this.renderLeaflet(-2.5, 118, 5);
      }
    } catch (err: any) {
      this.mapState = 'error';
      this.mapErrorMsg = err?.message ?? 'Gagal memuat peta';
    }
  }

  renderLeaflet(lat: number, lng: number, zoom: number) {
    if (!this.mapRef?.nativeElement) return;
    if (this.leafletMap) { this.leafletMap.remove(); this.leafletMap = null; }

    this.leafletMap = L.map(this.mapRef.nativeElement, { center: [lat, lng], zoom, zoomControl: true });

    const layer = this.mapLayers.find(l => l.id === this.activeLayer)!;
    this.tileLayer = L.tileLayer(layer.url, { attribution: layer.attribution, maxZoom: 19 })
      .addTo(this.leafletMap);

    if (lat !== -2.5 && lat !== 0) {
      const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker"><div class="marker-dot"></div><div class="marker-pulse"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.marker = L.marker([lat, lng], { icon }).addTo(this.leafletMap)
        .bindPopup('📍 Lokasi Kurir').openPopup();
    }
    setTimeout(() => this.leafletMap?.invalidateSize(), 300);
  }

  switchLayer(layerId: string) {
    this.activeLayer = layerId;
    if (!this.leafletMap) return;
    if (this.tileLayer) { this.leafletMap.removeLayer(this.tileLayer); }
    const layer = this.mapLayers.find(l => l.id === layerId)!;
    this.tileLayer = L.tileLayer(layer.url, { attribution: layer.attribution, maxZoom: 19 })
      .addTo(this.leafletMap);
  }

  async kirimPaket() {
    if (!this.noResi.trim()) { await this.showAlert('No Resi wajib diisi!'); return; }
    try {
      try {
        const pos = await Geolocation.getCurrentPosition({ timeout: 8000 });
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        if (this.leafletMap && this.marker) {
          this.marker.setLatLng([this.latitude, this.longitude]);
          this.leafletMap.setView([this.latitude, this.longitude], 17);
        }
      } catch {
        if (this.latitude === 0) await this.showAlert('GPS dimatikan. Koordinat tidak akan tercatat.');
      }

      const camPerm = await Camera.requestPermissions({ permissions: ['camera'] });
      if (camPerm.camera === 'denied') { await this.showAlert('Izin kamera ditolak.'); return; }

      const image = await Camera.getPhoto({ quality: 80, resultType: CameraResultType.Uri, source: CameraSource.Camera });
      this.fotoPreview = image.webPath;

      const user = this.auth.currentUser;
      if (!user) { await this.showAlert('Sesi habis. Silakan login ulang.'); this.router.navigate(['/login']); return; }

      await addDoc(collection(firestore, 'pengiriman'), {
        idKurir: user.uid,
        emailKurir: user.email,
        noResi: this.noResi.trim(),
        latitude: this.latitude,
        longitude: this.longitude,
        foto: image.webPath ?? '',
        status: 'Terkirim',
        timestamp: new Date()
      });

      await this.showAlert('Pengiriman berhasil dicatat! ✅');
      this.noResi = '';
    } catch (error: any) {
      const msg: string = error?.message ?? JSON.stringify(error);
      if (msg.includes('cancel') || msg.includes('Camera_No_Image_Selected') || msg.includes('No image picked')) return;
      await this.showAlert('Terjadi kesalahan:\n' + msg);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async showAlert(message: string) {
    const alert = await this.alertCtrl.create({ header: 'Informasi', message, buttons: ['OK'] });
    await alert.present();
  }
}