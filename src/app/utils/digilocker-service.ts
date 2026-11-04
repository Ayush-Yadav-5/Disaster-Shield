/**
 * DigiLocker OAuth 2.0 Authentication Service
 * 
 * DigiLocker is India's digital document storage platform that provides
 * verified identity information through OAuth 2.0 authentication.
 * 
 * NOTE: This is a DEMO implementation. In production, you would need:
 * - Register your application at: https://www.digilocker.gov.in/
 * - Obtain Client ID and Client Secret
 * - Configure authorized redirect URIs
 * - Implement secure token storage
 */

export interface DigiLockerUser {
  name: string;
  dob: string;
  gender: 'M' | 'F' | 'O';
  email?: string;
  mobile?: string;
  photo?: string;
  aadhaar?: string; // Last 4 digits only for privacy
  verified: boolean;
  eKYCCompleted: boolean;
}

export interface DigiLockerAuthResult {
  success: boolean;
  user?: DigiLockerUser;
  error?: string;
  accessToken?: string;
}

class DigiLockerService {
  private clientId = 'DEMO_CLIENT_ID'; // Replace with actual Client ID
  private redirectUri = window.location.origin + '/auth/digilocker/callback';
  private authEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/authorize';
  private tokenEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/token';
  private userInfoEndpoint = 'https://api.digitallocker.gov.in/public/oauth2/1/user';

  /**
   * Initiates DigiLocker OAuth flow
   * Opens DigiLocker login in a popup window
   */
  initiateAuth(): Promise<DigiLockerAuthResult> {
    return new Promise((resolve, reject) => {
      // Generate random state for CSRF protection
      const state = this.generateRandomString(32);
      sessionStorage.setItem('digilocker_state', state);

      // In demo mode, simulate the auth flow
      if (this.isDemoMode()) {
        this.simulateDemoAuth(resolve, reject);
        return;
      }

      // Production OAuth flow
      const authUrl = new URL(this.authEndpoint);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', this.clientId);
      authUrl.searchParams.append('redirect_uri', this.redirectUri);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('scope', 'basic profile email mobile');

      // Open popup window
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      const popup = window.open(
        authUrl.toString(),
        'DigiLocker Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject({ success: false, error: 'Popup blocked. Please allow popups for DigiLocker authentication.' });
        return;
      }

      // Listen for OAuth callback
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'digilocker-auth-success') {
          popup?.close();
          resolve(event.data.result);
        } else if (event.data.type === 'digilocker-auth-error') {
          popup?.close();
          reject(event.data.result);
        }
      }, { once: true });

