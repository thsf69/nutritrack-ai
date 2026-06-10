const puppeteer = require('puppeteer');

async function waitForHydration(page) {
  let attempts = 0;
  while (attempts < 30) {
    try {
      const text = await page.evaluate(() => document.body ? document.body.innerText : '');
      if (!text.toLowerCase().includes('hydrating') && text.trim().length > 0) {
        return;
      }
    } catch (e) {
      // ignore navigation errors during check
    }
    await new Promise(r => setTimeout(r, 550));
    attempts++;
  }
}

async function waitForText(page, text, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const bodyText = await page.evaluate(() => document.body ? document.body.innerText : '');
      if (bodyText.toLowerCase().includes(text.toLowerCase())) {
        return true;
      }
    } catch (e) {
      // ignore page reload/navigation errors
    }
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });

  page.on('pageerror', err => {
    console.log('BROWSER RUNTIME ERROR:', err.toString());
  });

  console.log('1. Loading application and setting session...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nt_session', JSON.stringify({ email: 'user@example.com', id: 'usr-normal' }));
    localStorage.setItem('nt_profile', JSON.stringify({
      name: 'Test User',
      age: 25,
      gender: 'male',
      height: 170,
      weight: 70,
      activityLevel: 'moderately_active',
      goal: 'weight_loss',
      dietaryPreference: 'Veg',
      role: 'user'
    }));
    localStorage.setItem('nt_goals', JSON.stringify({
      bmi: 24.2,
      bmiCategory: 'Normal',
      bmr: 1600,
      tdee: 2400,
      recommendedCalories: 1900,
      recommendedProtein: 140,
      recommendedCarbs: 210,
      recommendedFat: 60
    }));
    localStorage.setItem('nt_schedules', JSON.stringify([
      { id: 'meal-0', mealName: 'Breakfast', timeStr: '08:00 AM', targetCaloriePercent: 30, targetCalories: 600, targetProtein: 40, targetCarbs: 70, targetFat: 20, consumedCalories: 0, consumedProtein: 0, consumedCarbs: 0, consumedFat: 0, remainingCalories: 600 }
    ]));
    localStorage.setItem('nt_ai_credits', '3'); // Initial 3 credits
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 1: AI COACH CHAT LIMIT & REWARDED AD');
  console.log('--------------------------------------------------');

  // Go to AI Coach tab
  console.log('Navigating to AI Coach tab...');
  const clickCoachTab = async () => {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('AI Coach') && b.offsetParent !== null) || 
                  buttons.find(b => b.textContent.includes('AI Coach'));
      if (btn) btn.click();
    });
  };
  await clickCoachTab();

  // Wait for the AI Coach view text to appear, re-clicking if reset
  let coachFound = false;
  const coachStart = Date.now();
  while (Date.now() - coachStart < 15000) {
    try {
      const text = await page.evaluate(() => document.body ? document.body.innerText : '');
      if (text.toLowerCase().includes('ai nutrition coach')) {
        coachFound = true;
        break;
      }
      if (!text.toLowerCase().includes('hydrating')) {
        await clickCoachTab();
      }
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`Navigation status: ${coachFound ? '✅ AI Coach Tab Active' : '❌ Coach Tab Failed'}`);

  let bodyText = await page.evaluate(() => document.body.innerText);
  console.log(`Initial Credit Status: ${bodyText.toLowerCase().includes('credits: 3 left') ? '✅ 3 Credits displayed' : '❌ Wrong credits content'}`);

  // Send first query
  console.log('Sending message 1...');
  await page.waitForSelector('input[placeholder*="Ask coach"]:not([disabled])', { timeout: 10000 });
  await page.type('input[placeholder*="Ask coach"]', 'Hello Coach!');
  await page.click('button[type="submit"]');
  
  let hasCredits2 = await waitForText(page, 'Credits: 2 left');
  console.log(`Credit Status: ${hasCredits2 ? '✅ 2 Credits remaining' : '❌ Wrong credits content'}`);

  // Send second query
  console.log('Sending message 2...');
  await page.waitForSelector('input[placeholder*="Ask coach"]:not([disabled])', { timeout: 10000 });
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ask coach"]');
    if (input) input.value = '';
  });
  await page.type('input[placeholder*="Ask coach"]', 'What should I eat for lunch?');
  await page.click('button[type="submit"]');

  let hasCredits1 = await waitForText(page, 'Credits: 1 left');
  console.log(`Credit Status: ${hasCredits1 ? '✅ 1 Credit remaining' : '❌ Wrong credits content'}`);

  // Send third query (exhausting credits)
  console.log('Sending message 3...');
  await page.waitForSelector('input[placeholder*="Ask coach"]:not([disabled])', { timeout: 10000 });
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ask coach"]');
    if (input) input.value = '';
  });
  await page.type('input[placeholder*="Ask coach"]', 'Can I eat paneer?');
  await page.click('button[type="submit"]');

  let hasCredits0 = await waitForText(page, 'Credits: 0 left');
  console.log(`Credit Status: ${hasCredits0 ? '✅ 0 Credits remaining' : '❌ Wrong credits content'}`);

  let limitReachedShown = await waitForText(page, 'Watch Video Ad to Unlock');
  console.log(`Limit Reached Overlay Shown: ${limitReachedShown ? '✅ SUCCESS: Limit panel is visible' : '❌ FAILURE: Limit panel missing'}`);

  // Click watch ad
  console.log('Clicking "Watch Video Ad" button...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Watch Video Ad'));
    if (btn) btn.click();
  });

  let adOverlayVisible = await waitForText(page, 'Google AdMob Video Stream');
  console.log(`Mock Rewarded Video Displayed: ${adOverlayVisible ? '✅ SUCCESS: Ad overlay loaded' : '❌ FAILURE: Ad overlay missing'}`);

  console.log('Waiting for ad video countdown (8 seconds)...');
  await new Promise(r => setTimeout(r, 8000));

  let closeBtnVisible = await waitForText(page, 'Close Ad');
  console.log(`Ad Close Button Appears: ${closeBtnVisible ? '✅ SUCCESS: Close button visible' : '❌ FAILURE: Close button missing'}`);

  if (closeBtnVisible) {
    console.log('Clicking Close Ad...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Ad'));
      if (btn) btn.click();
    });

    let creditsRestored = await waitForText(page, 'Credits: 3 left');
    console.log(`Rewarded Credits Received: ${creditsRestored ? '✅ SUCCESS: 3 Credits restored' : '❌ FAILURE: Credits not updated'}`);
  }

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 2: FOOD LOGGER SAVE INTERSTITIAL AD');
  console.log('--------------------------------------------------');

  // Go to Food Logger
  console.log('Navigating to Food Logger...');
  const clickLoggerTab = async () => {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Food Logger') && b.offsetParent !== null) || 
                  buttons.find(b => b.textContent.includes('Food Logger'));
      if (btn) btn.click();
    });
  };
  
  await clickLoggerTab();

  // Wait for the manual add form input, re-clicking tab if Fast Refresh resets active tab
  let loggerFound = false;
  const loggerStart = Date.now();
  while (Date.now() - loggerStart < 15000) {
    try {
      const input = await page.$('input[placeholder*="Bread"]');
      if (input) {
        loggerFound = true;
        break;
      }
      const text = await page.evaluate(() => document.body ? document.body.innerText : '');
      if (!text.toLowerCase().includes('meal journal table') && !text.toLowerCase().includes('hydrating')) {
        await clickLoggerTab();
      }
    } catch (e) {
      // ignore page reload/compile errors during check
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`Navigation status: ${loggerFound ? '✅ Food Logger Tab Active' : '❌ Food Logger Tab Failed'}`);

  if (!loggerFound) {
    const text = await page.evaluate(() => document.body ? document.body.innerText : '');
    console.log(`DEBUG: bodyText when Logger tab failed: "${text.substring(0, 1000)}"`);
  }

  // Input manual food details
  console.log('Entering food details: Bread 2 Pieces...');
  await page.type('input[placeholder*="Bread"]', 'Bread');
  await page.waitForSelector('input[placeholder*="2"]', { timeout: 10000 });
  await page.type('input[placeholder*="2"]', '2');
  await page.select('select', 'pieces');
  
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Food'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Recalculate nutrients via AI
  console.log('Triggering AI Nutrition calculation...');
  await page.evaluate(() => {
    const calcBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Calculate') || b.textContent.includes('CALCULATE'));
    if (calcBtn) calcBtn.click();
  });
  
  // Wait for calculation to finish and enable the Save button
  console.log('Waiting for Save Meal to Journal button to be active...');
  await page.waitForFunction(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Meal to Journal'));
    return btn && !btn.disabled;
  }, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click Save Meal
  console.log('Clicking "Save Meal" button...');
  await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Meal'));
    if (saveBtn) saveBtn.click();
  });

  let interstitialVisible = await waitForText(page, 'FitLife Pro');
  console.log(`Mock Interstitial Ad Displayed: ${interstitialVisible ? '✅ SUCCESS: Interstitial loaded' : '❌ FAILURE: Interstitial missing'}`);

  console.log('Waiting for skip countdown (6 seconds)...');
  await new Promise(r => setTimeout(r, 6000));

  let skipBtnVisible = await waitForText(page, 'Close Ad');
  console.log(`Ad Close Button Appears: ${skipBtnVisible ? '✅ SUCCESS: Close button visible' : '❌ FAILURE: Close button missing'}`);

  if (skipBtnVisible) {
    console.log('Clicking Close Ad...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Ad'));
      if (btn) btn.click();
    });

    let journalSaved = await waitForText(page, 'saved to your daily journal');
    console.log(`Meal Saved successfully: ${journalSaved ? '✅ SUCCESS: Journal saved' : '❌ FAILURE: Journal not saved'}`);
  }

  await browser.close();
})();
