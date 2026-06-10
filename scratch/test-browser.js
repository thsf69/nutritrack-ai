const puppeteer = require('puppeteer');

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

  console.log('1. Navigating to NutriTrack AI...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('2. Injecting mock localStorage...');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nt_session', JSON.stringify({ email: 'test@example.com', id: 'usr-12345' }));
    localStorage.setItem('nt_profile', JSON.stringify({
      name: 'Test User',
      age: 25,
      gender: 'male',
      height: 170,
      weight: 70,
      activityLevel: 'moderately_active',
      goal: 'weight_loss',
      dietaryPreference: 'Veg'
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
  });

  console.log('3. Loading application...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 5000));

  console.log('4. Clicking Meal Planner tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button, nav button'));
    const mealBtn = buttons.find(b => b.textContent.includes('Meal Planner'));
    if (mealBtn) {
      mealBtn.click();
      console.log('Clicked button successfully');
    } else {
      console.log('Button not found');
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  const textBefore = await page.evaluate(() => document.body.innerText);
  console.log('\n================ TEXT BEFORE SELECT CHANGE ================');
  console.log(textBefore);
  console.log('===========================================================');

  console.log('\n5. Selecting Non-Veg preference...');
  await page.evaluate(() => {
    const select = document.querySelector('select');
    if (select) {
      select.value = 'Non-Veg';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Select option changed');
    } else {
      console.log('Select not found');
    }
  });

  await new Promise(r => setTimeout(r, 3000));

  const textAfter = await page.evaluate(() => document.body.innerText);
  console.log('\n================ TEXT AFTER SELECT CHANGE ================');
  console.log(textAfter);
  console.log('===========================================================');

  await browser.close();
})();
