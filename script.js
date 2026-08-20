document.addEventListener('DOMContentLoaded', () => {
    // 1. ELEMEN REFERENSI
    const bgm = document.getElementById('bgm');
    const audioBtn = document.getElementById('audioBtn');
    const audioIcon = document.getElementById('audioIcon');
    const video = document.getElementById('bgVideo');
    const form = document.getElementById('preRegForm');
    const statusMsg = document.getElementById('statusMessage');

    // 2. LOGIKA PAKSA VIDEO PLAY (AGAR TIDAK MACET/DIAM DI HP)
    if (video) {
        video.addEventListener('canplaythrough', () => {
            video.play().catch(() => {});
        });

        // Paksa video jalan begitu layar tersentuh pertama kali
        const forcePlayVideo = () => {
            if (video.paused) {
                video.play().catch(() => {});
            }
        };
        document.addEventListener('touchstart', forcePlayVideo, { once: true });
        document.addEventListener('click', forcePlayVideo, { once: true });
    }

    // 3. LOGIKA AUTO PLAY AUDIO (BGM)
    if (bgm) {
        bgm.volume = 0.3; // Volume 30%

        function playAudio() {
            bgm.play().then(() => {
                if (audioIcon) audioIcon.innerText = '🔊';
                removeAutoPlayListeners();
            }).catch(() => {});
        }

        function removeAutoPlayListeners() {
            document.removeEventListener('click', playAudio);
            document.removeEventListener('touchstart', playAudio);
            document.removeEventListener('scroll', playAudio);
        }

        document.addEventListener('click', playAudio);
        document.addEventListener('touchstart', playAudio);
        document.addEventListener('scroll', playAudio);

        if (audioBtn) {
            audioBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (bgm.paused) {
                    bgm.play();
                    audioIcon.innerText = '🔊';
                } else {
                    bgm.pause();
                    audioIcon.innerText = '🔇';
                }
            });
        }
    }

    // 4. LOGIKA LOCALSTORAGE & FORMSPREE SUBMIT
    if (form) {
        if (localStorage.getItem('gtfs_registered')) {
            // Jika sudah pernah daftar, sembunyikan form
            form.innerHTML = `
                <div style="text-align: center; color: #00f0ff; background: rgba(0,240,255,0.1); padding: 25px; border-radius: 10px; border: 1px solid #00f0ff;">
                    <h2 style="font-family: 'Orbitron', sans-serif;">✔ TERDAFTAR</h2>
                    <p style="margin-top: 10px;">Kamu sudah melakukan Pre-Register. Sampai jumpa di dalam game!</p>
                </div>`;
        } else {
            // Proses submit form via AJAX/Fetch
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const btn = form.querySelector('button');
                btn.disabled = true;
                btn.innerText = 'MENGIRIM DATA...';
                
                const data = new FormData(form);
                
                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: data,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        localStorage.setItem('gtfs_registered', 'true');

                        if (statusMsg) {
                            statusMsg.style.color = '#00ff88';
                            statusMsg.innerText = '✔ BERHASIL PRE-REGISTER!';
                        }
                        
                        setTimeout(() => {
                            form.innerHTML = `
                                <div style="text-align: center; color: #00ff88; background: rgba(0,255,136,0.1); padding: 25px; border-radius: 10px; border: 1px solid #00ff88;">
                                    <h2 style="font-family: 'Orbitron', sans-serif;">BERHASIL!</h2>
                                    <p style="margin-top: 10px;">Terima kasih, data kamu sudah kami terima.</p>
                                </div>`;
                        }, 1000);

                    } else {
                        throw new Error('Gagal');
                    }
                } catch (error) {
                    if (statusMsg) {
                        statusMsg.style.color = '#ff0055';
                        statusMsg.innerText = '✖ Terjadi kesalahan. Coba lagi nanti.';
                    }
                    btn.disabled = false;
                    btn.innerText = 'KLAIM HADIAH & REGISTER';
                }
            });
        }
    }
});
