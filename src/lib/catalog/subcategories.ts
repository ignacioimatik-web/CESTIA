type Rule = { keywords: string[]; group: string }

const rules: Record<string, Rule[]> = {
  'Lácteos y huevos': [
    { keywords: ['preparado lácteo', 'preparado de coco'], group: 'Preparados infantiles' },
    { keywords: ['yogur', 'yogourt', 'petit'], group: 'Yogures y postres' },
    { keywords: ['queso'], group: 'Quesos' },
    { keywords: ['leche condensada', 'leche evaporada'], group: 'Leches concentradas' },
    { keywords: ['leche'], group: 'Leches' },
    { keywords: ['bebida láctea', 'bebida de', 'batido'], group: 'Bebidas lácteas y vegetales' },
    { keywords: ['mantequilla'], group: 'Mantequillas' },
    { keywords: ['margarina'], group: 'Margarinas' },
    { keywords: ['nata', 'crema de leche', 'crema de soja'], group: 'Natas y cremas' },
    { keywords: ['bechamel'], group: 'Salsas y preparados' },
    { keywords: ['huevo'], group: 'Huevos' },
  ],
  Panadería: [
    { keywords: ['masa de hojaldre', 'masa filo', 'masa quebrada', 'masa brick'], group: 'Masas y hojaldres' },
    { keywords: ['croissant', 'berlina', 'ensaimada', 'napolitana', 'caracola', 'trenza', 'pepito', 'rosquilla', 'donut'], group: 'Bollería' },
    { keywords: ['magdalena'], group: 'Magdalenas' },
    { keywords: ['bizcocho'], group: 'Bizcochos' },
    { keywords: ['pan de', 'pan integral', 'pan molde', 'pan rallado', 'pan tostado', 'barra', 'baguette'], group: 'Panes' },
    { keywords: ['empanadilla', 'empanada'], group: 'Salados' },
    { keywords: ['galleta', 'cookie'], group: 'Galletas' },
    { keywords: ['pastel', 'tarta'], group: 'Pasteles y tartas' },
  ],
  Pescado: [
    { keywords: ['gamba', 'langostino', 'gambón', 'camarón'], group: 'Gambas y langostinos' },
    { keywords: ['almeja', 'mejillón', 'berberecho', 'navaja', 'chirla', 'clóchina', 'vieira', 'ostras'], group: 'Mariscos' },
    { keywords: ['cigala', 'bogavante', 'buey de mar', 'centollo', 'nécora'], group: 'Cigalas y bogavantes' },
    { keywords: ['calamar', 'sepia', 'pulpo', 'chipirón'], group: 'Cefalópodos' },
    { keywords: ['filete', 'rodaja', 'lomo'], group: 'Filetes y lomos' },
    { keywords: ['merluza', 'bacalao', 'salmón', 'rape', 'panga', 'emperador', 'tintorera', 'gallineta'], group: 'Pescados' },
    { keywords: ['pescadilla', 'fritura', 'palitos', 'surimi'], group: 'Preparados de pescado' },
    { keywords: ['preparado de paella', 'sopa de pescado'], group: 'Preparados' },
  ],
  Limpieza: [
    { keywords: ['detergente'], group: 'Detergentes' },
    { keywords: ['suavizante'], group: 'Suavizantes' },
    { keywords: ['jabón', 'jabon'], group: 'Jabones' },
    { keywords: ['limpia', 'limpiador', 'limpiacristales', 'limpiasuelos'], group: 'Limpiadores' },
    { keywords: ['quitamanchas', 'disuelve manchas'], group: 'Quitamanchas' },
    { keywords: ['blanqueante', 'percarbonato'], group: 'Blanqueantes' },
    { keywords: ['desinfectante'], group: 'Desinfectantes' },
    { keywords: ['lavavajillas', 'lavaloza'], group: 'Lavavajillas' },
    { keywords: ['ambientador', 'perfumador'], group: 'Ambientadores' },
    { keywords: ['estropajo', 'esponja', 'bayeta', 'paño'], group: 'Accesorios' },
    { keywords: ['bolsa', 'film', 'papel', 'aluminio'], group: 'Plásticos y papel' },
  ],
  Mascotas: [
    { keywords: ['perro', 'compy'], group: 'Perros' },
    { keywords: ['gato', 'delikuit', 'quartett'], group: 'Gatos' },
    { keywords: ['hueso', 'snack', 'barrita', 'premio'], group: 'Snacks y premios' },
    { keywords: ['paté', 'bocadito', 'mousse', 'gelatina', 'trozo'], group: 'Patés y húmedos' },
    { keywords: ['comida', 'alimento completo'], group: 'Alimento seco' },
    { keywords: ['arena'], group: 'Arenas' },
    { keywords: ['malta'], group: 'Cuidado e higiene' },
  ],
  Charcutería: [
    { keywords: ['queso'], group: 'Quesos' },
    { keywords: ['jamón', 'jamon'], group: 'Jamones' },
    { keywords: ['chorizo', 'salchichón', 'lomo', 'fuet'], group: 'Embutidos' },
    { keywords: ['pavo', 'pechuga cocida', 'fiambre'], group: 'Fiambres' },
  ],
  'Aceite, especias y salsas': [
    { keywords: ['aceite'], group: 'Aceites' },
    { keywords: ['vinagre'], group: 'Vinagres' },
    { keywords: ['sal', 'pimienta', 'orégano', 'perejil', 'pimentón', 'ajo granulado', 'jengibre', 'cebolla frita', 'colorante', 'canela', 'nuez moscada', 'cúrcuma', 'comino', 'tomillo', 'laurel', 'albahaca'], group: 'Sales y especias' },
    { keywords: ['ketchup', 'mostaza', 'allioli', 'mayonesa', 'salsa'], group: 'Salsas' },
  ],
  'Pasta, arroz y legumbres': [
    { keywords: ['arroz'], group: 'Arroces' },
    { keywords: ['lenteja', 'garbanzo', 'judía', 'alubia', 'haba'], group: 'Legumbres' },
    { keywords: ['fideo', 'fideuá', 'tallarín', 'noodles', 'espagueti', 'macarrón', 'lacitos'], group: 'Pastas secas' },
    { keywords: ['pasta fresca', 'tortellini', 'gnocchi', 'ravioli', 'lasaña'], group: 'Pastas frescas' },
  ],
  Bebé: [
    { keywords: ['papilla', 'potito', 'tarro'], group: 'Alimentación infantil' },
    { keywords: ['pañal'], group: 'Pañales' },
    { keywords: ['toallita'], group: 'Higiene infantil' },
    { keywords: ['biberón', 'chupete', 'tetina'], group: 'Accesorios' },
    { keywords: ['loción', 'pomada', 'colonia', 'solución fisiológica', 'gel', 'champú'], group: 'Cuidado e higiene' },
  ],
  'Fruta y verdura': [
    { keywords: ['tomate', 'cebolla', 'ajo ', 'pimiento', 'calabacín', 'berenjena', 'lechuga', 'espinaca', 'brócoli', 'coliflor', 'zanahoria', 'patata', 'boniato', 'judía verde'], group: 'Verduras y hortalizas' },
    { keywords: ['manzana', 'pera', 'plátano', 'naranja', 'mandarina', 'limón', 'fresa', 'uva', 'sandía', 'melón', 'kiwi', 'piña', 'mango'], group: 'Frutas' },
  ],
  Carne: [
    { keywords: ['pollo', 'pechuga', 'muslo', 'ala'], group: 'Pollo' },
    { keywords: ['ternera', 'vacuno', 'buey'], group: 'Ternera' },
    { keywords: ['cerdo', 'lomo', 'costilla', 'secreto', 'presa'], group: 'Cerdo' },
    { keywords: ['cordero', 'cabrito'], group: 'Cordero' },
    { keywords: ['pavo', 'pierna'], group: 'Pavo' },
    { keywords: ['picada', 'picadillo', 'carne picada'], group: 'Carne picada' },
  ],
  Congelados: [
    { keywords: ['helado', 'polos'], group: 'Helados' },
    { keywords: ['verdura', 'espinaca', 'brócoli', 'coliflor'], group: 'Verduras congeladas' },
    { keywords: ['pizza'], group: 'Pizzas' },
    { keywords: ['patata', 'croqueta', 'san jacobo'], group: 'Precocinados' },
    { keywords: ['pescado', 'merluza', 'bacalao', 'salmón'], group: 'Pescado congelado' },
    { keywords: ['marisco', 'gamba', 'langostino'], group: 'Marisco congelado' },
  ],
  Conservas: [
    { keywords: ['atún', 'bonito', 'caballa', 'sardina', 'anchoa'], group: 'Pescado en conserva' },
    { keywords: ['aceituna', 'piparra', 'guindilla', 'banderilla'], group: 'Aceitunas y encurtidos' },
    { keywords: ['tomate frito', 'tomate triturado', 'tomate natural'], group: 'Tomates en conserva' },
    { keywords: ['legumbre', 'lenteja', 'garbanzo', 'judía'], group: 'Legumbres en conserva' },
    { keywords: ['paté', 'foie'], group: 'Patés' },
  ],
  'Desayuno y dulces': [
    { keywords: ['café', 'cafe'], group: 'Cafés e infusiones' },
    { keywords: ['colacao', 'nesquik', 'cacao'], group: 'Cacao y solubles' },
    { keywords: ['galleta', 'cookie'], group: 'Galletas' },
    { keywords: ['cereal', 'muesli', 'granola'], group: 'Cereales' },
    { keywords: ['mermelada', 'confitura', 'miel'], group: 'Mermeladas y miel' },
    { keywords: ['chocolate'], group: 'Chocolates' },
    { keywords: ['caramelo', 'chuche', 'gominola'], group: 'Dulces y golosinas' },
  ],
  Bebidas: [
    { keywords: ['agua'], group: 'Aguas' },
    { keywords: ['refresco', 'cola', 'fanta', 'sprite', 'tónica', 'limonada', 'naranjada'], group: 'Refrescos' },
    { keywords: ['zumo', 'sumo'], group: 'Zumos' },
    { keywords: ['vino', 'tinto', 'blanco', 'rosado', 'cava'], group: 'Vinos' },
    { keywords: ['cerveza'], group: 'Cervezas' },
    { keywords: ['licor', 'whisky', 'ron', 'ginebra', 'vodka'], group: 'Licores' },
    { keywords: ['isotónica', 'energética', 'energy'], group: 'Bebidas deportivas' },
  ],
  'Higiene y perfumería': [
    { keywords: ['champú', 'champu'], group: 'Champús' },
    { keywords: ['gel'], group: 'Geles' },
    { keywords: ['crema'], group: 'Cremas' },
    { keywords: ['desodorante'], group: 'Desodorantes' },
    { keywords: ['colonia', 'perfume'], group: 'Perfumes' },
    { keywords: ['cepillo', 'pasta', 'dentífrico', 'hilo dental'], group: 'Higiene bucal' },
    { keywords: ['maquinilla', 'cuchilla', 'afeitar'], group: 'Afeitado' },
    { keywords: ['protector solar', 'after sun'], group: 'Protección solar' },
  ],
  Otros: [
    { keywords: ['agua'], group: 'Aguas' },
    { keywords: ['refresco', 'cola', 'fanta', 'sprite', 'tónica', 'limonada', 'gaseosa'], group: 'Refrescos' },
    { keywords: ['bebida isotónica', 'bebida energética', 'energy drink'], group: 'Bebidas' },
    { keywords: ['aceituna', 'piparra'], group: 'Aceitunas y encurtidos' },
    { keywords: ['tomate', 'cebolla', 'ajo ', 'pimiento', 'lechuga', 'patata'], group: 'Frutas y verduras' },
    { keywords: ['pollo', 'pechuga', 'muslo', 'ternera', 'cerdo'], group: 'Carnes' },
    { keywords: ['huevo', 'leche', 'queso', 'yogur'], group: 'Lácteos y huevos' },
    { keywords: ['pan', 'barra', 'baguette', 'molde'], group: 'Panes' },
    { keywords: ['arroz', 'pasta', 'fideo', 'lenteja', 'garbanzo'], group: 'Arroces y legumbres' },
    { keywords: ['aceite'], group: 'Aceites' },
  ],
}

export function inferSubcategory(section: string, productName: string): string {
  const name = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const rule of rules[section] ?? []) {
    for (const kw of rule.keywords) {
      if (name.startsWith(kw) || name.includes(' ' + kw) || name.includes(kw + ' ')) {
        return rule.group
      }
    }
  }

  return 'Otros'
}
