import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Toast } from '@awesome-cordova-plugins/toast/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { ForegroundService } from '@awesome-cordova-plugins/foreground-service/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { CrudService } from '../crud.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@awesome-cordova-plugins/background-geolocation/ngx';

export class Usuario{
  id?: string;
  Nombre: string;
  Contrasena: string;
  Ubicacion: string;

}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  usuarios: Usuario[]= [];
  usuario: Usuario;
  myInterval: any;
  constructor(private backgroundGeolocation: BackgroundGeolocation, private geolocation: Geolocation,private backgroundMode: BackgroundMode, private locationAccuracy: LocationAccuracy, private toast: Toast,private vibration: Vibration,public foregroundService: ForegroundService, private crud: CrudService,
    public db: AngularFireDatabase) {
    this.backgroundMode.disableWebViewOptimizations();
   

    
  }
  ngOnInit(){
    this.getNotas();
  }
  getNotas(){
    this.crud.getNotas().subscribe(result => {
      this.usuarios=result.map(n => {
        return{
        id:n.payload.doc.id,
        ...n.payload.doc.data() as Usuario
        }
      })
      console.log(this.usuarios);
    })
  }
  create(){
    this.crud.createNota(
      {
        Nombre:'', //this.usuario.Nombre,
        Contrasena: '',
        Ubicacion: ''
      }
    ).then(() => {
      this.usuario = new Usuario;
      this.getNotas();
    });
  }
  GPS(){
    
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      alert(resp.coords.latitude + " " + resp.coords.longitude);
      console.log(resp.coords.latitude + " " + resp.coords.longitude);
      this.create();
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  location(){
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {

      if(canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => console.log('Request successful'),
          error => console.log('Error requesting location permissions', error)
        );
      }
    });

  }

  toasty(){
    this.toast.show(`I'm a toast`, '5000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );
    
  }


  vibra(){
    console.log("Vibrando")
    this.vibration.vibrate(100);
  }
  
  startService() {
    // Notification importance is optional, the default is 1 - Low (no sound or vibration)
    this.foregroundService.start('GPS Running', 'Background Service', 'drawable/fsicon');
   }
   stopService() {
    // Disable the foreground service
    this.foregroundService.stop();
   }
   
  Activate(){
    
    this.startService();
        this.backgroundMode.on('enable').subscribe(result=>{
          this.backgroundMode.disableWebViewOptimizations();
      this.myInterval = setInterval(()=>this.GPS(),10000)
      alert("test");
    })
    this.backgroundMode.enable();
    

    
    
     
  }


  Deactivate(){
    this.stopService();
    this.backgroundMode.disable();
    clearInterval(this.myInterval);
  }
}
