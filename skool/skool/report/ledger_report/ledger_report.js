// Copyright (c) 2016, Venkatesh and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Ledger Report"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"fieldtype": "Date",
			"label": "From Date"
		},
		{
			"fieldname": "to_date",
			"fieldtype": "Date",
			"label": "To Date"
		}
	]
};
