import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
export class Usuario{
  id?: string;
  Nombre: string;
  Contrasena: string;
  Ubicacion: string;
  ID: any;

}

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private ngFireStore: AngularFirestore) { }

  createNota(usuario: Usuario){
    return this.ngFireStore.collection('Usuarios').add(usuario);
  }

  getNotas(){
    return this.ngFireStore.collection('Usuarios').snapshotChanges();
  }
  getNota(id: any){
    return this.ngFireStore.collection('Usuarios').doc(id).valueChanges();
  }
  updateNotas(id: any, usuario:Usuario){
    return this.ngFireStore.collection('Usuarios').doc(id).update(usuario);
  }
  deleteNotas(id: any){
    return this.ngFireStore.doc('Usuarios/' + id).delete();
  }
}
