const TelegramBot = require('node-telegram-bot-api');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, remove, update, onValue } = require('firebase/database');
const express = require('express');

// ===== CONFIG =====
const BOT_TOKEN = '8864744323:AAHVdmQ0MxzsXcjM9LXBOTAKSoe7BUYOrys';
const ADMIN_CHAT_ID = '8318546916';
const FIREBASE_URL = 'https://nasr-36e5a-default-rtdb.firebaseio.com';

// Firebase Config
const firebaseConfig = {
    databaseURL: FIREBASE_URL
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const expressApp = express();
expressApp.use(express.json());

// ===== WILAYAS DATA =====
const WILAYAS = [
    {id:1, name:"أدرار", price:800}, {id:2, name:"الشلف", price:500},
    {id:3, name:"الأغواط", price:600}, {id:4, name:"أم البواقي", price:550},
    {id:5, name:"باتنة", price:600}, {id:6, name:"بجاية", price:500},
    {id:7, name:"بسكرة", price:700}, {id:8, name:"بشار", price:900},
    {id:9, name:"البليدة", price:400}, {id:10, name:"البويرة", price:450},
    {id:11, name:"تمنراست", price:1000}, {id:12, name:"تبسة", price:600},
    {id:13, name:"تلمسان", price:500}, {id:14, name:"تيارت", price:550},
    {id:15, name:"تيزي وزو", price:450}, {id:16, name:"الجزائر", price:300},
    {id:17, name:"الجلفة", price:650}, {id:18, name:"جيجل", price:500},
    {id:19, name:"سطيف", price:500}, {id:20, name:"سعيدة", price:600},
    {id:21, name:"سكيكدة", price:500}, {id:22, name:"سيدي بلعباس", price:550},
    {id:23, name:"عنابة", price:500}, {id:24, name:"قالمة", price:550},
    {id:25, name:"قسنطينة", price:550}, {id:26, name:"المدية", price:400},
    {id:27, name:"مستغانم", price:500}, {id:28, name:"المسيلة", price:600},
    {id:29, name:"معسكر", price:550}, {id:30, name:"ورقلة", price:800},
    {id:31, name:"وهران", price:500}, {id:32, name:"البيض", price:900},
    {id:33, name:"إليزي", price:1000}, {id:34, name:"برج بوعريريج", price:500},
    {id:35, name:"بومرداس", price:400}, {id:36, name:"الطارف", price:500},
    {id:37, name:"تندوف", price:1100}, {id:38, name:"تيسمسيلت", price:550},
    {id:39, name:"الوادي", price:750}, {id:40, name:"خنشلة", price:600},
    {id:41, name:"سوق أهراس", price:550}, {id:42, name:"تيبازة", price:400},
    {id:43, name:"ميلة", price:500}, {id:44, name:"عين الدفلى", price:450},
    {id:45, name:"النعامة", price:800}, {id:46, name:"عين تموشنت", price:500},
    {id:47, name:"غرداية", price:700}, {id:48, name:"غليزان", price:500}
];

// Initialize wilayas in Firebase
async function initWilayas() {
    const wilayasRef = ref(db, 'wilayas');
    const snapshot = await get(wilayasRef);
    if (!snapshot.exists()) {
        await set(wilayasRef, WILAYAS);
    }
}
initWilayas();

// ===== KEYBOARD MENUS =====
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['➕ إضافة منتج', '📋 عرض المنتجات'],
            ['🗑️ حذف منتج', '✏️ تعديل سعر'],
            ['📦 الطلبات الجديدة', '📊 إحصائيات'],
            ['🚚 أسعار التوصيل', '❓ المساعدة']
        ],
        resize_keyboard: true
    }
};

const cancelMenu = {
    reply_markup: {
        keyboard: [['❌ إلغاء']],
        resize_keyboard: true
    }
};

// ===== USER STATES =====
const userStates = {};

// ===== START COMMAND =====
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) {
        bot.sendMessage(chatId, '⛔ هذا البوت للمدير فقط!');
        return;
    }

    bot.sendMessage(chatId, 
        '👋 مرحباً بك في بوت إدارة NASR!\n\n' +
        '🔐 أنت المدير\n' +
        '📦 يمكنك إدارة المنتجات والطلبات\n' +
        '📊 متابعة الإحصائيات\n\n' +
        'اختر من القائمة:', 
        mainMenu
    );
});

