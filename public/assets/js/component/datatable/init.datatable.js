"use strict"; var dataTableDemo = { init: function () { var a; 0 !== (a = $("#datatable")).length && a.DataTable({ order: [[3, "desc"]] }) } }; $(document).ready(function () { dataTableDemo.init() });
//# sourceMappingURL=init.datatable.js.map
