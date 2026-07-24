import { Directive, ElementRef, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal], .reveal-on-scroll',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;
  private mutationObserver?: MutationObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
      this.mutationObserver = new MutationObserver(() => {
        this.initScrollReveal();
      });

      this.mutationObserver.observe(this.el.nativeElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  private initScrollReveal(): void {
    if (this.observer) this.observer.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const hostEl = this.el.nativeElement as HTMLElement;
    if (hostEl.classList.contains('reveal-on-scroll') || hostEl.hasAttribute('appScrollReveal')) {
      const rect = hostEl.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) hostEl.classList.add('is-visible');
      this.observer.observe(hostEl);
    }
    const targets = hostEl.querySelectorAll('.reveal-on-scroll');
    targets.forEach((target: Element) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) target.classList.add('is-visible');
      this.observer?.observe(target);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mutationObserver?.disconnect();
  }
}
