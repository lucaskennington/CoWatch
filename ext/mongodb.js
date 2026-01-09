import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
};

export default connectMongo;

//https://medium.com/@JordanWuInTheHouse/how-to-build-a-google-chrome-extension-with-react-next-js-and-mongodb-912e1d46f49e