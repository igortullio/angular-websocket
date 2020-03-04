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
    this.websocketService.onMessage('/topic/concluir').subscribe(res => {
      this.mensagemRecebida = res.status;
    });
  }

  sendMensage() {
    const objeto = { codDocJurisp: this.mensagem, tipoAcao: 'CLASSIFICACAO' };
    this.websocketService.send('/app/concluir', objeto);
  }

  ngOnDestroy() {
    this.websocketService.disconnected();
  }
}
