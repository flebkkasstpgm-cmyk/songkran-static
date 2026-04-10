document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('water-stage');
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
    let currentGalleryIndex = 0;
    let currentMonkIndex = 0;
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

    // 3. วัตถุลอย (Main Stage)
    function createFloatingItem(name, bless, type) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        item.innerHTML = `<div class="b-info"><b>${name}:</b> ${bless}</div><img src="${type}.png" class="item-img">`;
        stage.appendChild(item);
        
        function startFloating() {
            item.style.top = `${45 + Math.random() * 35}%`;
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
                    drop.style.left = '25px'; drop.style.top = '60px'; // ปรับจุดออกของน้ำให้ตรงขัน
                    drop.style.setProperty('--dx', `${-15 + (Math.random() * 30)}px`); // กระจายตัวรอบๆ กึ่งกลาง
                    drop.style.setProperty('--dy', `${100 + Math.random() * 50}px`); // ไหลลงล่าง
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

    // 6. Sync (ดึงข้อมูล)
    async function syncBlessings() {
        try {
            console.log("Syncing with Server...");
            const response = await fetch(API_URL + "?t=" + Date.now(), { method: 'GET', cache: 'no-store' });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                allPhotoBlessings = data.filter(d => d.mode === 'photo');
                const monkData = data.filter(d => d.mode === 'monk' || d.type === 'monk');
                
                if (monkData.length > 0) {
                    allMonkBlessings = monkData;
                    localStorage.setItem('jarvis_monk_names', JSON.stringify(monkData));
                    if (!isMonkAnimating) updateMonkLoop();
                }

                // กรองเฉพาะที่เป็น item จริงๆ เท่านั้น (ห้ามเอา monk หรือ photo มาวิ่งข้างล่าง)
                data.filter(d => (d.mode === 'item' || !d.mode) && d.type !== 'monk' && d.type !== 'photo').forEach(item => {
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
            }
        } catch (e) { 
            console.error("Sync Error:", e);
            // ถ้าดึงไม่ได้ ให้ใช้ข้อมูลในเครื่องไปก่อน
            if (allMonkBlessings.length > 0 && !isMonkAnimating) updateMonkLoop();
        }
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
});
