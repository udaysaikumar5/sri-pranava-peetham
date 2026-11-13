(function () {
  const pages = window.SITE_PAGES || {};
  const text = (value, language) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((part) => text(part, language)).filter(Boolean).join(" ");
    if (typeof value === "object") return value[language] || value.en || "";
    return String(value);
  };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const normalize = (value) => String(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const hrefFor = (slug) => `?page=${encodeURIComponent(slug)}`;
  const categoryNames = {
    en: { "General": "General", "Surya": "Surya", "Lakshmi": "Lakshmi", "Devi": "Devi", "Hanuman": "Hanuman", "Shiva": "Shiva", "Subrahmanya": "Subrahmanya", "Sacred rivers": "Sacred rivers", "Navagraha": "Navagraha", "Vishnu": "Vishnu", "Ancestors": "Ancestors", "Ganesha": "Ganesha", "Guru": "Guru", "Krishna": "Krishna", "Practice": "Practice", "Rama": "Rama", "Saraswati": "Saraswati", "Scripture": "Scripture" },
    te: { "General": "సాధారణం", "Surya": "సూర్యుడు", "Lakshmi": "లక్ష్మీదేవి", "Devi": "దేవి", "Hanuman": "హనుమంతుడు", "Shiva": "శివుడు", "Subrahmanya": "సుబ్రహ్మణ్యుడు", "Sacred rivers": "పవిత్ర నదులు", "Navagraha": "నవగ్రహాలు", "Vishnu": "విష్ణువు", "Ancestors": "పితృదేవతలు", "Ganesha": "గణపతి", "Guru": "గురువు", "Krishna": "శ్రీకృష్ణుడు", "Practice": "సాధన", "Rama": "శ్రీరాముడు", "Saraswati": "సరస్వతీదేవి", "Scripture": "పురాణాలు, శాస్త్రాలు" }
  };

  const label = (language, english, telugu) => language === "te" ? telugu : english;
  const breadcrumb = (page, language) => `<div class="route-breadcrumb"><a href="index.html" data-home-link>${esc(label(language, "Home", "హోమ్"))}</a><span aria-hidden="true">/</span><span>${esc(text(page.category, language))}</span></div>`;
  const pdfViewerHref = (url) => `https://srivaddipartipadmakar.org/wp-content/plugins/pranavaplugin-pdf-embed/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`;
  const isPdfHref = (url) => typeof url === "string" && /\.pdf(?:[?#]|$)/i.test(url);
  const pageIntro = (page, language, slug) => `<header class="route-intro"><div>${breadcrumb(page, language)}<p class="eyebrow"><span class="eyebrow-line"></span>${esc(text(page.category, language))}</p><h1>${esc(text(page.title, language))}</h1>${page.subtitle ? `<p class="route-subtitle">${esc(text(page.subtitle, language))}</p>` : ""}</div>${slug === "about" ? `<div class="route-intro-art"><img src="${esc(page.portrait || "assets/guru-saffron.jpg")}" alt="${esc(text(page.title, language))}" /></div>` : ""}</header>`;
  const factsMarkup = (facts, language) => facts?.length ? `<dl class="route-facts">${facts.map(([name, value]) => `<div><dt>${esc(text(name, language))}</dt><dd>${esc(text(value, language))}</dd></div>`).join("")}</dl>` : "";
  const sectionMarkup = (sections, language) => (sections || []).map((section) => `<section class="article-section"><h2>${esc(text(section.title, language))}</h2>${section.paragraphs ? section.paragraphs.map((paragraph) => `<p>${esc(text(paragraph, language))}</p>`).join("") : ""}${section.list ? `<ul>${section.list.map((item) => `<li>${esc(text(item, language))}</li>`).join("")}</ul>` : ""}</section>`).join("");

  function cardMarkup(item, language, index = 0) {
    const destination = item.route ? hrefFor(item.route) : (isPdfHref(item.href) ? pdfViewerHref(item.href) : (item.href || "#"));
    const internalAttributes = item.route ? `data-page="${esc(item.route)}"` : `target="_blank" rel="noreferrer"`;
    const searchContent = ["en", "te"].flatMap((locale) => [text(item.title, locale), text(item.description, locale), text(item.tag, locale)]).concat(item.deity || "").join(" ");
    return `<a class="collection-card" href="${esc(destination)}" ${internalAttributes} data-search-card data-search-text="${esc(normalize(searchContent))}" data-deity="${esc(item.deity || "")}">
      <span class="collection-card-icon" aria-hidden="true">${esc(item.icon || ["✳", "◉", "ॐ", "✿"][index % 4])}</span>
      <span class="collection-card-tag">${esc(text(item.deity ? (categoryNames[language][item.deity] || item.deity) : item.tag, language))}</span>
      <strong>${esc(text(item.title, language))}</strong>
      <span class="collection-card-description">${esc(text(item.description, language))}</span>
      <span class="collection-card-arrow" aria-hidden="true">↗</span>
    </a>`;
  }

  function collectionMarkup(page, language) {
    const items = page.items || [];
    const deities = [...new Set(items.map((item) => item.deity).filter(Boolean))];
    const searchLabel = label(language, "Search this collection", "ఈ సేకరణలో వెతకండి");
    const filterLabel = label(language, "Filter by deity", "దేవత ఆధారంగా వడపోత");
    return `<div class="collection-tools"><label class="collection-search"><span class="sr-only">${esc(searchLabel)}</span><span aria-hidden="true">⌕</span><input type="search" data-collection-search placeholder="${esc(label(language, "Search by name or keyword…", "పేరు లేదా పదంతో వెతకండి…"))}" aria-label="${esc(searchLabel)}" autocomplete="off" /></label>${deities.length ? `<div class="collection-filters" role="group" aria-label="${esc(filterLabel)}"><span class="filter-label">${esc(filterLabel)}</span><button type="button" class="filter-chip is-active" data-deity-filter="all">${esc(label(language, "All stotras", "అన్ని స్తోత్రాలు"))}</button>${deities.map((deity) => `<button type="button" class="filter-chip" data-deity-filter="${esc(deity)}">${esc(categoryNames[language][deity] || deity)}</button>`).join("")}</div>` : ""}</div><div class="collection-grid">${items.map((item, index) => cardMarkup(item, language, index)).join("")}</div><p class="collection-empty" data-collection-empty hidden>${esc(label(language, "No items match that search. Try another word or filter.", "ఈ వెతుకులాటకు సరిపడే అంశాలు లేవు. మరో పదం లేదా వడపోత ప్రయత్నించండి."))}</p>`;
  }

  const CALENDAR_EVENTS = [
    { id: "guru-tour-kashi", start: "2026-11-10", end: "2026-11-15", kind: "tour", allDay: true, title: { en: "Guruji's visit to Kāśī", te: "గురువుగారి కాశీ యాత్ర" }, description: { en: "Five days of pravachanam and linga pratishta. Sample dates based on the supplied event reference.", te: "ఐదు రోజుల ప్రవచనం, లింగ ప్రతిష్ఠ. అందించిన కార్యక్రమ సూచన ఆధారంగా నమూనా తేదీలు." }, venue: { en: "Kāśī, Uttar Pradesh", te: "కాశీ, ఉత్తరప్రదేశ్" } },
    { id: "anjaneya-pratishta-nov", start: "2026-11-21", end: "2026-11-22", kind: "peetham", allDay: true, title: { en: "13-foot Sri Anjaneya vigraha pratishta", te: "13 అడుగుల శ్రీ ఆంజనేయ స్వామి విగ్రహ ప్రతిష్ఠ" }, description: { en: "A two-day pratishta programme near Vemuru / Tenali. Sample dates based on the supplied event reference.", te: "వేమూరు / తెనాలి సమీపంలో రెండు రోజుల ప్రతిష్ఠ కార్యక్రమం. అందించిన కార్యక్రమ సూచన ఆధారంగా నమూనా తేదీలు." }, venue: { en: "Bapatla, Andhra Pradesh", te: "బాపట్ల, ఆంధ్రప్రదేశ్" } },
    { id: "charan-shatavadhanam-nov", start: "2026-11-26", end: "2026-11-28", kind: "guru", allDay: true, title: { en: "Shatavadhanam by Sri Paladugu Sri Charan", te: "శ్రీ పాలడుగు శ్రీ చరణ్ గారి శతావధానం" }, description: { en: "A three-day programme featuring Guruji's students. Sample dates based on the supplied event reference.", te: "గురువుగారి శిష్యుల భాగస్వామ్యంతో మూడు రోజుల కార్యక్రమం. అందించిన కార్యక్రమ సూచన ఆధారంగా నమూనా తేదీలు." }, venue: { en: "Hyderabad, Telangana", te: "హైదరాబాద్, తెలంగాణ" } },
    { id: "gudi-badi-dec", start: "2026-12-04", end: "2026-12-05", kind: "gudibadi", allDay: true, title: { en: "Gudi Badi weekend workshop", te: "గుడి బడి వారాంతపు శిబిరం" }, description: { en: "A sample two-day programme with storytelling, recitation and creative activities.", te: "కథలు, పారాయణం, సృజనాత్మక కార్యక్రమాలతో నమూనా రెండు రోజుల శిబిరం." }, venue: { en: "Sri Pranava Peetham · Eluru", te: "శ్రీ ప్రణవపీఠం · ఏలూరు" } },
    { id: "guru-satsang-dec", start: "2026-12-12", end: "2026-12-12", kind: "guru", allDay: false, startTime: "17:30", endTime: "19:00", title: { en: "Guruji satsang and darshan", te: "గురువుగారి సత్సంగం, దర్శనం" }, description: { en: "An illustrative evening programme for devotees and families.", te: "భక్తులు, కుటుంబాల కోసం నమూనా సాయంత్ర కార్యక్రమం." }, venue: { en: "Sri Pranava Peetham · Eluru", te: "శ్రీ ప్రణవపీఠం · ఏలూరు" } },
    { id: "guru-tour-jan", start: "2027-01-11", end: "2027-01-15", kind: "tour", allDay: true, title: { en: "Andhra satsang tour", te: "ఆంధ్ర సత్సంగ యాత్ర" }, description: { en: "A sample five-day Guruji tour. The repeated tour dots make every day easy to spot.", te: "గురువుగారి నమూనా ఐదు రోజుల యాత్ర. ప్రతి రోజు యాత్ర చుక్కతో స్పష్టంగా కనిపిస్తుంది." }, venue: { en: "Andhra Pradesh · Sample route", te: "ఆంధ్రప్రదేశ్ · నమూనా మార్గం" } },
    { id: "gudi-badi-jan", start: "2027-01-23", end: "2027-01-23", kind: "gudibadi", allDay: false, startTime: "09:30", endTime: "11:30", title: { en: "Gudi Badi monthly gathering", te: "గుడి బడి నెలవారీ సమావేశం" }, description: { en: "A sample monthly gathering for young learners.", te: "యువ అభ్యాసకుల కోసం నమూనా నెలవారీ సమావేశం." }, venue: { en: "Sri Pranava Peetham · Eluru", te: "శ్రీ ప్రణవపీఠం · ఏలూరు" } }
  ];
  window.CALENDAR_EVENTS = CALENDAR_EVENTS;

  const dateOnly = (iso) => {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const toIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayHasEvent = (event, iso) => event.start <= iso && event.end >= iso;
  const eventsForDay = (iso) => CALENDAR_EVENTS.filter((event) => dayHasEvent(event, iso));
  const eventKindName = (kind, language) => ({
    guru: label(language, "Guruji", "గురువుగారు"), gudibadi: label(language, "Gudi Badi", "గుడి బడి"), tour: label(language, "Tour / yatra", "యాత్ర"), peetham: label(language, "Peetham event", "పీఠం కార్యక్రమం"),
  }[kind] || kind);
  const dateFormat = (date, language, options = { weekday: "long", day: "numeric", month: "long" }) => new Intl.DateTimeFormat(language === "te" ? "te-IN" : "en-IN", options).format(date);
  const nextEventDate = () => {
    const today = toIso(new Date());
    const next = CALENDAR_EVENTS.find((event) => event.end >= today);
    return next ? (next.start < today ? today : next.start) : today;
  };
  const firstMarkedDay = (year, month) => {
    const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const monthEnd = toIso(new Date(year, month + 1, 0, 12));
    const event = CALENDAR_EVENTS.find((entry) => entry.end >= monthStart && entry.start <= monthEnd);
    return event ? (event.start < monthStart ? monthStart : event.start) : monthStart;
  };

  function eventCard(event, language) {
    const when = event.start === event.end
      ? dateFormat(dateOnly(event.start), language)
      : `${dateFormat(dateOnly(event.start), language, { day: "numeric", month: "short" })} – ${dateFormat(dateOnly(event.end), language, { day: "numeric", month: "short", year: "numeric" })}`;
    const time = event.allDay ? label(language, "All day", "రోజంతా") : `${event.startTime} – ${event.endTime}`;
    return `<article class="calendar-event-card"><div class="event-card-accent event-accent-${esc(event.kind)}"></div><div class="calendar-event-main"><div class="event-card-meta"><span class="event-dot event-dot-${esc(event.kind)}"></span><span>${esc(eventKindName(event.kind, language))}</span><time>${esc(when)} · ${esc(time)}</time></div><h3>${esc(text(event.title, language))}</h3><p>${esc(text(event.description, language))}</p><small class="event-venue">⌖ ${esc(text(event.venue, language))}</small></div><button class="event-save-button" type="button" data-event-save="${esc(event.id)}"><span aria-hidden="true">＋</span>${esc(label(language, "Save", "క్యాలెండర్‌లో పెట్టండి"))}</button></article>`;
  }

  function calendarMarkup(page, language) {
    if (!window.calendarViewDate) window.calendarViewDate = dateOnly(nextEventDate());
    if (!window.calendarSelectedDate) window.calendarSelectedDate = nextEventDate();
    const view = window.calendarViewDate;
    const monthStart = new Date(view.getFullYear(), view.getMonth(), 1, 12);
    const offset = monthStart.getDay();
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - offset);
    const weekdays = language === "te" ? ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthLabel = dateFormat(view, language, { month: "long", year: "numeric" });
    const cells = Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const iso = toIso(day);
      const dayEvents = eventsForDay(iso);
      const isCurrentMonth = day.getMonth() === view.getMonth();
      const dots = dayEvents.slice(0, 3).map((event) => `<i class="calendar-dot calendar-dot-${esc(event.kind)}" aria-hidden="true"></i>`).join("");
      const accessible = `${dateFormat(day, language)}${dayEvents.length ? ` · ${dayEvents.map((event) => text(event.title, language)).join(", ")}` : ""}`;
      return `<button type="button" class="calendar-day${isCurrentMonth ? "" : " is-outside"}${iso === window.calendarSelectedDate ? " is-selected" : ""}${iso === toIso(new Date()) ? " is-today" : ""}" data-calendar-day="${iso}" aria-label="${esc(accessible)}" aria-pressed="${iso === window.calendarSelectedDate}"><span>${day.getDate()}</span><span class="calendar-dots">${dots}</span></button>`;
    }).join("");
    const chosen = eventsForDay(window.calendarSelectedDate);
    const selectedDate = dateFormat(dateOnly(window.calendarSelectedDate), language, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const empty = label(language, "No sample events on this day. Choose a marked date or browse another month.", "ఈ రోజున నమూనా కార్యక్రమాలు లేవు. గుర్తించిన తేదీని ఎంచుకోండి లేదా మరో నెల చూడండి.");
    return `<div class="calendar-note"><span aria-hidden="true">✳</span><p><strong>${esc(label(language, "Illustrative sample schedule", "నమూనా కార్యక్రమాల షెడ్యూల్"))}</strong> · ${esc(label(language, "Please confirm dates with the Peetham before making plans.", "ప్రయాణ ప్రణాళికకు ముందు పీఠంతో తేదీలను నిర్ధారించుకోండి."))}</p></div>
      <div class="calendar-layout"><section class="calendar-widget" aria-label="${esc(label(language, "Events calendar", "కార్యక్రమాల క్యాలెండర్"))}">
        <div class="calendar-toolbar"><button type="button" class="calendar-month-step" data-calendar-prev aria-label="${esc(label(language, "Previous month", "మునుపటి నెల"))}">‹</button><h2>${esc(monthLabel)}</h2><button type="button" class="calendar-month-step" data-calendar-next aria-label="${esc(label(language, "Next month", "తదుపరి నెల"))}">›</button></div>
        <div class="calendar-grid calendar-weekdays">${weekdays.map((day) => `<span>${esc(day)}</span>`).join("")}</div><div class="calendar-grid calendar-days">${cells}</div>
        <div class="calendar-legend"><span><i class="calendar-dot calendar-dot-guru"></i>${esc(label(language, "Guruji & disciples", "గురువుగారు, శిష్యులు"))}</span><span><i class="calendar-dot calendar-dot-gudibadi"></i>${esc(label(language, "Gudi Badi", "గుడి బడి"))}</span><span><i class="calendar-dot calendar-dot-tour"></i>${esc(label(language, "Tours / yatra", "యాత్రలు"))}</span><span><i class="calendar-dot calendar-dot-peetham"></i>${esc(label(language, "Peetham events", "పీఠం కార్యక్రమాలు"))}</span></div>
      </section><section class="calendar-agenda"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Selected day", "ఎంచుకున్న రోజు"))}</p><h2>${esc(selectedDate)}</h2><div class="calendar-agenda-list">${chosen.length ? chosen.map((event) => eventCard(event, language)).join("") : `<div class="calendar-empty"><span aria-hidden="true">◷</span><p>${esc(empty)}</p></div>`}</div></section></div>`;
  }

  function quizMarkup(page, language) {
    const fields = (page.questions || []).map((question, index) => `<fieldset class="quiz-question"><legend><span>${String(index + 1).padStart(2, "0")}</span>${esc(text(question.q, language))}</legend><div>${question.choices.map((choice, choiceIndex) => `<label class="quiz-choice"><input type="radio" name="question-${index}" value="${choiceIndex}" /><span>${esc(text(choice, language))}</span></label>`).join("")}</div></fieldset>`).join("");
    return `<form class="quiz-form" data-quiz-form>${fields}<div class="quiz-actions"><button class="button button-dark" type="submit">${esc(label(language, "Check my answers", "నా సమాధానాలు చూడండి"))}<span aria-hidden="true">↗</span></button><button class="button button-quiet" type="reset">${esc(label(language, "Start again", "మళ్లీ ప్రారంభించండి"))}</button><p class="quiz-result" data-quiz-result aria-live="polite"></p></div></form>`;
  }

  function dharmaCategoryMarkup(page, language) {
    const category = text(page.title, language);
    return `<section class="dharma-local-archive"><div class="archive-panel"><span class="archive-panel-icon" aria-hidden="true">${esc(page.icon || "✳")}</span><div class="archive-panel-copy"><span class="collection-card-tag">${esc(text(page.group, language))}</span><h2>${esc(label(language, `Browse ${category} topics`, `${category} అంశాలను చూడండి`))}</h2><p>${esc(label(language, "These topic links stay inside this local site. The original archive is not needed for this browse flow.", "ఈ అంశాల లింకులు ఈ స్థానిక వెబ్‌సైట్‌లోనే తెరుచుకుంటాయి."))}<br /><a class="text-link" href="${hrefFor("dharma")}" data-page="dharma">${esc(label(language, "All 29 categories", "29 వర్గాలన్నీ"))}<span aria-hidden="true">→</span></a></p></div></div>${collectionMarkup(page, language)}</section>`;
  }

  function dharmaTopicMarkup(page, language) {
    const categoryPage = pages[page.categoryRoute];
    const categoryTitle = text(categoryPage?.title, language) || label(language, "Dharma Sandehalu", "ధర్మ సందేహాలు");
    const otherTopics = (categoryPage?.items || []).filter((item) => item.route !== page.route);
    const related = otherTopics.slice(0, 9);
    return `<section class="dharma-topic-detail"><div class="archive-panel"><span class="archive-panel-icon" aria-hidden="true">${esc(categoryPage?.icon || "◉")}</span><div class="archive-panel-copy"><span class="collection-card-tag">${esc(categoryTitle)}</span><h2>${esc(label(language, `Explore ${text(page.title, language)}`, `${text(page.title, language)} అంశాన్ని అన్వేషించండి`))}</h2><p>${esc(label(language, `This topic is part of the local ${categoryTitle} guide. Continue with related topics in this collection or return to the full Dharma Sandehalu index.`, `ఈ అంశం స్థానిక ${categoryTitle} మార్గదర్శిలో భాగం. ఈ విభాగంలోని సంబంధిత అంశాలను చూడండి లేదా మొత్తం ధర్మ సందేహాల సూచికకు తిరిగి వెళ్లండి.`))}</p><div class="topic-actions"><a class="button button-dark" href="${hrefFor(page.categoryRoute)}" data-page="${esc(page.categoryRoute)}">${esc(label(language, "Browse this category", "ఈ వర్గాన్ని చూడండి"))}<span aria-hidden="true">↗</span></a><a class="text-link" href="${hrefFor("dharma")}" data-page="dharma">${esc(label(language, "All 29 categories", "29 వర్గాలన్నీ"))}<span aria-hidden="true">→</span></a></div></div></div>${related.length ? `<div class="topic-neighbors"><div class="section-heading"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Continue in this collection", "ఈ సేకరణలో కొనసాగండి"))}</p><h2>${esc(label(language, `More ${categoryTitle} topics`, `${categoryTitle}లో మరిన్ని అంశాలు`))}</h2></div><div class="collection-grid">${related.map((item, index) => cardMarkup(item, language, index)).join("")}</div></div>` : ""}</section>`;
  }

  function stotraMarkup(page, language) {
    const pdfs = page.pdfs || [];
    const files = pdfs.length ? pdfs.map((url, index) => `<section class="stotra-pdf-card"><div class="stotra-pdf-toolbar"><strong>${esc(pdfs.length > 1 ? label(language, `PDF ${index + 1}`, `పీడీఎఫ్ ${index + 1}`) : label(language, "Stotra PDF", "స్తోత్రం పీడీఎఫ్"))}</strong><a class="button button-gold stotra-download" href="${esc(url)}" download target="_blank" rel="noreferrer">${esc(label(language, "Download PDF", "పీడీఎఫ్ డౌన్‌లోడ్ చేయండి"))}<span aria-hidden="true">↓</span></a></div><iframe class="stotra-pdf-viewer" src="${esc(url)}" title="${esc(text(page.title, language))} PDF" loading="lazy"></iframe></section>`).join("") : `<div class="stotra-no-pdf"><span aria-hidden="true">▤</span><div><strong>${esc(label(language, "No PDF is linked for this entry yet.", "ఈ అంశానికి పీడీఎఫ్ లింక్ ఇంకా అందుబాటులో లేదు."))}</strong><p>${esc(label(language, "The local catalog entry is available. Open its source page for the online text.", "స్థానిక జాబితాలో ఈ అంశం ఉంది. ఆన్‌లైన్ పాఠ్యం కోసం మూల పుటను తెరవండి."))}</p><a class="button button-dark" href="${esc(page.sourceUrl || "#")}" target="_blank" rel="noreferrer">${esc(label(language, "Open source text", "మూల పాఠ్యం తెరవండి"))}<span aria-hidden="true">↗</span></a></div></div>`;
    const sourceLink = page.sourceUrl ? `<a class="pdf-direct-link" href="${esc(page.sourceUrl)}" target="_blank" rel="noreferrer">${esc(label(language, "View source entry", "మూల అంశం చూడండి"))} ↗</a>` : "";
    return `<div class="stotra-detail"><div class="stotra-detail-intro"><span class="collection-card-tag">${esc(categoryNames[language][page.deity] || page.deity || label(language, "Devotional reading", "భక్తి పఠనం"))}</span><p>${esc(text(page.description, language))}</p>${sourceLink}</div><div class="stotra-pdf-list">${files}</div></div>`;
  }

  const currentAccountEmail = () => {
    try { return sessionStorage.getItem("peetham-active-email") || localStorage.getItem("peetham-active-email") || ""; }
    catch { return ""; }
  };
  const currentAccountProvider = () => {
    try { return sessionStorage.getItem("peetham-account-provider") || localStorage.getItem("peetham-account-provider") || "local"; }
    catch { return "local"; }
  };
  function authMarkup(page, language) {
    if (page.authMode === "account") {
      const email = currentAccountEmail();
      const accountNote = currentAccountProvider() === "google"
        ? label(language, "Your Google sign-in was verified by the configured account service.", "అనుసంధానించిన ఖాతా సేవ మీ గూగుల్ ప్రవేశాన్ని ధృవీకరించింది.")
        : label(language, "This is a local preview account. It is available only in this browser and is not connected to the Peetham's live account service.", "ఇది స్థానిక ప్రివ్యూ ఖాతా. ఈ బ్రౌజరులో మాత్రమే పనిచేస్తుంది; పీఠం ప్రత్యక్ష ఖాతా సేవకు అనుసంధానించబడలేదు.");
      return email
        ? `<section class="account-panel"><span class="access-icon" aria-hidden="true">◈</span><div><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Signed in on this browser", "ఈ బ్రౌజరులో ప్రవేశించారు"))}</p><h2>${esc(email)}</h2><p>${esc(accountNote)}</p><button class="button button-dark" type="button" data-auth-logout>${esc(label(language, "Sign out", "నిష్క్రమించండి"))}<span aria-hidden="true">↗</span></button></div></section>`
        : `<div class="auth-panel"><p>${esc(label(language, "You are not signed in on this browser.", "ఈ బ్రౌజరులో మీరు ప్రవేశించలేదు."))}</p><a class="button button-dark" href="${hrefFor("login")}" data-page="login">${esc(label(language, "Sign in", "ప్రవేశించండి"))}<span aria-hidden="true">↗</span></a></div>`;
    }
    const mode = page.authMode || "login";
    const reset = mode === "reset";
    const register = mode === "register";
    const formTitle = reset ? label(language, "Set a new password", "కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి") : register ? label(language, "Create your preview account", "మీ ప్రివ్యూ ఖాతాను సృష్టించండి") : label(language, "Welcome back", "స్వాగతం");
    const emailLabel = label(language, "Email address", "ఈమెయిల్ చిరునామా");
    const passwordLabel = reset ? label(language, "New password", "కొత్త పాస్‌వర్డ్") : label(language, "Password", "పాస్‌వర్డ్");
    const googleMarkup = reset ? "" : `<div class="auth-divider"><span>${esc(label(language, "or", "లేదా"))}</span></div><div class="google-signin-area"><div class="google-gsi-button" data-google-button hidden></div><button class="google-signin-button" type="button" data-google-preview><span class="google-mark" aria-hidden="true">G</span>${esc(label(language, "Continue with Google", "గూగుల్‌తో కొనసాగండి"))}</button><p class="auth-status google-status" data-google-status role="status" aria-live="polite"></p></div>`;
    return `<section class="auth-panel"><div class="auth-panel-heading"><span class="access-icon" aria-hidden="true">◈</span><div><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Member access", "సభ్యుల ప్రవేశం"))}</p><h2>${esc(formTitle)}</h2></div></div><form class="auth-form" data-auth-form="${esc(mode)}" novalidate><label>${esc(emailLabel)}<input type="email" name="email" autocomplete="email" required /></label><label>${esc(passwordLabel)}<input type="password" name="password" autocomplete="${reset ? "new-password" : register ? "new-password" : "current-password"}" minlength="8" required /></label>${register || reset ? `<label>${esc(label(language, "Confirm password", "పాస్‌వర్డ్‌ను నిర్ధారించండి"))}<input type="password" name="confirm" autocomplete="new-password" minlength="8" required /></label>` : `<label class="auth-remember"><input type="checkbox" name="remember" /><span>${esc(label(language, "Keep me signed in on this device", "ఈ పరికరంలో ప్రవేశాన్ని కొనసాగించండి"))}</span></label>`}<button class="button button-dark" type="submit">${esc(reset ? label(language, "Update password", "పాస్‌వర్డ్ మార్చండి") : register ? label(language, "Create account", "ఖాతా సృష్టించండి") : label(language, "Sign in", "ప్రవేశించండి"))}<span aria-hidden="true">↗</span></button><p class="auth-status" data-auth-status role="status" aria-live="polite"></p></form>${googleMarkup}<p class="auth-preview-note">${esc(label(language, "Local preview only. Email and password accounts stay in this browser; no email is sent and no live service is connected.", "స్థానిక ప్రివ్యూ మాత్రమే. ఈమెయిల్, పాస్‌వర్డ్ ఖాతాలు ఈ బ్రౌజరులోనే ఉంటాయి; ఈమెయిల్ పంపబడదు, ప్రత్యక్ష సేవకు అనుసంధానం లేదు."))}</p><nav class="auth-links" aria-label="${esc(label(language, "Account links", "ఖాతా లింకులు"))}">${reset ? `<a href="${hrefFor("login")}" data-page="login">${esc(label(language, "Back to sign in", "ప్రవేశానికి తిరిగి వెళ్లండి"))}</a>` : register ? `<a href="${hrefFor("login")}" data-page="login">${esc(label(language, "Already have an account? Sign in", "ఇప్పటికే ఖాతా ఉందా? ప్రవేశించండి"))}</a>` : `<a href="${hrefFor("register")}" data-page="register">${esc(label(language, "Create an account", "ఖాతా సృష్టించండి"))}</a><a href="${hrefFor("password-reset")}" data-page="password-reset">${esc(label(language, "Forgot password?", "పాస్‌వర్డ్ మర్చిపోయారా?"))}</a>`}</nav></section>`;
  }

  function relatedMarkup(page, language) {
    const related = (page.related || []).filter((slug) => pages[slug]);
    if (!related.length) return "";
    return `<section class="related-section"><div class="section-heading"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Continue exploring", "మరింత అన్వేషించండి"))}</p><h2>${esc(label(language, "Related paths", "సంబంధిత మార్గాలు"))}</h2></div><div class="related-grid">${related.map((slug, index) => cardMarkup({ title: pages[slug].title, description: pages[slug].subtitle, tag: pages[slug].category, route: slug, icon: ["✳", "◉", "ॐ"][index % 3] }, language, index)).join("")}</div></section>`;
  }

  function contentMarkup(slug, page, language) {
    if (page.kind === "collection") return collectionMarkup(page, language);
    if (page.kind === "stotra") return stotraMarkup(page, language);
    if (page.kind === "auth") return authMarkup(page, language);
    if (page.kind === "calendar") return calendarMarkup(page, language);
    if (page.kind === "dharma-topic") return dharmaTopicMarkup(page, language);
    if (page.kind === "profile") return `<div class="profile-layout">${factsMarkup(page.facts, language)}<div class="article-sections">${sectionMarkup(page.sections, language)}</div></div>`;
    if (page.kind === "article") return `<div class="article-layout">${factsMarkup(page.facts, language)}<div class="article-sections">${sectionMarkup(page.sections, language)}${page.contact ? `<aside class="contact-note"><span aria-hidden="true">✆</span><p>${esc(text(page.contact, language))}</p></aside>` : ""}</div></div>`;
    if (page.kind === "dharma-category") return dharmaCategoryMarkup(page, language);
    if (page.kind === "gate") return `<div class="access-panel"><span class="access-icon" aria-hidden="true">◈</span><div><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Member access", "సభ్యుల ప్రవేశం"))}</p><h2>${esc(label(language, "Continue to course registration", "కోర్సు నమోదుకు కొనసాగండి"))}</h2><p>${esc(text(page.note, language))}</p><a class="button button-dark" href="${hrefFor("registration")}" data-page="registration">${esc(label(language, "Registration information", "నమోదు సమాచారం"))}<span aria-hidden="true">↗</span></a></div></div>`;
    if (page.kind === "empty") return `<div class="empty-state"><span aria-hidden="true">✳</span><p>${esc(text(page.subtitle, language))}</p><small>${esc(label(language, "More resources will appear here as the collection grows.", "సేకరణ అభివృద్ధి చెందే కొద్దీ మరిన్ని వనరులు ఇక్కడ చేరతాయి."))}</small></div>`;
    if (page.kind === "quiz") return quizMarkup(page, language);
    if (page.kind === "ebook") return `<div class="ebook-panel"><div class="ebook-cover" aria-hidden="true"><span>✿</span><strong>${esc(label(language, "Śrī Devī Bhāgavatam", "శ్రీ దేవీ భాగవతం"))}</strong><small>${esc(label(language, "Sri Pranava Peetham", "శ్రీ ప్రణవపీఠం"))}</small></div><div><p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Digital reading", "డిజిటల్ పఠనం"))}</p><p>${esc(text(page.description, language))}</p><div class="volume-links">${(page.volumes || []).map((volume, index) => `<div class="volume-link-group"><a class="button button-dark" href="${esc(pdfViewerHref(volume.href))}" target="_blank" rel="noreferrer">${esc(label(language, `Read Volume ${index + 1} online`, `సంపుటి ${index + 1} ఆన్‌లైన్‌లో చదవండి`))}<span aria-hidden="true">↗</span></a><a class="pdf-direct-link" href="${esc(volume.href)}" target="_blank" rel="noreferrer">${esc(label(language, "Open original PDF", "మూల పీడీఎఫ్ తెరవండి"))}</a></div>`).join("")}</div></div></div>`;
    if (page.kind === "book") return `<div class="book-detail-panel"><div class="book-detail-art" aria-hidden="true"><span>ॐ</span><strong>${esc(text(page.title, language))}</strong><small>${esc(label(language, "Sri Pranava Peetham", "శ్రీ ప్రణవపీఠం"))}</small></div><div><p>${esc(text(page.description, language))}</p><div class="book-detail-actions"><a class="button button-dark" href="${hrefFor("books")}" data-page="books">${esc(label(language, "Return to the book library", "పుస్తకాల గ్రంథాలయానికి తిరిగి వెళ్లండి"))}<span aria-hidden="true">↗</span></a></div></div></div>`;
    if (page.kind === "media") return `<div class="media-panel"><span class="media-play" aria-hidden="true">▷</span><div><p>${esc(text(page.subtitle, language))}</p><a class="button button-dark" href="https://www.youtube.com/@BrahmasriVaddipartiPadmakar" target="_blank" rel="noreferrer">${esc(label(language, "Open Guruji's YouTube channel", "గురువుగారి యూట్యూబ్ ఛానల్ తెరవండి"))}<span aria-hidden="true">↗</span></a></div></div>`;
    if (page.kind === "resource") return `<div class="resource-panel"><span class="resource-symbol" aria-hidden="true">✿</span><div><span class="collection-card-tag">${esc(text(page.resourceTag, language))}</span><p>${esc(text(page.description, language))}</p><a class="button button-dark" href="${hrefFor("stotras")}" data-page="stotras">${esc(label(language, "Back to searchable stotras", "వెతకగల స్తోత్రాలకు తిరిగి వెళ్లండి"))}<span aria-hidden="true">↗</span></a></div></div>`;
    return `<div class="empty-state"><p>${esc(text(page.subtitle, language))}</p></div>`;
  }

  window.renderSitePage = function (slug, language = "en") {
    const page = pages[slug];
    if (!page) {
      return `<div class="route-page page-width"><header class="route-intro">${breadcrumb({ category: { en: "Page not found", te: "పుట కనబడలేదు" } }, language)}<p class="eyebrow"><span class="eyebrow-line"></span>${esc(label(language, "Not found", "కనబడలేదు"))}</p><h1>${esc(label(language, "This page could not be found.", "ఈ పుట కనబడలేదు."))}</h1><a class="button button-dark" href="index.html" data-home-link>${esc(label(language, "Back to home", "హోమ్‌కు తిరిగి వెళ్లండి"))}</a></header>${relatedMarkup({ related: ["topics", "pravachanalu", "announcements"] }, language)}</div>`;
    }
    const bodyClass = page.kind === "calendar" ? "route-page route-calendar page-width" : `route-page route-${esc(page.kind)} page-width`;
    const note = page.kind === "quiz" ? `<p class="sample-schedule-note">${esc(label(language, "Practice questions for this demo. Your choices stay in this browser.", "ఈ డెమో కోసం సాధన ప్రశ్నలు. మీ ఎంపికలు ఈ బ్రౌజరులోనే ఉంటాయి."))}</p>` : "";
    return `<div class="${bodyClass}">${pageIntro(page, language, slug)}${note}<div class="route-content">${contentMarkup(slug, page, language)}</div>${relatedMarkup(page, language)}<div class="route-back"><a href="index.html" data-home-link>← ${esc(label(language, "Back to the home page", "హోమ్ పుటకు తిరిగి వెళ్లండి"))}</a></div></div>`;
  };

  function flatten(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(flatten).join(" ");
    if (typeof value === "object") return Object.values(value).map(flatten).join(" ");
    return String(value);
  }
  const searchAliases = {
    about: "guruji guru matha gurumatha biography life achievements peetham",
    pravachanalu: "discourses talks sermons speeches pravachanam",
    "pravachanam-puranas": "puranas purana scriptures stories itihasa",
    stotras: "stotra stotram prayer prayers hymn hymns sloka slokas chanting devotional deity",
    dharma: "dharmasandehalu dharma sandehalu questions answers topics traditions",
    books: "book books grantha grandha pustakam publications shop reading",
    calendar: "events upcoming guruji tours travel yatra event schedule gudi badi"
  };
  const searchKind = (slug, parentSlug = "") => {
    const route = `${slug} ${parentSlug}`;
    if (route.includes("calendar")) return "event";
    if (route.includes("stotra") || route.includes("sloka")) return "stotra";
    if (route.includes("dharma")) return "dharma";
    if (route.includes("book") || route.includes("shop-")) return "book";
    if (route.includes("pravachan") || route.includes("puran")) return "teaching";
    if (route.includes("about")) return "about";
    return "page";
  };
  const searchKindText = (kind, language) => {
    const labels = {
      en: { event: "Event", stotra: "Stotra", dharma: "Dharma topic", book: "Book", teaching: "Teaching", about: "About", page: "Section" },
      te: { event: "కార్యక్రమం", stotra: "స్తోత్రం", dharma: "ధర్మ విషయం", book: "గ్రంథం", teaching: "బోధన", about: "పరిచయం", page: "విభాగం" }
    };
    return labels[language]?.[kind] || labels.en[kind];
  };
  const searchIndex = [];
  for (const [slug, page] of Object.entries(pages)) {
    const aliases = `${searchAliases[slug] || ""} ${slug === "pravachanam-video" ? "youtube channel video listen watch" : ""}`;
    searchIndex.push({ slug, title: page.title, description: page.subtitle || page.category, kind: searchKind(slug), titleSearch: normalize(flatten(page.title)), text: normalize(`${slug} ${flatten(page)} ${aliases}`) });
    for (const item of page.items || []) {
      const destination = item.route || slug;
      searchIndex.push({ slug: destination, title: item.title, description: item.description || item.tag, kind: searchKind(destination, slug), titleSearch: normalize(flatten(item.title)), text: normalize(`${flatten(item)} ${slug} ${searchAliases[slug] || ""}`) });
    }
  }
  for (const event of CALENDAR_EVENTS) {
    const eventDescription = `${flatten(event.description)} ${flatten(event.venue)} ${event.start} ${event.end}`;
    searchIndex.push({ slug: "calendar", title: event.title, description: { en: `${text(event.venue, "en")} · ${event.start}`, te: `${text(event.venue, "te")} · ${event.start}` }, kind: "event", start: event.start, titleSearch: normalize(flatten(event.title)), text: normalize(`${flatten(event)} ${eventDescription} calendar event guruji tours gudi badi`) });
  }
  window.searchSiteContent = function (query, language = "en", limit = 14) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const seen = new Set();
    return searchIndex.map((item, index) => {
      if (!terms.every((term) => item.text.includes(term))) return null;
      const title = normalize(`${item.titleSearch} ${flatten(item.title)}`);
      const phrase = normalize(query);
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 18 : normalize(flatten(item.description)).includes(term) ? 5 : 1), 0)
        + (title.includes(phrase) ? 24 : 0)
        + (terms.every((term) => title.includes(term)) ? 36 : 0);
      const id = `${item.slug}|${text(item.title, language)}`;
      if (seen.has(id)) return null;
      seen.add(id);
      return { ...item, score, index };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit).map((item) => ({ ...item, titleText: text(item.title, language), descriptionText: text(item.description, language), kindText: searchKindText(item.kind, language), href: item.start ? `${hrefFor(item.slug)}&date=${encodeURIComponent(item.start)}` : hrefFor(item.slug) }));
  };

  function wirePageInteractions(root, language) {
    const authForm = root.querySelector("[data-auth-form]");
    const hashPassword = async (password, salt) => {
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
      return btoa(String.fromCharCode(...new Uint8Array(bits)));
    };
    const encodeBytes = (bytes) => btoa(String.fromCharCode(...bytes));
    if (authForm) {
      authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = root.querySelector("[data-auth-status]");
        const mode = authForm.dataset.authForm;
        const email = authForm.elements.email.value.trim().toLocaleLowerCase();
        const password = authForm.elements.password.value;
        const confirm = authForm.elements.confirm?.value;
        const accountKey = `peetham-preview-account:${email}`;
        const message = (en, te) => { status.textContent = label(language, en, te); };
        status.textContent = "";
        if (!/^\S+@\S+\.\S+$/.test(email)) { message("Enter a valid email address.", "సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి."); return; }
        if (password.length < 8) { message("Use a password with at least 8 characters.", "కనీసం 8 అక్షరాల పాస్‌వర్డ్‌ను ఉపయోగించండి."); return; }
        if ((mode === "register" || mode === "reset") && password !== confirm) { message("The passwords do not match.", "పాస్‌వర్డ్‌లు సరిపోలలేదు."); return; }
        if (!window.crypto?.subtle) { message("Password security is not available in this browser. Open the site in a modern browser.", "ఈ బ్రౌజరులో పాస్‌వర్డ్ భద్రత అందుబాటులో లేదు. ఆధునిక బ్రౌజరులో వెబ్‌సైట్‌ను తెరవండి."); return; }
        try {
          const saved = localStorage.getItem(accountKey);
          if (mode === "register") {
            if (saved) { message("An account already exists for this email in this browser. Sign in instead.", "ఈ బ్రౌజరులో ఈ ఈమెయిల్‌కు ఖాతా ఉంది. బదులుగా ప్రవేశించండి."); return; }
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const hash = await hashPassword(password, salt);
            localStorage.setItem(accountKey, JSON.stringify({ salt: encodeBytes(salt), hash }));
            sessionStorage.setItem("peetham-active-email", email);
            sessionStorage.setItem("peetham-account-provider", "local");
            localStorage.removeItem("peetham-active-email");
            localStorage.removeItem("peetham-account-provider");
          } else if (mode === "reset") {
            if (!saved) { message("No local preview account was found for this email.", "ఈ ఈమెయిల్‌కు స్థానిక ప్రివ్యూ ఖాతా కనబడలేదు."); return; }
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const hash = await hashPassword(password, salt);
            localStorage.setItem(accountKey, JSON.stringify({ salt: encodeBytes(salt), hash }));
            message("Password updated in this browser. No reset email was sent.", "ఈ బ్రౌజరులో పాస్‌వర్డ్ మార్చబడింది. రీసెట్ ఈమెయిల్ పంపలేదు.");
            return;
          } else {
            if (!saved) { message("No local preview account was found. Create an account first.", "స్థానిక ప్రివ్యూ ఖాతా కనబడలేదు. ముందుగా ఖాతా సృష్టించండి."); return; }
            const record = JSON.parse(saved);
            const salt = Uint8Array.from(atob(record.salt), (character) => character.charCodeAt(0));
            if (await hashPassword(password, salt) !== record.hash) { message("That email and password do not match.", "ఈ ఈమెయిల్, పాస్‌వర్డ్ సరిపోలలేదు."); return; }
            if (authForm.elements.remember?.checked) {
              sessionStorage.removeItem("peetham-active-email");
              sessionStorage.removeItem("peetham-account-provider");
              localStorage.setItem("peetham-active-email", email);
              localStorage.setItem("peetham-account-provider", "local");
            } else {
              localStorage.removeItem("peetham-active-email");
              localStorage.removeItem("peetham-account-provider");
              sessionStorage.setItem("peetham-active-email", email);
              sessionStorage.setItem("peetham-account-provider", "local");
            }
          }
          if (mode !== "reset") {
            window.refreshAccountLink?.();
            window.renderRoute("account", { updateHistory: true });
          }
        } catch {
          message("This browser could not save the local account. Check storage permissions and try again.", "ఈ బ్రౌజరులో స్థానిక ఖాతాను భద్రపరచలేకపోయాం. నిల్వ అనుమతులను పరిశీలించి మళ్లీ ప్రయత్నించండి.");
        }
      });
    }
    const googlePreviewButton = root.querySelector("[data-google-preview]");
    const googleButtonHost = root.querySelector("[data-google-button]");
    const googleStatus = root.querySelector("[data-google-status]");
    if (googlePreviewButton && googleButtonHost && googleStatus) {
      const clientId = document.querySelector('meta[name="google-signin-client_id"]')?.content.trim() || window.PEETHAM_GOOGLE_CLIENT_ID || "";
      const authEndpoint = document.querySelector('meta[name="google-auth-endpoint"]')?.content.trim() || window.PEETHAM_GOOGLE_AUTH_ENDPOINT || "";
      const showGoogleStatus = (en, te) => { googleStatus.textContent = label(language, en, te); };
      googlePreviewButton.addEventListener("click", () => {
        const message = "Google sign-in is not configured yet. Add a Google OAuth client ID and a secure endpoint that verifies Google's credential.";
        showGoogleStatus(message, "గూగుల్ ప్రవేశం ఇంకా అమలు కాలేదు. గూగుల్ ఆధారాన్ని ధృవీకరించే OAuth క్లయింట్ ID, సురక్షిత సేవా చిరునామాను జోడించండి.");
      });
      if (!clientId || !authEndpoint) {
        showGoogleStatus("Google sign-in needs an OAuth client ID and a secure credential-verification service.", "గూగుల్ ప్రవేశానికి OAuth క్లయింట్ ID, ఆధారాలను ధృవీకరించే సురక్షిత సేవ అవసరం.");
      }
      if (clientId && authEndpoint) {
        window.__peethamGoogleUi = { status: googleStatus, language };
        window.__peethamGoogleCredentialHandler ||= async (credentialResponse) => {
          const ui = window.__peethamGoogleUi;
          if (!credentialResponse?.credential || !ui?.status?.isConnected) return;
          ui.status.textContent = label(ui.language, "Verifying your Google account…", "మీ గూగుల్ ఖాతాను ధృవీకరిస్తున్నాం…");
          const endpoint = document.querySelector('meta[name="google-auth-endpoint"]')?.content.trim() || window.PEETHAM_GOOGLE_AUTH_ENDPOINT || "";
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: credentialResponse.credential })
            });
            if (!response.ok) throw new Error("Google credential verification failed.");
            const account = await response.json();
            const email = typeof account.email === "string" ? account.email.trim().toLocaleLowerCase() : "";
            if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("The sign-in service did not return a verified email address.");
            sessionStorage.setItem("peetham-active-email", email);
            sessionStorage.setItem("peetham-account-provider", "google");
            localStorage.removeItem("peetham-active-email");
            localStorage.removeItem("peetham-account-provider");
            window.refreshAccountLink?.();
            window.renderRoute("account", { updateHistory: true });
          } catch {
            if (ui.status.isConnected) ui.status.textContent = label(ui.language, "Google could not sign you in. Check the verified sign-in service and try again.", "గూగుల్ ద్వారా ప్రవేశం కాలేదు. ధృవీకరణ సేవను పరిశీలించి మళ్లీ ప్రయత్నించండి.");
          }
        };
        const loadIdentityServices = () => {
          if (window.google?.accounts?.id) return Promise.resolve();
          if (window.__peethamGoogleScriptPromise) return window.__peethamGoogleScriptPromise;
          window.__peethamGoogleScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.append(script);
          });
          return window.__peethamGoogleScriptPromise;
        };
        googlePreviewButton.hidden = true;
        googleButtonHost.hidden = false;
        loadIdentityServices().then(() => {
          if (window.__peethamGoogleClientId !== clientId) {
            window.google.accounts.id.initialize({ client_id: clientId, callback: window.__peethamGoogleCredentialHandler });
            window.__peethamGoogleClientId = clientId;
          }
          window.google.accounts.id.renderButton(googleButtonHost, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: Math.min(360, Math.floor(googleButtonHost.getBoundingClientRect().width || 360)),
            locale: language === "te" ? "te" : "en"
          });
        }).catch(() => {
          googlePreviewButton.hidden = false;
          googleButtonHost.hidden = true;
          showGoogleStatus("Google's sign-in service could not load. Check your connection and try again.", "గూగుల్ ప్రవేశ సేవను తెరవలేకపోయాం. ఇంటర్నెట్ అనుసంధానాన్ని పరిశీలించి మళ్లీ ప్రయత్నించండి.");
        });
      }
    }
    const logout = root.querySelector("[data-auth-logout]");
    if (logout) logout.addEventListener("click", () => {
      try {
        localStorage.removeItem("peetham-active-email");
        sessionStorage.removeItem("peetham-active-email");
        localStorage.removeItem("peetham-account-provider");
        sessionStorage.removeItem("peetham-account-provider");
      } catch { /* Preview storage can be disabled. */ }
      window.google?.accounts?.id?.disableAutoSelect?.();
      window.refreshAccountLink?.();
      window.renderRoute("login", { updateHistory: true });
    });

    const collectionSearch = root.querySelector("[data-collection-search]");
    if (collectionSearch) {
      let selectedDeity = "all";
      const cards = [...root.querySelectorAll("[data-search-card]")];
      const empty = root.querySelector("[data-collection-empty]");
      const refresh = () => {
        const query = normalize(collectionSearch.value);
        let visibleCount = 0;
        cards.forEach((card) => {
          const matchesText = !query || card.dataset.searchText.includes(query);
          const matchesDeity = selectedDeity === "all" || card.dataset.deity === selectedDeity;
          card.hidden = !(matchesText && matchesDeity);
          if (!card.hidden) visibleCount += 1;
        });
        empty.hidden = visibleCount > 0;
      };
      collectionSearch.addEventListener("input", refresh);
      root.querySelectorAll("[data-deity-filter]").forEach((button) => button.addEventListener("click", () => {
        selectedDeity = button.dataset.deityFilter;
        root.querySelectorAll("[data-deity-filter]").forEach((chip) => chip.classList.toggle("is-active", chip === button));
        refresh();
      }));
    }

    if (root.querySelector(".calendar-widget")) {
      root.querySelector("[data-calendar-prev]").addEventListener("click", () => {
        window.calendarViewDate = new Date(window.calendarViewDate.getFullYear(), window.calendarViewDate.getMonth() - 1, 1, 12);
        window.calendarSelectedDate = firstMarkedDay(window.calendarViewDate.getFullYear(), window.calendarViewDate.getMonth());
        root.innerHTML = window.renderSitePage("calendar", language);
        wirePageInteractions(root, language);
      });
      root.querySelector("[data-calendar-next]").addEventListener("click", () => {
        window.calendarViewDate = new Date(window.calendarViewDate.getFullYear(), window.calendarViewDate.getMonth() + 1, 1, 12);
        window.calendarSelectedDate = firstMarkedDay(window.calendarViewDate.getFullYear(), window.calendarViewDate.getMonth());
        root.innerHTML = window.renderSitePage("calendar", language);
        wirePageInteractions(root, language);
      });
      root.querySelectorAll("[data-calendar-day]").forEach((button) => button.addEventListener("click", () => {
        window.calendarSelectedDate = button.dataset.calendarDay;
        root.innerHTML = window.renderSitePage("calendar", language);
        wirePageInteractions(root, language);
      }));
      root.querySelectorAll("[data-event-save]").forEach((button) => button.addEventListener("click", () => {
        const event = CALENDAR_EVENTS.find((entry) => entry.id === button.dataset.eventSave);
        if (!event) return;
        const stamp = (iso, time = "000000") => iso.replaceAll("-", "") + "T" + time.replaceAll(":", "");
        const endDate = new Date(dateOnly(event.end));
        endDate.setDate(endDate.getDate() + 1);
        const summary = text(event.title, language).replace(/\\n/g, " ").replace(/,/g, "\\,");
        const venue = text(event.venue, language).replace(/,/g, "\\,");
        const start = event.allDay ? `DTSTART;VALUE=DATE:${event.start.replaceAll("-", "")}` : `DTSTART:${stamp(event.start, `${event.startTime}:00`)}`;
        const end = event.allDay ? `DTEND;VALUE=DATE:${toIso(endDate).replaceAll("-", "")}` : `DTEND:${stamp(event.end, `${event.endTime}:00`)}`;
        const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sri Pranava Peetham//Sample Events//EN", "BEGIN:VEVENT", `UID:${event.id}@srivaddipartipadmakar.org`, start, end, `SUMMARY:${summary}`, `LOCATION:${venue}`, `DESCRIPTION:${text(event.description, language).replace(/,/g, "\\,")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
        const file = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = `${event.id}.ics`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }));
    }

    const quiz = root.querySelector("[data-quiz-form]");
    if (quiz) {
      const result = root.querySelector("[data-quiz-result]");
      quiz.addEventListener("submit", (event) => {
        event.preventDefault();
        const questions = pages.quiz.questions;
        let score = 0;
        questions.forEach((question, index) => {
          const choice = quiz.querySelector(`input[name="question-${index}"]:checked`);
          if (choice && Number(choice.value) === question.answer) score += 1;
        });
        result.textContent = language === "te" ? `మీ ఫలితం ${questions.length}లో ${score}. మళ్లీ ప్రయత్నించండి.` : `You scored ${score} out of ${questions.length}. You can try again anytime.`;
        result.classList.add("is-visible");
      });
      quiz.addEventListener("reset", () => {
        result.textContent = "";
        result.classList.remove("is-visible");
      });
    }
  }

  window.wirePageInteractions = wirePageInteractions;
})();
