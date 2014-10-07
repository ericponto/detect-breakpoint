(function(window, document) {
	
	// detect is css custom properties are supported
	var el = document.createElement("div");
	el.style.cssText = "--test:#f00;color:var(--test);";
		
	var customPropsSupported = (el.style.length === 2);
	
	/**
	 * detect the active breakpoint via the `--breakpoint` custom property
	 * @param {String} selector
	 * @returns {String} the active breakpoint
	 */
	function detectViaCustomProp(selector) {
		var el = document.querySelector(selector);
		
		return window.getComputedStyle(el)
			.getPropertyValue("--breakpoint");
	}
	
	/**
	 * detect the active breakpoint via the `content` of a pseudo element
	 * @param {String} selector
	 * @returns {String} the active breakpoint
	 */
	function detectViaPseudoEl(selector) {
		// create an empty div that matches the fake selector
		var el = document.createElement("div");
		el.setAttribute("data-selector", selector + "__detectBreakpoint__");
		
		// add it to the body so it can properly calc styles
		var body = document.body;
		body.appendChild(el);
			
		// get the breakpoint value
		var breakpoint =  window.getComputedStyle(el, ":before")
			.getPropertyValue("content");
		
		// remove the element
		body.removeChild(el);
		
		return breakpoint;
	}
	
	/**
	 * detect which breakpoint is active
	 * @param {String} selector The selector that matches the CSS
	 * @returns {String} The value of the --breakpoint property
	 */
	function detectBreakpoint(selector) {
		// happy path, get custom prop from getComputedStyle
		if (customPropsSupported) {
			return detectViaCustomProp(selector)
		}
		
		// else use the :before/content fallback
		return detectViaPseudoEl(selector);
	}
	
	// save `detectBreakpoint` as a global
	window.detectBreakpoint =  detectBreakpoint;
	
	// AMD registration if `define` is available
	if (typeof define === "function" && define.amd) {
		define("detectBreakpoint", [], function() {
			return detectBreakpoint;
		});
	}
	
})(window, document);