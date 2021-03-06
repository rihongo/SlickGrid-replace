var data = [],
	grid = null,
	options = {
		enableCellNavigation: true,
		asyncEditorLoading: true,
		explicitInitialization: true,
		editable: true,
		enableAddRow: false,
		forceFitColumns: true,
		enableColumnReorder: false
	},
	dataView = null,
	keyCodes = {
		'A':65,
		'C':67,
		'V':86,
		'X':88,
		'ESC':27,
		'DELETE':46
	},
	selectionModel,
	cellExternalCopyManager;

$(function () {
	dataInit(ROWCOUNT);
	eventListener();
	makegrid();
	dataExport();
});

function makegrid() {
	dataView = new Slick.Data.DataView();
	grid = new Slick.Grid("#myGrid", dataView, columns, options);
	selectionModel = new Slick.CellSelectionModel();
	grid.setSelectionModel(selectionModel);

	grid.getCanvasNode().focus();
	cellExternalCopyManager = new Slick.CellExternalCopyManager();

	grid.registerPlugin(cellExternalCopyManager);

	dataView.beginUpdate();
	dataView.setItems(data);
	dataView.endUpdate();

	grid.init();
}

function eventListener(){

	if(check_IE () == false) {
		var input_dom_element = document.getElementById('uploadExcel');

		if(input_dom_element.addEventListener) {
			var excel_parse = new ExcelParse;
			input_dom_element.addEventListener('change', excel_parse.handleFile, false);
		}
	} else {
		tableau('downloadExcel', 'xportxlsx', 'xlsx');

		fileupload.setFlashRuntimePath( PLUGINPATH + '/Moxie.swf');

		var fileInput = new mOxie.FileInput({
			runtimes: 'flash',
			accept: '[]',
			browse_button: "uploadExcel",
		});

		fileInput.onchange = function () {
			var file = fileInput.files[0];

			var reader = new mOxie.FileReader();

			reader.onload = function () {
				var data = reader.result;
				console.log(data);
				workbook = XLSX.read(data, {type: 'binary'});
				workbook.SheetNames.forEach(function(item, index, array) {

					//var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]);
					//var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item], {header:1});
					//var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);

					if(json.length > ROWCOUNT) {
						alert( ROWCOUNT + '건이 넘는 파일은 불러올 수 없습니다.');
						return;
					} else {
						dataSet(json);
					}

				});
			};

			reader.onerror = function () {
				console.log("read as binary failed");
			};

			reader.readAsBinaryString(file);
			// console.info(reader.readAsText(file));
			// console.info(reader.readAsDataURL(file));

		}
		fileInput.init();

	}

	$('#myGrid').on('blur.editorFocusLost', 'input.editor-text', function() {
		window.setTimeout(function() {
			var focusedEditor = $("#myGrid :focus");
			if (focusedEditor.length == 0 && Slick.GlobalEditorLock.isActive()) {
				Slick.GlobalEditorLock.commitCurrentEdit();
			}
		});
	});

	$( "#downloadExcel" ).on( "click", function() {
		var data = JSON.parse(JSON.stringify( dataView.getItems() ));
		export_table_to_excel(get_exceldata(data), 'xlsx');
	});

	$( "#selectAll" ).on( "click", function() {
		var ranges =  [{fromRow: 0, fromCell: 1, toRow: ROWCOUNT-1, toCell: columns.length-1}],
			selectedRows = [];

		selectionModel.setSelectedRanges(ranges);

		var hash = {};
		for (var i = 0; i < ranges.length; i++) {
			for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
				if (!hash[j]) {  // prevent duplicates
					selectedRows.push(j);
					hash[j] = {};
				}
				for (var k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
					if (grid.canCellBeSelected(j, k)) {
						hash[j][columns[k].id] = options.selectedCellCssClass;
					}
				}
			}
		}
		grid.setCellCssStyles(options.selectedCellCssClass, hash);
	});

	$( "#copy" ).on( "click", function() {
		var e = jQuery.Event("keydown", { which :  keyCodes.C, ctrlKey : true  });
		cellExternalCopyManager.handleKeyDown(e);
	});

	$( "#deleteAll" ).on( "click", function() {
		var sure= confirm("전체삭제 하시겠습니까?");
		if(sure) {
			dataInit(ROWCOUNT);
			grid.invalidateAllRows();
			dataView.setItems(data);
			grid.render();
		}
	});

	$( "#cutOff" ).on( "click", function() {
		var e = jQuery.Event("keydown", { which :  keyCodes.X, ctrlKey : true  });
		cellExternalCopyManager.handleKeyDown(e);
		//$.event.trigger({ type : 'keydown', which :  keyCodes.X, ctrlKey: true });
	});

	$( "#delete" ).on( "click", function() {
		var e = jQuery.Event("keydown", { which :  keyCodes.DELETE, ctrlKey : true  });
		cellExternalCopyManager.handleKeyDown(e);
		//$.event.trigger({ type : 'keydown', which :  keyCodes.DELETE });
	});

}

