// AnnSetu AI Chef (अन्नसेतु शेफ) - Contextual Culinary AI Brain
// Provides dynamic, conversational, non-repeating recipe & storage answers tailored to the user's live pantry.

const DISH_CATALOG = [
  {
    id: 'french_toast',
    title: 'Desi Masala French Toast',
    matchKeys: ['egg', 'anda', 'milk', 'doodh', 'bread'],
    time: '10 mins',
    tag: 'Breakfast Favorite • High Protein',
    description: 'Whisked eggs and warm milk spiced with green chillies, onions, and pan-toasted to golden perfection.',
    steps: [
      'In a wide bowl, whisk 2 eggs with 3 tbsp milk, a pinch of turmeric, salt, and black pepper.',
      'Finely chop 2 tbsp onions and 1 green chilli; stir into the egg-milk wash.',
      'Dip bread slices or rotis into the mix until evenly coated.',
      'Toast in a pan with 1 tsp butter or oil for 2 mins per side on medium flame until golden brown and aromatic.'
    ]
  },
  {
    id: 'anda_paratha',
    title: 'Street-Style Anda Paratha Roll',
    matchKeys: ['egg', 'anda', 'atta', 'flour'],
    time: '12 mins',
    tag: 'Wholesome • Filling Meal',
    description: 'Crisp layered whole wheat paratha layered with seasoned fluffy spiced egg, rolled up hot.',
    steps: [
      'Roll a thin round roti from your whole wheat atta dough.',
      'Cook on a hot tawa with a dab of ghee or oil until light golden spots appear.',
      'Whisk 1-2 eggs with chopped onions, chillies, salt, and red chilli powder.',
      'Pour the egg wash directly onto the paratha on the tawa; flip to seal and cook for 1 minute.',
      'Sprinkle chaat masala, roll it into a wrap, and serve with ketchup or green chutney.'
    ]
  },
  {
    id: 'creamy_akuri',
    title: 'Creamy Parsi Akuri (Velvety Egg Scramble)',
    matchKeys: ['egg', 'anda', 'milk', 'doodh'],
    time: '8 mins',
    tag: 'Quick & Creamy • Low Carb',
    description: 'Soft scrambled eggs gently folded with milk and butter for an ultra-velvety texture.',
    steps: [
      'Whisk 2-3 eggs with 4 tbsp milk until frothy. Season with salt and black pepper.',
      'Melt 1 tbsp butter or heat oil in a pan on medium-low flame. Sauté finely chopped onions and green chillies for 1 minute.',
      'Lower flame to low and pour in the egg-milk mixture.',
      'Fold gently with a spatula from edges to center every few seconds. Remove from heat while still glossy and soft (do not overcook!).',
      'Garnish with fresh dhaniya and enjoy with toast or phulkas.'
    ]
  },
  {
    id: 'mumbai_anda_bhurji',
    title: 'Mumbai Dhaba-Style Spicy Anda Bhurji',
    matchKeys: ['egg', 'anda'],
    time: '10 mins',
    tag: 'Spicy • Classic Street Food',
    description: 'Hot scrambled eggs cooked with caramelized onions, tomatoes, and pav bhaji masala.',
    steps: [
      'Heat 1 tbsp oil in a skillet. Sauté chopped onions until golden.',
      'Add chopped tomatoes, ginger-garlic paste, and green chillies; cook until mushy.',
      'Add 1/4 tsp turmeric, 1/2 tsp red chilli powder, and 1/2 tsp pav bhaji or garam masala.',
      'Crack 2 eggs directly into the pan. Scramble continuously on medium heat for 3 minutes until fluffy.',
      'Top with fresh coriander and a squeeze of lemon.'
    ]
  },
  {
    id: 'rice_seviyan_kheer',
    title: 'Creamy Badam-Elaichi Kheer',
    matchKeys: ['milk', 'doodh', 'rice', 'sweet', 'meetha'],
    time: '18 mins',
    tag: 'Sweet Comfort • Zero-Waste Dairy',
    description: 'Rich slow-simmered milk dessert flavored with crushed cardamom and a touch of sweetness.',
    steps: [
      'Bring 500ml milk to a gentle boil in a heavy saucepan, stirring occasionally.',
      'Add 2 tbsp washed raw rice or lightly roasted vermicelli / broken wheat.',
      'Simmer on low-medium flame for 12-15 minutes until milk thickens and rice softens completely.',
      'Stir in 3 tbsp sugar or jaggery and 1/4 tsp crushed cardamom powder.',
      'Garnish with dry fruits or nuts and enjoy warm or chilled.'
    ]
  },
  {
    id: 'homemade_paneer',
    title: 'Fresh Homemade Chenna / Soft Paneer',
    matchKeys: ['milk', 'doodh'],
    time: '10 mins',
    tag: 'Dairy Rescuer • Pure Protein',
    description: 'Rescue expiring milk before it sours by curdling it into soft, creamy cottage cheese.',
    steps: [
      'Heat milk in a saucepan until it comes to a full boil.',
      'Turn off heat immediately. Slowly stir in 1-2 tbsp lemon juice, curd, or vinegar.',
      'Watch the milk curdle into soft solid chenna and clear whey.',
      'Strain through a clean cloth or fine sieve, rinse with cold water to remove acidity, and squeeze gently.',
      'Toss with chaat masala and black pepper for a delicious fresh protein snack, or press under weight for 20 mins to make paneer cubes.'
    ]
  },
  {
    id: 'haldi_doodh',
    title: 'Golden Immunity Latte (Haldi Masala Doodh)',
    matchKeys: ['milk', 'doodh'],
    time: '5 mins',
    tag: 'Quick Soothing • Bedtime Special',
    description: 'Warm spiced Indian milk infused with turmeric, ginger, black pepper, and honey.',
    steps: [
      'Pour milk into a saucepan and place over medium flame.',
      'Whisk in 1/2 tsp turmeric powder, a pinch of freshly crushed black pepper, and crushed cardamom.',
      'Simmer gently for 3 minutes to activate the healing curcumin.',
      'Pour into a mug, stir in honey or jaggery, and enjoy this warm soothing tonic.'
    ]
  },
  {
    id: 'crispy_jeera_aloo',
    title: 'Crispy Dhaba Jeera Aloo',
    matchKeys: ['potato', 'aloo'],
    time: '12 mins',
    tag: 'Quick Comfort Sabzi',
    description: 'Golden potato cubes tossed in hot oil with roasted cumin seeds, turmeric, and amchur.',
    steps: [
      'Dice potatoes into bite-sized cubes.',
      'Heat oil in a kadhai, add 1 tbsp cumin seeds and let them crackle.',
      'Add potatoes, turmeric, red chilli powder, amchur, and salt.',
      'Roast covered on medium-low flame for 10 minutes until edges are crisp and golden.'
    ]
  },
  {
    id: 'tawa_bread_upma',
    title: 'Spiced Tawa Bread / Roti Upma',
    matchKeys: ['bread', 'pav', 'roti'],
    time: '8 mins',
    tag: 'Instant Snack • Zero Waste',
    description: 'Transform day-old bread slices or leftover rotis into a tangy, flavorful spiced tawa snack.',
    steps: [
      'Cut bread or tear leftover rotis into small bite-sized pieces.',
      'Heat oil, temper mustard seeds, curry leaves, and green chillies.',
      'Sauté onions and tomatoes until soft with a pinch of turmeric and salt.',
      'Toss bread pieces into the pan, sprinkle a splash of water, and stir well for 2 minutes.',
      'Finish with fresh lemon juice and chopped coriander.'
    ]
  },
  {
    id: 'paneer_bhurji',
    title: 'Dhaba-Style Paneer Bhurji',
    matchKeys: ['paneer', 'panir'],
    time: '12 mins',
    tag: 'High Protein Sabzi',
    description: 'Crumbled paneer cooked with sautéed onions, tomatoes, green chillies, and garam masala.',
    steps: [
      'Crumble fresh or store paneer into small chunks.',
      'Heat 1 tbsp oil/ghee, sauté cumin, onions, and chillies for 2 minutes.',
      'Add chopped tomatoes, turmeric, chilli powder, and garam masala until fragrant.',
      'Toss paneer chunks for 3 minutes on medium flame. Garnish with coriander and lemon juice.'
    ]
  },
  {
    id: 'comfort_khichdi',
    title: 'Zero-Waste Khichdi Comfort Bowl',
    matchKeys: ['rice', 'dal', 'atta'],
    time: '18 mins',
    tag: 'Healthy Comfort • One-Pot Meal',
    description: 'Wholesome one-pot rice and lentil bowl cooked with whatever vegetables need using up.',
    steps: [
      'Wash equal parts rice and dal (moong or toor).',
      'Heat ghee in a pot or cooker, temper cumin seeds and hing.',
      'Toss in diced onions, potatoes, or any available vegetables.',
      'Add rice, dal, turmeric, salt, and 3.5 cups water. Cook for 3 whistles or simmer 15 minutes.',
      'Top with a spoonful of hot desi ghee and serve.'
    ]
  }
];

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function findMatchingDishes(items = []) {
  const itemNames = items.map(i => normalize(i.name));
  const has = (key) => itemNames.some(name => name.includes(key));

  return DISH_CATALOG.filter(dish => {
    return dish.matchKeys.some(key => has(key));
  });
}

