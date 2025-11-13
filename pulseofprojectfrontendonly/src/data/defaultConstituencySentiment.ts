/**
 * Default Sentiment Scores for Tamil Nadu Constituencies
 *
 * PARTY-FOCUSED INTERPRETATION:
 * This represents how well the party (TVK) is doing in each constituency.
 *
 * 🟢 GREEN (70-100): Party is doing WELL
 *   - People are happy with party's work
 *   - Strong party presence and activities
 *   - Positive sentiment towards initiatives
 *   - Good public feedback
 *   - Action: Maintain momentum, expand programs
 *
 * 🟡 YELLOW (50-69): MONITOR Closely
 *   - Mixed public sentiment
 *   - Some concerns but manageable
 *   - Moderate party presence
 *   - Room for improvement
 *   - Action: Address concerns, increase engagement
 *
 * 🔴 RED (0-49): URGENT Action NEEDED
 *   - Critical issues and problems
 *   - Weak party presence
 *   - People are unhappy
 *   - Negative sentiment, protests
 *   - Action: Immediate intervention required
 *
 * These scores can be updated daily via AI analysis of news, social media, and public sentiment.
 */

export interface ConstituencySentiment {
  [constituencyName: string]: number;
}

/**
 * Default sentiment scores with realistic distribution:
 * - 5% very high (75-85)
 * - 15% high (65-75)
 * - 60% moderate (55-70)
 * - 15% low (40-50)
 * - 5% very low (25-35)
 */
