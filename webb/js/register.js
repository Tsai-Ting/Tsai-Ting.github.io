var firebaseConfig = {
    apiKey: "AIzaSyAkW4Gg2ZaYCdeuOgs_bXcilpqJ8Ay5Mio",
    authDomain: "webbb-4f831.firebaseapp.com",
    databaseURL: "https://webbb-4f831-default-rtdb.firebaseio.com",
    projectId: "webbb-4f831",
    storageBucket: "webbb-4f831.appspot.com",
    messagingSenderId: "178711072808",
    appId: "1:178711072808:web:8e696f6650f2693952a51d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

// login
document.getElementById('login').addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    // check email & password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // successful
            showUserInfo(userCredential.user);
            document.getElementById('login-error').textContent = '';
        })
        .catch((error) => {
            document.getElementById('login-error').textContent = '帳號or密碼錯誤: ';
        });
});

// register
document.getElementById('register').addEventListener('click', function() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // register successful
            showUserInfo(userCredential.user);
            document.getElementById('login-error').textContent = '';
        })
        .catch((error) => {
            document.getElementById('login-error').textContent = '註冊錯誤，已有相同帳號:';
        });
});
// change name
document.getElementById('update-username').addEventListener('click', function() {
    var user = firebase.auth().currentUser;
    var newUsername = document.getElementById('new-username').value;

    if (user) {
        user.updateProfile({
            displayName: newUsername
        }).then(function() {
            // update successful
            document.getElementById('user-display-name').textContent = '用户名: ' + newUsername;
            updateUsernameInDatabase(user.uid, newUsername);
        }).catch(function(error) {
            // error
            console.error("Error updating username: ", error);
        });
    }
});

// logout
document.getElementById('logout').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        // logout success
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-register-form').style.display = 'block';
    }).catch((error) => {
        console.error("Error: ", error);
    });
});
var db = firebase.firestore(); // using firestore db
function showUserInfo(user) {
    document.getElementById('user-account').textContent = '帳號(信箱): ' + user.email;
    document.getElementById('user-display-name').textContent = '用户名: ' + (user.displayName || user.email);
    document.getElementById('login-register-form').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    loadMessages();
}

// load msg
function loadMessages() {
    var currentUser = firebase.auth().currentUser;

    db.collection("messages").orderBy("timestamp").get().then(function(querySnapshot) {
        var messageBoard = document.getElementById('message-board');
        messageBoard.innerHTML = '';
        querySnapshot.forEach(function(doc) {
            var message = doc.data();
            var messageElement = document.createElement('div');
            messageElement.classList.add('message-item');

            var timestamp = message.timestamp ? message.timestamp.toDate() : new Date();
            var timeFormatted = timestamp.toLocaleDateString() + " " + timestamp.toLocaleTimeString();

            var messageText = document.createTextNode(message.authorDisplayName + ": " + message.text + " (" + timeFormatted + ")");
            messageElement.appendChild(messageText);

            if (currentUser && message.authorId === currentUser.uid) {
                var deleteBtn = document.createElement('button');
                deleteBtn.textContent = '删除';
                deleteBtn.onclick = function() { deleteMessage(doc.id); };
                messageElement.appendChild(deleteBtn);
            }

            messageBoard.appendChild(messageElement);
        });
    });
}

// 删除留言函数
function deleteMessage(messageId) {
    db.collection("messages").doc(messageId).delete().then(function() {
        console.log("Message successfully deleted!");
        loadMessages(); // 重新加载留言
    }).catch(function(error) {
        console.error("Error removing message: ", error);
    });
}

// user update msg
document.getElementById('post-message').addEventListener('click', function() {
    var message = document.getElementById('message').value;
    var user = firebase.auth().currentUser;
    if (user) {
        db.collection("messages").add({
            text: message,
            authorDisplayName: user.displayName || user.email,
            authorId: user.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(function(docRef) {
            document.getElementById('message').value = '';
            loadMessages();
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }
});