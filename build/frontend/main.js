/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./frontend/Application/Container.ts"
/*!*******************************************!*\
  !*** ./frontend/Application/Container.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Container)
/* harmony export */ });
/* harmony import */ var _StartUp_Controller_Controller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./StartUp/Controller/Controller */ "./frontend/Application/StartUp/Controller/Controller.ts");
/* harmony import */ var _StartUp_Controller_Handler_Handler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./StartUp/Controller/Handler/Handler */ "./frontend/Application/StartUp/Controller/Handler/Handler.ts");
/* harmony import */ var _StartUp_View_View__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./StartUp/View/View */ "./frontend/Application/StartUp/View/View.ts");
/* harmony import */ var _StartUp_Adapter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./StartUp/Adapter */ "./frontend/Application/StartUp/Adapter.ts");




/**
 * Frontend Dependency Injection Container
 * Erstellt alle Controller-Instanzen im Konstruktor
 */
class Container {
    startUp;
    constructor() {
        const adapter = new _StartUp_Adapter__WEBPACK_IMPORTED_MODULE_3__["default"]();
        const view = new _StartUp_View_View__WEBPACK_IMPORTED_MODULE_2__["default"](adapter);
        const handlers = [
            new _StartUp_Controller_Handler_Handler__WEBPACK_IMPORTED_MODULE_1__["default"](adapter)
        ];
        this.startUp = new _StartUp_Controller_Controller__WEBPACK_IMPORTED_MODULE_0__["default"](adapter, handlers, view);
    }
}


/***/ },

/***/ "./frontend/Application/StartUp/Adapter.ts"
/*!*************************************************!*\
  !*** ./frontend/Application/StartUp/Adapter.ts ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Adapter)
/* harmony export */ });
/**
 * Adapter Class
 * Callback-Verbindung zwischen View und Controller/Handler
 */
class Adapter {
    onAction;
}


/***/ },

/***/ "./frontend/Application/StartUp/Controller/Controller.ts"
/*!***************************************************************!*\
  !*** ./frontend/Application/StartUp/Controller/Controller.ts ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Controller)
/* harmony export */ });
/**
 * Application Controller (Frontend)
 * Startet Control-Logik und initialisiert Handler
 */
class Controller {
    adapter;
    handlers;
    view;
    constructor(adapter, handlers, view) {
        this.adapter = adapter;
        this.handlers = handlers;
        this.view = view;
    }
    async initialize() {
        console.log('DerBot Frontend starting...');
        for (const handler of this.handlers)
            await handler.initialize();
        this.view.render();
    }
}


/***/ },

/***/ "./frontend/Application/StartUp/Controller/Handler/Handler.ts"
/*!********************************************************************!*\
  !*** ./frontend/Application/StartUp/Controller/Handler/Handler.ts ***!
  \********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Handler)
/* harmony export */ });
/**
 * Application Handler
 * Enthält Control-Logik für Aktionen
 */
class Handler {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    async initialize() {
        this.bindActions();
    }
    bindActions() {
        this.adapter.onAction = (data) => this.handleAction(data);
    }
    handleAction(data) {
        console.log('Action triggered:', data);
    }
}


/***/ },

/***/ "./frontend/Application/StartUp/View/View.ts"
/*!***************************************************!*\
  !*** ./frontend/Application/StartUp/View/View.ts ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ View)
/* harmony export */ });
/**
 * Application View
 * Native HTML5 UI - keine Frameworks
 */
class View {
    adapter;
    rootElement = null;
    constructor(adapter) {
        this.adapter = adapter;
    }
    render() {
        this.rootElement = document.getElementById('content');
        if (!this.rootElement) {
            console.error('Root element not found');
            return;
        }
        this.rootElement.innerHTML = this.getTemplate();
        this.attachEvents();
    }
    getTemplate() {
        return `
      <div class="app-container">
        <p>Welcome to DerBot</p>
        <button id="actionButton">Click Me</button>
      </div>
    `;
    }
    attachEvents() {
        const button = document.getElementById('actionButton');
        if (button) {
            button.addEventListener('click', () => {
                this.adapter.onAction?.({ type: 'button-click' });
            });
        }
    }
    updateContent(content) {
        if (this.rootElement) {
            const container = this.rootElement.querySelector('.app-container');
            if (container) {
                container.innerHTML += `<p>${content}</p>`;
            }
        }
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

/**
 * Main Entry Point (Frontend)
 */
async function main() {
    const container = new _Container__WEBPACK_IMPORTED_MODULE_0__["default"]();
    void container.startUp.initialize();
}
// Start when DOM is ready
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