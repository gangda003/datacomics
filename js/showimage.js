// Copyright (c) 2009 The Chromium Authors. All rights reserved.  Use of this
// source code is governed by a BSD-style license that can be found in the
// LICENSE file.
/*$(function() {
 $( "#photo" ).resizable();
 });
 */

//var uid = "Zhenpeng Zhao";
var uid = "test1";
var imgs = new Array();
var layoutMatrix = new Array();
var repoSVGMatrix = new Array();
var comicSVGs = new Array();
var currentElements = new Array();
//var backgroundMatrix = new Array();
var backgroundMatrix = ["FF0000", "0000FF",
"FFFF00","FF0000", "0000FF","FFFF00"  ];
var currentNewBackgroundFill = "#f00";

var layoutSVGObjMatrix = new Array();
var rowHeightsArray = new Array();
var tempIndexArray = new Array();
var holderNames = new Array();
var breakArray = [false,false,false,false,
		false,false,false,false,false,false,
		false,false,false,false,false,false];
 
var firstLayoutBox;
var numberOfLayout = 3;
var largeLayoutRatio = 3;
var singFrame = false;
var currentSingleFrameIndex = 0;


var workingSvg ;

var initialLayoutBox_X = 100;
var initialLayoutBox_Y = 150;


var autoFit_location_x = 300;
var autoFit_location_y = 100;

//var serverAddress = "129.2.100.32";
var serverAddress = "localhost";
var port = "4010";


var projectName=false;
//var port = "4012";

var margin = 15;
var li_count = 0;
var selectedColumnArray = [];
var selectedColumnIndexArray = [];
var activitedTabID;
var datatables = [];

var zIndex_bacground = 4;
var zIndex_text = 60;

var pageWidth = 800;
var zIndex = 25;
var deleteMode = false;
var cropOn = false;
var currentFrameIndex = 0;

var currentCropOrigin_x = 0;
var currentCropOrigin_y = 0; 

    /*-------------------- EXPANDABLE PANELS ----------------------*/
    
var panelspeed = 500;
//panel animate speed in milliseconds
var totalpanels = 4;
//total number of collapsible panels
var defaultopenpanel = 0;
//leave 0 for no panel open
var accordian = false;
//set panels to behave like an accordian, with one panel only ever open at once

var panelheight = new Array();
var currentpanel = defaultopenpanel;
var iconheight = parseInt(jQuery('.icon-close-open').css('height'));
var highlightopen = true; 


function overlay_on() {
	//el = document.getElementById("overlay");
	//el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";

     jQuery("#upperBlock").addClass("overlay_visible");
	  jQuery("#leftBlock").addClass("overlay_visible");
	  jQuery("#rightBlock").addClass("overlay_visible");;
	  jQuery("#bottomBlock").addClass("overlay_visible");

	jQuery("#upperBlock").removeClass("overlay");
	  jQuery("#leftBlock").addClass("overlay");
	  jQuery("#rightBlock").addClass("overlay");;
	  jQuery("#bottomBlock").addClass("overlay");



}


function updateUID(){
	
	if(jQuery('input[name="project"]').val().length!=0)
	{
		uid = jQuery('input[name="project"]').val();
		//alert(jQuery('input[name="project"]').val());
		return true;
	}
	else{
		alert(jQuery('input[name="project"]').val());
		Window.alert("please input a project name");
		return false;
	}
}


function setInitial_croppingWindow(){
	
	//Set cropping window to initial size
		jQuery("#cropwindow").css("width","695px");
		jQuery("#cropwindow").css("height","315px");
		jQuery("#cropwindow").css("top","150px");
		jQuery("#cropwindow").css("left","300px");
		
}


function autofit_function(){
	
		var width = layoutMatrix[currentFrameIndex].width*largeLayoutRatio;
		var height = layoutMatrix[currentFrameIndex].height*largeLayoutRatio;
		
		var cropWindowWidth = parseInt(jQuery("#cropwindow").css("width"),10);
		var cropWindowHeight = parseInt(jQuery("#cropwindow").css("height"),10);

		
		if(width/height < cropWindowWidth/cropWindowHeight)
		{
			jQuery("#cropwindow").css("width",width+"px");
			var tempHeight = width/cropWindowWidth * cropWindowHeight;
			jQuery("#cropwindow").css("height",tempHeight+"px");	
		}else
		{
			jQuery("#cropwindow").css("height",height+"px");
			var tempWidth = height/cropWindowHeight * cropWindowWidth;
			jQuery("#cropwindow").css("width",tempWidth+"px");
		}
		
		
		
		jQuery("#cropwindow").css("left","300px");
		jQuery("#cropwindow").css("top","100px");
}

function saveCrop_function(){
	
		var tempNode = jQuery("<div></div>");
		tempNode.attr("id","SVG"+guid());
		tempNode.css("position", "absolute");
		tempNode.css("padding", "0.5em");
		tempNode.css("border-style", "dashed");
		tempNode.css("border-width", "1px");
		tempNode.css("z-index",10);
		
		var saveLeft = jQuery("#cropwindow").css("left");
		var saveTop = jQuery("#cropwindow").css("top");

		
		jQuery(tempNode).css("left",saveLeft);
		jQuery(tempNode).css("top",saveTop);
		
		var width = jQuery("#cropwindow").css("width");
		var height = jQuery("#cropwindow").css("height");
		
		widthInt = parseInt(width,10);
		heightInt = parseInt(height,10);
		
		jQuery(tempNode).css("width",width);
		jQuery(tempNode).css("height",height);

		var movingSVG = jQuery("#cropwindow").children()[0];
		jQuery(tempNode).append(movingSVG);
		tempNode.resizable({
    	  aspectRatio: widthInt / heightInt
   		 });
		tempNode.draggable();
		
		//jQuery("#canvasdock").append(tempNode);
		jQuery("#cropdock").append(tempNode);
		
		var size = currentElements.length;
		currentElements[size]=tempNode;

}

function doCrop_function(){
	
	
		//jQuery("#cropwindow").empty();
		var tempsvgnodeArray = jQuery(document.getElementById("canvasdock").firstChild).clone();
		tempsvgnode = tempsvgnodeArray[0];
		//var tempsvgnode = document.getElementById("canvasdock").firstChild;
  		var aspectRatioInfo = d3.select(tempsvgnode).attr("viewBox");
  		var strArray = aspectRatioInfo.split(" ");
  		//console.log("viewbox "+strArray[3]);
		/*
		 var original_width = tempsvgnode.getBBox().width ;
		 var original_height = tempsvgnode.getBBox().height;*/

		var original_width = parseInt(strArray[2]);
		var original_height = parseInt(strArray[3]);

		//var original_width = tempsvgnode.getBBox().width ;
		//var original_height = tempsvgnode.getBBox().height;

		console.log(original_width + " " + original_height);

		var tempCropwidth = parseInt(jQuery("#cropwindow").css("width"), 10);
		var tempCropheight = parseInt(jQuery("#cropwindow").css("height"), 10);

		var tempwidth = parseInt(jQuery("#canvasdock").css("width"), 10);
		var tempheight = parseInt(jQuery("#canvasdock").css("height"), 10);
		
		if(original_width/original_height > tempwidth/tempheight)
		{
			var tempheight = original_height/original_width*tempwidth;

		}else
		{
			var tempwidth = original_width/original_height*tempheight;

		}
		
		
		x_ratio = tempwidth / original_width;
		y_ratio = tempheight / original_height;

		var top = parseInt(jQuery("#cropwindow").css("top"), 10);
		var left = parseInt(jQuery("#cropwindow").css("left"), 10);

		left = left / x_ratio;
		top = top / y_ratio;
		var tempviewBoxAttr = left + " " + top + " " + tempCropwidth / x_ratio + " " + tempCropheight / y_ratio;

		tempsvgnode.setAttribute("viewBox", tempviewBoxAttr);

		jQuery(tempsvgnode).removeAttr("width");
		jQuery(tempsvgnode).removeAttr("height");

		jQuery(tempsvgnode).attr("width", "100%");
		jQuery(tempsvgnode).attr("height", "100%");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMidYMid meet");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMinYMin meet");
		d3.select(tempsvgnode).attr("preserveAspectRatio","none");
		///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
		
		

		jQuery("#cropwindow").prepend(tempsvgnode);

	
}


function printBreaks()
{
	var breakStr = "";
	for(var i = 0; i<breakArray.length; i++)
	{
		breakStr=breakStr+breakArray[i]+",";
	}
	var trueNumber = 0;
	for(var i = 0; i<breakArray.length; i++)
	{
		if(breakArray[i]===true)
		{
			trueNumber++;
		}
	}
	
	console.log("breakStr "+trueNumber+" <"+breakStr);
}


function TempIndex(top,left, x_index, y_index)
{
	this.top = top;
	this.left = left;
	this.x_index = x_index;
	this.y_index = y_index;
}


function getTempIndexArray()
{
	
	for(var i = 0; i<numberOfLayout; i++)
	{
		tempIndexArray[i]= new TempIndex(layoutMatrix[i].top,layoutMatrix[i].left, 
			layoutMatrix[i].x_index, layoutMatrix[i].y_index);
	}
}

function reRenderLayoutBox()
{
	
}


function resizeBox(i,rowIndex)
{
	
	
		
		//console.log("layoutMatrix Szie"+layoutMatrix.length+" i "+i+" rowIndex "+rowIndex);
		if (Math.abs(layoutMatrix[i].height - rowHeightsArray[rowIndex]) < 0.01) {
			return;
		} else {
			/*

			 if(layoutMatrix[i].y_index!=rowIndex)
			 return;*/
			var currentHeight = layoutMatrix[i].height;
			var currentWidth = layoutMatrix[i].width;

			var newHeight = rowHeightsArray[rowIndex];
			var newWidth = currentWidth * newHeight / currentHeight;

			layoutMatrix[i].width = newWidth;
			layoutMatrix[i].height = newHeight;

		
			/*
			jQuery("#" + i).css("height", newHeight + "px");
								jQuery("#" + i).css("width", newWidth + "px");*/
			
		
			
			//jQuery("#" + i).css("height", newHeight + "px!important");
			
			//jQuery("#" + i).css("width", newWidth + "px!important");
			//jQuery("#" + i).attr('style', 'width: '+ newWidth+'px ;');
			var id = layoutMatrix[i].id;
			jQuery("#" + id).attr('style', 'width: '+ newWidth+'px ;'+
			'height: '+ newHeight+'px; ');
			
			
			//console.log("resize No" + i + " title " + layoutMatrix[i].title + " " + newWidth + " " + newHeight);
		}

}



//******** check if <br /> exists before layoutbox i
function check_BR(i,rowIndex)
{
	//if()
	/*
	if(breakArray[rowIndex]===i)
		{
			return;
		}
		else
		{*/
	
	if(breakArray[i]===true)
	{
		//breakArray[rowIndex] = i;
		//breakArray.splice(i, 1);
		breakArray[rowIndex] = false;
		jQuery('#'+(i-1)).next('br').remove();
	}
	//}
}


function removeAllBR()
{
	jQuery('#wrapper br').remove();
	for(var i = 0; i<breakArray.length; i++)
	{
		breakArray[i] = false;
	}
}

//********** add <br /> before element  layoutbox i
function add_BR(i,rowIndex)
{
	if(breakArray[i]===true)
	{
		return;
	}
	//console.log("break added");
	breakArray[i] = true;
	id = layoutMatrix[i-1].id;
	jQuery('#'+id).after('<br>');
}

function reconstructBox(i)
{
	var tempDiv = jQuery("<div></div>");
		jQuery(tempDiv).attr("id",i);
		jQuery(tempDiv).addClass("resizeablebox");
		jQuery(tempDiv).resizable({
			handles : "e",
			start: function( event, ui ) {
				console.log("start");
				getTempIndexArray();
			},
			resize: function( event, ui ) {
				console.log(jQuery(ui.element).attr("id")+" "+ui.size.width+" "+ui.size.height);
				var index = parseInt(jQuery(ui.element).attr("id"));
				
				for(var i = 0; i<layoutMatrix.length;i++)
				{
					if(layoutMatrix[i].id===index)
					break;
				}
				
				layoutMatrix[i].width=ui.size.width;
				layoutMatrix[i].height = ui.size.height;
				/*
				updateLayoutBoxPositionIndex();
								printLayoutMatrix();
								
								updateLayoutBoxPositionIndex();
								checkRowChangeAndZoomLayoutBox();
								getTempIndexArray();*/
				update_LayoutBox_Index();
				
			}
		});
		jQuery(tempDiv).dblclick(function(event) {
			
			//alert(event.target.id);
			var idNumber = parseInt(event.target.id);
			
			for(var i = 0; i < layoutMatrix.length; i++)
			{
				if(layoutMatrix[i].id===(idNumber))
				{
					jQuery("#svgWindow").empty();
					var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
					generateCurrentLayoutSVGBox(i , currentSVGContainer);
					currentFrameIndex = i;
					
					
					//d3.select(workingSvg).append(jQuery("#cropwindow").children()[0]);
				//d3.select(workingSvg).append(jQuery("#cropwindow").children()[0]);
					//if(layoutMatrix[currentFrameIndex].svgObject)
					if(typeof layoutMatrix[currentFrameIndex].svgObject === 'undefined'){
						tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						var width = layoutMatrix[currentFrameIndex].width;
						var height = layoutMatrix[currentFrameIndex].height;
						//tempSVG.setAttribute('id', 'workingSvg');
						tempSVG.setAttribute('width', width+'');
						tempSVG.setAttribute('height', height+'');
						tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
						"xmlns:xlink", "http://www.w3.org/1999/xlink");
						workingSvg = jQuery(tempSVG);
						layoutMatrix[currentFrameIndex].svgObject = workingSvg;
						
					}
					else{
						workingSvg = jQuery(layoutMatrix[currentFrameIndex].svgObject);
					}
				

	
					break;
				}
			}
			//alert(event.target.id);
			
   		 });
		var id = layoutMatrix[i].id;
		jQuery(tempDiv).addClass("draggable");
		jQuery(tempDiv).attr('style', 'width: '+ layoutMatrix[i].width+'px ;'+
			'height: '+ layoutMatrix[i].height+'px; ');
		jQuery(tempDiv).addClass("ui-widget-content");
		/*
		var head = jQuery("<h3 href=\"#\" id=\"username" + (numberOfLayout-1) + "\" data-type=\"text\" data-placement=\"right\" data-title=\""+layoutMatrix[i].title+"\">" 
								//+ "New Title" + "</h3>");
								//+ (numberOfLayout-1) 
								+ "</h3>");*/
		
		
		var head = jQuery("<h3 href=\"#\" id=\"username" + i + "\" data-type=\"text\" data-placement=\"right\" data-title=\"Enter title\">" + layoutMatrix[i].title + "</h3>");

		jQuery(head).editable();
		console.log(layoutMatrix.length);
				jQuery(head).on('save', function(e, params) {
					// alert('Saved value: ' + params.newValue);
					// layoutMatrix[i].title = params.newValue;
		
					setTimeout(function() {
						for (var i = 0; i < numberOfLayout; i++) {
						//	layoutMatrix[i].title = jQuery("#username" + i).text();
							//console.log(jQuery("#username" + i).text());
							layoutMatrix[i].title = jQuery("#username" + layoutMatrix[i].id).text();

						}
					}, 500);
		
				});
		
		//head.editable();
		//jQuery(head).addClass("ui-widget-header");
		jQuery(head).addClass("boxHead");
		//jQuery(tempDiv).append(head);

		jQuery(tempDiv).append(layoutMatrix[i].svg);
		jQuery("#wrapper").append(tempDiv);
}


function reshapeCropModalWindow(){
	
	 
              var cropwindow_left_top_left = parseInt(jQuery("#cropwindow").css("left"),10);
              var cropwindow_left_top_top = parseInt(jQuery("#cropwindow").css("top"),10);
              var cropwindow_width = parseInt(jQuery("#cropwindow").css("width"),10);
              var cropwindow_height = parseInt(jQuery("#cropwindow").css("height"),10);
            
              var upperBlock_left = 0;//cropwindow_left_top_left;
              var upperBlock_top = 0;//cropwindow_left_top_top;
              var upperBlock_width = jQuery(window).width();
              var upperBlock_height = cropwindow_left_top_top;
              
              var leftBlock_left = 0;
              var leftBlock_top = cropwindow_left_top_top;
              var leftBlock_width = cropwindow_left_top_left;
              var leftBlock_height = cropwindow_height;
              
              var rightBlock_left = cropwindow_left_top_left+cropwindow_width;
              var rightBlock_top = cropwindow_left_top_top;
              var rightBlock_width = jQuery(window).width()-rightBlock_left;
              var rightBlock_height = cropwindow_height;
              
              
              var bottomBlock_left = 0;
              var bottomBlock_top = cropwindow_left_top_top+cropwindow_height;
              var bottomBlock_width = jQuery(window).width();
              var bottomBlock_height = 900-(cropwindow_height+cropwindow_left_top_top);
              
              jQuery("#upperBlock").css("left",upperBlock_left+"px");
              jQuery("#upperBlock").css("top",upperBlock_top+"px");
              jQuery("#upperBlock").css("width",upperBlock_width+"px");
              jQuery("#upperBlock").css("height",upperBlock_height+"px");
              
              jQuery("#leftBlock").css("left",leftBlock_left+"px");
              jQuery("#leftBlock").css("top",leftBlock_top+"px");
              jQuery("#leftBlock").css("width",leftBlock_width+"px");
              jQuery("#leftBlock").css("height",leftBlock_height+"px");
              
              jQuery("#rightBlock").css("left",rightBlock_left+"px");
              jQuery("#rightBlock").css("top",rightBlock_top+"px");
              jQuery("#rightBlock").css("width",rightBlock_width+"px");
              jQuery("#rightBlock").css("height",rightBlock_height+"px");
              
              jQuery("#bottomBlock").css("left",bottomBlock_left+"px");
              jQuery("#bottomBlock").css("top",bottomBlock_top+"px");
              jQuery("#bottomBlock").css("width",bottomBlock_width+"px");
              jQuery("#bottomBlock").css("height",bottomBlock_height+"px");
              
              
}


