const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 1. قراءة الملفات الثابتة من المجلد الرئيسي مباشرة
app.use(express.static(__dirname));

// تخزين مؤقت للرموز
const otpStore = new Map();

// إعدادات خدمة WhatsApp API
const ULTRAMSG_INSTANCE_ID = 'instance190163';
const ULTRAMSG_TOKEN = 'y6sax1c654nkfgkg';

// 2. توجيه الصفحة الرئيسية لفتح index.html تلقائياً
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. مسار إرسال الرمز
app.post('/api/send-otp', async (req, res) => {
    const { userId, phone } = req.body;

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: 'يرجى إدخال رقم هاتف صحيح مع مفتاح الدولة (مثال: 966501234567+)' });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(userId || phone, generatedOTP);

    try {
        console.log(`[تجريبي] تم إرسال الرمز ${generatedOTP} إلى الرقم ${phone}`);
        return res.json({ success: true, message: 'تم إرسال الرمز بنجاح' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'فشل إرسال الرمز، حاول لاحقاً' });
    }
});

// 4. مسار تأكيد الرمز
app.post('/api/confirm-otp', (req, res) => {
    const { userId, otp } = req.body;
    const storedOTP = otpStore.get(userId);

    if (storedOTP && storedOTP === otp) {
        otpStore.delete(userId);
        return res.json({ success: true, message: 'تم التحقق بنجاح' });
    } else {
        return res.status(400).json({ success: false, error: 'رمز التحقق غير صحيح' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
