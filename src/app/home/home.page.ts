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
import { identity } from 'rxjs';
const config: BackgroundGeolocationConfig = {
  desiredAccuracy: 10,
  stationaryRadius: 20,
  distanceFilter: 30,
  debug: true, //  enable this hear sounds for background-geolocation life-cycle.
  stopOnTerminate: false, // enable this to clear background location settings when the app terminates
};

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
  nuestrousuario: Usuario;
  myInterval: any;
  iniciado: boolean=false;
  nombre: string;
  Contrasena: string;

  constructor(private backgroundGeolocation: BackgroundGeolocation, private geolocation: Geolocation,private backgroundMode: BackgroundMode, private locationAccuracy: LocationAccuracy, private toast: Toast,private vibration: Vibration,public foregroundService: ForegroundService, private crud: CrudService,
    public db: AngularFireDatabase) {
    this.backgroundMode.disableWebViewOptimizations();
  }

  ngOnInit(){
    this.getNotas();
    this.backgroundGeolocation.configure(config)
  .then(() => {
    this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
      console.log(location);
      this.myInterval = setInterval(()=>this.GPS(),10000)
      // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
      // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
      // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
      this.backgroundGeolocation.finish(); // FOR IOS ONLY
    });

  });
  }
  
  inicio(){
    this.getNotas();
    for(let i=0; i<this.usuarios.length ;i++ ){
      if(this.usuarios[i].Nombre==this.nombre && this.usuarios[i].Contrasena==this.Contrasena){
      this.iniciado=true
      this.nuestrousuario=this.usuarios[i];
      }
    }

    if(this.iniciado==true){
      this.toast.show(`Bienvenido`, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
    }
  }

  crear(){
    this.crud.createNota(
      {
        Nombre: this.nombre,
        Contrasena: this.Contrasena,
        Ubicacion: ''
      }
    ).then(() => {
      this.usuario = new Usuario;
      this.getNotas();
      this.inicio();
    });
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
  GPS(){
    
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      alert(resp.coords.latitude + " " + resp.coords.longitude);
      console.log(resp.coords.latitude + " " + resp.coords.longitude);
      //this.create();
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
      this.backgroundGeolocation.start();
  }


  Deactivate(){
    this.stopService();
    clearInterval(this.myInterval);
    this.backgroundGeolocation.stop();

  }
}
