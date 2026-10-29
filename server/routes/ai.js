const express = require('express');
const router = express.Router();
const { generateDynamicRecipes } = require('../utils/recipeGenerator');
const { generateChefReply } = require('../utils/aiChefFallback');

// Fast timeout fetch helper
async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// 1. AI Recipe Generator
router.post('/recipes', async (req, res) => {
  try {
    const { items = [], expiringItems = [], dietPreference = 'all' } = req.body;
    const itemNames = items.map(i => i.name || '').filter(Boolean);
    const expiringNames = expiringItems.map(i => i.name || '').filter(Boolean);

    // Fallback dishes ready immediately
    const fallbackRecipes = generateDynamicRecipes(items, 3);

    // Attempt live AI recipe generation with short timeout
    try {
      const prompt = `You are AnnSetu AI Chef. The user has: ${itemNames.join(', ')}.
Expiring soon: ${expiringNames.join(', ')}. Diet: ${dietPreference}.
Suggest 2 or 3 quick Indian dishes using these exact items.
Respond ONLY in JSON format:
{
  "recipes": [
    {
      "title": "Dish Name",
      "time": "15 mins",
      "difficulty": "Easy",
      "tag": "High Protein / Zero Waste",
      "description": "Short appetizing description",
      "steps": ["Step 1...", "Step 2...", "Step 3..."]
    }
  ]
}`;

      const aiRes = await fetchWithTimeout('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai',
          jsonMode: true
        })
      }, 2500);

      if (aiRes.ok) {
        const text = await aiRes.text();
        if (!text.includes('Free limit reached') && !text.includes('402')) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
              const enhancedRecipes = parsed.recipes.map((r, idx) => ({
                id: `ai_gen_${idx}_${Date.now()}`,
                title: r.title || 'Pantry Dish',
                time: r.time || '15 mins',
                difficulty: r.difficulty || 'Easy',
                tag: r.tag || 'AI Chef Special',
                description: r.description || 'Custom crafted recipe using your pantry ingredients.',
                steps: Array.isArray(r.steps) ? r.steps : [r.steps],
                usedIngredients: items.filter(it => 
                  (r.title + ' ' + (r.description || '')).toLowerCase().includes((it.name || '').toLowerCase())
                ).slice(0, 4)
              }));

              return res.json({
                success: true,
                source: 'ai_live',
                recipes: enhancedRecipes
              });
            }
          }
        }
      }
    } catch (aiErr) {
      // Fast fallback to culinary engine
    }

    // Return dynamic smart engine recipes
    return res.json({
      success: true,
      source: 'smart_engine',
      recipes: fallbackRecipes
    });

  } catch (error) {
    console.error('Error generating recipes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Interactive AI Assistant / Chef Chat
router.post('/chat', async (req, res) => {
  try {
    const { message = '', history = [], items = [], expiringItems = [] } = req.body;
    const itemNames = items.map(i => i.name).filter(Boolean);
    const expiringNames = expiringItems.map(i => i.name).filter(Boolean);

    // Attempt live AI response with short timeout
    try {
      const systemMessage = `You are AnnSetu AI Chef (अन्नसेतु शेफ), a friendly, expert Indian kitchen assistant dedicated to reducing food waste.
The user currently has these items in their fridge/pantry: ${itemNames.join(', ') || 'No items listed yet'}.
Items expiring soon: ${expiringNames.join(', ') || 'None'}.
Reply in warm, concise, and helpful Hinglish/English.
Give practical cooking advice, quick recipes with steps, or smart storage tips. Keep it structured and easy to read.`;

      const messages = [
        { role: 'system', content: systemMessage },
        ...history.slice(-4).map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text })),
        { role: 'user', content: message }
      ];

      const aiRes = await fetchWithTimeout('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: 'openai'
        })
      }, 2500);

      if (aiRes.ok) {
        const text = await aiRes.text();
        if (text && text.trim().length > 10 && !text.includes('Free limit reached') && !text.includes('402')) {
          return res.json({
            success: true,
            source: 'ai_live',
            reply: text.trim()
          });
        }
      }
    } catch (aiErr) {
      // Fast fallback to intelligent chef assistant
    }

    // Dynamic contextual chef assistant response with history rotation
    const fallbackReply = generateChefReply(message, items, expiringItems, history);
    return res.json({
      success: true,
      source: 'smart_assistant',
      reply: fallbackReply
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
