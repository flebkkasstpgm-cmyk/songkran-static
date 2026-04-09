document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('water-stage');
    const cloudContainer = document.getElementById('clouds');
    const modal = document.getElementById('bless-modal');
    const openBtn = document.getElementById('open-bless-modal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('bless-form');
    const galleryContent = document.getElementById('gallery-content');

    // --- Mode Selection Logic ---
    const modeBtns = document.querySelectorAll('.mode-btn');
    const itemFields = document.getElementById('item-fields');
    const photoFields = document.getElementById('photo-fields');
    let currentMode = 'item';

    modeBtns.forEach(btn => {
        btn.onclick = () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            
            if (currentMode === 'item') {
                itemFields.style.display = 'block';
                photoFields.style.display = 'none';
            } else {
                itemFields.style.display = 'none';
                photoFields.style.display = 'block';
            }
        };
    });

    // --- Google Sheets API URL ---
    const API_URL = 'https://script.google.com/macros/s/AKfycbxQajKIlHfL2FETjnXhTP761GzYhGtFj3h5LmtfuDwpFo45BcLIVfmRulVWCKRDXdh7/exec';
    
    let displayedIds = new Set();
    let allPhotoBlessings = []; // สำหรับ Gallery Loop (เฉพาะคนที่มีรูป/โหมด Photo)
    let currentGalleryIndex = 0;

    // 1. ฟังก์ชันจัดการก้อนเมฆ (Animation)
    function createClouds() {
        for (let i = 0; i < 15; i++) {
            const group = document.createElement('div');
            group.className = 'cloud-group';
            for (let j = 0; j < 6; j++) {
                const puff = document.createElement('div');
                puff.className = 'cloud-puff';
                const size = 150 + Math.random() * 200;
                puff.style.width = `${size}px`; puff.style.height = `${size * 0.6}px`;
                puff.style.left = `${Math.random() * 200}px`; puff.style.top = `${Math.random() * 60}px`;
                group.appendChild(puff);
            }
            const top = Math.random() * 45;
            const duration = 50 + Math.random() * 70;
            group.style.top = `${top}%`;
            group.style.setProperty('animation-duration', `${duration}s`);
            group.style.setProperty('animation-delay', `${Math.random() * -100}s`);
            cloudContainer.appendChild(group);
        }
    }

    // 2. ระบบ Modal
    if (openBtn) openBtn.onclick = () => modal.style.display = 'block';
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; form.reset(); };
    window.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; form.reset(); } };

    // 3. ฟังก์ชันสร้างวัตถุอวยพร (ลอยในจอหลัก - สำหรับโหมด Item)
    function createFloatingItem(name, bless, type, isLoop = true) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        const imgSrc = `${type}.png`;
        
        item.innerHTML = `
            <div class="b-info"><b>${name}:</b> ${bless}</div>
            <img src="${imgSrc}" class="item-img" alt="${type}">
        `;

        stage.appendChild(item);

        // เอฟเฟกต์สาดน้ำ
        function createWater() {
            let dropCount = 3;
            if (type === 'gun') dropCount = 2;
            if (type === 'perfume') dropCount = 1;
            if (type === 'car' || type === 'motorcycle') dropCount = 5; // รถสาดน้ำเยอะขึ้น

            for (let i = 0; i < dropCount; i++) {
                const drop = document.createElement('div');
                drop.className = 'water-stream';
                if (type === 'perfume') drop.style.background = 'rgba(255, 241, 118, 0.8)';

                const size = 6 + Math.random() * 10;
                drop.style.width = `${size}px`; drop.style.height = `${size}px`;
                
                let dx, dy, startX, startY;
                if (type === 'gun') {
                    startX = 110; startY = 40;
                    dx = 150 + Math.random() * 150; dy = (Math.random() - 0.5) * 100;
                } else if (type === 'perfume') {
                    startX = 75; startY = 20;
                    dx = (Math.random() - 0.5) * 150; dy = 150 + Math.random() * 100;
                } else if (type === 'car' || type === 'motorcycle') {
                    startX = 75; startY = 80; // สาดน้ำจากพื้นรถ
                    dx = (Math.random() - 0.5) * 200; dy = 50 + Math.random() * 100;
                } else {
                    startX = 75; startY = 60;
                    dx = 80 + Math.random() * 120; dy = 200 + Math.random() * 150;
                }

                drop.style.setProperty('--dx', `${dx}px`); drop.style.setProperty('--dy', `${dy}px`);
                drop.style.left = `${startX}px`; drop.style.top = `${startY}px`;
                drop.style.animation = 'water-flow 0.8s ease-out forwards';
                item.appendChild(drop);
                setTimeout(() => drop.remove(), 800);
            }
        }
        const waterInterval = setInterval(createWater, type === 'gun' ? 150 : (type === 'perfume' ? 600 : 350));

        function startFloating() {
            const randomTop = 45 + Math.random() * 35;
            item.style.top = `${randomTop}%`;
            const duration = 20 + Math.random() * 15;
            
            // ปรับแต่งการเคลื่อนที่: รถไม่ต้องหมุน (rotate)
            const rotation = (type === 'car' || type === 'motorcycle') ? '0deg' : '15deg';
            
            const animation = item.animate([
                { left: '-300px', transform: `rotate(0deg)` },
                { left: '50vw', transform: `rotate(${rotation})` },
                { left: '110vw', transform: `rotate(0deg)` }
            ], { duration: duration * 1000, easing: 'linear' });

            animation.onfinish = () => {
                if (isLoop) startFloating();
                else { clearInterval(waterInterval); item.remove(); }
            };
        }
        startFloating();
    }

    // 4. ระบบ Gallery Looper (สำหรับโหมด Photo)
    function updateGallery() {
        if (allPhotoBlessings.length === 0) return;

        const data = allPhotoBlessings[currentGalleryIndex];
        const newItem = document.createElement('div');
        newItem.className = 'gallery-item';
        
        const photoSrc = data.photo && data.photo !== "" ? data.photo : 'logo.png';
        
        newItem.innerHTML = `
            <img src="${photoSrc}" class="staff-photo" alt="${data.name}">
            <div class="staff-msg">
                <span class="staff-name">คุณ ${data.name}</span>
                <p class="staff-text">" ${data.bless} "</p>
            </div>
        `;

        const oldItem = galleryContent.querySelector('.gallery-item');
        if (oldItem) {
            oldItem.classList.remove('active');
            oldItem.classList.add('exit');
            setTimeout(() => oldItem.remove(), 800);
        }

        galleryContent.appendChild(newItem);
        setTimeout(() => newItem.classList.add('active'), 50);

        currentGalleryIndex = (currentGalleryIndex + 1) % allPhotoBlessings.length;
    }

    // 5. ระบบ Sync ข้อมูล (ดึงข้อมูลมาแสดงแยกตามโหมด)
    async function syncBlessings() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            // แยกข้อมูล
            const photoData = data.filter(d => d.mode === 'photo');
            const itemData = data.filter(d => d.mode === 'item' || !d.mode); // รองรับของเก่าที่ไม่มีโหมด

            allPhotoBlessings = photoData;

            // สร้างขันน้ำลอยในจอหลัก (เฉพาะโหมด Item)
            itemData.forEach(item => {
                const id = `${item.name}-${item.time}`;
                if (!displayedIds.has(id)) {
                    createFloatingItem(item.name, item.bless, item.type || 'silver');
                    displayedIds.add(id);
                }
            });

            // เริ่ม Gallery ถ้ายังไม่มี
            if (photoData.length > 0 && galleryContent.querySelector('.empty')) {
                galleryContent.innerHTML = '';
                updateGallery();
            }
        } catch (e) {
            console.error('API Sync Error:', e);
        }
    }

    // 6. แปลงรูปเป็น Base64
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 7. ส่งข้อมูลใหม่
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerText;
        
        try {
            submitBtn.innerText = 'กำลังส่งพร... 💦';
            submitBtn.disabled = true;

            let photoBase64 = "";
            if (currentMode === 'photo') {
                const photoFile = document.getElementById('user-photo').files[0];
                if (photoFile) photoBase64 = await getBase64(photoFile);
            }

            const payload = {
                mode: currentMode,
                name: document.getElementById('username').value,
                bless: document.getElementById('blessing').value,
                type: currentMode === 'item' ? document.querySelector('input[name="i-type"]:checked').value : 'photo',
                photo: photoBase64
            };

            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            form.reset();
            modal.style.display = 'none';
            setTimeout(syncBlessings, 1500); 

        } catch (e) {
            alert('ระบบส่งพรขัดข้อง ลองใหม่อีกครั้งนะครับ');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    };

    // เริ่มทำงาน
    createClouds();
    syncBlessings();
    setInterval(syncBlessings, 10000); // Sync ข้อมูลทุก 10 วิ
    setInterval(updateGallery, 6000);   // สลับรูปใน Gallery ทุก 6 วิ
});
