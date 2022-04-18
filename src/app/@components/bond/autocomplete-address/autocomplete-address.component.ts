import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, Input, ElementRef } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { } from 'googlemaps';
import { UserStore } from '../../../@store/user.store';
declare var google: any;
@Component({
  selector: 'app-autocomplete-address',
  templateUrl: './autocomplete-address.component.html',
  styleUrls: ['./autocomplete-address.component.scss'],
})
export class AutocompleteAddressComponent implements OnInit {

  @ViewChild("addressText", { read: ElementRef, static: false, }) private addressText: ElementRef;

  @Output() setAddress: EventEmitter<any> = new EventEmitter();

  @Input() hideCounty: boolean = false;

  @Input() address = {
    line1: undefined,
    state: undefined,
    county: undefined,
    city: undefined,
    zipcode: undefined
  };

  counties = [];
  states = [];

  constructor(
    private userStore: UserStore
  ) { }

  ngOnInit() {
    this.getStates();
  }

  ngAfterViewInit(){
   this.getPlaceAutocomplete();
  }

  getStates(){
    this.states = this.userStore.getStates();
  }

  getCounties(county = null) {
    this.address.county = undefined;
    this.counties = this.userStore.getCountiesByState(this.address.state);

    if (county) {
      this.address.county = county;
    }
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.addressText.nativeElement,
      {
        componentRestrictions: { country: 'US' },
        types: ['address'],  // 'establishment' / 'address' / 'geocode',
        // fields: ["address_components"]
      });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {

      var componentForm = {
        route: 'long_name',//address
        locality: 'long_name',//city
        administrative_area_level_1: 'long_name',//state
        country: 'long_name',
        postal_code: 'short_name',//zip code
        administrative_area_level_2: 'long_name',//county
        street_number: 'short_name',
      };

      const place = autocomplete.getPlace();

      this.address.line1 = place.formatted_address;

      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];

          if (addressType == 'administrative_area_level_1') {
            this.address.state = val;

          }

          if (addressType == 'administrative_area_level_2') {
            this.address.county = val.replace(' County', '');
            this.getCounties(this.address.county);
          }

          // this.indem.address.county = addressType == 'administrative_area_level_2' ? val : this.indem.address.county;
          this.address.city = addressType == 'locality' ? val : this.address.city;
          this.address.zipcode = addressType == 'postal_code' ? val : this.address.zipcode;
        }
      }
      
      this.invokeEvent();
    });
  }

  invokeEvent() {
    this.setAddress.emit(this.address);
  }

}