function reconstructionLayout(){
	
	jQuery("#wrapper").empty();
	var rowIndex = 0;
	var sumOfWidth = 0;
	var column_index = 0;
	
	removeAllBR();
	for(var i=0; i<numberOfLayout; i++)
	{
		//resizeBox(i,rowIndex);
		reconstructBox(i);
		//********** 2*margin+2*padding+2*borderi
		sumOfWidth = sumOfWidth + layoutMatrix[i].width+margin*2+2*5+2*1;
		if(sumOfWidth< pageWidth)
		{
			/*
			layoutMatrix[i].y_index = rowIndex;
						layoutMatrix[i].x_index = column_index;*/
			
			column_index++;
			
			//*** before i
			//check_BR(i,rowIndex);
			//printBreaks();
		}
		else
		{
			//***Before  i
			add_BR(i,rowIndex);
			rowIndex++;
			//layoutMatrix[i].y_index = rowIndex;
			column_index=0;
			//layoutMatrix[i].x_index = column_index;
		
			sumOfWidth = layoutMatrix[i].width+margin*2+2*5+2*1;
			//resizeBox(i,rowIndex);
			//reconstructBox(i);
			column_index++;
			
		}
	}
//	update_LayoutBox_Index()
	
}

function update_LayoutBox_Index()
{
	var rowIndex = 0;
	var sumOfWidth = 0;
	var column_index = 0;
	
	removeAllBR();
	for(var i=0; i<numberOfLayout; i++)
	{
		resizeBox(i,rowIndex);
		//********** 2*margin+2*padding+2*borderi
		sumOfWidth = sumOfWidth + layoutMatrix[i].width+margin*2+2*5+2*1;
		if(sumOfWidth< pageWidth)
		{
			layoutMatrix[i].y_index = rowIndex;
			layoutMatrix[i].x_index = column_index;
			column_index++;
			
			//*** before i
			//check_BR(i,rowIndex);
			//printBreaks();
		}
		else
		{
			//***Before  i
			add_BR(i,rowIndex);
			rowIndex++;
			layoutMatrix[i].y_index = rowIndex;
			column_index=0;
			layoutMatrix[i].x_index = column_index;
			sumOfWidth = layoutMatrix[i].width+margin*2+2*5+2*1;
			resizeBox(i,rowIndex);
			column_index++;
			
		}
	}
}

function checkRowChangeAndZoomLayoutBox()
{
	
	//***** remove all the holders
	/*
	var currentHolderArrayLength = holderNames.length;
		for(var k = 0; k<currentHolderArrayLength; k++)
		{
			jQuery("#"+holderNames[k]).remove();
		}*/
	
	//console.log(tempIndexArray.length);
	for(var i = 0; i<numberOfLayout; i++)
	{			//	console.log("i"+i);

		if(tempIndexArray[i].y_index!=layoutMatrix[i].y_index)
		{
			//****zoom this box with height of new Row with perserving the aspect ratio
			var newHeight = rowHeightsArray[layoutMatrix[i].y_index];
		/*
			var currentHeight = parseInt(jQuery("#"+i).css("height"),10);
					var curretnWidth = parseInt(jQuery("#"+i).css("width"),10);*/
		
			console.log("change");
			var currentHeight = layoutMatrix[i].height;
			var currentWidth = layoutMatrix[i].width;
			
			
			var newWidth = currentWidth	*newHeight/currentHeight;
			
			//************** zoom the inteior
			jQuery("#"+i).css("height",newHeight+"px");
			jQuery("#"+i).css("width",newWidth+"px");
			
			layoutMatrix[i].width = newWidth;
			layoutMatrix[i].height = newHeight;
			
			
			//************ add the place holder 
			var sumOfWidth = 0;
			for(var j = 0; j<numberOfLayout; j++)
			{
				if(layoutMatrix[j].y_index===tempIndexArray[i].y_index)
				{
					sumOfWidth = sumOfWidth+layoutMatrix[j].width;
				}
			}
			
			var holderWidth = pageWidth-sumOfWidth-25;
			
			var tempDiv = jQuery("<1><br /></1>");
			/*
			jQuery(tempDiv).attr("id",i+"_placeholder");
						jQuery(tempDiv).css("width",holderWidth+"px");
						jQuery(tempDiv).css("height",10+"px");
						jQuery(tempDiv).css("display","inline-block");*/
			
			jQuery(tempDiv).insertAfter("#"+(i-1));
			
			/*
			
						var currentHolderArrayLength = holderNames.length;
						holderNames[currentHolderArrayLength]=i+"_placeholder";*/
			
			
			

		//	jQuery(tempDiv).
			

		}
	}
}


function zoomLayoutBox(i)
{
	for(var j = 0; j<numberOfLayout; j++)
	{
		if(layoutMatrix[j].y_index===i)
		{
			//var currentHeight = parseInt(jQuery("#"+j).css("height"),10);
			//var currentWidth = parseInt(jQuery("#"+j).css("width"),10);
			
			var currentHeight = layoutMatrix[j].height;//parseInt(jQuery("#"+j).css("height"),10);
			var currentWidth = layoutMatrix[j].width;//parseInt(jQuery("#"+j).css("width"),10);
			
			var newHeight = rowHeightsArray[i];
			var newWidth = currentWidth*newHeight/currentHeight;
			
			//********** zoom inteior
			
			//***************
			/*
			
						if(j===1)
						{
							console.log("--No1 "+newHeight+" "+newWidth);
						}*/
			
			
			jQuery("#"+j).css("height",newHeight+"px");
			jQuery("#"+j).css("width",newWidth+"px");
			
			layoutMatrix[j].width = newWidth;
			layoutMatrix[j].height = newHeight;



		}
	}
}




function updateLayoutBoxPositionIndex()
{
	
	//**************deside rows
	var column = 0;
	var row = 0;
	for(var i = 0; i<numberOfLayout; i++)
	{
		var _offset = jQuery("#"+i).offset();
		var x = _offset.left;
		var y = _offset.top;
		
		//console.log(_offset.left+" "+_offset.top);
		
		
		//************* setup column
		
		
		
		/*
		if((y-firstLayoutBox.top)===0)
				{
					layoutMatrix[i].y_index = 0;
				}
				else 
				{*/
		
			var height = 0;
			var temprows = new Array();
			for(var j = 0; j<rowHeightsArray.length; j++)
			{
				height = height + rowHeightsArray[j]-10;
				temprows[j] = height;
				console.log("height"+height);
			}
			
			for(var j = 0; j<rowHeightsArray.length; j++)
			{
				if((y-firstLayoutBox.top)<temprows[j])
				{
					layoutMatrix[i].y_index = j;
					if(j>row)
					{
						column = 0;
					}
					row = j;
					break;
				}
				
			}
			layoutMatrix[i].x_index = column;
			column++;
		//}
		
		
		
	}
	
	
}

function printLayoutMatrix()
{
	var logStr = "";
	console.log("layoutMatrix length "+layoutMatrix.length);
	for(var i = 0; i < layoutMatrix.length; i++)
	//for(var i = 0; i < 4; i++)
	{
		if(typeof layoutMatrix[i] === 'undefined')
		{
			console.log("undefined");
			continue;
		}
		
		//console.log(i+" i");
		logStr = logStr+">>>  <<<"+layoutMatrix[i].id+" "+layoutMatrix[i].title+"_"+
		layoutMatrix[i].width+" "+layoutMatrix[i].height+" "+layoutMatrix[i].x_index
		+" "+layoutMatrix[i].y_index;
	}
	console.log(logStr);
	
}
function resample_hermite(canvas, W, H, W2, H2) {
	var time1 = Date.now();
	var img = canvas.getContext("2d").getImageData(0, 0, W, H);
	var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
	var data = img.data;
	var data2 = img2.data;
	var ratio_w = W / W2;
	var ratio_h = H / H2;
	var ratio_w_half = Math.ceil(ratio_w / 2);
	var ratio_h_half = Math.ceil(ratio_h / 2);
	for (var j = 0; j < H2; j++) {
		for (var i = 0; i < W2; i++) {
			var x2 = (i + j * W2) * 4;
			var weight = 0;
			var weights = 0;
			var gx_r = gx_g = gx_b = gx_a = 0;
			var center_y = (j + 0.5) * ratio_h;
			for (var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
				var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
				var center_x = (i + 0.5) * ratio_w;
				var w0 = dy * dy//pre-calc part of w
				for (var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
					var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
					var w = Math.sqrt(w0 + dx * dx);
					if (w >= -1 && w <= 1) {
						//hermite filter
						weight = 2 * w * w * w - 3 * w * w + 1;
						if (weight > 0) {
							dx = 4 * (xx + yy * W);
							gx_r += weight * data[dx];
							gx_g += weight * data[dx + 1];
							gx_b += weight * data[dx + 2];
							gx_a += weight * data[dx + 3];
							weights += weight;
						}
					}
				}
			}
			data2[x2] = gx_r / weights;
			data2[x2 + 1] = gx_g / weights;
			data2[x2 + 2] = gx_b / weights;
			data2[x2 + 3] = gx_a / weights;
		}
	}
	console.log("hermite = " + (Math.round(Date.now() - time1) / 1000) + " s");
	canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
	canvas.getContext("2d").putImageData(img2, 0, 0);
};

function isHighVersion() {
	var version = navigator.userAgent.match(/Chrome\/(\d+)/)[1];
	return version > 9;
}

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function $(id) {
	return document.getElementById(id);
}

function i18nReplace(id, messageKey) {
	return $(id).innerHTML = chrome.i18n.getMessage(messageKey);
}

function addImageHandler(imageID, counter) {
	//i = counter;
	var div = document.createElement('div');
	div.className = "ui-widget-content";
	div.style.padding = "0.5em";
	//var img = document.createElement('img');
	//img.id = ""+i;
	//img.src = "images/"+i+".png";
	//img.alt = "comic element";
	//img.width = "150";
	//var tempImg = document.getElementById(imageID);
	//div.appendChild(tempImg);
	div.appendChild(imgs[counter - 1]);
	jQuery(".floatveryright").append(div);

	//imgs[i-1] = img;

	jQuery(div).click(function() {

		var node1 = jQuery("<div></div>");
		//jQuery(photoDiv).clone();
		//node1.style.position = "absolute";
		node1.css("position", "absolute");
		node1.css("left", "300px");
		node1.css("top", "100px");
		node1.css("z-index", 15);

		//	node1.empty();
		//node1.addClass("ui-widget-content");
		node1.css("padding", "0.5em");

		//node.prepend(jQuery(".dock"));
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');
			if (!deleteMode) {
				jQuery(this).css("z-index", zIndex++);
			} else {
				jQuery(this).remove();
			}

		});
		jQuery(".dock").prepend(node1);
		//var tempImg = document.getElementById("img"+i + "");
		var tempImg = document.getElementById(imageID);
		//alert(i + "");

		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		newCanvas.width = tempImg.width;
		newCanvas.height = tempImg.height;
		context.drawImage(tempImg, 0, 0);
		node1.append(newCanvas);

		/*
		var tempCanvas = document.createElement('canvas');
		var context = tempCanvas.getContext('2d');
		tempCanvas.width = $(id1).width;
		tempCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);*/

		//jQuery('#photo').resizable({
		node1.resizable({
			stop : function(event, ui) {

				var canvas = newCanvas;
				context = canvas.getContext('2d');
				canvas.width = ui.size.width;
				canvas.height = ui.size.height;

				/*
				 context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
				 Math.max(photoshop.canvas.height, ui.size.height));
				 context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);*/

				context.clearRect(0, 0, Math.max(tempImg.width, ui.size.width), Math.max(tempImg.height, ui.size.height));
				context.drawImage(tempImg, 0, 0, ui.size.width, ui.size.height);

			}
		});

		//jQuery('#photo').draggable({ grid: [ 20, 20 ] });
		node1.draggable({
			grid : [20, 20]
		});

	});

}


function initComicSVG(){
	var comicNumber = 24;
	/*for(var i = 0; i<=comicNumber; i++)
	{
		
		comicSVGs[i] = new Image();
		comicSVGs[i].src = "images/svg/drawing" + i + ".svg";
		comicSVGs[i].id = "img" + i;
		comicSVGs[i].alt = "comic element";
		comicSVGs[i].width = "150";
	}
	*/

	
	for (var i = 0; i <= comicNumber; i++) {
		d3.xml("images/newsvg/drawing"+i+".svg", function(xml) {
			//document.body.appendChild(xml.documentElement);
			addComicHanldler(xml);
		});
	}

	
}


function addCirHandler()
{
	
	
		var node1 = jQuery("<div></div>");
		node1.css("position", "absolute");
		node1.css("padding", "0.5em");
		node1.css("left","300px");
		node1.css("top","100px");
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');
			if (!deleteMode) {
				//jQuery(this).css("z-index", zIndex_bacground++);
			} else {
				jQuery(this).remove();
			}

		});

		var tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		
		tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		"xmlns:xlink", "http://www.w3.org/1999/xlink");
		
		// var textLength = jQuery('input[name="speech"]').val().length;
		// d3.select(tempSVG).append("text").
		// text(jQuery('input[name="speech"]').val())
		// .attr("font-size", textSize+"px")
		// .attr("fill", "#000000")
		// .attr("stroke","none")
		// .attr("x","0px")
		// .attr("y",textSize+"px");
		var radius = 50;
		var strokeWidth = 7;
		var width = radius*2+strokeWidth*2;
		var height = radius*2+strokeWidth*2;
		
		d3.select(tempSVG).append("circle")
                          .attr("cx", (radius*2+2*strokeWidth)/2)
                         .attr("cy",  (radius*2+2*strokeWidth)/2)
                        .attr("r", radius)
//        .style("fill", "#FF0000")
        .style("fill", currentNewBackgroundFill+"")
        .style("stroke", "black")
        .style("stroke-width", strokeWidth);

		
		//tempSVG.setAttribute('id', 'workingSvg');
		tempSVG.setAttribute('width', width+'px');
		tempSVG.setAttribute('height', height+'px');
		
		var viewBoxAttr = "0 0 " + width + " " + height;

		jQuery(tempSVG).attr("class","mysvgrec");
		jQuery(tempSVG).attr("width", "100%");
		jQuery(tempSVG).attr("height", "100%");
		jQuery(tempSVG).attr("preserveAspectRatio","xMinYMin meet");
		//jQuery(svgnode).attr("viewBox", "0 0 900 800");
		tempSVG.setAttribute("viewBox", viewBoxAttr);
		
		node1.css("width",width+"px");
		node1.css("height",height+"px");


		jQuery("#cropdock").append(node1);
		//node1.append(text);
		node1.append(tempSVG);



		node1.resizable(
			  {aspectRatio:true,
			  	resize: function( event, ui ) {
			  	//nodeClass = jQuery(ui.element).attr("class");
			  	for(var i = 0; i< jQuery(ui.element).children().length;i++)
			  	{
			  		if(jQuery(ui.element).children()[i] instanceof SVGElement)
			  		jQuery(ui.element).children()[i].remove();
			  	}
			  	
			  	var nodeWidth = ui.size.width;
			  	var nodeHeight = ui.size.height;
			  	//node1.empty();
			  	var tempSVG_in = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				tempSVG_in.setAttributeNS("http://www.w3.org/2000/xmlns/", 
				"xmlns:xlink", "http://www.w3.org/1999/xlink");
				
				//var strokeWidth = 5;
				var width = nodeWidth;
				var height = nodeHeight;
				
				// d3.select(tempSVG_in).append("rect")
		        // .attr("x", 0)
		         // .attr("y", 0)
		        // .attr("width", width)
		        // .attr("height", height)
		        // .style("fill", "yellow")
		        // .style("stroke", "black")
		        // .style("stroke-width", strokeWidth);
		        
		        d3.select(tempSVG_in).append("circle")
                          .attr("cx", width/2)
                         .attr("cy", width/2)
                        .attr("r", (width-2*strokeWidth)/2)
				        //.style("fill", "yellow")
				        .style("fill", currentNewBackgroundFill+"")
				        .style("stroke", "black")
				        .style("stroke-width", strokeWidth);
		
				
				//tempSVG.setAttribute('id', 'workingSvg');
				tempSVG_in.setAttribute('width', width+'px');
				tempSVG_in.setAttribute('height', height+'px');
				
				var viewBoxAttr = "0 0 " + width + " " + height;
		
				jQuery(tempSVG_in).attr("width", "100%");
				jQuery(tempSVG_in).attr("height", "100%");
				jQuery(tempSVG_in).attr("preserveAspectRatio","xMinYMin meet");
				//jQuery(svgnode).attr("viewBox", "0 0 900 800");
				tempSVG_in.setAttribute("viewBox", viewBoxAttr);
				node1.prepend(tempSVG_in);

					  }
			 }

		);
		node1.draggable();


		var size = currentElements.length;
		currentElements[size] = node1;



}

