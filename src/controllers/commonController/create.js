const { walletModel } = require("../../models/wallet.model");
const { ApiError } = require("../../utils/apiError");
const { OpenAI } = require("openai");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const chatbot = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (message===undefined || message == "") {
    throw new ApiError(400, "message is missing.");
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
                You are a helpful assistant that answers questions only about the MERN-based auction project. 
                The auction project is built using MongoDB, Express.js, React, and Node.js. 
                Key features include:
                - User authentication (login/signup)
                - Creating and managing auction lots
                - Bidding on auction lots
                - Real-time updates using WebSocket
                - Payment integration for winning bids
                - Admin dashboard for managing users and lots
    
                If the question is not related to this specific auction project, respond with: 
                "I can only answer questions about the MERN-based auction project."
              `,
        },
        { role: "user", content: message },
      ],
    });
    console.log(response);
    const reply = response.choices[0].message.content;
    return res.status(200).json(new ApiResponse(200, reply));
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new ApiError(400, "Failed to get a response from the chatbot.");
  }
});

module.exports = { chatbot };
