/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./frontend/Application/Authentication/Adapter.ts"
/*!********************************************************!*\
  !*** ./frontend/Application/Authentication/Adapter.ts ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticationAdapter)
/* harmony export */ });
class AuthenticationAdapter {
    onRegister = () => false;
    onLogin = () => false;
    onLogout = () => false;
    onShowLogin = () => false;
    onShowRegister = () => false;
}


/***/ },

/***/ "./frontend/Application/Authentication/Controller/Controller.ts"
/*!**********************************************************************!*\
  !*** ./frontend/Application/Authentication/Controller/Controller.ts ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Controller)
/* harmony export */ });
class Controller {
    adapter;
    handlers;
    constructor(adapter, handlers) {
        this.adapter = adapter;
        this.handlers = handlers;
    }
    async initialize() {
        for (const handler of this.handlers) {
            await handler.initialize();
        }
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/Controller/Handler/AuthenticatedHandler.ts"
/*!****************************************************************************************!*\
  !*** ./frontend/Application/Authentication/Controller/Handler/AuthenticatedHandler.ts ***!
  \****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticatedHandler)
/* harmony export */ });
/* harmony import */ var _View_AuthenticatedView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../View/AuthenticatedView */ "./frontend/Application/Authentication/View/AuthenticatedView.ts");

class AuthenticatedHandler {
    adapter;
    rootElement;
    stateTransition;
    authenticationUseCase;
    view;
    constructor(adapter, rootElement, stateTransition, authenticationUseCase) {
        this.adapter = adapter;
        this.rootElement = rootElement;
        this.stateTransition = stateTransition;
        this.authenticationUseCase = authenticationUseCase;
        this.view = new _View_AuthenticatedView__WEBPACK_IMPORTED_MODULE_0__["default"](adapter);
    }
    async initialize() {
        this.bindActions();
    }
    bindActions() {
        this.adapter.onLogout = async () => {
            await this.handleLogout();
        };
    }
    async handleLogout() {
        try {
            await this.authenticationUseCase.logout();
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            this.stateTransition.showLoginView();
        }
    }
    showAuthenticatedView(nickname) {
        this.view.render(this.rootElement, nickname);
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/Controller/Handler/AuthenticationStateHandler.ts"
/*!**********************************************************************************************!*\
  !*** ./frontend/Application/Authentication/Controller/Handler/AuthenticationStateHandler.ts ***!
  \**********************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticationStateHandler)
/* harmony export */ });
class AuthenticationStateHandler {
    adapter;
    authenticationUseCase;
    registrationHandler;
    loginHandler;
    authenticatedHandler;
    constructor(adapter, authenticationUseCase) {
        this.adapter = adapter;
        this.authenticationUseCase = authenticationUseCase;
    }
    setHandlers(registrationHandler, loginHandler, authenticatedHandler) {
        this.registrationHandler = registrationHandler;
        this.loginHandler = loginHandler;
        this.authenticatedHandler = authenticatedHandler;
    }
    async initialize() {
        this.bindNavigationActions();
        await this.checkExistingSession();
    }
    bindNavigationActions() {
        this.adapter.onShowLogin = this.showLoginView.bind(this);
        this.adapter.onShowRegister = this.showRegistrationView.bind(this);
    }
    async checkExistingSession() {
        const response = await this.authenticationUseCase.verifySession();
        if (response.nickname) {
            this.showAuthenticatedView(response.nickname);
        }
        else {
            this.showLoginView();
        }
    }
    showRegistrationView() {
        if (!this.registrationHandler)
            throw new Error('registrationHandler not set');
        this.registrationHandler.showRegistrationForm();
    }
    showLoginView() {
        if (!this.loginHandler)
            throw new Error('loginHandler not set');
        this.loginHandler.showLoginForm();
    }
    showAuthenticatedView(nickname) {
        if (!this.authenticatedHandler)
            throw new Error('authenticatedHandler not set');
        this.authenticatedHandler.showAuthenticatedView(nickname);
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/Controller/Handler/LoginHandler.ts"
/*!********************************************************************************!*\
  !*** ./frontend/Application/Authentication/Controller/Handler/LoginHandler.ts ***!
  \********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LoginHandler)
/* harmony export */ });
/* harmony import */ var _View_LoginView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../View/LoginView */ "./frontend/Application/Authentication/View/LoginView.ts");

