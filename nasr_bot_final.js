const { Telegraf } = require('telegraf');
const express = require('express');
const axios = require('axios');

// ===== CONFIG =====
const BOT_TOKEN = '8999234221:AAGfpbCM7YPkWHLHI3hJrwXB2VvsUz1lJGo';
const ADMIN_CHAT_ID = '8318546916';
const FIREBASE_URL = 'https://nasr-36e5a-default-rtdb.firebaseio.com';

// Initialize
const expressApp = express();
expressApp.use(express.json());
const bot = new Telegraf(BOT_TOKEN);

// ===== ALL 58 ALGERIAN WILAYAS =====
const WILAYAS = [
    {id:1, name:"أدرار", price:800}, {id:2, name:"الشلف", price:500},
    {id:3, name:"الأغواط", price:600}, {id:4, name:"أم البواقي", price:550},
    {id:5, name:"باتنة", price:600}, {id:6, name:"بجاية", price:500},
    {id:7, name:"بسكرة", price:700}, {id:8, name:"بشار", price:900},
    {id:9, name:"البليدة", price:400}, {id:10, name:"البويرة", price:450},
    {id:11, name:"تمنراست", price:1000}, {id:12, name:"تبسة", price:600},
    {id:13, name:"تلمسان", price:500}, {id:14, name:"تيارت", price:550},
    {id:15, name:"تيزي وزو", price:450}, {id:16, name:"الجزائر العاصمة", price:300},
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
    {id:47, name:"غرداية", price:700}, {id:48, name:"غليزان", price:500},
    {id:49, name:"تيميمون", price:950}, {id:50, name:"برج باجي مختار", price:1050},
    {id:51, name:"أولاد جلال", price:700}, {id:52, name:"بني عباس", price:950},
    {id:53, name:"عين صالح", price:1000}, {id:54, name:"عين قزام", price:1050},
    {id:55, name:"تقرت", price:850}, {id:56, name:"جانت", price:1100},
    {id:57, name:"المغير", price:850}, {id:58, name:"المنيعة", price:900}
];

// Firebase helper functions
async function fbGet(path) {
    try {
        const res = await axios.get(`${FIREBASE_URL}/${path}.json`);
        return res.data;
    } catch(e) { return null; }
}

async function fbSet(path, data) {
    try {
        await axios.put(`${FIREBASE_URL}/${path}.json`, data);
        return true;
    } catch(e) { return false; }
}

async function fbDelete(path) {
    try {
        await axios.delete(`${FIREBASE_URL}/${path}.json`);
        return true;
    } catch(e) { return false; }
}

// Initialize wilayas in Firebase
async function initWilayas() {
    const existing = await fbGet('wilayas');
    if (!existing) {
        const wilayasObj = {};
        WILAYAS.forEach(w => wilayasObj[w.id] = w);
        await fbSet('wilayas', wilayasObj);
    }
}
initWilayas();

// ===== USER STATES =====
const userStates = {};

// ===== MAIN MENU KEYBOARD =====
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['🏠 الرئيسية'],
            ['📦 المنتجات', '🛒 الطلبات'],
            ['🚚 الشحن', '📊 الإحصائيات'],
            ['⚙️ الإعدادات', '❓ المساعدة']
        ],
        resize_keyboard: true
    }
};

const productsMenu = {
    reply_markup: {
        keyboard: [
            ['➕ إضافة منتج', '📋 عرض المنتجات'],
            ['✏️ تعديل منتج', '🗑️ حذف منتج'],
            ['🔙 الرئيسية']
        ],
        resize_keyboard: true
    }
};

const ordersMenu = {
    reply_markup: {
        keyboard: [
            ['📦 الطلبات الجديدة', '✅ تم الشحن'],
            ['❌ الطلبات الملغاة', '📋 كل الطلبات'],
            ['🔙 الرئيسية']
        ],
        resize_keyboard: true
    }
};

const shippingMenu = {
    reply_markup: {
        keyboard: [
            ['💰 تعديل أسعار التوصيل'],
            ['📋 عرض أسعار التوصيل'],
            ['🔙 الرئيسية']
        ],
        resize_keyboard: true
    }
};

