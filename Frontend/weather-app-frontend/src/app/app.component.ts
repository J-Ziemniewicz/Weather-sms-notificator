import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import {MatSnackBar,MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

export interface Response {
    status: string;
    message: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'weather-app-frontend';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  formGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.formGroup = this.formBuilder.group({
      city: '',
      phone: '',
    });
  }

  onSubmit(formData: any) {
    const city = formData['city'];
    const phoneNb = formData['phone'];
    console.log(city);
    console.log(phoneNb);
    this.http.post<Response>(`${environment.apiUrl}/sms-notification`,{phone_nb:phoneNb,city:city}).subscribe(response => {{
      console.log(response.status);
      if(response.status==="ok"){
        this._snackBar.open(response.message,'Close',{horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,duration: 5000});
      }
      else{
        this._snackBar.open("Error: "+response.message,'Close',{horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,duration: 5000})
      }
      

    }});
  }
}