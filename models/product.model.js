var mongoose = require('mongoose')

var productSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	ten_goi_cuoc: String,
	gia_goi: Number,
	chu_ky: String,
	khuyen_mai_chu_ky_dau: String,
	hoa_hong_msocial: Number,
	uu_dai_noi_mang: String,
	uu_dai_ngoai_mang: String,
	uu_dai_data: String,
	uu_dai_khac: String,
	public: Boolean,
	create_time: Date,
	update_time: Date
})

var Product = mongoose.model('Product', productSchema, 'products')

module.exports = Product