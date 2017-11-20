// Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
// source code is governed by a BSD-style license that can be found in the
// LICENSE file.
var screenshot = {
	tab : 0,
	canvas : document.createElement("canvas"),
	startX : 0,
	startY : 0,
	scrollX : 0,
	scrollY : 0,
	docHeight : 0,
	docWidth : 0,
	visibleWidth : 0,
	visibleHeight : 0,
	scrollXCount : 0,
	scrollYCount : 0,
	scrollBarX : 17,
	scrollBarY : 17,
	captureStatus : true,
	svg : "",

	handleHotKey : function(keyCode) {
		if (HotKey.isEnabled()) {
			switch (keyCode) {
				case HotKey.getCharCode('area'):
					screenshot.showSelectionArea();
					break;
				case HotKey.getCharCode('viewport'):
					screenshot.captureWindow();
					break;
				case HotKey.getCharCode('fullpage'):
					screenshot.captureWebpage();
					break;
				case HotKey.getCharCode('screen'):
					screenshot.captureScreen();
					break;
			}
		}
	},

	/**
	 * Receive messages from content_script, and then decide what to do next
	 */
	addMessageListener : function() {
		chrome.extension.onMessage.addListener(function(request, sender, response) {
			var obj = request;
			var hotKeyEnabled = HotKey.isEnabled();
			switch (obj.msg) {
				case 'capture_hot_key':
					screenshot.handleHotKey(obj.keyCode);
					break;
				case 'capture_selected':
					screenshot.captureSelected();
					break;
				case 'capture_window':
					if (hotKeyEnabled) {
						screenshot.captureWindow();
					}
					break;
				case 'capture_area':
					if (hotKeyEnabled) {
						screenshot.showSelectionArea();
					}
					break;
				case 'capture_webpage':
					if (hotKeyEnabled) {
						screenshot.captureWebpage();
					}
					break;
				case 'svg_captured':
					screenshot.updateShowImagePage_SVG(obj);
					break;
				case 'HTMLTable_captured':
					screenshot.updateShowImagePage_HTMLTable(obj);
					//console.log("HTMLTable captured");	
					//alert("HTMLTable_captured");				
					break;
			}
		});
	},

	/**
	 * Send the Message to content-script
	 */
	sendMessage : function(message, callback) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(tab.id, message, callback);
		});
	}, 

	showSelectionArea : function() {
		screenshot.sendMessage({
			msg : 'show_selection_area'
		}, null);
	},

	showSVGArea : function() {
		//console.log("show_SVG_area");
		screenshot.sendMessage({
			msg : 'show_SVG_area'
		}, null);
	},
	showHTMLTableArea : function() {
		//console.log("show_SVG_area");
		screenshot.sendMessage({
			msg : 'show_HTMLTable_area'
		}, null);
	},

	captureWindow : function() {
		screenshot.sendMessage({
			msg : 'capture_window'
		}, screenshot.onResponseVisibleSize);
	},

	captureSelected : function() {
		screenshot.sendMessage({
			msg : 'capture_selected'
		}, screenshot.onResponseVisibleSize);
	},

	captureWebpage : function() {
		screenshot.sendMessage({
			msg : 'scroll_init'
		}, screenshot.onResponseVisibleSize);
	},

	captureSVG : function(response) {

		screenshot.sendMessage({
			msg : 'capture_SVG'
		}, screenshot.onResponseVisibleSize);
	},
	captureHTMLTable : function(response) {

		screenshot.sendMessage({
			msg : 'capture_HTMLTable'
		}, screenshot.onResponseVisibleSize);
	},

	onResponseVisibleSize : function(response) {
		switch (response.msg) {
			case 'capture_window':
				screenshot.captureVisible(response.docWidth, response.docHeight);
				break;
			case 'scroll_init_done':
				screenshot.startX = response.startX, screenshot.startY = response.startY, screenshot.scrollX = response.scrollX, screenshot.scrollY = response.scrollY, screenshot.canvas.width = response.canvasWidth;
				screenshot.canvas.height = response.canvasHeight;
				screenshot.visibleHeight = response.visibleHeight, screenshot.visibleWidth = response.visibleWidth, screenshot.scrollXCount = response.scrollXCount;
				screenshot.scrollYCount = response.scrollYCount;
				screenshot.docWidth = response.docWidth;
				screenshot.docHeight = response.docHeight;
				screenshot.zoom = response.zoom;
				setTimeout("screenshot.captureAndScroll()", 100);
				break;
			case 'scroll_next_done':
				screenshot.scrollXCount = response.scrollXCount;
				screenshot.scrollYCount = response.scrollYCount;
				setTimeout("screenshot.captureAndScroll()", 100);
				break;
			case 'scroll_finished':
				screenshot.captureAndScrollDone();
				break;
			/*
			 case 'SVG_captured':
			 screenshot.updateShowImagePage_SVG(response);
			 //screenshot.captureAndScrollDone();
			 break;*/

		}
	},


	updateShowImagePage_HTMLTable : function(response) {

		//************** check if the showimage page is open
		//alert("updateShowImagePage_HTMLTable"+response.svg);
		//alert("in updateShowImagePage_HTMLTable");
		//alert(jQuery);
		//var tableJson1 = jQuery(response.svg).tableToJSON();
		//window.alert(jQuery("#tblNyttUtstyr"));	
		//var tableJson1 = jQuery("#tblNyttUtstyr").helloWorld();			
		//var tableJson1 = jQuery("#tblNyttUtstyr").tableToJSON();	
		
		
   //	var tempthis = jQuery(response.svg);//jQuery("#tblNyttUtstyr");
   //	window.alert(tempthis);
    // Set options
	//var tempJSON_Table = tempthis.tableToJSON();  
	//var tempJSON_Table = tempthis.helloWorld();  

		
		
		
		//window.alert("**"+JSON.stringify(tempJSON_Table)+"***");			
		screenshot.svg = response.svg;
		//screenshot.svg = tempJSON_Table;
		var viewTabUrl = chrome.extension.getURL('showimage.html');
		var views = chrome.extension.getViews();

		var showimageOpen = false;
		var view;
		for (var i = 0; view = views[i]; i++) {
			if (view.location.href == viewTabUrl) {
				showimageOpen = true;

				break;
			}
		}
		//**************
		if (!showimageOpen) {
			chrome.tabs.create({
				'url' : 'showimage.html'
			});

			//setTimeout("view1.addSVG(response.svg)", 200);
			setTimeout(function() {
				var view1s = chrome.extension.getViews();
				var viewTabUrl = chrome.extension.getURL('showimage.html');
				var view1;
				for (var j = 0; view1 = view1s[j]; j++) {
					if (view1.location.href == viewTabUrl) {
						break;
					}
				}
				view1.addSVG(response.svg);
				//window.alert("addtable");
				view1.addTable(response.svg);
			}, 200);

			//view1.addSVG(response.svg);
		} else {
			//view.photoshop.
			//view.photoshop.initCanavs();
			//view.document.photoshop.addCanavs();
			//view.addSVG(response.svg);
			view.addTable(response.svg);

		}
		//alert(response.svg);

	},

	
	updateShowImagePage_SVG : function(response) {

		//************** check if the showimage page is open
		screenshot.svg = response.svg;
		var viewTabUrl = chrome.extension.getURL('showimage.html');
		var views = chrome.extension.getViews();

		var showimageOpen = false;
		var view;
		for (var i = 0; view = views[i]; i++) {
			if (view.location.href == viewTabUrl) {
				showimageOpen = true;

				break;
			}
		}
		//**************
		if (!showimageOpen) {
			chrome.tabs.create({
				'url' : 'showimage.html'
			});

			//setTimeout("view1.addSVG(response.svg)", 200);
			setTimeout(function() {
				var view1s = chrome.extension.getViews();
				var viewTabUrl = chrome.extension.getURL('showimage.html');
				var view1;
				for (var j = 0; view1 = view1s[j]; j++) {
					if (view1.location.href == viewTabUrl) {
						break;
					}
				}
				view1.addSVG(response.svg);
			}, 200);

			//view1.addSVG(response.svg);
		} else {
			//view.photoshop.
			//view.photoshop.initCanavs();
			//view.document.photoshop.addCanavs();
			view.addSVG(response.svg);
		}
		//alert(response.svg);

	},

	callAddSVG : function(svg) {
		view1.addSVG(svg);
	},

	captureSpecialPage : function() {
		var formatParam = localStorage.screenshootQuality || 'png';
		chrome.tabs.captureVisibleTab(null, {
			format : formatParam,
			quality : 50
		}, function(data) {
			var image = new Image();
			image.onload = function() {
				screenshot.canvas.width = image.width;
				screenshot.canvas.height = image.height;
				var context = screenshot.canvas.getContext("2d");
				context.drawImage(image, 0, 0);
				screenshot.postImage();
			};
			image.src = data;
		});
	},

	captureScreenCallback : function(data) {
		var image = new Image();
		image.onload = function() {
			screenshot.canvas.width = image.width;
			screenshot.canvas.height = image.height;
			var context = screenshot.canvas.getContext("2d");
			context.drawImage(image, 0, 0);
			screenshot.postImage();
		};
		image.src = "data:image/bmp;base64," + data;
	},

	/**
	 * Use drawImage method to slice parts of a source image and draw them to
	 * the canvas
	 */
	capturePortion : function(x, y, width, height, visibleWidth, visibleHeight, docWidth, docHeight) {
				window.alert("in capture portion");

		var formatParam = localStorage.screenshootQuality || 'png';
		chrome.tabs.captureVisibleTab(null, {
			format : formatParam,
			quality : 50
		}, function(data) {
			var image = new Image();
			image.onload = function() {
				var curHeight = image.width < docWidth ? image.height - screenshot.scrollBarY : image.height;
				var curWidth = image.height < docHeight ? image.width - screenshot.scrollBarX : image.width;
				var zoomX = curWidth / visibleWidth;
				var zoomY = curHeight / visibleHeight;
				screenshot.canvas.width = width * zoomX;
				screenshot.canvas.height = height * zoomY;
				var context = screenshot.canvas.getContext("2d");
				context.drawImage(image, x * zoomX, y * zoomY, width * zoomX, height * zoomY, 0, 0, width * zoomX, height * zoomY);
				screenshot.postImage();
			};
			image.src = data;
		});
	},

	captureVisible : function(docWidth, docHeight) {
		window.alert("in capture Visible");
		var formatParam = localStorage.screenshootQuality || 'png';
		chrome.tabs.captureVisibleTab(null, {
			format : formatParam,
			quality : 50
		}, function(data) {
			var image = new Image();
			image.onload = function() {
				var width = image.height < docHeight ? image.width - 17 : image.width;
				var height = image.width < docWidth ? image.height - 17 : image.height;
				screenshot.canvas.width = width;
				screenshot.canvas.height = height;
				var context = screenshot.canvas.getContext("2d");
				context.drawImage(image, 0, 0, width, height, 0, 0, width, height);
				screenshot.postImage();
			};
			image.src = data;
		});
	},

	/**
	 * Use the drawImage method to stitching images, and render to canvas
	 */
	captureAndScroll : function() {

		//var formatParam = localStorage.screenshootQuality || 'png';
		var formatParam =  'jpeg';
		chrome.tabs.captureVisibleTab(null, {
			format : formatParam,
			quality : 10
		}, function(data) {
			//window.alert("data w h"+data.width+" "+data.height);
			var image = new Image();
			image.onload = function() {
				var context = screenshot.canvas.getContext('2d');
				var width = 0;
				var height = 0;

				// Get scroll bar's width.
				screenshot.scrollBarY = screenshot.visibleHeight < screenshot.docHeight ? 17 : 0;
				screenshot.scrollBarX = screenshot.visibleWidth < screenshot.docWidth ? 17 : 0;
				
				//window.alert("image w h scrollBar X Y"+image.width+" "+image.height
				//+" "+ screenshot.scrollBarX+" "+screenshot.scrollBarY);
				//image.width = image.width/2;
				//image.height = image.height/2;
				
				// Get visible width and height of capture result.
				var visibleWidth = (image.width - screenshot.scrollBarY < screenshot.canvas.width ? image.width - screenshot.scrollBarY : screenshot.canvas.width);
				var visibleHeight = (image.height - screenshot.scrollBarX < screenshot.canvas.height ? image.height - screenshot.scrollBarX : screenshot.canvas.height);

				// Get region capture start x coordinate.
				//window.alert(screenshot.startX+"  "+screenshot.startY);
				var zoom = screenshot.zoom;
				var x1 = screenshot.startX - Math.round(screenshot.scrollX * zoom);
				var x2 = 0;
				var y1 = screenshot.startY - Math.round(screenshot.scrollY * zoom);
				var y2 = 0;

				if ((screenshot.scrollYCount + 1) * visibleWidth > screenshot.canvas.width) {
					width = screenshot.canvas.width % visibleWidth;
					x1 = (screenshot.scrollYCount + 1) * visibleWidth - screenshot.canvas.width + screenshot.startX - screenshot.scrollX;
				} else {
					width = visibleWidth;
				}

				if ((screenshot.scrollXCount + 1) * visibleHeight > screenshot.canvas.height) {
					height = screenshot.canvas.height % visibleHeight;
					if ((screenshot.scrollXCount + 1) * visibleHeight + screenshot.scrollY < screenshot.docHeight) {
						y1 = 0;
					} else {
						y1 = (screenshot.scrollXCount + 1) * visibleHeight + screenshot.scrollY - screenshot.docHeight;
					}

				} else {
					height = visibleHeight;
				}
				x2 = screenshot.scrollYCount * visibleWidth;
				y2 = screenshot.scrollXCount * visibleHeight;
				window.alert(x1+" "+y1+" "+x2+" "+y2+" "+width+" "+height);
				context.drawImage(image, x1*2, y1*2, width*2, height*2, x2, y2, width, height);
				//context.drawImage(image, 0, 0);
				//context.drawImage(image, x1, y1, width, height, x2, y2, width, height);
				//context.drawImage(image, 0, 0, 300, 200, 0, 0, 300, 200);
				screenshot.sendMessage({
					msg : 'scroll_next',
					visibleWidth : visibleWidth,
					visibleHeight : visibleHeight
				}, screenshot.onResponseVisibleSize);
			};
			//window.alert(data);
			image.src = data;
			//image.src = "data:image/bmp;base64," + data;
			
			
			// chrome.tabs.create({
				// 'url' : 'background.html'
			// });
			// chrome.tabs.create({url: chrome.extension.getURL('background.html')});
			// setTimeout(function(){
				// var myCanvas = document.getElementById("myyyCanvas");
			// var ctx = myCanvas.getContext('2d');
			// var img1 = new Image();
			// img1.onload = function(){
			  // ctx.drawImage(img1,0,0); // Or at whatever offset you like
			  				// window.alert("hell o"+myCanvas.height);
			  // myCanvas.style.border = "1px solid #000000";
			  // var myP = document.getElementById("myP");
			  // myP.innerHTML="new";
			// };
			// img1.src = data;
				// },1000);
// 			
			
			
		});
	},

	captureAndScrollDone : function() {
		screenshot.postImage();
	},

	/**
	 * Post the image to 'showimage.html'
	 */
	postImage : function() {
		chrome.tabs.getSelected(null, function(tab) {
			screenshot.tab = tab;
		});

		//************** check if the showimage page is open

		var viewTabUrl = chrome.extension.getURL('showimage.html');
		var views = chrome.extension.getViews();

		var showimageOpen = false;
		var view;
		for (var i = 0; view = views[i]; i++) {
			if (view.location.href == viewTabUrl) {
				showimageOpen = true;

				break;
			}
		}
		//**************
		if (!showimageOpen) {
			chrome.tabs.create({
				'url' : 'showimage.html'
			});
			view.addCa();
		} else {
			//view.photoshop.
			//view.photoshop.initCanavs();
			//view.document.photoshop.addCanavs();
			view.addCa();
		}

		//chrome.tabs.create({'url': 'showimage.html'});
		var popup = chrome.extension.getViews({type: 'popup'})[0];
		if (popup)
			popup.close();
	},

	isThisPlatform : function(operationSystem) {
		return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
	},

	executeScriptsInExistingTabs : function() {
		chrome.windows.getAll(null, function(wins) {
			for (var j = 0; j < wins.length; ++j) {
				chrome.tabs.getAllInWindow(wins[j].id, function(tabs) {
					for (var i = 0; i < tabs.length; ++i) {
						if (tabs[i].url.indexOf("chrome://") != 0) {
							chrome.tabs.executeScript(tabs[i].id, {
								file : 'js/page.js'
							});
							chrome.tabs.executeScript(tabs[i].id, {
								file : 'js/shortcut.js'
							});
						}
					}
				});
			}
		});
	},

	init : function() {
		localStorage.screenshootQuality = localStorage.screenshootQuality || 'png';
		screenshot.executeScriptsInExistingTabs();
		screenshot.addMessageListener();
	}
};

screenshot.init();
