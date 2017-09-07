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
		fileupload.setFlashRuntimePath('js/plugins/Moxie.swf');

		var fileInput = new mOxie.FileInput({
			runtimes: 'flash',
			accept: '[]',
			browse_button: "uploadExcel",
			//multiple: true
		});

		fileInput.onchange = function () {
			var file = fileInput.files[0];

			var reader = new mOxie.FileReader();

			reader.onload = function () {
				var data = reader.result;

				workbook = XLSX.read(data, {type: 'binary'});
				workbook.SheetNames.forEach(function(item, index, array) {

					//var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]);
					//var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
					var json = XLSX.utils.sheet_to_json(workbook.Sheets[item], {header:1});
					//var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);

					//console.log(csv);
					//console.log(json);
					dataSet(json);
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
		//$.exportToExcel(excelOptions.filename, "Report", dataView.getItems(), excelOptions);
		//doit('xlsx');
		con
		//console.log( wbout);
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
		$.event.trigger({ type : 'keydown', which :  keyCodes.C, ctrlKey : true });
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
		$.event.trigger({ type : 'keydown', which :  keyCodes.X, ctrlKey: true });
	});

	$( "#delete" ).on( "click", function() {
		$.event.trigger({ type : 'keydown', which :  keyCodes.DELETE });
	});

}

function doit(type) {
	return export_table_to_excel('myGrid', type || 'xlsx', data);
}

function export_table_to_excel(id, type) {
 	var wb = XLSX.utils.table_to_book(document.getElementById(id), {sheet:"Sheet JS"});
 console.log(wb);
//	var ws = XLSX.utils.aoa_to_sheet(data);
//	console.log(ws);

	var wbout = XLSX.write(ws, {bookType:type, bookSST:true, type: 'binary'});
	var fname = 'test.' + type;
	var bl = new Blob([s2ab(wbout)],{type:"application/octet-stream"});
	try {
		saveAs(bl, fname);
		console.log('save As');
	} catch(e) {
		if(typeof console != 'undefined') console.log(e, wbout);
	}
	return wbout;
}

function dataSet(excel) {

	data = [];
	for (var i = 0; i < ROWCOUNT ; i++ ) {
		if( excel[i] == null || excel[i] == 'undefined' ) {
			data[i] = {
				id: "id_" + i,
				num: i + 1,
				name: "",
				phone: "",
				message: ""
			};
		} else {
			data[i] = {
				id: "id_" + i,
				num: i + 1,
				name: excel[i][0],
				phone: excel[i][1],
				message: excel[i][2]
			};
		}
	}
	grid.invalidateAllRows();
	dataView.setItems(data);
	grid.render();
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
	if(typeof ArrayBuffer !== 'undefined') {
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