function addRecHandler()
{
	
	
		var node1 = jQuery("<div></div>");
		node1.css("position", "absolute");
		node1.css("padding", "0.5em");
		node1.css("left","300px");
		node1.css("top","100px");
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');
			if (!deleteMode) {
				//jQuery(this).css("z-index", zIndex_bacground++);
			} else {
				jQuery(this).remove();
			}

		});

		var tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		
		tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		"xmlns:xlink", "http://www.w3.org/1999/xlink");
		
		// var textLength = jQuery('input[name="speech"]').val().length;
		// d3.select(tempSVG).append("text").
		// text(jQuery('input[name="speech"]').val())
		// .attr("font-size", textSize+"px")
		// .attr("fill", "#000000")
		// .attr("stroke","none")
		// .attr("x","0px")
		// .attr("y",textSize+"px");
		var strokeWidth = 10;
		var width = 50+strokeWidth*2;
		var height = 100+strokeWidth*2;
		
		d3.select(tempSVG).append("rect")
        .attr("x", 0)
         .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", currentNewBackgroundFill+"")
       // .style("fill", "yellow")
        .style("stroke", "black")
        .style("stroke-width", strokeWidth);

		
		//tempSVG.setAttribute('id', 'workingSvg');
		tempSVG.setAttribute('width', width+'px');
		tempSVG.setAttribute('height', height+'px');
		
		var viewBoxAttr = "0 0 " + width + " " + height;

		jQuery(tempSVG).attr("class","mysvgrec");
		jQuery(tempSVG).attr("width", "100%");
		jQuery(tempSVG).attr("height", "100%");
		jQuery(tempSVG).attr("preserveAspectRatio","xMinYMin meet");
		//jQuery(svgnode).attr("viewBox", "0 0 900 800");
		tempSVG.setAttribute("viewBox", viewBoxAttr);
		
		node1.css("width",width+"px");
		node1.css("height",height+"px");


		jQuery("#cropdock").append(node1);
		//node1.append(text);
		node1.append(tempSVG);



		node1.resizable(
			  {
			   resize: function( event, ui ) {
			  	//nodeClass = jQuery(ui.element).attr("class");
			  	for(var i = 0; i< jQuery(ui.element).children().length;i++)
			  	{
			  		if(jQuery(ui.element).children()[i] instanceof SVGElement)
			  		jQuery(ui.element).children()[i].remove();
			  	}
			  	
			  	var nodeWidth = ui.size.width;
			  	var nodeHeight = ui.size.height;
			  	//node1.empty();
			  	var tempSVG_in = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				tempSVG_in.setAttributeNS("http://www.w3.org/2000/xmlns/", 
				"xmlns:xlink", "http://www.w3.org/1999/xlink");
				
				//var strokeWidth = 5;
				var width = nodeWidth;
				var height = nodeHeight;
				
				d3.select(tempSVG_in).append("rect")
		        .attr("x", 0)
		         .attr("y", 0)
		        .attr("width", width)
		        .attr("height", height)
		        .style("fill", currentNewBackgroundFill+"")
		  //      .style("fill", "yellow")
		        .style("stroke", "black")
		        .style("stroke-width", strokeWidth);
		
				
				//tempSVG.setAttribute('id', 'workingSvg');
				tempSVG_in.setAttribute('width', width+'px');
				tempSVG_in.setAttribute('height', height+'px');
				
				var viewBoxAttr = "0 0 " + width + " " + height;
		
				jQuery(tempSVG_in).attr("width", "100%");
				jQuery(tempSVG_in).attr("height", "100%");
				jQuery(tempSVG_in).attr("preserveAspectRatio","xMinYMin meet");
				//jQuery(svgnode).attr("viewBox", "0 0 900 800");
				tempSVG_in.setAttribute("viewBox", viewBoxAttr);
				node1.prepend(tempSVG_in);

					  }
			 }

		);
		node1.draggable();


		var size = currentElements.length;
		currentElements[size] = node1;



}

function addComicHanldler(xml)
{
	svg = xml.documentElement;
	var photoDiv = document.createElement("div");
	var photoid = "photo" + guid();
	jQuery(photoDiv).css("width", "250px");
	jQuery(photoDiv).css("height", "150px");

	//alert(svg+"lal");

	photoDiv.id = photoid;
	photoDiv.className = "ui-widget-content";

	var s = '<li>text</li>';

	var div = document.createElement('div');
	//div.innerHTML = svg;
	jQuery(div).append(svg);

	//var elements = div.firstChild;
	var svgnode = jQuery(div).children()[0];

	var width = jQuery(svgnode).attr("width");
	var height = jQuery(svgnode).attr("height");

	var viewBoxAttr = "0 0 " + width + " " + height;

	jQuery(svgnode).removeAttr("width");
	jQuery(svgnode).removeAttr("height");

	jQuery(svgnode).attr("width", "100%");
	jQuery(svgnode).attr("height", "100%");
	//jQuery(svgnode).attr("preserveAspectRatio","xMidYMid meet");
	//jQuery(svgnode).attr("viewBox", "0 0 900 800");
	div.firstChild.setAttribute("viewBox", viewBoxAttr);
	
	//********   align to the left top corner
		var aspectRationAttr = "xMidYMid meet";
	//div.firstChild.setAttribute("preserveAspectRatio", aspectRationAttr);
	div.firstChild.setAttribute("preserveAspectRatio", "none");


	
	//jQuery(photoDiv).html(svg);
	jQuery(photoDiv).append(svgnode);
	photoDiv.style.padding = "0.5em";
	jQuery('.floatveryright').append(photoDiv);

	jQuery(photoDiv).click(function(event) {

		var node1 = jQuery("<div></div>");
		//jQuery(photoDiv).clone();
		//node1.style.position = "absolute";
		node1.css("position", "absolute");
		node1.css("left", "300px");
		node1.css("top", "100px");
		node1.css("z-index", 15);
		node1.css("height","100px");
		node1.css("width","100px");

		//	node1.empty();
		//node1.addClass("ui-widget-content");
		node1.css("padding", "0.5em");

		//node.prepend(jQuery(".dock"));
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');
			if (!deleteMode) {
				jQuery(this).css("z-index", zIndex++);
			} else {
				jQuery(this).remove();
			}

		});
		//jQuery(".dock").append(node1);
		jQuery("#cropdock").append(node1);
		//var tempImg = document.getElementById("img"+i + "");
		//var tempImg = document.getElementById(imageID);
		//alert(i + "");

		/*
		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		newCanvas.width = tempImg.width;
		newCanvas.height = tempImg.height;
		context.drawImage(tempImg, 0, 0);
		*/
		
		//var newSVG = xml.cloneNode(true);
		var currentPhotoDivID = jQuery(this).attr('id');
		//var currentPhotoDiv = jQuery("#"+event.target.id);
		var currentPhotoDiv = jQuery("#"+currentPhotoDivID);
		//var tempSVG = currentPhotoDiv.parents()[0].childNodes[0];
		//var tempSVG = currentPhotoDiv.childNodes[0];
		var tempSVG = currentPhotoDiv.children()[0];
		var newSVG = jQuery(tempSVG).clone();
		node1.append(newSVG);

		/*
		var tempCanvas = document.createElement('canvas');
		var context = tempCanvas.getContext('2d');
		tempCanvas.width = $(id1).width;
		tempCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);*/

		//jQuery('#photo').resizable({
		node1.resizable();
		 /*node1.resizable({
			stop : function(event, ui) {

				var canvas = newCanvas;
				context = canvas.getContext('2d');
				canvas.width = ui.size.width;
				canvas.height = ui.size.height;
				context.clearRect(0, 0, Math.max(tempImg.width, ui.size.width), Math.max(tempImg.height, ui.size.height));
				context.drawImage(tempImg, 0, 0, ui.size.width, ui.size.height);

			}
		});
		*/

		//jQuery('#photo').draggable({ grid: [ 20, 20 ] });
		node1.draggable(
			//{grid : [20, 20]}
			);
		var size = currentElements.length;
		currentElements[size] = node1;
		
		

	});

}

function initComic() {

	var imageNumber = 13;
	for (var i = 1; i <= imageNumber; i++) {
		imgs[i - 1] = new Image();
		imgs[i - 1].src = "images/img" + i + ".png";
		imgs[i - 1].id = "img" + i;
		imgs[i - 1].alt = "comic element";
		imgs[i - 1].width = "150";
	}

	for (var i = 1; i <= imageNumber; i++) {
		var imageID = "img" + i;
		addImageHandler(imageID, i);
	}
	/*
	 for (var i = 1; i <= 5; i++) {
	 var div = document.createElement('div');
	 div.className = "ui-widget-content";
	 div.style.padding = "0.5em";
	 //var img = document.createElement('img');
	 //img.id = ""+i;
	 //img.src = "images/"+i+".png";
	 //img.alt = "comic element";
	 //img.width = "150";
	 div.appendChild(imgs[i - 1]);
	 jQuery(".floatveryright").append(div);

	 //imgs[i-1] = img;

	 jQuery(div).click(function() {

	 var node1 = jQuery("<div></div>");
	 //jQuery(photoDiv).clone();
	 //node1.style.position = "absolute";
	 node1.css("position", "absolute");
	 //	node1.empty();
	 //node1.addClass("ui-widget-content");
	 node1.css("padding", "0.5em");

	 //node.prepend(jQuery(".dock"));
	 jQuery(".floatright").prepend(node1);
	 var tempImg = document.getElementById(i + "");
	 alert(i + "");

	 var newCanvas = document.createElement('canvas');
	 var context = newCanvas.getContext('2d');
	 newCanvas.width = tempImg.width;
	 newCanvas.height = tempImg.height;
	 context.drawImage(tempImg, 0, 0);
	 node1.append(newCanvas);

	 //jQuery('#photo').resizable({
	 node1.resizable({
	 stop : function(event, ui) {

	 var canvas = newCanvas;
	 context = canvas.getContext('2d');
	 canvas.width = ui.size.width;
	 canvas.height = ui.size.height;

	 context.clearRect(0, 0, Math.max(tempImg.width, ui.size.width), Math.max(tempImg.height, ui.size.height));
	 context.drawImage(tempImg, 0, 0, ui.size.width, ui.size.height);

	 }
	 });

	 //jQuery('#photo').draggable({ grid: [ 20, 20 ] });
	 node1.draggable({
	 grid : [20, 20]
	 });

	 });

	 }*/

}


function load_addSVG(svg) {
	var photoDiv = document.createElement("div");
	var photoid = "photo" + guid();
	jQuery(photoDiv).css("width", "250px");
	jQuery(photoDiv).css("height", "150px");

	//alert(svg+"lal");

	photoDiv.id = photoid;
	photoDiv.className = "ui-widget-content";

	var s = '<li>text</li>';

	var div = document.createElement('div');
	div.innerHTML = svg;
	

	//var elements = div.firstChild;
	var svgnode = jQuery(div).children()[0];

	var width = jQuery(svgnode).attr("width");
	var height = jQuery(svgnode).attr("height");

	var viewBoxAttr = "0 0 " + width + " " + height;

	jQuery(svgnode).removeAttr("width");
	jQuery(svgnode).removeAttr("height");

	jQuery(svgnode).attr("width", "100%");
	jQuery(svgnode).attr("height", "100%");
	//jQuery(svgnode).attr("preserveAspectRatio","xMidYMid meet");
	///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
	div.firstChild.setAttribute("viewBox", viewBoxAttr);
	
	//********   align to the left top corner
		var aspectRationAttr = "xMinYMin meet";
	div.firstChild.setAttribute("preserveAspectRatio", aspectRationAttr);


	
	//jQuery(photoDiv).html(svg);
	jQuery(photoDiv).append(svgnode);
	photoDiv.style.padding = "0.5em";
	jQuery('#showBox').append(photoDiv);

	jQuery(photoDiv).click(function() {

		jQuery(".dock").empty();

		var tempdiv = document.createElement('div');
		tempdiv.innerHTML = svg;
		//tempdiv.id = "SVG"+guid();
		//var elements = div.firstChild;
		var tempsvgnode = jQuery(tempdiv).children()[0];

		var tempwidth = jQuery(tempsvgnode).attr("width");
		var tempheight = jQuery(tempsvgnode).attr("height");

		var tempviewBoxAttr = "0 0 " + tempwidth + " " + tempheight;

		jQuery(tempsvgnode).removeAttr("width");
		jQuery(tempsvgnode).removeAttr("height");

		jQuery(tempsvgnode).attr("width", "100%");
		jQuery(tempsvgnode).attr("height", "100%");
		//jQuery(svgnode).attr("preserveAspectRatio","xMidYMid meet");
		///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
		tempdiv.firstChild.setAttribute("viewBox", tempviewBoxAttr);
		
		//********   align to the left top corner
		var aspectRationAttr = "xMinYMin meet";
		tempdiv.firstChild.setAttribute("preserveAspectRatio", aspectRationAttr);


		//jQuery(photoDiv).html(svg);
		//jQuery(photoDiv).append(tempsvgnode);

		//var node1 = jQuery("<div></div>");
		//jQuery(node1).append(tempsvgnode);
	//	jQuery(".dock").prepend(tempdiv);
		jQuery(".dock").prepend(tempsvgnode);
			//*******visdock code
		//VisDock.init(".dock", 1500, 1100); 
		//var viewport = VisDock.getViewport(); 
		//jQuery("#VisDockViewPort").prepend(tempsvgnode);
		
			//*******visdock code
		//VisDock.init(".dock", 1500, 1100); 
		//var viewport = VisDock.getViewport(); 

	});

}

function addTable(table)
{
	//****** add new tabs 1. add new <li>,   
	//******  2. add new <div> with href linked to the <li>
	//window.alert("add table");
	//console.log("add table");
	
	li_count = li_count + 1;
	var hrefName = "tab" + li_count;
	var templi = jQuery("<li><a href=\"#" + hrefName + "\">" + hrefName + "</a></li>");
	jQuery("#tabs").append(templi);

	var tempTabDiv = jQuery("<div id=\"" + hrefName + "\"></div>");
	tempTabDiv.attr("id", hrefName);
	var selectedTab;
	var tempTable = jQuery(table);
	tempTable.attr("id", "table-" + hrefName);
	var tempDataTable = tempTable.DataTable({
		"bSort" : false,
		"bFilter" : false
	});
	datatables[li_count]=tempDataTable;
	tempTable.children('tbody').on('click', 'tr', function() {
		jQuery(this).toggleClass('selected');
	});
	//tempTable.children('tfoot').remove();

	//******* add the table
	tempTabDiv.append(tempTable);
	jQuery("#tableTabs").append(tempTabDiv);

	jQuery("#tableTabs").tabs("destroy");
	jQuery("#tableTabs").tabs({
		activate : function(event, ui) {
			var active = jQuery('#tableTabs').tabs('option', 'active');
			selectedTabStr = jQuery("#tableTabs ul>li a").eq(active).attr("href");
			activitedTabID = selectedTabStr.substring(1,selectedTabStr.length);
			var selectedTable = jQuery("#table-"+activitedTabID);
		jQuery( '#select_column' ).empty();
	
		//******* add tables headers into select_column
		//******* everytime the tab is activated. 
		var headArray = [];
		//var number = tempTable.
		var number = selectedTable.
		children("thead").children("tr").children("th").length;
		for(var i = 0; i< number; i++)
		{
			var str1 = jQuery(selectedTable.
			children("thead").children("tr").
			children("th")[i]).html();
			headArray.push(str1);
		}
		var optionsAsString = "";
		for(var i = 0; i < headArray.length; i++) {
		    optionsAsString += "<option value='" + headArray[i] + "'>" + headArray[i] + "</option>";
		}
		jQuery( '#select_column' ).append( optionsAsString );
		}
	}); 

	
	
	//******* setup the table as datatable.js 
}

function addSVG(svg) {
	var photoDiv = document.createElement("div");
	var photoid = "photo" + guid();
	jQuery(photoDiv).css("width", "250px");
	jQuery(photoDiv).css("height", "150px");

	//alert(svg+"lal");

	photoDiv.id = photoid;
	photoDiv.className = "ui-widget-content";

	var s = '<li>text</li>';

	var div = document.createElement('div');
	div.innerHTML = svg;
	
	//******* add svg to repo array
	//var repoSize = repoSVGMatrix.length;
	//repoSVGMatrix[repoSize] = svg;

	//var elements = div.firstChild;
	var svgnode = jQuery(div).children()[0];

	var width = jQuery(svgnode).attr("width");
	var height = jQuery(svgnode).attr("height");
	
	
	if(width=="100%")
	{
		width = 700;
		//height = parseInt(jQuery(div).css("width"),10);
		height = 700;
	}
	
	
	jQuery(svgnode).attr("width",width);
	jQuery(svgnode).attr("height", height);



	//******* add svg to repo array
	var repoSize = repoSVGMatrix.length;
	repoSVGMatrix[repoSize] = svgnode.outerHTML;
	


	var viewBoxAttr = "0 0 " + width + " " + height;

	jQuery(svgnode).removeAttr("width");
	jQuery(svgnode).removeAttr("height");

	jQuery(svgnode).attr("width", "100%");
	jQuery(svgnode).attr("height", "100%");
	//jQuery(svgnode).attr("preserveAspectRatio","xMidYMid meet");
	///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
	div.firstChild.setAttribute("viewBox", viewBoxAttr);
	
	//********   align to the left top corner
		var aspectRationAttr = "xMinYMin meet";
	div.firstChild.setAttribute("preserveAspectRatio", aspectRationAttr);


	//jQuery(photoDiv).html(svg);
	jQuery(photoDiv).append(svgnode);
	photoDiv.style.padding = "0.5em";
	jQuery('#showBox').append(photoDiv);

	jQuery(photoDiv).click(function() {

		jQuery(".dock").empty();

		var tempdiv = document.createElement('div');
		//tempdiv.innerHTML = svg;
		tempdiv.innerHTML = svg;
		//tempdiv.id= "SVG"+guid();
		//var elements = div.firstChild;
		var tempsvgnode = jQuery(tempdiv).children()[0];

		var tempwidth = jQuery(tempsvgnode).attr("width");
		var tempheight = jQuery(tempsvgnode).attr("height");
		
		if(tempwidth=="100%")
		{
		tempwidth = 700;
		//height = parseInt(jQuery(div).css("width"),10);
		tempheight = 700;
		}

		var tempviewBoxAttr = "0 0 " + tempwidth + " " + tempheight;

		jQuery(tempsvgnode).removeAttr("width");
		jQuery(tempsvgnode).removeAttr("height");

		jQuery(tempsvgnode).attr("width", "100%");
		jQuery(tempsvgnode).attr("height", "100%");
		//jQuery(svgnode).attr("preserveAspectRatio","xMidYMid meet");
		///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
		tempdiv.firstChild.setAttribute("viewBox", tempviewBoxAttr);
		
		//********   align to the left top corner
		var aspectRationAttr = "xMinYMin meet";
		tempdiv.firstChild.setAttribute("preserveAspectRatio", aspectRationAttr);


		//jQuery(photoDiv).html(svg);
		//jQuery(photoDiv).append(tempsvgnode);

		//var node1 = jQuery("<div></div>");
		//jQuery(node1).append(tempsvgnode);
		//jQuery(".dock").prepend(tempdiv);
		jQuery(".dock").prepend(tempsvgnode);
		
		
			//*******visdock code
		//VisDock.init(".dock", 1200, 900); 
		//VisDock.init(tempsvgnode, 1200, 900); 
		//var viewport = VisDock.getViewport(); 

	});

}

