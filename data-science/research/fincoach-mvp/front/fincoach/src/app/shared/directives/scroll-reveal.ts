import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
})
export class ScrollReveal implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const target = this.element.nativeElement;

    if (!('IntersectionObserver' in window)) {
      target.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          target.classList.add('is-visible');
          this.observer?.unobserve(target);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      },
    );
    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
