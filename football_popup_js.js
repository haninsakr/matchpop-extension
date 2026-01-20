// ===============
// Login & API Key Handling
// ===============

console.log('Script loaded successfully!');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded');
  
  const loginScreen = document.getElementById('loginScreen');
  const mainContent = document.getElementById('mainContent');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const noKeyBtn = document.getElementById('noKeyBtn');
  
  /* ======================
     LOGIN BUTTONS FIX
  ====================== */

  const loginLangToggle = document.getElementById('loginLangToggle');
  const loginThemeToggle = document.getElementById('loginThemeToggle');

  // 🌐 Language toggle (login screen)
  if (loginLangToggle) {
    loginLangToggle.addEventListener('click', async () => {
      const result = await chrome.storage.local.get(['language']);
      const current = result.language || 'en';
      const newLang = current === 'en' ? 'ar' : 'en';

      await chrome.storage.local.set({ language: newLang });

      document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', newLang);

      loginLangToggle.textContent = newLang === 'ar' ? 'EN' : 'ع';

      document.getElementById('loginTitle').textContent =
        newLang === 'ar' ? '🔑 أدخل مفتاح الـ API' : '🔑 Enter Your API Key';

      document.getElementById('loginDescription').textContent =
        newLang === 'ar'
          ? 'احصل على مفتاح مجاني من API-Sports لمتابعة المباريات'
          : 'Get your free key from API-Sports to access live football data';

      document.getElementById('saveApiKeyBtn').textContent =
        newLang === 'ar' ? 'حفظ والمتابعة' : 'Save & Continue';

      document.getElementById('noKeyBtn').textContent =
        newLang === 'ar'
          ? 'ليس لدي مفتاح API'
          : "Don't have an API Key? Sign up for free";

      // Update warning messages
      const warning1 = document.getElementById('warning1');
      const warning2 = document.getElementById('warning2');
      const warning2a = document.getElementById('warning2a');
      const warning2b = document.getElementById('warning2b');
      const warning3 = document.getElementById('warning3');

      if (warning1) warning1.textContent = newLang === 'ar' 
        ? 'تأكد من نسخ مفتاح API بشكل صحيح من لوحة API-Sports'
        : 'Make sure to COPY the API key correctly from API-Sports dashboard';

      if (warning2) warning2.innerHTML = newLang === 'ar'
        ? 'إذا لم تظهر مباريات بعد تسجيل الدخول، تحقق من:'
        : 'If no matches appear after login, check:';

      if (warning2a) warning2a.textContent = newLang === 'ar'
        ? 'مفتاح API صحيح'
        : 'Your API key is correct';

      if (warning2b) warning2b.textContent = newLang === 'ar'
        ? 'لم تتجاوز حد الطلبات اليومية'
        : "You haven't exceeded your daily API request limit";

      if (warning3) warning3.textContent = newLang === 'ar'
        ? 'المفاتيح المجانية لها حد 100 طلب يوميًا'
        : 'Free API keys have 100 requests/day limit';
    });
  }

  // 🌙 Theme toggle (login screen)
  if (loginThemeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    loginThemeToggle.checked = savedTheme === 'dark';

    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    loginThemeToggle.addEventListener('change', function () {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  console.log('Elements found:', { loginScreen, mainContent, apiKeyInput, saveApiKeyBtn, noKeyBtn });

  const savedKey = await getSavedApiKey();
  console.log('Saved key:', savedKey ? 'Found' : 'Not found');
  
  if (savedKey) {
    window.API_KEY = savedKey;
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    initializeApp();
  } else {
    loginScreen.style.display = 'block';
    mainContent.style.display = 'none';
  }

  noKeyBtn.addEventListener('click', () => {
    console.log('No key button clicked');
    chrome.tabs.create({ url: 'https://dashboard.api-football.com' });
  });

  saveApiKeyBtn.addEventListener('click', async () => {
    console.log('Save button clicked');
    const key = apiKeyInput.value.trim();
    console.log('Key entered:', key ? 'Yes' : 'No');
    
    if (!key) {
      alert('Please enter a valid API Key.');
      return;
    }

    try {
      console.log('Testing API key...');
      const test = await fetch('https://v3.football.api-sports.io/status', {
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      
      console.log('API test response:', test.status);
      
      if (!test.ok) throw new Error('Invalid key');
      
      await chrome.storage.local.set({ footballApiKey: key });
      window.API_KEY = key;
      
      console.log('API key saved successfully');
      
      loginScreen.style.display = 'none';
      mainContent.style.display = 'block';
      initializeApp();
    } catch (err) {
      console.error('Error saving API key:', err);
      alert('Invalid API Key. Please check and try again.');
    }
  });
});

async function getSavedApiKey() {
  const result = await chrome.storage.local.get(['footballApiKey']);
  return result.footballApiKey || null;
}

// ===============
// Main App Logic
// ===============

async function initializeApp() {
  const API_URL = 'https://v3.football.api-sports.io';

  const ALL_LEAGUES = {
    'premier_league': { name: 'Premier League', nameAr: 'الدوري الإنجليزي', country: 'England', countryAr: 'إنجلترا', id: 39, category: 'europe_leagues' },
    'la_liga': { name: 'La Liga', nameAr: 'الدوري الإسباني', country: 'Spain', countryAr: 'إسبانيا', id: 140, category: 'europe_leagues' },
    'serie_a': { name: 'Serie A', nameAr: 'الدوري الإيطالي', country: 'Italy', countryAr: 'إيطاليا', id: 135, category: 'europe_leagues' },
    'bundesliga': { name: 'Bundesliga', nameAr: 'الدوري الألماني', country: 'Germany', countryAr: 'ألمانيا', id: 78, category: 'europe_leagues' },
    'ligue_1': { name: 'Ligue 1', nameAr: 'الدوري الفرنسي', country: 'France', countryAr: 'فرنسا', id: 61, category: 'europe_leagues' },
    'championship': { name: 'Championship', nameAr: 'الدرجة الأولى الإنجليزية', country: 'England', countryAr: 'إنجلترا', id: 40, category: 'europe_leagues' },
    'segunda': { name: 'Segunda División', nameAr: 'الدرجة الثانية الإسبانية', country: 'Spain', countryAr: 'إسبانيا', id: 141, category: 'europe_leagues' },
    'serie_b': { name: 'Serie B', nameAr: 'الدرجة الثانية الإيطالية', country: 'Italy', countryAr: 'إيطاليا', id: 136, category: 'europe_leagues' },
    'portugal': { name: 'Primeira Liga', nameAr: 'الدوري البرتغالي', country: 'Portugal', countryAr: 'البرتغال', id: 94, category: 'europe_leagues' },
    'eredivisie': { name: 'Eredivisie', nameAr: 'الدوري الهولندي', country: 'Netherlands', countryAr: 'هولندا', id: 88, category: 'europe_leagues' },
    
    'egypt_league': { name: 'Egyptian Premier League', nameAr: 'الدوري المصري الممتاز', country: 'Egypt', countryAr: 'مصر', id: 233, category: 'arab_leagues' },
    'saudi_league': { name: 'Saudi Pro League', nameAr: 'دوري روشن السعودي', country: 'Saudi Arabia', countryAr: 'السعودية', id: 307, category: 'arab_leagues' },
    'uae_league': { name: 'UAE Pro League', nameAr: 'دوري أدنوك الإماراتي', country: 'UAE', countryAr: 'الإمارات', id: 299, category: 'arab_leagues' },
    'qatar_league': { name: 'Qatar Stars League', nameAr: 'دوري نجوم قطر', country: 'Qatar', countryAr: 'قطر', id: 301, category: 'arab_leagues' },
    'morocco_league': { name: 'Botola Pro', nameAr: 'الدوري المغربي', country: 'Morocco', countryAr: 'المغرب', id: 200, category: 'arab_leagues' },
    'tunisia_league': { name: 'Ligue Professionnelle 1', nameAr: 'الرابطة التونسية المحترفة', country: 'Tunisia', countryAr: 'تونس', id: 202, category: 'arab_leagues' },
    'algeria_league': { name: 'Ligue 1', nameAr: 'الدوري الجزائري', country: 'Algeria', countryAr: 'الجزائر', id: 203, category: 'arab_leagues' },
    
    'egypt_cup': { name: 'Egypt Cup', nameAr: 'كأس مصر', country: 'Egypt', countryAr: 'مصر', id: 235, category: 'local_cups' },
    'egypt_league_cup': { name: 'Egypt League Cup', nameAr: 'كأس الرابطة المصرية', country: 'Egypt', countryAr: 'مصر', id: 1064, category: 'local_cups' },
    'egypt_super': { name: 'Egypt Super Cup', nameAr: 'السوبر المصري', country: 'Egypt', countryAr: 'مصر', id: 234, category: 'local_cups' },
    
    'ucl': { name: 'Champions League', nameAr: 'دوري أبطال أوروبا', country: 'Europe', countryAr: 'أوروبا', id: 2, category: 'europe_cups' },
    'uel': { name: 'Europa League', nameAr: 'الدوري الأوروبي', country: 'Europe', countryAr: 'أوروبا', id: 3, category: 'europe_cups' },
    'uecl': { name: 'Conference League', nameAr: 'دوري المؤتمر الأوروبي', country: 'Europe', countryAr: 'أوروبا', id: 848, category: 'europe_cups' },
    'fa_cup': { name: 'FA Cup', nameAr: 'كأس الاتحاد الإنجليزي', country: 'England', countryAr: 'إنجلترا', id: 45, category: 'europe_cups' },
    'copa_del_rey': { name: 'Copa del Rey', nameAr: 'كأس ملك إسبانيا', country: 'Spain', countryAr: 'إسبانيا', id: 143, category: 'europe_cups' },
    'coppa_italia': { name: 'Coppa Italia', nameAr: 'كأس إيطاليا', country: 'Italy', countryAr: 'إيطاليا', id: 137, category: 'europe_cups' },
    
    'afcon': { name: 'Africa Cup of Nations', nameAr: 'كأس أمم أفريقيا', country: 'Africa', countryAr: 'أفريقيا', id: 6, category: 'africa_cups' },
    'afcon_qualifications': { name: 'Africa Cup of Nations Qualification', nameAr: 'تصفيات كأس أمم أفريقيا', country: 'Africa', countryAr: 'أفريقيا', id: 1163, category: 'africa_cups' },
    'caf_cl': { name: 'CAF Champions League', nameAr: 'دوري أبطال أفريقيا', country: 'Africa', countryAr: 'أفريقيا', id: 20, category: 'africa_cups' },
    'caf_cc': { name: 'CAF Confederation Cup', nameAr: 'كأس الكونفدرالية الأفريقية', country: 'Africa', countryAr: 'أفريقيا', id: 19, category: 'africa_cups' },
    
    'asian_cup': { name: 'Asian Cup', nameAr: 'كأس آسيا', country: 'Asia', countryAr: 'آسيا', id: 13, category: 'asia_cups' },
    'acl': { name: 'AFC Champions League', nameAr: 'دوري أبطال آسيا', country: 'Asia', countryAr: 'آسيا', id: 480, category: 'asia_cups' },
    
    'world_cup': { name: 'World Cup', nameAr: 'كأس العالم', country: 'World', countryAr: 'العالم', id: 1, category: 'world_cups' },
    'club_wc': { name: 'Club World Cup', nameAr: 'كأس العالم للأندية', country: 'World', countryAr: 'العالم', id: 15, category: 'world_cups' },
    'euro': { name: 'Euro', nameAr: 'كأس أوروبا', country: 'Europe', countryAr: 'أوروبا', id: 4, category: 'world_cups' },
    'copa_america': { name: 'Copa America', nameAr: 'كوبا أمريكا', country: 'South America', countryAr: 'أمريكا الجنوبية', id: 9, category: 'world_cups' }
  };

  const CATEGORIES = {
    'europe_leagues': { en: '⚽ European Leagues', ar: '⚽ الدوريات الأوروبية' },
    'arab_leagues': { en: '🌙 Arab Leagues', ar: '🌙 الدوريات العربية' },
    'local_cups': { en: '🏆 Local Cups', ar: '🏆 البطولات المحلية' },
    'europe_cups': { en: '🏆 European Cups', ar: '🏆 البطولات الأوروبية' },
    'africa_cups': { en: '🌍 African Cups', ar: '🌍 البطولات الأفريقية' },
    'asia_cups': { en: '🌏 Asian Cups', ar: '🌏 البطولات الآسيوية' },
    'world_cups': { en: '🌎 International Cups', ar: '🌎 البطولات الدولية' }
  };

  const MATCH_STATUS = {
    'live': { en: '🔴 Live', ar: '🔴 مباشر', filter: match => isLive(match) },
    'finished': { en: '✅ Finished', ar: '✅ منتهية', filter: match => isFinished(match) },
    'upcoming': { en: '⏰ Upcoming', ar: '⏰ قادمة', filter: match => isUpcoming(match) }
  };

  let favoriteLeagues = [];
  let favoriteTeams = [];
  let currentFilter = null;
  let currentStatus = 'live';
  let allMatches = [];
  let autoRefreshInterval = null;
  let isManagingMode = false;
  let currentLang = 'en';
  let lastFetchTime = null;
  let cachedMatches = null;
  const CACHE_DURATION = 2 * 60 * 1000;
  const goalsCache = new Map();
  const GOALS_CACHE_DURATION = 10 * 60 * 1000;

  function isLive(match) {
    const status = match.fixture.status.short;
    return ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(status);
  }

  function isFinished(match) {
    const status = match.fixture.status.short;
    return ['FT', 'AET', 'PEN'].includes(status);
  }

  function isUpcoming(match) {
    const status = match.fixture.status.short;
    return status === 'NS' || status === 'TBD';
  }

  async function loadLanguage() {
    try {
      const result = await chrome.storage.local.get(['language']);
      currentLang = result.language || 'en';
      updateLanguage();
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }

  async function saveLanguage() {
    try {
      await chrome.storage.local.set({ language: currentLang });
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }

  function updateLanguage() {
    const isArabic = currentLang === 'ar';
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
    
    const header = document.querySelector('.header h1');
    if (header) header.textContent = isArabic ? '⚽ المباريات المباشرة' : '⚽ Live Matches';
    
    const manageBtn = document.getElementById('manageBtn');
    if (manageBtn) manageBtn.textContent = isArabic ? '⚙️ إدارة الدوريات المفضلة' : '⚙️ Manage Favorite Leagues';
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) langToggle.textContent = isArabic ? 'EN' : 'ع';
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    saveLanguage();
    updateLanguage();
    
    if (!isManagingMode) {
      createFilters();
      createStatusFilters();
      displayMatches(allMatches);
    } else {
      openManageLeagues();
    }
  }

  async function loadFavorites() {
    try {
      const result = await chrome.storage.local.get(['favoriteLeagues']);
      if (result.favoriteLeagues && result.favoriteLeagues.length > 0) {
        favoriteLeagues = result.favoriteLeagues;
      } else {
        favoriteLeagues = ['premier_league', 'la_liga', 'serie_a', 'ucl', 'afcon', 'egypt_league'];
        await saveFavorites();
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      favoriteLeagues = ['premier_league', 'la_liga', 'serie_a', 'ucl'];
    }
  }

  async function saveFavorites() {
    try {
      await chrome.storage.local.set({ favoriteLeagues: favoriteLeagues });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  function createFilters() {
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = '';

    if (favoriteLeagues.length === 0) {
      const noLeaguesMsg = currentLang === 'ar' 
        ? '<p>لم يتم اختيار دوريات بعد</p><p style="font-size: 12px; margin-top: 5px;">اضغط "إدارة الدوريات" لإضافة دوريات</p>'
        : '<p>No leagues selected yet</p><p style="font-size: 12px; margin-top: 5px;">Click "Manage Leagues" to add leagues</p>';
      
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
          ${noLeaguesMsg}
        </div>
      `;
      return;
    }

    favoriteLeagues.forEach((leagueKey, index) => {
      const league = ALL_LEAGUES[leagueKey];
      if (!league) return;

      const btn = document.createElement('button');
      btn.className = 'filter-btn favorite-btn';
      
      if (league.category === 'arab_leagues') {
        const displayName = currentLang === 'ar' ? league.nameAr : league.name;
        const displayCountry = currentLang === 'ar' ? league.countryAr : league.country;
        btn.textContent = `${displayName} (${displayCountry})`;
      } else {
        btn.textContent = currentLang === 'ar' ? league.nameAr : league.name;
      }
      
      btn.onclick = function() {
        document.querySelectorAll('.favorite-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = leagueKey;
        displayMatches(allMatches);
      };
      
      if (index === 0) {
        btn.classList.add('active');
        currentFilter = leagueKey;
      }
      
      container.appendChild(btn);
    });
  }

  function createStatusFilters() {
    const container = document.getElementById('statusFilters');
    container.innerHTML = '';
    
    Object.keys(MATCH_STATUS).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn status-btn';
      if (key === 'live') btn.classList.add('active');
      btn.textContent = MATCH_STATUS[key][currentLang];
      btn.onclick = function() {
        document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentStatus = key;
        displayMatches(allMatches);
      };
      container.appendChild(btn);
    });
  }

  async function fetchMatches() {
    if (isManagingMode) return;

    const loading = document.getElementById('loading');
    const container = document.getElementById('matchesContainer');

    const now = Date.now();
    if (cachedMatches && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      allMatches = cachedMatches;
      loading.style.display = 'none';
      container.style.display = 'block';
      displayMatches(allMatches);
      updateLastUpdateTime();
      return;
    }

    loading.style.display = 'block';
    container.style.display = 'none';

    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(
        `${API_URL}/fixtures?date=${today}&timezone=Africa/Cairo`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': window.API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        }
      );

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      let matches = data.response || [];

      const favIds = [];
      favoriteLeagues.forEach(key => {
        const league = ALL_LEAGUES[key];
        if (!league) return;
        if (Array.isArray(league.ids)) {
          favIds.push(...league.ids);
        } else if (league.id) {
          favIds.push(league.id);
        }
      });

      if (favIds.length > 0) {
        matches = matches.filter(m => favIds.includes(m.league.id));
      }

      matches = matches.filter(match => {
        const c = match.league.country.toLowerCase();
        const n = match.league.name.toLowerCase();
        return !c.includes('israel') && !n.includes('israel');
      });

      allMatches = matches;
      cachedMatches = [...matches];
      lastFetchTime = now;

      if (allMatches.length === 0) {
        const isArabic = currentLang === 'ar';
        const noMatchesTitle = isArabic ? '⚠️ لا توجد مباريات' : '⚠️ No Matches Found';
        const possibleReasons = isArabic ? 'الأسباب المحتملة:' : 'Possible reasons:';
        const reason1 = isArabic ? 'لا توجد مباريات اليوم في الدوريات المفضلة' : 'No matches today in your favorite leagues';
        const reason2 = isArabic ? 'تجاوزت حد الطلبات اليومية (100 طلب)' : 'You exceeded daily API limit (100 requests)';
        const reason3 = isArabic ? 'مفتاح API غير صحيح' : 'Invalid API key';
        const suggestion = isArabic ? 'جرّب تحديث الصفحة أو تغيير الدوريات المفضلة' : 'Try refreshing or changing favorite leagues';
        
        showError(`
          <div style="text-align: center;">
            <h3>${noMatchesTitle}</h3>
            <p style="font-size: 13px; margin-top: 15px; color: rgba(255,255,255,0.8);">
              <strong>${possibleReasons}</strong><br>
              • ${reason1}<br>
              • ${reason2}<br>
              • ${reason3}
            </p>
            <p style="font-size: 12px; margin-top: 10px; color: #ffc107;">
              💡 ${suggestion}
            </p>
          </div>
        `);
      } else {
        displayMatches(allMatches);
        updateLastUpdateTime();
      }

    } catch (err) {
      console.error(err);
      const isArabic = currentLang === 'ar';
      const errorTitle = isArabic ? '❌ خطأ في تحميل المباريات' : '❌ Error Loading Matches';
      const errorReasons = isArabic ? 'الأسباب المحتملة:' : 'Possible reasons:';
      const reason1 = isArabic ? 'مفتاح API غير صحيح أو منتهي الصلاحية' : 'Invalid or expired API key';
      const reason2 = isArabic ? 'تجاوزت الحد اليومي للطلبات (100 طلب)' : 'Exceeded daily request limit (100 requests)';
      const reason3 = isArabic ? 'مشكلة في الاتصال بالإنترنت' : 'Internet connection issue';
      const suggestion = isArabic ? 'جرّب التالي:' : 'Try the following:';
      const suggest1 = isArabic ? 'تأكد من نسخ المفتاح بشكل صحيح' : 'Verify your API key is copied correctly';
      const suggest2 = isArabic ? 'انتظر قليلاً إذا كنت قد تجاوزت الحد اليومي' : 'Wait if you exceeded daily limit';
      const suggest3 = isArabic ? 'تحقق من اتصالك بالإنترنت' : 'Check your internet connection';
      
      showError(`
        <div style="text-align: center;">
          <h3>${errorTitle}</h3>
          <div style="background: rgba(244, 67, 54, 0.2); border: 2px solid rgba(244, 67, 54, 0.5); border-radius: 10px; padding: 15px; margin: 15px auto; max-width: 350px; text-align: left;">
            <p style="font-size: 13px; margin: 0 0 10px 0; color: rgba(255,255,255,0.9);">
              <strong style="color: #ff5252;">${errorReasons}</strong><br>
              • ${reason1}<br>
              • ${reason2}<br>
              • ${reason3}
            </p>
            <pstyle="font-size: 12px; margin: 10px 0 0 0; color: #ffc107;">
              <strong>💡 ${suggestion}</strong><br>
              ✓ ${suggest1}<br>
              ✓ ${suggest2}<br>
              ✓ ${suggest3}
            </p>
          </div>
        </div>
      `);
    }
  }

  function displayMatches(matches) {
    if (isManagingMode) return;

    const container = document.getElementById('matchesContainer');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = '';

    let filteredMatches = matches;

    if (currentFilter && ALL_LEAGUES[currentFilter]) {
      const league = ALL_LEAGUES[currentFilter];
      let targetIds = [];
      if (Array.isArray(league.ids)) {
        targetIds = league.ids;
      } else if (league.id) {
        targetIds = [league.id];
      }
      filteredMatches = matches.filter(m => targetIds.includes(m.league.id));
    }

    const statusFilter = MATCH_STATUS[currentStatus].filter;
    filteredMatches = filteredMatches.filter(statusFilter);

    if (filteredMatches.length === 0) {
      const isArabic = currentLang === 'ar';
      const statusName = MATCH_STATUS[currentStatus][currentLang];
      const noMatchesMsg = isArabic ? `لا توجد مباريات ${statusName.replace(/^[🔴✅⏰]\s*/, '')}` : `No ${statusName} matches`;
      const refreshText = isArabic ? '🔄 تحديث' : '🔄 Refresh';
      const manageText = isArabic ? '⚙️ إدارة الدوريات' : '⚙️ Manage Leagues';
      const hint = isArabic 
        ? 'جرّب تغيير الحالة أو إضافة دوريات أخرى' 
        : 'Try changing status or adding more leagues';
      
      container.innerHTML = `
        <div class="no-matches">
          <h3>${noMatchesMsg}</h3>
          <p style="font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 10px;">
            💡 ${hint}
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
            <button class="refresh-btn" id="retryBtn">${refreshText}</button>
            <button class="refresh-btn" id="manageLeaguesBtn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">${manageText}</button>
          </div>
        </div>
      `;
      
      document.getElementById('retryBtn').onclick = () => {
        cachedMatches = null;
        lastFetchTime = null;
        fetchMatches();
      };
      
      document.getElementById('manageLeaguesBtn').onclick = openManageLeagues;
      return;
    }

    filteredMatches.sort((a, b) => {
      const aLive = isLive(a);
      const bLive = isLive(b);
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    });

    filteredMatches.forEach(match => {
      const card = createMatchCard(match);
      container.appendChild(card);
    });
  }

  function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    const status = match.fixture.status.short;
    const elapsed = match.fixture.status.elapsed || '0';
    const homeScore = match.goals.home ?? '-';
    const awayScore = match.goals.away ?? '-';
    
    const isArabic = currentLang === 'ar';
    
    let matchStatus = '';
    
    if (isLive(match)) {
      matchStatus = `<div class="live-badge">${isArabic ? 'مباشر' : 'Live'} - ${elapsed}'</div>`;
    } else if (isFinished(match)) {
      matchStatus = `<div class="match-time">${isArabic ? 'انتهت' : 'Finished'}</div>`;
    } else if (isUpcoming(match)) {
      const matchTime = new Date(match.fixture.date);
      matchStatus = `<div class="match-time">${matchTime.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>`;
    } else {
      matchStatus = `<div class="match-time">${status}</div>`;
    }
    
    card.innerHTML = `
      <div class="league-info">
        <img src="${match.league.logo}" alt="${match.league.name}" class="league-logo" onerror="this.style.display='none'">
        <span class="league-name">${match.league.name}</span>
      </div>
      
      <div class="match-content">
        <div class="team">
          <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="team-logo" onerror="this.style.display='none'">
          <div class="team-name">${match.teams.home.name}</div>
        </div>
        
        <div class="score-box">
          <div class="score">${homeScore} - ${awayScore}</div>
          ${matchStatus}
        </div>
        
        <div class="team">
          <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="team-logo" onerror="this.style.display='none'">
          <div class="team-name">${match.teams.away.name}</div>
        </div>
      </div>
    `;
    
    if ((homeScore !== '-' && homeScore > 0) || (awayScore !== '-' && awayScore > 0)) {
      const goalsBtn = document.createElement('div');
      goalsBtn.className = 'show-goals-btn';
      goalsBtn.textContent = isArabic ? '⚽ عرض الأهداف' : '⚽ Show Goals';
      goalsBtn.onclick = () => loadGoals(match.fixture.id, card);
      card.appendChild(goalsBtn);
    }
    
    return card;
  }

  async function loadGoals(fixtureId, cardElement) {
    const existingGoals = cardElement.querySelector('.goals-section');
    if (existingGoals) {
      existingGoals.remove();
      cardElement.querySelector('.show-goals-btn').textContent = 
        currentLang === 'ar' ? '⚽ عرض الأهداف' : '⚽ Show Goals';
      return;
    }

    const isArabic = currentLang === 'ar';
    const btn = cardElement.querySelector('.show-goals-btn');
    btn.textContent = isArabic ? '⏳ جاري التحميل...' : '⏳ Loading...';

    const now = Date.now();
    const cacheEntry = goalsCache.get(fixtureId);

    if (cacheEntry && (now - cacheEntry.timestamp) < GOALS_CACHE_DURATION) {
      renderGoals(cardElement, cacheEntry.goals);
      btn.textContent = isArabic ? '⚽ إخفاء الأهداف' : '⚽ Hide Goals';
      return;
    }

    try {
      const eventsResponse = await fetch(`${API_URL}/fixtures/events?fixture=${fixtureId}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': window.API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const goals = extractGoals(eventsData.response || []);
        
        goalsCache.set(fixtureId, { goals, timestamp: now });

        if (goals.length > 0) {
          renderGoals(cardElement, goals);
          btn.textContent = isArabic ? '⚽ إخفاء الأهداف' : '⚽ Hide Goals';
        } else {
          btn.textContent = isArabic ? '⚽ لا توجد أهداف' : '⚽ No goals';
        }
      } else {
        btn.textContent = isArabic ? '⚽ فشل التحميل' : '⚽ Load failed';
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      btn.textContent = isArabic ? '⚽ فشل التحميل' : '⚽ Load failed';
    }
  }

  function renderGoals(cardElement, goals) {
    const isArabic = currentLang === 'ar';
    
    const goalsSection = document.createElement('div');
    goalsSection.className = 'goals-section';
    goalsSection.innerHTML = `
      <div class="goals-title">${isArabic ? '⚽ الأهداف' : '⚽ Goals'}</div>
      <div class="goals-list">
        ${goals.map(goal => `
          <div class="goal-item">
            <span class="goal-player">${goal.player}</span>
            <span class="goal-time">${goal.time}'</span>
            <span class="goal-team">${goal.teamName}</span>
          </div>
        `).join('')}
      </div>
    `;
    cardElement.appendChild(goalsSection);
  }

  function extractGoals(events) {
    const goals = [];
    
    events.forEach(event => {
      if (event.type === 'Goal' && event.detail !== 'Missed Penalty') {
        goals.push({
          player: event.player?.name || (currentLang === 'ar' ? 'غير معروف' : 'Unknown'),
          time: event.time?.elapsed || '0',
          teamName: event.team?.name || (currentLang === 'ar' ? 'غير معروف' : 'Unknown')
        });
      }
    });
    
    goals.sort((a, b) => parseInt(a.time) - parseInt(b.time));
    return goals;
  }

  function updateLastUpdateTime() {
    const lastUpdate = document.getElementById('lastUpdate');
    const now = new Date();
    const isArabic = currentLang === 'ar';
    const timeStr = now.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    lastUpdate.textContent = isArabic ? `آخر تحديث: ${timeStr}` : `Last update: ${timeStr}`;
  }

  function showError(message) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('matchesContainer');
    
    loading.style.display = 'none';
    container.style.display = 'block';
    
    const retryText = currentLang === 'ar' ? '🔄 إعادة المحاولة' : '🔄 Retry';
    const logoutText = currentLang === 'ar' ? '🔑 تغيير المفتاح' : '🔑 Change Key';
    
    container.innerHTML = `
      <div class="no-matches">
        ${message}
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
          <button class="refresh-btn" id="retryBtn">${retryText}</button>
          <button class="refresh-btn" id="changeKeyBtn" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);">${logoutText}</button>
        </div>
      </div>
    `;
    
    document.getElementById('retryBtn').onclick = () => {
      cachedMatches = null;
      lastFetchTime = null;
      fetchMatches();
    };
    
    document.getElementById('changeKeyBtn').onclick = async () => {
      if (confirm(currentLang === 'ar' ? 'هل تريد تغيير مفتاح API؟' : 'Do you want to change API key?')) {
        await chrome.storage.local.remove('footballApiKey');
        window.API_KEY = null;
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('apiKeyInput').value = '';
      }
    };
  }

  function openManageLeagues() {
    isManagingMode = true;
    
    const header = document.getElementById('mainHeader');
    if (header) header.style.display = 'none';
    
    const container = document.getElementById('matchesContainer');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = '';

    const isArabic = currentLang === 'ar';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'manage-header';
    headerDiv.innerHTML = `
      <h2>${isArabic ? '⚙️ إدارة الدوريات المفضلة' : '⚙️ Manage Favorite Leagues'}</h2>
      <p>${isArabic ? 'اختر الدوريات التي تريد متابعتها' : 'Select the leagues you want to follow'}</p>
    `;
    container.appendChild(headerDiv);

    const actions = document.createElement('div');
    actions.className = 'manage-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'action-btn save-btn';
    saveBtn.textContent = isArabic ? '✔ حفظ والعودة' : '✔ Save & Return';
    saveBtn.onclick = async function() {
      await saveFavorites();
      isManagingMode = false;
      if (header) header.style.display = 'block';
      createFilters();
      await fetchMatches();
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'action-btn cancel-btn';
    cancelBtn.textContent = isArabic ? '✕ إلغاء' : '✕ Cancel';
    cancelBtn.onclick = async function() {
      await loadFavorites();
      isManagingMode = false;
      if (header) header.style.display = 'block';
      createFilters();
      await fetchMatches();
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    container.appendChild(actions);

    Object.keys(CATEGORIES).forEach(categoryKey => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-section';
      
      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'category-title';
      categoryTitle.textContent = CATEGORIES[categoryKey][currentLang];
      categoryDiv.appendChild(categoryTitle);

      const leaguesGrid = document.createElement('div');
      leaguesGrid.className = 'leagues-grid';

      Object.keys(ALL_LEAGUES).forEach(leagueKey => {
        const league = ALL_LEAGUES[leagueKey];
        if (league.category !== categoryKey) return;

        const isFavorite = favoriteLeagues.includes(leagueKey);
        
        const leagueCard = document.createElement('div');
        leagueCard.className = `league-card ${isFavorite ? 'selected' : ''}`;
        
        let displayName = currentLang === 'ar' ? league.nameAr : league.name;
        if (categoryKey === 'arab_leagues' || categoryKey === 'local_cups') {
          const displayCountry = currentLang === 'ar' ? league.countryAr : league.country;
          displayName += ` (${displayCountry})`;
        }
        
        leagueCard.innerHTML = `
          <div class="league-card-content">
            <span class="league-card-name">${displayName}</span>
            <span class="league-card-check">${isFavorite ? '✔' : ''}</span>
          </div>
        `;
        
        leagueCard.onclick = function() {
          const index = favoriteLeagues.indexOf(leagueKey);
          if (index > -1) {
            favoriteLeagues.splice(index, 1);
            this.classList.remove('selected');
            this.querySelector('.league-card-check').textContent = '';
          } else {
            favoriteLeagues.push(leagueKey);
            this.classList.add('selected');
            this.querySelector('.league-card-check').textContent = '✔';
          }
        };
        
        leaguesGrid.appendChild(leagueCard);
      });

      categoryDiv.appendChild(leaguesGrid);
      container.appendChild(categoryDiv);
    });
  }

  await loadLanguage();
  
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
  
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.addEventListener('click', toggleLanguage);
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm(currentLang === 'ar' ? 'هل تريد تسجيل الخروج؟' : 'Do you want to logout?')) {
        await chrome.storage.local.remove('footballApiKey');
        window.API_KEY = null;
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('apiKeyInput').value = '';
      }
    });
  }
  
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    cachedMatches = null;
    lastFetchTime = null;
    fetchMatches();
  });
  
  const manageBtn = document.getElementById('manageBtn');
  if (manageBtn) manageBtn.addEventListener('click', openManageLeagues);
  
  await loadFavorites();
  createFilters();
  createStatusFilters();
  await fetchMatches();
}

window.addEventListener('unload', () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});