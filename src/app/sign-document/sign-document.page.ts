import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { BondContractsService } from '../services/bond-contracts.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign-document',
  templateUrl: './sign-document.page.html',
  styleUrls: ['./sign-document.page.scss'],
})
export class SignDocumentPage implements OnInit {

  spinner = false;
  sessionUrl: SafeResourceUrl;

  constructor(
    private contractsService: BondContractsService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getContract();
  }
  
  getContract(){
    let contractId = this.route.snapshot.paramMap.get('contractId');
    let partyIndex = this.route.snapshot.paramMap.get('partyIndex');

    this.spinner = true;
    this.contractsService
    .getContract(contractId)
    .subscribe(
      contract => {
        this.sessionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(contract.embeddedSigningSessions[partyIndex].embeddedSessionURL);
        this.spinner = false;
      },
      errors => {
        console.log(errors);
        this.spinner = false;
      }
    )
  }
}
