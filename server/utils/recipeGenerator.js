// Comprehensive Indian & Global Zero-Waste Culinary Engine
// Generates accurate, tailored recipes based on whatever items are in the user's pantry.

const CULINARY_MATRIX = [
  // 1. Eggs + Milk combos
  {
    id: 'masala_french_toast',
    title: 'Desi Masala French Toast',
    time: '10 mins',
    difficulty: 'Super Easy',
    tag: 'High Protein Breakfast',
    description: 'Whisk eggs with milk, green chillies, onions, and toast bread until golden brown.',
    required: ['egg', 'milk'],
    optional: ['bread', 'pav', 'onion', 'chilli', 'coriander', 'butter'],
    steps: [
      'In a wide bowl, whisk 2 eggs with 3 tbsp milk, a pinch of turmeric, salt, and black pepper.',
      'Finely chop 2 tbsp onions and 1 green chilli; stir into the egg-milk mixture.',
      'Dip bread slices into the egg-milk wash until evenly coated on both sides.',
      'Heat 1 tsp butter or oil in a pan and toast each slice on medium flame for 2 mins per side until golden brown and aromatic.',
      'Serve hot with mint chutney or ketchup!'
    ]
  },
  {
    id: 'creamy_egg_scramble',
    title: 'Creamy Parsi Style Akuri / Egg Scramble',
    time: '12 mins',
    difficulty: 'Easy',
    tag: 'Rich & Creamy',
    description: 'Soft, creamy scrambled eggs cooked gently with milk, butter, onions, and warm spices.',
    required: ['egg', 'milk'],
    optional: ['onion', 'tomato', 'coriander', 'butter', 'bread', 'pav'],
    steps: [
      'Whisk eggs with 4 tbsp milk until frothy and smooth. Season with salt and pepper.',
      'Melt butter or heat oil in a pan over medium-low heat. Sauté finely chopped onions and green chillies for 2 minutes.',
      'Lower flame to low and pour in the egg-milk mixture.',
      'Gently fold the eggs with a spatula from edges to center every few seconds until soft, creamy curds form.',
      'Remove from heat while still glossy and soft. Garnish with chopped coriander and serve with warm bread or paratha.'
    ]
  },

  // 2. Eggs combos
  {
    id: 'spicy_anda_bhurji',
    title: 'Mumbai Street-Style Spicy Anda Bhurji',
    time: '12 mins',
    difficulty: 'Easy',
    tag: 'Desi Street Favorite',
    description: 'Classic scrambled eggs cooked with chopped onions, juicy tomatoes, and bold spices.',
    required: ['egg'],
    optional: ['onion', 'tomato', 'green chilli', 'coriander', 'bread', 'pav', 'roti'],
    steps: [
      'Heat 1 tbsp oil in a skillet. Sauté finely chopped onions until translucent.',
      'Add chopped tomatoes, ginger, and green chillies. Cook until tomatoes soften.',
      'Add 1/4 tsp turmeric, 1/2 tsp red chilli powder, and 1/2 tsp pav bhaji or garam masala.',
      'Crack 2-3 eggs directly into the pan. Scramble continuously on medium heat for 3-4 minutes until cooked through.',
      'Garnish generously with fresh coriander and serve with buttered pav or hot rotis.'
    ]
  },
  {
    id: 'homestyle_egg_curry',
    title: 'Homestyle Tariwali Egg Curry',
    time: '20 mins',
    difficulty: 'Medium',
    tag: 'Wholesome Dinner',
    description: 'Golden shallow-fried boiled eggs simmered in a spiced onion-tomato gravy.',
    required: ['egg'],
    optional: ['tomato', 'onion', 'potato', 'garlic', 'ginger', 'rice', 'roti'],
    steps: [
      'Boil eggs for 9-10 minutes, peel, and make light slits on the sides.',
      'Prick eggs and shallow fry with a pinch of turmeric and chilli powder for 2 minutes until blistered golden.',
      'In the same pan, sauté cumin, onions, ginger-garlic paste, and tomato purée until oil separates.',
      'Add coriander powder, garam masala, salt, and 1/2 cup warm water. Bring to a simmer.',
      'Drop in the fried eggs, cover and simmer for 5 minutes. Enjoy with steamed rice or phulkas.'
    ]
  },
  {
    id: 'egg_fried_rice',
    title: 'Quick Pantry Egg Fried Rice',
    time: '15 mins',
    difficulty: 'Super Fast',
    tag: 'Leftover Rescuer',
    description: 'Transform leftover rice and fresh eggs into a delicious, high-protein skillet meal.',
    required: ['egg', 'rice'],
    optional: ['onion', 'capsicum', 'carrot', 'garlic', 'soy sauce', 'peas'],
    steps: [
      'Scramble 2 eggs in a hot wok with 1 tsp oil until just set; transfer to a plate.',
      'Add another tsp of oil, toss minced garlic, sliced onions, and any available chopped veggies for 2 minutes on high flame.',
      'Add cooked or leftover rice, breaking up any clumps with a spatula.',
      'Season with salt, black pepper, and a dash of soy sauce or amchur.',
      'Toss scrambled eggs back into the rice, mix on high heat for 1 minute, and serve hot.'
    ]
  },

  // 3. Milk combos
  {
    id: 'rice_seviyan_kheer',
    title: 'Pantry Rice / Seviyan Kheer',
    time: '20 mins',
    difficulty: 'Easy',
    tag: 'Sweet Comfort',
    description: 'A fragrant Indian dessert simmered with milk, rice or vermicelli, cardamom, and dry fruits.',
    required: ['milk'],
    optional: ['rice', 'dry fruits', 'sugar', 'cardamom', 'ghee', 'nuts'],
    steps: [
      'Bring 500ml milk to a gentle boil in a heavy-bottomed pan, stirring occasionally so it doesn’t scorch.',
      'Add 2 tbsp washed raw rice or lightly roasted vermicelli / broken wheat.',
      'Simmer on low-medium flame for 15 minutes until milk thickens and rice is completely soft.',
      'Stir in 3 tbsp sugar or jaggery and 1/4 tsp crushed cardamom powder.',
      'Garnish with sliced almonds or cashews roasted in a drop of ghee. Serve warm or chilled!'
    ]
  },
  {
    id: 'homemade_fresh_chenna',
    title: 'Homemade Soft Chenna / Paneer Bites',
    time: '15 mins',
    difficulty: 'Easy',
    tag: 'Zero Waste Dairy',
    description: 'Turn expiring milk into soft, protein-rich homemade cottage cheese in minutes.',
    required: ['milk'],
    optional: ['lemon', 'curd', 'vinegar', 'salt', 'pepper'],
    steps: [
      'Heat milk in a saucepan until it comes to a rolling boil.',
      'Turn off the heat. Slowly stir in 1-2 tbsp lemon juice, vinegar, or curd.',
      'Watch milk curdle into soft solid chenna and clear greenish whey.',
      'Strain through a fine muslin cloth or sieve, rinse with cold water to remove acidity, and squeeze gently.',
      'Toss chenna with black pepper and chaat masala for a fresh healthy snack, or press under weight for 20 mins to make paneer cubes!'
    ]
  },
  {
    id: 'haldi_masala_doodh',
    title: 'Golden Turmeric Latte (Haldi Masala Doodh)',
    time: '5 mins',
    difficulty: 'Super Easy',
    tag: 'Immunity Booster',
    description: 'Warm spiced Indian milk infused with turmeric, ginger, black pepper, and honey.',
    required: ['milk'],
    optional: ['turmeric', 'ginger', 'honey', 'black pepper', 'cardamom', 'cinnamon'],
    steps: [
      'Pour milk into a saucepan and place over medium flame.',
      'Whisk in 1/2 tsp turmeric powder, a pinch of freshly crushed black pepper, and crushed cardamom.',
      'Bring to a gentle simmer for 3 minutes to activate the curcumin.',
      'Pour into a mug, stir in honey or jaggery, and enjoy this soothing bedtime tonic.'
    ]
  },

  // 4. Paneer combos
  {
    id: 'quick_paneer_bhurji',
    title: 'Quick Paneer Bhurji / Masala',
    time: '15 mins',
    difficulty: 'Easy',
    tag: 'Pantry Rescue',
    description: 'Rescue expiring paneer into a spicy scrambled dry sabzi or curry.',
    required: ['paneer'],
    optional: ['tomato', 'onion', 'green chilli', 'coriander', 'capsicum', 'peas'],
    steps: [
      'Crumble paneer with clean hands into small chunks.',
      'Sauté chopped onions, green chillies, and tomatoes in a pan with 1/2 tsp cumin seeds.',
      'Add turmeric, red chilli powder, and garam masala; cook until masala is aromatic.',
      'Toss crumbled paneer for 3 minutes. Garnish with fresh chopped dhaniya and a squeeze of lemon.'
    ]
  },
  {
    id: 'palak_paneer_express',
    title: 'Express Palak Paneer Sabzi',
    time: '18 mins',
    difficulty: 'Medium',
    tag: 'Iron & Protein Rich',
    description: 'Nutritious green spinach gravy paired with soft paneer cubes.',
    required: ['paneer', 'spinach'],
    optional: ['tomato', 'onion', 'garlic', 'ginger', 'cream'],
    steps: [
      'Blanch washed spinach in boiling water for 2 mins, then blend into a smooth green puree.',
      'In a pan, heat ghee/oil, sauté minced garlic and onions until lightly browned.',
      'Pour in spinach puree, add salt, cumin powder, and garam masala. Simmer 3 minutes.',
      'Slide in soft paneer cubes, cook gently for 2 more minutes, and finish with a spoon of milk or butter.'
    ]
  },

  // 5. Bread / Leftovers
  {
    id: 'spiced_tawa_poha_bread_upma',
    title: 'Spiced Tawa Bread Upma / Poha Snack',
    time: '10 mins',
    difficulty: 'Super Fast',
    tag: 'Quick Snack',
    description: 'Transform day-old bread, pav, or leftover grains into a savory tawa snack.',
    required: ['bread'],
    optional: ['onion', 'tomato', 'mustard seeds', 'curry leaves', 'peanuts', 'lemon'],
    steps: [
      'Tear or cut bread slices into bite-sized cubes.',
      'Heat oil in a pan, temper mustard seeds, curry leaves, and green chillies.',
      'Add sliced onions and tomatoes; cook until soft with turmeric and salt.',
      'Sprinkle 1 tbsp water over bread cubes, toss into the pan, and stir well for 2 minutes.',
      'Squeeze fresh lemon juice over the top and serve hot.'
    ]
  },

  // 6. Potatoes / Aloo
  {
    id: 'crispy_jeera_aloo',
    title: 'Crispy Dhaba Jeera Aloo',
    time: '15 mins',
    difficulty: 'Easy',
    tag: 'Everyday Classic',
    description: 'Golden spiced potato cubes tossed with roasted cumin seeds and amchur.',
    required: ['potato'],
    optional: ['cumin', 'coriander', 'turmeric', 'amchur', 'green chilli'],
    steps: [
      'Dice potatoes into bite-sized pieces (boiled or raw).',
      'Heat mustard oil or ghee, add a generous tablespoon of cumin seeds and let them splutter.',
      'Add slit green chillies, then toss in the diced potatoes.',
      'Season with turmeric, red chilli, amchur (dry mango powder), and salt. Cook until edges are crisp and golden.',
      'Garnish with lots of fresh chopped coriander.'
    ]
  },

  // 7. Curd / Dahi
  {
    id: 'tadka_dahi_toast',
    title: 'Crunchy Tadka Dahi Sandwich',
    time: '10 mins',
    difficulty: 'Super Easy',
    tag: 'Creamy & Crispy',
    description: 'Thick spiced curd mixed with crunchy vegetables, sandwiched and grilled crisp.',
    required: ['curd', 'bread'],
    optional: ['carrot', 'capsicum', 'onion', 'mustard seeds', 'curry leaves', 'butter'],
    steps: [
      'Take 1/2 cup thick curd or hung yogurt. Stir in finely diced onions, carrots, and capsicum.',
      'Temper mustard seeds and curry leaves in 1 tsp oil, pour over the curd mix with salt and pepper.',
      'Spread generously between bread slices.',
      'Toast both sides on a hot tawa with a dab of butter until golden and crunchy.'
    ]
  },
  {
    id: 'comfort_curd_rice',
    title: 'Tempered South Indian Curd Rice',
    time: '10 mins',
    difficulty: 'Super Fast',
    tag: 'Gut Healing',
    description: 'Cooling cooked rice mixed with fresh curd and tempered with mustard and ginger.',
    required: ['curd', 'rice'],
    optional: ['mustard seeds', 'ginger', 'green chilli', 'curry leaves', 'cucumber'],
    steps: [
      'Mash soft cooked rice slightly with a spoon.',
      'Mix in fresh curd, 2 tbsp milk, and salt to taste.',
      'In a small ladle, heat 1 tsp oil with mustard seeds, minced ginger, and curry leaves.',
      'Pour sizzling tadka over the curd rice. Top with grated cucumber or pomegranate arils.'
    ]
  },

  // 8. Dal / Lentils
  {
    id: 'comfort_khichdi',
    title: 'Wholesome Zero-Waste Khichdi Bowl',
    time: '20 mins',
    difficulty: 'Easy',
    tag: 'Comfort In A Bowl',
    description: 'Rice and lentils cooked together with whatever vegetables need using up.',
    required: ['rice', 'dal'],
    optional: ['potato', 'tomato', 'onion', 'peas', 'carrot', 'ghee', 'cumin'],
    steps: [
      'Rinse equal parts rice and dal (moong, toor, or masoor).',
      'Heat 1 tbsp ghee in a pressure cooker or pot. Add cumin seeds, hing, and sliced onions.',
      'Toss in any expiring veggies (potatoes, carrots, tomatoes, green peas).',
      'Add rice, dal, turmeric, salt, and 3.5 cups water. Pressure cook for 3 whistles or simmer 20 mins.',
      'Drizzle a spoonful of hot desi ghee on top and serve with pickle or curd.'
    ]
  },

  // 9. Vegetables Fallback
  {
    id: 'pantry_rescue_kadhai',
    title: 'Pantry Rescue Mix-Veg Kadhai',
    time: '18 mins',
    difficulty: 'Easy',
    tag: 'Zero-Waste Melange',
    description: 'The ultimate zero-waste Indian dish: chop whichever vegetables are expiring and toss together.',
    required: ['vegetable'],
    optional: ['tomato', 'potato', 'onion', 'capsicum', 'cauliflower', 'carrot', 'cabbage', 'beans'],
    steps: [
      'Dice all available veggies into equal sizes.',
      'Temper cumin seeds, ginger-garlic paste and onions in a kadhai with 1 tbsp oil.',
      'Add hard vegetables first (potatoes, carrots), cook covered for 6 minutes.',
      'Add soft veggies (capsicum, tomatoes, peas), season with coriander powder, amchur, and garam masala.',
      'Cook covered on low flame for 6 more minutes until tender and flavorful.'
    ]
  }
];

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function itemMatches(item, keyword) {
  const name = normalize(item.name);
  const cat = normalize(item.category);
  const kw = normalize(keyword);

  if (kw === 'vegetable') {
    return cat === 'vegetable' || ['onion', 'tomato', 'potato', 'capsicum', 'carrot', 'gobi', 'cauliflower', 'cabbage', 'beans', 'peas', 'spinach', 'palak', 'bhindi', 'methi'].some(k => name.includes(k));
  }
  if (kw === 'egg') {
    return name.includes('egg') || name.includes('anda') || cat.includes('egg') || cat.includes('non-veg');
  }
  if (kw === 'milk') {
    return name.includes('milk') || name.includes('doodh') || name.includes('dairy');
  }
  if (kw === 'bread') {
    return name.includes('bread') || name.includes('pav') || name.includes('bun') || name.includes('toast');
  }
  if (kw === 'paneer') {
    return name.includes('paneer') || name.includes('panir') || name.includes('cottage cheese');
  }
  if (kw === 'curd') {
    return name.includes('curd') || name.includes('dahi') || name.includes('yogurt');
  }
  if (kw === 'potato') {
    return name.includes('potato') || name.includes('aloo') || name.includes('alu');
  }
  if (kw === 'rice') {
    return name.includes('rice') || name.includes('chawal') || name.includes('poha');
  }
  if (kw === 'dal') {
    return name.includes('dal') || name.includes('daal') || name.includes('lentil') || name.includes('moong') || name.includes('toor');
  }
  if (kw === 'spinach') {
    return name.includes('spinach') || name.includes('palak') || name.includes('saag') || name.includes('methi');
  }
  if (kw === 'chicken') {
    return name.includes('chicken') || name.includes('murgh') || cat.includes('meat');
  }

  return name.includes(kw) || cat.includes(kw);
}

