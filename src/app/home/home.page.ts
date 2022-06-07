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
import { ModalController } from '@ionic/angular';
import { BuscadorPage } from '../buscador/buscador.page';

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
  ubicacion: string;
  probando: boolean=false;
  activado : boolean=false;
  constructor(private backgroundGeolocation: BackgroundGeolocation,private modalController: ModalController, private geolocation: Geolocation,private backgroundMode: BackgroundMode, private locationAccuracy: LocationAccuracy, private toast: Toast,private vibration: Vibration,public foregroundService: ForegroundService, private crud: CrudService,
    public db: AngularFireDatabase) {
    this.backgroundMode.disableWebViewOptimizations();
  }

  ngOnInit(){
    this.getNotas();
    this.backgroundGeolocation.configure(config)
  .then(() => {
    this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
      console.log(location);
      this.myInterval = setInterval(()=>this.actualizar(),10000)
      this.backgroundGeolocation.finish(); 
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
      console.log(resp.coords.latitude + " " + resp.coords.longitude);
      //this.create();
      this.vibra();
      this.toast.show('Activado, ubicacion actual: '+resp.coords.latitude + " " + resp.coords.longitude, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  actualizar(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.ubicacion=resp.coords.latitude + " " + resp.coords.longitude;
      this.nuestrousuario.Ubicacion=this.ubicacion;
      alert(this.nuestrousuario.Ubicacion);
      this.edit(this.nuestrousuario.id, this.nuestrousuario);
      //this.create();
     }).catch((error) => {
       console.log('Error getting location', error);
     });
    
  }
  
  edit(id:any, usuario: Usuario){
    this.crud.updateNotas(id, {
      Nombre: usuario.Nombre,
      Contrasena: usuario.Contrasena,
      Ubicacion: usuario.Ubicacion}).then(()=> {
      this.getNotas();
    })
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
    this.activado=true;
    this.startService();
    this.GPS();
    this.location();
      this.backgroundGeolocation.start();
  }


  Deactivate(){
    this.activado=false;
    this.stopService();
    clearInterval(this.myInterval);
    this.myInterval = null;

    this.backgroundGeolocation.stop();

  }


  async modales(){
    let info=this.nuestrousuario;

    const modal = await this.modalController.create({
        component: BuscadorPage,
        componentProps: { info }
    });
    return await modal.present();
  }
}
