const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeaves,
	getRoomUsers,
} = require("./utils/users");
const io = socketio(server);
const port = 3000 || process.env.PORT;
const botName = "chatBot";

//  set static folder - front-end
app.use(express.static(path.join(__dirname, "public")));

// run when client connects
io.on("connection", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		// welcome current user
		socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

		// broadcast when user connects
		socket.broadcast.to(user.room).emit(
			// emit to specific room
			// emit to everyone exept the user
			"message",
			formatMessage(botName, `${user.username} has joined the chat`)
		);

		// send users and romm info
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// listen for chatMessage
	socket.on("chatMessage", (msg) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit("message", formatMessage(user.username, msg));
	});

	// runs when client disconnects
	socket.on("disconnect", () => {
		const user = userLeaves(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage(botName, `${user.username} has left the chat`)
			);

			// send users and romm info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

server.listen(port, () => console.log("server running at ", port));
