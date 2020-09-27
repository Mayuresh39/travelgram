import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { faThumbsDown, faThumbsUp, faShareSquare } from "@fortawesome/free-regular-svg-icons";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit, OnChanges {

  @Input() post;

  public faThumbsDown = faThumbsDown;
  public faThumbsUp = faThumbsUp;
  public faShareSquare = faShareSquare;
  public uid = null;
  public upVote: number = 0;
  public downVote: number = 0;

  constructor(private db: AngularFireDatabase, private auth: AuthService) { }

  ngOnChanges(): void {
    if (this.post.vote) {
      Object.values(this.post.vote).map((val: any) => {
        if (val.upvote) {
          this.upVote += 1;
        }
        if (val.downvote) {
          this.downVote += 1;
        }
      });
    }
  }

  ngOnInit(): void {

    this.auth.getUser().subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  upVotePost() {
    console.log("Up voting");
    this.db.object(`/posts/${this.post?.id}/vote/${this.uid}`).set({
      upvote: 1,
    });
  }

  downVotePost() {
    console.log("Down voting");
    this.db.object(`/posts/${this.post?.id}/vote/${this.uid}`).set({
      downvote: 1,
    });
  }


  getInstaUrl() {
    return `https://instagram.com/${this.post.username}`;
  }



}
