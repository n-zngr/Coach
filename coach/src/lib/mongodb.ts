require('dotenv').config();
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ MONGODB_URI is not defined in environment variables.");
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err: unknown) {
        // Check if 'err' is an instance of Error before accessing its message
        if (err instanceof Error) {
            console.error("❌ Failed to connect to MongoDB:", err.message);
        } else {
            console.error("❌ An unknown error occurred:", err);
        }
    } finally {
        await client.close();
        console.log("🔒 Connection to MongoDB closed.");
    }
}

run().catch((err: unknown) => {
    if (err instanceof Error) {
        console.error("Unhandled error:", err.message);
    } else {
        console.error("An unknown unhandled error occurred:", err);
    }
});