const settingsMenu = {
    reply_markup: {
        keyboard: [
            ['📱 تغيير رقم الواتساب'],
            ['🏪 تغيير اسم المتجر'],
            ['🖼️ تغيير البانر'],
            ['🔙 الرئيسية']
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

// ===== START COMMAND =====
bot.start(async (ctx) => {
    const chatId = ctx.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) {
        return ctx.reply('⛔ هذا البوت للمدير فقط!');
    }

    await ctx.reply(
        '👋 مرحباً بك في بوت إدارة NASR!

' +
        '🔐 أنت المدير
' +
        '📦 يمكنك إدارة المنتجات والطلبات
' +
        '📊 متابعة الإحصائيات

' +
        'اختر من القائمة:',
        mainMenu
    );
});

// ===== MAIN MENU HANDLERS =====
bot.hears('🏠 الرئيسية', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('🏠 الرئيسية', mainMenu);
});

// ===== PRODUCTS MENU =====
bot.hears('📦 المنتجات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('📦 إدارة المنتجات', productsMenu);
});

// ===== ADD PRODUCT =====
bot.hears('➕ إضافة منتج', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    userStates[ctx.chat.id] = { step: 'add_name' };
    await ctx.reply('📝 أرسل اسم المنتج:', cancelMenu);
});

// ===== LIST PRODUCTS =====
bot.hears('📋 عرض المنتجات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const products = await fbGet('products');
    if (!products || Object.keys(products).length === 0) {
        return ctx.reply('📭 لا توجد منتجات حالياً', productsMenu);
    }

    let text = '📦 قائمة المنتجات:

';
    Object.values(products).forEach((p, i) => {
        text += `${i+1}. ${p.name}
`;
        text += `💰 DA ${p.price?.toLocaleString() || 0}`;
        if (p.oldPrice) text += ` (قبل: DA ${p.oldPrice.toLocaleString()})`;
        text += `
📦 مخزون: ${p.stock || 0}
`;
        if (p.sizes) text += `📏 مقاسات: ${p.sizes}
`;
        if (p.colors) text += `🎨 ألوان: ${p.colors}
`;
        text += '
';
    });

    await ctx.reply(text, productsMenu);
});

// ===== EDIT PRODUCT =====
bot.hears('✏️ تعديل منتج', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const products = await fbGet('products');
    if (!products || Object.keys(products).length === 0) {
        return ctx.reply('📭 لا توجد منتجات', productsMenu);
    }

    const keyboard = Object.values(products).map(p => [{
        text: `✏️ ${p.name}`,
        callback_data: `edit_${p.id}`
    }]);

    await ctx.reply('✏️ اختر المنتج للتعديل:', {
        reply_markup: { inline_keyboard: keyboard }
    });
});

// ===== DELETE PRODUCT =====
bot.hears('🗑️ حذف منتج', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const products = await fbGet('products');
    if (!products || Object.keys(products).length === 0) {
        return ctx.reply('📭 لا توجد منتجات للحذف', productsMenu);
    }

    const keyboard = Object.values(products).map(p => [{
        text: `🗑️ ${p.name}`,
        callback_data: `delete_${p.id}`
    }]);

    await ctx.reply('🗑️ اختر المنتج للحذف:', {
        reply_markup: { inline_keyboard: keyboard }
    });
});

// ===== ORDERS MENU =====
bot.hears('🛒 الطلبات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('🛒 إدارة الطلبات', ordersMenu);
});

