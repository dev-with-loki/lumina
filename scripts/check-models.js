const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env.local");
        process.exit(1);
    }

    // Use fetch to list models
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
            console.log("Models written to models.json");
        })
        .catch(err => console.error(err));

} catch (err) {
    console.error("Error reading .env.local:", err);
}
