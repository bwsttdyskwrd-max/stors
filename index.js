const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// تشغيل الملفات من المجلد الرئيسي مباشرة
app.use(express.static(__dirname));

// بيانات تطبيق Discord
const CLIENT_ID = '1542476019091509328';
const CLIENT_SECRET = 'fEPb5e9lUEqBb2wTgqXoakD7LRz5yVoK';
const REDIRECT_URI = 'https://stors-ap.onrender.com/api/auth/discord/callback';

// 1. الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. مسار توجيه المستخدم لتسجيل الدخول عبر Discord
app.get('/api/auth/discord', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join`;
    res.redirect(discordAuthUrl);
});

// 3. مسار استقبال العودة من Discord وتوجيهه لصفحة التحقق بالرقم
app.get('/api/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('لم يتم استلام كود التحقق من Discord');
    
    // التوجيه المباشر لصفحة إدخال الرقم
    res.redirect('/verify.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
