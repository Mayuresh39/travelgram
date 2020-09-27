import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public users = [];
  public posts = [];
  public isLoading: boolean = false;
  constructor(private db: AngularFireDatabase, private store: AngularFireStorage, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.isLoading = true;

    //get all users
    this.db.object('/users/').
      valueChanges().subscribe((obj) => {
        if (obj) {
          this.users = Object.values(obj);
          this.isLoading = false;
        } else {
          this.toastr.error("No user Found");
          this.users = [];
          this.isLoading = false;
        }
      });


    //grab all posts
    this.db.object('/posts').
      valueChanges().subscribe((obj) => {
        if (obj) {
          this.posts = Object.values(obj).sort((a, b) => b.date - a.date);
          this.isLoading = false;
        }
        else {
          this.posts = [];
          this.isLoading = false;
          this.toastr.error("No posts Available");
        }
      });

  }

}