// ===== NEW ORDERS =====
bot.hears('📦 الطلبات الجديدة', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const orders = await fbGet('orders');
    if (!orders || Object.keys(orders).length === 0) {
        return ctx.reply('📭 لا توجد طلبات', ordersMenu);
    }

    const pendingOrders = Object.values(orders).filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) {
        return ctx.reply('✅ لا توجد طلبات جديدة', ordersMenu);
    }

    for (const order of pendingOrders) {
        let text = `🔔 طلب جديد!

`;
        text += `📦 رقم: ${order.id}
`;
        text += `👤 ${order.customerName || 'غير محدد'}
`;
        text += `📱 ${order.customerPhone}
`;
        text += `📍 ${order.wilaya}
`;
        text += `📅 ${order.date}

`;
        text += `📦 المنتجات:
`;

        if (order.items) {
            order.items.forEach(item => {
                text += `- ${item.name} (${item.size}, ${item.color}) × ${item.qty}
`;
            });
        }

        text += `
🚚 التوصيل: DA ${order.shipping?.toLocaleString() || 0}
`;
        text += `💰 الإجمالي: DA ${order.total?.toLocaleString() || 0}`;

        await ctx.reply(text, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ تأكيد', callback_data: `confirm_${order.id}` },
                        { text: '🚚 شحن', callback_data: `ship_${order.id}` }
                    ],
                    [
                        { text: '❌ إلغاء', callback_data: `cancel_${order.id}` },
                        { text: '📞 اتصل', url: `https://wa.me/${order.customerPhone?.replace(/^0/, '213')}` }
                    ]
                ]
            }
        });
    }
});

// ===== SHIPPED ORDERS =====
bot.hears('✅ تم الشحن', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const orders = await fbGet('orders');
    if (!orders) return ctx.reply('📭 لا توجد طلبات', ordersMenu);

    const shipped = Object.values(orders).filter(o => o.status === 'shipped');
    if (shipped.length === 0) return ctx.reply('📭 لا توجد طلبات مشحونة', ordersMenu);

    let text = `📦 الطلبات المشحونة (${shipped.length}):

`;
    shipped.forEach(o => {
        text += `${o.id} - ${o.customerName || 'غير محدد'} - DA ${o.total?.toLocaleString() || 0}
`;
    });

    await ctx.reply(text, ordersMenu);
});

// ===== CANCELLED ORDERS =====
bot.hears('❌ الطلبات الملغاة', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const orders = await fbGet('orders');
    if (!orders) return ctx.reply('📭 لا توجد طلبات', ordersMenu);

    const cancelled = Object.values(orders).filter(o => o.status === 'cancelled');
    if (cancelled.length === 0) return ctx.reply('📭 لا توجد طلبات ملغاة', ordersMenu);

    let text = `❌ الطلبات الملغاة (${cancelled.length}):

`;
    cancelled.forEach(o => {
        text += `${o.id} - ${o.customerName || 'غير محدد'} - DA ${o.total?.toLocaleString() || 0}
`;
    });

    await ctx.reply(text, ordersMenu);
});

// ===== ALL ORDERS =====
bot.hears('📋 كل الطلبات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const orders = await fbGet('orders');
    if (!orders || Object.keys(orders).length === 0) {
        return ctx.reply('📭 لا توجد طلبات', ordersMenu);
    }

    let text = `📋 كل الطلبات (${Object.keys(orders).length}):

`;
    Object.values(orders).forEach(o => {
        const status = o.status === 'pending' ? '⏳' : o.status === 'shipped' ? '✅' : '❌';
        text += `${status} ${o.id} - ${o.customerName || 'غير محدد'} - DA ${o.total?.toLocaleString() || 0}
`;
    });

    await ctx.reply(text, ordersMenu);
});

// ===== SHIPPING MENU =====
bot.hears('🚚 الشحن', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('🚚 إدارة الشحن', shippingMenu);
});

// ===== EDIT SHIPPING PRICES =====
bot.hears('💰 تعديل أسعار التوصيل', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const wilayas = await fbGet('wilayas');
    let text = '🚚 أسعار التوصيل:

';

    if (wilayas) {
        Object.values(wilayas).forEach(w => {
            text += `${w.id}. ${w.name}: DA ${w.price?.toLocaleString() || 0}
`;
        });
    } else {
        WILAYAS.forEach(w => {
            text += `${w.id}. ${w.name}: DA ${w.price.toLocaleString()}
`;
        });
    }

    text += '
✏️ لتحديث سعر، أرسل:
update_رقم_الولاية_السعر
مثال: update_16_500';

    await ctx.reply(text, shippingMenu);
});

