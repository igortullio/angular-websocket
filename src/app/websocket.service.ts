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
  private webSocketEndPoint = 'http://localhost:8080/ws/websocket';
  private state: BehaviorSubject<SocketClientState>;
  topic = '/topic/greetings';
  connected = false;

  constructor() {}

  connectServer() {
    this.client = over(new SockJS(this.webSocketEndPoint));
    this.state = new BehaviorSubject<SocketClientState>(
      SocketClientState.ATTEMPTING
    );
    this.client.connect(
      {},
      () => {
        this.state.next(SocketClientState.CONNECTED);
        this.connected = true;
      },
      () => {
        this.connected = false;
        this.reconnect();
      }
    );
  }

  private reconnect() {
    this.client = null;
    this.state.next(SocketClientState.DISCONNECTED);
    setTimeout(() => {
      this.connectServer();
    }, 5000);
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
    this.disconnected();
  }

  disconnected() {
    this.connect()
      .pipe(first())
      .subscribe(inst => {
        this.state.next(SocketClientState.DISCONNECTED);
        inst.disconnect(null);
        this.connected = false;
      });
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
