import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from "@angular/fire/database";
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-addposts',
  templateUrl: './addposts.component.html',
  styleUrls: ['./addposts.component.css']
})
export class AddpostsComponent implements OnInit {

  public locationName: string;
  public description: string;
  public picture: string = null;

  public user = null;
  public uploadPercent = null;

  constructor(private auth: AuthService, private fireStore: AngularFireStorage, private db: AngularFireDatabase, private toastr: ToastrService, private router: Router) {

    auth.getUser().subscribe((user) => {
      this.db.object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        });
    });

  }

  ngOnInit(): void {

  }

  onSubmit() {
    const uid = uuidv4();
    this.db.object(`/posts/${uid}`).
      set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        imageUrl: this.picture,
        by: this.user.name,
        username: this.user.username,
        date: Date.now()
      })
      .then(() => {
        this.toastr.success("Added Post!");
        this.router.navigateByUrl('');
      })
      .catch((error) => {
        this.toastr.error("Failed to Add Post! Try Again!");
      })
  }


  async uploadFile(event) {

    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    let blob = file.slice(0, file.size, file.type);

    let renamedFile = new File([blob], uuidv4(), { type: file.type });

    let filePath = renamedFile.name;

    let fileRef = this.fireStore.ref(filePath);

    let task = this.fireStore.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percent) => {
      this.uploadPercent = percent;
    });

    task.snapshotChanges().pipe(finalize(() => {
      fileRef.getDownloadURL().subscribe((url) => {
        this.picture = url;
        this.toastr.success('Image Uploaded');
      });
    })).subscribe();
  }

}
