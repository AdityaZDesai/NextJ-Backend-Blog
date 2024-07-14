require("dotenv").config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();
const port = 5000;
app.use(express.json()); // Middleware to parse JSON bodies
console.log(process.env.MONGODB_URL)
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const blogSchema = new mongoose.Schema({
    title: String,
    body: String
});

const Blogs = mongoose.model('Blog', blogSchema);

const initalBlog = new Blogs({title: "First Blog Baby", 
    body: "This is my first blog. The mother, the father, the warrior, the smith, the crone, the stranger"
});

// initalBlog.save().then(() => console.log("BLOG SAVED" ), (err) => console.log(err));


const personSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowecase: true
    },
    password: String,
    blogs: [blogSchema]
})

const Person = mongoose.model('Person', personSchema)

// const stud = new Person({username: "adityadesai753@gmail.com",
//     password: "1234"
// })
async function addBlogToPerson(blog) {
    try {
        const person = await Person.findOne({ username: "adityadesai753@gmail.com" }).populate('blogs');
        if (person) {
            person.blogs.push(blog);
            await person.save();
            console.log("Blog added successfully");
        } else {
            console.log("Person not found");
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeBlog(id){
    try{
        const person = await Person.findOne({ username: "adityadesai753@gmail.com" }).populate('blogs');
        if (person){
            person.blogs.pull({_id: id});
            await person.save();
        }
        else{
            console.log("Person not found")
        }
    } catch (err){
        console.log(err);
    }
}

async function editBlog(id, newTitle, newBody){
    try{
        const person =await Person.findOne({ username: "adityadesai753@gmail.com" }).populate('blogs'); 
        if (person){
            const blog = person.blogs.id(id)
            if (!blog){
                throw new Error("BLOG NO FOUND");
            }
            console.log(blog)
            blog.title = newTitle;
            blog.body = newBody;
            console.log(newTitle, newBody);
            console.log(blog);
            person.markModified('blogs');
            await person.save()

        }
        else{
            console.log("Person not found");
        }

    } catch (err){
        console.log(err);
    }
}


//addBlogToPerson();
// stud.save().then(() => console.log("ENTRY ADDED"), (err) => console.log(err));

Blogs.findByIdAndDelete('6684bb92c2169439737e0e02');
Blogs.findByIdAndDelete('6688a51b264d49f03e636cf3');

app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello from Exprkess!');
});

app.post('/authenticate', (req, res) => {
    const {email , pass} = req.body;
    Person.exists({username: email, password: pass}).
    then(result=> {result === null? res.send("false"): res.send("true"); console.log(result)}).
    catch((err) => console.log(err));
}

);

app.get('/blog', (req, res) =>{
    Person.findOne({username: "adityadesai753@gmail.com"}).populate('blogs')
    .then(person => res.json(person.blogs));
})


app.get('/:id', (req, res) => {
    const {id} = req.params;
    Person.findOne({ username: "adityadesai753@gmail.com" }).populate('blogs')
        .then(person => {
            if (!person) {
                return res.status(404).json({ error: 'Person not found' });
            }
            // Find the blog with the matching id
            const blog = person.blogs.find(blog => blog._id.toString() === id);
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
            res.json(blog);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        });

})

app.post('/addBlog', (req, res) => {
    const {title, body} = req.body;
    const newBlog = new Blogs({title: title, body: body});
    addBlogToPerson(newBlog).then(_ => {res.send(true); console.log("added?")}).catch(err => console.log(err));
})

app.post('/deleteBlog', (req, res)=> {
    const {id} = req.body
    removeBlog(id).then(_ => res.send("true")).catch(err => console.log(err));
})

app.post('/updateBlog', (req, res) => {
    const {title, body, id} = req.body;
    editBlog(id, title, body).then(_ => res.send("true")).catch(err => console.log(err));
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});