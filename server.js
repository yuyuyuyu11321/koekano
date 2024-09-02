const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const saltRounds = 10;

app.use(cors());  // CORSを有効にして全てのオリジンを許可

mongoose.connect('mongodb://localhost:27017/koekanoDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// JSONリクエストをパースするためのミドルウェア
app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // パスワードをハッシュ化
        const hash = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: username,
            email: email,
            password: hash
        });

        await newUser.save();

        res.json({ success: true, message: 'ユーザー登録が成功しました' });

    } catch (err) {
        console.error('Error:', err);
        res.json({ success: false, message: 'エラーが発生しました' });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);

        const { username, password } = req.body;
        const user = await User.findOne({ username: username });

        if (!user) {
            console.log('User not found');
            return res.json({ success: false, message: 'ユーザー名またはパスワードが正しくありません' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('Password mismatch');
            return res.json({ success: false, message: 'ユーザー名またはパスワードが正しくありません' });
        }

        console.log('Login successful');
        res.json({ success: true, message: 'ログインに成功しました' });

    } catch (err) {
        console.error('Server error:', err);
        res.json({ success: false, message: 'エラーが発生しました' });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
