(function(window, document) {
	
	// regular expressions for CSS parsing
	var RE_COMMENT = /\/\*[^*]*\*+([^/][^*]*\*+)*\//gi;
	var RE_MQS = /(@media[^\{]+)\{([^\{\}]*\{[^\}\{]*\})+/gi;
	var RE_RULE = /(.*?){(.*?)}/;
	var RE_RULES = /(.*?){(.*?)}/g;
	var RE_BREAKPOINTS = /--breakpoint:\s*([\w-_]+);?/g;
	var RE_BREAKPOINT = /--breakpoint:\s*([\w-_]+);?/;
	
	// store reference to a few elements
	var head = document.getElementsByTagName("head")[0] || document.documentElement;
	var body = document.body;
	
	// ready state, callbacks for ready, and queue of xhrs
	var ready = false;
	var callbacks = [];
	var queue = [];
	
	/**
	 * check the queue of xhrs and see if they are all done
	 */
	function checkQueue() {
		var done = true;
		for (var i = 0, l = queue.length; i < l; i++) {
			if (queue[i].readyState !== 4) {
				done = false;
				break;
			}
		}
		
		// if all xhrs are done, then fire the callbacks
		if (done) {
			ready = true;
			fireCallbacks();
		}
	}
	
	/**
	 * fire all the callbacks stored via ready()
	 */
	function fireCallbacks() {
		for (var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i]();
		}
		
		// empty callbacks
		callbacks.length = 0;
	}
	
	/**
	 * feature test for CSS Custom Properties
	 * return {Boolean}
	 */
	function isCssCustomPropsSupported() {
		var el = document.createElement("div");
		el.style.cssText = "--test:#f00;color:var(--test);";
		
		return el.style.length === 2;
	}
	
	/**
	 * parse a css rulset for `--breakpoint`
	 * @param {String} ruleset The body of the a css ruleset
	 * @param {String} selector The selector
	 * @returns {String} A new set of CSS using a pseudo element
	 */
	function getBreakpointsInRule(ruleset, selector) {
		var matches = ruleset.match(RE_BREAKPOINTS);
		var breakpoint;
		
		// no --breakpoint properties
		if (!matches.length) {
			return "";
		}
		
		// get the last one if there are multiples
		breakpoint = matches[matches.length - 1].match(RE_BREAKPOINT)[1];
		
		return "[data-bp-selector=\"" + selector + "\"]:before{content:\"" + breakpoint + "\";}";
	}
	
	/**
	 * split a rule into the selector and ruleset
	 * @returns the result of calling getBreakpointInRule()
	 */
	function processRule(rule) {
		var match = rule.match(RE_RULE);
		var selector = match[1].trim();
		var ruleset = match[2];
		
		// make sure it isn't a @rule (like media query)
		if (selector.indexOf("@") > -1) {
			return "";
		}
		
		return getBreakpointsInRule(ruleset, selector);
	}
	
	/**
	 * create a style sheet and append it to the head with given css
	 * @param {String} css The css to append to the head
	 */
	function createStyleSheet(css) {
		var ss = document.createElement("style");
		ss.type = "text/css";
		
		// add new stylesheet to head
		head.appendChild(ss);
		
		// add the text to the stylesheet
		if (ss.styleSheet){
			ss.styleSheet.cssText = css;
		}
		else {
			ss.appendChild(document.createTextNode(css));
		}
	}
	
	/**
	 * parse some CSS by breaking up the media queries and rules
	 * ultimately we're looking for rules that contain --breakpoint properties
	 * @param {String} css The css to parse
	 */
	function parseCSS(css) {
		var results = "";
		var mediaQueryResults = "";
		var allCss = "";
		
		// remove comments and new lines
		css = css.replace(RE_COMMENT, "")
			.replace(/\n/g, "");
		
		// rules in a media query (plus remove them to later parse rules not in a MQ)
		css = css.replace(RE_MQS, function($0, $1, $2) {
			var rules = $2.match(RE_RULES);
			var temp = "";
			
			if (rules) {
				for (var i = 0, l = rules.length; i < l; i++) {
					temp += processRule(rules[i]);
				}
				
				// if there were breakpoint rules, then add them
				if (temp.length) {
					mediaQueryResults += $1 + "{" + temp + "}";
				}
			}
		});
		
		var rules = css.match(RE_RULES);
		
		for (var i = 0, l = rules.length; i < l; i++) {
			results += processRule(rules[i]);
		}
		
		allCss = results + mediaQueryResults;
		
		if (allCss.length) {
			allCss += "[data-bp-selector]:before{display:none}"
			createStyleSheet(allCss);
		}
	}
	
	/**
	 * ajax in all the `link` stylesheets so they can be parsed
	 * hopefully the css is cached so won't take much of a performance hit
	 * @returns {xhr} The xhr instance
	 */
	function getCSS(href) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4){
				if (xhr.status == 200 || xhr.status == 304) {
					parseCSS(xhr.responseText);
				}
				checkQueue();
			}
		};
		
		xhr.open("get", href, true);
		xhr.send();
		return xhr;
	}
	
	/**
	 * find all the link elements that are rel=stylesheet
	 * then call to ajax them in for parsing
	 */
	function findCSS() {
		var links = document.getElementsByTagName("link");
		var link;
		
		for (var i = 0, l = links.length; i < l; i++) {
			link = links[i];

			if (link.rel && link.rel.toLowerCase() == "stylesheet") {
				queue.push(getCSS(link.href));
			}
		}
	}
	
	
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
		el.setAttribute("data-bp-selector", selector);
		
		// add it to the body so it can properly calc styles
		body.appendChild(el);
			
		// get the breakpoint value
		var breakpoint = window.getComputedStyle(el, ":before")
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
		// if getcomputedstyle isn't supported, then return nothing
		if (!window.getComputedStyle) {
			return;
		}
		
		// happy path, get custom prop from getComputedStyle
		if (customPropsSupported) {
			return detectViaCustomProp(selector)
		}
		
		// else use the :before/content fallback
		return detectViaPseudoEl(selector);
	}
	
	/**
	 * kind of like jQuery's document ready
	 * makes sure all the CSS has been parse and transformed if CSS custom props aren't support
	 * @param {Function} callback The funciton to call once detectBreakpoint is ready
	 */
	detectBreakpoint.ready = function(callback) {
		if (ready) {
			callback();
		} else {
			// add it to the list of callbacks to be executed once ready
			callbacks.push(callback);
		}
	};
	
	// initialize reading in the CSS if neccessary
	// otherwise just set ready to true
	var customPropsSupported = isCssCustomPropsSupported();
	if (!customPropsSupported) {
		findCSS();
	} else {
		ready = true;
	}
	
	// save `detectBreakpoint` as a global
	window.detectBreakpoint = detectBreakpoint;
	
	// AMD registration if `define` is available
	if (typeof define === "function" && define.amd) {
		define("detectBreakpoint", [], function() {
			return detectBreakpoint;
		});
	}
	
})(window, document);