class LoginHandler {
    adapter;
    rootElement;
    stateTransition;
    authenticationUseCase;
    view;
    constructor(adapter, rootElement, stateTransition, authenticationUseCase) {
        this.adapter = adapter;
        this.rootElement = rootElement;
        this.stateTransition = stateTransition;
        this.authenticationUseCase = authenticationUseCase;
        this.view = new _View_LoginView__WEBPACK_IMPORTED_MODULE_0__["default"](adapter);
    }
    async initialize() {
        this.bindActions();
    }
    bindActions() {
        this.adapter.onLogin = async (totp) => {
            await this.handleLogin(totp);
        };
    }
    async handleLogin(totp) {
        this.view.clearError();
        try {
            const response = await this.authenticationUseCase.login({ totp });
            this.stateTransition.showAuthenticatedView(response.nickname);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            this.view.showError(message);
        }
    }
    showLoginForm() {
        this.view.render(this.rootElement);
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/Controller/Handler/RegistrationHandler.ts"
/*!***************************************************************************************!*\
  !*** ./frontend/Application/Authentication/Controller/Handler/RegistrationHandler.ts ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RegistrationHandler)
/* harmony export */ });
/* harmony import */ var _View_RegistrationView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../View/RegistrationView */ "./frontend/Application/Authentication/View/RegistrationView.ts");

class RegistrationHandler {
    adapter;
    rootElement;
    stateTransition;
    authenticationUseCase;
    view;
    constructor(adapter, rootElement, stateTransition, authenticationUseCase) {
        this.adapter = adapter;
        this.rootElement = rootElement;
        this.stateTransition = stateTransition;
        this.authenticationUseCase = authenticationUseCase;
        this.view = new _View_RegistrationView__WEBPACK_IMPORTED_MODULE_0__["default"](adapter);
    }
    async initialize() {
        this.bindActions();
    }
    bindActions() {
        this.adapter.onRegister = async (nickname) => {
            await this.handleRegister(nickname);
        };
    }
    async handleRegister(nickname) {
        this.view.clearError();
        try {
            const response = await this.authenticationUseCase.register({ nickname });
            this.view.showQRCode(response.qrCodeDataUrl, response.secret, nickname);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            this.view.showError(message);
        }
    }
    showRegistrationForm() {
        this.view.render(this.rootElement);
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/View/AuthenticatedView.ts"
/*!***********************************************************************!*\
  !*** ./frontend/Application/Authentication/View/AuthenticatedView.ts ***!
  \***********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ AuthenticatedView)
/* harmony export */ });
/**
 * Authenticated View
 * Hauptansicht für eingeloggte Benutzer
 */
class AuthenticatedView {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    render(container, nickname) {
        container.innerHTML = `
      <div class="auth-container authenticated">
        <h1>Welcome to DerBot, ${nickname}!</h1>
        <div class="user-info">
          <p>You are successfully logged in.</p>
          <p>Your session is valid for 7 days.</p>
        </div>
        <button id="logoutBtn" class="btn-danger">Logout</button>
      </div>
    `;
        this.attachEvents();
    }
    attachEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.adapter.onLogout?.();
            });
        }
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/View/LoginView.ts"
/*!***************************************************************!*\
  !*** ./frontend/Application/Authentication/View/LoginView.ts ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LoginView)
/* harmony export */ });
/**
 * Login View
 * Formular für Benutzer-Login mit TOTP
 */