function es5_rename(obj, old_name, new_name) {
	if (old_name !== new_name) {
		Object.defineProperty(obj, new_name,
			Object.getOwnPropertyDescriptor(obj, old_name));
		delete obj[old_name];
	}
};

function oldskool_rename(obj, old_name, new_name) {
	if (obj.hasOwnProperty(old_name)) {
		obj[new_name] = obj[old_name];
		delete obj[old_name];
	}
};

function get_exceldata(data) {
	var dataLeng =  data.length,
		columnsLeng = columns.length;

	if(check_IE () == false) {
		for (var j = 0; j < dataLeng; j++) {
			for(var i = 1; i < columnsLeng; i++) {
				es5_rename(data[j], 'field' + i, columns[i].name);
			}
			delete data[j]['id'];
			delete data[j]['num'];
		}
	} else {
		for (var j = 0; j < data.length; j++) {
			for(var i = 1; i < columnsLeng; i++) {
				oldskool_rename(data[j], 'field' + i, columns[i].name);
			}
			delete data[j]['id'];
			delete data[j]['num'];
		}
	}


	return data;
};

function tableau(pid, iid, fmt, ofile) {
	Downloadify.create(pid,{
		swf: PLUGINPATH + '/downloadify.swf',
		downloadImage: IMAGEPATH +'/download.png',
		width: 100,
		height: 30,
		filename: "message.xlsx",
		data: function() {
			var data = JSON.parse(JSON.stringify( dataView.getItems()));
			var o = export_table_to_excel(get_exceldata(data), 'xlsx');
			return window.btoa(o);
		},
		transparent: false,
		append: false,
		dataType: 'base64',
		onComplete: function(){ console.log('Your File Has Been Saved!'); },
		onCancel: function(){ console.log('You have cancelled the saving of this file.'); },
		onError: function(){ console.log('You must put something in the File Contents or there will be nothing to save!'); }
	});
}
function export_table_to_excel(data, type) {
	var ws = aoa_to_workbook(data,{header: false});
	var wbout = XLSX.write(ws, {bookType:type, bookSST:false, type: 'binary'});
	var fname = 'message.' + type;
	var bl = new Blob([s2ab(wbout)],{type:"application/octet-stream"});

	try {
		saveAs(bl, fname);
	} catch(e) {
		if(typeof console != 'undefined') console.log(e, wbout);
	}
	return wbout;

}

function aoa_to_workbook(data/*:Array<Array<any> >*/, opts)/*:Workbook*/ {
	return sheet_to_workbook(XLSX.utils.json_to_sheet(data, opts), opts);
}

function sheet_to_workbook(sheet/*:Worksheet*/, opts)/*:Workbook*/ {
	var n = opts && opts.sheet ? opts.sheet : "Sheet1";
	var sheets = {}; sheets[n] = sheet;
	return { SheetNames: [n], Sheets: sheets };
}

function dataExport(){
	return dataView.getItems();
}

function check_IE () {
	var agent = navigator.userAgent.toLowerCase();

	// IE old version ( IE 10 or Lower )
	if ( navigator.appName == "Microsoft Internet Explorer" ) return true;

	else {
		// IE 11
		if ( agent.search( "trident" ) > -1 ) return false;

		// Microsoft Edge
		else if ( agent.search( "edge/" ) > -1 )  return false;

		// 그외, IE가 아니라면 ( If it's not IE or Edge )
		else return false;
	}
}

function s2ab(s) {
	if(typeof ArrayBuffer !== 'undefined' && check_IE () == false) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	} else {
		var buf = new Array(s.length);
		for (var i=0; i!=s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}
}

function repaint() {
	grid.invalidateAllRows();
	dataView.setItems(data);
	grid.render();
}