function generateChefReply(message = '', items = [], expiringItems = [], history = []) {
  const query = normalize(message);
  const itemNames = items.map(i => i.name).filter(Boolean);
  const expiringNames = expiringItems.map(i => i.name).filter(Boolean);

  // Collect previous messages from history to avoid repeating the same dish
  const historyText = history.map(h => (h.text || '').toLowerCase()).join(' ');

  // Available matched dishes based on inventory
  const matchedDishes = findMatchingDishes(items);
  const availableDishes = matchedDishes.length > 0 ? matchedDishes : DISH_CATALOG;

  // Filter out dishes that were already recommended in recent history
  const freshDishes = availableDishes.filter(d => !historyText.includes(d.title.toLowerCase()));
  const chosenDish = freshDishes.length > 0 ? freshDishes[0] : availableDishes[0];
  const alternateDish = (freshDishes.length > 1 ? freshDishes[1] : availableDishes[1]) || availableDishes[0];

  // 1. Storage / Shelf Life queries
  if (
    query.includes('store') || 
    query.includes('storage') || 
    query.includes('fresh') || 
    query.includes('kharab') || 
    query.includes('rakhe') || 
    query.includes('life') || 
    query.includes('shelf') || 
    query.includes('spoil')
  ) {
    if (query.includes('milk') || query.includes('doodh')) {
      return `🥛 **AnnSetu Milk Storage & Preservation Hacks:**\n\n1. **Best Shelf:** Always store milk in the deepest, coldest part of the main fridge shelf (around 2°C–4°C). Avoid the door shelf, which warms up every time the fridge is opened!\n2. **Boiling Rule:** Boil fresh raw milk immediately upon purchase to kill bacteria. Once boiled and cooled, it stays good for 3–4 days.\n3. **Near Expiry?** If milk packet is near expiry, don't let it sour! Curdle it into fresh Chenna/Paneer right away with 1 tbsp lemon juice.`;
    }
    if (query.includes('egg') || query.includes('anda')) {
      return `🥚 **AnnSetu Egg Care & Freshness Hacks:**\n\n1. **Storage:** Keep eggs in their original carton on a middle fridge shelf (not the door rack) to protect them from temperature fluctuations and odor absorption.\n2. **Shelf Life:** Raw eggs in shells stay fresh for 3–5 weeks in the fridge!\n3. **Quick Float Test:** Put an egg in a bowl of water: if it sinks to the bottom horizontally, it's super fresh. If it stands upright, use it soon. If it floats to the surface, discard it.`;
    }
    if (query.includes('bread') || query.includes('pav')) {
      return `🍞 **AnnSetu Bread Storage Master Tip:**\n\n1. **Never refrigerate bread!** The fridge cold temperature actually speeds up retrogradation (starch recrystallization), making bread go stale 3x faster!\n2. **Room Temp:** Keep tightly sealed at room temperature in a breadbox for 3–4 days.\n3. **Longer Life:** Sliced bread freezes amazingly for up to 3 months. Pop frozen slices straight into the toaster!`;
    }
    if (query.includes('tomato') || query.includes('tamatar')) {
      return `🍅 **AnnSetu Tomato Care Hack:**\n\nStore unripe or semi-ripe tomatoes at room temperature stem-down! Cold temperatures destroy the flavor compounds and make the texture mealy. Only refrigerate fully ripe, soft tomatoes to prevent mold.`;
    }

    return `🧊 **AnnSetu Zero-Waste Storage Cheat-Sheet:**\n\n- **Tomatoes & Bananas:** Store at room temperature away from direct sunlight.\n- **Green Dhaniya / Herbs:** Snip stem tips, wrap gently in a dry paper towel, and seal in an airtight container.\n- **Potatoes & Onions:** Keep in dry, cool, well-ventilated baskets—never together, as onions emit ethylene that causes potatoes to sprout!\n- **Dairy & Milk:** Deepest back shelf of the fridge where temperature stays below 4°C.`;
  }

  // 2. Substitutions queries
  if (
    query.includes('substitute') || 
    query.includes('vikalp') || 
    query.includes('instead') || 
    query.includes('badle') || 
    query.includes('replace')
  ) {
    return `🔄 **Smart Indian Kitchen Substitutions:**\n\n- **Heavy Cream / Malai:** Whisk 3/4 cup full-fat milk with 1/4 cup melted butter, or use smooth whisked fresh curd.\n- **Eggs (in baking/pancakes):** 1/4 cup whisked dahi (curd) OR 1/2 mashed ripe banana per egg.\n- **Buttermilk (Chaas):** 2 tbsp curd + 1/2 cup cold water + pinch of salt & roasted jeera.\n- **Tomato in Gravy:** 2 tbsp whisked curd (dahi) or 1 tsp amchur (dry mango powder) for natural tanginess.\n- **Cornstarch / Thickener:** 1 tbsp roasted besan or atta dissolved in water.`;
  }

  // 3. Sweet / Dessert cravings
  if (query.includes('sweet') || query.includes('meetha') || query.includes('dessert') || query.includes('kheer')) {
    const kheer = DISH_CATALOG.find(d => d.id === 'rice_seviyan_kheer');
    return `🍮 **Craving something sweet? Here's a quick treat:**\n\n### **${kheer.title}** (${kheer.time})\n${kheer.description}\n\n**Quick Method:**\n${kheer.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Zero-waste tip: Uses your fresh milk before it expires!*`;
  }

  // 4. Quick 5-min or 10-min snacks
  if (query.includes('quick') || query.includes('fast') || query.includes('jaldi') || query.includes('10 min') || query.includes('5 min') || query.includes('snack')) {
    const akuri = DISH_CATALOG.find(d => d.id === 'creamy_akuri') || chosenDish;
    return `⚡ **Super Fast 8-Minute Fix:**\n\n### **${akuri.title}** (${akuri.time})\n${akuri.description}\n\n**Steps:**\n${akuri.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Tip: Pairs great with warm toast or rotis!*`;
  }

  // 5. Specific Recipe or Ingredient inquiries
  if (query.includes('french toast')) {
    const ft = DISH_CATALOG.find(d => d.id === 'french_toast');
    return `🍳 **Here is the step-by-step for ${ft.title}:**\n\n${ft.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Chef Secret: Whisking milk into the eggs makes the bread custardy and soft inside while staying golden crisp outside!*`;
  }
  if (query.includes('bhurji') || query.includes('akuri')) {
    const bhurji = DISH_CATALOG.find(d => d.id === 'mumbai_anda_bhurji');
    return `🍳 **Step-by-step for ${bhurji.title}:**\n\n${bhurji.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Serve hot with buttered pav or warm phulkas!*`;
  }
  if (query.includes('chenna') || query.includes('paneer')) {
    const ch = DISH_CATALOG.find(d => d.id === 'homemade_paneer');
    return `🧀 **How to make ${ch.title} from expiring milk:**\n\n${ch.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Don't throw away the leftover whey water—use it to knead roti atta for extra-soft rotis!*`;
  }

  // 6. Greetings or appreciation
  if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'namaste' || query.startsWith('hello ') || query.startsWith('hi ')) {
    return `Namaste! 👩‍🍳 I'm ready in your kitchen! You currently have **${itemNames.join(', ')}** in stock (${expiringNames.length > 0 ? `${expiringNames.join(', ')} expiring soon` : 'all fresh'}).\n\nWhat are you in the mood to eat right now? Ask me for breakfast, quick snacks, dinner, or storage hacks!`;
  }
  if (query.includes('thank') || query.includes('dhanyawad') || query.includes('shukriya') || query.includes('good')) {
    return `Aapka swagat hai! 🌟 Happy cooking and happy zero-waste living! Whenever you need another recipe or kitchen advice, just ask your AnnSetu Chef.`;
  }

  // 7. General suggestions ("suggest me something", "kuch batao", "what to cook", "kya banau", "idea", etc.)
  // Generates a rich, non-repetitive dish with steps and offers an alternative
  return `Namaste! 👩‍🍳 Here is a delicious zero-waste meal you can prepare right now:\n\n### 🍲 **${chosenDish.title}** (${chosenDish.time})\n*${chosenDish.tag}*\n${chosenDish.description}\n\n**Quick Cooking Steps:**\n${chosenDish.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\n💡 **Want another option?**\nYou can also make **${alternateDish.title}** (${alternateDish.time}) using your **${itemNames.slice(0, 3).join(', ')}**! Just say *"tell me about ${alternateDish.title}"* or ask for a sweet treat.`;
}

module.exports = {
  DISH_CATALOG,
  generateChefReply
};
