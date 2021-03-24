# Copyright (c) 2013, Venkatesh and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from datetime import datetime

def execute(filters=None):
	columns, data = [], []
	columns = [
		{
			"fieldname": "sold_item",
			"fieldtype": "Link",
			"options": "Item",
			"label": "Sold Item",
			"width": 100
		},
		{
			"fieldname": "no_of_items",
			"fieldtype": "data",
			"label": "No of Items",
			"width": 100
		},
		{
			"fieldname": "sold_amount",
			"fieldtype": "data",
			"label": "Sold Amount",
			"width": 100
		}
	]
	if filters.from_date and filters.to_date:
		data = get_data(filters)
	return columns, data

def get_data(filters):
	to_date = datetime.strptime(filters.to_date, "%Y-%m-%d")
	from_date = datetime.strptime(filters.from_date, "%Y-%m-%d")
	return frappe.db.sql('''select item_name, qty, amount from `tabSales Invoice Item` where creation>=%s and creation<=%s group by item_name order by qty desc''',(from_date, to_date))