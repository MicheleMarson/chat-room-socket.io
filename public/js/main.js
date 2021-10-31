const socket = io(); // have access from script tag in chat.html
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomId = document.getElementById("room-name");
const userList = document.getElementById("users");

// get username and room from url
const queryStr = window.location.search;
const urlParams = new URLSearchParams(queryStr);
const username = urlParams.get("username");
const room = urlParams.get("room");
// ---------------------------------------

// join chatroom
socket.emit("joinRoom", { username, room }); // we can catch this on server side

// get room and users
socket.on("roomUsers", ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

// message from server
socket.on("message", (message) => {
	// from server
	console.log(message);
	outputMessage(message);

	// scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit
chatForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const msg = e.target.elements.msg.value;
	socket.emit("chatMessage", msg);

	// clear input
	e.target.elements.msg.value = ""; // id is msg
});

// output message to DOM
function outputMessage(message) {
	const div = document.createElement("div");
	div.classList.add("message");
	div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span>
	<p className="text">${message.text}</p>`;
	document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
	roomId.innerHTML = room;
}

function outputUsers(users) {
	userList.innerHTML = `
		${users.map((user) => `<li>${user.username}</li>`).join("")}
	`;
}
