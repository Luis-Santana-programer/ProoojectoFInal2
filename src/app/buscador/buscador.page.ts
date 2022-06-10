import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CrudService, Usuario } from '../crud.service';
import { Toast } from '@awesome-cordova-plugins/toast/ngx';
import { TouchSequence } from 'selenium-webdriver';
import { persona } from '../home/home.page';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
})


export class BuscadorPage implements OnInit {
  info;
  id: string;
  yo: Usuario;
  usuarios: Usuario[] =[];
  personas: persona[]=[];
  person: persona;
  constructor(private modalController: ModalController,
    private crud: CrudService, private toast: Toast) { }

  async ngOnInit() {
    this.yo=this.info;
    this.person=new persona;
    //console.log(this.yo);
    this.getNotas()
  }
  doRefresh(event: any){
    console.log('Begin async operation');
    this.getNotas();
    this.getubicacciones();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
  agregar(){
    let repeat =false
    let exist =false
   // console.log(this.yo.ID.length);
    for(let i=0; this.yo.ID.length>i;i++){
      if(this.id == this.yo.ID[i]){
        repeat=true
      }
    }
   // console.log(this.usuarios.length)

    for(let i=0; this.usuarios.length>i;i++){
      if(this.id == this.usuarios[i].id){
        exist=true
      }
    }
    if(repeat==true){
      this.toast.show(`Ya tienes esta ID`, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
    }
    if(exist==true){
      this.yo.ID.push(this.id)
      this.crud.updateNotas(this.yo.id,this.yo);
    }else{
      this.toast.show(`No existe esta ID`, '5000', 'center').subscribe(
        toast => {
          console.log(toast);
        }
      );
    }
  }

  getNotas(){
    this.crud.getNotas().subscribe(result => {
      this.usuarios=result.map(n => {
        return{
        id:n.payload.doc.id,
        ...n.payload.doc.data() as Usuario
        }
      })
      this.getubicacciones();
      //console.log(this.usuarios);
    })
  }

  getubicacciones(){
    this.personas=[]
    console.log(this.yo.ID.length);
    console.log(this.usuarios.length);
    console.log(this.person);
    for(let i=0; this.yo.ID.length>i;i++){
      for(let x=0; this.usuarios.length>x;x++){
        if(this.yo.ID[i]==this.usuarios[x].id){
          this.person.ID=this.usuarios[x].Nombre;
          this.person.ubicaccion=this.usuarios[x].Ubicacion;
          this.personas.push(this.person);
          this.person= new persona;
        }
      }
    }
  }
  back() {
    this.modalController.dismiss();
  }
}
