export class MobileOrientationManager {
  private static instance: MobileOrientationManager;
  private forceLandscape: boolean = false;
  private listeners: Set<(forceLandscape: boolean) => void> = new Set();

  private constructor() {
    this.forceLandscape = false;
  }

  static getInstance(): MobileOrientationManager {
    if (!MobileOrientationManager.instance) {
      MobileOrientationManager.instance = new MobileOrientationManager();
    }
    return MobileOrientationManager.instance;
  }

  private initializeOrientationHandling() {
    return;
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  private handleOrientationChange() {
    return;
  }

  public setForceLandscape(force: boolean) {
    this.forceLandscape = force;

    this.listeners.forEach(listener => listener(force));
  }

  public getForceLandscape(): boolean {
    return this.forceLandscape;
  }

  public addListener(listener: (forceLandscape: boolean) => void) {
    this.listeners.add(listener);
  }

  public removeListener(listener: (forceLandscape: boolean) => void) {
    this.listeners.delete(listener);
  }
}