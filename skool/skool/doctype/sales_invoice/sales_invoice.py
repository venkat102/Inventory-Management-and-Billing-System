# -*- coding: utf-8 -*-
# Copyright (c) 2021, Venkatesh and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

@frappe.whitelist()
def get_data(invoice):
	return [frappe.db.get_value("Sales Invoice", {'name':invoice}, ['amount', 'discount', 'total_amount']), frappe.db.get_list("Sales Invoice Item", {'parent':invoice}, ['item_code', 'item_name', 'qty', 'rate', 'amount'])]

@frappe.whitelist()
def check_returned(invoice):
	return frappe.db.exists("Sales Invoice", invoice+'-Returned')

@frappe.whitelist()
def check_qty(item):
	return frappe.db.sql('''SELECT qty FROM `tabItem` WHERE item_code=%s''', item)[0][0]

@frappe.whitelist()
def get_stock(item):
	itm_det = frappe.db.sql('''SELECT item_name, qty FROM `tabItem` WHERE item_code=%s''', item)[0]
	tab = f'''<table>
				<tr>
				<td style='width:40%;'>Item Code&emsp;&emsp;&emsp;&emsp;</td><td style='width:30%;'>Item Name&emsp;&emsp;&emsp;&emsp;&emsp;</td><td style='width:30%;'>Stock	</td>
				</tr>
				<tr>
				<td style='width:40%;'>{item}&emsp;&emsp;&emsp;&emsp;</td><td style='width:30%;'>{itm_det[0]}&emsp;&emsp;&emsp;&emsp;&emsp;</td><td style='width:30%;'>{itm_det[1]}</td>
				</tr>
			</table>'''
	return tab

class SalesInvoice(Document):
	def autoname(self):
		if self.invoice_no:
			self.name = self.invoice_no+'-Returned-'+str(frappe.db.sql('''select count(name)+1 from `tabSales Invoice` where parent = %s or invoice_no=%s''', (self.invoice_no, self.invoice_no))[0][0])
	def before_save(self):
		for i in range(len(self.items)):
			stock_qty = check_qty(self.items[i].item_code)
			if int(self.items[i].qty) > int(stock_qty):
				self.items[i].qty = stock_qty	
				
		if self.is_return:
			if 'Returned' in self.invoice_no:
				frappe.throw("Can not return a returned invoice")
			if frappe.db.exists("Sales Invoice", {'invoice_no':self.invoice_no}):
				si = frappe.db.get_list("Sales Invoice Item", {'parent':self.invoice_no, 'name':["not like", '-Returned']}, ['item_code', 'item_name', 'qty', 'rate', 'amount'])
				dict = {}
				for i in si:
					dict[i.item_code] = float(i.qty)
				for i in frappe.db.get_list("Sales Invoice", {'invoice_no': self.invoice_no}, ['name']):
					re = frappe.db.get_list("Sales Invoice Item", {'parent':i.name}, ['item_code', 'item_name', 'qty', 'rate', 'amount'])
					for i in re:
						dict[i.item_code] = dict[i.item_code] - float(i.qty)
				print(si, re)
				for i in self.items:
					if i.qty > dict[i.item_code]:
						frappe.throw(i.item_name+" has only "+str(dict[i.item_code])+" left for this invoice")
		new_doc = frappe.new_doc("Stock Ledger")
		new_doc.invoice_no = self.name
		new_doc.date = self.date
		new_doc.invoice_type = 'Sales'
		new_doc.amount = self.amount
		new_doc.discount = self.discount
		new_doc.total_amount = self.total_amount
		for i in self.items:
			new_row = new_doc.append("items", {})
			new_row.item_code = i.item_code
			new_row.item_name = i.item_name
			new_row.qty = i.qty
			new_row.rate = i.rate
			new_doc.amount = i.amount
		new_doc.save()
		self.stock = None
		if 'Returned' in self.name:
			for item in self.items:
				doc = frappe.get_doc("Item", item.item_code)
				doc.qty = int(doc.qty) + int(item.qty)
				doc.save()
		else:
			for item in self.items:
				doc = frappe.get_doc("Item", item.item_code)
				doc.qty = int(doc.qty) - int(item.qty)
				doc.save()
		self.stock = None