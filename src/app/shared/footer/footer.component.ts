import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  showModal = false;
  isClosing = false;

  openModal() {
    this.showModal = true;
    this.isClosing = false;
  }

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.showModal = false;
      this.isClosing = false;
    }, 300); // Match the animation duration
  }
}
