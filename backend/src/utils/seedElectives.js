import mongoose from "mongoose";
import Elective from "../models/elective.model.js";
import dotenv from "dotenv";

dotenv.config();

const electives = [
  {
    title: "Artificial Intelligence",
    slotId: "H",
    credits: 3,
    branchTags: ["CSE", "ECE", "AI"],
    careerTags: ["ai", "machine learning"],
    maxCapacity: 60,
    description: "Foundations of AI, search algorithms, and neural networks."
  },
  {
    title: "Deep Learning",
    slotId: "I",
    credits: 4,
    branchTags: ["CSE", "AI"],
    careerTags: ["ai", "data science"],
    maxCapacity: 45,
    description: "Advanced neural networks and computer vision."
  },
  {
    title: "Cloud Computing",
    slotId: "J",
    credits: 3,
    branchTags: ["CSE", "IT"],
    careerTags: ["web dev", "devops"],
    maxCapacity: 100,
    description: "Distributed systems and AWS/Azure deployment."
  },
  {
    title: "Robotics & Automation",
    slotId: "K",
    credits: 3,
    branchTags: ["MECH", "ECE"],
    careerTags: ["core engineering", "robotics"],
    maxCapacity: 30,
    description: "Mechatronics and control systems."
  },
  {
    title: "Blockchain Security",
    slotId: "H",
    credits: 3,
    branchTags: ["CSE"],
    careerTags: ["cybersecurity", "web dev"],
    maxCapacity: 50,
    description: "Cryptography and smart contract auditing."
  },
  {
    title: "VLSI Design",
    slotId: "I",
    credits: 4,
    branchTags: ["ECE"],
    careerTags: ["core engineering", "hardware"],
    maxCapacity: 40,
    description: "Large scale circuit design and FPGA."
  },
  {
    title: "Financial Engineering",
    slotId: "J",
    credits: 3,
    branchTags: ["CSE", "MECH", "ECE"],
    careerTags: ["data science", "finance"],
    maxCapacity: 80,
    description: "Mathematical modeling of financial markets."
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected for seeding...");
    
    await Elective.deleteMany({});
    await Elective.insertMany(electives);
    
    console.log("Electives Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
