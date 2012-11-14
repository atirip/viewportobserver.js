/*jshint laxcomma:true, laxbreak: true, asi:true */
/*
* MIT Licensed
* Copyright (c) 2012, Priit Pirita, atirip@yahoo.com
* https://github.com/atirip/vieportobserver.js
*/

;(function(window, APP) {

	var reachDefault = 2 // how many "pages" to keep visible, one page is window.height, so 2 keeps 5 "pages" visible
	,	liveDefault = false // whether to ask getBoundingClientRect always, or only once
	,	throttleDuringScroll = false
	,	throttleInterval = 200
	,	doc = window.document
	,	docElem = doc.documentElement
	,	body = doc.body
	,	slice = Array.prototype.slice
	,	observables = []

	,	scrollHandler = function() {
			var run = function() {
				var height = (doc.compatMode === "CSS1Compat" && docElem.clientHeight || body && body.clientHeight || docElem.clientHeight)||800
				,	top = docElem.scrollTop || body.scrollTop
				,	i = 0
				,	o
				,	l = observables.length

				// we could benefit educated quess here, which ones not to loop at all ?
				for(; i < l; i++) {
					if ( (o = observables[i]) && false === o.call(null, height, top) ) {
							// it is not worth to do anything more,
							// iterating over huge empty array is lightning fast
							// so we just delete and even do not remove scroll handler
							// array.splice would remove elements, but it is SLOW
							// so this approach is faster in the end, even when all are revealed
							delete observables[i]
					}
				}

			}
			setTimeout(run, 10)
		}
	
	,	throttle = function (interval, fn) {
			var lastTime = null
			,	timer = null

			return function () {
				var self = this
				,	args = slice.call(arguments, 0)
				,	func = function () {
						fn.apply(self, args)
						lastTime = null
					}
				,	run = function () {
						if ( throttleDuringScroll ) {
							var now = new Date
							if (now - lastTime > interval) {
								// if interval passed, call
								lastTime = now
								fn.apply(self, args)
							}
						}
						// call once after last ettempt
						timer && clearTimeout(timer)
						timer = setTimeout(func, interval)
					}
				setTimeout(run, 10)
			}
		}
	
		/*
			nodes - array or array like nodeset ( may be jquery result )
			optioos {
				reach - reach in pages, where one page is viewport height, reach 2 gives us 5 pages - actual viewport + 2 at top and 2 at bottom
				live - if nodes offset in page is possibly changing, set live to true (slower)
				reveal - function to reaveal node, takes one parameter, the node
				hide - function to hide node, takes one parameter, the node, do not set in "lazyload" setup
				
				you can change global settings too
				throttleDuringScroll - default is false
				throttleInterval - default is 200
				
			}
		*/
	,	observe = function(nodes, options) {
			options = options || {}
			// set globals, on both 0 || false is valid setting
			;(undefined !== options.throttleDuringScroll) && (throttleDuringScroll = options.throttleDuringScroll)
			;(undefined !== options.throttleInterval) && (throttleInterval = options.throttleInterval)
	
			var hide = options.hide
			,	reveal = options.reveal ? function(node, timeout) {
					var callback = function() { options.reveal(node) }
					;( undefined === timeout ) ? options.reveal(node) : setTimeout(callback, timeout)
				} : function() {}
			,	reach = options.reach || reachDefault
			,	live = options.live || liveDefault
			,	len = +(nodes && nodes.length)||0
			,	i = 0
			,	node
			,	rect
			,	top = docElem.scrollTop || body.scrollTop
	
			for(; i < len; i++) {
				node = nodes[i]
				if ( !live ) {
					rect = node.getBoundingClientRect()
					// ? for some reason ClientRect seems to be read-only on iOS ...
					rect = {
						// adjust it accordingly to window scrollpos
						top: rect.top + top,
						bottom: rect.bottom + top
					}
				}
				observables[observables.length] = (function(node, live, reveal, hide, rect, reach){

					return function(height, top) {

						var mtop
						,	mbot
						,	vtop
						,	vbot

						if ( height.observeHeight ) {
							top = height.observeTop
							height = height.observeHeight
						}

						mtop = -reach * height // full area to reveal
						mbot = -mtop + height
						vtop = 0 // directly visible area
						vbot = height
							
						if ( live ) {
							rect = node.getBoundingClientRect()
						} else {
							mtop = top + mtop
							mbot = top + mbot
							vtop = top
							vbot = top + vbot
						}

						// element is visible when its top < max bottom && bottom > max top
						if ( rect.bottom > mtop && rect.top < mbot ) {
							// throw not visible nodes out of the thread, then they execute later
							reveal.call(window, node, rect.bottom > vtop && rect.top < vbot ? undefined : 10)
							if ( !hide ) {
								// false signals to remove this observable
								return false
							}
						} else {
							hide && hide.call(window, node)
						}
						return true
					}
				})(node, live, reveal, hide, rect, reach) // close all in

			}
			scrollHandler()
		}
	
	,	scrollThrottle = (function() {
			if ( 'ontouchstart' in window ) {
				// on touch devices we have only one scroll event during scrolling, at the end
				return scrollHandler
			} else {
				// fire after throttleInterval since last scroll event
				return throttle(throttleInterval, scrollHandler)
			}
		})()

	// https://github.com/jquery/jquery/pull/796 no point to do a workaround
	if ( !("getBoundingClientRect" in docElem) ) {
		APP.observeViewport = function() {}
		return
	}

	// we only add scroll event handler, never remove
	if ( window.addEventListener ) {
		window.addEventListener('scroll', scrollThrottle, false)
	} else if( window.attachEvent ) {
		window.attachEvent('onscroll', scrollThrottle)
	}

	APP.viewportobserver = observe

})(window, (window.atirip || (window.atirip = {}) ));
