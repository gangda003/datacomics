/*!
 * iButton jQuery Plug-in
 *
 * Copyright 2011 Giva, Inc. (http://www.givainc.com/labs/) 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 	http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Date: 2011-07-26
 * Rev:  1.0.03
 */
;(function(jQuery){
	// set default options
	jQuery.iButton = {
		version: "1.0.03",
		setDefaults: function(options){
			jQuery.extend(defaults, options);
		}
	};
	
	jQuery.fn.iButton = function(options) {
		var method = typeof arguments[0] == "string" && arguments[0];
		var args = method && Array.prototype.slice.call(arguments, 1) || arguments;
		// get a reference to the first iButton found
		var self = (this.length == 0) ? null : jQuery.data(this[0], "iButton");
		
		// if a method is supplied, execute it for non-empty results
		if( self && method && this.length ){

			// if request a copy of the object, return it			
			if( method.toLowerCase() == "object" ) return self;
			// if method is defined, run it and return either it's results or the chain
			else if( self[method] ){
				// define a result variable to return to the jQuery chain
				var result;
				this.each(function (i){
					// apply the method to the current element
					var r = jQuery.data(this, "iButton")[method].apply(self, args);
					// if first iteration we need to check if we're done processing or need to add it to the jquery chain
					if( i == 0 && r ){
						// if this is a jQuery item, we need to store them in a collection
						if( !!r.jquery ){
							result = jQuery([]).add(r);
						// otherwise, just store the result and stop executing
						} else {
							result = r;
							// since we're a non-jQuery item, just cancel processing further items
							return false;
						}
					// keep adding jQuery objects to the results
					} else if( !!r && !!r.jquery ){
						result = result.add(r);
					}
				});

				// return either the results (which could be a jQuery object) or the original chain
				return result || this;
			// everything else, return the chain
			} else return this;
		// initializing request (only do if iButton not already initialized)
		} else {
			// create a new iButton for each object found
			return this.each(function (){
				new iButton(this, options);
			});
		};
	};

	// count instances	
	var counter = 0;
	// detect iPhone
	jQuery.browser.iphone = (navigator.userAgent.toLowerCase().indexOf("iphone") > -1);
	
	var iButton = function (input, options){
		var self = this
			, jQueryinput = jQuery(input)
			, id = ++counter
			, disabled = false
			, width = {}
			, mouse = {dragging: false, clicked: null}
			, dragStart = {position: null, offset: null, time: null }
			// make a copy of the options and use the metadata if provided
			, options = jQuery.extend({}, defaults, options, (!!jQuery.metadata ? jQueryinput.metadata() : {}))
			// check to see if we're using the default labels
			, bDefaultLabelsUsed = (options.labelOn == ON && options.labelOff == OFF)
			// set valid field types
			, allow = ":checkbox, :radio";

		// only do for checkboxes buttons, if matches inside that node
    if( !jQueryinput.is(allow) ) return jQueryinput.find(allow).iButton(options);
		// if iButton already exists, stop processing
		else if(jQuery.data(jQueryinput[0], "iButton") ) return;

		// store a reference to this marquee
		jQuery.data(jQueryinput[0], "iButton", self);
		
		// if using the "auto" setting, then don't resize handle or container if using the default label (since we'll trust the CSS)
		if( options.resizeHandle == "auto" ) options.resizeHandle = !bDefaultLabelsUsed;
		if( options.resizeContainer == "auto" ) options.resizeContainer = !bDefaultLabelsUsed;
		
		// toggles the state of a button (or can turn on/off)
		this.toggle = function (t){
			var toggle = (arguments.length > 0) ? t : !jQueryinput[0].checked;
			jQueryinput.attr("checked", toggle).trigger("change");
		};
		
		// disable/enable the control
		this.disable = function (t){
			var toggle = (arguments.length > 0) ? t : !disabled;
			// mark the control disabled
			disabled = toggle;
			// mark the input disabled
			jQueryinput.attr("disabled", toggle);
			// set the diabled styles
			jQuerycontainer[toggle ? "addClass" : "removeClass"](options.classDisabled);
			// run callback
			if( jQuery.isFunction(options.disable) ) options.disable.apply(self, [disabled, jQueryinput, options]);
		};
		
		// repaint the button
		this.repaint = function (){
			positionHandle();
		};
		
		// this will destroy the iButton style
		this.destroy = function (){
			// remove behaviors
			jQuery([jQueryinput[0], jQuerycontainer[0]]).unbind(".iButton");
			jQuery(document).unbind(".iButton_" + id);
			// move the checkbox to it's original location
			jQuerycontainer.after(jQueryinput).remove();
			// kill the reference
			jQuery.data(jQueryinput[0], "iButton", null);
			// run callback
			if( jQuery.isFunction(options.destroy) ) options.destroy.apply(self, [jQueryinput, options]);
		};

    jQueryinput
			// create the wrapper code
			.wrap('<div class="' + jQuery.trim(options.classContainer + ' ' + options.className) + '" />')
    	.after(
				  '<div class="' + options.classHandle + '"><div class="' + options.classHandleRight + '"><div class="' + options.classHandleMiddle + '" /></div></div>'
      	+ '<div class="' + options.classLabelOff + '"><span><label>'+ options.labelOff + '</label></span></div>'
      	+ '<div class="' + options.classLabelOn + '"><span><label>' + options.labelOn   + '</label></span></div>'
      	+ '<div class="' + options.classPaddingLeft + '"></div><div class="' + options.classPaddingRight + '"></div>'
			);

    var jQuerycontainer = jQueryinput.parent()
			, jQueryhandle    = jQueryinput.siblings("." + options.classHandle)
			, jQueryofflabel  = jQueryinput.siblings("." + options.classLabelOff)
			, jQueryoffspan   = jQueryofflabel.children("span")
			, jQueryonlabel   = jQueryinput.siblings("." + options.classLabelOn)
			, jQueryonspan    = jQueryonlabel.children("span");


		// if we need to do some resizing, get the widths only once
		if( options.resizeHandle || options.resizeContainer ){
			width.onspan = jQueryonspan.outerWidth(); 
			width.offspan = jQueryoffspan.outerWidth();
		}
			
		// automatically resize the handle
		if( options.resizeHandle ){
			width.handle = Math.min(width.onspan, width.offspan);
			jQueryhandle.css("width", width.handle);
		} else {
			width.handle = jQueryhandle.width();
		}

    // automatically resize the control
		if( options.resizeContainer ){
			width.container = (Math.max(width.onspan, width.offspan) + width.handle + 20);
			jQuerycontainer.css("width", width.container);
			// adjust the off label to match the new container size
			jQueryofflabel.css("width", width.container - 5);
		} else {
			width.container = jQuerycontainer.width();
		}

		var handleRight = width.container - width.handle - 6;
    
		var positionHandle = function (animate){
			var checked = jQueryinput[0].checked
				, x = (checked) ? handleRight : 0
				, animate = (arguments.length > 0) ? arguments[0] : true;

			if( animate && options.enableFx ){
				jQueryhandle.stop().animate({left: x}, options.duration, options.easing);
				jQueryonlabel.stop().animate({width: x + 4}, options.duration, options.easing);
				jQueryonspan.stop().animate({marginLeft: x - handleRight}, options.duration, options.easing);
				jQueryoffspan.stop().animate({marginRight: -x}, options.duration, options.easing);
			} else {
				jQueryhandle.css("left", x);
				jQueryonlabel.css("width", x + 4);
				jQueryonspan.css("marginLeft", x - handleRight);
				jQueryoffspan.css("marginRight", -x);
			}
		};

		// place the buttons in their default location	
		positionHandle(false);
		
		var getDragPos = function(e){
			return e.pageX || ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : 0);
		};

		// monitor mouse clicks in the container
		jQuerycontainer.bind("mousedown.iButton touchstart.iButton", function(e) {
			// abort if disabled or allow clicking the input to toggle the status (if input is visible)
			if( jQuery(e.target).is(allow) || disabled || (!options.allowRadioUncheck && jQueryinput.is(":radio:checked")) ) return;
			
			e.preventDefault();
			mouse.clicked = jQueryhandle;
			dragStart.position = getDragPos(e);
			dragStart.offset = dragStart.position - (parseInt(jQueryhandle.css("left"), 10) || 0);
			dragStart.time = (new Date()).getTime();
			return false;
		});

		// make sure dragging support is enabled		
		if( options.enableDrag ){
			// monitor mouse movement on the page
			jQuery(document).bind("mousemove.iButton_" + id + " touchmove.iButton_" + id, function(e) {
				// if we haven't clicked on the container, cancel event
				if( mouse.clicked != jQueryhandle ){ return }
				e.preventDefault();
				
				var x = getDragPos(e);
				if( x != dragStart.offset ){
					mouse.dragging = true;
					jQuerycontainer.addClass(options.classHandleActive);
				}
	
				// make sure number is between 0 and 1			
				var pct = Math.min(1, Math.max(0, (x - dragStart.offset) / handleRight));
				
				jQueryhandle.css("left", pct * handleRight);
				jQueryonlabel.css("width", pct * handleRight + 4);
				jQueryoffspan.css("marginRight", -pct * handleRight);
				jQueryonspan.css("marginLeft", -(1 - pct) * handleRight);
				
				return false;
			});
		}
    
		// monitor when the mouse button is released
		jQuery(document).bind("mouseup.iButton_" + id + " touchend.iButton_" + id, function(e) {
			if( mouse.clicked != jQueryhandle ){ return false }
			e.preventDefault();

			// track if the value has changed			
			var changed = true;

			// if not dragging or click time under a certain millisecond, then just toggle			
			if( !mouse.dragging || (((new Date()).getTime() - dragStart.time) < options.clickOffset ) ){
				var checked = jQueryinput[0].checked;
				jQueryinput.attr("checked", !checked);

				// run callback
				if( jQuery.isFunction(options.click) ) options.click.apply(self, [!checked, jQueryinput, options]);
			} else {
				var x = getDragPos(e);
				
				var pct = (x - dragStart.offset) / handleRight;
				var checked = (pct >= 0.5);
				
				// if the value is the same, don't run change event
				if( jQueryinput[0].checked == checked ) changed = false;

				jQueryinput.attr("checked", checked);
			}
			
			// remove the active handler class			
			jQuerycontainer.removeClass(options.classHandleActive);
			mouse.clicked =  null;
			mouse.dragging = null;
			// run any change event for the element
			if( changed ) jQueryinput.trigger("change");
			// if the value didn't change, just reset the handle
			else positionHandle();
			
			return false;
		});
		
		// animate when we get a change event
		jQueryinput
			.bind("change.iButton", function (){
				// move handle
				positionHandle();

				// if a radio element, then we must repaint the other elements in it's group to show them as not selected
				if( jQueryinput.is(":radio") ){
					var el = jQueryinput[0];
	
					// try to use the DOM to get the grouped elements, but if not in a form get by name attr
					var jQueryradio = jQuery(el.form ? el.form[el.name] : ":radio[name=" + el.name + "]");

					// repaint the radio elements that are not checked	
					jQueryradio.filter(":not(:checked)").iButton("repaint");
				}

				// run callback
				if( jQuery.isFunction(options.change) ) options.change.apply(self, [jQueryinput, options]);
			})
			// if the element has focus, we need to highlight the container
			.bind("focus.iButton", function (){
				jQuerycontainer.addClass(options.classFocus);
			})
			// if the element has focus, we need to highlight the container
			.bind("blur.iButton", function (){
				jQuerycontainer.removeClass(options.classFocus);
			});

		// if a click event is registered, we must register on the checkbox so it's fired if triggered on the checkbox itself
		if( jQuery.isFunction(options.click) ){
			jQueryinput.bind("click.iButton", function (){
				options.click.apply(self, [jQueryinput[0].checked, jQueryinput, options]);
			});
		}

		// if the field is disabled, mark it as such
		if( jQueryinput.is(":disabled") ) this.disable(true);

		// special behaviors for IE    
		if( jQuery.browser.msie ){
			// disable text selection in IE, other browsers are controlled via CSS
			jQuerycontainer.find("*").andSelf().attr("unselectable", "on");
			// IE needs to register to the "click" event to make changes immediately (the change event only occurs on blur)
			jQueryinput.bind("click.iButton", function (){ jQueryinput.triggerHandler("change.iButton"); });
		}
		
		// run the init callback
		if( jQuery.isFunction(options.init) ) options.init.apply(self, [jQueryinput, options]);
	};

	var defaults = {
		  duration: 200                           // the speed of the animation
		, easing: "swing"                         // the easing animation to use
		, labelOn: "ON"                           // the text to show when toggled on
		, labelOff: "OFF"                         // the text to show when toggled off
		, resizeHandle: "auto"                    // determines if handle should be resized
		, resizeContainer: "auto"                 // determines if container should be resized
		, enableDrag: true                        // determines if we allow dragging
		, enableFx: true                          // determines if we show animation
		, allowRadioUncheck: false                // determine if a radio button should be able to be unchecked
		, clickOffset: 120                        // if millseconds between a mousedown & mouseup event this value, then considered a mouse click

		// define the class statements
		, className:         ""
		, classContainer:    "ibutton-container"
		, classDisabled:     "ibutton-disabled"
		, classFocus:        "ibutton-focus"
		, classLabelOn:      "ibutton-label-on"
		, classLabelOff:     "ibutton-label-off"
		, classHandle:       "ibutton-handle"
		, classHandleMiddle: "ibutton-handle-middle"
		, classHandleRight:  "ibutton-handle-right"
		, classHandleActive: "ibutton-active-handle"
		, classPaddingLeft:  "ibutton-padding-left"
		, classPaddingRight: "ibutton-padding-right"

		// event handlers
		, init: null                              // callback that occurs when a iButton is initialized
		, change: null                            // callback that occurs when the button state is changed
		, click: null                             // callback that occurs when the button is clicked
		, disable: null                           // callback that occurs when the button is disabled/enabled
		, destroy: null                           // callback that occurs when the button is destroyed
	}, ON = defaults.labelOn, OFF = defaults.labelOff;

})(jQuery);
