"use strict";
let mongoose = require('mongoose');

//Article Schema
"use strict";
let articleSchema = mongoose.Schema({
   title:{
       type: String,
       required: true
   },
   author:{
       type: String,
       required: true
   },
   body:{
       type: String,
       required: true
   }

});

//"use strict";
let Article = module.exports = mongoose.model('Article', articleSchema);