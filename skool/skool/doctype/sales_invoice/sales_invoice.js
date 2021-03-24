// Copyright (c) 2021, Venkatesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
	onload:function(frm){
		if(!cur_frm.doc.__unsaved){
			frm.set_df_property('is_return', 'hidden', 1);
			frm.refresh_field('is_return');
		}
	},
	refresh: function(frm) {
		frappe.call({
			method: 'skool.skool.doctype.purchase_invoice.purchase_invoice.get_date',
			callback: function(res){
				if(res.message){
					frm.set_value("date", res.message)
					frm.refresh_field("date")
				}
			}
		})
	},
	discount:function(frm){
		var total = 0;
		for (var i = 0; i<frm.doc.items.length; i++){
			total += parseFloat(frm.doc.items[i].amount);
		}
		frm.set_value("amount", total);
		frm.set_value("total_amount", total - parseFloat(frm.doc.discount))
		frm.refresh_field("amount");
		frm.refresh_field("total_amount");
	},
	is_return:function(frm){
		if(frm.doc.is_return){
			frm.set_df_property("invoice_no", 'hidden', 0);
		}
		else{
			location.reload();
		}
	},
	invoice_no:function(frm){
		if(frm.doc.invoice_no){
			if(frm.doc.invoice_no.includes('Returned')){
				frappe.throw("Can not return a returned invoice");
				frm.set_value("invoice_no",'');
			}
			frappe.call({
				method:"skool.skool.doctype.sales_invoice.sales_invoice.check_returned",
				args:{'invoice':frm.doc.invoice_no},
				callback:function(res){		
					if(!res.exc){	
						if(!res.message){
							frappe.call({
								method:"skool.skool.doctype.sales_invoice.sales_invoice.get_data",
								args:{'invoice': frm.doc.invoice_no},
								callback:function(res){
									frm.set_value("amount", res.message[0][0]);
									frm.set_value("discount", res.message[0][1]);
									frm.set_value("total_amount", res.message[0][2]);
									frm.set_value("items", res.message[1]);
									frm.refresh();
								}
							})
						}
						else{
							frappe.throw("Invoice is already returned");
							frm.set_value("invoice_no",'');
						}
					}
				}
			})
		}
		else{
			location.reload();
		}
	}
});

frappe.ui.form.on('Sales Invoice Item', {
	item_code:function(frm, cdt, cdn) {
		var index = 0;
        for(var i=frm.doc.items.length-1; i>=0;i--){
            if(frm.doc.items[i].name == cdn){
                index = i;
                break;
            }
        }
		if(!frm.doc.items[index].item_code){
			frm.doc.items[index].qty = 0;
			frm.doc.items[index]["item_name"] = '';
			frm.doc.items[index]["rate"] = '';
			frm.doc.items[index]['amount'] = '';			
			frm.refresh_field("items");
		}
		else{
			frappe.call({
				method:'skool.skool.doctype.sales_invoice.sales_invoice.get_stock',
				args:{'item':frm.doc.items[index].item_code},
				callback:function(res){
					frm.set_value("stock", res.message);
					frm.refresh_field("stock");
				}
			})
			frm.doc.items[index].qty = 1;
			frm.doc.items[index].amount = (parseFloat(frm.doc.items[index].qty) * parseFloat(frm.doc.items[index].rate) ).toFixed(2);
			frm.refresh_field("items");
			var total = 0;
			for (var i = 0; i<frm.doc.items.length; i++){
				total += parseFloat(frm.doc.items[i].amount);
			}
			frm.set_value("amount", total);
			frm.set_value("total_amount", total - parseFloat(frm.doc.discount))
			frm.refresh_field("amount");
			frm.refresh_field("total_amount");
		}
	},
	qty:function(frm, cdt, cdn){
		var index = 0;
        for(var i=frm.doc.items.length-1; i>=0;i--){
            if(frm.doc.items[i].name == cdn){
                index = i;
                break;
            }
        }
		if(!frm.doc.items[index].item_code){
			frm.doc.items[index].qty = '';
			frappe.throw('Enter Item Code before Qty');
			frm.refresh_field("items");
		}
		frappe.call({
			method:'skool.skool.doctype.sales_invoice.sales_invoice.get_stock',
			args:{'item':frm.doc.items[index].item_code},
			callback:function(res){
				frm.set_value("stock", res.message);
				frm.refresh_field("stock");
			}
		})
		frappe.call({
			method:'skool.skool.doctype.sales_invoice.sales_invoice.check_qty',
			args:{'item':frm.doc.items[index].item_code},
			callback:function(res){
				if(!res.exc){
					if(frm.doc.items[index].qty > res.message){
						frm.doc.items[index].qty = res.message;
						frm.refresh_field("items");
						frappe.msg("Only "+res.message+" Items in Stock");
						frm.refresh_field("items");
						return;
					}
				}
			}
		})
		frm.doc.items[index].amount = parseFloat(frm.doc.items[index].qty) * parseFloat(frm.doc.items[index].rate)
		frm.refresh_field("items");
		var total = 0;
		for (var i = 0; i<frm.doc.items.length; i++){
			total += parseFloat(frm.doc.items[i].amount);
		}
		frm.set_value("amount", total);
		frm.set_value("total_amount", total - parseFloat(frm.doc.discount))
		frm.refresh_field("amount");
		frm.refresh_field("total_amount");
	},
	items_remove:function(frm, cdt, cdn){
		console.log("HAI");
		var total = 0;
		for (var i = 0; i<frm.doc.items.length; i++){
			total += parseFloat(frm.doc.items[i].amount);
		}
		frm.set_value("amount", total);
		frm.set_value("total_amount", total - parseFloat(frm.doc.discount))
		frm.refresh_field("amount");
		frm.refresh_field("total_amount");
	}
});