// Generate matching recipes from inventory
function generateDynamicRecipes(inventoryItems = [], maxResults = 4) {
  if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
    // Return standard staples
    return CULINARY_MATRIX.slice(0, 3).map(r => ({ ...r, usedIngredients: [] }));
  }

  const scored = [];

  for (const recipe of CULINARY_MATRIX) {
    // Check if required ingredients exist
    const hasRequired = recipe.required.every(reqKey => 
      inventoryItems.some(it => itemMatches(it, reqKey))
    );

    if (!hasRequired) continue;

    // Find all matching pantry items
    const allKeywords = [...recipe.required, ...(recipe.optional || [])];
    const matchedPantryItems = inventoryItems.filter(it => 
      allKeywords.some(kw => itemMatches(it, kw))
    );

    // Prioritize recipes that use expiring items
    const expiringUsedCount = matchedPantryItems.filter(i => i.daysLeft !== null && i.daysLeft <= 3).length;
    const score = (matchedPantryItems.length * 2) + (expiringUsedCount * 5);

    scored.push({
      ...recipe,
      usedIngredients: matchedPantryItems,
      score
    });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // If no recipes matched required, provide Mix-Veg or Staples with whatever is there
  if (scored.length === 0) {
    const fallback = CULINARY_MATRIX.find(r => r.id === 'pantry_rescue_kadhai') || CULINARY_MATRIX[0];
    return [{
      ...fallback,
      usedIngredients: inventoryItems.slice(0, 3)
    }];
  }

  return scored.slice(0, maxResults);
}

module.exports = {
  CULINARY_MATRIX,
  itemMatches,
  generateDynamicRecipes
};
