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
class SalesInvoice(Document):
	def autoname(self):
		if self.invoice_no:
			self.name = self.invoice_no+'-Returned'
	def before_save(self):
		if self.is_return:
			if 'Returned' in self.invoice_no:
				frappe.throw("Can not return a returned invoice")
			if frappe.db.exists("Sales Invoice", self.invoice_no+'-Returned'):
				frappe.throw("Invoice is already returned");
		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print(self.name, self.amount, self.discount, self.total_amount)
		new_doc = frappe.new_doc("Stock Ledger")
		new_doc.invoice_no = self.name
		new_doc.invoice_type = 'Sales Invoice'
		new_doc.amount = self.amount
		new_doc.discount = self.discount
		new_doc.total_amount = self.total_amount
		for i in self.items:
			print(i.__dict__)
			new_row = new_doc.append("items", {})
			new_row.item_code = i.item_code
			new_row.item_name = i.item_name
			new_row.qty = i.qty
			new_row.rate = i.rate
			new_doc.amount = i.amount
		new_doc.save()
