// Copyright (c) 2021, Venkatesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
	onload:function(frm){
		if(!cur_frm.doc.__unsaved){
			frm.set_df_property('is_return', 'hidden', 1);
			frm.refresh_field('is_return');
		}
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