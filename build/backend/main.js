/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./backend/Application/Container.ts"
/*!******************************************!*\
  !*** ./backend/Application/Container.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Controller_1 = __importDefault(__webpack_require__(/*! ./StartUp/Controller/Controller */ "./backend/Application/StartUp/Controller/Controller.ts"));
/**
 * Dependency Injection Container
 * Verwaltet alle Dependencies nach Inverse Dependency Principle
 */
class Container {
    startUp;
    constructor() {
        this.startUp = new Controller_1.default();
    }
}
exports["default"] = Container;


/***/ },

/***/ "./backend/Application/StartUp/Controller/Controller.ts"
/*!**************************************************************!*\
  !*** ./backend/Application/StartUp/Controller/Controller.ts ***!
  \**************************************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Application Controller
 * Startet die Control-Logik und initialisiert Handler
 */
class Controller {
    constructor() {
    }
    async start() {
        console.log('DerBot Backend starting...');
        // Initialize handlers here
        console.log('DerBot Backend started successfully');
    }
    async stop() {
        console.log('DerBot Backend stopping...');
        // Cleanup logic
    }
}
exports["default"] = Controller;


/***/ },

/***/ "./backend/Application/main.ts"
/*!*************************************!*\
  !*** ./backend/Application/main.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Container_1 = __importDefault(__webpack_require__(/*! ./Container */ "./backend/Application/Container.ts"));
/**
 * Main Entry Point
 * Initialisiert Container und startet Controller
 */
async function main() {
    const container = new Container_1.default();
    await container.startUp.start();
}
main().catch((error) => {
    console.error('Application error:', error);
    process.exit(1);
});


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./backend/Application/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map