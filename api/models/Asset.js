const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const AssetSchema = new Schema({
  name:String,
  tags:String,
  asset:String,
}, {
  timestamps: true,
});

const AssetModel = model('Asset', AssetSchema);

module.exports = AssetModel;