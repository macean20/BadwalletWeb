import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WalletDto {
  id?: number;
  phoneNumber: string;
  email: string;
  initialBalance: number;
  balance?: number;
  code: string;
  currency: string;
}

export interface TransferDto {
  senderPhone: string;
  receiverPhone: string;
  amount: number;
}

export interface DepositWithdrawDto {
  phoneNumber: string;
  amount: number;
  paymentMethod?: string;
}

export interface TransactionDto {
  reference: string;
  amount: number;
  type: string;
  destinationPhone?: string;
  date: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly BASE = 'http://localhost:8080/api/wallets';

  constructor(private http: HttpClient) {}

  getWallets(page: number = 0, size: number = 10): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<any>>(this.BASE, { params });
  }

  getWallet(phone: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/${encodeURIComponent(phone)}`);
  }

  getBalance(phone: string): Observable<number> {
    return this.http.get<number>(`${this.BASE}/${encodeURIComponent(phone)}/balance`);
  }

  createWallet(payload: WalletDto): Observable<any> {
    return this.http.post<any>(this.BASE, payload);
  }

  transfer(payload: TransferDto): Observable<any> {
    return this.http.post<any>(`${this.BASE}/transfer`, payload);
  }

  deposit(id: number, payload: { amount: number, paymentMethod: string }): Observable<any> {
    return this.http.post<any>(`${this.BASE}/${id}/deposit`, payload);
  }

  withdraw(payload: DepositWithdrawDto): Observable<any> {
    return this.http.post<any>(`${this.BASE}/withdraw`, payload);
  }

  getTransactions(phone: string): Observable<TransactionDto[]> {
    return this.http.get<TransactionDto[]>(`${this.BASE}/${encodeURIComponent(phone)}/transactions`);
  }
}
