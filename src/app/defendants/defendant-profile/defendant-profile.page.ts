import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-defendant-profile',
  templateUrl: './defendant-profile.page.html',
  styleUrls: ['./defendant-profile.page.scss'],
})
export class DefendantProfilePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
}
