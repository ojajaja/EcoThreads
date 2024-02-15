import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { ChatService } from '../shared/services/chat.service';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';
import { Message } from '../shared/models/chat';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);

@Component({
  selector: 'app-chat',
  templateUrl: './direct.page.html',
  styleUrls: ['./direct.page.scss'],
})
export class DirectPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent;
  id: string;
  name: string;
  chats: Observable<any[]>;
  message: string;
  isLoading: boolean;
  otherParticipantName: string;
  private hasScrolled: boolean = false;
  private chatsSubscription: Subscription;
  capturedImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    public chatService: ChatService,
    private router: Router,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.navCtrl.back();
      return;
    }
    this.id = id;
    this.chatService.getChatRoomMessages(this.id);
    this.chats = this.chatService.selectedChatRoomMessages;
  
    this.route.paramMap.subscribe(params => {
      const chatRoomId = params.get('id');
      if (chatRoomId) {
        this.id = chatRoomId;
        this.chatService.getChatRoomMessages(chatRoomId);
  
        // Fetch the other participant's name
        this.chatService.getOtherParticipantName(chatRoomId).subscribe(name => {
          this.otherParticipantName = name;
          this.name = name;
        }, error => {
          console.error('Error fetching other participant name:', error);
          this.name = 'Unknown';
        });
      } else {
        this.navCtrl.back();
      }
    });
    this.chatsSubscription = this.chatService.selectedChatRoomMessages.subscribe(messages => {
      if (messages && messages.length && !this.hasScrolled) {
        setTimeout(() => {
          this.content.scrollToBottom(300);
          this.hasScrolled = true;
        }, 300);
      }
    });
  }

  scrollToBottom() {
    console.log('scroll bottom');
    if(this.chats) this.content.scrollToBottom(500);
  }

  public sendTextMessage() {
    if (!this.message.trim()) return; // Check if the message is not empty
    
    // Fix: Correctly calling chatService's sendMessage
    this.processMessage(this.message, 'text'); // Renamed to processMessage for clarity
    this.message = ''; // Clear the message input
  }
  

  async processMessage(messageContent: string, type: 'text' | 'image') {
    if (!messageContent || messageContent.trim() === '') {
      return;
    }
    this.isLoading = true;
  
    let message: Message = {
      messageText: messageContent,
      sender: this.chatService.currentUserId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      type,
    };

    try {
      // Fix: Correctly calling the chatService's sendMessage method
      await this.chatService.sendMessage(this.id, messageContent, type);
      this.message = ''; // Clearing the message input field if it's a text message
      this.isLoading = false;
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      this.isLoading = false;
    }
  }
  
  public isImageUrl(text: string): boolean {
    // This regex checks for a Firebase Storage URL that includes '/o/' and '?alt=media'
    const firebaseStorageRegex = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/.+?\?alt=media/;
    return firebaseStorageRegex.test(text);
  }
  
  
  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
  
      const imageBlob = this.base64ToBlob(image.base64String, 'image/jpeg');
      this.uploadImage(imageBlob);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }
  
  uploadImage(imageBlob: Blob) {
    const filePath = `chat_images/${new Date().getTime()}.jpeg`; // Customize path as needed
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(filePath).put(imageBlob);
  
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null, // Progress handler placeholder
      error => console.error('Upload error:', error),
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          if (downloadURL) {
            this.processMessage(downloadURL, 'image');
          } else {
            console.error('No download URL found');
          }
        });
      }
    );
  }
  

  navigateChat() {
    this.router.navigate(['chat'])
  }

  // Utility function to convert Base64 image string to a Blob
private base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}


}
