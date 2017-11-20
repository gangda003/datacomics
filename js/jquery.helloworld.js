(function(jQuery) {
  'use strict';

    jQuery.fn.helloWorld = function(opts) {

        // Future home of "Hello, World!"
       // window.alert("inside helloworld");
        
    	//alert(jQuery);

    // Set options
    var defaults = {
      ignoreColumns: [],
      onlyColumns: null,
      ignoreHiddenRows: true,
      ignoreEmptyRows: false,
      headings: null,
      allowHTML: false,
      includeRowId: false,
      textDataOverride: 'data-override',
      textExtractor: null
    };
    opts = jQuery.extend(defaults, opts);

    var notNull = function(value) {
      return value !== undefined && value !== null;
    };

    var ignoredColumn = function(index) {
      if( notNull(opts.onlyColumns) ) {
        return jQuery.inArray(index, opts.onlyColumns) === -1;
      }
      return jQuery.inArray(index, opts.ignoreColumns) !== -1;
    };

    var arraysToHash = function(keys, values) {
      var result = {}, index = 0;
      jQuery.each(values, function(i, value) {
        // when ignoring columns, the header option still starts
        // with the first defined column
        if ( index < keys.length && notNull(value) ) {
          result[ keys[index] ] = value;
          index++;
        }
      });
      return result;
    };

    var cellValues = function(cellIndex, cell, isHeader) {
      var jQuerycell = jQuery(cell),
        // textExtractor
        extractor = opts.textExtractor,
        override = jQuerycell.attr(opts.textDataOverride);
      // don't use extractor for header cells
      if ( extractor === null || isHeader ) {
        return jQuery.trim( override || ( opts.allowHTML ? jQuerycell.html() : cell.textContent || jQuerycell.text() ) || '' );
      } else {
        // overall extractor function
        if ( jQuery.isFunction(extractor) ) {
          return jQuery.trim( override || extractor(cellIndex, jQuerycell) );
        } else if ( typeof extractor === 'object' && jQuery.isFunction( extractor[cellIndex] ) ) {
          return jQuery.trim( override || extractor[cellIndex](cellIndex, jQuerycell) );
        }
      }
      // fallback
      return jQuery.trim( override || ( opts.allowHTML ? jQuerycell.html() : cell.textContent || jQuerycell.text() ) || '' );
    };

    var rowValues = function(row, isHeader) {
      var result = [];
      var includeRowId = opts.includeRowId;
      var useRowId = (typeof includeRowId === 'boolean') ? includeRowId : (typeof includeRowId === 'string') ? true : false;
      var rowIdName = (typeof includeRowId === 'string') === true ? includeRowId : 'rowId';
      if (useRowId) {
        if (typeof jQuery(row).attr('id') === 'undefined') {
          result.push(rowIdName);
        }
      }
      jQuery(row).children('td,th').each(function(cellIndex, cell) {
        result.push( cellValues(cellIndex, cell, isHeader) );
      });
      return result;
    };

    var getHeadings = function(table) {
      var firstRow = table.find('tr:first').first();
      return notNull(opts.headings) ? opts.headings : rowValues(firstRow, true);
    };

    var construct = function(table, headings) {
      var i, j, len, len2, txt, jQueryrow, jQuerycell,
        tmpArray = [], cellIndex = 0, result = [];
      window.alert("tr "+table.children('tbody,*').children('tr')[2]);
      
      table.children('tbody,*').children('tr').each(function(rowIndex, row) {
        if( rowIndex > 0 || notNull(opts.headings) ) {
          var includeRowId = opts.includeRowId;
          var useRowId = (typeof includeRowId === 'boolean') ? includeRowId : (typeof includeRowId === 'string') ? true : false;

          jQueryrow = jQuery(row);
          //window.alert("jQureyrow outside if brackets "+jQueryrow.html());

          var isEmpty = (jQueryrow.find('td').length === jQueryrow.find('td:empty').length) ? true : false;
		  //window.alert(jQueryrow.html());
		  //window.alert( jQueryrow.is(':visible') +" "+!opts.ignoreHiddenRows );//|| !opts.ignoreHiddenRows ));//+" "
          //if( ( jQueryrow.is(':visible') || !opts.ignoreHiddenRows ) && ( !isEmpty || !opts.ignoreEmptyRows ) && ( !jQueryrow.data('ignore') || jQueryrow.data('ignore') === 'false' ) ) {
          if( ( !isEmpty || !opts.ignoreEmptyRows ) && ( !jQueryrow.data('ignore') || jQueryrow.data('ignore') === 'false' ) ) {
            cellIndex = 0;
            //window.alert("cellIndex"+cellIndex);
            if (!tmpArray[rowIndex]) {
              tmpArray[rowIndex] = [];
            }
            if (useRowId) {
              cellIndex = cellIndex + 1;
              if (typeof jQueryrow.attr('id') !== 'undefined') {
              	//window.alert(jQueryrow.attr('id'));
                tmpArray[rowIndex].push(jQueryrow.attr('id'));
              } else {
                tmpArray[rowIndex].push('');
              }
            }
            //window.alert(jQueryrow.html());

            jQueryrow.children().each(function(){
              jQuerycell = jQuery(this);
              // skip column if already defined
              while (tmpArray[rowIndex][cellIndex]) { cellIndex++; }

              // process rowspans
              if (jQuerycell.filter('[rowspan]').length) {
                len = parseInt( jQuerycell.attr('rowspan'), 10) - 1;
                txt = cellValues(cellIndex, jQuerycell);
                for (i = 1; i <= len; i++) {
                  if (!tmpArray[rowIndex + i]) { tmpArray[rowIndex + i] = []; }
                  tmpArray[rowIndex + i][cellIndex] = txt;
                }
              }
              // process colspans
              if (jQuerycell.filter('[colspan]').length) {
                len = parseInt( jQuerycell.attr('colspan'), 10) - 1;
                txt = cellValues(cellIndex, jQuerycell);
                for (i = 1; i <= len; i++) {
                  // cell has both col and row spans
                  if (jQuerycell.filter('[rowspan]').length) {
                    len2 = parseInt( jQuerycell.attr('rowspan'), 10);
                    for (j = 0; j < len2; j++) {
                      tmpArray[rowIndex + j][cellIndex + i] = txt;
                    }
                  } else {
                    tmpArray[rowIndex][cellIndex + i] = txt;
                  }
                }
              }

              txt = tmpArray[rowIndex][cellIndex] || cellValues(cellIndex, jQuerycell);
              if (notNull(txt)) {
                tmpArray[rowIndex][cellIndex] = txt;
              }
              cellIndex++;
            });
          }
        }
      });
      
      
      window.alert("tempArray "+tmpArray);
      jQuery.each(tmpArray, function( i, row ){
        if (notNull(row)) {
          // remove ignoredColumns / add onlyColumns
          var newRow = notNull(opts.onlyColumns) || opts.ignoreColumns.length ?
            jQuery.grep(row, function(v, index){ return !ignoredColumn(index); }) : row,

            // remove ignoredColumns / add onlyColumns if headings is not defined
            newHeadings = notNull(opts.headings) ? headings :
              jQuery.grep(headings, function(v, index){ return !ignoredColumn(index); });

          txt = arraysToHash(newHeadings, newRow);
          result[result.length] = txt;
        }
      });
      return result;
    };

    // Run
    var headings = getHeadings(this);
    //window.alert(this);
    //window.alert("headings"+headings[0]);
    //window.alert("this" +this.html());
    var result = construct(this, headings);
    //window.alert("result "+result);
    return result;
   // return construct(this, headings);

    };

}(jQuery));