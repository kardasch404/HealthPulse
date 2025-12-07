import fetch from 'node-fetch';

async function testLoginAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'soufianlabo@healthpulse.health',
                password: 'password123'
            })
        });

        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLoginAPI();