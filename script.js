// دالة أساسية لتبديل الأقسام
function showPanel(id) {
    // إخفاء كل الأقسام
    const panels = ['home', 'admin', 'teacher', 'child', 'leader'];
    panels.forEach(panel => {
        const element = document.getElementById(panel);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // إظهار القسم المطلوب
    const targetPanel = document.getElementById(id);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }
}

// دالة العودة للصفحة الرئيسية
function goHome() {
    showPanel('home');
}

// دالة دخول المسؤول
function adminLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin123') {
        document.getElementById('adminLoginBox').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        alert('تم الدخول كمسؤول ✅');
    } else {
        alert('كلمة مرور خاطئة ❌');
    }
}

// دالة دخول الخادم
function teacherLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    
    if (user && pass) {
        document.getElementById('teacherLoginBox').style.display = 'none';
        document.getElementById('teacherPanel').style.display = 'block';
        document.getElementById('teacherClass').innerText = '1';
        alert('تم الدخول كخادم ✅');
    } else {
        alert('ادخل اسم المستخدم وكلمة المرور');
    }
}

// دالة إضافة طلاب
function addStudents() {
    const names = document.getElementById('studentNames').value;
    if (names) {
        alert('تم إضافة الطلاب: ' + names);
        document.getElementById('studentNames').value = '';
    } else {
        alert('ادخل أسماء الطلاب');
    }
}

// دالة دخول الطفل
function enterKholwa() {
    const name = document.getElementById('childName').value;
    const className = document.getElementById('childClass').value;
    
    if (name) {
        document.getElementById('childEntry').style.display = 'none';
        document.getElementById('kholwaView').style.display = 'block';
        document.getElementById('childScore').innerHTML = 'مرحبا ' + name + '! 🌟';
        document.getElementById('kholwaContent').innerHTML = '<p>الخلوة اليوم: رحلة مع الكتاب المقدس</p>';
        alert('أهلاً ' + name + ' في فصل ' + className);
    } else {
        alert('ادخل اسمك أولاً');
    }
}

// دالة إنشاء خادم
function createTeacher() {
    const user = document.getElementById('tuser').value;
    const pass = document.getElementById('tpass').value;
    
    if (user && pass) {
        alert('تم إنشاء الخادم: ' + user);
        document.getElementById('tuser').value = '';
        document.getElementById('tpass').value = '';
    } else {
        alert('ادخل اسم وكلمة المرور');
    }
}

// دالة إضافة خلوة
function addKholwa() {
    const title = document.getElementById('kTitle').value || 'خلوة جديدة';
    alert('تم إضافة الخلوة: ' + title);
}

// دالة عرض خلوة اليوم
function previewKholwaToday() {
    alert('عرض خلوة اليوم');
}

// دالة حفظ الإعدادات
function setDefaultPoints() {
    alert('تم حفظ الإعدادات');
}

// دالة رفع ملف
function uploadDataFile(input) {
    alert('تم رفع الملف');
}

// دالة تصفير البيانات
function resetAll() {
    if (confirm('هل تريد تصفير جميع البيانات؟')) {
        alert('تم تصفير البيانات');
    }
}

// تهيئة الأزرار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('البرنامج شغال!');
    
    // زر لوحة الشرف
    const leaderBtn = document.getElementById('leaderBtn');
    if (leaderBtn) {
        leaderBtn.onclick = function() {
            showPanel('leader');
            // عرض بيانات تجريبية في لوحة الشرف
            const leaderList = document.getElementById('leaderList');
            if (leaderList) {
                leaderList.innerHTML = `
                    <li class="leader-item"><div>1. أحمد</div><div>50 نقطة 🥇</div></li>
                    <li class="leader-item"><div>2. محمد</div><div>40 نقطة 🥈</div></li>
                    <li class="leader-item"><div>3. يوسف</div><div>30 نقطة 🥉</div></li>
                `;
            }
        };
    }
    
    // زر العودة من لوحة الشرف
    const leaderBack = document.getElementById('leaderBack');
    if (leaderBack) {
        leaderBack.onclick = goHome;
    }
    
    // زر عرض الخلوة المنشورة
    const viewPublished = document.getElementById('viewPublished');
    if (viewPublished) {
        viewPublished.onclick = function() {
            alert('عرض الخلوة المنشورة');
        };
    }
});
