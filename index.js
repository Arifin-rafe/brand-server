const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json())

const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aes3buy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        const brandCollection = client.db('brandDB').collection('brands');
        const productCollection = client.db('brandDB').collection('products');
        const cartCollection = client.db('brandDB').collection('cart');

        app.get('/brands', async (req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        //specific brands
        app.get('/products/:brandName', async (req, res) => {
            const brandName = req.params.brandName;
            const query = {
                brandName: brandName
            }
            const result = await productCollection.find(query).toArray()
            res.send(result)
            
        })
        //get  top rated products
        app.get('/top',async(req,res)=>{
            const rating = "5";
            const query = {
                ratings:rating
            }
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })
        //single product details
        app.get('/productDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await productCollection.findOne(query)
            res.send(result)
        })
        //for all brand
        app.post('/brands', async (req, res) => {
            const newBrand = req.body;
            console.log(newBrand);
            const result = await brandCollection.insertOne(newBrand)
            res.send(result)
        })
        //for all product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct)
            res.send(result)
        })
        //for cart
        app.post('/cart', async (req, res) => {
            const cart = req.body;
            console.log(cart);
            const result = await cartCollection.insertOne(cart)
            res.send(result)
        })

        //to update single product
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            }
            const options = {
                upsert: true //if no data then put the data in the database
            };
            const updatedProduct = req.body
            const product = {
                $set: {
                    brandName: updatedProduct.brandName,
                    productName: updatedProduct.productName,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    ratings: updatedProduct.ratings,
                    details: updatedProduct.details,
                    image: updatedProduct.image
                    
                }
            }
            const result = await productCollection.updateOne(filter, product, options)
            res.send(result)
        })
        //to delete an cart items
        app.delete('/cart/:id',async(req,res)=>{
            const id = req.params.id;
            const query ={
                _id : id
            }
            const result = await cartCollection.deleteOne(query)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        
        // await client.close();
    }
}
run().catch(console.dir);

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log(`brand server running on port ${port}`)
})