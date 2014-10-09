#Detect the Active Breakpoint via CSS Custom Properties

##detectBreakpoint

**CSS** - use CSS Custom Properties (aka CSS Variables) to name different breakpoints.

	#testEl {
		--breakpoint: small;
	}
	
	@media all and (min-width: 40em) {
		#testEl {
			--breakpoint: medium;
		}
	}
	
	@media all and (min-width: 75em) {
		#testEl {
			--breakpoint: large;
		}
	}

**JavaScript** - use `detectBreapoint` to get the name of the active breakpoint for a specific element

	detectBreakpoint.ready(function() {
		// pass in the selector from the CSS
		var activeBreakpoint = detectBreakpoint("#testEl");
		
		// activeBreakpoint = "small", "medium" or "large"
	});
	
##Browser Support
Right now only Firefox supports CSS Custom Properites (check [caniuse](http://caniuse.com/#feat=css-variables) for the latest). In order to support older browsers, there is a fallback to use a `:before` pseudo element and the `content` property to store the names of the breakpoints. The script will automatically AJAX in all the `link`ed CSS and parse it for the custom property `--breakpoint` and convert it to the fallback (using a very similar technique to Respond.js). However, to read the `content` of the `:before`, it uses `getComputedStyle` with pseudo elements (see [support on caniuse](http://caniuse.com/#feat=getcomputedstyle)--it's basically IE9+).

Because the fallback requires the stylesheets to be AJAXed in to be parsed, `detectBreakpoint` isn't immediately ready to be used. To make sure it is ready, there is a `ready` method, similar to jQuery's good ol' doc ready.

	detectBreakpoint.ready(function() {
		// safe to use detectBreakpoint
		var activeBreakpoint = detectBreakpoint("#testEl");
	});