// ===== ADD PRODUCT =====
bot.onText(/➕ إضافة منتج/, (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    userStates[chatId] = { step: 'add_name' };
    bot.sendMessage(chatId, '📝 أرسل اسم المنتج:', cancelMenu);
});

// ===== LIST PRODUCTS =====
bot.onText(/📋 عرض المنتجات/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);

    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
        bot.sendMessage(chatId, '📭 لا توجد منتجات حالياً', mainMenu);
        return;
    }

    const products = snapshot.val();
    let text = '📦 قائمة المنتجات:\n\n';

    Object.values(products).forEach((p, i) => {
        text += `${i+1}. ${p.name}\n`;
        text += `💰 DA ${p.price.toLocaleString()}`;
        if (p.oldPrice) text += ` (قبل: DA ${p.oldPrice.toLocaleString()})`;
        text += `\n📦 مخزون: ${p.stock}\n\n`;
    });

    bot.sendMessage(chatId, text, mainMenu);
});

// ===== DELETE PRODUCT =====
bot.onText(/🗑️ حذف منتج/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);

    if (!snapshot.exists()) {
        bot.sendMessage(chatId, '📭 لا توجد منتجات للحذف', mainMenu);
        return;
    }

    const products = snapshot.val();
    const keyboard = Object.values(products).map(p => [{
        text: `🗑️ ${p.name}`,
        callback_data: `delete_${p.id}`
    }]);

    bot.sendMessage(chatId, 'اختر المنتج للحذف:', {
        reply_markup: { inline_keyboard: keyboard }
    });
});

// ===== EDIT PRICE =====
bot.onText(/✏️ تعديل سعر/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);

    if (!snapshot.exists()) {
        bot.sendMessage(chatId, '📭 لا توجد منتجات', mainMenu);
        return;
    }

    const products = snapshot.val();
    const keyboard = Object.values(products).map(p => [{
        text: `✏️ ${p.name} - DA ${p.price.toLocaleString()}`,
        callback_data: `edit_${p.id}`
    }]);

    bot.sendMessage(chatId, 'اختر المنتج لتعديل السعر:', {
        reply_markup: { inline_keyboard: keyboard }
    });
});

// ===== ORDERS =====
bot.onText(/📦 الطلبات الجديدة/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);

    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
        bot.sendMessage(chatId, '📭 لا توجد طلبات حالياً', mainMenu);
        return;
    }

    const orders = snapshot.val();
    const pendingOrders = Object.values(orders).filter(o => o.status === 'pending');

    if (pendingOrders.length === 0) {
        bot.sendMessage(chatId, '✅ لا توجد طلبات جديدة', mainMenu);
        return;
    }

    let text = `🔔 ${pendingOrders.length} طلب جديد:\n\n`;

    pendingOrders.forEach((o, i) => {
        text += `📦 ${o.id}\n`;
        text += `👤 ${o.customerName || 'غير محدد'}\n`;
        text += `📱 ${o.customerPhone}\n`;
        text += `📍 ${o.wilaya}\n`;
        text += `💰 DA ${o.total.toLocaleString()}\n`;
        text += `📅 ${o.date}\n\n`;
    });

    bot.sendMessage(chatId, text, mainMenu);
});

// ===== STATISTICS =====
bot.onText(/📊 إحصائيات/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const productsRef = ref(db, 'products');
    const ordersRef = ref(db, 'orders');

    const [productsSnap, ordersSnap] = await Promise.all([
        get(productsRef),
        get(ordersRef)
    ]);

    const productsCount = productsSnap.exists() ? Object.keys(productsSnap.val()).length : 0;
    const ordersCount = ordersSnap.exists() ? Object.keys(ordersSnap.val()).length : 0;

    let revenue = 0;
    let customers = new Set();

    if (ordersSnap.exists()) {
        Object.values(ordersSnap.val()).forEach(o => {
            revenue += o.total || 0;
            if (o.customerPhone) customers.add(o.customerPhone);
        });
    }

    const text = 
        '📊 إحصائيات NASR\n\n' +
        `📦 المنتجات: ${productsCount}\n` +
        `📦 الطلبات: ${ordersCount}\n` +
        `💰 الإيرادات: DA ${revenue.toLocaleString()}\n` +
        `👥 العملاء: ${customers.size}\n` +
        `🚚 الولايات: ${WILAYAS.length}`;

    bot.sendMessage(chatId, text, mainMenu);
});

