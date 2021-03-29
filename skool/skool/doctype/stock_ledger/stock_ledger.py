# -*- coding: utf-8 -*-
# Copyright (c) 2021, Venkatesh and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document

class StockLedger(Document):
	def before_save(self):
		for i in range(len(self.items)):
			self.items[i].amount = float(self.items[i].rate) * float(self.items[i].qty)
