
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use (express.static("public"));

mongoose.connect("mongodb+srv://visheshmeena:testing5522@cluster1.n7u1dky.mongodb.net/todolistDB", {useNewUrlParser:true,useUnifiedTopology: true});

const itemsSchema={
    name: String
};

const Item= mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to todolist!"
});

const item2=new Item({
    name:"hit the + button add item."
});

const item3=new Item({
    name:"<-- Hit this to delete item."
});

const defaultItems=[item1, item2, item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema) ;


app.get("/", (req, res) => {
  //FIND A FRUIT
Item.find({})
.then(function(foundItems){
  if(foundItems.length===0)
  {
    Item.insertMany(defaultItems)
    .then (function(){
    console.log("fine");
    })

    .catch (function(err){
    console.log(err);
  });
  res.redirect("/");
  }
    res.render("list", { listTitle: "Today", newListItems: foundItems});
  })
  .catch(function(err){
    console.log(err);
  });
});


app.get("/:customListName",  (req, res)=> {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {});
});



app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item = new Item({
      name:itemName
    });
    if (listName==="Today")
    {
    item.save()
    .then(() => console.log("new Item added to main todolist."));
    res.redirect("/");
    }else{
      List.findOne({name:listName})
      .then(function(foundList){
      foundList.items.push(item);
      foundList.save().then(() => console.log("Success!!"));
      res.redirect("/" + listName);
      })
      .catch(function(err){});
    }
});


app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox.trim();
  const listName= req.body.listName;

  if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then (function(){
      res.redirect("/");
      console.log("deleted");
    })
    .catch (function(err){
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then (function(foundList){
      res.redirect("/"+listName);
    })
    .catch(function (err) {});
  }
});

mongoose.connect("mongodb+srv://visheshmeena:testing5522@cluster1.n7u1dky.mongodb.net/todolistDB").then(
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
  })
);
