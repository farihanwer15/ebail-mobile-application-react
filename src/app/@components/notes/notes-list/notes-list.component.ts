import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LoadingController, ModalController, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { NotesService } from 'src/app/services/notes.service';
import { NoteFormComponent } from '../note-form/note-form.component';
import { Subscription } from 'rxjs';
import { UserStore } from 'src/app/@store/user.store';
@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit, OnDestroy {
  @Input() defendantId;
  @Input() bondId;
  @Input() segment = 'defendant';
  
  defendantNotes = {
    data: [],
    meta: {}
  };
  
  forfeitureNotes = {
    data: [],
    meta: {}
  };

  filter = {
    tag: ''
  }
  
  noteAddedSubscription: Subscription;
  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private notesService: NotesService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.initEvents();
    this.getDefendantNotes();
    this.getNotes();
  }

  
  initEvents(){
    this.noteAddedSubscription = this.notesService
    .noteAdded$
    .subscribe(
      (type) => {
        if(type === 'defendant'){
          this.getDefendantNotes()
        }

        if(type === 'forfeiture'){
          this.getForfeitureNotes()
        }
        
      }
    )
  }
  async getDefendantNotes(){
    const loading = await this.loadingController.create();
    await loading.present();

    if(this.defendantId){
      this.notesService
      .getNotes({
        belongsToUserId: this.defendantId,
        type: 'defendant',
        sortBy: 'createdAt',
        orderBy: 'DESC'
      })
      .subscribe(
        async notes => {
          this.defendantNotes = notes;
          await loading.dismiss();
        },
        async errors => {
          console.log(errors);
          await loading.dismiss();
        }
      )
    }
  }

  async getForfeitureNotes(){
    
    const loading = await this.loadingController.create();
    await loading.present();

    if(this.defendantId){
      this.notesService
      .getNotes({
        belongsToUserId: this.defendantId,
        type: 'forfeiture',
        sortBy: 'createdAt',
        orderBy: 'DESC'
      })
      .subscribe(
        async notes => {
          this.forfeitureNotes = notes;
          await loading.dismiss();
        },
        async errors => {
          console.log(errors);
          await loading.dismiss();
        }
      )
    }
  }

  async openAddNoteWindow(){

    const modal = await this.modalController.create({
      component: NoteFormComponent,
      componentProps: {
        defendantId: this.defendantId,
        bondId:this.bondId
      }
    });

    await modal.present();
    
  }

  async openActionSheet(note){
    const actionSheet = await this.actionSheetController.create({
      header: 'Court Date',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deleteNote(note);
        }
      }, 
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.editNote(note);
        }
      }, 
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  
  async editNote(note){
    const modal = this.modalController.create({
      component: NoteFormComponent,
      componentProps: {
        noteId: note._id,
        defendantId: this.defendantId
      }
    });

    (await modal).present();
  }
  
  async deleteNote(note){
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete this note?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, 
        {
          text: 'Yes',
          handler: async () => {
            
            const loading = await this.loadingController.create({
              message: 'Please wait...'
            });
            await loading.present();
            
            this.notesService.deleteNote(note._id)
          .subscribe(
            async () => {

              const toast = await this.toastController.create({
                color: 'success',
                duration: 3000,
                message: 'Note has been deleted successfully.',
                showCloseButton: true,
                position: 'top'
              });
              await toast.present();
              await loading.dismiss();

              if(note.type === 'defendant'){
                this.getDefendantNotes()
              }
              else if(note.type === 'forfeiture'){
                this.getForfeitureNotes();
              }
              
              
            },
            async errors => {
              console.log(errors);
              await loading.dismiss();
            }
          );
          }
        }
      ]
    });

    await alert.present();
  }

  segmentChanged(segment){
    this.segment = segment.detail.value;
    if(this.segment === 'defendant'){
      this.getDefendantNotes();
    }
    if(this.segment === 'forfeiture'){
      this.getForfeitureNotes();
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

 async onNoteTagChange(){
    this.getNotes()
  }

  async getNotes(){
    if(this.defendantId){
      this.notesService
      .getNotes({
        belongsToUserId: this.defendantId,
        tags: this.filter.tag !== '' ? [this.filter.tag] : undefined,
        sortBy: 'createdAt',
        orderBy: 'DESC'
      })
      .subscribe(
        notes => {
          this.defendantNotes = notes;
        },
        errors => {
          console.log(errors);
        }
      )
    }
  }

  ngOnDestroy(){
    this.noteAddedSubscription.unsubscribe();
  }

}
