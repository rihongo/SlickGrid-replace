(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "CellExternalCopyManager": CellExternalCopyManager
    }
  });


  function CellExternalCopyManager(options) {
    /*
      This manager enables users to copy/paste data from/to an external Spreadsheet application
      such as MS-Excel® or OpenOffice-Spreadsheet.
      
      Since it is not possible to access directly the clipboard in javascript, the plugin uses
      a trick to do it's job. After detecting the keystroke, we dynamically create a textarea
      where the browser copies/pastes the serialized data. 
      
      options:
        copiedCellStyle : sets the css className used for copied cells. default : "copied"
        copiedCellStyleLayerKey : sets the layer key for setting css values of copied cells. default : "copy-manager"
        dataItemColumnValueExtractor : option to specify a custom column value extractor function
        dataItemColumnValueSetter : option to specify a custom column value setter function
        clipboardCommandHandler : option to specify a custom handler for paste actions
        includeHeaderWhenCopying : set to true and the plugin will take the name property from each column (which is usually what appears in your header) and put that as the first row of the text that's copied to the clipboard
        bodyElement: option to specify a custom DOM element which to will be added the hidden textbox. It's useful if the grid is inside a modal dialog.
    */
    var _grid;
    var _self = this;
    var _copiedRanges;
    var _options = options || {};
    var _copiedCellStyleLayerKey = _options.copiedCellStyleLayerKey || "copy-manager";
    var _copiedCellStyle = _options.copiedCellStyle || "copied";
    var _clearCopyTI = 0;
    var _bodyElement = _options.bodyElement || document.body;

    function init(grid) {
      _grid = grid;
      _grid.onKeyDown.subscribe(handleKeyDown);
      
      // we need a cell selection model
      var cellSelectionModel = grid.getSelectionModel();
      if (!cellSelectionModel){
        throw new Error("Selection model is mandatory for this plugin. Please set a selection model on the grid before adding this plugin: grid.setSelectionModel(new Slick.CellSelectionModel())");
      }
      // we give focus on the grid when a selection is done on it.
      // without this, if the user selects a range of cell without giving focus on a particular cell, the grid doesn't get the focus and key stroke handles (ctrl+c) don't work
      cellSelectionModel.onSelectedRangesChanged.subscribe(function(e, args){
        _grid.focus();
      });
    }

    function destroy() {
      _grid.onKeyDown.unsubscribe(handleKeyDown);
    }
    
    function getDataItemValueForColumn(item, columnDef) {
      if (_options.dataItemColumnValueExtractor) {
        return _options.dataItemColumnValueExtractor(item, columnDef);
      }

      var retVal = '';
      // use formatter if available; much faster than editor
      // if (columnDef.formatter) {
      //     return columnDef.formatter(0, 0, item[columnDef.field], columnDef, item);
      // }

      // if a custom getter is not defined, we call serializeValue of the editor to serialize
      // if (columnDef.editor){
      //   var editorArgs = {
      //     'container':$("body"),  // a dummy container
      //     'column':columnDef,
      //     'position':{'top':0, 'left':0}  // a dummy position required by some editors
      //   };
      //   var editor = new columnDef.editor(editorArgs);
      //   editor.loadValue(item);
      //   retVal = editor.serializeValue();
      //   editor.destroy();
      // }
      // else {
        retVal = item[columnDef.field];
      // }

      return retVal;
    }
    
    function setDataItemValueForColumn(item, columnDef, value) {
	  if (_options.dataItemColumnValueSetter) {
        return _options.dataItemColumnValueSetter(item, columnDef, value);
      }

      // if a custom setter is not defined, we call applyValue of the editor to unserialize
      if (columnDef.editor){
        var editorArgs = {
          'container':$("body"),  // a dummy container
          'column':columnDef,
          'position':{'top':0, 'left':0}  // a dummy position required by some editors
        };
        var editor = new columnDef.editor(editorArgs);
        editor.loadValue(item);
        editor.applyValue(item, value);
        editor.destroy();
      }
    }
    
    
    function _createTextBox(innerText){

  	  var ta = document.createElement('textarea');
		  ta.style.position = 'absolute';
          ta.style.left = '-1000px';
          ta.style.top = document.body.scrollTop + 'px';
          ta.value = innerText;

         _bodyElement.appendChild(ta);
         ta.select();
		document.execCommand('copy');
		return ta;
    }

    function _decodeTabularData(_grid, ta){

      var columns = _grid.getColumns(),
           clipText = ta.value,
           clipRows = clipText.split(/[\n\f\r]/),
           clippedRange = [],
           clipRowsLength =  clipRows.length - 1;
      _bodyElement.removeChild(ta);

      if(clipText == "") {
		  clipRowsLength = clipRows.length;
	  }

      for (var i=0; i<clipRowsLength; i++) {
        clippedRange[i] = clipRows[i].split("\t");
	  }
      var selectedCell = _grid.getActiveCell(),
           ranges = _grid.getSelectionModel().getSelectedRanges(),
           selectedRange = ranges && ranges.length ? ranges[0] : null,   // pick only one selection
          activeRow = null,
          activeCell = null;

      if (selectedRange){
        activeRow = selectedRange.fromRow;
        activeCell = selectedRange.fromCell;
      } else if (selectedCell){
        activeRow = selectedCell.row;
        activeCell = selectedCell.cell;
      } else {
        // we don't know where to paste
        return;
      }
      var oneCellToMultiple = false;
      var destH = clippedRange.length;
      var destW = clippedRange.length ? clippedRange[0].length : 0;
      if (clippedRange.length == 1 && clippedRange[0].length == 1 && selectedRange){
        oneCellToMultiple = true;
        destH = selectedRange.toRow - selectedRange.fromRow +1;
        destW = selectedRange.toCell - selectedRange.fromCell +1;
      }

      var availableRows = _grid.getData().length - activeRow;
       var addRows = 0;

	  if(availableRows < destH)
	  {
		var d = _grid.getData();
		for(addRows = 1; addRows <= destH - availableRows; addRows++)
			d.push({});
		_grid.setData(d);
		_grid.render();
	  }

      var clipCommand = {

        isClipboardCommand: true,
        clippedRange: clippedRange,
        oldValues: [],
        cellExternalCopyManager: _self,
        _options: _options,
        setDataItemValueForColumn: setDataItemValueForColumn,
       // markCopySelection: markCopySelection,
        oneCellToMultiple: oneCellToMultiple,
        activeRow: activeRow,
        activeCell: activeCell,
        destH: destH,
        destW: destW,
        desty: activeRow,
        destx: activeCell,
        maxDestY: _grid.getDataLength(),
        maxDestX: _grid.getColumns().length,
        h: 0,
        w: 0,

        execute: function() {

            this.h=0;
			var desty = 0,
                 destx = 0,
                 dt = [],
				editorArgs = {
					'container':$("body"),  // a dummy container
					'column': [],
					'position':{'top':0, 'left':0}  // a dummy position required by some editors
				},
				editor = [],
				updateCell = [];

			 editor = new Slick.Editors.Text(editorArgs);
			for (var y = 0; y < destH; y++){
                this.oldValues[y] = [];
                this.w=0;
                this.h++;

				for (var x = 0; x < destW; x++){
                  this.w++;
                  desty = activeRow + y,
                  destx = activeCell + x;
                  if(destx == 0 ) continue;
                  if (desty < this.maxDestY && destx < this.maxDestX ) {
                    //var nd = _grid.getCellNode(desty, destx);
                    dt = _grid.getDataItem(desty);
					editorArgs.column = columns[destx];
                    this.oldValues[y][x] = dt[columns[destx]['id']];
					 // editor = new editorArgs.column.editor(editorArgs);
					  editor.loadValue(dt);

					if (oneCellToMultiple) {
                     editor.applyValue(dt, clippedRange[0][0]);
            //this.setDataItemValueForColumn(dt, columns[destx], clippedRange[0][0]);
                    } else {
                     editor.applyValue(dt, clippedRange[y] ? clippedRange[y][x] : '');
            //this.setDataItemValueForColumn(dt, columns[destx], clippedRange[y] ? clippedRange[y][x] : '');
                    }
					editor.destroy();
                    _grid.updateCell(desty, destx);
				  }
            	}
			}
          var bRange = {
            'fromCell': activeCell,
            'fromRow': activeRow,
            'toCell': activeCell+this.w-1,
            'toRow': activeRow+this.h-1
          }

        //   this.markCopySelection([bRange]);
        //   _grid.getSelectionModel().setSelectedRanges([bRange]);
			$(".selected").removeClass("invalid");
          this.cellExternalCopyManager.onPasteCells.notify({ranges: [bRange]});

        },

        undo: function() {
          for (var y = 0; y < destH; y++){
            for (var x = 0; x < destW; x++){
              var desty = activeRow + y;
              var destx = activeCell + x;
              
              if (desty < this.maxDestY && destx < this.maxDestX ) {
                var nd = _grid.getCellNode(desty, destx);
                var dt = _grid.getDataItem(desty);
                if (oneCellToMultiple)
                  this.setDataItemValueForColumn(dt, columns[destx], this.oldValues[0][0]);
                else
                  this.setDataItemValueForColumn(dt, columns[destx], this.oldValues[y][x]);
                _grid.updateCell(desty, destx);
              }
            }
          }
          
          var bRange = {
            'fromCell': activeCell,
            'fromRow': activeRow,
            'toCell': activeCell+this.w-1,
            'toRow': activeRow+this.h-1
          }

      //    this.markCopySelection([bRange]);
      //    _grid.getSelectionModel().setSelectedRanges([bRange]);
          this.cellExternalCopyManager.onPasteCells.notify({ranges: [bRange]});
          
          if(addRows > 1){            
            var d = _grid.getData();
            for(; addRows > 1; addRows--)
              d.splice(d.length - 1, 1);
            _grid.setData(d);
            _grid.render();
          }
        }
      };

	  if(_options.clipboardCommandHandler) {
        _options.clipboardCommandHandler(clipCommand);
      } else {
	        clipCommand.execute();
      }
    }
    
    
    function handleKeyDown(e, args) {

            if (!_grid.getEditorLock().isActive() || _grid.getOptions().autoEdit) {
        if (e.which == keyCodes.ESC) {
          if (_copiedRanges) {
            e.preventDefault();
            clearCopySelection();
            _self.onCopyCancelled.notify({ranges: _copiedRanges});
            _copiedRanges = null;
          }
        }
        if (e.which == keyCodes.C && (e.ctrlKey || e.metaKey)) {    // CTRL + C
			copyAction(e);
			return false;
        }

        if (e.which == keyCodes.V && (e.ctrlKey || e.metaKey)) {    // CTRL + V
			var ta = _createTextBox('');
            setTimeout(function(){
                _decodeTabularData(_grid, ta);
            }, 50);
            return false;
        }

		if (e.which == keyCodes.X && (e.ctrlKey || e.metaKey)) {    // CTRL + X
			copyAction(e);
			deleteAction();
			return false;
		}

        if (e.which == keyCodes.A && (e.ctrlKey || e.metaKey)) {    // CTRL + A
			var ranges =  [{fromRow: 0, fromCell: 1, toRow: ROWCOUNT-1, toCell: columns.length-1}],
				selectedRows = [];

			_grid.getSelectionModel().setSelectedRanges(ranges);

			var hash = {};
			for (var i = 0; i < ranges.length; i++) {
				for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
					if (!hash[j]) {  // prevent duplicates
						selectedRows.push(j);
						hash[j] = {};
					}
					for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
						if (_grid.canCellBeSelected(j, k)) {
							hash[j][columns[k].id] = "selected";
						}
					}
				}
			}
			_grid.setCellCssStyles("selected", hash);
			return false;
        }

		if (e.which == keyCodes.DELETE) {    // Delete
			deleteAction();
		    return false;
		}
      }
    }

    function deleteAction() {
		var ta = _createTextBox('');
        setTimeout(function(){
            _decodeTabularData(_grid, ta);
        }, 50);
	}

    function copyAction(e) {
        var ranges = _grid.getSelectionModel().getSelectedRanges();
        if (ranges.length != 0) {
            _copiedRanges = ranges;
           // markCopySelection(ranges);
            _self.onCopyCells.notify({ranges: ranges});
            var columns = _grid.getColumns();
            var clipText = "";
            for (var rg = 0; rg < ranges.length; rg++){
                var range = ranges[rg],
                    clipTextRows = [];

				for (var i=range.fromRow; i< range.toRow+1 ; i++){
                    var clipTextCells = [],
                        dt = _grid.getDataItem(i);
                    // if (clipText == "" && _options.includeHeaderWhenCopying) {
                    //     var clipTextHeaders = [];
                    //     for (var j = range.fromCell; j < range.toCell + 1 ; j++) {
                    //         if (columns[j].name.length > 0)
                    //             clipTextHeaders.push(columns[j].name);
                    //     }
                    //     clipTextRows.push(clipTextHeaders.join("\t"));
                    // }
                    for (var j=range.fromCell; j< range.toCell+1 ; j++){
                        // clipTextCells.push(getDataItemValueForColumn(dt, columns[j]));
						clipTextCells.push(dt[columns[j].field]);
					}

                    clipTextRows.push(clipTextCells.join("\t"));

				}
                clipText += clipTextRows.join("\r\n") + "\r\n";
            }
			//var $focus = $(_grid.getActiveCellNode());
			var ta = _createTextBox(clipText);
			_bodyElement.removeChild(ta);
			// ta.focus();
            // setTimeout(function(){
            //     _bodyElement.removeChild(ta);
            //     // restore focus
            //     if ($focus && $focus.length>0) {
            //         $focus.attr('tabIndex', '-1');
            //         $focus.focus();
            //         $focus.removeAttr('tabIndex');
            //     }
            // }, 50);


		}
    }

    // function markCopySelection(ranges) {
    //   clearCopySelection();
	//
    //   var columns = _grid.getColumns();
    //   var hash = {};
    //   for (var i = 0; i < ranges.length; i++) {
    //     for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
    //       hash[j] = {};
    //       for (var k = ranges[i].fromCell; k <= ranges[i].toCell && k<columns.length; k++) {
    //         hash[j][columns[k].id] = _copiedCellStyle;
    //       }
    //     }
    //   }
    //   _grid.setCellCssStyles(_copiedCellStyleLayerKey, hash);
    //   clearTimeout(_clearCopyTI);
    //   _clearCopyTI = setTimeout(function(){
    //     _self.clearCopySelection();
    //   }, 50);
    // }

    function clearCopySelection() {
      _grid.removeCellCssStyles(_copiedCellStyleLayerKey);
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy,
      "clearCopySelection": clearCopySelection,
      "handleKeyDown":handleKeyDown,
      "onCopyCells": new Slick.Event(),
      "onCopyCancelled": new Slick.Event(),
      "onPasteCells": new Slick.Event()
    });
  }
})(jQuery);
