import { Component, OnInit,Input } from '@angular/core';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {
  markerOptions: google.maps.MarkerOptions = {draggable: false};
 // markerPositions: google.maps.LatLngLiteral[] = [];
  @Input() markerPositions
  @Input() mapUrl 
  @Input() center 
  constructor(
    private modalController: ModalController,

  ) { }

  ngOnInit() {}
  async closeModal(){
    await this.modalController.dismiss();
  }


}