// ===== SHOW SHIPPING PRICES =====
bot.hears('📋 عرض أسعار التوصيل', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const wilayas = await fbGet('wilayas');
    let text = '🚚 أسعار التوصيل:

';

    if (wilayas) {
        Object.values(wilayas).forEach(w => {
            text += `${w.id}. ${w.name}: DA ${w.price?.toLocaleString() || 0}
`;
        });
    } else {
        WILAYAS.forEach(w => {
            text += `${w.id}. ${w.name}: DA ${w.price.toLocaleString()}
`;
        });
    }

    await ctx.reply(text, shippingMenu);
});

// ===== STATISTICS =====
bot.hears('📊 الإحصائيات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const products = await fbGet('products');
    const orders = await fbGet('orders');

    const productsCount = products ? Object.keys(products).length : 0;
    const ordersCount = orders ? Object.keys(orders).length : 0;

    let revenue = 0;
    let customers = new Set();
    let pendingCount = 0;
    let shippedCount = 0;
    let cancelledCount = 0;

    if (orders) {
        Object.values(orders).forEach(o => {
            revenue += o.total || 0;
            if (o.customerPhone) customers.add(o.customerPhone);
            if (o.status === 'pending') pendingCount++;
            if (o.status === 'shipped') shippedCount++;
            if (o.status === 'cancelled') cancelledCount++;
        });
    }

    const text = 
        '📊 إحصائيات NASR

' +
        `📦 المنتجات: ${productsCount}
` +
        `📦 الطلبات: ${ordersCount}
` +
        `⏳ قيد الانتظار: ${pendingCount}
` +
        `✅ تم الشحن: ${shippedCount}
` +
        `❌ ملغاة: ${cancelledCount}
` +
        `💰 الإيرادات: DA ${revenue.toLocaleString()}
` +
        `👥 العملاء: ${customers.size}
` +
        `🚚 الولايات: ${WILAYAS.length}`;

    await ctx.reply(text, mainMenu);
});

// ===== SETTINGS MENU =====
bot.hears('⚙️ الإعدادات', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('⚙️ الإعدادات', settingsMenu);
});

// ===== CHANGE WHATSAPP =====
bot.hears('📱 تغيير رقم الواتساب', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    userStates[ctx.chat.id] = { step: 'change_whatsapp' };
    await ctx.reply('📱 أرسل رقم الواتساب الجديد (مثال: 213664941651):', cancelMenu);
});

// ===== CHANGE STORE NAME =====
bot.hears('🏪 تغيير اسم المتجر', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    userStates[ctx.chat.id] = { step: 'change_name' };
    await ctx.reply('🏪 أرسل اسم المتجر الجديد:', cancelMenu);
});

// ===== CHANGE BANNER =====
bot.hears('🖼️ تغيير البانر', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    userStates[ctx.chat.id] = { step: 'change_banner' };
    await ctx.reply('🖼️ أرسل صورة البانر الجديدة:', cancelMenu);
});

// ===== HELP =====
bot.hears('❓ المساعدة', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;

    const text = 
        '❓ دليل استخدام البوت

' +
        '📦 المنتجات:
' +
        '• ➕ إضافة منتج - إضافة منتج جديد
' +
        '• 📋 عرض المنتجات - قائمة كل المنتجات
' +
        '• ✏️ تعديل منتج - تعديل سعر/مخزون
' +
        '• 🗑️ حذف منتج - حذف منتج

' +
        '🛒 الطلبات:
' +
        '• 📦 الطلبات الجديدة - عرض الطلبات الواردة
' +
        '• ✅ تم الشحن - الطلبات المشحونة
' +
        '• ❌ الطلبات الملغاة - الطلبات الملغاة

' +
        '🚚 الشحن:
' +
        '• 💰 تعديل أسعار التوصيل
' +
        '• 📋 عرض أسعار التوصيل

' +
        '🔔 ستصلك إشعارات فورية بكل طلب جديد';

    await ctx.reply(text, mainMenu);
});

// ===== BACK BUTTON =====
bot.hears('🔙 الرئيسية', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    await ctx.reply('🏠 الرئيسية', mainMenu);
});

// ===== CANCEL =====
bot.hears('❌ إلغاء', async (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_CHAT_ID) return;
    delete userStates[ctx.chat.id];
    await ctx.reply('✅ تم الإلغاء', mainMenu);
});

