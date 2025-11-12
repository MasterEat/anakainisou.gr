# anakainisou.gr — Final SEO Audit (November 2025)

| # | Area | Status | Notes |
|---|------|:------:|-------|
| 1 | Schema (JSON-LD) | ⚠️ | Η δομή HomeAndConstructionBusiness/WebSite/BreadcrumbList υπάρχει και φαίνεται συντακτικά ορθή, αλλά απαιτείται επαλήθευση στο Rich Results Test για πιθανά warnings πριν το live sign-off. |
| 2 | Meta & Open Graph | ❌ | Η σελίδα «Έργα μας» και οι νομικές σελίδες δεν έχουν καθόλου title/description/og tags, οπότε το περιεχόμενο δεν είναι ευθυγραμμισμένο και παραμένει κενό στα snippets. Προσθήκη μοναδικών meta/OG + ενημέρωση canonical. |
| 3 | Sitemap & Robots | ❌ | Το sitemap δηλώνει URL με trailing slash (π.χ. /privacy-policy/) ενώ στο repository υπάρχουν μόνο αρχεία *.html, οπότε παράγονται 404. Ενημέρωση sitemap + robots και υποβολή εκ νέου στο GSC. |
| 4 | Core Web Vitals | ⚠️ | Δεν υπάρχουν πρόσφατες μετρήσεις. Χρειάζεται επιβεβαίωση από GSC/CrUX ότι LCP < 2.5s, CLS < 0.1, INP < 200ms μετά τα τελευταία builds. |
| 5 | Accessibility | ❌ | Οι δευτερεύουσες σελίδες λείπουν από βασικά head στοιχεία (π.χ. `<title>`), γεγονός που δημιουργεί προσβασιμότητα & SEO issues. Συμπλήρωση τίτλων/landmarks και επανάληψη ελέγχου WCAG 2.1 AA. |
| 6 | Google Business Profile (GMB) | ❌ | Το schema περιλαμβάνει πλήρη NAP, όμως στο footer εμφανίζονται μόνο τηλέφωνα/email χωρίς φυσική διεύθυνση, άρα δεν υπάρχει απόλυτη συνέπεια. Προσθήκη πλήρους διεύθυνσης στα εμφανή σημεία. |
| 7 | Analytics & Search Console | ❌ | Δεν εντοπίζεται ενεργό GA4 tag (μόνο σχόλιο στον κώδικα). Απαιτείται εγκατάσταση GA4, επιβεβαίωση σύνδεσης με GSC και έλεγχος συλλογής δεδομένων. |
| 8 | Mobile Friendly | ⚠️ | Δεν υπάρχει πρόσφατο αποτέλεσμα Google Mobile-Friendly Test. Χρειάζεται δοκιμή σε 375px viewport (Chrome DevTools/Lighthouse) πριν το κλείσιμο. |
| 9 | Broken Links | ❌ | Τα internal links προς /terms/ και /privacy-policy/ (footer) δείχνουν σε ανύπαρκτους φακέλους ενώ τα αρχεία είναι .html. Διόρθωση URLs ή ενεργοποίηση rewrite για αποφυγή 404. |
|10 | Favicon & Social Preview | ❌ | Όλες οι αναφορές δείχνουν σε φάκελο /favicon/... που δεν υπάρχει στο repo, άρα τα favicons/OG images σπάνε στα shares. Ενημέρωση paths και έλεγχος προεπισκοπήσεων (FB/WA). |

> Μετά τις διορθώσεις να γίνει τελικός επανέλεγχος (schema test, GA debug, Lighthouse, Screaming Frog) και ενημέρωση deliverables/τιμολόγησης.
