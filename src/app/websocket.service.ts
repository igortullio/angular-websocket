import { SocketClientState } from './enums/socket-client-state';
import { Injectable, OnDestroy } from '@angular/core';
import { Client, over, Subscription, Message } from 'stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private client: Client;
  private state: BehaviorSubject<SocketClientState>;
  private webSocketEndPoint = 'http://localhost:8080/ws';
  topic = '/topic/greetings';
  reconInv: NodeJS.Timeout;

  constructor() {
    this.connectServer();
  }

  private connectServer() {
    this.client = over(new SockJS(this.webSocketEndPoint));
    this.state = new BehaviorSubject<SocketClientState>(
      SocketClientState.ATTEMPTING
    );
    this.client.connect(
      {},
      () => {
        clearInterval(this.reconInv);
        this.state.next(SocketClientState.CONNECTED);
      },
      () => {}
    );
  }

  private connect(): Observable<Client> {
    return new Observable<Client>(observer => {
      this.state
        .pipe(filter(state => state === SocketClientState.CONNECTED))
        .subscribe(() => {
          observer.next(this.client);
        });
    });
  }

  ngOnDestroy() {
    this.connect()
      .pipe(first())
      .subscribe(inst => inst.disconnect(null));
  }

  onMessage(
    topic: string,
    handler = this.jsonHandler.bind(this)
  ): Observable<any> {
    return this.connect().pipe(
      first(),
      switchMap(inst => {
        return new Observable<any>(observer => {
          const subscription: Subscription = inst.subscribe(topic, message => {
            observer.next(handler(message));
          });
          return () => inst.unsubscribe(subscription.id);
        });
      })
    );
  }

  onPlainMessage(topic: string): Observable<string> {
    return this.onMessage(topic, this.textHandler.bind(this));
  }

  send(topic: string, payload: any): void {
    this.connect()
      .pipe(first())
      .subscribe(inst => inst.send(topic, {}, JSON.stringify(payload)));
  }

  jsonHandler(message: Message): any {
    return JSON.parse(message.body);
  }

  textHandler(message: Message): string {
    return message.body;
  }
}