// ===== HANDLE TEXT MESSAGES =====
bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const text = ctx.message.text;
    const state = userStates[chatId];
    if (!state) return;

    // ADD PRODUCT FLOW
    if (state.step === 'add_name') {
        state.name = text;
        state.step = 'add_price';
        await ctx.reply('💰 أرسل السعر (رقم فقط):', cancelMenu);
    }
    else if (state.step === 'add_price') {
        const price = parseInt(text);
        if (isNaN(price)) {
            return ctx.reply('❌ أرسل رقماً صحيحاً', cancelMenu);
        }
        state.price = price;
        state.step = 'add_old_price';
        await ctx.reply('💰 أرسل السعر القديم (أو 0 إذا لا يوجد):', cancelMenu);
    }
    else if (state.step === 'add_old_price') {
        const oldPrice = parseInt(text);
        state.oldPrice = oldPrice > 0 ? oldPrice : null;
        state.step = 'add_stock';
        await ctx.reply('📦 أرسل كمية المخزون:', cancelMenu);
    }
    else if (state.step === 'add_stock') {
        const stock = parseInt(text);
        if (isNaN(stock)) {
            return ctx.reply('❌ أرسل رقماً صحيحاً', cancelMenu);
        }
        state.stock = stock;
        state.step = 'add_sizes';
        await ctx.reply('📏 أرسل المقاسات (مثال: S,M,L,XL,XXL):', cancelMenu);
    }
    else if (state.step === 'add_sizes') {
        state.sizes = text;
        state.step = 'add_colors';
        await ctx.reply('🎨 أرسل الألوان (مثال: أسود,أبيض,رمادي,كحلي):', cancelMenu);
    }
    else if (state.step === 'add_colors') {
        state.colors = text;
        state.step = 'add_image';
        await ctx.reply('📸 أرسل صورة المنتج:', cancelMenu);
    }

    // CHANGE WHATSAPP
    else if (state.step === 'change_whatsapp') {
        await fbSet('settings/whatsapp', text);
        delete userStates[chatId];
        await ctx.reply('✅ تم تغيير رقم الواتساب', settingsMenu);
    }

    // CHANGE STORE NAME
    else if (state.step === 'change_name') {
        await fbSet('settings/storeName', text);
        delete userStates[chatId];
        await ctx.reply('✅ تم تغيير اسم المتجر', settingsMenu);
    }

    // UPDATE SHIPPING PRICE
    else if (text.startsWith('update_')) {
        const parts = text.split('_');
        if (parts.length === 3) {
            const wilayaId = parseInt(parts[1]);
            const newPrice = parseInt(parts[2]);

            if (!isNaN(wilayaId) && !isNaN(newPrice)) {
                await fbSet(`wilayas/${wilayaId}/price`, newPrice);
                await ctx.reply(`✅ تم تحديث سعر التوصيل للولاية ${wilayaId} إلى DA ${newPrice}`, shippingMenu);
            }
        }
    }
});

// ===== HANDLE PHOTOS =====
bot.on('photo', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const state = userStates[chatId];
    if (!state) return;

    if (state.step === 'add_image') {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

        const newProduct = {
            id: Date.now().toString(),
            name: state.name,
            price: state.price,
            oldPrice: state.oldPrice,
            stock: state.stock,
            sizes: state.sizes || 'S,M,L,XL,XXL',
            colors: state.colors || 'أسود,أبيض,رمادي,كحلي',
            image: imageUrl,
            images: [imageUrl]
        };

        await fbSet(`products/${newProduct.id}`, newProduct);

        delete userStates[chatId];
        await ctx.reply(
            `✅ تم إضافة المنتج بنجاح!

` +
            `📦 ${newProduct.name}
` +
            `💰 DA ${newProduct.price.toLocaleString()}
` +
            `📏 ${newProduct.sizes}
` +
            `🎨 ${newProduct.colors}`,
            productsMenu
        );
    }
    else if (state.step === 'change_banner') {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

        await fbSet('settings/banner', imageUrl);
        delete userStates[chatId];
        await ctx.reply('✅ تم تغيير البانر', settingsMenu);
    }
});

