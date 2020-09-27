import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public email: string = null;
  constructor(private router: Router, private toastr: ToastrService, private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.getUser().subscribe((user) => {
      this.email = user?.email;
      console.log(user);
    });

  }
  async doSignOut() {
    try {

      await this.auth.signOut();
      this.router.navigateByUrl('/signin');
      this.toastr.success('Logout success');
      this.email = null;

    } catch (error) {
      console.log(error);
      this.toastr.error("Failed to signout!");
    }

  }

}
