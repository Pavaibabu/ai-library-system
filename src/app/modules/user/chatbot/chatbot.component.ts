import { Component } from '@angular/core';
import { ChatbotService, ChatResponse } from '../../core/services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule,FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class chatbotComponent {
  userId:number | null = null;
  isOpen = false;
  userMessage = '';
  chatHistory: { sender: 'user' | 'bot'; message: string }[] = [];

  constructor(private chatbotService: ChatbotService) {}

  openChat() {
    this.isOpen = true;
  }

  closeChat() {
    this.isOpen = false;
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    this.chatHistory.push({ sender: 'user', message: this.userMessage });
    this.userId= Number(localStorage.getItem('userId'));
    this.chatbotService.sendMessage(this.userMessage,this.userId).subscribe({
      next: (res) => {
        this.chatHistory.push({ sender: 'bot', message: res.response });
        this.userMessage = '';
        
      },
      error: () => {
        this.chatHistory.push({ sender: 'bot', message: 'Something went wrong. Please try again.' });
      }
    });
  }
}
