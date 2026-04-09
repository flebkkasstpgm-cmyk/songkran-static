document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('water-stage');
    const cloudContainer = document.getElementById('clouds');
    const modal = document.getElementById('bless-modal');
    const openBtn = document.getElementById('open-bless-modal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('bless-form');

    // --- Google Sheets API URL ---
    const API_URL = 'https://script.google.com/macros/s/AKfycbxVtdJocmYMK_Tw5q0IVXOMf7ZS02qiEn3E4AZDI5GpC-RJdLMppu6SheLch_nrJoQX/exec';
    
    let displayedIds = new Set();

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
    openBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 3. ฟังก์ชันสร้างขันลายไทยและอนิเมชั่นลอย
    function createItem(name, bless, type, isLoop = true) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        item.innerHTML = `
            <div class="b-info"><b>${name}:</b> ${bless}</div>
            <div class="bowl-classic"><div class="thai-pattern"></div></div>
        `;
        stage.appendChild(item);

        function createWater() {
            for (let i = 0; i < 3; i++) {
                const drop = document.createElement('div');
                drop.className = 'water-stream';
                const size = 6 + Math.random() * 10;
                drop.style.width = `${size}px`; drop.style.height = `${size}px`;
                let dx = 80 + Math.random() * 120; let dy = 200 + Math.random() * 150;
                drop.style.setProperty('--dx', `${dx}px`); drop.style.setProperty('--dy', `${dy}px`);
                drop.style.left = `80px`; drop.style.top = `60px`;
                drop.style.animation = 'water-flow 0.8s ease-out forwards';
                item.appendChild(drop);
                setTimeout(() => drop.remove(), 800);
            }
        }
        const waterInterval = setInterval(createWater, 350);

        function startFloating() {
            const randomTop = 45 + Math.random() * 35;
            item.style.top = `${randomTop}%`;
            const duration = 20 + Math.random() * 15;
            const animation = item.animate([
                { left: '-300px', transform: 'rotate(0deg)' },
                { left: '50vw', transform: 'rotate(20deg)' },
                { left: '110vw', transform: 'rotate(0deg)' }
            ], { duration: duration * 1000, easing: 'linear' });

            animation.onfinish = () => {
                if (isLoop) startFloating();
                else { clearInterval(waterInterval); item.remove(); }
            };
        }
        startFloating();
    }

    // 4. ระบบ Sync ข้อมูลด้วย Google Sheets API
    async function syncBlessings() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            // วนลูปแสดงข้อมูลใหม่ที่ยังไม่เคยแสดง
            data.forEach(item => {
                const id = `${item.name}-${item.time}`;
                if (!displayedIds.has(id)) {
                    createItem(item.name, item.bless, item.type);
                    displayedIds.add(id);
                }
            });
        } catch (e) {
            console.error('ไม่สามารถดึงข้อมูลจาก Google Sheets ได้:', e);
        }
    }

    // 5. ส่งคำอวยพรใหม่ไปยัง Google Sheets
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerText;
        
        const payload = {
            name: document.getElementById('username').value,
            bless: document.getElementById('blessing').value,
            type: document.querySelector('input[name="i-type"]:checked').value
        };

        try {
            submitBtn.innerText = 'กำลังส่งพร... 💦';
            submitBtn.disabled = true;

            // ส่งข้อมูลไปยัง Google Apps Script (POST)
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', // GAS ต้องการโหมดนี้สำหรับ Simple POST
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // สร้างเอฟเฟกต์ลอยทันที (เพื่อ UX ที่ดี)
            createItem(payload.name, payload.bless, payload.type);
            displayedIds.add(`${payload.name}-${Date.now()}`);

            form.reset();
            modal.style.display = 'none';
        } catch (e) {
            alert('ขออภัยครับ ระบบส่งพรขัดข้อง ลองใหม่อีกครั้งนะครับ');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    };

    // เริ่มทำงาน
    createClouds();
    syncBlessings();
    
    // ตรวจสอบคำอวยพรใหม่ทุก 5 วินาที
    setInterval(syncBlessings, 5000);
});
