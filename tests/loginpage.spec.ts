import { LoginPage } from '../pages/LoginPage';
import { test, expect } from '../fixtures/baseFixtures'


test('verify valid login', async ({ homePage }) => {
    await expect(homePage.page).toHaveTitle('My Account');
});


test.skip('verify Invalid login', async ({ page, baseURL }) => {
    //AAA
    let loginPage = new LoginPage(page);
    await loginPage.goToLoginPage(baseURL);
    await loginPage.doLogin('abc111@nal.com', 'test123456');
    const errorMesg = await loginPage.getInvalidLoginMessage();
    expect(errorMesg).toContain('Warning: No match for E-Mail Address and/or Password.')

});