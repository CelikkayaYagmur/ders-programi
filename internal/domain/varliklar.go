package domain

// Bu dosya "varlıkları" (entity) tutar: kullanıcının veri giriş ekranlarından
// gireceği temel kayıtlar. Burada iş kuralı yok, sadece "bu kayıt neye benziyor".

// Hoca, bir öğretmen.
type Hoca struct {
	ID int
	Ad string
}

// Ders, bir branşı/kursu (ör. "Matematik") temsil eder.
type Ders struct {
	ID int
	Ad string
}

// Sube, bir sınıf/şube (ör. "9-A").
type Sube struct {
	ID int
	Ad string
}

// Zoom, bir çevrimiçi ders adresi.
type Zoom struct {
	ID    int
	Ad    string // tanıtıcı etiket (ör. "Zoom Hesabı 1")
	Adres string // bağlantı (ör. https://zoom.us/j/...)
}

// ToplantiTuru, programa konan bir oturumun ne tür olduğunu belirtir.
// Her şey "ders" değil: hocalar bazen seminere/toplantıya da giriyor.
// Örnekler: "Ders", "Seminer", "Veli Toplantısı".
type ToplantiTuru struct {
	ID int
	Ad string
}
