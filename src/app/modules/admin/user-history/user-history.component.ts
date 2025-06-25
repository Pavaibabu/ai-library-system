import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-history',
  imports: [CommonModule],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.css'
})
export class UserHistoryComponent {
  userId!:number;
  borrowHistory:any[] =[];
  
  constructor (private route:ActivatedRoute,private userService:UserService) {
  }
  ngOnInit() {
    this.userId=Number(this.route.snapshot.paramMap.get('id'));
  this.loadBorrowHistory();
};

  loadBorrowHistory() {
    this.userService.getBorrowHistory(this.userId).subscribe({
      next: (data) => {
          this.borrowHistory = data;
        },
      error:(err)=>{
        console.error('Error fetching user borrowHistory:', err);
        alert("Unable to view BorrowHistory");
      }
    })
}}