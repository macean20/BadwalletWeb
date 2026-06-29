import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FactureDto {
  reference: string;
  amount: number;
  serviceName: string;
  clientCode: string;
  dueDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class BillingApiService {
  private readonly BASE_EXTERNAL = 'http://localhost:8080/api/external/factures';
  private readonly BASE_WALLET = 'http://localhost:8080/api/wallets';

  constructor(private http: HttpClient) {}

  getCurrentBills(clientCode: string, unite?: string): Observable<FactureDto[]> {
    let params = new HttpParams();
    if (unite) {
      params = params.set('unite', unite);
    }
    return this.http.get<FactureDto[]>(`${this.BASE_EXTERNAL}/${clientCode}/current`, { params });
  }

  payBills(payload: { phoneNumber: string, serviceName: string, factureReferences: string[] }): Observable<any> {
    return this.http.post<any>(`${this.BASE_WALLET}/pay-factures`, payload);
  }
}
