import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CrudService, Usuario } from '../crud.service';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
})


export class BuscadorPage implements OnInit {
  info;
  yo: Usuario;
  constructor(private modalController: ModalController,
    private api: CrudService) { }

  async ngOnInit() {
    this.yo=this.info;
    console.log(this.yo);
  }
  doRefresh(event: any){
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
  agregar(){

  }
  back() {
    this.modalController.dismiss();
  }
}
