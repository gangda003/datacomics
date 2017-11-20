var HTMLTable_crow = {
 doctype:'<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',

	init : function() {
		console.log("in HTMLTable_crow.js");
		//alert("in svg_crow.js");

		window.URL = window.URL || window.webkitURL;

		
		
		HTMLTable_crow.initialize(d3);
	},
	initialize : function(d3) {
		var documents = [window.document], SVGSources = [];

		d3.selectAll("iframe").each(function() {
			if (this.contentDocument)
				documents.push(this.contentDocument);
		});

		documents.forEach(function(document) {
			var newSources = getSources(document);
			// because of prototype on NYT pages
			for (var i = 0; i < newSources.length; i++) {
				SVGSources.push(newSources[i]);
			};
		});

		if (SVGSources.length >= 1) {
			createPopover(SVGSources);
		} else if (SVGSources.length > 0) {
			download(SVGSources[0]);
		} else {
			alert("The Crowbar could not find any SVG nodes.");
		}

		function createPopover(sources) {
			cleanup();

			var drag = d3.behavior.drag().origin(function() {
				var el = d3.select(this);
				return {
					x : el.style("left").replace("px", ""),
					y : el.style("top").replace("px", "")
				};
			}).on("drag", dragmove);

			sources.forEach(function(s1) {
				sources.forEach(function(s2) {
					if (s1 !== s2) {
						if ((Math.abs(s1.top - s2.top) < 38) && (Math.abs(s1.left - s2.left) < 38)) {
							s2.top += 38;
							s2.left += 38;
						}
					}
				});
			});
			var body = d3.select("body");

			var buttons = body.append("div").attr("class", "svg-crowbar").style("z-index", 1e7).style("position", "absolute").style("top", 0).style("left", 0);

			var button = buttons.selectAll(".crowbar-button").data(sources).enter().append("div").attr("class", "crowbar-button").style("position", "absolute").style("top", function(d) {
				return (d.top + document.body.scrollTop) + "px";
			}).style("left", function(d) {
				return (document.body.scrollLeft + d.left) + "px";
			}).style("padding", "4px").style("border-radius", "3px").style("color", "white").style("text-align", "center").style("font-family", "'Helvetica Neue'").style("background", "rgba(0, 0, 0, 0.8)").style("box-shadow", "0px 4px 18px rgba(0, 0, 0, 0.4)").style("cursor", "move").text(function(d, i) {
				return "SVG #" + i + ": " + (d.id ? "#" + d.id : "") + (d.class ? "." + d.class : "");
			}).append("button").style("width", "150px").style("font-size", "12px").style("line-height", "1.4em").style("margin", "5px 0 0 0").text("Download").on("click", function(d, i) {
				d3.event.preventDefault();
				returnHTMLTable(d);
				//download(d);
			});

			buttons.selectAll(".crowbar-button").call(drag);

			var html = body.append("div").attr("class", "svg-crowbar").style("background", "rgba(255, 255, 255, 0.7)").style("position", "fixed").style("left", 0).style("top", 0).style("width", "100%").style("height", "100%");

			function dragmove(d) {
				d3.select(this).style("left", d3.event.x + "px").style("top", d3.event.y + "px");
			}

		}

		function cleanup() {
			d3.selectAll(".svg-crowbar").remove();
		}

		function getSources(doc) {
			var svgInfo = [], svgs = d3.select(doc).selectAll("table");

			//styles = (styles === undefined) ? "" : styles;

			svgs.each(function() {
				var svg = d3.select(this);
				var source = svg.node();
				svgInfo.push(source);
			});

			return svgInfo;
		}
		
		function returnHTMLTable(source)
		{
			//page.sendMessage({msg: 'HTMLTable_captured',svg:'hello'});
			page.sendMessage({msg: 'HTMLTable_captured',svg:source.outerHTML});
			//alert("send message  to background");
			cleanup();
		}

		function download(source) {
			var filename = "untitled";

			if (source.id) {
				filename = source.id;
			} else if (source.class) {
				filename = source.class;
			} else if (window.document.title) {
				filename = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
			}

			var url = window.URL.createObjectURL(new Blob(source.source, {
				"type" : "text\/xml"
			}));

			var a = d3.select("body").append('a').attr("class", "svg-crowbar").attr("download", filename + ".svg").attr("href", url).style("display", "none");

			a.node().click();

			setTimeout(function() {
				window.URL.revokeObjectURL(url);
			}, 10);
		}

		

	}
};

