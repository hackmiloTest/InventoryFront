import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import CryptoJS from "crypto-js";
import { environment } from '../../environments/environment';





@Injectable({
  providedIn: 'root',
})


export class ApiService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = 'http://localhost:5050/api';
  private static ENCRYPTION_KEY = "phegon-dev-inventory";


  constructor(private http: HttpClient) { }

  // Encrypt data and save to localStorage
  encryptAndSaveToStorage(key: string, value: string): void {
    const encryptedValue = CryptoJS.AES.encrypt(value, ApiService.ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encryptedValue);
  }

  // Retreive from localStorage and Decrypt
  public getFromStorageAndDecrypt(key: string): any {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return CryptoJS.AES.decrypt(encryptedValue, ApiService.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return null;
    }
  }


  private clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }



  private getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }



  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error:', error.error.message);
    } else {
      // Error del lado del servidor
      console.error(
        `Código de error: ${error.status}, ` +
        `Mensaje: ${error.error.message || error.message}`);
    }
    return throwError(() => new Error('Ocurrió un error; por favor inténtalo de nuevo más tarde.'));
  }



  /***AUTH & USERS API METHODS */

  registerUser(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, body);
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/current`, {
      headers: this.getHeader(),
    });
  }









  /**CATEGOTY ENDPOINTS */
  createCategory(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/categories/add`, body, {
      headers: this.getHeader(),
    });
  }

  getAllCategory(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/categories/all`, {
      headers: this.getHeader(),
    });
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/categories/${id}`, {
      headers: this.getHeader(),
    });
  }

  updateCategory(id: string, body: any): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/categories/update/${id}`,
      body,
      {
        headers: this.getHeader(),
      }
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/categories/delete/${id}`, {
      headers: this.getHeader(),
    });
  }






  /** SUPPLIER API */
  addSupplier(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/suppliers/add`, body, {
      headers: this.getHeader(),
    });
  }

  getAllSuppliers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/suppliers/all`, {
      headers: this.getHeader(),
    });
  }

  getSupplierById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/suppliers/${id}`, {
      headers: this.getHeader(),
    });
  }

  updateSupplier(id: string, body: any): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/suppliers/update/${id}`,
      body,
      {
        headers: this.getHeader(),
      }
    );
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/suppliers/delete/${id}`, {
      headers: this.getHeader(),
    });
  }








  /**PRODUICTS ENDPOINTS */
  addProduct(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/products/add`, formData, {
      headers: this.getHeader(),
    });
  }

  updateProduct(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/products/update`, formData, {
      headers: this.getHeader(),
    });
  }

  getAllProducts(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/products/all`, {
      headers: this.getHeader(),
    });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/products/${id}`, {
      headers: this.getHeader(),
    });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/products/delete/${id}`, {
      headers: this.getHeader(),
    });
  }

  bulkUploadExcel(file: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/products/bulk-excel`, file, {
      headers: this.getHeader(),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getUploadProgress(event)),
      catchError(this.handleError)
    );
  }
  
  private getUploadProgress(event: any): any {
    if (event.type === HttpEventType.UploadProgress) {
      const progress = Math.round(100 * event.loaded / event.total);
      return { status: 'progress', progress };
    }
    if (event.type === HttpEventType.Response) {
      return event.body;
    }
    return event;
  }








  /**Transactions Endpoints */

  purchaseProduct(body: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/transactions/purchase`,
      body,
      {
        headers: this.getHeader(),
      }
    );
  }

  sellProduct(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/transactions/sell`, body, {
      headers: this.getHeader(),
    });
  }

  getAllTransactions(searchText: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/transactions/all`, {
      params: { searchText: searchText },
      headers: this.getHeader(),
    });
  }

  getTransactionById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/transactions/${id}`, {
      headers: this.getHeader(),
    });
  }


  updateTransactionStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/transactions/update/${id}`, JSON.stringify(status), {
      headers: this.getHeader().set("Content-Type", "application/json")
    });
  }


  getTransactionsByMonthAndYear(month: number, year: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/transactions/by-month-year`, {
      headers: this.getHeader(),
      params: {
        month: month,
        year: year,
      },
    });
  }

  returnSale(saleId: string, body: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/transactions/return-sale/${saleId}`,
      body,
      { headers: this.getHeader() }
    );
  }
  
  












  /**AUTHENTICATION CHECKER */

  logout(): void {
    this.clearAuth()
  }

  isAuthenticated(): boolean {
    try {
      const token = this.getFromStorageAndDecrypt("token");
      return token !== null && token.trim() !== '';
    } catch (e) {
      return false;
    }
  }
  
  isAdmin(): boolean {
    try {
      const role = this.getFromStorageAndDecrypt("role");
      return role === "ADMIN";
    } catch (e) {
      return false;
    }
  }
  

  isManager(): boolean {
    const role = this.getFromStorageAndDecrypt("role");
    return role === "MANAGER";
  }

  
  
}
