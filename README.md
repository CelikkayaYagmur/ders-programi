# Ders Programı

**Go**, **Wails** ve **React** ile geliştirilmiş, tam kapsamlı ve bağımsız çalışan bir Okul Ders Programı uygulaması.

## Özellikler
- **Sürükle-Bırak Etkileşimli Takvim**: Haftalık programınızı kolayca yönetin.
- **Çakışma Kontrolü**: Aynı hoca veya şube için derslerin çakışmasını otomatik olarak engeller.
- **Dinamik PDF Çıktısı**: Ders programınızın görsel olarak estetik ve temiz formatlı bir PDF'ini dışa aktarmak için tasarlanmıştır.
- **Otomatik Programlama**: Derslerinizi haftaya en verimli şekilde dağıtan akıllı bir algoritma.
- **Kurulum Gerektirmeyen Taşınabilir Uygulama**: Verileriniz (`data.json`) ve uygulamanız (`ders-programi.exe`) birlikte çalışır—karmaşık kurulumlara gerek yoktur!

## Nasıl Kullanılır
1. `ders-programi.exe` ve `data.json` dosyalarını her zaman aynı klasörde tutun.
2. Uygulamayı başlatmak için `.exe` dosyasına çift tıklayın.
3. "Veri Yönetimi" ekranından hocaları, şubeleri ve Zoom linklerini yönetebilirsiniz.
4. Programı manuel olarak oluşturmak için sürükle-bırak yapabilir ya da "Otomatik Oluştur" butonuna tıklayarak uygulamanın kendi programı yapmasını sağlayabilirsiniz.
5. Hazırladığınız programın şık bir PDF çıktısını almak için "Yazdır" butonuna tıklayın.

## Geliştirici
Bu uygulama Wails v3 kullanılarak geliştirilmiştir.
- Geliştirici modunda (canlı yenileme ile) çalıştırmak için: `task dev`
- Prodüksiyon (kullanıma hazır exe) sürümünü derlemek için: `task build` (veya `wails3 build`)