      // Check if popup was closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject({ success: false, error: 'Authentication cancelled by user' });
        }
      }, 1000);
    });
  }

  /**
   * Demo mode simulation for testing without actual DigiLocker integration
   */
  private simulateDemoAuth(resolve: Function, reject: Function) {
    // Create a custom dialog to simulate DigiLocker authentication
    const dialog = this.createDemoDialog();
    document.body.appendChild(dialog);

    // Focus on mobile input
    setTimeout(() => {
      const mobileInput = dialog.querySelector('input[type="tel"]') as HTMLInputElement;
      mobileInput?.focus();
    }, 100);

    // Handle demo authentication
    const handleDemoAuth = (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const mobile = (form.querySelector('input[name="mobile"]') as HTMLInputElement).value;
      const otp = (form.querySelector('input[name="otp"]') as HTMLInputElement).value;

      // Validate demo credentials
      if (mobile.length < 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
      }

      if (otp && otp !== '123456') {
        alert('Invalid OTP. Use 123456 for demo');
        return;
      }

      // Simulate successful authentication
      const demoUser: DigiLockerUser = {
        name: 'Rahul Kumar',
        dob: '1990-05-15',
        gender: 'M',
        email: 'rahul.kumar@example.com',
        mobile: mobile,
        aadhaar: '****8765', // Last 4 digits only
        verified: true,
        eKYCCompleted: true,
        photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0OThkYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJLPC90ZXh0Pjwvc3ZnPg=='
      };

      document.body.removeChild(dialog);
      resolve({
        success: true,
        user: demoUser,
        accessToken: 'demo_access_token_' + Date.now()
      });
    };

    const handleCancel = () => {
      document.body.removeChild(dialog);
      reject({ success: false, error: 'Authentication cancelled by user' });
    };

    dialog.querySelector('form')?.addEventListener('submit', handleDemoAuth);
    dialog.querySelector('.cancel-btn')?.addEventListener('click', handleCancel);
  }

  /**
   * Creates a demo dialog that simulates DigiLocker authentication UI
   */
  private createDemoDialog(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-in-out;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div style="
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 420px;
        width: calc(100% - 2rem);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: slideUp 0.3s ease-out;
        overflow: hidden;
      ">
        <!-- DigiLocker Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          color: white;
          text-align: center;
        ">
          <div style="
            width: 64px;
            height: 64px;
            background: white;
            border-radius: 12px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">DigiLocker</h2>
          <p style="margin: 0; opacity: 0.95; font-size: 14px;">Secure Digital Document Locker</p>
        </div>

        <!-- Form Content -->
        <form style="padding: 24px;">
          <div style="
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: start;
            gap: 8px;
          ">
            <svg style="min-width: 16px; margin-top: 2px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
              <strong>DEMO MODE:</strong> This simulates DigiLocker authentication. Use any 10-digit mobile number.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              required
              maxlength="10"
              pattern="[0-9]{10}"
              style="
                width: 100%;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
              "
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #6b7280;">
              OTP will be sent to this number
            </p>
          </div>

          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">
              OTP (Use: 123456)
            </label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              maxlength="6"
              pattern="[0-9]{6}"
              style="
                width: 100%;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
                letter-spacing: 4px;
                text-align: center;
                font-weight: 600;
              "
              onfocus="this.style.borderColor='#667eea'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
          </div>

          <div style="
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #92400e;
            line-height: 1.5;
          ">
            <strong>What we'll access:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>Name from Aadhaar</li>
              <li>Date of Birth</li>
              <li>Gender</li>
              <li>Mobile number (verified)</li>
            </ul>
          </div>

          <div style="display: flex; gap: 12px;">
            <button
              type="submit"
              style="
                flex: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(102, 126, 234, 0.4)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
            >
              Verify & Continue
            </button>
            <button
              type="button"
              class="cancel-btn"
              style="
                padding: 14px 20px;
                background: #f3f4f6;
                color: #374151;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
              "
              onmouseover="this.style.background='#e5e7eb'"
              onmouseout="this.style.background='#f3f4f6'"
            >
              Cancel
            </button>
          </div>

          <div style="
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          ">
            <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
              Secured by Government of India<br/>
              Your data is protected and encrypted
            </p>
          </div>
        </form>
      </div>
    `;

    return overlay;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<string> {
    const savedState = sessionStorage.getItem('digilocker_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // In production, this would make a POST request to tokenEndpoint
    // For demo, return a mock token
    return 'demo_access_token_' + Date.now();
  }

  /**
   * Fetch user info from DigiLocker
   */
  async getUserInfo(accessToken: string): Promise<DigiLockerUser> {
    // In production, this would make a GET request to userInfoEndpoint
    // For demo, return mock user data
    return {
      name: 'Rahul Kumar',
      dob: '1990-05-15',
      gender: 'M',
      email: 'rahul.kumar@example.com',
      mobile: '+919876543210',
      aadhaar: '****8765',
      verified: true,
      eKYCCompleted: true
    };
  }

  /**
   * Check if running in demo mode
   */
  private isDemoMode(): boolean {
    return this.clientId === 'DEMO_CLIENT_ID';
  }

  /**
   * Generate random string for state parameter
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Verify DigiLocker document
   */
  async verifyDocument(docType: string, docId: string): Promise<boolean> {
    // In production, this would verify documents against DigiLocker
    return true;
  }
}

export const digiLockerService = new DigiLockerService();
