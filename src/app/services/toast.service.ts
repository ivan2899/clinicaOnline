import { Injectable } from '@angular/core';
import Toastify from 'toastify-js'

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }
  
    toast(text: string) {
    Toastify({
      text: text,
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "left", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
        color: "#000"
      },
      onClick: function () { } // Callback after click
    }).showToast();
  }
}