class LoginView {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    render(container) {
        container.innerHTML = `
      <div class="auth-container">
        <h1>DerBot - Login</h1>
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label>TOTP Code:</label>
            <div class="totp-input-container">
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="0" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="1" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="2" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="3" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="4" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="5" autocomplete="off" />
            </div>
            <small>Enter the 6-digit code from Google Authenticator</small>
          </div>
          <button type="submit" class="btn-primary">Login</button>
          <button type="button" id="showRegisterBtn" class="btn-secondary">Don't have an account? Register</button>
        </form>
        <div id="loginResult" class="result-container"></div>
      </div>
    `;
        this.attachEvents();
    }
    attachEvents() {
        const form = document.getElementById('loginForm');
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const totpInputs = document.querySelectorAll('.totp-digit');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const totp = this.getTotpCode();
                if (totp.length === 6) {
                    this.adapter.onLogin?.(totp);
                }
            });
        }
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                this.adapter.onShowRegister?.();
            });
        }
        this.attachTotpInputEvents(totpInputs);
        // Auto-focus auf erstes Feld
        if (totpInputs.length > 0) {
            totpInputs[0].focus();
        }
    }
    attachTotpInputEvents(inputs) {
        inputs.forEach((input, index) => {
            // Input Event: Auto-Focus auf nächstes Feld
            input.addEventListener('input', (e) => {
                const target = e.target;
                const value = target.value;
                // Nur Ziffern erlauben
                if (value && !/^[0-9]$/.test(value)) {
                    target.value = '';
                    return;
                }
                // Zum nächsten Feld springen
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                // Auto-Submit nach 6. Ziffer
                if (index === inputs.length - 1 && value) {
                    const totp = this.getTotpCode();
                    if (totp.length === 6) {
                        this.adapter.onLogin?.(totp);
                    }
                }
            });
            // KeyDown Event: Backspace-Handling
            input.addEventListener('keydown', (e) => {
                const target = e.target;
                if (e.key === 'Backspace' && !target.value && index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = '';
                }
            });
            // Paste Event: 6-stelligen Code verteilen
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData?.getData('text') || '';
                const digits = pastedData.replace(/\D/g, '').slice(0, 6);
                if (digits.length === 6) {
                    inputs.forEach((inp, idx) => {
                        inp.value = digits[idx] || '';
                    });
                    inputs[5].focus();
                    // Auto-Submit nach Paste
                    const totp = this.getTotpCode();
                    if (totp.length === 6) {
                        this.adapter.onLogin?.(totp);
                    }
                }
            });
            // Select content on focus
            input.addEventListener('focus', (e) => {
                const target = e.target;
                target.select();
            });
        });
    }
    getTotpCode() {
        const inputs = document.querySelectorAll('.totp-digit');
        return Array.from(inputs).map(input => input.value).join('');
    }
    clearTotpInputs() {
        const inputs = document.querySelectorAll('.totp-digit');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        if (inputs.length > 0) {
            inputs[0].focus();
        }
    }
    showError(message) {
        const resultContainer = document.getElementById('loginResult');
        if (!resultContainer)
            return;
        resultContainer.innerHTML = `
      <div class="error-message">
        <p>❌ ${message}</p>
      </div>
    `;
        // Felder rot markieren und leeren
        const inputs = document.querySelectorAll('.totp-digit');
        inputs.forEach(input => {
            input.classList.add('error');
        });
        // Nach kurzer Verzögerung Felder leeren und Focus setzen
        setTimeout(() => {
            this.clearTotpInputs();
        }, 1000);
    }
    clearError() {
        const resultContainer = document.getElementById('loginResult');
        if (resultContainer) {
            resultContainer.innerHTML = '';
        }
        // Error-Styling von Inputs entfernen
        const inputs = document.querySelectorAll('.totp-digit');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }
}


/***/ },

/***/ "./frontend/Application/Authentication/View/RegistrationView.ts"
/*!**********************************************************************!*\
  !*** ./frontend/Application/Authentication/View/RegistrationView.ts ***!
  \**********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RegistrationView)
/* harmony export */ });
/**
 * Registration View
 * Formular für Benutzerregistrierung
 */
class RegistrationView {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    render(container) {
        container.innerHTML = `
      <div class="auth-container">
        <h1>DerBot - Registration</h1>
        <form id="registrationForm" class="auth-form">
          <div class="form-group">
            <label for="nickname">Nickname:</label>
            <input 
              type="text" 
              id="nickname" 
              name="nickname" 
              placeholder="Enter nickname (3-20 characters)"
              pattern="[a-zA-Z0-9_]{3,20}"
              required
            />
            <small>Alphanumeric characters and underscores only</small>
          </div>
          <button type="submit" class="btn-primary">Register</button>
          <button type="button" id="showLoginBtn" class="btn-secondary">Already have an account? Login</button>
        </form>
        <div id="registrationResult" class="result-container"></div>
      </div>
    `;
        this.attachEvents();
    }
    attachEvents() {
        const form = document.getElementById('registrationForm');
        const showLoginBtn = document.getElementById('showLoginBtn');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const nickname = formData.get('nickname');
                this.adapter.onRegister?.(nickname);
            });
        }
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                this.adapter.onShowLogin?.();
            });
        }
    }
    showQRCode(qrCodeDataUrl, secret, nickname) {
        const resultContainer = document.getElementById('registrationResult');
        if (!resultContainer)
            return;
        resultContainer.innerHTML = `
      <div class="qr-code-container">
        <h2>Registration Successful!</h2>
        <p>Scan this QR code with Google Authenticator:</p>
        <img src="${qrCodeDataUrl}" alt="QR Code" />
        <p class="secret-info">
          <strong>Secret (for manual entry):</strong><br/>
          <code>${secret}</code>
        </p>
        <p class="info">After scanning, use the login form to authenticate.</p>
        <button id="proceedToLoginBtn" class="btn-primary">Proceed to Login</button>
      </div>
    `;
        const proceedBtn = document.getElementById('proceedToLoginBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                this.adapter.onShowLogin?.();
            });
        }
    }
    showError(message) {
        const resultContainer = document.getElementById('registrationResult');
        if (!resultContainer)
            return;
        resultContainer.innerHTML = `
      <div class="error-message">
        <p>❌ ${message}</p>
      </div>
    `;
    }
    clearError() {
        const resultContainer = document.getElementById('registrationResult');
        if (resultContainer) {
            resultContainer.innerHTML = '';
        }
    }
}


