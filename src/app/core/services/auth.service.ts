import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly _HttpClient = inject(HttpClient);

  register(data:object):Observable<any>{
    return this._HttpClient.post(`${environment.baseUrl}/users/signup`,data)  ;
  }

  login(data:object):Observable<any>{
    return this._HttpClient.post(`${environment.baseUrl}/users/signin`,data);
  }
}