// ===== SHIPPING PRICES =====
bot.onText(/🚚 أسعار التوصيل/, async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const wilayasRef = ref(db, 'wilayas');
    const snapshot = await get(wilayasRef);

    let wilayas = WILAYAS;
    if (snapshot.exists()) {
        wilayas = Object.values(snapshot.val());
    }

    let text = '🚚 أسعار التوصيل:\n\n';
    wilayas.forEach(w => {
        text += `${w.id}. ${w.name}: DA ${w.price.toLocaleString()}\n`;
    });

    text += '\n✏️ لتحديث سعر، أرسل:
update_رقم_الولاية_السعر الجديد';

    bot.sendMessage(chatId, text, mainMenu);
});

// ===== HELP =====
bot.onText(/❓ المساعدة/, (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const text = 
        '❓ دليل استخدام البوت\n\n' +
        '➕ إضافة منتج - إضافة منتج جديد\n' +
        '📋 عرض المنتجات - قائمة كل المنتجات\n' +
        '🗑️ حذف منتج - حذف منتج محدد\n' +
        '✏️ تعديل سعر - تغيير سعر منتج\n' +
        '📦 الطلبات الجديدة - عرض الطلبات\n' +
        '📊 إحصائيات - إحصائيات الموقع\n' +
        '🚚 أسعار التوصيل - تعديل أسعار الولايات\n\n' +
        '🔔 ستصلك إشعارات فورية بكل طلب جديد';

    bot.sendMessage(chatId, text, mainMenu);
});

// ===== HANDLE MESSAGES =====
bot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;
    if (!msg.text || msg.text.startsWith('/')) return;

    const state = userStates[chatId];
    if (!state) return;

    // Cancel
    if (msg.text === '❌ إلغاء') {
        delete userStates[chatId];
        bot.sendMessage(chatId, '✅ تم الإلغاء', mainMenu);
        return;
    }

    // Add product flow
    if (state.step === 'add_name') {
        state.name = msg.text;
        state.step = 'add_price';
        bot.sendMessage(chatId, '💰 أرسل السعر (رقم فقط):', cancelMenu);
    }
    else if (state.step === 'add_price') {
        const price = parseInt(msg.text);
        if (isNaN(price)) {
            bot.sendMessage(chatId, '❌ أرسل رقماً صحيحاً', cancelMenu);
            return;
        }
        state.price = price;
        state.step = 'add_old_price';
        bot.sendMessage(chatId, '💰 أرسل السعر القديم (أو 0 إذا لا يوجد):', cancelMenu);
    }
    else if (state.step === 'add_old_price') {
        const oldPrice = parseInt(msg.text);
        state.oldPrice = oldPrice > 0 ? oldPrice : null;
        state.step = 'add_stock';
        bot.sendMessage(chatId, '📦 أرسل كمية المخزون:', cancelMenu);
    }
    else if (state.step === 'add_stock') {
        const stock = parseInt(msg.text);
        if (isNaN(stock)) {
            bot.sendMessage(chatId, '❌ أرسل رقماً صحيحاً', cancelMenu);
            return;
        }
        state.stock = stock;
        state.step = 'add_image';
        bot.sendMessage(chatId, '📸 أرسل صورة المنتج:', cancelMenu);
    }
    else if (state.step === 'add_image') {
        if (!msg.photo) {
            bot.sendMessage(chatId, '❌ أرسل صورة', cancelMenu);
            return;
        }

        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

        const newProduct = {
            id: Date.now(),
            name: state.name,
            price: state.price,
            oldPrice: state.oldPrice,
            stock: state.stock,
            image: imageUrl,
            images: [imageUrl]
        };

        // Save to Firebase
        await set(ref(db, 'products/' + newProduct.id), newProduct);

        delete userStates[chatId];
        bot.sendMessage(chatId, 
            `✅ تم إضافة المنتج بنجاح!\n\n` +
            `📦 ${newProduct.name}\n` +
            `💰 DA ${newProduct.price.toLocaleString()}`,
            mainMenu
        );
    }

    // Edit price flow
    if (state.step === 'edit_price') {
        const price = parseInt(msg.text);
        if (isNaN(price)) {
            bot.sendMessage(chatId, '❌ أرسل رقماً صحيحاً', cancelMenu);
            return;
        }

        await update(ref(db, 'products/' + state.productId), { price: price });

        delete userStates[chatId];
        bot.sendMessage(chatId, '✅ تم تحديث السعر بنجاح!', mainMenu);
    }

    // Update shipping price
    if (msg.text.startsWith('update_')) {
        const parts = msg.text.split('_');
        if (parts.length === 3) {
            const wilayaId = parseInt(parts[1]);
            const newPrice = parseInt(parts[2]);

            if (!isNaN(wilayaId) && !isNaN(newPrice)) {
                await update(ref(db, 'wilayas/' + (wilayaId - 1)), { price: newPrice });
                bot.sendMessage(chatId, `✅ تم تحديث سعر التوصيل للولاية ${wilayaId} إلى DA ${newPrice}`, mainMenu);
            }
        }
    }
});

