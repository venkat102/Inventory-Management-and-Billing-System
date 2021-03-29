# Copyright (c) 2013, Venkatesh and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from datetime import datetime

def execute(filters=None):
	columns, data = [], []
	if filters.from_date and filters.to_date:
		columns = [
		{
			"fieldname": "Date",
			"fieldtype": "Date",
			"label": "Date",
			"width": 100
		},
		{
			"fieldname": "invoice_type",
			"fieldtype": "Data",
			"label": "Invoice Type",
			"width": 100
		},
		{
			"fieldname": "entry_name",
			"fieldtype": "Data",
			"label": "Entry Name",
			"width": 100
		},
		{
			"fieldname": "amount",
			"fieldtype": "data",
			"label": "Amount",
			"width": 100
		}
		]
		data = get_data(filters)
	return columns, data
def get_data(filters):
	to_date = datetime.strptime(filters.to_date, "%Y-%m-%d").date()
	from_date = datetime.strptime(filters.from_date, "%Y-%m-%d").date()
	return frappe.db.sql('''select date, invoice_type, name, total_amount from `tabStock Ledger` where date>=%s and date<=%s order by date desc''',(from_date, to_date))