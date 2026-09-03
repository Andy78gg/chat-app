// ============================================================
// Firebase 配置（已填入）
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyB4e4FOw71XX155mFadqpOxn7hSH7BNWYg",
  authDomain: "my-chat-room-83418.firebaseapp.com",
  projectId: "my-chat-room-83418",
  storageBucket: "my-chat-room-83418.firebasestorage.app",
  messagingSenderId: "694895631506",
  appId: "1:694895631506:web:7de6ff46cfe988c130da4b"
};

// ------------------------------------------------------------
// 以下代码无需修改
// ------------------------------------------------------------
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 页面元素
const nameModal = document.getElementById("nameModal");
const nameInput = document.getElementById("nameInput");
const nameConfirm = document.getElementById("nameConfirm");
const chat = document.getElementById("chat");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const changeName = document.getElementById("changeName");
const onlineInfo = document.getElementById("onlineInfo");

// 本地昵称（存浏览器里，下次访问不用再输）
let myName = localStorage.getItem("chat_nickname") || "";

// ---------- 昵称流程 ----------
function enterChat() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  myName = name;
  localStorage.setItem("chat_nickname", name);
  nameModal.classList.add("hidden");
  chat.classList.remove("hidden");
  messageInput.focus();
}

nameConfirm.addEventListener("click", enterChat);
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enterChat();
});

changeName.addEventListener("click", () => {
  chat.classList.add("hidden");
  nameModal.classList.remove("hidden");
  nameInput.value = myName;
  nameInput.focus();
});

// 如果之前填过昵称，直接进入
if (myName) {
  nameModal.classList.add("hidden");
  chat.classList.remove("hidden");
}

// ---------- 发送消息 ----------
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, "messages"), {
      name: myName,
      text: text,
      timestamp: serverTimestamp()
    });
    messageInput.value = "";
    messageInput.focus();
  } catch (err) {
    console.error("发送失败:", err);
    alert("发送失败，请检查 Firebase 配置是否正确。");
  }
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ---------- 实时接收消息 ----------
function formatTime(ts) {
  if (!ts || !(ts instanceof Timestamp)) return "";
  const d = ts.toDate();
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

const messagesQuery = query(
  collection(db, "messages"),
  orderBy("timestamp", "desc"),
  limit(100)
);

let isNearBottom = true;

onSnapshot(messagesQuery, (snapshot) => {
  const el = messagesEl;
  isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;

  const docs = snapshot.docs;
  // 反向排序，让时间从旧到新（最新在底部）
  const messages = docs.slice().reverse();

  // 增量更新：用 Set 记录已渲染的消息 id
  if (!window.__renderedIds) window.__renderedIds = new Set();

  let anyNew = false;

  for (const doc of messages) {
    const id = doc.id;
    if (window.__renderedIds.has(id)) continue;
    window.__renderedIds.add(id);
    anyNew = true;

    const data = doc.data();
    const ts = data.timestamp;
    const mine = data.name === myName;
    const msgEl = document.createElement("div");
    msgEl.className = `message ${mine ? "mine" : "others"}`;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = data.name || "匿名";
    msgEl.appendChild(meta);

    const body = document.createElement("span");
    body.textContent = data.text || "";
    msgEl.appendChild(body);

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = formatTime(ts);
    msgEl.appendChild(time);

    messagesEl.appendChild(msgEl);
  }

  onlineInfo.textContent = `在线消息 ${snapshot.size} 条`;

  // 自己刚发或原本在底部时自动滚到底部
  if (anyNew && isNearBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}, (err) => {
  console.error("监听消息失败:", err);
  messagesEl.innerHTML =
    '<div class="loading">无法连接 Firebase，请检查配置。</div>';
});
