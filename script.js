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
    if (openBtn) openBtn.onclick = () => modal.style.display = 'block';
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 3. ฟังก์ชันสร้างวัตถุอวยพร (ใช้รูปภาพจริง)
    function createItem(name, bless, type, isLoop = true) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        
        // ใช้รูปภาพตามประเภทที่เลือก
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

            for (let i = 0; i < dropCount; i++) {
                const drop = document.createElement('div');
                drop.className = 'water-stream';
                
                if (type === 'perfume') {
                    drop.style.background = 'rgba(255, 241, 118, 0.8)';
                }

                const size = 6 + Math.random() * 10;
                drop.style.width = `${size}px`; 
                drop.style.height = `${size}px`;
                
                let dx, dy, startX, startY;
                
                if (type === 'gun') {
                    startX = 110; startY = 40;
                    dx = 150 + Math.random() * 150;
                    dy = (Math.random() - 0.5) * 100;
                } else if (type === 'perfume') {
                    startX = 75; startY = 20;
                    dx = (Math.random() - 0.5) * 150;
                    dy = 150 + Math.random() * 100;
                } else {
                    // ขันเงิน/ทอง
                    startX = 75; startY = 60;
                    dx = 80 + Math.random() * 120;
                    dy = 200 + Math.random() * 150;
                }

                drop.style.setProperty('--dx', `${dx}px`); 
                drop.style.setProperty('--dy', `${dy}px`);
                drop.style.left = `${startX}px`; 
                drop.style.top = `${startY}px`;
                drop.style.animation = 'water-flow 0.8s ease-out forwards';
                item.appendChild(drop);
                setTimeout(() => drop.remove(), 800);
            }
        }
        const waterInterval = setInterval(createWater, type === 'gun' ? 150 : (type === 'perfume' ? 600 : 350));

        // อนิเมชั่นลอย
        function startFloating() {
            const randomTop = 45 + Math.random() * 35;
            item.style.top = `${randomTop}%`;
            const duration = 20 + Math.random() * 15;
            
            const animation = item.animate([
                { left: '-300px', transform: 'rotate(0deg)' },
                { left: '50vw', transform: 'rotate(15deg)' },
                { left: '110vw', transform: 'rotate(0deg)' }
            ], { 
                duration: duration * 1000, 
                easing: 'linear' 
            });

            animation.onfinish = () => {
                if (isLoop) startFloating();
                else { clearInterval(waterInterval); item.remove(); }
            };
        }
        
        startFloating();
    }

    // 4. ระบบ Sync ข้อมูล
    async function syncBlessings() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            data.forEach(item => {
                const id = `${item.name}-${item.time}`;
                if (!displayedIds.has(id)) {
                    createItem(item.name, item.bless, item.type);
                    displayedIds.add(id);
                }
            });
        } catch (e) {
            console.error('API Sync Error:', e);
        }
    }

    // 5. ส่งคำอวยพรใหม่
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
    setInterval(syncBlessings, 5000);
});
