# viewportobserver.js

Lean and mean scrollhandler to determine which part of observables are visible in viewport. Crucial part of every "lazyloader". `viewportobserver.js` is written in vanilla Javascript and has no dependancies.


## Intro

There are [many](http://www.appelsiini.net/projects/lazyload) and [many](http://css-tricks.com/snippets/javascript/lazy-loading-images/) obviosly good lazy load implemetations around. This is not yet another one. 

The goals of viewobserver were:

* independent, vanilla Javasctipt
* just an observer, allow callbacks to handle DOM modifications, so not only images can be handled
* squeeze the latest drop of fat out of the implementation - to achieve smoothest possible scrolling
* allow reverse of loading, hiding too, important on mobile devices
* prioritize elements directly visible in viewport, delay those inside threshold, but invisible 

## Design desicions
Iterating even over large array's is very fast, array modifications on the contrary (splice f.e.) are very slow. It is common approach in alternative implementations to gradually remove observables, after they are processed. I decided tehrefore, to speed things up,  not to actually remove observeable nodes from observer array, instead, if used in "lazyload mode", observables loaded are just deleted from that array ( `delete observables[i]` ). In the end, when f.e. all images are loaded, scroll handler still iterates every time over that empty array, but it only takes few milliseconds.  

Scroll handler is throttled to the max on desktop computers. On mobile webkit devices only one scroll event at the end of scrolling movement is fired. The same approach on desktop computers as default. Though throttle is configurable to allow infrequent scroll events fired during scrolling too.  

Most alternative implementations work in what I call "live" mode e.g call to determine observables position is made on every cycle. This is slow. If observables position inside page is not changed after they added to observe, there's no need to do that. `viewportobserver.js` works as default ion "non-live" mode where position is calculated only once - when node is added to observe.  

Forgot events, they are slow. Iterate and process over array of observables instead of triggering events to them.


## Usage

**Include viewportobserver.js:**
```html
<script src="path/to/viewportobserver.js" type="text/javascript"></script>
```

**To add nodes to observe:**
```javascript
atirip.viewportobserver( nodes, {
	reveal: function(node) {},
	hide: function(node) {},
	live: false,
	reach: 2,
	
	throttleDuringScroll: false,
	throttleInterval: 200
})
```
Where:  
__nodes__ required, array of DOM nodes to observe ( jQuery result )  
__reveal__ required, callback to reveal or load observable, one argument is passed to the callback - pure vanilla Javascript DOM Node  
__hide__  optional, callback to hide or unload an observable, one argument is passed to the callback - pure vanilla Javascript DOM Node. When operating in "lazyload mode" do not set hide callback
__live__ whether to calculate obsrevables positions on every iteration, if observables positions are fixed, non-live is faster, default is non-live e.g. false  
__reach__ how many "pages" to keep visible, one page is window.height, so 2 keeps 5 "pages" visible, default is 2

You can also change global parameters on every call to `atirip.viewportobserver()`, global parameters affect all nodes set to observe since changed:  
__throttleDuringScroll__  whether to call scrollhandler during scroll, only effective on desktop computers, default false.  
__throttleInterval__ throttle interval throttleDuringScroll set to true, in milliseconds, default 200ms
  
Currently `viewportobserver.js` only supports vertical scrolling viewport and `window` as viewport only. 
 
## Demo

#### To reveal & hide 

Live demo page [https://dl.dropbox.com/u/5572626/viewportobserver/observe.html](https://dl.dropbox.com/u/5572626/viewportobserver/observe.html) which holds 100 different (actually the same, but called with different GET paramaters) images (495p x 600px, 13Okb) each CSS GPU accelerated with `-webkit-transform: translate3d(0, 0, 0);`. This demo uses my [domhide.js](https://github.com/atirip/domhide.js) utility to hide DOM nodes. Scrolling is very smooth, uses not a lot of CPU power and more importantly - even old iOS devices do not crash.

Theres another live demo page [https://dl.dropbox.com/u/5572626/viewportobserver/lazy.html](https://dl.dropbox.com/u/5572626/viewportobserver/lazy.html) which implements the usual lazyload approach. Images (20, the same as above) are simply lazyloaded with `src` attribute change.

As a bonus, DropBox is nicely slow to serve those demos above, exactly what needed :-)
Both demos ar also included in the repo.

## Compatible
	
Tested on Firefox 16, Chrome 23, Opera 12 on Mountain Lion and Windows, Safari 6 on Mountain Lion, IE 8, IE 7 on Windows (Windows XP under Parallels 7), iOS 6, Android 2.3

## TODO

* More testing on what are iOS limits on images
* More test on Android
* Test Windows Phone
* Add horizontal scrolling support

## Contact me

For support, remarks and requests, please mail me at [atirip@yahoo.com](mailto:atirip@yahoo.com).

## License

Copyright (c) 2012 Priit Pirita, released under the MIT license.