/***/ },

/***/ "./frontend/Application/Container.ts"
/*!*******************************************!*\
  !*** ./frontend/Application/Container.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Container)
/* harmony export */ });
/* harmony import */ var _Authentication_Adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Authentication/Adapter */ "./frontend/Application/Authentication/Adapter.ts");
/* harmony import */ var _Infrastructure_Authentication_AuthenticationClient_Ajax_Ajax__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax */ "./frontend/Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax.ts");
/* harmony import */ var _Infrastructure_Authentication_SessionStorage_BrowserLocalStorage_BrowserLocalStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage */ "./frontend/Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage.ts");
/* harmony import */ var _Authentication_Controller_Controller__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Authentication/Controller/Controller */ "./frontend/Application/Authentication/Controller/Controller.ts");
/* harmony import */ var _Authentication_Controller_Handler_AuthenticationStateHandler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Authentication/Controller/Handler/AuthenticationStateHandler */ "./frontend/Application/Authentication/Controller/Handler/AuthenticationStateHandler.ts");
/* harmony import */ var _Authentication_Controller_Handler_RegistrationHandler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Authentication/Controller/Handler/RegistrationHandler */ "./frontend/Application/Authentication/Controller/Handler/RegistrationHandler.ts");
/* harmony import */ var _Authentication_Controller_Handler_LoginHandler__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Authentication/Controller/Handler/LoginHandler */ "./frontend/Application/Authentication/Controller/Handler/LoginHandler.ts");
/* harmony import */ var _Authentication_Controller_Handler_AuthenticatedHandler__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Authentication/Controller/Handler/AuthenticatedHandler */ "./frontend/Application/Authentication/Controller/Handler/AuthenticatedHandler.ts");
/* harmony import */ var _Core_Authentication_UserAuthenticationUseCase_UserAuthenticationUseCase__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase */ "./frontend/Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase.ts");









class Container {
    startUp;
    rootElement;
    constructor() {
        this.rootElement = document.getElementById('content') || document.body;
        // Infrastructure Layer
        const authClient = new _Infrastructure_Authentication_AuthenticationClient_Ajax_Ajax__WEBPACK_IMPORTED_MODULE_1__["default"]();
        const sessionStorage = new _Infrastructure_Authentication_SessionStorage_BrowserLocalStorage_BrowserLocalStorage__WEBPACK_IMPORTED_MODULE_2__["default"]();
        // Application Layer
        const authAdapter = new _Authentication_Adapter__WEBPACK_IMPORTED_MODULE_0__["default"]();
        // Core Layer (UseCase)
        const authenticationUseCase = new _Core_Authentication_UserAuthenticationUseCase_UserAuthenticationUseCase__WEBPACK_IMPORTED_MODULE_8__["default"](authClient, sessionStorage);
        // Create State Handler (implements StateTransition)
        const authStateHandler = new _Authentication_Controller_Handler_AuthenticationStateHandler__WEBPACK_IMPORTED_MODULE_4__["default"](authAdapter, authenticationUseCase);
        // Create Sub-Handlers with UseCase
        const registrationHandler = new _Authentication_Controller_Handler_RegistrationHandler__WEBPACK_IMPORTED_MODULE_5__["default"](authAdapter, this.rootElement, authStateHandler, authenticationUseCase);
        const loginHandler = new _Authentication_Controller_Handler_LoginHandler__WEBPACK_IMPORTED_MODULE_6__["default"](authAdapter, this.rootElement, authStateHandler, authenticationUseCase);
        const authenticatedHandler = new _Authentication_Controller_Handler_AuthenticatedHandler__WEBPACK_IMPORTED_MODULE_7__["default"](authAdapter, this.rootElement, authStateHandler, authenticationUseCase);
        // Inject Sub-Handlers into State Handler
        authStateHandler.setHandlers(registrationHandler, loginHandler, authenticatedHandler);
        // Create Authentication Controller with all handlers
        this.startUp = new _Authentication_Controller_Controller__WEBPACK_IMPORTED_MODULE_3__["default"](authAdapter, [authStateHandler, registrationHandler, loginHandler, authenticatedHandler]);
    }
}