function addCa() {
	//alert("hello"+guid());
	var photoDiv = document.createElement("div");
	var photoid = "photo" + guid();

	photoDiv.id = photoid;
	photoDiv.className = "ui-widget-content";

	var canvas = document.createElement('canvas');
	var id1 = "canvas" + guid();
	canvas.id = id1;
	var canvas_mask = document.createElement('canvas');
	var id2 = "mask-canvas" + guid();
	canvas_mask.id = id2;
	photoDiv.appendChild(canvas);
	photoDiv.style.padding = "0.5em";
	//photoDiv.style.position = "absolute";
	//photoDiv.appendChild(canvas_mask);
	
	//******* add svg to repo array
	var canvasToSave = bg.screenshot.canvas;
	var repoSize = repoSVGMatrix.length;
	repoSVGMatrix[repoSize] = canvasToSave.toDataURL();
	

	//$('photoList').appendChild(photoDiv);
	//$('#showbBox').appendChild(photoDiv);
	jQuery('#showBox').append(photoDiv);

	$(id1).width
	// =        $(id2).width
	= $(photoid).style.width = photoshop.canvas.width = bg.screenshot.canvas.width;
	$(id1).height
	// =        $(id2).height
	= $(photoid).style.height = photoshop.canvas.height = bg.screenshot.canvas.height;
	var context = photoshop.canvas.getContext('2d');

	context.drawImage(bg.screenshot.canvas, 0, 0);
	context = $(id1).getContext('2d');
	//context.drawImage(photoshop.canvas, 0, 0);
	context.drawImage(bg.screenshot.canvas, 0, 0);
	$(id1).style.display = 'block';

	jQuery(photoDiv).click(function() {

		var node1 = //jQuery("<div></div>");
		jQuery(photoDiv).clone();
		//node1.style.position = "absolute";
		node1.css("position", "absolute");
		
		node1.css("left",autoFit_location_x);
		node1.css("top", autoFit_location_y);
		node1.empty();
		//node1.className = "ui-widget-content";
		//node1.style.padding = "0.5em";

		//node.prepend(jQuery(".dock"));
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');

			if (!deleteMode) {
				jQuery(this).css("z-index", zIndex++);
			} else {
				jQuery(this).remove();
			}
		});
		jQuery("#cropdock").prepend(node1);
		//jQuery(".dock").prepend(node1);

		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		newCanvas.width = $(id1).width;
		newCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);
		node1.append(newCanvas);

		var tempCanvas = document.createElement('canvas');
		var context = tempCanvas.getContext('2d');
		tempCanvas.width = $(id1).width;
		tempCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);

		//jQuery('#photo').resizable({
		node1.resizable({
			stop : function(event, ui) {

				var canvas = newCanvas;
				context = canvas.getContext('2d');
				canvas.width = ui.size.width;
				canvas.height = ui.size.height;

				/*
				 context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
				 Math.max(photoshop.canvas.height, ui.size.height));
				 context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);*/

				context.clearRect(0, 0, Math.max(tempCanvas.width, ui.size.width), Math.max(tempCanvas.height, ui.size.height));
				context.drawImage(tempCanvas, 0, 0, ui.size.width, ui.size.height);

			}
		});

		//jQuery('#photo').draggable({ grid: [ 20, 20 ] });
		// node1.draggable({
			// grid : [20, 20]
		// });
		node1.draggable();

	});

	/*
	//***************** resize canvas
	jQuery(photoDiv).resizable({
	stop: function( event, ui ) {
	console.log(ui.size);
	//console.log(bg.screenshot.canvas.width);
	//photoshop.canvas= ui.size.width;
	//resample_hermite(bg.screenshot.canvas,  250, 150, 320, 200 );
	//console.log(bg.screenshot.canvas.width);
	canvas.width = ui.size.width;
	canvas.height = ui.size.height;
	context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
	Math.max(photoshop.canvas.height, ui.size.height));
	context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);
	}
	});*/

	//jQuery(photoDiv).draggable({ grid: [ 20, 20 ] });

	//jQuery(photoDiv).clone().appendTo(jQuery(".floatright"));

	// context.drawImage(photoshop.canvas, 0, 0);
	// $(id1).style.display = 'block';

}




function loadAddCa(loadCanvasURL) {
	
	
	//******* create temp canvas
	var myCanvas = document.createElement('canvas');
	var ctx = myCanvas.getContext('2d');
	var img = new Image;
	img.onload = function(){
	  ctx.drawImage(img,0,0); // Or at whatever offset you like
	};
	img.src = loadCanvasURL;
	
	



	//alert("hello"+guid());
	var photoDiv = document.createElement("div");
	var photoid = "photo" + guid();

	photoDiv.id = photoid;
	photoDiv.className = "ui-widget-content";

	var canvas = document.createElement('canvas');
	var id1 = "canvas" + guid();
	canvas.id = id1;
	var canvas_mask = document.createElement('canvas');
	var id2 = "mask-canvas" + guid();
	canvas_mask.id = id2;
	photoDiv.appendChild(canvas);
	photoDiv.style.padding = "0.5em";
	//photoDiv.style.position = "absolute";
	//photoDiv.appendChild(canvas_mask);
	
	window.alert("width "+myCanvas.width+", height "+myCanvas.height+" img "
	+img.width+" "+img.height);
	

	//$('photoList').appendChild(photoDiv);
	//$('#showbBox').appendChild(photoDiv);
	jQuery('#showBox').append(photoDiv);

	$(id1).width
	// =        $(id2).width
	//= $(photoid).style.width = photoshop.canvas.width = bg.screenshot.canvas.width;
	//= $(photoid).style.width = photoshop.canvas.width = myCanvas.width;
	//$(id1).height
	//= $(photoid).style.width = myCanvas.width;
	= $(photoid).style.width = img.width;
	
	
	$(id1).height
	// =        $(id2).height
	//= $(photoid).style.height = photoshop.canvas.height = bg.screenshot.canvas.height;
	= $(photoid).style.height
	 //= photoshop.canvas.height 
	 //= myCanvas.height;
	 = img.height;
	 
	 
	var context = photoshop.canvas.getContext('2d');

	//context.drawImage(bg.screenshot.canvas, 0, 0);
	//context.drawImage(myCanvas, 0, 0);
	context = $(id1).getContext('2d');
	//context.drawImage(photoshop.canvas, 0, 0);
	context.drawImage(img, 0, 0);
	$(id1).style.display = 'block';

	jQuery(photoDiv).click(function() {

		var node1 = //jQuery("<div></div>");
		jQuery(photoDiv).clone();
		//node1.style.position = "absolute";
		node1.css("position", "absolute");
		
		node1.css("left",autoFit_location_x);
		node1.css("top", autoFit_location_y);
		node1.empty();
		//node1.className = "ui-widget-content";
		//node1.style.padding = "0.5em";

		//node.prepend(jQuery(".dock"));
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');

			if (!deleteMode) {
				jQuery(this).css("z-index", zIndex++);
			} else {
				jQuery(this).remove();
			}
		});
		jQuery("#cropdock").prepend(node1);
		//jQuery(".dock").prepend(node1);

		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		newCanvas.width = $(id1).width;
		newCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);
		node1.append(newCanvas);

		var tempCanvas = document.createElement('canvas');
		var context = tempCanvas.getContext('2d');
		tempCanvas.width = $(id1).width;
		tempCanvas.height = $(id1).height;
		context.drawImage($(id1), 0, 0);

		//jQuery('#photo').resizable({
		node1.resizable({
			stop : function(event, ui) {

				var canvas = newCanvas;
				context = canvas.getContext('2d');
				canvas.width = ui.size.width;
				canvas.height = ui.size.height;

				/*
				 context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
				 Math.max(photoshop.canvas.height, ui.size.height));
				 context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);*/

				context.clearRect(0, 0, Math.max(tempCanvas.width, ui.size.width), Math.max(tempCanvas.height, ui.size.height));
				context.drawImage(tempCanvas, 0, 0, ui.size.width, ui.size.height);

			}
		});

		//jQuery('#photo').draggable({ grid: [ 20, 20 ] });
		// node1.draggable({
			// grid : [20, 20]
		// });
		node1.draggable();

	});

	/*
	//***************** resize canvas
	jQuery(photoDiv).resizable({
	stop: function( event, ui ) {
	console.log(ui.size);
	//console.log(bg.screenshot.canvas.width);
	//photoshop.canvas= ui.size.width;
	//resample_hermite(bg.screenshot.canvas,  250, 150, 320, 200 );
	//console.log(bg.screenshot.canvas.width);
	canvas.width = ui.size.width;
	canvas.height = ui.size.height;
	context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
	Math.max(photoshop.canvas.height, ui.size.height));
	context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);
	}
	});*/

	//jQuery(photoDiv).draggable({ grid: [ 20, 20 ] });

	//jQuery(photoDiv).clone().appendTo(jQuery(".floatright"));

	// context.drawImage(photoshop.canvas, 0, 0);
	// $(id1).style.display = 'block';

}


var bg = chrome.extension.getBackgroundPage();
//var canvas = new Canvas();
var photoshop = {
	canvas : document.createElement("canvas"),
	tabTitle : '',
	startX : 0,
	startY : 0,
	endX : 0,
	endY : 0,
	dragFlag : false,
	flag : 'rectangle',
	layerId : 'layer0',
	canvasId : '',
	color : '#ff0000',
	highlightColor : '',
	lastValidAction : 0,
	markedArea : [],
	isDraw : true,
	offsetX : 0,
	offsetY : 36,
	nowHeight : 0,
	nowWidth : 0,
	highlightType : 'border',
	highlightMode : 'rectangle',
	text : '',

	i18nReplace : i18nReplace,

	initPage : function() {
		//*************init, this part of code are suppposed to refractor to be the new init finction for the whole page
		//jQuery('#cropwindow').draggable();
		var reposition = '';
		jQuery('#cropwindow').resizable({
    	 handles: 'n,s,w,e,sw,ne, se, sw, nw',
    	 resize: function(event, ui){
    	   reposition = ui.position;
    	   reshapeCropModalWindow();
    	 }
    });

		//************* document ready function
		jQuery("#left-trigger").click(function() {
			jQuery("#left-panel-content").animate({
				width : "toggle"
			}, 500, function() {
				//if (jQuery("#left-trigger").html() == "Open") {
			if (jQuery("#left-trigger").attr("src") == "images/rightarrow.svg") {		
					//jQuery("#left-trigger").html("Close");
					panelinit();
					jQuery("#left-trigger").attr("src","images/leftarrow.svg");					
				} else {
					//jQuery("#left-trigger").html("Open");
					jQuery("#left-trigger").attr("src","images/rightarrow.svg");
				}
			});
		});

		// jQuery("#right-trigger").click(function() {
			// jQuery("#right-panel-content").animate({
				// width : "toggle"
			// }, 500, function() {
				// //if (jQuery("#right-trigger").html() == "Open") {
				// if (jQuery("#right-trigger").attr("src") == "images/leftarrow.svg") {
					// //jQuery("#right-trigger").html("Close");
					// jQuery("#right-trigger").attr("src","images/rightarrow.svg");
				// } else {
					// //jQuery("#right-trigger").html("Open");
					// jQuery("right-trigger").attr("src","images/leftarrow.svg");
				// }
			// });
		// });
		
		jQuery("#top-trigger").click(function() {
			jQuery("#top-panel-content").animate({
				height : "toggle"
			}, 500, function() {
				//if (jQuery("#top-trigger").html() == "Open") {
				if (jQuery("#top-trigger").attr("src") == "images/downarrow.svg") {	
				
					//update the svg viewer
									//var SVGDiv = document.createElement("div");
					jQuery("#topPlaceHolder").empty();
					//var svgContainer = d3.select("#topPlaceHolder").append("svg");
					//svgContainer.attr("class","topPlaceHolderSVG");
					
					
					tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
					"xmlns:xlink", "http://www.w3.org/1999/xlink");
					//svgContainer = jQuery(tempSVG);
					jQuery("#topPlaceHolder").append(tempSVG);
					jQuery(tempSVG).attr("class","topPlaceHolderSVG");

					//for (var i = 0; i <= 2; i++) {
					for (var i = 0; i < layoutMatrix.length; i++) {
						generateLayoutSVGBox(i, tempSVG);
					}
				
					//d3.select("#svgWindow").empty();
					jQuery("#svgWindow").empty();
					var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
					generateCurrentLayoutSVGBox(currentFrameIndex, currentSVGContainer);
	
					
									
					jQuery("#top-trigger").attr("src","images/uparrow.svg");
					//jQuery("#top-trigger").html("Close");
				} else {
					jQuery("#top-trigger").attr("src","images/downarrow.svg");
					//jQuery("#top-trigger").html("Open");
					
				}
			});
		});
		
		jQuery("#down-trigger").click(function() {
			jQuery("#down-panel-content").animate({
				height : "toggle"
			}, 500, function() {
			//	if (jQuery("#down-trigger").html() == "Open") {
				if (jQuery("#down-trigger").attr("src") == "images/downarrow.svg") {	
					jQuery("#cropwindow").css("z-index","0");
					//jQuery("#down-trigger").html("Close");
					jQuery("#down-trigger").attr("src","images/uparrow.svg");

				} else {
					jQuery("#down-trigger").attr("src","images/downarrow.svg");
					//jQuery("#down-trigger").html("Open");
					jQuery("#cropwindow").css("z-index","10");
				}
			});
		});
		
		//jQuery("#downPlaceHolder").append("<img src=\"images/img12.png\">");

	},

	initCanvas : function() {

		if (bg.screenshot.canvas == null)

			$('canvas').width =
			// $('mask-canvas').width =
			$('photo').style.width = photoshop.canvas.width = bg.screenshot.canvas.width;
		$('canvas').height =
		// $('mask-canvas').height =
		$('photo').style.height = photoshop.canvas.height = bg.screenshot.canvas.height;
		var context = photoshop.canvas.getContext('2d');
		context.drawImage(bg.screenshot.canvas, 0, 0);

		context = $('canvas').getContext('2d');
		context.drawImage(photoshop.canvas, 0, 0);
		$('canvas').style.display = 'block';
		//$('photo').style.position = "absolute";

		jQuery('#photo').click(function() {

			var node = //jQuery("<div></div>");
			jQuery('#photo').clone();
			//node.id = "photo1";
			//node.style.position = "absolute";
			node.css("position", "absolute");

			node.empty();

			//node.prepend(jQuery(".dock"));
			node.click(function() {
				// $(this).addClass('top').removeClass('bottom');
				//$(this).siblings().removeClass('top').addClass('bottom');
				if (!deleteMode) {
					jQuery(this).css("z-index", zIndex++);
				} else {
					jQuery(this).remove();
				}

			});
			jQuery(".dock").prepend(node);

			var newCanvas = document.createElement('canvas');
			var context = newCanvas.getContext('2d');
			newCanvas.width = $('canvas').width;
			newCanvas.height = $('canvas').height;
			context.drawImage($('canvas'), 0, 0);
			node.append(newCanvas);

			var tempCanvas = document.createElement('canvas');
			var context = tempCanvas.getContext('2d');
			tempCanvas.width = $('canvas').width;
			tempCanvas.height = $('canvas').height;
			context.drawImage($('canvas'), 0, 0);

			//jQuery('#photo').resizable({
			node.resizable({
				stop : function(event, ui) {

					var canvas = newCanvas;
					context = canvas.getContext('2d');
					canvas.width = ui.size.width;
					canvas.height = ui.size.height;
					/*
					 context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width),
					 Math.max(photoshop.canvas.height, ui.size.height));
					 context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);*/

					context.clearRect(0, 0, Math.max(tempCanvas.width, ui.size.width), Math.max(tempCanvas.height, ui.size.height));
					context.drawImage(tempCanvas, 0, 0, ui.size.width, ui.size.height);
				}
			});

			//jQuery('#photo').draggable({ grid: [ 20, 20 ] });
			node.draggable({
				grid : [20, 20]
			});

		});

		//  $('photo').resizable();
	},

	s4 : function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	},

	guid : function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},

	addCanvas : function() {

		alert("addcanvas");
		//************** add canvas dom
		/*
		var photoDiv = document.createElement('div');
		var photoid = "photo"+guid();
		photoDiv.id = photoid;
		var canvas = document.createElement('canvas');
		var id1 = "canvas"+guid();
		cavnas.id = id1;
		var canvas_mask = document.createElement('canvas');
		var id2 = "mask-canvas"+guid();
		canvas_mask.id = id2;
		photoDiv.appendChild(canvas);
		photoDiv.appendChild(canvas_mask);
		document.getElementById('photoList').appendChild(photoDiv);*/

		//************** update added canvas
		/*
		 $(id1).width = $(id2).width = $(photoid).style.width =
		 photoshop.canvas.width = bg.screenshot.canvas.width;
		 $(id1).height = $(id2).height = $(photoid).style.height =
		 photoshop.canvas.height = bg.screenshot.canvas.height;
		 var context = photoshop.canvas.getContext('2d');
		 context.drawImage(bg.screenshot.canvas, 0, 0);
		 context = $(id1).getContext('2d');
		 context.drawImage(photoshop.canvas, 0, 0);
		 $(id1).style.display = 'block';*/

	},

	init : function() {
		// photoshop.initTools();
		photoshop.initPage();
		//	photoshop.initCanvas();
		photoshop.tabTitle = bg.screenshot.tab.title;
		var showBoxHeight = function() {
			$('showBox').style.height = window.innerHeight - photoshop.offsetY - 1;
		};
		setTimeout(showBoxHeight, 50);
	},

	addResize : function() {

		jQuery('#photo').resizable({
			stop : function(event, ui) {

				var canvas = $('canvas');
				context = canvas.getContext('2d');
				canvas.width = ui.size.width;
				canvas.height = ui.size.height;
				context.clearRect(0, 0, Math.max(photoshop.canvas.width, ui.size.width), Math.max(photoshop.canvas.height, ui.size.height));
				context.drawImage(photoshop.canvas, 0, 0, ui.size.width, ui.size.height);
			}
		});

		jQuery('#photo').draggable({
			grid : [20, 20]
		});
		jQuery('#photo').clone().appendTo(jQuery(".dock"));

		//jQuery('#resizable').resizable();
		//alert("hello");
	}
};

photoshop.init();
initComicSVG();
//initComic();

