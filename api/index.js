const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const User = require('./models/User');
const Product = require('./models/Product');
const Asset = require('./models/Asset');


const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://13nicholasa:MongoDB_123_Bluesnow@clothes-test-product-ba.d40hjiu.mongodb.net/?retryWrites=true&w=majority');

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});
app.post('/product', uploadMiddleware.fields([{ name: 'file', maxCount: 1 }, { name: 'item_second_image', maxCount: 1 }, { name: 'item_third_image', maxCount: 1 }]), async (req,res) => {
  const file = req.files.file[0];
  let {originalname,path} = file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const photoPath = path+'.'+ext;
  fs.renameSync(path, photoPath);

  const file2 = req.files.item_second_image[0];
  originalname = file2['originalname'];
  path  = file2['path'];
  const parts2 = originalname.split('.');
  const ext2 = parts2[parts2.length - 1];
  const newPath2 = path+'.'+ext;
  fs.renameSync(path, newPath2);

  const file3 = req.files.item_third_image[0];
  originalname = file3['originalname'];
  path  = file3['path'];
  const parts3 = originalname.split('.');
  const ext3 = parts3[parts3.length - 1];
  const newPath3 = path+'.'+ext3;
  fs.renameSync(path, newPath3);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {
      item_id,
      item_collection_name,
      item_price,
      item_description,
      item_colour,
      item_colours_available,
      item_sizes,
      item_release,
      item_type,
      item_gender,
      photoPath,
      newPath2,
      newPath3,
    } = req.body;
    const productDoc = await Product.create({
      item_id,
      item_collection_name,
      item_photo:photoPath,
      item_second_image:newPath2,
      item_third_image:newPath3,
      item_price,
      item_description,
      item_colour,
      item_colours_available,
      item_sizes,
      item_release,
      item_type,
      item_gender,
    });
    res.json(productDoc);
  });

});

app.post('/asset', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {name,tags} = req.body;
    const postDoc = await Asset.create({
      name,
      tags,
      asset:newPath,
    });
    res.json(postDoc);
  });
});

app.get('/product', async (req,res) => {
  res.json(
    await Product.find()
      .limit(20)
  );
});

app.get('/product/filter/:filter', async (req,res) => {

  let filter = {item_colour: "Black"};
  filter = {
    '$and': [],
  };

  let filterEncoded = req.params;

  let filtersArray = filterEncoded['filter'].split('|');
  filtersArray.forEach(typeString => {

    let [type, typeOptionsString] = typeString.split(':');
    typeOptions = typeOptionsString.split('&');


    let optionsObj = {$in: typeOptions};
    let typeObj = {};
    typeObj[type] = optionsObj;

    filter['$and'].push(typeObj);
  })
  console.log(JSON.stringify(filter));
  res.json(
    await Product.find(filter)
      .limit(20)
  );
});


app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.get('/product/:id', async (req, res) => {
  const {id} = req.params;
  const productDoc = await Product.findById(id);
  res.json(productDoc);
})

app.listen(4000);
//