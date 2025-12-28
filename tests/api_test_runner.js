const fs = require('fs');
const path = require('path');

// We need a robust test runner.
// Since we don't have a full test suite setup (Jest/Playwright) configured yet in package.json for this specific task?
// I will create a standalone Node.js script that uses 'fetch' to call the APIs running on localhost:3000.
// This requires the Next.js server to be RUNNING.

async function runTests() {
    const BASE_URL = 'http://localhost:3000/api';
    let accessToken = '';

    console.log('🚀 Starting API Integration Tests...');

    // 1. Test Auth: Sign In (Failure)
    console.log('\nTesting Auth (Failure Case)...');
    try {
        const res = await fetch(`${BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' })
        });
        console.log(`Status: ${res.status} (Expected 401)`);
        if (res.status !== 401) throw new Error('Auth failure test failed');
    } catch (e) {
        console.error('Auth failure test error:', e.message);
    }

    // NOTE: For Success test, we need a real user. 
    // You must run the seed script or manually create a user first.
    // I will assume 'admin@example.com' / 'password123' exists.

    // 1.b Test Auth: Sign In (Success)
    console.log('\nTesting Auth (Success Case)...');
    try {
        const res = await fetch(`${BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
        });

        if (res.status === 200) {
            const data = await res.json();
            accessToken = data.accessToken;
            console.log('Login Successful! Token received.');
        } else {
            console.log('Login Failed. Status:', res.status);
            // We cannot proceed with Admin tests if login fails
        }
    } catch (e) {
        console.error('Auth success test error:', e.message);
    }

    if (!accessToken) {
        console.warn('⚠️  Skipping Admin-only tests because login failed.');
    }

    // 2. Test Projects: Get List (Public)
    console.log('\nTesting GET /projects...');
    try {
        const res = await fetch(`${BASE_URL}/projects?limit=5`);
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Projects found: ${data.projects?.length ?? 0}`);
    } catch (e) { console.error(e.message); }

    // 3. Test Projects: Create (Admin)
    if (accessToken) {
        console.log('\nTesting POST /projects (Admin)...');
        try {
            const res = await fetch(`${BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    title: 'Test Project API ' + Date.now(),
                    description: 'Test Description',
                    technologies: ['React', 'Node'],
                    featured: true
                })
            });

            console.log(`Status: ${res.status} (Expected 200 or 201)`);
            const data = await res.json();
            console.log('Response:', data);
        } catch (e) { console.error(e.message); }
    }

    // 4. Test Skills: Get (Public)
    console.log('\nTesting GET /skills...');
    try {
        const res = await fetch(`${BASE_URL}/skills`);
        console.log(`Status: ${res.status}`);
    } catch (e) { console.error(e); }

    // 5. Test Contact: Post (Public)
    console.log('\nTesting POST /contact...');
    try {
        const res = await fetch(`${BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Tester',
                email: 'test@test.com',
                subject: 'Test Subject',
                message: 'Hello API'
            })
        });
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Response:', data);
    } catch (e) { console.error(e); }

    console.log('\n✅ Tests Completed.');
}

runTests();
