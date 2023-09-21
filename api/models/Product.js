const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const ProductSchema = new Schema({
  item_id:String,
  item_name:String,
  item_collection_name:String,
  item_photo:String,
  item_price: Number,
  item_description:String,
  item_colour:String,
  item_colours_available: String,
  item_second_image:String,
  item_third_image:String,
  item_sizes:String,
  item_release:String,
  item_type:String,
  item_gender:String,

}); 
const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;