function returnObj(layoutMatrix, rowArray) {
	this.layoutMatrix = layoutMatrix;
	this.rowArray = rowArray;
}

function LayoutFrame(x_index, y_index, width, height,id) {

	// Add object properties like this
	this.id = id;
	this.title = "";
	this.left = 0;
	this.top = 0;
	this.x_index = x_index;
	this.y_index = y_index;
	this.width = width;
	this.height = height;
	this.svg = "";
	this.svgObject = undefined; 

}


function doCropFunction()
{
	//jQuery("#cropwindow").empty();
		var tempsvgnodeArray = jQuery(document.getElementById("canvasdock").firstChild).clone();
		tempsvgnode = tempsvgnodeArray[0];
		//var tempsvgnode = document.getElementById("canvasdock").firstChild;
  		var aspectRatioInfo = d3.select(tempsvgnode).attr("viewBox");
  		var strArray = aspectRatioInfo.split(" ");
  		//console.log("viewbox "+strArray[3]);
		/*
		 var original_width = tempsvgnode.getBBox().width ;
		 var original_height = tempsvgnode.getBBox().height;*/

		var original_width = parseInt(strArray[2]);
		var original_height = parseInt(strArray[3]);

		//var original_width = tempsvgnode.getBBox().width ;
		//var original_height = tempsvgnode.getBBox().height;

		console.log(original_width + " " + original_height);

		var tempCropwidth = parseInt(jQuery("#cropwindow").css("width"), 10);
		var tempCropheight = parseInt(jQuery("#cropwindow").css("height"), 10);

		var tempwidth = parseInt(jQuery("#canvasdock").css("width"), 10);
		var tempheight = parseInt(jQuery("#canvasdock").css("height"), 10);
		
		if(original_width/original_height > tempwidth/tempheight)
		{
			var tempheight = original_height/original_width*tempwidth;

		}else
		{
			var tempwidth = original_width/original_height*tempheight;

		}
		
		
		x_ratio = tempwidth / original_width;
		y_ratio = tempheight / original_height;

		var top = parseInt(jQuery("#cropwindow").css("top"), 10);
		var left = parseInt(jQuery("#cropwindow").css("left"), 10);

		left = left / x_ratio;
		top = top / y_ratio;
		var tempviewBoxAttr = left + " " + top + " " + tempCropwidth / x_ratio + " " + tempCropheight / y_ratio;

		tempsvgnode.setAttribute("viewBox", tempviewBoxAttr);

		jQuery(tempsvgnode).removeAttr("width");
		jQuery(tempsvgnode).removeAttr("height");

		jQuery(tempsvgnode).attr("width", "100%");
		jQuery(tempsvgnode).attr("height", "100%");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMidYMid meet");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMinYMin meet");
		d3.select(tempsvgnode).attr("preserveAspectRatio","none");
		///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
		
		

		jQuery("#cropwindow").prepend(tempsvgnode);
}


function renderSingleFrame(index)
{

  jQuery("#topPlaceHolder").empty();
  var  tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
	"xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgContainer = jQuery(tempSVG);
	
	jQuery("#topPlaceHolder").append(tempSVG);
	jQuery(tempSVG).attr("id","tempSVG");
	jQuery(tempSVG).attr("class","topPlaceHolderSVG");
	generateSingleFrame(index,tempSVG);
	//var tempRec = jQuery("<rect x=\"10\" y=\"10\" height=\"100\" width=\"100\" style=\"stroke:#009900; fill: #00cc00\"/>");
	//jQuery(tempSVG).prepend(tempRec);
	/*d3.select("#tempSVG").append("rect")
        .attr("x",25)
        .attr("y",25)
        .attr("width",100)
        .attr("height",75);
	*/
	
}


function generateSlideShowDiv()
{
	jQuery("#topPlaceHolder").empty();
	jQuery("#slideshowWindow").empty();
	var currentPosition = 0;
	var slideWidth = 500;
	var totalWidth = 0;
	var numberOfSlides = layoutMatrix.length;
	for (var i = 0; i < layoutMatrix.length; i++) {
		totalWidth = totalWidth + (layoutMatrix[i].width * 3);
	}

	var slideShowHolder = jQuery("<div id=\"slidesHolder\" style=\"width:" + totalWidth + "; margin-left: 0px;\"></div>");
	jQuery('#slideshow').prepend('<span class="nav" id="leftNav">Move Left</span>').append('<span class="nav" id="rightNav">Move Right</span>');

	jQuery("#slideshowWindow").append(slideShowHolder);
	
	
	for (var i = 0; i < layoutMatrix.length; i++) {
		var tempSVGDiv = jQuery("<div class=\"slide\" style=\"float:left;width:" + (layoutMatrix[i].width * 3+110) + ";\"></div>");
		//jQuery(tempSVGDiv).append
		//tempSVGDiv.css("float","left");
		var tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		//svgContainer = jQuery(tempSVG);
		jQuery(tempSVG).attr("class", "topPlaceHolderSVG");
		jQuery(tempSVG).attr("id", "tempSVG" + i);
		jQuery(tempSVGDiv).append(tempSVG);
		slideShowHolder.append(tempSVGDiv);

		//jQuery(tempSVGDiv).append(tempSVG);
		jQuery(tempSVGDiv).attr("width", (layoutMatrix[i].width * 3)+100);
		generateSingleFrame(i, tempSVG);
		
	}

	jQuery('.nav').bind('click', function() {

		//determine new position
		currentPosition = (jQuery(this).attr('id') == 'rightNav') ? currentPosition + 1 : currentPosition - 1;

		//hide/show controls
		manageNav(currentPosition);
		//clearInterval(slideShowInterval);
		//slideShowInterval = setInterval(changePosition, speed);
		moveSlide();
	});

	function manageNav(position) {
		//hide left arrow if position is first slide
		if (position == 0) {
			jQuery('#leftNav').hide();
		} else {
			jQuery('#leftNav').show();
		}
		console.log(position);
		//hide right arrow is slide position is last slide
		if (position == numberOfSlides - 1) {
			jQuery('#rightNav').hide();
		} else {
			jQuery('#rightNav').show();
		}
	}

	/*changePosition: this is called when the slide is moved by the
	 timer and NOT when the next or previous buttons are clicked*/
	function changePosition() {
		if (currentPosition == numberOfSlides - 1) {
			currentPosition = 0;
			manageNav(currentPosition);
		} else {
			currentPosition++;
			manageNav(currentPosition);
		}
		moveSlide();
	}

	//moveSlide: this function moves the slide
	function moveSlide() {
		var currentLeftMargin = 0;
		for(i=0; i< currentPosition;i++)
		{
			currentLeftMargin = currentLeftMargin+ layoutMatrix[i].width*3+100;
		}
		jQuery('#slidesHolder').animate({
			//'marginLeft' : slideWidth * (-currentPosition) + 100
			'marginLeft' : -currentLeftMargin
		});
	}

}

function generateCurrentLayoutSVGBox(layoutIndex, svgContainer) {
	var x_start_coord = 300;
	var y_start_coord = 100;
	var width = layoutMatrix[layoutIndex].width * largeLayoutRatio;
	var height = layoutMatrix[layoutIndex].height * largeLayoutRatio;

	//Draw the Rectangle
	var rectangle = svgContainer.append("rect").attr("x", x_start_coord).attr("y", y_start_coord).attr("width", width).attr("height", height).style("fill", "none").style("stroke", "black").style("stroke-width", 5);

}


function generateSingleFrame(layoutIndex, svgContainer){
	
	var x_index = layoutMatrix[layoutIndex].x_index;
	var y_index = layoutMatrix[layoutIndex].y_index;
	var width = layoutMatrix[layoutIndex].width;
	var height = layoutMatrix[layoutIndex].height;
	var interval_x_boxes = 40;
	var start_x_coord = 150;
	console.log(x_index + " " + y_index + " " + layoutIndex);
	for (var i = 0; i < layoutMatrix.length; i++) {
		//console.log(i);
		var temp_x_index = layoutMatrix[i].x_index;
		var temp_y_index = layoutMatrix[i].y_index;
		if (temp_x_index < x_index && temp_y_index === y_index) {
			start_x_coord = start_x_coord + layoutMatrix[i].width + interval_x_boxes;
		}
	}

	var start_y_coord = 50;
	var interval_y_boxes = 40;
	for ( i = 0; i < y_index; i++) {
		//start_y_coord = start_y_coord + interval_y_boxes + 100;
		start_y_coord = start_y_coord + interval_y_boxes + rowHeightsArray[i];
	}

	//var tempSVGDiv = document.createElement("div");
	//var svgContainer = d3.select(tempSVGDiv).append("svg");

	//Draw the Rectangle
	
	
	var insideBoxSVG = layoutMatrix[layoutIndex].svg;
	var tempSVGHolder = document.createElement('div');
	tempSVGHolder.innerHTML = insideBoxSVG;
	var insideBoxSVGElement = jQuery(tempSVGHolder).children()[0];
	
	
	//d3.select(svgContainer).
	
	
	
	d3.select(insideBoxSVGElement)
	.attr("x", ""+100/largeLayoutRatio)
	.attr("y", ""+50/largeLayoutRatio);
	
	//insideBoxSVGElement.currentScale = 3;
	
	var tempGroupName = "tempG"+layoutIndex;
	var tempGroup = d3.select(svgContainer).append("g");
	tempGroup.attr("id",tempGroupName);
	tempGroup.attr("transform","scale(3)");
	//jQuery(svgContainer).append(tempGroup);
//	var tempGroup = jQuery("<g transform=\"scale("+largeLayoutRatio+")\"></g>");
	//var tempGroup = jQuery("<g></g>");
	
	
	jQuery("#"+tempGroupName).
	//jQuery(svgContainer).
	append(insideBoxSVGElement);
	
	
	//var rectangle = d3.select(tempGroup)
	var rectangle = d3.select(svgContainer)
	//svgContainer
	.append("rect")
	.attr("x", "100")
	.attr("y", "50")
	.attr("width", width*largeLayoutRatio).
	attr("height", height*largeLayoutRatio).style("fill", "none").
	style("stroke", "black").style("stroke-width", 5).attr("z-index", 1000);
	
	//jQuery(svgContainer).append(tempGroup);

	
	//jQuery(svgContainer).attr("width",width*largeLayoutRatio);
	//jQuery(svgContainer).attr("height",height*largeLayoutRatio);

	//svgContainer.currentScale = 3;
	
	
}

function generateLayoutSVGBox(layoutIndex, svgContainer) {
	var x_index = layoutMatrix[layoutIndex].x_index;
	var y_index = layoutMatrix[layoutIndex].y_index;
	var width = layoutMatrix[layoutIndex].width;
	var height = layoutMatrix[layoutIndex].height;
	var interval_x_boxes = 40;
	var start_x_coord = 150;
	console.log(x_index + " " + y_index + " " + layoutIndex);
	for (var i = 0; i < layoutMatrix.length; i++) {
		//console.log(i);
		var temp_x_index = layoutMatrix[i].x_index;
		var temp_y_index = layoutMatrix[i].y_index;
		if (temp_x_index < x_index && temp_y_index === y_index) {
			start_x_coord = start_x_coord + layoutMatrix[i].width + interval_x_boxes;
		}
	}

	var start_y_coord = 50;
	var interval_y_boxes = 40;
	for ( i = 0; i < y_index; i++) {
		//start_y_coord = start_y_coord + interval_y_boxes + 100;
		start_y_coord = start_y_coord + interval_y_boxes + rowHeightsArray[i];
	}

	//var tempSVGDiv = document.createElement("div");
	//var svgContainer = d3.select(tempSVGDiv).append("svg");

	//Draw the Rectangle
	var rectangle = d3.select(svgContainer)
	//svgContainer
	.append("rect").attr("x", start_x_coord).attr("y", start_y_coord).attr("width", width).
	attr("height", height).style("fill", "none").
	style("stroke", "black").style("stroke-width", 5).attr("z-index", 1000);
	
	
	var insideBoxSVG = layoutMatrix[layoutIndex].svg;
	var tempSVGHolder = document.createElement('div');
	tempSVGHolder.innerHTML = insideBoxSVG;
	var insideBoxSVGElement = jQuery(tempSVGHolder).children()[0];
	
	
	//d3.select(svgContainer).
	
	
	
	d3.select(insideBoxSVGElement).attr("x", start_x_coord+"").attr("y", start_y_coord+"");
	jQuery(svgContainer).
	append(insideBoxSVGElement);
	
	//return svgContainer;
}


function renderiButton()
{
	   jQuery('#crop').iButton({
          change : function($input) {
              // update the text based on the status of the checkbox
              //$("#send-email").html($input.is(":checked") ? "Yes, send me more e-mail!" : "Ugh... no more e-mail already!");
              //jQuery("#cropwindow").css('display', $input.is(":checked") ? "inline" : "none");
                                    if ($input.is(':checked') == true) {
                  //alert("delete");
                  //deleteMode = true;
                  jQuery("#cropwindow").css('display', "inline");
                  jQuery("#cropwindow").draggable();
              } else {
                  //alert("not delete");
                  //deleteMode = false;
                  jQuery("#cropwindow").css('display', "none");
              }
          }
      });
      jQuery('#delete').iButton({
          change : function($input) {
              // update the text based on the status of the checkbox
              //$("#send-email").html($input.is(":checked") ? "Yes, send me more e-mail!" : "Ugh... no more e-mail already!");
              //jQuery("#cropwindow").css('display', $input.is(":checked") ? "inline" : "none");
              if ($input.is(':checked') == true) {
                  //alert("delete");
                  deleteMode = true;
                  jQuery(".ui-draggable").css('cursor', "url('images/icon_close.png')");
                    } else {
                  //alert("not delete");
                  deleteMode = false;
                  jQuery(".ui-draggable").css('cursor', "default");
                    }
          }
      });
      jQuery('#grid').iButton({
          change : function($input) {
              if ($input.is(':checked') == true) {
                  //alert("checked");
                  jQuery('.dock').css("background", "url('images/GySvQ.png')");
              } else {
                  jQuery('.dock').css("background", "none");
                  //alert("uncheck");
                    }
          }
      });
}


 function panelinit() {
                for (var i=1; i<=totalpanels; i++) {
                    panelheight[i] = parseInt(jQuery('#cp-'+i).find('.expandable-panel-content').css('height'));
                    jQuery('#cp-'+i).find('.expandable-panel-content').css('margin-top', -panelheight[i]);
                    if (defaultopenpanel == i) {
                        jQuery('#cp-'+i).find('.icon-close-open').css('background-position', '0px -'+iconheight+'px');
                        jQuery('#cp-'+i).find('.expandable-panel-content').css('margin-top', 0);
                    }
                }
               // alert("init");
        }

 
  function resetpanels() {
            for (var i=1; i<=totalpanels; i++) {
                if (currentpanel != i) {
                    jQuery('#cp-'+i).find('.icon-close-open').css('background-position', '0px 0px');
                    jQuery('#cp-'+i).find('.expandable-panel-content').animate({'margin-top':-panelheight[i]}, panelspeed);
                    if (highlightopen == true) {
                        jQuery('#cp-'+i + ' .expandable-panel-heading').removeClass('header-active');
                    }
                }
            }
        }
        
        
  function deselect(e) {
  jQuery('.pop').slideFadeToggle(function() {
    e.removeClass('selected');
  });    
}