// ===== HANDLE CALLBACKS =====
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const data = query.data;

    // Delete product
    if (data.startsWith('delete_')) {
        const productId = data.replace('delete_', '');
        await remove(ref(db, 'products/' + productId));
        bot.answerCallbackQuery(query.id, { text: '✅ تم الحذف!' });
        bot.sendMessage(chatId, '🗑️ تم حذف المنتج بنجاح!', mainMenu);
    }

    // Edit price
    if (data.startsWith('edit_')) {
        const productId = data.replace('edit_', '');
        userStates[chatId] = { step: 'edit_price', productId: productId };
        bot.answerCallbackQuery(query.id, { text: '✏️ أرسل السعر الجديد' });
        bot.sendMessage(chatId, '✏️ أرسل السعر الجديد:', cancelMenu);
    }
});

// ===== LISTEN FOR NEW ORDERS =====
const ordersRef = ref(db, 'orders');
onValue(ordersRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const orders = snapshot.val();
    const pendingOrders = Object.values(orders).filter(o => o.status === 'pending' && !o.notified);

    pendingOrders.forEach(async (order) => {
        // Mark as notified
        await update(ref(db, 'orders/' + order.id), { notified: true });

        // Send notification to admin
        let text = `🔔 طلب جديد!\n\n`;
        text += `📦 رقم: ${order.id}\n`;
        text += `👤 ${order.customerName || 'غير محدد'}\n`;
        text += `📱 ${order.customerPhone}\n`;
        text += `📍 ${order.wilaya}\n`;
        text += `📅 ${order.date}\n\n`;
        text += `📦 المنتجات:\n`;

        order.items.forEach(item => {
            text += `- ${item.name} (${item.size}, ${item.color}) × ${item.qty}\n`;
        });

        text += `\n🚚 التوصيل: DA ${order.shipping.toLocaleString()}\n`;
        text += `💰 الإجمالي: DA ${order.total.toLocaleString()}`;

        bot.sendMessage(ADMIN_CHAT_ID, text, {
            reply_markup: {
                inline_keyboard: [[
                    { text: '✅ تم التوصيل', callback_data: `complete_${order.id}` },
                    { text: '📞 اتصل بالعميل', url: `tel:${order.customerPhone}` }
                ]]
            }
        });
    });
});

// ===== WEBHOOK FOR WEBSITE ORDERS =====
expressApp.post('/notify', async (req, res) => {
    const order = req.body;
    if (!order) return res.status(400).send('No data');

    // Save order to Firebase
    await set(ref(db, 'orders/' + order.id), order);

    res.status(200).send('OK');
});

expressApp.get('/', (req, res) => {
    res.send('NASR Bot is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('NASR Bot is active!');

    // Notify admin that bot is running
    bot.sendMessage(ADMIN_CHAT_ID, 
        '🤖 بوت NASR يعمل الآن!\n\n' +
        '✅ جاهز لاستقبال الطلبات\n' +
        '✅ جاهز لإدارة المنتجات\n\n' +
        'اختر من القائمة:', 
        mainMenu
    );
});

console.log('Bot started successfully!');
