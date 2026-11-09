# 🎯 Hızlı Sapan (Sling Puck) - Cyber Arena & Online Çok Oyunculu

Modern, hızlı ve rekabetçi bir web tabanlı **Sling Puck (Hızlı Sapan)** masa oyunu. Futbol sahası teması, dinamik arena tasvirleri, gerçek zamanlı çevrimiçi çok oyunculu mod, akıllı eşleşme (radar) ve insansı yapay zeka rakipleri içerir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🏆 Çevrimiçi Radar Eşleşmesi & Kupa Sistemi (SBMM)
- **Hemen Oyna:** Tek dokunuşla çalışan radar arama ekranı.
- **Canlı Radar Animasyonu:** Sonar tarayıcı, eşleşme sayacı ve oyuncu profili.
- **Gerçekçi Yapay Zeka Rakipleri:** Başlangıçta yeni oyuncular için çok kolay, seviye arttıkça giderek ustalaşan 45'ten fazla gerçekçi oyuncu takma adı ve avatarı.
- **Gerçek İnsan Eşleşmesi:** Kuyrukta başka bir gerçek oyuncu olduğunda sunucu otomatik olarak canlı PvP odası kurar.
- **Kupa İlerlemesi:** Galibiyette **+30 Kupa**, mağlubiyette **-10 Kupa**. Seviye 1'den 10'a kadar oyuncu rütbesi ve kupalar `localStorage` ile kaydedilir.

### 2. 🎯 İnsansı & Dönen Oklu Yapay Zeka (AI Opponent)
- Yapay zeka nişan alırken aniden fırlatmaz:
  - Taşı çektikten sonra oku **20°-45° hatalı açıyla** açar.
  - Sahayı tarayarak oku **akıcı bir yay çizerek deliğe doğru döndürür**.
  - Deliği hafifçe geçer (overshoot) ve ardından merkeze geri düzeltir.
  - Atış öncesi hafif bir **titreme / nefes alma mikro-hareketi** ile bekler ve sapanı bırakır.
  - Seviyesine göre tek banttan sektirme (bank shot) açılarını hesaplar.

### 3. ⚽ Futbol Sahası & Seviyeye Göre Değişen Arenalar
- Her seviyede farklı zemin deseni ve saha çizgileri (Klasik Yeşil Çim, Buz Mavisi Stadyum, Siber Matrix, Retro Gece vb.).
- Seviyeye göre değişen top renkleri ve fırlatıldığında arkasından uzanan efektif plazma hız şeridi.
- Çift bant sekmeli lazer nişangah kılavuzu (arka duvar ve yan bant yansımaları).

### 4. 🧲 Gelişmiş Fizik & Üst Üste Binme Çözücü
- **Matter.js** 2D fizik motoru ile 16 iterasyonlu pozisyon/hız çözücüsü.
- Taşların kenarlarda veya yan yana dururken birbirlerinin üstüne binmesini engelleyen 2 aşamalı **Geometric Relaxation Solver**.

### 5. 🔊 Dinamik Web Audio API Ses Motoru
- Harici ses dosyasına ihtiyaç duymadan saf osilatörlerle üretilen gerçekçi sesler:
  - Hakem düdüğü
  - Sapan gerilme ve fırlatma şaklaması
  - Ahşap/top çarpışma sesleri
  - Kale geçiş ve gol sesi
  - Son 5 saniye geri sayım tik-tak sesi
  - Zafer ve yenilgi melodileri

### 6. 🌐 Özel Oda Kurma & Katılma (P2P / Room)
- 4 haneli oda kodu ile arkadaşına link gönderip aynı odada kapışma imkanı.
- İnteraktif emoji tepki barı (🎯, 🔥, 👏, 😎, 😭, ⚡).

---

## 🛠️ Teknolojiler

- **Frontend:** HTML5, CSS3, Modern JavaScript (ES Modules), HTML5 Canvas
- **Fizik:** [Matter.js](https://brm.io/matter-js/)
- **Build & Dev:** [Vite](https://vitejs.dev/)
- **Sunucu & Çok Oyunculu:** Node.js, `ws` (WebSockets)
- **Ses:** Web Audio API (Sentetik osilatörler)
- **Kutlama:** `canvas-confetti`

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/halilibrahimozdemir25/sling-puck.git
cd sling-puck

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın:
```
http://localhost:3000
```

### Canlı Üretime Derleme (Build)
```bash
npm run build
```
Oluşturulan optimize dosyalar `dist/` klasörüne aktarılır.

---

## 🎮 Nasıl Oynanır?

1. Kendi sahandaki 5 toptan birine dokun ve geriye doğru çekerek nişan al.
2. Lazer kılavuzu ortadaki geçiş deliğine denk getir (yan bantlardan sektirerek açılı atışlar deneyebilirsin).
3. Parmağını bırak ve topu fırlat!
4. **Kazanma Kuralı:** Sahasındaki 5 topun tamamını karşı sahaya ilk geçiren oyuncu maçı kazanır!

---

## 📄 Lisans
Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