/***/ },

/***/ "./frontend/Core/Authentication/RegisterEntity.ts"
/*!********************************************************!*\
  !*** ./frontend/Core/Authentication/RegisterEntity.ts ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RegisterEntity)
/* harmony export */ });
class RegisterEntity {
    secret = '';
    qrCodeDataUrl = '';
}


/***/ },

/***/ "./frontend/Core/Authentication/SessionEntity.ts"
/*!*******************************************************!*\
  !*** ./frontend/Core/Authentication/SessionEntity.ts ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SessionEntity)
/* harmony export */ });
class SessionEntity {
    token = '';
    nickname = '';
    expiresAt = '';
}


/***/ },

/***/ "./frontend/Core/Authentication/UserAuthenticationUseCase/LoginUserResponse.ts"
/*!*************************************************************************************!*\
  !*** ./frontend/Core/Authentication/UserAuthenticationUseCase/LoginUserResponse.ts ***!
  \*************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LoginUserResponse)
/* harmony export */ });
class LoginUserResponse {
    nickname;
    constructor(nickname) {
        this.nickname = nickname;
    }
}


/***/ },

/***/ "./frontend/Core/Authentication/UserAuthenticationUseCase/RegisterUserResponse.ts"
/*!****************************************************************************************!*\
  !*** ./frontend/Core/Authentication/UserAuthenticationUseCase/RegisterUserResponse.ts ***!
  \****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RegisterUserResponse)
/* harmony export */ });
class RegisterUserResponse {
    qrCodeDataUrl;
    secret;
    constructor(qrCodeDataUrl, secret) {
        this.qrCodeDataUrl = qrCodeDataUrl;
        this.secret = secret;
    }
}


/***/ },

/***/ "./frontend/Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase.ts"
/*!*********************************************************************************************!*\
  !*** ./frontend/Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase.ts ***!
  \*********************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UserAuthenticationUseCase)
/* harmony export */ });
/* harmony import */ var _RegisterUserResponse_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RegisterUserResponse.ts */ "./frontend/Core/Authentication/UserAuthenticationUseCase/RegisterUserResponse.ts");
/* harmony import */ var _LoginUserResponse_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LoginUserResponse.ts */ "./frontend/Core/Authentication/UserAuthenticationUseCase/LoginUserResponse.ts");
/* harmony import */ var _VerifySessionResponse_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./VerifySessionResponse.ts */ "./frontend/Core/Authentication/UserAuthenticationUseCase/VerifySessionResponse.ts");



class UserAuthenticationUseCase {
    client;
    sessionStorage;
    constructor(client, sessionStorage) {
        this.client = client;
        this.sessionStorage = sessionStorage;
    }
    async register(request) {
        const result = await this.client.register(request.nickname);
        return new _RegisterUserResponse_ts__WEBPACK_IMPORTED_MODULE_0__["default"](result.qrCodeDataUrl, result.secret);
    }
    async login(request) {
        const result = await this.client.login(request.totp);
        this.sessionStorage.save(result);
        return new _LoginUserResponse_ts__WEBPACK_IMPORTED_MODULE_1__["default"](result.nickname);
    }
    async logout() {
        const session = this.sessionStorage.load();
        try {
            if (session.token) {
                await this.client.logout(session.token);
            }
        }
        catch (error) {
            console.error('Logout API error:', error);
        }
        finally {
            this.sessionStorage.clear();
        }
    }
    async verifySession() {
        if (!this.sessionStorage.isValid()) {
            return new _VerifySessionResponse_ts__WEBPACK_IMPORTED_MODULE_2__["default"](null);
        }
        const session = this.sessionStorage.load();
        try {
            const result = await this.client.verify(session.token);
            if (result.valid && result.nickname) {
                return new _VerifySessionResponse_ts__WEBPACK_IMPORTED_MODULE_2__["default"](result.nickname);
            }
            else {
                this.sessionStorage.clear();
                return new _VerifySessionResponse_ts__WEBPACK_IMPORTED_MODULE_2__["default"](null);
            }
        }
        catch {
            this.sessionStorage.clear();
            return new _VerifySessionResponse_ts__WEBPACK_IMPORTED_MODULE_2__["default"](null);
        }
    }
}


