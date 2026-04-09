document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('water-stage');
    const cloudContainer = document.getElementById('clouds');
    const modal = document.getElementById('bless-modal');
    const openBtn = document.getElementById('open-bless-modal');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('bless-form');

    const STORAGE_KEY = 'jarvis_songkran_v2_clean';
    let displayedIds = new Set();

    // 2. ฟังก์ชันจัดการก้อนเมฆ (Animation)
    function createClouds() {
        for (let i = 0; i < 15; i++) {
            const group = document.createElement('div');
            group.className = 'cloud-group';
            for (let j = 0; j < 6; j++) {
                const puff = document.createElement('div');
                puff.className = 'cloud-puff';
                const size = 150 + Math.random() * 200;
                puff.style.width = `${size}px`; 
                puff.style.height = `${size * 0.6}px`;
                puff.style.left = `${Math.random() * 200}px`; 
                puff.style.top = `${Math.random() * 60}px`;
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

    // 3. ระบบ Modal
    openBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // 4. ฟังก์ชันสร้างขันลายไทยและอนิเมชั่นลอย
    function createItem(name, bless, type, isLoop = true) {
        const item = document.createElement('div');
        item.className = `item-object ${type}`;
        item.innerHTML = `
            <div class="b-info"><b>${name}:</b> ${bless}</div>
            <div class="bowl-classic"><div class="thai-pattern"></div></div>
        `;
        stage.appendChild(item);

        // เอฟเฟกต์สาดน้ำ
        function createWater() {
            for (let i = 0; i < 3; i++) {
                const drop = document.createElement('div');
                drop.className = 'water-stream';
                const size = 6 + Math.random() * 10;
                drop.style.width = `${size}px`; 
                drop.style.height = `${size}px`;
                let dx = 80 + Math.random() * 120; 
                let dy = 200 + Math.random() * 150;
                drop.style.setProperty('--dx', `${dx}px`); 
                drop.style.setProperty('--dy', `${dy}px`);
                drop.style.left = `80px`; 
                drop.style.top = `60px`;
                drop.style.animation = 'water-flow 0.8s ease-out forwards';
                item.appendChild(drop);
                setTimeout(() => drop.remove(), 800);
            }
        }
        const waterInterval = setInterval(createWater, 350);

        // อนิเมชั่นลอยจากซ้ายไปขวา
        function startFloating() {
            const randomTop = 45 + Math.random() * 35;
            item.style.top = `${randomTop}%`;
            const duration = 20 + Math.random() * 15;
            
            const animation = item.animate([
                { left: '-300px', transform: 'rotate(0deg)' },
                { left: '50vw', transform: 'rotate(20deg)' },
                { left: '110vw', transform: 'rotate(0deg)' }
            ], { 
                duration: duration * 1000, 
                easing: 'linear' 
            });

            animation.onfinish = () => {
                if (isLoop) {
                    startFloating();
                } else {
                    clearInterval(waterInterval);
                    item.remove();
                }
            };
        }
        startFloating();
    }

    // 5. ระบบ Sync ข้อมูลด้วย LocalStorage (แทน Node.js API)
    function syncBlessings() {
        let stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        stored.forEach(item => {
            const id = `${item.name}-${item.time}`;
            if (!displayedIds.has(id)) {
                createItem(item.name, item.bless, item.type);
                displayedIds.add(id);
            }
        });
    }

    // 6. ส่งคำอวยพรใหม่
    form.onsubmit = (e) => {
        e.preventDefault();
        const newBless = {
            name: document.getElementById('username').value,
            bless: document.getElementById('blessing').value,
            type: document.querySelector('input[name="i-type"]:checked').value,
            time: Date.now()
        };

        // บันทึกลง LocalStorage
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        stored.push(newBless);
        if (stored.length > 50) stored.shift(); // เก็บไว้แค่ 50 อันล่าสุด
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

        // แสดงผลทันที
        const id = `${newBless.name}-${newBless.time}`;
        if (!displayedIds.has(id)) {
            createItem(newBless.name, newBless.bless, newBless.type);
            displayedIds.add(id);
        }

        form.reset();
        modal.style.display = 'none';

        // เอฟเฟกต์ Splash เล็กน้อยเมื่อส่งสำเร็จ
        const splash = document.createElement('div');
        splash.className = 'splash-effect';
        // (สามารถเพิ่ม CSS splash-effect ได้ถ้าต้องการ)
    };

    // เริ่มทำงาน
    createClouds();
    syncBlessings();
    
    // ตรวจสอบข้อมูลใหม่ทุก 3 วินาที (กรณีเปิดหลาย Tab)
    setInterval(syncBlessings, 3000);
});
