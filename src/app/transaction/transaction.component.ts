import { Component, OnInit } from '@angular/core';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [PaginationComponent, FormsModule, CommonModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit {
  constructor(private apiService: ApiService, private router: Router) {}

  transactions: any[] = [];
  message: string = '';
  searchInput: string = '';
  valueToSearch: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 50;
  selectedType: string = ''; // '', 'SALE', 'PURCHASE', 'RETURN', 'SALE_NO_RETURN'

  ngOnInit(): void {
    this.loadTransactions();
  }

  // FETCH Transactions desde backend con filtros y paginación
  loadTransactions(): void {
    this.apiService.getAllTransactions(
        this.currentPage - 1, 
        this.itemsPerPage, 
        this.valueToSearch, 
        this.selectedType // Puede ser 'SALE_NO_RETURN' o cualquier valor del enum
    ).subscribe({
        next: (res: any) => {
            this.transactions = res.transactions || [];
            this.totalPages = res.totalPages || 1;
        },
        error: (error) => {
            this.showMessage(error?.error?.message || 'Error al cargar transacciones');
        }
    });
}

  // Cambiar tipo de filtro
  filterByType(type: string): void {
    this.selectedType = type;
    this.currentPage = 1;
    this.loadTransactions();
  }

  // Manejar búsqueda
  handleSearch(): void {
    this.currentPage = 1;
    this.valueToSearch = this.searchInput.trim();
    this.loadTransactions();
  }

  // Cambio de página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  // Ir a detalles
  navigateTOTransactionsDetailsPage(transactionId: string): void {
    this.router.navigate([`/transaction/${transactionId}`]);
  }

  // Procesar devolución
  handleReturn(transaction: any): void {
    const confirmReturn = confirm(`¿Deseas devolver el producto ${transaction.product?.name}?`);
    if (!confirmReturn) return;

    if (transaction.supplier?.id) {
      this.processReturn(transaction, transaction.supplier.id);
    } else {
      this.apiService.getAllSuppliers().subscribe({
        next: (res: any) => {
          const suppliers = res || [];
          if (suppliers.length === 0) {
            this.showMessage('No hay proveedores registrados. No se puede hacer la devolución.');
            return;
          }

          const validSupplierId = suppliers[0]?.id;
          this.processReturn(transaction, validSupplierId);
        },
        error: (err) => {
          this.showMessage('Error al obtener proveedores para la devolución');
          console.error(err);
        }
      });
    }
  }

  private processReturn(transaction: any, supplierId: string): void {
    const body = {
      productId: transaction.product?.id,
      supplierId: supplierId,
      quantity: transaction.totalProducts,
      description: `Devolución de venta ID ${transaction.id}`
    };

    this.apiService.returnSale(transaction.id, body).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.showMessage('Devolución realizada con éxito');
          this.loadTransactions(); // volver a cargar lista
        }
      },
      error: (error) => {
        this.showMessage(
          error?.error?.message || error?.message || 'Error al devolver el producto'
        );
      }
    });
  }

  // Mostrar mensajes temporales
  showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }
}
