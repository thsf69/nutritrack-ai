const puppeteer = require('puppeteer');

async function waitForHydration(page) {
  let attempts = 0;
  while (attempts < 30) {
    const text = await page.evaluate(() => document.body ? document.body.innerText : '');
    if (!text.toLowerCase().includes('hydrating') && text.trim().length > 0) {
      return;
    }
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }
  console.log('⚠️ Warning: Hydration wait timed out');
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });

  page.on('pageerror', err => {
    console.log('BROWSER RUNTIME ERROR:', err.toString());
  });

  console.log('--------------------------------------------------');
  console.log('TEST CASE 1: ACCESSING /admin WITHOUT LOGGING IN');
  console.log('--------------------------------------------------');
  
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  
  let bodyText = await page.evaluate(() => document.body.innerText);
  let lowerText = bodyText.toLowerCase();
  
  if (lowerText.includes('admin portal') && lowerText.includes('sign in to console')) {
    console.log('✅ SUCCESS: Admin Login Form displayed to anonymous/non-logged-in users.');
  } else {
    console.error('❌ FAILURE: Admin Login Form not found. Current text:\n', bodyText.substring(0, 300));
  }

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 2: REGULAR USER ATTEMPTING TO ACCESS /admin');
  console.log('--------------------------------------------------');
  
  // Navigate to root to set localStorage
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nt_session', JSON.stringify({ email: 'user@example.com', id: 'usr-normal' }));
    localStorage.setItem('nt_profile', JSON.stringify({
      name: 'Regular User',
      age: 30,
      gender: 'male',
      height: 180,
      weight: 80,
      activityLevel: 'sedentary',
      goal: 'weight_maintenance',
      dietaryPreference: 'Veg',
      role: 'user' // explicitly user role
    }));
  });

  // Navigate to /admin
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  
  bodyText = await page.evaluate(() => document.body.innerText);
  lowerText = bodyText.toLowerCase();
  
  if (lowerText.includes('403 - access forbidden') || lowerText.includes('access forbidden') || lowerText.includes('access denied')) {
    console.log('✅ SUCCESS: 403 Access Forbidden / Denied page shown for regular user.');
  } else {
    console.error('❌ FAILURE: Access guard did not block regular user. Current page text:\n', bodyText.substring(0, 400));
  }

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 3: ADMINISTRATOR ACCESSING /admin');
  console.log('--------------------------------------------------');

  // Inject admin session and role
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nt_session', JSON.stringify({ email: 'admin@nutritrack.ai', id: 'usr-admin' }));
    localStorage.setItem('nt_profile', JSON.stringify({
      name: 'Dev Admin',
      age: 28,
      gender: 'female',
      height: 165,
      weight: 60,
      activityLevel: 'moderately_active',
      goal: 'muscle_building',
      dietaryPreference: 'Veg',
      role: 'admin' // explicitly admin role
    }));
  });

  // Navigate to /admin
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  
  bodyText = await page.evaluate(() => document.body.innerText);
  lowerText = bodyText.toLowerCase();
  
  if (lowerText.includes('nutritrack console') && lowerText.includes('user directory')) {
    console.log('✅ SUCCESS: Admin Dashboard layout displayed successfully.');
  } else {
    console.error('❌ FAILURE: Admin Dashboard failed to load for authenticated administrator. Current page text:\n', bodyText.substring(0, 400));
  }

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 4: SWITCHING ADMIN CONSOLE TABS');
  console.log('--------------------------------------------------');

  // Click on "AI Engine Usage" tab
  const clickedAI = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const aiBtn = buttons.find(b => b.textContent.toLowerCase().includes('ai engine usage'));
    if (aiBtn) {
      aiBtn.click();
      return true;
    }
    return false;
  });

  if (clickedAI) {
    console.log('Clicked AI Engine Usage tab...');
    await new Promise(r => setTimeout(r, 1000));
    bodyText = await page.evaluate(() => document.body.innerText);
    lowerText = bodyText.toLowerCase();
    if (lowerText.includes('ai coach queries') || lowerText.includes('token consumption')) {
      console.log('✅ SUCCESS: Successfully navigated to AI Engine tab.');
    } else {
      console.error('❌ FAILURE: AI Engine tab did not load correct content. Inner text preview:\n', bodyText.substring(0, 400));
    }
  } else {
    console.error('❌ FAILURE: Could not locate AI Engine tab button.');
  }

  // Click on "System Config" tab
  const clickedSettings = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const settingsBtn = buttons.find(b => b.textContent.toLowerCase().includes('system config'));
    if (settingsBtn) {
      settingsBtn.click();
      return true;
    }
    return false;
  });

  if (clickedSettings) {
    console.log('Clicked System Config tab...');
    await new Promise(r => setTimeout(r, 1000));
    bodyText = await page.evaluate(() => document.body.innerText);
    lowerText = bodyText.toLowerCase();
    if (lowerText.includes('broadcast alert') || lowerText.includes('default ai model')) {
      console.log('✅ SUCCESS: Successfully navigated to System Config tab.');
    } else {
      console.error('❌ FAILURE: System Config tab did not load correct content. Inner text preview:\n', bodyText.substring(0, 400));
    }
  } else {
    console.error('❌ FAILURE: Could not locate System Config tab button.');
  }

  console.log('\n--------------------------------------------------');
  console.log('TEST CASE 5: SUSPENDING/ACTIVATING USER IN DIRECTORY');
  console.log('--------------------------------------------------');

  // Navigate back to User Directory
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const usersBtn = buttons.find(b => b.textContent.toLowerCase().includes('user directory'));
    if (usersBtn) usersBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Verify and toggle Rohan Mehta status (which is suspended initially)
  const toggleResult = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const rohanRow = rows.find(r => r.textContent.includes('Rohan Mehta'));
    if (rohanRow) {
      // Get the suspend/activate button
      const buttons = Array.from(rohanRow.querySelectorAll('button'));
      const toggleBtn = buttons.find(b => b.textContent.toLowerCase() === 'activate' || b.textContent.toLowerCase() === 'suspend');
      if (toggleBtn) {
        const textBefore = toggleBtn.textContent;
        toggleBtn.click();
        return { success: true, textBefore };
      }
    }
    return { success: false };
  });

  if (toggleResult.success) {
    console.log(`Clicked toggle button (initial state: ${toggleResult.textBefore}) for Rohan Mehta.`);
    await new Promise(r => setTimeout(r, 500));
    const finalState = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const rohanRow = rows.find(r => r.textContent.includes('Rohan Mehta'));
      if (rohanRow) {
        const buttons = Array.from(rohanRow.querySelectorAll('button'));
        const toggleBtn = buttons.find(b => b.textContent.toLowerCase() === 'activate' || b.textContent.toLowerCase() === 'suspend');
        return toggleBtn ? toggleBtn.textContent : 'none';
      }
      return 'none';
    });
    console.log(`New toggle button text state is: ${finalState}`);
    if (finalState.toLowerCase() !== toggleResult.textBefore.toLowerCase()) {
      console.log('✅ SUCCESS: Status toggle action correctly updated UI state.');
    } else {
      console.error('❌ FAILURE: UI state did not update after action click.');
    }
  } else {
    console.error('❌ FAILURE: Rohan Mehta row or action button could not be located in User Directory.');
  }

  await browser.close();
})();
