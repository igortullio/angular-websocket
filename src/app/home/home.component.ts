import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  mensagemRecebida: string;
  mensagem: string;

  constructor(private websocketService: WebsocketService) {
    this.websocketService.connectServer();
  }

  ngOnInit() {
    this.websocketService.onMessage('/topic/greetings').subscribe(res => {
      this.mensagemRecebida = res.content;
    });
  }

  sendMensage() {
    this.websocketService.send('/app/hello', this.mensagem);
  }

  ngOnDestroy() {
    this.websocketService.disconnected();
  }
}