jQuery(function() {
	
	
		jQuery('#tableEditorBtn').on('click', function() {
			jQuery("#tableEditor").css("display","block");
		});
		
		
		jQuery("#tableVis").dblclick(function() {
		  var svgTableVis = jQuery("#tableVis").children("svg");
		 // jQuery(this).attr("id","svg-table"+guid());
		  addSVG(svgTableVis.prop('outerHTML'));
		});
	
		jQuery('#barchart').on('click', function() {
			jQuery("#tableVis").empty();
			var currentDataTable = datatables[parseInt(activitedTabID.substring(3,activitedTabID.length))];
		  	//alert( currentDataTable.rows('.selected').data()[0][0]+' row(s) selected' );
			var numberOfRows = currentDataTable.rows('.selected').data().length;
			var selectedData = currentDataTable.rows('.selected').data();
			var jsonToVis = [];
			for(var i = 0; i< numberOfRows; i++)
			{
				//for(var j = 0; j< selectedColumnIndexArray.length; j++)
				var columnsNumber = currentDataTable.rows('.selected').data()[0].length;
				//for(var j = 0; j< columnsNumber; j++)
				//{
					//if(j===selectedColumnIndexArray[j])
					jsonToVis[i]={y:selectedData[i][selectedColumnIndexArray[0]],a:parseInt(selectedData[i][selectedColumnIndexArray[1]],10)};
				//}
			}
			
			Morris.Bar({
			  element: 'tableVis',
			 	  data: jsonToVis,
			  xkey: 'y',
			  ykeys: ['a'],
			  labels: ['Series A']
			});

		  });
		jQuery('#linechart').on('click', function() {
			jQuery("#tableVis").empty();
				var currentDataTable = datatables[parseInt(activitedTabID.substring(3,activitedTabID.length))];
		  	//alert( currentDataTable.rows('.selected').data()[0][0]+' row(s) selected' );
			var numberOfRows = currentDataTable.rows('.selected').data().length;
			var selectedData = currentDataTable.rows('.selected').data();
			var jsonToVis = [];
			for(var i = 0; i< numberOfRows; i++)
			{
				//for(var j = 0; j< selectedColumnIndexArray.length; j++)
				var columnsNumber = currentDataTable.rows('.selected').data()[0].length;
				//for(var j = 0; j< columnsNumber; j++)
				//{
					//if(j===selectedColumnIndexArray[j])
					jsonToVis[i]={y:selectedData[i][selectedColumnIndexArray[0]],
						a:parseInt(selectedData[i][selectedColumnIndexArray[1]],10)
					//	b:parseInt(selectedData[i][selectedColumnIndexArray[2]],10)					
						};
				//}
			}
			
			Morris.Line({
			  element: 'tableVis',
				 data: jsonToVis,
			  xkey: 'y',
			  ykeys: ['a'],
			  labels: ['Series A']
			});
			
		  });
		jQuery('#donutchart').on('click', function() {
				jQuery("#tableVis").empty();
				var currentDataTable = datatables[parseInt(activitedTabID.substring(3,activitedTabID.length))];
		  	//alert( currentDataTable.rows('.selected').data()[0][0]+' row(s) selected' );
			var numberOfRows = currentDataTable.rows('.selected').data().length;
			var selectedData = currentDataTable.rows('.selected').data();
			var jsonToVis = [];
			for(var i = 0; i< numberOfRows; i++)
			{
				//for(var j = 0; j< selectedColumnIndexArray.length; j++)
				var columnsNumber = currentDataTable.rows('.selected').data()[0].length;
				//for(var j = 0; j< columnsNumber; j++)
				//{
					//if(j===selectedColumnIndexArray[j])
					jsonToVis[i]={label:selectedData[i][selectedColumnIndexArray[0]],
						value:parseInt(selectedData[i][selectedColumnIndexArray[1]],10)
					//	b:parseInt(selectedData[i][selectedColumnIndexArray[2]],10)					
						};
				//}
			}
			
			Morris.Donut({
			  element: 'tableVis',
				 data: jsonToVis
			});
			
		  });
	
		jQuery("#tableTabs").tabs();
		jQuery('#addColumn').on('click', function() {
			jQuery("#column_added").append(
				jQuery("#select_column option:selected").html()+", ");
				var selectedStr = jQuery("#select_column option:selected").html();
				selectedColumnArray.push(selectedStr);
				
				var selectedIndex = jQuery("#select_column option:selected").index();
				selectedColumnIndexArray.push(selectedIndex);
		  });
		 jQuery('#resetColumn').on('click', function() {
			jQuery("#column_added").empty();
			selectedColumnArray = [];
			
			selectedColumnIndexArray = [];
		  });
		 
	
		
		function confirm_rproject_fn(){
		var url = "http://"+serverAddress+":"+port+"/";

		var request = {};
		request.jsonrpc = "2.0";
		request.params = {};
		request.method = 'checkProjectName';
		

		if(jQuery('input[name="project"]').val().length===0)
		{
			window.alert("Please input a project name");
			return;
		}
		
		request.params.uid = jQuery('input[name="project"]').val().trim();
		request.id = 0;
		
		function displaySearchResult(response) {
			//window.alert(response.result+" "+uid);
			if (response.result==="existing")
			{
					//window.alert("name already exists, please choose another name");

					jQuery( "#dialog-confirm" ).dialog({
				      resizable: false,
				      height:140,
				      modal: true,
				      buttons: {
				        "Keep using this ID": function() {
				        jQuery('input[name="project"]').attr('readonly', true);
						jQuery('input[name="project"]').addClass('input-disabled');
				        jQuery( this ).dialog( "close" );
				        },
				        "Input another ID": function() {
				          uid = jQuery('input[name="project"]').val().trim();
				          jQuery( this ).dialog( "close" );
				        }
				      }
				    });



					return;
			}
			else if(response.result===jQuery('input[name="project"]').val().trim())
			{
				uid = jQuery('input[name="project"]').val().trim();
				window.alert("id is not used in the system");
				//jQuery('input[name="project"]').prop('disabled', true);
				jQuery('input[name="project"]').attr('readonly', true);
				jQuery('input[name="project"]').addClass('input-disabled');
				
				
			}
			else if (response.error)
					alert("Search error: " + response.error.message);
		};

		jQuery.post(url, JSON.stringify(request), displaySearchResult, "json");
		
	}
	//);
	
	
	 	jQuery('#comfirm_project').on('click', function() {
	 		confirm_rproject_fn();
		  });
		  
		  
		  
		  
	
		 jQuery("#color1").spectrum({
		    color: "#f00",
		    change: function(color) {
		    	//alert(color.toHexString());
		        jQuery("#color1-log").text("Background Color: " + color.toHexString());
		        currentNewBackgroundFill=color.toHexString();
		    }
		});
		
		 jQuery('#layoutManager').on('click', function() {
		    if(jQuery(this).hasClass('selected')) {
		      deselect($(this));               
		    } else {
		     // jQuery(this).addClass('selected');
		      jQuery('#down-panel-content').slideFadeToggle();
		    }
		    return false;
		  });
		  
		   jQuery('#presenter').on('click', function() {
		    if(jQuery(this).hasClass('selected')) {
		      deselect(jQuery(this));               
		    } else {
		     // jQuery(this).addClass('selected');
		      jQuery('#top-panel-content').slideFadeToggle();
		    }
		    return false;
		  });
		
		  jQuery('#cancelLayout').on('click', function() {
		//    deselect(jQuery('#contdown-panel-contentact'));
		   jQuery('#down-panel-content').slideFadeToggle();   
		    return false;
		  });
		   jQuery('#cancelPresent').on('click', function() {
		   // deselect(jQuery('#contact'));
		   jQuery('#top-panel-content').slideFadeToggle();
		    return false;
		  });
			jQuery('#cancelTableEditor').on('click', function() {
		   // deselect(jQuery('#contact'));
		   jQuery('#tableEditor').css("display","none");
		    return false;
		  });		  
		  
		  
			jQuery.fn.slideFadeToggle = function(easing, callback) {
			  return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
			};
	
	  jQuery('.expandable-panel-heading').click(function() {           
            var obj = jQuery(this).next();
            var objid = parseInt(jQuery(this).parent().attr('ID').substr(3,2));  
           // alert(objid);
            currentpanel = objid;
            if (accordian == true) {
                resetpanels();
              //  alert("acordian");
            }
             
            if (parseInt(obj.css('margin-top')) <= (panelheight[objid]*-1)) {
                obj.clearQueue();
                obj.stop();
                obj.prev().find('.icon-close-open').css('background-position', '0px -'+iconheight+'px');
                obj.animate({'margin-top':0}, panelspeed);
                if (highlightopen == true) {
                    jQuery('#cp-'+currentpanel + ' .expandable-panel-heading').addClass('header-active');
                }
               // alert("<=");
            } else {
                obj.clearQueue();
                obj.stop();
                obj.prev().find('.icon-close-open').css('background-position', '0px 0px');
                obj.animate({'margin-top':(panelheight[objid]*-1)}, panelspeed); 
                if (highlightopen == true) {
                    jQuery('#cp-'+currentpanel + ' .expandable-panel-heading').removeClass('header-active');   
                }
               // alert("<=");
            }
        });
	
	
	 
        jQuery(window).load(function() {
            panelinit();
        }); //END LOAD
  
	//jQuery=jQuery.noConflict(true );
	//*********************** setup layout boxes
	jQuery.fn.editable.defaults.mode = 'popup';
	//jQuery("#others").editable();

	//****** init layout matrix, setup a layout box and two other adding blocks
	/*
	var temp = parseInt(jQuery(".resizeablebox").css("margin-left"),10)+
							parseInt(jQuery(".resizeablebox").css("margin-right"),10);
		console.log("tempMargin"+jQuery(".resizeablebox").css("margin-left"));*/
	
	var firstLayoutFrame = new LayoutFrame(0, 0, 100, 150,0);
	firstLayoutFrame.title = "I ";
	layoutMatrix[0] = firstLayoutFrame;

	var secLayoutFrame = new LayoutFrame(1, 0, 100, 150,1);
	secLayoutFrame.title = "love ";
	layoutMatrix[1] = secLayoutFrame;

	var thirdLayoutFrame = new LayoutFrame(2, 0, 100, 150,2);
	thirdLayoutFrame.title = "you !";
	layoutMatrix[2] = thirdLayoutFrame;
	
	for (var i = 0; i < 4; i++) {
		rowHeightsArray[i] = 150;
	}
	
	
	//	svg.setAttribute('style', 'border: 1px solid black');
	

	
	for (var i = 0; i < 3; i++) {
		var tempDiv = jQuery("<div></div>");
		jQuery(tempDiv).attr("id","resizePanel"+i);
		jQuery(tempDiv).addClass("resizeaPanelBox");
		jQuery(tempDiv).resizable({
			handles : "s",
			start: function( event, ui ) {
				console.log("start");
				getTempIndexArray();
			},
			resize: function( event, ui ) {
				var idStr = jQuery(ui.element).attr("id");
				//console.log(jQuery(ui.element).attr("id")+" "+ui.size.width+" "+ui.size.height);
				var rowHeightIndex = parseInt(idStr.substr(11,11));
				//console.log(rowHeightIndex);
				var tempHeight = ui.size.height;
				
				rowHeightsArray[rowHeightIndex] = tempHeight;
				update_LayoutBox_Index();
				
				
				//************old implementation
			/*
				zoomLayoutBox(rowHeightIndex);
							rowHeightsArray[rowHeightIndex] = tempHeight;
							
							updateLayoutBoxPositionIndex();
							
							checkRowChangeAndZoomLayoutBox();
							
							getTempIndexArray();*/
			
				//********** old implementation
				
				printLayoutMatrix();
				
			}
		});
		
		
		
	
		
		
		jQuery(tempDiv).dblclick(function(event) {
			
			//alert(event.target.id);
			var idNumber = parseInt(event.target.id);
			
			for(var i = 0; i < layoutMatrix.length; i++)
			{
				if(layoutMatrix[i].id===(idNumber))
				{
					jQuery("#svgWindow").empty();
					var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
					generateCurrentLayoutSVGBox(i , currentSVGContainer);
					currentFrameIndex = i;
					
					if(typeof layoutMatrix[currentFrameIndex].svgObject === 'undefined')
					{
						tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						var width = layoutMatrix[currentFrameIndex].width;
						var height = layoutMatrix[currentFrameIndex].height;
						//tempSVG.setAttribute('id', 'workingSvg');
						tempSVG.setAttribute('width', width+'');
						tempSVG.setAttribute('height', height+'');
						tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
						"xmlns:xlink", "http://www.w3.org/1999/xlink");
						workingSvg = jQuery(tempSVG);
						layoutMatrix[currentFrameIndex].svgObject = workingSvg;
						
					}
					else{
						workingSvg = jQuery(layoutMatrix[currentFrameIndex].svgObject);
					}
					
					
					break;
				}
			}
			//alert(event.target.id);
			
   		 });
		jQuery(tempDiv).addClass("draggable");
		jQuery(tempDiv).addClass("ui-widget-content");
	
		
		jQuery("#resizePanel").append(tempDiv);
		
		
	}
	
	
	//****** initialize the first the working svg Object
	tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var width = layoutMatrix[currentFrameIndex].width;
	var height = layoutMatrix[currentFrameIndex].height;
	//tempSVG.setAttribute('id', 'workingSvg');
	tempSVG.setAttribute('width', width+'');
	tempSVG.setAttribute('height', height+'');
	tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
	"xmlns:xlink", "http://www.w3.org/1999/xlink");
	workingSvg = jQuery(tempSVG);
	layoutMatrix[currentFrameIndex].svgObject = tempSVG;
						
						
						
	
	for (var i = 0; i < numberOfLayout; i++) {
		var tempDiv = jQuery("<div></div>");
		jQuery(tempDiv).attr("id",i);
		jQuery(tempDiv).addClass("resizeablebox");
		jQuery(tempDiv).resizable({
			handles : "e",
			start: function( event, ui ) {
				console.log("start");
				getTempIndexArray();
			},
			resize: function( event, ui ) {
				console.log(jQuery(ui.element).attr("id")+" "+ui.size.width+" "+ui.size.height);
				var index = parseInt(jQuery(ui.element).attr("id"));
				
				for(var i = 0; i<layoutMatrix.length;i++)
				{
					if(layoutMatrix[i].id===index)
					break;
				}
				
				layoutMatrix[i].width=ui.size.width;
				layoutMatrix[i].height = ui.size.height;
				
				
				/*
				layoutMatrix[index].width=ui.size.width;
								layoutMatrix[index].height = ui.size.height;*/
				
				printLayoutMatrix();
				
				/*
				updateLayoutBoxPositionIndex();
								checkRowChangeAndZoomLayoutBox();
								getTempIndexArray();*/
				update_LayoutBox_Index();
				
			}
		});
		
		
		
		
		jQuery(tempDiv).dblclick(function(event) {
			
			//alert(event.target.id);
			var idNumber = parseInt(event.target.id);
			
			for(var i = 0; i < layoutMatrix.length; i++)
			{
				if(layoutMatrix[i].id===(idNumber))
				{
					jQuery("#svgWindow").empty();
					var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
					generateCurrentLayoutSVGBox(i , currentSVGContainer);
					currentFrameIndex = i;
					
					if(typeof layoutMatrix[currentFrameIndex].svgObject === 'undefined')
					{
						tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						var width = layoutMatrix[currentFrameIndex].width;
						var height = layoutMatrix[currentFrameIndex].height;
						//tempSVG.setAttribute('id', 'workingSvg');
						tempSVG.setAttribute('width', width+'');
						tempSVG.setAttribute('height', height+'');
						tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
						"xmlns:xlink", "http://www.w3.org/1999/xlink");
						workingSvg = jQuery(tempSVG);
						layoutMatrix[currentFrameIndex].svgObject = workingSvg;
						
					}
					else{
						workingSvg = jQuery(layoutMatrix[currentFrameIndex].svgObject);
					}
					
					break;
				}
			}
			//alert(event.target.id);
			
   		 });
		
		jQuery(tempDiv).addClass("draggable");
		jQuery(tempDiv).addClass("ui-widget-content");
		var head = jQuery("<h3 href=\"#\" id=\"username" + i + "\" data-type=\"text\" data-placement=\"right\" data-title=\"Enter title\">" + layoutMatrix[i].title + "</h3>");
		
		//***** temperary comment the head
		//jQuery(tempDiv).append(head);
		//jQuery("#username"+i).editable();
		console.log("#username" + i);
		
		//jQuery(head).addClass("ui-widget-header");
		jQuery(head).addClass("boxHead");

		jQuery("#wrapper").append(tempDiv);
		
		
		console.log(jQuery.fn.jquery);
		jQuery(head).editable();

		jQuery(head).on('save', function(e, params) {
			// alert('Saved value: ' + params.newValue);
			// layoutMatrix[i].title = params.newValue;

			setTimeout(function() {
				for (var i = 0; i < numberOfLayout; i++) {
					
					layoutMatrix[i].title = jQuery("#username" + layoutMatrix[i].id).text();
					//console.log(jQuery("#username" + i).text());
				}

				for (var i = 0; i < numberOfLayout; i++) {
					//layoutMatrix[i].title = jQuery("#username" + i).text();
					console.log(layoutMatrix[i].title);
				}
			}, 500);

		}); 

			
	
		
		
	}
	
	
	jQuery(document).keypress(function(e){
  		if(e.charCode == 92){
   			 // Do your thing
   			 doCropFunction();
   			 
 			 }
		});
	
	
	jQuery("#previous").button({
		text : true
	}).click(function() {
		currentSingleFrameIndex=currentSingleFrameIndex-1;
		
	  //  if(currentSingleFrameIndex>=0)
		{
	    	renderSingleFrame(currentSingleFrameIndex);
	    }
	});
	
	jQuery("#next").button({
		text : true
	}).click(function() {
		currentSingleFrameIndex=currentSingleFrameIndex+1;
		
	   // if(currentSingleFrameIndex<currentElements.length)
		{
	    	renderSingleFrame(currentSingleFrameIndex);
	    }
	});
	
	
	
	jQuery("#loadRepo").button({
		text : true
	}).click(function() {
		
		
		//var url = "http://localhost:4010/";
		var url = "http://"+serverAddress+":"+port+"/";

		var request = {};
		request.jsonrpc = "2.0";
		request.params = {};
		request.method = "loadRepo";
		//var layoutStr =  JSON.stringify(layoutMatrix);
		if(!updateUID())
			return;
		request.params.uid = uid;
		//request.params.layoutStr = [layoutStr];
		request.id = 0;

		function displaySearchResult(response) {

		if (response.result)
		{
				//alert(response.result);
				var loadObj = jQuery.parseJSON(response.result);
				/*
				for(var i = 0; i< templayoutMatrix.length; i++)
								{
									console.log("~"+templayoutMatrix[])
								}*/
				/*
				alert(templayoutMatrix.length);
								alert(templayoutMatrix.join('\n'));*/
				console.log(JSON.stringify(loadObj[0]));
				repoSVGMatrix = loadObj;
				
				//****** update the showbox svgs
				jQuery("#showBox").empty();
				for(var i = 0; i < repoSVGMatrix.length; i++)
				{	var objHeadingStr = loadObj[i].substring(1,4);
					window.alert("objHeadingStr "+objHeadingStr);
					if(objHeadingStr==="svg")
					{
						load_addSVG(loadObj[i]);
					}
					else if(objHeadingStr==="ata")
					{
						loadAddCa(loadObj[i]);
					}
				}
				
				
				
				//numberOfLayout = layoutMatrix.length;
				//rowHeightsArray = loadObj.rowArray;
				//console.log(JSON.stringify(rowHeightsArray));
				//update_LayoutBox_Index();
				//reconstructionLayout();
				
				
		}
			
			else if (response.error)
				alert("Search error: " + response.error.message);
		};

		jQuery.post(url, JSON.stringify(request), displaySearchResult, "json");
		
	});
	
	jQuery("#updateRepo").button({
		text : true
	}).click(function() {
		
		
		//var url = "http://localhost:4010/";
		var url = "http://"+serverAddress+":"+port+"/";
//		var url = "http://"+serverAddress+":4012/";

		var request = {};
		request.jsonrpc = "2.0";
		request.params = {};
		//request.params = [1,2];
		request.method = "updateRepo";
		//var layoutStr =  JSON.stringify(layoutMatrix);
		
		/*var tempLayoutMatrix = new Array();
		for(var i = 0; i< layoutMatrix.length; i++)
		{
			tempLayoutMatrix[i] = new LayoutFrame(layoutMatrix[i].x_index,layoutMatrix[i].y_index,layoutMatrix[i].width,layoutMatrix[i].height,layoutMatrix[i].id);
			tempLayoutMatrix[i].svg = layoutMatrix[i].svg;
			tempLayoutMatrix[i].title = layoutMatrix[i].title;

		}*/
		var layoutStr =  JSON.stringify(repoSVGMatrix);
		if(!updateUID())
		return;
		request.params.uid = uid;
		request.params.layoutStr = [layoutStr];
		//request.params = {"foo": "json", "bar": "-rpc"};
		
		//request.params.foo = "json";
		//request.params.bar = "-rpc";
		/*
		request.params
				request.params.CID = "45d0677d-a336-463b-ad99-c82137d03a00";
				request.params.baseDN = "ou=people,dc=example,dc=com";
				request.params.scope = "ONE";
				request.params.filter = "(givenName=John)";*/
		
		request.id = 0;
		//request.jsonrpc = "2.0";

		function displaySearchResult(response) {

		if (response.result)
				alert(response.result);
			
			else if (response.error)
				alert("Search error: " + response.error.message);
		};

		jQuery.post(url, JSON.stringify(request), displaySearchResult, "json");


		
	});
	
	 jQuery("#update").button({
		text : true
	}).click(function() {
		
		
		// var url = "http://localhost:4010/";
		var url = "http://"+serverAddress+":"+port+"/";
		// var url = "http://"+serverAddress+":4012/";


		var request = {};
		request.jsonrpc = "2.0";
		request.params = {};
		//request.params = [1,2];
		request.method = "update";
		//var layoutStr =  JSON.stringify(layoutMatrix);
		
		var tempLayoutMatrix = new Array();
		for(var i = 0; i< layoutMatrix.length; i++)
		{
			tempLayoutMatrix[i] = new LayoutFrame(layoutMatrix[i].x_index,layoutMatrix[i].y_index,layoutMatrix[i].width,layoutMatrix[i].height,layoutMatrix[i].id);
			tempLayoutMatrix[i].svg = layoutMatrix[i].svg;
			tempLayoutMatrix[i].title = layoutMatrix[i].title;

		}
		var layoutStr =  JSON.stringify(new returnObj(tempLayoutMatrix,rowHeightsArray));
		if(!updateUID())
		return;
		request.params.uid = uid;
		request.params.layoutStr = [layoutStr];
		//request.params = {"foo": "json", "bar": "-rpc"};
		
		//request.params.foo = "json";
		//request.params.bar = "-rpc";
		/*
		request.params
				request.params.CID = "45d0677d-a336-463b-ad99-c82137d03a00";
				request.params.baseDN = "ou=people,dc=example,dc=com";
				request.params.scope = "ONE";
				request.params.filter = "(givenName=John)";*/
		
		request.id = 0;
		//request.jsonrpc = "2.0";

		function displaySearchResult(response) {

		if (response.result)
				alert(response.result);
			
			else if (response.error)
				alert("Search error: " + response.error.message);
		};

		jQuery.post(url, JSON.stringify(request), displaySearchResult, "json");


	});
	 
	  jQuery("#load").button({
		text : true
	}).click(function() {
		
		
		// var url = "http://localhost:4010/";
		var url = "http://"+serverAddress+":"+port+"/";


		var request = {};
		request.jsonrpc = "2.0";
		request.params = {};
		request.method = "load";
		//var layoutStr =  JSON.stringify(layoutMatrix);
		if(!updateUID())
		return;
		request.params.uid = uid;
		//request.params.layoutStr = [layoutStr];
		request.id = 0;

		function displaySearchResult(response) {

		if (response.result)
		{
				//alert(response.result);
				var loadObj = jQuery.parseJSON(response.result);
				/*
				for(var i = 0; i< templayoutMatrix.length; i++)
								{
									console.log("~"+templayoutMatrix[])
								}*/
				/*
				alert(templayoutMatrix.length);
								alert(templayoutMatrix.join('\n'));*/
			//	console.log(JSON.stringify(loadObj.layoutMatrix));
				layoutMatrix = loadObj.layoutMatrix;
				numberOfLayout = layoutMatrix.length;
				rowHeightsArray = loadObj.rowArray;
				console.log(JSON.stringify(rowHeightsArray));
				//update_LayoutBox_Index();
				reconstructionLayout();
				
				
		}
			
			else if (response.error)
				alert("Search error: " + response.error.message);
		};

		jQuery.post(url, JSON.stringify(request), displaySearchResult, "json");
	});
	 	
	
	//***********************  initialize the first
	firstLayoutBox = layoutMatrix[0];
	var firstOffset = jQuery("#"+0).offset();
	firstLayoutBox.left = firstOffset.left;
  	firstLayoutBox.top = firstOffset.top;
	
	//************** layout manager initialization
	//jQuery( "#resizable" ).resizable({handles:"e"});
   // jQuery( "#resizable1" ).resizable({handles:"e"});
 
   jQuery("#addFrame").click(function() {
		numberOfLayout++;
		var thirdLayoutFrame = new LayoutFrame(1, 0, 100, 150,numberOfLayout-1);
		//thirdLayoutFrame.title = "New Title";
		thirdLayoutFrame.title = ""+(numberOfLayout-1);
		layoutMatrix[numberOfLayout-1] = thirdLayoutFrame;

		var tempDiv = jQuery("<div></div>");
		jQuery(tempDiv).attr("id",numberOfLayout-1);
		jQuery(tempDiv).addClass("resizeablebox");
		jQuery(tempDiv).resizable({
			handles : "e",
			start: function( event, ui ) {
				console.log("start");
				getTempIndexArray();
			},
			resize: function( event, ui ) {
				console.log(jQuery(ui.element).attr("id")+" "+ui.size.width+" "+ui.size.height);
				var index = parseInt(jQuery(ui.element).attr("id"));
				
				for(var i = 0; i<layoutMatrix.length;i++)
				{
					if(layoutMatrix[i].id===index)
					break;
				}
				
				layoutMatrix[i].width=ui.size.width;
				layoutMatrix[i].height = ui.size.height;
				/*
				updateLayoutBoxPositionIndex();
								printLayoutMatrix();
								
								updateLayoutBoxPositionIndex();
								checkRowChangeAndZoomLayoutBox();
								getTempIndexArray();*/
				update_LayoutBox_Index();
				
			}
		});
		
		
		jQuery(tempDiv).dblclick(function(event) {
			
			//alert(event.target.id);
			var idNumber = parseInt(event.target.id);
			
			for(var i = 0; i < layoutMatrix.length; i++)
			{
				if(layoutMatrix[i].id===(idNumber))
				{
					jQuery("#svgWindow").empty();
					var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
					generateCurrentLayoutSVGBox(i , currentSVGContainer);
					currentFrameIndex = i;
					
					if(typeof layoutMatrix[currentFrameIndex].svgObject === 'undefined')
					{
						tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
						var width = layoutMatrix[currentFrameIndex].width;
						var height = layoutMatrix[currentFrameIndex].height;
						//tempSVG.setAttribute('id', 'workingSvg');
						tempSVG.setAttribute('width', width+'');
						tempSVG.setAttribute('height', height+'');
						tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
						"xmlns:xlink", "http://www.w3.org/1999/xlink");
						workingSvg = jQuery(tempSVG);
						layoutMatrix[currentFrameIndex].svgObject = workingSvg;
						
					}
					else{
						workingSvg = jQuery(layoutMatrix[currentFrameIndex].svgObject);
					}
					
					break;
				}
			}
			//alert(event.target.id);
			
   		 });
		
		jQuery(tempDiv).addClass("draggable");
		jQuery(tempDiv).addClass("ui-widget-content");
		var head = jQuery("<h3 href=\"#\" id=\"username" + (numberOfLayout-1) + "\" data-type=\"text\" data-placement=\"right\" data-title=\"Enter title\">" 
						//+ "New Title" + "</h3>");
						+ (numberOfLayout-1) + "</h3>");
		
		jQuery(head).editable();
		console.log(layoutMatrix.length);
				jQuery(head).on('save', function(e, params) {
					// alert('Saved value: ' + params.newValue);
					// layoutMatrix[i].title = params.newValue;
		
					setTimeout(function() {
						for (var i = 0; i < numberOfLayout; i++) {
						//	layoutMatrix[i].title = jQuery("#username" + i).text();
							//console.log(jQuery("#username" + i).text());
							layoutMatrix[i].title = jQuery("#username" + layoutMatrix[i].id).text();

						}
					}, 500);
		
				});
		
		//head.editable();
		//jQuery(head).addClass("ui-widget-header");
		jQuery(head).addClass("boxHead");
		//jQuery(tempDiv).append(head);

		jQuery("#wrapper").append(tempDiv);
		
		console.log(layoutMatrix.length);
		
	//	updateLayoutBoxPositionIndex();
		update_LayoutBox_Index();
		printLayoutMatrix();
		printBreaks();

		
	});
    
    jQuery("#wrapper").sortable({
    	start: function(event, ui) {
            var start_pos = ui.item.index();
            ui.item.data('start_pos', start_pos);
            console.log("start index"+start_pos);

        },
    	change: function(event, ui) {
    	//	console.log("placeholder index "+ui.placeholder.index()+", dragged "+ ui.item.data('start_pos'));
    		var change_pos = ui.placeholder.index();
    		ui.item.data('change_pos', change_pos);
    		
    	},
    	stop: function(event, ui) {
    		console.log("new pos index "+ui.item.data('change_pos')+", dragged "+ ui.item.data('start_pos'));
    		console.log(ui.item.data('change_pos'));
    		var dropIndex = parseInt(ui.item.data('change_pos'));
    		var startIndex = parseInt(ui.item.data('start_pos'));
    		
    		//
    		var breakBeforeStart = 0;
    		for(var i = 0 ; i < startIndex; i++)
    		{
    			if(breakArray[i]===true)
    			breakBeforeStart++;
    		}
    		startIndex = startIndex-breakBeforeStart;
    		
    		
    		var breakBeforedrop = 0;
    		for(var i = 0 ; i < dropIndex; i++)
    		{
    			if(breakArray[i]===true)
    			breakBeforedrop++;
    		}
    		dropIndex = dropIndex-breakBeforedrop;
    		
    		
    		
    		
    		//console.log("breakBeforeStart "+breakBeforeStart);
    		
    		
    		if(typeof ui.item.data('change_pos') === 'undefined'){
					  var dropIndex	= startIndex;			 
 			};
    		/*
			var dropIndex = parseInt(ui.item.data('change_pos'));
						var startIndex = parseInt(ui.item.data('start_pos'));*/
			
    		/*
			if(dropIndex===numberOfLayout)
						{
							console.log("true");
							dropIndex = dropIndex-1;
						}*/
			
    		
    	
		
    		
    		//console.log("place about to drop after "+dropIndex);
    		layoutMatrix.splice(dropIndex,0, layoutMatrix[startIndex]);
    		
			if(dropIndex<startIndex)
					{
						startIndex = startIndex+1;
					}
    		console.log(layoutMatrix.length+"startIndex "+startIndex
    		+", dropIndex "+dropIndex);
    		//printLayoutMatrix();
    		
    		
    		
    		
    		
    		//setTimeout(function() {
    			layoutMatrix.splice(startIndex, 1);
    			//console.log("after splice "+layoutMatrix.length);	
    		//console.log("numberOfLayout "+numberOfLayout);	
    		printLayoutMatrix();
    		//},500);
    		//
    		//setTimeout(update_LayoutBox_Index,200);
    		update_LayoutBox_Index();
    		printBreaks();
    		

    	}
    });
    
	
	

	//var SVGDiv = document.createElement("div");
	//var svgContainer = d3.select("#topPlaceHolder").append("svg");
	//svgContainer.attr("class","topPlaceHolderSVG");
	
	tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	//var width = layoutMatrix[currentFrameIndex].width;
	//var height = layoutMatrix[currentFrameIndex].height;
	//tempSVG.setAttribute('id', 'workingSvg');
	//tempSVG.setAttribute('width', width+'');
	//tempSVG.setAttribute('height', height+'');
	tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
	"xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgContainer = jQuery(tempSVG);
	jQuery("#topPlaceHolder").append(tempSVG);
	jQuery(tempSVG).attr("class","topPlaceHolderSVG");
						
	//for (var i = 0; i <= 2; i++) {
	for (var i = 0; i < layoutMatrix.length; i++) {
		//generateLayoutSVGBox(i, svgContainer);
		generateLayoutSVGBox(i, tempSVG);
	}

	var currentSVGContainer = d3.select("#svgWindow").append("svg");
					currentSVGContainer.attr("class","svgWindowSVGStyle");
	generateCurrentLayoutSVGBox(0 , currentSVGContainer);
	
	
	//jQuery("#topPlaceHolder").append(svgContainer);
	//jQuery("#topPlaceHolder").append("<img src=\"images/clockwise.png\">");

	//d3.select("#canvasdock").append(svgContainer);

	// Handler for .ready() called.
	
	jQuery("#saveCrop").button({
		text : true
	}).click(function() {
		var tempNode = jQuery("<div></div>");
		tempNode.attr("id","SVG"+guid());
		tempNode.css("position", "absolute");
		tempNode.css("padding", "0.5em");
		tempNode.css("border-style", "dashed");
		tempNode.css("border-width", "1px");
		
		var saveLeft = jQuery("#cropwindow").css("left");
		var saveTop = jQuery("#cropwindow").css("top");

		
		jQuery(tempNode).css("left",saveLeft);
		jQuery(tempNode).css("top",saveTop);
		
		var width = jQuery("#cropwindow").css("width");
		var height = jQuery("#cropwindow").css("height");
		
		widthInt = parseInt(width,10);
		heightInt = parseInt(height,10);
		
		jQuery(tempNode).css("width",width);
		jQuery(tempNode).css("height",height);

		var movingSVG = jQuery("#cropwindow").children()[0];
		jQuery(tempNode).append(movingSVG);
		tempNode.resizable({
    	  aspectRatio: widthInt / heightInt
   		 });
		tempNode.draggable();
		
		//jQuery("#canvasdock").append(tempNode);
		jQuery("#cropdock").append(tempNode);
		
		var size = currentElements.length;
		currentElements[size]=tempNode;

		
	});
	
	jQuery("#save").button({
		text : true
	}).click(function() {
		
		//********* create a new svg container with viewbox of the 
		//*********  current frame size and nest all the visual elemnets inside 
		/*
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			//	svg.setAttribute('style', 'border: 1px solid black');
				var width = layoutMatrix[currentFrameIndex].width;
				var height = layoutMatrix[currentFrameIndex].height;
				//svg.setAttribute('id', width+'');
				svg.setAttribute('width', width+'');
				svg.setAttribute('height', height+'');
				svg.setAttributeNS("http://www.w3.org/2000/xmlns/", 
				"xmlns:xlink", "http://www.w3.org/1999/xlink");*/
		
		//document.body.appendChild(svg);
		
		//d3.select(workingSvg).append(jQuery("#cropwindow").children()[0]);
		/*tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		var width = layoutMatrix[currentFrameIndex].width;
		var height = layoutMatrix[currentFrameIndex].height;
		//tempSVG.setAttribute('id', 'workingSvg');
		tempSVG.setAttribute('width', width+'');
		tempSVG.setAttribute('height', height+'');
		tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		"xmlns:xlink", "http://www.w3.org/1999/xlink");
	
		// workingSvg =d3.select(tempSVG);
		workingSvg =jQuery(tempSVG);
		*/
		
		//********* copy all the elements in currentElements to the 
		//*********  corresponding svg containter. SAE
		
		var tempCurrentElements = jQuery("#cropdock").children();
		
		for(var i = 0; i< tempCurrentElements.length; i++)
		{
			var temp_ID=null;
			if(!(typeof jQuery(tempCurrentElements[i]).attr("id")==="undefined"))
			 temp_ID = jQuery(tempCurrentElements[i]).attr("id").substring(0,5);
			//console.log(temp_ID);
			var movingSVG;// = jQuery(tempCurrentElements[i]).children()[0];
			if(temp_ID==="photo")
			{
				//window.alert("photo div");
				var tempCropwidth = parseInt(jQuery(tempCurrentElements[i]).css("width"), 10);
				var tempCropheight = parseInt(jQuery(tempCurrentElements[i]).css("height"), 10);
				var insideSVGWidth = tempCropwidth/3;
				var insideSVGHeight = tempCropheight/3;
				
				var tempCanvas = jQuery(tempCurrentElements[i]).children()[0];
				var tempSrc = tempCanvas.toDataURL();
			    movingSVG = jQuery('<svg><image xlink:href='+tempSrc
				+' transform=scale(1,1)  width='+insideSVGWidth+
				' height='+insideSVGHeight+'/></svg>')
				.attr('xmlns','http://www.w3.org/2000/svg');
			
			}
			else{
		    movingSVG = jQuery(tempCurrentElements[i]).children()[0];
			var tempCropwidth = parseInt(jQuery(tempCurrentElements[i]).css("width"), 10);
			var tempCropheight = parseInt(jQuery(tempCurrentElements[i]).css("height"), 10);
			
			
			var top = parseInt(jQuery(tempCurrentElements[i]).css("top"), 10);
			var left = parseInt(jQuery(tempCurrentElements[i]).css("left"), 10);
	
			
			var offsetX = (left - 300)/largeLayoutRatio;
			var offsetY = (top - 100)/largeLayoutRatio;
			
			var insideSVGWidth = tempCropwidth/3;
			var insideSVGHeight = tempCropheight/3;
			
			movingSVG.setAttribute('width', insideSVGWidth+'');
			movingSVG.setAttribute('height', insideSVGHeight+'');
			
			d3.select(movingSVG).attr("x", offsetX+"");
			d3.select(movingSVG).attr("y", offsetY+"");
			
			}
			workingSvg.append(movingSVG);
			//jQuery("#"+currentFrameIndex).append(workingSvg);
			
			//tempCurrentElements[i].remove();
			
		}
		jQuery("#"+currentFrameIndex).append(workingSvg);
		tempCurrentElements.length = 0;
		/*
		var movingSVG = jQuery("#cropwindow").children()[0];
		var tempCropwidth = parseInt(jQuery("#cropwindow").css("width"), 10);
		var tempCropheight = parseInt(jQuery("#cropwindow").css("height"), 10);
		
		
		var top = parseInt(jQuery("#cropwindow").css("top"), 10);
		var left = parseInt(jQuery("#cropwindow").css("left"), 10);

		
		var offsetX = (left - 300)/largeLayoutRatio;
		var offsetY = (top - 100)/largeLayoutRatio;
		
		var insideSVGWidth = tempCropwidth/3;
		var insideSVGHeight = tempCropheight/3;
		
		movingSVG.setAttribute('width', insideSVGWidth+'');
		movingSVG.setAttribute('height', insideSVGHeight+'');
		
		d3.select(movingSVG).attr("x", offsetX+"");
		d3.select(movingSVG).attr("y", offsetY+"");
		
		
		workingSvg.append(movingSVG);
		jQuery("#"+currentFrameIndex).append(workingSvg);
		*/
		
		//layoutMatrix[currentFrameIndex].svg = jQuery("#"+currentFrameIndex).children()[0].html();
		layoutMatrix[currentFrameIndex].svg = workingSvg.parent().children()[1].outerHTML+"";
		jQuery("#cropdock").empty();
		
	});

	jQuery("#doCrop").button({
		text : true
	}).click(function() {

		//jQuery("#cropwindow").empty();
		var tempsvgnodeArray = jQuery(document.getElementById("canvasdock").firstChild).clone();
		tempsvgnode = tempsvgnodeArray[0];
		//var tempsvgnode = document.getElementById("canvasdock").firstChild;
  		var aspectRatioInfo = d3.select(tempsvgnode).attr("viewBox");
  		var strArray = aspectRatioInfo.split(" ");
  		//console.log("viewbox "+strArray[3]);
		/*
		 var original_width = tempsvgnode.getBBox().width ;
		 var original_height = tempsvgnode.getBBox().height;*/

		var original_width = parseInt(strArray[2]);
		var original_height = parseInt(strArray[3]);

		//var original_width = tempsvgnode.getBBox().width ;
		//var original_height = tempsvgnode.getBBox().height;

		console.log(original_width + " " + original_height);

		var tempCropwidth = parseInt(jQuery("#cropwindow").css("width"), 10);
		var tempCropheight = parseInt(jQuery("#cropwindow").css("height"), 10);

		var tempwidth = parseInt(jQuery("#canvasdock").css("width"), 10);
		var tempheight = parseInt(jQuery("#canvasdock").css("height"), 10);
		
		if(original_width/original_height > tempwidth/tempheight)
		{
			var tempheight = original_height/original_width*tempwidth;

		}else
		{
			var tempwidth = original_width/original_height*tempheight;

		}
		
		
		x_ratio = tempwidth / original_width;
		y_ratio = tempheight / original_height;

		var top = parseInt(jQuery("#cropwindow").css("top"), 10);
		var left = parseInt(jQuery("#cropwindow").css("left"), 10);

		left = left / x_ratio;
		top = top / y_ratio;
		var tempviewBoxAttr = left + " " + top + " " + tempCropwidth / x_ratio + " " + tempCropheight / y_ratio;

		tempsvgnode.setAttribute("viewBox", tempviewBoxAttr);

		jQuery(tempsvgnode).removeAttr("width");
		jQuery(tempsvgnode).removeAttr("height");

		jQuery(tempsvgnode).attr("width", "100%");
		jQuery(tempsvgnode).attr("height", "100%");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMidYMid meet");
		//jQuery(tempsvgnode).attr("preserveAspectRatio","xMinYMin meet");
		d3.select(tempsvgnode).attr("preserveAspectRatio","none");
		///	jQuery(svgnode).attr("viewBox", "0 0 900 800");
		
		

		jQuery("#cropwindow").prepend(tempsvgnode);

	});

	jQuery("#autoFit").button({
		text : true
	}).click(function() {
		
		var width = layoutMatrix[currentFrameIndex].width*largeLayoutRatio;
		var height = layoutMatrix[currentFrameIndex].height*largeLayoutRatio;
		
		var cropWindowWidth = parseInt(jQuery("#cropwindow").css("width"),10);
		var cropWindowHeight = parseInt(jQuery("#cropwindow").css("height"),10);

		
		if(width/height < cropWindowWidth/cropWindowHeight)
		{
			jQuery("#cropwindow").css("width",width+"px");
			var tempHeight = width/cropWindowWidth * cropWindowHeight;
			jQuery("#cropwindow").css("height",tempHeight+"px");	
		}else
		{
			jQuery("#cropwindow").css("height",height+"px");
			var tempWidth = height/cropWindowHeight * cropWindowWidth;
			jQuery("#cropwindow").css("width",tempWidth+"px");
		}
		
		
		
		jQuery("#cropwindow").css("left","300px");
		jQuery("#cropwindow").css("top","100px");
		
		//jQuery("#cropwindow").draggable("destroy" );
	});

	jQuery("#addText").button({
		text : true
	}).click(function() {

		var node1 = jQuery("<div></div>");
		node1.css("position", "absolute");
		node1.css("padding", "0.5em");
		node1.css("left","300px");
		node1.css("top","100px");
		node1.click(function() {
			// $(this).addClass('top').removeClass('bottom');
			//$(this).siblings().removeClass('top').addClass('bottom');
			if (!deleteMode) {
				jQuery(this).css("z-index", zIndex_text++);
			} else {
				jQuery(this).remove();
			}

		});

		var text = document.createElement("h2");
		text.textContent = jQuery('input[name="speech"]').val();
		if (text.textContent.length != 0) {
		
		var textSize = 20;
		var tempSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		
		tempSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		"xmlns:xlink", "http://www.w3.org/1999/xlink");
		//workingSvg = jQuery(tempSVG);
		//layoutMatrix[currentFrameIndex].svgObject = workingSvg;
		
		//text.textContent="hello world";
		//getBBox().width
		var textLength = jQuery('input[name="speech"]').val().length;
		d3.select(tempSVG).append("text").
		text(jQuery('input[name="speech"]').val())
		.attr("font-size", textSize+"px")
		.attr("fill", "#000000")
		.attr("stroke","none")
		.attr("x","0px")
		.attr("y",textSize+"px");
		
		
		//var width = tempSVG.getBBox().width;
		//var height = tempSVG.getBBox().height;
		
		var width = textLength*(textSize-6);
		var height = textSize+10;
		//tempSVG.setAttribute('id', 'workingSvg');
		tempSVG.setAttribute('width', width+'px');
		tempSVG.setAttribute('height', height+'px');
		
		var viewBoxAttr = "0 0 " + width + " " + height;

		//jQuery(svgnode).removeAttr("width");
		//jQuery(svgnode).removeAttr("height");
	
		jQuery(tempSVG).attr("width", "100%");
		jQuery(tempSVG).attr("height", "100%");
		jQuery(tempSVG).attr("preserveAspectRatio","xMinYMin meet");
		//jQuery(svgnode).attr("viewBox", "0 0 900 800");
		tempSVG.setAttribute("viewBox", viewBoxAttr);
		
		node1.css("width",width+"px");
		node1.css("height",height+"px");
		
		//text.textContent = jQuery('input[name="speech"]').val();
		
			
			//jQuery(".dock").append(node1);
			jQuery("#cropdock").append(node1);
			//node1.append(text);
			node1.append(tempSVG);
		} else {
			alert("add text please");
		}
		
		node1.resizable();
		node1.draggable({
			grid : [10, 10]
		});
		
		var size = currentElements.length;
		currentElements[size] = node1;

	});
	
	
	jQuery('#singleFrame').click(function() {
		if (jQuery("#singleFrame").is(':checked') == true) {
			//alert("checked");
			//jQuery('.dock').css("background", "url('images/GySvQ.png')");
			jQuery('.dock').css("background", "url('images/GySvQ.png')");

		} else {
			jQuery('.dock').css("background", "none");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});


	jQuery('#grid').click(function() {
		if (jQuery("#grid").is(':checked') == true) {
			//alert("checked");
			//jQuery('.dock').css("background", "url('images/GySvQ.png')");
			jQuery('.dock').css("background", "url('images/GySvQ.png')");

		} else {
			jQuery('.dock').css("background", "none");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	jQuery('#clockwise').click(function() {
		if (jQuery("#grid").is(':checked') == true) {
			//alert("checked");
			jQuery('.dock').css("background-image", "url('images/GySvQ.png'),url('images/clockwise.png')");

		} else {
			jQuery('.dock').css("background-image", "url('images/clockwise.png')");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	jQuery('#block').click(function() {
		if (jQuery("#grid").is(':checked') == true) {
			//alert("checked");
			jQuery('.dock').css("background-image", "url('images/GySvQ.png'),url('images/block.png')");

		} else {
			jQuery('.dock').css("background-image", "url('images/block.png')");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	jQuery('#inline').click(function() {
		if (jQuery("#grid").is(':checked') == true) {
			//alert("checked");
			jQuery('.dock').css("background-image", "url('images/GySvQ.png'),url('images/inline.png')");

		} else {
			jQuery('.dock').css("background-image", "url('images/inline.png')");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	jQuery('#nonetemplete').click(function() {
		if (jQuery("#grid").is(':checked') == true) {
			//alert("checked");
			jQuery('.dock').css("background-image", "url('images/GySvQ.png')");

		} else {
			jQuery('.dock').css("background-image", "none");
			//alert("uncheck");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	/*
	jQuery('#delete').click(function() {
			if (jQuery("#delete").is(':checked') == true) {
				//alert("delete");
				deleteMode = true;
				jQuery(".ui-draggable").css('cursor', "url('images/icon_close.png')");
	
			} else {
				//alert("not delete");
				deleteMode = false;
				jQuery(".ui-draggable").css('cursor', "default");
	
			}
			//jQuery('#dock').css("background-image", "none");
		});*/
	

	jQuery('#crop').click(function() {
		if (jQuery("#crop").is(':checked') == true) {
			//alert("delete");
			cropOn = true;
			jQuery("#cropwindow").css('display', "inline");

		} else {
			//alert("not delete");
			cropOn = false;
			jQuery(".ui-cropwindow").css('display', "none");

		}
		//jQuery('#dock').css("background-image", "none");
	});

	//jQuery('.dock div').click(function() {
	jQuery('#cropdock div').click(function() {
		// $(this).addClass('top').removeClass('bottom');
		//$(this).siblings().removeClass('top').addClass('bottom');
		jQuery(this).css("z-index", zIndex++);

	});
	
	
	jQuery("#singleFrame").iphoneStyle({
        onChange: function(elem, value) { 
            if (value.toString() == "true") {
                 // jQuery('.dock').css("background", "url('images/GySvQ.png')");
                //  jQuery("#previous").prop("disabled",false);
                  //jQuery("#next").prop("disabled",false);
                  singFrame = true;
                //  renderSingleFrame(currentSingleFrameIndex);
                  generateSlideShowDiv();

              } else {
                 // jQuery('.dock').css("background", "none");
                //  jQuery("#previous").prop("disabled",true);
                 // jQuery("#next").prop("disabled",true);
                   singFrame = false;

                  //alert("uncheck");
                    }
        }
      });
	
	jQuery("#grid").iphoneStyle({
        onChange: function(elem, value) { 
            if (value.toString() == "true") {
                  jQuery('.dock').css("background", "url('images/GySvQ.png')");
              } else {
                  jQuery('.dock').css("background", "none");
                  //alert("uncheck");
                    }
        }
      });
	jQuery("#delete").iphoneStyle({
			onChange: function(elem, value) { 
            if (value.toString() == "true") {
                 deleteMode = true;
                 jQuery(".ui-draggable").css('cursor', "url('images/icon_close.png')");
              } else {
                   deleteMode = false;
                  jQuery(".ui-draggable").css('cursor', "default");
                    }
        }
      });
      
      
      //***** initialize cropwindow modal window
        jQuery("#cropwindow").draggable({
              	drag: function( event, ui ) {
              		reshapeCropModalWindow();
              	},
              	cursor: "move" 
              });
	jQuery("#crop").iphoneStyle({
			onChange: function(elem, value) { 
            if (value.toString() == "true") {
               jQuery("#overlay_window").css('display', "inline");
             //  jQuery("#cropwindow").css('display', "inline");
            
              reshapeCropModalWindow();
              overlay_on();
              
              
              
            /*  var cropwindow_left_top_left = parseInt(jQuery("#cropwindow").css("left"),10);
              var cropwindow_left_top_top = parseInt(jQuery("#cropwindow").css("top"),10);
              var cropwindow_width = parseInt(jQuery("#cropwindow").css("width"),10);
              var cropwindow_height = parseInt(jQuery("#cropwindow").css("height"),10);
            
              var upperBlock_left = 0;//cropwindow_left_top_left;
              var upperBlock_top = 0;//cropwindow_left_top_top;
              var upperBlock_width = jQuery(window).width();
              var upperBlock_height = cropwindow_left_top_top;
              
              var leftBlock_left = 0;
              var leftBlock_top = cropwindow_left_top_top;
              var leftBlock_width = cropwindow_left_top_left;
              var leftBlock_height = cropwindow_height;
              
              var rightBlock_left = cropwindow_left_top_left+cropwindow_width;
              var rightBlock_top = cropwindow_left_top_top;
              var rightBlock_width = jQuery(window).width()-rightBlock_left;
              var rightBlock_height = cropwindow_height;
              
              
              var bottomBlock_left = cropwindow_left_top_left+cropwindow_width;
              var bottomBlock_top = cropwindow_left_top_top;
              var bottomBlock_width = jQuery(window).width();
              var bottomBlock_height = 900-(cropwindow_height+cropwindow_left_top_top);
              
              jQuery("#upperBlock").css("left",upperBlock_left+"px");
              jQuery("#upperBlock").css("top",upperBlock_top+"px");
              jQuery("#upperBlock").css("width",upperBlock_width+"px");
              jQuery("#upperBlock").css("height",upperBlock_height+"px");
              
              jQuery("#leftBlock").css("left",leftBlock_left+"px");
              jQuery("#leftBlock").css("top",leftBlock_top+"px");
              jQuery("#leftBlock").css("width",leftBlock_width+"px");
              jQuery("#leftBlock").css("height",leftBlock_height+"px");
              
              jQuery("#rightBlock").css("left",rightBlock_left+"px");
              jQuery("#rightBlock").css("top",rightBlock_top+"px");
              jQuery("#rightBlock").css("width",rightBlock_width+"px");
              jQuery("#rightBlock").css("height",rightBlock_height+"px");
              
              jQuery("#bottomBlock").css("left",bottomBlock_left+"px");
              jQuery("#bottomBlock").css("top",bottomBlock_top+"px");
              jQuery("#bottomBlock").css("width",bottomBlock_width+"px");
              jQuery("#bottomBlock").css("height",bottomBlock_height+"px");
              */
              
              
              } else {
              jQuery("#overlay_window").css('display', "none");

                    }
        }
      });
      
      jQuery("#draw_rec").button({
		text : true
	}).click(function() {
		 addRecHandler();
	});
	
	  jQuery("#draw_cir").button({
		text : true
	}).click(function() {
		 addCirHandler();
	});

	
	
	
	jQuery( "#cropCancel" ).click(function() {
		  jQuery("#overlay_window").css('display', "none");
	});
	
	jQuery( "#cropOk" ).click(function() {
		
		//**** patch0929 show vis after the cropping is done
		 jQuery("#cropdock").css("display","block");
		 jQuery("#left-panel-content").css("display","block");

		 
		  doCrop_function();
		  saveCrop_function();
		  setInitial_croppingWindow();
		  jQuery("#overlay_window").css('display', "none");
		  
	});
	
	jQuery( "#crop_autoFit" ).click(function() {
		//**** patch0929 show vis after the cropping is done
		 jQuery("#cropdock").css("display","block");
		 jQuery("#left-panel-content").css("display","block");

		
		doCrop_function();
		autofit_function();
		saveCrop_function();
		//reshapeCropModalWindow();
		
		setInitial_croppingWindow();
		jQuery("#overlay_window").css('display', "none");

		 // jQuery("#overlay_window").css('display', "none");
	});
	
	jQuery("#crop_button").button({
		text : true
	}).click(function() {
		 jQuery("#overlay_window").css('display', "inline");
             //  jQuery("#cropwindow").css('display', "inline");
            
            //**** patch0929 clear up for cropping 
            jQuery("#cropdock").css("display","none");
            jQuery("#left-panel-content").css("display","none");
            
              reshapeCropModalWindow();
              overlay_on();
	});
	
		//console.log("jquery"+jQuery.fn.jquery);
		//	console.log("_query"+_jQuery.fn.jquery);
       
     //	  var jq1203 = jQuery.noConflict(true );
    	  // console.log("jquery"+jQuery.fn.jquery);
     //   console.log("jq203"+jq1203.fn.jquery);
      
      
      //jQuery.getScript('../js/jquery1_6_2.min.js', function() {
       //         console.log("jquery now"+jQuery.fn.jquery);
                
              /*
                 jQuery('#crop').iButton({
                              change : function($input) {
                                  // update the text based on the status of the checkbox
                                  //$("#send-email").html($input.is(":checked") ? "Yes, send me more e-mail!" : "Ugh... no more e-mail already!");
                                  //jQuery("#cropwindow").css('display', $input.is(":checked") ? "inline" : "none");
                                                        if ($input.is(':checked') == true) {
                                      //alert("delete");
                                      //deleteMode = true;
                                      jQuery("#cropwindow").css('display', "inline");
                                      jQuery("#cropwindow").draggable();
                                  } else {
                                      //alert("not delete");
                                      //deleteMode = false;
                                      jQuery("#cropwindow").css('display', "none");
                                  }
                              }
                          });
                          jQuery('#delete').iButton({
                              change : function($input) {
                                  // update the text based on the status of the checkbox
                                  //$("#send-email").html($input.is(":checked") ? "Yes, send me more e-mail!" : "Ugh... no more e-mail already!");
                                  //jQuery("#cropwindow").css('display', $input.is(":checked") ? "inline" : "none");
                                  if ($input.is(':checked') == true) {
                                      //alert("delete");
                                      deleteMode = true;
                                      jQuery(".ui-draggable").css('cursor', "url('images/icon_close.png')");
                                        } else {
                                      //alert("not delete");
                                      deleteMode = false;
                                      jQuery(".ui-draggable").css('cursor', "default");
                                        }
                              }
                          });
                          jQuery('#grid').iButton({
                              change : function($input) {
                                  if ($input.is(':checked') == true) {
                                      //alert("checked");
                                      jQuery('.dock').css("background", "url('images/GySvQ.png')");
                                  } else {
                                      jQuery('.dock').css("background", "none");
                                      //alert("uncheck");
                                        }
                              }
                          });*/
              
      //    });
      
         
      

});
//photoshop.addResize();

