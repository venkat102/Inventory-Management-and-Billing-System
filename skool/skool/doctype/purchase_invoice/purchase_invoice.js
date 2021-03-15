// Copyright (c) 2021, Venkatesh and contributors
// For license information, please see license.txt

frappe.ui.form.on('Purchase Invoice', {
	// refresh: function(frm) {

	// }
});

frappe.ui.form.on('Purchase Invoice Item', {
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
		frm.doc.items[index].amount = parseFloat(frm.doc.items[index].qty) * parseFloat(frm.doc.items[index].rate)
		frm.refresh_field("items");
		var total = 0;
			for (var i = 0; i<frm.doc.items.length; i++){
				total += parseFloat(frm.doc.items[i].amount);
			}
			frm.set_value("total_amount", total)
			frm.refresh_field("total_amount");
	},
	rate:function(frm, cdt, cdn){
		var index = 0;
        for(var i=frm.doc.items.length-1; i>=0;i--){
            if(frm.doc.items[i].name == cdn){
                index = i;
                break;
            }
        }
		if(!frm.doc.items[index].item_code){
			frm.doc.items[index].qty = '';
			frappe.throw('Enter Item Code before Rate');
			frm.refresh_field("items");
		}
		frm.doc.items[index].amount = parseFloat(frm.doc.items[index].qty) * parseFloat(frm.doc.items[index].rate)
		frm.refresh_field("items");
		var total = 0;
			for (var i = 0; i<frm.doc.items.length; i++){
				total += parseFloat(frm.doc.items[i].amount);
			}
			frm.set_value("total_amount", total)
			frm.refresh_field("total_amount");
	},
});