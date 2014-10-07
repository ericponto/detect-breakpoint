## Detect the Active Breakpoint via CSS Custom Properties

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

	// pass in the selector from the CSS
	var activeBreakpoint = detectBreakpoint("#testEl");
	
	// activeBreakpoint = "small", "medium" or "large"
	
##Browser Support
Right now only Firefox supports CSS Custom Properites (check [caniuse](http://caniuse.com/#feat=css-variables) for the latest). In order to support older browsers, there is a fallback to use a `:before` pseudo element and the `content` property to store the names of the breakpoints. There is a Grunt task (propToContent) that will add the CSS for the before/content method automatically. The `detectBreakpoint` function does a feature detect on CSS Custom Properties and will fallback on the before/content method if they are not supported.
