/**************************************************************************
 Title       :   Export to Excel
 Description :   Jquery Plugin for Exporting Slick Grid to Excel
 Author      :   Ranjithprabhu K
 Version     :   1.0.0
 *****************************************************************************/


(function ($) {

	$.exportToExcel = function (fileName,sheetName, data, options, afterExportCallback) {

		//actual data to be imported to excel
		var excelData = data;

		//store the base 64 content to be returned
		var returnValue;
		require(['excel-builder'], function (EB, downloader) {

			//new excel workbook created
			var newWorkbook = EB.createWorkbook();

			//new worksheet created in the already created newWorsheet
			var newWorksheet = newWorkbook.createWorksheet({ name: sheetName });

			//new stylesheet for adding styles to the newworkbook
			var stylesheet = newWorkbook.getStyleSheet();


			//styles array to store header and cell styles
			var styles = new Array();

			//if header style is defined by the user, then use that styles
			if (options && options.headerStyle)
				styles["headerstyle"] = stylesheet.createFormat(options.headerStyle);

			//else use default styles
			else {
				styles["headerstyle"] = stylesheet.createFormat({
					font: {
						bold: true,
						size: 10,
						color: '00000000'
					}
				});
			}

			//if cell style is defined by the user, then use that styles
			if (options && options.cellStyles)
				styles["cellstyles"] = stylesheet.createFormat(options.cellStyle);

			//else use default styles
			else {
				styles["cellstyles"] = stylesheet.createFormat({
					font: {
						bold: false,
						size: 10,
						color: '00000000'
					}
				});
			}



			//Write the headers of the slick grid values into excel
			function writeHeaders() {
				var headers = options.headers;
				newWorksheet.data.push(headers);
			};

			//write the cell values of each rows in to the excel
			function writeCell() {

				//get each row data
				for (var i = 0; i < excelData.length; i++) {

					var rowData = [];
					//get each cell value of the row and store it in
					for (var key in excelData[i]) {
						if (key == 'id') continue;
						rowData.push({ value: excelData[i][key], metadata: { style: styles["cellstyles"].id } });
					}
					//push the row data in to the excel
					newWorksheet.data.push(rowData);
				}
			};

			//iniate the write Excel function
			writeHeaders();
			writeCell();

			//set column width for each column in excel
			newWorksheet.setColumns(excelOptions.columns);

			//downloader method to add the excel file as base 64
			var downloader = function (filename, value) {
				console.log(value);
				var downloadLink = document.createElement("a");
				downloadLink.setAttribute('href','data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + value);
				downloadLink.setAttribute('download',filename);
				downloadLink.click();
			};

			//add the created worksheet to the new workbook
			newWorkbook.addWorksheet(newWorksheet);

			//create the excel file
			var data = EB.createFile(newWorkbook);

			//call the downloader method with the parameteres, 1.Name of the Excel file to be downloaded, 2.Created Excel File
			downloader(fileName, data);

			//iniate the callback function
			if (afterExportCallback)
				afterExportCallback(returnValue);
		});
	};
}(jQuery));