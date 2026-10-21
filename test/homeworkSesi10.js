const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Web UI Automation - Belajar Bareng (Sesi 10 - Advanced Hooks)', function () {
    let driver;

    // Timeout untuk setup browser
    this.timeout(60000);

    // 1. HOOK: before (Dijalankan SEKALI sebelum semua test case)
    before(async function () {
        console.log('--- [HOOK] Memulai browser Chrome ---');
        driver = await new Builder().forBrowser('chrome').build();
    });

    // 2. HOOK: beforeEach (Pembersihan Cookies & Session Dinamis)
    beforeEach(async function () {
        console.log('--- [HOOK] Membuka halaman & membersihkan sesi/cookie ---');
        await driver.get('https://belajar-bareng.onrender.com/');
        
        // Menghapus semua cookies browser
        await driver.manage().deleteAllCookies();
        
        // Menghapus Local Storage dan Session Storage agar bersih total
        try {
            await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
        } catch (e) {
            // Mengabaikan jika storage belum dapat diakses pada domain tertentu
        }
    });

    // 3. HOOK: afterEach (Dijalankan SETELAH MASING-MASING test case)
    afterEach(async function () {
        console.log('--- [HOOK] Selesai menjalankan satu test case ---');
    });

    // 4. HOOK: after (Dijalankan SEKALI setelah seluruh test case selesai)
    after(async function () {
        console.log('--- [HOOK] Menutup browser ---');
        if (driver) {
            await driver.quit();
        }
    });

    it('1. Test Login Berhasil (Clean Session)', async function () {
        // Input username & password
        await driver.findElement(By.xpath("//input[@data-testid='username-input']")).sendKeys('admin');
        await driver.findElement(By.xpath("//input[@data-testid='password-input']")).sendKeys('admin');
        
        // Klik tombol login
        await driver.findElement(By.xpath("//button[@data-testid='login-button']")).click();

        // Assertion: Validasi berhasil login
        await driver.wait(until.urlContains('/users'), 5000);
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('/users');
    });

    it('2. Test Add User Berhasil (Clean Session)', async function () {
        // Karena sesi dibersihkan di beforeEach, lakukan login terlebih dahulu
        await driver.findElement(By.xpath("//input[@data-testid='username-input']")).sendKeys('admin');
        await driver.findElement(By.xpath("//input[@data-testid='password-input']")).sendKeys('admin');
        await driver.findElement(By.xpath("//button[@data-testid='login-button']")).click();
        await driver.wait(until.urlContains('/users'), 5000);

        let usernameToTest = 'qwezxc'; // tolong ganti dengan nama baru yang unik setiap kali dijalankan agar tidak bentrok dengan user yang sudah ada

        // Klik tombol Add User
        let addUser = await driver.wait(until.elementLocated(By.xpath("//button[@data-testid='add-button']")), 5000);
        await addUser.click();

        // Isi field Add User
        await driver.findElement(By.xpath("//input[@data-testid='username-input']")).sendKeys(usernameToTest);
        await driver.findElement(By.xpath("//input[@data-testid='age-input']")).sendKeys(25);

        // Klik submit
        await driver.findElement(By.xpath("//button[@data-testid='submit-button']")).click();

        // Tunggu toast muncul & teksnya
        let successToast = await driver.wait(
            until.elementLocated(By.css('[data-testid="toast-body"]')), 
            5000
        );
        
        await driver.wait(async () => {
            let text = await successToast.getText();
            return text && text.trim().length > 0;
        }, 5000);

        let messageText = await successToast.getText();

        // Validasi assertions
        expect(messageText).to.include('User successfully added');       
        expect(messageText).to.include(usernameToTest);                    
    });
});