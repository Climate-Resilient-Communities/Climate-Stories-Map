// Mobile orientation manager for forcing landscape mode
export class MobileOrientationManager {
  private static instance: MobileOrientationManager;
  private forceLandscape: boolean = true;
  private listeners: Set<(forceLandscape: boolean) => void> = new Set();

  private constructor() {
    // Load setting from localStorage
    const saved = localStorage.getItem('forceLandscapeMode');
    this.forceLandscape = saved !== null ? saved === 'true' : true;
    
    this.initializeOrientationHandling();
  }

  static getInstance(): MobileOrientationManager {
    if (!MobileOrientationManager.instance) {
      MobileOrientationManager.instance = new MobileOrientationManager();
    }
    return MobileOrientationManager.instance;
  }

  private initializeOrientationHandling() {
    if (this.isMobileDevice()) {
      this.handleOrientationChange();
      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.handleOrientationChange(), 100);
      });
      window.addEventListener('resize', () => this.handleOrientationChange());
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  private handleOrientationChange() {
    if (!this.forceLandscape || !this.isMobileDevice()) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isPortrait) {
      this.showLandscapePrompt();
    } else {
      this.hideLandscapePrompt();
    }
  }

  private showLandscapePrompt() {
    let prompt = document.getElementById('landscape-prompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'landscape-prompt';
      prompt.innerHTML = `
        <div class="landscape-prompt-content">
          <div class="landscape-prompt-icon">📱</div>
          <h3>Better Experience in Landscape</h3>
          <p>Please rotate your device to landscape mode for the best experience with Climate Stories Map.</p>
          <div class="landscape-prompt-animation">
            <div class="phone-icon">📱</div>
            <div class="rotate-arrow">↻</div>
          </div>
        </div>
      `;
      document.body.appendChild(prompt);
    }
    prompt.style.display = 'flex';
  }

  private hideLandscapePrompt() {
    const prompt = document.getElementById('landscape-prompt');
    if (prompt) {
      prompt.style.display = 'none';
    }
  }

  public setForceLandscape(force: boolean) {
    this.forceLandscape = force;
    localStorage.setItem('forceLandscapeMode', force.toString());
    
    if (force) {
      this.handleOrientationChange();
    } else {
      this.hideLandscapePrompt();
    }

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