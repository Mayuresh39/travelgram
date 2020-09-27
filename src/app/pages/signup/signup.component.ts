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
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public imageUrl: string = "https://news.northeastern.edu/wp-content/uploads/2018/08/KingHuskyHead.jpg";
  public updaloadPercent: number = null;

  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router,
    private fireStoreage: AngularFireStorage, private fireDB: AngularFireDatabase) { }

  ngOnInit(): void {
  }

  public onSubmit(f: NgForm) {

    const { email, password, username, country, bio, name } = f.form.value;

    this.auth.signUp(email, password)
      .then((response) => {
        console.log(response);
        const { uid } = response.user;

        //set this user json in users for this perticular uid(uid of registred user)
        this.fireDB.object(`/users/${uid}`).set({ id: uid, email: email, username: username, name: name, bio: bio, country: country, picture: this.imageUrl })
      })
      .then(() => {
        this.router.navigateByUrl("/");
        this.toastr.success("Congrats You are Registered!")
      })
      .catch((error) => {
        console.log(error);
        this.toastr.error("Failed to registered! Please try again");
      });
  }


  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    console.log(file);
    //instead of uuid it should be file name but file name can be same for different images hence renaming the file with uuid
    let blob = file.slice(0, file.size, file.type);
    let renamedFile = new File([blob], uuidv4(), { type: file.type });

    const filePath = renamedFile.name;
    const fileRef = this.fireStoreage.ref(filePath);

    const task = this.fireStoreage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.updaloadPercent = percentage;
    });

    task.snapshotChanges().pipe(finalize(() => {
      fileRef.getDownloadURL().subscribe((url) => {
        this.imageUrl = url;
        this.toastr.success("image uploaded!")
      });
    })
    ).subscribe();
  }



}
