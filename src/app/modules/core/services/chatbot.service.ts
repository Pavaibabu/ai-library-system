import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  intent: string;
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:5020/api/Chat/ask';  


  constructor(private http: HttpClient) {}
 

  sendMessage(message: string,user_id:number): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.apiUrl, { message, user_id });
  }


}
