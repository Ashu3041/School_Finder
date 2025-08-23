const express=require("express");
const session = require("express-session");
const path=require("path");
const Listing=require("./models/listing.js");
const User=require("./models/user.js");
const mongoose=require("mongoose");


const app=express();



// MIDDLEWARE

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(session({
  secret:"schoolfinder-secret",
  resave:false,
  saveUninitialized:true
}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next(); // user is logged in
  } else {
    // store the page user wanted
    req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
  }
}


// MongoDB Connection

// DB Connection URL
const mongo_url = "mongodb+srv://ashutosh:ashutosh123@cluster0.d5vvguk.mongodb.net/odisha_schools?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  await mongoose.connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}


main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ROUTES

app.get("/",(req,res)=>{
  res.render("Home.ejs");
});



app.get("/done",(req,res)=>{
  res.render("Homepageafterloginorsignup.ejs");
});

// INTERACTED ON NAV BAR



// SIGN UP
app.get("/signup", (req, res) => {
  res.render("sign_up.ejs"); 
});

app.post("/signup", async (req, res) => {
  try {
    const { fullname, email, username, password, confirmPassword } = req.body;

    // Basic check for password match
    if (password !== confirmPassword) {
      return res.send("❌ Passwords do not match!");
    }

    const user = new User({ fullname, email, username, password });
    await user.save();

    console.log("🎉 User registered:", user.username);
    res.redirect("/done"); // redirect to home page
  } catch (err) {
    console.error(err);
    res.send("❌ Error signing up, maybe username/email already exists.");
  }
});



// LOG IN
app.get("/login", (req, res) => {
  res.render("login.ejs"); 
});


app.post("/login",async(req,res)=>{
  const{username,password}=req.body;
  const user=await User.findOne({username});

  if(!user) return res.send("❌ Username not found!");
  if(user.password!=password) return res.send("❌ Wrong password!");
  req.session.user = user; // save login
  res.redirect("/done");
});





app.get("/done/search", async (req, res) => {
  let cityName = req.query.cityFromSearch;
  try{
    const schools = await Listing.find({ city: cityName });
    res.render("afterSchool.ejs", { city: cityName, schools });
  } catch (err) {
    res.status(500).send("Error fetching schools");
  }
});




app.get("/search", async (req, res) => {
  let cityName = req.query.cityFromSearch;
  try{
    const schools = await Listing.find({ city: cityName });
    res.render("schools.ejs", { city: cityName, schools });
  } catch (err) {
    res.status(500).send("Error fetching schools");
  }
});





// School details (protected)
app.get("/schools/:id", isLoggedIn, async (req, res) => {
  try {
    const school = await Listing.findById(req.params.id);
    if (!school) {
      return res.status(404).send("School not found");
    }
    res.render("school_details.ejs", { school });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading school details");
  }
});


const port=8080;
app.listen(port,()=>{
    console.log(`Server is running on http//:localhost:${port}`);
});