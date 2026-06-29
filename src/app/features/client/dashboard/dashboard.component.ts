import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { BalanceStore } from '../../../shared/store/balance.store';
import { WalletApiService, TransactionDto } from '../../../core/services/wallet-api.service';
import { XofPipe } from '../../../shared/pipes/xof.pipe';
import { CardComponent } from '../../../shared/components/ui/card/card.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SkeletonComponent } from '../../../shared/components/ui/skeleton/skeleton.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, XofPipe, CardComponent, ButtonComponent, SkeletonComponent],
  template: `
    <div class="container mx-auto space-y-6">
      
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-fintech-dark">Aperçu du compte</h2>
          <p class="text-slate-500 text-sm mt-1">Gérez votre argent en toute simplicité.</p>
        </div>
        <div class="flex gap-3">
          <app-button variant="outline" (click)="goTo('/bills/current')">
            Payer une facture
          </app-button>
          <app-button variant="primary" (click)="goTo('/transfer')">
            Nouveau Transfert
          </app-button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Balance Card -->
        <app-card class="col-span-1 md:col-span-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Solde Total Disponible</p>
              <ng-container *ngIf="balanceStore.balance() !== null; else loadingBalance">
                <h2 class="text-4xl font-extrabold text-fintech-dark">{{ balanceStore.balance() | xof }}</h2>
              </ng-container>
              <ng-template #loadingBalance>
                <app-skeleton widthClass="w-48" heightClass="h-10"></app-skeleton>
              </ng-template>
            </div>
            <div class="p-2 bg-emerald-50 rounded-lg">
              <svg class="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          
          <div class="mt-8">
            <p class="text-sm font-medium text-slate-700 mb-4">Évolution des dépenses (30 derniers jours)</p>
            <div class="h-48 w-full relative">
              <canvas #expenseChart></canvas>
            </div>
          </div>
        </app-card>

        <!-- Side Stats & Cards -->
        <div class="flex flex-col gap-6">
          <app-card class="flex-1">
            <h3 class="text-sm font-medium text-slate-500 mb-4">Revenus (Ce mois)</h3>
            <h2 class="text-2xl font-bold text-emerald-600">+ {{ totalIncome | xof }}</h2>
            <div class="mt-4 w-full bg-slate-100 rounded-full h-1.5">
              <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 70%"></div>
            </div>
          </app-card>
          
          <app-card class="flex-1">
            <h3 class="text-sm font-medium text-slate-500 mb-4">Dépenses (Ce mois)</h3>
            <h2 class="text-2xl font-bold text-red-500">- {{ totalExpense | xof }}</h2>
            <div class="mt-4 w-full bg-slate-100 rounded-full h-1.5">
              <div class="bg-red-500 h-1.5 rounded-full" style="width: 45%"></div>
            </div>
          </app-card>
        </div>
      </div>

      <!-- Recent Transactions -->
      <app-card title="Transactions Récentes" subtitle="Vos 5 derniers mouvements">
        
        <div *ngIf="isLoadingHistory" class="space-y-4">
          <app-skeleton *ngFor="let i of [1,2,3]" widthClass="w-full" heightClass="h-16"></app-skeleton>
        </div>

        <div *ngIf="!isLoadingHistory && transactions.length === 0" class="text-center py-8">
          <div class="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Aucune transaction récente</p>
        </div>

        <div class="flex flex-col gap-3" *ngIf="!isLoadingHistory && transactions.length > 0">
          <div *ngFor="let tx of transactions.slice(0, 5)" class="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            
            <div class="flex items-center gap-4">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                   [ngClass]="{
                     'bg-emerald-100 text-emerald-600': tx.type === 'DEPOSIT',
                     'bg-red-100 text-red-600': tx.type === 'WITHDRAWAL',
                     'bg-blue-100 text-blue-600': tx.type === 'TRANSFER',
                     'bg-purple-100 text-purple-600': tx.type === 'PAYMENT'
                   }">
                <svg *ngIf="tx.type === 'DEPOSIT'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                <svg *ngIf="tx.type === 'WITHDRAWAL'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                <svg *ngIf="tx.type === 'TRANSFER'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                <svg *ngIf="tx.type === 'PAYMENT'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>

              <!-- Details -->
              <div>
                <p class="font-semibold text-fintech-dark capitalize">{{ tx.type.toLowerCase() }}</p>
                <p class="text-xs text-slate-500">
                  {{ tx.date | date:'dd MMM yyyy, HH:mm' }} 
                  <span *ngIf="tx.destinationPhone">• Vers {{ tx.destinationPhone }}</span>
                </p>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right">
              <p class="font-bold" [ngClass]="tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-fintech-dark'">
                {{ tx.type === 'DEPOSIT' ? '+' : '-' }} {{ tx.amount | xof }}
              </p>
            </div>
          </div>
          
          <div class="mt-2 text-center">
            <button class="text-sm font-medium text-fintech-primary hover:text-blue-700" (click)="goTo('/transactions')">
              Voir tout l'historique &rarr;
            </button>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('expenseChart') expenseChartRef!: ElementRef;
  
  transactions: TransactionDto[] = [];
  isLoadingHistory = false;
  
  totalIncome = 0;
  totalExpense = 0;
  chartInstance: Chart | null = null;

  constructor(
    public balanceStore: BalanceStore,
    private api: WalletApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const phone = this.balanceStore.currentPhone();
    if (phone) {
      this.balanceStore.refresh();
      this.loadTransactions(phone);
    }
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  private loadTransactions(phone: string) {
    this.isLoadingHistory = true;
    this.api.getTransactions(phone).subscribe({
      next: (data) => {
        // Trier par date décroissante (les plus récentes d'abord)
        this.transactions = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Calcul des stats basiques
        this.totalIncome = this.transactions
          .filter(t => t.type === 'DEPOSIT')
          .reduce((sum, t) => sum + t.amount, 0);
          
        this.totalExpense = this.transactions
          .filter(t => t.type !== 'DEPOSIT')
          .reduce((sum, t) => sum + t.amount, 0);
          
        this.isLoadingHistory = false;
      },
      error: () => {
        this.isLoadingHistory = false;
      }
    });
  }

  private initChart() {
    if (!this.expenseChartRef) return;

    const ctx = this.expenseChartRef.nativeElement.getContext('2d');
    
    // Dégradé pour le chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Dépenses',
          data: [1500, 3000, 0, 10000, 2500, 8000, 4500], // Mock Data (Pour la beauté visuelle)
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 12,
            titleFont: { size: 13, family: 'Inter' },
            bodyFont: { size: 14, family: 'Inter', weight: 'bold' },
            displayColors: false,
            callbacks: {
              label: (context) => context.raw + ' XOF'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { family: 'Inter' }, color: '#94a3b8' }
          },
          y: {
            border: { display: false },
            grid: { color: '#f1f5f9' },
            ticks: { 
              font: { family: 'Inter' }, 
              color: '#94a3b8',
              callback: (value) => value + ' X'
            }
          }
        }
      }
    });
  }
}