// ===== HANDLE CALLBACKS =====
bot.on('callback_query', async (ctx) => {
    const chatId = ctx.callbackQuery.message.chat.id.toString();
    if (chatId !== ADMIN_CHAT_ID) return;

    const data = ctx.callbackQuery.data;

    // DELETE PRODUCT
    if (data.startsWith('delete_')) {
        const productId = data.replace('delete_', '');
        await fbDelete(`products/${productId}`);
        await ctx.answerCbQuery('✅ تم الحذف!');
        await ctx.reply('🗑️ تم حذف المنتج بنجاح!', productsMenu);
    }

    // EDIT PRODUCT
    else if (data.startsWith('edit_')) {
        const productId = data.replace('edit_', '');
        userStates[chatId] = { step: 'edit_price', productId: productId };
        await ctx.answerCbQuery('✏️ أرسل السعر الجديد');
        await ctx.reply('✏️ أرسل السعر الجديد:', cancelMenu);
    }

    // CONFIRM ORDER
    else if (data.startsWith('confirm_')) {
        const orderId = data.replace('confirm_', '');
        await fbSet(`orders/${orderId}/status`, 'confirmed');
        await ctx.answerCbQuery('✅ تم التأكيد');
        await ctx.reply(`✅ تم تأكيد الطلب ${orderId}`, ordersMenu);
    }

    // SHIP ORDER
    else if (data.startsWith('ship_')) {
        const orderId = data.replace('ship_', '');
        await fbSet(`orders/${orderId}/status`, 'shipped');
        await ctx.answerCbQuery('🚚 تم الشحن');
        await ctx.reply(`🚚 تم شحن الطلب ${orderId}`, ordersMenu);
    }

    // CANCEL ORDER
    else if (data.startsWith('cancel_')) {
        const orderId = data.replace('cancel_', '');
        await fbSet(`orders/${orderId}/status`, 'cancelled');
        await ctx.answerCbQuery('❌ تم الإلغاء');
        await ctx.reply(`❌ تم إلغاء الطلب ${orderId}`, ordersMenu);
    }
});

// ===== WEBHOOK FOR WEBSITE ORDERS =====
expressApp.post('/webhook', async (req, res) => {
    const order = req.body;
    if (!order) return res.status(400).send('No data');

    // Save order to Firebase
    await fbSet(`orders/${order.id}`, order);

    // Send notification to admin
    let text = `🔔 طلب جديد!

`;
    text += `📦 رقم: ${order.id}
`;
    text += `👤 ${order.customerName || 'غير محدد'}
`;
    text += `📱 ${order.customerPhone}
`;
    text += `📍 ${order.wilaya}
`;
    text += `📅 ${order.date}

`;
    text += `📦 المنتجات:
`;

    if (order.items) {
        order.items.forEach(item => {
            text += `- ${item.name} (${item.size}, ${item.color}) × ${item.qty}
`;
        });
    }

    text += `
🚚 التوصيل: DA ${order.shipping?.toLocaleString() || 0}
`;
    text += `💰 الإجمالي: DA ${order.total?.toLocaleString() || 0}`;

    try {
        await bot.telegram.sendMessage(ADMIN_CHAT_ID, text, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ تأكيد', callback_data: `confirm_${order.id}` },
                        { text: '🚚 شحن', callback_data: `ship_${order.id}` }
                    ],
                    [
                        { text: '❌ إلغاء', callback_data: `cancel_${order.id}` },
                        { text: '📞 واتساب', url: `https://wa.me/${order.customerPhone?.replace(/^0/, '213')}` }
                    ]
                ]
            }
        });
    } catch(e) {
        console.log('Failed to send notification:', e.message);
    }

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
});

// Launch bot
bot.launch().then(() => {
    console.log('Bot started successfully!');
    bot.telegram.sendMessage(ADMIN_CHAT_ID, 
        '🤖 بوت NASR يعمل الآن!

' +
        '✅ جاهز لاستقبال الطلبات
' +
        '✅ جاهز لإدارة المنتجات

' +
        'اختر من القائمة:', 
        mainMenu
    );
}).catch(err => {
    console.log('Bot error:', err.message);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
