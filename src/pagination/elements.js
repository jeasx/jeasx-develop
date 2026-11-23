/** The 118 chemical elements, ordered by atomic number. */
export default (
  "H Hydrogen,He Helium,Li Lithium,Be Beryllium,B Boron,C Carbon,N Nitrogen,O Oxygen," +
  "F Fluorine,Ne Neon,Na Sodium,Mg Magnesium,Al Aluminium,Si Silicon,P Phosphorus,S Sulfur," +
  "Cl Chlorine,Ar Argon,K Potassium,Ca Calcium,Sc Scandium,Ti Titanium,V Vanadium,Cr Chromium," +
  "Mn Manganese,Fe Iron,Co Cobalt,Ni Nickel,Cu Copper,Zn Zinc,Ga Gallium,Ge Germanium," +
  "As Arsenic,Se Selenium,Br Bromine,Kr Krypton,Rb Rubidium,Sr Strontium,Y Yttrium," +
  "Zr Zirconium,Nb Niobium,Mo Molybdenum,Tc Technetium,Ru Ruthenium,Rh Rhodium,Pd Palladium," +
  "Ag Silver,Cd Cadmium,In Indium,Sn Tin,Sb Antimony,Te Tellurium,I Iodine,Xe Xenon," +
  "Cs Caesium,Ba Barium,La Lanthanum,Ce Cerium,Pr Praseodymium,Nd Neodymium,Pm Promethium," +
  "Sm Samarium,Eu Europium,Gd Gadolinium,Tb Terbium,Dy Dysprosium,Ho Holmium,Er Erbium," +
  "Tm Thulium,Yb Ytterbium,Lu Lutetium,Hf Hafnium,Ta Tantalum,W Tungsten,Re Rhenium," +
  "Os Osmium,Ir Iridium,Pt Platinum,Au Gold,Hg Mercury,Tl Thallium,Pb Lead,Bi Bismuth," +
  "Po Polonium,At Astatine,Rn Radon,Fr Francium,Ra Radium,Ac Actinium,Th Thorium," +
  "Pa Protactinium,U Uranium,Np Neptunium,Pu Plutonium,Am Americium,Cm Curium,Bk Berkelium," +
  "Cf Californium,Es Einsteinium,Fm Fermium,Md Mendelevium,No Nobelium,Lr Lawrencium," +
  "Rf Rutherfordium,Db Dubnium,Sg Seaborgium,Bh Bohrium,Hs Hassium,Mt Meitnerium," +
  "Ds Darmstadtium,Rg Roentgenium,Cn Copernicium,Nh Nihonium,Fl Flerovium,Mc Moscovium," +
  "Lv Livermorium,Ts Tennessine,Og Oganesson"
)
  .split(",")
  .map((entry, index) => {
    const [symbol, name] = entry.split(" ");
    return { number: index + 1, symbol, name };
  });

const GROUPS = {
  "Alkali metal": [3, 11, 19, 37, 55, 87],
  "Alkaline earth": [4, 12, 20, 38, 56, 88],
  Nonmetal: [1, 6, 7, 8, 15, 16, 34],
  Halogen: [9, 17, 35, 53, 85, 117],
  "Noble gas": [2, 10, 18, 36, 54, 86, 118],
  Metalloid: [5, 14, 32, 33, 51, 52],
  "Post-transition": [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116],
};

/** Families in display order, used for the colors and the legend. */
export const FAMILIES = [
  ...Object.keys(GROUPS).slice(0, 2),
  "Transition metal",
  "Lanthanide",
  "Actinide",
  ...Object.keys(GROUPS).slice(2),
];

/**
 * The family of an element, e.g. "Noble gas".
 *
 * @param {number} number Atomic number
 */
export function family(number) {
  for (const [name, numbers] of Object.entries(GROUPS)) {
    if (numbers.includes(number)) return name;
  }
  if (number >= 57 && number <= 71) return "Lanthanide";
  if (number >= 89 && number <= 103) return "Actinide";
  return "Transition metal";
}
