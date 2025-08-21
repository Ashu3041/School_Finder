const express=require("express");
const session = require("express-session");
const path=require("path");
const Listing=require("./models/listing.js");
const app=express();



// MIDDLEWARE

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


// MongoDB Connection

mongoose.connect("mongodb://127.0.0.1:27017/odisha_schools")
  .then(() => console.log('Connected!'))
  .catch(err=>console.log(err));

//   Session for LogIn

app.use(session({
    secret:"secretkey123",
    resave:false,
    saveUninitialized:true
}));



// const userSchema=new mongoose.Schema({
//   username:String,
//   password:String
// });

// const User=mongoose.model("User",userSchema);


// ROUTES

app.get("/",(req,res)=>{
  res.render("home.ejs");
});


app.post("/search",async(req,res)=>{
  const city=req.body.city;
  const schools=await School.find({city:city});
  res.render("searchResults", { schools, city });

});


app.get("/school/:id",(req,res)=>{
  // let schoolId=req.params.id;
  res.render("login.ejs",{schoolId:req.params.id});
});

app.post("/login",(req,res)=>{
  const {username,password,schoolId}=req.body;
  const user=User.findOne({username,password});
  if(!user){
    return res.send("Invalid credentials! <a href='/'>Go Back</a>");
  }
  const school=School.findById(schoolId);
  res.render("schoolDetails",{school,user});
});

const port=8080;
app.listen(port,()=>{
    console.log(`Server is running on http//:localhost:${port}`);
});