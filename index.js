const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تخزين مؤقت للرموز (في التطبيقات الكبيرة يفضل استخدام MongoDB)
const otpStore = new Map();

// إعدادات خدمة WhatsApp API (استبدل البيانات بحسابك في UltraMsg أو Green-API)
const ULTRAMSG_INSTANCE_ID = 'instance190163'; // رقم الانستانس
const ULTRAMSG_TOKEN = 'y6sax1c654nkfgkg';             // التوكن الخاص بك

// 1. مسار إرسال الرمز
app.post('/api/send-otp', async (req, res) => {
    const { userId, phone } = req.body;

    // التحقق من صحة صيغة رقم الهاتف (أرقام فقط مع مفتاح الدولة)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, error: 'يرجى إدخال رقم هاتف صحيح مع مفتاح الدولة (مثال: 966501234567+)' });
    }

    // توليد رمز مكون من 6 أرقام
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // حفظ الرمز مع معرف المستخدم
    otpStore.set(userId || phone, generatedOTP);

    // إرسال الرمز عبر WhatsApp (مثال باستخدام UltraMsg)
    try {
        /* 
        // تفعيل هذا الجزء عند الاشتراك في خدمة UltraMsg
        const response = await fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'token': ULTRAMSG_TOKEN,
                'to': phone,
                'body': `رمز التحقق الخاص بك في شنب ستور هو: ${generatedOTP}`
            })
        });
        */

        console.log(`[تجريبي] تم إرسال الرمز ${generatedOTP} إلى الرقم ${phone}`);
        return res.json({ success: true, message: 'تم إرسال الرمز بنجاح' });
    } catch (err) {
        return res.status(500).json({ success: false, error: 'فشل إرسال الرمز، حاول لاحقاً' });
    }
});

// 2. مسار تأكيد الرمز
app.post('/api/confirm-otp', (req, res) => {
    const { userId, otp } = req.body;
    const storedOTP = otpStore.get(userId);

    if (storedOTP && storedOTP === otp) {
        otpStore.delete(userId); // مسح الرمز بعد الاستخدام
        return res.json({ success: true, message: 'تم التحقق بنجاح' });
    } else {
        return res.status(400).json({ success: false, error: 'رمز التحقق غير صحيح' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});