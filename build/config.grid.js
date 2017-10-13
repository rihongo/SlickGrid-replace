/**
 * Created by rihongo on 2017-08-23.
 */

var ROWCOUNT = 20;
var PLUGINPATH = "build/plugins";
var IMAGEPATH = "build/images";

var columns = [];

function dataInit(rowCount) {
	columns = [
		{
			id: "selector",
			name: "",
			field: "num",
			width: 50
		},
		{
			id: "name",
			name: "이름",
			field: "field1",
			width: 70,
			editor: Slick.Editors.Text,
		},
		{
			id: "phone",
			name: "전화번호",
			field: "field2",
			width: 120,
			editor: Slick.Editors.Text,
			validator : Slick.Editors.phoneNumberValidator
		},
		{
			id: "message",
			name: "메시지 입력",
			field: "field3",
			width: 415,
			editor: Slick.Editors.Text,
		}

	];

	for (var i = 0; i < rowCount; i++) {
		data[i] = {
			id: "id_" + i,
			num: i + 1,
			field1: '',
			field2: '',
			field3: '',
		};
	}
}

function dataSet(excel) {

	data = [];
	for (var i = 0; i < ROWCOUNT ; i++ ) {
		if( excel[i] == null || excel[i] == undefined ) {
			data[i] = {
				id: "id_" + i,
				num: i + 1,
				field1: "",
				field2: "",
				field3: ""
			};
		} else {
			data[i] = {
				id: "id_" + i,
				num: i + 1,
				field1: excel[i][0] == undefined ? "" : excel[i][0],
				field2: excel[i][1] == undefined ? "" : excel[i][1],
				field3: excel[i][2] == undefined ? "" : excel[i][2],
			};
		}
	}
	repaint();
}

