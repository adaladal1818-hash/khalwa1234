[file name]: script.js
[file content begin]
const SHARED='data.json';
async function fetchShared(){ try{ const r=await fetch(SHARED+'?_='+Date.now()); if(!r.ok) throw 0; return await r.json(); }catch(e){ return null } }

const LS={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}, set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

// تهيئة البيانات
if(!LS.get('teachers')) LS.set('teachers',[]);
if(!LS.get('students')) LS.set('students',{'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]});
if(!LS.get('kholwat')) LS.set('kholwat',[]);
if(!LS.get('history')) LS.set('history',[]);
if(!LS.get('pointsPerKholwa')) LS.set('pointsPerKholwa',10);

function todayDate(){ return new Date().toISOString().slice(0,10); }

function showPanel(id){ 
    document.getElementById('home').style.display='none'; 
    ['admin','teacher','child','leader'].forEach(p=>{ 
        const el=document.getElementById(p); 
        if(el) el.style.display=(p===id)?'block':'none'; 
    }); 
    updateMainInfo(); 
}

function goHome(){ 
    document.getElementById('home').style.display='block'; 
    ['admin','teacher','child','leader'].forEach(p=>{ 
        const el=document.getElementById(p); 
        if(el) el.style.display='none'; 
    }); 
    document.getElementById('mainInfo').style.display='none'; 
}

async function updateMainInfo(){ 
    const shared=await fetchShared(); 
    const all = (shared && shared.kholwat)? shared.kholwat : LS.get('kholwat'); 
    const today = all? all.find(x=>x.date===todayDate()): null; 
    if(!today){ 
        document.getElementById('mainInfo').style.display='none'; 
        return; 
    } 
    document.getElementById('mainInfo').style.display='block'; 
    document.getElementById('todayTitle').innerText = today.title || 'خلوة اليوم'; 
}

function adminLogin(){ 
    const pass=document.getElementById('adminPass').value; 
    if(pass!=='admin123'){ alert('كلمة مرور خاطئة'); return; } 
    document.getElementById('adminLoginBox').style.display='none'; 
    document.getElementById('adminPanel').style.display='block'; 
    loadAdminList(); 
    loadReport(); 
    document.getElementById('pointsValue').value = LS.get('pointsPerKholwa')||10; 
}

function addKholwa(){ 
    const title=document.getElementById('kTitle').value.trim(); 
    const date=document.getElementById('kDate').value; 
    const text=document.getElementById('kText').value.trim(); 
    const fileInput=document.getElementById('kFile'); 
    const q=document.getElementById('qText').value.trim(); 
    const a1=document.getElementById('q1').value.trim(); 
    const a2=document.getElementById('q2').value.trim(); 
    const a3=document.getElementById('q3').value.trim(); 
    const correct=parseInt(document.getElementById('qCorrect').value); 
    const points=parseInt(document.getElementById('pointsValue').value)||10; 
    
    if(!date){ alert('حدد تاريخ الخلوة'); return; } 
    
    function finalize(obj){ 
        let all=LS.get('kholwat')||[]; 
        obj.points = points; 
        all.push(obj); 
        LS.set('kholwat', all); 
        
        const history = LS.get('history')||[]; 
        history.push({
            date:obj.date, 
            title:obj.title, 
            points:obj.points, 
            answers:{'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]}, 
            qaResponses:{'1':{},'2':{},'3':{},'4':{},'5':{},'6':{}}
        }); 
        LS.set('history', history); 
        
        document.getElementById('publishSuccess').style.display='block'; 
        const shared = {kholwat:all, history: history}; 
        const blob = new Blob([JSON.stringify(shared,null,2)], {type:'application/json'}); 
        const url = URL.createObjectURL(blob); 
        const a = document.getElementById('downloadData'); 
        a.href = url; 
        a.download='data.json'; 
        a.style.display='inline-block'; 
        
        document.getElementById('viewPublished').onclick = ()=>{ previewObject(obj); }; 
        loadAdminList(); 
        loadReport(); 
        refreshLeaderboard(); 
    } 
    
    if(fileInput.files && fileInput.files.length>0){ 
        const f=fileInput.files[0]; 
        const reader=new FileReader(); 
        reader.onload = function(e){ 
            finalize({
                date:date,
                title:title||('خلوة '+date),
                type:f.type.includes('pdf')?'pdf':'image',
                content:e.target.result,
                question:{text:q,options:[a1,a2,a3],correctIndex:correct}
            }); 
        }; 
        reader.readAsDataURL(f); 
    } else { 
        finalize({
            date:date,
            title:title||('خلوة '+date),
            type:'text',
            content:text,
            question:{text:q,options:[a1,a2,a3],correctIndex:correct}
        }); 
    } 
}

function setDefaultPoints(){ 
    const v=parseInt(document.getElementById('pointsValueGlobal').value)||10; 
    LS.set('pointsPerKholwa',v); 
    alert('تم تحديث نقاط الخلوة الافتراضية'); 
}

function uploadDataFile(input){ 
    const f=input.files[0]; 
    if(!f) return; 
    const reader=new FileReader(); 
    reader.onload=function(e){ 
        try{ 
            const obj=JSON.parse(e.target.result); 
            if(obj.kholwat){ 
                LS.set('kholwat',obj.kholwat); 
                LS.set('history',obj.history||[]); 
                alert('تم رفع البيانات بنجاح'); 
                loadAdminList(); 
                loadReport(); 
                refreshLeaderboard(); 
            } else alert('الملف غير صالح'); 
        }catch(err){ 
            alert('خطأ قراءة الملف'); 
        } 
    }; 
    reader.readAsText(f); 
}

function loadAdminList(){ 
    const all=LS.get('kholwat')||[]; 
    const container=document.getElementById('kList'); 
    if(!all.length){ 
        container.innerHTML='<p class="note">لا توجد خلوات</p>'; 
        return; 
    } 
    let html=''; 
    all.slice().reverse().forEach(k=>{ 
        html+='<div class="klist-item"><div><strong>'+k.title+'</strong><div class="klist-meta">'+k.date+' — '+(k.type||'text')+' — نقاط: '+(k.points||LS.get('pointsPerKholwa')||10)+'</div></div><div><button class="btn btn-secondary" onclick="previewByDate(\''+k.date+'\')">عرض</button></div></div>'; 
    }); 
    container.innerHTML = html; 
}

function previewByDate(date){ 
    const all=LS.get('kholwat')||[]; 
    const kh=all.find(x=>x.date===date); 
    if(kh) previewObject(kh); 
    else alert('غير موجود'); 
}

function previewObject(kh){ 
    const w=window.open('','_blank','width=420,height=700'); 
    let html='<html><head><meta charset="utf-8"><title>عرض الخلوة</title></head><body style="font-family:Arial,Helvetica,sans-serif;padding:10px">'; 
    html+='<h3>'+kh.title+'</h3>'; 
    if(kh.type==='text') html+='<div>'+kh.content+'</div>'; 
    else if(kh.type==='image') html+='<img src="'+kh.content+'" style="max-width:100%">'; 
    else if(kh.type==='pdf') html+='<a href="'+kh.content+'" target="_blank">فتح PDF</a>'; 
    if(kh.question && kh.question.text){ 
        html+='<hr><strong>السؤال:</strong><div>'+kh.question.text+'</div><ul>'; 
        kh.question.options.forEach((o,i)=>{ 
            html+='<li>'+(i+1)+'. '+o+'</li>'; 
        }); 
        html+='</ul>'; 
    } 
    html+='</body></html>'; 
    w.document.write(html); 
    w.document.close(); 
}

function createTeacher(){ 
    const u=document.getElementById('tuser').value.trim(); 
    const p=document.getElementById('tpass').value.trim(); 
    const c=document.getElementById('tclass').value; 
    if(!u||!p){ alert('ادخل اسم وكلمة'); return; } 
    const teachers=LS.get('teachers')||[]; 
    teachers.push({username:u,password:p,classId:c}); 
    LS.set('teachers',teachers); 
    alert('تم إنشاء الخادم'); 
    document.getElementById('tuser').value=''; 
    document.getElementById('tpass').value=''; 
    loadAdminList(); 
}

function teacherLogin(){ 
    const u=document.getElementById('loginUser').value.trim(); 
    const p=document.getElementById('loginPass').value.trim(); 
    const teachers=LS.get('teachers')||[]; 
    const found=teachers.find(t=>t.username===u&&t.password===p); 
    if(!found) return alert('بيانات دخول خاطئة'); 
    document.getElementById('teacherLoginBox').style.display='none'; 
    document.getElementById('teacherPanel').style.display='block'; 
    document.getElementById('teacherClass').innerText = found.classId; 
    loadTeacherStatus(found.classId); 
}

function addStudents(){ 
    const txt=document.getElementById('studentNames').value.trim(); 
    if(!txt) return alert('ادخل أسماء'); 
    const arr=txt.split(',').map(s=>s.trim()).filter(Boolean); 
    const students=LS.get('students')||{}; 
    const cls=document.getElementById('teacherClass').innerText; 
    let list=students[cls]||[]; 
    arr.forEach(n=>{ 
        if(n && !list.find(s=>s.name===n)) list.push({name:n,answeredDates:[],points:0}); 
    }); 
    students[cls]=list; 
    LS.set('students',students); 
    document.getElementById('studentNames').value=''; 
    loadTeacherStatus(cls); 
    loadReport(); 
    refreshLeaderboard(); 
}

function enterKholwa(){ 
    const name=document.getElementById('childName').value.trim(); 
    const cls=document.getElementById('childClass').value; 
    if(!name) return alert('ادخل الاسم'); 
    const students=LS.get('students')||{}; 
    let list=students[cls]||[]; 
    if(!list.find(s=>s.name===name)){ 
        list.push({name:name,answeredDates:[],points:0}); 
        students[cls]=list; 
        LS.set('students',students); 
        loadReport(); 
    } 
    showKholwatForChild(name,cls); 
}

async function showKholwatForChild(name,cls){ 
    const shared=await fetchShared(); 
    const all=(shared&&shared.kholwat)?shared.kholwat:LS.get('kholwat')||[]; 
    const today=all.find(x=>x.date===todayDate()); 
    const enter=document.getElementById('childEntry'); 
    const view=document.getElementById('kholwaView'); 
    const content=document.getElementById('kholwaContent'); 
    const qArea=document.getElementById('questionArea'); 
    const choices=document.getElementById('choicesArea'); 
    const result=document.getElementById('resultArea'); 
    const scoreEl=document.getElementById('childScore'); 
    
    result.innerHTML=''; 
    
    if(!today){ 
        enter.style.display='none'; 
        view.style.display='block'; 
        content.innerHTML='<p class="note">الخلوة مغلقة لهذا اليوم، أشوفك بكرة ❤️</p>'; 
        qArea.innerHTML=''; 
        choices.innerHTML=''; 
        return; 
    } 
    
    enter.style.display='none'; 
    view.style.display='block'; 
    
    if(today.type==='text') content.innerHTML='<div class="note">'+(today.content||'')+'</div>'; 
    else if(today.type==='image') content.innerHTML='<img src="'+today.content+'" style="max-width:100%;border-radius:8px">'; 
    else if(today.type==='pdf') content.innerHTML='<a class="note" href="'+today.content+'" target="_blank">فتح ملف PDF</a>'; 
    
    qArea.innerHTML=''; 
    choices.innerHTML=''; 
    
    if(today.question && today.question.text){ 
        qArea.innerHTML='<div class="note"><strong>السؤال:</strong> '+today.question.text+'</div>'; 
        today.question.options.forEach((opt,i)=>{ 
            const b=document.createElement('button'); 
            b.className='option-btn'; 
            b.innerText=(i+1)+'. '+opt; 
            b.onclick=()=>handleAnswer(cls,name,i); 
            choices.appendChild(b); 
        }); 
    } 
    
    const students=LS.get('students')||{}; 
    const s=(students[cls]||[]).find(x=>x.name===name); 
    const pts=(s && s.points)? s.points : 0; 
    scoreEl.innerHTML = '<div class="score-display">نقاطك الحالية: <strong>' + pts + ' ⭐</strong></div>'; 
}

function handleAnswer(cls,name,answerIndex){ 
    const students=LS.get('students')||{}; 
    const list=students[cls]||[]; 
    const student=list.find(s=>s.name===name); 
    const all=LS.get('kholwat')||[]; 
    const today=all.find(x=>x.date===todayDate()); 
    
    if(!today){ 
        alert('الخلوة مغلقة'); 
        return; 
    } 
    
    if(!student) return alert('الطفل غير مسجل'); 
    
    student.answeredDates=student.answeredDates||[]; 
    if(!student.answeredDates.includes(today.date)) student.answeredDates.push(today.date); 
    
    const history=LS.get('history')||[]; 
    const latest=history.find(h=>h.date===today.date); 
    if(latest){ 
        latest.answers = latest.answers || {'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]}; 
        if(!latest.answers[cls].includes(student.name)) latest.answers[cls].push(student.name); 
        latest.qaResponses = latest.qaResponses || {'1':{},'2':{},'3':{},'4':{},'5':{},'6':{}}; 
        latest.qaResponses[cls][student.name] = answerIndex+1; 
        LS.set('history',history); 
    } 
    
    const correct = today.question && (answerIndex === today.question.correctIndex); 
    const resultArea=document.getElementById('resultArea'); 
    
    if(correct){ 
        const pts = today.points || LS.get('pointsPerKholwa') || 10; 
        student.points = (student.points||0) + pts; 
        resultArea.innerHTML = '<div class="center success-msg">برافو، بنحبك ❤️<br><strong>حصلت على +' + pts + ' نقطة</strong></div>'; 
    } else { 
        resultArea.innerHTML = '<div class="center">بنحبك، حاول مرة تاني 💪</div>'; 
    } 
    
    students[cls]=list; 
    LS.set('students',students); 
    loadTeacherStatus(cls); 
    loadReport(); 
    refreshLeaderboard(); 
}

function loadReport(){ 
    const students=LS.get('students')||{}; 
    let html='<table class="table"><tr><th>الفصل</th><th>الاسم</th><th>نقاط</th><th>عدد الخلوات</th></tr>'; 
    const history=LS.get('history')||[]; 
    const total=history.length; 
    Object.keys(students).forEach(cls=>{ 
        students[cls].forEach(s=>{ 
            const cnt=(s.answeredDates||[]).length; 
            const pts=(s.points||0); 
            html+='<tr><td>'+cls+'</td><td>'+s.name+'</td><td>'+pts+'</td><td>'+cnt+' من '+total+'</td></tr>'; 
        }); 
    }); 
    html+='</table>'; 
    document.getElementById('reportArea').innerHTML=html; 
}

function loadTeacherStatus(cls){ 
    const students=LS.get('students')||{}; 
    const list=students[cls]||[]; 
    const all=LS.get('kholwat')||[]; 
    const today=all.find(x=>x.date===todayDate()); 
    let html=''; 
    if(!today) html+='<p class="note">الخلوة مغلقة لهذا اليوم، أشوفك بكرة ❤️</p>'; 
    else{ 
        html+='<ul>'; 
        list.forEach(s=>{ 
            const done=(s.answeredDates||[]).includes(today.date)?'✅':'❌'; 
            html+='<li>'+s.name+' — '+done+'</li>'; 
        }); 
        html+='</ul>'; 
    } 
    document.getElementById('teacherStatus').innerHTML=html; 
}

function refreshHistory(){ 
    const history=LS.get('history')||[]; 
    const c=document.getElementById('historyList'); 
    if(!history.length){ 
        c.innerHTML='<p class="note">لا توجد أيام</p>'; 
        return; 
    } 
    let html=''; 
    history.slice().reverse().forEach(h=>{ 
        html+='<div style="padding:6px;border-bottom:1px solid rgba(255,255,255,0.02)"><strong>'+h.date+'</strong> — '+(h.title||'خلوة')+' — نقاط: '+(h.points||LS.get('pointsPerKholwa')||10)+'</div>'; 
    }); 
    c.innerHTML=html; 
}

function refreshLeaderboard(){ 
    const students=LS.get('students')||{}; 
    let arr=[]; 
    Object.keys(students).forEach(cls=>{ 
        students[cls].forEach(s=>{ 
            arr.push({name:s.name, class:cls, points:s.points||0}); 
        }); 
    }); 
    arr.sort((a,b)=>b.points - a.points); 
    const list = document.getElementById('leaderList'); 
    if(!list) return; 
    if(!arr.length){ 
        list.innerHTML='<p class="note">لا توجد بيانات</p>'; 
        return; 
    } 
    let html=''; 
    arr.forEach((it,idx)=>{ 
        let medal = '';
        if(idx === 0) medal = ' 🥇';
        else if(idx === 1) medal = ' 🥈'; 
        else if(idx === 2) medal = ' 🥉';
        html += '<li class="leader-item"><div>'+(idx+1)+'. '+it.name+' <small>(فصل '+it.class+')</small></div><div>'+it.points+' نقطة'+medal+'</div></li>'; 
    }); 
    list.innerHTML = html; 
}

function resetAll(){ 
    if(!confirm('هل تريد تصفير جميع البيانات؟')) return; 
    LS.set('kholwat',[]); 
    LS.set('history',[]); 
    LS.set('students',{'1':[],'2':[],'3':[],'4':[],'5':[],'6':[]}); 
    LS.set('teachers',[]); 
    localStorage.removeItem('data.json'); 
    alert('تم التصفير'); 
    location.reload(); 
}

function previewKholwaToday(){ 
    const all=LS.get('kholwat')||[]; 
    const today = all.find(x=>x.date===todayDate()); 
    if(today) previewObject(today); 
    else alert('لا توجد خلوة لليوم'); 
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', ()=>{ 
    refreshAll(); 
    document.getElementById('leaderBtn').onclick = ()=> showPanel('leader'); 
    document.getElementById('leaderBack').onclick = ()=> goHome(); 
}); 

function refreshAll(){ 
    loadAdminList(); 
    refreshHistory(); 
    loadReport(); 
    refreshLeaderboard(); 
}
[file content end]
