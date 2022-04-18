import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, CameraSource, CameraPhoto, FilesystemDirectory } from '@capacitor/core';
import { Observable } from 'rxjs';
import { ImageCropService } from './image-crop-service';

const { Camera, Filesystem, Storage } = Plugins;

export interface Photo {
  filepath: string;
  webviewPath: string;
}


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  PHOTO_STORAGE: any;
  /**
   * Creates a FileReader API object
   */
  private fileReader: FileReader = new FileReader();

  constructor(private imageCropModalService: ImageCropService) { }

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      allowEditing: true,
      quality: 100
    });

    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

  }

  // async captureImage() {
  //   const image = await Camera.getPhoto({
  //     quality: 90,
  //     allowEditing: true,
  //     resultType: CameraResultType.DataUrl,
  //     source: CameraSource.Camera
  //   });
  //   this.image = image.dataUrl;

  //   this.imageCropModalService.show(this.image)
  //   .then(result => {
  //     this.image = result;
  //     // Do something with the result, upload to your server maybe?
  //   })
  //   .catch(error => {
  //     // Handle any errors thrown
  //     console.log(error);
  //   })

  // }

  private async savePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);
    const fileName = new Date().getTime() + '.jpeg';
    let imageData, finalData = { filepath: null, webviewPath: null };
    this.imageCropModalService.show(base64Data)
      .then(result => {
        imageData = result;
        finalData = {
          filepath: fileName,
          webviewPath: imageData
        }
        // this.image = result;
        // Do something with the result, upload to your server maybe?
      })
      .catch(error => {
        // Handle any errors thrown
        console.log(error);
      })
    // Write the file to the data directory
    // const savedFile = await Filesystem.writeFile({
    //   path: fileName,
    //   data: imageData,
    //   directory: FilesystemDirectory.Data
    // });


    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return finalData;
    // return {
    //   filepath: fileName,
    //   webviewPath: imageData
    // };
  }

  public async deletePicture(photo: Photo, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    // delete photo file from filesystem
    const filename = photo.filepath
      .substr(photo.filepath.lastIndexOf('/') + 1);

    await Filesystem.deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  /**
 * Uses the FileReader API to capture the input field event, retrieve the selected image
 * and return that as a base64 data URL courtesy of an Observable
 *
 * @param event The DOM event that we are capturing from the File input field
 */
  handleImageSelection(event: Event): Observable<string> {
    const file = (<HTMLInputElement>event.target).files[0];

    this.fileReader.readAsDataURL(file);
    return new Observable((observer) => {
      this.fileReader.onloadend = () => {
        observer.next(<string>this.fileReader.result);
        observer.complete();
      };
    });
  }

}