/***/ },

/***/ "./frontend/Core/Authentication/UserAuthenticationUseCase/VerifySessionResponse.ts"
/*!*****************************************************************************************!*\
  !*** ./frontend/Core/Authentication/UserAuthenticationUseCase/VerifySessionResponse.ts ***!
  \*****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VerifySessionResponse)
/* harmony export */ });
class VerifySessionResponse {
    nickname;
    constructor(nickname) {
        this.nickname = nickname;
    }
}


/***/ },

/***/ "./frontend/Core/Authentication/VerificationEntity.ts"
/*!************************************************************!*\
  !*** ./frontend/Core/Authentication/VerificationEntity.ts ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VerificationEntity)
/* harmony export */ });
/**
 * Verification Authentication Entity
 * Rückgabewert beim Verify einer Session
 */
class VerificationEntity {
    valid = false;
    nickname = '';
}


/***/ },

/***/ "./frontend/Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax.ts"
/*!**********************************************************************************!*\
  !*** ./frontend/Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax.ts ***!
  \**********************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Ajax)
/* harmony export */ });
/* harmony import */ var _Core_Authentication_RegisterEntity_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../Core/Authentication/RegisterEntity.ts */ "./frontend/Core/Authentication/RegisterEntity.ts");
/* harmony import */ var _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../Core/Authentication/SessionEntity.ts */ "./frontend/Core/Authentication/SessionEntity.ts");
/* harmony import */ var _Core_Authentication_VerificationEntity_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../Core/Authentication/VerificationEntity.ts */ "./frontend/Core/Authentication/VerificationEntity.ts");



/**
 * Authentication Client - Ajax Implementation
 * Kommuniziert mit Backend Authentication Endpoints über HTTP
 */
class Ajax {
    baseUrl = '/api/auth';
    async register(nickname) {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        const data = await response.json();
        const entity = new _Core_Authentication_RegisterEntity_ts__WEBPACK_IMPORTED_MODULE_0__["default"]();
        Object.assign(entity, { secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
        return entity;
    }
    async login(totp) {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totp })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        const data = await response.json();
        const entity = new _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_1__["default"]();
        Object.assign(entity, { token: data.token, nickname: data.nickname, expiresAt: data.expiresAt });
        return entity;
    }
    async logout(token) {
        const response = await fetch(`${this.baseUrl}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Logout failed');
        }
    }
    async verify(token) {
        const response = await fetch(`${this.baseUrl}/verify`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            return new _Core_Authentication_VerificationEntity_ts__WEBPACK_IMPORTED_MODULE_2__["default"]();
        }
        const data = await response.json();
        const entity = new _Core_Authentication_VerificationEntity_ts__WEBPACK_IMPORTED_MODULE_2__["default"]();
        Object.assign(entity, { valid: data.valid, nickname: data.nickname });
        return entity;
    }
}


/***/ },

/***/ "./frontend/Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage.ts"
/*!**********************************************************************************************************!*\
  !*** ./frontend/Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage.ts ***!
  \**********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BrowserLocalStorage)
/* harmony export */ });
/* harmony import */ var _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../Core/Authentication/SessionEntity.ts */ "./frontend/Core/Authentication/SessionEntity.ts");

/**
 * Session Storage - Browser LocalStorage Implementation
 * Persistiert Sessions im Browser localStorage
 */
class BrowserLocalStorage {
    storageKey = 'derbot_session';
    save(session) {
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
    load() {
        const data = localStorage.getItem(this.storageKey);
        if (!data)
            return new _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_0__["default"]();
        try {
            const parsed = JSON.parse(data);
            const session = new _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_0__["default"]();
            Object.assign(session, parsed);
            return session;
        }
        catch {
            return new _Core_Authentication_SessionEntity_ts__WEBPACK_IMPORTED_MODULE_0__["default"]();
        }
    }
    clear() {
        localStorage.removeItem(this.storageKey);
    }
    isValid() {
        const session = this.load();
        if (!session.token)
            return false;
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        if (now > expiresAt) {
            this.clear();
            return false;
        }
        return true;
    }
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************************!*\
  !*** ./frontend/Application/main.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Container__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Container */ "./frontend/Application/Container.ts");

async function main() {
    const container = new _Container__WEBPACK_IMPORTED_MODULE_0__["default"]();
    await container.startUp.initialize();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
}
else {
    void main();
}

})();

/******/ })()
;
//# sourceMappingURL=main.js.map