export const defaultConstituencySentiment: ConstituencySentiment = {
  // Chennai Region - Mixed sentiment, some areas need work
  "Ponneri (SC)": 58,
  "Gummidipoondi": 52,
  "Tiruvottiyur": 72,
  "Madavaram": 65,
  "Perambur": 73,
  "Kolathur": 68,
  "Villivakkam": 62,
  "Thiru-Vi-Ka-Nagar(SC)": 67,
  "Dr.Radhakrishnan Naga": 74,
  "Harbour": 48, // Critical - port area issues
  "Royapuram": 55,
  "Egmore (SC)": 72,
  "Chepauk-Thiruvalliken": 75,
  "Thousand Lights": 76,
  "Anna Nagar": 77,
  "Virugampakkam": 73,
  "Saidapet": 64,
  "Thiyagarayanagar": 74,
  "Mylapore": 75,
  "Velachery": 76,
  "Sholinganallur": 68,
  "Ambattur": 61,
  "Maduravoyal": 59,

  // Thiruvallur District - Needs attention
  "Thiruvallur": 56,
  "Poonamallee (SC)": 62,
  "Avadi": 58,
  "Tiruttani": 45, // Critical area

  // Kancheepuram & Chengalpattu Region
  "Sriperumbudur (SC)": 69,
  "Pallavaram": 71,
  "Tambaram": 72,
  "Chengalpattu": 67,
  "Tiruporur": 65,
  "Madurantakam (SC)": 63,
  "Uthiramerur": 64,
  "Kancheepuram": 68,
  "Alandur": 73,

  // Vellore Region - Critical areas needing attention
  "Gudiyattam (SC)": 42, // Critical - unemployment
  "Katpadi": 54,
  "Vellore": 66,
  "Anaicut": 48, // Critical - infrastructure
  "Arakkonam (SC)": 58,
  "Sholingur": 44, // Critical
  "Ranipet": 52,
  "Arcot": 49, // Critical threshold
  "Kilvaithinankuppam(SC": 38, // Very critical

  // Tiruvannamalai Region
  "Tiruvannamalai": 65,
  "Kilpennathur": 62,
  "Polur": 61,
  "Arani": 63,
  "Cheyyar": 64,

  // Cuddalore Region
  "Cuddalore": 66,
  "Kurinjipadi": 64,
  "Bhuvanagiri": 63,
  "Chidambaram": 67,
  "Kattumannarkoil (SC)": 62,
  "Tittakudi": 61,
  "Vridhachalam": 65,

  // Villupuram Region
  "Villupuram": 64,
  "Vikravandi": 62,
  "Rishivandiyam": 60,
  "Sankarapuram": 61,
  "Kallakurichi": 63,
  "Gangavalli (SC)": 59,
  "Ulundurpet": 62,
  "Tirukkoyilur": 64,

  // Salem Region - Mixed, some critical
  "Salem (North)": 67,
  "Salem (South)": 68,
  "Salem (West)": 56,
  "Omalur": 48, // Critical
  "Mettur": 52,
  "Edappadi": 60,
  "Sankari": 43, // Critical
  "Attur": 54,
  "Yercaud": 46, // Critical

  // Namakkal Region
  "Namakkal": 65,
  "Rasipuram": 64,
  "Sentamangalam": 63,
  "Paramathi-Velur": 62,
  "Tiruchengode": 66,

  // Erode Region - Textile hub
  "Erode (East)": 68,
  "Erode (West)": 69,
  "Modakurichi": 67,
  "Bhavani (SC)": 65,
  "Anthiyur": 63,
  "Gobichettipalayam": 66,
  "Bhavanisagar": 64,
  "Perundurai": 65,

  // Coimbatore Region - High positivity
  "Coimbatore (North)": 74,
  "Coimbatore (South)": 75,
  "Kavundampalayam": 73,
  "Singanallur": 74,
  "Sulur": 72,
  "Pollachi": 71,
  "Valparai (SC)": 69,
  "Kinathukadavu": 70,
  "Thondamuthur": 71,
  "Mettupalayam": 68,
  "Avanashi (SC)": 67,

  // Tiruppur Region - Textile industry
  "Tiruppur (North)": 70,
  "Tiruppur (South)": 71,
  "Dharapuram (SC)": 67,
  "Kangeyam": 68,
  "Palladam": 69,
  "Udumalpet": 68,

  // Nilgiris Region
  "Gudalur (SC)": 64,
  "Ootacamund": 66,
  "Coonoor": 65,

  // Karur Region
  "Karur": 67,
  "Aravakurichi": 65,
  "Krishnarayapuram": 64,

  // Tiruchirappalli Region
  "Tiruchirappalli (East)": 69,
  "Tiruchirappalli (West)": 70,
  "Srirangam": 68,
  "Thiruverumbur": 67,
  "Manapparai (SC)": 65,
  "Musiri": 64,
  "Lalgudi": 66,

  // Perambalur Region
  "Perambalur": 63,
  "Ariyalur": 62,
  "Jayankondam": 64,

  // Thanjavur Region - Agricultural heartland
  "Thanjavur": 68,
  "Orathanadu": 66,
  "Thiruvaiyaru": 67,
  "Kumbakonam": 69,
  "Papanasam": 65,
  "Thiruvidaimarudur": 66,
  "Pattukottai": 67,
  "Mannargudi": 68,

  // Tiruvarur Region
  "Tiruvarur": 66,
  "Nannilam": 65,
  "Thiruthuraipoondi": 64,

  // Nagapattinam Region - Coastal areas
  "Nagapattinam": 65,
  "Kilvelur (SC)": 63,
  "Vedaranyam": 64,
  "Mayiladuthurai": 66,
  "Sirkazhi (SC)": 64,

  // Pudukkottai Region
  "Pudukkottai": 65,
  "Tirumayam": 63,
  "Alangudi": 64,
  "Aranthangi": 62,
  "Viralimalai": 63,

  // Madurai Region - Cultural capital
  "Madurai (East)": 71,
  "Madurai (West)": 72,
  "Madurai (North)": 70,
  "Madurai (South)": 71,
  "Madurai (Central)": 73,
  "Sholavandan": 68,
  "Melur": 67,
  "Thiruparankundram": 69,
  "Tirumangalam": 68,
  "Usilampatti": 66,

  // Theni Region
  "Theni": 67,
  "Bodinayakanur": 66,
  "Cumbum": 65,
  "Periyakulam": 68,
  "Andipatti": 64,

  // Dindigul Region
  "Dindigul": 68,
  "Athoor": 66,
  "Palani": 67,
  "Oddanchatram": 65,
  "Nilakottai": 64,
  "Natham": 63,

  // Sivaganga Region
  "Sivaganga": 65,
  "Manamadurai": 64,
  "Karaikudi": 66,
  "Tiruppattur": 63, // Note: There's also Tiruppattur district - this is Sivaganga

  // Ramanathapuram Region - Southern coastal
  "Ramanathapuram": 64,
  "Mudhukulathur": 62,
  "Paramakudi (SC)": 61,
  "Rajasingamangalam": 63,

  // Virudhunagar Region
  "Virudhunagar": 67,
  "Sivakasi": 68,
  "Srivilliputtur": 66,
  "Sattur": 65,
  "Aruppukottai": 67,

  // Tuticorin Region - Port city
  "Tuticorin": 68,
  "Tiruchendur": 67,
  "Srivaikuntam": 66,
  "Vilathikulam": 65,
  "Ottapidaram (SC)": 64,
  "Kovilpatti": 66,

  // Tirunelveli Region
  "Tirunelveli": 69,
  "Ambasamudram": 67,
  "Palayamkottai": 68,
  "Sankarankovil": 66,
  "Tenkasi": 67,
  "Alangulam": 65,
  "Radhapuram": 64,
  "Nanguneri": 66,

  // Kanniyakumari Region - Southernmost tip
  "Kanniyakumari": 70,
  "Nagercoil": 71,
  "Colachel": 69,
  "Padmanabhapuram": 68,
  "Vilavancode": 67,
  "Killiyoor": 66,

  // Dharmapuri Region - Critical area, needs urgent action
  "Dharmapuri": 35, // Very critical - multiple issues
  "Palacode": 41,
  "Pennagaram": 44,
  "Harur (SC)": 32, // Very critical

  // Krishnagiri Region - Mixed
  "Krishnagiri": 55,
  "Hosur": 69, // Good - industrial area
  "Uthangarai": 47, // Critical
  "Bargur (SC)": 39, // Critical
  "Veppanahalli": 51,

  // Puducherry constituencies (if included)
  "Yanam": 66,
  "Mahe": 65,
  "Karaikal (North)": 67,
  "Karaikal (South)": 66,
  "Puducherry": 70,
  "Oussudu": 68,
  "Kadirgamam": 67,
  "Embalam": 69,
  "Ariankuppam": 68,
  "Indira Nagar": 71,
  "Kalapet": 70,
  "Muthialpet": 69,
  "Nedungadu": 66,
  "Bahour": 67,
  "Nettapakkam": 65,
  "Mangalam": 68,
  "Villianur": 67,
  "Ozhukarai": 69,
  "Thattanchavady": 70,
  "Raj Bhavan": 71,

  // Additional constituencies
  "Gingee (SC)": 62,
  "Vanur": 63,
  "Tindivanam": 65,
  "Vandavasi (SC)": 64,
  "Tiruchirappalli": 69, // May appear as duplicate in different contexts
};

/**
 * Get sentiment score for a constituency
 * Falls back to 65 (moderate positive) if constituency not found
 */
export function getConstituencySentiment(constituencyName: string): number {
  return defaultConstituencySentiment[constituencyName] || 65;
}

/**
 * Get color for sentiment score - VIBRANT VERSION (with darker greens)
 */
export function getSentimentColor(score: number): string {
  if (score >= 80) return '#2E7D32'; // Darker green (forest green)
  if (score >= 70) return '#388E3C'; // Medium-dark green
  if (score >= 60) return '#66BB6A'; // Balanced green
  if (score >= 50) return '#FDD835'; // Bright yellow
  if (score >= 40) return '#FF6D00'; // Vibrant orange
  if (score >= 30) return '#FF3D00'; // Bright red-orange
  if (score >= 20) return '#DD2C00'; // Bright red
  return '#B71C1C'; // Deep red
}
