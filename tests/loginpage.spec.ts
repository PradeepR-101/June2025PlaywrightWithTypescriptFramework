import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

test('verify valid login', async ({ page }) => {

    //AAA
    let loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
    let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');
    expect(await homePage.isUserLoggedIn()).toBeTruthy();
});

test.skip('verify Invalid login', async ({ page }) => {
    //AAA
    let loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
    await loginPage.doLogin('abc111@nal.com', 'test123456');
    const errorMesg = await loginPage.getInvalidLoginMessage();
    expect(errorMesg).toContain('Warning: No match for E-Mail Address and/or Password.')

});