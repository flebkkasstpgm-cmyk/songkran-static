document.addEventListener('DOMContentLoaded', () => {
    const waterStage = document.getElementById('water-stage');
    const seamsiStage = document.getElementById('seamsi-stage');
    const cloudContainer = document.getElementById('clouds');
    const modal = document.getElementById('bless-modal');
    const openBtn = document.getElementById('open-bless-modal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('bless-form');
    const galleryContent = document.getElementById('gallery-content');
    const monkActionContainer = document.getElementById('monk-action-container');

    // --- Config ---
    const API_URL = 'https://script.google.com/macros/s/AKfycbw0Pkzre5QDe45LBsUTkegA-nxWZtMYvS5MIeLKD6eE1-4R7eqzCF9wc39tIhpm7vAr/exec';
    
    // --- State ---
    let displayedIds = new Set();
    let allPhotoBlessings = []; 
    let allMonkBlessings = JSON.parse(localStorage.getItem('jarvis_monk_names') || '[]'); 
    let allSeamsiBlessings = [];
    let currentGalleryIndex = 0;
    let currentMonkIndex = 0;
    let currentSeamsiIndex = 0;
    let isMonkAnimating = false;
    let currentMode = 'item';

    // --- Mode Selection ---
    const modeBtns = document.querySelectorAll('.mode-btn');
    const itemFields = document.getElementById('item-fields');
    const photoFields = document.getElementById('photo-fields');
    const blessingGroup = document.getElementById('blessing-group');
    const blessingInput = document.getElementById('blessing');

    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            itemFields.style.display = currentMode === 'item' ? 'block' : 'none';
            photoFields.style.display = currentMode === 'photo' ? 'block' : 'none';
            blessingGroup.style.display = currentMode === 'monk' ? 'none' : 'block';
            blessingInput.required = currentMode !== 'monk';
        };
    });

    // 1. ก้อนเมฆ
    function createClouds() {
        for (let i = 0; i < 15; i++) {
            const group = document.createElement('div');
            group.className = 'cloud-group';
            const top = Math.random() * 45;
            group.style.top = `${top}%`;
            group.style.animationDuration = `${50 + Math.random() * 70}s`;
            group.style.animationDelay = `${Math.random() * -100}s`;
            cloudContainer.appendChild(group);
        }
    }

    // 2. Modal
    if (openBtn) openBtn.onclick = () => modal.style.display = 'block';
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; form.reset(); };
    window.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; form.reset(); } };

    // 3. วัตถุลอย (Main Stage - เลนล่าง)
    function createFloatingItem(name, bless, type) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        item.innerHTML = `<div class="b-info"><b>${name}:</b> ${bless}</div><img src="${type}.png" class="item-img">`;
        waterStage.appendChild(item);
        
        function startFloating() {
            item.style.top = `${10 + Math.random() * 70}%`;
            const anim = item.animate([{ left: '-300px' }, { left: '110vw' }], { duration: (20 + Math.random() * 15) * 1000, easing: 'linear' });
            anim.onfinish = () => startFloating();
        }
        startFloating();
    }

    // 4. สรงน้ำพระ (Monk Animation)
    function animateMonkBathing(name) {
        if (isMonkAnimating) return;
        isMonkAnimating = true;

        monkActionContainer.innerHTML = `
            <div class="hand-container"><img src="hand.png" class="hand-img"></div>
            <div class="monk-user-name">คุณ ${name} สรงน้ำพระ 🙏</div>
        `;

        const hand = monkActionContainer.querySelector('.hand-container');
        const nameLabel = monkActionContainer.querySelector('.monk-user-name');

        setTimeout(() => {
            hand.classList.add('active');
            nameLabel.classList.add('active');
            
            const waterInterval = setInterval(() => {
                for(let i=0; i<4; i++) {
                    const drop = document.createElement('div');
                    drop.className = 'monk-water';
                    drop.style.left = '25px'; drop.style.top = '60px';
                    drop.style.setProperty('--dx', `${-15 + (Math.random() * 30)}px`);
                    drop.style.setProperty('--dy', `${100 + Math.random() * 50}px`);
                    hand.appendChild(drop);
                    setTimeout(() => drop.remove(), 800);
                }
            }, 150);

            setTimeout(() => {
                clearInterval(waterInterval);
                hand.classList.remove('active');
                nameLabel.classList.remove('active');
                setTimeout(() => { isMonkAnimating = false; monkActionContainer.innerHTML = ''; updateMonkLoop(); }, 800);
            }, 5500);
        }, 100);
    }

    function updateMonkLoop() {
        if (allMonkBlessings.length === 0 || isMonkAnimating) return;
        const data = allMonkBlessings[currentMonkIndex];
        if (data && data.name) {
            animateMonkBathing(data.name);
            currentMonkIndex = (currentMonkIndex + 1) % allMonkBlessings.length;
        }
    }

    // 5. Gallery
    function updateGallery() {
        if (allPhotoBlessings.length === 0) return;
        const data = allPhotoBlessings[currentGalleryIndex];
        const newItem = document.createElement('div');
        newItem.className = 'gallery-item';
        newItem.innerHTML = `<img src="${data.photo || 'logo.png'}" class="staff-photo"><div class="staff-msg"><span class="staff-name">คุณ ${data.name}</span><p class="staff-text">" ${data.bless} "</p></div>`;
        const oldItem = galleryContent.querySelector('.gallery-item');
        if (oldItem) { oldItem.classList.add('exit'); setTimeout(() => oldItem.remove(), 800); }
        galleryContent.appendChild(newItem);
        setTimeout(() => newItem.classList.add('active'), 50);
        currentGalleryIndex = (currentGalleryIndex + 1) % allPhotoBlessings.length;
    }

    // 5.1 Seamsi Cabinet (Latest results)
    const seamsiDisplay = document.getElementById('seamsi-display-content');
    function updateSeamsiCabinet() {
        if (allSeamsiBlessings.length === 0) return;
        const data = allSeamsiBlessings[currentSeamsiIndex];
        const fortuneIdx = parseInt(data.bless.replace(/\D/g, '')) - 1;
        if (fortuneIdx < 0 || fortuneIdx >= fortunes.length) {
            currentSeamsiIndex = (currentSeamsiIndex + 1) % allSeamsiBlessings.length;
            return;
        }
        const fortune = fortunes[fortuneIdx];
        
        const newItem = document.createElement('div');
        newItem.className = 'cabinet-item';
        newItem.innerHTML = `
            <span class="c-num">ใบที่ ${fortuneIdx + 1}</span>
            <span class="c-name">คุณ ${data.name}</span>
            <div class="c-text">
                <p>${fortune[0]}</p>
                <p>${fortune[1]}</p>
                <p>${fortune[2]}</p>
                <p>${fortune[3]}</p>
            </div>
        `;

        const oldItem = seamsiDisplay.querySelector('.cabinet-item');
        if (oldItem) { 
            oldItem.classList.remove('active'); 
            setTimeout(() => oldItem.remove(), 600); 
        } else if (seamsiDisplay.querySelector('.empty')) {
            seamsiDisplay.innerHTML = '';
        }

        seamsiDisplay.appendChild(newItem);
        setTimeout(() => newItem.classList.add('active'), 50);
        currentSeamsiIndex = (currentSeamsiIndex + 1) % allSeamsiBlessings.length;
    }

    // 6. Sync (ดึงข้อมูล)
    async function syncBlessings() {
        try {
            console.log("Syncing with Server...");
            const response = await fetch(API_URL + "?t=" + Date.now(), { method: 'GET', cache: 'no-store' });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                allPhotoBlessings = data.filter(d => d.mode === 'photo');
                allSeamsiBlessings = data.filter(d => d.mode === 'seamsi' || d.type === 'seamsi');
                const monkData = data.filter(d => d.mode === 'monk' || d.type === 'monk');
                
                if (monkData.length > 0) {
                    allMonkBlessings = monkData;
                    localStorage.setItem('jarvis_monk_names', JSON.stringify(monkData));
                    if (!isMonkAnimating) updateMonkLoop();
                }

                data.filter(d => (d.mode === 'item' || !d.mode) && d.type !== 'monk' && d.type !== 'photo' && d.type !== 'seamsi').forEach(item => {
                    const id = `${item.name}-${item.time}`;
                    if (!displayedIds.has(id)) {
                        createFloatingItem(item.name, item.bless, item.type || 'silver');
                        displayedIds.add(id);
                    }
                });

                if (allPhotoBlessings.length > 0 && galleryContent.querySelector('.empty')) {
                    galleryContent.innerHTML = '';
                    updateGallery();
                }

                if (allSeamsiBlessings.length > 0 && seamsiDisplay.querySelector('.empty')) {
                    updateSeamsiCabinet();
                }
            }
        } catch (e) { 
            console.error("Sync Error:", e);
            if (allMonkBlessings.length > 0 && !isMonkAnimating) updateMonkLoop();
        }
    }

    // ฟังก์ชันสร้างใบเซียมซีลอยฟ้า (เลนบน)
    function createSeamsiFloat(name, fortuneIdx) {
        if (fortuneIdx < 0 || fortuneIdx >= fortunes.length) return;
        const fortune = fortunes[fortuneIdx];
        const item = document.createElement('div');
        item.className = 'seamsi-float';
        item.innerHTML = `
            <div class="s-card">
                <div class="s-header">ใบเซียมซีที่ ${fortuneIdx + 1}</div>
                <div class="s-user">คุณ ${name}</div>
                <div class="s-text">
                    <p>${fortune[0]}</p>
                    <p>${fortune[1]}</p>
                    <p>${fortune[2]}</p>
                    <p>${fortune[3]}</p>
                </div>
            </div>
        `;
        seamsiStage.appendChild(item);

        function startFloating() {
            item.style.top = `${5 + Math.random() * 55}%`; 
            const anim = item.animate([{ left: '-500px' }, { left: '110vw' }], { 
                duration: 35000, 
                easing: 'linear' 
            });
            anim.onfinish = () => item.remove();
        }
        startFloating();
    }

    // 7. Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        try {
            const name = document.getElementById('username').value;
            const mode = currentMode;
            let photo = "";
            if (mode === 'photo') {
                const file = document.getElementById('user-photo').files[0];
                if (file) {
                    photo = await new Promise(r => {
                        const reader = new FileReader();
                        reader.onload = () => r(reader.result);
                        reader.readAsDataURL(file);
                    });
                }
            }
            const payload = { mode, name, bless: mode === 'monk' ? "สรงน้ำพระ" : document.getElementById('blessing').value, type: mode === 'item' ? document.querySelector('input[name="i-type"]:checked').value : mode, photo };
            
            if (mode === 'monk') { 
                allMonkBlessings.push({ name }); 
                localStorage.setItem('jarvis_monk_names', JSON.stringify(allMonkBlessings));
                if (!isMonkAnimating) updateMonkLoop(); 
            }

            await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
            form.reset(); modal.style.display = 'none';
            setTimeout(syncBlessings, 2000);
        } finally { submitBtn.disabled = false; }
    };

    createClouds();
    syncBlessings();
    setInterval(syncBlessings, 20000);
    setInterval(updateGallery, 7000);
    setInterval(updateMonkLoop, 15000);
    setInterval(updateSeamsiCabinet, 8000);

    // --- Seamsi Logic ---
    const seamsiModal = document.getElementById('seamsi-modal');
    const openSeamsiBtn = document.getElementById('open-seamsi-modal');
    const startShakeBtn = document.getElementById('start-shake');
    const seamsiCup = document.getElementById('seamsi-cup');
    const seamsiSetup = document.getElementById('seamsi-setup');
    const seamsiAnim = document.getElementById('seamsi-animation');
    const resOverlay = document.getElementById('seamsi-result-overlay');
    
    const fortunes = [
        ["ดวงเฮงดั่งอาทิตย์ส่อง", "โชคลาภลอยมาไม่ต้องรอ", "การงานราบรื่นไร้อุปสรรค", "ความรักสดใสใจเบิกบาน"],
        ["เงินทองไหลมาเทมา", "มีคนเมตตาอุปถัมภ์", "สุขภาพแข็งแรงไร้โรคภัย", "คิดหวังสิ่งใดสมปรารถนา"],
        ["เคราะห์ร้ายกำลังจะผ่าน", "โชคใหญ่กำลังจะมาถึง", "อดทนอีกนิดจะสำเร็จ", "มีเกณฑ์ได้เดินทางไกล"],
        ["ศัตรูจะกลับกลายเป็นมิตร", "ผู้ใหญ่ให้ลาภยศสรรเสริญ", "ค้าขายได้กำไรงดงาม", "ครอบครัวอยู่เย็นเป็นสุข"],
        ["อย่ารีบร้อนในการตัดสินใจ", "ฟังคำเตือนจากคนใกล้ชิด", "โชคลาภมาจากทิศตะวันออก", "การเงินเริ่มมั่นคงขึ้น"],
        ["บุญเก่าหนุนนำนำทาง", "พ้นทุกข์พ้นโศกโชคดี", "งานที่ทำจะสำเร็จผล", "คนรักคอยดูแลไม่ห่าง"],
        ["ลาภลอยมีมาประปราย", "อย่าไว้ใจคนแปลกหน้า", "ตั้งใจทำงานจะก้าวหน้า", "สุขภาพดีคือลาภอันประเสริฐ"],
        ["ฟ้าหลังฝนย่อมสดใส", "ปัญหาที่มีจะคลี่คลาย", "โชคดีรออยู่ที่บ้าน", "มีคนนำข่าวดีมาให้"],
        ["ดั่งมังกรผงาดฟ้า", "บารมีแผ่ก้องกังวาน", "ศัตรูพ่ายแพ้ภัยตน", "โชคลาภผลพูนทวี"],
        ["ดอกไม้บานรับอรุณ", "เริ่มสิ่งใหม่จะสดใส", "กัลยาณมิตรคอยชี้แนะ", "ลาภยศรออยู่ไม่ไกล"],
        ["ทรัพย์สินเพิ่มพูนทวี", "มีกินมีใช้ไม่ขาดมือ", "การเจรจาจะสำเร็จผล", "ความสุขล้นพ้นทวีคูณ"],
        ["เทวดาคุ้มครองป้องกัน", "ปลอดภัยจากภยันตราย", "สติปัญญาเฉลียวฉลาด", "โชคดีมีชัยทุกทิศทาง"],
        ["ดั่งธาราน้ำไหลเย็น", "ชีวิตสงบสุขร่มเย็น", "ความขัดแย้งจะมลายหาย", "ได้โชคจากคนใกล้ตัว"],
        ["ความพยายามอยู่ที่ไหน", "ความสำเร็จอยู่ที่นั่น", "เหนื่อยวันนี้สบายวันหน้า", "มีลาภจากการทำงาน"],
        ["บุญวาสนามาเกื้อหนุน", "หยิบจับอะไรเป็นเงินทอง", "มีคนนำลาภมาส่งถึงที่", "สุขภาพจิตแจ่มใส"],
        ["ดั่งจันทร์กระจ่างฟ้า", "มีเสน่ห์แก่คนทั้งหลาย", "คนรักคอยประคับประคอง", "ชื่อเสียงจะโด่งดัง"],
        ["ขุมทรัพย์อยู่ใกล้ตัว", "อย่ามองข้ามสิ่งเล็กน้อย", "ลาภลอยมีมาให้เห็น", "ความฝันจะกลายเป็นจริง"],
        ["ทางสะดวกราบรื่น", "ไม่มีขวากหนามขวางกั้น", "การลงทุนจะเห็นผลกำไร", "ครอบครัวรักใคร่กลมเกลียว"],
        ["ได้พบกัลยาณมิตร", "คนดีศรีรัตนโกสินทร์", "มีโอกาสใหม่ๆ เข้ามา", "พ้นภัยพาลทั้งปวง"],
        ["สิ่งศักดิ์สิทธิ์ให้พร", "สมหวังในสิ่งที่ขอ", "โชคดีรับปีใหม่ไทย", "เจริญรุ่งเรืองถาวร"],
        ["ปัญหาสิ้นสุดลง", "รุ่งอรุณแห่งความสุขมาถึง", "มีเกณฑ์ได้ของขวัญใหญ่", "มีความสุขทางกายใจ"],
        ["ดวงชะตาพุ่งแรง", "ทำอะไรก็รุ่งเรือง", "มีลาภก้อนโตมารอ", "พ้นจากทุกข์โศกโรคภัย"],
        ["สติมาปัญญาเกิด", "ทางสว่างอยู่ข้างหน้า", "ได้รับการช่วยเหลือจากผู้ใหญ่", "มีความมั่นคงในชีวิต"],
        ["ดั่งต้นไม้ออกดอกผล", "เก็บเกี่ยวผลสำเร็จที่ทำมา", "ชีวิตมั่งคั่งร่ำรวย", "มีความสุขกับครอบครัว"],
        ["โชคลาภมาจากต่างถิ่น", "มีเกณฑ์ได้ลาภจากการเดินทาง", "การงานขยับขยายใหญ่โต", "สุขภาพแข็งแรงดีเยี่ยม"],
        ["ความดีที่ทำไว้", "จะส่งผลให้ได้รับลาภ", "มีคนสรรเสริญเยินยอ", "ความรักหวานชื่น"],
        ["ดั่งเพชรน้ำหนึ่ง", "มีค่าในสายตาผู้ใหญ่", "จะได้รับตำแหน่งงานใหม่", "โชคลาภหลั่งไหลมา"],
        ["ปิดท้ายด้วยมหาโชค", "รวมความดีงามทั้งปวง", "ชีวิตสดใสไร้กังวล", "เป็นเศรษฐีในเร็ววัน"],
        ["เมฆหมอกสลายไป", "แสงทองส่องสว่างนำทาง", "ปัญหาที่มีจะคลี่คลาย", "โชคลาภมาเยือนถึงบ้าน"],
        ["เหมือนเรือได้ลมส่ง", "แล่นฉิวสู่จุดหมายปลายทาง", "ผู้ใหญ่ให้โอกาสสำคัญ", "การเงินเริ่มขยับขยาย"],
        ["แก้วแหวนเงินทองมากมี", "บารมีแผ่กว้างขวาง", "มีชื่อเสียงเกียรติยศ", "สุขภาพใจกายสมบูรณ์"],
        ["ดั่งนกอินทรีบินสูง", "มองการณ์ไกลไม่พลาดพลั้ง", "โชคลาภอยู่ข้างหน้า", "ความพยายามจะเป็นผล"],
        ["น้ำพึ่งเรือเสือพึ่งป่า", "บริวารคอยช่วยเหลือดี", "การค้ารุ่งเรืองรุดหน้า", "ได้พบมิตรแท้ที่ดี"],
        ["ดั่งทองคำล้ำค่า", "มีคนเมตตาเอ็นดูมาก", "การตัดสินใจจะถูกต้อง", "ได้โชคลาภแบบไม่คาดฝัน"],
        ["ขยันขันแข็งได้ดี", "งานที่ทำจะก้าวหน้า", "โชคลาภมาจากความเพียร", "ชีวิตมั่นคงถาวร"],
        ["สมหวังดังใจปอง", "ไม่ต้องรอคอยนานเกิน", "ความขัดแย้งจะยุติลง", "ได้ลาภจากผู้ใหญ่"],
        ["เหมือนม้าศึกมีพลัง", "รุดหน้าสู่ความสำเร็จ", "ไม่มีใครขวางกั้นได้", "โชคลาภมีมาต่อเนื่อง"],
        ["ใจเย็นจะได้พรใหญ่", "รอคอยอีกนิดจะสมปรารถนา", "ลาภก้อนโตอยู่ไม่ไกล", "ความรักราบรื่นดี"],
        ["ดั่งทับทิมน้ำงาม", "ส่องแสงประทับใจผู้คน", "ได้รับคำชมเชยจากงาน", "มีเกณฑ์ได้ลาภลอย"],
        ["เทพไท้เทวาอำนวยพร", "แคล้วคลาดปลอดภัยทุกประการ", "สมบูรณ์ด้วยทรัพย์สิน", "พ้นทุกข์พ้นภัยทั้งปวง"],
        ["เมตตามหานิยม", "ไปไหนมีแต่คนรักใคร่", "เจรจาพาทีมีเสน่ห์", "ได้ลาภจากการพูดจา"],
        ["ดั่งต้นโพธิ์ต้นไทร", "ให้ความร่มเย็นแก่ผู้อื่น", "บุญบารมีส่งผลดี", "ครอบครัวเป็นสุขยิ่ง"],
        ["สิ่งเก่าไปสิ่งใหม่มา", "การเริ่มต้นใหม่จะสดใส", "มีโอกาสดีเข้ามาหา", "ความเศร้าจะเลือนหาย"],
        ["โชคลาภมาตามนัด", "ไม่ผิดหวังในสิ่งที่รอ", "การเงินไหลลื่นไม่ติดขัด", "สุขภาพดีวันดีคืน"],
        ["ดั่งดวงดาราสุกใส", "โดดเด่นในสายตาผู้คน", "ความสำเร็จรออยู่ที่หน้า", "มีเกณฑ์ได้รับข่าวดี"],
        ["ใจเป็นนายกายเป็นบ่าว", "คุมสติได้จะชนะทุกสิ่ง", "งานใหญ่จะสำเร็จผล", "มีลาภจากปัญญาตน"],
        ["เหมือนได้พบขุมทอง", "หยิบจับอะไรก็เป็นเงิน", "มีเสน่ห์ดึงดูดโชคลาภ", "ความรักหวานชื่นใจ"],
        ["ทางเดินสีกุหลาบ", "ชีวิตราบรื่นสวยงาม", "ได้รับความสะดวกสบาย", "มีโชคลาภมาเยือน"],
        ["มุ่งมั่นสู่เป้าหมาย", "ไม่มีอะไรมาขวางได้", "ความสำเร็จเป็นของผู้กล้า", "ได้รับรางวัลใหญ่"],
        ["ดั่งหงส์เริงระบำ", "สง่างามเหนือใครๆ", "มีเกณฑ์ได้ตำแหน่งสูง", "ลาภยศหลั่งไหลมา"],
        ["สติมาโชคก็มา", "แก้ไขปัญหาได้ลุล่วง", "ได้รับคำแนะนำที่ดี", "การเงินเริ่มมั่นคง"],
        ["บุญเก่าหนุนนำส่ง", "วาสนาดีกว่าใครเพื่อน", "มีคนอุปถัมภ์ค้ำชู", "โชคลาภมีมาไม่ขาด"],
        ["ทางสว่างอยู่ข้างหน้า", "ก้าวเดินไปอย่างมั่นใจ", "ความพยายามไม่เสียเปล่า", "ได้พบความสุขแท้จริง"],
        ["ดั่งน้ำค้างพราวพร่าง", "ชีวิตสดชื่นเบิกบานใจ", "เริ่มวันใหม่ด้วยสิ่งดี", "มีลาภจากทิศเหนือ"],
        ["เหมือนได้ชัยชนะใหญ่", "สิ่งที่สู้จะสำเร็จผล", "ศัตรูถอยร่นพ่ายแพ้", "ชื่อเสียงจะขจรขจาย"],
        ["ลาภมาจากความซื่อสัตย์", "ทำดีได้ดีเห็นผลเร็ว", "บริวารซื่อสัตย์ภักดี", "ครอบครัวอบอุ่นใจ"],
        ["ดั่งมณีมีค่า", "เป็นที่รักของคนรอบข้าง", "ได้รับความเมตตาปรานี", "โชคลาภมีมาให้เห็น"],
        ["ใจสว่างทางก็โล่ง", "ไม่มีอุปสรรคใดขวาง", "การงานเดินหน้าเต็มที่", "มีความสุขทุกค่ำเช้า"],
        ["เหมือนได้แก้วสารพัดนึก", "นึกเงินได้เงินนึกทองได้ทอง", "ความปรารถนาจะเป็นจริง", "โชคดีรับสงกรานต์"],
        ["ดั่งแสงเทียนนำทาง", "พ้นจากความมืดมนใจ", "ได้พบทางออกที่ดี", "มีความเจริญรุ่งเรือง"],
        ["โชคดีมากับชื่อเสียง", "คนยกย่องสรรเสริญมาก", "ได้เกียรติยศระดับสูง", "ลาภยศเพิ่มพูนทวี"],
        ["ดั่งต้นไม้อิ่มน้ำ", "ชุ่มฉ่ำเย็นใจยิ่งนัก", "ความขัดแย้งจะคลี่คลาย", "มีลาภจากบริวาร"],
        ["ความสำเร็จรอที่ปลายทาง", "อย่าท้อถอยกลางคัน", "โชคลาภเป็นของผู้ทน", "ชีวิตจะดีขึ้นทันตา"],
        ["เหมือนฟ้าเปิดทางให้", "ทำอะไรก็สะดวกโยธิน", "โชคลาภไหลมาเทมา", "มีความสุขสันต์ยิ่ง"],
        ["ดั่งนกยูงรำแพน", "มีเสน่ห์เย้ายวนใจคน", "ความรักจะสมบูรณ์สุข", "มีเกณฑ์ได้โชคลาภลอย"],
        ["สู้แล้วจะรวย", "อย่ามัวแต่นั่งรอโชค", "ความขยันจะพารุ่งเรือง", "การเงินจะมั่งคั่ง"],
        ["เหมือนได้เพชรน้ำเอก", "มีคุณค่ามหาศาล", "ได้รับมอบหมายงานใหญ่", "โชคลาภอยู่ไม่ไกลตัว"],
        ["ดั่งดาวล้อมเดือน", "มีเพื่อนพ้องคอยช่วย", "ไม่โดดเดี่ยวอ้างว้าง", "มีโชคจากมิตรสหาย"],
        ["วาสนาดีไม่มีหมด", "กินใช้ไม่รู้สิ้น", "มีเกณฑ์ได้มรดกใหญ่", "ความสุขทวีคูณยิ่ง"],
        ["ดั่งดอกบัวพ้นน้ำ", "บริสุทธิ์สดใสยิ่งนัก", "ปัญหาที่มีจะหายไป", "โชคลาภมารอที่บ้าน"],
        ["เหมือนได้ครองชัยชนะ", "เก่งกาจเหนือคนอื่น", "การงานก้าวหน้าไกล", "ได้ลาภจากแดนไกล"],
        ["ลาภลอยมีมาบ่อย", "ดวงกำลังขึ้นสุดขีด", "หยิบจับอะไรก็เฮง", "มีความสุขสดใสใจ"],
        ["ดั่งช้างเอราวัณ", "แข็งแกร่งและมีบารมี", "ศัตรูยำเกรงมาก", "โชคลาภมาพร้อมยศถา"],
        ["พ้นจากทุกข์โศกภัย", "มีแต่ความสุขเข้ามา", "สุขภาพจะดีขึ้นมาก", "ลาภลอยมีมาเนืองๆ"],
        ["ดั่งนกน้อยในไร่ส้ม", "มีความอุดมสมบูรณ์", "ไม่อดไม่อยากลำบาก", "โชคลาภมาทุกฤดู"],
        ["ความอดทนเป็นเลิศ", "ความสำเร็จจะตามมา", "อย่าได้ละความพยายาม", "โชคใหญ่รออยู่ที่นี่"],
        ["เหมือนได้ขี่ม้าก้านกล้วย", "สนุกสนานรื่นเริงใจ", "ชีวิตมีแต่ความบันเทิง", "มีโชคจากเด็กน้อย"],
        ["ดั่งเทียนพรรษา", "ส่องสว่างนิ่งสงบ", "ชีวิตมั่นคงในธรรม", "มีความเจริญสถาพร"],
        ["ลาภใหญ่มาจากคู่ครอง", "ความรักส่งเสริมดวง", "ช่วยกันสร้างฐานะดี", "มีความสุขสำราญใจ"],
        ["ดั่งนกกระเรียนพันปี", "อายุยืนนานสุขภาพดี", "ไม่มีโรคภัยมาเบียดเบียน", "โชคลาภมีมาถาวร"],
        ["เหมือนได้ขุมทรัพย์ดิน", "ผลผลิตงอกงามยิ่ง", "ทำกิจการใดก็รุ่ง", "ลาภผลพูนทวีคูณ"],
        ["ดั่งดวงประทีปส่อง", "สว่างไสวไม่มืดมน", "ปัญหาจะจบลงด้วยดี", "โชคดีมีชัยตลอดไป"],
        ["ความมุ่งมั่นตั้งใจ", "จะพาไปสู่ความสำเร็จ", "อย่าได้ละทิ้งเป้าหมาย", "ลาภลอยรออยู่ข้างหน้า"],
        ["เหมือนได้กินรังนก", "บำรุงกายใจให้เข้มแข็ง", "สุขภาพดีคือลาภใหญ่", "มีความสุขเกษมสำราญ"],
        ["ดั่งราชสีห์ผู้เกรียงไกร", "อำนาจวาสนามหาศาล", "คนยำเกรงเคารพนับถือ", "โชคลาภมาพร้อมเกียรติ"],
        ["พ้นเคราะห์พ้นโศกเศร้า", "เริ่มวันใหม่ด้วยรอยยิ้ม", "มีเกณฑ์ได้รับข่าวดีมาก", "โชคลาภมารอรับ"],
        ["ดั่งมังกรคาบแก้ว", "มีของมีค่าในมือ", "การเงินจะรุ่งเรืองสุด", "โชคลาภหลั่งไหลมา"],
        ["เหมือนได้พรจากสวรรค์", "สิ่งศักดิ์สิทธิ์คุ้มครอง", "ทำอะไรก็สำเร็จพลัน", "มีความสุขสันต์ยิ่ง"],
        ["ดั่งต้นไผ่ที่แข็งแกร่ง", "ลู่ตามลมแต่ไม่หัก", "อดทนแล้วจะชนะ", "โชคลาภมาจากความแกร่ง"],
        ["ลาภมากับความสงบ", "ใจเย็นแล้วจะรวย", "ได้รับโชคก้อนใหญ่", "ความรักราบรื่นดี"],
        ["ดั่งเพชรที่ได้รับการเจียระไน", "โดดเด่นและมีราคาสูง", "การงานจะก้าวหน้ามาก", "มีเกณฑ์ได้ลาภลอย"],
        ["เหมือนได้ขี่เมฆบิน", "ชีวิตรวดเร็วทันใจ", "สำเร็จไวดั่งใจนึก", "มีโชคจากท้องฟ้า"],
        ["ดั่งดอกไม้หอมรัญจวน", "ชื่อเสียงกระจายไปไกล", "คนชื่นชมยินดีมาก", "ได้รับเกียรติยศใหญ่"],
        ["โชคดีทวีคูณเท่า", "ดวงเฮงไม่มีใครเกิน", "หยิบจับอะไรก็กำไร", "มีความสุขที่สุด"],
        ["ดั่งสายน้ำที่ไม่หยุดนิ่ง", "ชีวิตเคลื่อนไปสู่สิ่งดี", "โอกาสใหม่ๆ มีมาเสมอ", "โชคลาภไหลเวียนดี"],
        ["เหมือนได้ชัยชนะนิรันดร์", "ไร้อุปสรรคมาขวางกั้น", "การเงินมั่งคั่งถาวร", "มีความสุขชั่วนิรันดร์"],
        ["ดั่งจันทร์ในคืนเพ็ญ", "ส่องสว่างทั่วท้องฟ้า", "บริบูรณ์ด้วยลาภยศ", "สุขภาพใจกายดีเยี่ยม"],
        ["ลาภก้อนโตมารอรับ", "ปิดท้ายด้วยมหาโชค", "ชีวิตรุ่งโรจน์ถึงที่สุด", "เฮง เฮง เฮง ตลอดปี"]
    ];

    if(openSeamsiBtn) openSeamsiBtn.onclick = () => seamsiModal.style.display = 'block';
    if(document.getElementById('close-seamsi')) document.getElementById('close-seamsi').onclick = () => {
        seamsiModal.style.display = 'none';
        seamsiSetup.style.display = 'block';
        seamsiAnim.style.display = 'none';
    };

    if(startShakeBtn) startShakeBtn.onclick = () => {
        const name = document.getElementById('seamsi-username').value;
        if(!name) { alert("กรุณาใส่ชื่อก่อนเสี่ยงทายครับ"); return; }
        
        seamsiSetup.style.display = 'none';
        seamsiAnim.style.display = 'block';
        seamsiCup.classList.add('shaking');
        
        setTimeout(() => {
            seamsiCup.classList.remove('shaking');
            const randNum = Math.floor(Math.random() * fortunes.length);
            const fortune = fortunes[randNum];
            
            document.getElementById('res-num').innerText = randNum + 1;
            document.getElementById('res-name').innerText = name;
            document.getElementById('res-line1').innerText = fortune[0];
            document.getElementById('res-line2').innerText = fortune[1];
            document.getElementById('res-line3').innerText = fortune[2];
            document.getElementById('res-line4').innerText = fortune[3];
            
            seamsiModal.style.display = 'none';
            resOverlay.classList.add('active');
            
            let timeLeft = 30;
            const timerSpan = document.getElementById('res-timer');
            timerSpan.innerText = timeLeft;
            
            const countdown = setInterval(() => {
                timeLeft--;
                timerSpan.innerText = timeLeft;
                if(timeLeft <= 0) {
                    clearInterval(countdown);
                    resOverlay.classList.remove('active');
                }
            }, 1000);
            
            fetch(API_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify({ mode: 'seamsi', name, bless: "ใบที่ " + (randNum+1), type: 'seamsi' }) 
            });
            
            setTimeout(syncBlessings, 2000);
        }, 3000);
    };
});