// Fallback intelligent reasoning engine for AnnSetu AI Chef
// Answers conversational queries even when offline or when external AI calls timeout.

function generateChefReply(message = '', items = [], expiringItems = []) {
  const query = message.toLowerCase().trim();
  const itemNames = items.map(i => i.name || '').filter(Boolean);
  const expiringNames = expiringItems.map(i => i.name || '').filter(Boolean);

  // 1. Asking what to cook / meal ideas
  if (
    query.includes('cook') || 
    query.includes('kya banau') || 
    query.includes('kya banaye') || 
    query.includes('recipe') || 
    query.includes('khana') || 
    query.includes('dinner') || 
    query.includes('lunch') || 
    query.includes('breakfast') ||
    query.includes('suggestion')
  ) {
    if (expiringNames.length > 0) {
      return `Namaste! 👩‍🍳 I see your **${expiringNames.join(', ')}** need attention soon to avoid waste!\n\nHere are 2 instant meal ideas for your kitchen:\n\n1. **Quick Zero-Waste Tawa Special**:\n   - Sauté onions, chillies and toss your ${expiringNames[0]} with a pinch of turmeric, garam masala, and salt.\n   - Cook for 6-8 minutes on medium flame. Ready in 10 minutes!\n\n2. **Comfort Skillet Meal**:\n   - Pair ${itemNames.slice(0, 3).join(', ')} into a warm spiced dry sabzi or savory scramble.\n\nWould you like the full step-by-step recipe for any of these?`;
    }

    if (itemNames.length > 0) {
      return `Namaste! 👩‍🍳 You have **${itemNames.join(', ')}** fresh in your pantry.\n\nHere are delicious options you can cook right now:\n\n1. **Golden Masala Scramble / Toss** (10 mins) — Light, flavorful, and pairs great with roti or bread.\n2. **Homestyle Tawa Fry** (15 mins) — Comforting and nutritious using your available items.\n\nTell me which ingredient you want to highlight today!`;
    }

    return `Namaste! 👩‍🍳 Your pantry looks empty right now. Add some fresh groceries like Eggs, Milk, Tomatoes, or Bread, and I'll suggest customized zero-waste recipes instantly!`;
  }

  // 2. Questions about Milk
  if (query.includes('milk') || query.includes('doodh')) {
    return `🥛 **AnnSetu Milk Care & Cooking Tip:**\n\n- **Expiring soon?** Turn it into **Fresh Chenna/Paneer** in 5 minutes! Bring milk to a boil, turn off heat, and stir in 1 tbsp lemon juice or curd. Strain and enjoy soft fresh paneer!\n- **Storage:** Always keep milk packets in the deepest, coldest part of the main fridge shelf (not in the door shelf, which fluctuates when opened).\n- **Sweet Cravings:** Simmer with a little rice or vermicelli for quick comforting Kheer.`;
  }

  // 3. Questions about Eggs
  if (query.includes('egg') || query.includes('anda') || query.includes('ande')) {
    return `🥚 **AnnSetu Egg Master Tip:**\n\n- **Quick Dishes:** Mumbai-style Spicy Anda Bhurji (10 mins), Classic Masala Omelette, or Desi French Toast if you have milk & bread.\n- **Freshness Test (Water Float Test):** Place egg in a glass of water. If it sinks to the bottom horizontally, it's very fresh. If it stands tilted, use it soon. If it floats to the top, discard it!\n- **Storage:** Keep eggs in their carton on a middle fridge shelf to maintain steady temperature.`;
  }

  // 4. Questions about Storage / Keeping fresh
  if (query.includes('store') || query.includes('fresh') || query.includes('storage') || query.includes('kharab') || query.includes('rakhe')) {
    return `🧊 **AnnSetu Zero-Waste Storage Hacks:**\n\n- **Tomatoes & Bananas:** Keep at room temperature. Cold air damages tomato cell walls making them mealy.\n- **Green Herbs (Dhaniya / Mint):** Snip ends, wrap loosely in dry paper towels, and store inside an airtight container or ziplock bag.\n- **Bread:** Never refrigerate bread—it stales faster! Keep at room temp for 3-4 days or freeze sliced bread for up to 3 months.\n- **Potatoes & Onions:** Store in cool, dark, ventilated baskets—never together, as onions release ethylene gas that sprouts potatoes.`;
  }

  // 5. Substitutions
  if (query.includes('substitute') || query.includes('vikalp') || query.includes('instead') || query.includes('badle')) {
    return `🔄 **Smart Indian Kitchen Substitutions:**\n\n- **Heavy Cream:** Use whisked full-fat milk with a spoon of butter or fresh malai.\n- **Buttermilk (Chaas):** Mix 2 tbsp curd with 1/2 cup water and a pinch of salt.\n- **Tomato in Curry:** Use 2 tbsp fresh whisked curd or 1 tsp amchur (dry mango powder) for tanginess.\n- **Eggs in Baking/Pancakes:** Use 1/4 cup whisked curd or 1/2 mashed ripe banana per egg.`;
  }

  // 6. Default greeting & contextual help
  const fridgeSummary = itemNames.length > 0 
    ? `I'm actively tracking your pantry with **${itemNames.length} items** (${expiringNames.length > 0 ? `${expiringNames.length} expiring soon: ${expiringNames.join(', ')}` : 'all fresh'}).`
    : `Your pantry is ready for new items!`;

  return `Hello! I'm your **AnnSetu AI Chef** 👩‍🍳.\n\n${fridgeSummary}\n\nYou can ask me:\n- *"What can I cook with my expiring items?"*\n- *"Quick 10-minute dinner recipe"*\n- *"How to store milk or bread to last longer?"*\n- *"Can I substitute curd for cream?"*\n\nHow can I help you in your kitchen today?`;
}

module.exports = {
  generateChefReply
};
