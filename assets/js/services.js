document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('services-list');
  if (!mount) return;

  const RAW_SERVICES = [
    { title: "Γκρεμίσματα - αποξηλώσεις", desc: "Ασφαλείς κατεδαφίσεις και αποξηλώσεις με έλεγχο σκόνης, προστασία χώρου και υπεύθυνη αποκομιδή μπαζών." },
    { title: "Χτισίματα - σοβατίσματα", desc: "Χτίσιμο νέων χωρισμάτων/τοιχίων και εφαρμογή σοβάδων για λεία, έτοιμη προς βαφή επιφάνεια." },
    { title: "Ελαιοχρωματισμοί τοιχοποιίας", desc: "Σωστή προετοιμασία υποστρώματος, αστάρια και βαφές αντοχής για ομοιόμορφο, καθαρό αποτέλεσμα." },
    { title: "Υδραυλικές εργασίες", desc: "Νέες εγκαταστάσεις και αντικαταστάσεις σωληνώσεων σε μπάνιο/κουζίνα, επισκευές διαρροών και συστήματα θέρμανσης." },
    { title: "Ηλεκτρολογικές εργασίες", desc: "Νέες γραμμές/πίνακες, φωτισμός, πρίζες/ασφάλειες και πιστοποιήσεις σύμφωνα με τους κανονισμούς ασφαλείας." },
    { title: "Κουφώματα αλουμινίου - pvc", desc: "Κατασκευή/τοποθέτηση κουφωμάτων αλουμινίου ή PVC με ενεργειακά υαλοστάσια και άριστη στεγάνωση." },
    { title: "Τοποθέτηση πλακιδίων τοίχου - δαπέδου", desc: "Τοποθέτηση με ευθυγράμμιση, κοπές ακριβείας και άρτιες αρμολογήσεις σε μπάνια, κουζίνες και δάπεδα." },
    { title: "Πατώματα ξύλινα και laminate", desc: "Τοποθέτηση παρκέ/laminate με κατάλληλα υποστρώματα και καθαρές τελικές λεπτομέρειες." },
    { title: "Μωσαϊκά δάπεδα", desc: "Επισκευές, τρίψιμο/γυάλισμα και νέες εφαρμογές μωσαϊκού με ανθεκτικές σφραγίσεις." },
    { title: "Ντουλάπια κουζίνας", desc: "Σχεδιασμός/τοποθέτηση κουζινόπορτων, μηχανισμοί soft-close και εργονομικές αποθηκεύσεις." },
    { title: "Ντουλάπες", desc: "Ελεύθερες ή εντοιχισμένες ντουλάπες με ποιοτικά φινιρίσματα και λειτουργική εσωτερική διαμόρφωση." },
    { title: "Πόρτες εισόδου (ασφαλείας) - εσωτερικές πόρτες", desc: "Θωρακισμένες πόρτες εισόδου και εσωτερικές πόρτες με ακριβή εφαρμογή και επιλογές φινιρισμάτων." },
    { title: "Μονώσεις παντός τύπου", desc: "Θερμομονώσεις/στεγανοποιήσεις ταρατσών και τοιχοποιιών με πιστοποιημένα υλικά και εγγυήσεις εφαρμογής." },
    { title: "Μεταλλικές κατασκευές", desc: "Κάγκελα, σκάλες, στέγαστρα και ειδικές μεταλλικές λύσεις με ασφάλεια και αντοχή." },
    { title: "Αποκατάσταση προσόψεων (στηθαία) σε πολυκατοικίες με χρήση σκαλωσιάς", desc: "Επισκευές ρωγμών, αποκατάσταση σοβάδων/στηθαίων και βαφές προσόψεων με όλα τα μέτρα ασφαλείας." }
  ];

  const ORDER = [
    "Ηλεκτρολογικές εργασίες",
    "Υδραυλικές εργασίες",
    "Τοποθέτηση πλακιδίων τοίχου - δαπέδου",
    "Κουφώματα αλουμινίου - pvc",
    "Πατώματα ξύλινα και laminate",
    "Γκρεμίσματα - αποξηλώσεις",
    "Χτισίματα - σοβατίσματα",
    "Ελαιοχρωματισμοί τοιχοποιίας",
    "Μονώσεις παντός τύπου",
    "Πόρτες εισόδου (ασφαλείας) - εσωτερικές πόρτες",
    "Ντουλάπια κουζίνας",
    "Ντουλάπες",
    "Μεταλλικές κατασκευές",
    "Μωσαϊκά δάπεδα",
    "Αποκατάσταση προσόψεων (στηθαία) σε πολυκατοικίες με χρήση σκαλωσιάς"
  ];

  const byTitle = new Map(RAW_SERVICES.map(s => [s.title, s]));
  const SERVICES = ORDER.map(t => byTitle.get(t)).filter(Boolean);

  const ICON_MAP = {
    "Γκρεμίσματα - αποξηλώσεις": "hammer",
    "Χτισίματα - σοβατίσματα": "construction",
    "Ελαιοχρωματισμοί τοιχοποιίας": "paint-roller",
    "Υδραυλικές εργασίες": "pipe",
    "Ηλεκτρολογικές εργασίες": "plug",
    "Κουφώματα αλουμινίου - pvc": "square",
    "Τοποθέτηση πλακιδίων τοίχου - δαπέδου": "grid",
    "Πατώματα ξύλινα και laminate": "layers",
    "Μωσαϊκά δάπεδα": "grid-2x2",
    "Ντουλάπια κουζίνας": "box",
    "Ντουλάπες": "boxes",
    "Πόρτες εισόδου (ασφαλείας) - εσωτερικές πόρτες": "door-closed",
    "Μονώσεις παντός τύπου": "shield",
    "Μεταλλικές κατασκευές": "wrench",
    "Αποκατάσταση προσόψεων (στηθαία) σε πολυκατοικίες με χρήση σκαλωσιάς": "building"
  };

  const allowedIcons = new Set([
    "hammer","paint-roller","pipe","plug","square","grid","layers","grid-2x2",
    "box","boxes","door-closed","door-open","shield","wrench","building","construction"
  ]);

  function safeIcon(name){
    const wanted = ICON_MAP[name] || "wrench";
    return allowedIcons.has(wanted) ? wanted : "wrench";
  }

  function slugify(s){
    return s.toLowerCase()
      .replace(/[ά]/g,'a').replace(/[έ]/g,'e').replace(/[ίϊΐ]/g,'i')
      .replace(/[ό]/g,'o').replace(/[ύϋΰ]/g,'y').replace(/[ή]/g,'i').replace(/[ώ]/g,'o')
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
  }

  mount.innerHTML = SERVICES.map(s => cardTpl(s)).join("");

  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

  document.querySelectorAll('.service-icon[data-lucide]').forEach(el => {
    if (!el.firstElementChild) {
      el.setAttribute('data-lucide','wrench');
    }
  });
  document.querySelectorAll('.service-arrow[data-lucide]').forEach(el => {
    if (!el.firstElementChild) {
      el.setAttribute('data-lucide','chevron-down');
    }
  });
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

  document.querySelectorAll('.service-card .service-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.service-card');
      const open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    btn.addEventListener('pointerdown', e => {
      const r = e.currentTarget.getBoundingClientRect();
      btn.style.setProperty('--rx', (e.clientX - r.left) + 'px');
      btn.style.setProperty('--ry', (e.clientY - r.top) + 'px');
    });
  });

  function cardTpl(s){
    const icon = safeIcon(s.title);
    const id = slugify(s.title);
    return `
      <article class="service-card" id="${id}">
        <button class="service-header ripple" aria-expanded="false" aria-controls="${id}-content">
          <span class="left">
            <i class="service-icon" data-lucide="${icon}" aria-hidden="true"></i>
            <span class="service-title">${s.title}</span>
          </span>
          <i class="service-arrow" data-lucide="chevron-down" aria-hidden="true"></i>
        </button>
        <div class="service-content" id="${id}-content" role="region" aria-labelledby="${id}">
          <p>${s.desc}</p>
          <div class="service-meta">Για μελέτη & προσφορά: <a href="/epikoinonia">επικοινωνήστε μαζί μας</a>.</div>
        </div>
      </article>
    `;
  }
});
