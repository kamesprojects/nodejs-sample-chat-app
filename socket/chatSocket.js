import express from "express";
import { Server } from "socket.io";
import messagesRouter from "../routes/v1/messages.js"

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`A User connected`);

  socket.on('chat-sent', async (msg) => {
    console.log(`Chat message received: ${msg}`);
      
      // Broadcast the message to all connected clients
      io.emit('chat-received', msg);
    
  });

   // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`A User disconnected`);
  });
});