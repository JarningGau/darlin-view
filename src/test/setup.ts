import '@testing-library/jest-dom/vitest';

const observedElements = new Set<HTMLElement>();

function notifyResize(target: HTMLElement) {
  const width = Number(target.dataset.testWidth ?? '1440');
  const observer = (target as HTMLElement & { __ro__?: ResizeObserverMock }).__ro__;
  observer?.emit(target, width);
}

class ResizeObserverMock {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    const element = target as HTMLElement & { __ro__?: ResizeObserverMock };
    element.__ro__ = this;
    observedElements.add(element);
    notifyResize(element);
  }

  unobserve() {}

  disconnect() {}

  emit(target: Element, width: number) {
    this.callback(
      [
        {
          target,
          contentRect: {
            width,
            height: 0,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: width,
            bottom: 0,
            toJSON() {
              return {};
            }
          }
        } as ResizeObserverEntry
      ],
      this as unknown as ResizeObserver
    );
  }
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

window.addEventListener('test:set-detail-width', (event) => {
  const width = (event as CustomEvent<number>).detail;
  observedElements.forEach((element) => {
    element.dataset.testWidth = String(width);
    notifyResize(element);
  });
});
