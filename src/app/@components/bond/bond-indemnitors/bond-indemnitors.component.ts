import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-bond-indemnitors',
  templateUrl: './bond-indemnitors.component.html',
  styleUrls: ['./bond-indemnitors.component.scss'],
})
export class BondIndemnitorsComponent implements OnInit {

  @Input() indemnitors = [];

  constructor() { }

  ngOnInit() {}

  getPhone(indem){

    let phone = _.result(_.find(indem.contacts, (contact) => {
      return contact.key === 'Phone';
    }), 'value');

    return phone;
  }

}
