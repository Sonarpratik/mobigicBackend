const express = require("express");
const multer = require("multer");
const router = express.Router();
const File = require("../models/fileSchema");
const path = require("path");
const fs = require("fs");
const { Authenticate } = require("../middleware/authenticate");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  const generateUniqueSixDigitCode = () => {
    // Get the current timestamp in milliseconds
    const timestamp = Date.now();
  
    // Convert the timestamp to a string
    const timestampStr = timestamp.toString();
  
    // Take the last 6 digits of the timestamp
    const sixDigitCode = timestampStr.slice(-6);
  
    return sixDigitCode;
  };
  const upload = multer({ storage });
  // Endpoint to handle file uploads
  router.post("/api/upload", Authenticate,upload.single("file"), async (req, res) => {
    try {
  const { _id, ...data } = req.rootUser;

   
      const file = req.file;
  
      if (  !file) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Create a new File document
      const newFile = new File({
        user_id:_id,
        six_digit_code:generateUniqueSixDigitCode(),
        file: file.path, // Save the file path
      });
  
      // Save the document to the database
      await newFile.save();
  
      res.status(201).json(newFile );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.get("/api/upload",Authenticate, async (req, res) => {
    try {
  const { _id, ...data } = req.rootUser;

const file = await File.find({user_id:_id})
  
      res.status(200).json(file);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.get("/api/upload/:id", async (req, res) => {
    try {
    const Id = req.params.id;
        
const file = await File.findOne({six_digit_code:Id})
  
      res.status(200).json(file);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.delete("/api/upload/:id", Authenticate, async (req, res) => {
    try {
      const fileId = req.params.id;
      const file = await File.findById(fileId);
  
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
  
      // Delete the file from the file system
      fs.unlink(file.file, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error deleting file from filesystem" });
        }
  
        // Remove the document from the database
        await File.findByIdAndDelete(fileId);
  
        res.status(200).json({ message: "File deleted successfully" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
