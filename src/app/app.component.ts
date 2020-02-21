import { WebsocketService } from './websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular9-springboot-websocket';

  mensagemRecebida: string;
  mensagem: string;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.websocketService.onMessage('/topic/greetings').subscribe(res => {
      this.mensagemRecebida = res.content;
    });
  }

  sendMensage() {
    this.websocketService.send('/app/hello', this.mensagem);
  }

  ngOnDestroy() {}
}
